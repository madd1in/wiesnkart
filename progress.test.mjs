import test from 'node:test';
import assert from 'node:assert/strict';
import {raceXP, levelOf, levelStart, recordRace, ACH, TRACKS, RIVAL_XP, DAILY_XP, DAILY_GOALS, dailyChallenge, dailyDone, dayKey, pickRival, rivalBeaten, achById, ASSIST_BONUS, CLEAN_XP} from './progress.mjs';

test('race XP: placement base, bonuses and class multiplier', () => {
  const plain = raceXP({place: 1, cc: 50, stats: {hitsTaken: 1}});
  assert.equal(plain.total, 100);
  const rich = raceXP({place: 1, cc: 150, stats: {mt: {mini: 2, super: 1, ultra: 1}, tricks: 2, hitsTaken: 0}});
  assert.equal(rich.total, Math.round((100 + 8 + 8 + 15 + 12 + 30) * 1.6));
  assert.ok(raceXP({place: 8, cc: 100, stats: {hitsTaken: 3}}).total > 0, 'even last place earns XP');
});

test('levels grow steadily and report progress within the level', () => {
  assert.equal(levelOf(0).level, 1);
  assert.equal(levelOf(149).level, 1);
  assert.equal(levelOf(150).level, 2);
  assert.equal(levelOf(levelStart(5)).level, 5);
  const l = levelOf(200);
  assert.equal(l.into, 50);
  assert.equal(l.need, 300);
});

test('recording a race: achievements once, level-up reported, tracks remembered', () => {
  let r = recordRace({}, {track: 0, cc: 100, place: 1, finished: true, stats: {hitsTaken: 0, mt: {ultra: 1}}});
  assert.ok(r.fresh.includes('win') && r.fresh.includes('clean') && r.fresh.includes('ultra') && r.fresh.includes('cow'));
  assert.equal(r.levelUp, 2);
  assert.deepEqual(r.prog.done, [0]);
  const again = recordRace(r.prog, {track: 0, cc: 100, place: 1, finished: true, stats: {hitsTaken: 0}});
  assert.equal(again.fresh.includes('win'), false, 'each achievement only once');
  let p = r.prog;
  for (let t = 1; t < TRACKS; t++) p = recordRace(p, {track: t, cc: 50, place: 1, finished: true, stats: {hitsTaken: 2}}).prog;
  assert.ok(p.ach.includes('allTracks') && p.ach.includes('allWins'));
});

test('achievement ids are unique and every entry has a name and a description', () => {
  const ids = new Set(ACH.map(a => a.id));
  assert.equal(ids.size, ACH.length);
  for (const a of ACH) assert.ok(a.n && a.d && typeof a.t === 'function');
});

test('daily challenge: same task all day, valid track and class, win only in the two easier classes', () => {
  const a = dailyChallenge('2026-09-25'), b = dailyChallenge('2026-09-25');
  assert.deepEqual(a, b);
  const seen = new Set();
  for (let d = 1; d <= 60; d++) {
    const c = dailyChallenge(`2026-10-${String(d).padStart(2, '0')}`);
    assert.ok(c.track >= 0 && c.track < TRACKS);assert.ok([50, 100, 150].includes(c.cc));
    if (c.goal === 'win') assert.ok(c.cc !== 150);seen.add(c.goal);
  }
  assert.ok(seen.size >= 5, 'tasks vary from day to day');
  assert.equal(dayKey(new Date(2026, 0, 5)), '2026-01-05');
});

test('daily challenge counts only on its track and class and when the goal is met', () => {
  const ch = {day: 'x', track: 4, cc: 100, goal: 'mt8'};
  const good = {track: 4, cc: 100, place: 5, finished: true, stats: {mt: {mini: 5, super: 2, ultra: 1}}};
  assert.equal(dailyDone(ch, good), true);
  assert.equal(dailyDone(ch, {...good, track: 3}), false);
  assert.equal(dailyDone(ch, {...good, cc: 150}), false);
  assert.equal(dailyDone(ch, {...good, stats: {mt: {mini: 2}}}), false);
  assert.equal(dailyDone({...ch, goal: 'podium'}, {...good, place: 3}), true);
  assert.ok(DAILY_GOALS.every(g => typeof g.ok === 'function' && g.t));
});

test('rival: picked from the front of the grid, beaten when you finish ahead; both bonuses add XP', () => {
  let seq = 0;const rnd = () => [0, .5, .99][seq++ % 3];
  assert.deepEqual([pickRival([1, 2, 3, 4], rnd), pickRival([1, 2, 3, 4], rnd), pickRival([1, 2, 3, 4], rnd)], [1, 2, 3]);
  assert.equal(pickRival([], rnd), null);
  assert.equal(rivalBeaten([3, 0, 2], 2), true);
  assert.equal(rivalBeaten([2, 0], 2), false);
  assert.equal(rivalBeaten([0, 2], null), false);
  const base = raceXP({place: 4, cc: 50, stats: {hitsTaken: 1}}).total;
  assert.equal(raceXP({place: 4, cc: 50, stats: {hitsTaken: 1, rivalBeaten: true, daily: true}}).total, base + RIVAL_XP + DAILY_XP);
  const r = recordRace({}, {track: 2, cc: 100, place: 4, finished: true, stats: {hitsTaken: 1, rivalBeaten: true, daily: true, stormBest: 5}});
  assert.ok(r.fresh.includes('rival') && r.fresh.includes('daily') && r.fresh.includes('storm'));
});

