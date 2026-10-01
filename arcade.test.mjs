import test from 'node:test';
import assert from 'node:assert/strict';
import {wrapD, CAM_VIEWS, camViewIndex, nextCamView, TRAP_AT, trapCrossed, trapGrade} from './arcade.mjs';

test('Streckenmeter laufen rundenfest', () => {
  assert.equal(wrapD(-10, 100), 90);
  assert.equal(wrapD(250, 100), 50);
  assert.equal(wrapD(0, 100), 0);
});

test('Kameraansichten wechseln reihum und fangen ungueltige Werte ab', () => {
  assert.equal(CAM_VIEWS.length, 3);
  assert.equal(nextCamView(0), 1);
  assert.equal(nextCamView(2), 0);
  assert.equal(camViewIndex(7), 0);
  assert.equal(camViewIndex('x'), 0);
  assert.equal(camViewIndex(-1), 0);
  assert.ok(CAM_VIEWS[2].back < CAM_VIEWS[0].back && CAM_VIEWS[1].back > CAM_VIEWS[0].back);
});

test('Speed-Trap: Durchfahrt wird genau einmal erkannt, auch ueber die Rundennaht', () => {
  const L = 1000;
  assert.equal(trapCrossed(298, 302, 300, L), true);
  assert.equal(trapCrossed(302, 306, 300, L), false);
  assert.equal(trapCrossed(290, 296, 300, L), false);
  assert.equal(trapCrossed(998, 4, 1, L), true);
  assert.equal(trapCrossed(4, 998, 1, L), false); // rueckwaerts
  assert.equal(trapCrossed(0, 600, 300, L), false); // Sprung (Respawn) zaehlt nicht
  assert.deepEqual(TRAP_AT.length, 2);
  assert.ok(TRAP_AT.every(x => x > .1 && x < .9));
});

test('Speed-Trap-Urteil: erste Messung, Rekord, kein Rekord', () => {
  assert.deepEqual(trapGrade(150.4, null), {kmh: 150, record: true, text: 'ERSTE MESSUNG', cls: 'rec'});
  assert.equal(trapGrade(171, 160).record, true);
  assert.equal(trapGrade(171, 160).text, 'NEUER REKORD');
  const no = trapGrade(150, 160);
  assert.equal(no.record, false);
  assert.equal(no.text, 'REKORD 160');
});

test('Knapp vorbei: nur beim Ueberholen, nah dran, mit Tempo und ohne Sprung', async () => {
  const {nearMiss, NEAR} = await import('./arcade.mjs');
  assert.equal(nearMiss(-.4, .3, 1.2, 30), true);
  assert.equal(nearMiss(-.4, .3, 3.5, 30), false, 'zu weit daneben');
  assert.equal(nearMiss(-.4, .3, 1.2, 10), false, 'zu langsam');
  assert.equal(nearMiss(.3, -.4, 1.2, 30), false, 'ueberholt worden');
  assert.equal(nearMiss(-20, 15, 1.2, 30), false, 'Sprung');
  assert.equal(nearMiss(undefined, .3, 1.2, 30), false);
  assert.ok(NEAR.boost > 0 && NEAR.boost < 1);
});
