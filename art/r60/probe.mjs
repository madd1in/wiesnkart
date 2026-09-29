// R60: Ausdruecke auf einer Strecke auswerten (Konsole mitschneiden): node art/r60/probe.mjs <track> "<js-Ausdruck>"
import {open} from './pw.mjs';
const ti = +process.argv[2], expr = process.argv[3] || 'rallyTest.r60()';
const q = await open(), P = q.page, logs = [];
P.on('console', m => {if (m.type() === 'warning' || m.type() === 'warn') logs.push(m.text());});
try {await P.evaluate(i => rallyTest.setTrack(i), ti); await P.evaluate(() => rallyTest.ready()); console.log(JSON.stringify(await P.evaluate(expr)));} catch (e) {console.log('ERR', e.message);}
console.log('warnings', JSON.stringify(logs.slice(0, 10)));
console.log('errors', JSON.stringify(q.errors.filter(e => !/ERR_CERT/.test(e.text)).slice(0, 10)));
await q.close();
