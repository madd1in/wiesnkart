import test from 'node:test';
import assert from 'node:assert/strict';
import {GEARS, gearOf, rpmOf, engineNote, shiftedUp} from './motor.mjs';

test('Gaenge steigen mit dem Tempo, rueckwaerts zaehlt der Betrag', () => {
  assert.equal(gearOf(0), 0);
  assert.equal(gearOf(7.9), 0);
  assert.equal(gearOf(8), 1);
  assert.equal(gearOf(-16), 2);
  assert.equal(gearOf(100), GEARS.length - 1);
  assert.equal(gearOf(NaN), 0);
});

test('Drehzahl laeuft im Gang von 0 bis 1 und faellt beim Schalten', () => {
  assert.equal(rpmOf(0), 0);
  assert.ok(rpmOf(7.9) > .95);
  assert.equal(rpmOf(8), 0);
  assert.ok(Math.abs(rpmOf(11.5) - .5) < 1e-9);
  assert.ok(rpmOf(60) <= 1.15);
});

test('Motorton: hochdrehen im Gang, beim Hochschalten tiefer, Luft und Turbo heller', () => {
  const before = engineNote(14.9), after = engineNote(15);
  assert.ok(after.f1 < before.f1 - 50, 'Schalten senkt die Tonhoehe deutlich');
  assert.ok(engineNote(20).f1 > after.f1, 'im Gang steigt sie wieder');
  assert.equal(engineNote(20).f2, engineNote(20).f1 / 2);
  assert.ok(engineNote(20, {air: true}).f1 > engineNote(20).f1);
  assert.ok(engineNote(20, {boost: true}).cutoff > engineNote(20).cutoff);
  for (let sp = 0; sp <= 60; sp += .5) {
    const n = engineNote(sp);
    assert.ok(n.f1 >= 62 && n.f1 < 260, 'hoerbarer, nicht schriller Bereich bei ' + sp);
    assert.ok(n.cutoff >= 520 && n.cutoff < 4000);
  }
});

test('Hochschalten wird erkannt, Runterschalten und Start nicht', () => {
  assert.equal(shiftedUp(1, 2), true);
  assert.equal(shiftedUp(2, 2), false);
  assert.equal(shiftedUp(3, 2), false);
  assert.equal(shiftedUp(undefined, 1), false);
});
