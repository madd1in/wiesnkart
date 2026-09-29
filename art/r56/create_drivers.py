"""Suppa Lederhosn Karts R56: vier neue Fahrer (eigene, stilisierte Entwuerfe), Spiel-Koordinaten (y oben, +z vorn),
Ursprung auf der Sitzflaeche - im Spiel sitzen Fahrer bei (0, .95, -.35) im Kart, das Lenkrad liegt bei ~(0, .35, .6).
  assets/driver_sepp.glb     Sepp, Bursch in Lederhosn: Tirolerhut mit Gamsbart, Trachtenhemd, Hosentraeger mit
                             Edelweiss-Latz, Kniebundhose, Wadlstruempf, Haferlschuhe, Schnauzer
  assets/driver_vroni.glb    Vroni im Dirndl: Mieder (Kartfarbe), weisse Puffaermel-Bluse, Schuerze mit Schleife,
                             weiter Rock, blonder Zopfkranz mit zwei Zoepfen
  assets/driver_lebi.glb     Lebi, ein Lebkuchenherz mit Zuckerguss-Gesicht, Aermchen und Band (Kartfarbe)
  assets/driver_finster.glb  Braumeister Finster: schwarze Tracht mit Umhang, breiter schwarzer Hut, dunkler Bart,
                             rot gluehender Krug am Guertel - eigene Figur (kein Helm, keine Maske)
Material "CapPaint" wird im Spiel in der Kartfarbe eingefaerbt. Laeuft in der offenen Blender-Sitzung (Blender-MCP).
"""
import sys, math, json, pathlib, importlib
sys.path.append(r'C:/Users/User/Documents/Playground/mushroom-rally/art/lib')
import bpy, bmesh
from mathutils import Vector
import blib
importlib.reload(blib)
from blib import *

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
report = {}


def cone(base, tip, r, seg=12):
    return cyl(base, tip, r, 0.0, seg)


def mats(extra):
    base = {
        'Skin': material('Skin', (.98, .74, .6, 1), .6),
        'Cheek': material('Cheek', (1, .45, .5, 1), .6),
        'Eye': material('Eye', (.02, .02, .03, 1), .25),
        'White': material('White', (.96, .96, .94, 1), .5),
        'Dark': material('Dark', (.05, .05, .06, 1), .5),
        'CapPaint': material('CapPaint', (.85, .1, .07, 1), .45),
        'Gold': material('Gold', (1, .74, .22, 1), .3, .85),
    }
    base.update(extra)
    use_materials(base)


def face(p, y, z, r, smile=True, lashes=False, brows='Dark'):
    """Augen, Pupillen-Glanz, Wangen, Nase, Mund auf einer Kopfkugel (Mitte (0, y, 0), Radius r)."""
    for sx in (-1, 1):
        p.add('Eye', sphere((sx * r * .36, y + r * .12, z + r * .86), r * .15, (1, 1.25, .6), 12, 8))
        p.add('White', sphere((sx * r * .33, y + r * .2, z + r * .96), r * .05, (1, 1, 1), 6, 4))
        p.add('Cheek', sphere((sx * r * .55, y - r * .12, z + r * .76), r * .12, (1, .7, .4), 8, 6))
        p.add(brows, rbox((sx * r * .38, y + r * .42, z + r * .88), (r * .34, r * .07, r * .06), .02, 1, rot=(0, 0, -sx * .18)))
        if lashes:
            p.add('Dark', rbox((sx * r * .5, y + r * .3, z + r * .84), (r * .12, r * .03, r * .04), 0, 1, rot=(0, 0, -sx * .6)))
    p.add('Skin', sphere((0, y - r * .04, z + r * .98), r * .13, (1, .9, 1), 8, 6))
    if smile:
        p.add('Dark', tube([(-r * .28, y - r * .28, z + r * .86), (0, y - r * .42, z + r * .93), (r * .28, y - r * .28, z + r * .86)], r * .035, 5))


def seated_body(p, torso, legs, socks, shoes, sleeve, shirt_top=None):
    """Sitzender Koerper: Rumpf, Oberschenkel nach vorn, Unterschenkel nach unten, Arme zum Lenkrad."""
    p.add(torso, cyl((0, .05, 0), (0, .78, 0), .36, .31, 20))
    if shirt_top:
        p.add(shirt_top, cyl((0, .66, 0), (0, .86, 0), .31, .22, 20))
    for sx in (-1, 1):
        p.add(legs, tube([(sx * .17, .12, .05), (sx * .19, .14, .38), (sx * .2, .1, .52)], .15, 10))      # Oberschenkel
        p.add(socks, tube([(sx * .2, .08, .55), (sx * .21, -.2, .6), (sx * .21, -.42, .62)], .115, 10))  # Unterschenkel
        p.add(shoes, rbox((sx * .21, -.5, .7), (.2, .14, .34), .06, 2))
        p.add(sleeve, tube([(sx * .34, .74, 0), (sx * .38, .6, .2), (sx * .3, .52, .42)], .1, 10))        # Oberarm
        p.add('Skin', tube([(sx * .3, .52, .42), (sx * .23, .47, .56)], .075, 8))                           # Unterarm
        p.add('Skin', sphere((sx * .2, .46, .62), .09, (1, 1, 1), 10, 8))                                   # Hand


