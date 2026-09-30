"""Suppa Lederhosn Karts R61: XXL-Kathedralenstadt fuer den Riesendom (eigene Entwuerfe, Goetterstadt in ewiger Abendsonne).
Spiel-Koordinaten: y oben, +z Front (zeigt zur Strasse), x laengs. Export assets/domecity.glb:
  DC_Cathedral  Riesen-Kathedrale: Langhaus 90 m, Querhaus mit Rosenfenster zur Strasse, Doppeltuerme mit Turmhelmen
                (125 m), Strebebogen, Chor-Rundung
  DC_Tower      Glockenturm 110 m mit Glockenstube, Fialen und Achteck-Helm
  DC_Arch       Strebebogen-Tor ueber die Fahrbahn (Spannweite 40 m, lichte Hoehe 30 m) mit Laufgang und Fialen
  DC_Row        Arkaden-Haeuserzeile (50 m) mit Spitzbogenfenstern - saeumt die Anti-Grav-Schluchten
  DC_Rotunda    Kuppel-Rotunde (60 m Durchmesser) mit Saeulenkranz, Goldrippen und Laterne
Aufruf: blender -b --factory-startup --python art/r61/create_domecity.py
"""
import sys, math, json, pathlib, importlib
sys.path.append(r'C:/Users/User/Documents/Playground/mushroom-rally/art/lib')
import bpy, bmesh
from mathutils import Vector
import blib
importlib.reload(blib)
from blib import *

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
blib.init_scene('R61_DomeCity')
use_materials({
    'Stone': material('DcStone', (.62, .5, .36, 1), .85),
    'StoneD': material('DcStoneDark', (.38, .3, .22, 1), .9),
    'StoneL': material('DcStoneLight', (.8, .7, .52, 1), .8),
    'Roof': material('DcRoof', (.16, .15, .24, 1), .6, .3),
    'Gold': material('DcGold', (1, .7, .2, 1), .3, .9),
    'Glow': material('DcGlow', (1, .62, .25, 1), .5, 0, (1, .55, .18, 1), 4.0),
    'Rose': material('DcRose', (.7, .3, 1, 1), .4, 0, (.65, .3, 1, 1), 3.5),
    'Blue': material('DcBlueGlass', (.2, .45, 1, 1), .4, 0, (.25, .5, 1, 1), 3.0),
})


def spire(p, r, h, seg=8, mat='Roof', tip='Gold'):
    x, y, z = p
    return [(mat, cyl((x, y, z), (x, y + h, z), r, r * .04, seg)), (tip, sphere((x, y + h + r * .12, z), r * .12, (1, 1, 1), 8, 6))]


def pointed(x, y0, w, h, z, mat='Glow', depth=.4, face=1):
    """Spitzbogenfenster in der Ebene z (Front), unten y0, Breite w, Hoehe h."""
    pts = [(-w / 2, 0), (w / 2, 0), (w / 2, h * .72)]
    for i in range(1, 6):
        a = i / 6
        pts.append((w / 2 * math.cos(a * math.pi / 2), h * .72 + h * .28 * math.sin(a * math.pi / 2)))
    pts.append((0, h))
    for i in range(5, 0, -1):
        a = i / 6
        pts.append((-w / 2 * math.cos(a * math.pi / 2), h * .72 + h * .28 * math.sin(a * math.pi / 2)))
    pts.append((-w / 2, h * .72))
    poly = [(x + px, y0 + py) for px, py in pts]
    return (mat, xy_prism(poly, z, z + depth * face))


def gable_roof(x0, x1, zc, half_w, y0, h, mat='Roof'):
    """Satteldach laengs x: Profil (z, y) als Dreieck."""
    return (mat, prism([(zc - half_w, y0), (zc + half_w, y0), (zc, y0 + h)], x0, x1))

# ---------------------------------------------------------------- Kathedrale
c = Part('DC_Cathedral')
L, W, H = 90, 26, 34
c.add('Stone', rbox((0, H / 2, -W / 2), (L, H, W), .4, 1))
c.add(*gable_roof(-L / 2, L / 2, -W / 2, W / 2 + 1.2, H, 16))
for i in range(10):                                   # Obergaden-Fenster und Strebebogen zur Strassenseite
    x = -L / 2 + 6 + i * 8.6
    if abs(x - 8) < 9:
        continue
    c.add(*pointed(x, 12, 4.2, 17, .02))
    c.add('StoneD', rbox((x + 4.3, H / 2 - 4, 7), (2.6, H - 8, 3), .2, 1))             # Pfeiler
    c.add('StoneL', cyl((x + 4.3, H - 12, 7), (x + 4.3, H - 2, 1.5), .9, .9, 8))      # Strebebogen (schraeg)
    for s_ in spire((x + 4.3, H - 8, 7), 1.3, 9, 6, 'StoneL', 'Gold'):
        c.add(*s_)
