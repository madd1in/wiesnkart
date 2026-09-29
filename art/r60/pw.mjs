// R60 QA-Helfer (Linux/Playwright): startet server.cjs und Chromium, liefert page + Aufraeumen.
// Aufruf aus anderen Skripten: const {open}=await import('./pw.mjs'); const q=await open({mobile:false});
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import net from 'node:net';
import path from 'node:path';
const require = createRequire(import.meta.url);
let pw; try {pw = require('playwright');} catch {pw = require('/opt/node22/lib/node_modules/playwright');}
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => {const s = net.createServer(); s.on('error', rej); s.listen(0, '127.0.0.1', () => {const p = s.address().port; s.close(() => res(p));});});
export async function open({width = 1280, height = 720, query = 'test=1', seedRandom = true, browsers = 1} = {}) {
  const port = await freePort();
  const server = spawn(process.execPath, ['server.cjs', String(port)], {cwd: root, stdio: ['ignore', 'ignore', 'pipe']});
  for (let i = 0; i < 120; i++) {try {if ((await fetch('http://127.0.0.1:' + port)).ok) break;} catch {} await sleep(250);}
  const browser = await pw.chromium.launch({executablePath: process.env.CHROME || '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--autoplay-policy=no-user-gesture-required']});
  const errors = [], pages = [];
  for (let b = 0; b < browsers; b++) {
    const ctx = await browser.newContext({viewport: {width, height}});
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push({b, kind: 'exception', text: String(e.stack || e)}));
    page.on('console', m => {if (m.type() === 'error') errors.push({b, kind: 'console.error', text: m.text()});});
    page.on('response', r => {if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) errors.push({b, kind: 'http', text: r.status() + ' ' + r.url()});});
    if (seedRandom) await page.addInitScript(`{let a=0x38c0ffee+${b};Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}`);
    await page.goto(`http://127.0.0.1:${port}/?${query}`);
    await page.waitForFunction(() => !!window.rallyTest, null, {timeout: 180000});
    await page.evaluate(() => rallyTest.ready());
    pages.push(page);
  }
  return {page: pages[0], pages, errors, port, close: async () => {try {await browser.close();} catch {} server.kill();}};
}
