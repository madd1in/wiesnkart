// Wiesn Kart R65: Retro-Voxel-Baukasten zur Laufzeit (eigene Entwuerfe). Wie art/r61/create_voxel.py, nur ohne Blender:
// ASCII-Pixelkarten, ein Zeichen = ein Farbwuerfel, nur Aussenflaechen, Farben je Flaechenrichtung abgestuft (8-Bit-Licht).
// Reine Funktionen (Spiel und Tests): liefern Float32-Arrays, game.js macht daraus eine BufferGeometry.

/** Ebenen (vorne nach hinten), jede Ebene Zeilen von oben nach unten -> Map "x,y,z" -> Zeichen */
export function voxels(layers) {
  const vox = new Map();
  layers.forEach((rows, zi) => {
    const H = rows.length;
    rows.forEach((row, yi) => {
      for (let xi = 0; xi < row.length; xi++) {const ch = row[xi]; if (ch !== ' ' && ch !== '.') vox.set(`${xi},${H - 1 - yi},${-zi}`, ch);}
    });
  });
  return vox;
}
/** Ein Umriss, depth Ebenen tief; back ersetzt in den hinteren Ebenen jedes Zeichen (z. B. dunklere Rueckseite). */
export function extrude(rows, depth = 2, back = null) {
  const out = [rows];
  for (let i = 1; i < depth; i++) out.push(back ? rows.map(r => r.replace(/[^ .]/g, back)) : rows);
  return out;
}
// Flaechen: Richtung, vier Ecken (Einheitswuerfel), Helligkeit - oben hell, unten dunkel, Seiten dazwischen
const FACES = [
  {n: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], k: 1},
  {n: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], k: .55},
  {n: [1, 0, 0], c: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], k: .78},
  {n: [-1, 0, 0], c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], k: .7},
  {n: [0, 0, 1], c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], k: .9},
  {n: [0, 0, -1], c: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], k: .66},
];
const rgb = hex => [(hex >> 16 & 255) / 255, (hex >> 8 & 255) / 255, (hex & 255) / 255];
// sRGB -> linear (three.js rechnet Vertex-Farben linear; sonst wirken die Pixel blass)
export const toLinear = c => c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4);
/** Geometrie-Daten: nur sichtbare Flaechen, auf den Mittelpunkt (x, z) und den Boden (y = 0) zentriert. */
export function voxelMesh(vox, palette, size = .2, {center = true, ground = false, linear = true} = {}) {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9;
  for (const k of vox.keys()) {const [x, y, z] = k.split(',').map(Number); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); z0 = Math.min(z0, z); z1 = Math.max(z1, z);}
  const cx = center ? (x0 + x1 + 1) / 2 : 0, cy = ground ? y0 : center ? (y0 + y1 + 1) / 2 : 0, cz = center ? (z0 + z1 + 1) / 2 : 0;
  const pos = [], nor = [], col = [], idx = [];
  for (const [k, ch] of vox) {
    const [x, y, z] = k.split(',').map(Number), base = palette[ch];
    if (base === undefined) throw new Error('Farbe fehlt: ' + ch);
    const c = rgb(base);
    for (const f of FACES) {
      if (vox.has(`${x + f.n[0]},${y + f.n[1]},${z + f.n[2]}`)) continue;
      const v = pos.length / 3;
      for (const q of f.c) {pos.push((x + q[0] - cx) * size, (y + q[1] - cy) * size, (z + q[2] - cz) * size); nor.push(...f.n); col.push(...[c[0] * f.k, c[1] * f.k, c[2] * f.k].map(v => linear ? toLinear(v) : v));}
      idx.push(v, v + 1, v + 2, v, v + 2, v + 3);
    }
  }
  return {positions: new Float32Array(pos), normals: new Float32Array(nor), colors: new Float32Array(col), indices: pos.length / 3 > 65535 ? new Uint32Array(idx) : new Uint16Array(idx),
    size: [(x1 - x0 + 1) * size, (y1 - y0 + 1) * size, (z1 - z0 + 1) * size]};
}