test('weather achievements: ufo lift and winning in rough weather', () => {
  const base = {place: 1, finished: true, track: 0, cc: 100, stats: {}};
  assert.ok(achById('ufo').t({...base, stats: {ufoLifts: 1}}));
  assert.ok(!achById('ufo').t(base));
  assert.ok(achById('wxwin').t({...base, stats: {wxRough: true}}));
  assert.ok(!achById('wxwin').t({...base, place: 2, stats: {wxRough: true}}));
  assert.ok(!achById('wxwin').t(base));
});

test('halfpipe achievement: three landed tricks in one race', () => {
  const base = {place: 5, finished: true, track: 6, cc: 100, stats: {}};
  assert.ok(achById('halfpipe').t({...base, stats: {hpTricks: 3}}));
  assert.ok(!achById('halfpipe').t({...base, stats: {hpTricks: 2, hpAirs: 5}}));
});

test('R55: clean laps and driving without steering assist earn extra XP', () => {
  const base = raceXP({place: 2, cc: 50, stats: {hitsTaken: 1}}).total;
  assert.equal(raceXP({place: 2, cc: 50, stats: {hitsTaken: 1, cleanLaps: 3}}).total, base + 3 * CLEAN_XP);
  assert.equal(raceXP({place: 2, cc: 50, stats: {hitsTaken: 1}, assist: 'voll'}).total, base, 'full assist: no bonus');
  assert.equal(raceXP({place: 2, cc: 50, stats: {hitsTaken: 1}, assist: 'aus'}).total, Math.round(base * (1 + ASSIST_BONUS.aus)));
  assert.ok(raceXP({place: 2, cc: 50, stats: {}, assist: 'leicht'}).total < raceXP({place: 2, cc: 50, stats: {}, assist: 'aus'}).total);
  const win = {place: 1, finished: true, track: 0, cc: 150, stats: {cleanLaps: 3}};
  assert.ok(achById('free').t({...win, assist: 'aus'}) && !achById('free').t({...win, assist: 'leicht'}));
  assert.ok(achById('wildfree').t({...win, assist: 'aus'}) && !achById('wildfree').t({...win, cc: 100, assist: 'aus'}));
  assert.ok(achById('spotless').t(win) && !achById('spotless').t({...win, stats: {cleanLaps: 2}}));
});

test('R65: Online-Rennen bringen doppelte Punkte, Menschen-Bonus, Tagesbonus, Erfolge und die Pixel-Krone', async () => {
  const {ONLINE_MUL, HUMAN_XP, ONLINE_DAILY_XP, onlineNext} = await import('./progress.mjs');
  const base = raceXP({place: 2, cc: 100, stats: {hitsTaken: 1}});
  const on = raceXP({place: 2, cc: 100, stats: {hitsTaken: 1}, online: true, humansBeaten: 2, onlineFirst: true});
  assert.equal(on.total, Math.round((base.total / 1.25 * ONLINE_MUL + 2 * HUMAN_XP + ONLINE_DAILY_XP) * 1.25));
  let r = recordRace({}, {track: 0, cc: 100, place: 1, finished: true, stats: {hitsTaken: 1}, online: true, humansBeaten: 1});
  assert.ok(r.fresh.includes('net1') && r.fresh.includes('netwin'));
  assert.equal(r.prog.onl, 1); assert.equal(r.prog.onlBeat, 1); assert.equal(r.prog.crown, true);
  r = recordRace({...r.prog, onl: 9}, {track: 0, cc: 100, place: 3, finished: true, stats: {}, online: true, humansBeaten: 0});
  assert.ok(r.fresh.includes('net10')); assert.equal(r.prog.crown, true, 'Krone bleibt');
  const off = recordRace({}, {track: 0, cc: 100, place: 1, finished: true, stats: {}});
  assert.ok(!off.fresh.includes('net1')); assert.ok(!off.prog.crown);
  assert.equal(onlineNext(0).n, 1); assert.equal(onlineNext(3).n, 5); assert.equal(onlineNext(5), null);
});

