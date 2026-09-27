// Windschatten: eine Spur laden, dann seitlich zum Ueberholen ausscheren.
// Pure, renderer-free state; accepts the racer objects from core.mjs directly.
export const DRAFT = Object.freeze({
  minSpeed: 17,
  minGap: 2.5,
  maxGap: 15,
  wakeWidth: 1.9,
  releaseWidth: 2.35,
  maxReleaseWidth: 6,
  maxReleaseGap: 18,
  maxHeight: 1.4,
  maxAngle: Math.PI / 5.625, // 32 degrees: crossing traffic has no shared wake.
  maxRouteGap: 24,
  chargeSeconds: 1.2,
  readyGrace: 1.2,
  boostSeconds: 1.05,
  cooldownSeconds: 3,
  maxDt: .05,
});

/** Reuse one state per racer. All fields are JSON-safe; no racer/mesh references. */
export function createDraftState() {
  return {
    charge: 0, ready: false, grace: 0, cooldown: 0, targetId: null,
    readyTransition: false, boostTriggered: false, boostSeconds: 0,
  };
}

function clearCharge(state) {
  state.charge = 0;
  state.ready = false;
  state.grace = 0;
  state.targetId = null;
}

function eligible(racer, config) {
  return racer && Number.isFinite(racer.x) && Number.isFinite(racer.z)
    && Number.isFinite(racer.h) && Number.isFinite(racer.speed)
    && racer.speed >= config.minSpeed && !racer.air && !(racer.stun > 0)
    && !racer.reverse && racer.finishTime == null;
}

function targetKey(racer, index) {
  return racer.id ?? index;
}

// Measure in the leader's frame: turning the follower's steering wheel alone
// must not count as physically pulling out of the wake.
function geometry(follower, leader, config, trackLength) {
  if (!eligible(leader, config)) return null;
  if (Math.cos(follower.h - leader.h) < Math.cos(config.maxAngle)) return null;
  const fy = follower.y ?? 0, ly = leader.y ?? 0;
  if (!Number.isFinite(fy) || !Number.isFinite(ly) || Math.abs(fy - ly) > config.maxHeight) return null;
  if (Number.isFinite(follower.distance) && Number.isFinite(leader.distance)) {
    let routeGap = leader.distance - follower.distance;
    if (Number.isFinite(trackLength) && trackLength > config.maxRouteGap * 2) {
      routeGap = ((routeGap % trackLength) + trackLength) % trackLength;
    }
    if (routeGap < config.minGap || routeGap > config.maxRouteGap) return null;
  }
  const dx = leader.x - follower.x, dz = leader.z - follower.z;
  const sh = Math.sin(leader.h), ch = Math.cos(leader.h);
  return { forward: dx * sh + dz * ch, lateral: Math.abs(dx * ch - dz * sh) };
}

function trigger(state, config) {
  clearCharge(state);
  state.cooldown = config.cooldownSeconds;
  state.boostTriggered = true;
  state.boostSeconds = config.boostSeconds;
}

/**
 * Mutates and returns state, never mutates racer or rivals.
 * charge is normalized 0..1. readyTransition / boostTriggered last one update.
 * The caller applies boostSeconds to racer.boost only when boostTriggered.
 * options: {autoRelease, trackLength, config}. AI can autoRelease on full charge.
 * Call with simulated dt only; oversized deltas are capped and paused/invalid
 * deltas do not advance charge, grace, or cooldown.
 */
export function updateDraft(state, racer, rivals, dt, options = {}) {
  state.readyTransition = false;
  state.boostTriggered = false;
  state.boostSeconds = 0;
  const config = options.config ? { ...DRAFT, ...options.config } : DRAFT;
  dt = Number.isFinite(dt) ? Math.max(0, Math.min(dt, config.maxDt)) : 0;
  if (dt === 0) return state;
  if (state.cooldown > 0) {
    state.cooldown = Math.max(0, state.cooldown - dt);
    if (state.cooldown < 1e-9) state.cooldown = 0;
    clearCharge(state);
    return state;
  }
  if (!eligible(racer, config) || racer.boost > 0) {
    clearCharge(state);
    return state;
  }

  if (state.ready) {
    state.grace = Math.max(0, state.grace - dt);
    if (state.grace <= 1e-9) {
      clearCharge(state);
      state.cooldown = config.cooldownSeconds;
      return state;
    }
    let leader = null;
    for (let i = 0; i < rivals.length; i++) {
      if (rivals[i] !== racer && targetKey(rivals[i], i) === state.targetId) {
        leader = rivals[i];
        break;
      }
    }
    const shape = leader && geometry(racer, leader, config, options.trackLength);
    if (!shape || shape.forward < config.minGap || shape.forward > config.maxReleaseGap
      || shape.lateral > config.maxReleaseWidth) {
      clearCharge(state);
      return state;
    }
    if (options.autoRelease || shape.lateral >= config.releaseWidth) trigger(state, config);
    return state;
  }

  let closest = Infinity, candidate = null;
  for (let i = 0; i < rivals.length; i++) {
    const leader = rivals[i];
    if (leader === racer || (racer.id != null && leader.id === racer.id)) continue;
    const shape = geometry(racer, leader, config, options.trackLength);
    if (!shape || shape.forward < config.minGap || shape.forward > config.maxGap
      || shape.lateral > config.wakeWidth || shape.forward >= closest) continue;
    closest = shape.forward;
    candidate = targetKey(leader, i);
  }
  if (candidate === null) {
    clearCharge(state);
    return state;
  }
  // A different rival cannot inherit another rival's nearly complete charge.
  if (candidate !== state.targetId) state.charge = 0;
  state.targetId = candidate;
  state.charge = Math.min(1, state.charge + dt / config.chargeSeconds);
  if (state.charge >= 1 - 1e-9) {
    state.charge = 1;
    state.ready = true;
    state.grace = config.readyGrace;
    state.readyTransition = true;
    if (options.autoRelease) trigger(state, config);
  }
  return state;
}