// Wiesn Kart R55: Online-Rennen und Wiesnland zu mehreren (Peer-to-Peer ueber WebRTC, vendor/trystero.mjs).
// Reine Logik ohne Netzwerk und Renderer, getestet in net.test.mjs:
//  - Raumcodes (5 Zeichen, ohne verwechselbare Buchstaben)
//  - Plaetze: Der Host vergibt globale Plaetze 0..7 (Host 0, Gaeste in Beitrittsreihenfolge, Rest Bots). Jeder
//    Browser sieht sich selbst als Fahrer 0 - lokal werden der eigene Platz und Platz 0 einfach getauscht.
//  - Zustandspakete: jedes Kart wird von genau einem Browser gefahren (Spieler selbst, Bots vom Host) und
//    ~15-mal pro Sekunde als kurzes Zahlen-Array verschickt; Empfaenger zeigen es ~110 ms verzoegert interpoliert.
//  - Herzerl-Schlacht (Wiesnland): jedes Kart hat drei Lebkuchenherzen, ein Treffer (Item, Stampfer ...) kostet eins,
//    wer keine mehr hat, schaut zu; es gewinnt, wer zuletzt noch Herzen hat (oder nach Ablauf die meisten).
export const NET_VER = 2, MAX_PLAYERS = 8, SEND_HZ = 15, INTERP_MS = 110, EXTRAP_MS = 180, WRAP_JUMP = 200;
export const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
// Treffer zaehlt ab dieser Betaeubung (Wand 0,45, Kuh 0,6 und Schranke 0,4 zaehlen nicht); danach kurz unverwundbar
export const HEARTS = 3, HIT_STUN = .75, HIT_GRACE = 1.6, BATTLE_SECS = 180;

/** Hat das Kart in diesem Schritt ein Herz verloren? stunBefore = Betaeubung im letzten Schritt, now = Spielzeit (s). */
export function battleHit(r, stunBefore, now) {
  const s = r.stun || 0;
  if (!(r.hearts > 0) || s < HIT_STUN || s <= (stunBefore || 0) + .2 || (r.bInv || 0) > now) return false;
  r.hearts--; r.bInv = now + HIT_GRACE;
  return true;
}
/** Ende der Runde? list = [{id, hearts}]. Sieger: letzter mit Herzen, bei Zeitablauf die meisten (Gleichstand: keiner). */
export function battleResult(list, timeUp) {
  const alive = list.filter(q => q.hearts > 0);
  if (list.length > 1 && alive.length <= 1) return {done: true, winner: alive.length ? alive[0].id : null};
  if (!timeUp) return {done: false, winner: null};
  const best = Math.max(...list.map(q => q.hearts || 0)), top = list.filter(q => (q.hearts || 0) === best);
  return {done: true, winner: top.length === 1 ? top[0].id : null};
}

export function makeCode(rnd = Math.random, n = 5) {
  let s = '';
  for (let i = 0; i < n; i++) s += CODE_CHARS[Math.floor(rnd() * CODE_CHARS.length) % CODE_CHARS.length];
  return s;
}
/** Eingabe normalisieren: Grossbuchstaben, nur erlaubte Zeichen (O -> 0 ist nicht im Satz, also weg). */
export function normCode(s) {
  return String(s || '').toUpperCase().split('').filter(c => CODE_CHARS.includes(c)).join('').slice(0, 8);
}

/** Globaler Platz -> lokale Fahrer-Nummer (und zurueck: die Abbildung ist ihre eigene Umkehrung). */
export const toLocal = (g, mine) => (g === mine ? 0 : g === 0 ? mine : g);
export const toGlobal = toLocal;

/** Host: Plaetze vergeben. guests = Peer-IDs in Beitrittsreihenfolge. Rueckgabe Map peerId -> Platz (1..7). */
export function assignSlots(guests, prev = new Map()) {
  const out = new Map(), used = new Set([0]);
  for (const id of guests) {
    const p = prev.get(id);
    if (p !== undefined && p > 0 && p < MAX_PLAYERS && !used.has(p)) {out.set(id, p); used.add(p);}
  }
  for (const id of guests) {
    if (out.has(id)) continue;
    let s = 1;
    while (used.has(s) && s < MAX_PLAYERS) s++;
    if (s >= MAX_PLAYERS) break;                 // Raum voll: weitere Gaeste schauen nur zu
    out.set(id, s); used.add(s);
  }
  return out;
}

