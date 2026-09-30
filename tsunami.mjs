// Wiesn Kart R61: Tsunami-Phase der Schildkroeten-Bucht (Nutzerwunsch) - reine Funktionen, Tests in tsunami.test.mjs.
// Ablauf ab Ausloesung (Rennzeit): Warnung mit Sirene -> Riesenwelle rollt ueber die Insel, das Wasser steigt -> Flut: alle
// Karts sind Wave-Rider (schneller, weniger Seitenhalt) -> das Wasser laeuft ab. Laeuft nach der Rennzeit, damit alle
// Online-Mitspieler dieselbe Phase sehen.
export const TSU = Object.freeze({warn: 3.5, wave: 3.5, flood: 22, recede: 4, speed: 1.05, grip: .8});
/** Phase zur Zeit dt (Sekunden seit Ausloesung): phase warn|wave|flood|recede|off, k = Anteil der Phase, water 0..1. */
export function tsunamiPhase(dt) {
  if (!(dt >= 0)) return {phase: 'off', k: 0, water: 0};
  let t = dt;
  if (t < TSU.warn) return {phase: 'warn', k: t / TSU.warn, water: 0};
  t -= TSU.warn;
  if (t < TSU.wave) return {phase: 'wave', k: t / TSU.wave, water: t / TSU.wave};
  t -= TSU.wave;
  if (t < TSU.flood) return {phase: 'flood', k: t / TSU.flood, water: 1};
  t -= TSU.flood;
  if (t < TSU.recede) return {phase: 'recede', k: t / TSU.recede, water: 1 - t / TSU.recede};
  return {phase: 'off', k: 1, water: 0};
}
/** Fahren die Karts gerade als Wave-Rider? (ab der zweiten Haelfte der Welle bis zur Mitte des Ablaufens) */
export const tsunamiSurf = ph => ph.phase === 'flood' || (ph.phase === 'wave' && ph.k > .55) || (ph.phase === 'recede' && ph.k < .5);
/** Gesamtdauer von Ausloesung bis Ende. */
export const tsunamiLength = () => TSU.warn + TSU.wave + TSU.flood + TSU.recede;
/** Lage der Wellenfront (m, entlang der Laufrichtung) waehrend der Welle: von -span bis +span. */
export const waveFront = (ph, span) => ph.phase === 'wave' ? -span + 2 * span * ph.k : null;
