"""Suppa Lederhosn Karts R59: huebschere Almkuh (Fleckvieh im Almabtrieb-Schmuck), ersetzt die Kuh aus
art/r44/create_critters.py. Gleiche Drehpunkte, damit die Animation im Spiel passt. Export assets/cow.glb:
  CW_Body   Rumpf (weiss mit rotbraunen Flecken), Euter, Glocke am bestickten Halsband
  CW_Head   weisser Kopf, grosse Augen mit Wimpern, rosa Maul, Hoerner, Blumenkranz (Drehpunkt am Hals)
  CW_Leg    ein Bein mit Knie und gespaltenem Huf (Drehpunkt an der Huefte bei y=1.1)
  CW_Tail   Schwanz mit Quaste (Drehpunkt an der Schwanzwurzel, wedelt im Spiel)
Spiel-Koordinaten: y oben, Kuh schaut nach +z, Ursprung Boden Mitte.
Aufruf: blender -b --factory-startup --python art/r59/create_cow.py
"""
import sys, math, json, pathlib, importlib
sys.path.append(r'C:/Users/User/Documents/Playground/mushroom-rally/art/lib')
import bpy
from mathutils import Vector
import blib
importlib.reload(blib)
from blib import *

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
blib.init_scene('R59_Cow')
use_materials({
    'CowWhite': material('CowWhite', (.93, .9, .85, 1), .7),
    'CowRed': material('CowRed', (.36, .12, .04, 1), .75),
    'Pink': material('CowPink', (1, .55, .6, 1), .55),
    'PinkDark': material('CowPinkDark', (.55, .2, .25, 1), .6),
    'Dark': material('CowDark', (.04, .035, .035, 1), .45),
    'EyeWhite': material('EyeWhite', (1, 1, 1, 1), .2),
    'Horn': material('CowHorn', (.95, .88, .7, 1), .45),
    'HornTip': material('CowHornTip', (.25, .2, .15, 1), .5),
    'Brass': material('BellBrass', (1, .72, .2, 1), .25, .9),
    'Strap': material('BellStrap', (.7, .06, .08, 1), .6),
    'Stitch': material('StrapStitch', (1, 1, 1, 1), .5),
    'FlowerRed': material('FlowerRed', (1, .1, .15, 1), .5),
    'FlowerYellow': material('FlowerYellow', (1, .82, .1, 1), .5),
    'FlowerBlue': material('FlowerBlue', (.15, .4, 1, 1), .5),
    'FlowerWhite': material('FlowerWhite', (1, 1, 1, 1), .5),
    'Leaf': material('Leaf', (.15, .5, .12, 1), .7),
})

# ================================================================== Rumpf
b = Part('CW_Body')
b.add('CowWhite', sphere((0, 1.52, -.05), 1, (.74, .7, 1.2), 24, 14))          # Bauch
b.add('CowWhite', sphere((0, 1.6, .72), .66, (1, 1, 1), 20, 12))                # Brust / Schultern
b.add('CowWhite', sphere((0, 1.66, -.78), .68, (1.02, 1, 1), 20, 12))           # Kruppe
b.add('CowWhite', sphere((0, 1.72, 1.02), .42, (1, 1.1, 1), 14, 10))           # Hals-Ansatz
# rotbraune Flecken (leicht ueber der Haut, flach)
for (x, y, z, sx, sy, sz) in ((.52, 1.72, .35, .42, .5, .6), (-.56, 1.55, -.35, .42, .55, .7), (.18, 2.05, -.75, .5, .25, .5),
                               (-.3, 2.0, .45, .45, .22, .4), (.55, 1.5, -.85, .35, .45, .45), (-.5, 1.85, .95, .3, .35, .35),
                               (0, 2.1, .1, .5, .2, .55)):
    b.add('CowRed', sphere((x * 1.02, y, z), 1, (sx, sy, sz), 14, 8))
b.add('Pink', sphere((0, .95, -.42), .34, (1, .72, 1.05), 16, 10))              # Euter
for sx in (-.1, .1):
    for sz in (-.52, -.3):
        b.add('Pink', cyl((sx, .8, sz), (sx, .62, sz), .045, .035, 8))
# Halsband mit Stickerei und Glocke
b.add('Strap', torus((0, 1.62, 1.1), .46, .075, (0, .35, 1), 24, 6))
for k in range(8):
    a = -math.pi / 2 + (k - 3.5) * .28
    b.add('Stitch', sphere((math.cos(a) * .47, 1.62 + math.sin(a) * .47 * .94, 1.1 + math.sin(a) * .16), .035, (1, 1, 1), 6, 4))
b.add('Brass', cyl((0, 1.14, 1.3), (0, .7, 1.3), .16, .28, 16))                 # Glocke
b.add('Brass', torus((0, .7, 1.3), .27, .04, (0, 1, 0), 18, 5))
b.add('Brass', sphere((0, 1.16, 1.3), .1, (1, 1, 1), 10, 6))
b.add('Dark', sphere((0, .66, 1.3), .07, (1, 1, 1), 8, 5))                      # Kloeppel
b.finish()

