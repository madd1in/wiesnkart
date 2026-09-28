// Besen-Zauberer (R53, Geisterhaus; R54 eigener Wiesn-Zauberer): fliegt in seinem Abschnitt vor dem Spieler her und wirft
// Zauber-Formen auf die Strasse. Gelandete Formen bleiben kurz liegen - wer hineinfaehrt, dreht sich.
// Reine Logik ohne Renderer (Abschnitt, Wurfbahn, Zielwahl, Treffer), getestet in wizard.test.mjs.
export const WIZARD = Object.freeze({
  lead: 21,        // Meter vor dem Spieler
  height: 5.6,     // Flughoehe ueber der Strasse
  sway: 5,         // seitliches Pendeln (m)
  castMin: 2.6,    // Sekunden zwischen zwei Wuerfen
  castMax: 3.8,
  warmup: 1.4,     // erster Wurf erst nach dem Auftauchen
  flight: .95,     // Flugzeit eines Zaubers
  apex: 4.5,       // Buckel der Wurfbahn
  life: 3.2,       // so lange liegt ein gelandeter Zauber
  hitAlong: 1.7,   // Trefferfenster entlang der Strecke
  hitSide: 1.6,    // und quer dazu
  ahead: 15,       // Ziel: so weit vor dem Kart (plus Tempoanteil)
  aheadPerSpeed: .25,
  spread: 2.2,     // Streuung quer zur Fahrspur
  maxSpells: 4,
});

const wrap = (d, L) => ((d % L) + L) % L;

/** Liegt Streckenmeter d im Abschnitt [s, e] (auch ueber die Ziellinie hinweg)? */
export function inSection(sec, d, L) {
  const s = wrap(sec[0], L), e = wrap(sec[1], L), x = wrap(d, L);
  return s <= e ? x >= s && x <= e : x >= s || x <= e;
}

/** Wartezeit bis zum naechsten Wurf, rnd in [0, 1). */
export function castInterval(rnd) {
  const r = Number.isFinite(rnd) ? Math.min(1, Math.max(0, rnd)) : .5;
  return WIZARD.castMin + (WIZARD.castMax - WIZARD.castMin) * r;
}

/** Zielpunkt vor einem Kart auf dessen Spur, leicht gestreut und auf der Fahrbahn gehalten. */
export function pickTarget(racer, rnd, roadHalf = 8.2) {
  const r = Number.isFinite(rnd) ? rnd : .5;
  const base = Number.isFinite(racer.offset) ? racer.offset : 0;
  const off = Math.max(-roadHalf, Math.min(roadHalf, base + (r * 2 - 1) * WIZARD.spread));
  const speed = Number.isFinite(racer.speed) ? Math.max(0, racer.speed) : 0;
  return { d: racer.distance + WIZARD.ahead + speed * WIZARD.aheadPerSpeed, off };
}

/** Position auf der Wurfbahn t Sekunden nach dem Wurf: gerade vom Stab zum Ziel plus Parabel-Buckel. */
export function spellPos(from, to, t, out = {}) {
  const k = Math.max(0, Math.min(1, t / WIZARD.flight));
  out.x = from.x + (to.x - from.x) * k;
  out.z = from.z + (to.z - from.z) * k;
  out.y = from.y + (to.y - from.y) * k + WIZARD.apex * 4 * k * (1 - k);
  out.landed = k >= 1;
  return out;
}

/** Zauber altern lassen; liefert 'fly', 'lie' oder 'gone'. */
export function stepSpell(spell, dt) {
  spell.age = (spell.age || 0) + (Number.isFinite(dt) ? Math.max(0, dt) : 0);
  if (spell.age < WIZARD.flight) return 'fly';
  spell.landed = true;
  return spell.age - WIZARD.flight <= WIZARD.life ? 'lie' : 'gone';
}

/** Trifft ein gelandeter Zauber das Kart? Karts in der Luft fliegen darueber hinweg. */
export function spellHits(spell, racer, L) {
  if (!spell.landed || spell.gone || racer.air) return false;
  if ((spell.age || 0) - WIZARD.flight > WIZARD.life) return false;
  let dd = racer.distance - spell.d;
  if (L > 0) { dd = wrap(dd, L); if (dd > L / 2) dd -= L; }
  return Math.abs(dd) < WIZARD.hitAlong && Math.abs((racer.offset || 0) - spell.off) < WIZARD.hitSide;
}
