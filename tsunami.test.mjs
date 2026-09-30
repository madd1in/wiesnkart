import test from 'node:test';
import assert from 'node:assert/strict';
import {TSU, tsunamiPhase, tsunamiSurf, tsunamiLength, waveFront} from './tsunami.mjs';

test('Ablauf: Warnung, Welle, Flut, Ablaufen, aus', () => {
  assert.equal(tsunamiPhase(-1).phase, 'off');
  assert.equal(tsunamiPhase(1).phase, 'warn');
  assert.equal(tsunamiPhase(TSU.warn + 1).phase, 'wave');
  assert.equal(tsunamiPhase(TSU.warn + TSU.wave + 5).phase, 'flood');
  assert.equal(tsunamiPhase(TSU.warn + TSU.wave + TSU.flood + 1).phase, 'recede');
  assert.equal(tsunamiPhase(tsunamiLength() + .1).phase, 'off');
});

test('Wasserstand steigt mit der Welle und faellt beim Ablaufen', () => {
  assert.equal(tsunamiPhase(1).water, 0);
  const mid = tsunamiPhase(TSU.warn + TSU.wave / 2).water;
  assert.ok(mid > .4 && mid < .6);
  assert.equal(tsunamiPhase(TSU.warn + TSU.wave + 1).water, 1);
  assert.ok(tsunamiPhase(TSU.warn + TSU.wave + TSU.flood + TSU.recede * .75).water < .3);
});

test('Wave-Rider nur, solange genug Wasser da ist', () => {
  assert.ok(!tsunamiSurf(tsunamiPhase(1)));
  assert.ok(!tsunamiSurf(tsunamiPhase(TSU.warn + .5)));
  assert.ok(tsunamiSurf(tsunamiPhase(TSU.warn + TSU.wave * .8)));
  assert.ok(tsunamiSurf(tsunamiPhase(TSU.warn + TSU.wave + 10)));
  assert.ok(!tsunamiSurf(tsunamiPhase(TSU.warn + TSU.wave + TSU.flood + TSU.recede * .8)));
  assert.ok(TSU.flood >= 15);
});

test('Wellenfront laeuft ueber die ganze Insel', () => {
  const span = 250;
  assert.equal(waveFront(tsunamiPhase(1), span), null);
  assert.equal(waveFront({phase: 'wave', k: 0}, span), -span);
  assert.equal(waveFront({phase: 'wave', k: 1}, span), span);
});
