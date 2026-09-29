"""Suppa Lederhosn Karts R56: zwei neue Kart-Karosserien (eigene Entwuerfe, keine Marken-Merkmale).
Spiel-Koordinaten: y oben, +z vorn, Masse wie die Grundkarosserie (Raeder bei x +-1/1,05, z +1 / -0,9; Fahrer bei
(0, .95, -.35); Lenkrad fuer die Haende bei ~(0, 1.38, .3)). Export assets/kartbodies.glb:
  KB_Keil     Keilflitzer: flacher Supersportwagen-Keil, schmale Schlitz-Scheinwerfer, grosse Seitenlufteinlaesse,
              offenes Cockpit mit Windschott, Motorabdeckung mit Lamellen, niedriger Heckfluegel, Leuchtband hinten
              (bewusst ohne Y-Leuchten, Sechseck-Motive oder Wappen)
  KB_Tourer   Tourenwagen: kantige 80er-Limousinenform ohne Dach, Doppel-Rundscheinwerfer, waagrechter Lamellengrill
              (keine Niere), ausgestellte Kotfluegel, hoher Heckfluegel auf Stuetzen, Seitenstreifen
Material "BodyPaint" wird im Spiel in der Kartfarbe eingefaerbt.
"""
import sys, math, json, pathlib, importlib
sys.path.append(r'C:/Users/User/Documents/Playground/mushroom-rally/art/lib')
import bpy, bmesh
from mathutils import Vector
import blib
importlib.reload(blib)
from blib import *

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
blib.init_scene('R56_KartBodies')
use_materials({
    'BodyPaint': material('BodyPaint', (.85, .08, .06, 1), .25, .1),
    'Dark': material('Dark', (.04, .04, .05, 1), .45, .2),
    'Carbon': material('Carbon', (.08, .08, .1, 1), .35, .3),
    'Glass': material('Glass', (.5, .7, .85, 1), .05, .1),
    'KartLight': material('KartLight', (1, .97, .9, 1), .2, 0, (1, .97, .9, 1), 3.0),
    'TailLight': material('TailLight', (1, .1, .08, 1), .3, 0, (1, .05, .03, 1), 2.5),
    'Seat': material('Seat', (.12, .12, .14, 1), .7),
    'Rim': material('Rim', (.75, .77, .8, 1), .3, .9),
    'White': material('White', (.96, .96, .94, 1), .45),
    'Gold': material('Gold', (1, .74, .22, 1), .3, .85),
})


def loft(sections, seg=6):
    """Rumpf aus Querschnitten (z, y_unten, y_oben, halbe Breite, Rundung 0..1): abgerundete Rechtecke, verbunden."""
    def ring(z, y0, y1, hw, rr):
        pts = []
        h = (y1 - y0) / 2
        cy = (y0 + y1) / 2
        r = min(hw, h) * rr
        corners = [(hw - r, h - r, 0), (-(hw - r), h - r, math.pi / 2), (-(hw - r), -(h - r), math.pi), (hw - r, -(h - r), 1.5 * math.pi)]
        for cx, cz, a0 in corners:
            for k in range(seg + 1):
                a = a0 + (math.pi / 2) * k / seg
                pts.append((cx + math.cos(a) * r, cy + cz + math.sin(a) * r, z))
        return pts
    def b(bm):
        rings = [[bm.verts.new(G(*p)) for p in ring(*s)] for s in sections]
        n = len(rings[0])
        fs = []
        for a, c in zip(rings, rings[1:]):
            for i in range(n):
                j = (i + 1) % n
                fs.append(bm.faces.new((a[i], a[j], c[j], c[i])))
        fs.append(bm.faces.new(list(reversed(rings[0]))))
        fs.append(bm.faces.new(rings[-1]))
        bmesh.ops.recalc_face_normals(bm, faces=fs)
    return b


