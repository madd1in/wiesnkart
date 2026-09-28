"""Wiesn Kart R54: eigenstaendige Ersatzmodelle (keine Anlehnung an fremde Figuren/Gegenstaende).
  assets/ow.glb     EL_PSwitch     Holzsockel des Glockenschalters (Hoehe 0,5 m)
                    EL_PSwitchCap  Messingglocke mit Kloeppel und Krone - Ursprung unten, wird beim Ueberfahren gestaucht
                    EL_Coin        Lebkuchenherz-Muenze mit Zuckerguss-Rand (steht aufrecht, dreht sich um die Hochachse)
  assets/ghost.glb  Bettlaken-Gespenst mit Wellensaum, dunklen Ovalaugen und Laterne (keine Zunge, keine Aermchen)
  assets/shell.glb  Shell          Brezel-Wurfgeschoss (liegt flach, dreht sich um die Hochachse)
Laeuft in der offenen Blender-Sitzung (Blender-MCP, eigene Szene) oder per blender -b --python.
"""
import sys, math, json, pathlib, importlib
sys.path.append(r'C:/Users/User/Documents/Playground/mushroom-rally/art/lib')
import bpy, bmesh
from mathutils import Vector, Matrix
import blib
importlib.reload(blib)
from blib import *

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
report = {}

def heart_pts(s, n=40):
    pts = []
    for i in range(n):
        u = 2 * math.pi * i / n
        x = 16 * math.sin(u) ** 3
        y = 13 * math.cos(u) - 5 * math.cos(2 * u) - 2 * math.cos(3 * u) - math.cos(4 * u)
        pts.append((x / 17 * s, y / 17 * s))
    return pts

def slab(pts, z0, z1, cx=0.0, cy=0.0):
    def b(bm):
        a = [bm.verts.new(G(cx + x, cy + y, z0)) for x, y in pts]
        c = [bm.verts.new(G(cx + x, cy + y, z1)) for x, y in pts]
        fs = [bm.faces.new(list(reversed(a))), bm.faces.new(c)]
        for i in range(len(pts)):
            j = (i + 1) % len(pts)
            fs.append(bm.faces.new((a[i], a[j], c[j], c[i])))
        bmesh.ops.recalc_face_normals(bm, faces=fs)
    return b

# ======================================================== ow.glb: Glockenschalter und Lebkuchenherz-Muenze
blib.init_scene('R54_OW')
use_materials({
    'base': material('SwitchBase', (.42, .26, .13, 1), .75),
    'rim': material('SwitchRim', (.95, .72, .3, 1), .3, .85),
    'blue': material('SwitchBlue', (.95, .72, .3, 1), .25, .9),          # Glocke (Messing); Name bleibt fuer den Code
    'white': material('SwitchWhite', (.97, .97, .95, 1), .45),
    'coin': material('CoinBlue', (.62, .35, .16, 1), .75),              # Lebkuchen
    'coinrim': material('CoinRim', (1, .97, .92, 1), .5),              # Zuckerguss
    'emblem': material('CoinEmblem', (1, .3, .65, 1), .4, 0, (1, .25, .6, 1), .6),
})
b = Part('EL_PSwitch')
b.add('base', cyl((0, 0, 0), (0, .38, 0), 1.45, 1.35, 28))
b.add('rim', torus((0, .38, 0), 1.35, .07, (0, 1, 0), 28, 5))
for k in range(8):
    a = 2 * math.pi * k / 8
    b.add('base', rbox((math.cos(a) * 1.4, .19, math.sin(a) * 1.4), (.12, .38, .3), .02, 1, rot=(0, -a, 0)), smooth=False)
b.add('base', cyl((0, .38, 0), (0, .5, 0), 1.2, 1.15, 28))
b.finish()
c = Part('EL_PSwitchCap')
# Glocke: Loft entlang y (Profil einer Kirchenglocke), Ursprung unten
prof = [(0, 1.15), (.08, 1.12), (.2, 1.0), (.45, .82), (.75, .74), (1.0, .7), (1.2, .62), (1.32, .45), (1.38, .2), (1.4, 0)]
def bell(bm):
    seg = 32
    rings = [[bm.verts.new(G(math.cos(2 * math.pi * i / seg) * r, y, math.sin(2 * math.pi * i / seg) * r)) for i in range(seg)] for y, r in [(p[0], p[1]) for p in prof]]
    fs = []
    for a, d in zip(rings, rings[1:]):
        for i in range(seg):
            j = (i + 1) % seg
            fs.append(bm.faces.new((a[i], a[j], d[j], d[i])))
    top = bm.verts.new(G(0, 1.42, 0))
    for i in range(seg):
        fs.append(bm.faces.new((rings[-1][(i + 1) % seg], rings[-1][i], top)))
    for f in fs:
        f.normal_update()
        cen = f.calc_center_median()
        if (cen - Vector((0, 0, .5))).dot(f.normal) < 0:
            f.normal_flip()