// ---------------------------------------------------------------- Modelle (eigene Pixel-Entwuerfe)
// Brezn als 15x10-Pixelknoten: zwei Schlaufen oben, gekreuzte Arme, dicker Bauch unten, Salzkoerner hell
export const BREZN = [
  '..BBBB...BBBB..',
  '.BBssBB.BBssBB.',
  'BB...BBBBB...BB',
  'BB....BBB....BB',
  'BB...BB.BB...BB',
  'BB..BB...BB..BB',
  '.BBBB.....BBBB.',
  '..BBB.....BBB..',
  '...BBBBBBBBB...',
  '....BBsBsBB....',
];
/** Brezn-Geschoss in Gruen oder Rot (Brezn-Trio, R65) */
export function breznModel(kind = 'green') {
  const pal = kind === 'red' ? {O: 0x9a1a14, B: 0xe8352e, s: 0xfff4e0} : kind === 'blue' ? {O: 0x173a9a, B: 0x3d7bff, s: 0xf0f6ff} : {O: 0x1c7a30, B: 0x3cc85a, s: 0xf4fff0};
  return {vox: voxels(extrude(BREZN, 2, 'O')), pal};
}
// "?" und das kopfstehende "¿" als 5x7-Pixel - der Fake-Block traegt das verdrehte Zeichen (der einzige Hinweis)
const QMARK = ['.QQQ.', 'Q...Q', '....Q', '..QQ.', '..Q..', '.....', '..Q..'];
export const flipGlyph = rows => [...rows].reverse().map(r => [...r].reverse().join(''));
/** Pixel-Fragezeichen-Block, n Wuerfel Kantenlaenge. fake: kopfstehendes Fragezeichen, etwas roetlicher */
export function qBlockModel(fake = false, n = 9) {
  const glyph = fake ? flipGlyph(QMARK) : QMARK, vox = new Map(), gx = Math.floor((n - 5) / 2), gy = Math.floor((n - 7) / 2);
  const onGlyph = (u, v) => {const r = glyph[n - 1 - v - gy], c = r && r[u - gx]; return c === 'Q';};
  for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < n; z++) {
    const edge = [x, y, z].filter(q => q === 0 || q === n - 1).length;
    if (!edge) continue;                               // hohl, nur die Schale
    let ch = edge >= 2 ? 'E' : 'F';
    if (edge === 1 && (x === 0 || x === n - 1) && onGlyph(x === 0 ? n - 1 - z : z, y)) ch = 'Q';
    if (edge === 1 && (z === 0 || z === n - 1) && onGlyph(z === 0 ? x : n - 1 - x, y)) ch = 'Q';
    const corner = (a, b) => (a === 1 || a === n - 2) && (b === 1 || b === n - 2);   // Nieten in den Flaechenecken
    if (edge === 1 && ch === 'F' && ((x === 0 || x === n - 1) ? corner(y, z) : (z === 0 || z === n - 1) ? corner(x, y) : corner(x, z))) ch = 'G';
    vox.set(`${x},${y},${-z}`, ch);
  }
  const pal = fake ? {E: 0x9a4a14, F: 0xf0b03a, G: 0x7a4a10, Q: 0xe0402a} : {E: 0x8a5a10, F: 0xf6c23c, G: 0x7a4a10, Q: 0xffffff};
  return {vox, pal};
}
// Pixel-Krone fuer den Online-Sieger (R65): schwebt ueber dem Kart des Fuehrenden
const CROWN = [
  'Y...Y...Y',
  'YY.YYY.YY',
  'YYYYYYYYY',
  'YRYYBYYRY',
  'YYYYYYYYY',
];
export function crownModel() {return {vox: voxels(extrude(CROWN, 2, 'D')), pal: {Y: 0xffd23a, D: 0xc8901a, R: 0xe8352e, B: 0x3d7bff}};}

