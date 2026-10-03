// Wiesn Kart R61: Grand-Prix-Cups - je vier Strecken, dazu der Wiesn-Marathon ueber alle Strecken.
// Reine Funktionen, im Spiel und in Tests (cups.test.mjs) genutzt. Eigene Namen (Wiesn-Gebaeck und -Krug).
export const CUPS = Object.freeze([
  {id: 'brezn', name: 'Brezn-Cup', icon: '🥨', tracks: [0, 1, 2, 3]},
  {id: 'mass', name: 'Maßkrug-Cup', icon: '🍺', tracks: [4, 5, 6, 7]},
  {id: 'herz', name: 'Lebkuchen-Cup', icon: '💝', tracks: [8, 9, 10, 11]},
  // tracks null = alle Strecken der Reihe nach (der alte Grand Prix; behaelt seine Pokal-Schluessel)
  {id: 'alle', name: 'Wiesn-Marathon', icon: '🎡', tracks: null},
]);
const byId = id => CUPS.find(c => c.id === id) || CUPS[0];
export const cupById = byId;
/** Strecken eines Cups (nur vorhandene Indizes < n). */
export function cupTracks(id, n) {
  const c = byId(id), list = c.tracks ? c.tracks : Array.from({length: n}, (_, i) => i);
  return list.filter(i => Number.isInteger(i) && i >= 0 && i < n);
}
/** Erster Vierer-Cup, in dem eine Strecke liegt (fuer "Karte antippen waehlt den Cup"). */
export function cupOf(track) {
  const c = CUPS.find(q => q.tracks && q.tracks.includes(track));
  return c ? c.id : 'alle';
}
/** Pokal-Schluessel im Speicher: der Marathon nutzt den alten Schluessel trophy-<cc> weiter. */
export const trophyKey = (id, cc) => byId(id).tracks ? `trophy-${byId(id).id}-${cc}` : `trophy-${cc}`;
/** Pokal-Symbol fuer eine Platzierung 1..3, sonst leer. */
export const trophyIcon = place => ['🏆', '🥈', '🥉'][place - 1] || '';

// R87 Wochen-Cup: jede Kalenderwoche derselbe Vierer-Cup in derselben Klasse - fuer alle Spieler gleich,
// ohne Server (der ISO-Wochenschluessel kommt aus progress.mjs weekKey()). Totale Zeit ueber alle vier
// Rennen geht auf die Online-Bestenliste (lb.mjs), das Beenden zaehlt als Pokal fuers Profil.
const hash = (str => {let h = 2166136261; for (const c of str) {h ^= c.charCodeAt(0); h = Math.imul(h, 16777619);} return h >>> 0;});
export const WEEK_CC = [50, 100, 150];
/** Wochen-Cup einer Kalenderwoche ("2026-W40") -> {week, cup, cc}. Nur die drei Vierer-Cups, nie der Marathon. */
export function weekCup(week) {
  const h = hash('wcup-' + String(week || '')), four = CUPS.filter(c => c.tracks);
  return {week: String(week || ''), cup: four[h % four.length].id, cc: WEEK_CC[(h >>> 8) % WEEK_CC.length]};
}
