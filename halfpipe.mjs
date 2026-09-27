// Halfpipe (R52): ein U-foermiger Abschnitt - flacher Boden, links und rechts Viertelkreis-Waende bis
// senkrecht. Wie Looping und Rollzone wird weiter flach gefahren: der Querversatz off ist die
// Bogenlaenge ueber den Querschnitt. |off| <= flat ist Boden, danach geht es die Wand hinauf
// (Winkel u/R), ueber der Kante (Lippe) senkrecht in die Luft. Die Schwerkraft zieht entlang des
// Querschnitts zurueck zur Mitte (g * sin(Winkel)) - wer schraeg genug auf die Wand faehrt, fliegt
// ueber die Lippe hinaus, dreht in der Luft einen Trick und faellt zurueck in die Pipe.
// An Ein- und Ausfahrt wachsen die Waende weich aus dem Boden (env 0..1 = Anteil der vollen Hoehe);
// dort gibt es keinen Absprung, die Wandkante haelt wie eine Bande.

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const sstep = u => {const t = clamp(u, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10);};

export const HP = {
  flat: 8.9,      // halbe Bodenbreite (m) - Fahrbahn plus Randband, dort beginnen die Waende
  R: 5.5,         // Wandradius = Hoehe der Lippe (m)
  g: 22,          // Schwerkraft entlang des Querschnitts (m/s^2) - etwas weicher als G, damit man hochkommt
  ramp: 22,       // Laenge von Ein- und Ausfahrt (m), in denen die Waende wachsen bzw. schrumpfen
  launchEnv: .97, // ab diesem Hoehenanteil fliegt man ueber die Lippe (sonst haelt die Kante)
  maxAir: 6,      // hoechster Flug ueber der Lippe (m) - mit Turbo waeren sonst 20 m drin
  minR: 45,       // kleinster Kurvenradius im Abschnitt (m); enger faltet die Luft ueber der Innenwand ein
};

// Wandhoehen-Anteil an Stelle x (m ab Zonenbeginn) einer Zone der Laenge span: C2-glatt rein und raus
export function hpEnv(x, span, ramp = HP.ramp) {
  if (x <= 0 || x >= span) return 0;
  const r = Math.min(ramp, span / 2);
  return sstep(x / r) * (1 - sstep((x - (span - r)) / r));
}

export const hpTop = env => HP.R * env * Math.PI / 2;    // Bogenlaenge vom Wandfuss bis zur Kante

// Querschnitt: Querversatz off (Physik) -> Bildlage. lat = seitlich, up = Hoehe ueber dem Boden,
// phi = Drehwinkel der Flaechennormale um die Fahrtrichtung (Vorzeichen wie die Rollzone), th = |phi|,
// u = Bogenlaenge ab Wandfuss, air = ueber der Kante (dort geht es geradlinig in Richtung der Kante weiter).
export function hpProfile(off, env, out = {}) {
  const s = off < 0 ? -1 : 1, u = Math.abs(off) - HP.flat, thMax = clamp(env, 0, 1) * Math.PI / 2, top = HP.R * thMax;
  out.s = s; out.u = u; out.top = top;
  if (u <= 0) {out.lat = off; out.up = 0; out.th = 0; out.phi = 0; out.air = false; return out;}
  if (u <= top) {const th = u / HP.R; out.lat = s * (HP.flat + HP.R * Math.sin(th)); out.up = HP.R * (1 - Math.cos(th)); out.th = th; out.phi = s * th; out.air = false; return out;}
  const e = u - top;
  out.lat = s * (HP.flat + HP.R * Math.sin(thMax) + e * Math.cos(thMax));
  out.up = HP.R * (1 - Math.cos(thMax)) + e * Math.sin(thMax);
  out.th = thMax; out.phi = s * thMax; out.air = true;
  return out;
}

// Beschleunigung in +off-Richtung (Vorzeichen beachtet): Boden 0, Wand und Luft ziehen zur Mitte
export function hpAccel(off, env) {
  const p = hpProfile(off, env, _acc);
  return p.u <= 0 ? 0 : -p.s * HP.g * Math.sin(p.th);
}
const _acc = {};

// Quertempo am Wandfuss, das gerade bis zur Lippe reicht, und Flughoehe ueber der Lippe
export const hpNeed = (g = HP.g, R = HP.R) => Math.sqrt(2 * g * R);
export function hpApex(vBase, g = HP.g, R = HP.R) {const v2 = vBase * vBase - 2 * g * R; return v2 > 0 ? Math.min(HP.maxAir, v2 / (2 * g)) : 0;}
// Quertempo an der Lippe deckeln, damit der Flug nicht hoeher als maxAir geht
export const hpLaunchCap = (vn, g = HP.g) => Math.min(vn, Math.sqrt(2 * g * HP.maxAir));

// Wertung nach der Landung: Flughoehe (m) und ob ein Trick sauber gestanden wurde
export function hpRating(height, trick) {
  if (height < 1) return null;
  const big = height >= 4.5;
  return {label: (trick ? 'HALFPIPE-TRICK' : 'HALFPIPE-AIR') + ' ' + height.toFixed(1).replace('.', ',') + ' m!', boost: trick ? (big ? 1.4 : 1.1) : (big ? .6 : .35), spores: trick && big ? 1 : 0};
}

// Stelle fuer eine Zone der Laenge span suchen: moeglichst nah an near (m), frei von busy-Abschnitten
// ([von, bis] in m, duerfen ueber die Rundenlaenge laufen) und ohne Kurve enger als HP.minR.
// kap(d) liefert die Kruemmung (1/m). Rueckgabe: Zonenbeginn in m oder -1.
export function hpFindSpot({length, kap, busy, span, near, search = 160, step = 2}) {
  const lap = d => ((d % length) + length) % length;
  const taken = s => busy.some(([a, b]) => {const L = lap(b - a), rel = lap(s - a); return rel < L || lap(a - s) < span;});
  let best = -1, bs = 1e9;
  for (let o = -search; o <= search; o += step) {
    const s = lap(near + o - span / 2);
    if (taken(s)) continue;
    let m = 0;
    for (let t = -8; t <= span + 8; t += 3) m = Math.max(m, Math.abs(kap(s + t)));
    if (m > 1 / HP.minR) continue;
    const sc = m * 400 + Math.abs(o) * .01;
    if (sc < bs) {bs = sc; best = s;}
  }
  return best;
}
