"""Suppa Lederhosn Karts R59: Easter-Egg-Modelle (Anklang an klassische Zeitreise-Adventures, eigene Entwuerfe).
Spiel-Koordinaten: y oben, +z Front (zeigt zur Strasse). Export assets/eggs.glb:
  EG_Klo      blaue Mobiltoilette (Zeitklo): Kabine, gewoelbtes Dach, Lueftungsrohr, Warnlampe, Schild
  EG_KloDoor  Tuer mit Mondsichel-Fenster (Drehpunkt am Scharnier links, schwingt im Spiel auf)
Aufruf: blender -b --factory-startup --python art/r59/create_eggs.py
"""
import sys, math, json, pathlib, importlib
sys.path.append(r'C:/Users/User/Documents/Playground/mushroom-rally/art/lib')
import bpy
from mathutils import Vector
import blib
importlib.reload(blib)
from blib import *

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
blib.init_scene('R59_Eggs')
use_materials({
    'KloBlue': material('KloBlue', (.04, .22, .75, 1), .45),
    'KloLight': material('KloLight', (.85, .9, .95, 1), .5),
    'KloDark': material('KloDark', (.05, .06, .08, 1), .5),
    'Moon': material('KloMoon', (1, .85, .25, 1), .4, 0, (1, .8, .2, 1), 2.5),
    'Glow': material('KloGlow', (.3, 1, .45, 1), .3, 0, (.3, 1, .4, 1), 4.0),
    'Steel': material('KloSteel', (.5, .52, .55, 1), .35, .8),
})
W, D, H = 1.3, 1.3, 2.35
k = Part('EG_Klo')
k.add('KloBlue', rbox((0, H / 2, -.05), (W, H, D - .1), .06, 2))
k.add('KloBlue', sphere((0, H, -.05), .72, (1, .32, 1), 20, 10))                  # gewoelbtes Dach
k.add('KloLight', rbox((0, H + .05, -.05), (W + .08, .1, D), .04, 1))
k.add('KloDark', rbox((0, .05, 0), (W + .1, .1, D + .1), .03, 1))                  # Sockel
k.add('Steel', cyl((.35, H + .1, -.35), (.35, H + .75, -.35), .08, .08, 10))       # Lueftungsrohr
k.add('Steel', cyl((.35, H + .75, -.35), (.35, H + .82, -.35), .14, .14, 10))
k.add('Glow', sphere((-.3, H + .32, .1), .12, (1, 1, 1), 10, 6))                   # gruene Lampe
k.add('KloLight', rbox((0, H - .22, D / 2 - .03), (.9, .22, .03), .02, 1))         # Schildleiste (Text im Spiel)
for sx in (-1, 1):
    k.add('KloDark', rbox((sx * (W / 2 + .01), 1.6, -.05), (.03, .5, .7), .01, 1))  # Lueftungsschlitze
k.finish()
# Tuer: Drehpunkt am Scharnier links vorn
HINGE = (-.56, 0, D / 2 - .04)
dr = Part('EG_KloDoor')
dr.add('KloBlue', rbox((0, 1.08, D / 2), (1.1, 1.95, .07), .03, 1))
dr.add('KloLight', rbox((.42, 1.05, D / 2 + .05), (.06, .22, .06), .02, 1))       # Griff
for i in range(9):                                                                   # Mondsichel
    a = math.radians(-70 + i * 17.5)
    dr.add('Moon', sphere((.02 + math.cos(a) * .17, 1.72 + math.sin(a) * .17, D / 2 + .045), .055 - abs(i - 4) * .006, (1, 1, .4), 8, 5))
dr.finish(origin=HINGE)

rep = export_glb(ROOT / 'assets' / 'eggs.glb')
(ROOT / 'art' / 'r59' / 'eggs_report.json').write_text(json.dumps(rep, indent=1), encoding='utf-8')
print('REPORT', json.dumps(rep))
