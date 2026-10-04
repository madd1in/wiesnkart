// Wiesn Kart R95: zwei weitere Hupen als Saison-Belohnungen (eigene Klaenge, gleiche Klangerzeuger wie
// art/r44/r65/r88/r90): horn3 Zugpfeife (zwei schrille Pfeifstoesse mit Anlauf), horn4 Gockel (kraeht:
// aufsteigender Rueckenberg mit Kratzer und Schnabel-Schnipper). Kein Sample, keine Anbieter-Kosten.
// Aufruf: node art/r95/make_horn2.mjs  ->  assets/audio/sfx/chip/horn3.wav, horn4.wav
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

// 3) Zugpfeife: zwei Stoesse, jeder mit kurzem Anlauf (Frequenzrutsch hoch) und Flatterrand
report.push(wav('horn3', render(.8, [
  {type: 'sq', duty: .5, f0: 620, f1: 840, slide: .06, vib: [38, .1], vol: .2, hold: .22, decay: 1.1, attack: .015},
  {type: 'tri', f0: 1240, f1: 1680, slide: .06, vib: [38, .12], vol: .12, hold: .22, decay: 1.3, attack: .015},
  {type: 'sq', duty: .5, at: .26, f0: 620, f1: 840, slide: .06, vib: [34, .1], vol: .22, hold: .6, decay: 1, attack: .015},
  {type: 'tri', at: .26, f0: 1240, f1: 1680, slide: .06, vib: [34, .12], vol: .12, hold: .6, decay: 1.2, attack: .015},
  {type: 'noise', f0: 4200, vol: .035, decay: 1.4, attack: .02},
  {type: 'noise', at: .26, f0: 4200, vol: .04, decay: 1.4, attack: .02},
])));

// 4) Gockel: kraeht - Rueckenberg ueber zwei Oktaven mit grobem Kratzer (Duty-Wobble), hinten Schnipper
report.push(wav('horn4', render(.75, [
  {type: 'sq', duty: .38, f0: N(60), f1: N(84), slide: .32, vib: [22, .07], vol: .22, hold: .35, decay: 1.5, attack: .012},
  {type: 'sq', duty: .18, f0: N(72), f1: N(96), slide: .32, vib: [22, .08], vol: .08, hold: .35, decay: 1.7},
  {type: 'tri', f0: N(48), f1: N(60), slide: .32, vol: .14, hold: .35, decay: 1.4},
  {type: 'sq', duty: .3, at: .38, f0: N(76), f1: N(70), slide: .12, vol: .12, hold: .3, decay: 2.2, attack: .01},
  {type: 'noise', f0: 5200, vol: .03, decay: 1.2, attack: .02},
])));
console.table(report);
