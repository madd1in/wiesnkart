// R56 Update-Video, Schritt 1 (nach art/r55/capture_frames.mjs, ohne Gast-Tab): Einzelbilder (Hochformat 1080x1920,
// 30 fps Spielzeit): Menue und offene Raeume als Standbild, Kotzhuegel-Fight-Arena, neue Fahrer, Bierstrasse mit
// Riesen-Masskrug. Schnitt und Ton: art/r56/edit_video_blender.py. Aufruf: node art/r56/capture_frames.mjs
import {spawn} from 'node:child_process';
import {mkdirSync, writeFileSync, rmSync} from 'node:fs';
import net from 'node:net';
import path from 'node:path';
const root = process.cwd(), FPS = 30;
const FRAMES = path.join(root, '.scratch', 'r56-frames');
rmSync(FRAMES, {recursive: true, force: true}); mkdirSync(FRAMES, {recursive: true});
const WX = (tod, wx, ev) => `rallyTest.wxForce([0,1,2].map(()=>({tod:'${tod}',wx:'${wx}',ev:${ev ? `'${ev}'` : 'null'}})))`;
const CALM = WX('day', 'clear', null), SINGLE = "rallyTest.setMode('single');", WORLD = "rallyTest.setMode('world');";
const LOADED = '!!rallyTest.lm()&&!!rallyTest.hz()&&rallyTest.hz().loaded';
const CODE = 'WK' + Math.random().toString(36).slice(2, 5).toUpperCase().replace(/[01IO]/g, 'Z');
// {k: still|play|online, s: Sekunden, t: Titel, u: Untertitel, trk, d0, check, opt}
const SCENES = [
  {k: 'still', s: 3.6, what: 'menu', t: '', u: ''},
  {k: 'still', s: 3.2, what: 'rooms', t: 'ONLINE OHNE CODES', u: 'Offene Räume · Belegung · Ping'},
  {k: 'play', s: 8, t: 'KOTZHÜGEL FIGHT', u: 'Arena-Kampf · 3 Herzen · Bots', trk: 99, d0: 0, check: LOADED + '&&!!rallyTest.battle()', opt: {pre: WORLD, post: CALM, keep: true}},
  {k: 'play', s: 6, t: 'GRABEN-FLUG', u: 'Flugstrecke im Stahlgraben', trk: 7, d0: 300, check: LOADED, opt: {pre: SINGLE, post: CALM}},
  {k: 'play', s: 5.5, t: 'NEUE FAHRER', u: 'Lebi im Keilflitzer · Sepp · Vroni · Finster', trk: 0, d0: 18, check: LOADED, opt: {pre: SINGLE + "document.querySelectorAll('#drivers button')[7].click();", post: WX('dusk', 'clear', 'alpenglow'), front: true, behind: true}},
  {k: 'play', s: 6, t: 'BIERSTRASSE', u: 'Riesen-Maßkrug stampft', trk: 5, d0: '(rallyTest.hz().stampers[0]?.[0]??400)-44', check: LOADED, opt: {pre: SINGLE + "document.querySelectorAll('#drivers button')[5].click();", post: CALM, off: 3.2}},
];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => {const s = net.createServer(); s.on('error', rej); s.listen(0, '127.0.0.1', () => {const p = s.address().port; s.close(() => res(p));});});
const logs = [];
function cdp(wsUrl, tag) {
  const ws = new WebSocket(wsUrl), pending = new Map(); let seq = 0;
  const ready = new Promise((r, j) => {ws.onopen = r; ws.onerror = j;});
  ws.onmessage = ev => {const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) {const p = pending.get(m.id); pending.delete(m.id); clearTimeout(p.timer); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); return;}
    if (m.method === 'Runtime.exceptionThrown') logs.push(tag + ' EXC ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));};
  const send = (method, params = {}, timeout = 300000) => new Promise((resolve, reject) => {const id = ++seq, timer = setTimeout(() => {pending.delete(id); reject(new Error('CDP timeout: ' + method));}, timeout); pending.set(id, {resolve, reject, timer}); ws.send(JSON.stringify({id, method, params}));});
  const evaluate = async expression => {const r = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true, userGesture: true}, 300000); if (r.exceptionDetails) throw new Error(tag + ': ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text)); return r.result.value;};
  return {ws, ready, send, evaluate};
}
async function waitFor(check, ms, label) {const t = Date.now(); while (Date.now() - t < ms) {if (await check()) return; await sleep(250);} throw new Error('Timeout: ' + label);}

