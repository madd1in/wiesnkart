// Suppa Lederhosn Karts: Musik-Mixe v3 "treibender und melodischer", 2026-10-02.
// Melodien, Akkorde, Tempo und Taktart bleiben die der Kompositionen in art/r61/chiptune.mjs. Neu in der Ausarbeitung:
// Sidechain-Pumpen auf den Kick, Viervierteltakt-Kick mit Synkopen, Backbeat mit Klatschen, offene Hats auf den Gegenschlaegen,
// Crash und Aufbau vor jedem Abschnittswechsel, pulsierender Bass mit Oktave und Leitton, Chorus-Verdopplung der Melodie,
// diatonische Gegenstimme im B-Teil und in der hohen Wiederholung, kleine Vorschlagnoten, mehr Arpeggios in Almwiese und Canyon.
// Run: node art/audio-20261002/music-v3.mjs .scratch/music-v3
// Jedes Stueck bekommt am Ende 2,2 s des exakten Anfangs fuer die Ueberblendung; keine Anbieter-Aufrufe, keine Kosten.
// Kleiner 8-Bit-Synthesizer: Rechteck-Lead (Tastgrad, Vibrato, Echo), Dreieck-Bass (4-Bit-Stufen), Rechteck-Arpeggios,
// Orgel-Flaechen, LFSR-Rauschen fuer Schlagzeug. Schreibt je Stueck eine WAV (Blender wandelt danach in MP3).
// Aufruf: node art/r61/chiptune.mjs <Ausgabeordner> [name ...]
import {writeFileSync, readFileSync, mkdirSync} from 'node:fs';
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
    else if (kind === 'sine') v = Math.sin(2 * Math.PI * ph);
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
const kick = (mix,t,v=.5) => {tone(mix,t,.16,130,v*1.22,0,'sine',{a:.002,d:.13,s:.06,r:.025,drop:7});noise(mix,t,.018,v*.075,7000,0,150);};
const snare = (mix,t,v=.28) => {noise(mix,t,.15,v*1.1,16000,.04,24);tone(mix,t,.075,185,v*.48,0,'tri',{a:.002,d:.065,s:.05,r:.025,drop:3});};
const hat = (mix, t, v = .07) => noise(mix, t, .05, v, 30000, -.2, 70);
const tom = (mix, t, f, v = .35) => tone(mix, t, .18, f, v, .1, 'tri', {a: .002, d: .15, s: 0, r: .02, drop: 3});

// ---------------------------------------------------------------- Stuecke: die Kompositionen kommen unveraendert aus art/r61/chiptune.mjs
// (eine Quelle der Wahrheit fuer Melodien, Akkorde, Tempo und Taktart); hier aendert sich nur die Ausarbeitung.
const srcText = readFileSync(new URL('../r61/chiptune.mjs', import.meta.url), 'utf8');
const songLiteral = /const SONGS = (\{[\s\S]*?\r?\n\});\r?\n\s*function render/.exec(srcText);
if (!songLiteral) throw new Error('SONGS in chiptune.mjs nicht gefunden');
const SONGS = new Function('return ' + songLiteral[1])();
// Tempi: die neun Stuecke behalten die schnelleren Tempi der ersten R72-Fassung (art/audio-20261001), die vier R65-Stuecke
// werden um rund 8 % schneller; dazu mehr Arpeggios in Almwiese und Canyon.
const TUNE = {
  gothic8: {bpm: 164}, polka: {bpm: 152}, space: {bpm: 174}, beach: {bpm: 138}, ice: {bpm: 174}, dome: {bpm: 120}, choco: {bpm: 146}, lava: {bpm: 184}, kirmes: {bpm: 184},
  alm: {bpm: 168, arp: 8, arpDuty: .25}, canyon: {bpm: 156, arp: 8, arpDuty: .25}, neon: {bpm: 138}, lobby: {bpm: 142},
};
const SKIP = new Set(['menu8']);   // das Menue bleibt wie es ist

