// Wiesn Kart R72: Event-Runden - in Runde 2 und 3 kann ein Ereignis die Regeln kurz aendern (fuer alle Fahrer gleich).
// Die Auswahl folgt aus Tag und Strecke (online fuer alle Mitspieler dieselbe, ohne Server). Reine Funktionen (Tests).
export const EVENTS = {
  freibier: {n: 'FREIBIER!', d: 'Itemboxen sind sofort wieder da', icon: '🍺', boxCd: 1},
  taler: {n: 'TALER-RAUSCH!', d: 'Münzen zählen doppelt', icon: '🪙', coinMul: 2},
  turbo: {n: 'TURBO-FIEBER!', d: 'Drift-Turbos halten länger', icon: '🔥', mtMul: 1.35},
  glueck: {n: 'GLÜCKSRUNDE!', d: 'Alle ziehen Aufholer-Items', icon: '🍀', rollLast: true},
};
export const EVENT_IDS = Object.keys(EVENTS);
function hash(str) {let h = 2166136261; for (const c of str) {h ^= c.charCodeAt(0); h = Math.imul(h, 16777619);} return h >>> 0;}
/** Ereignisse je Runde fuer ein Rennen: {2: id|null, 3: id|null}; rund die Haelfte der Runden bekommt eins, nie zweimal dasselbe */
export function raceEvents(seed) {
  const h = hash('ev-' + seed), out = {2: null, 3: null};
  if (h % 100 < 55) out[2] = EVENT_IDS[(h >>> 7) % EVENT_IDS.length];
  if ((h >>> 3) % 100 < 50) {let id = EVENT_IDS[(h >>> 13) % EVENT_IDS.length]; if (id === out[2]) id = EVENT_IDS[(EVENT_IDS.indexOf(id) + 1) % EVENT_IDS.length]; out[3] = id;}
  return out;
}
/** Wert eines Effekts (z. B. 'coinMul') fuer das aktive Ereignis, sonst der Standard */
export const eventVal = (id, key, def) => (id && EVENTS[id] && EVENTS[id][key] !== undefined ? EVENTS[id][key] : def);
