"""Suppa Lederhosn Karts R61: eigene Wahrzeichen fuer Schildkroeten-Bucht und Eisstock-See (Nutzerhinweis "zu generisch").
Spiel-Koordinaten: y oben, +z Front. Export assets/bayice.glb:
  BY_TurtleIsle  Insel in Form eines riesigen Schildkroetenpanzers (Sechseck-Platten, Kopf-Fels, Flossen, Palmen obendrauf)
  BY_Wreck       gestrandetes Holzschiff, schraeg, gebrochener Mast mit zerrissenem Segel
  BY_Sandcastle  Riesen-Sandburg mit vier Tuermen, Zinnen, Muscheln und Wimpeln
  BY_Lifeguard   Rettungsturm (Holz, Sonnendach, Rettungsring, Fahne)
  BY_Dolphin     springender Delfin (stilisiert)
  IC_Palace      Eispalast: durchscheinende Tuerme mit Zapfen-Daechern, Tor, Eiskristalle
  IC_Stein       Eisskulptur Masskrug auf Sockel
  IC_Brezn       Eisskulptur Brezn auf Sockel
  IC_Igloo       Iglu mit Eingangstunnel und Laterne
  IC_Falls       gefrorener Wasserfall an einer Felswand mit Eiszapfen
Aufruf: blender -b --factory-startup --python art/r61/create_bayice.py
"""
import sys, math, json, pathlib, importlib, random
sys.path.append(r'C:/Users/User/Documents/Playground/mushroom-rally/art/lib')
import bpy, bmesh
from mathutils import Vector, noise
import blib
importlib.reload(blib)
from blib import *

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
random.seed(612)
blib.init_scene('R61_BayIce')
use_materials({
    'Shell': material('ByShell', (.12, .32, .1, 1), .55),
    'ShellL': material('ByShellLight', (.35, .55, .15, 1), .5),
    'Skin': material('BySkin', (.35, .5, .22, 1), .7),
    'Sand': material('BySand', (.85, .66, .38, 1), .95),
    'SandD': material('BySandDark', (.62, .45, .24, 1), .95),
    'Rock': material('ByRock', (.35, .3, .26, 1), .9),
    'Palm': material('ByPalm', (.1, .45, .08, 1), .7),
    'Trunk': material('ByTrunk', (.4, .26, .12, 1), .85),
    'Wood': material('ByWood', (.3, .16, .06, 1), .8),
    'WoodL': material('ByWoodLight', (.6, .4, .2, 1), .8),
    'Sail': material('BySail', (.85, .8, .68, 1), .9),
    'Red': material('ByRed', (.8, .06, .05, 1), .6),
    'White': material('ByWhite', (.92, .92, .9, 1), .6),
    'Blue': material('ByBlue', (.05, .3, .75, 1), .6),
    'Yellow': material('ByYellow', (1, .75, .05, 1), .6),
    'Dolphin': material('ByDolphin', (.3, .42, .55, 1), .35),
    'Belly': material('ByBelly', (.75, .8, .85, 1), .4),
    'Eye': material('ByEye', (.02, .02, .03, 1), .3),
    'Ice': material('IcIce', (.55, .82, 1, 1), .08, .1, (.25, .55, 1, 1), .6),
    'IceD': material('IcIceDeep', (.2, .5, .9, 1), .1, .1, (.15, .4, .95, 1), 1.0),
    'Snow': material('IcSnow', (.92, .95, 1, 1), .85),
    'Lamp': material('IcLamp', (1, .7, .3, 1), .4, 0, (1, .65, .25, 1), 5.0),
    'RockI': material('IcRock', (.5, .54, .62, 1), .85),
})


def lumpy(center, r, amp=.15, freq=1.6, sub=2, squash=(1, 1, 1)):
    def b(bm):
        # nur die neuen Punkte (die Rueckgabe; ein Mengenvergleich mit alten Punkten versagt nach create_icosphere)
        for v in bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=1)['verts']:
            d = v.co.normalized()
            k = 1 + amp * noise.noise(d * freq + Vector((1.7, 2.3, 5.1)))
            v.co = Vector((d.x * squash[0], d.y * squash[2], d.z * squash[1])) * r * k + G(*center)
    return b


