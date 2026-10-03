// R57 Online-Bestenliste ohne eigenen Server: jeder Eintrag ist ein signiertes Nostr-App-Datum (NIP-78, Kind 30078) auf
// oeffentlichen Relays. Pro Spieler-Schluessel und Liste gibt es genau einen ersetzbaren Eintrag (d-Tag); die Relays
// pruefen die Signatur. Hier steht nur die reine Logik (Events bauen, Antworten auswerten) - Netz und Signatur macht
// game.js. Eintraege entstehen nur auf Knopfdruck des Spielers (Name und Zeit sind danach oeffentlich).
export const LB_KIND = 30078, LB_APP = 'wiesnkart-lb1', LB_TOP = 10;

/** Listen: 'tt:<strecke>' (Zeitfahren in Sekunden - die Klasse aendert nur die KI, nicht das eigene Kart) und 'wins'
 *  (Online-Siege gegen mindestens einen anderen Menschen). */
export const lbTag = board => `${LB_APP}:${board}`;
export const ttBoard = track => `tt:${track | 0}`;
/** R87 Wochen-Cup: Board der Kalenderwoche ("2026-W40" -> "wc:2026-W40"), Gesamtzeit ueber alle vier Rennen. */
export const wcBoard = week => `wc:${week}`;
export const cleanLbName = s => String(s || '').replace(/\s+/g, ' ').replace(/[^\p{L}\p{N} _.\-!']/gu, '').replace(/ +/g, ' ').trim().slice(0, 14);

/** Unsigniertes Event (id und sig setzt der Aufrufer). */
export function lbDraft(board, data, pubkey, now = Date.now()) {
  return {kind: LB_KIND, pubkey, created_at: Math.floor(now / 1000), tags: [['d', lbTag(board)], ['t', LB_APP]], content: JSON.stringify(data)};
}
/** NIP-01: die id ist der SHA-256 dieser Serialisierung. */
export const lbSerial = ev => JSON.stringify([0, ev.pubkey, ev.created_at, ev.kind, ev.tags, ev.content]);
export const lbFilter = (board, limit = 500) => ({kinds: [LB_KIND], '#d': [lbTag(board)], limit});

/** Antworten der Relays auswerten: nur gueltige Eintraege dieser Liste, je Schluessel der neueste, sortiert.
 *  Zeiten ausserhalb [minTime, maxTime] fliegen raus (minTime schuetzt vor offensichtlich gefaelschten Zeiten). */
export function lbParse(events, board, {minTime = 0, maxTime = 900, drivers = 64} = {}) {
  const tag = lbTag(board), wins = board === 'wins', best = new Map();
  for (const ev of Array.isArray(events) ? events : []) {
    if (!ev || ev.kind !== LB_KIND || typeof ev.pubkey !== 'string' || !/^[0-9a-f]{64}$/.test(ev.pubkey) || !Number.isFinite(ev.created_at)) continue;
    if (!Array.isArray(ev.tags) || !ev.tags.some(t => Array.isArray(t) && t[0] === 'd' && t[1] === tag)) continue;
    let c; try {c = JSON.parse(ev.content);} catch {continue;}
    if (!c || typeof c !== 'object') continue;
    const n = cleanLbName(c.n) || 'Gast', d = Number.isInteger(c.d) && c.d >= 0 && c.d < drivers ? c.d : 0;
    let e;
    if (wins) {const w = Math.floor(Number(c.w)); if (!(w >= 1 && w <= 1e5)) continue; e = {pubkey: ev.pubkey, n, d, w, at: ev.created_at};}
    else {const t = Number(c.t); if (!Number.isFinite(t) || t < minTime || t > maxTime) continue; e = {pubkey: ev.pubkey, n, d, t: Math.round(t * 1000) / 1000, at: ev.created_at};}
    const old = best.get(ev.pubkey);
    if (!old || ev.created_at > old.at) best.set(ev.pubkey, e);          // ersetzbar: der neueste Eintrag zaehlt
  }
  return [...best.values()].sort(wins ? (a, b) => b.w - a.w || a.at - b.at : (a, b) => a.t - b.t || a.at - b.at);
}
/** Platz (1-basiert) eines Schluessels in der Liste, 0 = nicht drin. */
export const lbRank = (list, pubkey) => list.findIndex(e => e.pubkey === pubkey) + 1;
/** Lohnt ein neuer Eintrag? Zeit: nur wenn schneller als der eigene veroeffentlichte; Siege: nur wenn mehr. */
export const lbBetter = (board, value, published) => published == null || (board === 'wins' ? value > published : value < published);
