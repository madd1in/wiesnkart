import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the real sound subsystem without a GPU or browser.
const game=fs.readFileSync(new URL('./game.js',import.meta.url),'utf8');
const audio=game.slice(game.indexOf('// ---------------------------------------------------------------- Audio:'),game.indexOf('// ---------------------------------------------------------------- Spielablauf'));
function harness(){
 const nodes=[],timers=[];
 class Param{constructor(v=0){this.value=v;}setValueAtTime(v){this.value=v;}setTargetAtTime(v){this.value=v;}linearRampToValueAtTime(v){this.value=v;}exponentialRampToValueAtTime(v){this.value=v;}}
 class Node{constructor(kind){this.kind=kind;this.out=[];for(const p of ['gain','frequency','Q','playbackRate','delayTime','threshold','knee','ratio','attack','release'])this[p]=new Param(p==='gain'?1:0);nodes.push(this);}connect(n){assert.ok(n,'audio output exists');this.out.push(n);return n;}disconnect(){this.disconnected=true;}start(){this.started=true;}stop(at){this.stopAt=at;if(at===undefined){this.stopped=true;this.onended?.();}}}
 class Context{constructor(){this.destination=new Node('destination');this.currentTime=1;this.sampleRate=1000;this.state='running';this.resumes=0;}resume(){this.resumes++;this.state='running';return Promise.resolve();}createGain(){return new Node('gain');}createBiquadFilter(){return new Node('filter');}createOscillator(){return new Node('oscillator');}createBufferSource(){return new Node('bufferSource');}createDynamicsCompressor(){return new Node('compressor');}createDelay(){return new Node('delay');}createMediaElementSource(){return new Node('media');}createBuffer(ch,len,sr){const data=Array.from({length:ch},()=>new Float32Array(len));return {sampleRate:sr,numberOfChannels:ch,length:len,duration:len/sr,getChannelData:i=>data[i]};}}
 class Media{constructor(src){this.src=src;this.currentTime=0;this.duration=96;this.volume=0;}addEventListener(){}play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}load(){}}
 const context=vm.createContext({console,Math,Set,Audio:Media,window:{AudioContext:Context},ctx:null,state:'race',soundOn:true,performance:{now:()=>1000},addEventListener(){},fetch:()=>new Promise(()=>{}),setTimeout:(fn,ms)=>timers.push({fn,ms}),clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),courses:[{music:'race'}],selected:0,$:()=>({setAttribute(){}})});
 vm.runInContext(audio+'\nglobalThis.audioApi={audioInit,playBgm,stopBgm,setBgmRate,bgmTick,BGM_SRC,BGM_LOOP,BGM_XF,TRACK_GAIN,prepClip,playClip,sfxNoise,sfxTone,syncAudioMix,duckBgm,starTick,star:()=>starSrc,driftTick,drift:()=>driftSnd,draftTick,draft:()=>draftSnd,setAmbience,setSound,SFX,clipBuf,clipNorm,bgm,effectSources,get:()=>({ctx,sfxGain,effectsOut,worldGain,masterGain,voiceGain,raceFilter,duckLevel,ambSrc,ambLfo}),duck:v=>duckUntil=v};',context);
 const api=context.audioApi;api.audioInit();return {api,context,nodes,timers};
}
function reaches(node,target,seen=new Set()){if(node===target)return true;if(seen.has(node))return false;seen.add(node);return node.out.some(n=>reaches(n,target,seen));}

test('audio normalization retains stereo-only sound and bounds spikes on either channel',()=>{
 const {api}=harness(),ctx=api.get().ctx,b=ctx.createBuffer(2,1000,1000);
 b.getChannelData(1).fill(.1);b.getChannelData(1)[400]=1;
 const out=api.prepClip('s_hit',b),gain=api.clipNorm.s_hit;
 assert.equal(out.length,1000,'right-only sound must not be trimmed away');assert.ok(gain<=.82,'peak ceiling includes right channel');assert.ok(gain<1);
 const silent=ctx.createBuffer(1,1000,1000);api.prepClip('s_boost',silent);assert.ok(Number.isFinite(api.clipNorm.s_boost));assert.ok(api.clipNorm.s_boost<=2.5);
});

