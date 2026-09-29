// R57 QA Starterfeld: je Strecke ein Autopilot-Rennen mit 12 (und zum Vergleich 8) Karts.
// Aufruf: node art/r57/field12.mjs [trackIdx,...] [feld,...]
// Misst: Startaufstellung (alle auf der Strasse, Abstaende), Rechenzeit je Simulationsschritt, wie viele Gegner ins Ziel
// kommen, haengende Karts (Fortschritt < 30 m in 10 s), Platz des Spielers.
import {spawn} from 'node:child_process';
import {mkdirSync, writeFileSync, createWriteStream} from 'node:fs';
import net from 'node:net';
import path from 'node:path';
const root = process.cwd(), scratch = path.join(root, '.scratch', 'r57-field-' + Date.now());
const tracks = (process.argv[2] || '0,1,2,3,4,5,6,7').split(',').map(Number), fields = (process.argv[3] || '12').split(',').map(Number), ccs = [100], tune = '';
const out = path.join(root, 'art', 'r57', `field_${tracks.join('-')}_${fields.join('-')}.json`);
mkdirSync(scratch, {recursive: true});
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => {const s = net.createServer(); s.on('error', rej); s.listen(0, '127.0.0.1', () => {const p = s.address().port; s.close(() => res(p));});});
const report = {startedAt: new Date().toISOString(), ccs, tune, races: [], errors: [], networkFailures: []};
let server, chrome, ws, seq = 0; const pending = new Map();
const persist = () => writeFileSync(out, JSON.stringify(report, null, 2));
const send = (method, params = {}, timeout = 90000) => new Promise((resolve, reject) => {const id = ++seq, timer = setTimeout(() => {pending.delete(id); reject(new Error('CDP timeout: ' + method));}, timeout); pending.set(id, {resolve, reject, timer}); ws.send(JSON.stringify({id, method, params}));});
const evaluate = async expression => {const r = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true, userGesture: true}, 120000); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value;};
async function waitFor(check, ms, label) {const t = Date.now(); while (Date.now() - t < ms) {if (await check()) return; await sleep(250);} throw new Error('Timeout: ' + label);}
try {
  const sp = await freePort(), cp = await freePort();
  server = spawn(process.execPath, ['server.cjs', String(sp)], {cwd: root, windowsHide: true, stdio: ['ignore', 'ignore', 'pipe']});
  await waitFor(async () => {try {return (await fetch('http://127.0.0.1:' + sp)).ok;} catch {return false;}}, 30000, 'server');
  chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + cp, '--user-data-dir=' + path.join(scratch, 'profile'), '--window-size=1280,720', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio', '--disable-features=Translate,CalculateNativeWinOcclusion', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', 'about:blank'], {windowsHide: true, stdio: ['ignore', 'ignore', 'pipe']});
  chrome.stderr.pipe(createWriteStream(path.join(scratch, 'chrome-error.log')));
  await waitFor(async () => {try {return (await fetch('http://127.0.0.1:' + cp + '/json/version')).ok;} catch {return false;}}, 45000, 'chrome');
  const tab = await (await fetch('http://127.0.0.1:' + cp + '/json/new?about:blank', {method: 'PUT'})).json();
  ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise((r, j) => {ws.onopen = r; ws.onerror = j;});
  ws.onmessage = ev => {const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) {const p = pending.get(m.id); pending.delete(m.id); clearTimeout(p.timer); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); return;}
    if (m.method === 'Runtime.exceptionThrown') report.errors.push({kind: 'exception', text: m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text});
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') report.errors.push({kind: 'console.error', text: m.params.args.map(a => a.value ?? a.description ?? a.type).join(' ')});
    if (m.method === 'Network.responseReceived' && m.params.response.status >= 400 && !m.params.response.url.endsWith('/favicon.ico')) report.networkFailures.push({status: m.params.response.status, url: m.params.response.url});};
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', {source: `{let a=0x38c0ffee;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}`});
  await send('Page.navigate', {url: 'http://127.0.0.1:' + sp + '/?test=1' + (process.env.QA_MOBILE ? '&mobile=1' : '')});
  await waitFor(() => evaluate('!!window.rallyTest').catch(() => false), 90000, 'test API'); await evaluate('rallyTest.ready()');
  if (tune) await evaluate(`(()=>{const t=${tune};const C=rallyTest.classes();for(const k in t)Object.assign(C[k],t[k]);return JSON.stringify(C);})()`).then(c => {report.classes = c;});
  else report.classes = await evaluate('JSON.stringify(rallyTest.classes())');
  for (const nF of fields) for (const i of tracks) {
    const errStart = report.errors.length, wall = Date.now();
    const res = {track: i, field: nF, outcome: 'running'};
    report.races.push(res); persist();
    try {
      await evaluate(`rallyTest.dbg.freeze=false;rallyTest.field(${nF});rallyTest.home();rallyTest.setTrack(${i});rallyTest.setClass(100);rallyTest.autopilot(true);`); await evaluate('rallyTest.ready()');
      await evaluate('rallyTest.start();rallyTest.dbg.freeze=true;');
      res.grid = await evaluate(`(()=>{const s=rallyTest.state();const R=s.racers;let minGap=1e9;for(let a=0;a<R.length;a++)for(let b=a+1;b<R.length;b++)minGap=Math.min(minGap,Math.hypot(R[a].x-R[b].x,R[a].z-R[b].z));
        return {n:R.length,maxOff:Math.max(...R.map(r=>Math.abs(r.offset))),minD:Math.min(...R.map(r=>r.distance)),minGap:+minGap.toFixed(2)};})()`);
      let last = null, stuck = new Set(), ms = [];
      for (let j = 0; j < 40; j++) {
        const s = await evaluate(`(()=>{const t0=performance.now();for(let k=0;k<30;k++)rallyTest.tick(20,1/60);const dt=performance.now()-t0;const s=rallyTest.state(),p=s.racers[0];return {ms:dt/600,state:s.state,finishTime:p?.finishTime??null,place:rallyTest.tick(0).place,
          d:s.racers.map(r=>[r.distance,r.finishTime!==null]),aiFin:s.racers.slice(1).filter(r=>r.finishTime!==null).length};})()`);
        ms.push(s.ms);
        if (last) s.d.forEach(([d, fin], k) => {if (!fin && d - last[k][0] < 30 && j > 1) stuck.add(k);});
        last = s.d; Object.assign(res, {state: s.state, finishTime: s.finishTime, place: s.place, aiFinished: s.aiFin, simulated: (j + 1) * 10});
        if (s.finishTime !== null) {res.outcome = 'finished'; break;}
      }
      if (res.outcome === 'running') res.outcome = 'simulation_limit';
      res.msPerStep = +(ms.reduce((a, b) => a + b, 0) / ms.length).toFixed(3); res.stuck = [...stuck];
    } catch (e) {res.outcome = 'exception'; res.error = e.stack || e.message;}
    res.errors = report.errors.slice(errStart).length; res.wallSeconds = +((Date.now() - wall) / 1000).toFixed(1); persist(); console.log(JSON.stringify(res));
  }
  report.completedAt = new Date().toISOString(); persist(); console.log('DONE -> ' + out);
} catch (e) {report.fatal = e.stack || e.message; persist(); console.error(report.fatal); process.exitCode = 1;}
finally {try {ws?.close();} catch {} for (const p of pending.values()) clearTimeout(p.timer); chrome?.kill(); server?.kill();}
