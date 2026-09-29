import test from 'node:test';
import assert from 'node:assert/strict';
import {CH, KMH, STAR_XP, starsFor, challengeXP, recordBest, fmt, zoneState, zoneStep, zoneResult, driftState, driftStep, driftMul, jumpState, jumpStep} from './challenge.mjs';

test('stars: thresholds rise and fit the kart (top ~108 km/h, turbo ~144 km/h)', () => {
  for (const k of Object.keys(CH)) {
    const s = CH[k].stars;
    assert.equal(s.length, 3);
    assert.ok(s[0] < s[1] && s[1] < s[2], k);
    assert.equal(starsFor(k, s[0] - .01), 0);
    assert.equal(starsFor(k, s[0]), 1);
    assert.equal(starsFor(k, s[2] + 100), 3);
  }
  assert.ok(CH.trap.stars[0] < 30 * KMH && CH.trap.stars[2] > 30 * KMH && CH.trap.stars[2] < 40 * KMH, 'three stars need a turbo');
  assert.ok(CH.zone.stars[2] < 32 * KMH, 'zone gold is reachable without a turbo chain');
  assert.equal(starsFor('nope', 999), 0);
  assert.equal(starsFor('trap', NaN), 0);
  assert.equal(starsFor('jump', 23, [15, 22, 29]), 2, 'own thresholds per challenge');
  assert.equal(starsFor('jump', 23, [1, 2]), 1, 'broken own thresholds fall back');
});
test('xp only for newly reached stars', () => {
  assert.equal(challengeXP(0, 3), STAR_XP[0] + STAR_XP[1] + STAR_XP[2]);
  assert.equal(challengeXP(1, 2), STAR_XP[1]);
  assert.equal(challengeXP(2, 2), 0);
  assert.equal(challengeXP(3, 1), 0);
});
test('best keeps the maximum', () => {
  assert.deepEqual(recordBest(null, 50), {best: 50, fresh: true});
  assert.deepEqual(recordBest(60, 50), {best: 60, fresh: false});
  assert.deepEqual(recordBest(60, 61), {best: 61, fresh: true});
  assert.deepEqual(recordBest(60, NaN), {best: 60, fresh: false});
});
test('speed zone averages distance over time', () => {
  const s = zoneState();
  for (let i = 0; i < 60; i++) zoneStep(s, 1 / 30, 25);
  for (let i = 0; i < 60; i++) zoneStep(s, 1 / 30, 35);
  assert.ok(Math.abs(zoneResult(s) - 30 * KMH) < 1e-6);
  zoneStep(s, 1, -10);
  assert.ok(zoneResult(s) < 30 * KMH, 'reversing does not add distance but costs time');
  assert.equal(zoneResult(zoneState()), 0);
});
test('drift zone: points while drifting, chain grows with turbo endings and resets on a crash', () => {
  const s = driftState();
  for (let i = 0; i < 30; i++) driftStep(s, 1 / 30, {drifting: true, speed: 28});
  const one = s.pts;
  assert.ok(Math.abs(one - 280) < 1e-6);
  driftStep(s, 1 / 30, {drifting: false, level: 2});
  assert.equal(s.chain, 1);
  assert.equal(driftMul(s), 1.25);
  for (let i = 0; i < 30; i++) driftStep(s, 1 / 30, {drifting: true, speed: 28});
  assert.ok(Math.abs(s.pts - one - 350) < 1e-6);
  driftStep(s, 1 / 30, {drifting: false, level: 0});
  assert.equal(s.chain, 0, 'a drift without turbo breaks the chain');
  s.chain = 9;
  assert.equal(driftMul(s), 2);
  driftStep(s, 1 / 30, {drifting: true, speed: 28, crashed: true});
  assert.equal(s.chain, 0);
});
test('jump distance from takeoff to landing; small hops do not count', () => {
  const s = jumpState();
  assert.equal(jumpStep(s, .1, false, 0, 0), null);
  assert.equal(jumpStep(s, .1, true, 10, 0), null);
  for (let i = 0; i < 8; i++) jumpStep(s, .1, true, 10 + i * 3, 0);
  assert.equal(jumpStep(s, .1, false, 40, 0), 30);
  jumpStep(s, .1, true, 0, 0);
  assert.equal(jumpStep(s, .1, false, 3, 4), null, 'hop shorter than minT');
});
test('format', () => {
  assert.equal(fmt('trap', 123.4), '123 km/h');
  assert.equal(fmt('jump', 31.26), '31,3 m');
  assert.equal(fmt('drift', 2500), '2.500 Pkt');
  assert.equal(fmt('zone', NaN), '—');
});
