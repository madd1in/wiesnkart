import test from 'node:test';
import assert from 'node:assert/strict';
import {NAV, navPick, navRepeat, isConsole} from './padnav.mjs';

// Raster 3x2 Knoepfe (100x40, Abstand 10) plus ein breiter Startknopf darunter
const R = (x, y, w = 100, h = 40) => ({x, y, w, h});
const grid = [R(0, 0), R(110, 0), R(220, 0), R(0, 50), R(110, 50), R(220, 50), R(0, 120, 320, 60)];

test('ohne Fokus: oben links', () => {
  assert.equal(navPick(null, grid, 'down'), 0);
  assert.equal(navPick(null, [], 'down'), -1);
});

test('rechts/links/unten/oben im Raster', () => {
  assert.equal(navPick(grid[0], grid, 'right'), 1);
  assert.equal(navPick(grid[1], grid, 'right'), 2);
  assert.equal(navPick(grid[2], grid, 'right'), -1);
  assert.equal(navPick(grid[1], grid, 'left'), 0);
  assert.equal(navPick(grid[1], grid, 'down'), 4);
  assert.equal(navPick(grid[4], grid, 'up'), 1);
  assert.equal(navPick(grid[5], grid, 'down'), 6);   // zum breiten Startknopf
  assert.equal(navPick(grid[6], grid, 'up') >= 3, true);
});

test('seitlich versetzte Knoepfe: bevorzugt die ueberlappende Spalte', () => {
  const list = [R(0, 0), R(300, 60), R(40, 60)];
  assert.equal(navPick(list[0], list, 'down'), 2);
});

test('Halten wiederholt nach Pause, Loslassen setzt zurueck', () => {
  const st = {};
  assert.equal(navRepeat(st, 'down', 0), 'down');
  assert.equal(navRepeat(st, 'down', .1), null);
  assert.equal(navRepeat(st, 'down', NAV.first + .01), 'down');
  assert.equal(navRepeat(st, 'down', NAV.first + .05), null);
  assert.equal(navRepeat(st, 'down', NAV.first + NAV.next + .02), 'down');
  assert.equal(navRepeat(st, null, 2), null);
  assert.equal(navRepeat(st, 'left', 2.01), 'left');
});

test('Konsole erkennen', () => {
  assert.ok(isConsole('Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox Series X) AppleWebKit/537.36 Edg/120', ''));
  assert.ok(isConsole('Mozilla/5.0 Chrome', '?tv=1'));
  assert.ok(!isConsole('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140', '?test=1'));
});
