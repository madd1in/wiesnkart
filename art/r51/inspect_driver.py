import bpy, json, sys
from mathutils import Vector
out={}
for f in ['driver_cat','driver_robot']:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=f'C:/Users/User/Documents/Playground/mushroom-rally/assets/{f}.glb')
    objs=[]
    for o in bpy.data.objects:
        if o.type!='MESH':objs.append((o.name,o.type,o.parent.name if o.parent else None));continue
        bb=[o.matrix_world@Vector(c) for c in o.bound_box]
        mn=[round(min(v[i] for v in bb),2) for i in range(3)];mx=[round(max(v[i] for v in bb),2) for i in range(3)]
        objs.append((o.name,[m.name for m in o.data.materials],len(o.data.polygons),mn,mx,o.parent.name if o.parent else None))
    mats={}
    for m in bpy.data.materials:
        b=next((n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None) if m.use_nodes else None
        if b: mats[m.name]=[round(x,3) for x in b.inputs['Base Color'].default_value][:3]+[round(b.inputs['Roughness'].default_value,2)]
    out[f]={'objs':objs,'mats':mats}
open('C:/Users/User/Documents/Playground/mushroom-rally/art/r51/driver_inspect.json','w').write(json.dumps(out,indent=1))
