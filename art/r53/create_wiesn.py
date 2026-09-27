"""Mushroom Rally R53: Oktoberfest-Paket fuer den Neon-Pilzwald ("Pilz-Wiesn"), eigene Entwuerfe.
Export assets/wiesn.glb, Teile per Name (im Spiel ohne Materialverschmelzung geladen):
  WS_Gate         Wiesn-Tor zum Durchfahren: blau-weiss gewundene Pfosten, Balken mit Rautenmuster, Gluehbirnen-
                  kette, Schildtafel (Schrift im Spiel), Riesenbrezeln auf den Pfosten, Lebkuchenherz oben
  WS_CarouselBase Kettenkarussell, stehender Teil: Plattform, Zaun, gestreifte Mittelsaeule
  WS_CarouselTop  drehender Teil: blau-weisses Schirmdach mit Lichtern, 16 Ketten mit Sitzen (schraeg ausgeschwungen)
  WS_Stall        Wiesn-Bude: Holzhuette, gestreifte Markise, Theke, Lebkuchenherzen an Schnueren
  WS_Stein        Masskrug-Leuchtschild auf Pfahl (Bier leuchtet, Schaumkrone, Henkel)
  WS_Barrels      Bierfass-Pyramide (3-2-1) mit Eisenreifen
  WS_Bench        Biertisch-Garnitur (Tisch und zwei Baenke)
Koordinaten: Spielkoordinaten ueber blib.G (x rechts, y hoch, z vorwaerts), Ursprung jeweils Boden Mitte.
"""
import sys, math, json, pathlib, importlib
sys.path.append(r'C:/Users/User/Documents/Playground/mushroom-rally/art/lib')
import bpy, bmesh
from mathutils import Vector, Matrix
import blib
importlib.reload(blib)
from blib import *

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
blib.init_scene('R53_Wiesn')
use_materials({
    'BavBlue': material('BavBlue', (.08, .42, .92, 1), .45),
    'White': material('White', (.97, .97, .95, 1), .45),
    'Wood': material('WoodPaint', (.58, .38, .2, 1), .8),
    'DarkWood': material('DarkWood', (.3, .19, .11, 1), .8),
    'Iron': material('Iron', (.2, .2, .22, 1), .5, .7),
    'Gold': material('Gold', (1, .76, .22, 1), .3, .85),
    'Bulb': material('BulbGlow', (1, .9, .6, 1), .2, 0, (1, .82, .4, 1), 3.4),
    'NeonGold': material('NeonGold', (1, .8, .3, 1), .3, 0, (1, .72, .2, 1), 2.4),
    'NeonPink': material('NeonPink', (1, .3, .7, 1), .3, 0, (1, .25, .65, 1), 2.4),
    'Beer': material('BeerGlow', (1, .62, .08, 1), .25, 0, (1, .55, .05, 1), 2.2),
    'Foam': material('Foam', (1, .98, .92, 1), .6, 0, (1, .97, .9, 1), .6),
    'Ginger': material('Gingerbread', (.62, .35, .16, 1), .8),
    'Icing': material('Icing', (1, .97, .92, 1), .5),
    'Red': material('Red', (.88, .16, .14, 1), .5),
    'Green': material('Moss', (.3, .55, .26, 1), .9),
    'Sign': material('SignBoard', (.98, .95, .86, 1), .6),
    'Seat': material('SeatPaint', (.95, .3, .2, 1), .5),
})

def cone(base, tip, r, seg=12):
    return cyl(base, tip, r, 0.0, seg)

def striped_post(p, x, z, h, r, n=14, twist=True):
    for k in range(n):
        y0, y1 = k * h / n, (k + 1) * h / n
        p.add('BavBlue' if k % 2 == 0 else 'White', cyl((x, y0, z), (x, y1, z), r, r, 12))

def heart_shape(bm, s, z, depth, cx=0.0, cy=0.0):
    pts = []
    for i in range(36):
        u = 2 * math.pi * i / 36
        x = 16 * math.sin(u) ** 3
        y = 13 * math.cos(u) - 5 * math.cos(2 * u) - 2 * math.cos(3 * u) - math.cos(4 * u)
        pts.append((cx + x / 17 * s, cy + y / 17 * s))
    a = [bm.verts.new(G(x, y, z)) for x, y in pts]
    b = [bm.verts.new(G(x, y, z + depth)) for x, y in pts]
    fs = [bm.faces.new(list(reversed(a))), bm.faces.new(b)]
    for i in range(len(pts)):
        j = (i + 1) % len(pts)
        fs.append(bm.faces.new((a[i], a[j], b[j], b[i])))
    bmesh.ops.recalc_face_normals(bm, faces=fs)

