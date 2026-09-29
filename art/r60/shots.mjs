// R60 Standbilder mit fester Mechanik-Zeit: node art/r60/shots.mjs <track> <out> "d:off:t:label,..."
import {open} from './pw.mjs';
import {mkdirSync} from 'node:fs';
const ti = +process.argv[2], out = process.argv[3] || '.scratch/r60', list = (process.argv[4] || '').split(',').filter(Boolean).map(s => s.split(':'));
mkdirSync(out, {recursive: true});
const q = await open({width: 1280, height: 720}), P = q.page;
try {
  await P.evaluate(i => {rallyTest.setTrack(i);}, ti); await P.evaluate(() => rallyTest.ready());
  await P.evaluate(() => {rallyTest.start();rallyTest.dbg.freeze = true;}); await P.evaluate(() => rallyTest.ready()); await P.evaluate(() => rallyTest.tick(200));
  for (const [d, off, t, lab] of list) {
    await P.evaluate(([d, off]) => rallyTest.pose(+d, +off, 25, 60), [d, off]); await P.evaluate(() => rallyTest.camSnap());
    await P.evaluate(t => rallyTest.r60At(+t), t); await P.screenshot({path: `${out}/t${ti}_${lab || d}.jpg`, quality: 80});
    console.log(lab, JSON.stringify(await P.evaluate(() => rallyTest.r60())).slice(0, 300));
  }
} catch (e) {console.log('ERR', e.stack || e.message);}
console.log('errors', JSON.stringify(q.errors.filter(e => !/ERR_CERT/.test(e.text)).slice(0, 12)));
await q.close();