// Zustands-Flags (Bitmaske)
export const F = Object.freeze({drift: 1, driftR: 2, boost: 4, air: 8, stun: 16, shield: 32, mega: 64, shrink: 128, brake: 256, glide: 512, ink: 1024});
const r2 = v => Math.round(v * 100) / 100, r3 = v => Math.round(v * 1000) / 1000;

/** Kart -> [Platz, x, y, z, Blickrichtung, Tempo, Streckenmeter, Querversatz, Flags, Drift-Stufe 0-3, Zielzeit oder -1,
 *  Herzen in der Herzerl-Schlacht oder -1] */
export function packKart(r, slot, driftLvl = 0) {
  let f = 0;
  if (r.driftDir) f |= F.drift | (r.driftDir > 0 ? F.driftR : 0);
  if (r.boost > 0) f |= F.boost;
  if (r.air) f |= F.air;
  if (r.stun > 0) f |= F.stun;
  if (r.shield > 0) f |= F.shield;
  if (r.mega > 0) f |= F.mega;
  if (r.shrink > 0) f |= F.shrink;
  if (r.braking) f |= F.brake;
  if (r.gliding) f |= F.glide;
  if (r.ink > 0) f |= F.ink;
  return [slot, r2(r.x), r2(r.y || 0), r2(r.z), r3(r.h), Math.round((r.speed || 0) * 10) / 10, r2(r.distance), r2(r.offset || 0), f, driftLvl | 0, r.finishTime == null ? -1 : r2(r.finishTime), Number.isFinite(r.hearts) ? r.hearts | 0 : -1];
}
export function unpackKart(a) {
  if (!Array.isArray(a) || a.length < 9 || !a.slice(0, 9).every(Number.isFinite)) return null;
  const [slot, x, y, z, h, speed, distance, offset, flags, lvl = 0, fin = -1, hearts = -1] = a;
  return {slot, x, y, z, h, speed, distance, offset, flags, lvl: lvl | 0, fin: Number.isFinite(fin) && fin >= 0 ? fin : null,
    hearts: Number.isFinite(hearts) && hearts >= 0 ? Math.min(HEARTS, hearts | 0) : null};
}

const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
/** Puffer fuer eintreffende Zustaende eines Karts (Zeit t in ms, lokale Empfangszeit). */
export const snapBuf = () => ({s: []});
export function pushSnap(buf, t, st) {
  const s = buf.s;
  if (s.length && t <= s[s.length - 1].t) t = s[s.length - 1].t + 1;   // gleiche Empfangszeit: minimal versetzen
  s.push({t, ...st});
  if (s.length > 24) s.splice(0, s.length - 24);
}
/** Zustand zur Zeit t (ms): zwischen zwei Paketen interpoliert, nach dem letzten kurz fortgeschrieben. */
export function sampleSnap(buf, t) {
  const s = buf.s;
  if (!s.length) return null;
  if (t <= s[0].t) return {...s[0]};
  for (let i = s.length - 1; i > 0; i--) {
    const a = s[i - 1], b = s[i];
    if (t >= a.t && t <= b.t) {
      const k = (t - a.t) / Math.max(1, b.t - a.t), L = (p, q) => p + (q - p) * k;
      return {...b, x: L(a.x, b.x), y: L(a.y, b.y), z: L(a.z, b.z), h: a.h + wrapA(b.h - a.h) * k, speed: L(a.speed, b.speed), distance: Math.abs(b.distance - a.distance) > WRAP_JUMP ? b.distance : L(a.distance, b.distance), offset: L(a.offset, b.offset)};
    }
  }
  const b = s[s.length - 1], dt = Math.min(EXTRAP_MS, t - b.t) / 1000, v = b.speed || 0;
  return {...b, x: b.x + Math.sin(b.h) * v * dt, z: b.z + Math.cos(b.h) * v * dt, distance: b.distance + v * dt, stale: t - b.t > 1500};
}
