import test from 'node:test';import assert from 'node:assert/strict';
import {LB_KIND,lbTag,ttBoard,wcBoard,cleanLbName,lbDraft,lbSerial,lbFilter,lbParse,lbRank,lbBetter} from './lb.mjs';
import {schnorr} from './vendor/trystero.mjs';

const K = c => c.repeat(64), ev = (pub, board, data, at) => ({...lbDraft(board, data, pub, at * 1000), id: 'x', sig: 'y'});
test('R57 leaderboard: drafts, filter and tags',()=>{
 const e=lbDraft(ttBoard(3),{n:'Resi',t:101.5,d:6},K('a'),1_700_000_000_000);
 assert.equal(e.kind,LB_KIND);assert.equal(e.created_at,1_700_000_000);assert.deepEqual(e.tags[0],['d','wiesnkart-lb1:tt:3']);
 assert.equal(lbSerial(e),JSON.stringify([0,K('a'),1_700_000_000,30078,e.tags,e.content]));
 assert.deepEqual(lbFilter('wins',50),{kinds:[30078],'#d':[lbTag('wins')],limit:50});
 assert.equal(cleanLbName('  <b>Sepp</b>   der\tGroße!!  '),'bSeppb der Gro');assert.equal(cleanLbName(''),'');
});
test('R57 leaderboard: parse keeps newest per key, drops invalid and foreign entries',()=>{
 const B=ttBoard(0),list=lbParse([
  ev(K('a'),B,{n:'Alt',t:95},10),ev(K('a'),B,{n:'Neu',t:99},20),        // neuer zaehlt (ersetzbar), auch wenn langsamer
  ev(K('b'),B,{n:'Flott',t:92.1234},15),ev(K('c'),B,{n:'Schummler',t:3},15), // zu schnell -> raus
  ev(K('d'),ttBoard(1),{n:'Andere Strecke',t:90},15),ev('nope',B,{t:90},15),
  {...ev(K('e'),B,{},15),content:'kaputt'},ev(K('f'),B,{n:'Lang',t:1e9},15),null],B,{minTime:60});
 assert.deepEqual(list.map(e=>[e.n,e.t]),[['Flott',92.123],['Neu',99]]);
 assert.equal(lbRank(list,K('a')),2);assert.equal(lbRank(list,K('z')),0);
 const W=lbParse([ev(K('a'),'wins',{n:'A',w:3},1),ev(K('b'),'wins',{n:'B',w:7},2),ev(K('c'),'wins',{n:'C',w:0},2)],'wins');
 assert.deepEqual(W.map(e=>e.n),['B','A']);
 assert.ok(lbBetter('tt:0',90,95)&&!lbBetter('tt:0',96,95)&&lbBetter('wins',4,3)&&!lbBetter('wins',3,3)&&lbBetter('wins',1,null));
});
test('R57 leaderboard: events signed with the bundled schnorr verify like a relay would',async()=>{
 const {secretKey}=schnorr.keygen(),pub=Buffer.from(schnorr.getPublicKey(secretKey)).toString('hex');
 const e=lbDraft('wins',{n:'Test',w:1},pub);const id=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(lbSerial(e))));
 const sig=await schnorr.signAsync(id,secretKey);assert.equal(sig.length,64);assert.equal(pub.length,64);
 assert.ok(await schnorr.verifyAsync(sig,id,Buffer.from(pub,'hex')));
});
test('R87 Wochen-Cup-Board: wc:< Woche, Gesamtzeiten steigen wie im Zeitfahren',()=>{
 const B=wcBoard('2026-W40');assert.equal(B,'wc:2026-W40');assert.equal(lbTag(B),'wiesnkart-lb1:wc:2026-W40');
 const list=lbParse([
  ev(K('a'),B,{n:'Sepp',d:1,t:495.5},10),ev(K('a'),B,{n:'Sepp',d:1,t:490},20),   // ersetztbar: neuere Zeit zaehlt
  ev(K('b'),B,{n:'Mitzi',d:0,t:502.25},15),ev(K('c'),B,{n:'Schummler',t:200},15), // unter minTime -> raus
  ev(K('d'),B,{n:'Bummelbox',t:5e4},15)],B,{minTime:400,maxTime:2000});
 assert.deepEqual(list.map(e=>[e.n,e.t]),[['Sepp',490],['Mitzi',502.25]]);
 assert.equal(lbRank(list,K('a')),1);assert.ok(lbBetter(B,488,490));assert.ok(lbBetter(B,488,null));
});
