"""R59 Update-Video, Schritt 2 (nach art/r53/edit_video_blender.py): Schnitt und Ton im Blender-Videoschnitt
(VSE), Export als MP4. Bilder aus art/r61/capture_frames.mjs (.scratch/r61-frames). Toene: Renn-Musik plus die
Chiptune-Effekte des Spiels (assets/audio/sfx/chip), gelegt auf die protokollierten Ereignisse.
Aufruf (Kommandozeile): blender -b --factory-startup --python art/r61/edit_video_blender.py
Erzeugt media/r61_cups_tsunami.mp4 (1080x1920) und media/r61_cups_tsunami_small.mp4 (810x1440, < 10 MB).
"""
import bpy, json, os, pathlib

ROOT = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally')
FR = ROOT / '.scratch' / 'r61-frames'
AU = ROOT / 'assets' / 'audio'
R44 = ROOT / 'art' / 'r61'
CH = AU / 'sfx' / 'chip'
OUT = ROOT / 'media' / 'r61_cups_tsunami.mp4'
FPS, END_SEC = 30, 4.5
ev = json.loads((FR / 'events.json').read_text(encoding='utf-8'))
N = ev['frames']

sc = bpy.data.scenes.get('R59_Video') or bpy.data.scenes.new('R59_Video')
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1080, 1920, 100
sc.render.fps, sc.render.fps_base = FPS, 1.0
try:
    sc.view_settings.view_transform = 'Standard'   # Farben 1:1 wie im Spiel (AgX dunkelt ab)
except TypeError:
    pass
se = sc.sequence_editor_create()
for s in list(se.strips_all):
    se.strips.remove(s)

frames = sorted(f for f in os.listdir(FR) if f.startswith('f') and f.endswith('.jpg'))
img = se.strips.new_image('gameplay', str(FR / frames[0]), channel=1, frame_start=1)
for f in frames[1:]:
    img.elements.append(f)
total = N + int(END_SEC * FPS)
card = se.strips.new_image('endcard', str(FR / 'endcard.jpg'), channel=2, frame_start=N - 7)
card.frame_final_duration = total - (N - 7) + 1
card.blend_type = 'ALPHA_OVER'
card.blend_alpha = 0.0
card.keyframe_insert('blend_alpha', frame=N - 7)
card.blend_alpha = 1.0
card.keyframe_insert('blend_alpha', frame=N + 3)

def snd(name, path, t, vol=1.0, ch=3):
    s = se.strips.new_sound(name, str(path), channel=ch, frame_start=max(1, int(round(t * FPS)) + 1))
    s.volume = vol
    return s

placed = []
# R61: die neuen Chiptune-Stuecke je Szene (Menue/Cups Polka, Schoko Swing, Tsunami Calypso, Riesendom Choral,
# Geisterhaus Gothic-Barock, Eissee/Controller Walzer), 12 Bilder Ueberblendung zwischen den Stuecken
SONG = {'Intro': 'polka', 'CUPS': 'polka', 'SCHOKO-MATSCH': 'choco', 'KAKAO-BROCKEN': 'choco', 'TSUNAMI!': 'beach', 'RIESENDOM XXL': 'dome',
        '8-BIT-GEISTERHAUS': 'gothic8', 'EISPALAST': 'ice', 'XBOX-CONTROLLER': 'ice'}
segs = []
for c in ev['cuts']:
    song = SONG.get(c['title'], 'race')
    if segs and segs[-1][0] == song:
        continue
    segs.append([song, c['frame']])
LEVEL = {'polka': .55, 'choco': .5, 'beach': .55, 'dome': .5, 'gothic8': .45, 'ice': .5}
for k, (song, f0) in enumerate(segs):
    f1 = segs[k + 1][1] if k + 1 < len(segs) else N + 12
    st = snd('bgm_' + song, AU / f'bgm_{song}.mp3', max(0, f0 - 6) / FPS, LEVEL.get(song, .5), ch=3 + (k % 2))
    st.frame_final_end = min(st.frame_final_end, f1 + 8)
    v = LEVEL.get(song, .5)
    st.volume = 0.0 if k else v
    st.keyframe_insert('volume', frame=max(1, f0 - 6))
    st.volume = v
    st.keyframe_insert('volume', frame=f0 + 6)
    st.keyframe_insert('volume', frame=max(f0 + 7, f1 - 6 if k + 1 < len(segs) else N - 20))
    st.volume = 0.0
    st.keyframe_insert('volume', frame=f1 + 8 if k + 1 < len(segs) else N + 10)
