// Wiesn Kart R65: weitere Chiptune-Effekte, selbst synthetisiert (NES-artig), gleiche Klangerzeuger wie art/r44/make_chiptune.mjs.
// Brezn-Trio, Fake-Block, Dreher, Flunder, Rueckspiegel, Pixel-Krone, Menue, Wusch, Landung, Platschen, falsche Richtung, Online-Bonus.
// Aufruf: node art/r65/make_sfx.mjs  ->  assets/audio/sfx/chip/*.wav (22,05 kHz, 16 bit, mono)
import {writeFileSync, mkdirSync} from 'node:fs';
const SR = 22050, OUT = new URL('../../assets/audio/sfx/chip/', import.meta.url);
mkdirSync(OUT, {recursive: true});
const N = n => 440 * Math.pow(2, (n - 69) / 12);            // MIDI-Note -> Hz
const note = s => { const m = s.match(/^([A-G])(#?)(\d)$/); const k = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11}[m[1]] + (m[2] ? 1 : 0); return N(12 * (+m[3] + 1) + k); };

function render(dur, voices) {
  const n = Math.round(dur * SR), buf = new Float32Array(n);
  for (const v of voices) {
    let ph = 0, lfsr = 1, noiseVal = 1, noiseAcc = 0;
    const t0 = v.at || 0, len = v.len ?? dur - t0;
    for (let i = Math.round(t0 * SR); i < Math.min(n, Math.round((t0 + len) * SR)); i++) {
      const t = i / SR - t0, u = t / len;
      // Frequenz: Tonfolge (steps: [[t, hz], ...]) oder Rutsch f0 -> f1 (exponentiell)
      let f = v.f0;
      if (v.steps) { for (const [ts, hz] of v.steps) if (t >= ts) f = hz; }
      else if (v.f1) f = v.f0 * Math.pow(v.f1 / v.f0, Math.min(1, t / (v.slide ?? len)));
      if (v.vib) f *= 1 + v.vib[1] * Math.sin(2 * Math.PI * v.vib[0] * t);
      // Huellkurve: kurzer Anschlag, Halten, Abklingen (NES-typisch in groben Stufen)
      const a = v.attack ?? .004, env = t < a ? t / a : Math.pow(Math.max(0, 1 - (u - (v.hold ?? 0)) / (1 - (v.hold ?? 0))), v.decay ?? 1.4);
      const stepEnv = Math.round(Math.min(1, env) * 15) / 15;
      let s;
      // Klatschen: Rauschen, das in zufaelligen kurzen Stoessen an- und abschwillt (8-Bit-Applaus)
      if (v.claps) { const slot = Math.floor(t * v.claps), h = Math.sin(slot * 12.9898 + (v.seed || 0) * 78.233) * 43758.5453, r = h - Math.floor(h), ph2 = t * v.claps - slot; if (r < .35 || ph2 > .55) { buf[i] += 0; continue; } }
      if (v.type === 'noise') {
        noiseAcc += f / SR;
        while (noiseAcc >= 1) { noiseAcc -= 1; const bit = ((lfsr ^ (lfsr >> (v.short ? 6 : 1))) & 1); lfsr = (lfsr >> 1) | (bit << 14); noiseVal = (lfsr & 1) ? 1 : -1; }
        s = noiseVal;
      } else {
        ph = (ph + f / SR) % 1;
        if (v.type === 'tri') s = Math.round((ph < .5 ? ph * 4 - 1 : 3 - ph * 4) * 7.5) / 7.5;
        else s = ph < (v.duty ?? .5) ? 1 : -1;
      }
      buf[i] += s * stepEnv * (v.vol ?? .3);
    }
  }
  // sanftes Ausblenden am Ende gegen Knackser, Begrenzung
  const fade = Math.min(n, Math.round(.012 * SR));
  for (let i = 0; i < fade; i++) buf[n - 1 - i] *= i / fade;
  for (let i = 0; i < n; i++) buf[i] = Math.max(-1, Math.min(1, buf[i]));
  return buf;
}function wav(name, buf) {
  const b = Buffer.alloc(44 + buf.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + buf.length * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(buf.length * 2, 40);
  for (let i = 0; i < buf.length; i++) b.writeInt16LE(Math.round(buf[i] * 32000), 44 + i * 2);
  writeFileSync(new URL(name + '.wav', OUT), b);
  return {name, ms: Math.round(buf.length / SR * 1000), kb: +(b.length / 1024).toFixed(1)};
}
const arp = (notes, step) => notes.map((n, i) => [i * step, note(n)]);
const report = [];

// Brezn-Trio: Wurf - kurzer Rechteck-Zisch aufwaerts mit Rauschschweif
report.push(wav('throw', render(.3, [{type: 'sq', duty: .25, f0: 420, f1: 1500, slide: .12, vol: .2, hold: .1, decay: 1.6}, {type: 'noise', f0: 5200, vol: .08, decay: 2.2}])));
// Fake-Block abgelegt: fieses kleines "Hihi" (zwei hohe Rechteck-Tupfer, dann ein Tritonus abwaerts)
report.push(wav('fake', render(.5, [{type: 'sq', duty: .125, steps: arp(['B5', 'B5', 'F5'], .09), vol: .2, hold: .5, decay: 1.4}, {type: 'tri', steps: arp(['B3', 'B3', 'F3'], .09), vol: .3, hold: .4}])));
// Fake-Block zerplatzt: Abwaerts-Arpeggio mit Knall
report.push(wav('fakepop', render(.55, [{type: 'sq', duty: .5, steps: arp(['E6', 'C6', 'G5', 'D#5', 'C5'], .05), vol: .2, hold: .4, decay: 1.2}, {type: 'noise', f0: 1600, vol: .2, decay: 2}])));
// Dreher: Reifenquietschen als 8-Bit-Vibrato-Pfiff, der zweimal herumwirbelt
report.push(wav('spin', render(.7, [{type: 'sq', duty: .125, f0: 1400, f1: 500, vib: [9, .18], vol: .14, hold: .3, decay: 1.2}, {type: 'noise', f0: 7000, short: true, vol: .06, decay: 1.5}])));
// Platt wie eine Flunder: "Pfff" (Rauschen) + tiefer Rechteck-Plumps; zurueckploppen: steigender Tupfer
report.push(wav('flat', render(.45, [{type: 'noise', f0: 2600, vol: .18, decay: 1.4}, {type: 'sq', duty: .5, f0: 330, f1: 90, vol: .2, decay: 1.3}])));
report.push(wav('unflat', render(.25, [{type: 'sq', duty: .25, f0: 200, f1: 1100, slide: .1, vol: .22, hold: .2, decay: 1.5}])));
// Rueckspiegel / Warnung von hinten: Doppelpiep
report.push(wav('warn', render(.3, [{type: 'sq', duty: .5, f0: note('D#6'), len: .07, vol: .2, hold: .8}, {type: 'sq', duty: .5, f0: note('D#6'), at: .13, len: .07, vol: .2, hold: .8}])));
// Pixel-Krone gewonnen: kleine Koenigsfanfare (Quartsprung, Triole, Schlussakkord)
report.push(wav('crown', render(1.3, [
  {type: 'sq', duty: .25, steps: [[0, note('G5')], [.15, note('C6')], [.3, note('C6')], [.4, note('D6')], [.5, note('E6')], [.7, note('G6')]], vol: .2, hold: .7, decay: 1.1},
  {type: 'sq', duty: .5, steps: [[0, note('E5')], [.15, note('E5')], [.5, note('G5')], [.7, note('C6')]], vol: .09, hold: .7},
  {type: 'tri', steps: [[0, note('C3')], [.3, note('G3')], [.7, note('C4')]], vol: .3, hold: .7},
  {type: 'noise', f0: 9000, short: true, at: .7, len: .5, vol: .06, decay: 1.6}])));
// Menue-Knopf: kurzer Doppel-Tupfer
report.push(wav('select', render(.12, [{type: 'sq', duty: .25, steps: [[0, note('E6')], [.04, note('B6')]], vol: .18, hold: .5, decay: 2}])));
// Wusch (Wurf, Bombe): gefiltertes Rauschen auf und ab
report.push(wav('whoosh', render(.35, [{type: 'noise', f0: 1800, vib: [3, .6], vol: .14, attack: .08, hold: .2, decay: 1.4}])));
// Landung: tiefer Dreieck-Rums
report.push(wav('land', render(.22, [{type: 'tri', f0: 140, f1: 45, vol: .45, decay: 1.4}, {type: 'noise', f0: 700, vol: .07, decay: 2.5}])));
// Platschen: Rauschen, das von hell nach dunkel faellt, plus Blubb
report.push(wav('splash', render(.6, [{type: 'noise', f0: 6000, f1: 700, vol: .2, decay: 1.2}, {type: 'sq', duty: .5, f0: 300, f1: 80, vol: .1, decay: 1.5}])));
// Falsch (falsche Richtung): zwei tiefe Rechtecke
report.push(wav('wrong', render(.4, [{type: 'sq', duty: .5, steps: [[0, note('D#4')], [.16, note('C4')]], vol: .2, hold: .8, decay: 1.3}])));
// Online-Bonus eingesackt: Muenzregen-Arpeggio
report.push(wav('bonus', render(.8, [{type: 'sq', duty: .25, steps: arp(['C6', 'E6', 'G6', 'C7', 'G6', 'C7', 'E7'], .06), vol: .2, hold: .6, decay: 1.2}, {type: 'tri', steps: arp(['C4', 'G4', 'C5'], .12), vol: .25, hold: .5}])));
// R66 XXL-Stachelpanzer: tiefes Grollen mit Rechteck-Knurren (Abwurf) und Walzen-Krach (Treffer)
report.push(wav('spiky', render(.9, [{type: 'sq', duty: .25, f0: 90, f1: 140, vib: [17, .08], vol: .2, attack: .03, hold: .5, decay: 1.2}, {type: 'tri', f0: 60, f1: 45, vol: .4, hold: .5}, {type: 'noise', f0: 700, vol: .12, attack: .05, hold: .4, decay: 1.3}])));
report.push(wav('crush', render(.6, [{type: 'noise', f0: 1400, vol: .28, decay: 1.5}, {type: 'sq', duty: .5, f0: 520, f1: 60, vol: .2, decay: 1.2}, {type: 'tri', f0: 110, f1: 40, vol: .4, decay: 1.4}, {type: 'noise', f0: 9000, short: true, at: .05, len: .2, vol: .06, decay: 2}])));
// R66 Ergebnis-Jingles (eigene Kompositionen): Sieg/Treppchen-Fanfare in C-Dur, "Nochmal!" mit Posaunen-Wahwah und Aufschwung
const ph = (at, notes, len, o = {}) => ({type: 'sq', duty: .25, at, len, steps: notes.map(([t, n]) => [t, note(n)]), vol: .2, hold: .85, decay: 1.1, ...o});
report.push(wav('win', render(5.0, [
  ph(0, [[0, 'G5'], [.15, 'C6'], [.3, 'E6'], [.45, 'G6'], [.75, 'E6'], [.9, 'G6']], 1.45),
  ph(1.5, [[0, 'F6'], [.15, 'E6'], [.3, 'D6'], [.45, 'C6'], [.6, 'D6']], 1.15),
  ph(2.7, [[0, 'E6'], [.15, 'F6'], [.3, 'G6'], [.6, 'C7']], 2.2, {hold: .6, vib: [5.5, .006]}),
  ph(0, [[0, 'E5'], [.15, 'E5'], [.3, 'C6'], [.45, 'E6'], [.75, 'C6'], [.9, 'E6']], 1.45, {duty: .5, vol: .08}),
  ph(1.5, [[0, 'D6'], [.15, 'C6'], [.3, 'B5'], [.45, 'A5'], [.6, 'B5']], 1.15, {duty: .5, vol: .08}),
  ph(2.7, [[0, 'C6'], [.15, 'D6'], [.3, 'E6'], [.6, 'G6']], 2.2, {duty: .5, vol: .08, hold: .6}),
  {type: 'tri', at: 0, len: 4.9, steps: [[0, note('C3')], [.45, note('C4')], [.75, note('G3')], [1.5, note('F3')], [2.1, note('G3')], [2.7, note('A3')], [3.0, note('G3')], [3.3, note('C3')]], vol: .32, hold: .9, decay: 1},
  ...[0, .45, .9, 1.5, 2.1, 2.7, 3.3].map(at => ({type: 'noise', f0: 2400, at, len: .16, vol: .14, decay: 2.2})),
  ...[3.0, 3.075, 3.15, 3.225].map(at => ({type: 'noise', f0: 5200, at, len: .07, vol: .09, decay: 2})),
  {type: 'noise', f0: 9500, short: true, at: 3.3, len: 1.5, vol: .05, decay: 1.4}])));
report.push(wav('lose', render(3.3, [
  {type: 'sq', duty: .5, at: 0, len: 1.4, steps: [[0, note('C5')], [.25, note('B4')], [.5, note('A#4')], [.75, note('A4')]], vib: [5, .018], vol: .2, hold: .8, decay: 1.2},
  {type: 'sq', duty: .25, at: 1.5, len: 1.7, steps: [[0, note('F5')], [.12, note('G5')], [.24, note('A5')], [.4, note('C6')]], vol: .2, hold: .6, decay: 1.2},
  {type: 'sq', duty: .5, at: 1.9, len: 1.3, f0: note('A5'), vol: .07, hold: .6},
  {type: 'tri', at: 0, len: 3.2, steps: [[0, note('F3')], [.75, note('D3')], [1.5, note('F3')], [1.9, note('C3')], [2.2, note('F3')]], vol: .3, hold: .85, decay: 1},
  ...[0, .75, 1.9].map(at => ({type: 'noise', f0: 1600, at, len: .14, vol: .12, decay: 2.3}))])));
console.table(report);