# ================================================================== Sepp in Lederhosn
blib.init_scene('R56_Sepp')
mats({'Leather': material('Leather', (.36, .22, .12, 1), .7), 'LeatherDark': material('LeatherDark', (.2, .12, .06, 1), .7),
      'Shirt': material('Shirt', (.97, .96, .93, 1), .6), 'Check': material('Check', (.3, .55, .85, 1), .6),
      'Felt': material('Felt', (.2, .32, .18, 1), .85), 'Beard': material('Beard', (.42, .26, .14, 1), .8),
      'Sock': material('Sock', (.93, .9, .82, 1), .8), 'Horn': material('Horn', (.85, .82, .7, 1), .6)})
p = Part('Sepp')
seated_body(p, 'Shirt', 'Leather', 'Sock', 'LeatherDark', 'Shirt')
p.add('Leather', cyl((0, .02, 0), (0, .36, 0), .38, .37, 20))                        # Hosenbund und Hosenboden
for sx in (-1, 1):
    p.add('Leather', tube([(sx * .18, .36, .3), (sx * .16, .82, .26), (sx * .13, .84, .0), (sx * .16, .8, -.3)], .045, 5))  # Hosentraeger
    p.add('Sock', torus((sx * .2, .1, .52), .15, .04, (0, 0, 1), 12, 4))            # Kniebund
p.add('Leather', rbox((0, .6, .31), (.34, .09, .04), .02, 1))                        # Querlatz
p.add('White', sphere((0, .6, .34), .045, (1, 1, .4), 8, 5))                         # Edelweiss
for k in range(5):
    a = k * 2 * math.pi / 5
    p.add('White', sphere((math.cos(a) * .06, .6 + math.sin(a) * .06, .335), .035, (1, 1, .4), 6, 4))
for y in (.2, .45, .7):                                                              # Karo-Knopfleiste
    p.add('Horn', sphere((0, y, .35), .03, (1, 1, .6), 6, 4))
p.add('Skin', sphere((0, 1.2, 0), .38, (1, .96, 1), 20, 14))                         # Kopf
face(p, 1.2, 0, .38)
p.add('Beard', tube([(-.2, 1.1, .33), (-.05, 1.12, .37), (0, 1.11, .37), (.05, 1.12, .37), (.2, 1.1, .33)], .05, 6))  # Schnauzer
for sx in (-1, 1):
    p.add('Skin', sphere((sx * .37, 1.2, .0), .08, (.6, 1, 1), 8, 6))                # Ohren
p.add('Beard', sphere((0, 1.3, -.05), .37, (1.02, .9, 1.02), 16, 10))                # Haare hinten (unter dem Hut)
p.add('Felt', cyl((0, 1.45, 0), (0, 1.5, 0), .52, .52, 24))                          # Hutkrempe
p.add('Felt', cyl((0, 1.5, 0), (0, 1.84, 0), .31, .25, 20))                          # Hutkrone
p.add('CapPaint', cyl((0, 1.52, 0), (0, 1.6, 0), .315, .31, 20))                     # Hutband in Kartfarbe
p.add('Horn', cone((-.18, 1.62, -.2), (-.3, 2.05, -.34), .07, 8))                    # Gamsbart
p.add('Beard', cone((-.2, 1.62, -.22), (-.28, 1.98, -.4), .1, 8))
p.finish()
report['sepp'] = export_glb(ROOT / 'assets' / 'driver_sepp.glb')

# ================================================================== Vroni im Dirndl
blib.init_scene('R56_Vroni')
mats({'Blouse': material('Blouse', (.98, .97, .95, 1), .6), 'Skirt': material('Skirt', (.12, .28, .5, 1), .75),
      'Apron': material('Apron', (.95, .8, .86, 1), .7), 'Hair': material('Hair', (.95, .78, .4, 1), .7),
      'Lace': material('Lace', (.99, .99, .97, 1), .5), 'Sock': material('Sock', (.98, .97, .95, 1), .8),
      'ShoeRed': material('ShoeRed', (.55, .08, .08, 1), .5)})