ch = 5
def nxt():
    global ch
    ch = 5 + (ch - 4) % 6
    return ch
# Szenenwechsel: kurzer Schub
for c in ev['cuts'][1:]:
    snd(f"cut_{c['frame']}", CH / 'boost.wav', c['frame'] / FPS, .35, ch=nxt())
MAP = [('TSUNAMI', [(CH / 'whistle.wav', 0, .6), (CH / 'boom.wav', .4, .5)]), ('WAVE-RIDER', [(CH / 'ring.wav', 0, .55), (CH / 'boost.wav', .1, .45)]), ('KANDELABER', [(CH / 'item.wav', 0, .6)]), ('SCHOKOMATSCH', [(CH / 'hit.wav', 0, .45)]), ('MIT TURBO DURCH', [(CH / 'boost.wav', 0, .5)]), ('VOM SCHOKOBROCKEN', [(CH / 'boom.wav', 0, .55)]), ('VOLLTREFFER', [(CH / 'boom.wav', 0, .7), (CH / 'cheer.wav', .15, .5)]), ('ZEITKLO', [(CH / 'levelup.wav', 0, .6)]), ('SPERRWAND', [(CH / 'bump.wav', 0, .6)]), ('SCHLEUSENTOR', [(CH / 'bump.wav', 0, .6)]), ('LASERVORHANG', [(CH / 'hit.wav', 0, .55)]), ('LASERTREFFER', [(CH / 'hit.wav', 0, .55)]), ('142 KM/H', [(CH / 'thunder.wav', 0, .9), (CH / 'boost.wav', .1, .6)]), ('BLITZ', [(CH / 'thunder.wav', 0, .85)]), ('SONNEN-TURBO', [(CH / 'sun.wav', 0, .7)]), ('🛸 UFO-LIFT', [(CH / 'whirl.wav', 0, .6)]), ('RIESENWUCHS', [(CH / 'mega.wav', 0, .7)]), ('TINTENPILZ', [(CH / 'ink.wav', 0, .7)]), ('TINTE!', [(CH / 'ink.wav', 0, .8)]), ('PLATT', [(CH / 'squash.wav', 0, .6)]), ('MINI-TURBO', [(CH / 'mt1.wav', 0, .5)]), ('SUPER-TURBO', [(CH / 'mt2.wav', 0, .5)]), ('ULTRA-TURBO', [(CH / 'mt3.wav', 0, .55)]),
       ('IM TAKT', [(CH / 'boost.wav', 0, .5)]), ('SANDHOSE', [(CH / 'whirl.wav', 0, .55)]), ('KUGELBLITZ', [(CH / 'boom.wav', 0, .6)]),
       ('STERNSCHNUPPE', [(CH / 'meteor.wav', 0, .55)]), ('MUH', [(CH / 'moo.wav', 0, .6)]), ('TRICK-TURBO', [(CH / 'trick.wav', 0, .5)]),
       ('PLATT', [(CH / 'hit.wav', 0, .55)]), ('SCHRANKE', [(CH / 'bump.wav', 0, .5)]), ('VOM ZUG', [(CH / 'whistle.wav', 0, .55)]),
       ('WINDSCHATTEN', [(CH / 'boost.wav', 0, .4)]), ('WINDRING', [(CH / 'ring.wav', 0, .5)]), ('RING-BOOST', [(CH / 'ring.wav', 0, .5)]),
       ('ÜBERKOPF', [(CH / 'trick.wav', 0, .45)]), ('SAUBERE SPIRALE', [(CH / 'trick.wav', 0, .4)]), ('AUTSCH', [(CH / 'hit.wav', 0, .5)]),
       ('MASS BIER', [(CH / 'item.wav', 0, .5)]), ('❤ HERZ', [(CH / 'hit.wav', 0, .55)]), ('💨 K.O.', [(CH / 'boom.wav', 0, .5)]), ('⚔ KOTZ', [(CH / 'lap.wav', 0, .5)]), ('GLOCKENSCHALTER', [(CH / 'item.wav', 0, .6)]), ('FUNKEN-TURBO', [(CH / 'boost.wav', 0, .45)]), ('GLUT-TURBO', [(CH / 'boost.wav', 0, .5)]), ('BLITZ-TURBO', [(CH / 'boost.wav', 0, .55)]), ('GESCHNAPPT', [(CH / 'hit.wav', 0, .55)]), ('VERZAUBERT', [(CH / 'hit.wav', 0, .55)]), ('RUNDE', [(CH / 'lap.wav', 0, .5)]), ('▲ PLATZ', [(CH / 'beep.wav', 0, .35)])]
