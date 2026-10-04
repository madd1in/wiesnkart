// Wiesn Kart R44: Fortschritt - Erfahrungspunkte je Rennen, Fahrerstufen mit Freischaltungen, Erfolge.
// Reine Funktionen (Spiel und Tests). Strecken-Index: 0 Promenade, 1 Canyon, 2 Neon, 3 Geisterhaus, 4 Lava,
// 5 Bierstraße, 6 Magnet-Kirmes, 7 Graben-Flug, 8 Schildkröten-Bucht, 9 Eisstock-See, 10 Riesendom.
export const PLACE_XP = [100, 80, 66, 56, 47, 40, 34, 28];
export const CLASS_MUL = {50: 1, 100: 1.25, 150: 1.6};
export const TRACKS = 12;
// R46: Bonus fuer den geschlagenen Rivalen und die geschaffte Tages-Herausforderung
export const RIVAL_XP = 25, DAILY_XP = 60;
// R55: Wer ohne (oder mit leichter) Lenkhilfe faehrt, bekommt einen Aufschlag auf die Rennpunkte; jede saubere Runde
// (kein Gras, keine Wand, kein Absturz) bringt CLEAN_XP.
export const ASSIST_BONUS = {aus: .25, leicht: .1}, CLEAN_XP = 20;
// R65: Anreize fuer Online-Rennen - doppelte Rennpunkte, Bonus je geschlagenem Menschen, erstes Online-Rennen des Tages
export const ONLINE_MUL = 3, HUMAN_XP = 30, ONLINE_DAILY_XP = 150;/* R86: staerkere Online-Anreize (Engagement) */
// Online-Freischaltungen (Anzahl Online-Rennen): Lackierungen und die Pixel-Krone (erster Online-Sieg gegen einen Menschen)
export const ONLINE_UNLOCKS = [
  {n: 1, what: 'Lackierung „Wiesn Blau-Weiß“'},
  {n: 3, what: 'Lackierung „Lebkuchen“'},
  {n: 5, what: 'Lackierung „Pixel-Pink“'},
];
export const onlineNext = races => ONLINE_UNLOCKS.find(u => u.n > races) || null;
// R65: Wiesn-Serie - wer an aufeinanderfolgenden Tagen faehrt, bekommt beim ersten Rennen des Tages einen Bonus (bis Tag 7 steigend)
export const STREAK_XP = 15, STREAK_MAX = 7;
export const streakXP = days => Math.min(STREAK_MAX, Math.max(0, days)) * STREAK_XP;
export function streakUpdate(st = {}, today, yesterday) {
  if (st.last === today) return {...st, fresh: false};
  const days = st.last === yesterday ? (st.days || 0) + 1 : 1;
  return {last: today, days, best: Math.max(st.best || 0, days), fresh: true};
}
/** Wie lang ist die Serie, wenn heute gefahren wird (fuer die Anzeige im Menue)? */
export const streakIfToday = (st = {}, today, yesterday) => st.last === today ? (st.days || 0) : st.last === yesterday ? (st.days || 0) + 1 : 1;

// XP eines Rennens mit Aufschluesselung (fuer die Ergebnisanzeige)
export function raceXP({place, cc, stats = {}, assist, online, humansBeaten, onlineFirst, streakDays}) {
  const mt = stats.mt || {}, parts = [['Platz ' + place, PLACE_XP[place - 1] || 20]];
  const add = (k, v) => {if (v > 0) parts.push([k, Math.round(v)]);};
  add('Drift-Turbos', (mt.mini || 0) * 4 + (mt.super || 0) * 8 + (mt.ultra || 0) * 15);
  add('Tricks', (stats.tricks || 0) * 6);
  add('Windschatten', (stats.drafts || 0) * 6);
  add('Überholt', (stats.overtakes || 0) * 3);
  add('Ringe', (stats.rings || 0) * 2);
  add('Plattgemacht', (stats.megaSquash || 0) * 5);
  if (!(stats.hitsTaken > 0)) add('Ohne Treffer', 30);
  if (stats.rivalBeaten) add('Rivale geschlagen', RIVAL_XP);
  if (stats.daily) add('Tagesaufgabe', DAILY_XP);
  add('Saubere Runden', (stats.cleanLaps || 0) * CLEAN_XP);
  const bonus = ASSIST_BONUS[assist] || 0;
  if (bonus) add(assist === 'aus' ? 'Ohne Lenkhilfe' : 'Leichte Lenkhilfe', parts.reduce((a, p) => a + p[1], 0) * bonus);
  if (online) {
    add('🌐 Online ×' + ONLINE_MUL, parts.reduce((a, p) => a + p[1], 0) * (ONLINE_MUL - 1));
    add('Menschen geschlagen', (humansBeaten || 0) * HUMAN_XP);
    if (onlineFirst) add('Erstes Online-Rennen heute', ONLINE_DAILY_XP);
  }
  if (streakDays) add('🔥 Wiesn-Serie Tag ' + streakDays, streakXP(streakDays));
  const mul = CLASS_MUL[cc] || 1;
  return {parts, mul, total: Math.round(parts.reduce((a, p) => a + p[1], 0) * mul)};
}

