"""Original Mushroom Rally R52 windsock; run in background Blender only.
Coordinates in meters: +Y up; wind cloth extends +X; ground origin.
blender -b --factory-startup --python art/r52/create_windsock.py
"""
import sys, math, json, pathlib, hashlib
ROOT=pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'art'/'lib'))
import bpy
from mathutils import Vector
from blib import *
OUT=ROOT/'art'/'r52'
OUT.mkdir(parents=True,exist_ok=True)
EXP=init('R52_Windsock')
use_materials({
 'WindTurquoise':material('WindTurquoise',(.035,.66,.57,1),.64),
 'WindCream':material('WindCream',(1,.92,.72,1),.72),
 'WindTimber':material('WindTimber',(.36,.16,.065,1),.8),
 'WindGold':material('WindGold',(1,.55,.08,1),.4,.22),
 'WindDark':material('WindDark',(.035,.13,.15,1),.75)})
parts={key:Part(key) for key in KEYS}
def add(key,build,smooth=True): parts[key].add(key,build,smooth)
add('WindCream',cyl((0,0,0),(0,.17,0),.42,.35,12),False)
add('WindTurquoise',cyl((0,.17,0),(0,.29,0),.35,.29,12),False)
add('WindTimber',cyl((0,.22,0),(0,3.11,0),.12,.09,12))
for y in (.41,2.55): add('WindGold',cyl((0,y-.055,0),(0,y+.055,0),.14,.14,12))
add('WindCream',sphere((0,3.13,0),.49,(1,.19,1),20,8))
add('WindTurquoise',sphere((0,3.22,0),.51,(1,.56,1),20,10))
for a,r,sz in ((.1,.3,.105),(2,.29,.10),(4.15,.3,.10)):
 x,z=math.cos(a)*r,math.sin(a)*r
 y=3.22+.51*.56*math.sqrt(1-(r/.51)**2)
 add('WindCream',sphere((x,y+.006,z),sz,(1,.18,1),10,6))
add('WindCream',sphere((-.03,3.505,.015),.09,(1,.18,1),10,6))
add('WindGold',tube([(0,2.72,0),(.24,2.90,0),(.58,2.90,0)],.045,8))
add('WindGold',torus((.62,2.90,0),.40,.035,(1,0,0),20,6))
sections=[(.64,.38,2.9),(1,.345,2.91),(1.38,.29,2.91),(1.75,.225,2.87),(2.1,.155,2.8),(2.4,.075,2.72)]
for i,(a,b) in enumerate(zip(sections,sections[1:])):
 add('WindTurquoise' if i%2==0 else 'WindCream',loft([(x,r,y-r,y+r,2) for x,r,y in (a,b)],seg=18,cap=False,axis='x'))
# Inward-facing mouth lining: dark interior visible through the open hoop.
def inside(build):
 def run(bm):
  old=set(bm.faces); build(bm)
  for f in bm.faces:
   if f not in old: f.normal_flip()
 return run
add('WindDark',inside(loft([(.65,.363,2.9-.363,2.9+.363,2),(.91,.32,2.91-.32,2.91+.32,2)],seg=18,cap=False,axis='x')))
add('WindCream',torus((.645,2.90,0),.377,.018,(1,0,0),20,5))
add('WindGold',torus((2.4,2.72,0),.075,.018,(1,0,0),14,5))
for z in (-.055,.055):
 add('WindTurquoise',tube([(2.4,2.72,z),(2.64,2.78,z*1.4),(2.83,2.72,z*2)],.022,5))
def arrow_mesh(poly,depth):
 def build(bm):
  rings=[[bm.verts.new(G(x,y,z)) for x,y in poly] for z in (-depth,depth)]
  faces=[bm.faces.new(rings[0]),bm.faces.new(list(reversed(rings[1])))]
  for i in range(len(poly)):
   j=(i+1)%len(poly)
   faces.append(bm.faces.new((rings[0][i],rings[1][i],rings[1][j],rings[0][j])))
  fix_normals(bm,faces,Vector((.15,0,1.65)))
 return build
