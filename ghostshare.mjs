// Wiesn Kart R92: Geister-Duelle per Link - reine Logik (Tests in ghostshare.test.mjs), kein Netz noetig.
// Ein Zeitfahr-Geist ist eine 10-Hz-Aufzeichnung aus fünf Ganzzahl-Reihen (x/y/z in 0,1 m, h in 0,01 rad,
// d Streckenmeter in 0,1 m, s. recordGhost in game.js). Roh als JSON ist das viel zu lang fuer einen Link
// (rund 25 kB pro Minute); deshalb wird hier fuer den Link auf 5 Hz ausgeduennt (jeder zweite Wert - die
// Wiedergabe interpoliert ohnehin zwischen den Stuetzstellen, zurueckgefuellt ist die Bahn identisch),
// je Reihe in Zickzack-Varints der Deltas gepackt und base64url-kodiert:
//   10 s Geist ~ 0,7 kB, 2 Minuten ~ 5 kB Link.
export const GS_VER = 1, GS_MAX_N = 2401;   // hoechstens ~2 Minuten (bei 5 Hz 601 Werte je Reihe)

const zig = v => (v << 1) ^ (v >> 31);                 // int -> unsigned (kleine |v| bleiben klein)
const unzig = u => (u >>> 1) ^ -(u & 1);
const pushVar = (out, u) => { do { let b = u & 31; u >>>= 5; if (u) b |= 32; out.push(b); } while (u); };
const readVar = (bytes, p) => { let u = 0, k = 0; for (; p.i < bytes.length; k += 5) { const b = bytes[p.i++]; u |= (b & 31) << k; if (!(b & 32)) break; } return u >>> 0; };

function packRow(vals) {
  const out = [];
  let prev = 0;
  for (const v of vals) { pushVar(out, zig((v | 0) - prev)); prev = v | 0; }
  return out;
}
function unpackRow(bytes, p, n) {
  const out = new Array(n);
  let prev = 0;
  for (let i = 0; i < n; i++) { prev += unzig(readVar(bytes, p)); out[i] = prev; }
  return out;
}

// Eigener base64url-Codec (btoa gibt es nicht ueberall und Buffer nicht im Browser)
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
function b64url(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
    s += B64[b0 >> 2] + B64[(b0 & 3) << 4 | (b1 ?? 0) >> 4];
    if (b1 === undefined) break;
    s += B64[(b1 & 15) << 2 | (b2 ?? 0) >> 6];
    if (b2 === undefined) break;
    s += B64[b2 & 63];
  }
  return s;
}
function unb64url(str) {
  const out = [];
  for (let i = 0; i + 1 < str.length; i += 4) {
    const q = str.slice(i, i + 4), c = [...q].map(ch => B64.indexOf(ch));
    if (c.some(v => v < 0) || c[0] === undefined || c[1] === undefined) return null;
    out.push(c[0] << 2 | c[1] >> 4);
    if (c[2] === undefined) break;
    out.push((c[1] & 15) << 4 | c[2] >> 2);
    if (c[3] === undefined) break;
    out.push((c[2] & 3) << 6 | c[3]);
  }
  return out;
}

/** Geist-Aufzeichnung -> Link-Fragment (ohne "g="). data = {x,y,z,h,d} (10 Hz, Ints). */
export function packGhost(data) {
  const rows = ['x', 'y', 'z', 'h', 'd'].map(k => (data?.[k] || []).map(v => v | 0));
  if (!rows.every(r => r.length === rows[0].length) || rows[0].length < 2) return null;
  const full = rows[0].length;
  if (full > GS_MAX_N) return null;
  const thin = rows.map(r => r.filter((_, i) => i % 2 === 0));   // 10 Hz -> 5 Hz
  const n = thin[0].length, body = thin.flatMap(r => packRow(r)), len = body.length + 5;
  if (len > 65535) return null;
  const bytes = [GS_VER, n & 255, n >> 8, len & 255, len >> 8, ...body];
  return b64url(bytes);
}

/** Link-Fragment -> Geist (10 Hz zurueckgefuellt, Stuetzstellen per Lerp). Ungueltig -> null. */
export function unpackGhost(str) {
  if (typeof str !== 'string' || !str.length || str.length > 40000) return null;
  const bytes = unb64url(str);
  if (!bytes || bytes.length < 6 || bytes[0] !== GS_VER) return null;
  const n = bytes[1] | bytes[2] << 8, len = bytes[3] | bytes[4] << 8, p = {i: 5};
  if (n < 2 || n > Math.ceil(GS_MAX_N / 2) || bytes.length !== len) return null;   // Laenge exakt: abgeschnitten/angehaengt = ungueltig
  const rows = [];
  for (let r = 0; r < 5; r++) {
    const row = unpackRow(bytes, p, n);
    if (row.some(v => !Number.isSafeInteger(v) || Math.abs(v) > 1e7)) return null;
    rows.push(row);
  }
  if (p.i !== bytes.length) return null;                          // kein Muell hinten dran
  const up = (thin, isAngle) => {                                 // 5 Hz -> 10 Hz (h ueber den kuerzesten Winkel)
    const out = new Array((thin.length - 1) * 2 + 1);
    for (let i = 0; i < thin.length; i++) {
      out[i * 2] = thin[i];
      if (i + 1 < thin.length) {
        let dv = thin[i + 1] - thin[i];
        if (isAngle) dv = ((dv + 314 + 6280) % 628) - 314;        // Zentiradiant, Umbruch bei +-pi
        let m = Math.round(thin[i] + dv / 2);
        if (isAngle && m > 314) m -= 628; else if (isAngle && m < -314) m += 628;
        out[i * 2 + 1] = m;
      }
    }
    return out;
  };
  const [x, y, z, h, d] = rows.map((r, idx) => up(r, idx === 3));
  return {x, y, z, h, d};
}

/** Rueckgabe-Laufzeit des Geistes in Sekunden aus der Laenge (10 Hz). */
export const ghostTime = data => Math.max(0, ((data?.x?.length || 0) - 1) / 10);

/** Alles fuer den Link: Parameter-Teil "ver~strecke~zeitCs~fahrer~farbe~name~fragment" (schon encodiert). */
export function ghostLink({track, time, driver, color, name, frag}) {
  if (!Number.isInteger(track) || track < 0 || !(time > 0) || !frag) return null;
  const nm = String(name || 'Fahrer').replace(/[~\n\r]/g, ' ').trim().slice(0, 16) || 'Fahrer';
  return [GS_VER, track, Math.round(time * 100), driver | 0, color >>> 0, encodeURIComponent(nm), frag]
    .map(v => typeof v === 'string' ? v : String(v)).join('~');
}

/** Link-Teil (nach "g=") zerlegen. Ungueltig -> null, sonst {ver,track,time,driver,color,name,frag}. */
export function parseGhostLink(part) {
  const f = String(part || '').split('~');
  if (f.length !== 7 || +f[0] !== GS_VER) return null;
  const track = +f[1], timeCs = +f[2], driver = +f[3], color = +f[4];
  if (!Number.isInteger(track) || track < 0 || track > 99 || !Number.isInteger(timeCs) || timeCs <= 0 || timeCs > 360000
    || !Number.isInteger(driver) || driver < 0 || driver > 31 || !Number.isInteger(color) || color < 0 || color > 0xffffff || !f[6]) return null;
  let name = 'Fahrer';
  try { name = decodeURIComponent(f[5]).slice(0, 16) || 'Fahrer'; } catch { /* kaputter Code: Name bleibt "Fahrer" */ }
  return {ver: GS_VER, track, time: timeCs / 100, driver, color, name, frag: f[6]};
}
