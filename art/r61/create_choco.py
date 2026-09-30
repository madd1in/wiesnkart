"""Suppa Lederhosn Karts R61: Modelle fuer die Strecke Schoko-Matsch (eigene Entwuerfe, Wiesn-Suessigkeiten).
Spiel-Koordinaten: y oben, +z Front (zeigt zur Strasse). Export assets/choco.glb:
  CH_Boulder   klumpiger Schokobrocken mit Nuss-Stuecken (rollt im Spiel quer ueber die Strasse)
  CH_Heart     Lebkuchenherz mit Zuckerguss-Rand und Blueten, haengt an einem Holzgestell
  CH_Brezn     Riesen-Schokobrezn mit bunten Streuseln auf einem Sockel
  CH_Wafer     Waffelturm (Waffel/Creme im Wechsel) mit Schoko-Deckel und Kirsche
  CH_Cream     Sahnehaube (gedrehte Ringe) mit Kirsche
  CH_Fountain  dreistoeckiger Schokobrunnen mit Schoko-Vorhaengen
  CH_Praline   Praline im Folienpapier (rosa/gold)
  CH_TreePink / CH_TreeBlue  Zuckerwatte-Baum
Aufruf: blender -b --factory-startup --python art/r61/create_choco.py
"""
import sys, math, json, pathlib, importlib, random
sys.path.append(r'C:/Users/User/Documents/Playground/mushroom-rally/art/lib')
import bpy, bmesh
from mathutils import Vector, Matrix, noise
import blib
importlib.reload(blib)
from blib import *

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
random.seed(61)
blib.init_scene('R61_Choco')
use_materials({
    'Choco': material('ChDark', (.055, .02, .009, 1), .32),
    'Milk': material('ChMilk', (.2, .075, .03, 1), .38),
    'Flow': material('ChFlow', (.075, .026, .011, 1), .12),
    'Nut': material('ChNut', (.55, .33, .14, 1), .7),
    'Lebkuchen': material('ChLebkuchen', (.3, .11, .035, 1), .85),
    'Icing': material('ChIcing', (.92, .9, .86, 1), .55),
    'IcingPink': material('ChIcingPink', (.95, .22, .45, 1), .5),
    'IcingGreen': material('ChIcingGreen', (.18, .62, .14, 1), .5),
    'Wafer': material('ChWafer', (.7, .38, .1, 1), .8),
    'WaferDark': material('ChWaferDark', (.42, .2, .05, 1), .85),
    'Cream': material('ChCream', (.96, .93, .86, 1), .7),
    'Cherry': material('ChCherry', (.72, .01, .03, 1), .22),
    'Stem': material('ChStem', (.12, .3, .05, 1), .6),
    'Silver': material('ChSilver', (.72, .72, .74, 1), .22, .9),
    'FoilPink': material('ChFoilPink', (.9, .12, .38, 1), .28, .75),
    'FoilGold': material('ChFoilGold', (.95, .62, .12, 1), .25, .9),
    'Stick': material('ChStick', (.62, .46, .28, 1), .7),
    'Candy': material('ChCandy', (.98, .5, .75, 1), .95),
    'CandyBlue': material('ChCandyBlue', (.45, .72, .98, 1), .95),
    'Wood': material('ChWood', (.22, .1, .04, 1), .8),
    'Rope': material('ChRope', (.8, .08, .08, 1), .7),
    'SprY': material('ChSprY', (1, .75, .05, 1), .5),
    'SprB': material('ChSprB', (.1, .4, 1, 1), .5),
    'SprG': material('ChSprG', (.1, .8, .2, 1), .5),
    'SprW': material('ChSprW', (.95, .95, .95, 1), .5),
})


def lumpy(center, r, amp=.18, freq=1.6, sub=3, squash=(1, .82, 1)):
    """Klumpige Kugel (Icosphere mit Rauschen) - Schokobrocken."""
    def b(bm):
        # nur die neuen Punkte (die Rueckgabe; ein Mengenvergleich mit alten Punkten versagt nach create_icosphere)
        for v in bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=1)['verts']:
            d = v.co.normalized()
            k = 1 + amp * noise.noise(d * freq + Vector((3.1, 7.7, 1.3))) + amp * .5 * noise.noise(d * freq * 2.7)
            v.co = Vector((d.x * squash[0], d.y * squash[2], d.z * squash[1])) * r * k + G(*center)
    return b


def catmull(pts, n=6):
    """Glatte Kurve durch Kontrollpunkte (offen)."""
    P = [Vector(p) for p in pts]
    out = []
    for i in range(len(P) - 1):
        p0, p1, p2, p3 = P[max(i - 1, 0)], P[i], P[i + 1], P[min(i + 2, len(P) - 1)]
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            out.append(tuple(.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)))
    out.append(tuple(P[-1]))
    return out