p = Part('Vroni')
seated_body(p, 'CapPaint', 'Skirt', 'Sock', 'ShoeRed', 'Blouse', shirt_top='Blouse')
p.add('Skirt', cyl((0, -.05, .12), (0, .4, .02), .56, .38, 24))                       # weiter Rock ueber den Knien
p.add('Apron', rbox((0, .15, .42), (.46, .5, .06), .05, 2, rot=(-.35, 0, 0)))        # Schuerze
p.add('Apron', tube([(.3, .4, .22), (.34, .42, .08), (.36, .32, .0)], .04, 6))       # Schleife rechts (vergeben)
p.add('Apron', sphere((.33, .42, .2), .06, (1, .7, .6), 8, 6))
for sx in (-1, 1):
    p.add('Blouse', sphere((sx * .36, .76, 0), .16, (1, .9, 1), 12, 8))              # Puffaermel
    p.add('Lace', torus((sx * .38, .62, .12), .09, .025, (sx * .3, -.8, .5), 10, 4))
    p.add('Gold', sphere((sx * .12, .55, .3), .03, (1, 1, .6), 6, 4))                 # Mieder-Haken
p.add('Lace', torus((0, .84, .05), .24, .03, (0, 1, .2), 20, 4))                     # Ausschnitt-Spitze
p.add('Skin', sphere((0, 1.2, 0), .36, (1, .98, 1), 20, 14))
face(p, 1.2, 0, .36, lashes=True, brows='Hair')
p.add('Cheek', sphere((0, 1.03, .33), .04, (1.4, .6, .6), 8, 4))                     # Lippen
p.add('Hair', sphere((0, 1.3, -.06), .37, (1.03, .92, 1.02), 18, 12))                # Haar
p.add('Hair', torus((0, 1.47, -.02), .27, .085, (0, 1, .15), 20, 8))                 # Zopfkranz
for sx in (-1, 1):
    p.add('Hair', tube([(sx * .3, 1.2, -.12), (sx * .36, .95, -.14), (sx * .34, .72, -.08)], .065, 8))  # Zoepfe
    p.add('CapPaint', sphere((sx * .34, .7, -.08), .06, (1, 1, 1), 8, 6))            # Zopfbaender
p.add('CapPaint', sphere((.2, 1.5, .12), .07, (1, 1, 1), 8, 6))                      # Bluete im Haar
p.finish()
report['vroni'] = export_glb(ROOT / 'assets' / 'driver_vroni.glb')

# ================================================================== Lebi, das Lebkuchenherz
blib.init_scene('R56_Lebi')
mats({'Ginger': material('Ginger', (.55, .28, .1, 1), .75), 'Icing': material('Icing', (1, .98, .95, 1), .45),
      'IcingPink': material('IcingPink', (1, .45, .7, 1), .45), 'IcingBlue': material('IcingBlue', (.35, .7, 1, 1), .45)})


def heart_pts(s, n=48):
    pts = []
    for i in range(n):
        u = 2 * math.pi * i / n
        x = 16 * math.sin(u) ** 3
        y = 13 * math.cos(u) - 5 * math.cos(2 * u) - 2 * math.cos(3 * u) - math.cos(4 * u)
        pts.append((x / 17 * s, y / 17 * s))
    return pts


def heart_slab(s, z0, z1, cy):
    pts = heart_pts(s)
    def b(bm):
        a = [bm.verts.new(G(x, cy + y, z0)) for x, y in pts]
        c = [bm.verts.new(G(x, cy + y, z1)) for x, y in pts]
        fs = [bm.faces.new(list(reversed(a))), bm.faces.new(c)]
        for i in range(len(pts)):
            j = (i + 1) % len(pts)
            fs.append(bm.faces.new((a[i], a[j], c[j], c[i])))
        bmesh.ops.recalc_face_normals(bm, faces=fs)
    return b


p = Part('Lebi')
p.add('Ginger', heart_slab(.72, -.12, .12, .95), smooth=False)                        # Herz aufrecht, Gesicht nach +z
p.add('Icing', tube([(x * .9, .95 + y * .9, .13) for x, y in heart_pts(.72, 40)] + [(heart_pts(.72, 40)[0][0] * .9, .95 + heart_pts(.72, 40)[0][1] * .9, .13)], .03, 5, caps=False))
for sx in (-1, 1):
    p.add('Icing', sphere((sx * .22, 1.08, .13), .1, (1, 1.2, .35), 10, 6))           # Augen (Zuckerguss)
    p.add('Eye', sphere((sx * .22, 1.06, .17), .05, (1, 1.2, .5), 8, 6))
    p.add('IcingPink', sphere((sx * .38, .9, .13), .07, (1, 1, .35), 8, 5))           # Wangen
