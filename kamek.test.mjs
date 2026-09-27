import test from 'node:test';
import assert from 'node:assert/strict';
import { KAMEK, inSection, castInterval, pickTarget, spellPos, stepSpell, spellHits } from './kamek.mjs';

test('section check works inside, outside and across the finish line', () => {
  assert.equal(inSection([100, 300], 150, 1000), true);
  assert.equal(inSection([100, 300], 350, 1000), false);
  assert.equal(inSection([900, 80], 950, 1000), true, 'wraps over the line');
  assert.equal(inSection([900, 80], 40, 1000), true);
  assert.equal(inSection([900, 80], 500, 1000), false);
  assert.equal(inSection([100, 300], 1150, 1000), true, 'second lap maps back');
});

test('cast interval stays in range, even for bad random input', () => {
  assert.equal(castInterval(0), KAMEK.castMin);
  assert.ok(Math.abs(castInterval(.999999) - KAMEK.castMax) < 1e-4);
  assert.equal(castInterval(NaN), (KAMEK.castMin + KAMEK.castMax) / 2);
  assert.equal(castInterval(7), KAMEK.castMax);
});

test('targets land ahead of the kart and stay on the road', () => {
  const t = pickTarget({ distance: 200, offset: 8, speed: 30 }, 1);
  assert.equal(t.d, 200 + KAMEK.ahead + 30 * KAMEK.aheadPerSpeed);
  assert.equal(t.off, 8.2, 'clamped to the road edge');
  const c = pickTarget({ distance: 10, offset: NaN, speed: -5 }, .5);
  assert.equal(c.off, 0);
  assert.equal(c.d, 10 + KAMEK.ahead, 'reverse speed does not pull the target back');
});

test('spell path starts at the wand, peaks in between and lands on the target', () => {
  const from = { x: 0, y: 9, z: 0 }, to = { x: 10, y: 1, z: 20 };
  const a = spellPos(from, to, 0);
  assert.deepEqual([a.x, a.y, a.z, a.landed], [0, 9, 0, false]);
  const mid = spellPos(from, to, KAMEK.flight / 2);
  assert.ok(mid.y > (from.y + to.y) / 2 + KAMEK.apex * .9, 'arcs above the straight line');
  const end = spellPos(from, to, KAMEK.flight * 2);
  assert.deepEqual([end.x, end.y, end.z, end.landed], [10, 1, 20, true]);
});

test('spells fly, lie on the road for a while and then vanish', () => {
  const s = { age: 0 };
  assert.equal(stepSpell(s, KAMEK.flight / 2), 'fly');
  assert.equal(stepSpell(s, KAMEK.flight / 2 + .01), 'lie');
  assert.equal(s.landed, true);
  assert.equal(stepSpell(s, KAMEK.life - .1), 'lie');
  assert.equal(stepSpell(s, .2), 'gone');
  const t = { age: 0 };
  assert.equal(stepSpell(t, NaN), 'fly', 'invalid dt does not advance');
});

test('hits need a landed spell, a grounded kart and a close lane', () => {
  const spell = { d: 500, off: 2, age: KAMEK.flight + .5, landed: true };
  assert.equal(spellHits(spell, { distance: 501, offset: 2.5 }, 1000), true);
  assert.equal(spellHits(spell, { distance: 501, offset: 2.5, air: true }, 1000), false, 'jumping over it');
  assert.equal(spellHits(spell, { distance: 501, offset: 5 }, 1000), false, 'other lane');
  assert.equal(spellHits(spell, { distance: 510, offset: 2 }, 1000), false, 'too far along');
  assert.equal(spellHits({ ...spell, landed: false }, { distance: 500, offset: 2 }, 1000), false, 'still flying');
  assert.equal(spellHits({ ...spell, age: KAMEK.flight + KAMEK.life + .1 }, { distance: 500, offset: 2 }, 1000), false, 'faded');
  assert.equal(spellHits({ ...spell, gone: true }, { distance: 500, offset: 2 }, 1000), false);
  const nearLine = { d: 999.5, off: 0, age: KAMEK.flight + .1, landed: true };
  assert.equal(spellHits(nearLine, { distance: 1000.4, offset: 0 }, 1000), true, 'works across the finish line');
});
