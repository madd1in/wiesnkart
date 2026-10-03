// Wiesn Kart R88: Glockenspiel fuer die letzte Runde - selbst synthetisiertes Carillon (NES-artige Klangerzeuger
// wie art/r44/r65), eigene kleine Melodie. Jeder Schlag: Glockenton (Rechteck) + metallischer Teilton (2,756f,
// wie bei realen Glocken inharmonic) + Oktave tiefer als Koerper + kurzer Anschlag-Nadel. Kein Sample, keine Anbieter-Kosten.
// Aufruf: node art/r88/make_glock.mjs  ->  assets/audio/sfx/chip/glock.wav (22,05 kHz, 16 bit, mono)
import {writeFileSync, mkdirSync} from 'node:fs';
const SR = 22050, OUT = new URL('../../assets/audio/sfx/chip/', import.meta.url);
mkdirSync(OUT, {recursive: true});
const N = n => 440 * Math.pow(2, (n - 69) / 12);            // MIDI-Note -> Hz

function render(dur, voices) {
  const n = Math.round(dur * SR), buf = new Float32Array(n);
  for (const v of voices) {
    let ph = 0, lfsr = 1, noiseVal = 1, noiseAcc = 0;
    const t0 = v.at || 0, len = v.len ?? dur - t0;
    for (let i = Math.round(t0 * SR); i < Math.min(n, Math.round((t0 + len) * SR)); i++) {
      const t = i / SR - t0, u = t / len;
      let f = v.f0;
      if (v.f1) f = v.f0 * Math.pow(v.f1 / v.f0, Math.min(1, t / (v.slide ?? len)));
      const a = v.attack ?? .003, env = t < a ? t / a : Math.pow(Math.max(0, 1 - u / (1 - (v.hold ?? 0))), v.decay ?? 2.2);
      const stepEnv = Math.round(Math.min(1, env) * 15) / 15;
      let s;
      if (v.type === 'noise') {
        noiseAcc += f / SR;
        while (noiseAcc >= 1) { noiseAcc -= 1; const bit = ((lfsr ^ (lfsr >> 1)) & 1); lfsr = (lfsr >> 1) | (bit << 14); noiseVal = (lfsr & 1) ? 1 : -1; }
        s = noiseVal;
      } else {
        ph = (ph + f / SR) % 1;
        if (v.type === 'tri') s = Math.round((ph < .5 ? ph * 4 - 1 : 3 - ph * 4) * 7.5) / 7.5;
        else s = ph < (v.duty ?? .5) ? 1 : -1;
      }
      buf[i] += s * stepEnv * (v.vol ?? .3);
    }
  }
  const fade = Math.min(n, Math.round(.012 * SR));
  for (let i = 0; i < fade; i++) buf[n - 1 - i] *= i / fade;
  for (let i = 0; i < n; i++) buf[i] = Math.max(-1, Math.min(1, buf[i]));
  return buf;
}
function wav(name, buf) {
  const b = Buffer.alloc(44 + buf.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + buf.length * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(buf.length * 2, 40);
  for (let i = 0; i < buf.length; i++) b.writeInt16LE(Math.round(buf[i] * 32000), 44 + i * 2);
  writeFileSync(new URL(name + '.wav', OUT), b);
  let sum = 0, peak = 0;
  for (let i = 0; i < buf.length; i++) { sum += buf[i] * buf[i]; peak = Math.max(peak, Math.abs(buf[i])); }
  return {name, ms: Math.round(buf.length / SR * 1000), kb: +(b.length / 1024).toFixed(1), rms: +Math.sqrt(sum / buf.length).toFixed(3), peak: +peak.toFixed(2)};
}

// Eigene Carillon-Zeile fuer die letzte Runde: Auftakt-Dreiklang hoch, Antwort fallend, Schlusssteigerung
// auf die hohe None - nach bayerischer Art gemaessigt geschwungen, in rund 2,6 Sekunden geschlagen.
const MEL = [[0, 84], [.24, 88], [.48, 91], [.96, 93], [1.20, 91], [1.44, 88], [1.92, 89], [2.16, 91], [2.64, 96]];
const voices = [];
for (const [t, m] of MEL) {
  const last = t > 2.5, ring = last ? 1.7 : 1.15;
  voices.push({type: 'sq', duty: .22, f0: N(m), at: t, len: ring, decay: last ? 1.6 : 2.2, vol: last ? .34 : .28});
  voices.push({type: 'sq', duty: .125, f0: N(m) * 2.756, at: t, len: Math.min(.5, ring), decay: 3.4, vol: .1});
  voices.push({type: 'tri', f0: N(m - 12), at: t, len: ring * .95, decay: 2, vol: .17});
  voices.push({type: 'noise', f0: 6400, at: t, len: .02, decay: 1, vol: .05});
}
const report = [wav('glock', render(4.5, voices))];
console.table(report);
