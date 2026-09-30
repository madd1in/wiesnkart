// R62: die Intro-Fanfare des Spiels (FANFARE in game.js) und die Ampel-Pieptoene als WAV fuer das Update-Video.
// Aufruf: node art/r62/fanfare_wav.mjs <Ausgabeordner>
import {writeFileSync, mkdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
const SR = 44100, out = process.argv[2] || '.scratch/r62-audio';
mkdirSync(out, {recursive: true});
const src = readFileSync('game.js', 'utf8'), m = /const FANFARE=\[([\s\S]*?)\];/.exec(src);
const NOTES = JSON.parse('[' + m[1].replace(/\/\/[^\n]*/g, '').replace(/'/g, '"') + ']');
const hz = n => 440 * 2 ** ((n - 69) / 12);
function render(sec, fill) {const L = new Float32Array(Math.ceil(sec * SR)); fill(L); let pk = 0; for (const v of L) pk = Math.max(pk, Math.abs(v)); const g = .85 / (pk || 1);
  const pcm = new Int16Array(L.length * 2); for (let i = 0; i < L.length; i++) {const v = Math.round(Math.tanh(L[i] * g) * 32767); pcm[i * 2] = v; pcm[i * 2 + 1] = v;} return pcm;}
function tone(L, t, d, f, vol, kind, duty = .5) {const i0 = Math.floor(t * SR), n = Math.floor(d * SR); let ph = 0;
  for (let k = 0; k < n && i0 + k < L.length; k++) {const tt = k / SR, e = tt < .012 ? tt / .012 : tt > d * .8 ? Math.max(0, (d * .98 - tt) / (d * .18)) : .8; ph = (ph + f / SR) % 1;
    const v = kind === 'tri' ? Math.round((1 - 4 * Math.abs(ph - .5)) * 7.5) / 7.5 : (ph < duty ? 1 : -1); L[i0 + k] += v * vol * e;}}
function noise(L, t, d, vol) {const i0 = Math.floor(t * SR), n = Math.floor(d * SR); for (let k = 0; k < n && i0 + k < L.length; k++) L[i0 + k] += (Math.random() * 2 - 1) * vol * Math.exp(-k / SR / (d / 4));}
function wav(pcm) {const data = Buffer.from(pcm.buffer), h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40); return Buffer.concat([h, data]);}
const E = 60 / 160 / 2;
writeFileSync(path.join(out, 'fanfare.wav'), wav(render(27 * E + 1.3, L => {
  for (const [v, st, len, n] of NOTES) tone(L, st * E, len * E, hz(n), v === 'L' ? .085 : v === 'H' ? .045 : .11, v === 'B' ? 'tri' : 'pulse', v === 'L' ? .25 : .5);
  for (const st of [0, 3, 6, 9, 12, 15]) noise(L, st * E, .12, .1);
  for (let k = 0; k < 6; k++) noise(L, (18 + k * .5) * E, .08, .05 + k * .01);
  noise(L, 21 * E, 1.2, .12);})));
writeFileSync(path.join(out, 'beep.wav'), wav(render(.25, L => tone(L, 0, .17, 440, .3, 'pulse'))));
writeFileSync(path.join(out, 'go.wav'), wav(render(.7, L => {tone(L, 0, .62, 880, .3, 'pulse'); tone(L, 0, .62, 1760, .07, 'pulse');})));
console.log('ok', NOTES.length, 'Noten');