const PAGE = String.raw`
(()=>{
 const W=1080,H=1920,FPS=30,game=document.getElementById('game');
 const comp=document.createElement('canvas');comp.width=W;comp.height=H;const g=comp.getContext('2d');
 const toastEl=document.getElementById('toast');let lastToast='',cap=null,scene=null,still=null;const events=[];
 const CAPS={'FUNKEN-TURBO':['FUNKEN-TURBO!','#ffd23a'],'GLUT-TURBO':['GLUT-TURBO!','#ff8a3a'],'BLITZ-TURBO':['BLITZ-TURBO!','#7cf3ff'],'GLOCKENSCHALTER':['GLOCKENSCHALTER!','#ffc83a'],'PLATT':['PLATT!','#ff6b5a'],'GESCHNAPPT':['GESCHNAPPT!','#9dff8a'],'VERZAUBERT':['VERZAUBERT!','#b8ff9a'],'TRICK-TURBO':['TRICK-TURBO!','#ffe45c']};
 const font=(w,s)=>w+' '+s+'px "Trebuchet MS", "Arial Black", sans-serif';
 const pill=(x,y,w,h,r,fill)=>{g.beginPath();g.roundRect(x,y,w,h,r);g.fillStyle=fill;g.fill();};
 function outlined(t,x,y,size,col,stroke=14){g.font=font('900',size);g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=stroke;g.strokeStyle='#14264a';g.strokeText(t,x,y);g.fillStyle=col;g.fillText(t,x,y);}
 function overlay(t,i,ts,noHud){
  pill(40,60,640,92,46,'#14264acc');g.font=font('900',44);g.textAlign='left';g.textBaseline='middle';g.fillStyle='#fff5d9';g.fillText('SUPPA LEDERHOSN KARTS',74,108);
  if(i<3.6*FPS){const a=Math.min(1,t/.35)*Math.min(1,(3.6-t)/.45);g.globalAlpha=Math.max(0,a);pill(60,380,W-120,500,60,'#14264ad0');outlined('UPDATE',W/2,470,76,'#fff5d9',12);outlined('SUPPA LEDERHOSN',W/2,590,104,'#ffc83a',18);outlined('KARTS',W/2,700,104,'#ffc83a',18);outlined('Kotzhügel Fight · online',W/2,812,58,'#7cf3ff',13);g.globalAlpha=1;}
  else if(scene&&scene.title&&ts<2.2){const a=Math.min(1,ts/.3)*Math.min(1,(2.2-ts)/.4),ty=scene.ty||600;g.globalAlpha=Math.max(0,a);outlined(scene.title,W/2,ty,scene.title.length>14?92:112,'#7cf3ff',16);outlined(scene.sub,W/2,ty+120,50,'#fff5d9',11);g.globalAlpha=1;}
  const cls=toastEl.className||'',txt=toastEl.textContent||'';
  if(!noHud&&cls.startsWith('show')&&txt!==lastToast){lastToast=txt;events.push({i,t:+t.toFixed(3),text:txt});
   if(txt.includes('SAUBER'))cap={text:'SAUBERE RUNDE!',col:'#9dff8a',t0:t};
   else{const key=Object.keys(CAPS).find(k=>txt.toUpperCase().startsWith(k));if(key){const c=CAPS[key];cap={text:c[0],col:c[1],t0:t};}}}
  if(!cls.startsWith('show'))lastToast='';
  if(cap){const k=t-cap.t0;if(k>1.4)cap=null;else{const s=k<.18?.6+.55*(k/.18):k<.3?1.15-.15*((k-.18)/.12):1;g.save();g.translate(W/2,430);g.scale(s,s);g.globalAlpha=Math.max(0,Math.min(1,(1.4-k)/.3));outlined(cap.text,0,0,cap.text.length>14?96:120,cap.col,18);g.restore();g.globalAlpha=1;}}
  const p=rallyTest.racers()[0];if(p&&!noHud){const kmh=Math.round(Math.abs(p.speed)*3.6);pill(W-370,H-270,330,150,40,'#14264acc');g.textAlign='right';g.fillStyle='#fff5d9';g.font=font('900',98);g.fillText(String(kmh),W-158,H-192);g.font=font('800',34);g.fillText('KM/H',W-66,H-166);}
  if(!noHud){pill(40,H-110,640,70,35,'#14264aaa');g.textAlign='left';g.font=font('800',36);g.fillStyle='#ffc83a';g.fillText('Kostenlos im Browser spielbar',74,H-75);}
 }
 const realNow=performance.now.bind(performance);let vt=realNow(),frame=0;
 function tele(r,d,off,sp){const P=rallyTest.posAt(d,off),Q=rallyTest.posAt(d+1,off),h=Math.atan2(Q[0]-P[0],Q[2]-P[2]);
  Object.assign(r,{distance:d,offset:off,x:P[0],z:P[2],h,speed:sp,vx:Math.sin(h)*sp,vz:Math.cos(h)*sp,y:P[1],vy:0,air:false,airT:0,stun:0,safeD:d,lastGround:P[1],boost:0,driftDir:0,drift:0,item:null});}
 window.R55={
  real(){performance.now=realNow;rallyTest.dbg.manual=false;return true;},
  still(url,title,sub){return new Promise(res=>{const im=new Image();im.onload=()=>{still=im;scene={title,sub,f0:frame,ty:300};res(true);};im.src=url;});},
  stillFrame(){const k=(frame-scene.f0)/FPS,z=1+k*.012;g.fillStyle='#14264a';g.fillRect(0,0,W,H);g.save();g.translate(W/2,H/2);g.scale(z,z);g.drawImage(still,-W/2,-H/2,W,H);g.restore();
   overlay(frame/FPS,frame,k,true);frame++;return comp.toDataURL('image/jpeg',.9);},
  place(title,sub,d0,opt){opt=opt||{};const rs=rallyTest.racers(),sp=opt.slow||33;
   if(!opt.keep){tele(rs[0],d0,opt.off||0,sp);if(!rs[1].net)tele(rs[1],d0+9,-3.2,31);if(!rs[2].net)tele(rs[2],d0+19,3,31);if(!rs[3].net)tele(rs[3],d0-7,2.5,33);
   if(opt.behind){for(const [k,dd,o] of [[1,-10,-3.2],[2,-17,3],[3,-24,0]])if(!rs[k].net)tele(rs[k],d0+dd,o,32);}
   for(let k=4;k<rs.length;k++)if(!rs[k].net)tele(rs[k],d0-60-k*8,0,20);}
   if(opt.post)(new Function(opt.post))();
   vt=realNow();performance.now=()=>vt;rallyTest.dbg.manual=true;
   if(!opt.noWarm)for(let i=0;i<24;i++){vt+=1000/FPS;rallyTest.step(2,1/(2*FPS));}   // Kamera einschwingen (nicht aufgenommen)
   scene={title,sub,f0:frame,front:!!opt.front,secs:opt.secs||6};return true;},
  warm(){vt+=1000/FPS;rallyTest.step(2,1/(2*FPS));return true;},
  frame(){{const rs=rallyTest.racers();for(let k=1;k<rs.length;k++)if(!rs[k].net)rs[k].item=null;}   // keine KI-Items im Video
   vt+=1000/FPS;rallyTest.step(2,1/(2*FPS));
   if(scene.front){const th=rallyTest.three(),m=rallyTest.racers()[0].mesh,k=(frame-scene.f0)/(scene.secs*FPS),a=.6-1.2*k,V=th.T.Vector3;
    th.camera.position.copy(m.localToWorld(new V(Math.sin(a)*4.6,2.3,Math.cos(a)*4.6)));th.camera.up.set(0,1,0);th.camera.lookAt(m.localToWorld(new V(0,1.45,0)));th.renderer.render(th.scene,th.camera);}
   g.drawImage(game,0,0,W,H);overlay(frame/FPS,frame,(frame-scene.f0)/FPS);frame++;return comp.toDataURL('image/jpeg',.9);},
  end(){performance.now=realNow;rallyTest.dbg.manual=false;return {events,frames:frame};},
  endCard(){g.drawImage(game,0,0,W,H);g.fillStyle='#14264ae8';g.fillRect(0,0,W,H);
   outlined('NEU',W/2,330,84,'#ffc83a',12);
   g.font=font('800',48);g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff5d9';
   ['Kotzhügel Fight: Arena mit 3 Herzen','Online ohne Codes: offene Räume','Graben-Flug: Flugstrecke im Stahlgraben','Neue Fahrer & Keilflitzer-Karts','Bierstraße & Riesen-Maßkrug','Maß Bier · O’zapft is!'].forEach((l,k)=>g.fillText(l,W/2,470+k*78));
   outlined('SUPPA LEDERHOSN KARTS',W/2,1080,84,'#ffc83a',15);
   g.font=font('800',54);g.fillStyle='#fff5d9';g.fillText('madd1in.github.io/wiesnkart',W/2,1205);
   g.font=font('700',40);g.fillStyle='#7cf3ff';g.fillText('Kein Download \u00b7 l\u00e4uft im Browser',W/2,1280);
   g.font=font('700',36);g.fillStyle='#fff5d9';['Ein gemeinsames Werk von','Blender \u00b7 Unreal \u00b7 ElevenLabs','Opus 5 \u00b7 Opus 5.5 \u00b7 Astra 6 \u00b7 GLM 5.3'].forEach((l,k)=>g.fillText(l,W/2,1460+k*62));
   return comp.toDataURL('image/jpeg',.92);}
 };return true;})()`;