# ---------------------------------------------------------------- Schokobrocken
bo = Part('CH_Boulder')
bo.add('Choco', lumpy((0, 1.05, 0), 1.25, .2, 1.4, 3))
for i in range(14):
    a, e = random.uniform(0, 2 * math.pi), random.uniform(-.2, .9)
    d = Vector((math.cos(a) * math.cos(e), math.sin(e), math.sin(a) * math.cos(e)))
    p = Vector((0, 1.05, 0)) + d * 1.2
    bo.add('Nut' if i % 3 else 'Milk', lumpy(tuple(p), random.uniform(.13, .22), .25, 2.5, 1))
bo.finish()

# ---------------------------------------------------------------- Lebkuchenherz am Holzgestell
def heart_pts(s=.075, n=48, cy=1.95):
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((x * s, y * s + cy))
    return pts

hp = heart_pts()
h = Part('CH_Heart')
h.add('Lebkuchen', xy_prism(hp, -.14, .14))
rim = [(x * .9, (y - 1.95) * .9 + 1.95, .16) for x, y in heart_pts(n=64)]
h.add('Icing', tube(rim + [rim[0]], .055, 8, False))
for i, (x, y) in enumerate([(-.55, 2.25), (.55, 2.25), (0, 1.35), (-.3, 1.8), (.3, 1.8)]):
    for k in range(5):  # Zuckerguss-Bluete: fuenf Tupfen
        a = 2 * math.pi * k / 5
        h.add('IcingPink' if i % 2 == 0 else 'Icing', sphere((x + math.cos(a) * .09, y + math.sin(a) * .09, .16), .055, (1, 1, .5), 8, 5))
    h.add('SprY', sphere((x, y, .17), .05, (1, 1, .5), 8, 5))
for sx in (-1, 1):
    h.add('IcingGreen', sphere((sx * .2, 1.1, .16), .07, (1.6, .7, .45), 8, 5))
for sx in (-1, 1):  # Gestell
    h.add('Wood', cyl((sx * 1.55, 0, 0), (sx * 1.55, 3.45, 0), .09, .08, 10))
    h.add('Rope', tube([(sx * .55, 2.72, 0), (sx * .7, 3.05, 0), (sx * .85, 3.3, 0)], .025, 6))
h.add('Wood', rbox((0, 3.38, 0), (3.5, .16, .18), .03, 1))
h.finish()

# ---------------------------------------------------------------- Schokobrezn
path = [(-.9, .95, 0), (-.35, 1.6, .1), (.1, 2.2, .16), (.6, 2.85, .05), (1.15, 3.0, 0), (1.45, 2.45, 0), (1.25, 1.45, 0),
        (.65, .78, 0), (0, .6, 0), (-.65, .78, 0), (-1.25, 1.45, 0), (-1.45, 2.45, 0), (-1.15, 3.0, 0), (-.6, 2.85, -.05),
        (-.1, 2.2, -.16), (.35, 1.6, -.1), (.9, .95, 0)]
curve = catmull(path, 6)
br = Part('CH_Brezn')
br.add('Milk', tube(curve, .22, 12))
glaze = [(x, y + .03, z + .06) for x, y, z in curve]
br.add('Choco', tube(glaze, .2, 12))
for i in range(70):
    x, y, z = random.choice(curve)
    a = random.uniform(0, 2 * math.pi)
    br.add(random.choice(['SprY', 'SprB', 'SprG', 'SprW', 'IcingPink']),
           rbox((x + math.cos(a) * .19, y + math.sin(a) * .19, z + .2), (.1, .025, .025), 0, 1, (0, 0, random.uniform(0, math.pi))), False)
br.add('Wood', cyl((0, 0, 0), (0, .5, 0), .55, .45, 16))
br.add('Stick', cyl((0, .45, 0), (0, .62, 0), .12, .12, 8))
br.finish()

# ---------------------------------------------------------------- Waffelturm
wf = Part('CH_Wafer')
y = 0
for i in range(5):
    wf.add('Wafer', rbox((0, y + .15, 0), (1.6, .3, 1.6), .03, 1))
    for k in range(-3, 4):  # Waffelmuster (Rillen vorn und seitlich)
        wf.add('WaferDark', rbox((k * .22, y + .15, .81), (.035, .26, .02), 0, 1), False)
        wf.add('WaferDark', rbox((.81, y + .15, k * .22), (.02, .26, .035), 0, 1), False)
    y += .3
    if i < 4:
        wf.add('Cream', rbox((0, y + .06, 0), (1.5, .12, 1.5), .04, 1))
        y += .12
