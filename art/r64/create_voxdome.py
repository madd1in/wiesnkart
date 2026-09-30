"""Suppa Lederhosn Karts R64: leichter Retro-Pixel-Voxel-Charme fuer den Riesendom (eigene Entwuerfe, 16-Bit-Abendsonne).
Wie art/r61/create_voxel.py: ASCII-Pixelkarten, ein Zeichen = ein Farbblock, nur Aussenflaechen. Export assets/voxdome.glb:
  VD_Sun      grosser Pixel-Sonnenball (Ringe von Goldgelb nach Orange)
  VD_Cloud    blockige Pixelwolke (Pfirsich/Weiss), treibt ueber dem Wolkenmeer
  VD_Banner   Pixel-Banner an einer Stange mit Sonnenwappen (violett/gold)
  VD_Knight   Voxel-Waechterstatue mit Grossschwert und Turmschild (Silber/Gold, eigener Entwurf)
  VD_Brazier  Kohlebecken auf Saeule mit Pixelflamme
  VD_Bird0/1  Pixel-Vogel, Fluegel oben/unten
Aufruf: blender -b --factory-startup --python art/r64/create_voxdome.py
"""
import sys, math, json, pathlib, importlib
sys.path.append(r'C:/Users/User/Documents/Playground/mushroom-rally/art/lib')
import bpy, bmesh
import blib
importlib.reload(blib)
from blib import *

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
blib.init_scene('R64_VoxDome')
PAL = {
    'Y': ('VdSunCore', (1, .9, .45, 1), .6, 0, (1, .85, .35, 1), 3.0),
    'O': ('VdSunMid', (1, .6, .15, 1), .6, 0, (1, .55, .12, 1), 2.4),
    'R': ('VdSunRim', (.95, .32, .1, 1), .6, 0, (.9, .28, .08, 1), 1.8),
    'w': ('VdCloudW', (.98, .94, .9, 1), .9, 0, (.5, .42, .38, 1), .35),
    'p': ('VdCloudP', (1, .72, .55, 1), .9, 0, (.55, .3, .2, 1), .35),
    'q': ('VdCloudS', (.72, .55, .75, 1), .9, 0, None, 0),
    'v': ('VdViolet', (.28, .1, .45, 1), .8, 0, None, 0),
    'V': ('VdVioletL', (.5, .22, .7, 1), .75, 0, None, 0),
    'g': ('VdGold', (1, .72, .18, 1), .35, .7, None, 0),
    'e': ('VdGoldGlow', (1, .8, .3, 1), .4, .3, (1, .7, .2, 1), 1.5),
    's': ('VdSilver', (.62, .64, .7, 1), .3, .85, None, 0),
    'S': ('VdSilverL', (.85, .87, .92, 1), .25, .9, None, 0),
    'k': ('VdDark', (.06, .05, .08, 1), .8, 0, None, 0),
    'b': ('VdStone', (.62, .52, .4, 1), .85, 0, None, 0),
    'B': ('VdStoneL', (.8, .7, .55, 1), .8, 0, None, 0),
    'o': ('VdFlame', (1, .5, .08, 1), .5, 0, (1, .45, .05, 1), 2.2),
    'y': ('VdFlameCore', (1, .85, .35, 1), .5, 0, (1, .75, .25, 1), 3.0),
    'c': ('VdBirdBody', (.95, .95, .98, 1), .7, 0, None, 0),
    'a': ('VdBirdBeak', (1, .65, .1, 1), .5, 0, None, 0),
    'W': ('VdWood', (.3, .17, .07, 1), .8, 0, None, 0),
}
use_materials({k: material(n, c, r, m, e, s_) for k, (n, c, r, m, e, s_) in PAL.items()})


def voxels(layers):
    vox = {}
    for zi, rows in enumerate(layers):
        H = len(rows)
        for yi, row in enumerate(rows):
            for xi, ch in enumerate(row):
                if ch not in ' .':
                    vox[(xi, H - 1 - yi, -zi)] = ch
    return vox


def extrude(rows, depth=2, back=None):
    return [rows] + [[(''.join(back if c not in ' .' else c for c in r) if back else r) for r in rows] for _ in range(depth - 1)]