def palm(part, base, h=7, lean=(.8, .3)):
    x, y, z = base
    pts = [(x + lean[0] * (i / 6) ** 2 * h * .25, y + h * i / 6, z + lean[1] * (i / 6) ** 2 * h * .25) for i in range(7)]
    part.add('Trunk', tube(pts, .28, 8))
    tx, ty, tz = pts[-1]
    for k in range(7):
        a = 2 * math.pi * k / 7
        leaf = [(tx, ty, tz), (tx + math.cos(a) * 1.6, ty + .6, tz + math.sin(a) * 1.6), (tx + math.cos(a) * 3.2, ty - .3, tz + math.sin(a) * 3.2), (tx + math.cos(a) * 4.1, ty - 1.4, tz + math.sin(a) * 4.1)]
        part.add('Palm', tube(leaf, .32, 4))
    part.add('Trunk', sphere((tx + .2, ty - .4, tz), .35, (1, 1, 1), 8, 6))
    part.add('Trunk', sphere((tx - .25, ty - .45, tz + .1), .33, (1, 1, 1), 8, 6))

# ---------------------------------------------------------------- Schildkroeten-Insel
ti = Part('BY_TurtleIsle')
R = 26
ti.add('Shell', sphere((0, -3, 0), R, (1.15, .42, 1), 36, 16))
ti.add('SandD', cyl((0, -6, 0), (0, -1.5, 0), R * 1.2, R * 1.12, 36))                        # Panzerrand
for ring, n, rr in ((0, 1, 0), (1, 6, 11), (2, 12, 20)):                                     # Sechseck-Platten
    for k in range(n):
        a = 2 * math.pi * (k + .5 * (ring % 2)) / max(1, n)
        x, z = math.cos(a) * rr * 1.1, math.sin(a) * rr
        top = -3 + R * .42 * math.sqrt(max(0, 1 - (x / (R * 1.15)) ** 2 - (z / R) ** 2))
        ti.add('ShellL', cyl((x, top - .6, z), (x, top + .35, z), 4.2 if ring else 5, 4.4 if ring else 5.2, 6))
ti.add('Skin', lumpy((R * 1.25, 1.5, 0), 6.5, .12, 1.4, 2, (1.2, .8, .85)))                # Kopf
for sz in (-1, 1):
    ti.add('Eye', sphere((R * 1.25 + 4.5, 3.2, sz * 2.6), .9, (1, 1, 1), 10, 8))
    ti.add('Skin', lumpy((R * .7, -2.5, sz * R * .95), 5, .15, 1.8, 2, (1.6, .5, .9)))    # Vorderflossen
    ti.add('Skin', lumpy((-R * .8, -3, sz * R * .85), 4, .15, 1.8, 2, (1.4, .5, .8)))
ti.add('Sand', sphere((-4, 7.2, 3), 7, (1.3, .35, 1), 18, 8))                               # Sandkuppe mit Palmen
for i, (x, z) in enumerate([(-6, 4), (-2, 7), (-9, 0), (1, 2)]):
    palm(ti, (x, 8.5, z), 7 + i, (random.uniform(-1, 1), random.uniform(-1, 1)))
ti.finish()

# ---------------------------------------------------------------- Wrack
wr = Part('BY_Wreck')
hull = [(t, hw, yb, yt, 2.2) for t, hw, yb, yt in ((-11, .8, 1.2, 3.2), (-8, 2.6, .3, 3.5), (-3, 3.4, 0, 3.7), (3, 3.3, 0, 3.8), (8, 2.4, .5, 4.2), (11, .6, 2, 4.8))]
wr.add('Wood', loft(hull, 20, True, 'x'))
wr.add('WoodL', rbox((0, 3.8, 0), (20, .25, 6), .05, 1))                                  # Deck
for i in range(-4, 5):
    wr.add('Wood', rbox((i * 2.2, 3.1, 3.35), (.25, 1.4, .2), .02, 1))                     # Spanten-Reling
wr.add('Wood', cyl((1, 3.8, 0), (1.8, 12, .4), .35, .25, 8))                                # Mast (schraeg)
wr.add('Wood', cyl((1.3, 9, 0), (1.9, 9.6, 5), .15, .12, 6))                                # Rahe, gebrochen
wr.add('Sail', xy_prism([(1.5, 9.4), (1.9, 9.8), (2.6, 6.2), (1.2, 5.4)], .15, .25))       # Segelfetzen
wr.add('Wood', rbox((-8.5, 5, 0), (3, 2.4, 5), .1, 1))                                      # Achterkastell
wr.add('Yellow', sphere((-8.5, 5.4, 2.6), .35, (1, 1, .3), 10, 6))                          # Laterne
wr.finish()

# ---------------------------------------------------------------- Sandburg
sb = Part('BY_Sandcastle')
sb.add('Sand', rbox((0, 2.5, 0), (14, 5, 10), .5, 2))
for sx in (-1, 1):
    for sz in (-1, 1):
        x, z = sx * 7, sz * 5
        sb.add('Sand', cyl((x, 0, z), (x, 9, z), 2.4, 2.1, 12))
        sb.add('SandD', cyl((x, 9, z), (x, 13, z), 2.3, .3, 12))
        sb.add('Wood', cyl((x, 12.5, z), (x, 15.5, z), .07, .07, 5))
        sb.add('Red' if sx > 0 else 'Blue', xy_prism([(x, 15.4), (x + 1.6, 14.9), (x, 14.4)], z - .03, z + .03))