def cockpit(p, seat_y=.6):
    """Sitz, Lenksaeule und Lenkrad - gleiche Lage wie bei den bestehenden Karts."""
    p.add('Seat', rbox((0, seat_y, -.42), (.78, .16, .72), .06, 2))
    p.add('Seat', rbox((0, seat_y + .42, -.8), (.74, .8, .14), .06, 2, rot=(-.2, 0, 0)))
    p.add('Dark', cyl((0, .92, .95), (0, 1.3, .38), .045, .045, 8))
    p.add('Dark', torus((0, 1.36, .32), .21, .035, (0, .5, -1), 20, 5))
    p.add('Gold', sphere((0, 1.36, .32), .05, (1, 1, 1), 8, 6))


def arches(p, key='BodyPaint', flare=0.0):
    """Radlauf-Boegen nur ueber den Raedern (halber Bogen), leicht nach aussen versetzt."""
    for x, z, r in [(-1, 1, .5), (1, 1, .5), (-1.05, -.9, .56), (1.05, -.9, .56)]:
        sx = 1 if x > 0 else -1
        R = r + .1
        pts = [(x - sx * .08 + sx * flare, .45 + R * math.sin(a), z + R * math.cos(a)) for a in [math.pi * (.08 + .84 * k / 10) for k in range(11)]]
        p.add(key, tube(pts, .09, 6))
        p.add('Dark', tube([(q[0] - sx * .02, q[1] - .03, q[2]) for q in pts], .06, 5))


# ================================================================== Keilflitzer
k = Part('KB_Keil')
k.add('Carbon', rbox((0, .34, .05), (1.72, .12, 3.9), .05, 2))                                  # Bodenplatte
k.add('BodyPaint', loft([(2.08, .3, .5, .7, .9), (1.6, .28, .66, .88, .8), (.9, .28, .78, .93, .7),
                          (.35, .28, .9, .95, .6), (-.35, .28, .92, .97, .6), (-1.1, .28, 1.02, 1.0, .55),
                          (-1.75, .3, .98, 1.0, .6), (-2.0, .36, .86, .95, .7)]))
k.add('Seat', rbox((0, .95, -.35), (1.05, .18, 1.25), .08, 2))                                  # Cockpit-Wanne (dunkel)
cockpit(k)
k.add('Glass', rbox((0, 1.08, .42), (1.2, .34, .05), .04, 2, rot=(-.95, 0, 0)))                 # flaches Windschott
for sx in (-1, 1):
    k.add('KartLight', rbox((sx * .5, .58, 2.02), (.46, .05, .06), .02, 1, rot=(0, -sx * .25, 0)))  # Schlitz-Scheinwerfer
    k.add('Dark', rbox((sx * .98, .62, -.55), (.12, .34, 1.05), .05, 2, rot=(0, sx * .18, 0)))   # grosser Seitenlufteinlass
    k.add('Dark', rbox((sx * .96, .58, 1.3), (.1, .14, .7), .03, 1))                             # Luftschlitz vorn
    k.add('BodyPaint', rbox((sx * .98, 1.02, .05), (.1, .1, .28), .03, 1))                       # Spiegel
k.add('Dark', rbox((0, .46, 2.06), (1.1, .1, .05), .03, 1))                                     # Frontspoiler-Lippe
for i in range(5):                                                                              # Motorabdeckung-Lamellen
    k.add('Carbon', rbox((0, 1.03 - i * .012, -1.05 - i * .16), (1.2, .03, .07), .01, 1))
k.add('TailLight', rbox((0, .78, -2.0), (1.5, .07, .05), .02, 1))                              # Leuchtband hinten
k.add('Carbon', rbox((0, .52, -1.98), (1.5, .16, .12), .03, 1))                                 # Diffusor
k.add('Carbon', rbox((0, 1.2, -1.8), (1.9, .05, .38), .02, 1))                                  # niedriger Heckfluegel
for sx in (-1, 1):
    k.add('Carbon', rbox((sx * .6, 1.08, -1.78), (.06, .22, .2), .01, 1))
arches(k)
k.finish()

