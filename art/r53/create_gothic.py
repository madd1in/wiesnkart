"""Mushroom Rally R53: Gothic-Paket fuer das Geisterhaus (Castlevania-Stimmung) und ein Besen-Zauberer im
Kamek-Stil - eigene, stilisierte Entwuerfe (keine Original-Modelle, keine Logos). Export assets/gothic.glb:
  GT_Gate        gotisches Uhrturm-Tor zum Durchfahren: zwei Pfeiler mit Strebepfeilern und Fialen, Spitzbogen,
                 Rosettenfenster aus Buntglas, Turmuhr mit Zeigern, Wasserspeier, Fledermaus-Silhouette
  GT_Candelabra  eiserner Kandelaber (Dreifuss, drei Arme, Kerzen); Flammen als eigenes Teil GT_Flame (flackert im Spiel)
  GT_Flame       drei Kerzenflammen (Ursprung am Kandelaber-Fuss, gleiche Lage)
  GT_Ruin        Ruinenmauer mit Spitzbogenfenster aus Buntglas und abgebrochenen Zinnen
  GT_Coffin      aufrechter Sarg mit Deckelkreuz aus Messing und Kerze davor
  GT_BatBody / GT_BatWing   Fledermaus (Fluegel als eigene Instanz, schlaegt im Spiel)
  GT_Wizard      Besen-Zauberer: blaue Kutte und Spitzhut, runde Brille, Schnabel-Schnauze, Zauberstab
                 (Kugel mit Stern), sitzt quer auf einem Reisigbesen - fliegt nach +z
  GT_SpellRing / GT_SpellSquare / GT_SpellTri   Zauber-Formen (leuchtend), die der Zauberer auf die Strasse wirft
Koordinaten: Spielkoordinaten ueber blib.G (x rechts, y hoch, z vorwaerts), Ursprung jeweils Boden Mitte.
"""
import sys, math, json, pathlib, importlib
sys.path.append(r'C:/Users/User/Documents/Playground/mushroom-rally/art/lib')
import bpy, bmesh
from mathutils import Vector, Matrix
import blib
importlib.reload(blib)
from blib import *

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
blib.init_scene('R53_Gothic')
use_materials({
    'Stone': material('GothStone', (.36, .33, .4, 1), .88),
    'StoneLt': material('GothStoneLight', (.52, .48, .55, 1), .85),
    'Moss': material('Moss', (.22, .34, .2, 1), .9),
    'Iron': material('Iron', (.12, .11, .13, 1), .45, .75),
    'Brass': material('Brass', (.95, .72, .3, 1), .3, .85),
    'Wax': material('Wax', (.95, .9, .78, 1), .6),
    'Flame': material('CandleFlame', (1, .7, .25, 1), .3, 0, (1, .55, .15, 1), 5.0),
    'GlassR': material('GlassRed', (.9, .12, .2, 1), .2, 0, (.95, .1, .2, 1), 1.6),
    'GlassB': material('GlassBlue', (.2, .3, .95, 1), .2, 0, (.2, .3, 1, 1), 1.6),
    'GlassV': material('GlassViolet', (.6, .25, .9, 1), .2, 0, (.62, .22, .95, 1), 1.6),
    'GlassG': material('GlassGold', (1, .8, .3, 1), .2, 0, (1, .75, .25, 1), 1.6),
    'ClockFace': material('ClockFace', (.95, .9, .75, 1), .5, 0, (.95, .85, .55, 1), .8),
    'Coffin': material('CoffinWood', (.25, .12, .1, 1), .6),
    'Velvet': material('Velvet', (.55, .05, .12, 1), .8),
    'Bat': material('BatFur', (.12, .08, .16, 1), .8),
    'BatWing': material('BatWing', (.22, .12, .26, 1), .7),
    'BatEye': material('BatEye', (1, .2, .2, 1), .3, 0, (1, .15, .1, 1), 3.0),
    'Robe': material('WizardRobe', (.12, .3, .82, 1), .6),
    'RobeTrim': material('WizardTrim', (.95, .95, .98, 1), .5),
    'Skin': material('WizardSkin', (.98, .86, .56, 1), .6),
    'Beak': material('WizardBeak', (1, .72, .3, 1), .5),
    'Glasses': material('WizardGlasses', (.9, .95, 1, 1), .1, 0, (.7, .85, 1, 1), .4),
    'Frame': material('WizardFrame', (.85, .7, .2, 1), .3, .8),
    'Eye': material('Eye', (.05, .05, .08, 1), .2),
    'Broom': material('BroomStick', (.55, .35, .18, 1), .7),
    'Straw': material('BroomStraw', (.9, .72, .35, 1), .8),
    'Wand': material('WandGlow', (1, .95, .5, 1), .2, 0, (1, .9, .4, 1), 3.0),
    'SpellR': material('SpellRed', (1, .25, .3, 1), .2, 0, (1, .2, .25, 1), 3.2),
    'SpellG': material('SpellGreen', (.3, 1, .45, 1), .2, 0, (.25, 1, .4, 1), 3.2),
    'SpellB': material('SpellBlue', (.35, .55, 1, 1), .2, 0, (.3, .5, 1, 1), 3.2),
})

