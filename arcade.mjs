// Wiesn Kart R72: Arcade-Paket (reine Logik, getestet in arcade.test.mjs).
// Rallye-Beifahrer (Kurvenansagen), umschaltbare Kameraansichten wie am Automaten, Speed-Traps wie im Strassenrennen.
// Alle Winkel in Bogenmass, Streckenmeter laufen von 0 bis length und schliessen sich zur Runde.

const TAU = Math.PI * 2;

/** Kleinste Winkeldifferenz a-b in (-PI, PI]. */
export function angDiff(a, b) {
  let d = (a - b) % TAU;
  if (d > Math.PI) d -= TAU;
  else if (d <= -Math.PI) d += TAU;
  return d;
}

/** Streckenmeter auf [0, length). */
export function wrapD(d, length) {
  return ((d % length) + length) % length;
}

// ---------------------------------------------------------------- Kameraansichten (Taste C)
// back/up skalieren Abstand und Hoehe der Verfolgerkamera, fov ist ein Zuschlag in Grad.
export const CAM_VIEWS = [
  {id: 'chase', name: 'VERFOLGER', back: 1, up: 1, fov: 0},
  {id: 'far', name: 'WEIT', back: 1.55, up: 1.4, fov: -2},
  {id: 'low', name: 'NAH & TIEF', back: .52, up: .58, fov: 6},
];

export function camViewIndex(i) {
  return Number.isInteger(i) && i >= 0 && i < CAM_VIEWS.length ? i : 0;
}

export function nextCamView(i) {
  return (camViewIndex(i) + 1) % CAM_VIEWS.length;
}

// ---------------------------------------------------------------- Beifahrer: Kurvenansagen
// Schaerfegrad 1 (Haarnadel) bis 6 (sanft) nach dem engsten Kurvenradius in Metern, wie die Zahlen der Rallye-Aufschriebe.
// Die Strecken des Spiels haben meist Radien um 32 m (Haarnadeln um 18 m, weite Boegen ab 45 m), darauf sind die Stufen geeicht.
const RADII = [[22, 1], [29.5, 2], [36, 3], [48, 4], [65, 5]];

export function cornerSeverity(radius) {
  for (const [max, sev] of RADII) if (radius < max) return sev;
  return 6;
}

/**
 * Kurven einer geschlossenen Runde finden.
 * heads[i] ist die Fahrtrichtung bei i*ds (atan2(x, z)); ein positiver Zuwachs ist eine Linkskurve.
 * Aufeinanderfolgende Abschnitte mit genug Drehung bilden eine Kurve, kleine Luecken (gapFill Messpunkte)
 * werden ueberbrueckt, ein Vorzeichenwechsel beginnt eine neue Kurve.
 * Der Schaerfegrad kommt vom engsten Radius der Kurve (staerkste Drehung auf etwa 24 m), nicht von der Gesamtdrehung:
 * ein langer, weiter Bogen ist keine Haarnadel. long markiert Kurven ab 150 m Laenge.
 * @returns {{d:number,len:number,turn:number,radius:number,sev:number,long:boolean,dir:'L'|'R'}[]} nach d sortiert
 */
