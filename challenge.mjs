// Wiesn Kart R60: kleine Herausforderungen im Wiesnland (Nutzerwunsch "wie in grossen Open-World-Rennspielen"), reine
// Logik fuer Spiel und Tests (challenge.test.mjs). Vier Arten, je bis zu drei Sterne, die Bestleistung bleibt gespeichert:
//  Blitzer     Tempo an einem Punkt (km/h)            - Anlauf holen, Turbo kurz davor zuenden
//  Tempo-Zone  Durchschnittstempo ueber einen Abschnitt - sauber und schnell durch
//  Drift-Zone  Driftpunkte ueber einen Abschnitt       - lange Drifts, Turbo-Ketten erhoehen den Faktor
//  Sprung      Weite von Absprung bis Landung (m)      - Schanze mit Tempo treffen
export const CH = Object.freeze({
  trap: {name: 'Blitzer', icon: '📸', unit: 'km/h', stars: [100, 120, 138]},
  zone: {name: 'Tempo-Zone', icon: '⏱', unit: 'km/h', stars: [86, 100, 113]},
  drift: {name: 'Drift-Zone', icon: '💨', unit: 'Punkte', stars: [900, 1800, 2800]},
  jump: {name: 'Sprung', icon: '🪂', unit: 'm', stars: [20, 32, 44]},
});
export const KMH = 3.6, CHAIN_MAX = 4, CHAIN_STEP = .25;
// XP fuer jeden neu erreichten Stern (1., 2., 3.)
export const STAR_XP = [10, 15, 25];

export function starsFor(kind, v) {
  const s = CH[kind]?.stars;
  if (!s || !Number.isFinite(v)) return 0;
  return s.filter(x => v >= x).length;
}
/** XP fuer den Sprung von oldStars auf newStars (nur neu erreichte Sterne zaehlen). */
export function challengeXP(oldStars, newStars) {
  let xp = 0;
  for (let i = Math.max(0, oldStars | 0); i < Math.min(3, newStars | 0); i++) xp += STAR_XP[i];
  return xp;
}
/** Bestleistung fortschreiben (bei allen Arten gilt: mehr ist besser). */
export function recordBest(prev, v) {
  const p = Number.isFinite(prev) ? prev : null;
  if (!Number.isFinite(v)) return {best: p, fresh: false};
  return p === null || v > p ? {best: v, fresh: true} : {best: p, fresh: false};
}
export function fmt(kind, v) {
  if (!Number.isFinite(v)) return '—';
  if (kind === 'jump') return v.toFixed(1).replace('.', ',') + ' m';
  if (kind === 'drift') return Math.round(v).toLocaleString('de-DE') + ' Pkt';
  return Math.round(v) + ' km/h';
}
// Tempo-Zone: Weg und Zeit aufsummieren; Rueckwaerts zaehlt nicht
export const zoneState = () => ({t: 0, dist: 0});
export function zoneStep(s, dt, speed) {s.t += dt; s.dist += Math.max(0, speed) * dt; return s;}
export const zoneResult = s => s.t > 0 ? s.dist / s.t * KMH : 0;
// Drift-Zone: Punkte je Sekunde Drift ~ Tempo x 10, Faktor steigt mit jeder Turbo-Kette (Drift endet mit Turbo), Anecken setzt ihn zurueck
export const driftState = () => ({pts: 0, chain: 0, was: false});
export function driftStep(s, dt, {drifting, speed = 0, level = 0, crashed = false}) {
  if (crashed) s.chain = 0;
  if (drifting) s.pts += Math.max(0, speed) * dt * 10 * (1 + Math.min(s.chain, CHAIN_MAX) * CHAIN_STEP);
  else if (s.was) s.chain = level > 0 ? s.chain + 1 : 0;
  s.was = !!drifting;
  return s;
}
export const driftMul = s => 1 + Math.min(s.chain, CHAIN_MAX) * CHAIN_STEP;
// Sprung: Weite in der Ebene von der Absprungstelle bis zur Landung
export const jumpState = () => ({air: false, x0: 0, z0: 0, t: 0});
/** Liefert die Weite bei der Landung, sonst null. Kurze Hopser (unter minT s) zaehlen nicht. */
export function jumpStep(s, dt, air, x, z, minT = .35) {
  if (air && !s.air) {s.air = true; s.x0 = x; s.z0 = z; s.t = 0; return null;}
  if (air) {s.t += dt; return null;}
  if (s.air) {s.air = false; return s.t >= minT ? Math.hypot(x - s.x0, z - s.z0) : null;}
  return null;
}
