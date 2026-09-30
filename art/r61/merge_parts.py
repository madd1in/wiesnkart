"""R61: haengt die Bilder von Teil 2 (.scratch/r61-frames-items) hinten an Teil 1 (.scratch/r61-frames) an: Bilder
fortlaufend umbenannt, Schnitte und Ereignisse verschoben, Endkarte aus Teil 2 (dort stehen die neuen Items mit drin).
Aufruf: python art/r61/merge_parts.py
"""
import json, pathlib, shutil
ROOT = pathlib.Path(__file__).resolve().parents[2]
A, B = ROOT / '.scratch' / 'r61-frames', ROOT / '.scratch' / 'r61-frames-items'
ea = json.loads((A / 'events.json').read_text(encoding='utf-8'))
eb = json.loads((B / 'events.json').read_text(encoding='utf-8'))
if ea.get('merged'):
    raise SystemExit('schon zusammengefuegt')
n0 = ea['frames']
fb = sorted(f for f in B.iterdir() if f.name.startswith('f') and f.suffix == '.jpg')
for i, f in enumerate(fb):
    shutil.copyfile(f, A / f'f{n0 + i:05d}.jpg')
ea['cuts'] += [{**c, 'frame': c['frame'] + n0} for c in eb['cuts']]
ea['events'] += [{**e, 'i': e['i'] + n0} for e in eb['events']]
ea['frames'] = n0 + len(fb)
ea['merged'] = True
shutil.copyfile(B / 'endcard.jpg', A / 'endcard.jpg')
(A / 'events.json').write_text(json.dumps(ea, indent=2, ensure_ascii=False), encoding='utf-8')
print('merged', n0, '+', len(fb), '=', ea['frames'])
