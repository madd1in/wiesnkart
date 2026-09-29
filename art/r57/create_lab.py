"""Suppa Lederhosn Karts R57: Sonnen-Canyon - geheime Forschungsanlage und Kleinstadt-Uhrturm (eigene Entwuerfe,
nur als Anklang an Science-Fiction-Filme/-Spiele der 80er/90er; keine Namen, Logos oder Originaldesigns).
Spiel-Koordinaten: y oben, +z zeigt zur Strasse (lmAt dreht die Front zur Strecke). Export assets/lab.glb:
  LB_Bunker   Felsmassiv mit Betonfront, Panzertor mit Warnstreifen, Warnleuchten, Lueftungsrohre
  LB_Dish     Gittermast mit Radarschuessel
  LB_Silo     Testkammer-Silo mit gruen leuchtendem Kern hinter einem Sichtband, Leiter, Rohre
  LB_Crates   Kistenstapel (Holz und Metall mit Warnstreifen)
  LB_Tram     kleiner Einschienen-Wagen (orange/weiss) fuer die Hochbahn
  LB_Clock    Uhrturm (Backstein, vier Zifferblaetter, Zeiger auf 10:04)
Aufruf: blender -b --factory-startup --python art/r57/create_lab.py
"""
import sys, math, json, pathlib, importlib
sys.path.append(r'C:/Users/User/Documents/Playground/mushroom-rally/art/lib')
import bpy
from mathutils import Vector
import blib
importlib.reload(blib)
from blib import *

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
blib.init_scene('R57_Lab')
use_materials({
    'Rock': material('Rock', (.36, .16, .07, 1), .95),
    'RockDark': material('RockDark', (.22, .09, .04, 1), .95),
    'Concrete': material('Concrete', (.34, .34, .32, 1), .9),
    'Steel': material('Steel', (.16, .17, .19, 1), .4, .75),
    'SteelLight': material('SteelLight', (.5, .52, .55, 1), .35, .8),
    'Hazard': material('Hazard', (1, .62, .02, 1), .55),
    'Black': material('Black', (.02, .02, .02, 1), .6),
    'Warn': material('Warn', (1, .1, .05, 1), .3, 0, (1, .08, .03, 1), 4.0),
    'Green': material('Green', (.2, 1, .35, 1), .3, 0, (.2, 1, .3, 1), 6.0),
    'Glass': material('Glass', (.2, .35, .3, 1), .1, .2),
    'Crate': material('Crate', (.36, .2, .08, 1), .8),
    'White': material('White', (.9, .9, .88, 1), .5),
    'Orange': material('Orange', (1, .35, .05, 1), .45),
    'Window': material('Window', (.05, .08, .12, 1), .15, .3),
    'Brick': material('Brick', (.42, .12, .07, 1), .85),
    'Trim': material('Trim', (.85, .82, .75, 1), .6),
    'ClockFace': material('ClockFace', (.95, .93, .85, 1), .5, 0, (1, .95, .8, 1), .6),
    'Roof': material('Roof', (.12, .16, .14, 1), .7),
})


def stripes(p, x0, x1, y, z, h=.5, n=10):
    """Warnstreifen: gelbes Band mit schraegen schwarzen Balken (Front zeigt nach +z)."""
    p.add('Hazard', rbox(((x0 + x1) / 2, y, z), (x1 - x0, h, .06), .01, 1), smooth=False)
    w = (x1 - x0) / n
    for i in range(n):
        p.add('Black', rbox((x0 + (i + .5) * w, y, z + .035), (w * .42, h * 1.25, .03), 0, 1, rot=(0, 0, .7)), smooth=False)


# ================================================================== Bunker im Felsen
b = Part('LB_Bunker')
sd = 3
for i in range(14):                                                     # Felsmassiv aus schiefen Bloecken
    sd = (sd * 16807) % 2147483647
    r1 = sd / 2147483647
    sd = (sd * 16807) % 2147483647
    r2 = sd / 2147483647
    x, h = -12 + i * 1.85, 7 + r1 * 8
    b.add('Rock' if i % 3 else 'RockDark', rbox((x, h / 2 - .5, -4.5 - r2 * 2.5), (4.2 + r2 * 2, h, 7 + r1 * 3), .6, 2, rot=(r2 * .15, r1 * .4, (r1 - .5) * .2)), smooth=False)