test('R65: Wiesn-Serie zaehlt aufeinanderfolgende Tage, Bonus nur beim ersten Rennen des Tages', async () => {
  const {streakUpdate, streakXP, streakIfToday, STREAK_XP} = await import('./progress.mjs');
  let st = streakUpdate({}, '2026-09-28', '2026-09-27'); assert.deepEqual(st, {last: '2026-09-28', days: 1, best: 1, fresh: true});
  st = streakUpdate(st, '2026-09-29', '2026-09-28'); assert.equal(st.days, 2); assert.ok(st.fresh);
  assert.equal(streakUpdate(st, '2026-09-29', '2026-09-28').fresh, false, 'zweites Rennen am selben Tag');
  const gap = streakUpdate(st, '2026-10-02', '2026-10-01'); assert.equal(gap.days, 1); assert.equal(gap.best, 2);
  assert.equal(streakXP(3), 3 * STREAK_XP); assert.equal(streakXP(30), streakXP(7));
  assert.equal(streakIfToday(st, '2026-09-30', '2026-09-29'), 3);
  const a = raceXP({place: 4, cc: 50, stats: {}}), b = raceXP({place: 4, cc: 50, stats: {}, streakDays: 2});
  assert.equal(b.total - a.total, 2 * STREAK_XP);
});

test('R66: Aufsaetze schalten sich frei, ohne Wahl gibt es die Krone', async () => {
  const {TOPPERS, topperById, topperUnlocked, topperFor, topperHint} = await import('./progress.mjs');
  assert.equal(TOPPERS[0].id, 'none');
  assert.ok(!topperUnlocked(topperById('heart'), {level: 2})); assert.ok(topperUnlocked(topperById('heart'), {level: 3}));
  assert.ok(!topperUnlocked(topperById('mug'), {streakBest: 2})); assert.ok(topperUnlocked(topperById('mug'), {streakBest: 3}));
  assert.ok(topperUnlocked(topperById('star'), {onl: 10})); assert.ok(!topperUnlocked(topperById('crown'), {}));
  assert.equal(topperFor(null, {crown: true}), 'crown'); assert.equal(topperFor(null, {}), null);
  assert.equal(topperFor('none', {crown: true}), null); assert.equal(topperFor('heart', {level: 1}), null); assert.equal(topperFor('heart', {level: 5}), 'heart');
  for (const t of TOPPERS.slice(1)) assert.ok(topperHint(t).length > 5);
});

test('R66: Gluecksbrezn einmal am Tag, Belohnung aus der Tabelle', async () => {
  const {LUCKY, luckyReward, luckyReady} = await import('./progress.mjs');
  assert.equal(luckyReward(() => 0), 30); assert.equal(luckyReward(() => .9999), 250);
  const seen = new Set(); let seq = 1; for (let i = 0; i < 400; i++) seen.add(luckyReward(() => ((seq = seq * 16807 % 2147483647) / 2147483647)));
  assert.deepEqual([...seen].sort((a, b) => a - b), LUCKY.map(q => q.xp));
  assert.ok(luckyReady('2026-09-30', '2026-10-01')); assert.ok(!luckyReady('2026-10-01', '2026-10-01'));
});

test('R69: Wochenziele - drei feste Ziele je Woche, Fortschritt ueber Rennen, Pokal fuer alle drei', async () => {
  const {weekKey, weeklyGoals, weeklyStep, WEEKLY_POOL, topperById, topperUnlocked} = await import('./progress.mjs');
  assert.equal(weekKey(new Date(2026, 9, 1)), '2026-W40'); assert.equal(weekKey(new Date(2027, 0, 1)), '2026-W53');
  const g = weeklyGoals('2026-W40'); assert.equal(g.length, 3); assert.equal(new Set(g.map(x => x.id)).size, 3);
  assert.deepEqual(weeklyGoals('2026-W40').map(x => x.id), g.map(x => x.id), 'fuer alle gleich');
  const weeks = new Set(); for (let w = 1; w <= 30; w++) weeks.add(weeklyGoals(`2026-W${w}`).map(x => x.id).join()); assert.ok(weeks.size > 10, 'wechselt');
  // eine Woche mit bekannten Zielen durchspielen: so lange gute Rennen fahren, bis alle drei geschafft sind
  let st = null, all = false, fresh = 0;
  for (let i = 0; i < 60 && !all; i++) {const res = weeklyStep(st, '2026-W40', {place: 1, finished: true, online: true, track: i % 12, stats: {mt: {mini: 3}, hitsDealt: 2, cleanLaps: 3, tricks: 4, overtakes: 6}}); st = res.st; fresh += res.fresh.length; all = res.allDone;}
  assert.ok(all); assert.equal(fresh, 3); assert.equal(st.done.length, 3);
  const again = weeklyStep(st, '2026-W40', {place: 1, finished: true, stats: {}}); assert.equal(again.fresh.length, 0); assert.ok(!again.allDone);
  const next = weeklyStep(st, '2026-W41', {place: 9, finished: true, stats: {}}); assert.equal(next.st.done.length, 0, 'neue Woche, neues Glueck');
  assert.ok(!topperUnlocked(topperById('trophy'), {})); assert.ok(topperUnlocked(topperById('trophy'), {weekly: 1}));
  assert.ok(WEEKLY_POOL.every(q => q.n > 0 && q.t.length > 5));
});