test('sampled and synthetic cues share the effects compressor; music stays outside it',()=>{
 const {api,nodes}=harness(),{ctx,sfxGain,masterGain}=api.get();
 api.clipBuf.s_boost=ctx.createBuffer(1,100,1000);api.playClip('s_boost',sfxGain);api.sfxTone(500,700,.2);api.sfxNoise(.2,1000,200);
 const comp=nodes.find(n=>n.kind==='compressor');for(const src of api.effectSources){assert.ok(reaches(src,sfxGain));assert.ok(reaches(src,comp));assert.ok(reaches(src,masterGain));}
 const music=nodes.filter(n=>n.kind==='media');assert.equal(music.length,30);   // R65: 15 Musikstuecke (1 altes als Rueckfall + 14 Chiptune) mit je 2 Elementen fuer die Ueberblendung
 for(const src of music){assert.ok(reaches(src,masterGain));assert.equal(reaches(src,comp),false);}
});

test('rapid repeated events are suppressed and simultaneous sources are bounded',()=>{
 const {api}=harness(),{ctx}=api.get();api.clipBuf.s_boost=ctx.createBuffer(1,1000,1000);api.SFX.boost();api.SFX.boost();assert.equal(api.effectSources.size,1);
 ctx.currentTime+=.4;api.SFX.boost();assert.equal(api.effectSources.size,2);for(let i=0;i<50;i++)api.sfxNoise(.4,500,200);assert.equal(api.effectSources.size,18);
});

test('pause stops events and silences dry, wet and world buses; menu mutes world loops',()=>{
 const {api,context}=harness();api.sfxNoise(.4,500,200);const src=[...api.effectSources][0];context.state='paused';api.syncAudioMix();const mix=api.get();
 assert.equal(src.stopped,true);assert.equal(api.effectSources.size,0);assert.equal(mix.sfxGain.gain.value,0);assert.equal(mix.effectsOut.gain.value,0);assert.equal(mix.worldGain.gain.value,0);
 api.sfxTone(500,700,.2);assert.equal(api.effectSources.size,0);context.state='race';api.syncAudioMix();assert.ok(mix.worldGain.gain.value>0);assert.ok(mix.effectsOut.gain.value>0);
 context.state='menu';api.syncAudioMix();assert.equal(mix.worldGain.gain.value,0);context.soundOn=false;api.syncAudioMix();assert.equal(mix.masterGain.gain.value,0);
});

test('music ducking eases both ways and a suspended context resumes',()=>{
 const {api}=harness();api.duck(2000);api.duckBgm(1000);const a=api.get().duckLevel;assert.ok(a<1&&a>.66);api.duckBgm(1100);const b=api.get().duckLevel;assert.ok(b<a&&b>.66);
 api.duck(0);api.duckBgm(1200);const c=api.get().duckLevel;assert.ok(c>b&&c<1);const ctx=api.get().ctx;ctx.state='suspended';const n=ctx.resumes;api.audioInit();assert.equal(ctx.resumes,n+1);
});

test('star shield loop plays seamlessly while the shield holds, ducks the music and stops afterwards',()=>{
 const {api,context}=harness(),{ctx}=api.get(),b=ctx.createBuffer(1,4800,1000);b.getChannelData(0).fill(.2);b.getChannelData(0)[0]=0;
 api.clipBuf.s_c_star=api.prepClip('s_c_star',b);assert.equal(api.clipBuf.s_c_star.length,4800,'loop clip must not be trimmed');
 const p={shield:6};api.starTick(p);const src=api.star();assert.ok(src&&src.loop&&src.started,'loop starts with the shield');
 api.starTick(p);assert.equal(api.star(),src,'no second copy while it is running');
 for(let t=1000;t<=1600;t+=100)api.duckBgm(t);assert.ok(api.get().duckLevel<.45,'race music steps back');
 context.state='paused';api.starTick(p);assert.equal(api.star(),src,'pause keeps the loop (the effects bus is muted)');context.state='race';
 p.shield=0;api.starTick(p);assert.equal(api.star(),null);assert.ok(src.stopAt>ctx.currentTime,'fades out instead of cutting');
 api.starTick(null);assert.equal(api.star(),null);
});