// Gast-Tab: eigene virtuelle Uhr, faehrt per Autopilot, wird vor dem Host-Bild jeweils einen Schritt weitergeschaltet
const GUEST = String.raw`(()=>{const realNow=performance.now.bind(performance);let vt=realNow();
 function tele(r,d,off,sp){const P=rallyTest.posAt(d,off),Q=rallyTest.posAt(d+1,off),h=Math.atan2(Q[0]-P[0],Q[2]-P[2]);
  Object.assign(r,{distance:d,offset:off,x:P[0],z:P[2],h,speed:sp,vx:Math.sin(h)*sp,vz:Math.cos(h)*sp,y:P[1],vy:0,air:false,airT:0,stun:0,safeD:d,lastGround:P[1],boost:0,driftDir:0,drift:0,item:null});}
 window.G55={place(d,off,sp){tele(rallyTest.racers()[0],d,off,sp);vt=realNow();performance.now=()=>vt;rallyTest.dbg.manual=true;return true;},
  step(){vt+=1000/30;rallyTest.step(2,1/60);return true;},real(){performance.now=realNow;rallyTest.dbg.manual=false;return true;}};return true;})()`;

let server, chrome, chrome2;
try {
  const sp = await freePort(), cp = await freePort(), base = 'http://127.0.0.1:' + sp;
  server = spawn(process.execPath, ['server.cjs', String(sp)], {cwd: root, windowsHide: true, stdio: ['ignore', 'ignore', 'pipe']});
  await waitFor(async () => {try {return (await fetch(base)).ok;} catch {return false;}}, 30000, 'server');
  chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + cp, '--user-data-dir=' + path.join(FRAMES, '..', 'r56-frames-profile'),
    '--window-size=1080,1920', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=Translate,CalculateNativeWinOcclusion,WebRtcHideLocalIpsWithMdns', 'about:blank'],
    {windowsHide: true, stdio: ['ignore', 'ignore', 'pipe']});
  await waitFor(async () => {try {return (await fetch('http://127.0.0.1:' + cp + '/json/version')).ok;} catch {return false;}}, 45000, 'chrome');
  // Gast in einem zweiten, eigenen Chrome-Prozess (eigenes Profil) - wie ein zweiter Rechner
  const cp2 = await freePort();
  chrome2 = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + cp2, '--user-data-dir=' + path.join(FRAMES, '..', 'r56-guest-profile'),
    '--window-size=720,1280', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
    '--disable-features=Translate,CalculateNativeWinOcclusion,WebRtcHideLocalIpsWithMdns', 'about:blank'], {windowsHide: true, stdio: ['ignore', 'ignore', 'pipe']});
  await waitFor(async () => {try {return (await fetch('http://127.0.0.1:' + cp2 + '/json/version')).ok;} catch {return false;}}, 45000, 'chrome2');
  const mkTab = async (tag, guest) => {const port = guest ? cp2 : cp;
    const url = (await (await fetch('http://127.0.0.1:' + port + '/json/new?about:blank', {method: 'PUT'})).json()).webSocketDebuggerUrl;
    const c = cdp(url, tag); await c.ready;
    await c.send('Runtime.enable'); await c.send('Page.enable'); await c.send('Emulation.setDeviceMetricsOverride', {width: guest ? 540 : 1080, height: guest ? 960 : 1920, deviceScaleFactor: 1, mobile: false}); return c;};
  const H = await mkTab('host');
  // kein fester Math.random-Seed: Trystero/Nostr bekaemen sonst in jedem Lauf dieselben Kennungen (Relays verwerfen Duplikate)
  await H.send('Page.navigate', {url: base + '/?test=1'});
  await waitFor(() => H.evaluate('!!window.rallyTest').catch(() => false), 90000, 'test API'); await H.evaluate('rallyTest.ready()');
  await H.evaluate(`localStorage.setItem('mr-netName',JSON.stringify('Sepp'));localStorage.setItem('mr-netWhat',JSON.stringify('world'));rallyTest.setClass(100);rallyTest.assist('aus');rallyTest.autopilot(true);rallyTest.gfx('auto');rallyTest.dbg.camBack=6.4;rallyTest.dbg.camUp=3.3;true`);
  // Nachgeladene Modelle (Hindernisse, Wahrzeichen, Wiesnland) vorab laden: ein Rennen anstarten, warten, zurueck ins Menue
  await H.evaluate(`${SINGLE}rallyTest.setTrack(0);rallyTest.start();true`);
  await waitFor(() => H.evaluate(LOADED).catch(() => false), 120000, 'late models');
  await H.evaluate('rallyTest.home();true'); await sleep(5000);
  await H.evaluate(PAGE);
  await H.evaluate('document.getElementById("testPanel").style.display="none";true');
  const shot = async () => {await H.evaluate(`{const t=document.getElementById('toast');t.className='';t.textContent='';}true`); await sleep(400); return 'data:image/jpeg;base64,' + (await H.send('Page.captureScreenshot', {format: 'jpeg', quality: 92})).data;};
  const saveFrame = (n, url) => writeFileSync(path.join(FRAMES, 'f' + String(n).padStart(5, '0') + '.jpg'), Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  let G = null;
  const t0 = Date.now(), cuts = []; let n = 0;
  for (const sc of SCENES) {
    cuts.push({frame: n, title: sc.t || 'Intro', k: sc.k});
    if (sc.k === 'still') {
      if (sc.what === 'rooms') {await H.evaluate(`document.getElementById('onlineBtn').click();true`); await sleep(2500);}
      await H.evaluate(`R55.still(${JSON.stringify(await shot())},${JSON.stringify(sc.t)},${JSON.stringify(sc.u)})`);
      for (let i = 0; i < sc.s * FPS; i++, n++) saveFrame(n, await H.evaluate('R55.stillFrame()'));
      await H.evaluate(`document.getElementById('online').hidden=true;true`);
      continue;
    }
    if (sc.k === 'online') {
      await H.evaluate(`document.getElementById('online').hidden=true;rallyTest.netGo();true`);
      await waitFor(() => H.evaluate('rallyTest.state().state==="race"&&rallyTest.net().go').catch(() => false), 120000, 'online race host');
      await waitFor(() => G.evaluate('rallyTest.state().state==="race"&&rallyTest.net().go').catch(() => false), 120000, 'online race guest');
      await G.evaluate(GUEST);
      await G.evaluate(`G55.place(${sc.d0 + 13},-2.4,31)`);
      await H.evaluate(`R55.place(${JSON.stringify(sc.t)},${JSON.stringify(sc.u)},${sc.d0},${JSON.stringify({post: CALM, noWarm: true, secs: sc.s})})`);
      for (let i = 0; i < 30; i++) {await G.evaluate('G55.step()'); await sleep(12); await H.evaluate('R55.warm()');}
      for (let i = 0; i < sc.s * FPS; i++, n++) {await G.evaluate('G55.step()'); await sleep(12); saveFrame(n, await H.evaluate('R55.frame()'));}
      cuts[cuts.length - 1].netRacers = await H.evaluate('rallyTest.net().netRacers');
      await G.evaluate('G55.real()'); await H.evaluate(`R55.real();document.getElementById('onLeave').click();rallyTest.home();true`);
      try {G.ws.close();} catch {}
      continue;
    }
    await H.evaluate('R55.real()');
    for (let tries = 0; ; tries++) {
      await H.evaluate(`${sc.opt.pre || ''}${sc.trk === 99 ? '' : `rallyTest.setTrack(${sc.trk});`}rallyTest.start();true`); await H.evaluate('rallyTest.ready()');
      await waitFor(() => H.evaluate('rallyTest.state().state==="race"').catch(() => false), 60000, 'race ' + sc.trk);
      if (await H.evaluate(sc.check).catch(() => false)) break;
      if (tries > 8) throw new Error('late models ' + sc.trk);
      await sleep(4000);
    }
    await H.evaluate(`R55.place(${JSON.stringify(sc.t)},${JSON.stringify(sc.u)},${sc.d0},${JSON.stringify({...sc.opt, secs: sc.s})})`);
    for (let i = 0; i < sc.s * FPS; i++, n++) {
      saveFrame(n, await H.evaluate('R55.frame()'));
      if (n % 90 === 0) console.log('frame', n, sc.t, ((Date.now() - t0) / 1000).toFixed(0) + 's');
    }
  }
  const info = await H.evaluate('R55.end()');
  const card = await H.evaluate('R55.endCard()');
  writeFileSync(path.join(FRAMES, 'endcard.jpg'), Buffer.from(card.slice(card.indexOf(',') + 1), 'base64'));
  writeFileSync(path.join(FRAMES, 'events.json'), JSON.stringify({fps: FPS, ...info, cuts, code: CODE}, null, 2));
  console.log('DONE', n, 'frames', JSON.stringify(cuts), JSON.stringify(info.events));
} catch (e) {console.error('FAIL', e.stack || e.message);} finally {
  if (logs.length) console.log('PAGE LOG', logs.slice(0, 20).join('\n'));
  chrome?.kill(); chrome2?.kill(); server?.kill();
}
