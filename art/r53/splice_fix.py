"""R53 Update-Video: die nachaufgenommenen Szenen (art/r53/capture_fix.mjs, .scratch/r53-frames-fix) ersetzen die
letzten beiden Szenen der Hauptaufnahme (.scratch/r53-frames) - Bilder, Ereignisse und Schnittliste.
Aufruf: python art/r53/splice_fix.py"""
import json, pathlib, shutil

ROOT = pathlib.Path(__file__).resolve().parents[2]
MAIN, FIX = ROOT / '.scratch' / 'r53-frames', ROOT / '.scratch' / 'r53-frames-fix'
m = json.loads((MAIN / 'events.json').read_text(encoding='utf-8'))
f = json.loads((FIX / 'events.json').read_text(encoding='utf-8'))
fps = m['fps']
start = next(c['frame'] for c in m['cuts'] if c['title'] == f['cuts'][0]['title'])
assert start + f['frames'] == m['frames'], (start, f['frames'], m['frames'])
for i in range(f['frames']):
    shutil.copyfile(FIX / f'f{i:05d}.jpg', MAIN / f'f{start + i:05d}.jpg')
m['events'] = [e for e in m['events'] if e['i'] < start] + [{**e, 'i': e['i'] + start, 't': round(e['t'] + start / fps, 3)} for e in f['events']]
m['cuts'] = [c for c in m['cuts'] if c['frame'] < start] + [{**c, 'frame': c['frame'] + start} for c in f['cuts']]
(MAIN / 'events.json').write_text(json.dumps(m, indent=2, ensure_ascii=False), encoding='utf-8')
print('spliced', f['frames'], 'frames at', start, '-', len(m['events']), 'events')
