"""Vergleicht Musik-Mixe objektiv: Lautheit, Spitzenfaktor, Klangschwerpunkt, Tiefenanteil, Pulsstaerke auf den Taktschlaegen,
Anschlagsdichte und Stereobreite. Aufruf (Blender-Python hat numpy):
  python analyze.py <name=datei> [<name=datei> ...]
Keine Netzwerk-Aufrufe; ffmpeg liegt unter .scratch/audio-tools (imageio-ffmpeg)."""
from pathlib import Path
import sys, subprocess
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
FF = str(next((ROOT / '.scratch/audio-tools/imageio_ffmpeg/binaries').glob('ffmpeg-*.exe')))
SR = 22050


def decode(path):
    raw = subprocess.run([FF, '-hide_banner', '-loglevel', 'error', '-i', str(path), '-f', 'f32le', '-acodec', 'pcm_f32le', '-ar', str(SR), '-ac', '2', 'pipe:1'],
                         check=True, stdout=subprocess.PIPE).stdout
    return np.frombuffer(raw, dtype='<f4').reshape(-1, 2)


def analyze(path, bpm=None):
    x = decode(path)[: SR * 60]
    mono = x.mean(axis=1)
    rms = float(np.sqrt(np.mean(mono ** 2)))
    peak = float(np.max(np.abs(x)))
    spec = np.abs(np.fft.rfft(mono * np.hanning(len(mono)))) ** 2
    freqs = np.fft.rfftfreq(len(mono), 1 / SR)
    centroid = float((freqs * spec).sum() / spec.sum())
    low = float(spec[(freqs >= 30) & (freqs <= 150)].sum() / spec.sum())
    # Huellkurve und Anschlaege (Spektralfluss ueber 10-ms-Fenster)
    hop = SR // 100
    frames = [np.abs(np.fft.rfft(mono[i:i + 512] * np.hanning(512))) for i in range(0, len(mono) - 512, hop)]
    F = np.array(frames)
    flux = np.maximum(0, np.diff(F, axis=0)).sum(axis=1)
    thr = flux.mean() + 1.2 * flux.std()
    onsets = int(((flux[1:-1] > thr) & (flux[1:-1] > flux[:-2]) & (flux[1:-1] >= flux[2:])).sum())
    dens = onsets / (len(flux) / 100)
    # Pulsstaerke: Tiefenhuellkurve gegen ihr Mittel, Autokorrelation bei der Viertelnote
    lowband = F[:, 1:8].sum(axis=1)
    lb = lowband - lowband.mean()
    pulse = None
    if bpm:
        lag = int(round(60 / bpm * 100))
        ac = np.correlate(lb, lb, 'full')[len(lb) - 1:]
        pulse = float(ac[lag] / ac[0]) if lag < len(ac) else None
    side = (x[:, 0] - x[:, 1]) / 2
    width = float(np.sqrt(np.mean(side ** 2)) / (rms + 1e-9))
    return dict(rms_db=20 * np.log10(rms + 1e-9), crest_db=20 * np.log10(peak / (rms + 1e-9)), centroid=centroid, low=low, onsets=dens, pulse=pulse, width=width)


if __name__ == '__main__':
    print('%-22s %7s %7s %8s %6s %7s %7s %6s' % ('name', 'rmsdB', 'crest', 'centroid', 'low%', 'onsets/s', 'pulse', 'width'))
    for arg in sys.argv[1:]:
        name, _, rest = arg.partition('=')
        file, _, bpm = rest.partition('@')
        r = analyze(file, float(bpm) if bpm else None)
        print('%-22s %7.1f %7.1f %8.0f %6.1f %7.1f %7s %6.2f' % (name, r['rms_db'], r['crest_db'], r['centroid'], r['low'] * 100, r['onsets'],
                                                               '%.2f' % r['pulse'] if r['pulse'] is not None else '-', r['width']))
