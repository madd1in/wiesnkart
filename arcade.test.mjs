import test from 'node:test';
import assert from 'node:assert/strict';
import {angDiff, wrapD, CAM_VIEWS, camViewIndex, nextCamView, cornerSeverity, findCorners, noteAhead, noteLabel, lookAhead,
  TRAP_AT, trapCrossed, trapGrade} from './arcade.mjs';

const TAU = Math.PI * 2;
// Rundkurs aus Geraden und Kurven: Liste von [Meter, Gesamtdrehung] je Abschnitt, ds = 8 m.
// Ein langer, flacher Rueckweg dreht die Strecke zurueck auf 0, damit sich die Runde ohne Sprung schliesst.
function heads(parts, ds = 8) {
  const out = [];
  let h = 0;
  const total = parts.reduce((a, [, t]) => a + t, 0);
  for (const [len, turn] of [...parts, [4000, -total]]) {
    const n = Math.round(len / ds);
    for (let i = 0; i < n; i++) { out.push(h); h += turn / n; }
  }
  return out;
}
const rot = (a, k) => [...a.slice(k), ...a.slice(0, k)];

test('Winkel und Meter laufen rundenfest', () => {
  assert.ok(Math.abs(angDiff(.1, TAU - .1) - .2) < 1e-9);
  assert.ok(Math.abs(angDiff(TAU - .1, .1) + .2) < 1e-9);
  assert.equal(wrapD(-10, 100), 90);
  assert.equal(wrapD(250, 100), 50);
});

test('Kameraansichten wechseln reihum und fangen ungueltige Werte ab', () => {
  assert.equal(CAM_VIEWS.length, 3);
  assert.equal(nextCamView(0), 1);
  assert.equal(nextCamView(2), 0);
  assert.equal(camViewIndex(7), 0);
  assert.equal(camViewIndex('x'), 0);
  assert.ok(CAM_VIEWS[2].back < CAM_VIEWS[0].back && CAM_VIEWS[1].back > CAM_VIEWS[0].back);
});

test('Schaerfegrade nach Radius: Haarnadel 1 bis sanft 6', () => {
  assert.equal(cornerSeverity(15), 1);
  assert.equal(cornerSeverity(25), 2);
  assert.equal(cornerSeverity(32), 3);
  assert.equal(cornerSeverity(40), 4);
  assert.equal(cornerSeverity(55), 5);
  assert.equal(cornerSeverity(100), 6);
  assert.equal(cornerSeverity(Infinity), 6);
});

test('findCorners trennt Links- und Rechtskurven und misst Anfang, Laenge, Drehung', () => {
  // 200 m gerade, 80 m Linkskurve 90 Grad, 160 m gerade, 64 m Rechtshaarnadel 180 Grad, 200 m gerade, Rest schliesst die Runde
  const parts = [[200, 0], [80, Math.PI / 2], [160, 0], [64, -Math.PI], [200, 0]];
  const h = heads(parts);
  const c = findCorners(h, 8);
  assert.equal(c.length, 2);
  assert.equal(c[0].dir, 'L');
  assert.equal(c[0].d, 200);
  assert.ok(Math.abs(c[0].turn - Math.PI / 2) < .05);
  assert.equal(c[0].sev, 5); // 90 Grad auf 80 m: Radius um 51 m
  assert.ok(c[0].radius > 45 && c[0].radius < 58);
  assert.equal(c[0].long, false);
  assert.equal(c[1].dir, 'R');
  assert.equal(c[1].sev, 1);
  assert.equal(c[1].d, 440);
});

test('Ein langer weiter Bogen ist keine Haarnadel, sondern lang und sanft', () => {
  // 262 Grad auf 318 m: Radius um 70 m
  const c = findCorners(heads([[160, 0], [320, 4.57], [160, 0]]), 8);
  assert.equal(c.length, 1);
  assert.equal(c[0].long, true);
  assert.equal(c[0].sev, 6); // Radius ~70 m
});