b.add('Concrete', rbox((0, 4.2, -.2), (15, 8.4, 1.6), .1, 2), smooth=False)          # Betonfront
b.add('Concrete', rbox((0, 8.9, .1), (16.2, .9, 2.2), .08, 2), smooth=False)          # Vordach
b.add('Hazard', rbox((0, 3.3, .7), (8.4, 6.8, .3), .05, 1), smooth=False)             # Torrahmen
for sx in (-1, 1):
    b.add('Steel', rbox((sx * 1.95, 3.1, .9), (3.8, 6.0, .35), .04, 1), smooth=False)   # Torhaelften
    for k in range(3):
        b.add('SteelLight', rbox((sx * 1.95, 1.2 + k * 2, 1.1), (3.4, .12, .06), .01, 1), smooth=False)
    b.add('Warn', sphere((sx * 5.6, 8.0, 1.0), .35, (1, 1, 1), 12, 8))                 # Warnleuchten
    b.add('Steel', cyl((sx * 6.8, 0, -.6), (sx * 6.8, 11.5, -.6), .45, .45, 12))       # Lueftungsrohre
    b.add('SteelLight', torus((sx * 6.8, 11.5, -.6), .5, .1, (0, 1, 0), 16, 6))
stripes(b, -4.1, 4.1, .35, 1.12, .6, 12)
stripes(b, -4.1, 4.1, 6.45, 1.12, .35, 12)
b.add('White', rbox((0, 7.55, .72), (6.2, .9, .12), .03, 1), smooth=False)           # Schildtafel (Text im Spiel)
b.finish()

# ================================================================== Radarschuessel
d = Part('LB_Dish')
for sx in (-1, 1):
    for sz in (-1, 1):
        d.add('Steel', cyl((sx * 1.8, 0, sz * 1.8), (sx * .5, 12, sz * .5), .14, .1, 6))
for k in range(5):                                                      # Querstreben
    y = 1 + k * 2.3
    w = 1.8 - (1.3 * y / 12)
    for a, bb in [((-w, y, -w), (w, y, -w)), ((w, y, -w), (w, y, w)), ((w, y, w), (-w, y, w)), ((-w, y, w), (-w, y, -w))]:
        d.add('Steel', cyl(a, bb, .07, .07, 5))
d.add('SteelLight', cyl((0, 12, 0), (0, 13, 0), .7, .6, 12))
d.add('White', sphere((0, 15.2, .8), 3.4, (1, 1, .32), 24, 10, rot=None))
d.add('Steel', cyl((0, 15.2, 1.6), (0, 15.2, 3.4), .1, .06, 6))
d.add('Warn', sphere((0, 15.2, 3.5), .2, (1, 1, 1), 8, 6))
d.finish()

# ================================================================== Testkammer-Silo
s = Part('LB_Silo')
s.add('Concrete', cyl((0, 0, 0), (0, 11, 0), 4.2, 4.0, 28))
s.add('Concrete', sphere((0, 11, 0), 4.0, (1, .45, 1), 28, 10))
for y in (2.5, 8.5):
    s.add('SteelLight', torus((0, y, 0), 4.25, .14, (0, 1, 0), 32, 6))
for i in range(10):                                                                     # gruen leuchtende Sehschlitze
    a = i / 10 * 2 * math.pi
    s.add('Green', rbox((math.sin(a) * 4.18, 5.6, math.cos(a) * 4.18), (.7, 2.2, .12), .05, 1, rot=(0, a, 0)), smooth=False)
s.add('SteelLight', torus((0, 4.4, 0), 4.24, .1, (0, 1, 0), 32, 6))
s.add('SteelLight', torus((0, 6.8, 0), 4.24, .1, (0, 1, 0), 32, 6))
for k in range(12):                                                                     # Leiter
    s.add('Steel', rbox((0, .6 + k * .85, 4.3), (.9, .06, .06), 0, 1), smooth=False)
for sx in (-.45, .45):
    s.add('Steel', cyl((sx, 0, 4.3), (sx, 10.5, 4.3), .05, .05, 5))
s.add('Steel', tube([(4.2, 1.5, 0), (6, 1.5, 0), (6, 0, 0)], .3, 10))
s.add('Hazard', rbox((0, .4, 4.15), (3, .6, .1), .01, 1), smooth=False)
s.finish()

# ================================================================== Kistenstapel
c = Part('LB_Crates')
for (x, y, z, sz, key) in [(-1.3, .8, 0, 1.6, 'Crate'), (.4, .8, .2, 1.6, 'Crate'), (-.4, 2.4, .1, 1.6, 'Crate'), (2.2, .6, -.5, 1.2, 'SteelLight')]:
    c.add(key, rbox((x, y, z), (sz, sz, sz), .06, 1), smooth=False)
    c.add('Black' if key == 'Crate' else 'Steel', rbox((x, y, z + sz / 2 + .01), (sz * .9, .08, .02), 0, 1), smooth=False)
    c.add('Black' if key == 'Crate' else 'Steel', rbox((x, y, z + sz / 2 + .01), (.08, sz * .9, .02), 0, 1), smooth=False)
stripes(c, 1.65, 2.75, .6, -.5 + .61, .25, 5)
c.finish()

