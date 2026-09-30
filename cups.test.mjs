import test from 'node:test';
import assert from 'node:assert/strict';
import {CUPS, cupTracks, cupOf, trophyKey, trophyIcon, cupById} from './cups.mjs';

test('drei Vierer-Cups decken die zwoelf Strecken genau einmal ab', () => {
  const four = CUPS.filter(c => c.tracks);
  assert.equal(four.length, 3);
  const all = four.flatMap(c => c.tracks).sort((a, b) => a - b);
  assert.deepEqual(all, Array.from({length: 12}, (_, i) => i));
  for (const c of four) assert.equal(c.tracks.length, 4);
});

test('Marathon faehrt alle vorhandenen Strecken, Cups kappen fehlende Strecken', () => {
  assert.deepEqual(cupTracks('alle', 5), [0, 1, 2, 3, 4]);
  assert.deepEqual(cupTracks('herz', 11), [8, 9, 10]);
  assert.deepEqual(cupTracks('brezn', 12), [0, 1, 2, 3]);
  assert.deepEqual(cupTracks('gibtsnicht', 12), [0, 1, 2, 3]);
});

test('Strecke waehlt ihren Cup', () => {
  assert.equal(cupOf(0), 'brezn');
  assert.equal(cupOf(6), 'mass');
  assert.equal(cupOf(11), 'herz');
  assert.equal(cupOf(99), 'alle');
});

test('Pokal-Schluessel: Marathon behaelt den alten Schluessel, Cups eigene', () => {
  assert.equal(trophyKey('alle', 100), 'trophy-100');
  assert.equal(trophyKey('mass', 150), 'trophy-mass-150');
  assert.notEqual(trophyKey('brezn', 50), trophyKey('alle', 50));
  assert.equal(trophyIcon(1), '🏆');
  assert.equal(trophyIcon(4), '');
  assert.equal(cupById('herz').name, 'Lebkuchen-Cup');
});