test('findCorners: Gerade ergibt nichts, Schlangenlinie wird getrennt, Lauf ueber die Rundennaht bleibt ganz', () => {
  assert.deepEqual(findCorners(heads([[400, 0]]), 8), []);
  const s = findCorners(heads([[160, 0], [48, .8], [48, -.8], [160, 0]]), 8);
  assert.equal(s.length, 2);
  assert.equal(s[0].dir, 'L');
  assert.equal(s[1].dir, 'R');
  // Kurve beginnt kurz vor dem Rundenende und endet kurz danach
  const seam = findCorners(rot(heads([[8 * 6, 0], [80, .9], [8 * 6, 0]]), 8 * 0 + 8), 8); // Kurve beginnt vor Index 0
  assert.equal(seam.length, 1);
  assert.ok(Math.abs(seam[0].turn - .9) < .06);
  assert.equal(seam[0].len, 80);
  const wrapped = findCorners(rot(heads([[8 * 6, 0], [80, .9], [8 * 6, 0]]), 8 * 8), 8); // Kurve laeuft ueber die Naht
  assert.equal(wrapped.length, 1);
  assert.ok(Math.abs(wrapped[0].turn - .9) < .06);
  const lone = findCorners(heads([[8 * 5, 0], [80, 1.0], [8 * 5, 0]]), 8);
  assert.equal(lone.length, 1);
  assert.ok(Math.abs(lone[0].turn - 1.0) < .06);
});

test('Ueberbrueckte Luecke zaehlt zu einer Kurve, grosse Luecke trennt', () => {
  const near = findCorners(heads([[160, 0], [40, .6], [8, 0], [40, .6], [160, 0]]), 8);
  assert.equal(near.length, 1);
  const far = findCorners(heads([[160, 0], [40, .6], [48, 0], [40, .6], [160, 0]]), 8);
  assert.equal(far.length, 2);
});

test('noteAhead meldet die naechste Kurve im Horizont, innen mit Distanz 0, mit Folgekurve', () => {
  const notes = [
    {d: 200, len: 80, turn: 1.5, sev: 2, dir: 'L'},
    {d: 300, len: 60, turn: -1, sev: 3, dir: 'R'},
    {d: 700, len: 60, turn: .5, sev: 5, dir: 'L'},
  ];
  const L = 1000;
  const far = noteAhead(notes, 0, L, 150);
  assert.equal(far, null);
  const a = noteAhead(notes, 100, L, 150);
  assert.equal(a.note, notes[0]);
  assert.equal(a.dist, 100);
  assert.equal(a.inside, false);
  assert.equal(a.then, notes[1]);
  const inside = noteAhead(notes, 230, L, 150);
  assert.equal(inside.inside, true);
  assert.equal(inside.dist, 0);
  // Rundennaht: bei Meter 950 liegt die Kurve bei 200 ueber die Naht voraus
  const seam = noteAhead(notes, 950, L, 300);
  assert.equal(seam.note, notes[0]);
  assert.equal(seam.dist, 250);
  assert.equal(noteAhead([], 5, L, 100), null);
});

test('noteLabel spiegelt Richtung im Spiegelmodus und erkennt Haarnadeln', () => {
  const l = noteLabel({dir: 'L', sev: 4});
  assert.equal(l.word, 'LINKS');
  assert.equal(l.arrow, '◄');
  assert.equal(l.hairpin, false);
  const m = noteLabel({dir: 'L', sev: 1}, true);
  assert.equal(m.word, 'RECHTS');
  assert.equal(m.arrow, '►');
  assert.equal(m.hairpin, true);
});

test('Ansagehorizont waechst mit dem Tempo und bleibt begrenzt', () => {
  assert.equal(lookAhead(0), 70);
  assert.ok(lookAhead(40) > lookAhead(20));
  assert.equal(lookAhead(500), 170);
  assert.equal(lookAhead(-40), lookAhead(40));
});

test('Speed-Trap: Durchfahrt wird genau einmal erkannt, auch ueber die Rundennaht', () => {
  const L = 1000;
  assert.equal(trapCrossed(298, 302, 300, L), true);
  assert.equal(trapCrossed(302, 306, 300, L), false);
  assert.equal(trapCrossed(290, 296, 300, L), false);
  assert.equal(trapCrossed(998, 4, 1, L), true);
  assert.equal(trapCrossed(4, 998, 1, L), false); // rueckwaerts
  assert.equal(trapCrossed(0, 600, 300, L), false); // Sprung (Respawn) zaehlt nicht
  assert.deepEqual(TRAP_AT.length, 2);
  assert.ok(TRAP_AT.every(x => x > .1 && x < .9));
});

test('Speed-Trap-Urteil: erste Messung, Rekord, kein Rekord', () => {
  assert.deepEqual(trapGrade(150.4, null), {kmh: 150, record: true, text: 'ERSTE MESSUNG', cls: 'rec'});
  assert.equal(trapGrade(171, 160).record, true);
  assert.equal(trapGrade(171, 160).text, 'NEUER REKORD');
  const no = trapGrade(150, 160);
  assert.equal(no.record, false);
  assert.equal(no.text, 'REKORD 160');
});