def cone(base, tip, r, seg=12):
    return cyl(base, tip, r, 0.0, seg)

def lancet(cx, cy_side, cz, half, h, n=10, depth=.2):
    """Spitzbogen-Flaeche (Profil in der Querebene) mit Dicke depth - fuer Fenster und Toroeffnungen."""
    # Spitzbogen aus zwei Viertelellipsen, die sich oben in einer Spitze treffen
    left = [(cx - half + half * (1 - math.cos(t * math.pi / 2)), cy_side + h * .55 * math.sin(t * math.pi / 2) ** .8) for t in [i / n for i in range(n + 1)]]
    right = [(2 * cx - x, y) for x, y in reversed(left)]
    poly = [(cx - half, cy_side - h)] + left + right[1:] + [(cx + half, cy_side - h)]
    return xy_prism(poly, cz - depth / 2, cz + depth / 2)

# ======================================================== Uhrturm-Tor (Durchfahrt |x| < 11 m)
gt = Part('GT_Gate')
for sx in (-1, 1):
    x = sx * 13.2
    gt.add('Stone', rbox((x, 9, 0), (4.4, 18, 4.4), .1, 1), smooth=False)
    gt.add('StoneLt', rbox((x, 18.3, 0), (5.0, .7, 5.0), .06, 1), smooth=False)
    gt.add('Stone', cone((x, 18.6, 0), (x, 25, 0), 2.6, 4))                 # Pfeilerspitze (Pyramide)
    gt.add('Iron', cyl((x, 25, 0), (x, 26.4, 0), .08, .04, 5))
    for sz in (-1, 1):                                                        # Strebepfeiler
        gt.add('Stone', prism([(sz * 2.2, 0), (sz * 4.2, 0), (sz * 2.2, 12)], x - .7, x + .7), smooth=False)
        gt.add('StoneLt', cone((x, 13.6, sz * 2.4), (x, 16.2, sz * 2.4), .45, 6))
    for y in (5, 11):
        gt.add('GlassV' if y == 5 else 'GlassR', lancet(x - sx * 2.22, y, 0, .6, 1.8, 8, .1), smooth=False)
    gt.add('StoneLt', sphere((x - sx * 2.3, 16.2, 2.0), .5, (1, .8, 1.3), 8, 6))   # Wasserspeier
    gt.add('Eye', sphere((x - sx * 2.55, 16.3, 2.5), .1, (1, 1, 1), 6, 4))
# Spitzbogen-Bruecke oben: Zwickel zwischen Bogen und Balken
arch = [(-11 + 11 * (1 - math.cos(t * math.pi / 2)), 9 + 6.5 * math.sin(t * math.pi / 2) ** .85) for t in [i / 16 for i in range(17)]]
arch = arch + [(-x, y) for x, y in reversed(arch[:-1])]
gt.add('Stone', xy_prism([(-11, 17.2)] + arch + [(11, 17.2)], -1.6, 1.6), smooth=False)
band = [(x * 1.05, y + .5) for x, y in arch]
gt.add('StoneLt', xy_prism([(-11.6, 8.6)] + band + [(11.6, 8.6)] + list(reversed(arch)), -1.75, 1.75), smooth=False)
gt.add('Stone', rbox((0, 18, 0), (30.8, 1.6, 3.6), .08, 1), smooth=False)
for k in range(11):                                                           # Zinnen
    gt.add('Stone', rbox((-12.5 + k * 2.5, 19.3, 0), (1.3, 1.2, 3.4), .04, 1), smooth=False)
