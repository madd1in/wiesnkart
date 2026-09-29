"""Suppa Oktoberfest Karts (Wiesn Kart) R56: Titelbild fuer Ladebildschirm, Menue-Hintergrund und Vorschau (og:image).
Baut in einer eigenen Blender-Szene aus den echten Spielmodellen eine Festwiese im Abendlicht: drei Karts mit Fahrern
auf der Strasse (vorn Pilzi in Tracht), dahinter Wiesn-Tor, Festzelt, Kettenkarussell, Buden, Maibaum, Lebkuchenherzen,
Riesenrad und Ballone. Rendert assets/keyart.jpg (1920x1080) und assets/keyart_portrait.jpg (1080x1920).
Laeuft in der offenen Blender-Sitzung (Blender-MCP) oder per blender -b --python.
"""
import bpy, math, pathlib, json
from mathutils import Vector, Euler

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
A = ROOT / 'assets'
SCN = 'R56_KeyArt'

# ---------------------------------------------------------------- Szene frisch anlegen (fremde Szenen bleiben unberuehrt)
if bpy.context.window:
    old = bpy.data.scenes.get(SCN)
    if old:
        for o in list(old.objects):
            bpy.data.objects.remove(o, do_unlink=True)
        bpy.data.scenes.remove(old)
    scn = bpy.data.scenes.new(SCN)
    bpy.context.window.scene = scn
else:                                   # blender -b --factory-startup: die leere Startszene nutzen
    scn = bpy.context.scene
    for o in list(scn.objects):
        bpy.data.objects.remove(o, do_unlink=True)
col = scn.collection


def imp(name, keep=None):
    """GLB importieren; keep = Namen der Wurzelobjekte, die bleiben (Rest wird geloescht). Gibt die Wurzeln zurueck."""
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(A / (name + '.glb')))
    new = [o for o in bpy.data.objects if o not in before]
    roots = [o for o in new if o.parent is None or o.parent not in new]
    if keep:
        drop = [o for o in roots if o.name.split('.')[0] not in keep]
        for r in drop:
            for c in [r, *r.children_recursive]:
                bpy.data.objects.remove(c, do_unlink=True)
        roots = [o for o in roots if o not in drop]
    return roots


def group(roots, loc, rot_z=0.0, scale=1.0):
    e = bpy.data.objects.new('grp', None)
    col.objects.link(e)
    for r in roots:
        r.parent = e
    e.location = loc
    e.rotation_euler = (0, 0, rot_z)
    e.scale = (scale, scale, scale)
    return e


