// R60 QA Online mit zwei Browsern (lokaler Test-Relay statt oeffentlicher Nostr-Relays, WebRTC zwischen zwei Chromium-Kontexten):
// Raum erstellen -> Host in der Lobby-Welt, Gast steigt ein, Chat und Emojis, Portal-Stimme, Rennen per Abstimmung, beide im
// Ziel -> zurueck in die Lobby-Welt, offene Arena (Herzen beim Hineinfahren). Aufruf: node art/r60/online2.mjs <relay-Port>
import {open} from './pw.mjs';
const port = +process.argv[2] || 7788, sleep = ms => new Promise(r => setTimeout(r, ms));
const q = await open({width: 640, height: 360, browsers: 2, query: `test=1&relay=ws://127.0.0.1:${port}`, seedRandom: false}), [A, B] = q.pages, log = (...a) => console.log(...a.map(x => typeof x === 'string' ? x : JSON.stringify(x)));
// Software-Rendering im Container schafft nur wenige Bilder je Sekunde - die Simulation wird deshalb direkt weitergerechnet
let pumping = true;const pump = async p => {while (pumping) {await p.evaluate(() => rallyTest.upd(24, 1 / 60)).catch(() => {}); await sleep(250);}};
const until = async (page, fn, ms, label) => {const t = Date.now(); while (Date.now() - t < ms) {if (await page.evaluate(fn)) return true; await sleep(400);} log('TIMEOUT', label); return false;};
pump(A); pump(B);
try {
  await A.evaluate(() => rallyTest.autopilot(true)); await B.evaluate(() => rallyTest.autopilot(true));
  await A.evaluate(() => rallyTest.netOpen('WKT60', true, false));
  await until(A, () => rallyTest.lob()?.setup?.lob === 1, 20000, 'host in lobby world');
  log('A host', await A.evaluate(() => rallyTest.lob()));
  await A.evaluate(() => rallyTest.lobGo(90000));
  await B.evaluate(() => rallyTest.netOpen('WKT60', false, false));
  const joined = await until(B, () => rallyTest.lob()?.setup?.lob === 1 && rallyTest.lob().humans.length === 2, 60000, 'guest in lobby world');
  log('B joined', joined, await B.evaluate(() => rallyTest.lob()));
  await until(B, () => !!rallyTest.lob()?.lobS, 8000, 'guest gets timer');
  // Chat
  await A.evaluate(() => rallyTest.chatSend({t: 'Servus aus der Lobby!'})); await A.evaluate(() => rallyTest.chatSend({e: 5}));
  await B.evaluate(() => rallyTest.chatSend({q: 2}));
  await sleep(1500);
  log('A chat', await A.evaluate(() => rallyTest.chatLog()));
  log('B chat', await B.evaluate(() => rallyTest.chatLog()));
  // Stimme des Gastes fuer den Eisstock-See, dann Zeitgeber kurz
  await B.evaluate(() => rallyTest.vote(9)); await sleep(1500);
  log('A votes', await A.evaluate(() => rallyTest.lob().lobT), 'B sees', await B.evaluate(() => rallyTest.lob().lobS));
  await A.evaluate(() => rallyTest.lobGo(1500));
  const raced = await until(B, () => {const l = rallyTest.lob(); return l?.setup && !l.setup.w && l.setup.t === 9;}, 40000, 'race by vote');
  log('race by vote', raced, await B.evaluate(() => rallyTest.lob()));
  await until(A, () => rallyTest.state().state === 'race', 40000, 'A racing'); await until(B, () => rallyTest.state().state === 'race', 40000, 'B racing');
  await sleep(3000);
  await A.evaluate(() => rallyTest.finishNow()); await B.evaluate(() => rallyTest.finishNow());
  log('finished', await A.evaluate(() => rallyTest.state().state), await B.evaluate(() => rallyTest.state().state));
  const back = await until(B, () => rallyTest.lob()?.setup?.lob === 1, 70000, 'back to lobby');
  log('back to lobby', back, await A.evaluate(() => rallyTest.lob()));
  // Offene Arena: Gast faehrt hinein -> drei Herzen, beim Host sichtbar
  await sleep(4000);
  const ar = await B.evaluate(() => rallyTest.arena());
  await B.evaluate(a => rallyTest.tp(a.x, a.z + 20), ar); await sleep(2500);
  log('B in arena', await B.evaluate(() => rallyTest.lob().hearts[0]), 'A sees', await A.evaluate(() => rallyTest.lob().hearts), await A.evaluate(() => rallyTest.lob().fighters));
} catch (e) {log('ERR', e.stack || e.message);}
pumping = false; await sleep(600);
log('errors', q.errors.filter(e => !/ERR_CERT|Failed to load resource/.test(e.text)).map(e => e.b + ':' + e.text.slice(0, 160)).slice(0, 12));
await q.close();