# Uhrturm in der Mitte ueber dem Bogen
gt.add('Stone', rbox((0, 22.5, 0), (6.4, 8, 5), .08, 1), smooth=False)
gt.add('Stone', cone((0, 26.4, 0), (0, 33.5, 0), 4.3, 4))
gt.add('Iron', cyl((0, 33.4, 0), (0, 35.2, 0), .1, .05, 5))
for zf in (-2.55, 2.55):
    s = 1 if zf > 0 else -1
    gt.add('StoneLt', cyl((0, 23, zf), (0, 23, zf + s * .15), 2.5, 2.5, 28))
    gt.add('ClockFace', cyl((0, 23, zf + s * .15), (0, 23, zf + s * .2), 2.2, 2.2, 28))
    for k in range(12):
        a = k * math.pi / 6
        gt.add('Iron', rbox((math.cos(a) * 1.85, 23 + math.sin(a) * 1.85, zf + s * .24), (.12, .35 if k % 3 else .6, .05), 0, 1, rot=(0, 0, a + math.pi / 2)), smooth=False)
    gt.add('Iron', rbox((.45, 23.6, zf + s * .27), (.14, 1.5, .05), 0, 1, rot=(0, 0, -.6)), smooth=False)   # Zeiger kurz vor zwoelf
    gt.add('Iron', rbox((-.2, 22.3, zf + s * .27), (.12, 1.2, .05), 0, 1, rot=(0, 0, 2.6)), smooth=False)
# Rosettenfenster unter der Uhr (Buntglas)
for zf in (-1.65, 1.65):
    s = 1 if zf > 0 else -1
    gt.add('StoneLt', torus((0, 15.6, zf), 1.6, .18, (0, 0, 1), 28, 6))
    for k in range(8):
        a0 = k * math.pi / 4
        key = ('GlassR', 'GlassB', 'GlassV', 'GlassG')[k % 4]
        gt.add(key, lambda bm, a0=a0, zf=zf: bmesh.ops.recalc_face_normals(bm, faces=[bm.faces.new([
            bm.verts.new(G(0, 15.6, zf + s * .02)),
            bm.verts.new(G(math.cos(a0) * 1.5, 15.6 + math.sin(a0) * 1.5, zf + s * .02)),
            bm.verts.new(G(math.cos(a0 + math.pi / 4) * 1.5, 15.6 + math.sin(a0 + math.pi / 4) * 1.5, zf + s * .02))])]), smooth=False)
gt.finish()

# ======================================================== Kandelaber und Flammen
cd = Part('GT_Candelabra')
for k in range(3):
    a = k * 2 * math.pi / 3
    cd.add('Iron', cyl((0, .9, 0), (math.cos(a) * .9, 0, math.sin(a) * .9), .07, .07, 6))
    cd.add('Iron', sphere((math.cos(a) * .9, .05, math.sin(a) * .9), .14, (1, .6, 1), 6, 4))
cd.add('Iron', cyl((0, .9, 0), (0, 4.2, 0), .1, .08, 8))
for y in (1.6, 2.8):
    cd.add('Iron', sphere((0, y, 0), .18, (1, .6, 1), 8, 6))
cd.add('Iron', tube([(-1.2, 4.9, 0), (-1.1, 4.3, 0), (-.5, 4.0, 0), (0, 4.2, 0), (.5, 4.0, 0), (1.1, 4.3, 0), (1.2, 4.9, 0)], .06, 6))
FL = Part('GT_Flame')
for x, y in ((-1.2, 4.9), (0, 4.2), (1.2, 4.9)):
    cd.add('Iron', cyl((x, y, 0), (x, y + .12, 0), .22, .22, 10))
    cd.add('Wax', cyl((x, y + .12, 0), (x, y + .95, 0), .11, .11, 10))
    FL.add('Flame', sphere((x, y + 1.18, 0), .13, (1, 1.9, 1), 8, 6))
cd.add('Iron', cyl((0, 4.2, 0), (0, 5.5, 0), .06, .05, 6))
cd.add('Iron', sphere((0, 5.55, 0), .12, (1, 1, 1), 6, 4))
cd.finish()
FL.finish()