# Querhaus mit Rosenfenster zur Strasse
c.add('Stone', rbox((8, H / 2 + 3, 6), (22, H + 6, 18), .3, 1))
c.add(*gable_roof(-3, 19, 6, 10, H + 6, 12))
c.add('Rose', cyl((8, H - 4, 15.2), (8, H - 4, 15.6), 7.5, 7.5, 24))
c.add('Gold', torus((8, H - 4, 15.6), 7.6, .5, (0, 0, 1), 28, 6))
for k in range(8):
    a = 2 * math.pi * k / 8
    c.add('StoneL', rbox((8 + math.cos(a) * 3.8, H - 4 + math.sin(a) * 3.8, 15.7), (.5, 7.2, .4), 0, 1, (0, 0, a)))
c.add(*pointed(8, 4, 9, 16, 15.1, 'Blue'))
# Doppeltuerme im Westen mit Helmen
for zz in (-3, -W + 3):
    c.add('Stone', rbox((-L / 2 - 4, 36, zz), (14, 72, 12), .3, 1))
    c.add('StoneD', rbox((-L / 2 - 4, 73, zz), (15.5, 2.5, 13.5), .2, 1))
    for s_ in spire((-L / 2 - 4, 74, zz), 7.2, 50, 8):
        c.add(*s_)
    for dx in (-6.5, 6.5):
        for dz in (-5.5, 5.5):
            for s_ in spire((-L / 2 - 4 + dx, 74, zz + dz), 1.1, 11, 6, 'StoneL', 'Gold'):
                c.add(*s_)
    c.add(*pointed(-L / 2 - 4, 44, 4.5, 16, zz + 6.02))
    c.add(*pointed(-L / 2 - 4, 20, 5, 14, zz + 6.02, 'Blue'))
# Chor-Rundung im Osten
c.add('Stone', cyl((L / 2, 0, -W / 2), (L / 2, H, -W / 2), W / 2, W / 2, 20))
c.add('Roof', cyl((L / 2, H, -W / 2), (L / 2, H + 12, -W / 2), W / 2 + 1, .5, 20))
# Vierungsturm
c.add('StoneL', cyl((8, H + 14, -W / 2), (8, H + 30, -W / 2), 6, 6, 8))
for s_ in spire((8, H + 30, -W / 2), 6.2, 30, 8):
    c.add(*s_)
c.add('StoneD', rbox((0, 1, -W / 2 + 4), (L + 20, 2, W + 26), .2, 1))              # Sockel
c.finish()

# ---------------------------------------------------------------- Glockenturm
t = Part('DC_Tower')
t.add('Stone', rbox((0, 30, 0), (14, 60, 14), .3, 1))
t.add('StoneL', rbox((0, 61, 0), (15.5, 2, 15.5), .2, 1))
t.add('Stone', rbox((0, 70, 0), (12, 18, 12), .3, 1))
t.add(*pointed(0, 64, 5, 11, 6.02, 'Glow'))
t.add(*pointed(0, 64, 5, 11, -6.02, 'Glow', .4, -1))
t.add(*pointed(0, 22, 4, 16, 7.02, 'Blue'))
t.add('StoneD', rbox((0, 80, 0), (13.5, 2, 13.5), .2, 1))
for s_ in spire((0, 81, 0), 6.4, 32, 8):
    t.add(*s_)
for dx in (-5.5, 5.5):
    for dz in (-5.5, 5.5):
        for s_ in spire((dx, 81, dz), 1, 10, 6, 'StoneL', 'Gold'):
            t.add(*s_)
t.finish()

# ---------------------------------------------------------------- Strebebogen-Tor ueber die Strasse
a = Part('DC_Arch')
SPAN, PH = 20, 28     # halbe Spannweite, Pfeilerhoehe
for sx in (-1, 1):
    a.add('Stone', rbox((sx * (SPAN + 2.5), PH / 2, 0), (5, PH, 6), .3, 1))
    a.add('StoneL', rbox((sx * (SPAN + 2.5), PH + .8, 0), (6, 1.6, 7), .2, 1))
    for s_ in spire((sx * (SPAN + 2.5), PH + 1.6, 0), 2.2, 14, 8, 'StoneL', 'Gold'):
        a.add(*s_)