for i in range(-3, 4):                                                                          # Zinnen
    for sz in (-1, 1):
        sb.add('Sand', rbox((i * 1.8, 5.5, sz * 5), (1, 1, .9), .15, 1))
sb.add('Sand', cyl((0, 5, 0), (0, 13, 0), 3, 2.6, 14))
sb.add('SandD', cyl((0, 13, 0), (0, 18, 0), 2.8, .3, 14))
sb.add('Wood', rbox((0, 1.6, 5.05), (2.6, 3.2, .3), .1, 1))                                   # Tor
for k in range(6):
    sb.add('White', sphere((-5 + k * 2, 1, 5.3), .35, (1, .6, .5), 8, 5))                     # Muscheln
sb.finish()

# ---------------------------------------------------------------- Rettungsturm
lg = Part('BY_Lifeguard')
for sx in (-1, 1):
    for sz in (-1, 1):
        lg.add('WoodL', cyl((sx * 1.2, 0, sz * 1.2), (sx * .9, 4.5, sz * .9), .14, .12, 6))
lg.add('WoodL', rbox((0, 4.6, 0), (2.6, .2, 2.6), .03, 1))
lg.add('Red', rbox((0, 5.6, -1.1), (2.4, 2, .15), .03, 1))
lg.add('White', rbox((0, 7.1, 0), (3.2, .15, 3.2), .03, 1))
for sx in (-1, 1):
    for sz in (-1, 1):
        lg.add('WoodL', cyl((sx * 1.4, 4.6, sz * 1.4), (sx * 1.4, 7.1, sz * 1.4), .06, .06, 5))
lg.add('Red', torus((0, 5.6, 1.35), .45, .12, (0, 0, 1), 16, 6))
lg.add('White', torus((0, 5.6, 1.36), .45, .125, (0, 0, 1), 4, 6, (0, math.pi / 2)))
lg.add('WoodL', cyl((1.5, 7.1, 1.5), (1.5, 10, 1.5), .05, .05, 5))
lg.add('Yellow', xy_prism([(1.5, 9.9), (3, 9.5), (1.5, 9.1)], 1.47, 1.53))
lg.add('WoodL', rbox((0, 2.2, 1.9), (.8, 4.4, .12), .02, 1, (.35, 0, 0)))                     # Leiter
lg.finish()

# ---------------------------------------------------------------- Delfin
dl = Part('BY_Dolphin')
body = [(t, hw, yb, yt, 2.3) for t, hw, yb, yt in ((-2.2, .12, -.1, .12), (-1.6, .35, -.35, .35), (-.5, .55, -.55, .55), (.6, .5, -.5, .5), (1.4, .32, -.3, .3), (1.9, .12, -.12, .1))]
dl.add('Dolphin', loft(body, 14, True, 'x'))
dl.add('Belly', loft([(t, hw * .8, yb, yb * .2, 2) for t, hw, yb, yt, n in body[1:-1]], 12, True, 'x'))
dl.add('Dolphin', xy_prism([(-.1, .5), (.5, .5), (-.4, 1.2)], -.06, .06))                     # Rueckenflosse
dl.add('Dolphin', rbox((-2.4, 0, 0), (.3, .12, 1.4), .05, 1))                                  # Fluke
dl.add('Dolphin', cyl((1.9, -.02, 0), (2.4, -.05, 0), .12, .07, 8))                            # Schnauze
for sz in (-1, 1):
    dl.add('Eye', sphere((1.45, .12, sz * .28), .06, (1, 1, 1), 6, 4))
    dl.add('Dolphin', rbox((.5, -.35, sz * .55), (.6, .06, .45), .02, 1, (0, 0, -.4)))
dl.finish()

# ---------------------------------------------------------------- Eispalast
ip = Part('IC_Palace')
ip.add('Ice', rbox((0, 4, 0), (26, 8, 12), .6, 2))
ip.add('Snow', rbox((0, 8.2, 0), (26.6, .6, 12.6), .3, 1))
for x, h, r in ((-13, 20, 3.4), (13, 20, 3.4), (-6, 15, 2.4), (6, 15, 2.4), (0, 26, 4)):
    ip.add('Ice', cyl((x, 0, -1), (x, h, -1), r, r * .9, 10))
    ip.add('IceD', cyl((x, h, -1), (x, h + r * 2.6, -1), r * 1.15, .1, 10))
    ip.add('Snow', cyl((x, h - .2, -1), (x, h + .5, -1), r * 1.2, r * 1.15, 10))
    for k in range(6):
        a = 2 * math.pi * k / 6
        ip.add('Ice', cyl((x + math.cos(a) * r * 1.05, h - .2, -1 + math.sin(a) * r * 1.05), (x + math.cos(a) * r * 1.05, h - 1.6, -1 + math.sin(a) * r * 1.05), .22, .02, 5))
