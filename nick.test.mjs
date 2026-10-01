import test from 'node:test';
import assert from 'node:assert/strict';
import {autoNick, NICK_MAX, NICK_PRE, NICK_NOUN} from './nick.mjs';

test('Spitznamen: hoechstens 12 Zeichen, nur Buchstaben/Ziffern, abwechslungsreich', () => {
  let seq = 7; const rnd = () => ((seq = seq * 16807 % 2147483647) / 2147483647);
  const seen = new Set();
  for (let i = 0; i < 500; i++) {const n = autoNick(rnd); assert.ok(n.length <= NICK_MAX && n.length >= 6, n); assert.match(n, /^[\p{L}\p{N}]+$/u, n); seen.add(n);}
  assert.ok(seen.size > 300, 'viele verschiedene');
  assert.equal(autoNick(() => 0), 'TurboBrezn10');
  assert.ok(autoNick(() => .9999).length <= NICK_MAX);
  for (const p of NICK_PRE) for (const q of NICK_NOUN) assert.ok((p + q).length <= NICK_MAX + 2, p + q);
});