# ================================================================== Tourenwagen
t = Part('KB_Tourer')
t.add('Carbon', rbox((0, .34, .05), (1.72, .12, 3.9), .05, 2))
t.add('BodyPaint', loft([(2.02, .3, .72, .9, .35), (1.55, .28, .86, .96, .3), (.5, .28, .92, .98, .3),
                          (-.5, .28, .96, 1.0, .3), (-1.6, .3, 1.0, 1.0, .3), (-2.0, .34, .92, .98, .35)], seg=3))
t.add('Seat', rbox((0, .98, -.35), (1.08, .16, 1.3), .08, 2))
cockpit(t)
t.add('Glass', rbox((0, 1.16, .45), (1.4, .42, .05), .03, 2, rot=(-.7, 0, 0)))                  # Frontscheibe (Rahmen offen)
t.add('BodyPaint', rbox((0, 1.4, .46), (1.46, .05, .06), .02, 1, rot=(-.7, 0, 0)))              # Scheibenrahmen oben
t.add('Dark', rbox((0, .62, 2.04), (1.2, .22, .05), .03, 1))                                    # waagrechter Lamellengrill
for i in range(3):
    t.add('Rim', rbox((0, .54 + i * .08, 2.07), (1.16, .018, .02), 0, 1))
for sx in (-1, 1):
    for dx in (.5, .76):                                                                        # Doppel-Rundscheinwerfer
        t.add('Rim', torus((sx * dx, .64, 2.05), .1, .025, (0, 0, 1), 16, 4))
        t.add('KartLight', cyl((sx * dx, .64, 2.03), (sx * dx, .64, 2.07), .09, .09, 14))
    t.add('BodyPaint', rbox((sx * 1.02, .62, 1.0), (.14, .34, 1.1), .06, 2))                    # ausgestellte Kotfluegel vorn
    t.add('BodyPaint', rbox((sx * 1.06, .66, -.9), (.16, .38, 1.2), .06, 2))                    # und hinten
    t.add('White', rbox((sx * 1.0, .74, .0), (.03, .08, 3.2), .01, 1))                          # Seitenstreifen
    t.add('TailLight', rbox((sx * .62, .82, -2.0), (.5, .18, .05), .02, 1))                     # Rueckleuchten
    t.add('Carbon', cyl((sx * .7, 1.0, -1.72), (sx * .7, 1.42, -1.84), .04, .04, 8))            # Fluegel-Stuetzen
t.add('Carbon', rbox((0, 1.46, -1.86), (2.0, .06, .42), .02, 1, rot=(.12, 0, 0)))               # hoher Heckfluegel
t.add('Dark', rbox((0, .44, 2.06), (1.7, .12, .1), .03, 1))                                     # Stossfaenger
t.add('Dark', rbox((0, .46, -2.02), (1.7, .12, .1), .03, 1))
arches(t, flare=.05)
t.finish()

# ================================================================== R57 Fass-Kart (Standard-Karosserie)
# Bauchiges Bierfass laengs: vorn und hinten geschlossen, in der Mitte ein Cockpit-Ausschnitt (der Fahrer sitzt drin,
# die Fassboeden sind die Trennwaende). Reifen in Kartfarbe, Zapfhahn vorn, Spundloch mit Bierschaum oben.
# Farben linear (Blender): (.3,.14,.05) erschien im Spiel als Pfirsichton - deshalb deutlich dunkler.
use_materials({'Wood': material('Wood', (.1, .045, .014, 1), .78), 'WoodDark': material('WoodDark', (.035, .014, .005, 1), .85),
               'Brass': material('Brass', (.95, .7, .25, 1), .3, .85), 'Foam': material('Foam', (.98, .97, .92, 1), .9),
               'RautBlue': material('RautBlue', (.1, .42, .86, 1), .45)})
f = Part('KB_Fass')
L, YC, Z0, Z1, CUT = 2.0, 1.02, -1.35, .55, 1.3
rad = lambda z: .76 + .12 * (1 - (z / L) ** 2)                                                  # Fassbauch


