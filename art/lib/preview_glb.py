"""R61: Vorschau-Bild fuer eine GLB-Datei - alle Objekte nebeneinander, Kamera rahmt die Reihe.
Aufruf: blender -b --factory-startup --python art/lib/preview_glb.py -- <in.glb> <out.jpg> [r,g,b Hintergrund]
"""
import sys, math, bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
src, out = argv[0], argv[1]
bgc = tuple(float(v) for v in argv[2].split(',')) if len(argv) > 2 else (.35, .42, .55)
bpy.ops.wm.read_factory_settings(use_empty=True)
scn = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=src)
objs = [o for o in scn.objects if o.type == 'MESH' and o.parent is None]
objs.sort(key=lambda o: o.name)
x = 0.0
top = 0.0
for o in objs:
    bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
    w = max(v.x for v in bb) - min(v.x for v in bb)
    o.location.x += x - min(v.x for v in bb) + o.location.x * 0
    x += w + 1.2
    top = max(top, max(v.z for v in bb))
width = x - 1.2
world = bpy.data.worlds.new('W'); scn.world = world; world.use_nodes = True
bg = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
bg.inputs['Color'].default_value = (*bgc, 1); bg.inputs['Strength'].default_value = 1.0
sun = bpy.data.lights.new('S', 'SUN'); sun.energy = 3.0
so = bpy.data.objects.new('S', sun); scn.collection.objects.link(so)
so.rotation_euler = (math.radians(50), 0, math.radians(-25))
cam = bpy.data.cameras.new('C'); cam.lens = 35
co = bpy.data.objects.new('C', cam); scn.collection.objects.link(co); scn.camera = co
cx = width / 2
dist = max(width * .95, top * 2.4) + 4
co.location = (cx, -dist, top * .9 + dist * .18)
co.rotation_euler = (Vector((cx, 0, top * .45)) - co.location).to_track_quat('-Z', 'Y').to_euler()
r = scn.render
for eng in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE'):
    try:
        r.engine = eng
        break
    except TypeError:
        pass
if hasattr(scn, 'eevee'):
    scn.eevee.taa_render_samples = 16
r.resolution_x, r.resolution_y, r.resolution_percentage = 1800, 640, 100
r.image_settings.file_format = 'JPEG'
r.filepath = out
bpy.ops.render.render(write_still=True)
print('PREVIEW', out, [o.name for o in objs])