// Stufe n (ab 1) braucht insgesamt 150 * (n-1) * n / 2 XP: 0, 150, 450, 900, 1500 ...
export const levelStart = n => 75 * (n - 1) * n;
export function levelOf(xp) {
  let n = 1;
  while (xp >= levelStart(n + 1)) n++;
  return {level: n, into: xp - levelStart(n), need: levelStart(n + 1) - levelStart(n)};
}

const cnt = (s, k) => s[k] || 0;
const mtAll = s => cnt(s.mt || {}, 'mini') + cnt(s.mt || {}, 'super') + cnt(s.mt || {}, 'ultra');
// Erfolge: r = Rennzusammenfassung {track, cc, place, stats, finished, gpWon, owDone}, p = Fortschritt {done, won}
export const ACH = [
  {id: 'win', n: 'Erster Sieg', d: 'Gewinne ein Rennen', t: r => r.place === 1},
  {id: 'podium', n: 'Treppchen', d: 'Fahre unter die ersten drei', t: r => r.place <= 3},
  {id: 'mt10', n: 'Turbo-Profi', d: '10 Drift-Turbos in einem Rennen', t: r => mtAll(r.stats) >= 10},
  {id: 'ultra', n: 'Blitzfunken', d: 'Zünde einen Blitz-Turbo', t: r => cnt(r.stats.mt || {}, 'ultra') >= 1},
  {id: 'combo', n: 'Combo-König', d: 'Schaffe eine Turbo-Combo ×4', t: r => cnt(r.stats, 'maxCombo') >= 4},
  {id: 'clean', n: 'Unberührbar', d: 'Gewinne, ohne getroffen zu werden', t: r => r.place === 1 && !(r.stats.hitsTaken > 0)},
  {id: 'tricks', n: 'Luftakrobat', d: '5 Tricks in einem Rennen', t: r => cnt(r.stats, 'tricks') >= 5},
  {id: 'draft', n: 'Windschatten-Jäger', d: '3 Windschatten-Boosts in einem Rennen', t: r => cnt(r.stats, 'drafts') >= 3},
  {id: 'overtake', n: 'Überholkünstler', d: '10 Überholmanöver in einem Rennen', t: r => cnt(r.stats, 'overtakes') >= 10},
  {id: 'coins', n: 'Münzsammler', d: 'Trage alle 10 Münzen gleichzeitig', t: r => cnt(r.stats, 'maxSpores') >= 10},
  {id: 'rocket', n: 'Raketenstart', d: 'Gelungener Raketenstart', t: r => cnt(r.stats, 'rocket') >= 1},
  {id: 'cc150', n: 'Wild-Champion', d: 'Gewinne ein Rennen in der Klasse Wild', t: r => r.place === 1 && r.cc === 150},
  {id: 'gp', n: 'Grand-Prix-Sieger', d: 'Gewinne einen Grand Prix', t: r => !!r.gpWon},
  {id: 'allTracks', n: 'Weltenbummler', d: 'Fahre jede Strecke einmal', t: (r, p) => (p.done || []).length >= TRACKS},
  {id: 'allWins', n: 'Pokalsammler', d: 'Gewinne auf jeder Strecke', t: (r, p) => (p.won || []).length >= TRACKS},
  {id: 'cow', n: 'Kuhflüsterer', d: 'Almwiese ohne Kuhkontakt', t: r => r.track === 0 && r.finished && !cnt(r.stats, 'cowHits')},
  {id: 'desert', n: 'Wüstenfuchs', d: 'Sonnen-Canyon ohne Sandhose und Zug', t: r => r.track === 1 && r.finished && !cnt(r.stats, 'twisterHits') && !cnt(r.stats, 'trainHits')},
  {id: 'beat', n: 'Taktgefühl', d: '3 Turbos im Takt (Neon-Pilzwald)', t: r => cnt(r.stats, 'beatBoosts') >= 3},
  {id: 'ghost', n: 'Geisterjäger', d: 'Geisterhaus, ohne gepackt zu werden', t: r => r.track === 3 && r.finished && !cnt(r.stats, 'grabs')},
  {id: 'stomp', n: 'Stampfer-Tänzer', d: 'Lava-Feste, ohne plattgedrückt zu werden', t: r => r.track === 4 && r.finished && !cnt(r.stats, 'squashed')},
  {id: 'star', n: 'Sternenkind', d: 'Bierstraße ohne Sternschnuppen-Treffer', t: r => r.track === 5 && r.finished && !cnt(r.stats, 'meteorHits')},
  {id: 'coaster', n: 'Achterbahn-Fan', d: 'Fahre in einem Rennen drei Achterbahnen', t: r => cnt(r.stats, 'coasters') >= 3},
  {id: 'ow', n: 'Entdecker', d: 'Erledige 3 Missionen im Wiesnland', t: r => (r.owDone || 0) >= 3},
  {id: 'rival', n: 'Rivalen-Bezwinger', d: 'Lass deinen Rivalen hinter dir', t: r => !!r.stats.rivalBeaten},
  {id: 'storm', n: 'Wettermacher', d: 'Triff 4 Karts mit einer Gewitterwolke', t: r => cnt(r.stats, 'stormBest') >= 4},
  {id: 'daily', n: 'Tagesheld', d: 'Schaffe eine Tages-Herausforderung', t: r => !!r.stats.daily},
  // R47
  {id: 'sun', n: 'Sonnenanbeter', d: 'Hol dir 6 Sonnen-Turbos in einem Rennen', t: r => cnt(r.stats, 'sunBoosts') >= 6},
  {id: 'mirror', n: 'Spiegelmeister', d: 'Gewinne ein Rennen im Spiegel-Modus', t: r => r.place === 1 && !!r.mirror},
  {id: 'mega', n: 'Riesenschritt', d: 'Mache mit dem Riesenwuchs 3 Karts platt', t: r => cnt(r.stats, 'megaSquash') >= 3},
  {id: 'ink', n: 'Tintenfisch', d: 'Triff mit einem Tintenpilz 4 Fahrer', t: r => cnt(r.stats, 'inkBest') >= 4},
  // R50: Wetter von Runde zu Runde
  {id: 'ufo', n: 'Nahbegegnung', d: 'Lass dich vom UFO-Strahl anheben', t: r => cnt(r.stats, 'ufoLifts') >= 1},
  {id: 'wxwin', n: 'Wetterfest', d: 'Gewinne bei Gewitter, Schnee oder Sandsturm', t: r => r.place === 1 && !!r.stats.wxRough},
  // R52: Halfpipe
  {id: 'halfpipe', n: 'Halfpipe-Held', d: 'Stehe 3 Halfpipe-Tricks in einem Rennen', t: r => cnt(r.stats, 'hpTricks') >= 3},
  // R55: Koennen statt Lenkhilfe
  {id: 'free', n: 'Freihändig', d: 'Gewinne ein Rennen ohne Lenkhilfe', t: r => r.place === 1 && r.assist === 'aus'},
  {id: 'spotless', n: 'Blitzsauber', d: 'Fahre alle drei Runden sauber (kein Gras, keine Wand)', t: r => cnt(r.stats, 'cleanLaps') >= 3},
  {id: 'wildfree', n: 'Wiesn-Legende', d: 'Gewinne in der Klasse Wild ohne Lenkhilfe', t: r => r.place === 1 && r.cc === 150 && r.assist === 'aus'},
  // R60: je neue Strecke einer zur eigenen Idee
  {id: 'tide', n: 'Gezeitenkenner', d: 'Schildkröten-Bucht: nimm die Sandbank dreimal trocken', t: r => r.track === 8 && cnt(r.stats, 'tideDry') >= 3},
  {id: 'iceking', n: 'Eisstock-König', d: 'Eisstock-See ohne Eisblock und Eisstock', t: r => r.track === 9 && r.finished && !cnt(r.stats, 'iceHits')},
  // R65: Online
  {id: 'net1', n: 'Wiesn-Gesellig', d: 'Fahre dein erstes Online-Rennen', t: r => !!r.online},
  {id: 'netwin', n: 'Online-Champion', d: 'Gewinne online vor mindestens einem Menschen (Pixel-Krone!)', t: r => !!r.online && r.place === 1 && (r.humansBeaten || 0) >= 1},
  {id: 'net10', n: 'Stammgast', d: 'Fahre 10 Online-Rennen', t: (r, p) => (p.onl || 0) >= 10},
  {id: 'netbeat', n: 'Menschenkenner', d: 'Schlage online insgesamt 25 Menschen', t: (r, p) => (p.onlBeat || 0) >= 25},
  // R70: Retro-Easter-Eggs (werden im Spiel direkt vergeben)
  {id: 'cheat', n: 'Alte Schule', d: 'Ein gewisser Code im Menü …', t: () => false},
  {id: 'taler', n: 'Talerkönig', d: 'Finde alle 36 Wiesn-Taler (drei je Strecke)', t: () => false},
  {id: 'modules', n: 'Modulsammler', d: 'Finde alle 12 versteckten Spielmodule', t: () => false},
  {id: 'halberd', n: 'Hellebarden-Tänzer', d: 'Riesendom, ohne vom Riesenwächter getroffen zu werden', t: r => r.track === 10 && r.finished && !cnt(r.stats, 'halberdHits')},
];
export const achById = id => ACH.find(a => a.id === id);