test('drift sizzle climbs with each mini-turbo level and stops with the drift',()=>{
 const {api,context}=harness();api.driftTick(0);const d=api.drift();assert.ok(d&&d.src.every(s=>s.started),'starts on drift');const f0=d.o.frequency.value,v0=d.g.gain.value;
 api.driftTick(0);assert.equal(api.drift(),d,'one voice only');
 api.driftTick(2);assert.ok(d.o.frequency.value>f0&&d.g.gain.value>v0,'red sparks sound higher and louder');assert.equal(d.lvl,2);
 api.driftTick(-1);assert.equal(api.drift(),null);assert.ok(d.src.every(s=>s.stopAt!==undefined),'all sources scheduled to stop');
 context.state='paused';api.driftTick(1);assert.equal(api.drift(),null,'silent while paused');
});

test('ambience oscillator is released after its fade-out',()=>{
 const {api,timers}=harness();api.setAmbience(true);const {ambSrc,ambLfo}=api.get();api.setAmbience(false);timers.find(t=>t.ms===1400).fn();assert.equal(ambSrc.stopped,true);assert.equal(ambLfo.stopped,true);
});
test('stereo loop normalization protects every channel without changing the loop boundary',()=>{
 const {api}=harness(),ctx=api.get().ctx,b=ctx.createBuffer(2,1000,1000);
 b.getChannelData(1).fill(.02);b.getChannelData(1)[400]=1;
 const out=api.prepClip('s_c_star',b);
 assert.equal(out,b,'loop bytes and exact duration must be preserved');
 assert.ok(api.clipNorm.s_c_star<=.82,'right-only impulse is below the peak ceiling');
 const silent=ctx.createBuffer(2,1000,1000);api.prepClip('s_c_megaloop',silent);
 assert.ok(Number.isFinite(api.clipNorm.s_c_megaloop)&&api.clipNorm.s_c_megaloop<=2.5);
});
test('slipstream air layer rises with charge, reuses its source and releases the whole graph',()=>{
 const {api}=harness(),{ctx,worldGain}=api.get();
 api.draftTick(.25);const draft=api.draft(),low=draft.g.gain.value,frequency=draft.f.frequency.value;
 assert.ok(draft.s.started&&draft.s.loop);assert.ok(reaches(draft.s,worldGain),'wind follows world muting');
 api.draftTick(1);assert.equal(api.draft(),draft);assert.ok(draft.g.gain.value>low);assert.ok(draft.f.frequency.value>frequency);
 const high=draft.g.gain.value;api.draftTick(20);assert.equal(draft.g.gain.value,high,'overshoot is clamped');
 api.draftTick(0);assert.equal(api.draft(),null);assert.ok(draft.s.stopAt>ctx.currentTime,'fade ends before release');
 draft.s.onended();assert.ok(draft.s.disconnected&&draft.f.disconnected&&draft.g.disconnected);
 api.draftTick(NaN);assert.equal(api.draft(),null,'invalid charge cannot poison AudioParams');
});
test('slipstream stops on pause, menu and mute and can restart cleanly',()=>{
 const {api,context}=harness();
 for(const next of ['paused','menu']){
  context.state='race';api.draftTick(.6);const previous=api.draft();context.state=next;api.syncAudioMix();
  assert.equal(api.draft(),null);assert.ok(previous.s.stopAt);api.draftTick(.8);assert.equal(api.draft(),null);
 }
 context.state='race';api.draftTick(.4);assert.ok(api.draft());context.soundOn=false;api.syncAudioMix();assert.equal(api.draft(),null);
});
test('slipstream chiptune cues have distinct phrases, cooldowns and pause protection',()=>{
 const {api,context}=harness(),{ctx,sfxGain}=api.get();
 api.SFX.draftready();assert.equal(api.effectSources.size,3);api.SFX.draftready();assert.equal(api.effectSources.size,3,'ready cue is not repeated every frame');
 ctx.currentTime+=1;api.SFX.draftboost();assert.equal(api.effectSources.size,8,'boost adds four notes and one air sweep');
 for(const src of api.effectSources)assert.ok(reaches(src,sfxGain));
 api.SFX.draftboost();assert.equal(api.effectSources.size,8);
 context.state='paused';api.syncAudioMix();api.SFX.draftready();api.SFX.draftboost();assert.equal(api.effectSources.size,0);
});