def barrel(z0, z1, n, full):
    """Fassstueck von z0 bis z1 mit Boeden, Daubenfugen (bei offenen Stuecken nur unterhalb des Schnitts)."""
    # blib.loft (t, hw, yb, yt, n) - nicht das lokale loft() oben mit anderer Parameterreihenfolge
    f.add('Wood', blib.loft([(z, rad(z), YC - rad(z), YC + rad(z), 2) for z in [z0 + i * (z1 - z0) / n for i in range(n + 1)]], seg=22), smooth=False)
    for k in range(22):
        a = 2 * math.pi * k / 22
        if not full and YC + math.sin(a) * .9 > CUT - .05:
            continue
        pts = [(math.cos(a) * (rad(z) + .012), YC + math.sin(a) * (rad(z) + .012), z) for z in [z0 + .04 + i * (z1 - z0 - .08) / 4 for i in range(5)]]
        f.add('WoodDark', tube(pts, .02, 4))


barrel(-L, Z0, 3, True)
barrel(Z1, L, 7, True)
for z in (-1.62, 1.05, 1.62):                                                                    # Reifen (Kartfarbe)
    f.add('BodyPaint', torus((0, YC, z), rad(z) + .025, .055, (0, 0, 1), 32, 6))
f.add('WoodDark', torus((0, YC, L - .02), rad(L) - .04, .05, (0, 0, 1), 28, 6))
f.add('WoodDark', torus((0, YC, -L + .02), rad(-L) - .04, .05, (0, 0, 1), 28, 6))
# Mittelstueck: nur dieses wird oben aufgeschnitten
before = set(f.bm.faces)
barrel(Z0, Z1, 5, False)
f.add('BodyPaint', torus((0, YC, -.4), rad(-.4) + .025, .055, (0, 0, 1), 32, 6))
new_f = [q for q in f.bm.faces if q not in before]
new_v = list({v for q in new_f for v in q.verts})
new_e = list({e for q in new_f for e in q.edges})
bmesh.ops.bisect_plane(f.bm, geom=new_v + new_e + new_f, plane_co=G(0, CUT, 0), plane_no=G(0, 1, 0), clear_outer=True)
f.add('Carbon', rbox((0, .3, .05), (1.4, .1, 3.7), .04, 2))                                     # Bodenplatte fuer die Achsen
cockpit(f, seat_y=.55)
f.add('Brass', cyl((0, .62, L - .05), (0, .62, L + .32), .08, .07, 10))                         # Zapfhahn
f.add('Brass', rbox((0, .8, L + .28), (.08, .3, .08), .02, 1))
f.add('Brass', sphere((0, .96, L + .28), .07, (1, 1, 1), 8, 6))
f.add('RautBlue', rbox((0, 1.2, L + .01), (.46, .46, .03), .02, 1, rot=(0, 0, math.pi / 4)), smooth=False)
f.add('WoodDark', cyl((0, YC + rad(1.25) - .05, 1.25), (0, YC + rad(1.25) + .04, 1.25), .2, .2, 12))   # Spundloch
for i in range(7):                                                                               # Bierschaum quillt heraus
    a = i / 7 * 2 * math.pi
    rr = 0 if i == 0 else .17
    f.add('Foam', sphere((math.sin(a) * rr, YC + rad(1.25) + .1 + (.1 if i == 0 else 0), 1.25 + math.cos(a) * rr), .16 if i else .2, (1, .8, 1), 10, 6))
for sx in (-1, 1):
    f.add('TailLight', rbox((sx * .38, .75, -L - .01), (.22, .12, .04), .02, 1))                 # Ruecklichter am hinteren Boden
    f.add('KartLight', sphere((sx * .42, .62, L + .02), .09, (1, 1, .4), 10, 6))                 # Laempchen vorn
f.finish()

rep = export_glb(ROOT / 'assets' / 'kartbodies.glb')
(ROOT / 'art' / 'r56' / 'kartbodies_report.json').write_text(json.dumps(rep, indent=1), encoding='utf-8')
print('REPORT', json.dumps(rep))
