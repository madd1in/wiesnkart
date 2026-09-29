"""Suppa Lederhosn Karts R57: Gegner fuer den Graben-Flug (eigene Entwuerfe, keine Filmvorlagen).
Spiel-Koordinaten: y oben, +z vorn. Export assets/fortress.glb:
  FZ_Jaeger       Brezn-Jaeger: runde Stahlkapsel mit rotem Leuchtauge, Querstrebe, zwei senkrechte Fluegel in
                  Brezenform (gebackenes Braun, Salzkoerner), weiss-blaues Rautenband um die Kapsel
  FZ_TurretBase   Geschuetzturm-Sockel fuer den Grabenrand, weiss-blaues Rautenband
  FZ_TurretHead   Drehkopf (Kuppel, Doppelrohr, gluehende Muendungen); Drehpunkt bei (0, 2.6, 0)
Aufruf: blender -b --factory-startup --python art/r57/create_fortress.py  (FZ_PREVIEW=1: nur Vorschaubild klein)
"""
import sys, os, math, json, pathlib, importlib
sys.path.append(r'C:/Users/User/Documents/Playground/mushroom-rally/art/lib')
import bpy
from mathutils import Vector
import blib
importlib.reload(blib)
from blib import *

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
blib.init_scene('R57_Fortress')
use_materials({
    'Steel': material('Steel', (.16, .17, .2, 1), .38, .75),
    'SteelLight': material('SteelLight', (.46, .48, .54, 1), .32, .8),
    'Pretzel': material('Pretzel', (.5, .23, .07, 1), .55, 0),
    'Salt': material('Salt', (.96, .95, .92, 1), .7),
    'Eye': material('Eye', (1, .06, .03, 1), .3, 0, (1, .05, .02, 1), 2.5),
    'Thruster': material('Thruster', (1, .55, .2, 1), .3, 0, (1, .45, .12, 1), 4.0),
    'RautBlue': material('RautBlue', (.1, .42, .86, 1), .45),
    'RautWhite': material('RautWhite', (.95, .96, .98, 1), .45),
    'Muzzle': material('Muzzle', (1, .4, .15, 1), .3, 0, (1, .35, .1, 1), 5.0),
})


def rauten(p, y, R, n, h=.36, depth=.12):
    """Weiss-blaues Rautenband: kleine gedrehte Wuerfel rund um die y-Achse."""
    for i in range(n):
        a = i / n * 2 * math.pi
        p.add('RautBlue' if i % 2 else 'RautWhite',
              rbox((math.sin(a) * R, y, math.cos(a) * R), (h * .72, h * .72, depth), .02, 1, rot=(0, a, math.pi / 4)), smooth=False)


# ================================================================== Brezn-Jaeger
S = 1.55                                          # Brezen-Groesse
j = Part('FZ_Jaeger')
j.add('Steel', sphere((0, 0, 0), 1.0, (1, 1, 1.08), 24, 14))
j.add('Eye', sphere((0, 0, .9), .46, (1, 1, .45), 18, 10))
j.add('SteelLight', torus((0, 0, .9), .5, .07, (0, 0, 1), 24, 6))
j.add('Thruster', sphere((0, 0, -1.02), .3, (1, 1, .4), 12, 8))
for i in range(14):                               # Rautenband um die Kapsel (quer)
    a = i / 14 * 2 * math.pi
    j.add('RautBlue' if i % 2 else 'RautWhite', rbox((math.sin(a) * 1.0, math.cos(a) * 1.0, -.1), (.2, .2, .22), .02, 1, rot=(0, 0, -a + math.pi / 4)), smooth=False)
j.add('Steel', cyl((-2.05, 0, 0), (2.05, 0, 0), .2, .2, 12))
for sx in (-1, 1):
    x = sx * 2.15
    j.add('Pretzel', torus((x, 0, 0), S, .24, (1, 0, 0), 40, 10))
    for arm in (1, -1):                           # Brezen-Arme: oben in der Mitte verschlungen, unten seitlich am Bauch
        pts = [(x + arm * .05, .96 * S, arm * .14 * S), (x - arm * .05, .56 * S, 0), (x, .08 * S, -arm * .3 * S), (x, -.48 * S, -arm * .6 * S), (x, -.7 * S, -arm * .71 * S)]
        j.add('Pretzel', tube(pts, .21, 10))
    sd = 7 + (1 if sx > 0 else 0)
    for k in range(16):                           # Salzkoerner aussen auf der Breze
        sd = (sd * 16807) % 2147483647
        a = sd / 2147483647 * 2 * math.pi
        j.add('Salt', rbox((x + sx * .2, math.sin(a) * S, math.cos(a) * S), (.09, .09, .09), .01, 1, rot=(a, a * .7, 0)), smooth=False)
