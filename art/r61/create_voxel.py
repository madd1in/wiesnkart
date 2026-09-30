"""Suppa Lederhosn Karts R61: Pixel-/Voxel-Modelle im 8/16-Bit-Stil fuer das Geisterhaus (eigene Entwuerfe,
Anklang an klassische Gothic-Horror-Plattformer). Jedes Modell entsteht aus ASCII-Pixelkarten: ein Zeichen = ein
Farbblock, Schichten nach hinten (z) ergeben Tiefe; innere Flaechen entfallen (kleine Dreieckszahl).
Spiel-Koordinaten: y oben, +z Front. Export assets/voxel.glb:
  VX_Candle   Kandelaber mit drei Kerzen (zerbricht im Spiel in Wuerfel, gibt ein Pixel-Herz)
  VX_Heart    Pixel-Herz (Belohnung, schwebt und dreht sich)
  VX_Bat0/1   Pixel-Fledermaus, Fluegel oben/unten (zwei Bilder fuer die Animation)
  VX_Ghost    Pixel-Gespenst
  VX_Skulls   Totenkopf-Saeule
  VX_Window   Buntglas-Spitzbogenfenster (leuchtet)
  VX_Moon     grosser Pixel-Vollmond (Himmel)
  VX_Wall     Zinnenmauer-Stueck (8-Bit-Burgmauer, reiht sich aneinander)
  VX_Armor    Ruestung mit Hellebarde
Aufruf: blender -b --factory-startup --python art/r61/create_voxel.py
"""
import sys, math, json, pathlib, importlib
sys.path.append(r'C:/Users/User/Documents/Playground/mushroom-rally/art/lib')
import bpy, bmesh
from mathutils import Vector
import blib
importlib.reload(blib)
from blib import *

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
blib.init_scene('R61_Voxel')
# NES-/SNES-nahe Palette (linear), matt; Flammen, Fenster und Augen leuchten
PAL = {
    'k': ('VxBlack', (.012, .01, .02, 1), .9, 0, None, 0),
    'g': ('VxGrey', (.2, .2, .24, 1), .85, 0, None, 0),
    'G': ('VxGreyL', (.5, .5, .56, 1), .8, 0, None, 0),
    'w': ('VxWhite', (.9, .88, .82, 1), .8, 0, None, 0),
    'y': ('VxGold', (.9, .55, .06, 1), .45, .6, None, 0),
    'b': ('VxBrown', (.25, .1, .03, 1), .85, 0, None, 0),
    'r': ('VxRed', (.75, .03, .03, 1), .6, 0, None, 0),
    'R': ('VxRedGlow', (1, .1, .08, 1), .5, 0, (1, .08, .05, 1), 3.0),
    'o': ('VxFlame', (1, .5, .05, 1), .5, 0, (1, .45, .05, 1), 6.0),
    'Y': ('VxFlameCore', (1, .92, .4, 1), .5, 0, (1, .9, .35, 1), 8.0),
    'p': ('VxPurple', (.22, .05, .35, 1), .8, 0, None, 0),
    'P': ('VxPurpleL', (.5, .2, .75, 1), .7, 0, None, 0),
    'c': ('VxCyanGlow', (.2, .85, 1, 1), .4, 0, (.15, .8, 1, 1), 3.5),
    'm': ('VxMagentaGlow', (1, .2, .7, 1), .4, 0, (1, .15, .65, 1), 3.5),
    'e': ('VxYellowGlow', (1, .85, .2, 1), .4, 0, (1, .8, .15, 1), 3.5),
    'v': ('VxGreenGlow', (.3, 1, .35, 1), .4, 0, (.25, 1, .3, 1), 3.0),
    'M': ('VxMoon', (.95, .9, .7, 1), .9, 0, (.95, .88, .62, 1), 1.6),
    'n': ('VxMoonShade', (.62, .58, .45, 1), .9, 0, (.6, .55, .4, 1), 1.0),
    's': ('VxSteel', (.45, .47, .52, 1), .35, .85, None, 0),
    'S': ('VxSteelL', (.75, .77, .82, 1), .3, .9, None, 0),
    'h': ('VxGhost', (.85, .9, 1, 1), .6, 0, (.5, .6, .9, 1), 1.2),
}
use_materials({k: material(n, c, r, m, e, s) for k, (n, c, r, m, e, s) in PAL.items()})