# ================================================================== Einschienen-Wagen
t = Part('LB_Tram')
t.add('White', rbox((0, 1.7, 0), (2.6, 2.4, 8.4), .5, 3))
t.add('Orange', rbox((0, .9, 0), (2.66, .8, 8.46), .3, 2))
for z in (-2.6, -.9, .8, 2.5):
    for sx in (-1, 1):
        t.add('Window', rbox((sx * 1.31, 2.15, z), (.06, .9, 1.3), .04, 1), smooth=False)
t.add('Window', rbox((0, 2.1, 4.2), (2.0, .9, .08), .05, 1), smooth=False)
t.add('Window', rbox((0, 2.1, -4.2), (2.0, .9, .08), .05, 1), smooth=False)
t.add('Warn', sphere((0, 3.0, 0), .25, (1, 1, 1), 10, 6))
t.add('Steel', rbox((0, .1, 0), (1.0, .7, 6.8), .1, 2))                                # Fahrwerk
t.finish()

# ================================================================== Uhrturm
k = Part('LB_Clock')
k.add('Brick', rbox((0, 7, 0), (4.6, 14, 4.6), .05, 1), smooth=False)
k.add('Trim', rbox((0, 14.3, 0), (5.2, .6, 5.2), .05, 1), smooth=False)
k.add('Brick', rbox((0, 16.6, 0), (4.0, 4.0, 4.0), .05, 1), smooth=False)
k.add('Trim', rbox((0, 18.8, 0), (4.6, .5, 4.6), .05, 1), smooth=False)
k.add('Roof', cyl((0, 19, 0), (0, 23.5, 0), 3.2, .15, 4))                             # Pyramidendach
for i in range(4):                                                                      # Zifferblaetter, Zeiger auf 10:04
    a = i * math.pi / 2
    nx, nz = math.sin(a), math.cos(a)
    cx, cz = nx * 2.03, nz * 2.03
    k.add('ClockFace', cyl((cx - nx * .05, 16.6, cz - nz * .05), (cx + nx * .06, 16.6, cz + nz * .06), 1.45, 1.45, 28))
    k.add('Trim', torus((cx + nx * .07, 16.6, cz + nz * .07), 1.45, .1, (nx, 0, nz), 28, 6))
    for ang, ln, wd in [(-60, .8, .12), (24, 1.2, .08)]:                               # Stundenzeiger ~10, Minutenzeiger 04
        r = math.radians(ang)
        ux, uy = math.sin(r), math.cos(r)
        px, pz = -nz, nx                                                                # waagerechte Richtung auf dem Blatt
        tip = (cx + nx * .1 + px * ux * ln, 16.6 + uy * ln, cz + nz * .1 + pz * ux * ln)
        k.add('Black', cyl((cx + nx * .1, 16.6, cz + nz * .1), tip, wd, wd * .6, 6))
    k.add('Window', rbox((nx * 2.31, 9, nz * 2.31), (1.1 if abs(nz) > .5 else .06, 2.6, .06 if abs(nz) > .5 else 1.1), .03, 1), smooth=False)
k.add('Trim', rbox((0, .3, 0), (5.2, .6, 5.2), .05, 1), smooth=False)
k.finish()

rep = export_glb(ROOT / 'assets' / 'lab.glb')
(ROOT / 'art' / 'r57' / 'lab_report.json').write_text(json.dumps(rep, indent=1), encoding='utf-8')
print('REPORT', json.dumps(rep))

# ---------------------------------------------------------------- Vorschau
scn = bpy.context.scene
prev = bpy.data.collections.new('Preview')
scn.collection.children.link(prev)
world = bpy.data.worlds.new('W')
scn.world = world
world.use_nodes = True
bg = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
bg.inputs['Color'].default_value = (.5, .6, .8, 1)
bg.inputs['Strength'].default_value = .8
sun = bpy.data.lights.new('S', 'SUN')
sun.energy = 3.5
so = bpy.data.objects.new('S', sun)
prev.objects.link(so)
so.rotation_euler = (math.radians(50), 0, math.radians(35))
for name, x in [('LB_Bunker', -2), ('LB_Dish', 18), ('LB_Silo', 30), ('LB_Crates', 10), ('LB_Tram', 42), ('LB_Clock', 54)]:
    bpy.data.objects[name].location = (x, 0, 0)
cam = bpy.data.cameras.new('Cam')
co = bpy.data.objects.new('Cam', cam)
prev.objects.link(co)
scn.camera = co
co.location = (26, -62, 16)
co.rotation_euler = (Vector((26, 0, 7)) - co.location).to_track_quat('-Z', 'Y').to_euler()
cam.lens = 30
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
r.resolution_x, r.resolution_y, r.resolution_percentage = 1600, 700, 100
r.image_settings.file_format = 'JPEG'
r.filepath = str(ROOT / 'art' / 'r57' / 'lab_preview.jpg')
bpy.ops.render.render(write_still=True, scene=scn.name)
print('PREVIEW', r.filepath)