// ---------------------------------------------------------------- R66: Aufsaetze (Kosmetik, schweben ueber dem Kart)
const HEART = [
  '..WWW.WWW..',
  '.WbbbWbbbW.',
  'WbbpbbbpbbW',
  'WbbbbbbbbbW',
  '.WbbbpbbbW.',
  '..WbbbbbW..',
  '...WbbbW...',
  '....WbW....',
  '.....W.....',
];
const MUG = [
  '.FFFFF...',
  'FFFFFFF..',
  'GFFFFFG..',
  'GYYYYYGHH',
  'GYYYYYG.H',
  'GYYYYYG.H',
  'GYYYYYGHH',
  'GYYYYYG..',
  'GGGGGGG..',
];
const STAR = [
  '....Y....',
  '....Y....',
  '...YYY...',
  'YYYYYYYYY',
  '.YYYOYYY.',
  '..YYYYY..',
  '..YYYYY..',
  '.YY...YY.',
  '.Y.....Y.',
];
/** Aufsatz-Modelle: Lebkuchenherz, Masskrug, Pixel-Stern, Riesenbrezn (braun), Pixel-Krone,
 *  R95 Wiesn-Saison: Saison-Kranz (Lorbeerring mit Schleife), Festzelt-Hut (Zylinder), Gold-Kranz */
const LAUREL = [
  '.GGGGGGG.',
  'GLLGGGLLG',
  'GL.GGG.LG',
  'LG.GYG.GL',
  'LG.GYG.GL',
  'GL.GGG.LG',
  'GLLGGGLLG',
  '.GGLLLGG.',
  '...RYR...',
];
const CYLINDER = [
  '..KKKKK..',
  '..KKKKK..',
  '..KKKKK..',
  'KKKKKKKKK',
  'KRRRRRRRK',
  'KGGGGGGGK',
  '..KKKKK..',
  '..KKKKK..',
];
export function topperModel(id) {
  if (id === 'heart') return {vox: voxels(extrude(HEART, 2, 'b')), pal: {W: 0xfff0f4, b: 0x9a5a2a, p: 0xff5fa8}};
  if (id === 'mug') return {vox: voxels(extrude(MUG, 3)), pal: {F: 0xfffdf2, G: 0xcfe6f0, Y: 0xf5b31a, H: 0xb8d4e0}};
  if (id === 'star') return {vox: voxels(extrude(STAR, 2)), pal: {Y: 0xffd23a, O: 0xff8a1a}};
  if (id === 'brezn') {const m = breznModel('green'); return {vox: m.vox, pal: {O: 0x6a3a14, B: 0xb8702e, s: 0xffffff}};}
  if (id === 'crown') return crownModel();
  if (id === 'cart') return cartModel();
  if (id === 'trophy') return {vox: voxels(extrude(['.GGGGGGG.', 'GGHGGGG.G', 'G.HGGGG.G', 'GGHGGGGGG', '..GGGGG..', '...GGG...', '....G....', '...GGG...', '..DDDDD..', '..DDDDD..'], 3)), pal: {G: 0xffc83a, H: 0xfff4b0, D: 0x6a3a14}};
  if (id === 'laurel') return {vox: voxels(extrude(LAUREL, 2)), pal: {G: 0x2e8a3a, L: 0x5fc46a, Y: 0xffd23a, R: 0xd8262e}};
  if (id === 'laurel2') return {vox: voxels(extrude(LAUREL, 2)), pal: {G: 0xc09a2a, L: 0xffd23a, Y: 0xfff4b0, R: 0xd8262e}};
  if (id === 'cylinder') return {vox: voxels(extrude(CYLINDER, 3)), pal: {K: 0x1c1c24, R: 0xd8262e, G: 0xffd23a}};
  return null;
}