# ================================================================== Kopf (Drehpunkt am Hals)
h = Part('CW_Head')
NECK = (0, 1.8, 1.0)
h.add('CowWhite', sphere((0, 2.0, 1.45), .46, (.86, .95, 1.1), 20, 12))         # Schaedel
h.add('CowWhite', sphere((0, 1.84, 1.78), .36, (.9, .85, 1.0), 18, 10))         # Nasenruecken
h.add('Pink', sphere((0, 1.74, 2.02), .3, (1.05, .78, .72), 18, 10))            # Maul
for sx in (-1, 1):
    h.add('PinkDark', sphere((sx * .11, 1.78, 2.22), .055, (1, 1.2, .5), 8, 5))  # Nuestern
    h.add('CowRed', sphere((sx * .24, 2.12, 1.62), .19, (1, 1, .55), 12, 8))     # Augenfleck
    h.add('EyeWhite', sphere((sx * .25, 2.12, 1.72), .13, (1, 1.1, .7), 14, 8))  # grosse Augen
    h.add('Dark', sphere((sx * .25, 2.1, 1.8), .085, (1, 1.15, .6), 12, 8))
    h.add('EyeWhite', sphere((sx * .22, 2.15, 1.845), .025, (1, 1, 1), 6, 4))    # Glanzpunkt
    for k in range(3):                                                           # Wimpern
        h.add('Dark', cyl((sx * (.2 + k * .05), 2.24, 1.78), (sx * (.18 + k * .07), 2.33, 1.82), .012, .006, 4))
    h.add('CowRed', sphere((sx * .52, 2.12, 1.3), .2, (1.35, .55, .75), 12, 8))  # Ohren
    h.add('Pink', sphere((sx * .58, 2.1, 1.34), .12, (1.2, .4, .55), 10, 6))
    horn = [(sx * (.24 + .34 * math.sin(k / 6 * math.pi / 2)), 2.33 + .36 * (k / 6) ** 1.6, 1.34 + .06 * k / 6) for k in range(7)]
    for i in range(6):                                                           # nach aussen und oben geschwungen, spitz zulaufend
        h.add('Horn', cyl(horn[i], horn[i + 1], .075 - i * .009, .075 - (i + 1) * .009, 8))
    h.add('HornTip', sphere(horn[-1], .03, (1, 1, 1), 8, 5))
h.add('CowRed', sphere((0, 2.42, 1.4), .16, (1.2, .6, 1), 10, 6))                # Stirnlocke
# Almabtrieb-Kranz zwischen den Hoernern
cols = ['FlowerRed', 'FlowerYellow', 'FlowerBlue', 'FlowerWhite']
for k in range(12):
    a = k / 12 * math.pi
    x, z = math.cos(a) * .3, 1.4 + math.sin(a) * .12
    h.add('Leaf', sphere((x, 2.4, z), .07, (1.3, .6, 1), 8, 5))
    h.add(cols[k % 4], sphere((x, 2.46, z + .02), .075, (1, .8, 1), 10, 6))
    h.add('FlowerYellow', sphere((x, 2.5, z + .03), .03, (1, 1, 1), 6, 4))
h.finish(origin=NECK)

# ================================================================== Bein (Drehpunkt an der Huefte)
lg = Part('CW_Leg')
lg.add('CowWhite', cyl((0, 1.15, 0), (0, .6, .03), .19, .15, 12))
lg.add('CowWhite', sphere((0, .6, .03), .15, (1, 1, 1), 10, 6))                 # Knie
lg.add('CowWhite', cyl((0, .6, .03), (0, .2, 0), .14, .12, 12))
for sx in (-.055, .055):                                                          # gespaltener Huf
    lg.add('Dark', cyl((sx, .21, .02), (sx, 0, .05), .07, .085, 8))
lg.finish(origin=(0, 1.1, 0))

# ================================================================== Schwanz (Drehpunkt an der Wurzel)
t = Part('CW_Tail')
ROOT_T = (0, 1.98, -1.32)
t.add('CowWhite', tube([ROOT_T, (0, 1.75, -1.5), (0, 1.3, -1.56), (0, .95, -1.52)], .055, 6))
t.add('CowRed', sphere((0, .86, -1.52), .13, (1, 1.8, 1), 10, 6))                # Quaste
t.finish(origin=ROOT_T)

rep = export_glb(ROOT / 'assets' / 'cow.glb')
(ROOT / 'art' / 'r59' / 'cow_report.json').write_text(json.dumps(rep, indent=1), encoding='utf-8')
print('REPORT', json.dumps(rep))

# ---------------------------------------------------------------- Vorschau: Kuh zusammengesetzt
scn = bpy.context.scene
prev = bpy.data.collections.new('Preview')
scn.collection.children.link(prev)
world = bpy.data.worlds.new('W')
scn.world = world
world.use_nodes = True
bg = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
bg.inputs['Color'].default_value = (.55, .75, .95, 1)
bg.inputs['Strength'].default_value = .9
sun = bpy.data.lights.new('S', 'SUN')
sun.energy = 3.2
so = bpy.data.objects.new('S', sun)
prev.objects.link(so)
so.rotation_euler = (math.radians(50), 0, math.radians(30))
legs = bpy.data.objects['CW_Leg']
for i, (x, z) in enumerate([(-.38, .7), (.38, .7), (-.38, -.75), (.38, -.75)]):
    o = legs if i == 0 else legs.copy()
    if i:
        prev.objects.link(o)
    o.location = G(x, 1.1, z)
cam = bpy.data.cameras.new('Cam')
co = bpy.data.objects.new('Cam', cam)
prev.objects.link(co)
scn.camera = co
co.location = G(3.2, 2.4, 3.6)
co.rotation_euler = (G(0, 1.5, .3) - co.location).to_track_quat('-Z', 'Y').to_euler()
cam.lens = 40
r = scn.render
try:
    r.engine = 'BLENDER_EEVEE_NEXT'
except TypeError:
    try:
        r.engine = 'BLENDER_EEVEE'
    except TypeError:
        pass
if hasattr(scn, 'eevee'):
    scn.eevee.taa_render_samples = 16
r.resolution_x, r.resolution_y, r.resolution_percentage = 1000, 800, 100
r.image_settings.file_format = 'JPEG'
r.filepath = str(ROOT / 'art' / 'r59' / 'cow_preview.jpg')
bpy.ops.render.render(write_still=True, scene=scn.name)
print('PREVIEW', r.filepath)