// Rennen verbuchen: Fortschritt aktualisieren (neues Objekt), neue Erfolge und Stufenwechsel zurueckgeben
export function recordRace(prog, r) {
  const p = {...prog, xp: prog.xp || 0, ach: [...(prog.ach || [])], done: [...(prog.done || [])], won: [...(prog.won || [])]};
  if (r.online) {p.onl = (p.onl || 0) + 1; p.onlBeat = (p.onlBeat || 0) + (r.humansBeaten || 0); if (r.place === 1 && (r.humansBeaten || 0) >= 1) p.crown = true;}
  if (r.finished && r.track >= 0 && r.track < TRACKS && !p.done.includes(r.track)) p.done.push(r.track);
  if (r.place === 1 && r.track >= 0 && r.track < TRACKS && !p.won.includes(r.track)) p.won.push(r.track);
  const xp = raceXP(r), before = levelOf(p.xp).level;
  p.xp += xp.total;
  const after = levelOf(p.xp).level;
  const fresh = ACH.filter(a => !p.ach.includes(a.id) && a.t(r, p)).map(a => a.id);
  p.ach.push(...fresh);
  return {prog: p, xp, fresh, levelUp: after > before ? after : 0, before, after};
}

// Tages-Herausforderung (R46): aus dem Datum (JJJJ-MM-TT) folgen Strecke, Klasse und Aufgabe - fuer alle gleich,
// ohne Server. "Gewinnen" nur in den Klassen Locker/Flott. Geschafft zaehlt sie einmal am Tag (das merkt sich das Spiel).
export const DAILY_GOALS = [
  {id: 'podium', t: 'Fahre aufs Treppchen', ok: (s, pl) => pl <= 3},
  {id: 'win', t: 'Gewinne das Rennen', ok: (s, pl) => pl === 1},
  {id: 'mt8', t: 'Zünde 8 Drift-Turbos', ok: s => mtAll(s) >= 8},
  {id: 'clean', t: 'Komm ohne Treffer ins Ziel', ok: s => !(s.hitsTaken > 0)},
  {id: 'coins', t: 'Trage 10 Münzen gleichzeitig', ok: s => cnt(s, 'maxSpores') >= 10},
  {id: 'tricks', t: 'Schaffe 4 Tricks', ok: s => cnt(s, 'tricks') >= 4},
  {id: 'overtake', t: 'Überhole 8-mal', ok: s => cnt(s, 'overtakes') >= 8},
  {id: 'rival', t: 'Schlage deinen Rivalen', ok: s => !!s.rivalBeaten},
];
function hash(str) {let h = 2166136261; for (const c of str) {h ^= c.charCodeAt(0); h = Math.imul(h, 16777619);} return h >>> 0;}
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export function dailyChallenge(day) {
  const h = hash('mr-' + day), g = DAILY_GOALS[h % DAILY_GOALS.length], track = (h >>> 8) % TRACKS;
  const cc = g.id === 'win' ? [50, 100][(h >>> 16) % 2] : [50, 100, 150][(h >>> 16) % 3];
  return {day, track, cc, goal: g.id, text: g.t};
}
export function dailyDone(ch, {track, cc, place, finished, stats = {}}) {
  if (!ch || !finished || track !== ch.track || cc !== ch.cc) return false;
  const g = DAILY_GOALS.find(x => x.id === ch.goal);
  return !!g && g.ok(stats, place);
}
// Rivale (R46): ein KI-Fahrer aus dem vorderen Startfeld, je Rennen neu; geschlagen, wenn man vor ihm ankommt
export function pickRival(aiIds, rnd = Math.random) {return aiIds.length ? aiIds[Math.floor(rnd() * Math.min(3, aiIds.length))] : null;}
export const rivalBeaten = (order, rivalId) => rivalId !== null && rivalId !== undefined && order.indexOf(0) >= 0 && order.indexOf(0) < order.indexOf(rivalId);