/** Pixel-Bild (2D) aus ASCII-Zeilen, z. B. fuer Menue-Knoepfe: liefert [x, y, Farbe] je Pixel */
export function pixels(rows, pal) {const out = []; rows.forEach((r, y) => {for (let x = 0; x < r.length; x++) {const c = pal[r[x]]; if (c !== undefined) out.push([x, y, c]);}}); return out;}

// ---------------------------------------------------------------- R66: XXL-Stachelpanzer (eigener Entwurf)
/** Kuppel aus Wuerfeln (Radius R), Plattenmuster, heller Rand unten, weisse Stacheln oben und im Kranz */
export function spikyShellModel(R = 6) {
  const vox = new Map(), put = (x, y, z, c) => vox.set(`${x},${y},${z}`, c);
  for (let x = -R; x <= R; x++) for (let z = -R; z <= R; z++) for (let y = 0; y <= R; y++) {
    const d = Math.hypot(x, y * 1.05, z); if (d > R + .35) continue;
    const inner = Math.hypot(x, (y + 1) * 1.05, z) < R - .6 && Math.hypot(x + 1, y * 1.05, z) < R - .6 && Math.hypot(x - 1, y * 1.05, z) < R - .6 && Math.hypot(x, y * 1.05, z + 1) < R - .6 && Math.hypot(x, y * 1.05, z - 1) < R - .6;
    if (inner && y > 0) continue;                                                       // hohl
    let c = y <= 1 ? 'R' : 'S';                                                         // Rand / Panzer
    if (c === 'S') {const a = Math.atan2(z, x), band = Math.floor(y / 2.2), seg = Math.floor((a + Math.PI) / (Math.PI / 3) + band * .5); if ((seg + band) % 2 === 0 && d > R - .6) c = 'P';}
    if (y === 2 && d > R - .7) c = 'D';                                                 // dunkle Naht ueber dem Rand
    put(x, y, z, c);
  }
  const spike = (bx, by, bz, h = 3) => {for (let i = 0; i < h; i++) {const w = i < h - 1 ? 1 : 0; for (let dx = 0; dx <= w; dx++) for (let dz = 0; dz <= w; dz++) put(bx + dx, by + i, bz + dz, i === h - 1 ? 'T' : 'W');}};
  spike(0, R, 0, 4);
  for (let k = 0; k < 6; k++) {const a = k / 6 * Math.PI * 2, rr = R * .72; const x = Math.round(Math.cos(a) * rr), z = Math.round(Math.sin(a) * rr), y = Math.round(Math.sqrt(Math.max(0, R * R - x * x - z * z)) / 1.05); spike(x, y, z, 3);}
  return {vox, pal: {S: 0x2f7a36, P: 0x49a84f, D: 0x1c4a22, R: 0xf1e2b4, W: 0xf7f5ee, T: 0xb9b3a4}};
}

// ---------------------------------------------------------------- R67: Pixel-Gesichter fuer Sprechblasen ueber den Fahrern
export const EMOTE_PIX = {
  happy: ['..YYYYYY..', '.YYYYYYYY.', 'YYKYYYYKYY', 'YYKYYYYKYY', 'YYYYYYYYYY', 'YKYYYYYYKY', 'YYKYYYYKYY', '.YYKKKKYY.', '..YYYYYY..'],
  angry: ['..RRRRRR..', '.RKRRRRKR.', 'RRRKRRKRRR', 'RRKKRRKKRR', 'RRRRRRRRRR', 'RRRRRRRRRR', 'RRRKKKKRRR', '.RKRRRRKR.', '..RRRRRR..'],
  shock: ['..BBBBBB..', '.BBBBBBBB.', 'BBKKBBKKBB', 'BBKKBBKKBB', 'BBBBBBBBBB', 'BBBBKKBBBB', 'BBBKBBKBBB', '.BBBKKBBB.', '..BBBBBB..'],
  love: ['.PP...PP..', 'PPPP.PPPP.', 'PPPPPPPPP.', 'PPPPPPPPP.', '.PPPPPPP..', '..PPPPP...', '...PPP....', '....P.....', '..........'],
};
export const EMOTE_PAL = {Y: 0xffd23a, K: 0x14264a, R: 0xff5a44, B: 0x7ec8ff, P: 0xff5fa8};