def pretzel(p, cx, cy, cz, s=1.0, key='Ginger'):
    loop = []
    for i in range(49):
        u = 2 * math.pi * i / 48
        loop.append((cx + s * 1.35 * math.sin(u) * (1 + .25 * math.cos(u)), cy + s * (1.0 * math.cos(u) + .27 * math.cos(2 * u)), cz + s * .08 * math.sin(3 * u)))
    p.add(key, tube(loop, .22 * s, 8, caps=False))
    p.add(key, tube([(cx - .95 * s, cy + .5 * s, cz), (cx, cy - .4 * s, cz + .12 * s), (cx + .95 * s, cy + .5 * s, cz)], .2 * s, 8))

# ======================================================== Wiesn-Tor (Durchfahrt |x| < 11 m)
g = Part('WS_Gate')
for sx in (-1, 1):
    striped_post(g, sx * 12, 0, 11, .55, 16)
    g.add('DarkWood', cyl((sx * 12, 0, 0), (sx * 12, .6, 0), .9, .8, 12))
    pretzel(g, sx * 12, 13.1, 0, 1.15)
g.add('White', rbox((0, 10.4, 0), (25.2, 1.9, .9), .08, 1))
for k in range(26):                                            # Rautenmuster auf Vorder- und Rueckseite
    x = -12 + k * .96
    for zf in (-.47, .47):
        g.add('BavBlue' if k % 2 == 0 else 'White', rbox((x, 10.4, zf), (.66, .66, .06), 0, 1, rot=(0, 0, math.pi / 4)), smooth=False)
g.add('NeonGold', rbox((0, 9.42, 0), (25.2, .12, 1.0), .02, 1))
for k in range(31):                                            # Gluehbirnen unten am Balken
    g.add('Bulb', sphere((-12 + k * .8, 9.2, 0), .13, (1, 1, 1), 8, 6))
g.add('Sign', rbox((0, 12.6, 0), (10.5, 2.5, .35), .12, 1))       # Schildtafel, Schrift kommt im Spiel
g.add('BavBlue', rbox((0, 12.6, 0), (10.9, 2.9, .28), .12, 1))
for sx in (-1, 1):
    g.add('Wood', cyl((sx * 4.6, 11.3, 0), (sx * 4.6, 11.4, 0), .1, .1, 6))
g.add('Ginger', lambda bm: heart_shape(bm, 1.7, -.16, .3, 0, 15.2), smooth=False)
g.add('Icing', lambda bm: heart_shape(bm, 1.3, .16, .04, 0, 15.25), smooth=False)
g.add('NeonPink', lambda bm: heart_shape(bm, 1.55, .15, .03, 0, 15.22), smooth=False)
for sx in (-1, 1):                                              # Wimpel an den Pfosten
    for i in range(5):
        y = 8.6 - i * .9
        g.add('BavBlue' if i % 2 == 0 else 'White', xy_prism([(sx * 12.5, y), (sx * 12.5, y - .7), (sx * 13.6, y - .35)], -.02, .02), smooth=False)
g.finish()

# ======================================================== Kettenkarussell
cb = Part('WS_CarouselBase')
cb.add('DarkWood', cyl((0, 0, 0), (0, .5, 0), 7.6, 7.6, 32))
cb.add('White', cyl((0, .5, 0), (0, .62, 0), 7.3, 7.3, 32))
for k in range(24):
    a = 2 * math.pi * k / 24
    cb.add('Gold', cyl((math.cos(a) * 7.4, .5, math.sin(a) * 7.4), (math.cos(a) * 7.4, 1.5, math.sin(a) * 7.4), .06, .06, 5))
