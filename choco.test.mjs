import test from 'node:test';
import assert from 'node:assert/strict';
import {MUD, mudShape, onMud, mudSurf, mudDodge, BOULDER, boulderState, boulderHits} from './choco.mjs';

test('Pfuetze: in der Mitte volle Breite, an den Enden schmal, ausserhalb nichts', () => {
  assert.equal(mudShape(.5), 1);
  assert.ok(mudShape(.05) < .6);
  assert.equal(mudShape(-.1), 0);
  assert.equal(mudShape(1.2), 0);
  const p = {len: 30, off: -2, hw: 3};
  assert.ok(onMud(p, 15, -2));
  assert.ok(onMud(p, 15, .5));
  assert.ok(!onMud(p, 15, 1.5));
  assert.ok(!onMud(p, 1, 1));      // vorn schmal
  assert.ok(!onMud(p, 31, -2));
});

test('Matsch bremst, Turbo bremst kaum', () => {
  assert.deepEqual(mudSurf(false, false), {speedMul: 1, gripMul: 1});
  assert.equal(mudSurf(true, false).speedMul, MUD.slow);
  assert.ok(mudSurf(true, true).speedMul > mudSurf(true, false).speedMul);
});

test('KI weicht zur naeheren freien Seite aus und bleibt auf der Strasse', () => {
  const p = {len: 20, off: 1, hw: 2.5};
  assert.equal(mudDodge(5.5, p), 5.5);                     // schon frei
  const l = mudDodge(1.5, p);
  assert.ok(Math.abs(l - 1) >= p.hw + 1 && Math.abs(l) <= 6.2);
  assert.equal(mudDodge(0, {len: 20, off: 0, hw: 6.5}), 0); // ganze Breite: durch
  assert.ok(mudDodge(4, {len: 20, off: 4, hw: 2}) < 4);     // am Rand: nach innen
});

test('Brocken: wartet, rollt quer, versinkt, Zyklus wiederholt sich', () => {
  const w = boulderState(.2, 1);
  assert.equal(w.phase, 'wait');
  assert.equal(w.off, BOULDER.from);
  const r = boulderState(BOULDER.wait + 1, 1);
  assert.equal(r.phase, 'roll');
  assert.ok(r.off < BOULDER.from && r.off > BOULDER.to);
  const l = boulderState(BOULDER.wait + 1, -1);
  assert.equal(l.off, -r.off);
  const dur = (BOULDER.from - BOULDER.to) / BOULDER.speed;
  assert.equal(boulderState(BOULDER.wait + dur + .1, 1).phase, 'sink');
  assert.equal(boulderState(BOULDER.period + .2, 1).phase, 'wait');
  assert.ok(BOULDER.wait + dur + BOULDER.sink < BOULDER.period);
});

test('Treffer nur beim Rollen und nah genug', () => {
  const st = {phase: 'roll', off: 0};
  assert.ok(boulderHits(st, 0, 1));
  assert.ok(!boulderHits(st, 4, 0));
  assert.ok(!boulderHits(st, 0, 4));
  assert.ok(!boulderHits({phase: 'wait', off: 0}, 0, 0));
});
