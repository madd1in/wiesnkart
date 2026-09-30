"""Suppa Lederhosn Karts R62: "Luft-Loisl" - eigener Streckenhelfer (Wiesn-Figur, kein Vorbild aus anderen Spielen):
ein Bayer mit Schnauzer, Gamsbart-Hut und Hosentraegern sitzt in einem fliegenden Masskrug mit Propeller. Er haelt die
Startampel, zeigt "Falsche Richtung" und fischt Karts mit der Angel aus Wasser und Abgrund.
Spiel-Koordinaten: y oben, +z Front (schaut zur Kamera). Export assets/loisl.glb:
  LO_Body   Masskrug (Glas, Henkel, Schaumkrone) mit Loisl (Oberkoerper, Kopf, Hut, Arme)
  LO_Prop   Propeller (dreht im Spiel), Drehpunkt auf der Achse
  LO_Light  Ampel an einer Stange (Rahmen); LO_L1/LO_L2/LO_L3 die drei Lampen (im Spiel eingefaerbt)
  LO_Sign   Schild an einer Stange (Rahmen und weisse Flaeche, Text setzt das Spiel)
  LO_Rod    Angelrute mit Rolle (Schnur und Haken zeichnet das Spiel)
Aufruf: blender -b --factory-startup --python art/r62/create_loisl.py
"""
import sys, math, json, pathlib, importlib
sys.path.append(r'C:/Users/User/Documents/Playground/mushroom-rally/art/lib')
import bpy, bmesh
import blib
importlib.reload(blib)
from blib import *

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
blib.init_scene('R62_Loisl')
use_materials({
    'Glass': material('LoGlass', (.75, .9, .95, 1), .08, .1, (.3, .45, .5, 1), .3),
    'Beer': material('LoBeer', (.95, .6, .08, 1), .25, 0, (.6, .35, .02, 1), .6),
    'Foam': material('LoFoam', (.97, .95, .88, 1), .7),
    'Tin': material('LoTin', (.7, .7, .72, 1), .3, .85),
    'Skin': material('LoSkin', (.95, .66, .5, 1), .6),
    'Cheek': material('LoCheek', (.95, .4, .38, 1), .6),
    'Hair': material('LoHair', (.32, .18, .08, 1), .8),
    'Shirt': material('LoShirt', (.92, .92, .9, 1), .7),
    'Check': material('LoCheck', (.25, .45, .8, 1), .7),
    'Leder': material('LoLeder', (.3, .17, .07, 1), .7),
    'Hat': material('LoHat', (.12, .3, .15, 1), .7),
    'Band': material('LoBand', (.75, .1, .08, 1), .6),
    'Feather': material('LoFeather', (.9, .85, .75, 1), .7),
    'Eye': material('LoEye', (.03, .03, .04, 1), .3),
    'White': material('LoWhite', (.97, .97, .97, 1), .5),
    'Dark': material('LoDark', (.1, .1, .12, 1), .6),
    'Yellow': material('LoYellow', (1, .78, .1, 1), .5),
    'Wood': material('LoWood', (.45, .28, .12, 1), .8),
    'Lamp': material('LoLamp', (.35, .35, .35, 1), .4),
    'Red': material('LoRed', (.8, .08, .06, 1), .5),
})

# ---------------------------------------------------------------- Masskrug mit Loisl
b = Part('LO_Body')
b.add('Glass', cyl((0, 0, 0), (0, 1.55, 0), .78, .82, 24))
b.add('Beer', cyl((0, .08, 0), (0, 1.25, 0), .7, .74, 24))
b.add('Foam', torus((0, 1.52, 0), .72, .16, (0, 1, 0), 24, 8))
b.add('Tin', torus((0, 1.56, 0), .83, .05, (0, 1, 0), 24, 6))
b.add('Glass', torus((.95, .8, 0), .42, .1, (0, 0, 1), 18, 8, (-math.pi / 2, math.pi / 2)))           # Henkel rechts
for k in range(8):                                                                                       # Glasnoppen
    a = 2 * math.pi * (k + .5) / 8
    b.add('Glass', sphere((math.cos(a) * .82, .55, math.sin(a) * .82), .12, (1, 1.3, 1), 8, 6))
