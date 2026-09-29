// R60 Sichtpruefung: Strecke bauen, Draufsicht und Standbilder an Streckenmetern, Kennzahlen der neuen Mechanik.
// Aufruf: node art/r60/view.mjs <trackIdx> [outDir] [d1,d2,...]
import {open} from './pw.mjs';
import {mkdirSync} from 'node:fs';
const ti = +process.argv[2], out = process.argv[3] || '.scratch/r60', ds = (process.argv[4] || '').split(',').filter(Boolean).map(Number);
mkdirSync(out, {recursive: true});
const q = await open({width: 1280, height: 720});
const P = q.page;
try {
  await P.evaluate(i => {rallyTest.setTrack(i);}, ti); await P.evaluate(() => rallyTest.ready());
  const info = await P.evaluate(() => ({r60: rallyTest.r60(), len: rallyTest.state().length, loops: rallyTest.loops().map(l => [l.s, l.span]), items: rallyTest.items(), forks: rallyTest.forks(), elems: rallyTest.elems().map(e => [e.s, e.span, e.kind]), minR: rallyTest.minRadius()}));
  console.log(JSON.stringify(info));
  await P.screenshot({path: `${out}/t${ti}_menu.jpg`, quality: 80});
  await P.evaluate(() => {rallyTest.start();rallyTest.dbg.freeze = true;}); await P.evaluate(() => rallyTest.ready());
  await P.evaluate(() => {for (const id of ['hud', 'touch', 'toast', 'message']) {const e = document.getElementById(id); if (e) e.style.visibility = 'hidden';}});
  await P.evaluate(() => rallyTest.topView(0, 0, 430, 52)); await P.screenshot({path: `${out}/t${ti}_top.jpg`, quality: 80});
  await P.evaluate(() => {for (const id of ['hud', 'touch', 'toast', 'message']) {const e = document.getElementById(id); if (e) e.style.visibility = '';}});
  await P.evaluate(() => rallyTest.tick(200));
  for (const d of ds) {await P.evaluate(d => rallyTest.pose(d, 0, 25, 60), d); await P.evaluate(() => rallyTest.camSnap()); await P.screenshot({path: `${out}/t${ti}_d${d}.jpg`, quality: 80});}
} catch (e) {console.log('ERR', e.stack || e.message);}
console.log('errors', JSON.stringify(q.errors.filter(e => !/ERR_CERT/.test(e.text)).slice(0, 12)));
await q.close();
