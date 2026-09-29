import test from 'node:test';
import assert from 'node:assert/strict';
import {NET_VER, LOBBY_SECS, LOBBY_SOLO_SECS, BACK_SECS, BACK_MAX, voteTally, lobbyReturnAt} from './net.mjs';

test('R60 protocol version bumped for lobby world, open arena and chat', () => {
  assert.ok(NET_VER >= 4);
  assert.ok(LOBBY_SOLO_SECS < LOBBY_SECS);
});
test('vote tally: most votes win, invalid votes ignored, fallback without votes', () => {
  assert.deepEqual(voteTally({}, 11, 3), {track: 3, counts: new Array(11).fill(0), votes: 0});
  const r = voteTally({a: 8, b: 8, c: 2, d: 99, e: -1, f: 'x', g: 2.5}, 11, 0);
  assert.equal(r.track, 8);
  assert.equal(r.votes, 3);
  assert.equal(r.counts[8], 2);
});
test('vote tally: a tie keeps the preselected track, otherwise random among the leaders', () => {
  assert.equal(voteTally({a: 1, b: 4}, 11, 4).track, 4);
  const picks = new Set();
  for (let k = 0; k < 20; k++) picks.add(voteTally({a: 1, b: 4}, 11, 0, () => k / 20).track);
  assert.deepEqual([...picks].sort(), [1, 4]);
});
test('return to the lobby: after the last human, at the latest BACK_MAX after the first', () => {
  assert.equal(lobbyReturnAt(null, null), null);
  assert.equal(lobbyReturnAt(100, null), 100 + BACK_MAX);
  assert.equal(lobbyReturnAt(100, 110), 110 + BACK_SECS);
  assert.equal(lobbyReturnAt(100, 200), 100 + BACK_MAX);
});