def single_mats(root, tints):
    """Materialien der Hierarchie einzeln machen und gezielt einfaerben (tints: Materialname -> RGBA)."""
    for o in [root, *root.children_recursive]:
        if o.type != 'MESH':
            continue
        for s in o.material_slots:
            m = s.material
            if not m:
                continue
            base = m.name.split('.')[0]
            if base in tints:
                m2 = m.copy()
                bsdf = next((n for n in m2.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
                if bsdf:
                    bsdf.inputs['Base Color'].default_value = tints[base]
                    if base == 'BodyPaint':
                        bsdf.inputs['Roughness'].default_value = .22
                        bsdf.inputs['Coat Weight'].default_value = .8 if 'Coat Weight' in bsdf.inputs else 0
                s.material = m2


def srgb(h):
    c = [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255]
    return tuple((v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4) for v in c) + (1,)


# three (x, y, z) -> Blender (x, -z, y); Karts fahren in three nach +z, in Blender also nach -y (auf die Kamera zu)
WHEELS = [[-1, .42, 1, 1, 1], [1, .42, 1, 1, 1], [-1.05, .48, -.9, 1.14, 1.3], [1.05, .48, -.9, 1.14, 1.3]]


def kart(kit, driver, paint, loc, rot=0.0):
    parts = imp('kartkit', keep=['KX_%d' % kit])
    for x, y, z, s, w in WHEELS:
        wr = imp('kartwheel')
        g = group(wr, (x, -z, y))
        g.scale = (w * (-1 if x > 0 else 1), s, s)
        parts.append(g)
    dr = imp(driver)
    parts.append(group(dr, (0, .35, .95)))
    root = group(parts, loc, rot)
    single_mats(root, {'BodyPaint': srgb(paint), 'Suit': srgb(0x3f7a44), 'Scarf': srgb(0xd0342c)})
    return root


# ---------------------------------------------------------------- Boden, Strasse, Randsteine
def plane(name, size, loc, color, rough=.9):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = (size[0], size[1], 1)
    if o.users_collection and o.users_collection[0] != col:
        for c in list(o.users_collection):
            c.objects.unlink(o)
        col.objects.link(o)
    m = bpy.data.materials.new(name + 'Mat')
    m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = color
    b.inputs['Roughness'].default_value = rough
    o.data.materials.append(m)
    return o


plane('Grass', (400, 400), (0, 60, 0), srgb(0x4f9a3a))
plane('Road', (15.2, 400), (0, 60, .02), srgb(0x3a3f4a), .75)
for sx in (-1, 1):
    plane('Line', (.25, 400), (sx * 6.9, 60, .03), srgb(0xffffff), .6)
    for k in range(60):
        plane('Curb', (.8, 1.6), (sx * 8.0, -12 + k * 3.2, .04), srgb(0xe8352e if k % 2 else 0xffffff), .6)
for k in range(30):
    plane('Dash', (.22, 2.2), (0, -10 + k * 6, .03), srgb(0xffffff), .6)

# ---------------------------------------------------------------- Karts (vorn Pilzi rot, links Mochi tuerkis, rechts Volt gelb)
kart(0, 'driver', 0xff3b30, (0.3, 0, 0), math.radians(-8))
kart(3, 'driver_cat', 0x19c3b0, (-3.4, 7.5, 0), math.radians(6))
kart(2, 'driver_robot', 0xffc83a, (3.6, 12, 0), math.radians(-4))

# ---------------------------------------------------------------- Festwiese im Hintergrund
group(imp('wiesn', keep=['WS_Gate']), (0, 30, 0))
group(imp('landmarks', keep=['LM_Tent']), (-26, 58, 0), math.radians(20), 1.4)
car = imp('wiesn', keep=['WS_CarouselBase', 'WS_CarouselTop'])
for r in car:
    if r.name.startswith('WS_CarouselTop'):
        r.location = (0, 0, 9.8)
        r.rotation_euler = (0, 0, math.radians(20))
group(car, (21, 44, 0), 0, 1.0)
for i, (x, y, rz) in enumerate([(-12.5, 16, 90), (12.5, 20, -90), (-13, 26, 90), (13, 29, -90)]):
    group(imp('wiesn', keep=['WS_Stall']), (x, y, 0), math.radians(rz))
group(imp('wiesn', keep=['WS_Stein']), (10.5, 9, 0), math.radians(-70))
group(imp('wiesn', keep=['WS_Barrels']), (-10.5, 6, 0), math.radians(40))
group(imp('landmarks', keep=['LM_Maypole']), (-15, 36, 0), 0, 1.0)
group(imp('landmarks', keep=['LM_Heart']), (11.5, 3.5, 0), math.radians(-60), 1.0)
group(imp('landmarks', keep=['LM_Pretzel']), (-11.5, 12, 0), math.radians(70), 1.0)
group(imp('ferriswheel'), (-4, 105, 0), math.radians(8), 1.0)
for i, (x, y, z) in enumerate([(-9, 40, 26), (8, 55, 32), (18, 80, 40), (-22, 70, 36)]):
    group(imp('balloon'), (x, y, z), math.radians(i * 40), 1.3)
for x, y in [(-30, 20), (-34, 34), (32, 30), (36, 60), (-40, 80), (30, 95)]:
    group(imp('tree'), (x, y, 0), 0, 1.6)

# ---------------------------------------------------------------- Licht und Himmel (Abendstimmung, warme Sonne von links)
world = bpy.data.worlds.new('KeyArtWorld')
scn.world = world
world.use_nodes = True
nt = world.node_tree
nt.nodes.clear()
tc = nt.nodes.new('ShaderNodeTexCoord')
sep = nt.nodes.new('ShaderNodeSeparateXYZ')
ramp = nt.nodes.new('ShaderNodeValToRGB')
bg = nt.nodes.new('ShaderNodeBackground')
out = nt.nodes.new('ShaderNodeOutputWorld')
nt.links.new(tc.outputs['Generated'], sep.inputs[0])
nt.links.new(sep.outputs['Z'], ramp.inputs['Fac'])
ramp.color_ramp.elements[0].position = .5
ramp.color_ramp.elements[0].color = srgb(0xffb070)
ramp.color_ramp.elements[1].position = .78
ramp.color_ramp.elements[1].color = srgb(0x3a5fb0)
mid = ramp.color_ramp.elements.new(.6)
mid.color = srgb(0xff8fa0)
nt.links.new(ramp.outputs['Color'], bg.inputs['Color'])
bg.inputs['Strength'].default_value = 1.1
nt.links.new(bg.outputs['Background'], out.inputs['Surface'])

sun = bpy.data.lights.new('Sun', 'SUN')
sun.energy = 3.2
sun.color = (1, .78, .55)
so = bpy.data.objects.new('Sun', sun)
col.objects.link(so)
so.rotation_euler = Euler((math.radians(68), 0, math.radians(-55)))
fill = bpy.data.lights.new('Fill', 'AREA')
fill.energy = 900
fill.size = 12
fill.color = (.7, .8, 1)
fo = bpy.data.objects.new('Fill', fill)
col.objects.link(fo)
fo.location = (6, -10, 9)
fo.rotation_euler = Euler((math.radians(60), 0, math.radians(30)))
# Lichterketten-Schein am Tor und an den Buden
for x, y, z, c in [(0, 30, 7.5, (1, .8, .45)), (-12, 20, 4, (1, .6, .8)), (12, 24, 4, (1, .85, .5)), (21, 44, 9, (1, .7, .9))]:
    L = bpy.data.lights.new('Glow', 'POINT')
    L.energy = 1800
    L.color = c
    L.shadow_soft_size = 2
    lo = bpy.data.objects.new('Glow', L)
    col.objects.link(lo)
    lo.location = (x, y, z)

# ---------------------------------------------------------------- Kamera und Render
cam = bpy.data.cameras.new('Cam')
co = bpy.data.objects.new('Cam', cam)
col.objects.link(co)
scn.camera = co


def aim(loc, target, lens):
    co.location = loc
    d = Vector(target) - Vector(loc)
    co.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    cam.lens = lens


r = scn.render
try:
    r.engine = 'BLENDER_EEVEE_NEXT'
except TypeError:
    try:
        r.engine = 'BLENDER_EEVEE'
    except TypeError:
        pass
if hasattr(scn, 'eevee'):
    scn.eevee.taa_render_samples = 48
    for k in ('use_gtao', 'use_bloom', 'use_raytracing'):
        if hasattr(scn.eevee, k):
            setattr(scn.eevee, k, True)
try:
    scn.view_settings.view_transform = 'AgX'
    scn.view_settings.look = 'AgX - Punchy'
except TypeError:
    scn.view_settings.view_transform = 'Filmic'
r.image_settings.file_format = 'JPEG'
r.image_settings.quality = 88
report = {}
for name, (w, h), loc, tgt, lens in [('keyart', (1920, 1080), (5.2, -9.5, 1.9), (0.2, 12, 3.4), 30),
                                    ('keyart_portrait', (1080, 1920), (3.6, -10.5, 2.3), (0.4, 10, 5.5), 26)]:
    r.resolution_x, r.resolution_y, r.resolution_percentage = w, h, 100
    aim(loc, tgt, lens)
    r.filepath = str(A / (name + '.jpg'))
    bpy.ops.render.render(write_still=True, scene=scn.name)
    report[name] = (A / (name + '.jpg')).stat().st_size
print('REPORT', json.dumps(report))
