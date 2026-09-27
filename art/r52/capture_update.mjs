// Isolated R52 gameplay capture: 6 seconds + 3-second card, native HUD included.
// Start only after assets/windsock.glb and rallyTest.windsocks() are available.
// node art/r52/capture_update.mjs ; blender -b --factory-startup --python art/r52/edit_update_blender.py
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FPS = 30, SECONDS = 6, WIDTH = 720, HEIGHT = 1280;
const RUN = new Date().toISOString().replace(/[:.]/g, '-');
const FRAMES = path.join(ROOT, '.scratch', 'r52-frames-' + RUN);
if (!existsSync(path.join(ROOT, 'assets', 'windsock.glb'))) throw new Error('R52 windsock asset is not ready yet.');
mkdirSync(FRAMES, { recursive: true });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const freePort = () => new Promise((resolve, reject) => {
 const socket = net.createServer(); socket.on('error', reject);
 socket.listen(0, '127.0.0.1', () => { const port = socket.address().port; socket.close(() => resolve(port)); });
});
let server, chrome, ws, seq = 0;
const pending = new Map(), errors = [];
const send = (method, params = {}, timeout = 60000) => new Promise((resolve, reject) => {
 const id = ++seq, timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, timeout);
 pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
 const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
 if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
 return result.result.value;
};
async function waitFor(check, timeout, label) {
 const start = Date.now();
 while (Date.now() - start < timeout) { if (await check()) return; await sleep(250); }
 throw new Error('Timeout: ' + label);
}
const SETUP = String.raw`(() => {
 const t = rallyTest;
 t.dbg.manual = true; t.autopilot(false);
 dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));
 t.step(195, 1 / 60);
 const racers = t.racers(), player = racers[0];
 function place(r, d, offset, speed) {
  const p = t.posAt(d, offset), q = t.posAt(d + 1, offset);
  const h = Math.atan2(q[0] - p[0], q[2] - p[2]);
  Object.assign(r, { distance: d, offset, x: p[0], y: p[1], z: p[2], h,
   speed, vx: Math.sin(h) * speed, vz: Math.cos(h) * speed, vy: 0,
   air: false, airT: 0, stun: 0, safeD: d, lastGround: p[1], boost: 0,
   driftDir: 0, drift: 0, draft: 0, draftState: undefined, item: null, finishTime: null });
 }
 place(player, 35, 0, 27);
 for (let i = 1; i < racers.length; i++) place(racers[i], 35 - 160 - i * 9, 0, 22);
 t.dbg.camBack = 6.4; t.dbg.camUp = 3.3;
 const panel = document.getElementById('testPanel'); if (panel) panel.style.display = 'none';
 const caption = document.createElement('div'); caption.id = 'r52-caption';
 caption.style.cssText = 'position:fixed;z-index:99990;pointer-events:none;left:6%;right:6%;top:18%;text-align:center;font:900 30px Trebuchet MS,Arial,sans-serif;line-height:1.22;color:#eaffed;text-shadow:0 3px 2px #10272b,0 0 9px #10272b';
 document.body.append(caption);
 const tag = document.createElement('div');
 tag.textContent = 'R52 · LOKALER ENTWICKLUNGSSTAND';
 tag.style.cssText = 'position:fixed;z-index:99990;pointer-events:none;bottom:22px;left:0;right:0;text-align:center;font:800 14px Trebuchet MS,Arial,sans-serif;color:#dbffed;text-shadow:0 2px 3px #10272b';
 document.body.append(tag);
 const realNow = performance.now.bind(performance); let virtualNow = realNow();
 performance.now = () => virtualNow;
 window.R52Capture = {
  events: [], shifted: false, wasReady: false, hadBoost: false,
  frame(index) {
   const p = t.racers()[0], q = t.racers()[1], h = p.h;
   Object.assign(q, { x: p.x + Math.sin(h) * 10, z: p.z + Math.cos(h) * 10,
    y: p.y, h, distance: p.distance + 10, offset: p.offset, speed: 27,
    vx: Math.sin(h) * 27, vz: Math.cos(h) * 27, air: false, stun: 0,
    boost: 0, item: null, finishTime: null, draft: 0, draftState: undefined });
   for (const r of t.racers()) r.item = null;
   if (!this.shifted && index >= 40 && p.draftState?.ready) {
    p.x += Math.cos(q.h) * 3; p.z -= Math.sin(q.h) * 3;
    this.shifted = true;
   }
   virtualNow += 1000 / 30; t.step(2, 1 / 60);
   const ready = !!p.draftState?.ready, boosted = this.shifted && p.boost > 0;
   if (ready && !this.wasReady) this.events.push({ type: 'ready', frame: index, t: index / 30 });
   if (boosted && !this.hadBoost) this.events.push({ type: 'boost', frame: index, t: index / 30 });
   this.wasReady = ready; this.hadBoost = this.hadBoost || boosted;
   caption.textContent = index < 36 ? 'IM WINDSCHATTEN LADEN' : index < 40 ? 'BEREIT: AUSSCHEREN' : index < 90 ? 'AUSSCHEREN → ÜBERHOLBOOST' : 'NEUES HUD · CHIPTUNE-FEEDBACK';
   return { charge: p.draftState?.charge || 0, ready, boost: p.boost, speed: p.speed };
  },
  card() {
   const c = document.createElement('div');
   c.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:50px;background:linear-gradient(150deg,#10302fee,#131d35fa);color:#edfff0;font-family:Trebuchet MS,Arial,sans-serif;box-sizing:border-box';
   c.innerHTML = '<div style="font-size:21px;font-weight:900;letter-spacing:3px;color:#92f6d4">MUSHROOM RALLY · R52</div><div style="font-size:53px;font-weight:900;line-height:1.06;margin:38px 0 28px">WINDSCHATTEN</div><div style="font-size:33px;font-weight:800;line-height:1.45">Laden.<br>Ausscheren.<br>Überholen.</div><div style="font-size:22px;line-height:1.6;margin-top:44px;color:#beffe4">Neues HUD · Chiptune-Feedback<br>Lokaler Entwicklungsstand</div>';
   document.body.append(c); return this.events;
  },
  restore() { performance.now = realNow; t.dbg.manual = false; dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowUp' })); }
 };
 return { windsocks: t.windsocks(), racers: racers.length };
})()`;
try {
 const serverPort = await freePort(), chromePort = await freePort();
 server = spawn(process.execPath, ['server.cjs', String(serverPort)], { cwd: ROOT, windowsHide: true, stdio: 'ignore' });
 await waitFor(async () => { try { return (await fetch('http://127.0.0.1:' + serverPort)).ok; } catch { return false; } }, 30000, 'local server');
 chrome = spawn(process.env.RALLY_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=' + chromePort, '--user-data-dir=' + path.join(FRAMES, 'chrome-profile'),
  '--window-size=' + WIDTH + ',' + HEIGHT, '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-features=Translate,CalculateNativeWinOcclusion', 'about:blank'
 ], { windowsHide: true, stdio: 'ignore' });
 await waitFor(async () => { try { return (await fetch('http://127.0.0.1:' + chromePort + '/json/version')).ok; } catch { return false; } }, 45000, 'isolated Chrome');
 const tab = await (await fetch('http://127.0.0.1:' + chromePort + '/json/new?about:blank', { method: 'PUT' })).json();
 ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
 ws.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) { const p = pending.get(message.id); pending.delete(message.id); clearTimeout(p.timer); message.error ? p.reject(new Error(message.error.message)) : p.resolve(message.result); }
  else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
 };
 await send('Runtime.enable'); await send('Page.enable');
 await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });
 await send('Page.navigate', { url: 'http://127.0.0.1:' + serverPort + '/?test=1' });
 await waitFor(() => evaluate('!!window.rallyTest').catch(() => false), 90000, 'test API');
 await evaluate('rallyTest.ready()');
 await evaluate("rallyTest.setMode('single');rallyTest.setClass(150);rallyTest.setTrack(0);rallyTest.autopilot(false);rallyTest.gfx('auto');rallyTest.start();true");
 await evaluate('rallyTest.ready()');
 await waitFor(() => evaluate("typeof rallyTest.windsocks === 'function'").catch(() => false), 30000, 'R52 windsock hook');
 const setup = await evaluate(SETUP), states = [];
 for (let index = 0; index < FPS * SECONDS; index++) {
  states.push(await evaluate('R52Capture.frame(' + index + ')'));
  const image = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90, fromSurface: true });
  writeFileSync(path.join(FRAMES, 'f' + String(index).padStart(5, '0') + '.jpg'), Buffer.from(image.data, 'base64'));
  if (index % FPS === 0) console.log('Captured', index, '/', FPS * SECONDS);
 }
 const events = await evaluate('R52Capture.card()');
 if (!events.some(e => e.type === 'ready') || !events.some(e => e.type === 'boost')) throw new Error('Capture did not demonstrate both ready and boost; refusing release media.');
 const card = await send('Page.captureScreenshot', { format: 'jpeg', quality: 92, fromSurface: true });
 writeFileSync(path.join(FRAMES, 'endcard.jpg'), Buffer.from(card.data, 'base64'));
 const report = { fps: FPS, width: WIDTH, height: HEIGHT, frames: FPS * SECONDS, endSeconds: 3, frameDirectory: FRAMES, events, setup, states, errors,
  provenance: 'Local gameplay with staged rival positions; charge and boost computed by game physics. Native DOM HUD. Sound reconstructed from game cue definitions during edit.' };
 writeFileSync(path.join(FRAMES, 'events.json'), JSON.stringify(report, null, 2));
 writeFileSync(path.join(ROOT, 'art/r52/capture_report.json'), JSON.stringify(report, null, 2));
 if (errors.length) throw new Error('Browser exceptions recorded: ' + errors.join('\n'));
 console.log('CAPTURE_OK', FRAMES, JSON.stringify(events));
} catch (error) { console.error(error.stack); process.exitCode = 1; }
finally {
 try { if (ws?.readyState === WebSocket.OPEN) await evaluate('window.R52Capture?.restore()'); } catch {}
 for (const p of pending.values()) clearTimeout(p.timer); pending.clear();
 try { ws?.close(); } catch {} chrome?.kill(); server?.kill();
}