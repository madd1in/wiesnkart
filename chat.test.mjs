import test from 'node:test';
import assert from 'node:assert/strict';
import {CHAT_MAX, CHAT_KEEP, EMOJIS, QUICK, HORNS, cleanChat, packChat, unpackChat, chatLimiter, pushLog} from './chat.mjs';

test('chat text is cleaned: control, zero-width and bidi characters go, whitespace collapses', () => {
  assert.equal(cleanChat('  Servus\n\tzusammen  '), 'Servus zusammen');
  assert.equal(cleanChat('a​b‮c\u0007d'), 'abc d');
  assert.equal(cleanChat(null), '');
  assert.equal(cleanChat('<b>hi</b>'), '<b>hi</b>', 'kept as text - the game only ever inserts it as textContent');
});
test('chat text is cut to CHAT_MAX characters (emoji-safe)', () => {
  const long = '🥨'.repeat(CHAT_MAX + 20);
  const c = cleanChat(long);
  assert.equal(Array.from(c).length, CHAT_MAX);
  assert.ok(!c.includes('�'));
});
test('rough words are masked as whole words only', () => {
  assert.equal(cleanChat('du Wichser!'), 'du *******!');
  assert.equal(cleanChat('SHIT happens'), '**** happens');
  assert.equal(cleanChat('Schittlerwiese'), 'Schittlerwiese', 'no false positive inside words');
});
test('pack/unpack: emojis and quick phrases only by index, text validated', () => {
  assert.deepEqual(packChat({e: 2}), {e: 2});
  assert.equal(packChat({e: EMOJIS.length}), null);
  assert.equal(packChat({e: -1}), null);
  assert.equal(packChat({e: 1.5}), null);
  assert.deepEqual(packChat({q: 0}), {q: 0});
  assert.equal(packChat({q: QUICK.length}), null);
  assert.deepEqual(packChat({t: '  gg  '}), {t: 'gg'});
  assert.equal(packChat({t: '   '}), null);
  assert.equal(packChat('x'), null);
  assert.deepEqual(unpackChat({e: 5}), {kind: 'emoji', text: EMOJIS[5], e: 5});
  assert.deepEqual(unpackChat({q: 1}), {kind: 'quick', text: QUICK[1], q: 1});
  assert.deepEqual(unpackChat({t: 'Revanche?'}), {kind: 'text', text: 'Revanche?'});
  assert.deepEqual(unpackChat({t: 42}), {kind: 'text', text: '42'});
  assert.equal(unpackChat(undefined), null);
});
test('limiter: burst, window and minimum gap', () => {
  const L = chatLimiter({burst: 3, win: 1000, gap: 100});
  assert.ok(L.ok(0));
  assert.ok(!L.ok(50), 'too fast');
  assert.ok(L.ok(150));
  assert.ok(L.ok(300));
  assert.ok(!L.ok(500), 'burst used up');
  assert.ok(L.ok(1100), 'window moved on');
});
test('R90 Hupen: als Index verpackt, ungueltige Nummern fallen durch', () => {
  assert.deepEqual(packChat({h: 0}), {h: 0});
  assert.deepEqual(unpackChat({h: 2}), {kind: 'horn', text: '📢 ' + HORNS[2], h: 2});
  assert.equal(packChat({h: HORNS.length}), null);
  assert.equal(packChat({h: -1}), null);
  assert.equal(packChat({h: '0'}), null);
  assert.equal(unpackChat({h: 99}), null);
});
test('log keeps the newest CHAT_KEEP entries', () => {
  const log = [];
  for (let i = 0; i < CHAT_KEEP + 7; i++) pushLog(log, i);
  assert.equal(log.length, CHAT_KEEP);
  assert.equal(log[0], 7);
  assert.equal(log[log.length - 1], CHAT_KEEP + 6);
});
