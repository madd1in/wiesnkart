import test from 'node:test';
import assert from 'node:assert/strict';
import {packGhost, unpackGhost, ghostLink, parseGhostLink, ghostTime, GS_MAX_N} from './ghostshare.mjs';

// Huebsche Testaufzeichnung: 10 Hz, ein paar Kurven, h dreht auch negativ herum
function ride(n = 601) {
  const d = {x: [], y: [], z: [], h: [], d: []};
  for (let i = 0; i < n; i++) {
    const t = i / 10;
    d.x.push(Math.round((Math.sin(t * .7) * 40 + t * 8) * 10));
    d.y.push(Math.round(Math.sin(t * 1.3) * 6 * 10));
    d.z.push(Math.round((Math.cos(t * .5) * 30 + t * 5) * 10));
    d.h.push(Math.round((t * .9 % (Math.PI * 2) - Math.PI) * 100));
    d.d.push(Math.round(t * 28 * 10));
  }
  return d;
}

test('R92 Geist-Link: packen ist kompakt, Stuetzstellen bleiben, Lerp fuellt zurueck', () => {
  const data = ride();
  const frag = packGhost(data);
  assert.ok(typeof frag === 'string' && frag.length > 100, 'Fragment entsteht');
  assert.ok(frag.length < 8000, `bleibt kompakt (${frag.length} Zeichen fuer 60 s)`);
  assert.ok(!/[+/=]/.test(frag), 'base64url ohne +, /, =');
  const back = unpackGhost(frag);
  assert.ok(back, 'lässt sich wieder lesen');
  for (const k of ['x', 'y', 'z', 'h', 'd']) {
    assert.equal(back[k].length, data[k].length, `${k}: gleiche Laenge`);
    for (let i = 0; i < data[k].length; i += 2)                // jeder zweite Wert ist das Original
      assert.equal(back[k][i], data[k][i], `${k}[${i}] unverändert`);
    for (let i = 0; i < data[k].length; i++)                   // aufgerundete Lerp-Werte: hoechstens 0,2 m daneben
      assert.ok(Math.abs(back[k][i] - data[k][i]) <= 2, `${k}[${i}] lerp-nah`);
  }
});

test('R92 Geist-Link: kaputte und zu grosse Eingaben werden abgewiesen', () => {
  assert.equal(packGhost(null), null);
  assert.equal(packGhost({x: [1, 2], y: [1], z: [], h: [], d: []}), null);   // Reihen ungleich lang
  assert.equal(packGhost({x: [5], y: [5], z: [5], h: [5], d: [5]}), null);  // nur ein Stuetzpunkt
  assert.equal(packGhost({...ride(), x: new Array(GS_MAX_N + 2).fill(0)}), null);
  assert.equal(unpackGhost(''), null);
  assert.equal(unpackGhost('!!!'), null);
  assert.equal(unpackGhost('AAAA'), null);                                    // Kappe, aber kein gueltiger Kopf
  const frag = packGhost(ride());
  assert.equal(unpackGhost(frag.slice(0, -2)), null, 'abgeschnitten -> Muell erkannt');
  assert.equal(unpackGhost(frag + 'AA'), null, 'angehaengt -> Laenge passt nicht');
});

test('R92 Geist-Link: Kopfdaten (Strecke, Zeit, Fahrer, Farbe, Name) hin und zurueck', () => {
  const link = ghostLink({track: 7, time: 83.456, driver: 3, color: 0xff2060, name: 'Resi W.', frag: packGhost(ride(60))});
  assert.ok(typeof link === 'string' && link.includes('~'));
  const back = parseGhostLink(link);
  assert.deepEqual([back.track, back.time, back.driver, back.color, back.name], [7, 83.46, 3, 0xff2060, 'Resi W.']);
  assert.equal(parseGhostLink(link.replace(/^1~/, '2~')), null, 'falsche Version');
  assert.equal(parseGhostLink('1~7~0~0~0~A~XYZ'), null, 'Zeit 0 abgewiesen');
  assert.equal(parseGhostLink('1~x~100~0~0~A~XYZ'), null, 'Strecke keine Zahl');
  assert.equal(parseGhostLink(null), null);
  // Name mit Tilde und Zeilenumbruch wird unschaedlich
  const boese = ghostLink({track: 0, time: 50, driver: 0, color: 1, name: 'A~B\nC', frag: packGhost(ride(20))});
  assert.ok(!parseGhostLink(boese).name.includes('\n'));
});

test('R92 ghostTime: Laenge der Aufzeichnung in Sekunden', () => {
  assert.equal(ghostTime({x: new Array(601).fill(0)}), 60);
  assert.equal(ghostTime({}), 0);
});