def voxels(layers, size=.2, origin=(0, 0, 0), depth_rows=None):
    """layers: Liste von Schichten (vorn nach hinten), jede Schicht = Liste von Zeilen (oben nach unten).
    Leerzeichen/Punkt = leer. Gibt dict (x,y,z) -> Zeichen zurueck (y nach oben)."""
    vox = {}
    for zi, rows in enumerate(layers):
        H = len(rows)
        for yi, row in enumerate(rows):
            for xi, ch in enumerate(row):
                if ch in ' .':
                    continue
                vox[(xi, H - 1 - yi, -zi)] = ch
    return vox


def extrude(rows, depth=2, back=None):
    """2D-Sprite, depth Schichten tief (back: Zeichen fuer die hinteren Schichten, sonst gleich)."""
    return [rows] + [[(''.join(back if c not in ' .' else c for c in r) if back else r) for r in rows] for _ in range(depth - 1)]


def build(name, vox, size=.2, center_x=True, lift=0.0, origin=None):
    """Voxel-Menge als Mesh: nur Aussenflaechen, eine Material-Gruppe je Zeichen."""
    xs = [k[0] for k in vox]; zs = [k[2] for k in vox]
    cx = (min(xs) + max(xs) + 1) / 2 if center_x else 0
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
                    cache[p] = bm.verts.new(G((x - cx) * size, y * size + lift, (z - cz + .5) * size))
                return cache[p]
            for (x, y, z) in cells:
                for (dx, dy, dz), quad in dirs:
                    if (x + dx, y + dy, z + dz) in vox:
                        continue
                    vs = [V((x + a, y + bb, z + c)) for a, bb, c in quad]
                    try:
                        f = bm.faces.new(vs)
                    except ValueError:
                        continue
                    f.normal_update()
                    want = G(dx, dy, dz)
                    if f.normal.dot(want) < 0:
                        f.normal_flip()
        part.add(ch, b, smooth=False)
    part.finish(origin=origin)
    return part

# ---------------------------------------------------------------- Kandelaber
candle = [
    "..o.......o.......o..",
    ".oYo.....oYo.....oYo.",
    "..o.......o.......o..",
    "..w.......w.......w..",
    "..w.......w.......w..",
    "..w.......w.......w..",
    ".yyy.....yyy.....yyy.",
    "..y.......y.......y..",
    "..y.......y.......y..",
    "..yyyyyyyyyyyyyyyyy..",
    ".........yyy.........",
    ".........y.y.........",
    ".........yyy.........",
    "..........y..........",
    "..........y..........",
    "..........y..........",
    "..........y..........",
    ".........yyy.........",
    "..........y..........",
    "..........y..........",
    "..........y..........",
    ".........yyy.........",
    "........yyyyy........",
    ".......yyyyyyy.......",
]
build('VX_Candle', voxels(extrude(candle, 2)), .16)

heart = [
    ".rr...rr.",
    "rRRr.rRRr",
    "rRwRrRRRr",
    "rRRRRRRRr",
    ".rRRRRRr.",
    "..rRRRr..",
    "...rRr...",
    "....r....",
]
build('VX_Heart', voxels(extrude(heart, 2)), .16)

bat0 = [
    "k.............k",
    "kk....k.k....kk",
    "kkk...kkk...kkk",
    "kkkk.kRkRk.kkkk",
    ".kkkkkkkkkkkkk.",
    "..kkk.kkk.kkk..",
    "...k...k...k...",
]
bat1 = [
    "......k.k......",
    "......kkk......",
    ".....kRkRk.....",
    "..kkkkkkkkkkk..",
    ".kkkkkkkkkkkkk.",
    "kkkk..kkk..kkkk",
    "kk.....k.....kk",
]
build('VX_Bat0', voxels(extrude(bat0, 2)), .14)
build('VX_Bat1', voxels(extrude(bat1, 2)), .14)

