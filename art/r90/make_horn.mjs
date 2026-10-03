// Wiesn Kart R90: Hupen - klangliche Gruesse im Rennen statt Smileys (Nutzerwunsch: Bild frei halten).
// Drei eigene Klaenge im NES-artigen Synthesizer (gleiche Klangerzeuger wie art/r44/r65/r88):
//   horn0 Partyhupe (Luftruetscher mit Flatterzunge), horn1 Rummel-Hupe (zweitoenige Trompete),
//   horn2 Fahrrad-Klingel (zwei helle Dings). Kein Sample, keine Anbieter-Kosten.
// Aufruf: node art/r90/make_horn.mjs  ->  assets/audio/sfx/chip/horn0..2.wav (22,05 kHz, 16 bit, mono)
import {writeFileSync, mkdirSync} from 'node:fs';
const SR = 22050, OUT = new URL('../../assets/audio/sfx/chip/', import.meta.url);
mkdirSync(OUT, {recursive: true});
const N = n => 440 * Math.pow(2, (n - 69) / 12);

function render(dur, voices) {
  const n = Math.round(dur * SR), buf = new Float32Array(n);
  for (const v of voices) {
    let ph = 0, lfsr = 1, noiseVal = 1, noiseAcc = 0;
    const t0 = v.at || 0, len = v.len ?? dur - t0;
    for (let i = Math.round(t0 * SR); i < Math.min(n, Math.round((t0 + len) * SR)); i++) {
      const t = i / SR - t0, u = t / len;
      let f = v.f0;
      if (v.steps) { for (const [ts, hz] of v.steps) if (t >= ts) f = hz; }
      else if (v.f1) f = v.f0 * Math.pow(v.f1 / v.f0, Math.min(1, t / (v.slide ?? len)));
      if (v.vib) f *= 1 + v.vib[1] * Math.sin(2 * Math.PI * v.vib[0] * t);
      if (v.flut) f *= 1 + v.flut * Math.sign(Math.sin(2 * Math.PI * v.flutHz * t));   // Flatterzunge
      const a = v.attack ?? .006, env = t < a ? t / a : Math.pow(Math.max(0, 1 - u / (1 - (v.hold ?? 0))), v.decay ?? 1.6);
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
const report = [];

// 0) Partyhupe: aufblasbarer Ruetscher - Rechteck steigt leicht, Flatterzunge moduliert, Rauschschleier
report.push(wav('horn0', render(.55, [
  {type: 'sq', duty: .5, f0: 340, f1: 415, slide: .4, vib: [26, .34], vol: .26, hold: .3, decay: 1.2, attack: .02},
  {type: 'sq', duty: .25, f0: 680, f1: 830, slide: .4, vib: [26, .3], vol: .09, decay: 1.6},
  {type: 'noise', f0: 2400, vol: .05, decay: 1.5, attack: .02},
])));

// 1) Rummel-Hupe: zweitoenige Trompete A4 -> Cis5 ("ta-TAAA"), leichtes Vibrato, Oberton dicker
report.push(wav('horn1', render(.7, [
  {type: 'sq', duty: .5, steps: [[0, N(69)], [.2, N(73)]], vol: .24, hold: .8, decay: 1.1, attack: .012, vib: [7, .012]},
  {type: 'sq', duty: .125, steps: [[0, N(81)], [.2, N(85)]], vol: .1, hold: .8, decay: 1.3, vib: [7, .014]},
  {type: 'tri', steps: [[0, N(57)], [.2, N(61)]], vol: .18, hold: .8, decay: 1.1},
])));

// 2) Fahrrad-Klingel: zwei helle Dings (Fis6, H6) mit langem Nachklang und leisem Klirr-Teilton
report.push(wav('horn2', render(.6, [
  {type: 'tri', f0: N(90), vol: .3, hold: .15, decay: 2.6, len: .5},
  {type: 'tri', at: .16, f0: N(95), vol: .3, hold: .15, decay: 2.6, len: .44},
  {type: 'sq', duty: .125, f0: N(90) * 2.76, vol: .06, decay: 3.4, len: .3},
  {type: 'sq', duty: .125, at: .16, f0: N(95) * 2.76, vol: .06, decay: 3.4, len: .3},
])));
console.table(report);