for e in ev['events']:
    for key, parts in MAP:
        if e['text'].upper().startswith(key):
            for path, dt, vol in parts:
                snd(f"{key}_{e['i']}_{path.stem}", path, e['t'] + dt, vol, ch=nxt())
                placed.append((e['t'], path.name))
            break
snd('jingle', CH / 'levelup.wav', N / FPS, .8, ch=11)
snd('cheer', CH / 'cheer.wav', N / FPS + .2, .55, ch=12)

sc.frame_start, sc.frame_end = 1, total
sc.render.use_sequencer = True
sc.render.use_compositing = False
isett = sc.render.image_settings
if 'media_type' in isett.bl_rna.properties:
    items = [i.identifier for i in isett.bl_rna.properties['media_type'].enum_items]
    isett.media_type = 'VIDEO' if 'VIDEO' in items else items[-1]
formats = [i.identifier for i in isett.bl_rna.properties['file_format'].enum_items]
isett.file_format = 'FFMPEG' if 'FFMPEG' in formats else formats[0]
ff = sc.render.ffmpeg
def pick(obj, prop, want):
    items = [i.identifier for i in obj.bl_rna.properties[prop].enum_items]
    setattr(obj, prop, want if want in items else items[0])
    return getattr(obj, prop)
report = {'container': pick(ff, 'format', 'MPEG4'), 'codec': pick(ff, 'codec', 'H264'),
          'audio': pick(ff, 'audio_codec', 'AAC'), 'frames': total, 'events': len(ev['events']), 'placed': placed}
ff.audio_mixrate = 48000
pick(ff, 'audio_channels', 'STEREO')
ff.gopsize = 30

def render(out, percent=100, kbps=None):
    sc.render.resolution_percentage = int(percent)
    if kbps:
        pick(ff, 'constant_rate_factor', 'NONE')
        ff.video_bitrate = kbps
        ff.minrate, ff.maxrate, ff.buffersize = 0, int(kbps * 1.6), int(kbps * 2)
        ff.audio_bitrate = 160
    else:
        pick(ff, 'constant_rate_factor', 'HIGH')
        pick(ff, 'ffmpeg_preset', 'GOOD')
        ff.audio_bitrate = 192
    sc.render.filepath = str(out)
    bpy.context.window_manager  # noqa (Kommandozeile: kein Fenster noetig)
    bpy.ops.render.render(animation=True, scene=sc.name)

render(OUT)
# kleine Fassung fuer Upload-Grenzen (< 10 MB): 75 % und feste Bitrate passend zur Laenge
secs = total / FPS
kbps = int(min(2400, (9.2 * 8 * 1024) / secs - 170))
render(ROOT / 'media' / 'r61_cups_tsunami_small.mp4', 75, kbps)
report.update({'seconds': round(secs, 1), 'small_kbps': kbps,
               'big_bytes': OUT.stat().st_size, 'small_bytes': (ROOT / 'media' / 'r61_cups_tsunami_small.mp4').stat().st_size})
(R44 / 'video_edit_report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report))
