import test from 'node:test';
import assert from 'node:assert/strict';
import {HP, hpEnv, hpTop, hpProfile, hpAccel, hpNeed, hpApex, hpLaunchCap, hpRating, hpFindSpot} from './halfpipe.mjs';

const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

test('walls grow smoothly out of the floor at entry and exit', () => {
  const span = 150;
  assert.equal(hpEnv(0, span), 0);
  assert.equal(hpEnv(span, span), 0);
  assert.equal(hpEnv(span / 2, span), 1);
  let prev = 0;
  for (let x = 0; x <= HP.ramp; x += .5) {const e = hpEnv(x, span); assert.ok(e >= prev - 1e-12); prev = e;}
  // keine Stufe: je halben Meter hoechstens ein kleiner Schritt
  for (let x = 0; x < span; x += .5) assert.ok(Math.abs(hpEnv(x + .5, span) - hpEnv(x, span)) < .06);
});

test('cross-section is continuous at the wall foot, on the wall and at the lip', () => {
  const o = {};
  for (const env of [.3, .7, 1]) for (const s of [-1, 1]) {
    const top = hpTop(env);
    for (const u of [0, top / 2, top]) {
      const a = {...hpProfile(s * (HP.flat + u - 1e-7), env, o)}, b = {...hpProfile(s * (HP.flat + u + 1e-7), env, o)};
      assert.ok(near(a.lat, b.lat, 1e-5) && near(a.up, b.up, 1e-5), `jump at u=${u} env=${env}`);
    }
  }
});

test('full-height wall ends vertical at the lip and air goes straight up above it', () => {
  const o = {}, top = hpTop(1);
  const lip = {...hpProfile(HP.flat + top, 1, o)};
  assert.ok(near(lip.up, HP.R, 1e-9) && near(Math.abs(lip.lat), HP.flat + HP.R, 1e-9) && near(lip.th, Math.PI / 2, 1e-9));
  const air = hpProfile(HP.flat + top + 3, 1, o);
  assert.ok(air.air && near(air.lat, HP.flat + HP.R, 1e-9) && near(air.up, HP.R + 3, 1e-9));
  // unrolled length along the surface equals the offset change (arc length parametrisation)
  let L = 0, p0 = hpProfile(0, 1, {});
  const n = 2000, end = HP.flat + top;
  for (let i = 1; i <= n; i++) {const p = hpProfile(end * i / n, 1, {}); L += Math.hypot(p.lat - p0.lat, p.up - p0.up); p0 = p;}
  assert.ok(near(L, end, 1e-3), `arc length ${L} vs ${end}`);
});

test('mirror symmetric: left wall is the right wall mirrored, roll sign flips', () => {
  const a = {...hpProfile(12, 1, {})}, b = {...hpProfile(-12, 1, {})};
  assert.ok(near(a.lat, -b.lat) && near(a.up, b.up) && near(a.phi, -b.phi) && a.phi > 0);
});

test('gravity pulls back to the middle, zero on the floor, full g in the air', () => {
  assert.equal(hpAccel(3, 1), 0);
  assert.ok(hpAccel(HP.flat + 2, 1) < 0 && hpAccel(-(HP.flat + 2), 1) > 0);
  assert.ok(near(hpAccel(HP.flat + hpTop(1) + 2, 1), -HP.g));
  assert.ok(Math.abs(hpAccel(HP.flat + 1, 1)) < Math.abs(hpAccel(HP.flat + 4, 1)));
});

// Seitenbewegung ueber den Querschnitt simulieren (wie im Spiel: halbimplizites Euler mit 60 Hz)
function ride(v0, env = 1, dt = 1 / 60) {
  let off = HP.flat, v = v0, maxU = 0, air = 0, t = 0;
  while (t < 6) {v += hpAccel(off, env) * dt; off += v * dt; t += dt; const u = off - HP.flat; maxU = Math.max(maxU, u); if (u > hpTop(env)) air += dt; if (off < HP.flat && v < 0) break;}
  return {maxH: Math.max(0, maxU - hpTop(env)), air, vBack: -v};
}

test('need sqrt(2gR) across the wall to reach the lip; more speed flies higher and comes back', () => {
  const need = hpNeed();
  assert.ok(need > 14 && need < 17, 'reachable with ~30 degrees at top speed: ' + need.toFixed(1));
  assert.equal(ride(need * .9).air, 0);
  const r = ride(need * 1.35);
  assert.ok(r.air > .5, 'airtime ' + r.air.toFixed(2));
  assert.ok(Math.abs(r.maxH - hpApex(need * 1.35)) < .25, `apex ${r.maxH} vs ${hpApex(need * 1.35)}`);
  assert.ok(Math.abs(r.vBack - need * 1.35) < .6, 'comes back with about the same speed');
});

test('launch cap keeps the flight below maxAir', () => {
  const v = hpLaunchCap(40);
  assert.ok(near(v * v / (2 * HP.g), HP.maxAir, 1e-9));
  assert.equal(hpLaunchCap(5), 5);
  assert.equal(hpApex(80), HP.maxAir);
});

test('rating: small hops give nothing, tricks and big air give more', () => {
  assert.equal(hpRating(.5, true), null);
  const a = hpRating(2, false), b = hpRating(2, true), c = hpRating(6, true);
  assert.ok(a.boost < b.boost && b.boost < c.boost);
  assert.equal(c.spores, 1);
  assert.match(c.label, /^HALFPIPE-TRICK 6,0 m!$/);
});

test('spot finder avoids busy stretches and tight curves, prefers the requested place', () => {
  const length = 1000, kap = d => {const x = ((d % length) + length) % length; return x > 300 && x < 420 ? 1 / 40 : 0;};
  const s = hpFindSpot({length, kap, busy: [[500, 560]], span: 140, near: 520});
  assert.ok(s >= 0);
  const hit = (a, b) => {for (let x = s; x <= s + 140; x++) {const q = ((x % length) + length) % length; if (q > a && q < b) return true;} return false;};
  assert.ok(!hit(500, 560) && !hit(300 - 8, 420 + 8), 'zone at ' + s);
  // wraps over the finish line without complaint
  const w = hpFindSpot({length, kap: () => 0, busy: [], span: 140, near: 990});
  assert.ok(w >= 0);
  // nothing free -> -1
  assert.equal(hpFindSpot({length, kap: () => 1 / 30, busy: [], span: 140, near: 0}), -1);
});