cb.add('Gold', torus((0, 1.5, 0), 7.4, .07, (0, 1, 0), 40, 5))
striped_post(cb, 0, 0, 9.4, .75, 12)
cb.add('Gold', cyl((0, 9.3, 0), (0, 9.8, 0), 1.0, 1.0, 16))
cb.finish()
ct = Part('WS_CarouselTop')                                     # Ursprung Nabe (0, 9.8, 0)
N = 16
for k in range(N):                                              # Schirmdach aus 16 Segmenten
    a0, a1 = 2 * math.pi * k / N, 2 * math.pi * (k + 1) / N
    def seg(bm, a0=a0, a1=a1):
        v = [bm.verts.new(G(0, 12.8, 0)), bm.verts.new(G(math.cos(a0) * 7.2, 10.2, math.sin(a0) * 7.2)), bm.verts.new(G(math.cos(a1) * 7.2, 10.2, math.sin(a1) * 7.2))]
        w = [bm.verts.new(G(0, 12.6, 0)), bm.verts.new(G(math.cos(a0) * 7.0, 10.0, math.sin(a0) * 7.0)), bm.verts.new(G(math.cos(a1) * 7.0, 10.0, math.sin(a1) * 7.0))]
        fs = [bm.faces.new(v), bm.faces.new(list(reversed(w))), bm.faces.new((v[1], v[2], w[2], w[1])), bm.faces.new((v[0], v[1], w[1], w[0])), bm.faces.new((v[2], v[0], w[0], w[2]))]
        fix_normals(bm, fs, Vector((0, 0, 11)))
    ct.add('BavBlue' if k % 2 == 0 else 'White', seg, smooth=False)
    am = (a0 + a1) / 2
    ct.add('Bulb', sphere((math.cos(a0) * 7.25, 10.05, math.sin(a0) * 7.25), .16, (1, 1, 1), 8, 6))
ct.add('Gold', cone((0, 12.7, 0), (0, 14.6, 0), .7, 12))
ct.add('NeonPink', sphere((0, 14.8, 0), .35, (1, 1, 1), 10, 8))
ct.add('Gold', torus((0, 10.1, 0), 7.25, .09, (0, 1, 0), 48, 5))
for k in range(N):                                              # Ketten und Sitze, 28 Grad ausgeschwungen
    a = 2 * math.pi * (k + .5) / N
    ca, sa = math.cos(a), math.sin(a)
    top = (ca * 6.4, 10.0, sa * 6.4)
    tilt = math.radians(28)
    L = 5.2
    bot = (ca * (6.4 + math.sin(tilt) * L), 10.0 - math.cos(tilt) * L, sa * (6.4 + math.sin(tilt) * L))
    ct.add('Iron', cyl(top, bot, .04, .04, 4))
    sx, sy, sz = bot
    ct.add('Seat' if k % 2 == 0 else 'BavBlue', rbox((sx, sy - .15, sz), (.75, .18, .75), .05, 1, rot=(0, -a, 0)))
    ct.add('Seat' if k % 2 == 0 else 'BavBlue', rbox((sx + ca * .32, sy + .25, sz + sa * .32), (.12, .7, .7), .04, 1, rot=(0, -a, 0)))
ct.finish(origin=(0, 9.8, 0))

# ======================================================== Wiesn-Bude
st = Part('WS_Stall')
st.add('Wood', rbox((0, 1.7, -.6), (5, 3.4, 2.6), .05, 1), smooth=False)
st.add('DarkWood', rbox((0, 1.1, .85), (5.2, 2.2, .5), .05, 1), smooth=False)         # Theke
st.add('Wood', rbox((0, 2.25, .95), (5.3, .12, .8), .02, 1), smooth=False)
for k in range(8):                                            # gestreifte Markise
    x0 = -2.8 + k * .7
    st.add('BavBlue' if k % 2 == 0 else 'White', rbox((x0 + .35, 3.55, 1.0), (.7, .08, 2.4), 0, 1, rot=(-.32, 0, 0)), smooth=False)
st.add('White', rbox((0, 3.9, -.6), (5.4, .5, 2.9), .05, 1), smooth=False)
st.add('Sign', rbox((0, 4.6, .6), (3.6, .9, .15), .06, 1))
st.add('NeonPink', rbox((0, 4.6, .52), (3.9, 1.15, .1), .06, 1))
for sx in (-2.4, 2.4):
    st.add('DarkWood', cyl((sx, 0, 1.2), (sx, 3.4, 1.2), .08, .08, 6))