ghost = [
    "....hhhhh....",
    "..hhhhhhhhh..",
    ".hhhhhhhhhhh.",
    ".hhkkhhhkkhh.",
    "hhhkkhhhkkhhh",
    "hhhhhhhhhhhhh",
    "hhhhhkkkhhhhh",
    "hhhhhkkkhhhhh",
    "hhhhhhhhhhhhh",
    "hhhhhhhhhhhhh",
    "hh.hhh.hhh.hh",
    "h...h...h...h",
]
build('VX_Ghost', voxels(extrude(ghost, 3)), .16)

skull = [
    ".wwwww.",
    "wwwwwww",
    "wkkwkkw",
    "wkRwRkw",
    "wwwkwww",
    ".wkwkw.",
    "..www..",
]
col = []
for i in range(4):
    col += skull
col += [".ggggg.", "ggggggg", "GGGGGGG"]
build('VX_Skulls', voxels(extrude(col, 5, None)), .18)

window = [
    "......ggg......",
    "....ggpPpgg....",
    "...gpcccccpg...",
    "..gpcmcccmcpg..",
    "..gcmmcecmmcg..",
    ".gccmcceccmccg.",
    ".gcccceeecccg..",
    ".gcgggggggggcg.",
    ".gcmcgeeegcmcg.",
    ".gcmcgeReg cmcg",
    ".gcmcgeeegcmcg.",
    ".gccmgcccgmccg.",
    ".gcccgcvcgcccg.",
    ".gcvcgvvvgcvcg.",
    ".gcccgcvcgcccg.",
    ".ggggggggggggg.",
    "GGGGGGGGGGGGGGG",
]
window = [r.replace(' ', 'c') for r in window]
build('VX_Window', voxels(extrude(window, 2, 'g')), .22)

moon = []
R = 9.5
for y in range(20):
    row = ''
    for x in range(20):
        d = math.hypot(x - 9.5, y - 9.5)
        if d > R:
            row += '.'
        elif (x - 6) ** 2 + (y - 7) ** 2 < 5 or (x - 13) ** 2 + (y - 12) ** 2 < 8 or (x - 8) ** 2 + (y - 14) ** 2 < 3:
            row += 'n'
        else:
            row += 'M'
    moon.append(row)
build('VX_Moon', voxels(extrude(moon, 1)), 1.0)

wall = [
    "gg..gg..gg..gg..",
    "gg..gg..gg..gg..",
    "gGggGggGggGggGgg",
    "ggggggggggggggGg",
    "gGgggGgggGgggggg",
    "ggggkggggggkgggg",
    "gggkkkgggggkkkgg",
    "gggkkkgggggkkkgg",
    "ggGggggGgggggGgg",
    "gggggggggggggggg",
    "gGgggGgggGgggGgg",
    "gggggggggggggggg",
]
build('VX_Wall', voxels(extrude(wall, 3)), .5)

armor = [
    "......S........",
    ".....SSS.......",
    "......S........",
    "..sss.b........",
    ".sSSSsb........",
    ".skkksb........",
    ".sRkRsb........",
    ".sSSSsb........",
    "ssSSSSsb.......",
    "sSSsSSSs.......",
    "sSSsSSsb.......",
    "sSSsSSsb.......",
    ".sSSSs.b.......",
    ".ssyss.b.......",
    ".sSsSs.b.......",
    ".sS.Ss.b.......",
    ".sS.Ss.b.......",
    ".ss.ss.b.......",
    "sss.sssb.......",
]
build('VX_Armor', voxels(extrude(armor, 3)), .2)

rep = export_glb(ROOT / 'assets' / 'voxel.glb')
(ROOT / 'art' / 'r61' / 'voxel_report.json').write_text(json.dumps(rep, indent=1), encoding='utf-8')
print('REPORT', json.dumps(rep))
