import test from 'node:test';
import assert from 'node:assert/strict';
import {EVENTS, EVENT_IDS, raceEvents, eventVal} from './events.mjs';

test('Event-Runden: fest je Saat, etwa die Haelfte der Runden, nie zweimal dasselbe', () => {
  assert.deepEqual(raceEvents('2026-10-01|3|100'), raceEvents('2026-10-01|3|100'), 'fuer alle gleich');
  let n2 = 0, n3 = 0;
  for (let i = 0; i < 400; i++) {const e = raceEvents('s' + i); if (e[2]) n2++; if (e[3]) n3++; if (e[2] && e[3]) assert.notEqual(e[2], e[3]); for (const k of [2, 3]) if (e[k]) assert.ok(EVENT_IDS.includes(e[k]));}
  assert.ok(n2 > 160 && n2 < 280, 'Runde 2: ' + n2); assert.ok(n3 > 140 && n3 < 260, 'Runde 3: ' + n3);
  assert.equal(eventVal('taler', 'coinMul', 1), 2); assert.equal(eventVal(null, 'coinMul', 1), 1); assert.equal(eventVal('turbo', 'coinMul', 1), 1);
  for (const e of Object.values(EVENTS)) assert.ok(e.n && e.d && e.icon);
});
