import test from 'node:test';
import assert from 'node:assert/strict';
import {voxels, extrude, voxelMesh, breznModel, qBlockModel, crownModel, flipGlyph} from './voxel.mjs';

test('voxel: nur Aussenflaechen, zentriert, Farben abgestuft', () => {
  const one = voxelMesh(voxels([['A']]), {A: 0xffffff}, 1);
  assert.equal(one.indices.length, 36, 'Einzelwuerfel: 6 Flaechen');
  const two = voxelMesh(voxels([['AA']]), {A: 0xffffff}, 1);
  assert.equal(two.indices.length, 60, 'zwei Wuerfel nebeneinander: innere Flaechen fallen weg');
  assert.deepEqual(two.size, [2, 1, 1]);
  const xs = [...two.positions].filter((_, i) => i % 3 === 0);
  assert.equal(Math.min(...xs), -1); assert.equal(Math.max(...xs), 1);
  const cols = new Set([...one.colors].map(v => v.toFixed(2)));
  assert.ok(cols.size >= 5, 'Flaechen je Richtung unterschiedlich hell');
  assert.throws(() => voxelMesh(voxels([['Z']]), {}, 1), /Farbe fehlt/);
});

test('voxel: Modelle bauen sich, Fake-Block traegt das kopfstehende Fragezeichen', () => {
  for (const m of [breznModel('green'), breznModel('red'), qBlockModel(false), qBlockModel(true), crownModel()]) {
    const g = voxelMesh(m.vox, m.pal, .2);
    assert.ok(g.indices.length > 0 && g.indices.length % 6 === 0);
    assert.equal(g.positions.length, g.colors.length);
  }
  assert.equal(extrude(['AB'], 3, 'D')[2][0], 'DD');
  assert.deepEqual(flipGlyph(['ab', 'cd']), ['dc', 'ba']);
  const real = qBlockModel(false), fake = qBlockModel(true), q = m => [...m.vox.values()].filter(c => c === 'Q').length;
  assert.ok(q(real) > 20 && q(real) === q(fake), 'gleich viele Zeichen-Pixel');
  const hollow = qBlockModel(false, 9);
  assert.ok(!hollow.vox.has('4,4,-4'), 'innen hohl');
});

test('R66: Aufsatz-Modelle bauen sich', async () => {
  const {topperModel} = await import('./voxel.mjs');
  for (const id of ['heart', 'mug', 'star', 'brezn', 'crown', 'trophy']) {const m = topperModel(id); assert.ok(m, id); assert.ok(voxelMesh(m.vox, m.pal, .1).indices.length > 0, id);}
  assert.equal(topperModel('none'), null);
});

test('R66: XXL-Stachelpanzer - Kuppel mit Stacheln, hohl', async () => {
  const {spikyShellModel} = await import('./voxel.mjs');
  const m = spikyShellModel(6), g = voxelMesh(m.vox, m.pal, .22), c = [...m.vox.values()];
  assert.ok(c.filter(x => x === 'W').length >= 7 * 3, 'sieben Stacheln'); assert.ok(c.includes('R') && c.includes('P'));
  assert.ok(!m.vox.has('0,3,0'), 'innen hohl'); assert.ok(g.size[0] > 2.5 && g.size[0] < 3.2, 'gut 2,5 m breit');
});

test('R67: Voxel-Deko je Thema baut sich', async () => {
  const {decoModel, DECO_FOR} = await import('./voxel.mjs');
  for (const kinds of Object.values(DECO_FOR)) for (const k of kinds) {const m = decoModel(k); assert.ok(m && m.vox.size > 20, k); const g = voxelMesh(m.vox, m.pal, .3); assert.ok(g.indices.length > 0, k);}
  assert.equal(decoModel('unbekannt'), null);
});
