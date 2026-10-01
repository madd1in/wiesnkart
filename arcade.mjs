// Wiesn Kart R72: Arcade-Paket (reine Logik, getestet in arcade.test.mjs).
// Umschaltbare Kameraansichten wie am Automaten und Speed-Traps wie im Strassenrennen.
// (Die Beifahrer-Ansagen der ersten R72-Fassung sind auf Nutzerwunsch wieder entfernt: zu viel Text im Bild.)
// Streckenmeter laufen von 0 bis length und schliessen sich zur Runde.

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

// ---------------------------------------------------------------- Knapp vorbei (R74): Ueberholen auf Tuchfuehlung gibt einen kleinen Schub
export const NEAR = {lateral: 3, minSpeed: 16, boost: .45, cooldown: 1.2};   // Querabstand Mitte zu Mitte: 3 m heisst rund ein Meter Luft zwischen den Karts

/**
 * Hat der Spieler einen Gegner gerade knapp ueberholt?
 * gapPrev/gap: Spieler minus Gegner in Streckenmetern (vorher/jetzt), lateral: Querabstand in Metern, speed: Spielertempo.
 * Spruenge (Zuruecksetzen, Rundennaht) zaehlen nicht.
 */
export function nearMiss(gapPrev, gap, lateral, speed) {
  return Number.isFinite(gapPrev) && Number.isFinite(gap) && gapPrev < 0 && gap >= 0 && gap - gapPrev < 6 &&
    Math.abs(lateral) < NEAR.lateral && Math.abs(speed) >= NEAR.minSpeed;
}