// ---------------------------------------------------------------- R67: Voxel-Deko am Streckenrand (je Thema)
function shape(w, h, d, fn) {const vox = new Map(); for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) for (let z = 0; z < d; z++) {const c = fn(x, y, z); if (c) vox.set(`${x},${y},${-z}`, c);} return vox;}
const ball = (x, y, z, cx, cy, cz, r) => (x - cx) ** 2 + (y - cy) ** 2 + (z - cz) ** 2 <= r * r;
export function decoModel(kind) {
  if (kind === 'cactus') return {vox: shape(9, 14, 3, (x, y, z) => {
    const trunk = x >= 3 && x <= 5 && y <= 13 && !(y === 13 && (x === 3 || x === 5));
    const armL = (x >= 0 && x <= 1 && y >= 6 && y <= 10) || (y >= 5 && y <= 6 && x >= 0 && x <= 3);
    const armR = (x >= 7 && x <= 8 && y >= 4 && y <= 8) || (y >= 3 && y <= 4 && x >= 5 && x <= 8);
    if (z !== 1 && !(trunk && z >= 0)) return null;
    if (!(trunk || armL || armR)) return null;
    return (x + y) % 4 === 0 ? 'L' : y === 13 && x === 4 ? 'F' : 'G';}), pal: {G: 0x3f9a45, L: 0x6cc26a, F: 0xff5fa8}};
  if (kind === 'snowman') return {vox: shape(9, 16, 9, (x, y, z) => {
    if (y >= 14 && x >= 3 && x <= 5 && z >= 3 && z <= 5) return 'K';                         // Hut
    if (y === 13 && x >= 2 && x <= 6 && z >= 2 && z <= 6) return 'K';
    if (y === 10 && x === 4 && z === 8) return 'O';                                            // Karottennase
    if (y === 11 && (x === 3 || x === 5) && z === 7) return 'K';                               // Augen
    if (ball(x, y, z, 4, 10.5, 4, 2.6)) return 'W';
    if (y === 8 && z >= 6 && x >= 2 && x <= 6) return 'R';                                      // Schal
    if (ball(x, y, z, 4, 6.5, 4, 3.2)) return (y === 6 || y === 4) && x === 4 && z === 7 ? 'K' : 'W';
    if (ball(x, y, z, 4, 2.5, 4, 3.8)) return 'W';
    return null;}), pal: {W: 0xf4f8ff, K: 0x1d2230, O: 0xff8a1a, R: 0xe8352e}};
  if (kind === 'palm') return {vox: (() => {const vox = new Map(), put = (x, y, z, c) => vox.set(`${x},${y},${-z}`, c);
    let cx = 6; for (let y = 0; y <= 13; y++) {if (y === 5 || y === 10) cx++; for (const [dx, dz] of [[0, 0], [1, 0], [0, 1], [1, 1]]) put(cx + dx, y, 6 + dz, y % 3 === 0 ? 'b' : 'B');}
    for (let k = 0; k < 7; k++) {const a = k / 7 * Math.PI * 2; for (let d = 1; d <= 6; d++) {const x = Math.round(cx + .5 + Math.cos(a) * d), z = Math.round(6.5 + Math.sin(a) * d), y = 14 - Math.floor(d * d / 9); put(x, y, z, d < 5 ? 'L' : 'D'); if (d > 1 && d < 5) put(x, y - 1, z, 'D');}}
    put(cx - 1, 12, 6, 'C'); put(cx + 2, 12, 7, 'C'); put(cx, 12, 8, 'C');
    return vox;})(), pal: {B: 0x9a6a3a, b: 0x7a4e26, L: 0x3cc85a, D: 0x228a3a, C: 0x5a3a1a}};
  if (kind === 'pumpkin') return {vox: shape(9, 8, 9, (x, y, z) => {
    if (y >= 6 && x === 4 && z === 4) return 'S';
    if (!ball(x, y * 1.25, z, 4, 3.2 * 1.25, 4, 4.3)) return null;
    if (z >= 7 && ((y === 4 && (x === 2 || x === 6)) || (y === 2 && x >= 2 && x <= 6 && x !== 4))) return 'Y';   // Gesicht leuchtet
    return (x + z) % 3 === 0 ? 'o' : 'O';}), pal: {O: 0xff8a1a, o: 0xe06a10, S: 0x3f7a2a, Y: 0xfff27a}};
  if (kind === 'shroom') return {vox: shape(11, 11, 11, (x, y, z) => {
    if (y <= 4 && ball(x, 0, z, 5, 0, 5, 1.6)) return 'W';
    if (y >= 5 && ball(x, y * 1.4, z, 5, 5 * 1.4, 5, 5.4) && y <= 10) return ((x * 7 + z * 3 + y * 5) % 11 === 0) && y >= 6 ? 'w' : 'R';
    return null;}), pal: {W: 0xf4ecd8, R: 0xe8352e, w: 0xffffff}};
  if (kind === 'mug') return topperModel('mug');
  if (kind === 'lolly') return {vox: shape(9, 16, 3, (x, y, z) => {
    if (x === 4 && y <= 8 && z === 1) return 'S';
    if (y >= 8 && (x - 4) ** 2 + (y - 12) ** 2 <= 16 && z <= 2) {const rr = Math.hypot(x - 4, y - 12); return z !== 1 && rr > 3.2 ? 'D' : Math.floor(rr * 1.05) % 2 ? 'P' : 'W';}
    return null;}), pal: {S: 0xf4ecd8, P: 0xff5fa8, W: 0xfff4f8, D: 0xd94a8a}};
  return null;
}
export const DECO_FOR = {canyon: ['cactus'], ice: ['snowman'], beach: ['palm'], haunted: ['pumpkin'], forest: ['shroom'], night: ['shroom'], rainbow: ['mug'], fair: ['mug'], choco: ['lolly']};