for k, x in enumerate((-1.8, -.9, 0, .9, 1.8)):                # Lebkuchenherzen an Schnueren
    st.add('White', cyl((x, 3.3, 1.35), (x, 2.75, 1.35), .015, .015, 4))
    st.add('Ginger', lambda bm, x=x: heart_shape(bm, .45, 1.28, .06, x, 2.45), smooth=False)
    st.add('Icing' if k % 2 else 'NeonPink', lambda bm, x=x: heart_shape(bm, .34, 1.35, .01, x, 2.47), smooth=False)
st.finish()

# ======================================================== Masskrug-Leuchtschild
ms = Part('WS_Stein')
ms.add('DarkWood', cyl((0, 0, 0), (0, 6.2, 0), .15, .12, 8))
ms.add('Beer', cyl((0, 6.3, 0), (0, 8.5, 0), .78, .82, 20))
ms.add('Foam', sphere((0, 8.55, 0), 1, (.88, .38, .88), 16, 8))
for k in range(4):
    ms.add('Foam', sphere((math.cos(k * 1.7) * .55, 8.75, math.sin(k * 1.7) * .55), .3, (1, 1, 1), 10, 6))
ms.add('Iron', torus((0, 6.35, 0), .82, .06, (0, 1, 0), 24, 5))
ms.add('Iron', torus((0, 8.4, 0), .83, .05, (0, 1, 0), 24, 5))
ms.add('Iron', torus((.95, 7.4, 0), .55, .12, (0, 0, 1), 18, 6, arc=(-math.pi / 2, math.pi / 2)))
for k in range(6):
    a = k * math.pi / 3
    ms.add('Gold', cyl((math.cos(a) * .8, 6.4, math.sin(a) * .8), (math.cos(a) * .83, 8.3, math.sin(a) * .83), .05, .05, 4))
ms.finish()

# ======================================================== Bierfass-Pyramide und Biertisch
br = Part('WS_Barrels')
def barrel(p, x, y, z):
    p.add('Wood', cyl((x - .7, y, z), (x + .7, y, z), .58, .58, 16))
    for dx in (-.45, .45):
        p.add('Iron', torus((x + dx, y, z), .6, .05, (1, 0, 0), 18, 4))
    p.add('DarkWood', cyl((x + .7, y, z), (x + .74, y, z), .5, .5, 14))
    p.add('DarkWood', cyl((x - .74, y, z), (x - .7, y, z), .5, .5, 14))
for i, (z, y) in enumerate(((-1.2, .58), (0, .58), (1.2, .58), (-.6, 1.6), (.6, 1.6), (0, 2.62))):
    barrel(br, 0, y, z)
br.finish()
bn = Part('WS_Bench')
bn.add('Wood', rbox((0, .95, 0), (4.2, .1, 1.0), .02, 1), smooth=False)
for sz in (-1, 1):
    bn.add('Wood', rbox((0, .55, sz * .95), (4.2, .08, .35), .02, 1), smooth=False)
    for sx in (-1.8, 1.8):
        bn.add('DarkWood', rbox((sx, .27, sz * .95), (.08, .55, .3), 0, 1), smooth=False)
for sx in (-1.8, 1.8):
    bn.add('DarkWood', rbox((sx, .47, 0), (.1, .95, .8), 0, 1), smooth=False)
for x in (-1.2, .4):
    bn.add('Beer', cyl((x, 1.0, .1), (x, 1.35, .1), .13, .13, 10))
    bn.add('Foam', cyl((x, 1.35, .1), (x, 1.42, .1), .14, .14, 10))
bn.finish()

tris = export_glb(ROOT / 'assets' / 'wiesn.glb')
report = {'asset': 'wiesn.glb', 'authoring': 'Original procedural Blender models (Oktoberfest theme)', 'source': 'art/r53/create_wiesn.py',
          'triangles': sum(tris.values()), 'parts': tris, 'bytes': (ROOT / 'assets' / 'wiesn.glb').stat().st_size}
(ROOT / 'art' / 'r53' / 'wiesn_report.json').write_text(json.dumps(report, indent=1), encoding='utf-8')
print('REPORT', json.dumps(report))
