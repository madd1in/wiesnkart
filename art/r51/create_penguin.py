"""Mushroom Rally R51: Fahrer "Tux" - der Linux-Pinguin als fuenfte Fahrerfigur (eigener Entwurf), Export assets/driver_penguin.glb.
Aufbau wie die anderen Fahrer (D_*-Teile, Ursprung am Sitz, Blick nach vorn, Flossen am Lenkrad):
  schwarzer Tropfenkoerper mit weissem Bauch, weisse Augenflecken, gelb-orangener Schnabel und Fuesse,
  dazu Rennschal mit wehenden Enden und Rennbrille auf der Stirn - Schal und Brillenband in 'CapPaint'
  (das Spiel faerbt sie in der Teamfarbe).
Aufruf: blender -b --factory-startup --python art/r51/create_penguin.py
"""
import sys, math, json, pathlib
sys.path.append(r'C:/Users/User/Documents/Playground/mushroom-rally/art/lib')
import bpy
from mathutils import Vector
from blib import *

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
EXP = init('R51_Penguin')
use_materials({
    'Feather': material('Feather', (.035, .04, .06, 1), .42),
    'White': material('White', (.97, .96, .93, 1), .6),
    'Beak': material('Beak', (1.0, .66, .08, 1), .45),
    'Eye': material('Eye', (.03, .03, .05, 1), .2),
    'Cheek': material('Cheek', (.98, .45, .52, 1), .55),
    'CapPaint': material('CapPaint', (.9, .2, .22, 1), .45),
    'Gold': material('Gold', (1.0, .68, .18, 1), .3, .6),
    'Glass': material('Glass', (.35, .8, 1.0, 1), .1),
})

def part(name, key, *builds, smooth=True):
    p = Part(name)
    for b in builds:
        p.add(key, b, smooth)
    return p.finish()

# Koerper und Kopf: ein Tropfen aus zwei Kugeln, Bauch weiss nach vorn gewoelbt
part('D_Torso', 'Feather', sphere((0, .12, 0), .42, (1, 1.05, .95), 24, 14))
part('D_Head', 'Feather', sphere((0, .78, .02), .30, (1, 1, 1), 24, 14))
part('D_Belly', 'White', sphere((0, .08, .16), .37, (.86, 1.05, .78), 22, 12))
# weisse Augenflecken, Augen mit Glanzpunkt, rosige Backen
for sx, sfx in ((-1, ''), (1, '.001')):
    x = .1 * sx
    part('D_Face' + sfx, 'White', sphere((x, .84, .256), .13, (1, 1.3, .55), 18, 10))
    part('D_Eye' + sfx, 'Eye', sphere((x * .95, .85, .318), .056, (1, 1.35, .45), 16, 10))
    part('D_EyeHi' + sfx, 'White', sphere((x * .8, .878, .338), .021, (1, 1, .6), 10, 6))
    part('D_Cheek' + sfx, 'Cheek', sphere((.2 * sx, .7, .21), .055, (1, .8, .45), 12, 8))
# Schnabel (oben breiter, unten schmaler) und Plattfuesse
part('D_Beak', 'Beak', sphere((0, .705, .33), .12, (1.3, .42, 1.0), 18, 10), sphere((0, .655, .31), .1, (1.15, .3, .9), 16, 8))
for sx, sfx in ((-1, ''), (1, '.001')):
    part('D_Foot' + sfx, 'Beak', sphere((.15 * sx, -.3, .3), .1, (1.1, .4, 1.5), 14, 8))
    # Flossen greifen das Lenkrad
    part('D_Flipper' + sfx, 'Feather', tube([(.32 * sx, .33, .02), (.35 * sx, .23, .36), (.23 * sx, .13, .66)], .075, 12),
         sphere((.2 * sx, .11, .74), .085, (1.0, .75, 1.25), 14, 8))
# Rennschal um den Hals mit zwei wehenden Enden
part('D_Scarf', 'CapPaint', torus((0, .52, .0), .245, .066, (0, 1, 0), 28, 10),
     tube([(.1, .5, -.2), (.2, .46, -.44), (.33, .52, -.66)], .052, 10),
     tube([(.16, .49, -.18), (.3, .42, -.36), (.45, .43, -.52)], .045, 10))
# Rennbrille auf der Stirn: Band in Teamfarbe, Goldrahmen, blaue Glaeser
n_strap = (0, 1, -.135)
part('D_Strap', 'CapPaint', torus((0, .93, 0), .275, .03, n_strap, 32, 8))
for sx, sfx in ((-1, ''), (1, '.001')):
    c = Vector((.1 * sx, .965, .238))
    nrm = Vector((c.x, c.y - .78, c.z - .02)).normalized()
    part('D_GoggleRim' + sfx, 'Gold', torus(tuple(c + nrm * .012), .074, .02, tuple(nrm), 22, 8))
    part('D_Goggle' + sfx, 'Glass', disc(tuple(c + nrm * .01), .068, tuple(nrm), 20, .03))
# Haarbuescheln-Feder oben (etwas Charakter)
part('D_Tuft', 'Feather', tube([(0, 1.05, -.02), (.03, 1.13, -.07), (.09, 1.17, -.04)], .028, 8))

bpy.ops.object.select_all(action='DESELECT')
objs = [o for o in EXP.objects]
for o in objs:
    o.select_set(True)
bpy.context.view_layer.objects.active = objs[0]
target = ROOT / 'assets' / 'driver_penguin.glb'
bpy.ops.export_scene.gltf(filepath=str(target), export_format='GLB', use_selection=True, export_yup=True, export_apply=True, export_cameras=False, export_lights=False)
tr = 0
for o in objs:
    o.data.calc_loop_triangles()
    tr += len(o.data.loop_triangles)
rep = {'objects': len(objs), 'triangles': tr, 'bytes': target.stat().st_size}
# Vorschau (Workbench)
sc = bpy.context.scene
sc.render.engine = 'BLENDER_WORKBENCH'
sh = sc.display.shading
sh.light, sh.color_type, sh.show_object_outline, sh.show_cavity = 'STUDIO', 'MATERIAL', True, True
sh.background_type, sh.background_color = 'VIEWPORT', (.55, .78, .98)
sc.world = bpy.data.worlds.new('W')
sc.render.resolution_x, sc.render.resolution_y = 600, 600
cam = bpy.data.objects.new('C', bpy.data.cameras.new('C'))
sc.collection.objects.link(cam)
sc.camera = cam
for tag, pos, tgt in (('front', (1.1, -2.6, 1.2), (0, 0, .45)), ('back', (-1.4, 2.4, 1.3), (0, 0, .45))):
    pos, tgt = Vector(pos), Vector(tgt)
    cam.location = pos
    cam.rotation_euler = (tgt - pos).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = str(ROOT / 'art' / 'r51' / f'penguin_{tag}.png')
    bpy.ops.render.render(write_still=True)
print('REPORT', json.dumps(rep))