// R66: Aufsaetze (Voxel-Kosmetik ueber dem Kart) - freigeschaltet durch Stufe, Wiesn-Serie, Online-Rennen oder den Online-Sieg
export const TOPPERS = [
  {id: 'none', n: 'Ohne', icon: '✖'},
  {id: 'heart', n: 'Lebkuchenherz', icon: '💝', lvl: 3},
  {id: 'mug', n: 'Maßkrug', icon: '🍺', streak: 3},
  {id: 'brezn', n: 'Riesenbrezn', icon: '🥨', lvl: 6},
  {id: 'star', n: 'Pixel-Stern', icon: '⭐', onl: 10},
  {id: 'crown', n: 'Pixel-Krone', icon: '👑', crown: true},
  {id: 'trophy', n: 'Wochen-Pokal', icon: '🏆', weekly: 1},
  {id: 'cart', n: 'Spielmodul', icon: '🎮', mods: 12},
];
export const topperById = id => TOPPERS.find(t => t.id === id) || null;
/** me = {level, streakBest, onl, crown} */
export function topperUnlocked(t, me = {}) {
  if (!t) return false;
  if (t.lvl && (me.level || 1) < t.lvl) return false;
  if (t.streak && (me.streakBest || 0) < t.streak) return false;
  if (t.onl && (me.onl || 0) < t.onl) return false;
  if (t.crown && !me.crown) return false;
  if (t.weekly && (me.weekly || 0) < t.weekly) return false;
  if (t.mods && (me.mods || 0) < t.mods) return false;
  return true;
}
export function topperHint(t) {
  return t.lvl ? `Ab Fahrerstufe ${t.lvl}` : t.streak ? `Wiesn-Serie: ${t.streak} Tage am Stück` : t.onl ? `Nach ${t.onl} Online-Rennen` : t.crown ? 'Erster Online-Sieg vor einem Menschen' : t.weekly ? 'Schaffe alle drei Wochenziele' : t.mods ? 'Finde alle 12 versteckten Spielmodule' : '';
}
/** Gewaehlter Aufsatz, falls freigeschaltet; ohne Wahl traegt man die Krone, sobald man sie hat */
export function topperFor(choice, me = {}) {
  const t = topperById(choice);
  if (t && topperUnlocked(t, me)) return t.id === 'none' ? null : t.id;
  return choice == null && me.crown ? 'crown' : null;
}