const settlePlayback=async()=>{for(let i=0;i<4;i++)await Promise.resolve();};

test('every music track points at a real local MP3, the nine scored themes use the mastered driving mixes',()=>{
 const {api}=harness();
 const mixed=Object.keys(api.BGM_LOOP);
 assert.equal(mixed.length,9);
 for(const [key,src] of Object.entries(api.BGM_SRC)){
  assert.equal(src.startsWith('drive/'),mixed.includes(key),key+' uses the driving mix only for scored themes');
  const bytes=fs.readFileSync(new URL('./assets/audio/'+src,import.meta.url));
  assert.ok(bytes.length>10000,key+' has rendered audio bytes');
  assert.ok(bytes.subarray(0,3).toString()==='ID3'||bytes[0]===0xff,key+' is MP3 data');
 }
});

test('scored music keeps its downbeat and level across loop and final-lap rate changes',async()=>{
 const {api}=harness();api.playBgm('dome');await settlePlayback();api.setBgmRate(1.2);
 const tr=api.bgm.tracks.dome,[a,b]=tr.els,end=api.BGM_LOOP.dome,xf=api.BGM_XF;
 assert.ok(Number.isFinite(end)&&end>10);
 a.duration=b.duration=end+xf;
 a.currentTime=end-.01;api.bgmTick(2000);assert.notEqual(b.paused,false);
 const base=tr.gains[0].gain.value;
 a.currentTime=end+.24;api.bgmTick(2016);await settlePlayback();api.bgmTick(2032);
 assert.equal(b.paused,false);assert.ok(Math.abs(b.currentTime-.24)<.002,'incoming head aligns with outgoing source phase');
 a.currentTime=end+xf/2;b.currentTime=xf/2;api.bgmTick(2600);
 assert.ok(Math.abs(tr.gains[0].gain.value+tr.gains[1].gain.value-base)<.0001,'identical loop overlap does not add loudness');
 api.setBgmRate(1.32);a.currentTime=end+xf+.01;b.currentTime=xf+.01;api.bgmTick(3100);
 assert.equal(tr.active,1);assert.equal(a.paused,true);assert.equal(b.playbackRate,1.32);
 assert.equal(tr.gains[0].gain.value,0);assert.ok(tr.gains[1].gain.value>0);
});

test('a refused secondary music play keeps the audible source and its rate',async()=>{
 const {api}=harness();api.playBgm('dome');await settlePlayback();api.setBgmRate(1.07);
 const tr=api.bgm.tracks.dome,[a,b]=tr.els,end=api.BGM_LOOP.dome;
 a.duration=b.duration=end+api.BGM_XF;b.play=()=>Promise.reject(new Error('media not ready'));
 a.currentTime=end+.1;api.bgmTick(2200);await settlePlayback();api.bgmTick(2250);
 assert.equal(tr.active,0);assert.ok(a.currentTime<end,'active source wraps to keep playing');assert.equal(a.playbackRate,1.07);
 assert.ok(tr.gains[0].gain.value>0);assert.equal(tr.gains[1].gain.value,0);
});

test('a late music play promise cannot reactivate stopped music',async()=>{
 const {api}=harness();api.playBgm('dome');await settlePlayback();
 const tr=api.bgm.tracks.dome,[a,b]=tr.els;let resolvePlay;
 b.play=()=>new Promise(resolve=>{resolvePlay=resolve;});
 a.duration=b.duration=api.BGM_LOOP.dome+api.BGM_XF;
 a.currentTime=api.BGM_LOOP.dome+.1;api.bgmTick(2300);assert.ok(resolvePlay);
 api.stopBgm();resolvePlay();await settlePlayback();api.bgmTick(2400);
 assert.equal(api.bgm.current,null);assert.ok(tr.els.every(el=>el.paused));assert.ok(tr.gains.every(g=>g.gain.value===0));
});