p.add('Icing', tube([(-.22, .86, .13), (0, .76, .14), (.22, .86, .13)], .03, 5))      # Laecheln
for k, c in enumerate(['IcingBlue', 'IcingPink', 'IcingBlue', 'IcingPink']):          # Zuckerguss-Punkte am Rand
    a = -.9 + k * .6
    p.add(c, sphere((math.sin(a) * .5, .5 + math.cos(a) * .1, .13), .04, (1, 1, .4), 6, 4))
p.add('CapPaint', tube([(-.26, 1.52, 0), (0, 1.9, -.02), (.26, 1.52, 0)], .035, 6))  # Band zum Umhaengen (Kartfarbe)
for sx in (-1, 1):
    p.add('Ginger', tube([(sx * .5, .9, .02), (sx * .4, .62, .3), (sx * .22, .5, .56)], .075, 8))  # Aermchen
    p.add('Icing', sphere((sx * .2, .48, .6), .08, (1, 1, 1), 8, 6))                  # Zuckerguss-Handschuhe
    p.add('Ginger', tube([(sx * .16, .28, .05), (sx * .2, .2, .4), (sx * .21, -.3, .6)], .08, 8))  # Beinchen
    p.add('Icing', rbox((sx * .21, -.4, .68), (.17, .12, .28), .05, 2))
p.finish()
report['lebi'] = export_glb(ROOT / 'assets' / 'driver_lebi.glb')

# ================================================================== Braumeister Finster
blib.init_scene('R56_Finster')
mats({'Black': material('Black', (.035, .035, .045, 1), .55), 'Cape': material('Cape', (.05, .04, .06, 1), .7),
      'CapeIn': material('CapeIn', (.35, .03, .05, 1), .6), 'Silver': material('Silver', (.8, .82, .86, 1), .3, .9),
      'Beard': material('Beard', (.08, .07, .07, 1), .8), 'Pale': material('Pale', (.9, .82, .78, 1), .6),
      'Glow': material('Glow', (1, .15, .1, 1), .3, 0, (1, .12, .06, 1), 5.0)})
p = Part('Finster')
seated_body(p, 'Black', 'Black', 'Black', 'Black', 'Black')
for y in (.25, .42, .59):
    p.add('Silver', sphere((0, y, .35), .035, (1, 1, .6), 8, 5))                     # Silberknoepfe
p.add('Cape', cyl((0, .1, -.24), (0, .9, -.12), .55, .38, 20))                       # Umhang hinter den Schultern
p.add('CapeIn', cyl((0, .12, -.2), (0, .88, -.09), .5, .34, 20))
p.add('Black', torus((0, .86, 0), .32, .07, (0, 1, 0), 20, 5))                        # Kragen
p.add('Pale', sphere((0, 1.2, 0), .37, (1, .98, 1), 20, 14))
for sx in (-1, 1):
    p.add('Glow', sphere((sx * .13, 1.25, .33), .05, (1.3, .7, .5), 8, 6))            # gluehende Augen
    p.add('Beard', rbox((sx * .14, 1.36, .34), (.2, .05, .05), .01, 1, rot=(0, 0, sx * .35)))  # finstere Brauen
p.add('Beard', cone((0, 1.08, .26), (0, .78, .3), .26, 12))                           # Spitzbart
p.add('Beard', tube([(-.18, 1.12, .32), (0, 1.1, .36), (.18, 1.12, .32)], .045, 6))
p.add('Black', cyl((0, 1.44, 0), (0, 1.49, 0), .62, .62, 28))                         # breite Krempe
p.add('Black', cyl((0, 1.49, 0), (0, 1.98, 0), .32, .3, 20))                          # hoher Hut
p.add('CapPaint', cyl((0, 1.51, 0), (0, 1.6, 0), .325, .32, 20))                      # Hutband (Kartfarbe)
p.add('Silver', cyl((.36, .2, .08), (.36, .5, .08), .1, .1, 12))                      # Krug am Guertel
p.add('Glow', cyl((.36, .22, .08), (.36, .46, .08), .085, .085, 12))
p.add('Silver', torus((.47, .35, .08), .08, .02, (0, 0, 1), 10, 4))
p.finish()
report['finster'] = export_glb(ROOT / 'assets' / 'driver_finster.glb')

(ROOT / 'art' / 'r56' / 'drivers_report.json').write_text(json.dumps(report, indent=1), encoding='utf-8')
print('REPORT', json.dumps(report))