ip.add('IceD', rbox((0, 3.2, 6.1), (5, 6.4, .5), .3, 1))                                      # Tor
ip.add('Lamp', sphere((0, 7.2, 6.4), .5, (1, 1, 1), 10, 8))
for x in (-9, -3.5, 3.5, 9):
    ip.add('IceD', rbox((x, 5, 6.05), (1.6, 3, .3), .1, 1))
for k in range(8):                                                                               # Eiskristalle am Fuss
    a = random.uniform(0, 2 * math.pi); d = random.uniform(15, 18)
    x, z = math.cos(a) * d, math.sin(a) * d * .6
    ip.add('Ice', cyl((x, 0, z), (x + random.uniform(-1, 1), random.uniform(3, 6), z), .9, .05, 5))
ip.finish()

# ---------------------------------------------------------------- Eisskulpturen
def plinth(p):
    p.add('Snow', rbox((0, .6, 0), (3.4, 1.2, 3.4), .2, 2))

st = Part('IC_Stein')
plinth(st)
st.add('Ice', cyl((0, 1.2, 0), (0, 5.4, 0), 1.25, 1.35, 16))
st.add('IceD', cyl((0, 1.2, 0), (0, 1.5, 0), 1.4, 1.4, 16))
st.add('Snow', lumpy((0, 5.6, 0), 1.35, .12, 2.5, 2, (1, .45, 1)))                            # Schaumkrone
st.add('Ice', torus((1.35, 3.3, 0), 1, .28, (0, 0, 1), 14, 8, (-math.pi / 2, math.pi / 2)))  # Henkel
for k in range(8):
    a = 2 * math.pi * k / 8
    st.add('IceD', cyl((math.cos(a) * 1.3, 1.6, math.sin(a) * 1.3), (math.cos(a) * 1.3, 5, math.sin(a) * 1.3), .12, .12, 5))
st.finish()

bz = Part('IC_Brezn')
plinth(bz)
path = [(-.9, .95, 0), (-.35, 1.6, .1), (.1, 2.2, .16), (.6, 2.85, .05), (1.15, 3.0, 0), (1.45, 2.45, 0), (1.25, 1.45, 0), (.65, .78, 0), (0, .6, 0), (-.65, .78, 0),
        (-1.25, 1.45, 0), (-1.45, 2.45, 0), (-1.15, 3.0, 0), (-.6, 2.85, -.05), (-.1, 2.2, -.16), (.35, 1.6, -.1), (.9, .95, 0)]
bz.add('Ice', tube([(x * 1.3, y * 1.3 + 1.1, z) for x, y, z in path], .3, 10))
bz.finish()

ig = Part('IC_Igloo')
ig.add('Snow', sphere((0, 0, 0), 3.2, (1, .85, 1), 20, 10))
ig.add('Snow', loft([(t, 1.1, 0, 2.1, 2.2) for t in (1.8, 2.8, 4.2)], 14, True, 'z'))
ig.add('RockI', rbox((0, .9, 4.25), (1.3, 1.8, .1), .2, 1))
ig.add('Lamp', sphere((1.3, 2.2, 3.9), .22, (1, 1.3, 1), 8, 6))
ig.finish()

fa = Part('IC_Falls')
fa.add('RockI', lumpy((0, 9, -4), 11, .22, 1.2, 3, (1.4, 1, .6)))
for k in range(9):
    x = -4 + k
    h = 17 + math.sin(k * 1.7) * 2
    fa.add('Ice', cyl((x, h, 1.5), (x * 1.2, 0, 3.4), .9 + (k % 3) * .2, 1.3, 8))
for k in range(14):
    x = -7 + k
    fa.add('IceD', cyl((x, 16 + (k % 3), 1.8), (x, 12 + (k % 4), 2.1), .35, .02, 5))
fa.add('Ice', cyl((0, 0, 4), (0, .4, 4), 7, 7.5, 20))
fa.finish()

rep = export_glb(ROOT / 'assets' / 'bayice.glb')
(ROOT / 'art' / 'r61' / 'bayice_report.json').write_text(json.dumps(rep, indent=1), encoding='utf-8')
print('REPORT', json.dumps(rep))
