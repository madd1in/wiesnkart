// R61 QA: Standbilder aus kopflosem Chrome (unabhaengig davon, ob ein Browserfenster sichtbar ist).
// Aufruf: node art/r61/shots.mjs <Ausgabeordner> <Szenen.json> [Breite Hoehe]
// Szenen.json: [{"name":"dom_arch","track":10,"js":"rallyTest.pose(rallyTest.cp(2.1),0,20,40)"}, ...]
// js laeuft nach Streckenaufbau und Rennstart; danach wartet das Skript kurz und speichert ein JPEG.
import {spawn} from 'node:child_process';
import {mkdirSync, writeFileSync, readFileSync} from 'node:fs';
import net from 'node:net';
import path from 'node:path';
const root = process.cwd(), outDir = process.argv[2] || '.scratch/r61-shots', scenes = JSON.parse(readFileSync(process.argv[3], 'utf8'));
const W = +(process.argv[4] || 540), H = +(process.argv[5] || 960);
mkdirSync(outDir, {recursive: true});
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => {const s = net.createServer(); s.on('error', rej); s.listen(0, '127.0.0.1', () => {const p = s.address().port; s.close(() => res(p));});});
async function waitFor(check, ms, label) {const t = Date.now(); while (Date.now() - t < ms) {if (await check()) return; await sleep(300);} throw new Error('Timeout: ' + label);}
let server, chrome, ws, seq = 0; const pending = new Map(), errors = [];
const send = (method, params = {}) => new Promise((resolve, reject) => {const id = ++seq; pending.set(id, {resolve, reject}); ws.send(JSON.stringify({id, method, params}));});
const evaluate = async expression => {const r = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true}); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value;};
try {
  const sp = await freePort(), cp = await freePort();
  server = spawn(process.execPath, ['server.cjs', String(sp)], {cwd: root, windowsHide: true, stdio: 'ignore'});
  await waitFor(async () => {try {return (await fetch('http://127.0.0.1:' + sp)).ok;} catch {return false;}}, 30000, 'server');
  chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + cp, '--user-data-dir=' + path.join(root, '.scratch', 'r61-shots-profile'),
    `--window-size=${W},${H}`, '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio', '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows', '--disable-features=Translate,CalculateNativeWinOcclusion', 'about:blank'], {windowsHide: true, stdio: 'ignore'});
  await waitFor(async () => {try {return (await fetch('http://127.0.0.1:' + cp + '/json/version')).ok;} catch {return false;}}, 45000, 'chrome');
  const tab = await (await fetch('http://127.0.0.1:' + cp + '/json/new?about:blank', {method: 'PUT'})).json();
  ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise((r, j) => {ws.onopen = r; ws.onerror = j;});
  ws.onmessage = ev => {const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) {const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); return;}
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);};
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {width: W, height: H, deviceScaleFactor: 1, mobile: false});
  await send('Page.navigate', {url: 'http://127.0.0.1:' + sp + '/?test=1'});
  await waitFor(() => evaluate('!!window.rallyTest').catch(() => false), 90000, 'test API'); await evaluate('rallyTest.ready()');
  await evaluate('rallyTest.setTrack(0);rallyTest.start();true');
  await waitFor(() => evaluate('!!rallyTest.lm()&&!!rallyTest.hz()&&rallyTest.hz().loaded').catch(() => false), 300000, 'late models');
  for (const sc of scenes) {
    await evaluate(`rallyTest.dbg.freeze=false;rallyTest.home();rallyTest.setTrack(${sc.track});true`); await evaluate('rallyTest.ready()');
    await evaluate(`rallyTest.start();true`); await sleep(sc.wait ?? 1500);
    const info = await evaluate(`(()=>{${sc.js};return JSON.stringify(${sc.ret || 'null'})})()`).catch(e => 'ERR ' + e.message);
    await sleep(sc.after ?? 700);
    const shot = await send('Page.captureScreenshot', {format: 'jpeg', quality: 82});
    writeFileSync(path.join(outDir, sc.name + '.jpg'), Buffer.from(shot.data, 'base64'));
    console.log('SHOT', sc.name, info);
  }
  console.log('ERRORS', JSON.stringify(errors.slice(0, 5)));
} catch (e) {console.log('FAIL', e.stack || e.message);}
finally {try {ws?.close();} catch {} try {chrome?.kill();} catch {} try {server?.kill();} catch {}}
process.exit(0);
