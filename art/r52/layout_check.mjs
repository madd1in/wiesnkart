// R52 Layout-Pruefung: legt Menue (und mit RACE=1 das Renn-HUD) auf 15 Bildschirmgroessen und meldet Elemente,
// die aus ihrem Kasten ragen, abgeschnitten sind oder sich ueberdecken. Erwartet den Server (npm start, Port 4218).
// Aufruf: node art/r52/layout_check.mjs   [VIEWS=p360,l640 RACE=1]
// Google Fonts laden hinter manchen Proxys nicht zuverlaessig - liegen die Dateien in .scratch/fonts (fonts.css und
// woff2, Dateiname = Pfad mit _ statt /), werden sie lokal ausgeliefert, sonst misst das Skript mit Ersatzschrift.
import {createRequire} from 'node:module';
const require = createRequire(process.env.PW_REQUIRE || import.meta.url);
const {chromium} = require('playwright');
import {mkdirSync, readFileSync, existsSync} from 'node:fs';
const OUT = process.env.OUT || '.scratch/r52-layout', FONTS = '.scratch/fonts/';
mkdirSync(OUT, {recursive: true});
const VP = {
  p360: [360, 640, 1], p375: [375, 667, 1], p390: [390, 844, 1], p412: [412, 915, 1], tab: [768, 1024, 1], tabL: [1024, 768, 1],
  l640: [640, 360, 1], l667: [667, 375, 1], l740: [740, 360, 1], l844: [844, 390, 1], l915: [915, 412, 1],
  d1280: [1280, 800, 0], d1366: [1366, 768, 0], d1920: [1920, 1080, 0], d1024: [1024, 640, 0],
};
const views = (process.env.VIEWS || Object.keys(VP).join(',')).split(',');
const RACE = !!process.env.RACE;
async function routeFonts(ctx) {
  if (!existsSync(FONTS + 'fonts.css')) return;
  await ctx.route(/fonts\.googleapis\.com/, r => r.fulfill({status: 200, contentType: 'text/css', body: readFileSync(FONTS + 'fonts.css', 'utf8')}));
  await ctx.route(/fonts\.gstatic\.com/, r => {const f = new URL(r.request().url()).pathname.slice(1).replace(/\//g, '_'); try {r.fulfill({status: 200, contentType: 'font/woff2', body: readFileSync(FONTS + f)});} catch {r.fulfill({status: 404, body: ''});}});
}
const browser = await chromium.launch({...(process.env.CHROME ? {executablePath: process.env.CHROME} : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const CHECK_MENU = () => {
  const out = [];
  const panel = document.querySelector('#menu .menu-panel'), pr = panel.getBoundingClientRect();
  const vis = el => {const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';};
  const areas = [...panel.children].filter(vis);
  const name = el => (el.id ? '#' + el.id : el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '')) + (el.textContent ? ' "' + el.textContent.trim().slice(0, 18) + '"' : '');
  // 1) children leaving their area (grid child of panel)
  for (const a of areas) {
    const ar = a.getBoundingClientRect();
    for (const el of a.querySelectorAll('*')) {
      // der schraege Titel darf mit seinem Schlagschatten ueber den Rand stehen
      if (!vis(el) || el.matches('.menu-title, .menu-title *')) continue;
      const r = el.getBoundingClientRect();
      const tol = 3;
      if (r.right > ar.right + tol || r.left < ar.left - tol || r.bottom > ar.bottom + tol + 8) out.push(`leaves ${name(a)}: ${name(el)} [${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}] area [${Math.round(ar.left)},${Math.round(ar.top)},${Math.round(ar.right)},${Math.round(ar.bottom)}]`);
    }
  }
  // 2) overlapping areas
  for (let i = 0; i < areas.length; i++) for (let j = i + 1; j < areas.length; j++) {
    const a = areas[i].getBoundingClientRect(), b = areas[j].getBoundingClientRect();
    const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    // der Startknopf klebt auf kleinen Handys absichtlich unten ueber dem scrollenden Inhalt (position: sticky)
    const sticky = e => getComputedStyle(e).position === 'sticky';
    if (ox > 4 && oy > 4 && !(areas[i].id === 'tracks' || areas[j].id === 'tracks') && !sticky(areas[i]) && !sticky(areas[j])) out.push(`overlap ${name(areas[i])} x ${name(areas[j])} (${Math.round(ox)}x${Math.round(oy)})`);
  }
  // 3) clipped text
  for (const el of panel.querySelectorAll('button, b, small, span, em')) {
    // absichtlich beschnitten: gesperrter Spiegel-Knopf (nur Symbol), Schloss auf Farben, Zielflagge im Startknopf
    if (!vis(el) || el.matches('#mirrorBtn, .swatch, #start')) continue;
    const s = getComputedStyle(el);
    if ((s.overflow === 'hidden' || s.overflowX === 'hidden' || el.tagName === 'BUTTON') && el.scrollWidth > el.clientWidth + 2 && s.textOverflow !== 'ellipsis') out.push(`clipped ${name(el)} ${el.scrollWidth}>${el.clientWidth}`);
  }
  // text wider than its container (inline b inside button)
  for (const el of panel.querySelectorAll('.seg button b, #tracks .track b, #daily b')) {
    if (!vis(el)) continue;
    const r = el.getBoundingClientRect(), pr2 = el.parentElement.getBoundingClientRect();
    if (r.right > pr2.right + 1 || r.left < pr2.left - 1) out.push(`text-out ${name(el)} ${Math.round(r.width)} in ${Math.round(pr2.width)}`);
    const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.2;
    if (el.closest('.seg') && r.height > lh * 1.6) out.push(`wraps ${name(el)} h=${Math.round(r.height)}`);
  }
  if (pr.bottom > innerHeight + 2 && !matchMedia('(max-width:620px)').matches) out.push(`panel below viewport ${Math.round(pr.bottom)}>${innerHeight}`);
  return out;
};
const CHECK_HUD = () => {
  const out = [];
  const ids = ['place', 'rivalTag', 'wxStrip', 'item', 'map', 'spores', 'speed', 'message', 'toast', 'titem', 'raceTip', 'owPanel'];
  const sel = {place: '.position', item: '#item', speed: '.speed'};
  const els = ids.map(id => [id, document.querySelector(sel[id] || '#' + id)]).filter(([, e]) => e && e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none' && +getComputedStyle(e).opacity > 0.05);
  const rt = document.querySelector('.race-top'); if (rt) els.push(['race-top', rt]);
  for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
    const a = els[i][1].getBoundingClientRect(), b = els[j][1].getBoundingClientRect();
    if (els[i][1].contains(els[j][1]) || els[j][1].contains(els[i][1])) continue;
    const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (ox > 3 && oy > 3) out.push(`hud-overlap ${els[i][0]} x ${els[j][0]} (${Math.round(ox)}x${Math.round(oy)})`);
  }
  for (const b of document.querySelectorAll('#touch button')) {
    const r = b.getBoundingClientRect(); if (!r.width) continue;
    for (const c of b.querySelectorAll('*')) {const q = c.getBoundingClientRect(); if (q.width && (q.left < r.left - 1 || q.right > r.right + 1)) out.push(`touch-text-out ${b.getAttribute('aria-label')} ${c.tagName} ${Math.round(q.width)}>${Math.round(r.width)}`);}
    if (b.scrollWidth > b.clientWidth + 2) out.push(`touch-clipped ${b.getAttribute('aria-label')} ${b.scrollWidth}>${b.clientWidth}`);
  }
  return out;
};
for (const v of views) {
  const [w, h, touch] = VP[v];
  const ctx = await browser.newContext({viewport: {width: w, height: h}, isMobile: !!touch, hasTouch: !!touch, deviceScaleFactor: touch ? 2 : 1, ignoreHTTPSErrors: true});
  await routeFonts(ctx);
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:4218/?test=1', {waitUntil: 'load'});
  await page.waitForFunction(() => window.rallyTest, null, {timeout: 120000});
  await page.evaluate(() => rallyTest.ready());
  await page.evaluate(() => document.getElementById('testPanel')?.remove());
  await page.evaluate(() => document.fonts.ready); const fontOk = await page.evaluate(() => document.fonts.check('italic 900 16px Rubik')); if (!fontOk) console.log('!! Rubik not loaded');
  await page.waitForTimeout(700);
  const res = await page.evaluate(CHECK_MENU);
  await page.screenshot({path: `${OUT}/${v}_menu.png`});
  console.log(`== ${v} ${w}x${h} menu: ${res.length ? '\n  ' + res.join('\n  ') : 'OK'}`);
  if (RACE) {
    await page.evaluate(() => rallyTest.start());
    await page.waitForTimeout(300);
    await page.evaluate(() => {rallyTest.autopilot(true); rallyTest.dbg.manual = true; rallyTest.tick(60 * 5); rallyTest.hud();});
    await page.evaluate(msg => {rallyTest.setItem('shell'); rallyTest.hud(); const t = document.getElementById('toast'); t.textContent = msg; t.className = 'show good'; const m = document.getElementById('message'); m.textContent = 'RUNDE 2'; m.style.opacity = 1;}, process.env.TOAST || 'WINDSCHATTEN-BOOST!');
    await page.evaluate(() => rallyTest.step(2));
    const r2 = await page.evaluate(CHECK_HUD);
    await page.screenshot({path: `${OUT}/${v}_race.png`});
    console.log(`   race: ${r2.length ? '\n  ' + r2.join('\n  ') : 'OK'}`);
  }
  await ctx.close();
}
await browser.close();
