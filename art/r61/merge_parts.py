"""R61: setzt das Video aus Teil 1 (.scratch/r61-frames, bis vor die Controller-Tafel) und den nachgeholten Teilen
zusammen: loisl (Kamerafahrt, Loisl) nach den Cups, pad (Controller-Tafel im Menue) und items (Boellerschuss, Blaue Brezn).
Ergebnis in .scratch/r61-final. Bilder werden fortlaufend umbenannt,
Schnitte und Ereignisse verschoben, die Endkarte kommt aus dem letzten Teil (dort stehen die Items mit drin).
Die Originaldaten von Teil 1 liegen beim ersten Lauf als events_part1.json daneben, damit das Skript wiederholbar ist.
Aufruf: python art/r61/merge_parts.py
"""
import json, pathlib, shutil
ROOT = pathlib.Path(__file__).resolve().parents[2]
A = ROOT / '.scratch' / 'r61-frames'
orig = A / 'events_part1.json'
if not orig.exists():
    ev = json.loads((A / 'events.json').read_text(encoding='utf-8'))
    if ev.get('merged'):   # frueherer Zusammenbau: Teil 1 endete mit der Controller-Tafel (1491 Bilder)
        ev['cuts'] = [c for c in ev['cuts'] if c['frame'] < 1491]
        ev['events'] = [e for e in ev['events'] if e['i'] < 1491]
        ev['frames'] = 1491
        ev.pop('merged', None)
    orig.write_text(json.dumps(ev, indent=2, ensure_ascii=False), encoding='utf-8')
ea = json.loads(orig.read_text(encoding='utf-8'))
keep = next(c['frame'] for c in ea['cuts'] if c['title'] == 'XBOX-CONTROLLER')
split = next(c['frame'] for c in ea['cuts'] if c['title'] == 'SCHOKO-MATSCH')
# Reihenfolge: Teil 1 bis vor Schoko-Matsch, Kamerafahrt/Loisl, Rest von Teil 1 bis vor die Controller-Tafel, pad, items
segs = [('A', 0, split), ('loisl', None, None), ('A', split, keep), ('pad', None, None), ('items', None, None)]
F = ROOT / '.scratch' / 'r61-final'
if F.exists():
    shutil.rmtree(F)
F.mkdir(parents=True)
cuts, events, n, last = [], [], 0, None
for name, a0, a1 in segs:
    B = A if name == 'A' else ROOT / '.scratch' / f'r61-frames-{name}'
    eb = ea if name == 'A' else json.loads((B / 'events.json').read_text(encoding='utf-8'))
    lo, hi = (a0, a1) if name == 'A' else (0, eb['frames'])
    for i in range(lo, hi):
        shutil.copyfile(B / f'f{i:05d}.jpg', F / f'f{n + i - lo:05d}.jpg')
    cuts += [{**c, 'frame': c['frame'] - lo + n} for c in eb['cuts'] if lo <= c['frame'] < hi]
    events += [{**e, 'i': e['i'] - lo + n} for e in eb['events'] if lo <= e['i'] < hi]
    n += hi - lo
    if name == 'loisl':
        last = B
out = {**ea, 'cuts': cuts, 'events': events, 'frames': n}
shutil.copyfile(last / 'endcard.jpg', F / 'endcard.jpg')
(F / 'events.json').write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding='utf-8')
print('merged frames', n, [c['title'] for c in cuts])
