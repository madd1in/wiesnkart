"""Wiesn Kart R54: Hindernisse neu gestaltet (eigene Entwuerfe, Oktoberfest-Thema, keine Anlehnung an fremde Figuren).
Ersetzt art/r44/create_hazards.py - gleiche Objekt- und Materialnamen, damit der Spielcode unveraendert bleibt.
Export assets/hazards.glb (ohne Materialverschmelzung geladen, Teile per Objektname):
  HZ_Stamper        Hau-den-Lukas-Hammer: Holzklotz mit Eisenbaendern und Messingplakette, dicker Stiel nach oben
                    (kein Gesicht, keine Stacheln) - stampft auf die Bahn
  HZ_Pipe           Bierfass, aufrecht: gebauchte Dauben, drei Eisenreifen, offener Deckel (Deko, Hindernis, Pflanzen-Topf)
  HZ_PipeRing       grosser Fassring fuer die befahrbare Einfahrt (Holzdauben mit Eisenreifen)
  HZ_PlantStem      Stiel mit Blaettern der Fliegenfalle
  HZ_PlantJawTop    obere Fangblatt-Haelfte (Drehpunkt am Scharnier hinten) mit Wimpern am Rand
  HZ_PlantJawBot    untere Fangblatt-Haelfte mit Wimpern
  HZ_Statue         bayerischer Steinloewe (Buste mit Maehne), gluehende Augen, offenes Maul (spuckt Feuerbaelle)
  HZ_Cannon         Roehrenkanone auf Steinsockel, Muendung nach +z
  HZ_Missile        gluehende Kanonenkugel mit Funkenschweif (fliegt nach +z)
  HZ_Sign           Warnschild "Achtung Lava"
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
blib.init_scene('R54_Hazards')
use_materials({
    'StonePaint': material('StonePaint', (.55, .36, .2, 1), .75),      # im Spiel eingefaerbt (Holz des Hammers / Loewe)
    'StoneDark': material('StoneDark', (.2, .21, .25, 1), .85),
    'White': material('White', (.97, .97, .95, 1), .45),
    'Dark': material('Dark', (.06, .06, .08, 1), .5, .2),
    'Void': material('Void', (.03, .02, .015, 1), 1),
    'Gold': material('Gold', (1, .74, .2, 1), .3, .85),
    'Iron': material('Iron', (.16, .16, .18, 1), .45, .75),
    'PipePaint': material('PipePaint', (.55, .35, .18, 1), .7),         # Fassdauben, im Spiel eingefaerbt
    'PlantPaint': material('PlantPaint', (.3, .66, .22, 1), .55),       # Fangblatt aussen, im Spiel eingefaerbt
    'PlantStem': material('PlantStem', (.26, .56, .2, 1), .6),
    'Pink': material('Pink', (.86, .2, .22, 1), .5),                    # Fangblatt innen (rot wie die echte Pflanze)
    'Bone': material('Bone', (.96, .9, .74, 1), .6),
    'LavaGlow': material('LavaGlow', (1, .45, .06, 1), .4, 0, (1, .38, .04, 1), 4.0),
    'WoodPaint': material('WoodPaint', (.55, .35, .18, 1), .8),
    'WoodDark': material('WoodDark', (.3, .19, .1, 1), .8),
    'SignYellow': material('SignYellow', (1, .8, .1, 1), .5),
    'SignRed': material('SignRed', (.9, .12, .1, 1), .5),
    'SignOrange': material('SignOrange', (1, .45, .05, 1), .5, 0, (1, .35, .02, 1), .8),
    'BavBlue': material('BavBlue', (.1, .45, .9, 1), .5),
    # R56 Masskrug-Stampfer
    'Beer': material('Beer', (1, .62, .08, 1), .2, 0, (1, .5, .05, 1), .35),
    'Glass': material('Glass', (.86, .93, .95, 1), .08, .1),
    'Foam': material('Foam', (1, .99, .94, 1), .75),
    'Smile': material('Smile', (.12, .06, .03, 1), .5),
    'Blush': material('Blush', (1, .45, .5, 1), .6),
})

def cone(base, tip, r, seg=4):
    return cyl(base, tip, r, 0.0, seg)

def barrel(part, key, r0, r1, y0, y1, seg=28, hoops=(), hoop_key='Iron'):
    """Gebauchtes Fass um Spiel-y: Radius r0 an den Enden, r1 in der Mitte; Reifen bei den Hoehen hoops."""
    secs = []
    for k in range(9):
        u = k / 8
        y = y0 + (y1 - y0) * u
        r = r0 + (r1 - r0) * math.sin(math.pi * u)
        secs.append((y, r))
    def b(bm):
        rings = [[bm.verts.new(G(math.cos(2 * math.pi * i / seg) * r, y, math.sin(2 * math.pi * i / seg) * r)) for i in range(seg)] for y, r in secs]
        fs = []
        for a, c in zip(rings, rings[1:]):
            for i in range(seg):
                j = (i + 1) % seg
                fs.append(bm.faces.new((a[i], a[j], c[j], c[i])))
        for f in fs:
            f.normal_update()
            cen = f.calc_center_median()
            if Vector((cen.x, cen.y, 0)).dot(f.normal) < 0:
                f.normal_flip()
    part.add(key, b)
    # Daubenfugen als feine dunkle Linien
    for i in range(0, seg, 2):
        a = 2 * math.pi * i / seg
        part.add('WoodDark', tube([(math.cos(a) * (r0 + (r1 - r0) * math.sin(math.pi * u)) * 1.004, y0 + (y1 - y0) * u, math.sin(a) * (r0 + (r1 - r0) * math.sin(math.pi * u)) * 1.004) for u in [k / 8 for k in range(9)]], .012, 3, caps=False))
    for y in hoops:
        u = (y - y0) / (y1 - y0)
        r = r0 + (r1 - r0) * math.sin(math.pi * u)
        part.add(hoop_key, torus((0, y, 0), r * 1.01, .07, (0, 1, 0), seg, 5))

# ---------------------------------------------------------------- Riesen-Masskrug mit Smiley (Stampfer, R56)
# Nutzerwunsch "statt Stampfer riesen Bierkrug Mass mit Smiley-Gesicht": gleiche Grundflaeche wie der alte Block
# (4,2 x 3,2 m, Hoehe 4,4 m bis zur Schaumkrone), Gesicht auf beiden Seiten zur Fahrbahn
st = Part('HZ_Stamper')
st.add('Glass', cyl((0, 0, 0), (0, .45, 0), 1.72, 1.72, 32))                 # dicker Glasboden
st.add('Beer', cyl((0, .45, 0), (0, 3.9, 0), 1.64, 1.64, 32))               # Bier
st.add('Glass', torus((0, 3.92, 0), 1.64, .1, (0, 1, 0), 32, 6))            # Glasrand
for k in range(12):                                                         # Glas-Noppen (Masskrug-Dellen)
    a = k * math.pi / 6
    for y in (1.3, 2.3, 3.2):
        if abs(math.sin(a)) > .82 and y > 1:                                # Gesichtsseiten frei lassen
            continue
        st.add('Glass', sphere((math.cos(a) * 1.63, y, math.sin(a) * 1.63), .26, (.35, 1, 1), 8, 6))
st.add('Glass', tube([(1.62, 3.2, 0), (2.55, 3.1, 0), (2.7, 2.2, 0), (2.5, 1.2, 0), (1.62, 1.1, 0)], .26, 10))  # Henkel
rnd = __import__('random').Random(56)
for k in range(22):                                                         # ueberquellende Schaumkrone
    a = k * 2 * math.pi / 22
    rr = 1.45 + rnd.uniform(-.1, .25)
    st.add('Foam', sphere((math.cos(a) * rr, 4.0 + rnd.uniform(0, .25), math.sin(a) * rr), .5 + rnd.uniform(0, .18), (1, .8, 1), 10, 7))
st.add('Foam', sphere((0, 4.1, 0), 1.35, (1, .45, 1), 18, 10))
for k in range(4):                                                          # Schaumtropfen laufen am Glas herab
    a = .6 + k * 1.55
    st.add('Foam', tube([(math.cos(a) * 1.66, 3.95, math.sin(a) * 1.66), (math.cos(a) * 1.7, 3.4 - k * .15, math.sin(a) * 1.7)], .16, 6))
for zf in (-1, 1):                                                          # Smiley vorn und hinten
    z = zf * 1.62
    for sx in (-1, 1):
        st.add('Smile', sphere((sx * .5, 2.75, z), .26, (1, 1.35, .45), 12, 8))
        st.add('Foam', sphere((sx * .44, 2.88, z + zf * .1), .08, (1, 1, .5), 6, 4))
        st.add('Blush', sphere((sx * .95, 2.2, z * .97), .2, (1, .6, .35), 8, 6))
    st.add('Smile', tube([(-.75, 2.05, z), (-.4, 1.62, z * 1.02), (0, 1.5, z * 1.03), (.4, 1.62, z * 1.02), (.75, 2.05, z)], .1, 6))
st.finish()

# ---------------------------------------------------------------- Bierfass (statt Roehre), Oberkante bei y = 3.2
pp = Part('HZ_Pipe')
barrel(pp, 'PipePaint', 1.25, 1.5, 0, 3.2, 28, hoops=(.35, 1.1, 2.1, 2.85))
pp.add('Void', cyl((0, 3.05, 0), (0, 3.16, 0), 1.18, 1.18, 28))
pp.add('WoodDark', torus((0, 3.18, 0), 1.2, .08, (0, 1, 0), 28, 5))
pp.add('Gold', cyl((0, 1.6, 1.46), (0, 1.6, 1.5), .22, .22, 12))         # Zapfhahn-Loch mit Messingring
pp.finish()

# Fassring fuer die befahrbare Einfahrt: Ring um Spiel-z (Innenradius 8,6 m, Strasse ist 15,2 m breit)
pr = Part('HZ_PipeRing')
def ring_z(z0, z1, ri, ro, seg=40):
    def b(bm):
        rings = []
        for z in (z0, z1):
            for r in (ri, ro):
                rings.append([bm.verts.new(G(math.cos(2 * math.pi * i / seg) * r, math.sin(2 * math.pi * i / seg) * r, z)) for i in range(seg)])
        (a_in, a_out, b_in, b_out) = rings
        fs = []
        for i in range(seg):
            j = (i + 1) % seg
            fs.append(bm.faces.new((a_out[i], a_out[j], b_out[j], b_out[i])))
            fs.append(bm.faces.new((a_in[j], a_in[i], b_in[i], b_in[j])))
            fs.append(bm.faces.new((a_in[i], a_in[j], a_out[j], a_out[i])))
            fs.append(bm.faces.new((b_in[j], b_in[i], b_out[i], b_out[j])))
        bmesh.ops.recalc_face_normals(bm, faces=fs)
    return b
pr.add('PipePaint', ring_z(-.9, .9, 8.6, 10.0))
pr.add('Iron', ring_z(-1.0, -.8, 9.9, 10.12))
pr.add('Iron', ring_z(.8, 1.0, 9.9, 10.12))
for k in range(20):                                           # Daubenfugen auf der Stirnseite
    a = 2 * math.pi * k / 20
    for zf in (-.91, .91):
        pr.add('WoodDark', rbox((math.cos(a) * 9.3, math.sin(a) * 9.3, zf), (.06, 1.35, .02), 0, 1, rot=(0, 0, a)), smooth=False)
pr.finish()

# ---------------------------------------------------------------- Fliegenfalle (steht auf dem Fassrand, y=0 = Oberkante)
ps = Part('HZ_PlantStem')
ps.add('PlantStem', tube([(0, 0, 0), (0, .7, .06), (.05, 1.4, .1), (0, 2.1, 0)], .16, 10))
for sx in (-1, 1):                                            # schlanke, gezahnte Blaetter am Fuss
    ps.add('PlantStem', sphere((sx * .7, .35, 0), 1, (.85, .07, .28), 12, 6, rot=Matrix.Rotation(sx * .5, 3, 'Y')))
ps.finish()
HING = (0, 2.3, -.85)
def jaw(name, upper):
    part = Part(name)
    sgn = 1 if upper else -1
    # Fangblatt: flache, nierenfoermige Schale (Halbkugel stark abgeflacht), aussen gruen, innen rot
    def lobe(bm):
        before = set(bm.verts)
        bmesh.ops.create_uvsphere(bm, u_segments=22, v_segments=10, radius=1)
        new = [v for v in bm.verts if v not in before]
        for v in new:
            if (v.co.z < 0) == upper:
                v.co.z = 0
        xf(bm, new, Matrix.Translation(G(0, 2.3, .05)) @ Matrix.Diagonal((1.05, 1.0, .42, 1)))
    part.add('PlantPaint', lobe)
    part.add('Pink', cyl((0, 2.3 + sgn * .015, .05), (0, 2.3 + sgn * .045, .05), .98, .98, 22))
    # Wimpern entlang des Randes (lange, duenne Borsten nach aussen und zur Gegenseite gebogen)
    for k in range(-5, 6):
        a = k * .26
        x, z = math.sin(a) * 1.02, .05 + math.cos(a) * 1.0
        part.add('PlantStem', cone((x, 2.3, z), (x * 1.32, 2.3 + sgn * .5, .05 + (z - .05) * 1.32), .045, 5), smooth=False)
    # feine Sinneshaare auf der Innenseite
    for (x, z) in ((-.3, .35), (.3, .35), (0, .1)):
        part.add('PlantStem', cyl((x, 2.3 + sgn * .03, z), (x, 2.3 + sgn * .22, z), .025, .015, 4))
    return part.finish(origin=HING)
jaw('HZ_PlantJawTop', True)
jaw('HZ_PlantJawBot', False)

# ---------------------------------------------------------------- Bayerischer Steinloewe (etwa 12 m hoch)
sa = Part('HZ_Statue')
sa.add('StoneDark', rbox((0, 1.2, 0), (7.4, 2.4, 6.4), .3))
sa.add('LavaGlow', rbox((0, 2.45, 0), (7.0, .12, 6.0), .03, 1))
sa.add('StonePaint', rbox((0, 4.3, -.4), (5.6, 3.8, 4.2), .9, 2))                 # Brust
for sx in (-1, 1):                                                                # Vorderpranken
    sa.add('StonePaint', rbox((sx * 1.7, 3.0, 2.3), (1.5, 1.4, 2.0), .5, 2))
    for k in range(3):
        sa.add('StonePaint', sphere((sx * 1.7 + (k - 1) * .42, 2.6, 3.3), .28, (1, .8, 1), 10, 6))
# Maehne: Kranz aus dicken Locken um den Kopf
for k in range(16):
    a = 2 * math.pi * k / 16
    sa.add('StonePaint', sphere((math.cos(a) * 2.5, 8.2 + math.sin(a) * 2.4, -.2), .95, (1, 1, .8), 12, 8))
sa.add('StonePaint', sphere((0, 8.2, -.6), 2.4, (1.15, 1.1, 1), 20, 12))           # Maehnenkoerper hinter dem Kopf
sa.add('StonePaint', sphere((0, 8.1, .9), 1.75, (1, 1, .95), 20, 12))              # Kopf
sa.add('StonePaint', sphere((0, 7.45, 2.35), .95, (1.1, .75, .9), 14, 8))          # Schnauze
sa.add('Dark', sphere((0, 7.9, 3.1), .28, (1.3, .8, .6), 10, 6))                  # Nase
for sx in (-1, 1):
    sa.add('StonePaint', sphere((sx * 1.3, 9.75, .6), .55, (1, 1, .6), 10, 6))    # Ohren
    sa.add('LavaGlow', sphere((sx * .72, 8.55, 2.35), .3, (1, .8, .5), 10, 6))    # Augen
    sa.add('StoneDark', rbox((sx * .72, 8.95, 2.35), (.8, .18, .4), .06, 1))
# offenes Maul mit Glut (spuckt Feuerbaelle) - runde Eckzaehne, keine Hoerner/Stacheln
sa.add('LavaGlow', rbox((0, 6.75, 2.6), (1.3, .55, 1.0), .2))
sa.add('StonePaint', rbox((0, 6.3, 2.4), (1.6, .45, 1.3), .2))
for sx in (-1, 1):
    sa.add('Bone', cone((sx * .45, 7.05, 3.05), (sx * .45, 6.7, 3.1), .1, 6), smooth=False)
sa.finish()

# ---------------------------------------------------------------- Roehrenkanone und Kanonenkugel
ca = Part('HZ_Cannon')
ca.add('StoneDark', rbox((0, 1.0, 0), (3.2, 2.0, 3.4), .25))
for x in (-1.45, 1.45):
    for z in (-1.55, 1.55):
        ca.add('Gold', sphere((x, 2.0, z), .16, (1, 1, 1), 8, 5))
ca.add('Dark', cyl((0, 2.75, -1.7), (0, 2.75, 1.6), 1.12, 1.12, 24))
ca.add('Dark', cyl((0, 2.75, 1.55), (0, 2.75, 2.15), 1.34, 1.34, 24))
ca.add('Void', cyl((0, 2.75, 2.12), (0, 2.75, 2.18), .9, .9, 24))
ca.add('Gold', torus((0, 2.75, .4), 1.13, .08, (0, 0, 1), 24, 6))
ca.add('Gold', torus((0, 2.75, -1.2), 1.13, .08, (0, 0, 1), 24, 6))
for sx in (-1, 1):                                                                # Zapfen-Lager statt Augen
    ca.add('Gold', cyl((sx * 1.1, 2.75, -.4), (sx * 1.3, 2.75, -.4), .3, .3, 16))
ca.finish()
mi = Part('HZ_Missile')
mi.add('Dark', sphere((0, 0, 0), .85, (1, 1, 1), 20, 12))
for k in range(6):                                                                # gluehende Risse
    a = k * math.pi / 3
    mi.add('LavaGlow', tube([(math.cos(a) * .86, math.sin(a) * .86, -.3), (math.cos(a + .3) * .87, math.sin(a + .3) * .87, .1), (math.cos(a + .1) * .86, math.sin(a + .1) * .86, .45)], .045, 4))
mi.add('LavaGlow', cone((0, 0, -.7), (0, 0, -1.9), .55, 10))                    # Funkenschweif nach hinten
mi.finish()

# ---------------------------------------------------------------- Warnschild "Achtung Lava" (Tafel zeigt nach +z)
sg = Part('HZ_Sign')
for x in (-1.15, 1.15):
    sg.add('WoodPaint', rbox((x, 1.35, -.05), (.22, 2.7, .22), .04, 1))
sg.add('Dark', rbox((0, 2.55, 0), (3.3, 2.15, .14), .08))
sg.add('SignYellow', rbox((0, 2.55, .03), (3.1, 1.95, .14), .07))
tri = [(-.62, 0), (.62, 0), (0, 1.08)]
def flat_poly(poly, z, key, ox=0, oy=0, depth=.03):
    def b(bm):
        vs0 = [bm.verts.new(G(ox + x, oy + y, z)) for x, y in poly]
        vs1 = [bm.verts.new(G(ox + x, oy + y, z + depth)) for x, y in poly]
        fs = [bm.faces.new(vs1), bm.faces.new(list(reversed(vs0)))]
        n = len(poly)
        for i in range(n):
            j = (i + 1) % n
            fs.append(bm.faces.new((vs0[i], vs0[j], vs1[j], vs1[i])))
        bmesh.ops.recalc_face_normals(bm, faces=fs)
    sg.add(key, b, smooth=False)
flat_poly(tri, .1, 'SignRed', -.55, 2.05)
flat_poly([(x * .72, y * .72 + .1) for x, y in tri], .12, 'White', -.55, 2.05)
sg.add('Dark', rbox((-.55, 2.62, .17), (.13, .42, .04), .02, 1))
sg.add('Dark', rbox((-.55, 2.3, .17), (.13, .12, .04), .02, 1))
for k in range(3):
    pts = [(i * .12, math.sin(i * .9 + k) * .08) for i in range(9)]
    band = pts + [(x, y - .12) for x, y in reversed(pts)]
    flat_poly(band, .1, 'SignOrange', .25, 2.2 + k * .28)
sg.finish()

tris = export_glb(ROOT / 'assets' / 'hazards.glb')
report = {'asset': 'hazards.glb', 'round': 'R54', 'source': 'art/r54/create_hazards.py', 'triangles': sum(tris.values()), 'parts': tris,
          'bytes': (ROOT / 'assets' / 'hazards.glb').stat().st_size}
(ROOT / 'art' / 'r54' / 'hazards_report.json').write_text(json.dumps(report, indent=1), encoding='utf-8')
print('REPORT', json.dumps(report))