b.add('Check', cyl((0, 1.45, 0), (0, 2.25, 0), .5, .44, 16))                                           # Hemd (kariert)
b.add('Shirt', cyl((0, 2.15, 0), (0, 2.35, 0), .3, .22, 12))                                           # Kragen
for sx in (-1, 1):
    b.add('Leder', rbox((sx * .22, 1.95, .43), (.09, .7, .05), .02, 1, (0, 0, sx * .08)))              # Hosentraeger
    b.add('Check', tube([(sx * .45, 2.1, 0), (sx * .8, 1.9, .15), (sx * 1.0, 1.75, .35)], .13, 8))      # Arme
    b.add('Skin', sphere((sx * 1.05, 1.72, .42), .16, (1, 1, 1), 10, 8))                                 # Haende
b.add('Leder', rbox((0, 1.9, .47), (.5, .08, .04), .01, 1))                                              # Quersteg
b.add('Skin', sphere((0, 2.75, 0), .46, (1, 1.05, 1), 20, 14))                                           # Kopf
b.add('Skin', sphere((0, 2.7, .44), .12, (1, .9, 1), 10, 8))                                             # Nase
for sx in (-1, 1):
    b.add('Cheek', sphere((sx * .26, 2.62, .36), .09, (1, .7, .6), 8, 6))
    b.add('White', sphere((sx * .15, 2.88, .38), .085, (1, 1, .6), 8, 6))
    b.add('Eye', sphere((sx * .15, 2.88, .43), .045, (1, 1, .5), 8, 6))
    b.add('Hair', tube([(sx * .03, 2.6, .46), (sx * .22, 2.56, .44), (sx * .38, 2.62, .36), (sx * .46, 2.72, .28)], .07, 8))   # Schnauzer
    b.add('Hair', sphere((sx * .42, 2.72, -.05), .14, (1, 1.2, 1), 8, 6))                                # Koteletten
b.add('Hat', cyl((0, 3.02, 0), (0, 3.08, 0), .72, .72, 24))                                              # Krempe
b.add('Hat', cyl((0, 3.05, 0), (0, 3.45, 0), .42, .34, 20))
b.add('Band', cyl((0, 3.08, 0), (0, 3.18, 0), .425, .42, 20))
b.add('Feather', tube([(-.28, 3.15, -.25), (-.4, 3.5, -.35), (-.35, 3.85, -.45), (-.2, 4.05, -.5)], .06, 6))   # Gamsbart
b.add('Tin', cyl((0, 3.45, 0), (0, 3.75, 0), .06, .06, 8))                                               # Propeller-Achse
b.finish()

p = Part('LO_Prop')
p.add('Tin', cyl((0, 3.72, 0), (0, 3.86, 0), .12, .12, 10))
for k in range(3):
    a = 2 * math.pi * k / 3
    p.add('Red', rbox((math.cos(a) * .55, 3.8, math.sin(a) * .55), (.95, .04, .2), .02, 1, (0, -a, 0)))
p.finish(origin=(0, 3.8, 0))

# ---------------------------------------------------------------- Ampel an der Stange (Hand rechts)
l = Part('LO_Light')
l.add('Wood', cyl((1.05, 1.1, .45), (1.05, 3.1, .45), .05, .05, 8))
l.add('Dark', rbox((1.05, 3.55, .45), (.5, 1.25, .35), .06, 2))
for y in (3.95, 3.55, 3.15):
    l.add('Dark', cyl((1.05, y + .12, .63), (1.05, y + .12, .78), .19, .19, 12))                          # Schirmchen
l.finish()
for i, y in enumerate((3.95, 3.55, 3.15)):
    q = Part(f'LO_L{i + 1}')
    q.add('Lamp', sphere((1.05, y, .62), .15, (1, 1, .6), 14, 10))
    q.finish()

# ---------------------------------------------------------------- Schild
s = Part('LO_Sign')
s.add('Wood', cyl((-1.05, 1.2, .45), (-1.05, 3.0, .45), .05, .05, 8))
s.add('Yellow', rbox((-1.05, 3.55, .45), (1.9, 1.05, .08), .04, 1))
s.add('White', rbox((-1.05, 3.55, .5), (1.72, .88, .02), .01, 1))
s.finish()

# ---------------------------------------------------------------- Angelrute
r = Part('LO_Rod')
r.add('Wood', cyl((1.05, 1.5, .45), (2.6, 3.4, .8), .05, .025, 8))
r.add('Tin', cyl((1.2, 1.72, .38), (1.2, 1.72, .6), .1, .1, 10))
r.add('Dark', sphere((1.05, 1.5, .45), .07, (1, 1, 1), 8, 6))
r.finish()

rep = export_glb(ROOT / 'assets' / 'loisl.glb')
(ROOT / 'art' / 'r62' / 'loisl_report.json').write_text(json.dumps(rep, indent=1), encoding='utf-8')
print('REPORT', json.dumps(rep))
