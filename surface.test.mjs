import test from 'node:test';
import assert from 'node:assert/strict';
import {TIDE, tideLevel, tideFlooded, tideRising, tideDryFor, SURF, surfFront, surfHits, ICE, iceSurf, curlOff, BLOCK, blockScale, SENT, sentinelState, sentinelSpan, sentinelHits, sentinelNextHot} from './surface.mjs';

test('tide: level stays in 0..1 and both ebb and flood stand for a while', () => {
  let flood = 0, dry = 0, n = 0;
  for (let t = 0; t < TIDE.period; t += .05, n++) {
    const l = tideLevel(t);
    assert.ok(l >= 0 && l <= 1, 'level ' + l);
    if (tideFlooded(l)) flood++; else if (l < .05) dry++;
  }
  assert.ok(flood / n > .25 && flood / n < .5, 'flooded share ' + flood / n);
  assert.ok(dry / n > .2, 'dry share ' + dry / n);
  assert.equal(tideLevel(0), tideLevel(TIDE.period), 'periodic');
});
test('tide: rising detection and dry look-ahead agree with the level', () => {
  const t0 = TIDE.period * .3;
  assert.equal(tideRising(t0), tideLevel(t0 + .25) > tideLevel(t0));
  for (let t = 0; t < TIDE.period; t += .7) {
    const dry = tideDryFor(t, 4);
    if (dry) for (let s = 0; s <= 4; s += .5) assert.ok(!tideFlooded(tideLevel(t + s)));
  }
  assert.equal(tideDryFor(0, 0), !tideFlooded(tideLevel(0)));
});
test('surf: a wave crosses from the sea side to the land side, then pauses', () => {
  const a = surfFront(0, 1), b = surfFront(1, 1);
  assert.ok(a && b && b.off < a.off, 'moves toward land');
  assert.ok(Math.abs(a.off - SURF.from) < 1e-9);
  const left = surfFront(1, -1);
  assert.ok(Math.abs(left.off + b.off) < 1e-9, 'mirrored for the left sea side');
  const travel = (SURF.from - SURF.to) / SURF.speed;
  assert.ok(travel < SURF.period, 'pause between waves');
  assert.equal(surfFront(travel + .05, 1), null);
  assert.ok(surfHits(a, a.off + .5));
  assert.ok(!surfHits(a, a.off + 3));
  assert.ok(!surfHits(null, 0));
});
test('ice: less side grip, faster drift charge; normal road unchanged', () => {
  const on = iceSurf(true), off = iceSurf(false);
  assert.ok(on.gripMul < .6 && on.chargeMul > 1 && on.accelMul < 1);
  assert.deepEqual(off, {gripMul: 1, chargeMul: 1, accelMul: 1});
  assert.ok(ICE.aiCorner < 1);
  for (let t = 0; t < 20; t += .3) assert.ok(Math.abs(curlOff(t, 6, .8, 1)) <= 6 + 1e-9);
});
test('ice blocks: gone after the hit, regrow smoothly', () => {
  assert.equal(blockScale(5, null), 1);
  assert.equal(blockScale(5, 4), 0);
  assert.equal(blockScale(4 + BLOCK.regrow + BLOCK.grow + .01, 4), 1);
  const mid = blockScale(4 + BLOCK.regrow + BLOCK.grow / 2, 4);
  assert.ok(mid > .2 && mid < .8);
});
test('sentinel: cycle rest -> windup (warn) -> slam -> lie (hot) -> recover', () => {
  const seen = new Set();
  let hotT = 0, warnBeforeHot = false, wasWarn = false;
  for (let t = 0; t < SENT.cycle; t += .01) {
    const s = sentinelState(t);
    seen.add(s.phase);
    assert.ok(s.ang >= -.4 && s.ang <= Math.PI / 2 + 1e-9, 'angle ' + s.ang);
    if (s.hot) {hotT += .01; if (wasWarn) warnBeforeHot = true;}
    wasWarn = s.warn || (wasWarn && !s.hot);
  }
  assert.deepEqual([...seen].sort(), ['lie', 'recover', 'rest', 'slam', 'windup']);
  assert.ok(warnBeforeHot, 'the slam is announced');
  assert.ok(hotT > .5 && hotT < 1.2, 'hot window ' + hotT);
  assert.equal(sentinelState(SENT.cycle * 3 + .5).phase, sentinelState(.5).phase);
});
test('sentinel: the far lane stays safe, the near lane is hit only while hot and inside the band', () => {
  const [lo, hi] = sentinelSpan(1);
  assert.ok(hi > 7 && lo < 0 && lo > -7.6, 'covers own side and a bit past the middle: ' + lo + '..' + hi);
  const hot = sentinelState(SENT.rest + SENT.windup + SENT.slam + .1);
  assert.ok(hot.hot);
  assert.ok(sentinelHits(hot, 1, 0, 4));
  assert.ok(!sentinelHits(hot, 1, 0, -6.5), 'far lane is safe');
  assert.ok(!sentinelHits(hot, 1, SENT.band + 1, 4), 'outside the band');
  assert.ok(!sentinelHits(sentinelState(1), 1, 0, 4), 'resting halberd does nothing');
  assert.ok(sentinelHits(hot, -1, 0, -4) && !sentinelHits(hot, -1, 0, 6.5), 'mirrored for the left side');
  const nx = sentinelNextHot(0);
  assert.ok(sentinelState(nx).hot && !sentinelState(nx - .1).hot);
});