# Spitzbogen aus zwei Kreisboegen (Radius 1,4 x halbe Spannweite)
R = SPAN * 1.45
for sx in (-1, 1):
    cx = -sx * (R - SPAN)
    ang0 = 0 if sx > 0 else math.pi
    apex = math.acos((R - SPAN) / R)
    arc = (0, apex) if sx > 0 else (math.pi - apex, math.pi)
    a.add('StoneL', torus((cx, PH, 0), R, 1.3, (0, 0, 1), 20, 8, arc))
a.add('Stone', rbox((0, PH + R * math.sin(math.acos((R - SPAN) / R)) + 2.5, 0), (10, 3, 5), .2, 1))
a.add('StoneD', rbox((0, PH + 13, 0), (2 * SPAN + 10, 1.4, 4), .1, 1))                  # Laufgang
for i in range(-4, 5):
    a.add('Stone', rbox((i * 5, PH + 14.6, 0), (1.2, 1.8, 4.2), .1, 1))
a.add('Glow', sphere((0, PH + 21, 0), 1.2, (1, 1, 1), 10, 8))
a.finish()

# ---------------------------------------------------------------- Arkaden-Haeuserzeile
w = Part('DC_Row')
RL, RH, RD = 50, 26, 12
w.add('Stone', rbox((0, RH / 2, -RD / 2), (RL, RH, RD), .3, 1))
w.add(*gable_roof(-RL / 2, RL / 2, -RD / 2, RD / 2 + .8, RH, 7))
for i in range(6):
    x = -RL / 2 + 4.5 + i * 8.2
    w.add('StoneD', rbox((x, 5, .6), (6.4, 10, 1.2), .2, 1))                # Arkade (dunkle Nische)
    w.add(*pointed(x, 1, 4.4, 8.5, .02, 'StoneD', 1.4))
    w.add(*pointed(x, 13, 3.2, 9, .02, 'Glow'))
    w.add('StoneL', rbox((x + 4.1, RH / 2, .8), (1.4, RH, 1.6), .1, 1))
    for s_ in spire((x + 4.1, RH, .8), .9, 6, 6, 'StoneL', 'Gold'):
        w.add(*s_)
w.finish()

# ---------------------------------------------------------------- Kuppel-Rotunde
r = Part('DC_Rotunda')
RR = 30
r.add('StoneD', cyl((0, 0, 0), (0, 3, 0), RR + 4, RR + 3, 32))
r.add('Stone', cyl((0, 3, 0), (0, 26, 0), RR, RR, 32))
for k in range(24):
    ang = 2 * math.pi * k / 24
    r.add('StoneL', cyl((math.cos(ang) * (RR + 2), 3, math.sin(ang) * (RR + 2)), (math.cos(ang) * (RR + 2), 25, math.sin(ang) * (RR + 2)), .9, .9, 8))
r.add('StoneL', cyl((0, 25, 0), (0, 28, 0), RR + 3, RR + 3, 32))
r.add('Stone', cyl((0, 28, 0), (0, 34, 0), RR - 2, RR - 3, 32))                        # Tambour
r.add('Roof', sphere((0, 34, 0), RR - 3, (1, 1, 1), 32, 14))
for k in range(12):                                                                     # Goldrippen
    ang = 2 * math.pi * k / 12
    r.add('Gold', torus((0, 34, 0), RR - 2.6, .45, (-math.sin(ang), 0, math.cos(ang)), 20, 6, (0, math.pi / 2), (0, 1, 0)))
r.add('StoneL', cyl((0, 34 + (RR - 3), 0), (0, 34 + (RR - 3) + 8, 0), 3.5, 3.5, 12))
r.add('Glow', cyl((0, 34 + (RR - 3) + 2, 0), (0, 34 + (RR - 3) + 6, 0), 3.6, 3.6, 12))
for s_ in spire((0, 34 + (RR - 3) + 8, 0), 3.8, 9, 12, 'Gold', 'Gold'):
    r.add(*s_)
r.finish()

rep = export_glb(ROOT / 'assets' / 'domecity.glb')
(ROOT / 'art' / 'r61' / 'domecity_report.json').write_text(json.dumps(rep, indent=1), encoding='utf-8')
print('REPORT', json.dumps(rep))
