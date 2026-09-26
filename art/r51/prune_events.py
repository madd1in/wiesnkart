"""R51 Video: Ton-Ereignisse vor dem Schnitt ausduennen (.scratch/r51-frames/events.json).
Behalten werden nur Ereignisse, die zur Szene passen: Blitz, UFO-Lift, Sonnen-Turbo, Muh, Windschatten, Ring-Boost,
Turbos und Ueberkopf (nur in der Drachen-Spirale). Weg fallen Einsammel-, Platz- und Runden-Meldungen sowie Reste aus
dem Einschwingen am Szenenanfang (z. B. "Saubere Spirale" im ersten Bild).
Aufruf: python art/r51/prune_events.py
"""
import json, pathlib
F = pathlib.Path(r'C:/Users/User/Documents/Playground/mushroom-rally/.scratch/r51-frames/events.json')
d = json.loads(F.read_text(encoding='utf-8'))
KEEP = ('BLITZ', '\U0001F6F8 UFO-LIFT', 'SONNEN-TURBO', 'MUH', 'WINDSCHATTEN', 'RING-BOOST', 'MINI-TURBO', 'SUPER-TURBO', 'ULTRA-TURBO')
cuts = sorted(c['frame'] for c in d['cuts'])
drag = next(c for c in d['cuts'] if c['title'] == 'DRACHEN-SPIRALE')['frame']
drag_end = min([c for c in cuts if c > drag] + [d['frames']])
out = []
for e in d['events']:
    t = e['text'].upper()
    if any(c <= e['i'] < c + 3 for c in cuts):
        continue
    if t.startswith(KEEP) or (t.startswith('ÜBERKOPF') and drag <= e['i'] < drag_end):
        if out and out[-1]['text'] == e['text'] and e['i'] - out[-1]['i'] < 20:
            continue
        out.append(e)
d['events'] = out
F.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps([(e['i'], e['text']) for e in out], ensure_ascii=False))
