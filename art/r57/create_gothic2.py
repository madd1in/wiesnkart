"""Suppa Lederhosn Karts R57: Geisterhaus - mehr Gothic-Schloss (eigene Entwuerfe im Stil klassischer Vampirschloss-Spiele,
keine Figuren, Namen oder Originalgrafiken). Spiel-Koordinaten: y oben, +z zur Strasse. Export assets/gothic2.glb:
  G2_Armor      Ritterruestung auf Sockel mit Hellebarde und rotem Federbusch
  G2_Gargoyle   Wasserspeier auf Steinsaeule, rot gluehende Augen
  G2_Window     Ruinenwand mit Spitzbogen-Buntglasfenster (leuchtend)
  G2_Fence      schmiedeeisernes Zaunfeld (6 m) mit Speerspitzen zwischen Steinpfosten
  G2_Spire      hoher Schlossturm (achteckig, Spitzdach, rot gluehende Fenster) fuer den Hintergrund
Aufruf: blender -b --factory-startup --python art/r57/create_gothic2.py
"""
import sys, math, json, pathlib, importlib
sys.path.append(r'C:/Users/User/Documents/Playground/mushroom-rally/art/lib')
import bpy
from mathutils import Vector
import blib
importlib.reload(blib)
from blib import *

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
blib.init_scene('R57_Gothic2')
use_materials({
    'Stone': material('Stone', (.13, .12, .15, 1), .9),
    'StoneLight': material('StoneLight', (.24, .22, .26, 1), .85),
    'Iron': material('Iron', (.03, .03, .035, 1), .45, .7),
    'Armor': material('Armor', (.55, .57, .62, 1), .25, .95),
    'Gold': material('Gold', (.9, .62, .15, 1), .3, .9),
    'Plume': material('Plume', (.6, .02, .04, 1), .7),
    'Wood': material('Wood', (.12, .05, .02, 1), .8),
    'EyeRed': material('EyeRed', (1, .05, .02, 1), .3, 0, (1, .05, .02, 1), 5.0),
    'WinRed': material('WinRed', (1, .2, .05, 1), .4, 0, (1, .25, .05, 1), 2.5),
    'GlassRed': material('GlassRed', (.8, .05, .08, 1), .3, 0, (.9, .05, .1, 1), 1.6),
    'GlassBlue': material('GlassBlue', (.08, .15, .8, 1), .3, 0, (.1, .2, 1, 1), 1.6),
    'GlassGold': material('GlassGold', (.9, .6, .1, 1), .3, 0, (1, .65, .1, 1), 1.6),
    'GlassPurple': material('GlassPurple', (.45, .08, .7, 1), .3, 0, (.5, .1, .9, 1), 1.6),
    'Slate': material('Slate', (.06, .06, .09, 1), .6, .2),
})

# ================================================================== Ritterruestung
a = Part('G2_Armor')
a.add('Stone', rbox((0, .5, 0), (1.9, 1.0, 1.9), .06, 1), smooth=False)
a.add('StoneLight', rbox((0, 1.05, 0), (1.7, .12, 1.7), .03, 1), smooth=False)
for sx in (-1, 1):
    a.add('Armor', cyl((sx * .28, 1.1, 0), (sx * .3, 2.3, 0), .2, .18, 12))            # Beine
    a.add('Armor', sphere((sx * .3, 1.75, .06), .2, (1, .8, 1), 10, 6))               # Knie
    a.add('Armor', rbox((sx * .3, 1.18, .12), (.34, .16, .5), .05, 1))                # Fuesse
    a.add('Armor', sphere((sx * .62, 3.35, 0), .3, (1.1, .85, 1), 12, 8))            # Schulterstuecke
    a.add('Armor', cyl((sx * .68, 3.2, 0), (sx * .72, 2.45, .15), .13, .12, 10))      # Arme
