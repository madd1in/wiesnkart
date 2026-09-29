// Wiesn Kart R60: Mechanik der drei neuen Strecken als reine Funktionen (Spiel und Tests, surface.test.mjs).
//  Schildkroeten-Bucht: Gezeiten - die Sandbank-Abkuerzung laeuft periodisch voll (Flut bremst), Brandungswellen rollen
//    vom Meer quer ueber die Strasse und schieben zur Landseite.
//  Eisstock-See: Glatteis - weniger Seitenhalt, der Drift laedt schneller; Eisstoecke gleiten quer ueber die Bahn,
//    Eisbloecke zerspringen beim Aufprall und wachsen nach.
//  Riesendom: Riesenwaechter holen mit der Hellebarde aus und schlagen quer ueber die Strasse (die ferne Spur bleibt frei).
const clamp01 = x => Math.min(1, Math.max(0, x));
const frac = x => ((x % 1) + 1) % 1;
const sstep = x => {x = clamp01(x); return x * x * (3 - 2 * x);};

// ---------------------------------------------------------------- Gezeiten
// period s je Ebbe-Flut-Zyklus; ab flood gilt die Sandbank als ueberflutet, ab warn (steigend) blinkt die Warnung
export const TIDE = Object.freeze({period: 26, flood: .6, warn: .35, slow: .62, grip: .7});
/** Wasserstand 0 (Ebbe) .. 1 (Flut) zur Zeit t: gekappte Sinuswelle, damit Ebbe und Flut je rund ein Drittel stehen. */
export function tideLevel(t, period = TIDE.period, phase = 0) {
  const u = frac(t / period + phase), raw = Math.sin(u * 2 * Math.PI - Math.PI / 2) * 1.7;
  return sstep((Math.max(-1, Math.min(1, raw)) + 1) / 2);
}
export const tideFlooded = lvl => lvl >= TIDE.flood;
/** Steigt das Wasser gerade (fuer Warnung und KI)? */
export const tideRising = (t, period = TIDE.period, phase = 0) => tideLevel(t + .25, period, phase) > tideLevel(t, period, phase) + 1e-4;
/** Ist die Sandbank in dt Sekunden (Ankunft) noch/schon trocken? Die KI nimmt die Abkuerzung nur, wenn sie trocken bleibt. */
export function tideDryFor(t, dur, period = TIDE.period, phase = 0) {
  for (let s = 0; s <= dur; s += .5) if (tideFlooded(tideLevel(t + s, period, phase))) return false;
  return true;
}

// ---------------------------------------------------------------- Brandung
// Welle: kommt alle period s vom Meer (side = Meerseite, +1 rechts / -1 links), laeuft mit speed m/s quer ueber die Bahn
export const SURF = Object.freeze({period: 5.2, speed: 9, from: 19, to: -12, half: 1.5, push: 7, keep: .72});
/** Lage der Wellenfront (Querversatz in m) oder null, wenn gerade keine Welle laeuft. */
export function surfFront(t, side, phase = 0, P = SURF) {
  const age = frac(t / P.period + phase) * P.period, travel = P.from - P.to, dur = travel / P.speed;
  if (age > dur) return null;
  return {off: side * (P.from - P.speed * age), age, k: age / dur};
}
/** Trifft die Welle ein Kart mit Querversatz off? */
export const surfHits = (front, off, P = SURF) => !!front && Math.abs(off - front.off) < P.half;

// ---------------------------------------------------------------- Glatteis
// grip: Seitenhalt-Faktor auf dem Eis, charge: schneller laden im Drift, accel: Anfahren dreht leicht durch
export const ICE = Object.freeze({grip: .42, charge: 1.35, accel: .82, aiCorner: .9});
export function iceSurf(onIce) {return onIce ? {gripMul: ICE.grip, chargeMul: ICE.charge, accelMul: ICE.accel} : {gripMul: 1, chargeMul: 1, accelMul: 1};}
/** Eisstock: gleitet weich zwischen -amp und +amp hin und her (Querversatz), dreht sich dabei. */
export function curlOff(t, amp, spd, ph = 0) {return amp * Math.sin(t * spd + ph);}
// Eisblock: zerspringt beim Aufprall, waechst nach regrow Sekunden nach (Groesse 0..1 waehrend grow)
export const BLOCK = Object.freeze({regrow: 7, grow: 1.2, keep: .55, stun: .35, r: 1.6});
export function blockScale(t, brokeAt) {
  if (brokeAt === null || brokeAt === undefined) return 1;
  const a = t - brokeAt - BLOCK.regrow;
  return a < 0 ? 0 : sstep(a / BLOCK.grow);
}

// ---------------------------------------------------------------- Riesenwaechter
// Zyklus: Ruhe, Ausholen (Augen gluehen = Warnung), Schlag quer ueber die Bahn, Liegen, Aufrichten.
// ang: 0 = Hellebarde senkrecht, PI/2 = flach quer ueber der Strasse (zeigt zur Gegenseite)
export const SENT = Object.freeze({cycle: 7, rest: 3.3, windup: 1.4, slam: .38, lie: .55, reach: 17.5, base: 14, band: 2.4});
export function sentinelState(t, ph = 0) {
  const u = frac((t + ph) / SENT.cycle) * SENT.cycle, a = SENT.rest, b = a + SENT.windup, c = b + SENT.slam, d = c + SENT.lie;
  if (u < a) return {phase: 'rest', ang: .08, warn: false, hot: false, u};
  if (u < b) {const k = (u - a) / SENT.windup; return {phase: 'windup', ang: .08 - .45 * sstep(k), warn: true, hot: false, u};}
  if (u < c) {const k = (u - b) / SENT.slam; return {phase: 'slam', ang: -.37 + (Math.PI / 2 + .37) * k * k, warn: true, hot: k > .72, u};}
  if (u < d) return {phase: 'lie', ang: Math.PI / 2, warn: false, hot: true, u};
  const k = (u - d) / (SENT.cycle - d);
  return {phase: 'recover', ang: Math.PI / 2 - (Math.PI / 2 - .08) * sstep(k), warn: false, hot: false, u};
}
/** Querbereich [von, bis] (m), den die liegende Hellebarde abdeckt. side = Seite des Waechters. */
export function sentinelSpan(side) {
  const a = side * SENT.base, b = side * (SENT.base - SENT.reach);
  return [Math.min(a, b), Math.max(a, b)];
}
/** Trifft der Schlag ein Kart (Laengsabstand dd zum Waechter, Querversatz off)? */
export function sentinelHits(st, side, dd, off) {
  if (!st.hot || Math.abs(dd) > SENT.band) return false;
  const [lo, hi] = sentinelSpan(side);
  return off >= lo - .9 && off <= hi + .9;
}
/** Wann (s ab t) schlaegt der Waechter das naechste Mal zu? Fuer KI-Vorausschau. */
export function sentinelNextHot(t, ph = 0) {
  for (let s = 0; s <= SENT.cycle; s += .05) if (sentinelState(t + s, ph).hot) return s;
  return SENT.cycle;
}
