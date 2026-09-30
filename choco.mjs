// Wiesn Kart R61: Mechanik der Strecke Schoko-Matsch als reine Funktionen (Spiel und Tests, choco.test.mjs).
//  Schokomatsch-Pfuetzen: bremsen und nehmen Seitenhalt; mit Turbo gleitet man fast ungebremst hindurch.
//  Schokobrocken: warten wackelnd am Hang neben der Strasse, rollen dann quer ueber die Bahn und versinken
//    auf der anderen Seite im Schokofluss.
const frac = x => ((x % 1) + 1) % 1;

// ---------------------------------------------------------------- Pfuetzen
export const MUD = Object.freeze({slow: .66, grip: .78, boostSlow: .92});
/** Breitenprofil einer Pfuetze ueber ihre Laenge (u 0..1): vorn und hinten schmal, in der Mitte voll. */
export function mudShape(u) {
  if (!(u >= 0 && u <= 1)) return 0;
  return Math.sqrt(Math.sin(Math.PI * u));
}
/** Steht ein Kart mit Querversatz off rel Meter nach dem Pfuetzenanfang in der Pfuetze p = {len, off, hw}? */
export function onMud(p, rel, off) {
  if (!(rel >= 0 && rel <= p.len)) return false;
  return Math.abs(off - p.off) < p.hw * mudShape(rel / p.len);
}
/** Fahrbahn-Einfluss: Tempo- und Griffaenderung (Turbo haelt das Tempo fast). */
export const mudSurf = (on, boosting) => on ? {speedMul: boosting ? MUD.boostSlow : MUD.slow, gripMul: MUD.grip} : {speedMul: 1, gripMul: 1};
/** Ausweichlinie der KI: liegt die Wunschlinie in der Pfuetze, auf die nahere freie Seite (innerhalb der Strasse). */
export function mudDodge(line, p, lim = 6.2) {
  if (Math.abs(line - p.off) >= p.hw + 1) return line;
  const a = p.off - p.hw - 1.6, b = p.off + p.hw + 1.6, okA = a >= -lim, okB = b <= lim;
  if (okA && okB) return Math.abs(a - line) <= Math.abs(b - line) ? a : b;
  if (okA) return a;
  if (okB) return b;
  return line;   // Pfuetze ueber die ganze Breite: durch
}

// ---------------------------------------------------------------- Schokobrocken
// period s je Durchgang; wait s wackelt er oben (Vorwarnung), dann rollt er mit speed m/s von side*from nach -side*...
export const BOULDER = Object.freeze({period: 7.5, wait: 1.6, speed: 10.5, from: 17, to: -15, sink: .9, r: 1.45});
/** Zustand eines Brockens zur Zeit t: phase wait | roll | sink | gone, off = Querversatz, k = Anteil der Phase. */
export function boulderState(t, side, ph = 0, B = BOULDER) {
  const age = frac(t / B.period + ph) * B.period;
  if (age < B.wait) return {phase: 'wait', off: side * B.from, k: age / B.wait};
  const roll = age - B.wait, dur = (B.from - B.to) / B.speed;
  if (roll < dur) return {phase: 'roll', off: side * (B.from - B.speed * roll), k: roll / dur, v: -side * B.speed};
  const s = roll - dur;
  if (s < B.sink) return {phase: 'sink', off: side * B.to, k: s / B.sink};
  return {phase: 'gone', off: side * B.to, k: 1};
}
/** Trifft ein rollender Brocken ein Kart (Laengsabstand dd, Querversatz off)? */
export const boulderHits = (st, dd, off, B = BOULDER) => st.phase === 'roll' && Math.abs(dd) < B.r + .9 && Math.abs(off - st.off) < B.r + .8;
