import test from 'node:test';
import assert from 'node:assert/strict';
import {makeCode, normCode, CODE_CHARS, toLocal, toGlobal, assignSlots, packKart, unpackKart, F, snapBuf, pushSnap, sampleSnap, MAX_PLAYERS, EXTRAP_MS} from './net.mjs';

test('room codes: fixed length, only unambiguous characters, input is normalised', () => {
  let a = 0;
  const code = makeCode(() => (a = (a * 9301 + 49297) % 233280) / 233280);
  assert.equal(code.length, 5);
  assert.ok([...code].every(c => CODE_CHARS.includes(c)));
  assert.ok(!/[IO01]/.test(CODE_CHARS), 'no I/O/0/1');
  assert.equal(normCode(' ab-c d9 '), 'ABCD9');
  assert.equal(normCode(null), '');
});

test('slot mapping: everybody drives as local racer 0, mapping is its own inverse', () => {
  for (let mine = 0; mine < MAX_PLAYERS; mine++) {
    const seen = new Set();
    for (let g = 0; g < MAX_PLAYERS; g++) {
      const l = toLocal(g, mine);
      seen.add(l);
      assert.equal(toGlobal(l, mine), g);
    }
    assert.equal(seen.size, MAX_PLAYERS, 'bijective');
    assert.equal(toLocal(mine, mine), 0);
  }
});

test('host assigns slots 1..7 in join order, keeps previous slots, stops when full', () => {
  const s = assignSlots(['a', 'b', 'c']);
  assert.deepEqual([...s], [['a', 1], ['b', 2], ['c', 3]]);
  const again = assignSlots(['c', 'd'], s);
  assert.equal(again.get('c'), 3, 'keeps slot');
  assert.equal(again.get('d'), 1, 'fills the first free slot');
  const many = assignSlots(Array.from({length: 10}, (_, i) => 'p' + i));
  assert.equal(many.size, MAX_PLAYERS - 1);
  assert.ok(![...many.values()].includes(0), 'slot 0 is the host');
});

test('kart packets round-trip with flags; broken packets are rejected', () => {
  const r = {x: 12.3456, y: .5, z: -7.891, h: 1.23456, speed: 27.44, distance: 812.349, offset: -3.21, driftDir: -1, boost: .3, air: false, stun: 0, shield: 2, mega: 0, shrink: 0, braking: true};
  const p = packKart(r, 4, 2), u = unpackKart(JSON.parse(JSON.stringify(p)));
  assert.equal(u.slot, 4);
  assert.equal(u.x, 12.35);
  assert.equal(u.h, 1.235);
  assert.equal(u.lvl, 2);
  assert.equal(u.fin, null, 'not finished');
  assert.equal(unpackKart(packKart({...r, finishTime: 95.126}, 1)).fin, 95.13);
  assert.ok(u.flags & F.drift && !(u.flags & F.driftR) && u.flags & F.boost && u.flags & F.shield && u.flags & F.brake);
  assert.ok(!(u.flags & F.air) && !(u.flags & F.mega));
  assert.equal(unpackKart([1, 2, 3]), null);
  assert.equal(unpackKart([1, 'x', 3, 4, 5, 6, 7, 8, 9]), null);
  assert.equal(unpackKart('nope'), null);
});

test('interpolation: linear between packets, heading takes the short way, short extrapolation', () => {
  const b = snapBuf();
  pushSnap(b, 1000, {x: 0, y: 0, z: 0, h: 3.1, speed: 10, distance: 100, offset: 0, flags: 0});
  pushSnap(b, 1100, {x: 10, y: 0, z: 0, h: -3.1, speed: 20, distance: 110, offset: 2, flags: F.boost});
  const m = sampleSnap(b, 1050);
  assert.equal(m.x, 5);
  assert.equal(m.distance, 105);
  assert.equal(m.offset, 1);
  assert.ok(Math.abs(Math.abs(m.h) - Math.PI) < .05, 'wraps across +-pi instead of spinning');
  assert.equal(sampleSnap(b, 500).x, 0, 'before the first packet: first packet');
  const late = sampleSnap(b, 1100 + 5000);
  assert.ok(late.distance <= 110 + 20 * EXTRAP_MS / 1000 + 1e-9, 'extrapolation is capped');
  assert.equal(late.stale, true);
  assert.equal(sampleSnap(snapBuf(), 0), null);
});

test('buffer keeps order with equal arrival times and stays bounded', () => {
  const b = snapBuf();
  for (let i = 0; i < 40; i++) pushSnap(b, 1000, {x: i, y: 0, z: 0, h: 0, speed: 0, distance: i, offset: 0, flags: 0});
  assert.ok(b.s.length <= 24);
  for (let i = 1; i < b.s.length; i++) assert.ok(b.s[i].t > b.s[i - 1].t);
});