add('WindTurquoise',arrow_mesh([(-.5,1.46),(.37,1.46),(.37,1.32),(.85,1.65),(.37,1.98),(.37,1.84),(-.5,1.84)],.075),False)
for z in (-.079,.079):
 add('WindCream',tube([(-.28,1.50,z),(-.1,1.65,z),(-.28,1.80,z)],.031,5))
 add('WindCream',tube([(.02,1.50,z),(.20,1.65,z),(.02,1.80,z)],.031,5))
objects=[p.finish() for p in parts.values()]
bpy.ops.object.select_all(action='DESELECT')
for obj in objects: obj.select_set(True)
bpy.context.view_layer.objects.active=objects[0]
target=ROOT/'assets'/'windsock.glb'
bpy.ops.export_scene.gltf(filepath=str(target),export_format='GLB',use_selection=True,export_yup=True,export_apply=True,export_cameras=False,export_lights=False)
triangles=0
for obj in objects:
 obj.data.calc_loop_triangles(); triangles+=len(obj.data.loop_triangles)
verts=[obj.matrix_world@v.co for obj in objects for v in obj.data.vertices]
mins=[min(v[i] for v in verts) for i in range(3)]
maxs=[max(v[i] for v in verts) for i in range(3)]
report={'asset':'windsock.glb','authoring':'Original procedural Blender model','source':'art/r52/create_windsock.py','provider':None,'generation_cost':0,
'user_prompt':'mushroom rally weiter polishen, grafik, sound, new ideas, blender, unreal, elevenlabs chiptune, ggf update in social media posten',
'spec':'Turquoise and cream mushroom windsock; decorative wind/slipstream landmark; no textures',
'negative_prompt':'No logos, licensed meshes, textures, transparency, paid providers, or active scene modifications',
'units':'meters','axis':'+Y up; cloth extends +X; origin at ground','objects':len(objects),'materials':len(KEYS),'triangles':triangles,'textures':0,
'bounds_gltf':{'min':[mins[0],mins[2],-maxs[1]],'max':[maxs[0],maxs[2],-mins[1]]},
'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),
'policy':{'max_triangles':3000,'max_materials':5,'max_bytes':160000,'textures':0,'ground_y':0},
'license':'Original project asset; same ownership and licensing as Mushroom Rally'}
assert triangles<=3000 and target.stat().st_size<160000
assert abs(mins[2])<1e-6
(OUT/'windsock-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'windsock.blend'))
sc=bpy.context.scene
sc.render.engine='BLENDER_WORKBENCH'
sh=sc.display.shading
sh.light,sh.color_type='STUDIO','MATERIAL'
sh.show_shadows,sh.show_cavity,sh.show_object_outline=True,True,True
sh.cavity_type='BOTH'
sh.background_type,sh.background_color='VIEWPORT',(.76,.84,.91)
sc.world=bpy.data.worlds.new('PreviewWorld')
sc.render.resolution_x,sc.render.resolution_y,sc.render.resolution_percentage=900,900,100
cam=bpy.data.objects.new('PreviewCamera',bpy.data.cameras.new('PreviewCamera'))
sc.collection.objects.link(cam);sc.camera=cam
cam.data.type,cam.data.ortho_scale='ORTHO',4.6
for label,pos in [('front',(5.5,-8,5.3)),('mouth',(-5.5,-8,5.1))]:
 cam.location=Vector(pos)
 cam.rotation_euler=(Vector((1,0,1.8))-cam.location).to_track_quat('-Z','Y').to_euler()
 sc.render.filepath=str(OUT/('windsock-'+label+'.png'))
 bpy.ops.render.render(write_still=True)
print('WINDSOCK_REPORT',json.dumps(report))