a.add('Armor', rbox((0, 2.9, 0), (1.05, 1.3, .62), .18, 3))                             # Brustpanzer
a.add('Armor', cyl((0, 2.25, 0), (0, 2.45, 0), .5, .48, 14))                           # Hueftreif
a.add('Armor', sphere((0, 3.85, 0), .33, (1, 1.12, 1), 14, 10))                         # Helm
a.add('Iron', rbox((0, 3.85, .3), (.38, .06, .06), 0, 1), smooth=False)              # Sehschlitz
a.add('Plume', sphere((0, 4.3, -.12), .22, (.6, 1.4, 1.1), 10, 8))                      # Federbusch
a.add('Wood', cyl((.78, 1.1, .3), (.78, 5.4, .3), .05, .05, 8))                         # Hellebarde
a.add('Armor', rbox((.98, 5.0, .3), (.38, .7, .05), .02, 1), smooth=False)
a.add('Armor', cyl((.78, 5.4, .3), (.78, 5.9, .3), .06, .01, 8))
a.finish()

# ================================================================== Wasserspeier
g = Part('G2_Gargoyle')
g.add('Stone', rbox((0, 2.6, 0), (1.5, 5.2, 1.5), .05, 1), smooth=False)
g.add('StoneLight', rbox((0, 5.3, 0), (1.9, .3, 1.9), .04, 1), smooth=False)
g.add('StoneLight', sphere((0, 6.2, .1), .75, (1, .9, 1.1), 12, 8))                    # Koerper geduckt
g.add('StoneLight', sphere((0, 6.9, .65), .45, (1, .95, 1.1), 12, 8))                 # Kopf
for sx in (-1, 1):
    g.add('StoneLight', cyl((sx * .25, 7.25, .6), (sx * .45, 7.75, .4), .08, .01, 6))   # Hoerner
    g.add('EyeRed', sphere((sx * .17, 7.0, 1.02), .07, (1, 1, 1), 8, 6))
    g.add('StoneLight', rbox((sx * .95, 6.6, -.2), (1.3, 1.4, .08), .02, 1, rot=(0, sx * .5, sx * .45)), smooth=False)  # Fluegel
    g.add('StoneLight', sphere((sx * .35, 5.7, .55), .22, (1, .8, 1.3), 8, 6))       # Klauen
g.finish()

# ================================================================== Ruinenwand mit Buntglasfenster
w = Part('G2_Window')
W, H = 6.4, 9.5
w.add('Stone', rbox((-2.35, H / 2, 0), (1.7, H, 1.0), .05, 1), smooth=False)
w.add('Stone', rbox((2.35, H / 2, 0), (1.7, H, 1.0), .05, 1), smooth=False)
w.add('Stone', rbox((0, 1.0, 0), (3.0, 2.0, 1.0), .05, 1), smooth=False)
# Spitzbogen aus Steinbloecken ueber dem Fenster (1.5 breit, bis y=8.3)
cols = ['GlassRed', 'GlassBlue', 'GlassGold', 'GlassPurple']
for i in range(6):
    for j in range(10):
        x, y = -1.25 + i * .5, 2.2 + j * .6
        lim = 6.2 + math.sqrt(max(0, 1.6 ** 2 - (abs(x) + .25) ** 2)) * 1.3      # Bogenumriss
        if y > lim:
            continue
        w.add(cols[(i * 3 + j) % 4], rbox((x, y, 0), (.46, .56, .08), 0, 1), smooth=False)
for x in (-.75, 0, .75):                                                                # Masswerk-Stege
    w.add('Iron', rbox((x, 5.1, .06), (.06, 5.8, .1), 0, 1), smooth=False)
for y in (3.8, 5.6):
    w.add('Iron', rbox((0, y, .06), (3.0, .06, .1), 0, 1), smooth=False)
pts = [(math.cos(t) * 1.75 * (1 if t < math.pi / 2 else 1), 6.1 + math.sin(t) * 2.4, 0) for t in [k / 12 * math.pi for k in range(13)]]
w.add('Stone', tube(pts, .38, 8))
w.add('Stone', rbox((0, 9.0, 0), (3.2, 1.0, 1.0), .05, 1), smooth=False)
for k in range(5):                                                                      # abgebrochene Kante oben
    w.add('Stone', rbox((-2.6 + k * 1.3, H + .3 - (k % 2) * .6, 0), (1.1, .9, 1.0), .05, 1, rot=(0, 0, (k - 2) * .08)), smooth=False)
w.finish()

