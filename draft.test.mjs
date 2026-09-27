import test from 'node:test';
import assert from 'node:assert/strict';
import { DRAFT, createDraftState, updateDraft } from './draft.mjs';
import { racer } from './core.mjs';

function pair() {
  const follower = { ...racer(0, 'Follower', 0), y: 0, speed: 24, distance: 100 };
  const leader = { ...racer(1, 'Leader', 0), y: 0, z: 9, speed: 24, distance: 109 };
  return { follower, leader, rivals: [follower, leader], state: createDraftState() };
}
function step(p, seconds = .05, options = {}) {
  return updateDraft(p.state, p.follower, p.rivals, seconds, { trackLength: 1000, ...options });
}
function charge(p, options = {}) {
  for (let i = 0; i < 24; i++) step(p, .05, options);
  return p.state;
}

test('charges behind a moving rival, arms once, and boosts only after lateral exit', () => {
  const p = pair();
  for (let i = 0; i < 23; i++) step(p);
  assert.equal(p.state.ready, false);
  assert.ok(p.state.charge > .9 && p.state.charge < 1);
  step(p);
  assert.equal(p.state.ready, true);
  assert.equal(p.state.readyTransition, true);
  assert.equal(p.state.boostTriggered, false);
  step(p);
  assert.equal(p.state.readyTransition, false);
  p.follower.x = 2.1;
  step(p);
  assert.equal(p.state.boostTriggered, false, 'release has a small hysteresis band');
  p.follower.x = 2.4;
  const returned = step(p);
  assert.equal(returned, p.state, 'returns reusable state');
  assert.equal(p.state.boostTriggered, true);
  assert.equal(p.state.boostSeconds, DRAFT.boostSeconds);
  assert.equal(p.state.cooldown, DRAFT.cooldownSeconds);
  assert.equal(p.state.ready, false);
  assert.equal(p.state.charge, 0);
  assert.equal(p.follower.boost, 0, 'caller owns applying physics boosts');
});

test('opposite, crossing, parallel remote roads and different deck elevations do not charge', () => {
  const mutations = [
    p => p.leader.h = Math.PI,
    p => p.leader.h = Math.PI / 2,
    p => p.leader.distance = 350,
    p => p.leader.distance = 95,
    p => p.leader.y = 4,
    p => p.leader.z = 1,
    p => p.leader.z = 20,
    p => p.leader.x = 3,
  ];
  for (const mutate of mutations) {
    const p = pair(); mutate(p); charge(p);
    assert.equal(p.state.charge, 0);
    assert.equal(p.state.ready, false);
  }
});

test('route distance wraps correctly across the finish line', () => {
  const p = pair(); p.follower.distance = 995; p.leader.distance = 4;
  charge(p);
  assert.equal(p.state.ready, true);
});

test('wake geometry rotates with the leader and steering alone cannot release it', () => {
  const p = pair();
  p.follower.h = p.leader.h = Math.PI / 2;
  p.leader.x = 9; p.leader.z = 0;
  charge(p);
  assert.equal(p.state.ready, true);
  p.follower.h += .4;
  step(p);
  assert.equal(p.state.boostTriggered, false);
  p.follower.z = -2.4;
  step(p);
  assert.equal(p.state.boostTriggered, true);
});

test('airborne, stunned, reversing, stopped or finished racers cannot charge or release', () => {
  for (const member of ['follower', 'leader']) {
    for (const mutation of [
      r => r.air = true, r => r.stun = .1, r => r.reverse = true,
      r => r.speed = -20, r => r.speed = 0, r => r.finishTime = 0,
    ]) {
      const p = pair(); charge(p); mutation(p[member]); p.follower.x = 2.4; step(p);
      assert.equal(p.state.boostTriggered, false);
      assert.equal(p.state.ready, false);
      p.follower.x = 0; charge(p);
      assert.equal(p.state.charge, 0);
    }
  }
});

test('ready window expires without a free boost and requires cooldown plus a fresh charge', () => {
  const p = pair(); charge(p);
  for (let i = 0; i < 24; i++) step(p);
  assert.equal(p.state.ready, false);
  assert.equal(p.state.boostTriggered, false);
  assert.equal(p.state.cooldown, DRAFT.cooldownSeconds);
  p.follower.x = 2.4; step(p);
  assert.equal(p.state.boostTriggered, false);
});

test('leaving the wake before charge or switching rivals resets charge', () => {
  const p = pair(); for (let i = 0; i < 20; i++) step(p);
  p.follower.x = 2.1; step(p);
  assert.equal(p.state.charge, 0);
  p.follower.x = 0; for (let i = 0; i < 20; i++) step(p);
  p.leader.id = 2; step(p);
  assert.ok(p.state.charge < .05);
  assert.equal(p.state.targetId, 2);
});

test('active boosts and cooldown prevent chained boost farming', () => {
  const p = pair(); charge(p, { autoRelease: true });
  assert.equal(p.state.boostTriggered, true);
  for (let i = 0; i < 60; i++) {
    step(p, .05, { autoRelease: true });
    assert.equal(p.state.boostTriggered, false);
    assert.equal(p.state.charge, 0);
  }
  assert.equal(p.state.cooldown, 0);
  p.follower.boost = .5;
  for (let i = 0; i < 30; i++) step(p);
  assert.equal(p.state.charge, 0);
  p.follower.boost = 0; charge(p);
  assert.equal(p.state.ready, true);
});

test('a different target or an invalid route cannot redeem an already armed boost', () => {
  for (const mutate of [
    p => p.rivals.pop(), p => p.leader.id = 7,
    p => p.leader.distance = 300, p => p.leader.y = 5,
    p => p.leader.h = Math.PI / 2, p => p.leader.z = -1,
    p => p.follower.x = 10,
  ]) {
    const p = pair(); charge(p); p.follower.x = 2.4; mutate(p); step(p);
    assert.equal(p.state.boostTriggered, false);
    assert.equal(p.state.ready, false);
  }
});

test('zero/negative/invalid dt pauses timers, and a long frame cannot instantly charge', () => {
  const p = pair();
  for (const dt of [0, -1, NaN, Infinity]) step(p, dt);
  assert.equal(p.state.charge, 0);
  step(p, 3600);
  assert.ok(p.state.charge > 0 && p.state.charge < .05);
  charge(p);
  const grace = p.state.grace;
  p.follower.x = 2.4;
  step(p, 0);
  assert.equal(p.state.grace, grace);
  assert.equal(p.state.boostTriggered, false);
  step(p);
  const cooldown = p.state.cooldown;
  step(p, NaN);
  assert.equal(p.state.cooldown, cooldown);
});

test('state is JSON-safe even when peers contain cyclic rendering objects', () => {
  const p = pair(); p.leader.mesh = p.leader; charge(p);
  assert.doesNotThrow(() => JSON.stringify(p.state));
});

test('configuration overrides allow bounded tuning without changing defaults', () => {
  const p = pair();
  step(p, .05, { config: { chargeSeconds: .05, boostSeconds: .7 }, autoRelease: true });
  assert.equal(p.state.boostTriggered, true);
  assert.equal(p.state.boostSeconds, .7);
  assert.equal(DRAFT.chargeSeconds, 1.2);
});