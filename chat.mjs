// Wiesn Kart R60: Chat und Emojis in Online-Raeumen (reine Logik, getestet in chat.test.mjs).
// Nachrichten laufen ueber dieselbe Peer-to-Peer-Verbindung wie das Spiel (Trystero-Aktion "chat"). Jeder Browser
// prueft eingehende Nachrichten selbst: nur Text bis CHAT_MAX Zeichen ohne Steuer- und Richtungszeichen, Emojis und
// Schnellsprueche nur als Index in feste Listen (niemand kann fremdes HTML oder beliebige Symbole schicken).
export const CHAT_MAX = 80, CHAT_KEEP = 40;
export const EMOJIS = ['👍', '😂', '😮', '😡', '🎉', '🍺', '👋', '❤️', '🔥', '😎', '🥨', '🏁'];
export const QUICK = ['Servus!', 'Pfiat di!', 'Gut gefahren!', 'Revanche!', 'Ups 😅', 'Nochmal?', 'Kurz warten!', "Los geht's!"];
// R90 Hupen: klangliche Gruesse statt Smileys (Nutzerwunsch: Bild frei halten) - laufen wie Chat ueber die
// Peer-Verbindung, nur als Index (0 Partyhupe, 1 Rummel-Trompete, 2 Fahrrad-Klingel).
// R95: 3 Zugpfeife und 4 Gockel sind Saison-Belohnungen (Wiesn-Saison Stufe 4/8); aeltere Clients
// ignorieren die neuen Nummern einfach (packChat weisst sie dort ab).
export const HORNS = ['Partyhupe', 'Rummel-Hupe', 'Fahrradklingel', 'Zugpfeife', 'Gockel'];
// Grobe Woerter werden durch Sternchen ersetzt (ganzes Wort, gross/klein egal) - bewusst kurze Liste
const ROUGH = ['arschloch', 'hurensohn', 'wichser', 'fotze', 'missgeburt', 'fuck', 'fucking', 'shit', 'bitch', 'nazi', 'nigger', 'spast', 'schlampe'];
const ROUGH_RE = new RegExp('(^|[^\\p{L}])(' + ROUGH.join('|') + ')(?=$|[^\\p{L}])', 'giu');

/** Text saeubern: Steuer-, Null-Breiten- und Richtungszeichen weg, Leerraum zusammenfassen, kuerzen, Grobes maskieren. */
export function cleanChat(s) {
  let t = String(s ?? '').normalize('NFC')
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ')
    .replace(/[​-‏‪-‮⁠-⁩﻿]/g, '')
    .replace(/\s+/g, ' ').trim();
  t = Array.from(t).slice(0, CHAT_MAX).join('');
  return t.replace(ROUGH_RE, (m, pre, w) => pre + '*'.repeat(Array.from(w).length));
}
/** Ausgehende Nachricht: {t: Text} | {e: Emoji-Index} | {q: Spruch-Index} | {h: Hupe-Index}. Leer oder ungueltig -> null. */
export function packChat(msg) {
  if (!msg || typeof msg !== 'object') return null;
  if (Number.isInteger(msg.e) && msg.e >= 0 && msg.e < EMOJIS.length) return {e: msg.e};
  if (Number.isInteger(msg.q) && msg.q >= 0 && msg.q < QUICK.length) return {q: msg.q};
  if (Number.isInteger(msg.h) && msg.h >= 0 && msg.h < HORNS.length) return {h: msg.h};
  const t = cleanChat(msg.t);
  return t ? {t} : null;
}
/** Eingehende Nachricht pruefen -> {kind: 'emoji' | 'quick' | 'horn' | 'text', text} oder null. */
export function unpackChat(d) {
  const p = packChat(d);
  if (!p) return null;
  if (p.e !== undefined) return {kind: 'emoji', text: EMOJIS[p.e], e: p.e};
  if (p.q !== undefined) return {kind: 'quick', text: QUICK[p.q], q: p.q};
  if (p.h !== undefined) return {kind: 'horn', text: '📢 ' + HORNS[p.h], h: p.h};
  return {kind: 'text', text: p.t};
}
/** Drosselung je Absender: hoechstens burst Nachrichten in win ms und mindestens gap ms Abstand. */
export function chatLimiter({burst = 4, win = 6000, gap = 350} = {}) {
  const times = [];
  return {ok(now) {
    while (times.length && now - times[0] > win) times.shift();
    if (times.length >= burst || (times.length && now - times[times.length - 1] < gap)) return false;
    times.push(now); return true;
  }};
}
/** Verlauf: neueste hinten, hoechstens CHAT_KEEP Eintraege. */
export function pushLog(log, entry) {
  log.push(entry);
  if (log.length > CHAT_KEEP) log.splice(0, log.length - CHAT_KEEP);
  return log;
}
