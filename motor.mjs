// Wiesn Kart R74: Motorklang mit Gangwechseln (reine Logik, getestet in motor.test.mjs).
// Statt einer Tonhoehe, die mit dem Tempo einfach steigt, dreht der Motor in jedem Gang hoch und faellt beim Hochschalten
// wieder ab - das klingt nach Automaten-Rennspiel und gibt dem Beschleunigen einen Rhythmus.

/** Ganggrenzen in m/s (Anzeige x 3,6 = km/h). Der letzte Gang reicht bis zum Ende. */
export const GEARS = [0, 8, 15, 22, 29, 36];

/** Gang zum Tempo (0 = erster Gang). */
export function gearOf(speed) {
  const sp = Math.abs(speed) || 0;
  let g = 0;
  while (g < GEARS.length - 1 && sp >= GEARS[g + 1]) g++;
  return g;
}

/** Drehzahl im Gang, 0 = gerade geschaltet, 1 = Schaltpunkt (im letzten Gang darf sie etwas darueber). */
export function rpmOf(speed) {
  const sp = Math.abs(speed) || 0, g = gearOf(sp), lo = GEARS[g];
  const hi = g < GEARS.length - 1 ? GEARS[g + 1] : lo + 10;
  return Math.max(0, Math.min(1.15, (sp - lo) / (hi - lo)));
}

/**
 * Klangwerte fuer den Motor: zwei Oszillatoren (f1, f2 eine Oktave tiefer) und die Grenzfrequenz des Tiefpasses.
 * In der Luft heult der Motor auf, beim Turbo klingt er heller.
 */
export function engineNote(speed, {air = false, boost = false} = {}) {
  const g = gearOf(speed), rpm = rpmOf(speed);
  const f1 = 62 + g * 7 + rpm * 95 + (air ? 45 : 0) + (boost ? 25 : 0);
  return {gear: g, rpm, f1, f2: f1 / 2, cutoff: 520 + rpm * 1400 + g * 180 + (boost ? 600 : 0)};
}

/** Wurde hochgeschaltet? (nur nach oben, nur ein Gang Abstand oder mehr) */
export function shiftedUp(prevGear, gear) {
  return Number.isInteger(prevGear) && gear > prevGear;
}