def build(name, vox, size=.2):
    xs = [k[0] for k in vox]; zs = [k[2] for k in vox]
    cx = (min(xs) + max(xs) + 1) / 2
    cz = (min(zs) + max(zs) + 1) / 2
    part = Part(name)
    dirs = [((1, 0, 0), [(1, 0, 0), (1, 1, 0), (1, 1, 1), (1, 0, 1)]), ((-1, 0, 0), [(0, 0, 1), (0, 1, 1), (0, 1, 0), (0, 0, 0)]),
            ((0, 1, 0), [(0, 1, 0), (0, 1, 1), (1, 1, 1), (1, 1, 0)]), ((0, -1, 0), [(0, 0, 0), (1, 0, 0), (1, 0, 1), (0, 0, 1)]),
            ((0, 0, 1), [(0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1)]), ((0, 0, -1), [(1, 0, 0), (0, 0, 0), (0, 1, 0), (1, 1, 0)])]
    by = {}
    for k, ch in vox.items():
        by.setdefault(ch, []).append(k)
    for ch, cells in by.items():
        def b(bm, cells=cells):
            cache = {}
            def V(p):
                if p not in cache:
                    x, y, z = p
                    cache[p] = bm.verts.new(G((x - cx) * size, y * size, (z - cz + .5) * size))
                return cache[p]
            for (x, y, z) in cells:
                for (dx, dy, dz), quad in dirs:
                    if (x + dx, y + dy, z + dz) in vox:
                        continue
                    try:
                        f = bm.faces.new([V((x + a, y + bb, z + c)) for a, bb, c in quad])
                    except ValueError:
                        continue
                    f.normal_update()
                    if f.normal.dot(G(dx, dy, dz)) < 0:
                        f.normal_flip()
        part.add(ch, b, smooth=False)
    part.finish()

# ---------------------------------------------------------------- Pixel-Sonne (Ringe)
sun = []
for y in range(24):
    row = ''
    for x in range(24):
        d = math.hypot(x - 11.5, y - 11.5)
        row += 'Y' if d < 6.5 else 'O' if d < 9.5 else 'R' if d < 11.6 else '.'
    sun.append(row)
build('VD_Sun', voxels(extrude(sun, 1)), 1.0)

cloud = [
    "..........pppp..........",
    "......pppwwwwwpp........",
    "....ppwwwwwwwwwwppp.....",
    "..ppwwwwwwwwwwwwwwwpp...",
    ".pwwwwwwwwwwwwwwwwwwwpp.",
    "pwwwwwwwwwwwwwwwwwwwwwwp",
    "pqqwwwwqqqwwwwwqqqwwwqqp",
    ".qqqqqqqqqqqqqqqqqqqqqq.",
]
build('VD_Cloud', voxels(extrude(cloud, 4)), .9)

banner = [
    "WWWWWWWWWWW",
    ".vvvvvvvvv.",
    ".vVVVVVVVv.",
    ".vVVVgVVVv.",
    ".vVgVgVgVv.",
    ".vVVggeVVv.",
    ".vgggeeggv.",
    ".vVVggeVVv.",
    ".vVgVgVgVv.",
    ".vVVVgVVVv.",
    ".vVVVVVVVv.",
    ".vvvvvvvvv.",
    ".vv.vvv.vv.",
    ".v...v...v.",
]
bn = voxels(extrude(banner, 1))
for y in range(0, 22):                   # Stange links
    bn[(-1, y - 8, 0)] = 'W'
build('VD_Banner', bn, .25)

knight = [
    ".....S.....",
    "....sSs....",
    "...sSSSs...",
    "...skkks...",
    "...sSSSs...",
    "..gsSSSsg..",
    ".ssSSSSSss.",
    "sSsSSgSSsSs",
    "sSsSSgSSsSs",
    "sSs.SgS.sSs",
    "sSs.SSS.sSs",
    "sSs.sgs.sSs",
    "sSs.S.S.sSs",
    "sSs.S.S.sSs",
    ".s..s.s..s.",
    "...ss.ss...",
    "..bbbbbbb..",
    ".BBBBBBBBB.",
]
kn = voxels(extrude(knight, 3))
for y in range(4, 20):                   # Grossschwert rechts
    kn[(11, y, -1)] = 'S' if y > 6 else 'g'
kn[(10, 7, -1)] = 'g'; kn[(12, 7, -1)] = 'g'
for y in range(3, 12):                   # Turmschild links vorn
    for x in range(-2, 1):
        kn[(x, y, 1)] = 'g' if (y in (3, 11) or x in (-2, 0)) else 'v'
build('VD_Knight', kn, .35)

brazier = [
    "..o.o.o..",
    ".oyoyoyo.",
    "..oyyyo..",
    "kkkkkkkkk",
    ".kgggggk.",
    "..kgggk..",
    "...bbb...",
    "...bBb...",
    "...bbb...",
    "...bBb...",
    "...bbb...",
    "..BBBBB..",
]
build('VD_Brazier', voxels(extrude(brazier, 3)), .3)

bird0 = [
    "c.......c",
    "cc.....cc",
    ".ccckccc.",
    "...caa...",
]
bird1 = [
    "...ckc...",
    ".cccccca.",
    "cc.....cc",
    "c.......c",
]
build('VD_Bird0', voxels(extrude(bird0, 1)), .18)
build('VD_Bird1', voxels(extrude(bird1, 1)), .18)

rep = export_glb(ROOT / 'assets' / 'voxdome.glb')
(ROOT / 'art' / 'r64' / 'voxdome_report.json').write_text(json.dumps(rep, indent=1), encoding='utf-8')
print('REPORT', json.dumps(rep))