# ======================================================== Ruinenmauer mit Buntglasfenster
ru = Part('GT_Ruin')
ru.add('Stone', xy_prism([(-5, 0), (5, 0), (5, 7.5), (3.8, 8.4), (3.2, 7.2), (2.2, 9.6), (1.2, 8.8), (-.6, 10.2), (-1.8, 8.6), (-3.2, 9.2), (-5, 6.8)], -.6, .6), smooth=False)
ru.add('StoneLt', rbox((0, .35, 0), (10.6, .7, 1.6), .06, 1), smooth=False)
ru.add('StoneLt', lancet(0, 5.2, .62, 1.55, 3.6, 10, .12), smooth=False)
for i, (x0, key) in enumerate(((-1.3, 'GlassR'), (-.45, 'GlassB'), (.45, 'GlassV'), (1.3, 'GlassG'))):
    ru.add(key, rbox((x0, 3.4, .7), (.8, 3.4, .05), 0, 1), smooth=False)
ru.add('GlassV', lancet(0, 5.9, .72, .9, 1.0, 8, .05), smooth=False)
for (x, y, z, s) in ((-4.2, .3, 1.2, .7), (4.6, .25, -1.3, .6), (3.4, .2, 1.4, .45)):
    ru.add('Stone', rbox((x, y, z), (s * 1.6, s, s * 1.2), .08, 1, rot=(0, x, 0)), smooth=False)
ru.add('Moss', sphere((-3.8, 6.6, 0), 1, (1.2, .3, .7), 8, 4))
ru.add('Moss', sphere((2.6, 8.8, 0), 1, (.8, .25, .7), 8, 4))
ru.finish()

# ======================================================== Sarg
co = Part('GT_Coffin')
hexa = [(-.55, 0), (.55, 0), (.8, 1.6), (.5, 2.5), (-.5, 2.5), (-.8, 1.6)]
co.add('Coffin', xy_prism(hexa, -.35, .35), smooth=False)
co.add('Velvet', xy_prism([(x * .82, y * .93 + .08) for x, y in hexa], .35, .38), smooth=False)
co.add('Coffin', xy_prism([(x * .9, y * .96 + .05) for x, y in hexa], .38, .5), smooth=False)
co.add('Brass', rbox((0, 1.55, .52), (.14, 1.3, .04), 0, 1), smooth=False)
co.add('Brass', rbox((0, 1.85, .52), (.7, .14, .04), 0, 1), smooth=False)
co.add('Wax', cyl((0, 0, 1.0), (0, .45, 1.0), .08, .08, 8))
co.add('Flame', sphere((0, .6, 1.0), .08, (1, 1.8, 1), 6, 4))
co.finish()

# ======================================================== Fledermaus (Koerper + Fluegel getrennt)
bb = Part('GT_BatBody')
bb.add('Bat', sphere((0, 0, 0), .32, (1, .9, 1.25), 10, 8))
bb.add('Bat', sphere((0, .18, .32), .22, (1, 1, 1), 10, 8))
for sx in (-1, 1):
    bb.add('Bat', cone((sx * .12, .34, .34), (sx * .2, .6, .3), .08, 5))
    bb.add('BatEye', sphere((sx * .08, .22, .52), .045, (1, 1, 1), 6, 4))
bb.finish()
bw = Part('GT_BatWing')                                   # beide Fluegel, Gelenk an der Koerperachse
for sx in (-1, 1):
    pts = [(sx * .2, .05), (sx * 1.2, .45), (sx * 1.6, .1), (sx * 1.25, -.05), (sx * 1.0, -.25), (sx * .7, -.08), (sx * .45, -.28), (sx * .2, -.1)]
    bw.add('BatWing', lambda bm, pts=pts: bmesh.ops.recalc_face_normals(bm, faces=[bm.faces.new([bm.verts.new(G(x, .05 + abs(x) * .18, -z * .9)) for x, z in pts])]), smooth=False)
bw.finish()