export function findCorners(heads, ds, {minRate = .004, minTurn = .22, gapFill = 2} = {}) {
  const n = heads.length;
  if (n < 4 || !(ds > 0)) return [];
  const dh = new Array(n), on = new Array(n);
  for (let i = 0; i < n; i++) {
    dh[i] = angDiff(heads[(i + 1) % n], heads[i]);
    on[i] = Math.abs(dh[i]) / ds >= minRate;
  }
  if (!on.some(Boolean)) return [];
  // Start an einer Stelle ohne Drehung, damit kein Lauf ueber die Rundennaht zerschnitten wird
  let s0 = on.indexOf(false);
  if (s0 < 0) s0 = 0;
  const runs = [];
  let cur = null;
  for (let k = 0; k < n; k++) {
    const i = (s0 + k) % n;
    if (on[i]) {
      const sg = Math.sign(dh[i]);
      if (cur && cur.sg !== sg) { runs.push(cur); cur = null; }
      if (!cur) cur = {i0: i, i1: i, sg, gap: 0};
      cur.i1 = i; cur.gap = 0;
    } else if (cur && ++cur.gap > gapFill) {
      runs.push(cur); cur = null;
    }
  }
  if (cur) runs.push(cur);
  const out = [];
  for (const r of runs) {
    // Drehung der Messpunkte von Anfang bis Ende aufsummieren (angehaengte Luecken zaehlen nicht mit)
    let turn = 0, count = 0;
    for (let i = r.i0, c = 0; c < n; c++, i = (i + 1) % n) {
      turn += dh[i]; count++;
      if (i === r.i1) break;
    }
    if (Math.abs(turn) < minTurn) continue;
    // engste Stelle: groesste Drehung ueber drei aufeinanderfolgende Messpunkte
    let peak = 0;
    for (let i = r.i0, c = 0; c < count; c++, i = (i + 1) % n) {
      const w = dh[i] + dh[(i + 1) % n] + dh[(i + 2) % n];
      peak = Math.max(peak, Math.abs(w) / (3 * ds));
    }
    const radius = peak > 0 ? 1 / peak : Infinity;
    out.push({d: r.i0 * ds, len: count * ds, turn, radius, sev: cornerSeverity(radius), long: count * ds >= 150, dir: turn > 0 ? 'L' : 'R'});
  }
  out.sort((a, b) => a.d - b.d);
  return out;
}

/**
 * Naechste Ansage zu einem Standort: die Kurve, in der man gerade ist, oder die naechste innerhalb von look Metern.
 * @returns {{note:object,dist:number,inside:boolean,then:object|null}|null}
 */
export function noteAhead(notes, d, length, look) {
  let best = null;
  for (const note of notes) {
    const ahead = wrapD(note.d - d, length);       // Meter bis zum Kurvenanfang
    const into = wrapD(d - note.d, length);        // Meter seit dem Kurvenanfang
    let dist, inside = false;
    if (into <= note.len) { dist = 0; inside = true; }
    else if (ahead <= look) dist = ahead;
    else continue;
    if (!best || dist < best.dist) best = {note, dist, inside, then: null};
  }
  if (!best) return null;
  // Folgekurve in Gegenrichtung kurz dahinter -> "dann ..."
  const end = best.note.d + best.note.len;
  for (const note of notes) {
    if (note === best.note) continue;
    const gap = wrapD(note.d - end, length);
    if (gap <= 40 && note.dir !== best.note.dir) { best.then = note; break; }
  }
  return best;
}

/** Anzeige einer Ansage. mirror vertauscht links/rechts, weil das Bild dann gespiegelt ist. */
export function noteLabel(note, mirror = false) {
  const left = (note.dir === 'L') !== !!mirror;
  return {
    dir: left ? 'L' : 'R',
    arrow: left ? '◄' : '►',
    word: left ? 'LINKS' : 'RECHTS',
    sev: note.sev,
    hairpin: note.sev === 1,
    long: !!note.long,
  };
}

/** Ansagehorizont in Metern: schneller -> frueher. */
export function lookAhead(speed) {
  return Math.max(70, Math.min(170, Math.abs(speed) * 2.6));
}

// ---------------------------------------------------------------- Speed-Traps
/** Wunschstellen der Blitzer auf einer Runde (Anteile der Streckenlaenge). */
export const TRAP_AT = [.31, .69];

/** Hat man das Tor bei gate zwischen prev und cur passiert (vorwaerts, rundenfest)? */
export function trapCrossed(prev, cur, gate, length) {
  const step = wrapD(cur - prev, length);
  if (step <= 0 || step > length / 4) return false;
  const to = wrapD(gate - prev, length);
  return to > 0 && to <= step;
}

/** Urteil zur gemessenen Geschwindigkeit (km/h) gegen die beste bisherige Messung. */
export function trapGrade(kmh, best) {
  const v = Math.round(kmh);
  if (!(best > 0)) return {kmh: v, record: true, text: 'ERSTE MESSUNG', cls: 'rec'};
  if (v > best) return {kmh: v, record: true, text: 'NEUER REKORD', cls: 'rec'};
  return {kmh: v, record: false, text: `REKORD ${Math.round(best)}`, cls: ''};
}
