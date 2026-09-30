// Wiesn Kart R61: Menue-Navigation mit Controller (Xbox/Edge auf der Konsole, Fernseher) - reine Funktionen, Tests in
// padnav.test.mjs. Raeumliche Fokussuche: vom aktuellen Knopf in Richtung des Steuerkreuzes zum naechsten Knopf, der in
// dieser Richtung liegt (Winkel und Abstand gewichtet); gehaltene Richtung wiederholt nach kurzer Pause.
export const NAV = Object.freeze({first: .38, next: .13, cone: 1.9, lateral: 2.2});
const DIRS = {up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0]};
const center = r => [r.x + r.w / 2, r.y + r.h / 2];
/**
 * Bester naechster Knopf: from = Rechteck {x,y,w,h} (oder null), list = Rechtecke, dir = up|down|left|right.
 * Gibt den Index in list zurueck oder -1. Ohne from: der oberste linke Knopf.
 */
export function navPick(from, list, dir) {
  if (!list.length) return -1;
  if (!from) {let best = 0; for (let i = 1; i < list.length; i++) {const a = list[i], b = list[best]; if (a.y + a.x * .3 < b.y + b.x * .3) best = i;} return best;}
  const [dx, dy] = DIRS[dir] || [0, 0], [fx, fy] = center(from);
  let best = -1, bestS = Infinity;
  for (let i = 0; i < list.length; i++) {
    const r = list[i];
    if (r === from || (r.x === from.x && r.y === from.y && r.w === from.w && r.h === from.h)) continue;
    // Abstand der Rechteckkanten in Laufrichtung (ueberlappende Zeilen/Spalten zaehlen als "direkt daneben")
    const [cx, cy] = center(r), vx = cx - fx, vy = cy - fy;
    const along = vx * dx + vy * dy;
    if (along <= 1) continue;
    const across = Math.abs(vx * dy - vy * dx);
    const gapAlong = dx ? Math.max(0, dx > 0 ? r.x - (from.x + from.w) : from.x - (r.x + r.w)) : Math.max(0, dy > 0 ? r.y - (from.y + from.h) : from.y - (r.y + r.h));
    const overlap = dx ? Math.min(r.y + r.h, from.y + from.h) - Math.max(r.y, from.y) : Math.min(r.x + r.w, from.x + from.w) - Math.max(r.x, from.x);
    if (across > along * NAV.cone && overlap <= 0) continue;   // zu weit seitlich
    const s = gapAlong + (overlap > 0 ? 0 : across * NAV.lateral) + along * .05;
    if (s < bestS) {bestS = s; best = i;}
  }
  return best;
}
/**
 * Halte-Wiederholung: st = {dir, since, last} (wird veraendert), dir = aktuell gehaltene Richtung oder null.
 * Gibt die Richtung zurueck, wenn jetzt ein Schritt faellig ist (erster Druck sofort, dann nach first, danach alle next s).
 */
export function navRepeat(st, dir, now) {
  if (!dir) {st.dir = null; return null;}
  if (dir !== st.dir) {st.dir = dir; st.since = now; st.last = now; return dir;}
  const held = now - st.since, gap = st.last === st.since ? NAV.first : NAV.next;
  if (held >= NAV.first && now - st.last >= gap) {st.last = now; return dir;}
  return null;
}
/** Laeuft das Spiel in Edge auf einer Xbox (oder ist der Fernseh-Modus erzwungen)? */
export const isConsole = (ua = '', params = '') => /Xbox/i.test(ua) || /(^|[?&])tv(=1|&|$)/.test(params);
