"""Mushroom Rally R53: Maerchenschloss im Neuschwanstein-Stil zum DURCHFAHREN (Pilz-Promenade), eigener Entwurf.
Export assets/schloss.glb (ein Objekt je Bauteil, im Spiel zu einem Modell je Material verschmolzen).

Aufbau entlang der Fahrtrichtung (Spiel-z, Strasse |x| < 8,9 m, Durchfahrt innen |x| < 10,6 m):
  z -24..-16  Torbau aus rotem Backstein: Tor mit flachem Bogen, Zinnen, zwei Ecktuermchen, Fensterreihe
  z -16..  6  Innenhof unter freiem Himmel: Hofmauern mit Arkaden und Wehrgang, links Viereckturm (36 m)
              und Ritterhaus, rechts Kemenate; blau-weisse Fahnen an den Mauern
  z   6.. 24  Palas: hoher weisser Bau, Durchfahrt im Erdgeschoss mit Laternen, Fensterreihen mit Bogen,
              steiles Schieferdach, Rundtuerme mit Kegeldaechern und goldenen Spitzen, Treppenturm
  aussen      Felssockel links und rechts (das Schloss steht auf dem Fels)
Koordinaten: Spielkoordinaten ueber blib.G (x rechts, y hoch, z vorwaerts); Ursprung Strassenmitte am Boden.
Laeuft in der offenen Blender-Sitzung (Blender-MCP, eigene Szene) oder per blender -b --python.
"""
import sys, math, json, pathlib, importlib
sys.path.append(r'C:/Users/User/Documents/Playground/mushroom-rally/art/lib')
import bpy, bmesh
from mathutils import Vector, Matrix
import blib
importlib.reload(blib)
from blib import *

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
blib.init_scene('R53_Schloss')
use_materials({
    'Wall': material('CastleWhite', (.93, .91, .86, 1), .72),
    'Trim': material('CastleTrim', (.8, .74, .64, 1), .8),
    'Slate': material('SlateBlue', (.26, .36, .5, 1), .55, .1),
    'Brick': material('BrickRed', (.7, .28, .2, 1), .82),
    'Rock': material('RockGrey', (.52, .5, .47, 1), .92),
    'Moss': material('Moss', (.3, .52, .26, 1), .9),
    'Window': material('WindowDark', (.1, .12, .2, 1), .35),
    'Glow': material('WindowGlow', (1, .8, .45, 1), .4, 0, (1, .72, .35, 1), 1.6),
    'Gold': material('Gold', (1, .76, .22, 1), .3, .85),
    'Iron': material('Iron', (.18, .18, .2, 1), .5, .6),
    'Wood': material('DoorWood', (.42, .26, .14, 1), .8),
    'BavBlue': material('BavBlue', (.1, .45, .9, 1), .5),
    'White': material('White', (.97, .97, .95, 1), .5),
    'Lamp': material('LampGlow', (1, .9, .6, 1), .2, 0, (1, .82, .45, 1), 3.2),
})
IN = 10.6  # halbe lichte Breite der Durchfahrten

def cone(base, tip, r, seg=16):
    return cyl(base, tip, r, 0.0, seg)

def round_tower(p, x, z, r, h0, h1, roof=2.9, seg=18, key='Wall', windows=True):
    """Rundturm mit Kranzgesims, spitzem Schieferkegel, goldener Spitze und Fensterschlitzen."""
    p.add(key, cyl((x, h0, z), (x, h1, z), r, r * .97, seg))
    p.add('Trim', cyl((x, h1 - .15, z), (x, h1 + .75, z), r * 1.13, r * 1.13, seg))
    p.add('Slate', cone((x, h1 + .7, z), (x, h1 + .7 + r * roof, z), r * 1.2, seg))
    tip = h1 + .7 + r * roof
    p.add('Gold', cyl((x, tip - .3, z), (x, tip + 1.3, z), .09, .05, 6))
    p.add('Gold', sphere((x, tip + .2, z), .18, (1, 1, 1), 8, 6))
    if windows:
        for k in range(4):
            a = k * math.pi / 2 + .5
            for hy in (h1 - 2.6, (h0 + h1) / 2):
                p.add('Window', rbox((x + math.cos(a) * r * .98, hy, z + math.sin(a) * r * .98), (.55, 1.5, .55), 0, 1), smooth=False)