wf.add('Choco', rbox((0, y + .07, 0), (1.7, .14, 1.7), .06, 2))
for k in range(8):  # Schoko-Nasen am Rand
    a = 2 * math.pi * k / 8
    wf.add('Choco', sphere((math.cos(a) * .82, y - .05, math.sin(a) * .82), .1, (1, 1.8, 1), 8, 6))
wf.add('Cream', sphere((0, y + .3, 0), .35, (1, .7, 1), 14, 8))
wf.add('Cherry', sphere((0, y + .6, 0), .17, (1, 1, 1), 12, 8))
wf.add('Stem', tube([(0, y + .74, 0), (.05, y + .92, 0), (.14, y + 1.02, 0)], .02, 5))
wf.finish()

# ---------------------------------------------------------------- Sahnehaube
cr = Part('CH_Cream')
cr.add('Cream', sphere((0, .35, 0), .85, (1, .5, 1), 18, 10))
for yy, R, r in ((.25, .9, .3), (.6, .68, .26), (.9, .46, .22), (1.15, .26, .17)):
    cr.add('Cream', torus((0, yy, 0), R, r, (0, 1, 0), 22, 10))
cr.add('Cream', cyl((0, 1.2, 0), (0, 1.6, 0), .2, .02, 12))
cr.add('Cherry', sphere((.08, 1.55, 0), .2, (1, 1, 1), 12, 8))
cr.add('Stem', tube([(.08, 1.72, 0), (.16, 1.95, .02), (.3, 2.05, .04)], .025, 5))
for k in range(10):  # Schoko-Streusel
    a = 2 * math.pi * k / 10 + .3
    cr.add('Choco', rbox((math.cos(a) * .55, .95 + (k % 3) * .12, math.sin(a) * .55), (.12, .03, .03), 0, 1, (0, 0, a)), False)
cr.finish()

# ---------------------------------------------------------------- Schokobrunnen
fo = Part('CH_Fountain')
fo.add('Silver', cyl((0, 0, 0), (0, .55, 0), 2.6, 2.4, 32))
fo.add('Flow', cyl((0, .5, 0), (0, .58, 0), 2.28, 2.28, 32))
fo.add('Silver', cyl((0, .55, 0), (0, 4.4, 0), .22, .18, 12))
tiers = ((1.9, 1.7), (3.05, 1.08), (4.05, .58))
prev_y = .58
for i, (ty, r) in enumerate(tiers):
    fo.add('Silver', cyl((0, ty - .25, 0), (0, ty, 0), r * .35, r, 28))
    fo.add('Flow', cyl((0, ty - .02, 0), (0, ty + .03, 0), r * .95, r * .95, 28))
    bottom = tiers[i - 1][0] + .05 if i else prev_y   # Vorhang bis zur naechsten Schale darunter
    fo.add('Flow', cyl((0, ty, 0), (0, bottom, 0), r * 1.02, r * 1.1 + .05, 28, False))
fo.add('Flow', sphere((0, 4.45, 0), .32, (1, .8, 1), 14, 8))
for k in range(12):  # Erdbeeren am Beckenrand
    a = 2 * math.pi * k / 12
    fo.add('Cherry', sphere((math.cos(a) * 2.5, .68, math.sin(a) * 2.5), .16, (1, 1.2, 1), 10, 6))
fo.finish()

# ---------------------------------------------------------------- Praline
pr = Part('CH_Praline')
pr.add('FoilPink', sphere((0, .55, 0), .55, (1.15, 1, 1), 18, 12))
for sx in (-1, 1):
    pts = []
    pr.add('FoilGold', cyl((sx * .55, .55, 0), (sx * 1.15, .55, 0), .14, .38, 10))
    pr.add('FoilGold', torus((sx * .6, .55, 0), .16, .04, (1, 0, 0), 12, 6))
pr.add('FoilGold', torus((0, .55, 0), .56, .035, (1, 0, 0), 24, 6))
pr.finish()

# ---------------------------------------------------------------- Zuckerwatte-Baeume
for name, mat in (('CH_TreePink', 'Candy'), ('CH_TreeBlue', 'CandyBlue')):
    t = Part(name)
    t.add('Stick', cyl((0, 0, 0), (0, 2.4, 0), .13, .09, 10))
    for (x, yy, z, r) in ((0, 3.3, 0, 1.15), (.75, 2.95, .2, .8), (-.7, 3.0, -.1, .85), (.1, 2.85, -.7, .75), (-.1, 2.9, .7, .75), (.25, 3.95, .15, .75), (-.3, 3.8, -.2, .65)):
        t.add(mat, lumpy((x, yy, z), r, .12, 2.2, 2, (1, 1, 1)))
    t.finish()

rep = export_glb(ROOT / 'assets' / 'choco.glb')
(ROOT / 'art' / 'r61' / 'choco_report.json').write_text(json.dumps(rep, indent=1), encoding='utf-8')
print('REPORT', json.dumps(rep))