// R66: Taegliche Gluecksbrezn - einmal am Tag im Menue aufbrechen, zufaellige XP (selten ein dicker Batzen)
export const LUCKY = [{xp: 30, w: 34}, {xp: 50, w: 30}, {xp: 80, w: 20}, {xp: 120, w: 11}, {xp: 250, w: 5}];
export function luckyReward(rnd = Math.random) {let x = rnd() * LUCKY.reduce((a, q) => a + q.w, 0); for (const q of LUCKY) if ((x -= q.w) < 0) return q.xp; return LUCKY[0].xp;}
export const luckyReady = (lastDay, today) => lastDay !== today;

// R69: Wochenziele - drei Aufgaben je Kalenderwoche (fuer alle gleich, ohne Server), Fortschritt ueber mehrere Rennen.
// Jedes geschaffte Ziel bringt WEEKLY_XP, alle drei schalten den Aufsatz "Wochen-Pokal" frei.
export const WEEKLY_XP = 80;
export const WEEKLY_POOL = [
  {id: 'wins', t: 'Gewinne 3 Rennen', n: 3, inc: r => r.place === 1 ? 1 : 0},
  {id: 'podium', t: 'Fahre 5-mal aufs Treppchen', n: 5, inc: r => r.place <= 3 ? 1 : 0},
  {id: 'mt', t: 'Zünde 30 Drift-Turbos', n: 30, inc: r => mtAll(r.stats || {})},
  {id: 'hits', t: 'Lande 15 Treffer', n: 15, inc: r => cnt(r.stats || {}, 'hitsDealt')},
  {id: 'online', t: 'Fahre 3 Online-Rennen', n: 3, inc: r => r.online ? 1 : 0},
  {id: 'clean', t: 'Fahre 6 saubere Runden', n: 6, inc: r => cnt(r.stats || {}, 'cleanLaps')},
  {id: 'tricks', t: 'Schaffe 20 Tricks', n: 20, inc: r => cnt(r.stats || {}, 'tricks')},
  {id: 'overtake', t: 'Überhole 40-mal', n: 40, inc: r => cnt(r.stats || {}, 'overtakes')},
  {id: 'tracks', t: 'Fahre auf 4 verschiedenen Strecken', n: 4, track: true},
];
/** ISO-Kalenderwoche als Schluessel, z. B. "2026-W40" */
export function weekKey(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)), w = Math.ceil(((t - y0) / 864e5 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(w).padStart(2, '0')}`;
}
export function weeklyGoals(week) {
  let h = hash('wk-' + week); const pool = [...WEEKLY_POOL], out = [];
  while (out.length < 3) {out.push(pool.splice(h % pool.length, 1)[0]); h = Math.imul(h ^ (h >>> 13), 2654435761) >>> 0;}
  return out;
}
/** Rennen auf die Wochenziele buchen: liefert neuen Zustand, frisch geschaffte Ziele und ob jetzt alle drei geschafft sind */
export function weeklyStep(st, week, r) {
  const s = st && st.week === week ? {week, prog: {...st.prog}, done: [...st.done], tracks: [...(st.tracks || [])]} : {week, prog: {}, done: [], tracks: []};
  const fresh = [];
  for (const g of weeklyGoals(week)) {
    if (s.done.includes(g.id)) continue;
    if (g.track) {if (r.finished && Number.isInteger(r.track) && !s.tracks.includes(r.track)) s.tracks.push(r.track); s.prog[g.id] = s.tracks.length;}
    else s.prog[g.id] = (s.prog[g.id] || 0) + (g.inc(r) || 0);
    if (s.prog[g.id] >= g.n) {s.prog[g.id] = g.n; s.done.push(g.id); fresh.push(g);}
  }
  return {st: s, fresh, allDone: fresh.length > 0 && s.done.length === 3};
}

// R94 Einstiegs-Tour: die drei Grundlagen aus der Fahrschule (R66) als Checkliste fuer die Willkommens-Tour.
// coach = gespeicherter Fahrschul-Zustand {gas:'ok'|1..3, drift:..., item:...}; gelernt heisst 'ok'.
export const TOUR_STEPS = Object.freeze([['gas', 'Gas geben'], ['drift', 'Drift-Turbo'], ['item', 'Item einsetzen']]);
export const TOUR_XP = 100;
export function tourProgress(c = {}) {return TOUR_STEPS.map(([id, n]) => ({id, n, ok: c[id] === 'ok'}));}
export const tourDone = c => tourProgress(c).every(s => s.ok);