# ======================================================== Besen-Zauberer (Kamek-Stil, eigener Entwurf)
wz = Part('GT_Wizard')
wz.add('Broom', cyl((0, 0, -2.2), (0, 0, 1.9), .07, .07, 8))              # Besenstiel entlang z
wz.add('Straw', cone((0, 0, -1.9), (0, 0, -3.4), .55, 14))
wz.add('Straw', cyl((0, 0, -1.9), (0, 0, -1.75), .56, .56, 14))
wz.add('Broom', torus((0, 0, -1.95), .5, .05, (0, 0, 1), 16, 4))
wz.add('Robe', cone((0, -.1, .1), (0, 1.9, .1), .95, 18))                # Kutte (Kegel) sitzt auf dem Stiel
wz.add('Robe', cyl((0, -.15, .1), (0, .15, .1), .98, .98, 18))
wz.add('RobeTrim', torus((0, -.12, .1), .98, .07, (0, 1, 0), 24, 5))
wz.add('RobeTrim', cyl((0, 1.1, .1), (0, 1.4, .1), .62, .55, 16))         # weisser Kragen
wz.add('Skin', sphere((0, 1.85, .25), .55, (1, .95, 1), 16, 12))          # Kopf
wz.add('Beak', sphere((0, 1.72, .78), .3, (1, .75, 1.2), 12, 8))          # Schnabel-Schnauze
for sx in (-1, 1):
    wz.add('Frame', torus((sx * .22, 1.98, .7), .17, .03, (0, 0, 1), 16, 4))
    wz.add('Glasses', cyl((sx * .22, 1.98, .69), (sx * .22, 1.98, .71), .15, .15, 12))
    wz.add('Eye', sphere((sx * .22, 1.98, .66), .06, (1, 1, .5), 8, 6))
wz.add('Frame', cyl((-.06, 1.98, .72), (.06, 1.98, .72), .02, .02, 4))
wz.add('Robe', cone((0, 2.15, .2), (0, 3.6, -.35), .72, 18))              # Spitzhut, leicht nach hinten
wz.add('RobeTrim', torus((0, 2.2, .2), .68, .08, (0, 1, .2), 22, 5))
for sx in (-1, 1):                                                        # Aermel und Haende
    wz.add('Robe', cyl((sx * .5, 1.2, .2), (sx * .85, .85, .75), .22, .28, 10))
    wz.add('RobeTrim', torus((sx * .85, .85, .75), .27, .05, (sx * .5, -.4, 1), 14, 4))
    wz.add('Skin', sphere((sx * .88, .8, .88), .16, (1, 1, 1), 8, 6))
wz.add('Broom', cyl((.9, .75, .9), (1.1, 1.9, 1.5), .045, .04, 6))       # Zauberstab rechts
wz.add('Wand', sphere((1.12, 2.0, 1.55), .17, (1, 1, 1), 10, 8))
wz.add('Wand', lambda bm: bmesh.ops.recalc_face_normals(bm, faces=[bm.faces.new([bm.verts.new(G(1.12 + math.cos(a) * r, 2.0 + math.sin(a) * r, 1.62))
        for a, r in [(math.pi / 2 + i * math.pi / 5, .42 if i % 2 == 0 else .18) for i in range(10)]])]), smooth=False)
for sx in (-1, 1):                                                        # Fuesse unter der Kutte
    wz.add('Beak', sphere((sx * .35, -.25, .55), .18, (1, .6, 1.5), 8, 6))
wz.finish()

# ======================================================== Zauber-Formen (Ring, Quadrat, Dreieck)
sr = Part('GT_SpellRing')
sr.add('SpellR', torus((0, 0, 0), .8, .18, (0, 1, 0), 28, 8))
sr.finish()
sq = Part('GT_SpellSquare')
for k in range(4):
    a = k * math.pi / 2
    sq.add('SpellG', rbox((math.cos(a) * .72, 0, math.sin(a) * .72), (.28, .28, 1.72), .06, 1, rot=(0, a, 0)))
sq.finish()
tr = Part('GT_SpellTri')
for k in range(3):
    a0, a1 = k * 2 * math.pi / 3 + math.pi / 2, (k + 1) * 2 * math.pi / 3 + math.pi / 2
    p0 = (math.cos(a0) * .95, 0, math.sin(a0) * .95)
    p1 = (math.cos(a1) * .95, 0, math.sin(a1) * .95)
    tr.add('SpellB', cyl(p0, p1, .15, .15, 8))
    tr.add('SpellB', sphere(p0, .17, (1, 1, 1), 8, 6))
tr.finish()

tris = export_glb(ROOT / 'assets' / 'gothic.glb')
report = {'asset': 'gothic.glb', 'authoring': 'Original procedural Blender models (gothic horror mood, Kamek-style broom wizard homage; no original game assets)',
          'source': 'art/r53/create_gothic.py', 'triangles': sum(tris.values()), 'parts': tris, 'bytes': (ROOT / 'assets' / 'gothic.glb').stat().st_size}
(ROOT / 'art' / 'r53' / 'gothic_report.json').write_text(json.dumps(report, indent=1), encoding='utf-8')
print('REPORT', json.dumps(report))