// ---------------------------------------------------------------- R70: Spielmodul (16-Bit-Hommage, eigener Entwurf: graues Modul mit Brezn-Etikett)
const CART = [
  '.GGGGGGGGGG.',
  'GGDGGGGGGDGG',
  'GLLLLLLLLLLG',
  'GLRRRRRRRRLG',
  'GLRWBBWBBWLG',
  'GLRWBWBWBWLG',
  'GLRRRRRRRRLG',
  'GLLLLLLLLLLG',
  'GGGGGGGGGGGG',
  'GDGDGDGDGDGG',
  'GGGGGGGGGGGG',
];
export function cartModel() {return {vox: voxels(extrude(CART, 3, 'G')), pal: {G: 0x9a9aa8, D: 0x6a6a78, L: 0xf4f4f8, R: 0xd8262e, W: 0xffd23a, B: 0xc07a34}};}

// ---------------------------------------------------------------- R71: Wiesn-Taler (grosse Goldmuenze mit Brezn-Praegung)
export function talerModel(R = 5) {
  const vox = new Map(), emb = ['.B.B.', 'BBBBB', 'B.B.B', '.BBB.'];
  for (let x = -R; x <= R; x++) for (let y = -R; y <= R; y++) {
    const d = Math.hypot(x, y); if (d > R + .3) continue;
    const rim = d > R - 1.2, e = emb[1 - y] && emb[1 - y][x + 2] === 'B';
    for (let z = 0; z < 2; z++) vox.set(`${x + R},${y + R},${-z}`, rim ? 'D' : e ? 'E' : 'G');
  }
  return {vox, pal: {G: 0xffc83a, D: 0xc8901a, E: 0xfff4b0}};
}
