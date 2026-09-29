// R60 Layout-Pruefung ohne Browser: glaettet die Kontrollpunkte wie smoothCurve im Spiel und meldet Laenge,
// engsten Radius und den kleinsten Abstand zwischen nicht benachbarten Streckenteilen (unter ~26 m ueberlappen die Strassen).
// Aufruf: node art/r60/layout.mjs [json-Datei mit {name:[[x,z],...]}] - ohne Argument die Strecken aus game.js ab Index 8.
import * as T from '../../vendor/three.module.js';
import {readFileSync} from 'node:fs';
const S = 1.35;
export function smooth(points, minR = 24, sharp = []) {
  const n0 = points.length, pts = [], corners = [];
  points.forEach(([x, z], i) => {const sh = sharp.find(q => q[0] === i); if (!sh) {pts.push([x, z]); return;} const a = points[(i - 1 + n0) % n0], c = points[(i + 1) % n0], k = sh[2] || 7, l1 = Math.hypot(x - a[0], z - a[1]), l2 = Math.hypot(c[0] - x, c[1] - z);
    pts.push([x - (x - a[0]) / l1 * k, z - (z - a[1]) / l1 * k], [x, z], [x + (c[0] - x) / l2 * k, z + (c[1] - z) / l2 * k]); corners.push([x * S, z * S, sh[1]]);});
  const base = new T.CatmullRomCurve3(pts.map(([x, z]) => new T.Vector3(x * S, 0, z * S)), true, 'catmullrom', .38); base.arcLengthDivisions = 3000;
  const n = 360; let p = base.getSpacedPoints(n).slice(0, n).map(v => [v.x, v.z]);
  const rad = (a, b, c) => {const ab = Math.hypot(b[0] - a[0], b[1] - a[1]), bc = Math.hypot(c[0] - b[0], c[1] - b[1]), ca = Math.hypot(a[0] - c[0], a[1] - c[1]), ar = Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) / 2; return ar < 1e-6 ? 1e9 : ab * bc * ca / (4 * ar);};
  const lim = p.map(([x, z]) => {let r = minR; for (const [cx, cz, cr] of corners) {const d = Math.hypot(x - cx, z - cz); if (d < 34) r = Math.min(r, cr + (minR - cr) * Math.max(0, (d - 18) / 16));} return r;});
  for (let it = 0; it < 400; it++) {let bad = false; const tight = new Uint8Array(n); for (let i = 0; i < n; i++) {const r = rad(p[(i - 3 + n) % n], p[i], p[(i + 3) % n]); if (r < lim[i]) bad = true; if (r < lim[i] * 1.25) for (let k = -8; k <= 8; k++) tight[(i + k + n) % n] = 1;} if (!bad) break; p = p.map((b, i) => {if (!tight[i]) return b; const a = p[(i - 1 + n) % n], c = p[(i + 1) % n]; return [b[0] + ((a[0] + c[0]) / 2 - b[0]) * .5, b[1] + ((a[1] + c[1]) / 2 - b[1]) * .5];});}
  const c = new T.CatmullRomCurve3(p.map(([x, z]) => new T.Vector3(x, 0, z)), true, 'centripetal'); c.arcLengthDivisions = 4000; return c;
}
export function report(name, points, sharp) {
  const c = smooth(points, 24, sharp), L = c.getLength(), N = 600, P = c.getSpacedPoints(N).slice(0, N);
  let minR = 1e9, at = 0;
  for (let i = 0; i < N; i++) {const a = P[(i - 4 + N) % N], b = P[i], d = P[(i + 4) % N]; const ab = a.distanceTo(b), bc = b.distanceTo(d), ca = d.distanceTo(a), ar = Math.abs((b.x - a.x) * (d.z - a.z) - (b.z - a.z) * (d.x - a.x)) / 2; const r = ar < 1e-6 ? 1e9 : ab * bc * ca / (4 * ar); if (r < minR) {minR = r; at = i / N * L;}}
  let minD = 1e9, pair = null;
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {const sep = Math.min(j - i, N - (j - i)) * L / N; if (sep < 90) continue; const d = P[i].distanceTo(P[j]); if (d < minD) {minD = d; pair = [Math.round(i / N * L), Math.round(j / N * L)];}}
  let maxR = 0; for (const v of P) maxR = Math.max(maxR, Math.hypot(v.x, v.z));
  // Kontrollpunkt -> Streckenmeter
  const cps = points.map(([x, z]) => {let best = 0, bd = 1e9; for (let i = 0; i < N; i++) {const d = Math.hypot(P[i].x - x * S, P[i].z - z * S); if (d < bd) {bd = d; best = i;}} return Math.round(best / N * L);});
  return {name, length: Math.round(L), minR: +minR.toFixed(1), minRAt: Math.round(at), minSep: +minD.toFixed(1), sepAt: pair, maxRadius: Math.round(maxR), cps};
}
if (import.meta.url === 'file://' + process.argv[1]) {
  const src = readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
  const arg = process.argv[2];
  const list = arg ? Object.entries(JSON.parse(readFileSync(arg, 'utf8'))).map(([name, v]) => ({name, points: v.points || v, sharp: v.sharp || []})) :
    [...src.matchAll(/\{name:'([^']+)',icon[^\n]*\n\s*points:(\[\[.*?\]\])[,\]]/g)].map(m => ({name: m[1], points: JSON.parse(m[2])}));
  for (const t of list) console.log(JSON.stringify(report(t.name, t.points, t.sharp)));
}
