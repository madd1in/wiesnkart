import test from 'node:test';
import assert from 'node:assert/strict';
import {CUPS, cupTracks, cupOf, trophyKey, trophyIcon, cupById, weekCup, WEEK_CC} from './cups.mjs';

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

test('R87 Wochen-Cup: jeder Woche derselbe Vierer-Cup in gueltiger Klasse, deterministisch', () => {
  for (let w = 1; w <= 53; w++) {
    const week = `2027-W${String(w).padStart(2, '0')}`, a = weekCup(week);
    assert.deepEqual(a, weekCup(week), 'gleiche Woche -> gleiches Ergebnis');
    assert.equal(a.week, week);
    const c = cupById(a.cup);
    assert.ok(c.tracks && c.tracks.length === 4, 'nie der Marathon');
    assert.ok(WEEK_CC.includes(a.cc), 'Klasse 50/100/150');
  }
});

test('R87 Wochen-Cup: uebers Jahr wechseln Cup und Klasse, Nachbarwochen meist anders', () => {
  const weeks = Array.from({length: 53}, (_, i) => `2026-W${String(i + 1).padStart(2, '0')}`).map(weekCup);
  assert.ok(new Set(weeks.map(w => w.cup)).size >= 2, 'mindestens zwei Cups kommen dran');
  assert.ok(new Set(weeks.map(w => w.cc)).size >= 2, 'mindestens zwei Klassen kommen dran');
  let same = 0;
  for (let i = 1; i < weeks.length; i++) if (weeks[i].cup === weeks[i - 1].cup && weeks[i].cc === weeks[i - 1].cc) same++;
  assert.ok(same <= 2, 'kaum zwei gleiche Wochen hintereinander');
});