c.add('blue', bell)
c.add('rim', torus((0, .08, 0), 1.15, .07, (0, 1, 0), 32, 5))
c.add('rim', torus((0, .95, 0), .72, .045, (0, 1, 0), 28, 4))
c.add('rim', torus((0, 1.55, 0), .2, .06, (1, 0, 0), 16, 5))              # Krone
c.add('white', lambda bm: slab(heart_pts(.42), 1.12, 1.16, 0, .6)(bm), smooth=False)   # Herz-Zeichen vorn
c.add('rim', sphere((0, -.05, 0), .22, (1, 1, 1), 12, 8))                # Kloeppel unten
c.finish()
co = Part('EL_Coin')
co.add('coin', slab(heart_pts(.62), -.07, .07, 0, .6))
co.add('coinrim', slab(heart_pts(.66), -.035, .035, 0, .6))
co.add('emblem', slab(heart_pts(.28), .07, .1, 0, .62))
co.add('emblem', slab(heart_pts(.28), -.1, -.07, 0, .62))
co.finish()
report['ow'] = export_glb(ROOT / 'assets' / 'ow.glb')

# ======================================================== ghost.glb: Bettlaken-Gespenst mit Laterne
blib.init_scene('R54_Ghost')
use_materials({
    'body': material('GhostBody', (.94, .95, 1, 1), .6, 0, (.75, .85, 1, 1), .25),
    'eye': material('GhostEye', (.05, .05, .09, 1), .3),
    'iron': material('LanternIron', (.15, .14, .16, 1), .45, .7),
    'glow': material('LanternGlow', (1, .8, .4, 1), .2, 0, (1, .7, .3, 1), 3.2),
})
g = Part('GhostSheet')
def sheet(bm):
    seg, rows = 32, 14
    rings = []
    for k in range(rows + 1):
        u = k / rows                                   # 0 = Saum unten, 1 = Kopf oben
        y = -.9 + u * 2.3
        r = .95 * (1 - .15 * u) if u < .72 else .95 * .9 * math.sqrt(max(0, 1 - ((u - .72) / .28) ** 2))
        ring = []
        for i in range(seg):
            a = 2 * math.pi * i / seg
            yy = y + (math.sin(a * 5) * .12 if k == 0 else 0)          # Wellensaum
            ring.append(bm.verts.new(G(math.cos(a) * max(r, .02), yy, math.sin(a) * max(r, .02))))
        rings.append(ring)
    fs = []
    for a, d in zip(rings, rings[1:]):
        for i in range(seg):
            j = (i + 1) % seg
            fs.append(bm.faces.new((a[i], a[j], d[j], d[i])))
    for f in fs:
        f.normal_update()
        cen = f.calc_center_median()
        if Vector((cen.x, cen.y, 0)).dot(f.normal) < 0:
            f.normal_flip()
g.add('body', sheet)
for sx in (-1, 1):
    g.add('eye', sphere((sx * .3, .78, .74), .14, (1, 1.5, .5), 12, 8))
g.add('eye', sphere((0, .42, .82), .09, (1.2, 1, .5), 10, 6))            # kleiner runder Mund
# Laterne an einem Stoffzipfel seitlich
g.add('body', sphere((.95, .2, .2), .22, (1, 1.4, 1), 10, 8))
g.add('iron', cyl((1.1, -.1, .25), (1.1, .05, .25), .03, .03, 6))
g.add('iron', rbox((1.1, -.35, .25), (.32, .08, .32), .02, 1))
g.add('glow', rbox((1.1, -.55, .25), (.24, .34, .24), .03, 1))
g.add('iron', rbox((1.1, -.76, .25), (.34, .08, .34), .02, 1))
g.finish()
report['ghost'] = export_glb(ROOT / 'assets' / 'ghost.glb')

# ======================================================== shell.glb: Brezel-Wurfgeschoss (flach liegend)
blib.init_scene('R54_Shell')
use_materials({
    'dough': material('ShellPaint', (.55, .28, .1, 1), .35),
    'salt': material('ShellRim', (1, 1, .98, 1), .6),
    'shine': material('ShellSpot', (.75, .42, .16, 1), .2),
})
p = Part('Shell')
loop = []
for i in range(49):
    u = 2 * math.pi * i / 48
    x = .62 * math.sin(u) * (1 + .25 * math.cos(u))
    z = .5 * math.cos(u) + .13 * math.cos(2 * u)
    loop.append((x, .32 + .05 * math.sin(3 * u), z))
p.add('dough', tube(loop, .15, 10, caps=False))
p.add('dough', tube([(-.45, .34, .22), (0, .38, -.2), (.45, .34, .22)], .14, 10))
import random
rnd = random.Random(54)
for i in range(22):
    pt = loop[rnd.randrange(len(loop))]
    p.add('salt', rbox((pt[0] + rnd.uniform(-.05, .05), pt[1] + .14, pt[2] + rnd.uniform(-.05, .05)), (.05, .04, .05), 0, 1), smooth=False)
p.finish()
report['shell'] = export_glb(ROOT / 'assets' / 'shell.glb')

(ROOT / 'art' / 'r54' / 'safe_props_report.json').write_text(json.dumps(report, indent=1), encoding='utf-8')
print('REPORT', json.dumps(report))