# ================================================================== Zaunfeld
f = Part('G2_Fence')
for sx in (-1, 1):
    f.add('Stone', rbox((sx * 3.2, 1.3, 0), (.6, 2.6, .6), .04, 1), smooth=False)
    f.add('StoneLight', sphere((sx * 3.2, 2.85, 0), .32, (1, 1, 1), 10, 6))
for y in (.5, 2.0):
    f.add('Iron', rbox((0, y, 0), (6.0, .08, .08), 0, 1), smooth=False)
for i in range(15):
    x = -2.8 + i * .4
    f.add('Iron', cyl((x, .1, 0), (x, 2.3, 0), .035, .035, 5))
    f.add('Iron', cyl((x, 2.3, 0), (x, 2.55, 0), .09, .005, 5))
f.finish()

# ================================================================== Schlossturm
s = Part('G2_Spire')
s.add('Stone', cyl((0, 0, 0), (0, 26, 0), 4.2, 3.6, 8))
s.add('StoneLight', cyl((0, 26, 0), (0, 27.2, 0), 4.3, 4.3, 8))
for i in range(8):                                                                      # Zinnen
    a2 = (i + .5) / 8 * 2 * math.pi
    s.add('StoneLight', rbox((math.sin(a2) * 4.0, 27.9, math.cos(a2) * 4.0), (1.2, 1.4, .8), .03, 1, rot=(0, a2, 0)), smooth=False)
s.add('Slate', cyl((0, 27.2, 0), (0, 38, 0), 3.3, .1, 8))
s.add('Iron', cyl((0, 38, 0), (0, 40.5, 0), .08, .02, 5))
for lvl, y in enumerate((8, 15, 21.5)):                                                  # rot gluehende Fenster
    for i in range(4):
        a2 = (i + lvl * .5) / 4 * 2 * math.pi
        s.add('WinRed', rbox((math.sin(a2) * 3.95, y, math.cos(a2) * 3.95), (.9, 2.0, .2), .05, 1, rot=(0, a2, 0)), smooth=False)
s.finish()

rep = export_glb(ROOT / 'assets' / 'gothic2.glb')
(ROOT / 'art' / 'r57' / 'gothic2_report.json').write_text(json.dumps(rep, indent=1), encoding='utf-8')
print('REPORT', json.dumps(rep))

# ---------------------------------------------------------------- Vorschau
scn = bpy.context.scene
prev = bpy.data.collections.new('Preview')
scn.collection.children.link(prev)
world = bpy.data.worlds.new('W')
scn.world = world
world.use_nodes = True
bg = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
bg.inputs['Color'].default_value = (.08, .06, .14, 1)
bg.inputs['Strength'].default_value = 1.0
sun = bpy.data.lights.new('S', 'SUN')
sun.energy = 2.0
sun.color = (.7, .75, 1)
so = bpy.data.objects.new('S', sun)
prev.objects.link(so)
so.rotation_euler = (math.radians(55), 0, math.radians(-30))
for name, x in [('G2_Armor', 0), ('G2_Gargoyle', 5), ('G2_Window', 12), ('G2_Fence', 21), ('G2_Spire', 34)]:
    bpy.data.objects[name].location = (x, 0, 0)
cam = bpy.data.cameras.new('Cam')
co = bpy.data.objects.new('Cam', cam)
prev.objects.link(co)
scn.camera = co
co.location = (17, -46, 12)
co.rotation_euler = (Vector((17, 0, 9)) - co.location).to_track_quat('-Z', 'Y').to_euler()
cam.lens = 28
r = scn.render
try:
    r.engine = 'BLENDER_EEVEE_NEXT'
except TypeError:
    try:
        r.engine = 'BLENDER_EEVEE'
    except TypeError:
        pass
if hasattr(scn, 'eevee'):
    scn.eevee.taa_render_samples = 12
    for kk in ('use_bloom',):
        if hasattr(scn.eevee, kk):
            setattr(scn.eevee, kk, True)
r.resolution_x, r.resolution_y, r.resolution_percentage = 1600, 700, 100
r.image_settings.file_format = 'JPEG'
r.filepath = str(ROOT / 'art' / 'r57' / 'gothic2_preview.jpg')
bpy.ops.render.render(write_still=True, scene=scn.name)
print('PREVIEW', r.filepath)
