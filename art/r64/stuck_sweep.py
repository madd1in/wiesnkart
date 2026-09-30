"""R64: erzeugt Szenen fuer art/r61/shots.mjs, die an jedem Looping und jeder Anti-Grav-Roehre aller Strecken mit
gedrueckt gehaltenem Gas und drei Einfahrtstempos durchfahren und Haenger melden (Zuruecksetzen, Stillstand).
Aufruf: python art/r64/stuck_sweep.py > .scratch/sweep.json && node art/r61/shots.mjs .scratch/sweep-shots .scratch/sweep.json
Hinweis: ohne Lenken schrammt das Kart in Anfahrtskurven an der Planke - ein "STUCK" dort ist kein Fehler; echte Fehler
zeigen sich als harter Stopp mitten in der Roehre (Tempo faellt schlagartig), siehe Runde 61 (Riesendom).
"""
import json
JS = ("rallyTest.dbg.freeze=true;rallyTest.autopilot(true);rallyTest.tick(200,1/60);rallyTest.autopilot(false);"
      "dispatchEvent(new KeyboardEvent('keydown',{code:'ArrowUp',key:'ArrowUp'}));"
      "const out=[];const zones=[...rallyTest.loops().map((q,i)=>['loop'+i,q.s,q.span]),...rallyTest.agravZones().map((z,i)=>['ag'+i+':'+z[2],z[0],z[1]])];"
      "for(const [nm,s0,span] of zones)for(const v of [10,18,26]){const r=rallyTest.racers()[0],d0=s0-60,P=rallyTest.posAt(d0,0),Q=rallyTest.posAt(d0+1,0),h=Math.atan2(Q[0]-P[0],Q[2]-P[2]);"
      "Object.assign(r,{distance:d0,offset:0,x:P[0],z:P[2],h,speed:v,vx:Math.sin(h)*v,vz:Math.cos(h)*v,y:P[1],vy:0,air:false,airT:0,stun:0,safeD:d0,lastGround:P[1],boost:0,item:null,spinO:0,flat:0,rescue:null});"
      "let last=r.distance,lastSp=r.speed,back=0,slow=0,hard=[],done=false;for(let k=0;k<90;k++){rallyTest.tick(10,1/60);const dd=r.distance-last;if(dd<-5)back++;"
      "if(lastSp-r.speed>14&&!r.air&&Math.abs(r.offset)<7.4)hard.push(Math.round(r.distance-s0));if(dd<1)slow++;else slow=0;last=r.distance;lastSp=r.speed;if(r.distance>s0+span+40){done=true;break;}if(slow>=24)break;}"
      "out.push([nm,v,done?'ok':'STUCK',Math.round(r.distance-s0),back,hard.join(',')]);}"
      "window.__r=out")
print(json.dumps([{"name": f"sweep_{i}", "track": i, "wait": 200, "js": JS, "after": 100, "ret": "window.__r"} for i in range(12)]))
