// Suppa Lederhosn Karts R61: eigene Chiptune-Musik je Strecke (alles eigene Kompositionen).
// Kleiner 8-Bit-Synthesizer: Rechteck-Lead (Tastgrad, Vibrato, Echo), Dreieck-Bass (4-Bit-Stufen), Rechteck-Arpeggios,
// Orgel-Flaechen, LFSR-Rauschen fuer Schlagzeug. Schreibt je Stueck eine WAV (Blender wandelt danach in MP3).
// Aufruf: node art/r61/chiptune.mjs <Ausgabeordner> [name ...]
import {writeFileSync, mkdirSync} from 'node:fs';
import path from 'node:path';

const SR = 44100;
const NOTE = {C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11};
const midi = n => {const m = /^([A-G](?:#|b)?)(-?\d)$/.exec(n); if (!m) throw new Error('Note? ' + n); return 12 * (+m[2] + 1) + NOTE[m[1]];};
const hz = m => 440 * 2 ** ((m - 69) / 12);
const CHORD = {'': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], dim: [0, 3, 6]};
function chord(sym) {const m = /^([A-G](?:#|b)?)(m7|maj7|m|7|dim)?$/.exec(sym); if (!m) throw new Error('Akkord? ' + sym); return {root: NOTE[m[1]], iv: CHORD[m[2] || '']};}
/** Melodie-Takte: "D5:2 A4:1 -:1" (Dauer in Achteln), Takte durch | getrennt. */
function parseBars(str, per) {
  return str.split('|').map((bar, bi) => {
    const out = []; let t = 0;
    for (const tok of bar.trim().split(/\s+/)) {const [n, d] = tok.split(':'); const len = +d; if (n !== '-') out.push({t, len, m: midi(n)}); t += len;}
    if (t !== per) throw new Error(`Takt ${bi + 1} hat ${t} statt ${per} Achtel: ${bar}`);
    return out;
  });
}

// ---------------------------------------------------------------- Klangerzeuger
class Mix {
  constructor(sec) {this.n = Math.ceil(sec * SR); this.L = new Float32Array(this.n); this.R = new Float32Array(this.n);}
  add(i, v, pan) {if (i < 0 || i >= this.n) return; this.L[i] += v * (1 - Math.max(0, pan)); this.R[i] += v * (1 + Math.min(0, pan));}
}
function env(t, dur, a, d, s, r) {
  if (t < a) return t / a;
  if (t < a + d) return 1 - (1 - s) * (t - a) / d;
  if (t < dur) return s;
  return Math.max(0, s * (1 - (t - dur) / r));
}
/** Ton in den Puffer: kind pulse|tri|organ, opts: duty, a d s r, vib, slide (Hz/s Abwaerts-Gleiten), steel */
function tone(mix, start, dur, f, vol, pan, kind, o = {}) {
  const {duty = .5, a = .004, d = .08, s = .7, r = .05, vib = 0, vibDelay = .12, steel = 0, drop = 0} = o;
  const i0 = Math.floor(start * SR), n = Math.floor((dur + r) * SR);
  let ph = 0, ph2 = 0, ph3 = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR, e = env(t, dur, a, d, s, r) * (steel ? Math.exp(-t * steel) : 1);
    if (e <= 0 && t > dur) break;
    let ff = f * (1 + (vib && t > vibDelay ? vib * Math.sin(2 * Math.PI * 5.6 * t) * Math.min(1, (t - vibDelay) * 4) : 0));
    if (drop) ff *= Math.exp(-drop * t);
    ph = (ph + ff / SR) % 1;
    let v;
    if (kind === 'tri') {const tr = 1 - 4 * Math.abs(ph - .5); v = Math.round(tr * 7.5) / 7.5;}                  // 4-Bit-Dreieck
    else if (kind === 'organ') {ph2 = (ph2 + ff * 1.004 / SR) % 1; ph3 = (ph3 + ff * 2.001 / SR) % 1; v = ((ph < .5 ? 1 : -1) + (ph2 < .25 ? .8 : -.8) * .7 + (ph3 < .5 ? .5 : -.5) * .5) / 2.2;}
    else {v = ph < duty ? 1 : -1; if (steel) {ph2 = (ph2 + ff * 2.76 / SR) % 1; v = v * .7 + Math.sin(2 * Math.PI * ph2) * .5;}}
    mix.add(i0 + k, v * e * vol, pan);
  }
}
// LFSR-Rauschen (NES-artig): kurzer Modus klingt metallisch
let lfsr = 1;
function noise(mix, start, dur, vol, rate, pan = 0, decay = 30, tone2 = 0) {
  const i0 = Math.floor(start * SR), n = Math.floor(dur * SR), step = SR / rate;
  let acc = 0, out = 1, ph = 0;
  for (let k = 0; k < n; k++) {
    acc += 1; if (acc >= step) {acc -= step; const b = (lfsr ^ (lfsr >> 1)) & 1; lfsr = (lfsr >> 1) | (b << 14); out = lfsr & 1 ? 1 : -1;}
    const t = k / SR; let v = out * Math.exp(-t * decay);
    if (tone2) {ph = (ph + tone2 * Math.exp(-t * 18) / SR) % 1; v = v * .35 + (1 - 4 * Math.abs(ph - .5)) * Math.exp(-t * decay * .6) * .9;}
    mix.add(i0 + k, v * vol, pan);
  }
}
const kick = (mix, t, v = .5) => noise(mix, t, .22, v, 2000, 0, 22, 140);
const snare = (mix, t, v = .28) => noise(mix, t, .18, v, 16000, .05, 18);
const hat = (mix, t, v = .07) => noise(mix, t, .05, v, 30000, -.2, 70);
const tom = (mix, t, f, v = .35) => tone(mix, t, .18, f, v, .1, 'tri', {a: .002, d: .15, s: 0, r: .02, drop: 3});

// ---------------------------------------------------------------- Stuecke (eigene Kompositionen)
// meter: Achtel je Takt (8 = 4/4, 6 = 3/4); sections: je 8 Takte mit Akkorden und Melodie
const SONGS = {
  gothic8: {title: 'Geisterhaus - Kerzen im Nordturm', bpm: 152, meter: 8, duty: .125, lead: .2, bass: 'drive', drums: 'rock', arp: 16, arpDuty: .25, echo: .3,
    A: {ch: 'Dm Dm Bb C Dm Gm A A', mel: 'D5:2 A4:1 D5:1 F5:2 E5:1 D5:1 | C#5:2 D5:1 E5:1 A4:4 | Bb4:2 D5:1 F5:1 Bb5:2 A5:1 G5:1 | A5:2 G5:1 F5:1 E5:2 C5:2 | D5:1 E5:1 F5:1 G5:1 A5:2 D6:2 | Bb5:2 A5:1 G5:1 F5:2 D5:2 | E5:2 F5:1 G5:1 C#5:2 E5:2 | A5:4 -:2 A4:2'},
    B: {ch: 'Gm Gm Dm Dm Bb C A A', mel: 'G5:3 A5:1 Bb5:2 G5:2 | D5:2 G5:2 Bb5:2 D6:2 | A5:3 G5:1 F5:2 D5:2 | A4:2 D5:2 F5:2 A5:2 | Bb5:2 A5:1 G5:1 F5:2 D5:2 | C6:2 Bb5:1 A5:1 G5:2 E5:2 | A5:1 G#5:1 A5:1 B5:1 C#6:2 E6:2 | C#6:4 A5:2 E5:2'}},
  polka: {title: 'Bierstrasse - Masskrug-Polka', bpm: 132, meter: 8, duty: .25, lead: .19, bass: 'polka', drums: 'polka', arp: 0, echo: 0,
    A: {ch: 'Bb F F Bb Bb Eb F Bb', mel: 'F5:1 D5:1 F5:1 D5:1 Bb5:2 F5:2 | Eb5:1 C5:1 Eb5:1 C5:1 A5:2 F5:2 | A5:1 G5:1 F5:1 Eb5:1 D5:1 C5:1 D5:1 Eb5:1 | F5:2 D5:2 Bb4:4 | D5:1 F5:1 Bb5:1 F5:1 D6:2 Bb5:2 | G5:1 Bb5:1 Eb6:1 Bb5:1 G5:2 Eb5:2 | F5:1 A5:1 C6:1 A5:1 F5:1 Eb5:1 C5:1 A4:1 | Bb4:2 D5:1 F5:1 Bb5:4'},
    B: {ch: 'Eb Eb Bb Bb F F Bb Bb', mel: 'G5:3 F5:1 Eb5:2 G5:2 | Bb5:4 G5:2 Eb5:2 | F5:3 Eb5:1 D5:2 F5:2 | Bb5:4 F5:2 D5:2 | C5:2 F5:2 A5:2 C6:2 | Eb6:2 C6:2 A5:2 F5:2 | D6:2 Bb5:2 F5:2 D5:2 | Bb5:4 -:4'}},
  space: {title: 'Graben-Flug - Sturzflug', bpm: 160, meter: 8, duty: .25, lead: .19, bass: 'drive', drums: 'drive', arp: 16, arpDuty: .125, echo: .28,
    A: {ch: 'Em C D Bm Em C D B', mel: 'E5:3 B4:1 E5:2 G5:2 | G5:3 F#5:1 E5:2 C5:2 | D5:2 F#5:2 A5:3 G5:1 | F#5:6 D5:2 | E5:1 F#5:1 G5:2 B5:3 A5:1 | G5:2 E5:2 C6:4 | A5:2 F#5:2 D6:3 C6:1 | B5:6 D#5:2'},
    B: {ch: 'C D Em Em Am B Em Em', mel: 'C6:3 B5:1 A5:2 G5:2 | A5:3 G5:1 F#5:2 D5:2 | G5:2 F#5:1 E5:1 B5:4 | E6:4 D6:2 B5:2 | C6:2 A5:2 E5:2 A5:2 | B5:2 F#5:2 D#5:2 F#5:2 | E5:1 G5:1 B5:1 E6:1 D6:2 B5:2 | E5:8'}},
  beach: {title: 'Schildkroeten-Bucht - Lagunen-Calypso', bpm: 116, meter: 8, duty: .5, steel: 7, lead: .22, bass: 'calypso', drums: 'calypso', arp: 8, arpDuty: .5, echo: .22,
    A: {ch: 'C F G C C F G C', mel: 'E5:1 G5:2 E5:1 C5:2 E5:2 | F5:1 A5:2 F5:1 C5:2 A4:2 | D5:1 G5:2 D5:1 B4:2 D5:1 F5:1 | E5:3 D5:1 C5:4 | G5:1 G5:1 A5:1 G5:1 E5:2 C5:2 | A5:1 A5:1 C6:1 A5:1 F5:2 A5:2 | B5:1 A5:1 G5:1 F5:1 D5:2 B4:2 | C5:6 -:2'},
    B: {ch: 'Am Am Dm G C Am F G', mel: 'A5:2 C6:1 A5:1 E5:2 A5:2 | G5:1 E5:1 C5:2 A4:4 | D5:1 F5:1 A5:2 D6:2 C6:2 | B5:1 A5:1 G5:2 D5:4 | E5:1 G5:1 C6:2 G5:2 E5:2 | A5:1 C6:1 E6:2 C6:2 A5:2 | F5:1 A5:1 C6:2 A5:1 F5:1 C5:2 | D5:1 E5:1 F5:1 G5:1 B5:2 D6:2'}},
  ice: {title: 'Eisstock-See - Walzer auf dem Eis', bpm: 156, meter: 6, duty: .125, lead: .2, bass: 'waltz', drums: 'waltz', arp: 0, pad: .05, echo: .35,
    A: {ch: 'Am Am Dm Dm G G C E', mel: 'E5:2 A5:2 C6:2 | B5:4 A5:2 | F5:2 A5:2 D6:2 | C6:4 A5:2 | D5:2 G5:2 B5:2 | A5:4 G5:2 | E5:2 G5:2 C6:2 | B5:4 G#5:2'},
    B: {ch: 'F F C C Dm E Am Am', mel: 'A5:2 C6:2 F6:2 | E6:4 C6:2 | G5:2 C6:2 E6:2 | D6:4 C6:2 | D6:2 C6:2 A5:2 | B5:2 G#5:2 E5:2 | A5:6 | -:2 E5:2 G#5:2'}},
  dome: {title: 'Riesendom - Choral der Waechter', bpm: 96, meter: 8, duty: .5, lead: .17, leadKind: 'organ', bass: 'long', drums: 'epic', arp: 8, arpDuty: .25, pad: .06, echo: .4, vib: .006,
    A: {ch: 'Cm Ab Eb Bb Cm Ab Fm G', mel: 'G5:4 C6:4 | C6:2 Eb6:2 C6:2 Ab5:2 | G5:6 Bb5:2 | F5:4 D5:4 | G5:4 Eb6:4 | D6:2 C6:2 Ab5:4 | Ab5:2 C6:2 F6:4 | D6:4 B5:4'},
    B: {ch: 'Ab Bb Gm Cm Fm G Cm G', mel: 'C6:4 Eb6:4 | D6:4 F6:4 | D6:2 Bb5:2 G5:4 | C6:6 G5:2 | Ab5:2 C6:2 F6:4 | D6:2 B5:2 G5:4 | C6:4 Eb6:2 G6:2 | F6:2 D6:2 B5:4'}},
  choco: {title: 'Schoko-Matsch - Schokoladen-Swing', bpm: 126, meter: 8, swing: .64, duty: .25, lead: .2, bass: 'walk', drums: 'swing', arp: 0, stabs: true, echo: .18,
    A: {ch: 'F Dm Gm C F D7 Gm C', mel: 'C5:1 F5:1 A5:1 C6:2 A5:1 F5:2 | D5:1 F5:1 A5:1 D6:2 C6:1 A5:2 | Bb5:2 A5:1 G5:1 D5:2 G5:2 | E5:1 G5:1 C6:2 Bb5:2 G5:2 | A5:1 C6:1 F6:2 E6:1 D6:1 C6:2 | F#5:1 A5:1 C6:2 A5:1 F#5:1 D5:2 | G5:1 Bb5:1 D6:2 C6:1 Bb5:1 G5:2 | E5:2 G5:2 C6:3 -:1'},
    B: {ch: 'Bb Bb F F G7 G7 C C7', mel: 'D6:2 C6:1 Bb5:1 F5:2 D5:2 | F5:1 G5:1 Bb5:2 D6:4 | C6:2 A5:1 F5:1 C5:2 F5:2 | A5:1 G5:1 F5:2 C6:4 | B5:2 G5:1 F5:1 D5:2 G5:2 | B5:1 D6:1 F6:2 D6:2 B5:2 | C6:2 G5:2 E5:2 C5:2 | Bb5:1 G5:1 E5:1 C5:1 E5:2 G5:2'}},
  lava: {title: 'Lava-Feste - Magma-Galopp', bpm: 172, meter: 8, duty: .25, lead: .19, bass: 'gallop', drums: 'rock', arp: 16, arpDuty: .125, echo: .2,
    A: {ch: 'Am Am F G Am Am F E', mel: 'A4:1 C5:1 E5:1 A5:2 G5:1 E5:2 | A5:1 B5:1 C6:2 B5:1 A5:1 E5:2 | F5:2 A5:1 C6:1 F6:2 E6:1 C6:1 | D6:2 B5:1 G5:1 D5:2 G5:2 | A5:1 A5:1 C6:1 A5:1 E6:2 D6:2 | C6:2 B5:1 A5:1 E5:4 | F5:1 A5:1 C6:1 F6:1 E6:2 C6:2 | B5:2 G#5:2 E5:2 G#5:2'},
    B: {ch: 'Dm Am E Am Dm Am E E', mel: 'D6:3 C6:1 A5:2 F5:2 | E5:3 A5:1 C6:2 E6:2 | D6:2 B5:2 G#5:2 E5:2 | A5:6 -:2 | F6:2 E6:1 D6:1 A5:2 D6:2 | C6:2 B5:1 A5:1 E5:2 A5:2 | G#5:1 A5:1 B5:1 C6:1 D6:2 E6:2 | E6:4 B5:2 G#5:2'}},
  kirmes: {title: 'Magnet-Kirmes - Rummelwalzer', bpm: 168, meter: 6, duty: .25, lead: .19, leadKind: 'organ', bass: 'waltz', drums: 'waltz', arp: 0, echo: .15,
    A: {ch: 'G G D D D7 D7 G G', mel: 'D5:2 G5:2 B5:2 | D6:4 B5:2 | C6:2 A5:2 F#5:2 | A5:4 D5:2 | C6:2 A5:2 F#5:2 | A5:2 C6:2 D6:2 | B5:2 G5:2 D5:2 | G5:4 -:2'},
    B: {ch: 'C C G G A7 D7 G D7', mel: 'E5:2 G5:2 C6:2 | E6:4 C6:2 | D6:2 B5:2 G5:2 | B5:4 G5:2 | C#6:2 A5:2 E5:2 | F#5:2 A5:2 C6:2 | B5:2 D6:2 G6:2 | F#6:2 D6:2 A5:2'}},
};

function render(key) {
  const S = SONGS[key], per = S.meter, beat = 60 / S.bpm, eighth = beat / 2;
  const secs = {A: {ch: S.A.ch.split(' ').map(chord), mel: parseBars(S.A.mel, per)}, B: {ch: S.B.ch.split(' ').map(chord), mel: parseBars(S.B.mel, per)}};
  const barLen = per * eighth, secLen = 8 * barLen;
  const reps = Math.max(2, Math.ceil(56 / (secLen * 2)));
  const order = []; for (let i = 0; i < reps; i++) order.push(['A', i], ['B', i]);
  const total = order.length * secLen;
  const mix = new Mix(total + 1.5), echoBuf = new Mix(total + 1.5);
  const sw = (i) => (S.swing && i % 2 === 1 ? (S.swing - .5) * 2 * eighth : 0);   // Swing: jede zweite Achtel spaeter
  const at = (bar0, e) => bar0 + Math.floor(e) * eighth + sw(Math.floor(e)) + (e - Math.floor(e)) * eighth;
  order.forEach(([sec, rep], si) => {
    const X = secs[sec], t0 = si * secLen, up = rep % 2 === 1;   // jede zweite Wiederholung: Melodie eine Oktave hoeher, zarter
    for (let b = 0; b < 8; b++) {
      const bar0 = t0 + b * barLen, c = X.ch[b];
      // Melodie
      for (const n of X.mel[b]) {
        const m = n.m + (up && n.m < 84 ? 12 : 0), dur = n.len * eighth * .92;
        const o = {duty: up ? .125 : S.duty, a: S.leadKind === 'organ' ? .02 : .004, d: .1, s: .72, r: S.leadKind === 'organ' ? .12 : .05, vib: S.vib ?? .004, steel: S.steel || 0};
        tone(mix, at(bar0, n.t), dur, hz(m), S.lead * (up ? .8 : 1), -.15, S.leadKind || 'pulse', o);
        if (S.echo) tone(echoBuf, at(bar0, n.t), dur, hz(m), S.lead * S.echo * (up ? .8 : 1), .45, S.leadKind || 'pulse', o);
        if (up) tone(mix, at(bar0, n.t), dur, hz(n.m - 12 >= 55 ? n.m - 12 : n.m), S.lead * .35, .25, 'pulse', {duty: .5, d: .1, s: .6});
      }
      const tones = c.iv.map(i => 60 + c.root + i);   // Akkordtoene um C4
      // Arpeggio
      if (S.arp) {
        const steps = S.arp === 16 ? per * 2 : per, st = barLen / steps;
        for (let k = 0; k < steps; k++) {const m = tones[k % tones.length] + (Math.floor(k / tones.length) % 2 ? 12 : 0);
          tone(mix, bar0 + k * st, st * .7, hz(m), .055, .35, 'pulse', {duty: S.arpDuty || .25, d: .05, s: .4, r: .02});}
      }
      // Flaeche (Orgel)
      if (S.pad) for (const m of tones) tone(mix, bar0, barLen * .98, hz(m - 12), S.pad, .0, 'organ', {a: .15, d: .3, s: .8, r: .2});
      // Bass
      const bm = 36 + c.root + (c.root > 4 ? -12 : 0) + 12;   // E2..D#3
      const B = (e, m, len = 1, v = .32) => tone(mix, at(bar0, e), len * eighth * .9, hz(m), v, 0, 'tri', {a: .003, d: .06, s: .8, r: .03});
      const stab = (e, len = 1) => {for (const m of tones) tone(mix, at(bar0, e), len * eighth * .55, hz(m), .045, .2, 'pulse', {duty: .5, d: .05, s: .5, r: .02});};
      const fifth = bm + 7, third = bm + c.iv[1];
      switch (S.bass) {
        case 'drive': for (let e = 0; e < per; e++) B(e, e % 2 ? bm + 12 : bm, 1, .3); break;
        case 'gallop': for (let q = 0; q < per; q += 2) {B(q, bm, 1); B(q + 1, bm, .5); B(q + 1.5, bm + 12, .5);} break;
        case 'polka': B(0, bm, 1.6); B(4, fifth - 12, 1.6); stab(2, 1.2); stab(6, 1.2); break;   // Umm - pa - Umm - pa
        case 'waltz': B(0, bm, 2, .34); stab(2, 1.5); stab(4, 1.5); break;
        case 'walk': {const w = [bm, third, fifth, bm + 9]; for (let q = 0; q < per / 2; q++) B(q * 2, w[q % 4], 1.8, .3); if (S.stabs) {stab(2); stab(6);} break;}
        case 'calypso': B(0, bm, 2); B(3, fifth - 12, 1); B(4, bm, 2); B(7, fifth - 12, 1); stab(1); stab(3); stab(5); stab(7); break;
        case 'long': B(0, bm, per, .3); tone(mix, bar0, barLen * .95, hz(bm - 12), .16, 0, 'tri', {a: .05, d: .2, s: .9, r: .1}); break;
      }
      // Schlagzeug
      const last = b === 7;
      switch (S.drums) {
        case 'rock': kick(mix, at(bar0, 0)); kick(mix, at(bar0, 4)); kick(mix, at(bar0, 5), .35); snare(mix, at(bar0, 2)); snare(mix, at(bar0, 6)); for (let e = 0; e < 8; e++) hat(mix, at(bar0, e)); if (last) {snare(mix, at(bar0, 7), .2); snare(mix, at(bar0, 7.5), .22);} break;
        case 'drive': for (let q = 0; q < 8; q += 2) kick(mix, at(bar0, q)); snare(mix, at(bar0, 2)); snare(mix, at(bar0, 6)); for (let e = 0; e < 16; e++) hat(mix, at(bar0, e / 2), e % 2 ? .04 : .07); if (last) for (let k = 0; k < 4; k++) tom(mix, at(bar0, 6 + k * .5), 220 - k * 30); break;
        case 'polka': kick(mix, at(bar0, 0), .42); kick(mix, at(bar0, 4), .42); snare(mix, at(bar0, 2), .16); snare(mix, at(bar0, 6), .16); break;
        case 'waltz': kick(mix, at(bar0, 0), .38); hat(mix, at(bar0, 2), .08); hat(mix, at(bar0, 4), .08); break;
        case 'swing': kick(mix, at(bar0, 0), .4); kick(mix, at(bar0, 4), .4); snare(mix, at(bar0, 2), .2); snare(mix, at(bar0, 6), .2); for (let e = 0; e < 8; e++) hat(mix, at(bar0, e), e % 2 ? .05 : .08); break;
        case 'calypso': kick(mix, at(bar0, 0), .4); kick(mix, at(bar0, 3), .3); kick(mix, at(bar0, 4), .4); for (const e of [1, 3, 5, 6, 7]) hat(mix, at(bar0, e), .07); snare(mix, at(bar0, 6), .14); break;
        case 'epic': kick(mix, at(bar0, 0), .5); if (b % 2 === 1) kick(mix, at(bar0, 4), .4); if (last) for (let k = 0; k < 6; k++) tom(mix, at(bar0, 5 + k * .5), 160 - k * 12, .3); break;
      }
    }
  });
  // Echo (3/16 spaeter) in den Hauptmix
  const dly = Math.floor(beat * .75 * SR);
  for (let i = 0; i < echoBuf.n; i++) {if (i + dly < mix.n) {mix.L[i + dly] += echoBuf.R[i] * .8; mix.R[i + dly] += echoBuf.L[i];}}
  // Nahtloser Loop: Ausklang nach dem Ende auf den Anfang falten
  const n = Math.floor(total * SR);
  for (let i = n; i < mix.n; i++) {mix.L[i - n] += mix.L[i]; mix.R[i - n] += mix.R[i];}
  // Weichzeichnen, sanft begrenzen, normalisieren
  const out = new Int16Array(n * 2); let pk = 0, l = 0, r = 0; const a = .55;
  const Lb = new Float32Array(n), Rb = new Float32Array(n);
  for (let i = 0; i < n; i++) {l += a * (mix.L[i] - l); r += a * (mix.R[i] - r); Lb[i] = Math.tanh(l * 1.3); Rb[i] = Math.tanh(r * 1.3); pk = Math.max(pk, Math.abs(Lb[i]), Math.abs(Rb[i]));}
  const g = .89 / (pk || 1);
  for (let i = 0; i < n; i++) {out[i * 2] = Math.round(Lb[i] * g * 32767); out[i * 2 + 1] = Math.round(Rb[i] * g * 32767);}
  return {pcm: out, secs: total, title: S.title};
}

function wav(pcm) {
  const data = Buffer.from(pcm.buffer), h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

const outDir = process.argv[2] || '.scratch/r61-music';
mkdirSync(outDir, {recursive: true});
const want = process.argv.slice(3).length ? process.argv.slice(3) : Object.keys(SONGS);
const report = {};
for (const k of want) {const r = render(k); const f = path.join(outDir, `bgm_${k}.wav`); writeFileSync(f, wav(r.pcm)); report[k] = {title: r.title, secs: +r.secs.toFixed(1), file: f}; console.log(k, r.secs.toFixed(1) + 's', r.title);}
writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 1));
