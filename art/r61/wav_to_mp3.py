"""R61: WAV -> MP3 mit Blenders Audio-Mixdown (kein ffmpeg noetig). Eine Datei je Aufruf, weil der Mixdown die Datei
erst nach dem Operator fertig schreibt (bei mehreren Dateien in einem Lauf blieb nur die erste uebrig).
Aufruf: blender -b --factory-startup --python art/r61/wav_to_mp3.py -- <in.wav> <out.mp3> [kbps]
"""
import sys, os, time, bpy

argv = sys.argv[sys.argv.index('--') + 1:]
wav, out = os.path.abspath(argv[0]), os.path.abspath(argv[1])
kbps = int(argv[2]) if len(argv) > 2 else 128
os.makedirs(os.path.dirname(out), exist_ok=True)
if os.path.exists(out):
    os.remove(out)
scn = bpy.context.scene
scn.render.fps = 50
scn.sequence_editor_create()
seqs = scn.sequence_editor.strips if hasattr(scn.sequence_editor, 'strips') else scn.sequence_editor.sequences
st = seqs.new_sound('m', wav, 1, 1)
scn.frame_start, scn.frame_end = 1, st.frame_final_end - 1
res = bpy.ops.sound.mixdown(filepath=out, check_existing=False, relative_path=False, container='MP3', codec='MP3', format='S16', bitrate=kbps, split_channels=False)
want = (scn.frame_end / scn.render.fps) * kbps * 125 * .985   # erwartete Groesse (Bytes)
last, same = -1, 0
for _ in range(900):
    sz = os.path.getsize(out) if os.path.exists(out) else -1
    same = same + 1 if sz == last else 0
    last = sz
    if sz >= want and same >= 4:
        break
    time.sleep(.5)
print('MP3', res, out, os.path.getsize(out) if os.path.exists(out) else -1, 'frames', scn.frame_end)
