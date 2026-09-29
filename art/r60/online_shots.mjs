// R60 Bilder der Online-Oberflaeche: Lobby-Leiste, Chat-Verlauf, Chat-Leiste, Sprechblase, Arena-Anzeige
import {open} from './pw.mjs';
import {mkdirSync} from 'node:fs';
const port = +process.argv[2] || 7788, out = '.scratch/r60', sleep = ms => new Promise(r => setTimeout(r, ms));mkdirSync(out, {recursive: true});
const q = await open({width: 1280, height: 720, browsers: 2, query: `test=1&relay=ws://127.0.0.1:${port}`, seedRandom: false}), [A, B] = q.pages;
let pumping = true;const pump = async p => {while (pumping) {await p.evaluate(() => rallyTest.upd(20, 1 / 60)).catch(() => {}); await sleep(300);}};
const until = async (page, fn, ms) => {const t = Date.now(); while (Date.now() - t < ms) {if (await page.evaluate(fn)) return true; await sleep(400);} return false;};
pump(A); pump(B);
try {
  await A.evaluate(() => {document.getElementById('onName').value = 'Anna'; rallyTest.netOpen('WKT62', true, false);});
  await until(A, () => rallyTest.lob()?.setup?.lob === 1, 30000); await A.evaluate(() => rallyTest.lobGo(120000));
  await B.evaluate(() => rallyTest.netOpen('WKT62', false, false));
  await until(B, () => rallyTest.lob()?.setup?.lob === 1 && rallyTest.lob().humans.length === 2, 60000);
  await until(A, () => rallyTest.state().state === 'race', 40000); await until(B, () => rallyTest.state().state === 'race', 40000);
  await B.evaluate(() => rallyTest.vote(8)); await sleep(800);
  await B.evaluate(() => rallyTest.chatSend({t: 'Servus! Wer fährt mit?'})); await sleep(500); await B.evaluate(() => rallyTest.chatSend({e: 5}));
  await A.evaluate(() => rallyTest.chatSend({q: 7})); await sleep(1500);
  pumping = false; await sleep(700);
  // Gast-Kart neben den Host setzen, damit die Sprechblase im Bild ist
  const pa = await A.evaluate(() => {const r = rallyTest.racers()[0]; return {d: r.distance, off: r.offset};});
  await A.evaluate(() => {rallyTest.camSnap();}); await A.screenshot({path: `${out}/on_lobby_host.jpg`, quality: 80});
  await B.evaluate(() => {rallyTest.camSnap();}); await B.screenshot({path: `${out}/on_lobby_guest.jpg`, quality: 80});
  await A.evaluate(() => {document.getElementById('chatBtn').click();}); await sleep(300); await A.screenshot({path: `${out}/on_chatbar.jpg`, quality: 80});
  await A.evaluate(() => {document.getElementById('chatBar').hidden = true;document.getElementById('netBtn').click();}); await sleep(400); await A.screenshot({path: `${out}/on_panel.jpg`, quality: 80});
  await A.evaluate(() => {document.getElementById('online').hidden = true;});
  pumping = true; pump(B);
  const ar = await B.evaluate(() => rallyTest.arena()); await B.evaluate(a => rallyTest.tp(a.x, a.z + 30), ar); await sleep(2500); pumping = false; await sleep(500);
  await B.evaluate(() => rallyTest.camSnap()); await B.screenshot({path: `${out}/on_arena_guest.jpg`, quality: 80});
  console.log(JSON.stringify(await B.evaluate(() => rallyTest.lob())).slice(0, 500));
} catch (e) {console.log('ERR', e.stack || e.message);}
pumping = false; await sleep(500);
console.log('errors', JSON.stringify(q.errors.filter(e => !/ERR_CERT|Failed to load resource/.test(e.text)).map(e => e.b + ':' + e.text.slice(0, 160)).slice(0, 8)));
await q.close();