// Gegenstimme: der naechste Akkordton 3-5 Halbtoene unter der Melodienote
function harmony(m, c) {
  const pcs = c.iv.map(i => (c.root + i) % 12);
  for (const d of [3, 4, 5, 2, 6, 7, 8]) {const h = m - d; if (pcs.includes(((h % 12) + 12) % 12)) return h;}
  return m - 4;
}
// Aufbau vor dem Abschnittswechsel: Rauschstoesse, die dichter und lauter werden
function riser(mix, t, dur, v = .1) {
  const n = 14;
  for (let k = 0; k < n; k++) noise(mix, t + dur * (1 - Math.pow(1 - k / n, 1.6)), .06, v * (.35 + .65 * k / n), 14000 + k * 1500, .2, 35);
}

function render(key) {
  const S = {...SONGS[key], ...(TUNE[key] || {})}, per = S.meter, beat = 60 / S.bpm, eighth = beat / 2;
  const secs = {A: {ch: S.A.ch.split(' ').map(chord), mel: parseBars(S.A.mel, per)}, B: {ch: S.B.ch.split(' ').map(chord), mel: parseBars(S.B.mel, per)}};
  const barLen = per * eighth, secLen = 8 * barLen;
  const reps = Math.max(2, Math.ceil(56 / (secLen * 2)));
  const order = []; for (let i = 0; i < reps; i++) order.push(['A', i], ['B', i]);
  const total = order.length * secLen;
  const mel = new Mix(total + 1.5), rhy = new Mix(total + 1.5), echoBuf = new Mix(total + 1.5);   // mel: Melodie, Gegenstimme, Arpeggio, Flaeche; rhy: Bass und Schlagzeug
  const kicks = [];
  const kickD = (t, v) => {kick(rhy, t, v); kicks.push(t);};
  const sw = (i) => (S.swing && i % 2 === 1 ? (S.swing - .5) * 2 * eighth : 0);
  const at = (bar0, e) => bar0 + Math.floor(e) * eighth + sw(Math.floor(e)) + (e - Math.floor(e)) * eighth;
  const straight = ['drive', 'rock', 'epic'].includes(S.drums);
  order.forEach(([sec, rep], si) => {
    const X = secs[sec], t0 = si * secLen, up = rep % 2 === 1;
    const next = secs[order[(si + 1) % order.length][0]];
    for (let b = 0; b < 8; b++) {
      const bar0 = t0 + b * barLen, c = X.ch[b], last = b === 7;
      // ---- Melodie, Verdopplung, Gegenstimme
      for (const n of X.mel[b]) {
        const m = n.m + (up && n.m < 84 ? 12 : 0), dur = n.len * eighth * .92, t = at(bar0, n.t), lead = S.leadKind || 'pulse';
        const o = {duty: up ? .125 : S.duty, a: S.leadKind === 'organ' ? .02 : .004, d: .1, s: .72, r: S.leadKind === 'organ' ? .12 : .05, vib: S.vib ?? .004, steel: S.steel || 0};
        tone(mel, t, dur, hz(m), S.lead * (up ? .8 : 1), -.15, lead, o);
        tone(mel, t, dur, hz(m) * 1.004, S.lead * .26, .3, lead, {...o, duty: .5, vib: (S.vib ?? .004) * .7});                     // Chorus-Verdopplung
        if (S.echo) tone(echoBuf, t, dur, hz(m), S.lead * S.echo * (up ? .8 : 1), .45, lead, o);
        if (up) tone(mel, t, dur, hz(n.m - 12 >= 55 ? n.m - 12 : n.m), S.lead * .35, .25, 'pulse', {duty: .5, d: .1, s: .6});
        if (sec === 'B' || up) tone(mel, t, dur, hz(harmony(m, c)), S.lead * .4, .32, 'pulse', {duty: .5, d: .1, s: .65, vib: .003});   // Gegenstimme
        if (n.len >= 3 && !S.leadKind && S.steel === undefined) tone(mel, t - .03, .03, hz(m - 1), S.lead * .5, -.15, 'pulse', {duty: S.duty, a: .002, d: .02, s: .6, r: .01});   // kleiner Vorschlag vor langen Toenen
      }
      const tones = c.iv.map(i => 60 + c.root + i);
      // ---- Arpeggio
      if (S.arp) {
        const steps = S.arp === 16 ? per * 2 : per, st = barLen / steps;
        for (let k = 0; k < steps; k++) {const m = tones[k % tones.length] + (Math.floor(k / tones.length) % 2 ? 12 : 0);
          tone(mel, bar0 + k * st, st * .7, hz(m), sec === 'B' || up ? .068 : .055, .35, 'pulse', {duty: S.arpDuty || .25, d: .05, s: .4, r: .02});}
      }
      if (S.pad) for (const m of tones) tone(mel, bar0, barLen * .98, hz(m - 12), S.pad, .0, 'organ', {a: .15, d: .3, s: .8, r: .2});
      // ---- Bass
      const bm = 36 + c.root + (c.root > 4 ? -12 : 0) + 12;
      const B = (e, m, len = 1, v = .32) => {const t = at(bar0, e), d = len * eighth * .72; tone(rhy, t, d, hz(m), v, 0, 'tri', {a: .003, d: .045, s: .68, r: .025}); tone(rhy, t, d * .8, hz(m), v * .19, 0, 'pulse', {duty: .25, a: .004, d: .04, s: .35, r: .02});};
      const stab = (e, len = 1) => {for (const m of tones) tone(mel, at(bar0, e), len * eighth * .55, hz(m), .045, .2, 'pulse', {duty: .5, d: .05, s: .5, r: .02});};
      const fifth = bm + 7, third = bm + c.iv[1];
      const nroot = b < 7 ? X.ch[b + 1] : next.ch[0];
      const nb = 36 + nroot.root + (nroot.root > 4 ? -12 : 0) + 12;
      switch (S.bass) {
        case 'drive': for (let q = 0; q < per / 2; q++) {const e = q * 2; B(e, bm, .9, .34); B(e + 1, bm + 12, .6, .26); if (q % 2) B(e + 1.5, bm, .4, .2);} break;   // Puls: Grundton, Oktave, Synkope
        case 'gallop': for (let q = 0; q < per; q += 2) {B(q, bm, 1); B(q + 1, bm, .5); B(q + 1.5, bm + 12, .5);} break;
        case 'polka': for (let e = 0; e < per; e += 2) {B(e, e % 4 === 0 ? bm : fifth - 12, 1.35); stab(e + 1, .85);} break;
        case 'waltz': B(0, bm, 1.5, .34); B(2, fifth - 12, 1.2, .23); B(4, bm, 1.2, .25); for (const e of [1, 3, 5]) stab(e, .8); break;
        case 'walk': {const w = [bm, third, fifth, bm + 9]; for (let q = 0; q < per / 2; q++) B(q * 2, w[q % 4], 1.8, .3); if (S.stabs) {stab(2); stab(6);} break;}
        case 'calypso': B(0, bm, 2); B(3, fifth - 12, 1); B(4, bm, 2); B(7, fifth - 12, 1); stab(1); stab(3); stab(5); stab(7); break;
        case 'long': for (let e = 0; e < per; e++) B(e, e % 2 ? bm + 12 : bm, .8, .26); break;
      }
      // Leitton in den naechsten Akkord (jeder zweite Takt)
      if (per === 8 && b % 2 === 1 && ['drive', 'gallop', 'long'].includes(S.bass) && nb !== bm) B(per - .5, nb + (nb > bm ? -1 : 1), .45, .24);
      // ---- Schlagzeug: Viervierteltakt-Kick, Backbeat mit Klatschen, offene Hats auf den Gegenschlaegen, Synkopen, Crash und Aufbau
      const beats = per / 2;
      for (let q = 0; q < beats; q++) {
        const e = q * 2; kickD(at(bar0, e), q === 0 ? .6 : .5);
        if (S.drums === 'waltz') {if (q > 0) snare(rhy, at(bar0, e), .16);}
        else if (q % 2) {snare(rhy, at(bar0, e), .32); noise(rhy, at(bar0, e), .08, .09, 9000, .12, 45);}
      }
      for (let e = 0; e < per; e++) hat(rhy, at(bar0, e), e % 2 ? .095 : .055);
      if (straight) {
        for (let e = 0; e < per; e++) hat(rhy, at(bar0, e + .5), .03);
        for (let e = 1; e < per; e += 2) noise(rhy, at(bar0, e), .13, .045, 26000, .25, 20);       // offene Hat auf dem Gegenschlag
        if (b % 2 === 1 && per === 8) kickD(at(bar0, 5), .3);                                       // Synkope
      }
      if (['calypso', 'swing', 'polka'].includes(S.drums)) kickD(at(bar0, per - 1), .23);
      if (b === 0 && si > 0) noise(rhy, t0, .9, .11, 22000, .1, 5);                                  // Crash am Abschnittsanfang
      if (last) {
        riser(rhy, bar0 + barLen * .45, barLen * .55, straight ? .1 : .06);
        for (let k = 0; k < 4; k++) {const e = per - 2 + k * .5; snare(rhy, at(bar0, e), .14 + k * .02); if (k > 1) tom(rhy, at(bar0, e), 180 - k * 22, .12);}
      }
    }
  });
  // ---- Echo (3/16 spaeter) in die Melodie
  const dly = Math.floor(beat * .75 * SR);
  for (let i = 0; i < echoBuf.n; i++) {if (i + dly < mel.n) {mel.L[i + dly] += echoBuf.R[i] * .8; mel.R[i + dly] += echoBuf.L[i];}}
  // ---- Sidechain: Melodie und Flaeche duecken kurz bei jedem Kick (Pumpen, das den Takt nach vorn treibt)
  const duck = new Float32Array(mel.n).fill(1), span = Math.floor(.22 * SR);
  for (const t of kicks) {const i0 = Math.floor(t * SR); for (let k = 0; k < span && i0 + k < mel.n; k++) {const g = 1 - .3 * Math.exp(-k / SR / .075); if (g < duck[i0 + k]) duck[i0 + k] = g;}}
  const mix = new Mix(total + 1.5);
  for (let i = 0; i < mix.n; i++) {mix.L[i] = rhy.L[i] + mel.L[i] * duck[i]; mix.R[i] = rhy.R[i] + mel.R[i] * duck[i];}
  // ---- Nahtloser Loop: Ausklang nach dem Ende auf den Anfang falten
  const n = Math.floor(total * SR);
  for (let i = n; i < mix.n; i++) {mix.L[i - n] += mix.L[i]; mix.R[i - n] += mix.R[i];}
  // ---- Weichzeichnen, sanft begrenzen, normalisieren
  const out = new Int16Array(n * 2); let pk = 0, l = 0, r = 0; const a = .55;
  const Lb = new Float32Array(n), Rb = new Float32Array(n);
  for (let i = 0; i < n; i++) {l += a * (mix.L[i] - l); r += a * (mix.R[i] - r); Lb[i] = Math.tanh(l * 1.3); Rb[i] = Math.tanh(r * 1.3); pk = Math.max(pk, Math.abs(Lb[i]), Math.abs(Rb[i]));}
  let energy = 0; for (let i = 0; i < n; i++) energy += Lb[i] * Lb[i] + Rb[i] * Rb[i];
  const rms = Math.sqrt(energy / (n * 2));
  const g = Math.min(.82 / (pk || 1), .17 / (rms || 1));
  for (let i = 0; i < n; i++) {out[i * 2] = Math.round(Lb[i] * g * 32767); out[i * 2 + 1] = Math.round(Rb[i] * g * 32767);}
  return {pcm: out, secs: total, title: S.title, bpm: S.bpm, loopEnd: n / SR, peak: pk * g, rms: rms * g};
}

function wav(pcm) {
  const data = Buffer.from(pcm.buffer), h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

const outDir = process.argv[2] || '.scratch/driving-music';
mkdirSync(outDir, {recursive: true});
const want = process.argv.slice(3).length ? process.argv.slice(3) : Object.keys(SONGS).filter(k => !SKIP.has(k));
const report = {};
for(const k of want){lfsr=1;const r=render(k),tailFrames=Math.round(2.2*SR),pcm=new Int16Array(r.pcm.length+tailFrames*2);pcm.set(r.pcm);pcm.set(r.pcm.subarray(0,tailFrames*2),r.pcm.length);const f=path.join(outDir,'bgm_'+k+'.wav');writeFileSync(f,wav(pcm));report[k]={title:r.title,bpm:r.bpm,loopEnd:r.loopEnd,loopTail:2.2,secs:pcm.length/(SR*2),peak:r.peak,rms:r.rms,file:f};console.log(k,r.bpm+' BPM',r.loopEnd.toFixed(2)+'s + copied head');}
writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 1));