j.finish()

# ================================================================== Geschuetzturm
b = Part('FZ_TurretBase')
b.add('Steel', cyl((0, 0, 0), (0, 2.1, 0), 2.1, 1.7, 20))
b.add('SteelLight', cyl((0, 2.1, 0), (0, 2.3, 0), 1.75, 1.6, 20))
rauten(b, 1.15, 1.93, 18)
b.finish()

h = Part('FZ_TurretHead')
h.add('SteelLight', sphere((0, 2.6, 0), 1.5, (1, .72, 1), 22, 12))
h.add('Steel', rbox((0, 2.75, .9), (1.6, .8, 1.2), .12, 2))
for sx in (-.45, .45):
    h.add('Steel', cyl((sx, 2.8, .9), (sx, 2.8, 3.6), .23, .19, 12))
    h.add('Muzzle', torus((sx, 2.8, 3.6), .2, .07, (0, 0, 1), 14, 5))
h.add('Eye', sphere((0, 3.35, 1.25), .2, (1, 1, .6), 10, 6))
rauten(h, 2.25, 1.45, 16, .3, .1)
h.finish(origin=(0, 2.6, 0))

rep = export_glb(ROOT / 'assets' / 'fortress.glb')
(ROOT / 'art' / 'r57' / 'fortress_report.json').write_text(json.dumps(rep, indent=1), encoding='utf-8')
print('REPORT', json.dumps(rep))

# ---------------------------------------------------------------- Vorschau (nicht im Export)
scn = bpy.context.scene
prev = bpy.data.collections.new('Preview')
scn.collection.children.link(prev)
world = bpy.data.worlds.new('W')
scn.world = world
world.use_nodes = True
bg = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
bg.inputs['Color'].default_value = (.05, .06, .1, 1)
bg.inputs['Strength'].default_value = .6
for loc, en in [((6, -8, 9), 900), ((-7, 4, 5), 350)]:
    ld = bpy.data.lights.new('L', 'AREA')
    ld.energy = en
    ld.size = 6
    lo = bpy.data.objects.new('L', ld)
    prev.objects.link(lo)
    lo.location = loc
    lo.rotation_euler = (Vector((0, 0, 1)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
# Jaeger links, Turm rechts nebeneinander stellen
jo, bo, ho = (bpy.data.objects[n] for n in ('FZ_Jaeger', 'FZ_TurretBase', 'FZ_TurretHead'))
jo.location = (-3.2, 0, 2.2)
jo.rotation_euler = (0, 0, math.radians(-35))
bo.location = (4.0, 0, 0)
ho.location = (4.0, 0, 2.6)
ho.rotation_euler = (0, 0, math.radians(40))
cam = bpy.data.cameras.new('Cam')
co = bpy.data.objects.new('Cam', cam)
prev.objects.link(co)
scn.camera = co
co.location = (1.5, -14, 6.5)
co.rotation_euler = (Vector((.6, 0, 2.0)) - co.location).to_track_quat('-Z', 'Y').to_euler()
cam.lens = 38
r = scn.render
try:
    r.engine = 'BLENDER_EEVEE_NEXT'
except TypeError:
    try:
        r.engine = 'BLENDER_EEVEE'
    except TypeError:
        pass
if hasattr(scn, 'eevee'):
    scn.eevee.taa_render_samples = 8 if os.environ.get('FZ_PREVIEW') else 24
r.resolution_x, r.resolution_y, r.resolution_percentage = 1280, 720, (50 if os.environ.get('FZ_PREVIEW') else 100)
r.image_settings.file_format = 'JPEG'
r.filepath = str(ROOT / 'art' / 'r57' / 'fortress_preview.jpg')
bpy.ops.render.render(write_still=True, scene=scn.name)
print('PREVIEW', r.filepath)
