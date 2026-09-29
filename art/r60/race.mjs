// R60 QA: Autopilot-Rennen (12 Karts, Klasse Flott) je Strecke - Zieleinlauf, haengende Karts, Fehler, Rechenzeit.
// Aufruf: node art/r60/race.mjs [tracks=8,9,10] [field=12] [mode=single|tt]
import {open} from './pw.mjs';
import {writeFileSync} from 'node:fs';
const tracks = (process.argv[2] || '8,9,10').split(',').map(Number), nF = +(process.argv[3] || 12), mode = process.argv[4] || 'single';
const q = await open(), P = q.page, out = [];
if (process.env.KNIGHT) await P.evaluate(() => {document.querySelectorAll('#drivers button')[9].click(); [...document.querySelectorAll('#kstyle button')].find(b => /Drache/.test(b.textContent)).click();});
for (const i of tracks) {
  const e0 = q.errors.length, res = {track: i, field: nF, mode};
  try {
    await P.evaluate(([i, nF, mode]) => {rallyTest.dbg.freeze = false; rallyTest.field(nF); rallyTest.home(); rallyTest.setMode(mode); rallyTest.setTrack(i); rallyTest.setClass(100); rallyTest.autopilot(true);}, [i, nF, mode]);
    await P.evaluate(() => rallyTest.ready());
    await P.evaluate(() => {rallyTest.start(); rallyTest.dbg.freeze = true;}); await P.evaluate(() => rallyTest.ready());
    let last = null; const stuck = {}; const ms = [];
    for (let j = 0; j < 60; j++) {
      const s = await P.evaluate(() => {const t0 = performance.now(); rallyTest.tick(600, 1 / 60); const dt = performance.now() - t0; const s = rallyTest.state(), p = s.racers[0];
        return {ms: dt / 600, state: s.state, fin: p?.finishTime ?? null, place: rallyTest.tick(0).place, d: s.racers.map(r => [Math.round(r.distance), r.finishTime !== null]), aiFin: s.racers.slice(1).filter(r => r.finishTime !== null).length,
          st: s.stats && {falls: s.stats.falls, bumps: s.stats.bumps, hits: s.stats.hitsTaken, wave: s.stats.waveHits || 0, crab: s.stats.crabHits || 0, ice: s.stats.iceHits || 0, hal: s.stats.halberdHits || 0, tide: s.stats.tideDry || 0}};});
      ms.push(s.ms);
      if (last) s.d.forEach(([d, fin], k) => {if (!fin && d - last[k][0] < 30 && j > 1) stuck[k] = (stuck[k] || 0) + 1;});
      last = s.d; Object.assign(res, {state: s.state, time: s.fin, place: s.place, aiFinished: s.aiFin, stats: s.st, simulated: (j + 1) * 10});
      if (s.fin !== null) break;
    }
    res.msPerStep = +(ms.reduce((a, b) => a + b, 0) / ms.length).toFixed(2); res.stuck = stuck;
  } catch (e) {res.error = e.message;}
  res.errors = q.errors.slice(e0).filter(e => !/ERR_CERT/.test(e.text)).map(e => e.text.slice(0, 200));
  out.push(res); console.log(JSON.stringify(res));
}
writeFileSync(`.scratch/r60/race_${tracks.join('-')}_${mode}.json`, JSON.stringify(out, null, 1));
await q.close();