def gable(bm, x0, x1, z0, z1, y0, h, ridge='x'):
    """Satteldach: First entlang x (ridge='x') oder entlang z."""
    if ridge == 'x':
        zc = (z0 + z1) / 2
        vs = [bm.verts.new(G(x, y, z)) for x in (x0, x1) for (y, z) in ((y0, z0), (y0, z1), (y0 + h, zc))]
    else:
        xc = (x0 + x1) / 2
        vs = [bm.verts.new(G(x, y, z)) for z in (z0, z1) for (y, x) in ((y0, x0), (y0, x1), (y0 + h, xc))]
    fs = [bm.faces.new((vs[0], vs[1], vs[4], vs[3])), bm.faces.new((vs[1], vs[2], vs[5], vs[4])), bm.faces.new((vs[2], vs[0], vs[3], vs[5])),
          bm.faces.new((vs[0], vs[2], vs[1])), bm.faces.new((vs[3], vs[4], vs[5]))]
    bmesh.ops.recalc_face_normals(bm, faces=fs)

def pyramid(bm, cx, cz, hw, y0, h):
    b = [bm.verts.new(G(cx + sx * hw, y0, cz + sz * hw)) for sx, sz in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    t = bm.verts.new(G(cx, y0 + h, cz))
    fs = [bm.faces.new((b[i], b[(i + 1) % 4], t)) for i in range(4)] + [bm.faces.new(list(reversed(b)))]
    bmesh.ops.recalc_face_normals(bm, faces=fs)

def arch_pts(half, y_side, y_top, n=14):
    """Flacher Bogen (Ellipsenviertel) von links nach rechts."""
    return [(-half + 2 * half * i / n, y_side + (y_top - y_side) * math.sqrt(max(0.0, 1 - ((-half + 2 * half * i / n) / half) ** 2))) for i in range(n + 1)]

def gateway(p, key, z0, z1, top, y_side=7.2, y_top=10.6, outer=17.0):
    """Baukoerper mit Durchfahrt: zwei Pfeiler, Sturz und Bogenzwickel, dazu ein Bogenband an beiden Stirnseiten."""
    for sx in (-1, 1):
        cx = sx * (IN + outer) / 2
        p.add(key, rbox((cx, top / 2, (z0 + z1) / 2), (outer - IN, top, z1 - z0), .08, 1), smooth=False)
    p.add(key, rbox((0, (y_top + top) / 2, (z0 + z1) / 2), (2 * IN, top - y_top, z1 - z0), .05, 1), smooth=False)
    arc = arch_pts(IN, y_side, y_top)
    p.add(key, xy_prism([(-IN, y_top + .01)] + arc + [(IN, y_top + .01)], z0, z1), smooth=False)
    for zf in (z0 - .12, z1 + .12):
        band = [(x * 1.02, y + .35) for x, y in arc]
        inner = [(x, y) for x, y in reversed(arc)]
        p.add('Trim', xy_prism([(-IN - .45, y_side - .3)] + band + [(IN + .45, y_side - .3)] + inner, zf - .18, zf + .18), smooth=False)

# ======================================================== Torbau (roter Backstein)
tb = Part('SC_Torbau')
gateway(tb, 'Brick', -24, -16, 15.5, outer=17.5)
for k in range(9):                                         # Zinnen
    x = -16 + k * 4
    tb.add('Brick', rbox((x, 16.3, -23.6), (1.8, 1.6, .9), .05, 1), smooth=False)
    tb.add('Brick', rbox((x, 16.3, -16.4), (1.8, 1.6, .9), .05, 1), smooth=False)
tb.add('Trim', rbox((0, 15.5, -20), (35.4, .5, 8.6), .05, 1), smooth=False)
for row, y in enumerate((12.6,)):
    for k in range(6):
        x = -13.5 + k * 5.4
        if abs(x) < IN + .5 and y < 10.6:
            continue
        tb.add('Window', rbox((x, y, -24.08), (1.3, 2.2, .12), .03, 1), smooth=False)
        tb.add('Trim', rbox((x, y - 1.3, -24.12), (1.7, .25, .2), .02, 1), smooth=False)
for sx in (-1, 1):
    round_tower(tb, sx * 17.2, -24, 2.1, 0, 19.5, 2.4, 16, 'Brick')
    tb.add('Window', rbox((sx * 14.2, 5.2, -24.08), (1.1, 2.4, .12), .03, 1), smooth=False)
tb.add('Iron', rbox((0, 10.2, -24.2), (2 * IN - .4, .35, .25), .02, 1), smooth=False)   # hochgezogenes Fallgitter
for k in range(11):
    tb.add('Iron', rbox((-IN + 1 + k * (2 * IN - 2) / 10, 10.9, -24.2), (.18, 1.4, .18), 0, 1), smooth=False)
for sx in (-1, 1):                                          # Laternen am Tor
    tb.add('Iron', rbox((sx * (IN - .15), 5.4, -24.3), (.35, .35, .7), .02, 1))
    tb.add('Lamp', sphere((sx * (IN - .15), 5.0, -24.6), .32, (1, 1.2, 1), 10, 8))
tb.finish()

# ======================================================== Innenhof: Mauern, Arkaden, Wehrgang, Fahnen
hof = Part('SC_Hof')
for sx in (-1, 1):
    hof.add('Wall', rbox((sx * 13.4, 6.2, -5), (3.8, 12.4, 22), .08, 1), smooth=False)
    # Wehrgang mit Pultdach nach aussen
    hof.add('Slate', xy_prism([(sx * 11.0, 13.8), (sx * 16.0, 12.2), (sx * 16.0, 11.9), (sx * 11.0, 13.5)], -16, 6), smooth=False)
    hof.add('Wood', rbox((sx * 11.35, 12.9, -5), (.3, 1.2, 22), .02, 1), smooth=False)
    for k in range(7):                                      # Arkaden: dunkle Bogenfelder mit hellem Rahmen
        z = -14 + k * 3.1
        hof.add('Window', rbox((sx * 11.47, 4.2, z), (.08, 4.4, 2.0), .02, 1), smooth=False)
        hof.add('Trim', rbox((sx * 11.5, 6.55, z), (.14, .35, 2.5), .02, 1), smooth=False)
        hof.add('Trim', rbox((sx * 11.5, 4.0, z + 1.4), (.14, 8.0, .45), .02, 1), smooth=False)
        if k % 2 == 0:
            hof.add('Glow' if k % 4 == 0 else 'Window', rbox((sx * 11.47, 9.6, z + .1), (.08, 1.8, 1.2), .02, 1), smooth=False)
    for z in (-12.5, -3.5, 3.5):                            # Fahnen blau-weiss
        hof.add('Iron', cyl((sx * 11.2, 10.6, z), (sx * 9.9, 11.3, z), .06, .06, 6))
        for i in range(6):
            hof.add('BavBlue' if i % 2 == 0 else 'White', rbox((sx * 10.2, 10.1 - i * .75, z + .02), (.05, .75, 1.1), 0, 1), smooth=False)
# Viereckturm links (hoch, schlank) mit Pyramidendach, Ritterhaus davor
vt = -18.6
hof.add('Wall', rbox((vt, 18, -6.5), (7, 36, 7), .1, 1), smooth=False)
hof.add('Trim', rbox((vt, 36.2, -6.5), (7.8, .8, 7.8), .06, 1), smooth=False)
hof.add('Slate', lambda bm: pyramid(bm, vt, -6.5, 3.9, 36.5, 9.5), smooth=False)
hof.add('Gold', cyl((vt, 45.8, -6.5), (vt, 47.6, -6.5), .1, .05, 6))
for y in (14, 20, 26, 32):
    for sz in (-1, 1):
        hof.add('Window', rbox((vt + 3.52, y, -6.5 + sz * 1.6), (.1, 2.6, 1.0), .02, 1), smooth=False)
hof.add('Wall', rbox((-21, 8, 2.5), (12, 16, 7), .1, 1), smooth=False)
hof.add('Slate', lambda bm: gable(bm, -27.3, -14.7, -1.4, 6.4, 16, 5.5, 'x'), smooth=False)
# Kemenate rechts
hof.add('Wall', rbox((21.5, 10, -6), (12, 20, 14), .1, 1), smooth=False)
hof.add('Slate', lambda bm: gable(bm, 15.1, 27.9, -13.4, 1.4, 20, 6.5, 'z'), smooth=False)
for row in range(3):
    for k in range(4):
        hof.add('Window', rbox((15.44, 7 + row * 4.5, -11.4 + k * 3.4), (.1, 2.2, 1.1), .02, 1), smooth=False)
round_tower(hof, 27.4, -13, 1.6, 0, 25, 3.0, 16)
hof.finish()

# ======================================================== Palas mit Durchfahrt
pa = Part('SC_Palas')
gateway(pa, 'Wall', 6, 22, 30, outer=20)
pa.add('Trim', rbox((0, 29.7, 14), (40.6, .7, 16.6), .05, 1), smooth=False)
pa.add('Trim', rbox((0, 11.4, 14), (40.4, .45, 16.4), .03, 1), smooth=False)
pa.add('Slate', lambda bm: gable(bm, -20.4, 20.4, 5.4, 22.6, 30, 11, 'x'), smooth=False)
for zf, sgn in ((5.9, -1), (22.1, 1)):                       # Fensterreihen vorn und hinten, Rundbogen-Abschluss
    for row, y in enumerate((14.5, 19.5, 24.5)):
        for k in range(9):
            x = -16 + k * 4
            key = 'Glow' if (k + row) % 5 == 2 else 'Window'
            pa.add(key, rbox((x, y, zf + sgn * .04), (1.3, 2.8, .1), .02, 1), smooth=False)
            pa.add(key, cyl((x, y + 1.4, zf + sgn * .04), (x, y + 1.4, zf + sgn * .1), .65, .65, 10))
            pa.add('Trim', rbox((x, y - 1.55, zf + sgn * .1), (1.7, .22, .24), .02, 1), smooth=False)
    for k in range(4):                                        # Erdgeschossfenster neben der Durchfahrt
        x = (1 if k < 2 else -1) * (13 + (k % 2) * 3.5)
        pa.add('Window', rbox((x, 5, zf + sgn * .04), (1.1, 2.3, .1), .02, 1), smooth=False)
# Saengerbalkon ueber der Einfahrt (Hofseite)
pa.add('Trim', rbox((0, 12.2, 5.1), (9, .4, 1.8), .04, 1), smooth=False)
for k in range(9):
    pa.add('Trim', cyl((-4 + k, 12.4, 4.4), (-4 + k, 13.4, 4.4), .09, .09, 6))
pa.add('Trim', rbox((0, 13.45, 4.4), (8.6, .16, .22), .02, 1), smooth=False)
# Laternen und Bogenrippen in der Durchfahrt
for z in (9, 14, 19):
    for sx in (-1, 1):
        pa.add('Iron', rbox((sx * (IN - .12), 5.6, z), (.3, .3, .3), .02, 1))
        pa.add('Lamp', sphere((sx * (IN - .45), 5.2, z), .3, (1, 1.25, 1), 10, 8))
    band = arch_pts(IN, 7.2, 10.6)
    pa.add('Trim', xy_prism([(x, y - .02) for x, y in band] + [(x, y - .45) for x, y in reversed(band)], z - .35, z + .35), smooth=False)
# Tuerme des Palas
round_tower(pa, -20.6, 22.4, 2.2, 0, 36, 2.7)
round_tower(pa, 20.6, 22.4, 1.9, 0, 33, 2.9)
round_tower(pa, 21.2, 6.4, 2.6, 0, 40, 2.5)                  # Treppenturm (hoechster Rundturm)
round_tower(pa, -20.8, 6.2, 1.3, 26, 35, 3.2, 12)             # Erkertuermchen am Giebel
pa.add('Wall', cone((-20.8, 26.2, 6.2), (-20.8, 22.5, 6.2), 1.3, 12))
for sx in (-1, 1):                                             # Ziergiebel mit goldener Spitze
    pa.add('Wall', xy_prism([(sx * 4 - 2.6, 30), (sx * 4 + 2.6, 30), (sx * 4, 35.5)], 5.5, 6.1), smooth=False)
    pa.add('Gold', cyl((sx * 4, 35.4, 5.8), (sx * 4, 36.8, 5.8), .08, .05, 6))
pa.finish()

# Felssockel: im Spiel aus den Blender-Felsen (rock.glb) gesetzt, siehe SCHLOSS_ROCKS in game.js

tris = export_glb(ROOT / 'assets' / 'schloss.glb')
report = {'asset': 'schloss.glb', 'authoring': 'Original procedural Blender model (Neuschwanstein-inspired, not a replica)',
          'source': 'art/r53/create_schloss.py', 'triangles': sum(tris.values()), 'parts': tris,
          'bytes': (ROOT / 'assets' / 'schloss.glb').stat().st_size, 'clear_half_width_m': IN}
(ROOT / 'art' / 'r53' / 'schloss_report.json').write_text(json.dumps(report, indent=1), encoding='utf-8')
print('REPORT', json.dumps(report))
