import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {armGlider,resetGlider,stepGlider} from './glider.mjs';
import {isPrecisionFlight,ringBoostDuration} from './windring.mjs';
import {COASTER,BANK,coasterSpec,coasterProfile,coasterSpeedFactor,coasterG,airtimeFloat,launchKick,launchArches,coasterRating,twistAt,bankAngle,bankEnvelope,bankAxis} from './coaster.mjs';
import {ELEM,elemPlan,elemState,elemHeight} from './elem.mjs';
import {HP,hpEnv,hpProfile,hpAccel,hpLaunchCap,hpRating,hpFindSpot} from './halfpipe.mjs';
import {readPad,padPressed,pickPad,cycle} from './pad.mjs';
import {navPick,navRepeat,isConsole} from './padnav.mjs';
import {createDraftState,updateDraft} from './draft.mjs';
import {WIZARD,inSection,castInterval,pickTarget,spellPos,stepSpell,spellHits} from './wizard.mjs';
import {weatherPlan,calmPlan,weatherMix,weatherLook,wxGrip,wxWind,forecast,lapNews} from './weather.mjs';
import {ACH,achById,recordRace,levelOf,pickRival,rivalBeaten,dailyChallenge,dailyDone,dayKey,DAILY_XP,ONLINE_MUL,ONLINE_DAILY_XP,ONLINE_UNLOCKS,onlineNext,streakUpdate,streakIfToday,streakXP,TOPPERS,topperById,topperUnlocked,topperHint,topperFor,luckyReward,luckyReady,weekKey,weeklyGoals,weeklyStep,WEEKLY_XP} from './progress.mjs';
import {STAMP,stamperState,stamperCrushes,stamperBlocks,fireballAt,CANNON,cannonLane,missileAt} from './hazards.mjs';
import {OW,pswitchMission,pswitchPress,pswitchCollect,pswitchTick,timeLeft,slalomMission,slalomPass,ringsMission,ringsHit,ringsLand,progressAdd} from './ow.mjs';
import {LOOP,loopSpec,loopFrame as loopFrameAt,agravSegments,agravRoll,agravRings} from './loop.mjs';
import {orbitOf,NET_VER,MAX_PLAYERS,SEND_HZ,INTERP_MS,HEARTS,BATTLE_SECS,LOBBY_SECS,LOBBY_SOLO_SECS,LOBBY_GO_SECS,voteTally,lobbyReturnAt,battleHit,battleResult,makeCode,normCode,toLocal,toGlobal,assignSlots,packKart,unpackKart,F as NF,snapBuf,pushSnap,sampleSnap} from './net.mjs';
import {LB_TOP,ttBoard,lbDraft,lbSerial,lbFilter,lbParse,lbRank,lbBetter} from './lb.mjs';
import {CH,KMH,starsFor,challengeXP,recordBest,fmt,zoneState,zoneStep,zoneResult,driftState,driftStep,driftMul,jumpState,jumpStep} from './challenge.mjs';
import {EMOJIS,QUICK,packChat,unpackChat,chatLimiter,pushLog} from './chat.mjs';
import {CUPS,cupTracks,cupOf,trophyKey,trophyIcon,cupById} from './cups.mjs';
import {MUD,onMud,mudSurf,mudDodge,BOULDER,boulderState,boulderHits} from './choco.mjs';
import {autoNick} from './nick.mjs';
import {voxelMesh,breznModel,qBlockModel,crownModel,topperModel,spikyShellModel,BREZN,pixels,EMOTE_PIX,EMOTE_PAL,decoModel,DECO_FOR} from './voxel.mjs';
import {TSU,tsunamiPhase,tsunamiSurf,waveFront} from './tsunami.mjs';
import {TIDE,tideLevel,tideFlooded,tideRising,tideDryFor,SURF,surfFront,surfHits,ICE,iceSurf,curlOff,BLOCK,blockScale,SENT,sentinelState,sentinelSpan,sentinelHits,sentinelNextHot} from './surface.mjs';
import {CANNON_T,SHRINK_T,MEGA_T,INK_T,HOP_T,miniTurbo,flattenSmall,blastHit,comboStep,racer,driveKart,turnCurve,advanceProgress,hitKart,collideKarts,maxCornerSpeed,angleDiff,lap,finish,ranking,activate,clamp,LAPS,rollItem,chargesFor,orbitCount,orbitBlock,loseSpores,addGpPoints,gpStandings,raceStars,gpPoints,MAX_SPORES,PHYS,CLASSES} from './core.mjs';

const $=id=>document.getElementById(id),TAU=Math.PI*2,TEST=new URLSearchParams(location.search).has('test');
// R70: Retro-Sprueche auf dem Ladebildschirm
{const m=['Strecke wird aufgebaut …','Modul wird eingelegt … bitte nicht pusten!','Lade 16 Megabit Wiesn-Gaudi …','Bitte den Controller nicht ins Bier tunken …','Pixel werden auf Hochglanz poliert …'],el=document.getElementById('loaderText');if(el&&!TEST)el.textContent=m[Math.floor(Math.random()*m.length)];}
const store={get(k,d){try{const v=localStorage.getItem('mr-'+k);return v===null?d:JSON.parse(v);}catch{return d;}},set(k,v){if(TEST)return;try{localStorage.setItem('mr-'+k,JSON.stringify(v));}catch{}}};

// ---------------------------------------------------------------- Themen & Strecken
// Jede Strecke hat eigenes Licht, eigene Farben, eigene Deko und eine eigene Spielmechanik.
const THEMES={
 // R61 Schoko-Matsch: Schokoladen-Alm im Karamell-Abendlicht - Kakao-Erde, Keks-Fahrbahn, Zuckerguss-Randsteine, Schokosee
 choco:{skyTop:0x6a3a8c,skyBottom:0xffb88a,fog:0xf0b894,fogNear:190,fogFar:540,exposure:1.1,hemiSky:0xffe0c8,hemiGround:0x4a2412,hemiInt:1.7,sunCol:0xffd2a0,sunInt:3.3,sunPos:[110,90,-70],fillCol:0xc08aff,fillInt:.5,
  grass:0x5a3220,grassSpot:0x6c3e26,skirt:0x3e2214,road:0x9a6a44,roadSpot:0xae7c52,edge:0xfff0dc,curbA:'#ff6fae',curbB:'#fff4e6',line:'#fff4e6',glow:0,sea:0x4a2210,foam:0xffe6c8,
  caps:[0xff6fae,0xffd23f,0x8a5cff,0x5ad0ff],leaves:[0xff9ecf,0xffc2e0,0x9ad8ff],hills:[0x6b3a22,0x7d4a2c],pennants:[0xff6fae,0xfff4e6],chev:'#fff4e6',clouds:true,cloudCols:[0xffd8ec,0xffb58a],balloons:3,stars:false,
  chasm:{c:0x4a2210,e:0x1e0c05,i:.35,label:'SCHOKOFLUSS! SPRING!'},rockCol:0x5a3220,rockTop:0x7a4a2e},
 forest:{skyTop:0x2f8fe0,skyBottom:0xc4ecff,fog:0xc9e8f5,fogNear:230,fogFar:560,exposure:1.08,hemiSky:0xffffff,hemiGround:0x3f7a2a,hemiInt:1.9,sunCol:0xfff1c9,sunInt:3.2,sunPos:[60,120,80],fillCol:0xbfd4ff,fillInt:.5,
  grass:0x3fae3a,grassSpot:0x6ccf4c,skirt:0x2f8a2e,road:0x3a414d,roadSpot:0x4e5766,edge:0xf4f1e6,curbA:'#e8352e',curbB:'#ffffff',line:'#ffffff',glow:0,sea:0x28a8dc,foam:0xe8fffb,
  caps:[0xe8352e,0xf5a623,0x8e5bd9,0xff5fa2],leaves:[0x2e9c3f,0x52b848,0x3f8f2a],hills:[0x3f9a5a,0x5fb870],clouds:true,balloons:4,stars:false},
 canyon:{skyTop:0x40207a,skyBottom:0xff9448,fog:0xf09a60,fogNear:170,fogFar:480,exposure:1.12,hemiSky:0xffd7b0,hemiGround:0x8a3b1e,hemiInt:1.55,sunCol:0xffae66,sunInt:3.8,sunPos:[-140,60,-150],fillCol:0x9a7bff,fillInt:.45,
  grass:0xd8843f,grassSpot:0xeea45e,skirt:0xa9512a,road:0x6e3a2a,roadSpot:0x8a4f3b,edge:0xf6d09a,curbA:'#ffd23f',curbB:'#2b1d24',line:'#ffe8a0',glow:0,sea:0x1c8fa6,foam:0xffe2c2,
  caps:[0xff7a2f,0xffc03a,0xd9482b],leaves:[0x5f8f3a,0x7aa84a],hills:[0xb4532e,0xc8683a],clouds:false,cloudCols:[0xffd2a8,0xff7a3a],balloons:2,stars:false},
 haunted:{skyTop:0x07050f,skyBottom:0x3a2d5c,fog:0x2a2342,fogNear:90,fogFar:380,exposure:1.42,hemiSky:0x9a8cff,hemiGround:0x1a1426,hemiInt:1.25,sunCol:0xc9d6ff,sunInt:1.8,sunPos:[-70,130,90],fillCol:0x7dff9a,fillInt:.4,
  grass:0x2a3526,grassSpot:0x3f4d33,skirt:0x1f2419,road:0x3a3442,roadSpot:0x4f4858,edge:0x8f86a3,curbA:'#8a5cff',curbB:'#1a1426',line:'#9dff7a',glow:1,sea:0x1b1433,foam:0x9dff7a,
  caps:[0x8a5cff,0x9dff7a,0xff8a3d],leaves:[0x3a2d4a,0x2e2a3a,0x4a3550],hills:[0x1d1830,0x261f3a],clouds:false,balloons:0,stars:true,magnetCol:0x6a2fc0,magGlow:0x9dff7a},
 rainbow:{skyTop:0x05030f,skyBottom:0x1b0b3a,fog:0x140a2e,fogNear:220,fogFar:640,exposure:1.36,hemiSky:0xc9b8ff,hemiGround:0x241a44,hemiInt:1.5,sunCol:0xffffff,sunInt:2.0,sunPos:[70,150,60],fillCol:0x7df3ff,fillInt:.7,head:60,
  grass:0x241a44,grassSpot:0x2e2358,skirt:0x1a1234,road:0x2a2050,roadSpot:0x3a2c6e,edge:0xfff6dc,curbA:'#fffdf4',curbB:'#f5a623',line:'#fffdf4',glow:1,sea:0x0a0620,foam:0x9d8cff,
  caps:[0xff4fa3,0x4fd8ff,0xffe45c,0x8affc8],leaves:[0x3a2d6a,0x2a2050],hills:[0x1a1240,0x241a50],pennants:[0xff4fa3,0x4fd8ff],chev:'#ffffff',
  space:true,rainbowRoad:true,clouds:false,balloons:0,stars:true,magnetCol:0xd23a8a},
 // R56 Graben-Flug: dunkle Weltraum-Festung aus Stahl mit orangen Warnlichtern
 fortress:{skyTop:0x020208,skyBottom:0x0e1428,fog:0x0a0e1a,fogNear:170,fogFar:620,exposure:1.42,hemiSky:0xb8c4ff,hemiGround:0x20242e,hemiInt:1.7,sunCol:0xffe8d0,sunInt:2.3,sunPos:[-80,160,40],fillCol:0xff6a3a,fillInt:.7,head:75,
  grass:0x2a2e38,grassSpot:0x343a46,skirt:0x1c2028,road:0x3c424e,roadSpot:0x4a5260,edge:0xff5a3a,curbA:'#ff5a3a',curbB:'#2a2e38',line:'#ffb03a',glow:1,sea:0x05070c,foam:0x3a4658,
  caps:[0xff5a3a,0x4fd8ff],leaves:[0x2a2e38],hills:[0x1c2028,0x2a2e38],pennants:[0xff5a3a,0xffb03a],chev:'#ffb03a',
  space:true,clouds:false,balloons:0,stars:true,magnetCol:0xff5a3a},
 lava:{skyTop:0x150409,skyBottom:0x8a2410,fog:0x40120c,fogNear:110,fogFar:430,exposure:1.3,hemiSky:0xffc59a,hemiGround:0x241010,hemiInt:1.05,sunCol:0xffd0a0,sunInt:2.6,sunPos:[-90,110,-70],fillCol:0x6a7dff,fillInt:.5,head:80,
  grass:0x2e2226,grassSpot:0x46302e,skirt:0x1d1517,road:0x2a2328,roadSpot:0x3b3038,edge:0xff7a2f,curbA:'#ff5a1f',curbB:'#1a1012',line:'#ffb347',glow:1,sea:0xff4a12,foam:0xffd08a,lavaSea:true,ember:true,
  chasm:{c:0xff4a12,e:0xff3a08,i:1.5,label:'LAVA! VOLLGAS'},
  caps:[0xff5a1f,0xffae3a,0xd93a12],leaves:[0x3a2a28,0x4a3230],hills:[0x2a1c1c,0x3a2422],pennants:[0xff7a2f,0xffd45c],chev:'#ffcf6a',clouds:false,cloudCols:[0x45302a,0x7a1e0c],balloons:0,stars:false},
 fair:{skyTop:0x1f1450,skyBottom:0xff8f6b,fog:0xb67c98,fogNear:190,fogFar:520,exposure:1.18,hemiSky:0xffd8e6,hemiGround:0x34284a,hemiInt:1.55,sunCol:0xffc08a,sunInt:2.9,sunPos:[-130,55,-120],fillCol:0x8ab0ff,fillInt:.55,
  grass:0x3c9a4c,grassSpot:0x5fc062,skirt:0x2c7a3c,road:0x3a3452,roadSpot:0x51496e,edge:0xfff0dc,curbA:'#ff3b6b',curbB:'#ffe45c',line:'#ffe45c',glow:1,sea:0x2a5fa0,foam:0xffe0ee,
  caps:[0xff3b6b,0xffe45c,0x4fd8ff,0x9d6bff],leaves:[0x2e8a4f,0x46a55a,0x3f8f2a],hills:[0x3a2c62,0x4b3674],pennants:[0xff3b6b,0xffe45c],chev:'#ffe45c',
  clouds:false,cloudCols:[0xffc8d8,0xff7a8a],balloons:3,stars:false,coasterCol:0xff3b6b},
 // R60 Schildkroeten-Bucht: tuerkise Lagune in der Mittagssonne, Sandstrand, Palmen, Korallenrot und Weiss
 beach:{skyTop:0x1784f0,skyBottom:0xc8f2ff,fog:0xd2f1f8,fogNear:240,fogFar:600,exposure:1.1,hemiSky:0xffffff,hemiGround:0xd8b87a,hemiInt:1.95,sunCol:0xfff4d6,sunInt:3.4,sunPos:[70,140,60],fillCol:0x9fe8ff,fillInt:.55,
  grass:0xf0d9a0,grassSpot:0xe2c585,skirt:0xd9bc7c,road:0x5f6b78,roadSpot:0x74808c,edge:0xfff6e0,curbA:'#ff6a3d',curbB:'#ffffff',line:'#ffffff',glow:0,sea:0x14c2d4,foam:0xffffff,
  caps:[0xff6a3d,0x2ec4b6,0xffd23f,0xff4f8b],leaves:[0x2e9c4f,0x3fbf5f,0x5fcf52],hills:[0x3a9c5a,0x52b86a],pennants:[0xff6a3d,0x2ec4b6],clouds:true,balloons:0,stars:false,beach:true,rockCol:0x9a8a7a},
 // R60 Eisstock-See: klarer Wintertag am zugefrorenen Bergsee - Schnee, blaues Eis, Rot-Weiss wie an der Skipiste
 ice:{skyTop:0x2f73d0,skyBottom:0xe4f4ff,fog:0xe6f2fb,fogNear:200,fogFar:560,exposure:1.02,hemiSky:0xf4fbff,hemiGround:0xb8c8dc,hemiInt:1.85,sunCol:0xfff2e0,sunInt:3.0,sunPos:[-90,110,80],fillCol:0xb0d0ff,fillInt:.6,
  grass:0xf1f6fb,grassSpot:0xd9e6f2,skirt:0xc6d6e6,road:0x6b7c90,roadSpot:0x8394a8,edge:0xffffff,curbA:'#d7263d',curbB:'#ffffff',line:'#e8f6ff',glow:0,sea:0xb8e2f2,foam:0xffffff,
  caps:[0x2f6bff,0xd7263d,0xffd23f,0x8a5cff],leaves:[0x1f5a3a,0x2a6e48,0x245f40],hills:[0xeaf2fa,0xd2e0ee],pennants:[0xd7263d,0xffffff],chev:'#ffffff',clouds:true,balloons:0,stars:false,frozen:true,
  chasm:{c:0x2f7ab8,e:0x0a3a6a,i:.5,label:'GLETSCHERSPALTE!'},rockCol:0x8a96a8,rockTop:0xf4f8fc},
 // R60 Riesendom: Goetterstadt in ewiger Abendsonne - goldenes Licht, helle Steinplatten, Kathedrale, Wolkenmeer darunter
 dome:{skyTop:0x2c2360,skyBottom:0xffb45a,fog:0xe8a870,fogNear:170,fogFar:560,exposure:1.12,hemiSky:0xffd9a8,hemiGround:0x5a4030,hemiInt:1.55,sunCol:0xffc070,sunInt:3.5,sunPos:[-150,42,-120],fillCol:0x8a7cff,fillInt:.5,
  grass:0xa89c86,grassSpot:0x958a76,skirt:0x7a6e5e,road:0x4a4254,roadSpot:0x5d5468,edge:0xffd98a,curbA:'#ffd45c',curbB:'#3a2a4a',line:'#ffe8a8',glow:0,sea:0xf2c08a,foam:0xfff0d8,
  caps:[0xffd45c,0xc8a2ff,0xff8a4a,0x6ad0ff],leaves:[0x3f5a32,0x4c6a3a],hills:[0x8a6a88,0x9a7a90],pennants:[0x5a2a8a,0xffd45c],chev:'#ffd45c',clouds:false,cloudCols:[0xffd0a0,0xff9a5a],balloons:0,stars:false,cloudSea:true,
  chasm:{c:0xf2c08a,e:0xa0521e,i:.6,label:'ABGRUND! VOLLGAS'},rockCol:0xa8987a,rockTop:0xc8b890},
 night:{skyTop:0x05041a,skyBottom:0x2f1c66,fog:0x1f1650,fogNear:140,fogFar:430,exposure:1.4,hemiSky:0x7a7aff,hemiGround:0x0c0c28,hemiInt:1.15,sunCol:0xa8bfff,sunInt:1.5,sunPos:[80,140,-60],fillCol:0xff4fb8,fillInt:.35,
  grass:0x12344a,grassSpot:0x1d5070,skirt:0x0d2638,road:0x16142b,roadSpot:0x29254d,edge:0x2de2e6,curbA:'#2de2e6',curbB:'#ff3cac',line:'#ff3cac',glow:1,sea:0x0a1c3c,foam:0x6fe8ff,
  caps:[0xff3cac,0x2de2e6,0xfff05a,0x9d6bff],leaves:[0x1f6a64,0x2a4f8a],hills:[0x1c2a5a,0x2a1f5c],clouds:false,balloons:0,stars:true}};
// Positionen der Features in Kontrollpunkt-Koordinaten: 2.5 = zwischen Punkt 2 und 3 auf halber Strecke.
// hills [cp, Hoehe, Breite als Rundenanteil], ramps [cp, Querversatz, Breite], pads [cp, Querversatz], boost [cp], boxes [cp],
// stands [cp, Querversatz], plateau [cpStart, cpEnde, Hoehe, Rampenlaenge m], gap [cp, Laenge m], swing [cp, Amplitude, Tempo, Phase].
const courses=[
 // R53: das Maerchenschloss steht nicht mehr am Inselrand, die Strasse fuehrt mitten hindurch (Torbau, Innenhof, Palas)
 {name:'Pilz-Promenade',icon:'✿',kind:'Almwiese · Kühe · Schloss-Durchfahrt',medals:[93,99,110],music:'alm',theme:'forest',seed:7,
  points:[[-45,-45],[-8,-8],[30,30],[72,62],[112,42],[118,-12],[82,-52],[38,-38],[-35,35],[-72,68],[-112,40],[-118,-15],[-85,-58]],sharp:[[9,13]],
  raise:[[6.55,8.45,8,44,1]],hills:[[10.6,4,.022]],elem:[[2.95,4.3,'bach']],tunnel:[[2.35,2.92,'wood']],gaps:[[11.6,12]],agrav:[[4.5,6.4,'wallrun',90]],loopc:[[10.75,13,2,1]],builds:[[.9,'roottree'],[1.7,'schloss']],
  ramps:[[4.4,0,9],[9.7,0,8]],pads:[[3.1,-4],[10.0,4]],
  pipes:[[2.1,1,1],[2.24,-1,0],[8.7,1,1],[9.35,-1,1]],landmarks:{maypoles:[[.35,1],[10.0,-1]]},pennants:[0x1a73e8,0xffffff],cows:[[9.45,10.4,3]],eggs:{klos:[[.45,-1],[9.2,1],[5.0,-1]],tentacles:[[3.2,1,14,'purple'],[2.6,-1,14,'green'],[6.1,-1,15,'purple'],[11.3,-1,14,'green'],[12.6,1,15,'purple']],signs:[[3.0,1],[11.1,-1]]},boost:[1.9,5.5,12.3],boxes:[1.6,4.9,9.3,12.0],stands:[[.2,18],[5.2,-19]]},
 {name:'Sonnen-Canyon',oil:[[3.3,-2.5,2.6],[9.1,2.2,2.4]],icon:'☀',kind:'Wüstensturm · Dünen · Sandhosen · Güterzug',medals:[125,131,142],music:'canyon',theme:'canyon',seed:23,
  points:[[0,78],[95,78],[125,45],[120,-20],[85,-45],[105,-88],[50,-102],[2,-50],[-60,-98],[-115,-72],[-122,0],[-105,55],[-55,80]],sharp:[[4,13]],
  loopc:[[9.12,13,1,-1]],dunes:[[.55,2.25,1.7,18]],twisters:[[5.95,6,.35,0],[12.1,6,.3,1.7],[12.7,6,.33,3.1]],sand:[[4,0,8.5]],hills:[[1.5,4,.03],[4.5,6,.04]],plateau:[9.45,11.7,7,34],gaps:[[10.5,14]],fork:[[6.25,8.75,.36]],
  raise:[[2.3,3.3,7,30,1]],tunnel:[[4.6,5.85,'rock']],
  ramps:[[3.3,0,9],[6.5,3,7]],pads:[[2.4,-4],[8.4,4]],
  train:[3.4,0],boost:[.5,5.2,12.2],boxes:[1.0,4.0,7.0,9.1,12.6],stands:[[.3,-18],[4.12,19]],
  // R57: geheime Forschungsanlage (Bunker, Radar, Silo, Kisten, Hochbahn) und Kleinstadt-Uhrturm; Zeitsprung ab 142 km/h
  lab:{bunker:[[1.6,-1,42],[8.1,1,44],[11.4,-1,44]],dishes:[[2.0,1,30],[7.3,-1,34],[12.0,1,32],[5.2,1,40]],silos:[[1.2,1,38],[12.4,-1,36],[8.6,-1,40]],
   crates:[[1.45,-1,17],[1.95,1,16],[8.25,1,17],[12.05,-1,17],[7.9,-1,18]],clock:[[.55,-1,30],[.4,1,32]],tram:[.6,2.2,1,27]},timewarp:1},
 {name:'Neon-Pilzwald',icon:'✦',kind:'Beat · Taktschranken · Oktoberfest',medals:[115,121,132],music:'neon',theme:'night',seed:41,
  points:[[0,70],[50,75],[80,50],[55,25],[85,0],[95,-45],[55,-60],[30,-35],[0,-60],[-30,-95],[-80,-80],[-70,-40],[-105,-10],[-95,40],[-60,35],[-40,65]],
  hills:[[10.5,5,.035]],raise:[[1.1,2.1,7,28,1]],tunnel:[[8.9,10.3,'neon']],gaps:[[12.55,12]],agrav:[[8.6,10.75,'roll',1]],elem:[[2.36,5.6,'see',{loop:[3,11,1]}]],
  ramps:[[10.6,0,8]],pads:[[4.4,3],[12.4,-3]],
  builds:[[11.45,'neongate'],[.75,'wiesngate']],pipes:[[13.25,1,1],[13.5,-1,1]],landmarks:{tent:[12.0,-1],maypoles:[[.35,-1],[11.0,1]],hearts:[[11.2,-1],[13.9,-1],[14.6,1]],pretzels:[[1.05,-1],[11.6,1],[14.3,-1]]},
  // R53 Pilz-Wiesn: Buden, Masskrug-Schilder, Faesser, Biertische, Kettenkarussells, zweites Zelt, Wimpelketten, Riesenrad
  wiesn:{stalls:[[.5,-1],[1.25,-1],[11.65,-1],[12.75,1],[14.45,-1],[6.2,1]],steins:[[.95,1],[11.3,1],[13.7,-1],[14.9,1],[3.2,-1]],barrels:[[1.15,1],[12.3,-1],[6.6,1]],
   benches:[[11.85,-1,22],[12.2,-1,23],[.6,1,24],[1.4,1,22]],carousels:[[1.7,-1,34],[13.0,1,36],[7.4,-1,40]],tent2:[14.2,1],bunting:[.3,1.0,1.55,11.25,12.9,14.75,15.5],ferris:1},pennants:[0x1a73e8,0xffffff],beatgates:[[11.05],[11.9],[14.1]],boost:[.6,6.3,11.6],fork:[[5.75,8.75,.36]],boxes:[1.3,3.6,6.9,9.8,13.8],stands:[[.25,18],[10.85,-19]]},
 {name:'Geisterhaus',icon:'👻',kind:'Spuk · Gewitter · Geisterhände',medals:[101,108,120],music:'gothic8',bgmRate:.9,theme:'haunted',seed:66,
  points:[[0,70],[55,78],[95,55],[105,10],[70,-16],[100,-60],[70,-95],[20,-90],[-30,-90],[-75,-95],[-112,-55],[-104,-18],[-93,12],[-104,40],[-80,70],[-40,76]],
  hills:[[3.5,4,.03],[13.6,5,.03]],mansion:7.8,raise:[[9.9,11.1,8,34,1]],tunnel:[[2.2,3.6,'crypt']],agrav:[[11.4,13.4,'ceiling',1]],coaster:[[8.2,9.82,'hills']],loopc:[[4.1,12,1,-1]],elem:[[5.9,7.85,'see']],
  ramps:[[5.4,0,9],[13.5,0,8]],pads:[[4.6,3],[14.6,-3]],
  // R53: gotisches Uhrturm-Tor, Kandelaber, Ruinen mit Buntglas, Saerge, Fledermaus-Schwaerme und der Besen-Zauberer
  builds:[[1.0,'gothgate']],wizard:[13.45,1.9],eggs:{klos:[[1.5,-1],[9.0,1]],tentacles:[[7.7,1,14,'purple'],[8.05,1,16,'green'],[12.9,-1,14,'purple']],signs:[[7.5,1],[12.7,-1]]},
  gothic:{candles:[[.3,1],[.55,-1],[.85,1],[1.3,-1],[1.65,1],[2.0,-1],[3.85,1],[4.9,-1],[5.35,1],[8.0,-1],[9.95,1],[11.2,-1],[13.55,1],[13.9,-1],[14.25,1],[14.6,-1],[14.95,1],[15.3,-1]],
   ruins:[[1.2,-1,27],[5.1,1,27],[9.2,-1,30],[14.3,1,27],[12.2,1,32]],coffins:[[.7,-1],[3.95,-1],[14.7,1],[10.1,-1]],bats:[[1.0,1,0],[7.8,-1,0],[14.0,-1,18]]},
  // R61 Pixel-/Voxel-Gothic (Nutzerwunsch "mehr 8/16-Bit"): zerschlagbare Kandelaber auf der Fahrbahn (geben ein Item),
  // Pixel-Fledermaeuse, Gespenster, Totenkopf-Saeulen, Buntglas, Ruestungen, Zinnenmauern und ein grosser Pixel-Mond
  voxel:{candles:[[.7,5.2],[1.55,-5.2],[4.4,4.8],[5.2,-5],[9.4,5.2],[10.6,-5.2],[12.3,5],[14.9,-5]],skulls:[[.85,1,13],[1.9,-1,13],[4.55,-1,13],[9.55,1,13],[12.45,-1,13],[15.1,1,13]],
   windows:[[1.25,1,17],[5.05,-1,18],[9.7,-1,17],[14.2,-1,17]],armors:[[.55,-1,12.5],[4.8,1,12.5],[10.3,1,12.5],[14.6,1,12.5]],walls:[[.3,1.6,-1,22],[12.8,15.5,1,22]],ghosts:[[3.95,1],[8.6,-1],[11.9,1],[15.2,-1]],bats:4,moon:1},
  gothic2:{armor:[[.45,1],[.95,-1],[1.45,1],[13.7,-1],[14.1,1],[14.8,-1],[15.1,1],[4.7,1]],gargoyles:[[.2,-1],[1.85,1],[5.0,-1],[9.8,-1],[13.3,1],[15.45,-1]],
   windows:[[1.1,1,24],[3.9,1,22],[9.4,1,24],[14.45,-1,24],[12.0,-1,26]],fences:[[.35,-1],[.65,-1],[1.25,1],[1.55,1],[13.85,-1],[14.35,1],[14.9,1],[15.25,-1]],
   spires:[[.9,-1,70],[4.4,1,80],[8.4,-1,75],[12.6,1,85],[15.0,-1,72]]},
  hands:[[.7,2.1,6]],boost:[.5,6,12.5],ghosts:[[1.6,5.5,.9,0],[5.3,5.5,1.1,2],[7.5,4.2,1,.5],[10.4,5.5,.8,4],[12.9,5.5,1.2,1]],boxes:[1.2,4.1,9.6,13.9],stands:[[.3,-19],[13.2,19]]},
 {name:'Lava-Feste',icon:'\u2668',kind:'Burg \u00b7 Magma \u00b7 Feuerb\u00e4lle',medals:[111,117,128],music:'lava',bgmRate:1.06,theme:'lava',seed:88,
  points:[[-80,86],[0,90],[80,84],[118,56],[126,12],[112,-34],[92,-74],[44,-98],[-14,-94],[-62,-86],[-92,-56],[-72,-26],[-96,6],[-118,44],[-108,74]],
  castle:1.05,hills:[[8.6,3,.028]],elem:[[2.62,4.52,'flug']],raise:[[12.3,13.45,14,44,1]],tunnel:[[4.6,5.25,'pipe'],[12.95,13.12,'breach']],towers:[[12.8]],gaps:[[8.15,14]],agrav:[[9.45,12.0,'tour',1]],loopc:[[6.4,14,2,1]],
  swing:[[5.6,5,1,.9],[7.0,5,1.05,2],[12.2,5,1,.3]],cannons:[[2.2,1],[13.3,0,1]],stampers:[[13.72,-3.6,0],[13.95,3.6,1.8]],
  ramps:[[2.4,0,9],[9.7,0,8]],pads:[[5.9,-4]],
  boost:[.55,6.4,11.8],boxes:[1.6,4.4,8.0,9.9,13.6],stands:[[.4,18],[8.6,-19]]},
 {name:'Bierstraße',oil:[[2.6,2.2,2.4],[7.4,-2.5,2.6]],icon:'🍺',kind:'Bier-Fahrbahn \u00b7 Maßkrug-Stampfer \u00b7 Sternschnuppen',medals:[127,133,144],music:'polka',bgmRate:1.04,theme:'rainbow',seed:101,
  points:[[0,90],[70,88],[120,52],[108,-2],[128,-52],[96,-96],[36,-104],[-18,-78],[-8,-30],[-52,-8],[-104,-30],[-126,16],[-96,64],[-40,84]],
  loopc:[[6.2,21,2,-1,'curve']],agrav:[[2.05,4.05,'roll',1],[8.85,10.8,'ceiling',1]],coaster:[[10.9,12.95,'hills']],
  hills:[[8.4,5,.03]],gaps:[[4.55,13]],elem:[[.3,1.72,'flug']],stampers:[[5.0,3.6,.9],[13.1,-3.6,0],[13.28,3.6,1.8]],
  ramps:[[1.9,0,9],[8.15,0,8]],pads:[[3.9,-4]],
  meteors:[[4.7,5.85]],boost:[.6,5.4,11.4],boxes:[1.4,4.0,7.9,10.7,.45]},
 // R38: Kirmes-Strecke rund um die Magnet-Achterbahn (Katapult, Top-Hat, Kamelruecken, Bunny-Hop),
 // dazu Looping auf der rechten Geraden und ein Korkenzieher links.
 {name:'Magnet-Kirmes',oil:[[4.4,-2.2,2.5],[10.8,2.5,2.4]],icon:'❂',kind:'Achterbahn · Magnet-Katapult · Airtime',medals:[119,125,136],music:'kirmes',bgmRate:1.05,theme:'fair',seed:138,
  points:[[0,92],[70,94],[118,66],[132,10],[126,-48],[96,-92],[40,-110],[-30,-112],[-92,-100],[-126,-56],[-122,0],[-90,26],[-104,60],[-60,88]],
  coaster:[[5.45,9.2,'dragon']],loopc:[[12.3,16,1,-1]],halfpipe:[[.95,110]],elem:[[1.82,4.75,'see',{loop:[2,15,1]}]],agrav:[[9.3,11.3,'roll',1]],
  hills:[[11.9,4,.03]],
  ramps:[[1.4,0,9]],pads:[[12.5,3]],
  boost:[.55,4.7,11.3],boxes:[.8,2.7,4.7,9.0,11.7,13.2],stands:[[.3,18],[4.4,-19]]},
 // R56 Graben-Flug (Nutzerwunsch: reine Flugstrecke durch einen Graben einer Weltraum-Festung): fast die ganze Runde
 // ist Flugschneise in 9 m Hoehe zwischen 24 m hohen Stahlwaenden; oben die Stationsoberflaeche mit Tuermen
 {name:'Graben-Flug',icon:'🛸',kind:'Weltraum-Festung \u00b7 Stahlgraben \u00b7 Ringflug',medals:[96,102,112],music:'space',bgmRate:1.08,theme:'fortress',seed:202,
  points:[[-70,-75],[-70,75],[-50,112],[0,128],[50,112],[70,75],[70,-75],[50,-112],[0,-128],[-50,-112]],
  elem:[[.55,9.45,'flug',{fly:9,hi:42,hiLen:200}]],trench:[[0,9.98]],lasers:[[1.7],[2.9],[4.1],[5.6],[6.8],[8.1]],fighters:[[3.5],[7.5]],
  // R59 ("spielerisch zu monoton"): Sperrwaende mit Luecke (Slalom), wandernde Schleusentore, Laservorhaenge im Takt und
  // als Finale der Abluftschacht - [cp,'wall',Lueckenmitte,Lueckenbreite] [cp,'gate',Amplitude,Periode] [cp,'laser',Periode,An-Anteil,Phase] [cp,'port']
  trenchObs:[[4.35,'wall',-5.5,6.2],[4.75,'wall',5.5,6.2],[5.25,'laser',2.6,.42,0],[5.95,'gate',6.2,3.4],[6.45,'wall',0,5.6],
   [7.05,'laser',2.3,.45,.2],[7.22,'laser',2.3,.45,1.35],[7.95,'gate',6.8,2.8],[8.35,'wall',-6,6.2],[8.85,'port']],ramps:[],pads:[],stands:[],boost:[.45,5.45],boxes:[.3]},
 // ---------------- R60 (Nutzerwunsch: drei neue Strecken im Stil klassischer Vorbilder - eigene Namen und Entwuerfe)
 // Schildkroeten-Bucht: Strandpromenade mit Brandungswellen (surf), Sandbank-Abkuerzung mit Ebbe und Flut (tide = Index
 // der Abzweigung), Bootsfahrt durch die Lagune, Wellen-Looping an der Steilkueste, Krabben queren den Strand.
 // bay:{palms,huts,chairs,shades,boards,light,turtles} [cp, Seite, Versatz m]
 {name:'Schildkröten-Bucht',icon:'🏝',kind:'Lagune · Gezeiten · Brandung · Krabben',medals:[114,120,131],music:'beach',bgmRate:1.04,theme:'beach',seed:177,
  points:[[-60,98],[10,102],[75,92],[118,62],[130,10],[112,-38],[66,-46],[98,-98],[32,-132],[-45,-118],[-104,-84],[-124,-22],[-100,28],[-116,70]],
  surf:[[.5,1.9]],fork:[[6.3,8.9,.3]],tide:[0],elem:[[9.45,10.9,'bach']],loopc:[[3.55,15,1,1]],hills:[[5.1,4,.03],[12.2,3,.02]],crabs:[[12.05,13.45,3],[2.2,2.8,1]],
  ramps:[[2.45,0,9]],pads:[[2.95,4],[11.25,-4]],boost:[.3,4.6,11.7],boxes:[1.3,3.1,5.4,9.05,12.3],stands:[[.2,18],[5.8,-19]],
  wiesn:{stalls:[[.6,1],[12.75,1]],benches:[[.85,1,24],[12.95,1,24]],steins:[[1.05,1],[13.2,1]],barrels:[[.45,1]]},
  bay:{palms:[[.15,1],[.4,-1],[.75,-1],[1.15,1],[1.6,-1],[2.1,1],[2.6,-1],[4.2,1],[5.5,1],[9.3,1],[11.0,1],[11.8,-1],[12.5,-1],[13.05,-1],[13.6,1]],
   huts:[[1.35,1,26],[12.35,1,26],[5.35,-1,30]],chairs:[[.3,-1,17],[.95,-1,17],[1.45,-1,18],[13.3,-1,17]],shades:[[.62,-1,20],[1.25,-1,21],[13.5,-1,20],[12.9,-1,21]],
   boards:[[.52,1,16],[1.7,1,16],[12.6,1,17]],light:[4.45,1,34],turtles:9},
  // R61 (Nutzerhinweis "zu generisch"): Schildkroetenpanzer-Insel und Wrack draussen in der Lagune (automatisch seewaerts),
  // Riesen-Sandburgen, Rettungstuerme, springende Delfine
  // R61 Tsunami (Nutzerwunsch): bei 44 s Rennzeit rollt eine Riesenwelle ueber die Insel, alle fahren als Wave-Rider
  tsunami:{at:44,dir:2.3},
  bay2:{isle:[1.1],wreck:[5.0],castles:[[3.0,1,24],[3.1,-1,26],[11.9,-1,26],[8.2,1,30]],guards:[[.9,-1,15],[4.9,1,15],[12.2,1,15],[13.8,-1,15]],dolphins:[1.0,1.5,4.8,5.3,9.1,12.6,13.4]}},
 // Eisstock-See: zugefrorener Bergsee - Glatteis (weniger Seitenhalt, Drift laedt schneller), Eisstoecke gleiten quer,
 // Eisbloecke zerspringen, Gletscherspalte, Eishoehle, Bobbahn (Halfpipe). snow:{firs,men,huts,cabin,chapel,lane}
 {name:'Eisstock-See',icon:'❄',kind:'Glatteis · Eisstöcke · Eishöhle · Bobbahn',medals:[121,127,139],music:'ice',bgmRate:.97,theme:'ice',seed:211,
  points:[[0,-95],[-60,-100],[-110,-70],[-125,-10],[-95,35],[-40,20],[10,50],[-15,95],[50,110],[110,85],[120,30],[90,-15],[115,-60],[70,-100]],
  ice:[[4.72,6.62],[10.55,11.55]],curling:[[5.25,5.6,.7,0],[6.1,5.6,.6,2.2],[11.05,5.2,.75,1]],blocks:[[5.6,-4.6],[5.62,4.6],[5.95,0],[11.32,-4.2],[11.36,4.2]],
  tunnel:[[1.35,2.55,'ice']],gaps:[[3.45,12]],halfpipe:[[7.55,110]],loopc:[[12.55,14,1,-1]],hills:[[10.3,4,.025]],
  ramps:[[9.75,0,9]],pads:[[4.25,-4],[9.3,4]],boost:[.4,4.35,8.95],boxes:[1.05,2.95,4.95,6.95,10.25,12.95],stands:[[.25,18],[9.05,-19]],
  snow:{firs:[[.2,-1],[.55,1],[.9,-1],[3.0,1],[3.2,-1],[4.05,1],[7.0,-1],[7.7,1],[9.95,-1],[10.2,1],[12.1,1],[13.3,-1],[13.6,1]],men:[[.45,-1,16],[4.4,1,17],[7.45,-1,16],[10.4,-1,16],[13.1,1,16]],
   huts:[[5.2,1,26],[5.95,-1,28],[11.2,1,24]],cabin:[.8,1,34],chapel:[9.0,-1,40],lane:[6.9,1,30]},
  // R61: Eispalast am See, Eisskulpturen (Masskrug, Brezn), Iglu-Dorf, gefrorener Wasserfall an der Eishoehle
  ice2:{palace:[[5.6,-1,50],[5.9,1,52]],sculpt:[[.35,1,15,'IC_Stein'],[.5,-1,15,'IC_Brezn'],[8.3,1,16,'IC_Stein'],[12.0,-1,16,'IC_Brezn'],[4.3,1,15,'IC_Brezn']],
   igloos:[[3.0,-1,20],[3.18,-1,27],[3.35,-1,21],[10.0,1,22],[13.4,-1,20]],falls:[[6.95,-1,36],[13.0,1,34]]}},
 // Riesendom: Goetterstadt in ewiger Abendsonne - Fahrt durchs Kirchenschiff (Sonnen-Turbos aus den Fenstern),
 // Riesenwaechter mit Hellebarden (sentinels [cp, Seite, Phase]), Strebebogen-Bruecke, Dachsprung, Glockenturm-Looping.
 // dome:{statues,candles,banners,arches,spires,cypress,columns}
 {name:'Riesendom',icon:'⛪',kind:'Götterstadt · Riesenwächter · Strebebögen',medals:[117,123,134],music:'dome',bgmRate:.94,theme:'dome',seed:243,
  points:[[-80,-90],[0,-100],[80,-95],[120,-55],[105,-5],[125,45],[95,95],[35,85],[5,40],[-35,85],[-95,95],[-125,45],[-100,-5],[-120,-50]],
  tunnel:[[.92,1.78,'nave']],sentinels:[[4.3,1,0],[4.62,-1,2.3],[4.94,1,4.6],[9.62,-1,1.2],[9.98,1,3.6]],raise:[[6.35,7.55,9,40,1]],gaps:[[11.55,13]],loopc:[[12.6,15,1,1]],hills:[[3.2,3,.02]],
  // R61 (Nutzerwunsch "XXL-Kathedralenstadt, Anti-Grav durch den Gebaeudekomplex"): Wand-Decke-Wand-Passage durch die
  // Arkadenschlucht (ueber Kopf) und eine Rundum-Tour unter den Strebebogen-Toren; city = Riesen-Kathedralen, Glockentuerme, Kuppel-Rotunden
  agrav:[[1.95,2.95,'ceiling',1],[7.75,8.75,'tour',1]],
  city:{arches:[2.05,2.45,2.85,7.85,8.3,8.7,11.05,13.65],rows:[[1.95,2.95,1,40],[1.95,2.95,-1,40],[7.75,8.75,1,42],[7.75,8.75,-1,42]],
   cathedrals:[[.55,1,72],[6.9,-1,82],[11.9,1,86]],towers:[[1.3,-1,56],[4.0,1,60],[5.8,-1,64],[9.3,1,60],[10.6,-1,62],[13.0,-1,58],[14.3,1,66]],rotundas:[[3.9,-1,96],[12.6,-1,105]],skyline:18},
  // R64 leichter Retro-Pixel-Voxel-Charme (Nutzerwunsch): Pixel-Sonne, Pixelwolken, Banner, Waechterstatuen, Kohlebecken, Voegel
  pixel:{sun:1,clouds:16,birds:3,banners:[[.3,1,11],[.3,-1,11],[3.1,1,11],[3.1,-1,11],[5.4,1,11],[5.4,-1,11],[9.1,1,11],[10.3,-1,11],[11.0,1,11],[13.9,-1,11]],
   knights:[[3.5,-1,15],[4.1,1,16],[5.2,-1,15],[9.4,1,15],[10.1,-1,16],[13.5,1,15]],braziers:[[.6,1,9.6],[.6,-1,9.6],[3.25,1,9.6],[3.25,-1,9.6],[5.6,1,9.6],[5.6,-1,9.6],[10.5,1,9.6],[10.5,-1,9.6],[13.7,1,9.6],[13.7,-1,9.6]]},
  ramps:[[3.35,0,9]],pads:[[5.75,4],[10.6,-4]],boost:[.45,5.55,10.3],boxes:[.62,3.05,5.4,9.25,10.75,12.25],stands:[[.28,19],[9.05,-19]],
  dome:{statues:[[.1,1],[.1,-1],[2.2,1],[2.35,-1],[3.9,1],[5.3,-1],[8.3,1],[10.4,-1],[11.1,1],[13.2,-1]],candles:[[.4,1],[.55,-1],[2.6,1],[3.6,-1],[5.1,1],[8.4,-1],[10.2,1],[12.3,-1],[13.5,1]],
   banners:[[.3,1],[.3,-1],[2.05,1],[2.05,-1],[6.1,1],[6.1,-1],[10.9,1],[10.9,-1],[13.7,1],[13.7,-1]],arches:[[2.75],[5.95],[8.35],[10.75],[13.4]],
   spires:12,cypress:[[.7,1],[2.45,-1],[3.1,1],[5.6,-1],[8.1,-1],[9.2,1],[10.15,-1],[11.9,1],[13.1,1]],columns:[[3.7,-1],[5.05,1],[8.55,1],[12.05,-1]]}},
 // R61 Schoko-Matsch (Nutzerwunsch, eigene Strecke im Wiesn-Stil): Schokomatsch-Pfuetzen bremsen (mit Turbo gleitet man
 // durch), Schokobrocken rollen vom Hang quer ueber die Bahn, Sprung ueber den Schokofluss, Keks-Stollen, Waffel-Buckel.
 // choco:{mud:[[cp,Versatz,Laenge,halbe Breite]],boulders:[[cp,Seite,Phase]],hearts,brezn,wafers,creams,fountain,pralines,trees}
 {name:'Schoko-Matsch',icon:'🍫',kind:'Schokomatsch · Kakao-Brocken · Schokofluss',medals:[134,141,153],music:'choco',theme:'choco',seed:307,
  points:[[0,-100],[70,-110],[125,-80],[120,-25],[80,0],[110,45],[95,100],[35,110],[-10,70],[-50,105],[-110,90],[-130,30],[-95,-10],[-120,-60],[-70,-100]],
  tunnel:[[2.25,3.2,'choco']],gaps:[[7.35,12]],hills:[[5.8,4,.035],[11.4,4,.03],[13.3,3,.035]],loopc:[[9.2,13,1,1]],
  ramps:[[4.75,0,9]],pads:[[3.6,4],[10.3,-4]],boost:[.4,6.3,12.1],boxes:[1.1,2.9,4.3,8.0,9.9,12.9],stands:[[.25,18],[8.4,-19]],
  wiesn:{stalls:[[.6,1],[14.5,1]],benches:[[.85,1,24]],steins:[[1.05,1]]},
  choco:{mud:[[1.15,2.4,26,3],[5.2,3,26,3],[6.05,-3.2,22,2.8],[10.8,0,32,3.6],[12.55,2.8,24,2.8],[14.2,-2.5,26,3]],
   boulders:[[3.9,1,0],[4.15,-1,.45],[11.9,1,.25],[13.8,-1,.6]],
   hearts:[[.3,1],[2.0,-1],[6.6,1],[9.6,-1],[12.3,1],[14.6,-1]],brezn:[[.15,-1,20],[5.5,1,22],[8.9,-1,22],[13.0,-1,21]],
   wafers:[[1.35,1,17],[3.4,-1,17],[7.0,1,18],[10.4,1,17],[13.6,1,17]],creams:[[.9,-1,16],[4.5,-1,16],[8.2,1,16],[11.2,-1,17],[14.0,1,16]],
   fountain:[7.8,-1,34],pralines:[[1.9,1,15],[4.0,1,15],[6.3,-1,15],[9.2,1,15],[11.6,1,15],[13.2,-1,15]],
   trees:[[.5,-1],[1.2,1],[2.6,1],[3.0,-1],[4.9,-1],[5.9,1],[6.9,-1],[8.6,1],[9.4,1],[10.1,-1],[11.0,1],[12.0,-1],[12.8,1],[13.9,-1],[14.8,1]]}}];
// ---------- Wiesnland (R41): Open World, die die Rennstrecken verbindet. Eine grosse Rundstrasse durch
// Wald, Flussaue, Canyon, Seen und Flugschneisen - an Portalen geht es in jede Rennstrecke, dazu
// Missionen (Glockenschalter mit 8 Muenzen, Bojen-Slalom als Boot, Ringflug als Flugzeug). Steht nicht in
// der Rennliste (Grand Prix, Rekorde und Streckenwahl bleiben unberuehrt), sondern unter Index 99.
const WORLD_IDX=99;
// R60: zwei Modi in derselben Welt - 'world' = Kotzhügel Fight (Arena), 'roam' = Wiesnland frei fahren (Challenges, Portale)
const isOW=m=>m==='world'||m==='roam';
const PILZLAND={name:'Kotzhügel Fight',icon:'🎡',kind:'Open World · Arena-Kampf · Missionen · Portale',medals:[9999,9999,9999],music:'lobby',theme:'forest',seed:4141,worldR:680,openWorld:true,
 points:[[0,420],[160,400],[300,330],[380,200],[360,60],[420,-80],[380,-220],[260,-320],[120,-380],[-40,-360],[-180,-400],[-320,-320],[-400,-180],[-360,-40],[-420,100],[-360,240],[-240,340],[-110,400]],
 // langer Fluss (Boot an der Oberflaeche, Bojen-Slalom), lange Flugschneise (Ringflug), See mit Tauch-Spirale, zweiter Fluss
 elem:[[1.55,2.95,'bach'],[5.85,7.35,'flug',{fly:26}],[10.95,12.15,'see',{loop:[2,15,1]}],[15.9,17.2,'bach']],
 loopc:[[9.05,16,1,1],[13.9,13,3,-1,'curve']],agrav:[[4.15,4.95,'wallrun',90],[8.1,8.75,'tour',1]],halfpipe:[[3.74,120],[13.28,120]],
 hills:[[3.6,5,.01],[9.9,4,.01],[14.8,5,.01]],ramps:[[3.4,0,9],[10.3,0,8]],
 boost:[.3,4.0,8.4,13.2,15.4],boxes:[.6,3.8,5.3,9.5,12.6,14.9,17.5],stands:[[.08,18]],pads:[[3.9,-4],[13.3,4]],
 portals:[[.95,0],[3.15,1],[5.35,2],[8.0,3],[10.55,4],[12.75,5],[15.25,6],[9.65,7],[12.3,8],[17.6,9],[1.32,10]],
 // R60 Herausforderungen: [Art, cp (oder Schanzen-Index), cp Ende, Name]
 challenges:[['trap',1.2,0,'Festwiese'],['trap',9.85,0,'Pilzberg'],['trap',15.55,0,'Seeufer'],['zone',7.42,7.95,'Almstraße'],['zone',12.2,12.72,'Uferweg',[95,108,121]],
  ['drift',5.0,5.75,'Kurvenhang'],['drift',14.3,14.9,'Schlangenlinie'],['jump',0,0,'Pilzschanze',[18,26,34]],['jump',1,0,'Talsprung',[26,36,45]]],
 pswitch:[[.4,0,'p1'],[5.1,0,'p2'],[10.0,0,'p3'],[14.45,0,'p4']],
 // R55: das Wiesnland war zu leer - rund um die Ringstrasse Festbetrieb wie auf der Pilz-Wiesn (freie Stellen prueft decoSpot)
 landmarks:{tent:[.7,-1],maypoles:[[.2,1],[9.4,-1],[14.35,1],[3.05,-1]],hearts:[[1.2,1],[5.15,-1],[9.7,1],[13.6,-1],[17.6,1]],pretzels:[[.75,1],[4.05,-1],[7.8,1],[12.5,-1],[15.05,1]]},
 wiesn:{stalls:[[.25,1],[.5,-1,20],[1.3,-1],[3.1,1],[5.05,1],[7.7,-1],[9.35,1],[12.45,1],[14.3,-1],[15.1,-1],[17.4,-1],[17.75,1],[4.0,1,26],[8.35,-1,24],[13.05,1,24]],
  steins:[[.35,-1],[3.3,1],[5.2,-1],[9.6,-1],[12.55,1],[14.5,1],[17.6,-1],[7.55,1]],barrels:[[.45,1],[4.1,1],[7.9,-1],[13.1,-1],[17.9,1],[9.15,1]],
  benches:[[.3,1,24],[.55,-1,26],[9.45,1,24],[14.4,-1,24],[5.0,-1,24],[12.6,1,26]],carousels:[[.9,-1,46],[5.0,1,50],[9.5,-1,55],[14.55,1,50],[17.3,-1,46],[7.6,1,48]],
  tent2:[12.35,-1],bunting:[.15,.45,3.2,5.25,7.8,9.3,12.5,14.6,17.6]},pennants:[0x1a73e8,0xffffff]};
const courseAt=i=>i===WORLD_IDX?PILZLAND:courses[i];
// Streckenlayouts haben sich geaendert (Viadukt, Abzweigungen, Kurvenglaettung) -> alte Rekorde/Geister einmalig verwerfen
const LAYOUT_VER=18;if(store.get('layoutVer',0)!==LAYOUT_VER){try{for(let i=0;i<courses.length;i++){for(const k of ['tt-','medal-','ghost-','bestlap-'])localStorage.removeItem('mr-'+k+i);for(const cc2 of [50,100,150]){localStorage.removeItem('mr-best-'+i+'-'+cc2);localStorage.removeItem('mr-stars-'+i+'-'+cc2);}}}catch(e){}store.set('layoutVer',LAYOUT_VER);}
// Seit R38 je Strecke: nur Strecken mit geaendertem Layout verlieren Rekorde und Geister
// (Geisterhaus und Sternenbahn bekamen eine Achterbahn), der Rest bleibt erhalten.
// R39: alle Strecken - Schraeg- und Mehrfach-Loopings, laengere Wand- und Ueberkopffahrten.
const TRACK_VER={0:1,1:1,2:1,3:2,4:1,5:2,6:1};
for(const [i,v] of Object.entries(TRACK_VER))if(store.get('trackVer-'+i,0)!==v){try{for(const k of ['tt-','medal-','ghost-','bestlap-'])localStorage.removeItem('mr-'+k+i);for(const cc2 of [50,100,150]){localStorage.removeItem('mr-best-'+i+'-'+cc2);localStorage.removeItem('mr-stars-'+i+'-'+cc2);}}catch(e){}store.set('trackVer-'+i,v);}
const KART_COLORS=[{c:0xff3b30,n:'Ruby / Rot'},{c:0xffc400,n:'Sunny / Gelb'},{c:0x00c2a8,n:'Mint / Türkis'},{c:0x8b5cff,n:'Nova / Violett'},{c:0xffc93c,n:'Goldpilz',gold:true},
 // R44: Lackierungen, die mit der Fahrerstufe freigeschaltet werden
 {c:0x2f8cff,n:'Blitz / Blau',lvl:2},{c:0xff7a1a,n:'Lava / Orange',lvl:3},{c:0x22c55e,n:'Wald / Grün',lvl:5},{c:0xff5fc8,n:'Bonbon / Pink',lvl:7},{c:0xeef1f6,n:'Diamant / Weiß',lvl:10},
 // R65: nur durch Online-Rennen (Anzahl Online-Rennen, progress.mjs ONLINE_UNLOCKS)
 {c:0x5aa9ff,n:'Wiesn Blau-Weiß',onl:1},{c:0xa0602a,n:'Lebkuchen',onl:3},{c:0xff66aa,n:'Pixel-Pink',onl:5},
 {c:0xb4b4c4,n:'Konsolengrau',cheat:true}];
const onlRaces=()=>store.get('prog',{}).onl||0;let crownMine=null;const hasCrown=()=>crownMine??(crownMine=!!store.get('prog',{}).crown);
// R66: Aufsatz (Voxel-Kosmetik) - gewaehlt im Menue, freigeschaltet durch Stufe, Serie, Online-Rennen, Online-Sieg
const TOPPER_IDS=new Set(TOPPERS.map(t=>t.id).filter(id=>id!=='none'));
const topperMe=()=>({level:progLevel(),streakBest:store.get('streak',{}).best||0,onl:onlRaces(),crown:hasCrown(),weekly:store.get('weeklyWins',0),mods:store.get('mods',[]).length});
let topperMine;const myTopper=()=>topperMine!==undefined?topperMine:(topperMine=topperFor(store.get('topper',null),topperMe()));
const topperOk=t=>typeof t==='string'&&TOPPER_IDS.has(t)?t:null;
const progLevel=()=>levelOf(store.get('prog',{xp:0}).xp||0).level;
// R47 Spiegel-Modus (ab Fahrerstufe 3): das Bild wird gespiegelt (auch Schilder, wie im grossen Vorbild), die Lenkung
// entsprechend umgedreht - Strecken und Physik bleiben gleich. Nicht im Zeitfahren und nicht im Wiesnland.
const MIRROR_LVL=3;let mirrorOn=store.get('mirror',false),raceMirror=false;
// Jede Figur faehrt ihr eigenes Kart: Beschleunigung, Hoechsttempo, Grip, Lenkung und Bauform
const DRIVERS=[
 {k:'driver',n:'Pilzi',i:'🍄',kart:'Sporenflitzer',acc:1,top:1,grip:1,turn:1,sc:[1,1,1],tip:'ausgewogen'},
 {k:'driver_turtle',n:'Schildi',i:'🐢',kart:'Panzerwagen',acc:.87,top:1.09,grip:1.07,turn:.93,sc:[1.09,.95,1.05],tip:'schnell, traege'},
 {k:'driver_robot',n:'Volt',i:'🤖',kart:'Voltstoss',acc:1.18,top:.95,grip:1.03,turn:1.03,sc:[.97,1.07,.98],tip:'spurtstark'},
 {k:'driver_cat',n:'Mochi',i:'🐱',kart:'Kurvenkatze',acc:1.05,top:.97,grip:1.02,turn:1.15,sc:[.94,.96,.96],tip:'wendig'},
 // R51 Tux, der Linux-Pinguin: rutscht wie auf Eis (weniger Grip), dafuer schnell und driftfreudig
 {k:'driver_penguin',n:'Tux',i:'🐧',kart:'Kernel-Kufe',acc:.95,top:1.05,grip:.95,turn:1.06,sc:[.98,1,1.02],tip:'rutschig, schnell'},
 // R56 Wiesn-Fahrer (art/r56/create_drivers.py): Bursch in Lederhosn, Madl im Dirndl, Lebkuchenherz, dunkler Braumeister
 {k:'driver_sepp',n:'Sepp',i:'🥨',kart:'Wadlbeißer',acc:1.02,top:1.02,grip:1,turn:.98,sc:[1.02,1,1.02],tip:'kräftig'},
 {k:'driver_vroni',n:'Vroni',i:'👗',kart:'Dirndlflitzer',acc:1.08,top:.98,grip:1.02,turn:1.08,sc:[.97,1,.98],tip:'flink'},
 {k:'driver_lebi',n:'Lebi',i:'💝',kart:'Zuckerguss',acc:1.12,top:.96,grip:1.05,turn:1.04,sc:[.95,.98,.96],tip:'süß & spritzig'},
 {k:'driver_finster',n:'Finster',i:'🎩',kart:'Schwarzbier',acc:.9,top:1.08,grip:1.02,turn:.95,sc:[1.05,.97,1.05],tip:'dunkel & schnell'},
 // R60 Ritter in schwerer Ruestung (Nutzerwunsch, eigener Entwurf, prozedural): traege, aber schwer aus der Spur zu bringen
 {k:'driver_knight',n:'Ritter Kunz',i:'🛡',kart:'Rüstungsrenner',acc:.88,top:1.07,grip:1.07,turn:.94,sc:[1.05,1,1.05],tip:'gepanzert & standfest'}];
const AI_DRIVERS=[0,6,1,5,3,7,2,8,4,9,5,6];
// R55 Online: Zustand der Verbindung (siehe Online-Block unten) und Startaufstellung nach globalem Platz
let net=null,trysteroP=null,battle=null;
// R57 Starterfeld: Rennen mit 12 Karts in Dreierreihen (gleiche Tiefe wie vorher 8 in Zweierreihen), Arena und
// Grafik "Niedrig" bleiben bei 8. Startplatz des Spielers: 6 von 8 bzw. 8 von 12 - der Sieg muss erfahren werden.
const FIELD_MAX=12,gridOrder=n=>n>8?[1,2,3,4,5,6,7,0,8,9,10,11]:[1,2,3,4,5,0,6,7];
let fieldForce=0;const fieldSize=()=>isTT()?1:net&&net.setup?net.setup.n||8:fieldForce||(worldMode||LITE?8:FIELD_MAX);
// R54 Klassen heissen nach Tempo statt Hubraum (intern bleiben 50/100/150)
const CC_NAME={50:'Locker',100:'Flott',150:'Wild'},ccName=c=>CC_NAME[c]||c+'cc';
const AI_NAMES=['Du','Resi','Bramble','Pip','Luna','Mochi','Sunny','Nori','Hias','Kathi','Wastl','Zenzi'],AI_COLORS=[0xff4f8b,0x5cc93a,0xffb800,0x7b61ff,0x1fb0ff,0xff7a1a,0x13b39a,0xd8342c,0x2f5fd0,0xa6d83a,0x9a6a44];
const TRACK_SCALE=1.35,ROAD_HALF=7.6,G=30,G_STICK=74,RAMP_LEN=6.2,RAMP_H=1.15,FAN_COLS=[0xed6350,0xffd45c,0x55bdb2,0xa688dc,0xf1b35a,0xef7160],PLAYER_SLOT=5;
// Weltgroesse (R41): Rennstrecken liegen auf einer Insel mit 210 m Radius, die Open World ist groesser.
// WK skaliert Insel, Meer, Streufelder und Kulisse; AK die Anzahl flaechig gestreuter Deko (hoechstens 4x).
let WK=1,AK=1,hz=null;
const ITEM_ICONS={coins:'🪙',spiky:'🦔',green3:'🟢',red3:'🔴',fake:'❓',boost:'⚡',triple:'⚡',shell:'🥨',banana:'🍌',shield:'🍺',bomb:'💣',mega:'💪',ink:'✒',cannon:'🧨',blue:'🔷'},ITEM_NAMES={coins:'MÜNZREGEN',spiky:'XXL-STACHELPANZER',green3:'BREZN-TRIO GRÜN',red3:'BREZN-TRIO ROT',fake:'FAKE-BLOCK',cannon:'BÖLLERSCHUSS',blue:'BLAUE BREZN',boost:'TURBO',triple:'DREIFACH-TURBO',shell:'SUCH-BREZN',banana:'BANANE',shield:'MASS BIER',bomb:'PILZBOMBE',storm:'GEWITTERWOLKE',mega:'RIESENWUCHS',ink:'TINTENPILZ'};
const ITEM_ART={storm:"<svg viewBox='0 0 48 48'><path d='M14 28a8 8 0 0 1 1-16 11 11 0 0 1 20 2 7 7 0 0 1-1 14z' fill='#5b4f86' stroke='#2b2346' stroke-width='3' stroke-linejoin='round'/><path d='M26 26l-7 10h6l-3 9 10-12h-6l3-7z' fill='#ffe27a' stroke='#b5760c' stroke-width='2' stroke-linejoin='round'/></svg>",empty:"<svg viewBox='0 0 48 48'><path d='M17 17a7 7 0 1 1 9.8 6.4c-1.9.9-2.8 2-2.8 4.1v2' fill='none' stroke='#d8e6dc' stroke-width='5' stroke-linecap='round'/><circle cx='24' cy='37' r='3.2' fill='#d8e6dc'/></svg>",boost:"<svg viewBox='0 0 48 48'><path d='M28 3 10 27h10l-3 18 21-26H27z' fill='#ffe27a' stroke='#b5760c' stroke-width='3' stroke-linejoin='round'/></svg>",triple:"<svg viewBox='0 0 48 48'><path d='M19 4 6 24h7l-2 14 14-18h-7z' fill='#ffe27a' stroke='#b5760c' stroke-width='2.6' stroke-linejoin='round'/><path d='M36 10 25 26h6l-2 12 12-16h-6z' fill='#fff0ad' stroke='#b5760c' stroke-width='2.6' stroke-linejoin='round'/></svg>",shell:"<svg viewBox='0 0 48 48'><path d='M24 40c-6-5-17-9-18-19-.7-7 4-13 10-13 5 0 8 4 8 9 0-5 3-9 8-9 6 0 10.7 6 10 13-1 10-12 14-18 19z' fill='none' stroke='#6e3514' stroke-width='10' stroke-linejoin='round'/><path d='M24 40c-6-5-17-9-18-19-.7-7 4-13 10-13 5 0 8 4 8 9 0-5 3-9 8-9 6 0 10.7 6 10 13-1 10-12 14-18 19z' fill='none' stroke='#c7702e' stroke-width='5.4' stroke-linejoin='round'/><path d='M13 33l22-13M35 33L13 20' stroke='#6e3514' stroke-width='9' stroke-linecap='round'/><path d='M13 33l22-13M35 33L13 20' stroke='#c7702e' stroke-width='4.6' stroke-linecap='round'/><g fill='#fffdf5'><rect x='9' y='14' width='2.4' height='2.4' rx='.6'/><rect x='20' y='11' width='2.4' height='2.4' rx='.6'/><rect x='33' y='12' width='2.4' height='2.4' rx='.6'/><rect x='38' y='22' width='2.4' height='2.4' rx='.6'/><rect x='23' y='24' width='2.4' height='2.4' rx='.6'/><rect x='15' y='30' width='2.4' height='2.4' rx='.6'/><rect x='30' y='31' width='2.4' height='2.4' rx='.6'/></g></svg>",banana:"<svg viewBox='0 0 48 48'><path d='M10 9c1 15 8 25 27 28-3 4-9 5-14 4C11 39 5 28 6 13z' fill='#ffe45c' stroke='#9a7a12' stroke-width='3' stroke-linejoin='round'/><path d='M8 9c-2-2-4-2-5 0' stroke='#6c5a2a' stroke-width='3.4' fill='none' stroke-linecap='round'/></svg>",shield:"<svg viewBox='0 0 48 48'><rect x='9' y='12' width='24' height='31' rx='4' fill='#ffc233' stroke='#6b4a0c' stroke-width='3'/><path d='M33 18h4a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6h-4' fill='none' stroke='#6b4a0c' stroke-width='3.4'/><path d='M8 13c0-5 4-8 8-7 2-3 7-4 10-1 3-2 8-1 9 3 2 1 3 3 2 5z' fill='#fffdf4' stroke='#6b4a0c' stroke-width='2.6' stroke-linejoin='round'/><g fill='#fff3b0' opacity='.9'><circle cx='16' cy='24' r='1.6'/><circle cx='24' cy='32' r='1.3'/><circle cx='19' cy='37' r='1.1'/><circle cx='27' cy='22' r='1.2'/></g><path d='M14 17v22M21 17v22M28 17v22' stroke='#e89a10' stroke-width='1.6' opacity='.55'/></svg>",bomb:"<svg viewBox='0 0 48 48'><circle cx='21' cy='29' r='15' fill='#3b3546' stroke='#14101c' stroke-width='3'/><path d='M30 16c3-6 8-8 12-5' stroke='#a8764a' stroke-width='4' fill='none' stroke-linecap='round'/><path d='M43 8l2-4 2 4-4 1z' fill='#ffb02e'/><circle cx='43.5' cy='10' r='3.6' fill='#ffd45c'/><ellipse cx='16' cy='24' rx='4' ry='2.6' fill='#6a6478' opacity='.8'/></svg>",mega:"<svg viewBox='0 0 48 48'><path d='M24 17C20 9 14 5.5 9 6.5c1 5.5 6.5 9.5 15 10.5z' fill='#4caf50' stroke='#1f6b2a' stroke-width='2.4' stroke-linejoin='round'/><path d='M24 17c4-8 10-11.5 15-10.5-1 5.5-6.5 9.5-15 10.5z' fill='#62c562' stroke='#1f6b2a' stroke-width='2.4' stroke-linejoin='round'/><path d='M24 17c-1-6 0-10 2-13.5' stroke='#1f6b2a' stroke-width='2.4' fill='none' stroke-linecap='round'/><path d='M13 23c0-4.5 4.5-7.5 11-7.5s11 3 11 7.5c0 8-5.5 16-11 23-5.5-7-11-15-11-23z' fill='#fff6f2' stroke='#8a3a4a' stroke-width='3' stroke-linejoin='round'/><path d='M13.6 21c1.6-3.4 5.4-5.5 10.4-5.5s8.8 2.1 10.4 5.5c-3.2 1.7-6.6 2.3-10.4 2.3s-7.2-.6-10.4-2.3z' fill='#ff7aa0'/><path d='M18 29h5M21 35h5' stroke='#d9a3ac' stroke-width='1.8' stroke-linecap='round'/><path d='M41 33V20M36.5 25l4.5-5.5 4.5 5.5' stroke='#ffd45c' stroke-width='3.2' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>",ink:"<svg viewBox='0 0 48 48'><rect x='21.5' y='28' width='5' height='17' rx='2.5' fill='#f4f1ea' stroke='#3a3440' stroke-width='2.2'/><path d='M24 3c7 0 11 8 11 18v6H13v-6C13 11 17 3 24 3z' fill='#f4f1ea' stroke='#3a3440' stroke-width='3' stroke-linejoin='round'/><path d='M17 12l3 2M27 9l3 2M20 19l3 2M28 17l3 2M16 24l3 1M26 24l3 1' stroke='#b9b2a6' stroke-width='2' stroke-linecap='round'/><path d='M13 26h22v3c0 2-1.5 4-2.7 2.2S31 34 29.6 31.5s-1.3 4.5-2.8 1.6-1.4 5-2.8 1.7-1.4 4-2.8.9-1.4 3.3-2.8.4-1.5 2-2.6 0-2.7 1.5-2.9-1z' fill='#15121c'/><path d='M18 40c0 3.4-3.4 3.4-3.4 0l1.7-4.4zM33.4 42c0 3.4-3.4 3.4-3.4 0l1.7-4.4z' fill='#15121c'/></svg>"};
const ITEM_COL={coins:'#ffd23a',spiky:'#9be07a',green3:'#6fe08a',red3:'#ff7a6a',fake:'#f6c23c',storm:'#b7a4ff',boost:'#ffd45c',triple:'#ffd45c',shell:'#f0b46a',banana:'#ffe45c',shield:'#ffc233',bomb:'#ff9a6a',mega:'#ff6b5a',ink:'#c9c2dc'};
const MT_COLORS={mini:0xffc72e,super:0xff6a1a,ultra:0x5ff2ff},MT_LABEL={mini:'FUNKEN-TURBO',super:'GLUT-TURBO',ultra:'BLITZ-TURBO'};

// R57: neuer Standard - Sepp in Lederhosn im Fass-Kart; einmalig auch fuer bestehende Spielstaende, danach frei waehlbar
if(!store.get('def57',false)){store.set('driver',5);store.set('kartStyle','fass');store.set('def57',true);}
let selected=0,colorIndex=0,driverIndex=Math.max(0,Math.min(DRIVERS.length-1,store.get('driver',5)|0)),mode=TEST?'single':'online',menuMode=mode,cc=store.get('class',100),state='menu',elapsed=0,countdown=3,last=0,curve,length=1,course,theme,ctx,frame=0,noticeTimer=0,toastTimer=0;
const loopMiss=[];let boxes=[],racers=[],hazards=[],flags=[],balloons=[],puffs=[],shots=[],ramps=[],pads=[],rings=[],spores=[],swingers=[],gaps=[],boostPads=[],sunPads=[],sporeMesh=null,crowd=null,boostTex=null,foamRing=null,fireflies=null,rails=[],forks=[],raises=[],tunnels=[],agrav=[],loops=[],crystals=[],coasters=[],hpipes=[],ferris=null,dragon=null,elems=[],elemFx=null,owFx=null,worldMode=false,lastRaceSel=0,owPortalAt=null,ridePhoto=null,photoPending=false;
let rainbowTex=null,mapInfo={cx:0,cz:0,k:.6},shake=0,lastPlace=8,leadAt=-99,finishMusicAt=0,soundOn=true,autoGas=false,startPress=-1,prevDrift=false,roulette=null,camFov=62,camH=0,camRoll=0,camRollPrev=0,cer=null,wrongT=0,autopilot=false;
let gp={active:false,race:0,points:{}},gpCup=store.get('cup','brezn'),stats=null,startLights=[],lightState=-1,chevrons=[];
let fworks=[];
// Konfettiregen ueber der Startaufstellung, wenn die Ampel auf Gruen springt (R30)
function dropConfetti(){const cols=[...FAN_COLS,0xffffff,0xffd45c,0xff9ad5];for(let i=0;i<130;i++){const d=-1+Math.random()*12,off=(Math.random()-.5)*13,h=7+Math.random()*4.5;
 try{const p=posAt(d,off,h,new T.Vector3());dropConfettiBit(p.x,p.y,p.z,cols[i%cols.length]);}catch(e){}}}
function setLights(n){if(n===lightState||!startLights.length)return;lightState=n;startLights.forEach((m,i)=>{const on=n===4||i<n;m.emissive.setHex(!on?0x000000:n===4?0x3dff6a:0xff2a1f);m.color.setHex(!on?0x220808:n===4?0x2bd653:0xff3b2f);m.emissiveIntensity=on?2.4:0;});if(n===4)dropConfetti();}
// Feuerwerk ueber dem Sporentor beim Zieleinlauf: drei Raketen gestaffelt (R30)
function planFireworks(){const cols=theme?theme.caps:[0xffd45c];for(let i=0;i<3;i++)fworks.push({at:elapsed+.35+i*.75,off:(i-1)*5,h:11+i*2.4,col:cols[i%cols.length]});}
function burstAt(x,y,z,col){for(let i=0;i<26;i++){const a=i/26*TAU,sp=4.5+random01()*5;emit(x,y,z,col,Math.cos(a)*sp,Math.sin(a*3)*2.2+1.5,Math.sin(a)*sp,.9+random01()*.5);}
 for(let i=0;i<10;i++)emit(x,y,z,0xffffff,(random01()-.5)*7,(random01()-.5)*7,(random01()-.5)*7,.7);}
const random01=()=>Math.random();
let obsGrid=new Map();let zones=[],bats=null,deco=null,r60=null,choco=null,vox=null,owCh=null;
const inZone=(d,pad=0)=>zones.some(z=>Math.abs(wrapDiff(d,z.d))<z.half+pad);
const coarseInput=matchMedia('(pointer:coarse)').matches||(TEST&&new URLSearchParams(location.search).has('mobile')),quality={level:0,dprCap:coarseInput?1:1.25,fpsFrames:0,fpsStart:0};
// Leicht-Modus (R44) fuer Handys, "Sparsam" und Geraete, die frueher bis zur untersten Stufe herunterregeln mussten:
// Lambert statt PBR-Material, keine Schatten, kein Scheinwerfer-Punktlicht, halbe Streudeko. Wird nur beim Start
// festgelegt - Materialtyp oder Schatten mitten im Rennen umzuschalten kompiliert jeden Shader neu (Ruckeln in Runde 1).
const liteFor=g=>g==='low'||(g==='auto'&&(coarseInput||store.get('gfxAuto',0)>=3)),LITE=liteFor(store.get('gfx','auto')),DENS=LITE?.5:1;

// ---------------------------------------------------------------- Renderer & Szene
let renderer;try{renderer=new T.WebGLRenderer({canvas:$('game'),antialias:!coarseInput});}catch(e){$('error').hidden=false;$('error').textContent='Dein Browser benötigt WebGL für dieses 3D-Spiel. Bitte Hardwarebeschleunigung aktivieren und die Seite neu laden.';throw e;}
// Shaderfehler nur im Testmodus pruefen: getProgramInfoLog wartet sonst bei jeder Neukompilierung auf den Treiber
if(renderer)renderer.debug.checkShaderErrors=TEST;
renderer.setPixelRatio(Math.min(devicePixelRatio,quality.dprCap));renderer.shadowMap.enabled=!LITE;renderer.shadowMap.type=T.PCFShadowMap;if(coarseInput)renderer.shadowMap.autoUpdate=false;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
const scene=new T.Scene(),camera=new T.PerspectiveCamera(62,innerWidth/innerHeight,.25,900),worldRoot=new T.Group(),actors=new T.Group();let world=new T.Group();scene.add(worldRoot,actors);worldRoot.add(world);
const hemi=new T.HemisphereLight(0xffffff,0x587540,2);scene.add(hemi);
const sun=new T.DirectionalLight(0xfff7db,3);sun.castShadow=!LITE;sun.shadow.mapSize.set(coarseInput?512:768,coarseInput?512:768);Object.assign(sun.shadow.camera,{left:-48,right:48,top:48,bottom:-48,near:1,far:360});sun.shadow.bias=-.0006;scene.add(sun,sun.target);
const headlight=new T.PointLight(0xfff0d8,0,30,1.4);if(!LITE)scene.add(headlight);
const fill=new T.DirectionalLight(0xbfd4ff,.45);fill.position.set(-60,40,-90);scene.add(fill);
const shaderTime={value:0};
// R48: Takt-Puls (1 auf dem Schlag, faellt bis zum naechsten) fuer Neon-Elemente, die im Rennen mitblinken
const beatPulse={value:0};
function radialSprite(stops,scale,pos){const c=document.createElement('canvas');c.width=c.height=128;const q=c.getContext('2d'),g=q.createRadialGradient(64,64,6,64,64,63);for(const [o,col] of stops)g.addColorStop(o,col);q.fillStyle=g;q.fillRect(0,0,128,128);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(new T.SpriteMaterial({map:t,transparent:true,depthWrite:false,fog:false}));s.scale.set(scale,scale,1);s.position.set(...pos);scene.add(s);return s;}
const sunGlow=radialSprite([[0,'rgba(255,250,230,1)'],[.25,'rgba(255,244,200,.85)'],[1,'rgba(255,244,200,0)']],190,[-320,240,-400]);
const moon=radialSprite([[0,'rgba(255,251,230,1)'],[.45,'rgba(252,243,214,.95)'],[1,'rgba(252,243,214,0)']],95,[230,300,-390]);
const stars=(()=>{const n=700,pos=new Float32Array(n*3);for(let i=0;i<n;i++){const a=Math.random()*TAU,e=Math.acos(Math.random()*.85),r=620;pos[i*3]=Math.sin(e)*Math.cos(a)*r;pos[i*3+1]=Math.cos(e)*r*.9+40;pos[i*3+2]=Math.sin(e)*Math.sin(a)*r;}const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));const p=new T.Points(g,new T.PointsMaterial({color:0xfff6d8,size:2.3,sizeAttenuation:false,fog:false,transparent:true,opacity:.95}));scene.add(p);return p;})();

const mat=(color,extra={})=>stdMat({color,roughness:.8,...extra});
// Standardmaterial bzw. im Leicht-Modus Lambert (gleiche Farben, Texturen, Leuchten, Transparenz; ohne Rauheit/Metall)
function stdMat(p={}){if(!LITE)return new T.MeshStandardMaterial(p);const q={...p};for(const k of ['roughness','metalness','roughnessMap','metalnessMap','envMapIntensity'])delete q[k];return new T.MeshLambertMaterial(q);}
const _lite=new Map();
function toLite(m){if(!LITE||!m||!m.isMeshStandardMaterial)return m;let l=_lite.get(m);if(l)return l;l=new T.MeshLambertMaterial();T.Material.prototype.copy.call(l,m);
 for(const k of ['color','emissive'])l[k].copy(m[k]);for(const k of ['map','alphaMap','emissiveMap','normalMap','bumpMap','lightMap','aoMap','emissiveIntensity','flatShading','fog','wireframe','bumpScale','aoMapIntensity','lightMapIntensity'])if(m[k]!==undefined)l[k]=m[k];
 if(m.normalScale)l.normalScale.copy(m.normalScale);l.userData={...m.userData};if(m.onBeforeCompile!==T.Material.prototype.onBeforeCompile)l.onBeforeCompile=m.onBeforeCompile;_lite.set(m,l);return l;}
function liteRoot(root){if(LITE)root.traverse(o=>{if(o.isMesh||o.isPoints)o.material=Array.isArray(o.material)?o.material.map(toLite):toLite(o.material);});return root;}
const cream=mat(0xffefd5),dark=mat(0x273943),white=mat(0xffffff),gold=mat(0xffdc64);
const shieldMat=new T.ShaderMaterial({uniforms:{uTime:shaderTime},transparent:true,depthWrite:false,blending:T.AdditiveBlending,
 vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
 fragmentShader:'uniform float uTime;varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.-abs(dot(vN,vV)),2.2);vec3 c=mix(vec3(1.,.82,.25),vec3(.5,.95,1.),f);gl_FragColor=vec4(c*(f*1.1+.12+.06*sin(uTime*9.)),1.);}'});
const flameMat=new T.MeshBasicMaterial({color:0xffa531,transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false});
// Bremslichter am Heck - sichtbar auch an den KI-Karts
const brakeMat=new T.MeshBasicMaterial({color:0xff2a18,transparent:true,opacity:.92,blending:T.AdditiveBlending,depthWrite:false});
const brakeGeo=new T.BoxGeometry(.34,.16,.1);
// R53 Ruecklichter (Nutzerwunsch): nachts, auf dunklen Strecken, im Gewitter und im Tunnel gluehen alle Karts hinten rot,
// dazu ein weicher Lichtschein; beim Bremsen leuchtet das Bremslicht zusaetzlich hell darueber.
const tailMat=new T.MeshBasicMaterial({color:0xff3322,transparent:true,opacity:.7,blending:T.AdditiveBlending,depthWrite:false});tailMat.visible=false;
const tailGeo=new T.BoxGeometry(.3,.13,.08),tailHaloGeo=new T.PlaneGeometry(2.2,.8);
const tailHaloMat=new T.MeshBasicMaterial({map:canvasTex(64,32,q=>{for(const x of [18,46]){const g=q.createRadialGradient(x,16,0,x,16,16);g.addColorStop(0,'rgba(255,90,70,1)');g.addColorStop(.4,'rgba(255,40,30,.45)');g.addColorStop(1,'rgba(255,0,0,0)');q.fillStyle=g;q.fillRect(0,0,64,32);}}),transparent:true,opacity:.5,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});tailHaloMat.visible=false;
function addTailLights(g){for(const x of [-.62,.62]){const t=new T.Mesh(tailGeo,tailMat);t.position.set(x,.84,-2.2);t.renderOrder=3;g.add(t);}const h=new T.Mesh(tailHaloGeo,tailHaloMat);h.position.set(0,.84,-2.34);h.rotation.y=Math.PI;h.renderOrder=3;g.add(h);}
// Wie dunkel ist es gerade? Dunkle Themen immer, sonst Nacht/Daemmerung/Finsternis/Gewitter aus dem Wetter, dazu Tunnel
function nightK(){if(theme&&(theme.stars||theme.lavaSea))return 1;const m=wxM;const w=m?(m.night||0)+(m.dusk||0)*.5+(m.eclipse||0)*.8+(m.storm||0)*.35:0;return Math.min(1,w+(tunnelMix||0));}
function tailTick(){const k=nightK(),on=k>.04;tailMat.visible=tailHaloMat.visible=on;if(on){tailMat.opacity=.35+.5*k;tailHaloMat.opacity=.55*k;}}
const shieldGeo=new T.SphereGeometry(1.75,24,16),flameGeo=new T.ConeGeometry(.28,1.3,8);flameGeo.rotateX(-Math.PI/2);flameGeo.translate(0,0,-.65);
// R45: Schild der Rivalen - nur ein duenner Randschimmer statt gefuellter Blase, und je naeher an der Kamera, desto
// durchsichtiger (vorher verdeckte eine Blase direkt vor dem Spieler die halbe Fahrbahn)
const shieldRivalMat=new T.ShaderMaterial({uniforms:{uTime:shaderTime},transparent:true,depthWrite:false,blending:T.AdditiveBlending,
 vertexShader:'varying vec3 vN;varying vec3 vV;varying float vD;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);vD=-mv.z;gl_Position=projectionMatrix*mv;}',
 fragmentShader:'uniform float uTime;varying vec3 vN;varying vec3 vV;varying float vD;void main(){float f=pow(1.-abs(dot(vN,vV)),3.2);float near=smoothstep(5.,16.,vD);vec3 c=mix(vec3(1.,.82,.25),vec3(.5,.95,1.),f);gl_FragColor=vec4(c*f*(.75+.15*sin(uTime*9.))*near,1.);}'});
const persistentMats=new Set([cream,dark,white,gold,shieldMat,shieldRivalMat,flameMat]);

// ---------------------------------------------------------------- GLB-Prototypen (Blender-MCP)
const sharedGeo=new Set([flameGeo,shieldGeo]),sharedMat=new Set(),P={};
// R65: Retro-Voxel-Modelle aus voxel.mjs (Brezn-Trio, Fake-Block, Pixel-Krone) - Geometrie einmal gebaut, danach geteilt
const VOX_DEF={brezn_green:()=>breznModel('green'),brezn_red:()=>breznModel('red'),qfake:()=>qBlockModel(true),qreal:()=>qBlockModel(false),crown:()=>crownModel(),top_heart:()=>topperModel('heart'),top_mug:()=>topperModel('mug'),top_star:()=>topperModel('star'),top_brezn:()=>topperModel('brezn'),top_crown:()=>crownModel(),top_trophy:()=>topperModel('trophy'),top_cart:()=>topperModel('cart'),spiky:()=>spikyShellModel(6)},VOX_SIZE={brezn_green:.1,brezn_red:.1,qfake:.19,qreal:.19,crown:.13,top_heart:.12,top_mug:.12,top_star:.12,top_brezn:.09,top_crown:.13,top_trophy:.12,top_cart:.11,spiky:.22},voxCache={};
const voxMat=new T.MeshLambertMaterial({vertexColors:true});persistentMats.add(voxMat);
function voxGeo(k){if(voxCache[k])return voxCache[k];const m=VOX_DEF[k](),d=voxelMesh(m.vox,m.pal,VOX_SIZE[k]),g=new T.BufferGeometry();
 g.setAttribute('position',new T.BufferAttribute(d.positions,3));g.setAttribute('normal',new T.BufferAttribute(d.normals,3));g.setAttribute('color',new T.BufferAttribute(d.colors,3));g.setIndex(new T.BufferAttribute(d.indices,1));
 g.computeBoundingSphere();sharedGeo.add(g);return voxCache[k]=g;}
function voxObj(k){const m=new T.Mesh(voxGeo(k),voxMat);m.castShadow=true;return m;}
function markShared(root){root.traverse(o=>{if(o.isMesh){sharedGeo.add(o.geometry);for(const m of [].concat(o.material))if(m)sharedMat.add(m);}});}
const KEEP_MATS=new Set(['BodyPaint','CapPaint','StonePaint','MossPaint','WoodPaint','PostPaint','RampPaint','FanCap','GliderPaint','GliderCream','GliderTrim','GliderRope','WindGlow','MagnetPaint','MagnetGlow','TrussPaint','WheelPaint','WheelLights','GondolaPaint','GondolaTrim']);
function mergeByMaterial(root){root.updateMatrixWorld(true);const groups=new Map(),baked=[];let rough=0,metal=0,cnt=0;
 root.traverse(o=>{if(!o.isMesh||Array.isArray(o.material))return;const m=o.material,g=o.geometry.clone().applyMatrix4(o.matrixWorld),em=m.emissive&&m.emissiveIntensity>0&&(m.emissive.r+m.emissive.g+m.emissive.b)>.001;
  if(m.name==='Baked'&&g.attributes.color){const n=g.attributes.position.count;baked.push(g);rough+=(m.roughness??.8)*n;metal+=(m.metalness??0)*n;cnt+=n;return;}
  if(!KEEP_MATS.has(m.name)&&!em&&!m.map&&!m.transparent&&m.opacity>=1&&m.color){const n=g.attributes.position.count,col=new Float32Array(n*3);for(let i=0;i<n;i++){col[i*3]=m.color.r;col[i*3+1]=m.color.g;col[i*3+2]=m.color.b;}g.setAttribute('color',new T.BufferAttribute(col,3));baked.push(g);rough+=(m.roughness??.8)*n;metal+=(m.metalness??0)*n;cnt+=n;return;}
  const key=KEEP_MATS.has(m.name)?'n:'+m.name:m.uuid,e=groups.get(key)||{m,g:[]};e.g.push(g);groups.set(key,e);});
 if(baked.length)groups.set('baked',{m:stdMat({name:'Baked',vertexColors:true,roughness:rough/cnt,metalness:Math.min(.35,metal/cnt)}),g:baked});
 const out=new T.Group();for(const e of groups.values()){const mixed=new Set(e.g.map(g=>!!g.index)).size>1;const gs=e.g.map(g=>{g=mixed&&g.index?g.toNonIndexed():g;if(!g.attributes.normal)g.computeVertexNormals();for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal'&&!(k==='uv'&&e.m.map)&&!(k==='color'&&e.m.vertexColors))g.deleteAttribute(k);return g;});const geo=mergeGeometries(gs,false);if(geo)out.add(new T.Mesh(geo,e.m));else for(const g of gs)out.add(new T.Mesh(g,e.m));}return out;}
let loaded=0;const PROTO_FILES=['kart','mushroom','gate','tree','rock','balloon','itembox','banana','shell','ramp','grandstand','spectator','bouncepad','podium','trophy','ghost','gravestone','pumpkin','kartwheel','driver','driver_turtle','driver_robot','driver_cat','driver_penguin','driver_sepp','driver_vroni','driver_lebi','driver_finster','kartbodies','glider','crystal','windring','kartkit','coin','clouds','inkcap','tunnelkit','windsock'];
// Villa und Burg sind gross und stehen nur auf je einer Strecke: erst nach dem Start nachladen
const LATE_FILES=['voxdome','loisl','choco','voxel','domecity','bayice','cow','eggs','lab','gothic2','fortress','mansion','castle','schloss','wiesn','gothic','roottree','neongate','magnetarch','coastertruss','ferriswheel','dragon','transform','elements','ow','hazards','landmarks','critters','tower'];
// Ohne Materialverschmelzung laden: der Drache braucht seine Teile (Glied, Kopf, Kiefer, Schwanz) einzeln
const NO_MERGE=new Set(['voxdome','loisl','choco','voxel','domecity','bayice','cow','eggs','lab','gothic2','fortress','kartbodies','wiesn','gothic','dragon','transform','elements','ow','kartkit','hazards','landmarks','critters','tower','clouds','tunnelkit']);
// R44: weiche Hoehenschattierung als Vertexfarbe (unten dunkler und kuehler, oben hell) - wirkt auch im Leicht-Modus
// und in den Low-Poly-Fassungen, die Lackfarbe je Instanz (Baumkrone, Pilzhut) bleibt erhalten
function shadeGeo(g,lo,hi,nw=.25){const p=g.attributes.position,n=g.attributes.normal,old=g.attributes.color;g.computeBoundingBox();const b=g.boundingBox,h=Math.max(1e-3,b.max.y-b.min.y),c=new Float32Array(p.count*3);
 for(let i=0;i<p.count;i++){let t=(p.getY(i)-b.min.y)/h*(1-nw)+(n?n.getY(i)*.5+.5:.5)*nw;t=Math.min(1,Math.max(0,t));t=t*t*(3-2*t);for(let k=0;k<3;k++)c[i*3+k]=(lo[k]+(hi[k]-lo[k])*t)*(old?old.getComponent(i,k):1);}
 g.setAttribute('color',new T.BufferAttribute(c,3));}
function shadeProto(root,name,lo,hi,nw){root.traverse(o=>{if(o.isMesh&&o.material&&o.material.name===name){shadeGeo(o.geometry,lo,hi,nw);o.material=o.material.clone();o.material.vertexColors=true;}});return root;}
// Pilz-Unterseite: zeigt nach unten und bekaeme fast nur das gruene Bodenlicht - Normalen schraeg nach aussen/oben biegen,
// damit Lamellen hell wie im Seitenlicht wirken (nur oberhalb von minY, der Stiel bleibt unberuehrt)
function litUnderside(root,minY){const v=new T.Vector3();root.traverse(o=>{const mn=o.material?.name;if(!o.isMesh||(mn!=='Baked'&&mn!=='CapPaint'))return;const p=o.geometry.attributes.position,n=o.geometry.attributes.normal;if(!n)return;
 for(let i=0;i<p.count;i++)if(n.getY(i)<-.4&&p.getY(i)>minY){const x=p.getX(i),z=p.getZ(i),l=Math.hypot(x,z)||1;v.set(x/l*.7,.45,z/l*.7).normalize();n.setXYZ(i,v.x,v.y,v.z);}n.needsUpdate=true;});return root;}
// Wolken: jede der drei Formen einzeln verschmelzen (eine Geometrie je Form fuer die Instanzierung)
function prepClouds(scene){const out=new T.Group();for(let v=0;v<3;v++){const o=scene.getObjectByName('CL_Cloud'+v);if(!o)continue;let mesh=null;mergeByMaterial(o).traverse(q=>{if(q.isMesh&&!mesh)mesh=q;});if(!mesh)continue;shadeGeo(mesh.geometry,[.74,.79,.9],[1.04,1.04,1.04],.35);mesh.name='CL_Cloud'+v;out.add(mesh);}return out;}
const PREP={tree:r=>shadeProto(r,'CapPaint',[.55,.62,.55],[1.1,1.1,1.02]),mushroom:r=>litUnderside(shadeProto(r,'CapPaint',[.68,.64,.64],[1.06,1.06,1.06],.4),1.9),clouds:prepClouds};
// R53 Kart-Glanz: Karts und Fahrer spiegeln ein Studio-Licht (Softboxen, Himmelsverlauf) - Lack mit Klarlack,
// Chrom-Felgen, glaenzende Brillen - und bekommen ein Cartoon-Randlicht in der Himmelsfarbe der Strecke.
// Nur Karts/Fahrer: die Welt behaelt ihr mattes Bilderbuch-Licht. Staerke je Thema ueber zwei geteilte Uniforms.
// [Rauheit hoechstens, Metall mindestens, Spiegel-Anteil]
const KART_LOOK={BodyPaint:[.32,.1,1.1],CapPaint:[.42,0,.85],Rim:[.22,.9,1.3],Gold:[.26,.92,1.25],Brass:[.26,.88,1.2],Glass:[.06,0,1.5],VisorGlass:[.05,0,1.6],Eye:[.16,0,1.1],VoltEye:[.2,0,1],KartLight:[.2,0,1],White:[.45,0,.75],Pink:[.4,0,.8],Dark:[.78,0,.35],Seat:[.58,0,.5],Suit:[.6,0,.55],Scarf:[.68,0,.45],Beak:[.4,0,.7],Feather:[.55,0,.6]};
const kartRim={value:new T.Color(0xffffff)},kartRimK={value:.3},kartEnvK={value:1},looked=new WeakSet();let kartEnvTex=null;
function kartEnv(){if(kartEnvTex)return kartEnvTex;const s=new T.Scene();
 s.add(new T.Mesh(new T.SphereGeometry(20,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,
  vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec3 p;void main(){float y=normalize(p).y;vec3 c=y>0.?mix(vec3(.2,.21,.24),vec3(.3,.35,.44),pow(y,.7)):mix(vec3(.16,.15,.14),vec3(.04,.045,.04),pow(-y,.6));gl_FragColor=vec4(c,1.);}'})));
 const soft=new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide});soft.color.setScalar(3.2);
 for(const [x,y,z,w,h] of [[0,17,0,16,10],[16,5,6,5,12],[-15,4,-8,4,10],[3,6,-17,12,3]]){const q=new T.Mesh(new T.PlaneGeometry(w,h),soft);q.position.set(x,y,z);q.lookAt(0,0,0);s.add(q);}
 const sunM=new T.MeshBasicMaterial({color:new T.Color(0xfff0d0).multiplyScalar(6)}),sunD=new T.Mesh(new T.SphereGeometry(1.4,12,8),sunM);sunD.position.set(9,13,9);s.add(sunD);
 const pm=new T.PMREMGenerator(renderer);kartEnvTex=pm.fromScene(s,.03).texture;pm.dispose();s.traverse(o=>{o.geometry?.dispose();});return kartEnvTex;}
function lookMat(m){if(LITE||!m||!m.isMeshStandardMaterial||looked.has(m))return m;looked.add(m);const L=KART_LOOK[m.name];
 if(L){m.roughness=Math.min(m.roughness,L[0]);m.metalness=Math.max(m.metalness,L[1]);m.envMapIntensity=L[2];}else m.envMapIntensity=.6;
 m.envMap=kartEnv();const prev=m.onBeforeCompile,pk=prev===T.Material.prototype.onBeforeCompile?'':String(prev);
 m.onBeforeCompile=(sh,r)=>{if(pk)prev.call(m,sh,r);sh.uniforms.uRim=kartRim;sh.uniforms.uRimK=kartRimK;sh.uniforms.uEnvK=kartEnvK;
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uRim;uniform float uRimK,uEnvK;')
   .replace('#include <lights_fragment_maps>','#include <lights_fragment_maps>\nradiance*=uEnvK;clearcoatRadiance*=uEnvK;iblIrradiance*=uEnvK*.3;')
   .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n{float fr=pow(1.0-saturate(dot(normal,geometryViewDir)),3.0);totalEmissiveRadiance+=uRim*fr*uRimK;}');};
 m.customProgramCacheKey=()=>'kartlook'+pk;m.needsUpdate=true;return m;}
function kartLook(root){if(!LITE&&root)root.traverse(o=>{if(o.isMesh)o.material=Array.isArray(o.material)?o.material.map(lookMat):lookMat(o.material);});return root;}
// Lack der Karosserie mit Klarlack (MeshPhysical): kraeftiger Glanz ueber der Farbe, auch bei Instanz-Farben
function clearcoatRoot(root){if(LITE)return root;root.traverse(o=>{if(!o.isMesh||o.material?.name!=='BodyPaint'||o.material.isMeshPhysicalMaterial)return;const s=o.material,p=new T.MeshPhysicalMaterial();T.MeshStandardMaterial.prototype.copy.call(p,s);p.defines={STANDARD:'',PHYSICAL:''};p.clearcoat=1;p.clearcoatRoughness=.12;o.material=p;});return root;}
for(const k of ['kartbodies','kart','kartkit','kartwheel','driver','driver_turtle','driver_robot','driver_cat','driver_penguin','driver_sepp','driver_vroni','driver_lebi','driver_finster'])PREP[k]=r=>kartLook(k==='kart'||k==='kartkit'||k==='kartbodies'?clearcoatRoot(r):r);
// R54 Pilzi in Tracht: gruene Weste und rotes Halstuch statt blau-gelb (eigenstaendiger Look). Vor dem
// Verschmelzen umfaerben - danach stecken die Farben in den Vertexfarben.
const PRE_MERGE={driver:r=>{applyTint(r,'Suit',0x3f7a44);applyTint(r,'Scarf',0xd0342c);}};
// Je Thema: Spiegelung am Tag voll, nachts gedaempft; Randlicht in der Himmelsfarbe, nachts kraeftiger
function kartLookTheme(){const dark=!!theme.stars||!!theme.lavaSea;kartEnvK.value=dark?.6:1;kartRimK.value=dark?.5:.18;kartRim.value.setHex(theme.hemiSky).lerp(new T.Color(0xffffff),dark?.25:.55);}
// Asset-Laden robust (R31): schlug eine GLB beim ersten Versuch fehl (Deploy-Propagation,
// Mobile-Netz), blieben die Block-Fallbacks fuer den Rest der Sitzung - Fahrer und Tor
// als Bloeke. Jetzt zwei Wiederholungen mit Abstand, und wenn ein Prototyp nachtraeglich
// doch ankommt, wird die Strecke im Menue neu gebaut.
// Vergleiche den ersten Weltaufbau mit dem spaeteren Ladeabschluss: nur echte
// Wiederherstellung darf Fallback-Welten ersetzen, nicht ein dauerhafter Fehler.
function createPrototypeRecovery(names,prototypes,onRecovered){
 let missing=null,handled=false;
 return {snapshot(){if(missing===null)missing=names.filter(name=>!prototypes[name]);},
  settle(){if(handled||missing===null||!missing.some(name=>!!prototypes[name]))return false;
   handled=true;onRecovered();return true;}};
}
// Leicht-Modus: Low-Poly-Fassungen aus art/r44/make_lod.py (Blender Decimate, gleiche Objekt- und Materialnamen)
const LO_FILES=new Set(['balloon', 'castle', 'rock', 'coastertruss', 'coin', 'dragon', 'driver', 'driver_cat', 'driver_robot', 'driver_turtle', 'elements', 'ferriswheel', 'gate', 'ghost', 'glider', 'grandstand', 'gravestone', 'itembox', 'kart', 'kartkit', 'kartwheel', 'mansion', 'mushroom', 'pumpkin', 'roottree', 'spectator', 'tree', 'clouds']);
function loadProto(name){return new Promise(resolve=>{
 const tryLoad=attempt=>{new GLTFLoader().load(`assets/${LITE&&LO_FILES.has(name)?'lo/':''}${name}.glb`,g=>{PRE_MERGE[name]?.(g.scene);let root=NO_MERGE.has(name)?g.scene:mergeByMaterial(g.scene);if(PREP[name])root=PREP[name](root);const merged=liteRoot(root);markShared(merged);P[name]=merged;progress();resolve();},undefined,
  ()=>{if(attempt<2){setTimeout(()=>tryLoad(attempt+1),1200);}else{P[name]=null;progress();resolve();}});};
 tryLoad(0);});}
function progress(){loaded++;const el=$('loaderBar');if(el)el.style.width=Math.round(loaded/PROTO_FILES.length*100)+'%';}
function cloneProto(proto){const c=proto.clone(true);c.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return c;}
function applyTint(root,name,color,extra){root.traverse(o=>{if(!o.isMesh)return;const fix=m=>{if(m&&m.name===name){const c=m.clone();c.color=new T.Color(color);if(extra)Object.assign(c,extra);if(extra?.emissiveColor){c.emissive=new T.Color(extra.emissiveColor);}return c;}return m;};o.material=Array.isArray(o.material)?o.material.map(fix):fix(o.material);});}
function scatterInstanced(proto,list,tint,chunk=0){if(!proto||!list.length)return;
 if(chunk){const cells=new Map();for(const t of list){const k=Math.floor(t.x/chunk)+','+Math.floor(t.z/chunk);let c=cells.get(k);if(!c)cells.set(k,c=[]);c.push(t);}if(cells.size>1){for(const l of cells.values())scatterInstanced(proto,l,tint,0);return;}}const meshes=[];proto.traverse(o=>{if(o.isMesh&&!Array.isArray(o.material))meshes.push(o);});const m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),s=new T.Vector3(),v=new T.Vector3();for(const src of meshes){let material=src.material;const tv=tint?tint[material.name]:undefined;if(tv!==undefined&&tv!==null){material=material.clone();if(typeof tv==='object'){material.color=new T.Color(tv.color);if(tv.emissive!==undefined){material.emissive=new T.Color(tv.emissive);material.emissiveIntensity=tv.emissiveIntensity??1;}}else material.color=new T.Color(tv);}const inst=new T.InstancedMesh(src.geometry,material,list.length);inst.castShadow=true;inst.receiveShadow=true;list.forEach((t,i)=>{e.set(0,t.ry||0,0);q.setFromEuler(e);const sw=t.s*(t.sx||1);s.set(sw,t.s*(t.sy||1),sw);m.compose(v.set(t.x,t.y||0,t.z),q,s);inst.setMatrixAt(i,m);});inst.instanceMatrix.needsUpdate=true;world.add(inst);}}

// ---------------------------------------------------------------- Hilfsfunktionen
function mesh(geo,material,parent,x=0,y=0,z=0){const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function sphere(parent,material,x,y,z,sx,sy=sx,sz=sx){const m=mesh(new T.SphereGeometry(1,14,10),material,parent,x,y,z);m.scale.set(sx,sy,sz);return m;}
function box(parent,material,x,y,z,a,b,c){return mesh(new T.BoxGeometry(a,b,c),material,parent,x,y,z);}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const hex=c=>'#'+new T.Color(c).getHexString();
function canvasTex(w,h,draw,repeat=false){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;if(repeat)t.wrapS=t.wrapT=T.RepeatWrapping;return t;}
function label(text,bg='#fff1d9',fg='#28523c',w=512,h=128){const tex=canvasTex(w,h,(q)=>{q.fillStyle=bg;q.fillRect(0,0,w,h);q.fillStyle=fg;q.font=`900 ${Math.round(h*.52)}px Trebuchet MS`;q.textAlign='center';q.textBaseline='middle';q.fillText(text,w/2,h/2);});return new T.MeshBasicMaterial({map:tex,side:T.DoubleSide});}
function skyTexture(top,bottom){return canvasTex(2,256,(q)=>{const g=q.createLinearGradient(0,0,0,256);g.addColorStop(0,top);g.addColorStop(.62,bottom);g.addColorStop(1,bottom);q.fillStyle=g;q.fillRect(0,0,2,256);});}
const speckCache=new Map();
function speckleTexture(base,spot,density=1200,size=256){const key=[base,spot,density,size].join();let t=speckCache.get(key);if(!t){t=speckleTextureRaw(base,spot,density,size);speckCache.set(key,t);}return t;}
function speckleTextureRaw(base,spot,density,size){return canvasTex(size,size,(q)=>{q.fillStyle=base;q.fillRect(0,0,size,size);for(let i=0;i<density;i++){q.globalAlpha=.12+Math.random()*.25;q.fillStyle=Math.random()<.55?spot:'#00000022';q.fillRect(Math.random()*size,Math.random()*size,2,2);}q.globalAlpha=1;},true);}
function clearGroup(g,keep){if(keep&&keep.parent===g)g.remove(keep);const disposed=new Set();g.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.isMesh||o.isPoints){if(o.geometry&&!sharedGeo.has(o.geometry))o.geometry.dispose();for(const m of [].concat(o.material)){if(m&&!persistentMats.has(m)&&!sharedMat.has(m)&&!disposed.has(m)){m.map?.dispose();m.emissiveMap?.dispose?.();m.dispose();disposed.add(m);}}}});g.clear();if(keep)g.add(keep);}
const HC={};function setText(id,v){if(HC[id]!==v){HC[id]=v;const e=$(id);if(e){e.textContent=v;
 // Countdown und Einblendungen springen bei jedem neuen Text kurz auf (R41)
 if(id==='message'&&v){e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');}}}}
function notice(text,duration=1.3){setText('message',text);noticeTimer=duration;}
function toast(text,duration=1.4,cls=''){const el=$('toast');el.textContent=text;el.className='show '+cls;toastTimer=duration;}

// ---------------------------------------------------------------- Strecke: Tabelle, Projektion, Hoehe
const PS=2048,newTP=()=>({x:new Float32Array(PS),z:new Float32Array(PS),tx:new Float32Array(PS),tz:new Float32Array(PS),k:new Float32Array(PS),v:new Float32Array(PS),vd:new Float32Array(PS),h:new Float32Array(PS),b:new Float32Array(PS),rl:new Float32Array(PS),lf:new Float32Array(PS)});let TP=newTP();
const lapDist=d=>((d%length)+length)%length;
const wrapDiff=(a,b)=>((a-b)%length+length*1.5)%length-length/2;
const smooth=(e0,e1,x)=>{const t=clamp((x-e0)/(e1-e0),0,1);return t*t*(3-2*t);};
function buildTable(){for(let i=0;i<PS;i++){const u=i/PS,p=curve.getPointAt(u),t=curve.getTangentAt(u).normalize();TP.x[i]=p.x;TP.z[i]=p.z;TP.tx[i]=t.x;TP.tz[i]=t.z;}
 const ds=length/PS,raw=new Float32Array(PS);for(let i=0;i<PS;i++){const j=(i+1)%PS;raw[i]=(TP.tz[i]*TP.tx[j]-TP.tx[i]*TP.tz[j])/ds;}
 for(let i=0;i<PS;i++){let s=0;for(let k=-8;k<=8;k++)s+=raw[(i+k+PS)%PS];TP.k[i]=s/17;}
 for(let i=0;i<PS;i++){let m=0;for(let k=-3;k<=3;k++)m=Math.max(m,Math.abs(TP.k[(i+k+PS)%PS]));TP.v[i]=maxCornerSpeed(m);TP.vd[i]=maxCornerSpeed(m,true);}}
// Globale Projektion eines Weltpunkts auf die Strecke (nur beim Bauen); im Rennen lokale Suche um die letzte Position.
// Grob (jede 4. Stuetzstelle) + fein; mit Hoehe (y), damit an Kreuzungen/Bruecken die richtige Ebene gewinnt
function projectGlobal(x,z,y){let best=0,bd=1e18;const hy=y!==undefined;for(let i=0;i<PS;i+=4){const dx=x-TP.x[i],dz=z-TP.z[i];let d2=dx*dx+dz*dz;if(hy){const dy=y-TP.h[i];d2+=dy*dy*4;}if(d2<bd){bd=d2;best=i;}}
 const c=best;for(let k=-4;k<=4;k++){const i=((c+k)%PS+PS)%PS,dx=x-TP.x[i],dz=z-TP.z[i];let d2=dx*dx+dz*dz;if(hy){const dy=y-TP.h[i];d2+=dy*dy*4;}if(d2<bd){bd=d2;best=i;}}return best*length/PS;}
function project(x,z,hintD){const ds=length/PS,i0=Math.round(lapDist(hintD)/ds);let best=i0%PS,bd=1e18;for(let k=-60;k<=60;k++){const i=((i0+k)%PS+PS)%PS,dx=x-TP.x[i],dz=z-TP.z[i],d2=dx*dx+dz*dz;if(d2<bd){bd=d2;best=i;}}
 // Auf das Segment projizieren, nicht auf die Stuetzstelle: sonst springen Streckenmeter und
 // Querversatz bei jedem Stuetzstellenwechsel (alle ~0,5 m, bei Tempo fast jedes Bild). In einer
 // Rollzone steht die Fahrbahn senkrecht, dort wird aus jedem Versatzsprung ein Hoehensprung.
 let bi=best,bt=0,bq=1e18;
 for(const i of [(best-1+PS)%PS,best]){const j=(i+1)%PS,ex=TP.x[j]-TP.x[i],ez=TP.z[j]-TP.z[i],el=ex*ex+ez*ez||1;
  const t=clamp(((x-TP.x[i])*ex+(z-TP.z[i])*ez)/el,0,1),qx=x-TP.x[i]-ex*t,qz=z-TP.z[i]-ez*t,q=qx*qx+qz*qz;
  if(q<bq){bq=q;bi=i;bt=t;}}
 const j=(bi+1)%PS;let tx=TP.tx[bi]+(TP.tx[j]-TP.tx[bi])*bt,tz=TP.tz[bi]+(TP.tz[j]-TP.tz[bi])*bt;
 const tl=Math.hypot(tx,tz)||1;tx/=tl;tz/=tl;
 const dx=x-(TP.x[bi]+(TP.x[j]-TP.x[bi])*bt),dz=z-(TP.z[bi]+(TP.z[j]-TP.z[bi])*bt);
 return {d:lapDist((bi+bt)*ds+dx*tx+dz*tz),off:dx*tz-dz*tx};}
function tIdx(d){const f=lapDist(d)/length*PS,i=Math.floor(f)%PS;return [i,(i+1)%PS,f-Math.floor(f)];}
function trackAt(d){const [i,j,k]=tIdx(d);return {h:TP.h[i]+(TP.h[j]-TP.h[i])*k,b:TP.b[i]+(TP.b[j]-TP.b[i])*k,kap:TP.k[i],v:TP.v[i],vd:TP.vd[i]};}
function slopeAt(d){return (trackAt(d+1.5).h-trackAt(d-1.5).h)/3;}
const _tan={x:0,z:0,b:0},_sp=new T.Vector3();
function tanAt(d){const [i,j,k]=tIdx(d);let tx=TP.tx[i]+(TP.tx[j]-TP.tx[i])*k,tz=TP.tz[i]+(TP.tz[j]-TP.tz[i])*k;const tl=Math.hypot(tx,tz)||1;_tan.x=tx/tl;_tan.z=tz/tl;_tan.b=TP.b[i]+(TP.b[j]-TP.b[i])*k;return _tan;}
// ---------- Anti-Grav und Looping: beides dreht die Fahrbahn um die Fahrtrichtung bzw. die
// Querachse. Beide Winkel werden analytisch gerechnet, nicht aus der Tabelle interpoliert: eine
// Tabelle mit PS Stuetzstellen macht die Drehrate treppenfoermig (bei Tempo rund 60 Spruenge je
// Sekunde) - genau das sieht man als Ruckeln. sstep ist C2-glatt, damit auch die Drehbeschleunigung
// an den Raendern stetig ist; ein normales smoothstep hat dort noch einen Knick.
const sstep=u=>{const t=clamp(u,0,1);return t*t*t*(t*(t*6-15)+10);};
function loopAt(d){if(!loops.length)return null;for(const q of loops)if(lapDist(d-q.s)<=q.span)return q;return null;}
function nearLoop(d){if(!loops.length)return false;for(const q of loops)if(lapDist(d-q.s+25)<=q.span+50)return true;return false;}
// Loopings (R39, loop.mjs): Schraeg-Loopings mit einer oder mehreren Windungen. Jede Windung ist
// zur Seite geneigt - Ein- und Ausfahrt ziehen aneinander vorbei statt sich zu schneiden, und die
// Ausfahrt schliesst ohne Sprung an die Strasse an (vorher lag sie 0,34 R vor der Strasse danach).
const sdot=u=>{const t=clamp(u,0,1);return 30*t*t*(1-t)*(1-t);};     // Ableitung von sstep
const _loopState={q:null,th:0,a:0,b:0,lat:0,tf:1,tu:0,tl:0,nf:0,nu:1,k:1,pitch:0};
function loopFrame(q,d){const st=loopFrameAt(q,clamp(lapDist(d-q.s),0,q.span),_loopState);st.q=q;return st;}
// Streckung an dieser Stelle: so viele Bildmeter je Fahrbahnmeter.
function loopStretch(q,st){return st.k;}
// Rollprofil: immer dieselbe Drehrichtung. 'roll' dreht glatt einmal durch; 'wall' und 'over'
// drehen ein, halten den Winkel ein Stueck (Wandfahrt bzw. kopfueber) und drehen dann in
// derselben Richtung bis zur vollen Umdrehung weiter. Eindrehen und wieder Zurueckdrehen war
// der Grund, warum sich das Kart im Korkenzieher verkantete.
// R39: das Profil ist eine Folge aus Drehungen und Haltephasen (loop.mjs) - dazu gekommen sind
// lange Wandfahrt (wallrun), lange Ueberkopffahrt (ceiling), Wandwechsel ueber Kopf (switch) und
// der Rundgang ueber alle vier Seiten (tour).
function rollAt(d){let ph=0;
 for(const q of agrav){const rel=lapDist(d-q.s);if(rel>q.span)continue;ph+=agravRoll(q.seg,rel/q.span)*q.sgn;}
 return ph;}
// Sichthub: hebt nur das Bild der Fahrbahn an, damit die gedrehte Bahn frei ueber dem Boden schwebt.
// Abbau seit R26 ueber die letzten 38 % statt 30 %: die 12,5-m-Absenkung am Zonenaustritt
// verteilte sich vorher auf zu wenige Meter - am Uebergang mass der Fahrfluss einen
// Geschwindigkeitswechsel von 13 m/s (sicht- und spuerbarer Ruck).
function liftAt(d){let lf=0;
 for(const q of agrav){const rel=lapDist(d-q.s);if(rel>q.span)continue;const u=rel/q.span;
  lf+=q.lift*sstep(u/.3)*(1-sstep((u-.62)/.38));}
 return lf;}
const hasRoll=d=>(agrav.length&&Math.abs(rollAt(d))>.004)||(loops.length&&!!loopAt(d));
// ---------- Magnet-Achterbahn (R38): Katapult und Airtime-Huegel. Wie Rollzone und Looping nur im
// Bild - gefahren wird flach. Profil, Energie und Airtime kommen aus coaster.mjs (ohne Browser getestet).
// ---------- Elemente-Parcours (R39, elem.mjs): See, Tauchgang und Flug. Wie Looping und Achterbahn
// nur im Bild - gefahren wird flach. Das Kart verwandelt sich je nach Element (Boot, Tauchboot, Flugzeug).
function elemAt(d,pad=0){if(!elems.length)return null;for(const z of elems)if(lapDist(d-z.s+pad)<=z.span+2*pad)return z;return null;}
const _est={wl:0,dep:0,fly:0,hide:false,form:'kart',piece:null,z:null};
// Zustand an Streckenmeter d (geteiltes Objekt - Werte sofort uebernehmen)
function elemSt(d){const z=elemAt(d);_est.z=z;if(!z){_est.wl=_est.dep=_est.fly=0;_est.hide=false;_est.form='kart';_est.piece=null;return _est;}elemState(z.plan,lapDist(d-z.s),_est);return _est;}
function elemH(d){const st=elemSt(d);if(!st.z)return 0;const [i,j,k]=tIdx(d);return elemHeight(st,TP.h[i]+(TP.h[j]-TP.h[i])*k,st.z.water);}
// ---------- Halfpipe (R52, halfpipe.mjs): U-foermiger Querschnitt - wie Looping und Rollzone nur im Bild, gefahren
// wird flach; der Querversatz ist die Bogenlaenge ueber Boden und Wand, ueber der Lippe geht es senkrecht hoch.
function hpAt(d,pad=0){if(!hpipes.length)return null;for(const z of hpipes)if(lapDist(d-z.s+pad)<=z.span+2*pad)return z;return null;}
const hpEnvAt=(z,d)=>hpEnv(lapDist(d-z.s),z.span),_hpp={},_hpq={};
// Belegte Abschnitte einer Strecke in Metern [von, bis] - alles, was neben oder auf der Fahrbahn steht oder sie verbiegt
function courseBusy(){const c=course,cd=v=>cpDist(v),out=[],pt=(v,r,k)=>out.push([cd(v)-r,cd(v)+r,k]);
 for(const k of ['tunnel','raise','agrav','coaster','fork','elem','cows','hands','meteors','dunes'])for(const q of c[k]||[])out.push([cd(q[0])-8,cd(q[1])+8,k]);
 if(c.plateau)out.push([cd(c.plateau[0])-8,cd(c.plateau[1])+8,'plateau']);
 for(const [v,L] of c.gaps||[])pt(v,L/2+24,'gap');
 for(const [v] of c.builds||[])pt(v,30,'build');
 for(const v of [c.mansion,c.castle])if(v!==undefined)pt(v,50,'house');
 for(const [v] of (c.pipes||[]).concat(c.beatgates||[],c.stampers||[],c.swing||[],c.cannons||[],c.towers||[],c.twisters||[]))pt(v,18,'fig');
 for(const [v,,r=8] of c.sand||[])pt(v,r+8,'sand');
 if(c.train)pt(c.train[0],50,'train');
 for(const [v] of c.portals||[])pt(v,45,'portal');
 for(const [v] of c.pswitch||[])pt(v,40,'pswitch');
 for(const q of loops)out.push([q.s-12,q.s+q.span+12,'loop']);
 for(const z of elems)out.push([z.s-10,z.s+z.span+10,'elemz']);
 out.push([length-45,length+30,'start']);
 return out;}
function coasterAt(d){if(!coasters.length)return null;for(const c of coasters)if(lapDist(d-c.s)<=c.span)return c;return null;}
const _cpf={h:0,s:0,k:0};
// Profil an Streckenmeter d (geteiltes Objekt - Werte sofort uebernehmen)
function coasterP(d){const c=coasterAt(d);if(!c){_cpf.h=_cpf.s=_cpf.k=0;return _cpf;}return coasterProfile(c.spec,lapDist(d-c.s),_cpf);}
const coasterH=d=>coasters.length?coasterP(d).h:0;
// R39: Twists und Steilkurven. Liefert den Drehwinkel um die Fahrtrichtung und schreibt die Drehachse
// nach out (L = seitlich: Innenkante der Steilkurve, A = Hoehe ueber der Bahn: Korkenzieher um den
// Drachen). Die Steilkurven-Neigung kommt aus der vorab geglaetteten Kruemmung (c.bankArr je Meter).
const _tw={ph:0,axis:0},_rax={L:0,A:0},_rax2={L:0,A:0},_rax3={L:0,A:0};
function coasterRoll(d,out=_rax){out.L=0;out.A=0;const c=coasterAt(d);if(!c)return 0;
 const x=lapDist(d-c.s);twistAt(c.spec,x,_tw);let ph=_tw.ph;
 const ba=c.bankArr;if(ba){const i=Math.max(0,Math.min(ba.length-2,x|0)),f=clamp(x-i,0,1),b=(ba[i]+(ba[i+1]-ba[i])*f)*bankEnvelope(c.spec,x);
  if(Math.abs(b)>1e-5){ph+=b;out.L=bankAxis(b);return ph;}}
 out.A=_tw.axis;return ph;}
// R50 Kamera-Anteil der Achterbahn-Rolle: Steilkurven-Neigung zu 40 %, Schrauben laufen verzoegert, aber ganz mit
// (s^2,32 - in der Mitte ~40 % wie bisher). Mit festen 40 % stand die Kamera nach einer 360-Grad-Schraube bei 144 Grad:
// kopfueber und unter der Bahn, bis die Zone endete (Drachen-Spirale der Magnet-Kirmes, Nutzerhinweis).
function coasterCamRoll(d){const c=coasterAt(d);if(!c)return 0;const x=lapDist(d-c.s);let ph=0;
 for(const r of c.spec.rolls||[]){const u=(x-(r.c-r.w))/(2*r.w);if(u>0)ph+=r.sgn*r.turns*TAU*Math.pow(sstep(u),2.32);}
 const ba=c.bankArr;if(ba){const i=Math.max(0,Math.min(ba.length-2,x|0)),f=clamp(x-i,0,1);ph+=.4*(ba[i]+(ba[i+1]-ba[i])*f)*bankEnvelope(c.spec,x);}
 return ph;}
// Gesamte Rolle einer Stelle (Rollzone + Achterbahn) - fuer Kart, Kamera, Leitplanken
const rollTot=d=>(agrav.length?rollAt(d):0)+(coasters.length?coasterRoll(d,_rax2):0);
// Magnetbahn allgemein: Rollzone, Looping oder Achterbahn - dort haelt die Bahn, daneben ist nichts
const magOn=()=>agrav.length>0||loops.length>0||coasters.length>0||elems.length>0;
const hasMag=d=>hasRoll(d)||(coasters.length>0&&!!coasterAt(d))||(elems.length>0&&!!elemAt(d));
// Fahrt eines Karts durch die Achterbahn: Einstieg, Katapult (jeder Magnetbogen schiebt genau einmal),
// Magnettempo danach, Airtime an den Kuppen. Rueckgabe: Vorschubfaktor fuer driveKart (Energie aus
// der Hoehe und laengerer Bildweg am Hang). Bergauf wird es langsamer, bergab schneller.
const _cpr={h:0,s:0,k:0};
function coasterRide(r,cz,me){const x=lapDist(r.distance-cz.s);
 if(r.czRun?.c!==cz)r.czRun={c:cz,arch:0,maxOff:0,airHills:0,air:[],hit:false,launched:false,noRating:!cz.spec.hills.length};
 const run=r.czRun;
 while(run.arch<cz.archX.length&&x>=cz.archX[run.arch]){
  const k=launchKick(r.speed);if(k>0){r.vx+=Math.sin(r.h)*k;r.vz+=Math.cos(r.h)*k;r.speed+=k;}
  cz.flash[run.arch]=Math.max(cz.flash[run.arch],me?1:.5);
  if(me){if(run.arch===0){toast('MAGNET-KATAPULT!',1.3,'good');SFX.launch();shake=Math.max(shake,.22);if(!r.saidLaunch){r.saidLaunch=true;say('launch');}}else SFX.zap(run.arch);}
  if(nearPlayer(r,50)){const p=r.mesh.position;for(let i=0;i<8;i++){const a=Math.random()*TAU;emit(p.x,p.y+.6,p.z,0x7cf3ff,Math.sin(a)*4-Math.sin(r.h)*9,1+Math.random()*3,Math.cos(a)*4-Math.cos(r.h)*9,.35);}}
  run.arch++;run.launched=true;}
 // Die Magnetbahn traegt nach dem Abschuss weiter: Hoechsttempo bleibt oben wie auf einer echten Abschussbahn
 if(run.launched&&!r.air&&Math.abs(r.speed)>5)r.boost=Math.max(r.boost,.3);
 if(r.stun>0)run.hit=true;
 run.maxOff=Math.max(run.maxOff,Math.abs(r.offset));
 const p=coasterProfile(cz.spec,x,_cpr),f=coasterSpeedFactor(p),gl=coasterG(p,Math.abs(r.speed)*f.vis);
 r.czG=gl;r.czFloat=r.air?0:airtimeFloat(gl);r.czVis=f.vis;
 // On-Ride-Foto (R38): wie bei echten Achterbahnen blitzt es an der ersten Abfahrt - einmal je Rennen
 if(me&&!ridePhoto&&!photoPending&&state==='race'){const q=cz.spec.hills[0];if(q&&x>q.c+q.w*.12&&x<q.c+q.w*.5)photoPending=true;}
 if(r.czFloat>.04){const hi=cz.spec.hills.findIndex(q=>Math.abs(x-q.c)<q.w*.6);
  if(hi>=0&&!run.air.includes(hi)){run.air.push(hi);run.airHills++;
   if(me){stats.airtime=(stats.airtime||0)+1;toast(run.airHills>1?'AIRTIME ×'+run.airHills+'!':'AIRTIME!',.9,'good');SFX.airtime();}}}
 return f.move;}
// Ausfahrt: nur wer die Zone wirklich am Ende verlaesst (nicht per Rettungspilz), bekommt die Wertung
function coasterExit(r,me){const run=r.czRun;r.czRun=null;r.czFloat=0;r.czG=1;r.czVis=1;
 if(!run||r.finishTime!==null)return;const past=wrapDiff(r.distance,run.c.e);if(past<0||past>40)return;
 const rt=coasterRating(run);if(!rt)return;
 r.boost=Math.max(r.boost,rt.boost);r.spores=Math.min(MAX_SPORES,(r.spores||0)+rt.spores);
 if(me){stats.coasters=(stats.coasters||0)+1;toast(rt.label,1.4,'good');SFX.boost();
  // Ansage nicht jede Runde: erste Super-Wertung und in der letzten Runde
  if(rt.spores>1&&(!r.saidCoaster||lap(r,length)===LAPS)){r.saidCoaster=true;say('coaster');}}}
// Zum Ende einer Rollzone hin enger fuehren: wer dort noch weit aussen haengt, faellt beim
// Austritt neben die Bahn - auf der Sternenbahn ins Leere.
function rollFree(d,base){let f=1;
 for(const q of agrav){const rel=lapDist(d-q.s);if(rel>q.span)continue;const u=rel/q.span;
  if(u>.72)f=Math.min(f,1-(u-.72)/.28*.55);}
 return base*f;}
// Ein einziger Weg von (Streckenmeter, Querversatz, Hoehe ueber der Bahn) ins Bild - flach,
// gerollt und im Looping. Bei Rollwinkel 0 und ausserhalb des Loopings faellt alles auf die
// flache Formel zusammen, deshalb gibt es an den Uebergaengen keinen Sprung.
function posAt(d,off,h,out){const [i,j,k]=tIdx(d),x=TP.x[i]+(TP.x[j]-TP.x[i])*k,z=TP.z[i]+(TP.z[j]-TP.z[i])*k;
 let tx=TP.tx[i]+(TP.tx[j]-TP.tx[i])*k,tz=TP.tz[i]+(TP.tz[j]-TP.tz[i])*k;const tl=Math.hypot(tx,tz)||1;tx/=tl;tz/=tl;
 const bb=TP.b[i]+(TP.b[j]-TP.b[i])*k,hh=TP.h[i]+(TP.h[j]-TP.h[i])*k+(agrav.length?liftAt(d):0)+(coasters.length?coasterH(d):0)+(elems.length?elemH(d):0);
 // Halfpipe (R52): Querversatz = Bogenlaenge ueber den U-Querschnitt, die Normale kippt mit der Wand
 if(hpipes.length&&Math.abs(off)<HP.outer){const hz=hpAt(d);if(hz){hpProfile(off,hpEnvAt(hz,d),_hpp);const c=Math.cos(_hpp.phi),sn=Math.sin(_hpp.phi),lat=_hpp.lat,up=_hpp.up;
  return out.set(x+tz*lat-tz*sn*h,hh-bb*lat+up+(c+bb*sn)*h,z-tx*lat+tx*sn*h);}}
 const ph=(agrav.length?rollAt(d):0)+(coasters.length?coasterRoll(d,_rax):0),cr=Math.cos(ph),sr=Math.sin(ph);
 const qx=tz*cr,qy=sr-bb*cr,qz=-tx*cr;                 // Querachse der Fahrbahn
 let nx=-tz*sr,ny=cr+bb*sr,nz=tx*sr,ax=0,ay=0,az=0;    // Flaechennormale
 // Drehung um eine versetzte Achse (R39): Steilkurve um die Innenkante (L), Korkenzieher um eine
 // Achse ueber der Bahn (A). Bei Rolle 0 ist beides null - kein Sprung an den Zonengrenzen.
 if(coasters.length&&(_rax.L||_rax.A)){const L=_rax.L,A=_rax.A;ax=L*(tz-qx)-A*nx;ay=L*(-bb-qy)+A*(1-ny);az=L*(-tx-qz)-A*nz;}
 const lq=loops.length?loopAt(d):null;
 if(lq){const st=loopFrame(lq,d);
  ax=tx*st.a+tz*st.lat;ay=st.b;az=tz*st.a-tx*st.lat;  // Mittellinie auf den geneigten Tropfen heben
  nx=tx*st.nf;ny=st.nu;nz=tz*st.nf;}                   // Normale kippt mit (oben kopfueber)
 return out.set(x+ax+qx*off+nx*h, hh+ay+qy*off+ny*h, z+az+qz*off+nz*h);}
function samplePos(d,off,out,lift=0){return posAt(d,off,lift+(posFix?posFix(d):0),out);}
// R58 Graben-Flug-Hoehenflug: der Graben (Waende, Boden, Oberflaeche, Tuerme) liegt am normalen Flugprofil, nicht am
// Hoehenflug darueber - sonst stiege er mit und man flöge nie ueber die Oberflaeche. trenchLift = normal - hoch (<= 0).
let posFix=null;const _tlS={},_tlT={};
function trenchLift(d){for(const z of elems){if(!z.plain)continue;const x=lapDist(d-z.s);if(x<=0||x>=z.span)continue;
 return elemState(z.plain,x,_tlS).fly-elemState(z.plan,x,_tlT).fly;}return 0;}
// Weit neben der Fahrbahn wird flach gerechnet. In einer Rollzone steht die Bahn senkrecht, dort
// zeigt die Querachse nach oben - ein Querversatz von 19 m landete damit senkrecht ueber der
// Mittellinie statt daneben, und Tribuenen und Baeume standen mitten auf der Strecke.
// Alles, was an der Fahrbahn haengt, geht ueber posAt bzw. samplePos, nicht hierueber.
function sample(d,off=0){const [i,j,k]=tIdx(d);let tx=TP.tx[i]+(TP.tx[j]-TP.tx[i])*k,tz=TP.tz[i]+(TP.tz[j]-TP.tz[i])*k;const tl=Math.hypot(tx,tz)||1;tx/=tl;tz/=tl;
 const b=TP.b[i]+(TP.b[j]-TP.b[i])*k,ang=Math.atan2(tx,tz);
 if(Math.abs(off)>10.6){const x=TP.x[i]+(TP.x[j]-TP.x[i])*k,z=TP.z[i]+(TP.z[j]-TP.z[i])*k,h=TP.h[i]+(TP.h[j]-TP.h[i])*k;
  return {p:new T.Vector3(x+tz*off,h-off*b,z-tx*off),t:new T.Vector3(tx,0,tz),angle:ang,bank:b};}
 return {p:posAt(d,off,0,new T.Vector3()),t:new T.Vector3(tx,0,tz),angle:ang,bank:b};}
let cpU=[];
// Sucht in der Naehe eines Kontrollpunkts die geradeste Stelle (Anlauf davor, Landezone danach), damit Spruenge nie in Kurven landen.
function straightSpot(v,before=30,after=80,search=90){const c=cpDist(v);let best=c,bs=1e9;for(let o=-search;o<=search;o+=3){const d=c+o;if(gaps.some(g=>Math.abs(wrapDiff(g.c,d))<after+30)||zones.some(z=>{const w=wrapDiff(d,z.d);return w<z.half+before+5&&w>-z.half-after-5;})||raises.some(q=>{const a0=d-before-8,al=before+after+16;return lapDist(q.s-a0)<al||lapDist(a0-q.s)<lapDist(q.e-q.s);})||forks.some(f=>{const a0=d-before-8,al=before+after+16;return lapDist(f.dA-a0)<al||lapDist(a0-f.dA)<f.span;})||tunnels.some(t=>{const a0=d-before-8,al=before+after+16;return lapDist(t.s-a0)<al||lapDist(a0-t.s)<lapDist(t.e-t.s);})||agrav.some(t=>{const a0=d-before-8,al=before+after+16;return lapDist(t.s-a0)<al||lapDist(a0-t.s)<lapDist(t.e-t.s);})||coasters.some(t=>{const a0=d-before-8,al=before+after+16;return lapDist(t.s-a0)<al||lapDist(a0-t.s)<t.span;}))continue;let m=0;for(let s=-before;s<=after;s+=3)m=Math.max(m,Math.abs(trackAt(d+s).kap));const score=m+Math.abs(o)*.00004;if(score<bs){bs=score;best=d;}}return lapDist(best);}
function cpDist(v){const n=course.points.length,i=Math.floor(v)%n,f=v-Math.floor(v),a=cpU[i],b=cpU[(i+1)%n];let du=b-a;if(du<0)du+=length;return lapDist(a+du*f);}
function inGap(d){const dl=lapDist(d);return gaps.some(g=>dl>g.start&&dl<g.end);}
function inRaise(q,d){return lapDist(d-q.s)<=lapDist(q.e-q.s);}
function inBridge(d){return raises.some(q=>q.bridge&&inRaise(q,d));}
// sstep (C2-smootherstep) statt smooth: an den Rampenflanken blieb die STEIGUNG knicken -
// bei Tempo ein spuerbarer Ruck im Fahrfluss (R26). Hoehen bleiben exakt gleich, nur die
// Uebergaenge werden stetig.
function raiseH(d){let h=0;for(const q of raises){const span=lapDist(q.e-q.s),rel=lapDist(d-q.s);if(rel<=span)h+=q.h*sstep(rel/q.r)*(1-sstep((rel-(span-q.r))/q.r));}return h;}
// Anti-Grav dreht nur die Darstellung: gefahren wird weiter in der flachen Streckenebene.
// Bezugshoehe fuer posAt: die Fahrbahnebene selbst. groundAt taugt dafuer nicht, weil es
// neben der Bahn die Boeschung mitrechnet - das Bild wuerde an der Zonengrenze springen.
function roadRef(d,off){const [i,j,k]=tIdx(d);return TP.h[i]+(TP.h[j]-TP.h[i])*k-off*(TP.b[i]+(TP.b[j]-TP.b[i])*k);}
function groundAt(d,off){const tr=trackAt(d);let base=tr.h-off*tr.b;
 // In der Halfpipe traegt die Wand (Bild) - flach gerechnet gibt es dort keine Boeschung, die abfaellt
 if(hpipes.length&&Math.abs(off)<HP.outer&&hpAt(d))return {y:base,rh:rampAt(d,off)};const edge=Math.abs(off)-(Math.abs(off)>8.6&&shoulderOk(d,off)?SHOULDER+.3:8.9);
 // Die Anti-Grav-Bahn schwebt: daneben gibt es keine Boeschung, die abfaellt. Rechnete man sie
 // mit, loeste sich der Haltemagnet sobald das Kart etwas weiter aussen fuhr - es fiel heraus
 // und wurde zurueckgesetzt. Seitlich haelt die Fuehrung, nicht das Gelaende.
 if(magOn()&&hasMag(d)&&!(worldMode&&Math.abs(off)>14))return {y:base,rh:rampAt(d,off)};
 if(theme.space&&edge>1.6){const rh0=rampAt(d,off);return {y:-30,rh:rh0};}   // neben der Bahn ist Leere
 if(edge>.6&&tr.h>2.2&&inBridge(d))base=0;else if(edge>0&&base>0)base=Math.max(0,base-edge/1.5);
 if(worldMode&&edge>0&&base<0)base=0;
 if(Math.abs(off)<30&&inGap(d))base=-30;const rh=rampAt(d,off);return {y:base+(rh?rh.y:0),rh};}
function rampAt(d,off){const dl=lapDist(d);for(const r of ramps){if(Math.abs(off-r.off)<r.w/2&&dl>=r.start&&dl<=r.end)return {y:RAMP_H*(dl-r.start)/RAMP_LEN,ramp:r};}return null;}
function strip(d0,d1,offset,width,lift,uvLen,steps,uvMul=1){const n=steps+1,v=new Float32Array(n*6),uv=new Float32Array(n*4),idx=new Uint32Array(steps*6);for(let i=0;i<n;i++){const d=d0+(d1-d0)*i/steps;for(let s=0;s<2;s++){const p=samplePos(d,offset+(s?1:-1)*width/2,_sp,lift),o=i*2+s;v[o*3]=p.x;v[o*3+1]=p.y;v[o*3+2]=p.z;uv[o*2]=s;uv[o*2+1]=(d-d0)*uvMul/uvLen;}if(i<steps){const a=i*2,q=i*6;idx[q]=a;idx[q+1]=a+2;idx[q+2]=a+1;idx[q+3]=a+1;idx[q+4]=a+2;idx[q+5]=a+3;}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(v,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(new T.BufferAttribute(idx,1));g.computeVertexNormals();return g;}
function addStrip(geo,material,shadow=true){const m=new T.Mesh(geo,material);m.receiveShadow=shadow;world.add(m);return m;}
// Strassenabschnitte ohne Schluchten
// Ringpuffer-Filter ueber eine Runde: gleitender Mittelwert (zweimal Kastenfilter = Dreieck) und Maximum
function ringSmooth(a,w){if(w<1)return Float32Array.from(a);const n=a.length;let src=Float32Array.from(a);
 for(let pass=0;pass<2;pass++){const out=new Float32Array(n);let sum=0;for(let j=-w;j<=w;j++)sum+=src[((j%n)+n)%n];
  for(let i=0;i<n;i++){out[i]=sum/(2*w+1);sum+=src[(i+w+1)%n]-src[((i-w)%n+n)%n];}src=out;}return src;}
function ringMax(a,w){const n=a.length,out=new Float32Array(n);for(let i=0;i<n;i++){let m=0;for(let j=-w;j<=w;j++)m=Math.max(m,a[((i+j)%n+n)%n]);out[i]=m;}return out;}
// Hoehenkruemmung der Fahrbahn (1/m) an Streckenmeter d - fuer den Kuppenabsprung
function vcurv(d){const h=x=>{const [i,j,k]=tIdx(x);return TP.h[i]+(TP.h[j]-TP.h[i])*k;};return (h(d+3)-2*h(d)+h(d-3))/9;}
function roadSegments(){const segs=[];let s=0;for(const g of [...gaps].sort((a,b)=>a.start-b.start)){segs.push([s,g.start]);s=g.end;}segs.push([s,length]);let out=segs.filter(([a,b])=>b-a>1);
 for(const z of elems)for(const [a0,b0] of z.hidden)for(const sh of [0,-length]){const a=a0+sh,b=b0+sh;out=out.flatMap(([x,y])=>b<=x||a>=y?[[x,y]]:[[x,a],[b,y]].filter(([p,q])=>q-p>1));}
 return out;}
// Im Looping steckt in einem Fahrbahnmeter ein Vielfaches an Bildmetern: dort feiner unterteilen
// (sonst ist der Kreis ein Vieleck) und die Textur entsprechend strecken.
// R39: auch Achterbahn-Twists feiner rastern (3x) - sonst sind die Vierecke der gedrehten Bahn
// stark verwunden und die Schattierung wird fleckig.
function loopParts(a,b){if(!loops.length&&!coasters.length)return [[a,b,1]];const cuts=[a,b];
 for(const q of loops)for(const e of [q.s,q.s+q.span])for(const c of [lapDist(e),lapDist(e)+length])if(c>a+.5&&c<b-.5)cuts.push(c);
 for(const k of coasters)for(const r of k.spec.rolls)for(const e of [k.s+r.c-r.w-2,k.s+r.c+r.w+2])for(const c of [lapDist(e),lapDist(e)+length])if(c>a+.5&&c<b-.5)cuts.push(c);
 cuts.sort((x,y)=>x-y);const out=[];
 for(let i=0;i<cuts.length-1;i++){const m=(cuts[i]+cuts[i+1])/2,q=loopAt(m),cz=coasterAt(m),tw=cz&&cz.spec.rolls.some(r=>Math.abs(lapDist(m-cz.s)-r.c)<r.w+2);
  out.push([cuts[i],cuts[i+1],q?q.sig*2.1+1:tw?3:1]);}
 return out;}
function stripSegs(offset,width,lift,uvLen,material,shadow=true){for(const [a,b] of roadSegments())for(const [a2,b2,sc] of loopParts(a,b))addStrip(strip(a2,b2,offset,width,lift,uvLen,Math.max(2,Math.ceil((b2-a2)*sc/1.1)),sc),material,shadow);}
function skirt(side,material){const steps=520,v=[],idx=[],hs=[];for(let i=0;i<=steps;i++){const d=length*i/steps,e0=shoulderOk(d,side)?SHOULDER+.3:8.9,s=sample(d,side*e0),h=(inGap(d)||hasMag(d)||(s.p.y>2.2&&inBridge(d)))?0:Math.max(0,s.p.y),b=sample(d,side*(e0+h*1.5+1.2)).p;v.push(s.p.x,s.p.y+.02,s.p.z,b.x,-.5,b.z);hs.push(h);}for(let i=0;i<steps;i++){if(Math.max(hs[i],hs[i+1])<.35||hs[i]===0||hs[i+1]===0)continue;const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,material);m.receiveShadow=true;world.add(m);}
// Hindernisse fuer Kollisionen (Raster 16 m)
function addObstacle(x,z,r,h=99){const key=(Math.floor(x/16)+500)*1000+(Math.floor(z/16)+500);let c=obsGrid.get(key);if(!c)obsGrid.set(key,c=[]);c.push({x,z,r,h});}
function nearTrack(x,z,dist){const d=projectGlobal(x,z),p=sample(d).p;return Math.hypot(p.x-x,p.z-z)<dist;}

// ---------------------------------------------------------------- Deko & Figuren
let batch=null;
function batchAdd(proto,key,tint,t){let b=batch.get(key);if(!b)batch.set(key,b={proto,tint,list:[]});b.list.push(t);}
function mushroom(x,z,s,color,y=0,glow=0){if(P.mushroom&&batch){batchAdd(P.mushroom,'m_'+glow,glow,{x,y,z,s,ry:(x*12.99+z*78.23)%TAU,col:color});return null;}if(P.mushroom){const g=cloneProto(P.mushroom);g.position.set(x,y,z);g.scale.setScalar(s);applyTint(g,'CapPaint',color,glow?{emissiveColor:color,emissiveIntensity:glow}:null);world.add(g);return g;}const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(s);world.add(g);mesh(new T.CylinderGeometry(.3,.52,2.5,12),cream,g,0,1.25,0);sphere(g,mat(color,glow?{emissive:color,emissiveIntensity:glow}:{}),0,2.65,0,1.6,.75,1.6);return g;}
function tree(x,z,s,color){if(P.tree&&batch){batchAdd(P.tree,'t',0,{x,z,s,ry:(x*3.71+z*9.13)%TAU,col:color});return;}if(P.tree){const g=cloneProto(P.tree);g.position.set(x,0,z);g.scale.setScalar(s);applyTint(g,'CapPaint',color);world.add(g);return g;}const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(s);world.add(g);mesh(new T.CylinderGeometry(.2,.4,2.7,7),mat(0x98714a),g,0,1.35,0);sphere(g,mat(color),0,3.5,0,1.7,2.6,1.7);}
// Pilzgleiter: Blender-Modell und kompakter Geometrie-Fallback.
function fallbackGlider(){if(P._gliderFallback)return P._gliderFallback;
 const root=new T.Group(),paints=[stdMat({name:'GliderPaint',color:0xef6c58,roughness:.78,side:T.DoubleSide}),stdMat({name:'GliderCream',color:0xffedc8,roughness:.88,side:T.DoubleSide}),stdMat({name:'GliderTrim',color:0x4fb9ad,roughness:.7,side:T.DoubleSide})];
 const canopy=(x,z)=>2.63+.57*Math.cos(x/2.5*Math.PI/2)+.15*Math.cos(z/.95*Math.PI/2);
 for(let strip=0;strip<10;strip++){const positions=[],indices=[],x0=-2.5+strip*.5;for(let ix=0;ix<=2;ix++)for(let iz=0;iz<=6;iz++){const x=x0+ix*.25,z=-.95+iz*.95/3;positions.push(x,canopy(x,z),z);}for(let ix=0;ix<2;ix++)for(let iz=0;iz<6;iz++){const a=ix*7+iz,b=a+7;indices.push(a,a+1,b,b,a+1,b+1);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();root.add(new T.Mesh(geo,paints[strip===0||strip===9?2:strip%3===1?1:0]));}
 const cord=stdMat({name:'GliderRope',color:0x285553,roughness:.85});
 for(const side of [-1,1])for(const z of [-.7,.7]){const a=new T.Vector3(side*.7,.92,z*.5),b=new T.Vector3(side*2.08,canopy(side*2.08,z)-.04,z),dir=b.clone().sub(a),m=new T.Mesh(new T.CylinderGeometry(.014,.014,dir.length(),5),cord);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());root.add(m);}
 P._gliderFallback=mergeByMaterial(root);markShared(P._gliderFallback);return P._gliderFallback;}
function attachGlider(kart,color){const g=cloneProto(P.glider||fallbackGlider());g.name='MushroomParaglider';applyTint(g,'GliderPaint',new T.Color(color).lerp(new T.Color(0xffe2b4),.22).getHex());g.visible=false;kart.add(g);kart.userData.glider=g;return g;}
function syncGlider(r,dt,spin){const g=r.mesh.userData.glider;if(!g)return;
 const open=stepGlider(r,dt,{ground:groundAt(r.distance,r.offset).y,blocked:hasRoll(r.distance)||r.finishTime!==null});
 if(!r.glideArmed)r.glideCue=false;
 if(r.id===0&&r.gliding&&!r.glideCue&&state==='race'){r.glideCue=true;SFX.sail();}
 g.visible=open>.012;if(!g.visible)return;
 // Der Schirm bleibt beim Trick aufrecht, waehrend das Kart darunter dreht.
 g.rotation.order='YXZ';g.rotation.set(-r.mesh.rotation.x*.75,-spin,-r.mesh.rotation.z*.65-(r.steerS||0)*.09+Math.sin(elapsed*3+r.id)*.025*open);
 g.scale.set(.09+.91*open,.17+.83*open,.28+.72*open);g.position.y=-1.1*(1-open)+Math.sin(elapsed*4+r.id)*.045*open;
 if(r.id===0&&r.gliding&&!r.gliderSeen&&state==='race'){r.gliderSeen=true;toast('PILZGLEITER!  DRIFT = TRICK',1.3,'good');}}
function kart(color,goldLook=false,dtype=0,style){let g;if(P.kart){g=new T.Group();const body=cloneProto(kartProto(dtype,style));applyTint(body,'BodyPaint',color,goldLook?{metalness:.65,roughness:.28}:null);g.add(body);
  const wheels=[];if(P.kartwheel&&style!=='drache')for(const [x,y,z,s,w] of [[-1,.42,1,1,1],[1,.42,1,1,1],[-1.05,.48,-.9,1.14,1.3],[1.05,.48,-.9,1.14,1.3]]){const piv=new T.Group(),wh=cloneProto(P.kartwheel);piv.position.set(x,y,z);wh.scale.set(w*(x>0?-1:1),s,s);piv.add(wh);g.add(piv);wheels.push({piv,wh,front:z>0,r:y,dir:1});}
  const dproto=P[(DRIVERS[dtype]||DRIVERS[0]).k]||P.driver;
  let driver=null;if(dproto){driver=cloneProto(dproto);applyTint(driver,'CapPaint',goldLook?0xffd23f:color);driver.position.set(0,.95,-.35);g.add(driver);}
  g.userData.parts={wheels,driver};if(style==='drache'){g.userData.parts.dino=dinoRig(g,color);g.userData.parts.dy=.34;if(driver)driver.position.y=.95+.34;}kartLook(g);}else{g=new T.Group();const body=mat(color,{roughness:.35});box(g,body,0,.68,0,1.75,.55,2.4);box(g,dark,0,.95,-.28,.9,.75,.72);sphere(g,cream,0,1.9,-.08,.45);for(const x of [-1,1])for(const z of [-.9,1]){const w=mesh(new T.CylinderGeometry(.43,.43,.38,14),dark,g,x,.44,z);w.rotation.z=Math.PI/2;}}
 const shield=new T.Mesh(shieldGeo,shieldMat);shield.position.y=1;shield.visible=false;g.add(shield);
 const flames=[-.45,.45].map(x=>{const f=new T.Mesh(flameGeo,flameMat);f.position.set(x,.72,-1.72);f.visible=false;g.add(f);return f;});
 // Bremslichter: man sieht dem Vordermann an, wann er vom Gas geht
 const brakes=[-.62,.62].map(x=>{const b=new T.Mesh(brakeGeo,brakeMat);b.position.set(x,.84,-2.19);b.visible=false;g.add(b);return b;});addTailLights(g);
 // Anti-Grav-Unterlicht: additive Glowflaeche unterm Kart, sichtbar nur in Rollzonen -
 // rollt als Kind des Mesh automatisch mit und zeigt das Magnetfeld, das das Kart traegt.
 if(!UG_MAT){UG_MAT=new T.MeshBasicMaterial({map:canvasTex(64,64,(q)=>{const r0=q.createRadialGradient(32,32,4,32,32,30);r0.addColorStop(0,'rgba(255,255,255,.95)');r0.addColorStop(.45,'rgba(140,245,255,.5)');r0.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=r0;q.fillRect(0,0,64,64);}),color:0x9feaff,transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false});}
 const ug=new T.Mesh(UG_GEO||(UG_GEO=new T.PlaneGeometry(3.1,4.2).rotateX(-Math.PI/2)),UG_MAT);
 ug.position.y=.14;ug.visible=false;g.add(ug);
 g.userData={...g.userData,shield,flames,brakes,underglow:ug};attachGlider(g,color);attachTransform(g,color);return g;}
// ---------------------------------------------------------------- R60 Ritter Kunz und der Drachen-Dino (prozedural)
// Nutzerwunsch: ein Ritter in schwerer Ruestung als Fahrer (Topfhelm mit Sehschlitz, Schulterplatten, Waffenrock, Umhang,
// Schwert auf dem Ruecken - eigener Entwurf) und als Gefaehrt eine Kreuzung aus Reit-Dino und Drache: runder Dino mit
// Sattel, grossen Stiefeln und Knubbelnase, dazu Fledermausfluegel, Hoerner, Rueckenzacken und Pfeilschwanz. Kein Kart:
// die Beine laufen im Tempo mit, die Fluegel schlagen (in der Luft und beim Turbo kraeftiger), der Schwanz pendelt.
// Waffenrock/Umhang (CapPaint) und Dino-Haut (BodyPaint) nehmen die Kartfarbe an.
function knightRoot(){const root=new T.Group(),m=(name,p)=>stdMat({name,...p});
 const steel=m('Rim',{color:0x9aa0ac,roughness:.35,metalness:.85}),dark=m('KnightDark',{color:0x2a2a32,roughness:.7}),gold=m('Gold',{color:0xd8a83a,roughness:.3,metalness:.9}),
  cap=m('CapPaint',{color:0xffffff,roughness:.75,side:T.DoubleSide}),leather=m('KnightLeather',{color:0x4a3222,roughness:.85});
 const add=(g,mt,x,y,z,rx=0,ry=0,rz=0)=>{const o=new T.Mesh(g,mt);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);root.add(o);return o;};
 // sitzend: Huefte bei y 0, Blick nach +z
 for(const sx of [-1,1]){add(new T.BoxGeometry(.22,.2,.55),steel,sx*.15,.08,.25);add(new T.SphereGeometry(.12,10,8),steel,sx*.15,.1,.52);add(new T.BoxGeometry(.2,.4,.2),steel,sx*.15,-.1,.6);}
 add(new T.CylinderGeometry(.27,.3,.32,12),dark,0,.14,-.02);                                   // Kettenhemd-Rock
 add(new T.CylinderGeometry(.31,.26,.46,12),steel,0,.5,-.02);                                   // Brustpanzer
 add(new T.BoxGeometry(.5,.62,.05),cap,0,.44,.24);add(new T.BoxGeometry(.5,.66,.05),cap,0,.42,-.28);   // Waffenrock vorn/hinten
 add(new T.CylinderGeometry(.075,.075,.04,14),gold,0,.56,.275,Math.PI/2);                        // Rondell auf dem Waffenrock
 add(new T.BoxGeometry(.52,.07,.4),leather,0,.27,-.02);add(new T.BoxGeometry(.1,.08,.06),gold,0,.27,.2);   // Guertel + Schnalle
 for(const sx of [-1,1]){const pa=add(new T.SphereGeometry(.2,12,8,0,TAU,0,Math.PI/2),steel,sx*.3,.68,-.02,0,0,-sx*.35);pa.scale.set(1,.8,1.1);
  add(new T.BoxGeometry(.13,.3,.14),steel,sx*.34,.5,.06,-.5,0,sx*.08);add(new T.BoxGeometry(.12,.12,.34),steel,sx*.3,.36,.28,0,0,0);add(new T.SphereGeometry(.08,8,6),dark,sx*.24,.36,.46);}
 // Topfhelm mit Sehschlitz, Atemloechern und Helmzier
 add(new T.CylinderGeometry(.19,.21,.1,14),dark,0,.76,0);
 add(new T.CylinderGeometry(.2,.21,.36,16),steel,0,.96,0);add(new T.SphereGeometry(.2,16,8,0,TAU,0,Math.PI/2),steel,0,1.14,0);
 add(new T.BoxGeometry(.3,.035,.05),dark,0,1.0,.19);add(new T.BoxGeometry(.035,.18,.05),gold,0,.9,.2);
 for(const [x,y] of [[-.08,.86],[.08,.86],[-.1,.81],[.1,.81]])add(new T.SphereGeometry(.018,6,4),dark,x,y,.205);
 add(new T.BoxGeometry(.04,.16,.3),cap,0,1.28,-.02);                                           // Helmkamm in Kartfarbe
 // Umhang (zerfranst) und Schwert quer auf dem Ruecken
 {const g=new T.PlaneGeometry(.66,.78,4,4),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,-Math.pow((.39-y)/.78,1.6)*.22);if(y<-.3)p.setY(i,y-((Math.round((x+.33)*12)%2)*.06));}g.computeVertexNormals();add(g,cap,0,.34,-.34,.12,0,0);}
 add(new T.BoxGeometry(.07,.95,.025),steel,.05,.6,-.42,0,0,.72);add(new T.BoxGeometry(.3,.05,.06),gold,-.12,.44,-.42,0,0,.72);add(new T.CylinderGeometry(.025,.025,.2,6),leather,-.2,.35,-.42,0,0,.72);add(new T.SphereGeometry(.04,8,6),gold,-.26,.29,-.42);
 root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return root;}
function ensureR60Protos(){if(!P.driver_knight){P.driver_knight=mergeByMaterial(knightRoot());markShared(P.driver_knight);}}
// Drachen-Dino: statischer Koerper (Prototyp, BodyPaint = Kartfarbe) plus bewegte Teile, die kart() anhaengt
function dinoProto(){return kartProtos.get('Sdrache')||(()=>{const root=new T.Group(),m=(name,p)=>stdMat({name,...p});
 const skin=m('BodyPaint',{color:0xffffff,roughness:.55}),belly=m('DinoBelly',{color:0xf6ecd0,roughness:.7}),white=m('White',{color:0xffffff,roughness:.35}),eye=m('Eye',{color:0x14141c,roughness:.2}),
  horn=m('DinoHorn',{color:0xf0e2b8,roughness:.6}),spike=m('DinoSpike',{color:0xff6a2a,roughness:.5}),saddle=m('Seat',{color:0xc8322a,roughness:.55}),gold=m('Gold',{color:0xd8a83a,roughness:.3,metalness:.9});
 const add=(g,mt,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>{const o=new T.Mesh(g,mt);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.scale.set(sx,sy,sz);root.add(o);return o;};
 add(new T.SphereGeometry(1,20,14),skin,0,.95,-.1,0,0,0,.86,.62,1.28);                          // Rumpf
 add(new T.SphereGeometry(1,16,12),belly,0,.82,.12,0,0,0,.7,.48,1.0);                            // Bauch
 add(new T.CylinderGeometry(.3,.4,.8,12),skin,0,1.42,1.0,-.75);                                  // Hals
 add(new T.SphereGeometry(1,18,12),skin,0,1.78,1.42,0,0,0,.46,.42,.5);                           // Kopf
 add(new T.SphereGeometry(1,16,12),skin,0,1.68,1.86,0,0,0,.38,.3,.36);                           // Knubbelnase
 for(const sx of [-1,1]){add(new T.SphereGeometry(.05,6,5),eye,sx*.1,1.78,2.18);                 // Nasenloecher
  add(new T.SphereGeometry(.15,12,10),white,sx*.17,1.99,1.64,0,0,0,1,1.2,.9);add(new T.SphereGeometry(.07,10,8),eye,sx*.17,2.0,1.76);
  add(new T.ConeGeometry(.08,.34,8),horn,sx*.2,2.14,1.3,-.9,0,sx*.3);                           // Hoerner
  add(new T.SphereGeometry(.14,10,8),belly,sx*.34,1.62,1.62,0,0,0,1,.7,1);}                     // Backen
 for(let i=0;i<6;i++){const t=i/5;add(new T.ConeGeometry(.13-.03*t,.34-.1*t,6),spike,0,1.62-t*.42,.72-t*1.7,-.35-t*.5);}   // Rueckenzacken
 add(new T.BoxGeometry(.72,.14,.82),saddle,0,1.52,-.36,.05);add(new T.BoxGeometry(.66,.36,.1),saddle,0,1.68,-.8,.25);add(new T.TorusGeometry(.36,.04,6,20,Math.PI),gold,0,1.58,-.36,0,Math.PI/2,0);
 for(const sx of [-1,1])add(new T.BoxGeometry(.05,.5,.18),saddle,sx*.38,1.3,-.36);
 root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});const q=mergeByMaterial(root);markShared(q);kartProtos.set('Sdrache',q);return q;})();}
// Bewegte Teile (je Kart eigene Knoten): vier Beine mit Stiefeln, zwei Fluegel, Schwanz mit Pfeilspitze
function dinoRig(g,color){const skin=lookMat(stdMat({name:'BodyPaint',color,roughness:.55})),boot=stdMat({color:0xff8a1a,roughness:.5}),wingM=stdMat({color:new T.Color(color).multiplyScalar(.7),roughness:.6,side:T.DoubleSide}),
  horn=stdMat({color:0xf0e2b8,roughness:.6}),rig={legs:[],wings:[],tail:null,ph:0};
 for(const [x,z,f] of [[-.48,.62,0],[.48,.62,Math.PI],[-.52,-.62,Math.PI],[.52,-.62,0]]){const pv=new T.Group();pv.position.set(x,.95,z);g.add(pv);
  const th=new T.Mesh(new T.CapsuleGeometry(.2,.4,4,8),skin);th.position.y=-.35;pv.add(th);const bt=new T.Mesh(new T.SphereGeometry(1,12,10),boot);bt.scale.set(.24,.2,.36);bt.position.set(0,-.72,.1);pv.add(bt);
  pv.traverse(o=>{if(o.isMesh)o.castShadow=true;});rig.legs.push({pv,f});}
 const wing=new T.Shape();wing.moveTo(0,0);wing.lineTo(1.5,.55);wing.quadraticCurveTo(1.35,.1,1.55,-.2);wing.quadraticCurveTo(1.15,-.1,1.05,-.45);wing.quadraticCurveTo(.75,-.2,.55,-.55);wing.quadraticCurveTo(.35,-.2,0,-.3);wing.lineTo(0,0);
 const wg=new T.ShapeGeometry(wing,6);for(const sx of [-1,1]){const pv=new T.Group();pv.position.set(sx*.5,1.45,.45);g.add(pv);const w=new T.Mesh(wg,wingM);w.rotation.x=-Math.PI/2;w.scale.set(sx,1,1);pv.add(w);
  const bone=new T.Mesh(new T.CylinderGeometry(.03,.05,1.6,6),skin);bone.rotation.set(0,sx*.35,-Math.PI/2);bone.position.set(sx*.75,0,-.275);pv.add(bone);rig.wings.push({pv,sx});}
 const tp=new T.Group();tp.position.set(0,.95,-1.25);g.add(tp);let prev=tp;for(let i=0;i<3;i++){const seg=new T.Group();seg.position.z=i?-.45:0;prev.add(seg);const c=new T.Mesh(new T.CylinderGeometry(.12-.03*i,.24-.05*i,.5,10),skin);c.rotation.x=Math.PI/2;c.position.z=-.22;seg.add(c);prev=seg;}
 const tip=new T.Mesh(new T.ConeGeometry(.2,.4,4),horn);tip.rotation.x=-Math.PI/2;tip.scale.set(1,1,.35);tip.position.z=-.62;prev.add(tip);rig.tail=tp;
 return rig;}
function dinoAnim(rig,r,dt){const sp=Math.abs(r.speed||0),k=Math.min(1,sp/12);rig.ph+=dt*(3+sp*.42);
 for(const l of rig.legs){l.pv.rotation.x=r.air?-.5:Math.sin(rig.ph+l.f)*.75*k;}
 const flap=r.air||r.gliding?1:r.boost>0?.6:.18;for(const w of rig.wings)w.pv.rotation.z=w.sx*(.58+Math.sin(elapsed*(r.air?13:7)+w.sx)*.45*flap)-(r.air?w.sx*.3:0);
 let s=rig.tail,i=0;while(s){s.rotation.y=Math.sin(elapsed*3.2-i*.8)*(.22+.1*k);s.rotation.x=.12;s=s.children.find(c=>c.isGroup);i++;}}

// KI-Karts instanziert: je Bauteil (Karosserie, Lack, Fahrer, Kappe, Raeder) ein Draw-Call fuer alle 7 Karts.
// r.mesh bleibt ein unsichtbares Transform-Geruest (Fahrer-/Rad-Knoten), dessen Weltmatrizen jeden Frame uebertragen werden.
const WHEEL_SLOTS=[[-1,.42,1,1,1],[1,.42,1,1,1],[-1.05,.48,-.9,1.14,1.3],[1.05,.48,-.9,1.14,1.3]];
let kartInst=null,kartPool=null;
const kartsG=new T.Group();actors.add(kartsG);
// Kart je Fahrer (R43): Grundkarosserie plus Blender-Bausatz der Figur (kartkit.glb: Pilzhut-Spoiler,
// Panzerplatten, Raketenbooster, Katzenohr-Fluegel) zu einem Prototyp verschmolzen. Der Bausatz sitzt
// fest an der Karosserie (die alten Box-Anbauteile hingen am Fahrer und schwankten mit ihm mit, bei
// instanzierten KI-Karts lagen sie sogar ohne Versatz im Fahrer) und kostet keinen eigenen Draw-Call.
const kartProtos=new Map();
// R56 Karosserien (art/r56/create_kartbodies.py): Keilflitzer (Standard) und Tourenwagen - fuer das eigene Kart waehlbar
let kartStyle=store.get('kartStyle','fass');const KSTYLES=[['fass','Fass'],['keil','Keil'],['tourer','Tourer'],['klassik','Klassik'],['drache','Drache']];
function kartProto(t,style){if(!P.kart)return null;if(style==='drache')return dinoProto();
 if(style&&style!=='klassik'){const src=P.kartbodies?.getObjectByName(style==='tourer'?'KB_Tourer':style==='fass'?'KB_Fass':'KB_Keil');if(src){let q=kartProtos.get('S'+style);if(!q){const root=new T.Group();root.add(src.clone(true));q=mergeByMaterial(root);markShared(q);kartProtos.set('S'+style,q);}return q;}}
 const k=DRIVERS[t]?t:0,kit=P.kartkit?.getObjectByName('KX_'+k);if(!kit)return P.kart;
 let p=kartProtos.get(k);if(p)return p;const root=new T.Group();root.add(P.kart.clone(true),kit.clone(true));
 p=mergeByMaterial(root);markShared(p);kartProtos.set(k,p);return p;}
function buildKartInstances(types){ensureR60Protos();kartInst=null;if(!types||!types.length||!P.kart||!P.driver||!P.kartwheel)return;const n=types.length,inst={n,wheel:[],groups:[],bodies:[],dmap:[],bmap:[]};
 const mk=(proto,arr,paint,count)=>proto.traverse(o=>{if(!o.isMesh)return;const isPaint=o.material.name===paint;const m=isPaint?lookMat(o.material.clone()):o.material;if(isPaint)m.color.set(0xffffff);const im=new T.InstancedMesh(o.geometry,m,count);im.frustumCulled=false;im.castShadow=true;im.receiveShadow=true;im.instanceMatrix.setUsage(T.DynamicDrawUsage);if(isPaint)for(let i=0;i<count;i++)im.setColorAt(i,_col.setHex(0xffffff));kartsG.add(im);arr.push({im,paint:isPaint});});
 mk(P.kartwheel,inst.wheel,null,n*4);
 // Karosserien je Fahrertyp (eigener Bausatz), Fahrerfiguren ebenso
 // Fahrerfiguren: je Figurtyp ein Satz Instanzen, damit das Feld gemischt ist
 const seen=new Map();
 types.forEach((t,slot)=>{let gi=seen.get(t);if(gi===undefined){const proto=P[(DRIVERS[t]||DRIVERS[0]).k]||P.driver,meshes=[];mk(proto,meshes,'CapPaint',types.filter(x=>x===t).length);gi=inst.groups.length;inst.groups.push({meshes,used:0});seen.set(t,gi);}
  const gr=inst.groups[gi],br=inst.bodies[gi]||(inst.bodies[gi]=(()=>{const meshes=[];mk(kartProto(t),meshes,'BodyPaint',types.filter(x=>x===t).length);return {meshes,used:0};})());
  inst.dmap[slot]={g:gr,i:gr.used++};inst.bmap[slot]={g:br,i:br.used++};});
 kartInst=inst;}
function kartVirtual(color,slot){const g=new T.Group(),wheels=[];for(const [x,y,z,s,w] of WHEEL_SLOTS){const piv=new T.Group(),wh=new T.Object3D();piv.position.set(x,y,z);wh.rotation.order='YXZ';if(x>0)wh.rotation.y=Math.PI;wh.scale.set(w,s,s);piv.add(wh);g.add(piv);wheels.push({piv,wh,front:z>0,r:y,dir:x>0?-1:1});}
 const driver=new T.Object3D();driver.position.set(0,.95,-.35);g.add(driver);
 const shield=new T.Mesh(shieldGeo,shieldMat);shield.position.y=1;shield.visible=false;g.add(shield);const flames=[-.45,.45].map(x=>{const f=new T.Mesh(flameGeo,flameMat);f.position.set(x,.72,-1.72);f.visible=false;g.add(f);return f;});
 // R53: auch KI-Karts haben Brems- und Ruecklichter (vorher nur der Spieler)
 const brakes=[-.62,.62].map(x=>{const b=new T.Mesh(brakeGeo,brakeMat);b.position.set(x,.84,-2.19);b.visible=false;g.add(b);return b;});addTailLights(g);
 g.userData={parts:{wheels,driver},shield,flames,brakes,slot};attachGlider(g,color);attachTransform(g,color);
 const paint=(list,i)=>{for(const p of list)if(p.paint){p.im.setColorAt(i,_col.setHex(color));p.im.instanceColor.needsUpdate=true;}};
 const bm=kartInst.bmap[slot];if(bm)paint(bm.g.meshes,bm.i);const dm=kartInst.dmap[slot];if(dm)paint(dm.g.meshes,dm.i);return g;}
function syncKartInstances(){if(!kartInst)return;for(const r of racers){const u=r.mesh.userData;if(u.slot===undefined)continue;r.mesh.updateMatrixWorld(true);const i=u.slot;
  const bm=kartInst.bmap[i];if(bm)for(const p of bm.g.meshes)p.im.setMatrixAt(bm.i,r.mesh.matrixWorld);const dm=kartInst.dmap[i];if(dm)for(const p of dm.g.meshes)p.im.setMatrixAt(dm.i,u.parts.driver.matrixWorld);u.parts.wheels.forEach((w,k)=>{for(const p of kartInst.wheel)p.im.setMatrixAt(i*4+k,w.wh.matrixWorld);});}
 for(const p of kartInst.wheel)p.im.instanceMatrix.needsUpdate=true;
 for(const gr of kartInst.groups.concat(kartInst.bodies))for(const p of gr.meshes)p.im.instanceMatrix.needsUpdate=true;}
function boostTexture(){return canvasTex(64,128,(q,w,h)=>{q.fillStyle='#ffc93c';q.fillRect(0,0,w,h);q.strokeStyle='#ff5a1f';q.lineWidth=12;q.lineCap='round';for(let y=10;y<h;y+=64){q.beginPath();q.moveTo(8,y+34);q.lineTo(w/2,y+6);q.lineTo(w-8,y+34);q.stroke();}},true);}

const bprof=[];let bprofT=0;const bm=l=>{const n=performance.now();bprof.push([l,+(n-bprofT).toFixed(1)]);bprofT=n;};
let builtSel=-1,worldDirty=true,boxInst=[],boxQ=null,mapBase=null,agravWalls=[],agravGates=[],UG_MAT=null,UG_GEO=null;
// Jede gebaute Strecke bleibt als eigene Szenengruppe im Speicher: Zurueckwechseln = Gruppe tauschen (kein Neubau, kein Upload)
const worldCache=new Map();
const courseState=()=>({world,course,theme,curve,length,TP,cpU,gaps,zones,bats,mapInfo,obsGrid,flags,balloons,ramps,pads,rings,spores,swingers,boostPads,sunPads,sporeMesh,crowd,fireflies,foamRing,boostTex,startLights,boxes,boxInst,boxQ,mapBase,rails,forks,raises,tunnels,agrav,loops,crystals,coasters,coasterGlow,agravWalls,agravGates,ferris,dragon,elems,elemFx,lakeMask,owFx,hz,trainFx,desert,chr,hpipes,deco,r60,owCh,SHT,WK,AK,bg:scene.background,fog:scene.fog,revealed:true,modSpot});
function loadCourse(c){({world,course,theme,curve,length,TP,cpU,gaps,zones,bats,mapInfo,obsGrid,flags,balloons,ramps,pads,rings,spores,swingers,boostPads,sunPads,sporeMesh,crowd,fireflies,foamRing,boostTex,startLights,boxes,boxInst,boxQ,mapBase,rails,forks,raises,tunnels,agrav,loops,crystals,coasters,coasterGlow,agravWalls,agravGates,ferris,dragon,elems,elemFx,lakeMask,owFx,hz,trainFx,desert,chr,hpipes,deco,r60,owCh,SHT,WK,AK,modSpot}=c);scene.background=c.bg;scene.fog=c.fog;applyTheme();}
function disposeCourse(i){const c=worldCache.get(i);if(!c)return;if(c.world.parent)c.world.parent.remove(c.world);clearGroup(c.world);worldCache.delete(i);}
let revealQueue=null;
function startReveal(){const kids=world.children.slice();for(const k of kids)k.visible=false;world.visible=true;revealQueue=kids;}
function flushReveal(){if(revealQueue){for(const k of revealQueue)k.visible=true;revealQueue=null;}}
// R52: Original-Blender-Windfahnen, instanziert und weit ausserhalb der Fahrspur.
function buildWindsocks(){world.userData.windsocks=[];if(!P.windsock||course.openWorld||![0,1,2].includes(selected))return;
 const list=[];
 for(const [d,side] of [[32,1],[length*.28,-1],[length*.57,1],[length*.79,-1]]){
  const off=side*15.2;if(inZone(d,18)||inGap(d)||inTunnel(d)||inBridge(d)||hasRoll(d)||nearLoop(d)||forkBlocks(d,off))continue;
  const q=sample(d,off),gy=groundAt(d,off).y;if(!Number.isFinite(gy))continue;
  let blocked=false;for(const cell of obsGrid.values())for(const o of cell)if(Math.hypot(q.p.x-o.x,q.p.z-o.z)<(o.r||0)+2.2)blocked=true;
  if(blocked)continue;const item={x:q.p.x,y:gy,z:q.p.z,s:1.25,ry:Math.atan2(-q.t.z,q.t.x)};
  list.push(item);world.userData.windsocks.push({d,off,x:item.x,y:item.y,z:item.z});addObstacle(item.x,item.z,.7,4.5);
 }
 scatterInstanced(P.windsock,list);
}
function buildCourse(force){if(!force&&builtSel===selected&&!worldDirty){resetRace();return;}
 flushReveal();if(builtSel>=0&&worldCache.has(builtSel))worldCache.get(builtSel).mapBase=mapBase;
 if(worldDirty&&builtSel>=0)disposeCourse(builtSel);if(world.parent)worldRoot.remove(world);worldDirty=false;builtSel=selected;
 const cached=!force&&worldCache.get(selected);
 if(cached){loadCourse(cached);worldRoot.add(world);actors.visible=true;buildToken++;worldReady=true;$('trackLoading').hidden=true;if(cached.revealed)world.visible=true;else{cached.revealed=true;startReveal();}}
 else{disposeCourse(selected);buildWorld();buildWindsocks();worldCache.set(selected,courseState());worldRoot.add(world);warmup();}
 resetRace();setText('courseLabel',course.name);setText('courseNo',String(selected+1).padStart(2,'0'));}
// Andere Strecken im Leerlauf des Menues vorbauen (Shader kompilieren im Hintergrund)
function prebuild(i){if(worldCache.has(i)||i===builtSel)return;const cur=courseState(),sel=selected;worldRoot.remove(world);selected=i;
 try{buildWorld();buildWindsocks();const c=courseState();c.revealed=false;worldCache.set(i,c);try{renderer.compileAsync(c.world,camera,scene);}catch(e){}}finally{selected=sel;loadCourse(cur);worldRoot.add(world);}}
let lastInput=performance.now();for(const ev of ['pointerdown','keydown'])addEventListener(ev,()=>{lastInput=performance.now();},{capture:true,passive:true});
function prebuildTick(){if(TEST||state!=='menu'||!worldReady||revealQueue||performance.now()-lastInput<2000)return;const next=courses.findIndex((_,i)=>!worldCache.has(i));if(next>=0)prebuild(next);}
function applyTheme(){renderer.toneMappingExposure=theme.exposure;kartLookTheme();
 hemi.color.setHex(theme.hemiSky);hemi.groundColor.setHex(theme.hemiGround);hemi.intensity=theme.hemiInt;sun.color.setHex(theme.sunCol);sun.intensity=theme.sunInt;sun.position.set(...theme.sunPos);fill.color.setHex(theme.fillCol);fill.intensity=theme.fillInt;headlight.intensity=theme.head!==undefined?theme.head:(theme.stars?90:0);
 stars.visible=moon.visible=theme.stars;sunGlow.visible=!theme.stars;sunGlow.position.set(theme.sunPos[0]*2.6,Math.max(80,theme.sunPos[1]*2),theme.sunPos[2]*2.6);sunGlow.material.color.setHex(course.theme==='canyon'?0xffc28a:course.theme==='dome'?0xffb866:0xffffff);}
// Flow: enge Stellen der Mittellinie (Radius < 24 m) werden iterativ aufgeweitet, der Rest bleibt wie entworfen
// Looping: nach der Glaettung wird an der gewuenschten Stelle ein 360-Grad-Kreis in die
// Mittellinie eingesetzt. Weil das erst danach passiert, passt die Tangente genau und die
// Glaettung kann den Kreis nicht mehr zusammenziehen.
// R44: rechtwinklige Kurven im SNES-Stil an ausgewaehlten Kontrollpunkten (course.sharp: [index, Mindestradius, Hilfsabstand]).
// Zwei Hilfspunkte kurz vor und nach der Ecke ziehen die Kurve eng herum; die Radius-Glaettung gilt dort nur abgeschwaecht.
// Die Kontrollpunkt-Positionen der Strecke (cpU) bleiben unberuehrt, alle Bauten sitzen weiter an derselben Stelle.
function smoothCurve(points,minR=24,sharp=[]){const S=TRACK_SCALE,n0=points.length,pts=[],corners=[];
 points.forEach(([x,z],i)=>{const sh=sharp.find(q=>q[0]===i);if(!sh){pts.push([x,z]);return;}const a=points[(i-1+n0)%n0],c=points[(i+1)%n0],k=sh[2]||7,l1=Math.hypot(x-a[0],z-a[1]),l2=Math.hypot(c[0]-x,c[1]-z);
  pts.push([x-(x-a[0])/l1*k,z-(z-a[1])/l1*k],[x,z],[x+(c[0]-x)/l2*k,z+(c[1]-z)/l2*k]);corners.push([x*S,z*S,sh[1]]);});
 const base=new T.CatmullRomCurve3(pts.map(([x,z])=>new T.Vector3(x*S,0,z*S)),true,'catmullrom',.38);base.arcLengthDivisions=3000;
 const n=360;let p=base.getSpacedPoints(n).slice(0,n).map(v=>[v.x,v.z]);
 const rad=(a,b,c)=>{const ab=Math.hypot(b[0]-a[0],b[1]-a[1]),bc=Math.hypot(c[0]-b[0],c[1]-b[1]),ca=Math.hypot(a[0]-c[0],a[1]-c[1]),ar=Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))/2;return ar<1e-6?1e9:ab*bc*ca/(4*ar);};
 const lim=p.map(([x,z])=>{let r=minR;for(const [cx,cz,cr] of corners){const d=Math.hypot(x-cx,z-cz);if(d<34)r=Math.min(r,cr+(minR-cr)*Math.max(0,(d-18)/16));}return r;});
 for(let it=0;it<400;it++){let bad=false;const tight=new Uint8Array(n);for(let i=0;i<n;i++){const r=rad(p[(i-3+n)%n],p[i],p[(i+3)%n]);if(r<lim[i])bad=true;if(r<lim[i]*1.25)for(let k=-8;k<=8;k++)tight[(i+k+n)%n]=1;}if(!bad)break;p=p.map((b,i)=>{if(!tight[i])return b;const a=p[(i-1+n)%n],c=p[(i+1)%n];return [b[0]+((a[0]+c[0])/2-b[0])*.5,b[1]+((a[1]+c[1])/2-b[1])*.5];});}
 const c=new T.CatmullRomCurve3(p.map(([x,z])=>new T.Vector3(x,0,z)),true,'centripetal');c.arcLengthDivisions=4000;return c;}
function buildWorld(){mapBase=null;bprof.length=0;bprofT=performance.now();world=new T.Group();obsGrid=new Map();TP=newTP();swayCache=new Map();
 flags=[];balloons=[];ramps=[];pads=[];rings=[];spores=[];swingers=[];gaps=[];zones=[];bats=null;boostPads=[];sunPads=[];sporeMesh=null;crowd=null;fireflies=null;rails=[];forks=[];raises=[];tunnels=[];agrav=[];loops=[];crystals=[];coasters=[];hpipes=[];ferris=null;dragon=null;elems=[];elemFx=null;owFx=null;hz=null;deco=null;r60=null;owCh=null;
 course=courseAt(selected);theme=THEMES[course.theme];WK=(course.worldR||210)/210;AK=Math.min(WK*WK,4)*DENS;
 scene.background=skyTexture(hex(theme.skyTop),hex(theme.skyBottom));scene.fog=new T.Fog(theme.fog,theme.fogNear,theme.fogFar);applyTheme();
 curve=smoothCurve(course.points,24,course.sharp||[]);length=curve.getLength();bm('clear+theme');buildTable();bm('table');
 cpU=course.points.map(([x,z])=>projectGlobal(x*TRACK_SCALE,z*TRACK_SCALE));
 // Looping: ein kurzes, moeglichst gerades Stueck Fahrbahn wird im Bild zu einem senkrechten
 // Kreis aufgestellt (Radius R, Fussabdruck span). Gefahren wird dabei ganz normal geradeaus -
 // deshalb gibt es keine unfahrbar enge Kurve, keine Selbstkreuzung und keinen Sprung am Ausgang.
 // sig = Bildmeter je Fahrbahnmeter; damit wird der Vorschub gebremst, sonst liefe der Kreis im
 // Zeitraffer. Die geradeste Stelle in der Naehe gewinnt, damit der Kreis nicht verwunden steht.
 // Elemente-Parcours: [cpVon, cpBis, Plan ('see' | 'bach' | 'flug'), {loop:[Windungen, Radius, Seite], depth, fly}]
 for(const [a,b,kind,o={}] of course.elem||[]){const s=cpDist(a),span=lapDist(cpDist(b)-s);
  const lp=o.loop?loopSpec(o.loop[1]*TRACK_SCALE,o.loop[0],o.loop[2]??1):null;
  const plan=elemPlan(kind,span,{loopSpan:lp?lp.span:0,depth:o.depth,fly:o.fly,hi:o.hi||0,hiLen:o.hiLen||0});
  if(!plan.ok)console.warn('Elemente-Zone gestaucht:',course.name,a,b);
  const z={s,span,kind,plan,water:0,hidden:[],lake:kind!=='flug',plain:o.hi?elemPlan(kind,span,{fly:o.fly}):null};
  {let open=-1;const st={};for(let x=0;x<=span+.25;x+=.25){elemState(plan,x,st);if(st.hide&&open<0)open=x;if((!st.hide||x>span)&&open>=0){z.hidden.push([s+open,s+x]);open=-1;}}}
  elems.push(z);
  if(lp&&plan.loopX!==null)loops.push({...lp,s:lapDist(s+plan.loopX),style:'lake'});}
 if(course.loopc){const defs=Array.isArray(course.loopc[0])?course.loopc:[course.loopc];
  // Belegte Abschnitte scheiden aus: Bauwerke, Rollzonen, Achterbahn, Abzweigungen, Schanzen,
  // Tribuenen und die Startgerade - der schraege Looping greift bis ~30 m zur Seite aus.
  const busy=[],cpd=v=>cpDist(v);
  for(const [a,b] of (course.tunnel||[]).concat(course.raise||[],course.plateau?[course.plateau]:[],course.agrav||[],course.coaster||[],course.fork||[]))busy.push([cpd(a)-8,cpd(b)+8]);
  for(const [v,L] of course.gaps||[])busy.push([cpd(v)-L-8,cpd(v)+L+8]);
  for(const [v] of course.ramps||[])busy.push([cpd(v)-50,cpd(v)+34]);   // Anlauf: nach dem Looping erst geradeaus auf die Schanze
  for(const [v] of (course.stands||[]).concat(course.builds||[]))busy.push([cpd(v)-36,cpd(v)+36]);
  for(const v of [course.mansion,course.castle])if(v!==undefined)busy.push([cpd(v)-50,cpd(v)+50]);
  busy.push([length-40,length+36]);
  for(const z of elems)busy.push([z.s-10,z.s+z.span+10]);
  const taken=(d,span)=>busy.some(([a,b])=>lapDist(d+span-a)<lapDist(b-a)+span);
  // [cp Mitte, Radius, Windungen, Neigungsseite, 'straight' | 'curve'] - 'curve' sucht eine Kurve:
  // die Spirale biegt sich dann mit der Strecke (gekruemmte Mehrfach-Spirale)
  for(const [cpv,radC,turns=1,dir=1,style='straight'] of defs){const spec=loopSpec(radC*TRACK_SCALE,turns,dir),span=spec.span,c0=cpd(cpv);
   let s=-1,best=1e9;
   const why={taken:[],curv:[],ok:0};if(loopMiss.length>40)loopMiss.shift();loopMiss.push({track:course.name,cpv,span:Math.round(span),c0:Math.round(c0),why,busy});
   for(let o=-90;o<=90;o+=1){const d=lapDist(c0+o-span/2);if(taken(d,span)){why.taken.push(Math.round(d));continue;}let m=0,sum=0,cnt=0;
    for(let t=-10;t<=span+10;t+=3){const kp=Math.abs(trackAt(d+t).kap);m=Math.max(m,kp);sum+=kp;cnt++;}
    if(m>1/22){why.curv.push(Math.round(1/m));continue;}why.ok++;
    const sc=(style==='curve'?-sum/cnt:m)+Math.abs(o)*2e-5;if(sc<best){best=sc;s=d;}}
   if(s<0){console.warn("Looping findet keinen Platz:",course.name,cpv);continue;}
   busy.push([s-10,s+span+10]);loops.push({...spec,s,style});}
  // Unter und neben den Windungen bleibt es frei: dort stuende Deko sonst mitten in der Bahn
  for(const q of loops){const mid=lapDist(q.s+q.span/2),[mi,mj,mk]=tIdx(mid);
   zones.push({d:mid,half:q.span/2+26,x:TP.x[mi]+(TP.x[mj]-TP.x[mi])*mk,z:TP.z[mi]+(TP.z[mj]-TP.z[mi])*mk,r:26});
   for(let t=-6;t<=q.span+6;t+=9){const d=lapDist(q.s+t),[i,j,k]=tIdx(d);
    zones.push({d,half:0,x:TP.x[i]+(TP.x[j]-TP.x[i])*k,z:TP.z[i]+(TP.z[j]-TP.z[i])*k,r:LOOP.tilt+14});}}}
 // Halfpipes (R52): [cp ungefaehr, Laenge m]. Gesucht wird die naechste gerade, freie Stelle - die Waende
 // stehen bis ~15 m neben der Mitte, deshalb bleiben Bauwerke, Schanzen, Figuren und andere Zonen draussen.
 if(course.halfpipe){const busy=courseBusy();
  for(const [cpv,span=150] of course.halfpipe){const s=hpFindSpot({length,kap:d=>trackAt(d).kap,busy,span,near:cpDist(cpv),search:220});
   if(s<0){console.warn('Halfpipe findet keinen Platz:',course.name,cpv);continue;}
   busy.push([s-20,s+span+20]);hpipes.push({s,span,e:lapDist(s+span)});
   for(let x=-12;x<=span+12;x+=8){const d=lapDist(s+x),[i,j,k]=tIdx(d);zones.push({d,half:0,x:TP.x[i]+(TP.x[j]-TP.x[i])*k,z:TP.z[i]+(TP.z[j]-TP.z[i])*k,r:25,hp:true});}}}
 // Hoehenprofil: Huegel (Gauss) + Plateau; Ueberhoehung aus der Kruemmung
 // Huegel amplitude gedämpft (x .6): volle Hoehen fuehlten sich als staendiges Ruckeln an und
 // warfen das Kart bei Tempo von der Fahrbahn (Kuppenabsprung) - Flow geht vor Sprunghunger.
 const hills=(course.hills||[]).map(([v,a,w])=>[cpDist(v)/length,a*.6,w]);raises=(course.raise||[]).concat(course.plateau?[[...course.plateau,0]]:[]).map(([a,b,h,r,br])=>({s:cpDist(a),e:cpDist(b),h,r,bridge:!!br}));
 // Ueberhoehung und Kurvenhub aus GEGLAETTETER Kruemmung (R39): die Kruemmung des Streckenzugs
 // schwankt von Stuetzpunkt zu Stuetzpunkt. Roh uebernommen hob und senkte sich die Fahrbahn in
 // jeder Kurvenfolge um bis zu 1,2 m und kippte hin und her - eine Buckelpiste. Jetzt: Neigung ueber
 // +-16 m gemittelt, der Hub (haelt die Innenkante ueber dem Boden) als Maximum ueber +-10 m und
 // dann ueber +-28 m weich verschliffen.
 {const ds=length/PS,bs=ringSmooth(TP.k,Math.round(16/ds)).map(k=>clamp(k*4,-.12,.12)),lift=ringSmooth(ringMax(bs.map(Math.abs),Math.round(10/ds)),Math.round(28/ds));
  for(let i=0;i<PS;i++){const u=i/PS,d=u*length;let h=0;for(const [c,a,w] of hills){let du=u-c;du-=Math.round(du);h+=a*Math.exp(-(du*du)/(w*w));}h+=raiseH(d)+dunesH(d);TP.b[i]=bs[i];TP.h[i]=h+lift[i]*9.8;}}
 for(const [v,L] of course.gaps||(course.gap?[course.gap]:[])){const c=cpDist(v);gaps.push({start:c-L/2,end:c+L/2,c});}
 tunnels=(course.tunnel||[]).map(([a,b,style])=>({s:cpDist(a),e:cpDist(b),style:style||'rock'}));
 // Anti-Grav-Abschnitte: 'wall' kippt bis zum Winkel und zurueck, 'roll' dreht einmal ganz durch, 'flip' geht ueber Kopf
 // hold = Winkel, der in der Mitte der Zone gehalten wird ('over' faehrt kopfueber).
 // Der Sichthub ist fuer alle Bauarten gleich: jede dreht irgendwann durch die Senkrechte,
 // und dort ragt die halbe Fahrbahnbreite nach unten.
 agravWalls=[];agravGates=[];agrav=(course.agrav||[]).map(([a,b,mode,deg])=>{const s=cpDist(a),e=cpDist(b),m=mode||'wall',dg=(deg===undefined?90:deg)*Math.PI/180;
  const hold=m==='over'||m==='flip'?Math.PI:clamp(Math.abs(dg),.35,TAU-.35);
  const md=m==='flip'?'over':m;return {s,e,span:lapDist(e-s),mode:md,hold,seg:agravSegments(md,hold),sgn:dg<0?-1:1,lift:12.5};});
 for(let i=0;i<PS;i++){const d=i/PS*length;TP.rl[i]=rollAt(d);TP.lf[i]=liftAt(d);}
 // Wasserspiegel je See: Gelaende am Zonenbeginn minus ELEM.water. Unter See und Flugbahn keine Deko.
 for(const z of elems){z.water=Math.min(roadRef(z.s,0)+ELEM.water,-.95);     // immer unter der Bodenkante (-0,3)
  for(let x=-8;x<=z.span+8;x+=8){const d=lapDist(z.s+x),[i,j,k]=tIdx(d);zones.push({d,half:0,x:TP.x[i]+(TP.x[j]-TP.x[i])*k,z:TP.z[i]+(TP.z[j]-TP.z[i])*k,r:z.lake?ELEM.lake+8:18});}
  const mid=lapDist(z.s+z.span/2),[mi,mj,mk]=tIdx(mid);zones.push({d:mid,half:z.span/2+12,x:TP.x[mi]+(TP.x[mj]-TP.x[mi])*mk,z:TP.z[mi]+(TP.z[mj]-TP.z[mi])*mk,r:0});}
 // Magnet-Achterbahn (R38): [cpVon, cpBis, Bauart]. Die Katapultstrecke liegt am Anfang, danach die
 // Huegel. archX: Meter ab Zonenbeginn je Magnetbogen; flash: Aufleuchten je Bogen (Bild).
 coasters=(course.coaster||[]).map(([a,b,kind])=>{const s=cpDist(a),e=cpDist(b),span=lapDist(e-s),spec=coasterSpec(kind||'super',span),archX=launchArches(spec,6);
  // Steilkurven: Kruemmung je Meter, ueber +-15 m geglaettet (sonst zuckt die Neigung in S-Kurven)
  let bankArr=null;if(spec.bank){const n=Math.ceil(span)+2,kk=new Float32Array(n);bankArr=new Float32Array(n);
   for(let i=0;i<n;i++)kk[i]=trackAt(s+i).kap;
   for(let i=0;i<n;i++){let a=0,m=0;for(let j=-15;j<=15;j++){const q=i+j;if(q<0||q>=n)continue;const w=1-Math.abs(j)/16;a+=kk[q]*w;m+=w;}bankArr[i]=bankAngle(a/m);}}
  return {s,e,span,spec,archX,bankArr,flash:archX.map(()=>0)};});
 // Unter den Huegeln bleibt es frei - Baeume und Pilze stuenden sonst durch die schwebende Bahn
 for(const c of coasters)for(const q of c.spec.hills){const d=lapDist(c.s+q.c),[mi,mj,mk]=tIdx(d);
  zones.push({d,half:q.w,x:TP.x[mi]+(TP.x[mj]-TP.x[mi])*mk,z:TP.z[mi]+(TP.z[mj]-TP.z[mi])*mk,r:q.w*.7+14});}
 buildForks();
 let minX=1e9,maxX=-1e9,minZ=1e9,maxZ=-1e9;for(let i=0;i<PS;i+=8){minX=Math.min(minX,TP.x[i]);maxX=Math.max(maxX,TP.x[i]);minZ=Math.min(minZ,TP.z[i]);maxZ=Math.max(maxZ,TP.z[i]);}
 mapInfo={cx:(minX+maxX)/2,cz:(minZ+maxZ)/2,k:Math.min(180/(maxX-minX),140/(maxZ-minZ))};
 bm('heights');const random=rng(course.seed);
 // Boden, Meer, Kuestenschaum
 const grassMat=stdMat({map:speckleTexture(hex(theme.grass),hex(theme.grassSpot),2600),roughness:1});
 if(!theme.space&&elems.some(z=>z.lake))buildLakeGround(grassMat);else if(!theme.space){
  // R60 Riesendom: die Stadt steht auf einem Felsplateau hoch ueber einem Wolkenmeer - Insel tiefer, Seiten aus Fels
  const isH=theme.cloudSea?74:12,cliff=theme.cloudSea?stdMat({map:speckleTexture(hex(theme.skirt),hex(0x5a4a44),2400),roughness:1}):grassMat;
  mesh(new T.CylinderGeometry(210*WK,theme.cloudSea?150*WK:210*WK-15,isH,Math.round(96*Math.sqrt(WK))),theme.cloudSea?[cliff,grassMat,cliff]:grassMat,world,0,-isH/2-.3,0).castShadow=false;}
 lakeMask=lakeMask&&elems.some(z=>z.lake)?lakeMask:null;buildHazards();buildLandmarks();buildDeco();buildTrench();buildDesert();buildCharacter();buildR60();buildChoco();buildVoxel();buildCity();buildDomePix();buildBayIce();buildTsunami();buildOil();if(elems.length)buildElems();if(course.openWorld){buildOW();buildArena();}if(elemFx)buildBuoyInst();
 // R60: Bucht - Meer knapp unter dem Strand (die Wellen lecken am Sandrand); Eisstock-See - zugefrorenes Meer ohne Wellen;
 // Riesendom - warmes Wolkenmeer tief unter der Stadt
 const seaY=theme.beach?-2.7:theme.frozen?-1.4:theme.cloudSea?-64:-12;if(r60)r60.seaY=seaY;
 const seaMat=mat(theme.sea,theme.lavaSea?{roughness:.65,emissive:0xff3a08,emissiveIntensity:.95}:theme.cloudSea?{roughness:1,emissive:0xa0521e,emissiveIntensity:.55}:theme.frozen?{roughness:.16,metalness:.12}:{roughness:.3});
 if(theme.frozen){const it=r60IceTex().clone();it.repeat.set(70,70);it.needsUpdate=true;seaMat.map=it;}
 if(!theme.frozen)seaMat.onBeforeCompile=sh=>{sh.uniforms.uTime=shaderTime;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;varying float vWave;').replace('#include <begin_vertex>','#include <begin_vertex>\nfloat w=sin(position.x*.035+uTime*1.3)*.8+sin(position.y*.05-uTime*1.1)*.6+sin((position.x+position.y)*.02+uTime*.7)*.9;transformed.z+=w;vWave=w;');sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vWave;').replace('#include <dithering_fragment>','#include <dithering_fragment>\ngl_FragColor.rgb+=vec3(.10,.15,.15)*smoothstep(.7,2.1,vWave);');};
 const sea=mesh(new T.PlaneGeometry(1800*WK,1800*WK,90,90),seaMat,world,0,seaY,0);sea.rotation.x=-Math.PI/2;sea.castShadow=false;sea.visible=!theme.space;
 foamRing=mesh(new T.RingGeometry(204*WK,217*WK,Math.round(72*Math.sqrt(WK))),new T.MeshBasicMaterial({color:theme.foam,transparent:true,opacity:.22,depthWrite:false}),world,0,seaY+(theme.frozen?.05:.65),0);foamRing.rotation.x=-Math.PI/2;foamRing.castShadow=false;foamRing.visible=!theme.space&&!theme.cloudSea;
 bm('ground+sea');
 const glow=theme.glow;
 // Randband nur an den Kanten (R39): als volle Flaeche unter dem Asphalt stachen seine schiefen
 // Dreiecke in Twists (16 Grad Drehung je Rasterschritt) bis 60 cm durch die Fahrbahn.
 {const em=mat(theme.edge,glow?{emissive:theme.edge,emissiveIntensity:.35}:{});for(const o of [-8.25,8.25])stripSegs(o,1.3,.04,6,em);}
 if(theme.rainbowRoad){
  // R56 Bierstrasse (Nutzerwunsch "statt Regenbogen faehrst du auf Bier"): goldenes Bier mit Schaumkronen an den Raendern
  // und aufsteigenden Blaeschen - halbtransparent, der Sternenhimmel schimmert durch. Blaeschen kacheln nahtlos laengs.
  const rb=canvasTex(128,128,(q,w,h)=>{const g=q.createLinearGradient(0,0,w,0);
   [['#fff6dc',0],['#ffd36a',.1],['#f5a623',.3],['#e08a12',.5],['#f5a623',.7],['#ffd36a',.9],['#fff6dc',1]].forEach(([c,k])=>g.addColorStop(k,c));
   q.fillStyle=g;q.fillRect(0,0,w,h);
   let sd=56;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
   for(let i=0;i<120;i++){const x=10+rnd()*(w-20),y=rnd()*h,r=rnd()*2.2+.6;q.strokeStyle='#fff8d8';q.globalAlpha=.55+rnd()*.4;q.lineWidth=.9;
    for(const dy of [-h,0,h]){q.beginPath();q.arc(x,y+dy,r,0,6.283);q.stroke();}}
   q.globalAlpha=1;q.fillStyle='#fffdf4';for(let i=0;i<28;i++){const side=i%2,x=side?w-rnd()*9:rnd()*9,y=rnd()*h,r=3+rnd()*4;
    for(const dy of [-h,0,h]){q.beginPath();q.arc(x,y+dy,r,0,6.283);q.fill();}}},true);
  rb.repeat.set(1,1);
  // Glasbahn (R28): halbtransparent und beidseitig - der Sternenhimmel scheint durch die
  // Sternenbahn, wie bei der Regenbogenstrasse ueber dem Kosmos. depthWrite aus, sonst
  // verdeckte die eigene Flaeche die transparenten Nachbarn an Looping und Kuppen.
  // R29: Deckkraft 60 % und Emission zurueckgenommen - 80 % war dem Nutzer noch zu dicht.
  const rbMat=stdMat({map:rb,emissive:0xffffff,emissiveMap:rb,emissiveIntensity:.55,roughness:.18,metalness:.05,transparent:true,opacity:.8,depthWrite:false,side:T.DoubleSide});
  rainbowTex=rb;stripSegs(0,15.2,.065,15.2,rbMat);}
 else stripSegs(0,15.2,.065,6,stdMat({map:speckleTexture(hex(theme.road),hex(theme.roadSpot),900),roughness:.9}));
 buildShoulder();if(!theme.space){const shM=stdMat({map:speckleTexture(hex(new T.Color(theme.road).lerp(new T.Color(0xffffff),.16).getHex()),hex(theme.roadSpot),900),roughness:.92}),edgeM=stdMat({color:theme.line?new T.Color(theme.line):0xffffff,roughness:.7,...(glow?{emissive:0xffffff,emissiveIntensity:.8}:{})});
  for(const side of [-1,1]){const A=side<0?SHT.L:SHT.R;let a=-1;for(let i=0;i<=SHT.n;i++){const on=i<SHT.n&&A[i];if(on&&a<0)a=i;else if(!on&&a>=0){const d0=a*SHT.ds,d1=i*SHT.ds,st=Math.max(2,Math.ceil((d1-d0)/1.6));addStrip(strip(d0,d1,side*9.9,2.7,.058,6,st),shM);addStrip(strip(d0,d1,side*10.95,.2,.07,6,st),edgeM,false);a=-1;}}}}
const curbTex=canvasTex(8,64,(q)=>{q.fillStyle=theme.curbA;q.fillRect(0,0,8,32);q.fillStyle=theme.curbB;q.fillRect(0,32,8,32);},true);curbTex.magFilter=T.NearestFilter;
 const curbMat=stdMat({map:curbTex,roughness:.7,...(glow?{emissive:0xffffff,emissiveMap:curbTex,emissiveIntensity:.9}:{})});for(const off of [-8.2,8.2])stripSegs(off,.8,.13,8,curbMat);
 const dashTex=canvasTex(8,32,(q)=>{q.fillStyle=theme.line;q.fillRect(0,0,8,16);},true);stripSegs(0,.22,.075,8,stdMat({map:dashTex,alphaTest:.5,roughness:.8,...(glow?{emissive:0xffffff,emissiveMap:dashTex,emissiveIntensity:1}:{})}),false);
 const skirtMat=stdMat({map:speckleTexture(hex(theme.skirt),hex(theme.grassSpot),1800),roughness:1,side:T.DoubleSide});
 if(!theme.space){skirt(-1,skirtMat);skirt(1,skirtMat);}
 // Im Weltall ist die Bahn seit R28 die Glasbahn selbst (DoubleSide, halbtransparent) -
 // die fruehere blickdichte Unterseite haette genau den Blick auf die Sterne verbaut.
 // Anti-Grav: dunkler Kiel unter der Wandfahrt, damit die gekippte Fahrbahn massiv wirkt
 // Textur vor dem Strassenbau: das Energieband der Anti-Grav-Bahn und des Loopings braucht sie,
 // und beide entstehen frueher als die Turbofelder.
 boostTex=boostTexture();
 if(agrav.length){const keelMat=stdMat({color:theme.glow?0x1b1830:0x4c4640,roughness:.95,side:T.DoubleSide});
  const col=theme.glow?0x7cf3ff:0x59d7ff;
  const glowMat=new T.MeshBasicMaterial({color:col,transparent:true,opacity:.34,depthWrite:false,side:T.DoubleSide});
  const ringMat=new T.MeshBasicMaterial({color:col,side:T.DoubleSide});
  const postMat=mat(0x232c44,{emissive:col,emissiveIntensity:.6,roughness:.5});
  const posts=[],_pv=new T.Vector3();
  // Kristall-Farbton je Strecken-Theme (Material "CrystalPaint" wird getönt, wie Pilzhüte)
  const CTINT={beach:0x7ff0e0,ice:0xbff0ff,dome:0xffd480,fair:0xffd0f0,forest:0x8ef0c9,canyon:0xffd98a,night:0x7cf3ff,haunted:0xc09aff,lava:0xffab5e,rainbow:0xb09aff};
  for(const q of agrav){const span=lapDist(q.e-q.s),steps=Math.ceil((span+12)/1.1);
   addStrip(strip(q.s-6,q.e+6,0,17.8,-1.6,6,steps),keelMat);
   // Energieband auf der Fahrbahn
   {const gm=glowMat.clone();gm.map=boostTex||null;const m=addStrip(strip(q.s+1,q.e-1,0,15.2,.08,7,Math.ceil(span/1.3)),gm,false);m.castShadow=false;}
   // Energiewaende beidseitig: machen die Magnetbande sichtbar. Ohne sie gleitet man bis an den
   // Rand und weiss nicht, warum man dort nicht weiterkommt - das fuehlt sich abfliegen an.
   {const wm=glowMat.clone();wm.opacity=.3;agravWalls.push(wm);const n=Math.ceil(span/1.2),v=[],idx=[];
    for(const side of [-1,1]){const base=v.length/3;
     for(let i=0;i<=n;i++){const u=i/n,d=q.s+(q.e-q.s)*u,hgt=1.15*Math.min(1,Math.sin(Math.PI*u)*4);
      const a=posAt(d,side*8.75,0,_pv),b=posAt(d,side*8.75,hgt,new T.Vector3());
      v.push(a.x,a.y,a.z,b.x,b.y,b.z);
      if(i<n){const o=base+i*2;idx.push(o,o+2,o+1,o+1,o+2,o+3);}}}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(idx);
    const m=new T.Mesh(g,wm);m.castShadow=false;m.frustumCulled=false;world.add(m);}
   // Torringe an Ein- und Ausfahrt (pulsiere leicht, damit das Feld lebendig wirkt)
   for(const d of [q.s+1.5,q.e-1.5]){const s=sample(d,0),g=new T.Mesh(new T.TorusGeometry(11.8,.5,8,22),ringMat);
    g.position.copy(s.p);g.rotation.order='YXZ';g.rotation.y=s.angle;g.rotation.z=rollAt(d);g.castShadow=false;world.add(g);agravGates.push(g);}
   // Magnet-Ringe: schweben auf der Ideallinie durch die Zone. Im Korkenzieher mitnehmen
   // (roll), in der Wandfahrt einer in der Mitte - durchfahren gibt RING-BOOST.
   for(const u of agravRings(q.seg)){const d=lapDist(q.s+span*u),p=posAt(d,0,1.7,new T.Vector3());
    const rg=new T.Mesh(new T.TorusGeometry(4.6,.32,10,30),stdMat({color:col,emissive:col,emissiveIntensity:1.1,roughness:.4}));
    rg.position.copy(p);rg.rotation.order='YXZ';const s=sample(d,0);rg.rotation.y=s.angle;rg.rotation.z=rollAt(d);
    rg.castShadow=false;world.add(rg);rings.push({d,off:0,y:p.y,mesh:rg,flash:0,ag:1});}
   // Pylonen: stehen senkrecht unter der schwebenden Bahn
   // nur dort, wo die Bahn noch kaum gedreht ist - unter einer senkrechten oder kopfueber
   // liegenden Fahrbahn stehen Stuetzen nicht nur falsch, sie verdecken auch die Sicht
   for(let d=q.s+4;d<q.e-2;d+=11){if(Math.abs(rollAt(d))>.55&&Math.abs(rollAt(d))<TAU-.55)continue;const [i,j,k]=tIdx(d);
    const cx=TP.x[i]+(TP.x[j]-TP.x[i])*k,cz=TP.z[i]+(TP.z[j]-TP.z[i])*k,top=TP.h[i]+(TP.h[j]-TP.h[i])*k+TP.lf[i]+(TP.lf[j]-TP.lf[i])*k;
    if(top<2)continue;posts.push(new T.BoxGeometry(1.2,top,1.2).translate(cx,top/2,cz));}
   // Schwebende Energie-Kristalle (Blender-Asset) zwischen den Pylonen unter der Bahn:
   // drehen sich langsam und schweben - gibt der Zone Tiefe ohne Draw-Call-Orgie (3 pro Zone).
   for(let ci=0;ci<3;ci++){const d=q.s+span*(.22+.28*ci),below=rollAt(d)>1.4?-4.2:-2.6,p=posAt(d,(ci%2?1:-1)*6.2,below,new T.Vector3());
    let cm=null;
    if(P.crystal){cm=cloneProto(P.crystal);cm.scale.setScalar(.85+ci*.12);
     const tc=CTINT[course.theme]||col;applyTint(cm,'CrystalPaint',tc,{emissiveColor:tc,emissiveIntensity:1.4});}
    else{cm=new T.Mesh(new T.OctahedronGeometry(1.1),stdMat({color:col,emissive:col,emissiveIntensity:1.3,roughness:.3}));cm.scale.y=1.8;}
    cm.position.copy(p);cm.rotation.y=ci*2.1;cm.castShadow=false;world.add(cm);crystals.push({m:cm,base:p.y,ph:ci*2.1});}}
  if(posts.length){const pm=new T.Mesh(mergeGeometries(posts),postMat);pm.castShadow=true;world.add(pm);}}
 // Looping: Traggeruest wie bei einer Achterbahn - zwei Holme entlang der Bahn, Querstreben
 // dazwischen, Neonringe am Fuss. Die Holme werden ueber posAt gesetzt und folgen dem Kreis
 // deshalb exakt, auch dort wo er nach vorn geneigt steht.
 if(loops.length){const steel=mat(theme.glow?0x2a2150:0x59606e,{roughness:.5,metalness:.6});
  const neon=new T.MeshBasicMaterial({color:theme.glow?0x7cf3ff:0xffc14d});
  const _d=new T.Vector3(),_mid=new T.Vector3(),_qq=new T.Quaternion(),_mm=new T.Matrix4(),_ux=new T.Vector3(1,0,0),_sc=new T.Vector3();
  const bar=(list,p0,p1,w)=>{const len=p0.distanceTo(p1);if(len<.05)return;
   _d.subVectors(p1,p0).divideScalar(len);_mid.addVectors(p0,p1).multiplyScalar(.5);
   _qq.setFromUnitVectors(_ux,_d);_mm.compose(_mid,_qq,_sc.set(len,w,w));
   list.push(new T.BoxGeometry(1,1,1).applyMatrix4(_mm));};
  for(const q of loops){const parts=[],N=Math.max(36,Math.round((q.span+TAU*q.R*q.n)/4.5));let pv=null;
   for(let i=0;i<=N;i++){const d=q.s+q.span*i/N,cu=[posAt(d,-11.2,-.8,new T.Vector3()),posAt(d,11.2,-.8,new T.Vector3())];
    if(pv){bar(parts,pv[0],cu[0],.5);bar(parts,pv[1],cu[1],.5);}
    if(i%3===0)bar(parts,cu[0],cu[1],.34);
    pv=cu;}
   if(parts.length){const m=new T.Mesh(mergeGeometries(parts),steel);m.castShadow=true;m.receiveShadow=true;world.add(m);}
   // Unterseite (R39): von aussen und von unten sah man sonst durch die Fahrbahn hindurch
   {const km=stdMat({color:theme.glow?0x1b1830:0x4c4640,roughness:.9,side:T.DoubleSide});
    const m3=addStrip(strip(q.s+.2,q.s+q.span-.2,0,17.2,-.5,6,Math.ceil(q.span*(q.sig*1.9+1)/1.2),q.sig+1),km);m3.receiveShadow=true;}
   // Leuchtband auf der Fahrbahn, damit der Kreis auch von weitem als Looping lesbar ist
   {const gm=new T.MeshBasicMaterial({color:theme.glow?0x7cf3ff:0xffc14d,transparent:true,opacity:.3,depthWrite:false,side:T.DoubleSide,map:boostTex||null});
    const m2=addStrip(strip(q.s+.4,q.s+q.span-.4,0,14.6,.09,7,Math.ceil(q.span*(q.sig*1.9+1)/1.2),q.sig+1),gm,false);m2.castShadow=false;}
   for(const d of [q.s+1,q.s+q.span-1]){const s=sample(d,0),g=new T.Mesh(new T.TorusGeometry(12.4,.42,8,24),neon);
    g.position.copy(s.p);g.position.y+=1.1;g.rotation.order='YXZ';g.rotation.y=s.angle;g.castShadow=false;world.add(g);}}}
 buildCoasters();bm('road+skirts');buildGaps();buildMansion();bm('gaps+mansion');
 // Start-Ziel-Tor und Schachbrett
 const start=sample(0),arch=new T.Group();arch.position.copy(start.p);arch.rotation.y=start.angle;world.add(arch);
 if(P.gate){const g=cloneProto(P.gate);applyTint(g,'CapPaint',theme.caps[0]);arch.add(g);}else{box(arch,cream,-9,4,0,.6,8,.6);box(arch,cream,9,4,0,.6,8,.6);box(arch,mat(0xed6350),0,8,0,19,2,.7);}
 for(const side of [-1,1]){const p=sample(0,side*9.3).p;addObstacle(p.x,p.z,1);}
 // Schriftzug schmaler als der Balken (R44): die Pilzhuete der Pfeiler verdeckten sonst das M und das Y
 const bz=P.gate?.26:.37,lw=P.gate?13.4:16;mesh(new T.PlaneGeometry(lw,1.5),label('WIESN KART','#1f78d1','#ffffff'),arch,0,8,bz);mesh(new T.PlaneGeometry(lw,1.5),label('WIESN KART','#1f78d1','#ffffff'),arch,0,8,-bz).rotation.y=Math.PI;
 const checker=canvasTex(64,16,(q)=>{for(let x=0;x<16;x++)for(let y=0;y<4;y++){q.fillStyle=(x+y)%2?'#273943':'#fff1d9';q.fillRect(x*4,y*4,4,4);}});checker.magFilter=T.NearestFilter;
 {const panel=new T.Group();panel.position.set(0,5.6,-.75);arch.add(panel);box(panel,dark,0,0,0,5.2,1.5,.3);startLights=[-1.7,0,1.7].map(x=>{const m=stdMat({color:0x220808,emissive:0x000000,roughness:.4});const l=new T.Mesh(new T.SphereGeometry(.5,16,12),m);l.position.set(x,0,-.2);panel.add(l);return m;});lightState=-1;}addStrip(strip(-1.6,1.6,0,15.2,.09,3.2,2),stdMat({map:checker,roughness:.8}));
 // Wehende Zielflaggen neben dem Tor - Schachbrett wie auf der Ziellinie, im Wimpel-Wind
 {const ftex=canvasTex(64,64,(q)=>{for(let x=0;x<8;x++)for(let y=0;y<8;y++){q.fillStyle=(x+y)%2?'#273943':'#fff1d9';q.fillRect(x*8,y*8,8,8);}});ftex.magFilter=T.NearestFilter;
  const s0=sample(0,0),poles=[],pens=[];
  for(const sx of [-1,1]){const p=sample(0,sx*12.6).p,M4=new T.Matrix4().makeRotationY(s0.angle).setPosition(p.x,Math.max(0,p.y),p.z);
   poles.push(new T.CylinderGeometry(.09,.13,7.4,6).translate(sx*12.6,3.7,0).applyMatrix4(M4));addObstacle(p.x,p.z,.4);
   const pg=new T.PlaneGeometry(3.0,1.8,8,3),n=pg.attributes.position.count,xn=new Float32Array(n);
   pg.translate(-sx*(3.0+.12),6.4,0);for(let v=0;v<n;v++)xn[v]=Math.max(0,(sx>0?3.12-pg.attributes.position.getX(v):pg.attributes.position.getX(v))/3.0);
   pg.userData={xn};pg.applyMatrix4(M4);pens.push(pg);}
  const pmesh=new T.Mesh(mergeGeometries(poles),cream);pmesh.castShadow=true;world.add(pmesh);
  const geo=mergeGeometries(pens),xn=new Float32Array(geo.attributes.position.count),dx=xn.slice(),dz=xn.slice();let o=0;
  for(const pg of pens){xn.set(pg.userData.xn,o);o+=pg.userData.xn.length;}
  dx.fill(Math.sin(s0.angle));dz.fill(Math.cos(s0.angle));
  const fm=new T.Mesh(geo,stdMat({map:ftex,side:T.DoubleSide,roughness:.8}));fm.frustumCulled=false;world.add(fm);
  flags.push({mesh:fm,base:geo.attributes.position.array.slice(),xn,dx,dz,amp:.3});}
 // Boost-Pads
 const padMat=new T.MeshBasicMaterial({map:boostTex});
 for(const v of course.boost){const d=straightSpot(v,10,45,60);boostPads.push(d);addStrip(strip(d-2.3,d+2.3,0,11,.1,4.6,6),padMat,false);}
 for(const g of gaps){const d=g.start-40;boostPads.push(lapDist(d));addStrip(strip(d-2.3,d+2.3,0,11,.1,4.6,6),padMat,false);}
 // Rollzonen haben DURCHGAENGIGEN Turbo: das breite Energieband ist zugleich der Schub
 // (Funktion siehe update: inRoll haelt Schwung oben). Keine Einzelpads mehr - die Zone
 // schiebt durchgehend, wie ein langer Boost-Streifen.
 bm('gate+boost');
 // Ballonbogen ueber der Fahrbahn, 14 m nach dem Start-Ziel-Tor: beim Countdown steht er
 // hinter dem Tor im Bild, beim Zieleinlauf faehrt man durch ihn ins Ziel.
 // Alle Ballons teilen sich vier Instanz-Meshes (CapPaint je Instanz gefaerbt) - 4 Aufrufe.
 if(P.balloon){const NB=7,arc=[],rope=[];for(let i=0;i<NB;i++){const u=-1+2*i/(NB-1),s=samplePos(14,u*11.2,new T.Vector3()),h=12.6-3.5*u*u;
   arc.push({x:s.x,y:s.y+h,z:s.z,s:1.05+.2*(1-u*u),ry:-u*.5,col:FAN_COLS[i%FAN_COLS.length]});rope.push(s.clone().setY(s.y+h-1.1));}
  scatterColored(P.balloon,arc,'CapPaint',glow?.35:0);
  const ends=[samplePos(14,-12.4,new T.Vector3()),samplePos(14,12.4,new T.Vector3())];ends.forEach(p=>p.y=Math.max(0,p.y));
  const curve=new T.CatmullRomCurve3([ends[0],...rope,ends[1]]),cable=new T.Mesh(new T.TubeGeometry(curve,48,.07,5),dark);
  cable.castShadow=false;world.add(cable);
  const posts=mergeGeometries(ends.map(p=>new T.CylinderGeometry(.14,.18,2.4,6).translate(p.x,p.y+1.2,p.z)));
  const pm2=new T.Mesh(posts,cream);pm2.castShadow=true;world.add(pm2);}
 {const poles=[],pens=[],M4=new T.Matrix4(),col=new T.Color();for(let i=0;i<16;i++){const d=length*(i+.5)/16,fo=i%2?13:-13;if(inGap(d)||inZone(d,4)||forkBlocks(d,fo)||inBridge(d)||inTunnel(d))continue;const s=sample(d,fo);M4.makeRotationY(s.angle).setPosition(s.p.x,groundAt(d,fo).y-.1,s.p.z);addObstacle(s.p.x,s.p.z,.35);
  poles.push(new T.BoxGeometry(.12,3.1,.12).translate(0,1.55,0).applyMatrix4(M4));const pg=new T.PlaneGeometry(1.5,.7,5,1),n=pg.attributes.position.count,xn=new Float32Array(n),dx=new Float32Array(n),dz=new Float32Array(n),cc=new Float32Array(n*3);col.setHex((course.pennants||theme.pennants)?(course.pennants||theme.pennants)[i%2]:(glow?(i%2?0xff3cac:0x2de2e6):(i%2?0xed6350:0xffd45c)));
  for(let v=0;v<n;v++){xn[v]=(pg.attributes.position.getX(v)+.75)/1.5;dx[v]=Math.sin(s.angle);dz[v]=Math.cos(s.angle);cc[v*3]=col.r;cc[v*3+1]=col.g;cc[v*3+2]=col.b;}pg.translate(.81,2.75,0).applyMatrix4(M4);pg.setAttribute('color',new T.BufferAttribute(cc,3));pg.userData={xn,dx,dz};pens.push(pg);}
 if(poles.length){world.add(new T.Mesh(mergeGeometries(poles),cream));const geo=mergeGeometries(pens);const xn=new Float32Array(geo.attributes.position.count),dx=xn.slice(),dz=xn.slice();let o=0;for(const pg of pens){xn.set(pg.userData.xn,o);dx.set(pg.userData.dx,o);dz.set(pg.userData.dz,o);o+=pg.userData.xn.length;}geo.attributes.position.setUsage(T.DynamicDrawUsage);
  const penMesh=new T.Mesh(geo,glow?new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide}):stdMat({vertexColors:true,side:T.DoubleSide,roughness:.8}));penMesh.frustumCulled=false;world.add(penMesh);flags.push({mesh:penMesh,base:geo.attributes.position.array.slice(),xn,dx,dz});}}
 // Zaeune aussen an scharfen Kurven (auch Kollision)
  buildTunnels();buildBridges();buildRails();buildForkVisuals();if(hpipes.length)buildHalfpipes();buildR60Late();
 bm('flags+fences');buildChevrons();bm('chevrons');
 buildScenery(random);bm('scenery');
 buildRamps();buildPads();buildSwingers();buildSpores();buildStands();buildChallenges();buildVoxDeco();buildModule();bm('ramps..stands');
 boxes=[];for(const v of course.boxes){let d=cpDist(v);if(lapDist(d+52)<66)d=lapDist(d+72);for(const k of [-4,0,4]){const s=sample(d,k);boxes.push({distance:d,offset:k,x:s.p.x,z:s.p.z,baseY:s.p.y+1.6,cooldown:0});}}
 for(const f of forks){const rel=Math.round(f.span*.55),d=f.dA+rel,o=f.offT[rel];for(const k of [-2.6,2.6]){const s=sample(d,o+k);boxes.push({distance:lapDist(d),offset:o+k,x:s.p.x,z:s.p.z,baseY:Math.max(0,s.p.y)+1.6,cooldown:0});}}
 // R65: Itemboxen als Retro-Pixel-"?"-Bloecke (voxel.mjs) - der Fake-Block sieht genauso aus, nur mit kopfstehendem "¿"
 boxInst=[];const bsrc=[[voxGeo('qreal'),voxMat]];
 for(const [g,m] of bsrc){const im=new T.InstancedMesh(g,m,boxes.length);im.instanceMatrix.setUsage(T.DynamicDrawUsage);im.frustumCulled=false;world.add(im);boxInst.push(im);}
 {const lm=label('?','#ed6350','#fff9df',128,128),geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(new Float32Array(boxes.length*3),3));boxQ=new T.Points(geo,new T.PointsMaterial({map:lm.map,size:1.1,transparent:true,depthWrite:false}));boxQ.frustumCulled=false;world.add(boxQ);lm.dispose();}
 bm('boxes');}
// Neues Rennen auf derselben Strecke: Welt bleibt stehen, nur Fahrer & Zustand werden zurueckgesetzt (kein Ruckler beim Start)
function resetRace(){ridePhoto=null;photoPending=false;clearGroup(actors,kartsG);orbitFx.clear();topFx.clear();trailFx.clear();emotes.length=0;{const th=course?.theme;skidMesh.material.color.setHex(th==='ice'?0xdff2ff:th==='canyon'||th==='beach'?0x6e4a2a:th==='choco'?0x2e1a0c:0x14181f);skidMesh.material.opacity=th==='ice'?.5:.36;}hazards=[];shots=[];bombs=[];stormFx=[];fworks=[];for(const sh of shocks){sh.t=9;sh.m.visible=false;}roulette=null;cer=null;shake=0;lastPlace=8;leadAt=-99;wrongT=0;
 for(let i=0;i<SKIDS;i++){skids[i].life=0;skidMesh.setMatrixAt(i,_zeroM);}skidMesh.instanceMatrix.needsUpdate=true;for(let i=0;i<SPARKS;i++){sparkPool[i].life=0;sparkMesh.setMatrixAt(i,_zeroM);}sparkMesh.instanceMatrix.needsUpdate=true;for(let i=0;i<PUFFS;i++){puffPool[i].life=0;puffMesh.setMatrixAt(i,_zeroM);}puffMesh.instanceMatrix.needsUpdate=true;
 for(const b of boxes)b.cooldown=0;for(const s of spores)s.cd=0;for(const r of rings)r.flash=0;for(const p of pads)p.squash=0;lightState=-2;setLights(0);
 placeRacers();drawMap();}
// Shader aller selten sichtbaren Effekte vorab kompilieren (Flammen, Schild, Banane, Panzer), sonst ruckelt der erste Einsatz
// Shader im Hintergrund kompilieren (KHR_parallel_shader_compile); bis dahin bleibt die Strecke ausgeblendet statt das Bild einzufrieren
let buildToken=0,worldReady=true,readyPromise=Promise.resolve();
// Ausgeblendete Kartteile (Boot, Tauchboot, Flugzeug, Schild, Gleiter) ueberging die allgemeine
// Vorkompilierung - beim ersten Auftauchen im Rennen kompilierte der Browser die Shader und das
// Bild stockte (nur in Runde 1). Kurz einblenden, im Hintergrund kompilieren, wieder ausblenden.
function warmKarts(){showHidden(kartsG,()=>{try{renderer.compileAsync(kartsG,camera,scene).catch(()=>{});}catch(e){}});initTextures(kartsG);}
// R44: dasselbe fuer die ganze Strecke - Drache (erst in seiner Zone sichtbar), Boots-/Tauch-/Flugteile,
// Unterwasser-Deko und Missionsteile kompilierten sonst erst beim ersten Auftauchen (Profil Magnet-Kirmes:
// BoatGlass bei 149 m, DragonFin bei 220 m, je 130-200 ms Standbild in Runde 1).
function showHidden(root,fn){const hidden=[];root.traverse(o=>{if(!o.visible){hidden.push(o);o.visible=true;}});try{fn();}finally{for(const o of hidden)o.visible=false;}}
// Texturen vorab hochladen (sonst beim ersten Sichtkontakt mitten im Rennen)
function initTextures(root){const seen=new Set();root.traverse(o=>{if(!o.material)return;for(const m of [].concat(o.material))if(m)for(const k of ['map','alphaMap','emissiveMap','normalMap','roughnessMap','metalnessMap','aoMap'])if(m[k]&&!seen.has(m[k])){seen.add(m[k]);try{renderer.initTexture(m[k]);}catch(e){}}});}
function warmup(){const tmp=new T.Group(),add=o=>{o.traverse(c=>{c.visible=true;c.frustumCulled=false;});tmp.add(o);};add(new T.Mesh(flameGeo,flameMat));add(new T.Mesh(shieldGeo,shieldMat));add(bombMesh());add(new T.Mesh(shockGeo,shocks[0].m.material));if(P.banana)add(cloneProto(P.banana));if(P.shell)add(cloneProto(P.shell));if(P.ghost)add(cloneProto(P.ghost));
 tmp.position.copy(camera.position);scene.add(tmp);const tok=++buildToken;let p;const sky0=[stars.visible,moon.visible,sunGlow.visible];stars.visible=moon.visible=sunGlow.visible=true;showHidden(world,()=>showHidden(wxRoot,()=>{try{p=renderer.compileAsync(scene,camera);}catch(e){p=Promise.resolve();}}));[stars.visible,moon.visible,sunGlow.visible]=sky0;scene.remove(tmp);initTextures(world);
 worldReady=false;world.visible=false;actors.visible=false;$('trackLoading').hidden=false;
 readyPromise=Promise.race([p,new Promise(r=>setTimeout(r,8000))]).then(()=>{if(tok!==buildToken)return;worldReady=true;actors.visible=true;startReveal();$('trackLoading').hidden=true;});}

// Rivale (R46): rotes Schild ueber seinem Kart, Anzeige im HUD, Bonus im Ergebnis
let rivalId=null,rivalSprite=null;
function rivalMark(){if(rivalSprite)return rivalSprite;const c=document.createElement('canvas');c.width=256;c.height=88;const q=c.getContext('2d');
 q.fillStyle='#15133a';q.beginPath();q.roundRect(6,6,244,62,20);q.fill();q.fillStyle='#e8202a';q.beginPath();q.roundRect(12,10,232,50,16);q.fill();
 q.beginPath();q.moveTo(112,66);q.lineTo(144,66);q.lineTo(128,84);q.closePath();q.fillStyle='#15133a';q.fill();
 q.font='italic 900 34px Rubik,"Trebuchet MS",sans-serif';q.textAlign='center';q.textBaseline='middle';q.lineJoin='round';q.lineWidth=7;q.strokeStyle='#15133a';q.strokeText('⚔ RIVALE',128,36);q.fillStyle='#fff';q.fillText('⚔ RIVALE',128,36);
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;rivalSprite=new T.Sprite(new T.SpriteMaterial({map:t,depthWrite:false}));rivalSprite.scale.set(2.9,1,1);rivalSprite.visible=false;rivalSprite.renderOrder=5;scene.add(rivalSprite);return rivalSprite;}
function updateRival(){const on=rivalId!==null&&(state==='race'||state==='countdown')&&racers[rivalId];const sp=rivalSprite||(on?rivalMark():null);if(!sp)return;
 if(!on){sp.visible=false;return;}const r=racers[rivalId],p=r.mesh.position,me=racers[0];sp.visible=r.mesh.visible&&Math.hypot(me.x-r.x,me.z-r.z)<130&&r.finishTime===null;
 if(sp.visible){const sc=r.mesh.scale.y||1,k=clamp(camera.position.distanceTo(p)/22,1,2.2);sp.scale.set(2.9*k,k,1);sp.position.set(p.x,p.y+3.1*sc+.4*k+(r.stun>0?.5:0),p.z);}}
function placeRacers(){ensureR60Protos();const cls=CLASSES[cc];racers=[];
 // Online (R55): Startplaetze nach globalem Platz, jeder Browser faehrt sich selbst als Nummer 0
 const on=!!(net&&net.setup),nF=fieldSize(),order=isTT()?[0]:on?gridOrder(nF).map(g=>toLocal(g,net.mySlot)):gridOrder(nF),ai=order.filter(id=>id!==0),info=id=>on?netSlot(id):{human:false,n:AI_NAMES[id],d:AI_DRIVERS[id],c:AI_COLORS[id-1]};
 // Karts bleiben zwischen Rennen stehen, solange Figur/Farbe/Feldgroesse gleich sind: spart Aufbau und Upload
 // Ladezustand mit in die Signatur: sonst bleiben notgebaute Karts im Zwischenspeicher haengen
 const sig=[order.length,colorIndex,driverIndex,kartStyle,P.kartbodies?1:0,KART_COLORS[colorIndex].gold?1:0,AI_DRIVERS.join(''),P.kart?1:0,P.driver?1:0,P.kartwheel?1:0,P.glider?1:0,P.transform?1:0,P.kartkit?1:0,on?ai.map(id=>{const q=info(id);return q.d+':'+q.c;}).join(','):''].join('|');
 const reuse=!!kartPool&&kartPool.sig===sig&&kartPool.meshes.length===order.length;
 if(!reuse){clearGroup(kartsG);kartInst=null;kartPool=null;buildKartInstances(isTT()?null:ai.map(id=>info(id).d));}// Startplatz 6 fuer den Spieler: der Sieg muss erfahren werden
 for(let s=0;s<order.length;s++){const id=order[s],q=id===0?null:info(id),r=racer(id,id===0?AI_NAMES[0]:q.n,id===0?KART_COLORS[colorIndex].c:q.c);r.net=on&&id!==0&&(q.human||!net.host);const w3=order.length>8,d=w3?-(9+Math.floor(s/3)*7.5+(s%3)*1.5):-(9+Math.floor(s/2)*7.5+(s%2)*3),off=w3?[4.6,0,-4.6][s%3]:s%2?-3.3:3.3,p=sample(d,off);r.x=p.p.x;r.z=p.p.z;r.h=p.angle;r.distance=d;r.offset=off;r.safeD=d;
  const dv=DRIVERS[id===0?driverIndex:q.d]||DRIVERS[0];
  r.mAcc=dv.acc;r.mTop=dv.top;r.mGrip=dv.grip;r.mTurn=dv.turn;r.kartScale=dv.sc;
  r.skill=clamp(cls.skill+(7-id)*.012+(id%3-1)*.02,.3,.98);r.laneBias=((id*37)%11-5)*.3;r.driftCd=0;r.aiDrift=0;
  if(reuse){r.mesh=kartPool.meshes[s];const u=r.mesh.userData;if(u.shield)u.shield.visible=false;if(u.glider)u.glider.visible=false;resetTransform(u);if(u.flames)for(const f of u.flames)f.visible=false;r.mesh.visible=true;r.mesh.scale.setScalar(1);}
  else{r.mesh=id===0||!kartInst?kart(r.color,id===0&&KART_COLORS[colorIndex].gold,id===0?driverIndex:q.d,id===0?kartStyle:undefined):kartVirtual(r.color,ai.indexOf(id));kartsG.add(r.mesh);}
  if(r.mesh.userData.netTag||on)netTag(r,on&&q&&q.human?q.n:'');
  {const u=r.mesh.userData;if(u.shield)u.shield.material=id===0?shieldMat:shieldRivalMat;}
  racers[id]=r;}
 if(!reuse){kartPool={sig,meshes:order.map(id=>racers[id].mesh)};warmKarts();}
 // Rivale (R46): einer aus den ersten drei Startplaetzen, faehrt etwas besser als sein Klassenwert
 rivalId=isTT()||worldMode||on?null:pickRival(ai);if(rivalId!==null)racers[rivalId].skill=Math.min(.98,racers[rivalId].skill+.1);
 racers.forEach(r=>{vertical(r,1/60);syncKart(r,0);});syncKartInstances();camH=racers[0].h;lastPlace=racers.length;setupGhost();}
// ---------------------------------------------------------------- Zeitfahren: Geist der eigenen Bestzeit + Medaillen
const isTT=()=>mode==='tt'&&!gp.active;
// R61 Cups: ein Grand Prix faehrt die Strecken des gewaehlten Cups (gp.list), der Marathon alle
const gpN=()=>gp.list?gp.list.length:courses.length,gpName=()=>cupById(gp.cup||'alle').name;
const newGp=on=>on?{active:true,race:0,points:{},cup:gpCup,list:cupTracks(gpCup,courses.length)}:{active:false,race:0,points:{}};
let ghost=null,rec=null;
function setupGhost(){ghost=null;rec=null;if(!isTT())return;rec={x:[],y:[],z:[],h:[],d:[],next:0};const data=store.get(`ghost-${selected}`,null);if(!data||!data.x||!data.x.length)return;
 const g=kart(data.color??0xffffff,false,data.driver??0);g.traverse(o=>{if(!o.isMesh)return;o.castShadow=false;o.material=[].concat(o.material).map(m=>{const c=m.clone();c.transparent=true;c.opacity=.36;c.depthWrite=false;return c;})[0];});actors.add(g);ghost={mesh:g,data,dist:0};}
function recordGhost(p){if(!rec||elapsed<rec.next)return;rec.next+=.1;rec.x.push(Math.round(p.x*10));rec.y.push(Math.round(p.y*10));rec.z.push(Math.round(p.z*10));rec.h.push(Math.round(p.h*100));rec.d.push(Math.round(p.distance*10));}
function updateGhost(){if(!ghost)return;const D=ghost.data,f=elapsed/.1,i=Math.floor(f),n=D.x.length;if(state!=='race'||i>=n-1){ghost.mesh.visible=state==='countdown';if(i>=n-1)ghost.dist=Infinity;return;}
 const k=f-i,L=a=>(a[i]+(a[i+1]-a[i])*k)/10;ghost.mesh.visible=true;ghost.mesh.position.set(L(D.x),L(D.y)+.1,L(D.z));ghost.mesh.rotation.set(0,(D.h[i]+(D.h[i+1]-D.h[i])*k)/100,0);ghost.dist=L(D.d);}
function medalOf(time){const m=course.medals;return time<=m[0]?0:time<=m[1]?1:time<=m[2]?2:3;}
const MEDALS=['🥇 GOLD','🥈 SILBER','🥉 BRONZE'];

// ---------- Viadukt: angehobene Abschnitte mit Bruecken-Flag bekommen Deck, Seitenwaende und Pfeiler statt Boeschung
function wallStrip(d0,d1,off,y0,y1,steps){const n=steps+1,v=new Float32Array(n*6),idx=[];for(let i=0;i<n;i++){const d=d0+(d1-d0)*i/steps,p=samplePos(d,off,_sp);v.set([p.x,p.y+y0,p.z,p.x,p.y+y1,p.z],i*6);if(i<steps){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();return g;}
function nearOtherRoad(x,z,d,dist){for(let i=0;i<PS;i+=3){if(Math.abs(wrapDiff(i*length/PS,d))<70)continue;if(Math.hypot(TP.x[i]-x,TP.z[i]-z)<dist)return true;}return false;}
function buildBridges(){const deckMat=mat(theme.glow?0x2c2650:0x9a948a,{roughness:.95,side:T.DoubleSide}),pillarMat=mat(theme.glow?0x241f40:0xb0aa9f,{roughness:.9});
 for(const q of raises){if(!q.bridge)continue;const span=lapDist(q.e-q.s),segs=[];let a=-1;for(let o=0;o<=span;o+=1){const d=q.s+o,top=trackAt(d).h>2.2&&!hasMag(d);if(top&&a<0)a=d;if((!top||o+1>span)&&a>=0){segs.push([a,d]);a=-1;}}
  for(const [d0,d1] of segs){const steps=Math.ceil((d1-d0)/1.2);addStrip(strip(d0,d1,0,18.8,-1.2,6,steps),deckMat);const walls=[wallStrip(d0,d1,-9.4,-1.2,.12,steps),wallStrip(d0,d1,9.4,-1.2,.12,steps)];const wm=new T.Mesh(mergeGeometries(walls),deckMat);wm.castShadow=true;world.add(wm);
   const pg=[];for(let d=d0+5;d<d1-2;d+=14){const h=trackAt(d).h-1.2;if(h<1.8)continue;for(const side of [-1,1]){const p=samplePos(d,side*5.8,new T.Vector3());if(nearOtherRoad(p.x,p.z,d,11.5))continue;pg.push(new T.BoxGeometry(1.5,h,1.5).translate(p.x,h/2,p.z));addObstacle(p.x,p.z,1.15,h-.2);}}
   if(pg.length){const pm=new T.Mesh(mergeGeometries(pg),pillarMat);pm.castShadow=true;pm.receiveShadow=true;world.add(pm);}}}}
// ---------- Halfpipe (R52): Wandflaechen aus demselben posAt wie die Physik (Bild und Fahren decken sich), Metallkante
// (Coping) an der Lippe, Plattform oben und Rueckwand bis zum Boden. Pfeile auf der Wand zeigen hinauf.
const HP_COL={ice:['#eaf6ff','#2f6bff','#d7263d'],beach:['#f4e8c8','#2ec4b6','#ff6a3d'],dome:['#e8dcc0','#5a2a8a','#e8b84a'],forest:['#dfe6ea','#2ab7a9','#ff8a3d'],fair:['#f3e9f7','#ff3b6b','#ffd23f'],canyon:['#f1dcc0','#e0663a','#2b1d24'],night:['#2a2750','#2de2e6','#ff3cac'],haunted:['#3a3350','#8a5cff','#c9ff5c'],lava:['#3a2a2a','#ff5a1f','#ffd23f'],rainbow:['#2c2650','#4fd8ff','#ff4fd8']};
function hpPoint(d,lat,up,out){const [i,j,k]=tIdx(d);let tx=TP.tx[i]+(TP.tx[j]-TP.tx[i])*k,tz=TP.tz[i]+(TP.tz[j]-TP.tz[i])*k;const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;
 const bb=TP.b[i]+(TP.b[j]-TP.b[i])*k;return out.set(TP.x[i]+(TP.x[j]-TP.x[i])*k+tz*lat,TP.h[i]+(TP.h[j]-TP.h[i])*k-bb*lat+up,TP.z[i]+(TP.z[j]-TP.z[i])*k-tx*lat);}
function buildHalfpipes(){const [base,c1,c2]=HP_COL[course.theme]||HP_COL.forest,glow=theme.glow;
 const tex=canvasTex(128,256,(q,w,h)=>{q.fillStyle=base;q.fillRect(0,0,w,h);
  // Beton-Sprenkel, Fugen, zwei Farbbaender unter der Lippe und Pfeile nach oben
  for(let n=0;n<700;n++){q.fillStyle=Math.random()<.5?'#0000000d':'#ffffff12';q.fillRect(Math.random()*w,Math.random()*h,2,2);}
  q.fillStyle='#00000018';q.fillRect(0,0,w,2);q.fillRect(0,h*.5,w,2);
  q.fillStyle=c1;q.fillRect(0,h*.02,w,h*.07);q.fillStyle=c2;q.fillRect(0,h*.1,w,h*.035);
  q.fillStyle=c1+'cc';for(const y of [.62,.8]){q.beginPath();q.moveTo(w*.28,h*y+18);q.lineTo(w*.5,h*y);q.lineTo(w*.72,h*y+18);q.lineTo(w*.72,h*y+30);q.lineTo(w*.5,h*y+12);q.lineTo(w*.28,h*y+30);q.fill();}},true);
 const wallMat=stdMat({map:tex,roughness:.85,side:T.DoubleSide,...(glow?{emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.35}:{})});
 const deckMat=mat(glow?0x1c1838:0xb8b2a8,{roughness:.9,side:T.DoubleSide}),backMat=mat(glow?0x15122c:theme.grass,{roughness:1,side:T.DoubleSide});
 const copMat=stdMat({color:glow?0xffffff:0xd9dde2,roughness:.3,metalness:.8,...(glow?{emissive:new T.Color(c1),emissiveIntensity:.8}:{})});
 const wallG=[],deckG=[],backG=[],copG=[],N=14,DECK=2.4,_p=new T.Vector3();
 for(const z of hpipes){const steps=Math.ceil(z.span/1.5);
  for(const sg of [-1,1]){const cols=N+1,v=new Float32Array((steps+1)*cols*3),uv=new Float32Array((steps+1)*cols*2),idx=[],dv=[],bv=[],lip=[];
   for(let i=0;i<=steps;i++){const x=z.span*i/steps,d=lapDist(z.s+x),env=hpEnv(x,z.span),top=HP.R*env*Math.PI/2;
    for(let c=0;c<cols;c++){const u=top*c/N;posAt(d,sg*(HP.flat+u),.03,_p);const o=(i*cols+c);v[o*3]=_p.x;v[o*3+1]=_p.y;v[o*3+2]=_p.z;uv[o*2]=x/8;uv[o*2+1]=1-(1-c/N)*env;
     if(i<steps&&c<N){const a=o,b=o+cols;idx.push(a,b,a+1,a+1,b,b+1);}}
    // Lippe, Plattform (waagerecht nach aussen), Rueckwand bis knapp unter den Boden
    const lat=HP.flat+HP.R*Math.sin(env*Math.PI/2),up=HP.R*(1-Math.cos(env*Math.PI/2));
    hpPoint(d,sg*lat,up,_p);lip.push(_p.clone());dv.push(_p.clone());hpPoint(d,sg*(lat+DECK),up,_p);dv.push(_p.clone());
    // Erdwall: Grasboeschung vom Plattformrand bis auf den Boden am Aussenrand (dort beginnt die Wiese)
    bv.push(_p.clone());hpPoint(d,sg*HP.outer,groundAt(d,sg*(HP.outer+1)).y-roadRef(d,sg*HP.outer)-.25,_p);bv.push(_p.clone());}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(v,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();wallG.push(g);
   const quad=(pts,arr)=>{const pv=new Float32Array(pts.length*3),ix=[];pts.forEach((p,i)=>pv.set([p.x,p.y,p.z],i*3));for(let i=0;i+3<pts.length;i+=2)ix.push(i,i+2,i+1,i+1,i+2,i+3);const q=new T.BufferGeometry();q.setAttribute('position',new T.BufferAttribute(pv,3));q.setIndex(ix);q.computeVertexNormals();arr.push(q);};
   quad(dv,deckG);quad(bv,backG);
   copG.push(new T.TubeGeometry(new T.CatmullRomCurve3(lip.filter((_,i)=>i%2===0)),Math.max(8,lip.length),.22,6,false));}}
 const add=(geos,m,shadow=true)=>{const me=new T.Mesh(mergeGeometries(geos),m);me.castShadow=shadow;me.receiveShadow=true;world.add(me);return me;};
 add(wallG,wallMat);add(deckG,deckMat);add(backG,backMat);add(copG,copMat,false);}
// ---------- Leitplanken: aussen an kritischen Kurven und beidseitig auf erhoehten Abschnitten. Weiche Gleit-Kollision statt Stopp.
const RAIL_OFF=9.2,RAIL_LIMIT=8.05,RAIL_COL={beach:['#ff6a3d','#ffffff',0x7a6a5a],ice:['#d7263d','#ffffff',0x5a6470],dome:['#d9c9a6','#a8987a',0x8a7a62],forest:['#e8352e','#ffffff',0x5a6470],canyon:['#ffd23f','#2b1d24',0x5a3a2a],night:['#2de2e6','#ff3cac',0x22204a],haunted:['#8a5cff','#1a1426',0x2e2840],lava:['#ff5a1f','#1a1012',0x3a2a2a],fair:['#ff3b6b','#ffe45c',0x3a2c62]};
function railBlocked(d,side){if(inGap(d)||Math.abs(wrapDiff(d,0))<16||hpAt(d,16))return true;
 // Im Looping und an seiner Anfahrt keine Planken: die Bahn kreuzt sich dort selbst, die Planken
 // der Geraden lägen quer im Kreis. Stattdessen haelt der Seitenmagnet das Kart auf der Bahn.
 if(loops.length)for(const q of loops)if(lapDist(d-q.s+20)<q.span+40)return true;
 if(elems.length&&elemAt(d,20))return true;
 if(hasMag(d))return false;const fk=forkAt(d,14);return !!fk&&side===fk.f.side;}
function buildRails(){const list=[],ds=2;
 const scan=(test,kind,sides)=>{let a=-1,sd=0;for(let d=0;d<=length+ds;d+=ds){const s=test(d),ok=s!==0&&!railBlocked(d,s);if(ok&&a<0){a=d;sd=s;}else if(a>=0&&(!ok||s!==sd)){if(d-a>6)for(const x of sides(sd))list.push({d0:a-8,d1:d+8,side:x,kind});a=ok?d:-1;sd=s;}}};
 // Flow (R39): Planken schon ab 65 m Kurvenradius und beidseitig in jeder Landezone - wer nach
 // einem Sprung in die Kurve kommt, gleitet an der Planke entlang statt ins Gras zu fliegen
 // R50 Offene Welt: keine Kurven- und Landeplanken - die Wiese neben der Strasse ist frei befahrbar
 if(!course.openWorld){scan(d=>{const k=trackAt(d).kap;return Math.abs(k)>1/65?(k>0?-1:1):0;},'corner',s=>[s]);
 scan(d=>ramps.some(rp=>{const a=wrapDiff(d,rp.end);return a>4&&a<48;})&&!inGap(d)?1:0,'high',()=>[-1,1]);}
 scan(d=>raiseH(d)>2&&!inGap(d)?1:0,'high',()=>[-1,1]);
 scan(d=>inTunnel(d)?1:0,'high',()=>[-1,1]);
 scan(d=>hasMag(d)?1:0,'high',()=>[-1,1]);
 if(!course.openWorld)scan(d=>inZone(d,2)?1:0,'high',()=>[-1,1]);
 list.sort((a,b)=>a.side-b.side||a.d0-b.d0);for(const r of list){const last=rails[rails.length-1];if(last&&last.side===r.side&&r.d0<=last.d1+6){last.d1=Math.max(last.d1,r.d1);if(r.kind==='high')last.kind='high';}else rails.push({...r});}
 // Planke an die Aussenkante der Auslaufzone, wenn diese dort ueberwiegend vorhanden ist
 for(const r of rails){let on=0,all=0;for(let d=r.d0;d<=r.d1;d+=2){all++;if(shoulderOk(d,r.side))on++;}const wide=all&&on/all>.7;r.off=wide?SHOULDER+.6:RAIL_OFF;r.lim=wide?SHOULDER-.55:RAIL_LIMIT;}
 rails=rails.filter(r=>{for(let d=r.d0;d<=r.d1;d+=3)if(inGap(d))return false;return true;});
 if(!rails.length)return;const [ca,cb,postCol]=RAIL_COL[course.theme]||RAIL_COL.forest;
 const tex=canvasTex(64,16,(q,w,h)=>{q.fillStyle=ca;q.fillRect(0,0,w,h);q.fillStyle=cb;for(let x=-16;x<w;x+=32){q.beginPath();q.moveTo(x,h);q.lineTo(x+16,0);q.lineTo(x+32,0);q.lineTo(x+16,h);q.fill();}q.fillStyle='#0003';q.fillRect(0,h-3,w,3);},true);
 const band=stdMat({map:tex,roughness:.45,metalness:.25,side:T.DoubleSide,...(theme.glow?{emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.55}:{})});
 const geos=[],posts=[];for(const r of rails){const steps=Math.max(2,Math.ceil((r.d1-r.d0)/1.6)),n=steps+1,v=new Float32Array(n*6),uv=new Float32Array(n*4),idx=[];
 for(let i=0;i<n;i++){const d=r.d0+(r.d1-r.d0)*i/steps,p=samplePos(d,r.side*(r.off||RAIL_OFF),_sp);v.set([p.x,p.y+.3,p.z,p.x,p.y+.84,p.z],i*6);uv.set([(d-r.d0)/2.2,0,(d-r.d0)/2.2,1],i*4);if(i<steps){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}if(i%2===0)posts.push([p.x,p.y,p.z,d]);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(v,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();geos.push(g);}
 const bm2=new T.Mesh(mergeGeometries(geos),band);bm2.castShadow=true;world.add(bm2);
 const pi=new T.InstancedMesh(new T.BoxGeometry(.14,1.5,.14),mat(postCol,{roughness:.6,metalness:.3}),posts.length);posts.forEach(([x,y,z,d],i)=>{const t=tanAt(d);_e.set(0,Math.atan2(t.x,t.z),rollTot(d),'YXZ');_q.setFromEuler(_e);_m.compose(_v.set(x,y+.1,z),_q,_s.set(1,1,1));pi.setMatrixAt(i,_m);});pi.castShadow=true;world.add(pi);}
function railCollide(r,me){if(!rails.length)return;
 // In Roll- und Loopzonen haelt die Fuehrung; zwei Korrektursysteme wuerden gegeneinander arbeiten
 if((agrav.length||loops.length)&&hasRoll(r.distance))return;
 const dl=lapDist(r.distance);for(const rl of rails){if(lapDist(dl-rl.d0)>rl.d1-rl.d0)continue;const so=r.offset*rl.side,lim=rl.lim||RAIL_LIMIT;if(so<lim||so>lim+6)continue;if((r.y||0)>groundAt(r.distance,r.offset).y+1.5)continue;
  const t=tanAt(r.distance),nx=-rl.side*t.z,nz=rl.side*t.x,pen=so-lim;r.x+=nx*pen;r.z+=nz*pen;r.offset=rl.side*lim;
  const vn=r.vx*nx+r.vz*nz;if(vn<0){r.vx-=nx*vn*1.0;r.vz-=nz*vn*1.0;const loss=Math.min(.08,-vn*.006);r.vx*=1-loss;r.vz*=1-loss;if(-vn>7){r.combo=0;if(me){shake=Math.max(shake,Math.min(.28,-vn*.018));SFX.bump(clamp(-vn/26,.2,.8));stats.bumps++;r.lapDirty=true;}}}
  if(Math.abs(r.speed)>9&&frame%2===0&&nearPlayer(r,60))emit(r.x-nx*1.1,(r.y||0)+.55,r.z-nz*1.1,0xffd27a,-Math.sin(r.h)*5+(Math.random()-.5)*3,1+Math.random()*2,-Math.cos(r.h)*5+(Math.random()-.5)*3,.25);
  if(me&&Math.abs(r.speed)>9&&frame%9===0)SFX.scrape();break;}}
// ---------- Abzweigungen: glatte Innenlinie (Bezier, tangential zur Hauptstrecke) als kuerzere, engere Alternative
function buildForks(){for(const fd of course.fork||[])forks.push(computeFork(...fd));}
function computeFork(ca,cb,hk=.34){{const dA=cpDist(ca),span=lapDist(cpDist(cb)-dA),pa=sample(dA),pb=sample(dA+span),chord=Math.hypot(pb.p.x-pa.p.x,pb.p.z-pa.p.z),k=chord*hk;
  const P0=[pa.p.x,pa.p.z],P1=[pa.p.x+pa.t.x*k,pa.p.z+pa.t.z*k],P2=[pb.p.x-pb.t.x*k,pb.p.z-pb.t.z*k],P3=[pb.p.x,pb.p.z],N=180,pts=[];let hint=dA,len=0;
  for(let i=0;i<=N;i++){const u=i/N,a=(1-u)**3,b=3*(1-u)**2*u,c=3*(1-u)*u*u,e=u**3,x=a*P0[0]+b*P1[0]+c*P2[0]+e*P3[0],z=a*P0[1]+b*P1[1]+c*P2[1]+e*P3[1],pr=project(x,z,hint);hint=pr.d;if(i)len+=Math.hypot(x-pts[i-1].x,z-pts[i-1].z);pts.push({x,z,d:pr.d,off:pr.off,rel:lapDist(pr.d-dA)});}
  for(let i=0;i<=N;i++){const p=pts[i],q0=pts[Math.max(0,i-1)],q1=pts[Math.min(N,i+1)],tx=q1.x-q0.x,tz=q1.z-q0.z,tl=Math.hypot(tx,tz)||1;p.tx=tx/tl;p.tz=tz/tl;p.y=groundAt(p.d,p.off).y;p.h=Math.atan2(p.tx,p.tz);}
  let minR=1e9;const kap=pts.map((p,i)=>{if(i<2||i>N-2)return 0;const dh=angleDiff(pts[i+1].h,pts[i-1].h),sl=Math.hypot(pts[i+1].x-pts[i-1].x,pts[i+1].z-pts[i-1].z)||1;return dh/sl;});
  const M=Math.ceil(span)+1,offT=new Float32Array(M),vT=new Float32Array(M).fill(99);let j=0;
  for(let m=0;m<M;m++){while(j<N-1&&pts[j+1].rel<m)j++;const a=pts[j],b=pts[Math.min(N,j+1)],t=b.rel>a.rel?clamp((m-a.rel)/(b.rel-a.rel),0,1):0;offT[m]=a.off+(b.off-a.off)*t;let km=0;for(let s=Math.max(0,j-4);s<=Math.min(N,j+5);s++)km=Math.max(km,Math.abs(kap[s]));vT[m]=maxCornerSpeed(km);if(km>1e-4)minR=Math.min(minR,1/km);}
  const maxOff=offT.reduce((m,o)=>Math.abs(o)>Math.abs(m)?o:m,0);return {dA,span,pts,offT,vT,side:Math.sign(maxOff),maxOff:Math.abs(maxOff),minR,len};}}
function forkAt(d,pad=0){if(!forks.length)return null;const dl=lapDist(d);for(const f of forks){const rel=lapDist(dl-f.dA+pad);if(rel<=f.span+pad*2){const m=clamp(Math.round(rel-pad),0,f.offT.length-1);return {f,off:f.offT[m],rel:m};}}return null;}
function forkRoadNear(d,off,w){const fk=forkAt(d);return !!fk&&Math.abs(off-fk.off)<w&&Math.abs(fk.off)>3;}
// Fahrbahn der Abzweigung als Band: am Anfang/Ende verschmilzt sie keilfoermig mit der Hauptstrecke
const FORK_HALF=5.5,MAIN_EDGE=8.0;
function forkBand(d,off,pad=0){const fk=forkAt(d);if(!fk)return false;const oo=off*fk.f.side;if(oo<=0)return false;const o=Math.abs(fk.off);return oo>=o-FORK_HALF-.4-pad&&oo<=o+FORK_HALF+.4+pad;}
function forkEdges(p,side){const oo=p.off*side,outer=oo+FORK_HALF,inner=Math.max(MAIN_EDGE,oo-FORK_HALF);return outer<=MAIN_EDGE+.15?null:{inner,outer,w:outer-inner,c:side*(inner+outer)/2,island:oo-FORK_HALF>MAIN_EDGE+.6};}
function forkBlocks(d,off){const fk=forkAt(d,10);return !!fk&&Math.sign(off)===fk.f.side&&Math.abs(off)<Math.abs(fk.off)+9;}
// R44: Auslaufzone - beidseitig befestigter Randstreifen von 8,6 bis 11,2 m, zaehlt als Fahrbahn (Platz zum Driften;
// Planken in Kurven stehen an seiner Aussenkante). Nicht auf Bruecken, an Luecken, in Loopings, Roll-, Wasser-, Flug- und
// Achterbahnzonen, nicht auf der Abzweigseite und nicht am Start-Ziel-Tor (Pfeiler). Tabelle in 2-m-Schritten je Seite.
const SHOULDER=11.2;let SHT=null;
function buildShoulder(){const ds=2,n=Math.ceil(length/ds),L=new Uint8Array(n),R=new Uint8Array(n);SHT={ds,n,L,R};if(theme.space)return;
 for(let i=0;i<n;i++){const d=i*ds;if(inGap(d)||inGap(d-6)||inGap(d+6)||(agrav.length&&hasMag(d))||raiseH(d)>.3||raiseH(d-16)>.3||raiseH(d+16)>.3||coasterH(d)>.4||elemAt(d,14)||hpAt(d,12)||Math.abs(wrapDiff(d,0))<10)continue;
  if(loops.length&&loops.some(q=>lapDist(d-q.s+24)<q.span+48))continue;const fk=forkAt(d,16);L[i]=fk&&fk.f.side<0?0:1;R[i]=fk&&fk.f.side>0?0:1;}
 // kurze Stuecke (unter 12 m) weglassen - kein Flackern zwischen breit und schmal
 for(const A of [L,R]){let a=-1;for(let i=0;i<=n;i++){const on=i<n&&A[i];if(on&&a<0)a=i;else if(!on&&a>=0){if(i-a<6)A.fill(0,a,i);a=-1;}}}}
function shoulderOk(d,off){if(!SHT)return false;const i=Math.floor(lapDist(d)/SHT.ds)%SHT.n;return (off<0?SHT.L:SHT.R)[i]===1;}
function onRoad(d,off){if(hpipes.length&&hpAt(d))return true;const a=Math.abs(off);return a<8.6||forkBand(d,off)||(a<SHOULDER&&shoulderOk(d,off));}
function nearFork(x,z,dist){for(const f of forks)for(let i=0;i<f.pts.length;i+=3){const p=f.pts[i];if(Math.abs(p.x-x)<dist&&Math.abs(p.z-z)<dist&&Math.hypot(p.x-x,p.z-z)<dist)return true;}return false;}
function polyStripVar(pts,i0,i1,fn,lift,uvLen){const n=i1-i0+1,v=new Float32Array(n*6),uv=new Float32Array(n*4),idx=[];let acc=0;
 for(let i=0;i<n;i++){const p=pts[i0+i];if(i)acc+=Math.hypot(p.x-pts[i0+i-1].x,p.z-pts[i0+i-1].z);const e=fn(p,i/(n-1)),lx=p.tz,lz=-p.tx;
  for(let s=0;s<2;s++){const o=e.c+(s?1:-1)*e.w/2;v.set([p.x+lx*o,p.y+lift,p.z+lz*o],(i*2+s)*3);uv.set([s,acc/uvLen],(i*2+s)*2);}
  if(i<n-1){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(v,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
function polyStrip(pts,i0,i1,center,width,lift,uvLen){const n=i1-i0+1,v=new Float32Array(n*6),uv=new Float32Array(n*4),idx=[];let acc=0;for(let i=0;i<n;i++){const p=pts[i0+i];if(i)acc+=Math.hypot(p.x-pts[i0+i-1].x,p.z-pts[i0+i-1].z);const lx=p.tz,lz=-p.tx;for(let s=0;s<2;s++){const o=center+(s?1:-1)*width/2;v.set([p.x+lx*o,p.y+lift,p.z+lz*o],(i*2+s)*3);uv.set([s,acc/uvLen],(i*2+s)*2);}if(i<n-1){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(v,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
function buildForkVisuals(){if(!forks.length)return;const glow=theme.glow,po={polygonOffset:true,polygonOffsetFactor:3,polygonOffsetUnits:3};
 const edgeM=mat(theme.edge,{...po,...(glow?{emissive:theme.edge,emissiveIntensity:.35}:{})}),roadM=stdMat({map:speckleTexture(hex(theme.road),hex(theme.roadSpot),900),roughness:.9,...po});
 const curbTex=canvasTex(8,64,(q)=>{q.fillStyle=theme.curbA;q.fillRect(0,0,8,32);q.fillStyle=theme.curbB;q.fillRect(0,32,8,32);},true);curbTex.magFilter=T.NearestFilter;const curbM=stdMat({map:curbTex,roughness:.7,...(glow?{emissive:0xffffff,emissiveMap:curbTex,emissiveIntensity:.9}:{})});
 for(const f of forks){const N=f.pts.length-1,s=f.side;let i0=0,i1=N;
  while(i0<N&&!forkEdges(f.pts[i0],s))i0++;while(i1>0&&!forkEdges(f.pts[i1],s))i1--;i0=Math.max(0,i0-1);i1=Math.min(N,i1+1);if(i1-i0<4)continue;
  // Keil: die Fahrbahn waechst aus der Aussenkante der Hauptstrecke heraus und laeuft dort auch wieder hinein
  const band=(pad,extra)=>(p)=>{const e=forkEdges(p,s)||{inner:MAIN_EDGE,outer:MAIN_EDGE,w:0,c:s*MAIN_EDGE};const inner=e.inner-(e.island?extra:0),outer=e.outer+extra;return {c:s*(inner+outer)/2,w:Math.max(0,outer-inner)};};
  addStrip(polyStripVar(f.pts,i0,i1,band(0,1.2),.03,6),edgeM);
  addStrip(polyStripVar(f.pts,i0,i1,band(0,0),.05,6),roadM);
  addStrip(polyStripVar(f.pts,i0,i1,p=>{const e=forkEdges(p,s);return {c:s*((e?e.outer:MAIN_EDGE)-.35),w:.7};},.11,8),curbM);
  addStrip(polyStripVar(f.pts,i0,i1,p=>{const e=forkEdges(p,s);return e&&e.island?{c:s*(e.inner+.35),w:.7}:{c:s*MAIN_EDGE,w:0};},.11,8),curbM);
  // Schild an der Inselspitze
  const tip=f.pts.find(p=>Math.abs(p.off)>15);if(tip){const off=f.side*((Math.abs(tip.off)-6.5+8.9)/2),s=sample(tip.d,off),g=new T.Group();g.position.copy(s.p);g.position.y=Math.max(0,s.p.y);g.rotation.y=s.angle+Math.PI;world.add(g);box(g,dark,0,1,0,.14,2,.14);const sign=mesh(new T.PlaneGeometry(3.4,1.1),label(f.side>0?'⇠ ABKÜRZUNG':'ABKÜRZUNG ⇢','#ffd23f','#2b1d24',512,160),g,0,2.3,0);sign.material.side=T.DoubleSide;addObstacle(s.p.x,s.p.z,.5);}}}
function forkIslandDecor(){if(r60IslandDecor())return;for(const f of forks)for(let rel=10;rel<f.span-10;rel+=11){const off=f.offT[Math.round(rel)],width=Math.abs(off)-FORK_HALF-9.4;if(width<3.5)continue;const mid=f.side*(9.4+width/2),p=samplePos(f.dA+rel,mid,new T.Vector3()),s=Math.min(2.2,.45*width);
  mushroom(p.x,p.z,s,theme.caps[(rel|0)%theme.caps.length],Math.max(0,p.y-.2),theme.glow?.9:0);addObstacle(p.x,p.z,.55*s);}}
// ---------- Tunnel: Gewoelbe ueber der Strecke, Portale, Lichter. Innen wird es dunkel.
const TUNNEL_R=13.4,TUNNEL_TH=.8;
const TUNNEL_STYLE={
 wood:{wall:0x6b4426,spot:0x4a2c17,rim:0x7d5a32,lamp:0xffcf7a,glow:.9,rings:0,label:'PILZSTAMM',shaft:0xfff0c2},
 rock:{wall:0xb06a3c,spot:0x8a4f2a,rim:0x9c5c32,lamp:0xffd08a,glow:.8,rings:0,label:'FELSTUNNEL',shaft:0xffe2a6},
 neon:{wall:0x171540,spot:0x241f5c,rim:0x2de2e6,lamp:0xff3cac,glow:2.0,rings:1,label:'NEONROEHRE',shaft:0x8ff4ff},
 crypt:{wall:0x2b2440,spot:0x1b1630,rim:0x6f5cc0,lamp:0x8affc8,glow:1.4,rings:1,label:'GRUFT',shaft:0xbfe6ff},
 // R61: Keks-Stollen durch den Schokoberg (Kakao-Waende, rosa Zuckerguss-Ringe)
 choco:{wall:0x3a2014,spot:0x4a2a18,rim:0xff6fae,lamp:0xffd9a0,glow:1.2,rings:1,label:'SCHOKO-STOLLEN',shaft:0xffe6c8},
 lava:{wall:0x2a1a18,spot:0x3f2420,rim:0xff5a1f,lamp:0xffb347,glow:1.8,rings:1,label:'MAGMASCHACHT',shaft:0xffa24a},
 // R44: befahrbare Roehre (gruen, goldene Baender)
 pipe:{wall:0x1b7a36,spot:0x22903f,rim:0x33c95a,lamp:0xffd84a,glow:1.1,rings:1,label:'ROEHRE',shaft:0xfff4c8},
 // R44: Mauerdurchbruch in den Burgturm (Basalt, Fackelschein)
 breach:{wall:0x2c2022,spot:0x3e2c2c,rim:0x5a403c,lamp:0xff7a1a,glow:1.3,rings:0,label:'TURM'},
 // R60: Eishoehle (blaues Gletschereis, Eiszapfen) und Kirchenschiff des Riesendoms (Sandstein, Buntglasfenster, Kerzenlicht)
 ice:{wall:0x8ccbf0,spot:0xcfeeff,rim:0x6ab8e8,lamp:0xbff0ff,glow:1.2,rings:0,label:'EISHÖHLE',shaft:0xe4f8ff},
 nave:{wall:0xcdbd9a,spot:0xb8a888,rim:0xa8987a,lamp:0xffc870,glow:1,rings:0,label:'DOM',shaft:0xffd890}};
function inTunnel(d){const dl=lapDist(d);return tunnels.some(t=>lapDist(dl-t.s)<=lapDist(t.e-t.s));}
function archRing(d,r0,r1,lift0=0,lift1=0,seg=14){const v=new Float32Array((seg+1)*6),uv=new Float32Array((seg+1)*4),idx=[];
 for(let k=0;k<=seg;k++){const a=Math.PI*k/seg,c=-Math.cos(a),s=Math.sin(a);
  const p0=samplePos(d,c*r0,_sp);v.set([p0.x,p0.y+s*r0*TUNNEL_TH+lift0,p0.z],k*6);
  const p1=samplePos(d,c*r1,_sp);v.set([p1.x,p1.y+s*r1*TUNNEL_TH+lift1,p1.z],k*6+3);
  uv.set([k/seg*2,0,k/seg*2,1],k*4);
  if(k<seg){const b=k*2;idx.push(b,b+2,b+1,b+1,b+2,b+3);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(v,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
// R45: Tunnel-Ueberarbeitung. Wandmuster je Stil (Maserung, Mauerwerk, Neonraster, Nieten), ein Erdhuegel ueber dem
// Gewoelbe statt Felsbrocken, die innen durch die Wand stachen, Portale aus Blender (assets/tunnelkit.glb), Rippen
// und leuchtende Laternen innen. In laengeren Tunneln Licht-Durchbrueche in der Decke: Lichtkegel mit Staub und ein
// Lichtfleck auf der Fahrbahn. Der Huegel wirft Schatten, drinnen ist es also wirklich dunkel und durch die Oeffnungen
// faellt Sonne; im Leicht-Modus (ohne Schatten) dunkelt ein Streifen die Fahrbahn ab.
const TUNNEL_TEX=new Map();
function tunnelTex(style,st){let t=TUNNEL_TEX.get(style);if(t)return t;const S=256,w=new T.Color(st.wall),sp=hex(st.spot),rim=hex(st.rim),lamp=hex(st.lamp),rnd=rng(style.length*97+13);
 const shade=(c,k)=>hex(new T.Color(c).multiplyScalar(k));
 t=canvasTex(S,S,(q)=>{q.fillStyle=hex(w);q.fillRect(0,0,S,S);
  if(style==='wood'){for(let x=0;x<S;x+=5){q.globalAlpha=.2+rnd()*.35;q.strokeStyle=rnd()<.5?sp:shade(st.wall,.55);q.lineWidth=1+rnd()*2.4;q.beginPath();let xx=x;q.moveTo(xx,0);for(let y=16;y<=S;y+=16){xx+=(rnd()-.5)*3;q.lineTo(xx,y);}q.stroke();}
   for(let k=0;k<5;k++){const x=rnd()*S,y=rnd()*S;q.globalAlpha=.55;q.fillStyle=shade(st.wall,.45);q.beginPath();q.ellipse(x,y,4+rnd()*5,9+rnd()*8,0,0,TAU);q.fill();q.globalAlpha=.35;q.strokeStyle=sp;q.lineWidth=2;q.beginPath();q.ellipse(x,y,10,17,0,0,TAU);q.stroke();}}
  else if(style==='neon'){q.globalAlpha=1;q.fillStyle=shade(st.wall,.8);q.fillRect(0,0,S,S);for(let k=0;k<=S;k+=32){q.shadowColor=rim;q.shadowBlur=8;q.globalAlpha=.55;q.strokeStyle=k%64?rim:lamp;q.lineWidth=2;q.beginPath();q.moveTo(k,0);q.lineTo(k,S);q.moveTo(0,k);q.lineTo(S,k);q.stroke();}q.shadowBlur=0;}
  else if(style==='ice'){const g=q.createLinearGradient(0,0,0,S);g.addColorStop(0,'#e8f8ff');g.addColorStop(.5,hex(st.wall));g.addColorStop(1,'#5aa0d8');q.fillStyle=g;q.fillRect(0,0,S,S);
   q.strokeStyle='rgba(255,255,255,.7)';q.lineWidth=1.5;for(let k=0;k<22;k++){let x=rnd()*S,y=rnd()*S;q.beginPath();q.moveTo(x,y);for(let m=0;m<5;m++){x+=(rnd()-.5)*36;y+=(rnd()-.5)*36;q.lineTo(x,y);}q.stroke();}
   q.fillStyle='rgba(255,255,255,.55)';for(let k=0;k<26;k++){const x=rnd()*S,w=3+rnd()*6,l=10+rnd()*34;q.beginPath();q.moveTo(x-w,0);q.lineTo(x+w,0);q.lineTo(x,l);q.closePath();q.fill();}}
  else if(style==='pipe'){const g=q.createLinearGradient(0,0,S,0);g.addColorStop(0,shade(st.wall,.7));g.addColorStop(.5,shade(st.wall,1.25));g.addColorStop(1,shade(st.wall,.7));q.fillStyle=g;q.fillRect(0,0,S,S);
   q.globalAlpha=.6;q.fillStyle=shade(st.wall,.5);q.fillRect(0,S/2-5,S,10);q.globalAlpha=.9;q.fillStyle='#ffd84a';for(let x=8;x<S;x+=21){q.beginPath();q.arc(x,S/2,3.2,0,TAU);q.fill();}}
  else{ // Mauerwerk: versetzte Steine mit dunklen Fugen (Fels, Gruft, Lava, Mauerdurchbruch)
   q.fillStyle=shade(st.wall,.42);q.fillRect(0,0,S,S);const rows=8,h=S/rows;
   for(let r=0;r<rows;r++){let x=-(r%2)*h*.9;while(x<S){const wd=h*(1.1+rnd()*1.4);q.globalAlpha=1;q.fillStyle=rnd()<.45?sp:shade(st.wall,.85+rnd()*.3);q.fillRect(x+2,r*h+2,wd-4,h-4);
     q.globalAlpha=.16;q.fillStyle='#fff';q.fillRect(x+3,r*h+3,wd-6,3);q.globalAlpha=.2;q.fillStyle='#000';q.fillRect(x+3,r*h+h-6,wd-6,3);x+=wd;}}
   if(style==='lava'||style==='breach'){q.globalAlpha=.85;q.strokeStyle=lamp;q.shadowColor=lamp;q.shadowBlur=6;q.lineWidth=2;for(let k=0;k<6;k++){let x=rnd()*S,y=rnd()*S;q.beginPath();q.moveTo(x,y);for(let m=0;m<6;m++){x+=(rnd()-.5)*30;y+=rnd()*22;q.lineTo(x,y);}q.stroke();}q.shadowBlur=0;}
   if(style==='crypt'){q.globalAlpha=.35;q.fillStyle='#3f6a44';for(let k=0;k<40;k++)q.fillRect(rnd()*S,rnd()*S*.3,3+rnd()*6,2+rnd()*4);}
   if(style==='nave'){q.globalAlpha=1;const cols=['#e8b84a','#3a6ad8','#c83a4a','#4ab87a','#8a5ad8'];for(const x0 of [S*.25,S*.75]){q.fillStyle='#2a1a1a';q.beginPath();q.moveTo(x0-22,S*.9);q.lineTo(x0-22,S*.35);q.quadraticCurveTo(x0-22,S*.12,x0,S*.06);q.quadraticCurveTo(x0+22,S*.12,x0+22,S*.35);q.lineTo(x0+22,S*.9);q.fill();
     for(let y=S*.12;y<S*.88;y+=9)for(let x=x0-18;x<x0+18;x+=9){if(y<S*.3&&Math.abs(x+4.5-x0)>(y-S*.06)*.9)continue;q.fillStyle=cols[Math.floor(rnd()*cols.length)];q.fillRect(x+1,y+1,7,7);}}}}
  q.globalAlpha=1;for(let k=0;k<900;k++){q.globalAlpha=.06+rnd()*.12;q.fillStyle=rnd()<.5?'#000':'#fff';q.fillRect(rnd()*S,rnd()*S,2,2);}q.globalAlpha=1;},true);
 TUNNEL_TEX.set(style,t);return t;}
let _glowTex=null,_sunPadTex=null;
// R49: Lichtfleck = Sonnen-Turbo - weicher Lichtkreis mit feinen Strahlen und drei Pfeilen in Fahrtrichtung
const sunPadTex=()=>_sunPadTex||(_sunPadTex=canvasTex(128,128,(q,w,h)=>{const g=q.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#fff');g.addColorStop(.35,'#ffffffb0');g.addColorStop(1,'#fff0');q.fillStyle=g;q.fillRect(0,0,w,h);
 q.globalAlpha=.35;q.strokeStyle='#fff';q.lineWidth=3;for(let k=0;k<16;k++){const a=k*Math.PI/8;q.beginPath();q.moveTo(64+Math.cos(a)*18,64+Math.sin(a)*18);q.lineTo(64+Math.cos(a)*56,64+Math.sin(a)*56);q.stroke();}
 q.globalAlpha=1;q.lineWidth=11;q.lineCap='round';q.lineJoin='round';for(const y of [40,63,86]){q.beginPath();q.moveTo(40,y-11);q.lineTo(64,y+9);q.lineTo(88,y-11);q.stroke();}q.globalAlpha=1;}));
const glowTex=()=>_glowTex||(_glowTex=canvasTex(64,64,(q,w,h)=>{const g=q.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#fff');g.addColorStop(.25,'#ffffffb0');g.addColorStop(1,'#fff0');q.fillStyle=g;q.fillRect(0,0,w,h);}));
// Lichtkegel: nach unten ausblendend, zu den Raendern weich, nah an der Kamera durchsichtig (kein Blenden beim Durchfahren)
function shaftMat(col){return new T.ShaderMaterial({uniforms:{uTime:shaderTime,uCol:{value:new T.Color(col)},uI:{value:LITE?.42:.55}},transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,
 vertexShader:'attribute float aH;varying float vH;varying vec3 vN;varying vec3 vV;varying float vD;void main(){vH=aH;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);vD=-mv.z;gl_Position=projectionMatrix*mv;}',
 fragmentShader:'uniform float uTime;uniform vec3 uCol;uniform float uI;varying float vH;varying vec3 vN;varying vec3 vV;varying float vD;void main(){float e=pow(abs(dot(vN,vV)),1.7);float g=mix(.18,1.,vH*vH);float f=.86+.14*sin(uTime*1.3+vH*5.);gl_FragColor=vec4(uCol*e*g*f*uI*smoothstep(1.5,9.,vD),1.);}'});}
function dustMat(col){return new T.ShaderMaterial({uniforms:{uTime:shaderTime,uCol:{value:new T.Color(col)}},transparent:true,depthWrite:false,blending:T.AdditiveBlending,
 vertexShader:'attribute float aSeed;uniform float uTime;varying float vA;void main(){vec3 p=position;float t=uTime*.18+aSeed;p.y+=sin(t*2.1)*1.3;p.x+=sin(t*1.3+aSeed*4.)*.6;p.z+=cos(t*1.7+aSeed*2.)*.6;vec4 mv=modelViewMatrix*vec4(p,1.);vA=.55+.45*sin(uTime*2.+aSeed*9.);gl_PointSize=clamp(90./-mv.z,1.,9.);gl_Position=projectionMatrix*mv;}',
 fragmentShader:'uniform vec3 uCol;varying float vA;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(uCol*(1.-d*2.)*vA*.9,1.);}'});}
function buildTunnels(){if(!tunnels.length)return;
 const sunV=new T.Vector3(...(theme.sunPos||[60,90,40])).normalize(),_a=new T.Vector3(),_b=new T.Vector3();
 for(const t of tunnels){const st=TUNNEL_STYLE[t.style]||TUNNEL_STYLE.rock,span=lapDist(t.e-t.s),steps=Math.max(8,Math.ceil(span/2.6)),SEG=14,R=TUNNEL_R,RO=R+2.8,stepL=span/steps;
  // Licht-Durchbrueche: je ~22 m eine Oeffnung (2 Schritte lang, die obersten 2 Segmente breit), nicht an den Enden
  // in Roll- und Wandzonen dreht sich die Roehre mit - dort gibt es kein Oben, also keine Oeffnungen
  let rolled=false;if(agrav.length)for(let d=t.s;d<=t.s+span;d+=6)if(Math.abs(rollAt(d))>.05){rolled=true;break;}
  const holes=[];if(st.shaft&&span>34&&!rolled)for(let dd=11;dd<span-11;dd+=22){const i0=Math.round(dd/stepL);if(i0>1&&i0+2<steps-1)holes.push(i0);}
  const inHole=(i,k)=>(k===SEG/2-1||k===SEG/2)&&holes.some(h=>i>=h&&i<h+2);
  // Gewoelbe innen und Erdhuegel aussen (gleiches Raster, damit die Oeffnungen fluchten)
  const shellGeo=(rad,jit)=>{const n=(steps+1)*(SEG+1),v=new Float32Array(n*3),uv=new Float32Array(n*2),idx=[];
   for(let i=0;i<=steps;i++){const d=t.s+stepL*i;for(let k=0;k<=SEG;k++){const a=Math.PI*k/SEG,bump=jit?Math.sin(i*1.7+k*2.3)*.55+Math.sin(i*.61-k*1.1)*.45:0,rr=rad+bump*(k>0&&k<SEG?1:0),
     p=posAt(d,-Math.cos(a)*rr,Math.sin(a)*rr*TUNNEL_TH,_sp),o=i*(SEG+1)+k;v[o*3]=p.x;v[o*3+1]=p.y;v[o*3+2]=p.z;uv[o*2]=k/SEG*(jit?4:2.5);uv[o*2+1]=stepL*i/(jit?6:11);
     if(i<steps&&k<SEG&&!inHole(i,k))idx.push(o,o+1,o+SEG+1,o+1,o+SEG+2,o+SEG+1);}}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(v,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;};
  const wallTex=tunnelTex(t.style,st).clone();wallTex.needsUpdate=true;wallTex.repeat.set(1,1);
  const wallMat=stdMat({map:wallTex,roughness:.92,side:T.DoubleSide,emissive:st.wall,emissiveIntensity:LITE?.4:.14});
  const shell=new T.Mesh(shellGeo(R,false),wallMat);shell.receiveShadow=true;world.add(shell);
  const groundCol=t.style==='pipe'?st.wall:t.style==='breach'?st.wall:(theme.grass??0x3fae3a),moundMat=stdMat({map:speckleTexture(hex(groundCol),hex(new T.Color(groundCol).multiplyScalar(.72)),1800),roughness:1,side:T.DoubleSide});
  const mound=new T.Mesh(shellGeo(RO,t.style!=='pipe'),moundMat);mound.castShadow=!LITE;mound.receiveShadow=true;if(t.style!=='nave')world.add(mound);
  // Schachtwaende zwischen innen und aussen, Lichtkegel, Staub und Lichtfleck je Oeffnung
  if(holes.length){const walls=[],cones=[],pools=[],dust=[],seeds=[];
   const P3=(i,k,rad)=>posAt(t.s+stepL*i,-Math.cos(Math.PI*k/SEG)*rad,Math.sin(Math.PI*k/SEG)*rad*TUNNEL_TH,new T.Vector3());
   for(const h of holes){const k0=SEG/2-1,loop=[[h,k0],[h+1,k0],[h+2,k0],[h+2,k0+1],[h+2,k0+2],[h+1,k0+2],[h,k0+2],[h,k0+1]],wv=[];
    for(let m=0;m<loop.length;m++){const [i1,k1]=loop[m],[i2,k2]=loop[(m+1)%loop.length],a=P3(i1,k1,R),b=P3(i2,k2,R),c=P3(i2,k2,RO),e=P3(i1,k1,RO);wv.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z,a.x,a.y,a.z,c.x,c.y,c.z,e.x,e.y,e.z);}
    const wg=new T.BufferGeometry();wg.setAttribute('position',new T.Float32BufferAttribute(wv,3));wg.computeVertexNormals();walls.push(wg);
    // Kegel: oben die Oeffnung, unten zur Sonne hin versetzt auf der Fahrbahn
    const dm=t.s+stepL*(h+1),sm=sample(dm),top=posAt(dm,0,R*TUNNEL_TH-.4,new T.Vector3()),road=samplePos(dm,0,new T.Vector3());
    const hgt=top.y-road.y,sh=Math.min(5,hgt*Math.hypot(sunV.x,sunV.z)/Math.max(.35,sunV.y)),sl=Math.hypot(sunV.x,sunV.z)||1,bot=new T.Vector3(road.x-sunV.x/sl*sh,road.y+.05,road.z-sunV.z/sl*sh);
    const tx=Math.sin(sm.angle),tz=Math.cos(sm.angle),lx=Math.cos(sm.angle),lz=-Math.sin(sm.angle),N=14,cv=[],ch=[],ci=[];
    for(let r=0;r<2;r++){const c=r?top:bot,rl=r?2.55:3.4,rt=r?2.35:3.0;for(let m=0;m<=N;m++){const th=m/N*TAU;cv.push(c.x+lx*Math.cos(th)*rl+tx*Math.sin(th)*rt,c.y,c.z+lz*Math.cos(th)*rl+tz*Math.sin(th)*rt);ch.push(r);}}
    for(let m=0;m<N;m++)ci.push(m,m+1,m+N+1,m+1,m+N+2,m+N+1);
    const cg=new T.BufferGeometry();cg.setAttribute('position',new T.Float32BufferAttribute(cv,3));cg.setAttribute('aH',new T.Float32BufferAttribute(ch,1));cg.setIndex(ci);cg.computeVertexNormals();cones.push(cg);
    // Lichtfleck als kleines Gitter auf der Fahrbahn (folgt Neigung und Kurve; v laeuft gegen die Fahrtrichtung, die Pfeile zeigen nach vorn)
    const pd=dm+(bot.x-road.x)*tx+(bot.z-road.z)*tz,po=clamp((bot.x-road.x)*lx+(bot.z-road.z)*lz,-5.5,5.5),gv=[],gu=[],gi=[],N4=4;
    for(let i=0;i<=N4;i++)for(let j=0;j<=N4;j++){const q=posAt(pd-3.4+6.8*i/N4,po-3.8+7.6*j/N4,.07,_b);gv.push(q.x,q.y,q.z);gu.push(j/N4,1-i/N4);if(i<N4&&j<N4){const a=i*(N4+1)+j;gi.push(a,a+1,a+N4+1,a+1,a+N4+2,a+N4+1);}}
    const pg=new T.BufferGeometry();pg.setAttribute('position',new T.Float32BufferAttribute(gv,3));pg.setAttribute('uv',new T.Float32BufferAttribute(gu,2));pg.setIndex(gi);pools.push(pg);
    sunPads.push({d:lapDist(pd),off:po});
    for(let m=0;m<12;m++){const f=Math.random();dust.push(bot.x+(top.x-bot.x)*f+(Math.random()-.5)*3,bot.y+(top.y-bot.y)*f,bot.z+(top.z-bot.z)*f+(Math.random()-.5)*3);seeds.push(Math.random()*20);}}
   const wm=new T.Mesh(mergeGeometries(walls),wallMat);wm.castShadow=!LITE;world.add(wm);
   const cm=new T.Mesh(mergeGeometries(cones),shaftMat(st.shaft));cm.frustumCulled=false;cm.renderOrder=3;world.add(cm);
   const pm=new T.Mesh(mergeGeometries(pools),new T.MeshBasicMaterial({map:sunPadTex(),color:new T.Color(st.shaft).lerp(new T.Color(0xffffff),.35),transparent:true,opacity:LITE?.85:.8,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2}));pm.renderOrder=2;pm.frustumCulled=false;world.add(pm);
   const dg=new T.BufferGeometry();dg.setAttribute('position',new T.Float32BufferAttribute(dust,3));dg.setAttribute('aSeed',new T.Float32BufferAttribute(seeds,1));const dp=new T.Points(dg,dustMat(st.shaft));dp.frustumCulled=false;world.add(dp);}
  // Leicht-Modus: Fahrbahn im Tunnel abdunkeln (dort gibt es keine Schatten)
  if(LITE){const sv=[],si=[],n=steps;for(let i=0;i<=n;i++){const d=t.s+stepL*i;for(const off of [-R+.6,R-.6]){const q=samplePos(d,off,_sp);sv.push(q.x,q.y+.04,q.z);}if(i<n){const b=i*2;si.push(b,b+2,b+1,b+1,b+2,b+3);}}
   const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(sv,3));sg.setIndex(si);const sm2=new T.Mesh(sg,new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.42,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1}));sm2.renderOrder=1;world.add(sm2);}
  // Portale: Blender-Modell je Stil (sonst der alte flache Bogen)
  const kit=P.tunnelkit?.getObjectByName('TK_'+t.style);
  for(const [d,dir] of [[t.s,-1],[t.e,1]]){const s0=sample(d,0);
   if(kit){const g=liteRoot(mergeByMaterial(kit.clone(true)));g.traverse(o=>{if(o.isMesh){o.castShadow=!LITE;o.receiveShadow=true;}});const q=samplePos(d+dir*.4,0,_a);g.position.copy(q);g.rotation.y=s0.angle+(dir<0?Math.PI:0);world.add(g);}
   else{const portalMat=mat(st.rim,{roughness:.85,...(theme.glow?{emissive:st.rim,emissiveIntensity:.5}:{})});const pm=new T.Mesh(archRing(d+dir*.6,R,RO+.4),portalMat);pm.castShadow=true;pm.material.side=T.DoubleSide;world.add(pm);}
   if(st.rings){const sign=mesh(new T.PlaneGeometry(9,1.5),label(st.label,hex(st.lamp),'#14101c',512,96),world,s0.p.x,s0.p.y+(kit?(R+3.4)*TUNNEL_TH+1.3:R*TUNNEL_TH+1.9),s0.p.z);
    sign.rotation.y=s0.angle+(dir<0?Math.PI:0);sign.material.side=T.DoubleSide;sign.castShadow=false;}}
  // Laternen mit Lichthof und Rippen
  const lampMat=new T.MeshBasicMaterial({color:st.lamp});
  const lamps=[];for(let d=t.s+5;d<t.s+span-2;d+=9)for(const side of [-1,1]){const p=samplePos(d,side*11.6,new T.Vector3());lamps.push([p.x,p.y+5.4,p.z]);}
  if(lamps.length){const li=new T.InstancedMesh(new T.SphereGeometry(.42,8,6),lampMat,lamps.length);lamps.forEach(([x,y,z],i)=>{_m.makeTranslation(x,y,z);li.setMatrixAt(i,_m);});li.frustumCulled=false;world.add(li);
   const gg=new T.BufferGeometry();gg.setAttribute('position',new T.Float32BufferAttribute(lamps.flat(),3));const gp=new T.Points(gg,new T.PointsMaterial({map:glowTex(),color:st.lamp,size:6,sizeAttenuation:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));gp.frustumCulled=false;world.add(gp);}
  // R48: im Neon-Tunnel (Rollzone, ohne Deckenoeffnungen) blinken dichtere Leuchtrippen im Takt der Musik
  const beatRibs=rolled&&t.style==='neon',glowRib=st.rings,ribMat=beatRibs?new T.ShaderMaterial({uniforms:{uCol:{value:new T.Color(st.rim)},uCol2:{value:new T.Color(st.lamp)},uBeat:beatPulse},side:T.DoubleSide,
    vertexShader:'varying float vX;void main(){vX=position.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform vec3 uCol;uniform vec3 uCol2;uniform float uBeat;void main(){float p=uBeat*uBeat*uBeat;gl_FragColor=vec4(mix(uCol*.55,uCol2*1.3,p),1.);}'})
   :glowRib?new T.MeshBasicMaterial({color:st.rim,side:T.DoubleSide}):stdMat({color:new T.Color(st.rim).multiplyScalar(.8),roughness:.9,side:T.DoubleSide}),bands=[];
  for(let d=t.s+4;d<t.s+span-2;d+=beatRibs?5:8){if(holes.some(h=>{const hc=t.s+stepL*(h+1);return Math.abs(hc-d)<4;}))continue;bands.push(archRing(d,R-.6,R-.1));bands.push(archRing(d+.9,R-.6,R-.1));}
  if(bands.length){const bm=new T.Mesh(mergeGeometries(bands),ribMat);bm.frustumCulled=false;world.add(bm);}
  if(!st.rings){const stripMat=new T.MeshBasicMaterial({color:st.lamp,side:T.DoubleSide});
   for(const side of [-1,1])world.add(new T.Mesh(wallStrip(t.s+1.5,t.e-1.5,side*12.9,5.0,5.45,Math.ceil(span/3)),stripMat));}
  // ein paar Felsen oben auf dem Huegel (nicht mehr in der Tunnelwand)
  if(P.rock&&t.style!=='pipe'&&t.style!=='nave'){const rl=[];let sd=1;for(let d=t.s+6;d<t.s+span-6;d+=12,sd=-sd){const a=.3+((d*13)%10)/45,pp=posAt(d,sd*Math.cos(a)*(RO+1.7),Math.sin(a)*(RO+1.7)*TUNNEL_TH,new T.Vector3());
    rl.push({x:pp.x,y:pp.y-.9,z:pp.z,s:1.1+((d*7)%10)/18,ry:d});}
   if(rl.length)scatterInstanced(P.rock,rl,{StonePaint:new T.Color(groundCol).multiplyScalar(.8).getHex()},0);}
  zones.push({d:lapDist(t.s+span/2),half:span/2+4,x:0,z:0,r:0});}}
// ---------- Magnet-Achterbahn (R38): Kastentraeger unter der Bahn, zwei leuchtende Magnetschienen,
// Fachwerkstuetzen (Blender-Segment, gestapelt statt gestreckt) unter den Huegeln und
// Hufeisen-Magnetboegen ueber der Katapultstrecke. Alles haengt an posAt, folgt also exakt der
// gezeichneten Fahrbahn. Die Pol-Leuchten aller Boegen sind EINE Instanz-Gruppe (Farbe je Bogen).
let coasterGlow=null;
function buildCoasters(){coasterGlow=null;if(!coasters.length)return;
 const glow=theme.glow,col=theme.coasterCol??(glow?0x3b2a7a:0xd8433a),mag=theme.magGlow??(glow?0x7cf3ff:0x4fd8ff);
 const steel=mat(col,{roughness:.42,metalness:.45,side:T.DoubleSide}),under=mat(glow?0x1b1830:0x353a46,{roughness:.6,metalness:.5,side:T.DoubleSide});
 const railMat=new T.MeshBasicMaterial({color:mag}),_d=new T.Vector3(),_mid=new T.Vector3(),_qq=new T.Quaternion(),_mm=new T.Matrix4(),_ux=new T.Vector3(1,0,0),_sc=new T.Vector3();
 const bar=(list,p0,p1,w,h=w)=>{const len=p0.distanceTo(p1);if(len<.05)return;_d.subVectors(p1,p0).divideScalar(len);_mid.addVectors(p0,p1).multiplyScalar(.5);
  _qq.setFromUnitVectors(_ux,_d);_mm.compose(_mid,_qq,_sc.set(len,h,w));list.push(new T.BoxGeometry(1,1,1).applyMatrix4(_mm));};
 const steelParts=[],railParts=[],trussList=[],footList=[],archList=[];
 for(const c of coasters){const d0=c.s-4,d1=c.s+c.span+4,steps=Math.ceil((d1-d0)/1.2);
  // Unterseite des Kastentraegers und zwei Seitenwangen (bis knapp ueber die Fahrbahn)
  // Im All bleibt die Glasbahn durchsichtig (Sterne unter der Fahrbahn, R28) - dort keine Unterseite
  if(!theme.space)addStrip(strip(d0,d1,0,17.6,-1.25,6,steps),under);
  {const v=[],idx=[],_a=new T.Vector3(),_b=new T.Vector3();
   for(const side of [-1,1]){const base=v.length/3;
    for(let i=0;i<=steps;i++){const d=d0+(d1-d0)*i/steps;posAt(d,side*8.8,-1.25,_a);posAt(d,side*8.8,.12,_b);v.push(_a.x,_a.y,_a.z,_b.x,_b.y,_b.z);
     if(i<steps){const o=base+i*2;idx.push(o,o+2,o+1,o+1,o+2,o+3);}}}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();
   const m=new T.Mesh(g,steel);m.castShadow=true;m.frustumCulled=false;world.add(m);}
  // Magnetschienen unter dem Traeger (leuchtend) und Querschwellen
  let pv=null;for(let d=d0;d<=d1+.01;d+=2.4){const cu=[posAt(d,-4.6,-1.55,new T.Vector3()),posAt(d,4.6,-1.55,new T.Vector3())];
   if(pv){bar(railParts,pv[0],cu[0],.42);bar(railParts,pv[1],cu[1],.42);}
   if(Math.round((d-d0)/2.4)%2===0)bar(steelParts,posAt(d,-8.6,-1.4,new T.Vector3()),posAt(d,8.6,-1.4,new T.Vector3()),.34,.5);
   pv=cu;}
  // Fachwerkstuetzen: Segment 4 m hoch, gestapelt; oben ein Quertraeger. Im All gibt es keinen Boden.
  // Stuetzen dort, wo die Unterseite wirklich hoch liegt (Huegel ODER Aussenkante einer Steilkurve);
  // in Twists nicht - dort dreht sich die Bahn um ihre Achse, eine Stuetze stuende quer im Bild.
  if(!theme.space)for(let d=c.s+3;d<c.s+c.span-3;d+=7.5){if(Math.cos(twistAt(c.spec,lapDist(d-c.s),_tw).ph)<.97)continue;
   const tops=[-6.2,6.2].map(o=>posAt(d,o,-1.3,new T.Vector3())),hs=tops.map((t,k)=>t.y-roadRef(d,k?6.2:-6.2));
   if(Math.max(hs[0],hs[1])<2.4)continue;if(Math.min(hs[0],hs[1])>2.4)bar(steelParts,tops[0],tops[1],.55,.7);
   const ry=sample(d,0).angle;
   for(let k=0;k<2;k++){const off=k?6.2:-6.2,y0=roadRef(d,off)-.05,top=tops[k],h=top.y-y0;if(h<2.4)continue;
    footList.push({x:top.x,y:y0,z:top.z,s:1,ry});
    for(let y=0;y<h-.05;y+=4){const seg=Math.min(4,h-y);trussList.push({x:top.x,y:y0+y,z:top.z,s:1,sy:seg/4,ry});}}}
  // Magnetboegen ueber der Katapultstrecke (Fuesse ausserhalb der Leitplanken)
  c.arches=c.archX.map((x,i)=>{const d=lapDist(c.s+x),sp=sample(d,0);
   for(const side of [-1,1]){const q=sample(d,side*12.4).p;addObstacle(q.x,q.z,1.3);}
   archList.push({x:sp.p.x,y:sp.p.y,z:sp.p.z,s:1,ry:sp.angle,c,i});return d;});
  // Katapult-Band: die Turbo-Textur laeuft ueber die ganze Abschussstrecke
  if(c.archX.length){const a=c.s+c.spec.launch[0]-6,b=c.s+c.spec.launch[1]+12,m=addStrip(strip(a,b,0,11,.1,4.6,Math.ceil((b-a)/1.5)),new T.MeshBasicMaterial({map:boostTex,transparent:true,opacity:.92}),false);m.castShadow=false;}
  // Schild am ersten Bogen (vorn und hinten lesbar)
  if(c.archX.length){const d=lapDist(c.s+c.archX[0]),sp=sample(d,0);for(const back of [0,1]){const sg=mesh(new T.PlaneGeometry(11,1.7),label('MAGNET-KATAPULT',glow?'#1a1030':'#d8433a','#fff5d9',512,80),world,sp.p.x,sp.p.y+13.6,sp.p.z);
   sg.rotation.y=sp.angle+(back?0:Math.PI);const f=back?.9:-.9;sg.position.x+=Math.sin(sp.angle)*f;sg.position.z+=Math.cos(sp.angle)*f;sg.castShadow=false;sg.material.side=T.FrontSide;}}}
 if(steelParts.length){const m=new T.Mesh(mergeGeometries(steelParts),steel);m.castShadow=true;m.receiveShadow=true;world.add(m);}
 if(railParts.length){const m=new T.Mesh(mergeGeometries(railParts),railMat);m.castShadow=false;world.add(m);}
 // Stuetzen: Blender-Fachwerk, sonst schlichte Kastenstuetze
 const truss=P.coastertruss;
 if(truss){const foot=[],seg=[];truss.traverse(o=>{if(o.isMesh&&!Array.isArray(o.material))(o.material.name==='TrussPaint'?seg:foot).push(o);});
  const inst=(meshes,list)=>{for(const src of meshes){if(!list.length||Array.isArray(src.material))continue;let m=src.material;if(m.name==='TrussPaint'&&theme.trussCol){m=m.clone();m.color=new T.Color(theme.trussCol);}
   const im=new T.InstancedMesh(src.geometry,m,list.length);list.forEach((t,i)=>{_e.set(0,t.ry,0);_q.setFromEuler(_e);_m.compose(_v.set(t.x,t.y,t.z),_q,_s.set(1,t.sy||1,1));im.setMatrixAt(i,_m);});
   im.castShadow=true;im.receiveShadow=true;world.add(im);}};
  inst(seg,trussList);inst(foot,footList);}
 else if(trussList.length){const g=[];for(const t of trussList)g.push(new T.BoxGeometry(.9,4*(t.sy||1),.9).translate(t.x,t.y+2*(t.sy||1),t.z));const m=new T.Mesh(mergeGeometries(g),steel);m.castShadow=true;world.add(m);}
 // Boegen: jedes Material eine Instanz-Gruppe; die Pol-Leuchte (MagnetGlow) bekommt Farbe je Bogen
 const arch=P.magnetarch;
 if(arch&&archList.length){arch.traverse(src=>{if(!src.isMesh||Array.isArray(src.material))return;let m=src.material;const isGlow=m.name==='MagnetGlow';
   if(isGlow){m=m.clone();m.color=new T.Color(0xffffff);m.emissive=new T.Color(0xffffff);m.emissiveIntensity=1.6;m.onBeforeCompile=tintEmissive;m.customProgramCacheKey=()=>'tintEmissive';}
   else if(m.name==='MagnetPaint'&&theme.magnetCol){m=m.clone();m.color=new T.Color(theme.magnetCol);}
   const im=new T.InstancedMesh(src.geometry,m,archList.length);archList.forEach((t,i)=>{_e.set(0,t.ry,0);_q.setFromEuler(_e);_m.compose(_v.set(t.x,t.y,t.z),_q,_s.set(1,1,1));im.setMatrixAt(i,_m);if(isGlow)im.setColorAt(i,_col.setHex(mag));});
   im.castShadow=!isGlow;im.receiveShadow=true;world.add(im);if(isGlow)coasterGlow={mesh:im,list:archList,col:new T.Color(mag)};});}
 for(const c of coasters)if(c.spec.kind==='dragon')buildDragon(c);
 else for(const t of archList){const g=new T.Group();g.position.set(t.x,t.y,t.z);g.rotation.y=t.ry;world.add(g);
  const body=new T.Mesh(new T.TorusGeometry(12.4,.9,10,28,Math.PI),mat(0xd8433a,{roughness:.5}));body.position.y=.4;g.add(body);
  for(const sx of [-1,1])box(g,mat(0xdfe6ee,{metalness:.6,roughness:.3}),sx*12.4,1.2,0,2.1,2.4,2.1);}}
// ---------- Fliegenpilz-Drache (R39, Blender): der Leib kommt vor dem Korkenzieher aus dem Boden,
// liegt waehrend der Doppelrolle genau auf der Drehachse (die Bahn wickelt sich um ihn herum) und
// hebt am Ausgang den Kopf - der schaut den Karts entgegen und speit Feuer, wenn der Spieler kommt.
// Leib = Instanzen des Koerperglieds entlang einer Kurve (eine Instanz-Gruppe je Material).
function dragonPart(root,prefix){let hit=null;root.traverse(o=>{if(!hit&&o.name&&o.name.startsWith(prefix))hit=o;});return hit;}
function buildDragon(c){const src=P.dragon;dragon=null;if(!src)return;
 const r=c.spec.rolls.find(q=>q.axis>0);if(!r)return;
 const A=r.axis,d0=c.s+r.c-r.w,d1=c.s+r.c+r.w;
 // Achse: Bahnmitte ohne Rolle, auf Achterbahnhoehe plus Achsabstand
 const axisPt=(d,lat=0,dy=0)=>{const [i,j,k]=tIdx(d),tx=TP.tx[i],tz=TP.tz[i];return new T.Vector3(TP.x[i]+(TP.x[j]-TP.x[i])*k+tz*lat,TP.h[i]+(TP.h[j]-TP.h[i])*k+(agrav.length?liftAt(d):0)+coasterH(d)+A+dy,TP.z[i]+(TP.z[j]-TP.z[i])*k-tx*lat);};
 const pts=[];{const g=axisPt(d0-48,-21,0);g.y=groundAt(d0-48,0).y-2.4;pts.push(g);}
 pts.push(axisPt(d0-32,-14,-A*.55));pts.push(axisPt(d0-15,-4,-1));
 for(let d=d0-4;d<=d1+4;d+=6)pts.push(axisPt(d));
 pts.push(axisPt(d1+13,3.5,2.5));const headAt=axisPt(d1+25,8.5,8.5);pts.push(headAt);
 const curve=new T.CatmullRomCurve3(pts,false,'centripetal'),L=curve.getLength(),n=Math.floor(L/1.55);
 const seg=dragonPart(src,'DR_Segment'),headSrc=dragonPart(src,'DR_Head'),jawSrc=dragonPart(src,'DR_Jaw'),tailSrc=dragonPart(src,'DR_TailTip');if(!seg||!headSrc)return;
 const mats=[],up=new T.Vector3(0,1,0),X=new T.Vector3(),Y=new T.Vector3(),Z=new T.Vector3(),M=new T.Matrix4(),S=new T.Matrix4();
 for(let i=1;i<n-2;i++){const u=i/n,p=curve.getPointAt(u);Z.copy(curve.getTangentAt(u)).normalize();X.crossVectors(up,Z);if(X.lengthSq()<1e-6)X.set(1,0,0);X.normalize();Y.crossVectors(Z,X);
  const sc=.42+.58*sstep(u/.28);M.makeBasis(X,Y,Z).multiply(S.makeScale(sc,sc,sc)).setPosition(p);mats.push(M.clone());}
 seg.updateMatrixWorld(true);const segInv=new T.Matrix4().copy(seg.matrixWorld).invert();
 seg.traverse(o=>{if(!o.isMesh)return;const local=new T.Matrix4().multiplyMatrices(segInv,o.matrixWorld);
  const im=new T.InstancedMesh(o.geometry,o.material,mats.length);mats.forEach((m,i)=>im.setMatrixAt(i,_m.multiplyMatrices(m,local)));
  im.castShadow=true;im.receiveShadow=true;im.userData.dragonPart=true;world.add(im);});
 // Schwanzflamme am Anfang (zeigt vom Leib weg)
 if(tailSrc){const t=tailSrc.clone(true),p=curve.getPointAt(1/n),dir=curve.getTangentAt(1/n).negate();t.position.copy(p);t.scale.setScalar(.5);t.lookAt(p.clone().add(dir));t.traverse(o=>{if(o.isMesh)o.userData.dragonPart=true;});world.add(t);}
 // Kopf: schaut entlang der Bahn zurueck zum Korkenzieher-Ausgang, leicht nach unten
 const head=new T.Group(),h=headSrc.clone(true);h.position.set(0,0,0);head.add(h);head.position.copy(headAt);head.scale.setScalar(1.25);
 const look=axisPt(d1-6,0,-A+1.5);head.lookAt(look);world.add(head);
 let jaw=null;if(jawSrc){jaw=jawSrc.clone(true);jaw.position.set(0,-.7,1.1);h.add(jaw);}
 let eye=null;h.traverse(o=>{if(o.isMesh&&o.material&&o.material.name==='DragonEye'){o.material=o.material.clone();eye=o.material;}});
 head.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.userData.dragonPart=true;}});
 // Eigene Materialkopien fuer den Kopf (das Auge ist schon eine)
 head.traverse(o=>{if(o.isMesh&&o.material!==eye)o.material=o.material.clone();});
 // Durchsichtig in der eigenen Achterbahn (R40): der Leib verdeckte im Korkenzieher die Sicht
 const dm=new Set(),meshes=[];world.traverse(o=>{if(o.isMesh&&o.userData.dragonPart){meshes.push(o);for(const m of [].concat(o.material))dm.add(m);}});
 for(const m of dm){m.transparent=true;m.opacity=1;}
 dragon={head,jaw,eye,d1,fireT:0,cd:0,roarT:0,t:0,mats:[...dm],meshes,alpha:1,zone:{s:c.s,span:c.span}};}
// Feuer und Kiefer (animateWorld): der Drache speit, wenn der Spieler auf den Korkenzieher-Ausgang zufaehrt
// R53: nachts leuchtet der Drache - Schuppen, Flossen und Hoerner gluehen in ihrer eigenen Farbe, die Augen heller
const dragonEm0=new WeakMap();
function dragonGlow(g){const k=nightK();if(Math.abs(k-(g.glowK??-1))<.01)return;g.glowK=k;
 for(const m of g.mats){if(!m.emissive)continue;let b=dragonEm0.get(m);if(!b){b={c:m.emissive.clone(),i:m.emissiveIntensity};dragonEm0.set(m,b);}
  const eye=m.name==='DragonEye',tooth=m.name==='DragonTooth'||m.name==='DragonMouth';m.emissive.copy(b.c).lerp(eye?b.c:m.color,eye?0:k);m.emissiveIntensity=b.i+k*(eye?2.2:tooth?.25:.7);}}
function updateDragon(dt){const g=dragon;if(!g)return;g.t+=dt;g.cd=Math.max(0,g.cd-dt);dragonGlow(g);
 {const p=racers[0],race=state==='race'||state==='countdown'||state==='finished';let want=1;
  if(p&&race&&g.zone){const rel=lapDist(p.distance-g.zone.s);if(rel<g.zone.span+15||lapDist(g.zone.s-p.distance)<30)want=.12;}
  if(Math.abs(want-g.alpha)>.002){g.alpha+=(want-g.alpha)*Math.min(1,dt*4);if(Math.abs(want-g.alpha)<.004)g.alpha=want;
   for(const m of g.mats){m.opacity=g.alpha;m.depthWrite=g.alpha>.97;}for(const o of g.meshes)o.castShadow=g.alpha>.9;}}
 const p=racers[0];if(p&&(state==='race'||state==='finished')&&g.cd<=0){const rel=wrapDiff(g.d1,lapDist(p.distance));if(rel>4&&rel<38){g.fireT=1.6;g.cd=6;if(state==='race'){SFX.roar();}}}
 const fire=g.fireT>0;g.fireT=Math.max(0,g.fireT-dt);
 const open=fire?.55:.08+.05*Math.sin(g.t*1.3);if(g.jaw)g.jaw.rotation.x+=(open-g.jaw.rotation.x)*Math.min(1,dt*8);
 if(g.eye)g.eye.emissiveIntensity=fire?5:2.2+.8*Math.sin(g.t*2.1);
 if(fire){g.head.updateMatrixWorld(true);const m=g.head.matrixWorld,o=new T.Vector3(0,-.9,6.2).applyMatrix4(m),f=new T.Vector3(0,-.25,1).transformDirection(m);
  for(let i=0;i<7;i++){const sp=16+Math.random()*12;emit(o.x,o.y,o.z,Math.random()<.5?0xff6a1a:0xffc23a,f.x*sp+(Math.random()-.5)*5,f.y*sp+(Math.random()-.5)*4+2,f.z*sp+(Math.random()-.5)*5,.55+Math.random()*.35);}}}
// ---------- Elemente-Parcours: See und Flug im Bild
const WATER={forest:[0x44c2cf,0x0f5a6a,0x1d7486],night:[0x3a7bff,0x071c52,0x0d2c72],haunted:[0x5a9a80,0x10302a,0x1a3d34],fair:[0x3fd0de,0x0c5c74,0x16788c],canyon:[0x4cc4c8,0x14586a,0x1f6f80],lava:[0xff8a3a,0x5a1406,0x7a2a0e],rainbow:[0x8a7bff,0x1a1050,0x2a1c70]};
let lakeMask=null;   // Maske des Bodendeckels: {data,W}; Rotwert 10+20*i = See i, 255 = Land
function lakeHalf(z,x){const e=Math.min(x-5,z.span-5-x),L=ELEM.lake;if(e<=0)return 0;return e>=L?L:Math.sqrt(L*L-(L-e)*(L-e));}
// Punkt neben der flachen Mittellinie (Zonenmeter x, Querversatz off, Hoehe y)
function lakePt(z,x,off,y,out=new T.Vector3()){const [i,j,k]=tIdx(lapDist(z.s+x));let tx=TP.tx[i]+(TP.tx[j]-TP.tx[i])*k,tz=TP.tz[i]+(TP.tz[j]-TP.tz[i])*k;const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;
 return out.set(TP.x[i]+(TP.x[j]-TP.x[i])*k+tz*off,y,TP.z[i]+(TP.z[j]-TP.z[i])*k-tx*off);}
// Welcher See liegt unter (x, z)? Liest die Bodenmaske (UV des Zylinderdeckels: u = z, v = x)
function lakeAt(x,z){if(!lakeMask)return null;const W=lakeMask.W,px=Math.floor((.5+z/(420*WK))*W),py=Math.floor((.5-x/(420*WK))*W);if(px<0||py<0||px>=W||py>=W)return null;
 const v=lakeMask.data[(py*W+px)*4];if(v>=128)return null;const lakes=elems.filter(q=>q.lake);return lakes[clamp(Math.round((v-10)/20),0,lakes.length-1)]||null;}
function buildLakeGround(grassMat){const W=1024,cv=document.createElement('canvas');cv.width=cv.height=W;const q=cv.getContext('2d');q.fillStyle='#fff';q.fillRect(0,0,W,W);
 const px=p=>[(.5+p.z/(420*WK))*W,(.5-p.x/(420*WK))*W];
 elems.filter(z=>z.lake).forEach((z,li)=>{const g=10+20*li;q.fillStyle=`rgb(${g},${g},${g})`;
  for(let x=0;x<z.span;x+=1.5){const x2=Math.min(z.span,x+1.9),h1=lakeHalf(z,x),h2=lakeHalf(z,x2);if(h1<=0&&h2<=0)continue;
   const pts=[lakePt(z,x,-h1,0),lakePt(z,x2,-h2,0),lakePt(z,x2,h2,0),lakePt(z,x,h1,0)].map(px);q.beginPath();q.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<4;i++)q.lineTo(pts[i][0],pts[i][1]);q.closePath();q.fill();}});
 lakeMask={data:q.getImageData(0,0,W,W).data,W};
 const cap=grassMat.clone();cap.alphaMap=new T.CanvasTexture(cv);cap.alphaTest=.5;
 const g=mesh(new T.CylinderGeometry(210*WK,210*WK-15,12,Math.round(96*Math.sqrt(WK))),[grassMat,cap,grassMat],world,0,-6.3,0);g.castShadow=false;g.receiveShadow=true;}
// Band entlang der Zone zwischen zwei Randkurven
function lakeRibbon(z,fa,fb,mat,step=1.5,uvL=10){const n=Math.ceil(z.span/step),v=[],uv=[],idx=[],pa=new T.Vector3(),pb=new T.Vector3();
 for(let i=0;i<=n;i++){const x=Math.min(z.span,i*step);fa(x,pa);fb(x,pb);v.push(pa.x,pa.y,pa.z,pb.x,pb.y,pb.z);uv.push(0,x/uvL,1,x/uvL);if(i<n){const o=i*2;idx.push(o,o+2,o+1,o+1,o+2,o+3);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const m=new T.Mesh(g,mat);m.receiveShadow=true;world.add(m);return m;}
function elemPart(name){const src=P.elements;if(!src)return null;let hit=null;src.traverse(o=>{if(!hit&&o.name===name)hit=o;});return hit;}
// Instanzen eines Deko-Teils (je Material ein InstancedMesh); mats: Weltmatrizen
function elemInst(name,mats,colors){const src=elemPart(name);if(!src||!mats.length)return [];src.updateMatrixWorld(true);const inv=new T.Matrix4().copy(src.matrixWorld).invert(),out=[];
 src.traverse(o=>{if(!o.isMesh)return;const local=new T.Matrix4().multiplyMatrices(inv,o.matrixWorld),im=new T.InstancedMesh(o.geometry,o.material,mats.length);
  mats.forEach((m,i)=>im.setMatrixAt(i,_m.multiplyMatrices(m,local)));
  if(colors&&/Paint/.test(o.material.name||'')){colors.forEach((c,i)=>im.setColorAt(i,_col.setHex(c)));}
  im.castShadow=false;im.receiveShadow=true;world.add(im);out.push({im,local});});return out;}
function buildElems(){const pal=WATER[course.theme]||WATER.forest,glow=!!theme.glow,rnd=rng(course.seed+77),fx={uw:0,uwOn:false,fog0:null,bg0:null,uwCol:new T.Color(pal[2]),schools:[],buoys:[],shimmer:null,caustic:null};
 fx.shimmer=canvasTex(128,128,(q,w,h)=>{q.fillStyle='#fff';q.fillRect(0,0,w,h);for(let i=0;i<260;i++){const a=.25+Math.random()*.5;q.fillStyle=`rgba(150,210,255,${a})`;q.beginPath();q.ellipse(Math.random()*w,Math.random()*h,3+Math.random()*9,1+Math.random()*2,Math.random()*3,0,7);q.fill();}});
 fx.shimmer.wrapS=fx.shimmer.wrapT=T.RepeatWrapping;fx.shimmer.repeat.set(1,3);
 fx.caustic=canvasTex(128,128,(q,w,h)=>{q.fillStyle='#000';q.fillRect(0,0,w,h);q.strokeStyle='rgba(255,255,255,.75)';q.lineWidth=2;for(let i=0;i<40;i++){q.beginPath();const x=Math.random()*w,y=Math.random()*h;q.moveTo(x,y);q.bezierCurveTo(x+20*Math.random(),y-15,x+30,y+15*Math.random(),x+40*Math.random(),y+30*Math.random());q.stroke();}});
 fx.caustic.wrapS=fx.caustic.wrapT=T.RepeatWrapping;fx.caustic.repeat.set(2,6);
 const waterMat=stdMat({color:pal[0],map:fx.shimmer,transparent:true,opacity:.7,roughness:.1,metalness:.15,side:T.DoubleSide,depthWrite:false,emissive:pal[0],emissiveIntensity:glow?.45:.1});
 const floorMat=stdMat({color:course.theme==='haunted'?0x4a4a3c:glow?0x2a3a6a:0xd8c796,roughness:.95,emissive:0xffffff,emissiveMap:fx.caustic,emissiveIntensity:glow?.5:.3});
 const wallMat=stdMat({color:course.theme==='haunted'?0x3a3830:0x6b5a48,roughness:1,side:T.DoubleSide});
 const sandMat=stdMat({color:glow?0x3a4a7a:0xe6d3a0,roughness:1});
 const ringCol=course.theme==='lava'?0xff6a1a:theme.space?0xff4fd8:0x7cf3ff;
 for(const z of elems){
  if(z.lake){const yF=z.water-z.plan.depth-2.5,H=x=>lakeHalf(z,x);
   lakeRibbon(z,(x,o)=>lakePt(z,x,-H(x),z.water,o),(x,o)=>lakePt(z,x,H(x),z.water,o),waterMat).castShadow=false;
   lakeRibbon(z,(x,o)=>lakePt(z,x,-H(x),yF,o),(x,o)=>lakePt(z,x,H(x),yF,o),floorMat);
   for(const sd of [-1,1]){lakeRibbon(z,(x,o)=>lakePt(z,x,sd*H(x),-.3,o),(x,o)=>lakePt(z,x,sd*H(x),yF,o),wallMat);
    lakeRibbon(z,(x,o)=>lakePt(z,x,sd*H(x),-.26,o),(x,o)=>lakePt(z,x,sd*(H(x)+(H(x)>0?3.5:0)),-.26,o),sandMat);}
   // Seetang, Korallen: am Grund, nicht auf der Bahn und nicht unter der Spirale
   const lp=loops.find(q=>q.style==='lake'&&lapDist(q.s-z.s)<z.span),spots=(n)=>{const out=[];for(let t=0;t<n*8&&out.length<n;t++){const x=6+rnd()*(z.span-12),h=H(x);
     const inLoop=lp&&lapDist(z.s+x-lp.s)<lp.span+6,min=inLoop?LOOP.tilt+12:12;if(h<min+2)continue;out.push([x,(rnd()<.5?-1:1)*(min+rnd()*(h-min-1.5))]);}return out;};
   const kelp=spots(34).map(([x,o])=>new T.Matrix4().compose(lakePt(z,x,o,yF-.2),new T.Quaternion().setFromEuler(new T.Euler(0,rnd()*6.3,0)),new T.Vector3().setScalar(.8+rnd()*.7)));
   elemInst('UW_Kelp',kelp);
   const cor=spots(14),corC=[0xff7aa2,0xffb04a,0xb58cff,0x5ee0c0,0xff5d6c];
   elemInst('UW_Coral',cor.map(([x,o])=>new T.Matrix4().compose(lakePt(z,x,o,yF-.1),new T.Quaternion().setFromEuler(new T.Euler(0,rnd()*6.3,0)),new T.Vector3().setScalar(1.2+rnd()*1.3))),cor.map((_,i)=>corC[i%corC.length]));
   // Fischschwaerme ziehen Kreise zwischen Grund und Oberflaeche
   const fishC=[0xffa23a,0xff5d8f,0x5ad1ff,0xffe45c,0x9dff6a],list=[];
   for(const [x,o] of spots(5)){const c=lakePt(z,x,o,0),yy=yF+2+rnd()*Math.max(1,z.water-yF-4),w=(rnd()<.5?-1:1)*(.35+rnd()*.4);
    for(let i=0;i<7;i++)list.push({cx:c.x+(rnd()-.5)*3,cz:c.z+(rnd()-.5)*3,r:4+rnd()*5,a:rnd()*6.3,w,y:yy+(rnd()-.5)*2.2,s:.7+rnd()*.5});}
   if(list.length){const parts=elemInst('UW_Fish',list.map(()=>new T.Matrix4()),list.map((_,i)=>fishC[i%fishC.length]));fx.schools.push({parts,list});}
   // Bojen an der Bootsspur
   for(const pc of z.plan.pieces)if(pc.type==='boat')for(let x=pc.x0+3;x<=pc.x1-2;x+=11)for(const sd of [-1,1]){const q=lakePt(z,x,sd*ELEM.lane,z.water);fx.buoys.push({x:q.x,y0:q.y-.35,z:q.z,s:1.15,ph:x*.7+sd});}}
  else{// Flug: Leuchtkante an Startrampe und Landung, Ringe auf der Flugbahn
   const take=z.plan.pieces.find(q=>q.type==='takeoff'),land=z.plan.pieces.find(q=>q.type==='land'),barMat=new T.MeshBasicMaterial({color:ringCol});
   for(const x of [take.x1-.6,land.x0+.6]){const d=lapDist(z.s+x),p=posAt(d,0,.25,new T.Vector3()),b=mesh(new T.BoxGeometry(17.4,.3,.9),barMat,world,p.x,p.y,p.z);b.rotation.y=sample(d,0).angle;b.castShadow=false;}
   const cl=z.plan.pieces.find(q=>q.type==='climb'),de=z.plan.pieces.find(q=>q.type==='descend'),cr=z.plan.pieces.find(q=>q.type==='cruise');
   const ringXs=[];{const a=cl.x0+(cl.x1-cl.x0)*.75,b=de.x0+(de.x1-de.x0)*.3,n=Math.max(3,Math.round((b-a)/34)+1);for(let k=0;k<n;k++)ringXs.push([a+(b-a)*k/(n-1),[-3.5,3.5,-1.5,4,-4,2][k%6]]);}
   const zi=elems.indexOf(z);ringXs.forEach(([x,off],ri)=>{const d=lapDist(z.s+x);if((course.trenchObs||[]).some(o=>Math.abs(wrapDiff(cpDist(o[0]),d))<10))return;const p=posAt(d,off,1.3,new T.Vector3());
    const rg=new T.Mesh(new T.TorusGeometry(4.3,.36,10,32),stdMat({color:ringCol,emissive:ringCol,emissiveIntensity:1.1,roughness:.35}));
    rg.position.copy(p);rg.rotation.order='YXZ';rg.rotation.y=sample(d,0).angle;rg.castShadow=false;world.add(rg);rings.push({d,off,y:p.y,mesh:rg,flash:0,fly:1,zone:zi,ri,rn:ringXs.length});});}}
 elemFx=fx;}
// Bojen: ein InstancedMesh je Material fuer alle Bojen (vorher einzelne Klone - an langen Fluessen
// ueber 250 Draw-Calls), Wippen per Matrix in updateElems
function buildBuoyInst(){const fx=elemFx;if(!fx||!fx.buoys.length)return;fx.buoyParts=elemInst('EL_Buoy',fx.buoys.map(()=>new T.Matrix4()));for(const p of fx.buoyParts){p.im.frustumCulled=false;p.im.castShadow=true;}}
const _fp=new T.Vector3(),_fq=new T.Quaternion(),_fs=new T.Vector3(),_fe=new T.Euler(),_fm=new T.Matrix4(),_fm2=new T.Matrix4();
// Wasser, Fische, Bojen und die Unterwasser-Sicht (animateWorld)
function updateElems(dt,now){const fx=elemFx;if(!fx)return;
 fx.shimmer.offset.set((now*.00002)%1,(now*.00005)%1);fx.caustic.offset.set((now*.00004)%1,(-now*.00003)%1);
 if(fx.buoyParts&&frame%2===0){fx.buoys.forEach((b,i)=>{_fp.set(b.x,b.y0+Math.sin(now*.0021+b.ph)*.18,b.z);_fq.setFromEuler(_fe.set(0,b.ph,Math.sin(now*.0017+b.ph)*.08));_fm.compose(_fp,_fq,_fs.setScalar(b.s));
   for(const p of fx.buoyParts)p.im.setMatrixAt(i,_fm2.multiplyMatrices(_fm,p.local));});for(const p of fx.buoyParts)p.im.instanceMatrix.needsUpdate=true;}
 for(const sc of fx.schools){sc.list.forEach((f,i)=>{f.a+=f.w*dt;_fp.set(f.cx+Math.cos(f.a)*f.r,f.y+Math.sin(now*.002+i)*.3,f.cz+Math.sin(f.a)*f.r);
   _fq.setFromEuler(_fe.set(0,Math.atan2(-Math.sin(f.a)*f.w,Math.cos(f.a)*f.w)+Math.sin(now*.009+i)*.18,0));_fm.compose(_fp,_fq,_fs.setScalar(f.s));
   for(const p of sc.parts)p.im.setMatrixAt(i,_fm2.multiplyMatrices(_fm,p.local));});
  for(const p of sc.parts)p.im.instanceMatrix.needsUpdate=true;}
 // Unter Wasser: Nebel und Hintergrund in Wasserfarbe, die Musik klingt gedaempft (raceFilter)
 const c=camera.position,lk=lakeAt(c.x,c.z),want=lk&&c.y<lk.water-.12?1:0;fx.uw+=(want-fx.uw)*Math.min(1,dt*7);if(fx.uw<.004&&!want)fx.uw=0;
 const f=scene.fog;if(f&&(fx.uw>0||fx.fog0)){if(!fx.fog0)fx.fog0={c:f.color.clone(),n:f.near,f:f.far};const k=fx.uw;
  f.color.copy(fx.fog0.c).lerp(fx.uwCol,k);f.near=fx.fog0.n+(1.5-fx.fog0.n)*k;f.far=fx.fog0.f+(75-fx.fog0.f)*k;if(k===0){f.color.copy(fx.fog0.c);f.near=fx.fog0.n;f.far=fx.fog0.f;fx.fog0=null;}}
 if(fx.uw>.5&&!fx.uwOn){fx.bg0=scene.background;scene.background=fx.uwCol;fx.uwOn=true;}else if(fx.uw<=.5&&fx.uwOn){scene.background=fx.bg0;fx.uwOn=false;}
 if(fx.uw>.5&&frame%3===0)emit(c.x+(Math.random()-.5)*6,c.y-1.5-Math.random()*2,c.z+(Math.random()-.5)*6,0xcff6ff,0,5+Math.random()*2,0,.5);}
// ---------- Verwandlung: Rennboot, Tauchboot, Flugzeug (Blender-Teile am Kart, je nach Element)
const TF_FORMS=['boat','dive','plane'],TF_TOAST={boat:'RENNBOOT!',dive:'TAUCHGANG!',plane:'FLUGZEUG!'};
function tfPart(name){const src=P.transform;if(!src)return null;let hit=null;src.traverse(o=>{if(!hit&&o.name===name)hit=o;});return hit?cloneProto(hit):null;}
function attachTransform(g,color){if(!P.transform)return;const tf={cur:'kart',k:{boat:0,dive:0,plane:0}};
 const mk=names=>{const grp=new T.Group();for(const n of names){const q=tfPart(n);if(q)grp.add(q);}for(const m of ['BoatPaint','DivePaint','WingPaint'])applyTint(grp,m,color);grp.traverse(o=>{if(o.isMesh)o.castShadow=true;});grp.visible=false;g.add(grp);return grp;};
 tf.boat=mk(['TF_Boat']);tf.dive=mk(['TF_Dive','TF_DiveProp']);tf.plane=mk(['TF_Plane','TF_PlaneProp']);
 tf.dprop=tf.dive.getObjectByName('TF_DiveProp');tf.pprop=tf.plane.getObjectByName('TF_PlaneProp');g.userData.tf=tf;}
function resetTransform(u){const tf=u.tf;if(!tf)return;tf.cur='kart';for(const f of TF_FORMS){tf.k[f]=0;tf[f].visible=false;}if(u.parts)for(const w of u.parts.wheels)w.piv.scale.setScalar(1);}
function elemBurst(r,cols,n,up){const p=r.mesh.position;for(let i=0;i<n;i++)emit(p.x+(Math.random()-.5)*2.4,p.y+.4+Math.random(),p.z+(Math.random()-.5)*2.4,cols[i%cols.length],(Math.random()-.5)*9,up*(3+Math.random()*6),(Math.random()-.5)*9,.45+Math.random()*.4);}
function syncTransform(r,dt){const u=r.mesh.userData,tf=u.tf;if(!tf)return;let form='kart',z=null;
 if(elems.length){const st=elemSt(r.distance);z=st.z;form=st.form;
  if(z&&z.lake){const wy=r.mesh.position.y-z.water,side=wy<0?-1:1;
   if(form==='dive'&&wy>.6)form='kart';                      // auf der Spirale ueber dem Wasser
   if(r.wSide&&side!==r.wSide&&nearPlayer(r,90)){elemBurst(r,[0xffffff,0xbff4ff,0x7fd8ff],18,1);if(r.id===0)SFX.splash();}
   r.wSide=side;}else r.wSide=0;}
 if(tsu&&tsu.surf)form='boat';
 if(form!==tf.cur){tf.cur=form;if(nearPlayer(r,70))elemBurst(r,[0xffe45c,0xffffff,0xff7ab8],10,.6);
  if(r.id===0&&state==='race'&&form!=='kart'){SFX.transform(form);const seen=r.tfSeen||(r.tfSeen={});if(!seen[form]&&!(tsu&&tsu.surf)){seen[form]=1;toast(TF_TOAST[form],1.1,'good');}}}
 let wheels=1;
 for(const f of TF_FORMS){const g=tf[f],want=tf.cur===f?1:0;tf.k[f]+=(want-tf.k[f])*Math.min(1,dt*9);if(!want&&tf.k[f]<.004)tf.k[f]=0;
  const k=tf.k[f];g.visible=k>0;if(k>0)g.scale.setScalar(.12+.88*k);if(f!=='dive')wheels=Math.min(wheels,1-k);}
 if(u.parts)for(const w of u.parts.wheels)w.piv.scale.setScalar(Math.max(.001,wheels));
 if(tf.k.dive>0&&tf.dprop)tf.dprop.rotation.z+=dt*(6+Math.abs(r.speed)*.9);
 if(tf.k.plane>0&&tf.pprop)tf.pprop.rotation.z+=dt*(30+Math.abs(r.speed));
 if(tf.cur!=='kart'&&u.underglow)u.underglow.visible=false;
 // Boot schaukelt, Flugzeug legt sich in die Kurve und schwebt
 if(tf.k.boat>0){const k=tf.k.boat;r.mesh.position.y+=Math.sin(elapsed*5.2+r.id)*.12*k;r.mesh.rotateZ(Math.sin(elapsed*3.1+r.id*2)*.05*k);r.mesh.rotateX(-.07*k*Math.min(1,Math.abs(r.speed)/30));}
 if(tf.k.plane>0){const k=tf.k.plane;r.mesh.rotateZ(-(r.steerS||0)*.5*k);r.mesh.position.y+=Math.sin(elapsed*2.3+r.id)*.22*k;}
 // Spuren: Gischt am Boot, Blasen beim Tauchen, Kondensstreifen an den Fluegelspitzen
 if(tf.cur!=='kart'&&frame%2===0&&Math.abs(r.speed)>6&&nearPlayer(r,70)){
  if(tf.cur==='boat')for(const sx of [-1.3,1.3]){_fp.set(sx,.2,-1.9);r.mesh.localToWorld(_fp);emit(_fp.x,_fp.y,_fp.z,0xffffff,(Math.random()-.5)*3+sx*1.5,3+Math.random()*3,(Math.random()-.5)*3,.35);}
  else if(tf.cur==='dive'){_fp.set((Math.random()-.5)*1.6,.9,-2.1);r.mesh.localToWorld(_fp);emit(_fp.x,_fp.y,_fp.z,0xcff6ff,(Math.random()-.5)*1.5,6+Math.random()*3,(Math.random()-.5)*1.5,.55);}
  else for(const sx of [-2.9,2.9]){_fp.set(sx,.85,-.1);r.mesh.localToWorld(_fp);emit(_fp.x,_fp.y,_fp.z,0xf4fbff,0,4,0,.5);}}}
// ---------------------------------------------------------------- R60 Wiesnland-Herausforderungen (challenge.mjs)
// Nutzerwunsch "kleine Challenges in der Open World": Blitzer (Tempo an einem Punkt), Tempo-Zone (Schnitt ueber einen
// Abschnitt), Drift-Zone (Driftpunkte, Turbo-Ketten erhoehen den Faktor) und Sprung (Weite ab der Schanze). Je bis zu drei
// Sterne, Bestwerte bleiben gespeichert (owc-<id>), neue Sterne bringen XP. Online meldet ein neuer Rekord sich im Chat.
// Kurs-Eintraege: challenges:[[Art, cpVon, cpBis|Schanzen-Index, Name]] - belegte Stellen (Wasser, Flug, Spirale, Looping,
// Halfpipe) werden bis zu 160 m nach vorn verschoben.
const chFree=d=>!elemAt(d,12)&&!hasRoll(d)&&!nearLoop(d)&&!(hpipes.length&&hpAt(d,12))&&!inTunnel(d)&&!inBridge(d)&&!inGap(d);
function chSpot(v){let d=cpDist(v);for(let k=0;k<16&&!chFree(d);k++)d=lapDist(d+10);return chFree(d)?d:null;}
function chBanner(d,text,sub,col){const s=sample(d,0),g=new T.Group();g.position.copy(s.p);g.position.y=Math.max(0,s.p.y);g.rotation.y=s.angle+Math.PI;world.add(g);
 const post=mat(0x2a2f5a,{roughness:.6});for(const x of [-12.6,12.6]){mesh(new T.CylinderGeometry(.22,.26,8,8),post,g,x,4,0);const q=sample(d,x).p;addObstacle(q.x,q.z,.6);}
 const lab=labelPlane(text,sub,col,18,3.4);lab.position.set(0,7.6,0);g.add(lab);return g;}
function chSign(d,off,text,sub,col){const s=sample(d,off),g=new T.Group();g.position.copy(s.p);g.position.y=Math.max(0,groundAt(d,off).y);g.rotation.y=s.angle+Math.PI;world.add(g);
 mesh(new T.CylinderGeometry(.14,.18,4.2,8),mat(0x2a2f5a),g,0,2.1,0);const lab=labelPlane(text,sub,col,7.2,1.9);lab.position.set(0,4.9,0);g.add(lab);addObstacle(s.p.x,s.p.z,.6);return {g,lab};}
const chBest=id=>store.get('owc-'+id,null),chStarsOf=id=>store.get('owcs-'+id,0);
function buildChallenges(){owCh=null;const L=course.challenges;if(!L||!course.openWorld)return;owCh={list:[],run:null,pop:0,prevD:null,jump:jumpState()};
 for(const [kind,a,b,name,stars] of L){const id=kind[0]+a,C=CH[kind],col={trap:'#e8202a',zone:'#2f6bff',drift:'#ff7a1a',jump:'#1f9a4b'}[kind];
  if(kind==='trap'){const d=chSpot(a);if(d===null)continue;const g=new T.Group(),s=sample(d,13.5);g.position.copy(s.p);g.position.y=Math.max(0,s.p.y);g.rotation.y=s.angle-Math.PI/2;world.add(g);
   mesh(new T.CylinderGeometry(.16,.2,5.4,8),mat(0x9aa4b4,{metalness:.5,roughness:.4}),g,0,2.7,0);box(g,mat(0x2a2f3a),0,5.5,0,1.1,.8,1.4);
   const lamp=new T.Mesh(new T.SphereGeometry(.28,10,8),stdMat({color:0xff3a2a,emissive:0xff2a1a,emissiveIntensity:.3}));lamp.position.set(0,6.1,0);g.add(lamp);addObstacle(s.p.x,s.p.z,.7);
   const sg=chSign(d-6,-13.5,`${C.icon} ${name}`,'BLITZER · Vollgas!',col);owCh.list.push({kind,id,name,stars,d,lamp,sign:sg});}
  else if(kind==='zone'||kind==='drift'){const s=chSpot(a);if(s===null)continue;let e=cpDist(b);if(lapDist(e-s)<80)e=lapDist(s+160);
   chBanner(s,`${C.icon} ${name}`,kind==='zone'?'TEMPO-ZONE · START':'DRIFT-ZONE · START',col);chBanner(e,'🏁 ZIEL',C.name.toUpperCase(),'#15133a');owCh.list.push({kind,id,name,stars,s,e,span:lapDist(e-s)});}
  else if(kind==='jump'){const rp=ramps.filter(q=>!q.gap)[a];if(!rp)continue;const d=rp.end;chSign(rp.start-10,13.2,`${C.icon} ${name}`,'SPRUNG · weit fliegen!',col);owCh.list.push({kind,id,name,stars,d,rp});}}
 owCh.total=owCh.list.length*3;chHud();}
function chStarsTotal(){return owCh?owCh.list.reduce((a,c)=>a+chStarsOf(c.id),0):0;}
// Ergebnis werten: Sterne, Rekord, XP, Anzeige, online im Chat
function chResult(c,v){const C=CH[c.kind],st=starsFor(c.kind,v,c.stars),old=chStarsOf(c.id),rb=recordBest(chBest(c.id),v);if(rb.fresh&&!TEST)store.set('owc-'+c.id,rb.best);
 if(st>old&&!TEST)store.set('owcs-'+c.id,st);const xp=challengeXP(old,st);if(xp>0)addXP(xp);
 chPop(c.kind,C.name+' · '+c.name,fmt(c.kind,v),st,rb.fresh?(xp?`NEUER REKORD · +${xp} XP`:'NEUER REKORD'):`Rekord ${fmt(c.kind,rb.best)}`,3.2);
 if(rb.fresh){SFX.cheer();burst(racers[0],0xffd452,20);if(net&&net.setup)chatSend({t:`${C.icon} ${c.name}: ${fmt(c.kind,v)} ${'★'.repeat(st)} – neuer Rekord!`});}else if(st)SFX.pickup();else SFX.wrong();chHud();}
function addXP(n){const pr=store.get('prog',{xp:0,ach:[],done:[],won:[]}),before=levelOf(pr.xp||0).level;pr.xp=(pr.xp||0)+n;if(!TEST)store.set('prog',pr);const after=levelOf(pr.xp).level;
 if(after>before){setTimeout(()=>toast(`⬆ FAHRERSTUFE ${after}!`,2,'good'),900);playClip('s_c_levelup',sfxGain,.9);}}
function chTick(dt){if(!owCh||!owCh.list.length)return;const p=racers[0];if(!p||p.net)return;const d=lapDist(p.distance),prev=owCh.prevD;owCh.prevD=d;
 const crossed=x=>prev!==null&&wrapDiff(prev,x)<0&&wrapDiff(d,x)>=0&&wrapDiff(d,x)<25,onRoad=Math.abs(p.offset)<12&&!(p.y>groundAt(p.distance,p.offset).y+6);
 for(const c of owCh.list){if(c.kind==='trap'){c.lamp.material.emissiveIntensity=Math.max(.3,c.lamp.material.emissiveIntensity-dt*6);
   if(crossed(c.d)&&onRoad){const v=Math.abs(p.speed)*KMH;c.lamp.material.emissiveIntensity=6;flashScreen(.25);SFX.shutter();chResult(c,v);}}}
 // laufende Zone
 const R=owCh.run;if(R){const c=R.c,rel=lapDist(d-c.s);
  if(Math.abs(p.offset)>(c.kind==='drift'?24:18)||rel>c.span+30||elapsed-R.t0>70||(wrapDiff(d,R.maxD)<-25)){owCh.run=null;chPop(c.kind,c.name,'abgebrochen',0,'Bleib auf der Strecke',1.4);SFX.wrong();}
  else{R.maxD=wrapDiff(d,R.maxD)>0?d:R.maxD;if(c.kind==='zone'){zoneStep(R.st,dt,p.speed);if(frame%6===0)chPop('zone',c.name,fmt('zone',zoneResult(R.st))+' Ø',starsFor('zone',zoneResult(R.st),c.stars),'läuft …',.4);}
   else{const dr=!!p.driftDir&&!p.air;if(dr)R.lv=miniTurbo(p.drift)?1:0;driftStep(R.st,dt,{drifting:dr,speed:Math.abs(p.speed),level:R.lv||0,crashed:(p.stun||0)>.3});if(frame%6===0)chPop('drift',c.name,fmt('drift',R.st.pts)+` ×${driftMul(R.st).toFixed(2).replace('.',',')}`,starsFor('drift',R.st.pts,c.stars),'läuft …',.4);}
   if(crossed(c.e)){owCh.run=null;chResult(c,c.kind==='zone'?zoneResult(R.st):R.st.pts);}}}
 else for(const c of owCh.list)if((c.kind==='zone'||c.kind==='drift')&&crossed(c.s)&&onRoad){owCh.run={c,t0:elapsed,maxD:d,st:c.kind==='zone'?zoneState():driftState()};SFX.pickup();toast(`${CH[c.kind].icon} ${c.name.toUpperCase()}!`,1,'good');break;}
 // Sprung: Absprung kurz hinter einer Challenge-Schanze, Weite bis zur Landung
 const J=owCh.jump;if(!J.c){if(p.air)for(const c of owCh.list)if(c.kind==='jump'){const a=wrapDiff(d,c.d);if(a>-3&&a<10&&Math.abs(p.offset-c.rp.off)<c.rp.w){J.c=c;J.air=false;break;}}}
 if(J.c){const v=jumpStep(J,dt,!!p.air,p.x,p.z,.3);if(v!==null){chResult(J.c,v);J.c=null;}else if(!p.air&&!J.air)J.c=null;}}
// Einblendung oben rechts unter der Karte: Symbol, Name, Wert, Sterne, Rekordzeile
let chPopT=0;
function chPop(kind,name,val,stars,sub,dur){const el=$('chPop');if(!el)return;el.hidden=false;el.dataset.kind=kind;setText('chIcon',CH[kind].icon);setText('chName',name);setText('chVal',val);
 setText('chStars','★'.repeat(stars)+'☆'.repeat(3-stars));setText('chRec',sub||'');chPopT=Math.max(chPopT,performance.now()+dur*1000);}
setInterval(()=>{const el=$('chPop');if(el&&!el.hidden&&performance.now()>chPopT)el.hidden=true;},250);
function chHud(){const el=$('owCh');if(el&&owCh)el.textContent=`🏁 Challenges ★ ${chStarsTotal()}/${owCh.total}`;}

// ---------- Wiesnland: Portale, Glockenschalter, Muenzen, Bojen-Slalom (Blender: ow.glb, elements.glb)
function owPart(name){const src=P.ow;if(!src)return null;let hit=null;src.traverse(o=>{if(!hit&&o.name===name)hit=o;});return hit;}
function labelPlane(text,sub,col,w=16,h=3.6){const tex=canvasTex(512,116,(q,W,H)=>{q.fillStyle='#15133a';q.beginPath();q.roundRect(4,4,W-8,H-8,26);q.fill();q.fillStyle=col;q.beginPath();q.roundRect(12,12,W-24,H-24,20);q.fill();
  q.font='italic 900 50px Rubik, "Baloo 2", sans-serif';q.textAlign='center';q.textBaseline='middle';q.lineJoin='round';q.lineWidth=10;q.strokeStyle='#15133a';q.strokeText(text,W/2,H/2-(sub?12:0));q.fillStyle='#fff';q.fillText(text,W/2,H/2-(sub?12:0));
  if(sub){q.font='800 24px "Baloo 2", sans-serif';q.fillStyle='#15133a';q.fillText(sub,W/2,H-24);}});
 return new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,transparent:true,side:T.DoubleSide}));}
function buildOW(){const fx={switches:[],portals:[],slaloms:[],ringMs:[],coins:null,coinParts:[],active:null,done:store.get('owDone',[]),total:0,msg:''};
 // Portale: Torbogen in der Farbe der Zielstrecke, Namensschild obendrauf
 for(const [cp,ti] of course.portals||[]){const d=cpDist(cp),s0=sample(d,0),tc=courses[ti],th=THEMES[tc.theme],col=th.caps?th.caps[0]:0xffd21f,g=new T.Group();g.position.copy(s0.p);g.rotation.y=s0.angle;world.add(g);
  if(P.gate){const a=cloneProto(P.gate);applyTint(a,'CapPaint',col);g.add(a);}
  const lab=labelPlane(tc.icon+' '+tc.name,'PORTAL · '+tc.kind.split('·')[0].trim(),'#'+new T.Color(col).getHexString());lab.position.set(0,11.2,0);g.add(lab);
  // leuchtender Portalschleier
  const veil=new T.Mesh(new T.PlaneGeometry(16,7.5),new T.MeshBasicMaterial({color:col,transparent:true,opacity:.18,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending}));veil.position.set(0,4.2,0);g.add(veil);
  fx.portals.push({d,ti,veil,lab,cool:0});}
 // Glockenschalter: Sockel und Kappe (Kappe wird beim Ueberfahren gestaucht)
 const baseSrc=owPart('EL_PSwitch'),capSrc=owPart('EL_PSwitchCap');if(capSrc)applyTint(capSrc,'SwitchBlue',0xd08a22,{metalness:.55,roughness:.3});
 for(const [cp,off,id] of course.pswitch||[]){const d=cpDist(cp),p=posAt(d,off,0,new T.Vector3()),g=new T.Group();g.position.copy(p);g.rotation.y=sample(d,0).angle;world.add(g);
  let cap=null;if(baseSrc){g.add(cloneProto(baseSrc));cap=cloneProto(capSrc);cap.position.y=.5;g.add(cap);}
  else{cap=mesh(new T.CylinderGeometry(1.2,1.2,.8,24),mat(0x1f5cff,{emissive:0x1030ff,emissiveIntensity:.5}),g,0,.9,0);}
  const m=pswitchMission(id,d);fx.switches.push({id,d,off,g,cap,m});fx.total++;}
 // Muenzen: ein Satz (8) fuer den gerade laufenden Schalter
 const coinSrc=owPart('EL_Coin');
 if(coinSrc){coinSrc.updateMatrixWorld(true);const inv=new T.Matrix4().copy(coinSrc.matrixWorld).invert();coinSrc.traverse(o=>{if(!o.isMesh)return;const im=new T.InstancedMesh(o.geometry,o.material,OW.coins);im.userData.local=new T.Matrix4().multiplyMatrices(inv,o.matrixWorld);for(let i=0;i<OW.coins;i++)im.setMatrixAt(i,_zeroM);im.frustumCulled=false;im.castShadow=true;world.add(im);fx.coinParts.push(im);});}
 // Bojen-Slalom auf jedem Fluss (Plan 'bach'): Tore abwechselnd links und rechts der Spur
 elems.forEach((z,zi)=>{if(z.kind!=='bach')return;const bp=z.plan.pieces.find(q=>q.type==='boat');if(!bp)return;const gates=[];
  for(let x=bp.x0+16,k=0;x<bp.x1-10;x+=24,k++){const off=k%2?3.6:-3.6;gates.push({d:lapDist(z.s+x),off});
   for(const sd of [-1,1]){const q=lakePt(z,x,off+sd*(OW.gateHalf+.4),z.water);if(elemFx)elemFx.buoys.push({x:q.x,y0:q.y-.35,z:q.z,s:1.3,ph:x*.9+sd});}}
  if(gates.length){fx.slaloms.push({zi,m:slalomMission('s'+(zi+1),gates),prevD:null});fx.total++;}});
 // Ringflug: alle Ringe eines Flugabschnitts
 elems.forEach((z,zi)=>{if(z.kind!=='flug')return;const n=rings.filter(r=>r.fly&&r.zone===zi).length;if(n){fx.ringMs.push({zi,m:ringsMission('r'+(zi+1),n)});fx.total++;}});
 // Wahrzeichen (R41): Pilzberg in der Inselmitte, an jedem Portal das Wahrzeichen seiner Strecke
 const rnd=rng(course.seed+9),land=(name,x,z,s,ry=0,tint=null,r=0)=>{const src=P[name];if(!src)return null;const o=cloneProto(src);o.position.set(x,-.3,z);o.scale.setScalar(s);o.rotation.y=ry;
  if(tint!==null)applyTint(o,'CapPaint',tint);o.traverse(c=>{if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});world.add(o);if(r)addObstacle(x,z,r);return o;};
 land('mushroom',0,0,15,.3,0xe8352e,9);
 const DISTRICT={0:['roottree',1.2],1:['rock',9],2:['neongate',1.1],3:['mansion',.9],4:['castle',.8],5:['crystal',7],6:['ferriswheel',.8],7:['crystal',6]};
 // R60: Wahrzeichen der neuen Strecken (prozedural): Leuchtturm, Bergkapelle, Riesenwaechter
 const R60L={8:()=>lighthouseProto(),9:()=>chapelProto(),10:()=>sentinelParts().body};
 for(const pt of fx.portals){const [name,sc]=DISTRICT[pt.ti]||['mushroom',6],a=sample(pt.d,-56).p,b=sample(pt.d,56).p,q=Math.hypot(a.x,a.z)<Math.hypot(b.x,b.z)?a:b,ang=Math.atan2(-q.x,-q.z);
  if(R60L[pt.ti]){const o=cloneProto(R60L[pt.ti]());o.position.set(q.x,-.3,q.z);o.rotation.y=ang;o.scale.setScalar(pt.ti===10?1.2:1.3);world.add(o);addObstacle(q.x,q.z,pt.ti===9?9:5);continue;}
  const o=land(name,q.x,q.z,sc,ang,name==='crystal'?0xb09aff:null,name==='rock'||name==='crystal'?6:10);
  if(o&&name==='rock')for(let k=1;k<4;k++)land('rock',q.x+Math.cos(k*2.1)*14,q.z+Math.sin(k*2.1)*14,5+k*1.6,k,null,5);}
 owPaths(fx);owHunt(fx);owFx=fx;}
// R44: Sandwege von jedem Portal quer ueber die Wiese zum Pilzberg - verbinden alle Gebiete, frei befahrbar
function owPaths(fx){const tex=canvasTex(64,64,(q,w,h)=>{q.fillStyle='#d9b77c';q.fillRect(0,0,w,h);for(let i=0;i<180;i++){q.fillStyle=`rgba(${150+Math.random()*60|0},${110+Math.random()*50|0},${70+Math.random()*30|0},.5)`;q.fillRect(Math.random()*w,Math.random()*h,2,2);}},true);tex.repeat.set(1,8);
 const m=stdMat({map:tex,roughness:.95}),geos=[];for(const pt of fx.portals){const s0=sample(pt.d+18,0).p,a=sample(pt.d+18,-12).p,b=sample(pt.d+18,12).p,st=Math.hypot(a.x,a.z)<Math.hypot(b.x,b.z)?a:b,len0=Math.hypot(st.x,st.z),ux=-st.x/len0,uz=-st.z/len0,L=len0-66;
  if(L<20)continue;const g=new T.PlaneGeometry(6,L,1,Math.ceil(L/6)).rotateX(-Math.PI/2);g.rotateY(Math.atan2(ux,uz));g.translate(st.x+ux*L/2,.04,st.z+uz*L/2);geos.push(g);}
 if(geos.length){const mesh=new T.Mesh(mergeGeometries(geos),m);mesh.receiveShadow=true;world.add(mesh);}}
// R44: Muenzjagd - 24 Muenzen quer ueber die Insel, jede einmal (bleibt gespeichert); alle = Mission erledigt
function owHunt(fx){if(!P.coin)return;const got=new Set(store.get('owHunt',[])),rnd=rng(4242),list=[];let guard=0;
 while(list.length<24&&guard++<4000){const a=rnd()*TAU,rr=90+rnd()*470,x=Math.cos(a)*rr,z=Math.sin(a)*rr,d=projectGlobal(x,z),q=sample(d).p;if(Math.hypot(q.x-x,q.z-z)<25)continue;if(list.some(c=>Math.hypot(c.x-x,c.z-z)<40))continue;list.push({x,z,i:list.length});}
 let cg=null,cm=null;P.coin.traverse(o=>{if(o.isMesh&&!cg){cg=o.geometry;cm=o.material;}});const im=new T.InstancedMesh(cg,cm,list.length);im.instanceMatrix.setUsage(T.DynamicDrawUsage);im.frustumCulled=false;world.add(im);
 fx.hunt={list,got,im};fx.total++;if(got.size>=list.length)fx.done=progressAdd(fx.done,'hunt');}
// Zustand zuruecksetzen (neue Fahrt in der Welt): erledigte Missionen bleiben erledigt
// Portal-Knopf wirklich ausblenden (vorher blieb er nach dem Tippen im Rennen und sogar im Hauptmenue stehen)
function owPortalHide(){owPortalAt=null;owHudKey='';const pb=$('owPortal');if(pb)pb.hidden=true;}
function owReset(){if(owCh){owCh.run=null;owCh.prevD=null;owCh.jump=jumpState();chHud();}const fx=owFx;if(!fx)return;fx.done=store.get('owDone',[]);fx.active=null;owPortalAt=null;
 for(const sw of fx.switches){sw.m=pswitchMission(sw.id,sw.d);if(fx.done.includes(sw.id))sw.m.state='done';sw.cap.scale.y=sw.m.state==='done'?.35:1;}
 for(const s of fx.slaloms){s.m=slalomMission(s.m.id,s.m.gates);if(fx.done.includes(s.m.id))s.m.state='done';s.prevD=null;}
 for(const r of fx.ringMs){r.m=ringsMission(r.m.id,r.m.count);if(fx.done.includes(r.m.id))r.m.state='done';}
 for(const im of fx.coinParts){for(let i=0;i<OW.coins;i++)im.setMatrixAt(i,_zeroM);im.instanceMatrix.needsUpdate=true;}
 owHud();}
// Erfolg direkt gutschreiben (Grand Prix, Wiesnland-Missionen)
function grantAch(id){const pr=store.get('prog',{xp:0,ach:[],done:[],won:[]});if((pr.ach||[]).includes(id))return;pr.ach=[...(pr.ach||[]),id];store.set('prog',pr);const a=achById(id);if(a){toast('🏅 ERFOLG: '+a.n,2.4,'good');playClip('s_c_unlock',sfxGain,.8);}}
function owComplete(id,label){const fx=owFx;fx.done=progressAdd(fx.done,id);store.set('owDone',fx.done);if(fx.done.length>=3)grantAch('ow');const p=racers[0];
 if(p){p.boost=Math.max(p.boost,1.6);p.spores=Math.min(MAX_SPORES,(p.spores||0)+3);}
 SFX.boost();toast(`${label} GESCHAFFT! ★ ${fx.done.length}/${fx.total}`,2,'good');elemBurst(p,[0xffe45c,0x5ad1ff,0xffffff],24,1);owHud();}
function owRingHit(ring){const fx=owFx;if(!fx)return;const rm=fx.ringMs.find(x=>x.zi===ring.zone);if(!rm||rm.m.state==='done')return;
 if(ringsHit(rm.m,ring.ri)){if(rm.m.state==='done')owComplete(rm.m.id,'RINGFLUG');else fx.msg=`Ringflug ${rm.m.got.size}/${rm.m.count}`;owHud();}}
const _cm=new T.Matrix4(),_cq=new T.Quaternion(),_cv=new T.Vector3(),_cs=new T.Vector3(1,1,1);
function updateOW(dt){const fx=owFx,p=racers[0];if(!fx||!p)return;const t=elapsed,d=lapDist(p.distance);
 // R50: Portal-Schleier und Namensschild blenden beim Heranfahren aus - sie verdeckten die Sicht auf die Strasse
 for(const pt of fx.portals){const k=clamp((Math.abs(wrapDiff(pt.d,d))-8)/32,0,1);pt.veil.material.opacity=.18*k;pt.veil.visible=k>.02;if(pt.lab)pt.lab.material.opacity=.12+.88*k;}
 if(fx.hunt){const H=fx.hunt;H.list.forEach((c,i)=>{const on=!H.got.has(i);if(on&&Math.hypot(p.x-c.x,p.z-c.z)<2.8&&(p.y||0)<4){H.got.add(i);store.set('owHunt',[...H.got]);SFX.spore(H.got.size);burst(p,0xffd23f,10);
   toast(`MÜNZJAGD ${H.got.size}/${H.list.length}`,1,'good');if(H.got.size>=H.list.length)owComplete('hunt','Münzjagd');}
  _e.set(0,t*2.2+i,0);_q.setFromEuler(_e);_m.compose(_v.set(c.x,1.5+Math.sin(t*2.4+i)*.25,c.z),_q,_s.setScalar(on?1.7:0));H.im.setMatrixAt(i,_m);});H.im.instanceMatrix.needsUpdate=true;}
 // Glockenschalter und Muenzen
 for(const sw of fx.switches){const m=sw.m;
  if(m.state==='ready'&&Math.abs(wrapDiff(d,sw.d))<2.4&&Math.abs(p.offset-sw.off)<2.8&&!p.air&&pswitchPress(m,t)){fx.active=sw;sw.cap.scale.y=.35;SFX.pickup();toast(`GLOCKENSCHALTER! ${OW.coins} Münzen in ${OW.coinTime} s`,1.6,'good');}
  if(m.state==='running'){for(let i=0;i<m.coins.length;i++){const c=m.coins[i];if(!c.taken&&Math.abs(wrapDiff(d,c.d))<OW.coinR&&Math.abs(p.offset-c.off)<OW.coinR&&pswitchCollect(m,i,t)){SFX.spore(m.got);if(m.state==='done'){owComplete(sw.id,'GLOCKENSCHALTER');fx.active=null;}}}}
  const prev=m.state;pswitchTick(m,t);if(prev==='running'&&m.state==='failed'){toast('ZEIT UM!',1.4,'bad');fx.active=null;}
  if(prev==='failed'&&m.state==='ready')sw.cap.scale.y=1;}
 // Muenzen zeichnen (drehen sich, schweben), sonst verborgen
 const act=fx.switches.find(s=>s.m.state==='running');
 for(const im of fx.coinParts){for(let i=0;i<OW.coins;i++){const c=act&&act.m.coins[i];
   if(!c||c.taken){im.setMatrixAt(i,_zeroM);continue;}
   posAt(c.d,c.off,2+Math.sin(t*3+i)*.25,_cv);_cq.setFromAxisAngle(T.Object3D.DEFAULT_UP,t*3+i*.7);_cm.compose(_cv,_cq,_cs.setScalar(1.9));im.setMatrixAt(i,_cm.multiply(im.userData.local));}
  im.instanceMatrix.needsUpdate=true;}
 // Bojen-Slalom: Tor beim Ueberfahren werten
 for(const s of fx.slaloms){if(s.m.state==='done'){s.prevD=d;continue;}
  if(s.prevD!==null){s.m.gates.forEach((g,k)=>{const a=wrapDiff(s.prevD,g.d),b=wrapDiff(d,g.d);if(a<0&&b>=0&&b<20){const res=slalomPass(s.m,k,p.offset);
   if(res==='hit'){SFX.pickup();fx.msg=`Bojen-Slalom ${s.m.next}/${s.m.gates.length}`;}else if(res==='miss')toast('TOR VERPASST – NOCHMAL VON VORN',1.3,'bad');else if(res==='done')owComplete(s.m.id,'BOJEN-SLALOM');owHud();}});}
  s.prevD=d;}
 // Ringflug: Landen ohne alle Ringe setzt zurueck
 {const f=p.mesh.userData.tf?.cur;if(fx.wasPlane&&f!=='plane')for(const r of fx.ringMs)if(r.m.state!=='done'&&r.m.got.size){ringsLand(r.m);toast('RINGFLUG: ALLE RINGE IN EINEM FLUG!',1.4,'bad');}fx.wasPlane=f==='plane';}
 // Portale: Schleier pulsiert, beim Durchfahren Angebot zum Rennen
 for(const pt of fx.portals){pt.veil.material.opacity=.14+.08*Math.sin(t*3+pt.d);pt.cool=Math.max(0,pt.cool-dt);
  if(pt.cool<=0&&Math.abs(wrapDiff(d,pt.d))<3&&Math.abs(p.offset)<9){pt.cool=6;owPortalAt={ti:pt.ti,until:t+5};SFX.pickup();owHud();}}
 if(owPortalAt&&t>owPortalAt.until){owPortalAt=null;owHud();}
 chTick(dt);if(frame%10===0)owHud();}
// Anzeige oben links und Portal-Knopf
let owHudKey='';
function owHud(){const fx=owFx;if(!fx||!worldMode)return;const act=fx.switches.find(s=>s.m.state==='running');
 const line=act?`Glockenschalter: ${act.m.got}/${OW.coins} · ${Math.ceil(timeLeft(act.m,elapsed))} s`:fx.msg||(fx.hunt&&fx.hunt.got.size<fx.hunt.list.length?`Münzjagd ${fx.hunt.got.size}/${fx.hunt.list.length} – fahr frei über die Insel`:'Fahr durch Kotzhügel – Portale führen zu den Rennen');
 const hk=fx.hunt?fx.hunt.got.size:0;
 const k=`${fx.done.length}|${fx.total}|${line}|${hk}|${owPortalAt?owPortalAt.ti:-1}`;if(k===owHudKey)return;owHudKey=k;
 $('owStars').textContent=`★ ${fx.done.length}/${fx.total}`;$('owMission').textContent=line;
 const pb=$('owPortal');pb.hidden=!owPortalAt;if(owPortalAt){const tc=courses[owPortalAt.ti];pb.innerHTML=isLobby()?`<b>🗳 ${tc.icon} ${tc.name} wählen</b><span>${padHints?'Y drücken':'Enter / tippen'} · Stimme fürs nächste Rennen</span>`:`<b>▶ ${tc.icon} ${tc.name} fahren</b><span>${padHints?'Y drücken':'Enter / tippen'}</span>`;}}
function owEnterTrack(ti){if(isLobby()){netVote(ti);return;}if(net&&net.setup){if(net.host){net.what='race';net.track=ti;netHostGo();}else toast('Rennen startet der Host – frag ihn!',1.4);return;}owPortalAt=null;owPortalHide();mode='single';document.querySelectorAll('#modes .mode').forEach(x=>{const on=x.dataset.mode==='single';x.classList.toggle('selected',on);x.setAttribute('aria-pressed',String(on));});
 $('tracks').classList.remove('locked');lastRaceSel=ti;selected=ti;worldMode=false;start();}
function buildGaps(){for(const g of gaps){const h=trackAt(g.start-1).h;
 // Klippenwaende an beiden Kanten + Fluss unten
 for(const d of [g.start,g.end]){const s=sample(d,0),wall=mesh(new T.BoxGeometry(18.5,h+.6,1.2),mat(theme.skirt,{roughness:1}),world,s.p.x,(h-.6)/2,s.p.z);wall.rotation.y=s.angle;}
 const ch=theme.chasm||{c:0x2fb7d8,e:0x0a4a6a,i:.4,label:'SCHLUCHT! VOLLGAS'};
 const water=addStrip(strip(g.start-8,g.end+8,0,60,-h+.3,6,12),mat(ch.c,{roughness:theme.lavaSea?.6:.15,emissive:ch.e,emissiveIntensity:ch.i}),false);water.castShadow=false;
 const rockCol=theme.rockCol??0xc0643a;for(const d of [g.start-3,g.end+3])for(const side of [-1,1]){const p=sample(d,side*12).p;if(P.rock){const r=cloneProto(P.rock);applyTint(r,'StonePaint',rockCol);if(theme.rockTop)applyTint(r,'MossPaint',theme.rockTop);r.position.set(p.x,0,p.z);r.scale.set(2.2,2.8+Math.random(),2.2);world.add(r);}addObstacle(p.x,p.z,2.4);}
 // Warnschilder vor der Schlucht
 // R44: auf der Lava-Feste das Blender-Warnschild (Tafel mit Warndreieck und Lavawellen) statt der Textplakate
 for(const side of [-1,1]){const s=sample(g.start-70,side*12.8);if(theme.ember&&P.hazards){const sg=hzPart('HZ_Sign');sg.position.copy(s.p);sg.rotation.y=s.angle+Math.PI;sg.scale.setScalar(1.35);world.add(sg);addObstacle(s.p.x,s.p.z,.6);continue;}const w=new T.Group();w.position.copy(s.p);w.rotation.y=s.angle;world.add(w);box(w,cream,0,1.6,0,.22,3.2,.22);mesh(new T.PlaneGeometry(4.2,1.7),label((theme.chasm&&theme.chasm.label)||'SCHLUCHT! VOLLGAS','#ffd23f','#2b1d24',512,128),w,0,3.4,0);addObstacle(s.p.x,s.p.z,.4);}}}

// Geistervilla: die Strasse fuehrt mitten durch die Halle (Kollision an Waenden, Fluegeln und Tuermen)
// Bauwerke, durch die gefahren wird. Je Bauart: Ersatzfarbe (falls das Modell noch laedt),
// Kollider und die Sperrzone, in der keine Deko stehen darf. Kollider stehen grundsaetzlich
// ausserhalb der Fahrbahn (Halbbreite 8,9 m) - alles, was hineinragt, laesst Karts haengen.
// spiegel: Reihen der Form [x, zVon, zBis, Schritt, Radius] werden links und rechts gesetzt.
const BUILDINGS={
 mansion:{col:0x2a2240,half:17,zone:36,
  rows:[[12.3,-15,15,2,1.3],[15,-13,13,3.5,2],[17.6,-13,13,3.5,1.4]],
  single:[[-21.5,-6,3.6],[21,9,2.8]]},
 castle:{col:0x3a2a28,half:19,zone:40,
  rows:[[12.7,-11,11,2,1.5],[25.5,-9,9,3,2.4],[10.9,-6,6,6,.95]],
  single:[[-27.5,13,5.6],[27.5,-13,5.6],[-13.6,18,1.9],[13.6,18,1.9]],
  wings:true},
 // R53 Neuschwanstein (art/r53/create_schloss.py): Durchfahrten innen |x| < 10,6 m, Hofmauern ab 11,5 m,
 // dahinter massive Fluegel, Tuerme und der Felssockel bis ~40 m neben der Mitte
 schloss:{col:0xe8e2d4,half:25,zone:46,
  rows:[[12,-24,24,2,1.3],[16.5,-23,23,3.5,2.6],[21.5,-23,23,3.5,2.6],[27,-24,24,4,3],[33,-22,22,5,4]],
  single:[[-23,-30,3.5],[23,-30,3.5],[-23,30,3.5],[23,30,3.5]]},
 // R53: Tore aus den Teile-Dateien (file/part): Pfosten bei |x| 12 bzw. 13,2 m, Strebepfeiler bis 4,2 m tief
 wiesngate:{file:'wiesn',part:'WS_Gate',col:0x1a73e8,half:5,zone:15,single:[[-12,0,1.1],[12,0,1.1]]},
 gothgate:{file:'gothic',part:'GT_Gate',col:0x3a3442,half:7,zone:20,rows:[[13.4,-2.4,2.4,2.4,2.5]],single:[[-13.4,-4,1.2],[13.4,-4,1.2],[-13.4,4,1.2],[13.4,4,1.2]]},
 neongate:{col:0x1a1730,half:14,zone:28,
  rows:[[14.2,-3.2,3.2,3.2,2.5],[16.4,-2,2,4,1.5]],
  single:[[-19.5,0,1.6],[19.5,0,1.6]]},
 roottree:{col:0x3a2a1c,half:15,zone:30,
  rows:[[15.2,-7,7,2.4,4.7],[21.5,-8,8,5.5,2.1]],
  single:[[-23,2,2.4],[23,-2.5,2.4]]}};
function buildMansion(){
 const list=[];
 if(course.mansion!==undefined)list.push([course.mansion,'mansion']);
 if(course.castle!==undefined)list.push([course.castle,'castle']);
 for(const b of course.builds||[])list.push(b);
 for(const [cp,kind] of list)placeBuilding(cp,kind);}
function placeBuilding(cp,kind){const B=BUILDINGS[kind];if(!B)return;
 const proto=B.part?P[B.file]?.getObjectByName(B.part):P[kind],d=straightSpot(cp,30,30,60),s=sample(d,0),g=proto?cloneProto(proto):new T.Group();
 if(proto&&B.part)g.position.set(0,0,0);
 if(!proto){for(const sx of [-1,1])box(g,mat(B.col),sx*17,9,0,10,18,26);box(g,mat(B.col),0,17,0,28,6,26);}
 // Wiesn-Tor: Schrift auf der Tafel (vorn und hinten)
 if(proto&&kind==='wiesngate')for(const zf of [.2,-.2]){const sg=mesh(new T.PlaneGeometry(9.9,2.1),label('PILZ-WIESN','#fffbe8','#1a5fd0',512,110),g,0,12.6,zf);sg.castShadow=false;if(zf<0)sg.rotation.y=Math.PI;}
 g.position.copy(s.p);g.rotation.y=s.angle;world.add(g);g.updateMatrixWorld(true);
 const v=new T.Vector3(),ob=(x,z,r)=>{v.set(x,0,z).applyMatrix4(g.matrixWorld);addObstacle(v.x,v.z,r);};
 for(const [x,z0,z1,st,r] of B.rows||[])for(const sx of [-1,1])for(let z=z0;z<=z1+1e-6;z+=st)ob(sx*x,z,r);
 for(const [x,z,r] of B.single||[])ob(x,z,r);
 if(B.wings)for(const sx of [-1,1])for(let x=28;x<=50;x+=4)ob(sx*x,0,4.4);
 if(kind==='schloss'&&P.rock)for(const [x,z,sc,ry] of SCHLOSS_ROCKS)for(const sx of [-1,1]){const r=cloneProto(P.rock);applyTint(r,'StonePaint',0x9a958c);r.position.set(sx*x,-.6,z);r.rotation.y=ry*sx;r.scale.set(sc,sc*.8,sc);g.add(r);}
 zones.push({d,half:B.half,x:s.p.x,z:s.p.z,r:B.zone});}
// Felssockel des Schlosses: [x, z, Groesse, Drehung] in Gebaeudekoordinaten, links und rechts gespiegelt
const SCHLOSS_ROCKS=[[30,-19,2.6,.4],[34,-5,3.2,1.3],[32,10,2.9,2.2],[29,23,2.4,.9],[24,-30,1.9,2.7],[23,30,1.8,1.8],[39,18,2.2,.2],[38,-16,2,1.1]];
// Wiesnland: Pilzring um den Pilzberg und Haine auf der Wiese - gebuendelt (Instanzen) statt einzeln
function owScenery(random){const offRoad=(x,z,m)=>{const d=projectGlobal(x,z),q=sample(d);return Math.hypot(q.p.x-x,q.p.z-z)>m;};
 for(let i=0;i<16;i++){const a=i/16*TAU+random()*.3,rr=38+random()*46,x=Math.cos(a)*rr,z=Math.sin(a)*rr;mushroom(x,z,2.6+random()*4,theme.caps[i%theme.caps.length]);addObstacle(x,z,2.4);}
 for(let g=0;g<12;g++){const a=random()*TAU,rr=110+random()*300,cx=Math.cos(a)*rr,cz=Math.sin(a)*rr;
  for(let i=0;i<9;i++){const x=cx+(random()-.5)*44,z=cz+(random()-.5)*44;if(zones.some(q=>Math.hypot(q.x-x,q.z-z)<q.r+6)||Math.hypot(x,z)<95||!offRoad(x,z,16))continue;
   if(random()<.65){tree(x,z,1.4+random()*1.6,theme.caps[i%theme.caps.length]);}else mushroom(x,z,1.5+random()*2.5,theme.caps[i%theme.caps.length]);addObstacle(x,z,1.2);}}}
// R57: groesser (Nutzerhinweis "wirkt zu klein") und etwas weiter suedlich, frei vom Pilzring um den Pilzberg
const ARENA={x:0,z:-205,r:85};
function buildScenery(random){if(course.openWorld)zones.push({d:NaN,half:0,x:ARENA.x,z:ARENA.z,r:ARENA.r+26});batch=new Map();buildSceneryInner(random);if(course.openWorld)owScenery(random);forkIslandDecor();for(const b of batch.values())scatterColored(b.proto,b.list,'CapPaint',b.tint,120,.028);batch=null;buildGrass(random);}
// Eine Instanz-Gruppe je Modell statt je Farbe: Lackfarbe pro Instanz (instanceColor), Leuchten wird per Shader mit eingefaerbt
const tintEmissive=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n#ifdef USE_COLOR\ntotalEmissiveRadiance *= vColor.rgb;\n#endif');};
let swayCache=new Map();
// Baeume und Pilze wiegen sich im Wind: Versatz waechst mit der Hoehe, Phase aus der Instanzposition
function swayMat(m,amp){const key=m.uuid+'|'+amp;let c=swayCache.get(key);if(c)return c;c=m.clone();const prev=c.onBeforeCompile;
 c.onBeforeCompile=sh=>{if(prev)prev(sh);sh.uniforms.uTime=shaderTime;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nvec3 wp=instanceMatrix[3].xyz;float ws=sin(uTime*.85+wp.x*.06+wp.z*.08)*'+amp+'+sin(uTime*1.6+wp.z*.11)*'+(amp*.4).toFixed(4)+';\ntransformed.x+=ws*transformed.y;transformed.z+=ws*.55*transformed.y;\n#endif');};
 c.customProgramCacheKey=()=>'sway'+amp+(prev?'_p':'');swayCache.set(key,c);return c;}
function scatterColored(proto,list,paint,glow,chunk,sway=0){if(!proto||!list.length)return;const cells=new Map();for(const t of list){const k=Math.floor(t.x/chunk)+','+Math.floor(t.z/chunk);let c=cells.get(k);if(!c)cells.set(k,c=[]);c.push(t);}
 const srcs=[];proto.traverse(o=>{if(o.isMesh&&!Array.isArray(o.material))srcs.push(o);});const paintMats=new Map();
 for(const cell of cells.values())for(const src of srcs){let material=src.material;const isPaint=material.name===paint;
  if(isPaint){material=paintMats.get(src)||material.clone();if(!paintMats.has(src)){material.color.set(0xffffff);if(glow){material.emissive=new T.Color(0xffffff);material.emissiveIntensity=glow;material.onBeforeCompile=tintEmissive;material.customProgramCacheKey=()=>'tintEmissive';}paintMats.set(src,material);}}
  if(sway)material=swayMat(material,sway);
  const im=new T.InstancedMesh(src.geometry,material,cell.length);im.castShadow=true;im.receiveShadow=true;
  cell.forEach((t,i)=>{_e.set(0,t.ry||0,0);_q.setFromEuler(_e);_m.compose(_v.set(t.x,t.y||0,t.z),_q,_s.set(t.s,t.s,t.s));im.setMatrixAt(i,_m);if(isPaint)im.setColorAt(i,_col.setHex(t.col));});world.add(im);}}
const GRASS={choco:[0xd94a8a,0xfff0d0],beach:[0x7a9a4a,0xd6d08a],dome:[0x4a5a32,0x8a9a58],forest:[0x2f8a2a,0x9be25a],fair:[0x2f8a3a,0xb6f06a],canyon:[0x9a6a2a,0xf0c878],night:[0x14505a,0x44d6c8],haunted:[0x2e3c26,0x7f8f58],lava:[0x3a2a26,0x8a4424]};
function buildGrass(random){if(course.theme==='fortress'||course.theme==='ice')return;const [c0,c1]=GRASS[course.theme]||GRASS.forest,a=new T.Color(c0),b=new T.Color(c1),pos=[],col=[];
 for(let k=0;k<4;k++){const ang=k/4*Math.PI+.3,cx=Math.cos(ang)*.28,cz=Math.sin(ang)*.28,h=.55+(k%2)*.25;pos.push(-cx,0,-cz,cx,0,cz,cx*.15,h,cz*.15);col.push(a.r,a.g,a.b,a.r,a.g,a.b,b.r,b.g,b.b);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('color',new T.Float32BufferAttribute(col,3));geo.computeVertexNormals();
 const matG=stdMat({vertexColors:true,side:T.DoubleSide,roughness:1}),cells=new Map();
 // Gras wiegt sich im Wind (Instanz-Position als Phase)
 matG.onBeforeCompile=sh=>{sh.uniforms.uTime=shaderTime;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nvec3 gp=instanceMatrix[3].xyz;float sw=sin(uTime*1.7+gp.x*.11+gp.z*.15)*.22+sin(uTime*3.1+gp.z*.23)*.08;transformed.x+=sw*transformed.y;transformed.z+=sw*.55*transformed.y;\n#endif');};
 for(let i=0;i<1800*DENS;i++){const d=random()*length,side=random()<.5?-1:1,off=side*(11.8+Math.pow(random(),1.6)*14);if(inGap(d)||inZone(d,20)||forkRoadNear(d,off,7.5)||inBridge(d)||inTunnel(d))continue;const s=samplePos(d,off,_sp),y=Math.max(0,s.y-(Math.abs(off)-8.9)/1.5);const key=Math.floor(s.x/120)+','+Math.floor(s.z/120);let c=cells.get(key);if(!c)cells.set(key,c=[]);c.push([s.x,y,s.z,.7+random()*.9,random()*TAU]);}
 for(const list of cells.values()){const im=new T.InstancedMesh(geo,matG,list.length);list.forEach(([x,y,z,sc,ry],i)=>{_e.set(0,ry,0);_q.setFromEuler(_e);_m.compose(_v.set(x,y,z),_q,_s.set(sc,sc*(.8+((i*37)%7)/14),sc));im.setMatrixAt(i,_m);});im.castShadow=false;im.receiveShadow=true;world.add(im);}}
// Riesenrad (R38, Blender): Wahrzeichen der Magnet-Kirmes. Eine GLB, drei Teile ueber die
// Materialnamen: Gestell (gebacken), Rad (WheelPaint/WheelLights, dreht um die Nabe in 24 m Hoehe)
// und die Gondel-Vorlage (GondolaPaint/GondolaTrim, Aufhaengepunkt im Ursprung). Zwoelf Gondeln als
// Instanzen, die immer senkrecht haengen. Steht im Innenfeld mit Blick zur Start-Ziel-Geraden.
const FERRIS={hub:24,r:20,n:12,wheel:new Set(['WheelPaint','WheelLights']),gond:new Set(['GondolaPaint','GondolaTrim'])};
function buildFerris(clear){const src=P.ferriswheel;if(!src)return;
 let spot=null;for(const [x,z] of [[10,-6],[-14,-22],[24,-30],[-30,8],[0,-40],[34,10],[-40,-30]])if(clear(x,z,30)){spot=[x,z];break;}
 if(!spot)return;const [fx,fz]=spot,start=sample(0).p,g=new T.Group(),wheel=new T.Group();
 g.position.set(fx,0,fz);g.rotation.y=Math.atan2(start.x-fx,start.z-fz);world.add(g);
 wheel.position.y=FERRIS.hub;g.add(wheel);const gond=[];
 src.traverse(o=>{if(!o.isMesh||Array.isArray(o.material))return;const n=o.material.name;
  if(FERRIS.wheel.has(n)){const m=new T.Mesh(o.geometry.clone().translate(0,-FERRIS.hub,0),n==='WheelLights'?o.material.clone():o.material);m.castShadow=n!=='WheelLights';wheel.add(m);if(n==='WheelLights')wheel.userData.lights=m.material;}
  else if(FERRIS.gond.has(n))gond.push(o);
  else{const m=new T.Mesh(o.geometry,o.material);m.castShadow=true;m.receiveShadow=true;g.add(m);}});
 // Gondeln: je Material eine Instanz-Gruppe, der Pilzhut bekommt die Kirmesfarben
 const insts=gond.map(o=>{let m=o.material;if(m.name==='GondolaPaint'){m=m.clone();m.color.set(0xffffff);}
  const im=new T.InstancedMesh(o.geometry,m,FERRIS.n);im.instanceMatrix.setUsage(T.DynamicDrawUsage);im.castShadow=true;im.frustumCulled=false;
  if(o.material.name==='GondolaPaint')for(let i=0;i<FERRIS.n;i++)im.setColorAt(i,_col.setHex(theme.caps[i%theme.caps.length]));
  g.add(im);return im;});
 // Kollision: Plattform und A-Boecke (die Plattform steht fern der Fahrbahn, trotzdem sauber)
 g.updateMatrixWorld(true);const v=new T.Vector3();for(const [x,z,r] of [[0,0,6],[-9,0,4],[9,0,4],[-9.5,-3.4,2.2]]){v.set(x,0,z).applyMatrix4(g.matrixWorld);addObstacle(v.x,v.z,r);}
 zones.push({d:projectGlobal(fx,fz),half:0,x:fx,z:fz,r:28});
 ferris={g,wheel,insts,rot:0};updateFerris(0,0);}
function updateFerris(dt,now){const f=ferris;if(!f)return;f.rot+=dt*.075;f.wheel.rotation.z=f.rot;
 for(let i=0;i<FERRIS.n;i++){const a=f.rot+i*TAU/FERRIS.n;_m.makeTranslation(Math.cos(a)*FERRIS.r,FERRIS.hub+Math.sin(a)*FERRIS.r,0);for(const im of f.insts)im.setMatrixAt(i,_m);}
 for(const im of f.insts)im.instanceMatrix.needsUpdate=true;
 const L=f.wheel.userData.lights;if(L)L.emissiveIntensity=1.6+.6*Math.sin(now*.004);}
function buildSceneryInner(random){const th=course.theme,glow=theme.glow;
 const clear=(x,z,min)=>{if(trainFx&&trainFx.pts.some(p=>Math.abs(p[0]-x)<9&&Math.abs(p[1]-z)<9))return false;const d=projectGlobal(x,z),s=sample(d);return Math.hypot(s.p.x-x,s.p.z-z)>(inTunnel(d)?Math.max(min,22):min)+Math.max(0,s.p.y)*1.6&&zones.every(q=>Math.hypot(q.x-x,q.z-z)>q.r)&&!nearFork(x,z,min+8);};
 if((th==='forest'||th==='night')&&P.hazards&&!course.openWorld){const pp=hzPart('HZ_Pipe'),list=[];for(let i=0;i<Math.round(14*AK);i++){const x=(random()-.5)*340*WK,z=(random()-.5)*320*WK;if(Math.hypot(x,z)>180*WK||!clear(x,z,16))continue;
  for(let k=0;k<3;k++){const a=random()*TAU,rr=k?2.6+random()*1.2:0,px=x+Math.cos(a)*rr,pz=z+Math.sin(a)*rr,sy=.6+random()*1.1;list.push({x:px,z:pz,y:0,s:1.05,sy,ry:random()*TAU});addObstacle(px,pz,1.5);}}scatterInstanced(pp,list,{PipePaint:glow?0x2de2e6:0x2aa84a},120);}
 // Riesenrad zuerst: seine Sperrzone haelt Baeume und Riesenpilze aus dem Blickfeld
 if(th==='fair'||course.wiesn?.ferris)buildFerris(clear);
 if(th==='forest'||th==='night'||th==='fair'){
  for(let i=0;i<Math.round(190*AK);i++){const x=(random()-.5)*360*WK,z=(random()-.5)*330*WK;if(Math.hypot(x,z)>186*WK||!clear(x,z,15))continue;const s=1+random()*2.3;
   if(i%3===0){mushroom(x,z,s,theme.caps[i%theme.caps.length],0,glow&&th!=='fair'?.9:0);addObstacle(x,z,.55*s);}else{tree(x,z,s*.8,theme.leaves[i%theme.leaves.length]);addObstacle(x,z,.55*s*.8);}}
  if(P.rock){const rocks=[];for(let i=0;i<Math.round(30*AK);i++){const x=(random()-.5)*360*WK,z=(random()-.5)*320*WK;if(Math.hypot(x,z)>182*WK||!clear(x,z,13))continue;const s=.6+random()*2.2,sx=.7+random()*.6;rocks.push({x,z,s,sx,ry:random()*TAU});addObstacle(x,z,1.1*s*sx);}scatterInstanced(P.rock,rocks,null,140);}
  const landmarks=th==='night'?[[0,0,6.5,0xff3cac],[30,10,3.6,0x2de2e6],[-30,-10,4.2,0x9d6bff]]:[[10,5,6.5,0xe8352e],[34,14,3.4,0xf5a623],[-28,-12,4,0x8e5bd9]];
  for(const [x,z,s,c] of landmarks)if(clear(x,z,12)){mushroom(x,z,s,c,0,glow&&th!=='fair'?1.1:0);addObstacle(x,z,.55*s);}
  // Blumen (forest) bzw. Leuchtsteine (night) am Wegesrand fuer Farbe
  const n=Math.round((th==='night'?260:520)*DENS),flowers=new T.InstancedMesh(new T.IcosahedronGeometry(.28,0),stdMat({color:0xffffff,roughness:.6,...(glow?{emissive:0xffffff,emissiveIntensity:.7}:{})}),n),c=new T.Color(),m=new T.Matrix4(),palette=th==='night'?[0x2de2e6,0xff3cac,0xfff05a]:[0xff4d6d,0xffd23f,0xffffff,0xa66bff,0xff8a3d];
  for(let i=0;i<n;i++){const d=random()*length,off=(random()<.5?-1:1)*(11+random()*22),s=sample(d,off);if(inGap(d)||forkRoadNear(d,off,7.5)||inTunnel(d)){m.makeScale(0,0,0);}else m.compose(new T.Vector3(s.p.x,Math.max(0,s.p.y-(Math.abs(off)-8.9)/1.5)+.15,s.p.z),new T.Quaternion(),new T.Vector3(1,.6,1).multiplyScalar(.7+random()*.8));flowers.setMatrixAt(i,m);flowers.setColorAt(i,c.setHex(palette[i%palette.length]));}
  flowers.castShadow=false;world.add(flowers);}
 if(th==='haunted'){
  for(let i=0;i<Math.round(130*AK);i++){const x=(random()-.5)*360*WK,z=(random()-.5)*330*WK;if(Math.hypot(x,z)>186*WK||!clear(x,z,15))continue;const s=1+random()*2;
   if(i%4===0){mushroom(x,z,s*.9,theme.caps[i%theme.caps.length],0,.8);addObstacle(x,z,.5*s);}else{tree(x,z,s*.85,theme.leaves[i%theme.leaves.length]);addObstacle(x,z,.5*s*.85);}}
  if(P.gravestone){const graves=[];for(let k=0;k<7;k++){const cx=(random()-.5)*300*WK,cz=(random()-.5)*280*WK;for(let i=0;i<16;i++){const x=cx+(i%4)*3.4-5+random(),z=cz+Math.floor(i/4)*3.6-6+random();if(Math.hypot(x,z)>184*WK||!clear(x,z,13))continue;graves.push({x,z,s:1.1+random()*.5,ry:(random()-.5)*.6+k*.9});addObstacle(x,z,.8);}}scatterInstanced(P.gravestone,graves,null,80);}
  if(P.pumpkin){const pk=[];for(let i=0;i<Math.round(80*AK);i++){const d=random()*length,side=random()<.5?-1:1,off=side*(13+random()*6),s=sample(d,off);if(inZone(d,22)||inGap(d)||forkBlocks(d,off)||inBridge(d)||inTunnel(d))continue;pk.push({x:s.p.x,y:Math.max(0,s.p.y-(Math.abs(off)-8.9)/1.5),z:s.p.z,s:.9+random()*1.1,ry:Math.atan2(-s.t.z*side,s.t.x*side)});addObstacle(s.p.x,s.p.z,.8);}scatterInstanced(P.pumpkin,pk,null,80);}
  const batGeo=new T.BufferGeometry();batGeo.setAttribute('position',new T.Float32BufferAttribute([0,0,0,-1.3,.4,-.25,-.55,0,.35,0,0,0,.55,0,.35,1.3,.4,-.25],3));batGeo.computeVertexNormals();
  bats=new T.InstancedMesh(batGeo,new T.MeshBasicMaterial({color:0x08060e,side:T.DoubleSide}),28);bats.frustumCulled=false;world.add(bats);}
 if(th==='rainbow'){
  // Schwebende Kristallinseln und Sternenstaub statt Landschaft
  const crystal=mergeGeometries([new T.ConeGeometry(3,9,6).translate(0,4.5,0),new T.ConeGeometry(3,4,6).rotateZ(Math.PI).translate(0,-2,0)]);
  const cols=[0xff4fa3,0x4fd8ff,0xffe45c,0x8affc8,0x8a5cff];
  for(let c=0;c<5;c++){const list=[];
   for(let i=0;i<26;i++){const a=random()*TAU,r=(110+random()*150)*WK,x=Math.cos(a)*r,z=Math.sin(a)*r;
    if(!clear(x,z,26))continue;list.push({x,y:-20-random()*55,z,s:.8+random()*2.6,ry:random()*TAU});}
   if(!list.length)continue;
   const im=new T.InstancedMesh(crystal,stdMat({color:cols[c],emissive:cols[c],emissiveIntensity:.5,roughness:.35,flatShading:true}),list.length);
   const m4=new T.Matrix4();list.forEach((t,i)=>{m4.compose(new T.Vector3(t.x,t.y,t.z),new T.Quaternion().setFromEuler(new T.Euler(0,t.ry,0)),new T.Vector3(t.s,t.s*1.6,t.s));im.setMatrixAt(i,m4);});
   im.castShadow=false;world.add(im);}
  // Sternenstaub, der langsam nach oben zieht
  {const n=340,pos=new Float32Array(n*3),ph=new Float32Array(n);
   for(let i=0;i<n;i++){const d=random()*length,s=sample(d,(random()-.5)*90);pos[i*3]=s.p.x;pos[i*3+1]=s.p.y-25+random()*50;pos[i*3+2]=s.p.z;ph[i]=random()*TAU;}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('phase',new T.BufferAttribute(ph,1));
   fireflies=new T.Points(g,new T.ShaderMaterial({uniforms:{uTime:shaderTime},transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    vertexShader:'uniform float uTime;attribute float phase;varying float vA;void main(){vec3 p=position+vec3(sin(uTime*.4+phase)*3.,mod(uTime*2.+phase*9.,40.)-20.,cos(uTime*.35+phase)*3.);vA=.5+.5*sin(uTime*2.+phase*5.);vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp(160./-mv.z,1.5,7.);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'varying float vA;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(1.,.95,1.,(1.-smoothstep(.1,.5,d))*vA*.8);}'}));
   fireflies.frustumCulled=false;world.add(fireflies);}}
 if(th==='lava'){
  // Basaltnadeln, Lavaseen und Vulkane am Horizont
  if(P.rock){const rocks=[];for(let i=0;i<Math.round(80*AK);i++){const x=(random()-.5)*360*WK,z=(random()-.5)*330*WK;if(Math.hypot(x,z)>185*WK||!clear(x,z,14))continue;const s=1.1+random()*2.3,sy=1.4+random()*3.4;rocks.push({x,z,s,sy,sx:.8+random()*.5,ry:random()*TAU});addObstacle(x,z,1.1*s);}scatterInstanced(P.rock,rocks,{StonePaint:0x2e2226},130);}
  {const pool=new T.CircleGeometry(1,16).rotateX(-Math.PI/2),pm=new T.InstancedMesh(pool,new T.MeshBasicMaterial({color:0xff5a18}),70),m=new T.Matrix4();
   for(let i=0;i<Math.round(70*AK);i++){const x=(random()-.5)*360*WK,z=(random()-.5)*330*WK,r=4+random()*12;
    if(Math.hypot(x,z)>178*WK||!clear(x,z,r+14))m.makeScale(0,0,0);else m.compose(new T.Vector3(x,.12,z),new T.Quaternion(),new T.Vector3(r,1,r*(.6+random()*.7)));pm.setMatrixAt(i,m);}
   pm.castShadow=false;pm.receiveShadow=false;world.add(pm);}
  {const gs=[[],[]];for(let i=0;i<13;i++){const a=i/13*TAU+random()*.3,r=(246+random()*70)*WK,rad=20+random()*26,h=36+random()*48,x=Math.cos(a)*r,z=Math.sin(a)*r;
    gs[i%2].push(new T.CylinderGeometry(rad*.3,rad,h,7).translate(x,h/2-8,z));}
   [theme.hills[0],theme.hills[1]].forEach((c,i)=>world.add(new T.Mesh(mergeGeometries(gs[i]),mat(c,{flatShading:true,roughness:1}))));}
  {const n=300,pos=new Float32Array(n*3),ph=new Float32Array(n);for(let i=0;i<n;i++){const d=random()*length,s=sample(d,(random()-.5)*70);pos[i*3]=s.p.x;pos[i*3+1]=Math.max(0,s.p.y);pos[i*3+2]=s.p.z;ph[i]=random()*TAU;}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('phase',new T.BufferAttribute(ph,1));
   fireflies=new T.Points(g,new T.ShaderMaterial({uniforms:{uTime:shaderTime},transparent:true,depthWrite:false,blending:T.AdditiveBlending,vertexShader:'uniform float uTime;attribute float phase;varying float vA;void main(){float t=mod(uTime*.55+phase,6.2831);vec3 p=position+vec3(sin(uTime*.6+phase)*2.5,t*3.4,cos(uTime*.5+phase*1.7)*2.5);vA=1.-t/6.2831;vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp(150./-mv.z,1.5,7.);gl_Position=projectionMatrix*mv;}',fragmentShader:'varying float vA;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(1.,.55,.18,(1.-smoothstep(.1,.5,d))*vA*.8);}'}));
   fireflies.frustumCulled=false;world.add(fireflies);}}
 if(th==='canyon'){
  // Felsnadeln & Kakteen auf der Insel, Tafelberge am Horizont
  if(P.rock){const rocks=[];for(let i=0;i<Math.round(60*AK);i++){const x=(random()-.5)*360*WK,z=(random()-.5)*330*WK;if(Math.hypot(x,z)>185*WK||!clear(x,z,14))continue;const s=1.2+random()*2.4,sy=1.5+random()*3;rocks.push({x,z,s,sy,sx:.8+random()*.5,ry:random()*TAU});addObstacle(x,z,1.2*s);}scatterInstanced(P.rock,rocks,{StonePaint:0xc0643a,MossPaint:0xe8a15a},140);}
  const cactusGeo=mergeGeometries([new T.CylinderGeometry(.45,.5,4.2,8).translate(0,2.1,0),new T.CylinderGeometry(.3,.3,1.6,8).rotateZ(Math.PI/2).translate(.9,2,0),new T.CylinderGeometry(.28,.28,1.5,8).translate(1.55,2.6,0),new T.CylinderGeometry(.26,.26,1.2,8).rotateZ(Math.PI/2).translate(-.8,2.8,0),new T.CylinderGeometry(.25,.25,1.1,8).translate(-1.3,3.25,0)]);
  const cacti=[];for(let i=0;i<Math.round(70*AK);i++){const x=(random()-.5)*360*WK,z=(random()-.5)*330*WK;if(Math.hypot(x,z)>186*WK||!clear(x,z,13))continue;cacti.push([x,z,.8+random()*.8,random()*TAU]);addObstacle(x,z,.7);}
  const cm=new T.InstancedMesh(cactusGeo,mat(0x4f8a3a,{roughness:.7}),cacti.length),m=new T.Matrix4();cacti.forEach(([x,z,s,r],i)=>{m.compose(new T.Vector3(x,0,z),new T.Quaternion().setFromEuler(new T.Euler(0,r,0)),new T.Vector3(s,s,s));cm.setMatrixAt(i,m);});cm.castShadow=true;world.add(cm);
  for(let i=0;i<Math.round(18*AK);i++){const x=(random()-.5)*330*WK,z=(random()-.5)*300*WK;if(Math.hypot(x,z)>180*WK||!clear(x,z,16)||i%2)continue;mushroom(x,z,1.2+random()*1.5,theme.caps[i%theme.caps.length]);addObstacle(x,z,.8);}
  {const gs=[[],[],[]];for(let i=0;i<14;i++){const a=i/14*TAU+random()*.2,r=(240+random()*60)*WK,rad=18+random()*26,h=26+random()*40,x=Math.cos(a)*r,z=Math.sin(a)*r;gs[i%2].push(new T.CylinderGeometry(rad*.8,rad,h,7).translate(x,h/2-8,z));gs[2].push(new T.CylinderGeometry(rad*.82,rad*.8,3,7).translate(x,h-6.5,z));}
  [theme.hills[0],theme.hills[1],0xe9a060].forEach((c,i)=>world.add(new T.Mesh(mergeGeometries(gs[i]),mat(c,{flatShading:true,roughness:1}))));}}
 if(th==='beach'||th==='ice'||th==='dome')r60Scenery(random,clear);
 if(th!=='canyon'&&th!=='lava'&&th!=='rainbow'&&th!=='ice'&&th!=='dome'){const gs=[[],[]];for(let i=0;i<16;i++){const a=i/16*TAU,r=(228+random()*70)*WK;gs[i%2].push(new T.SphereGeometry(1,16,12).scale(25+random()*25,(28+random()*34)*(theme.beach?.5:1),24+random()*15).translate(Math.cos(a)*r,theme.beach?-6:-4,Math.sin(a)*r));}gs.forEach((g,i)=>{const h=new T.Mesh(mergeGeometries(g),mat(theme.hills[i]));h.receiveShadow=true;world.add(h);});}
 // R44: Comic-Wolken aus Blender (drei Formen mit flachem Boden, instanziert, Unterseite kuehl schattiert); Fallback Kugel-Haufen
 const cgeo=P.clouds?[0,1,2].map(v=>P.clouds.getObjectByName('CL_Cloud'+v)?.geometry).filter(Boolean):[];
 const cloudInst=(list,material)=>cgeo.forEach((g,v)=>{const l=list.filter(c=>c.v%cgeo.length===v);if(!l.length)return;const im=new T.InstancedMesh(g,material,l.length);
  l.forEach((c,i)=>{_e.set(0,c.ry,0);_q.setFromEuler(_e);_m.compose(_v.set(c.x,c.y,c.z),_q,_s.set(c.s,c.s*c.sy,c.s*c.sz));im.setMatrixAt(i,_m);});world.add(im);});
 if(theme.clouds){const list=[];for(let i=0;i<Math.round(15*WK);i++){const cx=(random()-.5)*420*WK,cy=60+random()*40,cz=(random()-.5)*350*WK;list.push({x:cx,y:cy,z:cz,s:1+((i*37)%10)/26,sy:1,sz:1,ry:(i*2.39)%TAU,v:i});}
  if(cgeo.length)cloudInst(list,stdMat({color:0xffffff,roughness:1,vertexColors:true,emissive:0xe8f0ff,emissiveIntensity:.2}));
  else{const gs=[];for(const c of list)for(let k=0;k<4;k++)gs.push(new T.SphereGeometry(1,12,8).scale(5,3.5,3).translate(c.x+k*4-6,c.y+Math.sin(k)*2,c.z));world.add(new T.Mesh(mergeGeometries(gs),white));}}
 // Wetter-Wolken: Canyon bekommt Abendrot, Lava-Feste Glutwolken - flache Haufen, ein Aufruf je Thema
 if(theme.cloudCols){const cm=stdMat({color:theme.cloudCols[0],roughness:1,emissive:theme.cloudCols[1],emissiveIntensity:.38,vertexColors:cgeo.length>0}),gs=[],list=[];
  for(let i=0;i<Math.round(14*WK);i++){const cx=(random()-.5)*460*WK,cy=78+random()*52,cz=(random()-.5)*380*WK,w=8+random()*8;list.push({x:cx,y:cy,z:cz,s:w/5,sy:.32,sz:.9,ry:(i*1.77)%TAU,v:i});
   if(!cgeo.length)for(let k=0;k<4;k++)gs.push(new T.SphereGeometry(1,10,7).scale(w*(k===1||k===2?.72:1),2.3,w*.5).translate(cx+k*w*.62-w,cy+(k===1?1.4:0),cz+(k%2?1.3:-1.3)));}
  if(cgeo.length)cloudInst(list,cm);else world.add(new T.Mesh(mergeGeometries(gs),cm));}
 if(P.balloon)for(let i=0;i<theme.balloons;i++){const a=i/Math.max(1,theme.balloons)*TAU+random(),r=90+random()*60,g=cloneProto(P.balloon);applyTint(g,'CapPaint',[0xed6350,0xffd45c,0x55bdb2,0xa688dc][i]);g.position.set(Math.cos(a)*r,30+random()*20,Math.sin(a)*r);world.add(g);balloons.push({g,base:g.position.y,ph:random()*TAU});}
 if(th==='night'||th==='haunted'||th==='fair'){
  // Laternen entlang der Strecke + Gluehwuermchen (Shader-Partikel)
  const lampGeo=new T.CylinderGeometry(.12,.16,4,6).translate(0,2,0),bulbGeo=new T.SphereGeometry(.45,10,8).translate(0,4.2,0),posts=[];for(let d=10;d<length;d+=38){if(inGap(d)||inZone(d,6)||inTunnel(d))continue;const side=Math.round(d/38)%2?1:-1;if(forkBlocks(d,side*12.6))continue;const s=sample(d,side*12.6);posts.push([s.p.x,groundAt(d,side*12.6).y-.3,s.p.z,side]);addObstacle(s.p.x,s.p.z,.4);}
  const pm=new T.InstancedMesh(lampGeo,mat(0x2a2f5a),posts.length),bm=new T.InstancedMesh(bulbGeo,stdMat({color:0xffffff,emissive:0xffffff,emissiveIntensity:1.4}),posts.length),m=new T.Matrix4(),c=new T.Color();posts.forEach(([x,y,z,side],i)=>{m.makeTranslation(x,y,z);pm.setMatrixAt(i,m);bm.setMatrixAt(i,m);bm.setColorAt(i,c.setHex(th==='haunted'?(side>0?0x9dff7a:0xb48cff):th==='fair'?(side>0?0xffe45c:0xff3b6b):side>0?0x2de2e6:0xff3cac));});world.add(pm,bm);
  const n=420,pos=new Float32Array(n*3),ph=new Float32Array(n);for(let i=0;i<n;i++){const d=random()*length,s=sample(d,(random()-.5)*60);pos[i*3]=s.p.x;pos[i*3+1]=Math.max(0,s.p.y)+.8+random()*5;pos[i*3+2]=s.p.z;ph[i]=random()*TAU;}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('phase',new T.BufferAttribute(ph,1));
  fireflies=new T.Points(g,new T.ShaderMaterial({uniforms:{uTime:shaderTime},transparent:true,depthWrite:false,blending:T.AdditiveBlending,vertexShader:'uniform float uTime;attribute float phase;varying float vA;void main(){vec3 p=position+vec3(sin(uTime*.7+phase)*1.5,sin(uTime*1.3+phase*2.)*.8,cos(uTime*.6+phase)*1.5);vec4 mv=modelViewMatrix*vec4(p,1.);vA=.55+.45*sin(uTime*3.+phase*5.);gl_PointSize=clamp(180./-mv.z,2.,14.);gl_Position=projectionMatrix*mv;}',fragmentShader:'varying float vA;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(vec3(.75,1.,.45)*(1.-smoothstep(.1,.5,d))*vA,1.);}'}));fireflies.frustumCulled=false;world.add(fireflies);}
 if(th==='canyon'){const n=220,pos=new Float32Array(n*3),ph=new Float32Array(n);for(let i=0;i<n;i++){pos[i*3]=(random()-.5)*360*WK;pos[i*3+1]=1+random()*14;pos[i*3+2]=(random()-.5)*330*WK;ph[i]=random()*TAU;}const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('phase',new T.BufferAttribute(ph,1));
  fireflies=new T.Points(g,new T.ShaderMaterial({uniforms:{uTime:shaderTime},transparent:true,depthWrite:false,vertexShader:'uniform float uTime;attribute float phase;void main(){vec3 p=position+vec3(mod(uTime*6.+phase*40.,80.)-40.,sin(uTime+phase)*1.,sin(uTime*.5+phase)*3.);vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp(220./-mv.z,1.5,9.);gl_Position=projectionMatrix*mv;}',fragmentShader:'void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(1.,.82,.6,(1.-smoothstep(.15,.5,d))*.45);}'}));fireflies.frustumCulled=false;world.add(fireflies);}}

function chevronTex(dir){return canvasTex(128,64,(q,w,h)=>{q.fillStyle=theme.glow?'#1a1030':'#d7263d';q.fillRect(0,0,w,h);q.strokeStyle=theme.chev||(theme.glow?(course.theme==='haunted'?'#9dff7a':'#2de2e6'):'#ffffff');q.lineWidth=11;q.lineJoin='round';for(const x of [30,64,98]){q.beginPath();q.moveTo(x-dir*12,10);q.lineTo(x+dir*12,32);q.lineTo(x-dir*12,54);q.stroke();}});}
function buildChevrons(){const texL=chevronTex(-1),texR=chevronTex(1),mk=t=>stdMat({map:t,roughness:.6,...(theme.glow?{emissive:0xffffff,emissiveMap:t,emissiveIntensity:.9}:{})}),mL=mk(texL),mR=mk(texR),geo=new T.PlaneGeometry(2.6,1.3),post=new T.CylinderGeometry(.08,.08,1.6,6);
 const bl=[],br=[],posts=[];let last=-99;for(let d=0;d<length;d+=3){const k=trackAt(d).kap;if(Math.abs(k)<1/30||inGap(d)||inZone(d,10)||d-last<45)continue;let apex=d,km=Math.abs(k);for(let s=d;s<d+40;s+=2){const kk=Math.abs(trackAt(s).kap);if(kk>km){km=kk;apex=s;}}last=apex;const left=trackAt(apex).kap>0,side=left?-1:1;
  for(const o of [-9,0,9]){if(forkBlocks(apex+o,side*12.8)||inTunnel(apex+o))continue;const s=sample(apex+o,side*12.8),M4=new T.Matrix4().makeRotationY(s.angle+Math.PI).setPosition(s.p.x,groundAt(apex+o,side*12.8).y-.1,s.p.z);(left?bl:br).push(geo.clone().translate(0,2,0).applyMatrix4(M4));posts.push(post.clone().translate(0,.8,0).applyMatrix4(M4));addObstacle(s.p.x,s.p.z,.5);}}
 if(bl.length)world.add(new T.Mesh(mergeGeometries(bl),mL));if(br.length)world.add(new T.Mesh(mergeGeometries(br),mR));if(posts.length)world.add(new T.Mesh(mergeGeometries(posts),dark));}
function windRingModel(){
 const root=P.windring?cloneProto(P.windring):new T.Mesh(new T.TorusGeometry(3.2,.13,8,48),mat(0x8aead6,{name:'WindGlow',emissive:0x42d8be,emissiveIntensity:.55,roughness:.5}));
 const glow=[];root.traverse(o=>{if(!o.isMesh)return;o.castShadow=false;o.receiveShadow=false;
  if(o.material.name==='WindGlow'){o.material=o.material.clone();o.material.emissive.setHex(0x42d8be);o.material.emissiveIntensity=.55;glow.push(o.material);}});
 return {root,glow};}
// R57: Rampen vor Luecken ueber die ganze befahrbare Breite inkl. Randstreifen (vorher 13 m: wer nach dem Looping am Rand
// ankam, fuhr an der Rampe vorbei in den Wassergraben)
function buildRamps(){const list=course.ramps.map(([v,off,w])=>({d:straightSpot(v,35,85),off,w}));for(const g of gaps)list.push({d:lapDist(g.start-RAMP_LEN/2-.4),off:0,w:SHOULDER*2+.6,gap:true});
 for(const {d,off,w,gap} of list){const r={d,off,w,start:d-RAMP_LEN/2,end:d+RAMP_LEN/2,gap};ramps.push(r);const s=sample(d,off);let g;if(P.ramp){g=cloneProto(P.ramp);g.scale.set(w/6.4,1,RAMP_LEN/4.8);if(gap)applyTint(g,'RampPaint',0xffd23f);}else{g=new T.Group();const m=mesh(new T.BoxGeometry(w,.2,RAMP_LEN),mat(0xed6350),g,0,RAMP_H/2,0);m.rotation.x=-Math.atan(RAMP_H/RAMP_LEN);}g.position.copy(s.p);g.rotation.order='YXZ';g.rotation.set(Math.atan(slopeAt(d)),s.angle+Math.PI,s.bank);world.add(g);
  if(gap)continue;
  const rd=r.end+12,rs=sample(rd,off),art=windRingModel(),ring=art.root;ring.position.copy(rs.p);ring.position.y+=3.8;ring.rotation.order='YXZ';ring.rotation.y=rs.angle+Math.PI;world.add(ring);rings.push({d:lapDist(rd),off,y:ring.position.y,mesh:ring,glow:art.glow,flash:0,precision:false});}}
function buildPads(){for(const [v,off] of course.pads){const d=straightSpot(v,20,55,70),s=sample(d,off);let g;if(P.bouncepad)g=cloneProto(P.bouncepad);else{g=new T.Group();sphere(g,mat(0xed6350),0,.2,0,1.75,.34,1.75);}g.position.copy(s.p);g.rotation.y=s.angle;world.add(g);pads.push({d,off,mesh:g,squash:0});}}
// Pendel-Pilze (Neon): schwingen quer ueber die Strecke, Timing statt Glueck.
// Pendelnde Hindernisse gehoeren nicht in eine Rollzone: dort bildet der Querversatz auf die
// Hoehe ab, das Pendel steht dann in x/z still auf der Mittellinie - also genau auf der
// Ideallinie - waehrend die Kollision weiter flach rechnet. Deshalb aus der Zone schieben.
function outOfRoll(d){if(!agrav.length)return d;
 for(let i=0;i<40&&hasRoll(d);i++)d=lapDist(d+8);
 return lapDist(d+14);}
function buildSwingers(){for(const [v,amp,spd,ph] of course.swing||[]){const d=outOfRoll(cpDist(v));let g;
 if(theme.ember){g=new T.Group();g.add(new T.Mesh(new T.IcosahedronGeometry(1.15,1),new T.MeshBasicMaterial({color:0xffe08a})));
  const halo=new T.Mesh(new T.IcosahedronGeometry(1.75,0),new T.MeshBasicMaterial({color:0xff5a1f,transparent:true,opacity:.55,depthWrite:false}));g.add(halo);
  const tail=new T.Mesh(new T.ConeGeometry(.9,2.6,8),new T.MeshBasicMaterial({color:0xff8a2a,transparent:true,opacity:.35,depthWrite:false}));tail.rotation.x=Math.PI/2;tail.position.z=-1.4;g.add(tail);world.add(g);}
 else{g=P.mushroom?cloneProto(P.mushroom):new T.Group();if(P.mushroom)applyTint(g,'CapPaint',0xff3cac,{emissiveColor:0xff3cac,emissiveIntensity:1.2});else sphere(g,mat(0xff3cac),0,2.6,0,1.6,.75,1.6);world.add(g);}
 g.scale.setScalar(theme.ember?1.5:1.7);const sw={d,amp,spd,ph,mesh:g,x:0,z:0,fire:!!theme.ember};swingers.push(sw);
 // R44: Feuerkoenig-Statue neben der Bahn spuckt den Feuerball quer ueber die Strecke (Seiten abwechselnd)
 if(sw.fire){sw.side=swingers.filter(q=>q.fire).length%2?1:-1;const st=hzPart('HZ_Statue');if(st){applyTint(st,'StonePaint',0x8a8078);const p=samplePos(d,sw.side*(ROAD_HALF+9),new T.Vector3()),c=samplePos(d,0,_sp);st.position.copy(p);st.rotation.y=Math.atan2(c.x-p.x,c.z-p.z);world.add(st);addObstacle(p.x,p.z,4.2);sw.statue=st;}}}
 for(const [v,amp,spd,ph] of course.ghosts||[]){let d=outOfRoll(cpDist(v));for(const r of [...ramps,...pads])if(Math.abs(wrapDiff(d,r.d))<32)d=lapDist(r.d+42);let g;if(P.ghost){g=cloneProto(P.ghost);g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.88;}});}else{g=new T.Group();sphere(g,mat(0xeef3ff,{emissive:0x9fb4ff,emissiveIntensity:.4}),0,1.7,0,1);}
  g.scale.setScalar(1.2);world.add(g);swingers.push({d,amp,spd,ph,mesh:g,x:0,z:0,y:0,kind:'ghost'});}}
function buildSpores(){const add=(d,off,lift)=>{if(inGap(d))return;const p=sample(d,off).p;spores.push({d:lapDist(d),off,x:p.x,z:p.z,y:p.y+lift,cd:0,ph:spores.length*.7});};
 // Sporen-Linien auf der Ideallinie der Kurven: wer sauber faehrt, sammelt sie
 for(let k=0;k<10;k++){const d0=length*((k+.35)/10);if(ramps.some(r=>Math.abs(wrapDiff(d0,r.d))<30)||inGap(d0))continue;const kap=trackAt(d0+10).kap,off=clamp(kap*120,-5,5)||Math.sin(k*2.1)*4;for(let i=0;i<5;i++)add(d0+i*4,off,1);}
 for(const r of ramps)if(!r.gap)[[5,2.4],[9,3.3],[13,3]].forEach(([dd,l])=>add(r.end+dd,r.off,l+RAMP_H));
 for(const f of forks)for(let rel=f.span*.3;rel<f.span*.7;rel+=5)add(f.dA+rel,f.offT[Math.round(rel)],1);
 // R52 Halfpipe: eine Reihe Sporen 2,4 m ueber jeder Lippe - nur wer wirklich abhebt, sammelt sie (auf dem Weg hinauf
 // und wieder hinunter). Aufgesammelt wird flach (Querversatz ueber der Lippe = Flughoehe), gezeigt an der Stelle im Bild.
 for(const z of hpipes)for(const sg of [1,-1])for(let x=z.span*.3;x<=z.span*.72;x+=6){const d=lapDist(z.s+x),g=groundAt(d,0).y,off=sg*(HP.flat+HP.R*Math.PI/2+2.4),p=posAt(d,off,-.3,new T.Vector3());
  spores.push({d,off,x:p.x,z:p.z,y:g+.8,px:p.x,py:p.y,pz:p.z,cd:0,ph:spores.length*.7});}
 // R44: Sporenmuenze aus Blender (assets/coin.glb, gepraegter Pilz) statt gelbem Ikosaeder
 let cg=null,cm=null;P.coin?.traverse(o=>{if(o.isMesh&&!cg){cg=o.geometry;cm=o.material;}});
 const m=cm||stdMat({color:0xfff27a,emissive:0xffb627,emissiveIntensity:1.2,roughness:.35,flatShading:true});sporeMesh=new T.InstancedMesh(cg||new T.IcosahedronGeometry(.45,0),m,Math.max(1,spores.length));sporeMesh.instanceMatrix.setUsage(T.DynamicDrawUsage);sporeMesh.castShadow=false;world.add(sporeMesh);}
// Tribuene aus drei Segmenten in einer Reihe: ein einzelnes Modell ist nur rund 16 m lang und
// wirkt neben der Start-Gerade verloren. Die Segmente stehen entlang der Strecke (lokales X).
const STAND_SEG=16.2;
function buildStands(){if(!P.grandstand||!course.stands)return;const fans=[],v=new T.Vector3();
 for(const [cp,off] of course.stands){const d=cpDist(cp),s=sample(d,off),tp=sample(d,0).p;
  const ry=Math.atan2(tp.x-s.p.x,tp.z-s.p.z),rx=Math.cos(ry),rz=-Math.sin(ry);
  for(const seg of [-STAND_SEG,0,STAND_SEG]){
   const g=cloneProto(P.grandstand);g.position.set(s.p.x+rx*seg,0,s.p.z+rz*seg);g.rotation.y=ry;world.add(g);g.updateMatrixWorld(true);
   for(let k=-8;k<=8;k+=4){v.set(k,0,-1.5).applyMatrix4(g.matrixWorld);addObstacle(v.x,v.z,2.8);}
   for(let row=0;row<4;row++)for(let i=0;i<18;i++){v.set(-8.1+i*.95,.45+row*.75+.16,-(row*1.1-.2)).applyMatrix4(g.matrixWorld);
    fans.push({x:v.x,y:v.y,z:v.z,ry:ry+(Math.sin(i*7.3+row)*.35),ph:(i*1.7+row*2.3+seg)%TAU,d,col:FAN_COLS[(row*7+i*3+(seg>0?2:seg<0?4:0))%FAN_COLS.length]});}}}
 if(!P.spectator||!fans.length)return;const insts=[];P.spectator.traverse(o=>{if(!o.isMesh)return;const im=new T.InstancedMesh(o.geometry,o.material,fans.length);im.instanceMatrix.setUsage(T.DynamicDrawUsage);im.castShadow=false;if(o.material.name==='FanCap'){const c=new T.Color();fans.forEach((f,i)=>im.setColorAt(i,c.setHex(f.col)));}world.add(im);insts.push(im);});crowd={fans,insts};updateCrowd(0);}
const _m=new T.Matrix4(),_q=new T.Quaternion(),_e=new T.Euler(),_s=new T.Vector3(),_v=new T.Vector3();
function updateCrowd(now){if(!crowd)return;const p=racers[0],party=state==='finished'||state==='ceremony';crowd.fans.forEach((f,i)=>{const cheer=party||(p&&Math.abs(wrapDiff(p.distance,f.d))<75);const y=f.y+(cheer?Math.abs(Math.sin(now*.011+f.ph))*.45:Math.sin(now*.003+f.ph)*.03);_e.set(0,f.ry,cheer?Math.sin(now*.02+f.ph)*.12:0);_q.setFromEuler(_e);_m.compose(_v.set(f.x,y,f.z),_q,_s.set(1.5,1.5,1.5));for(const im of crowd.insts)im.setMatrixAt(i,_m);});for(const im of crowd.insts)im.instanceMatrix.needsUpdate=true;}
function updateSpores(dt,now){if(!sporeMesh)return;spores.forEach((s,i)=>{if(s.cd>0)s.cd-=dt;const vis=s.cd<=0?1:0;_e.set(0,now*.0034+s.ph,0);_q.setFromEuler(_e);_m.compose(_v.set(s.px??s.x,(s.py??s.y)+Math.sin(now*.004+s.ph)*.18,s.pz??s.z),_q,_s.set(vis,vis,vis));sporeMesh.setMatrixAt(i,_m);});sporeMesh.instanceMatrix.needsUpdate=true;}
// ---------------------------------------------------------------- R44: Hindernisse aus art/r44/create_hazards.py
// Stampfer (stampft im Takt auf eine Spur), Roehren mit Schnappblumen am Rand, Roehrenkanone mit Kugelblitzen.
// Die Feuerkoenig-Statuen entstehen in buildSwingers (je Feuerball eine Statue, von der er ausgespuckt wird).
function hzPart(n){const o=P.hazards?.getObjectByName(n);if(!o)return null;const c=o.clone(true);c.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true;}});return c;}
let HZ_SHADOW=null;
function buildHazards(){hz={stampers:[],plants:[],cannons:[],missiles:[]};
 // R57 Graben-Flug: Festungs-Laser - Geschuetze weiter vorn feuern leuchtende Salven auf festen Spuren entgegen
 // (Ausweichen durch Lenken, in der Luft ohne Hoehenpruefung wie die Flugringe); im Festungs-Alarm schneller
 (course.lasers||[]).forEach(([v],i)=>{const c={d:cpDist(v),off:0,g:null,next:0,k:i*2,pool:[],laser:true,side:i%2?1:-1};c.tur=fzTurret(c);hz.cannons.push(c);});
 hz.waves=(course.fighters||[]).map(([v])=>({d:cpDist(v),on:false,cd:0,ships:[0,1,2].map(i=>({g:fzShip(),lane:[-4.5,0,4.5][i]}))}));
 hz.obs=buildTrenchObs();
 if(!P.hazards)return;
 if(!HZ_SHADOW)HZ_SHADOW={geo:new T.PlaneGeometry(4.6,3.6).rotateX(-Math.PI/2),mat:new T.MeshBasicMaterial({color:0x05030a,transparent:true,opacity:.3,depthWrite:false})};
 // R54 Wiesn Kart: Stampfer ist ein Hau-den-Lukas-Holzhammer, die Roehre ein Bierfass, die Pflanze eine Fliegenfalle
 const stoneCol=course.theme==='lava'?0x6a3a24:theme.space?0x7a5ab0:0x8a5a32;
 for(const [v,off,ph=0] of course.stampers||[]){const d=cpDist(v),g=hzPart('HZ_Stamper');if(!g)break;applyTint(g,'StonePaint',stoneCol);const p=samplePos(d,off,new T.Vector3());g.position.copy(p);g.rotation.y=sample(d).angle;world.add(g);
  const sh=new T.Mesh(HZ_SHADOW.geo,HZ_SHADOW.mat.clone());sh.position.set(p.x,p.y+.06,p.z);sh.rotation.y=g.rotation.y;sh.renderOrder=2;world.add(sh);
  hz.stampers.push({d,off,ph,g,base:p.y,sh,was:'up',st:null});}
 const pipeCol=theme.glow?0x3a6fc8:0x8a5a30,plantCol=theme.glow?0x7dff6a:0x4caf3a;
 for(const [v,side,plant=1] of course.pipes||[]){const d=cpDist(v),off=side*(ROAD_HALF+5.3),g=hzPart('HZ_Pipe');if(!g)break;applyTint(g,'PipePaint',pipeCol);const p=samplePos(d,off,new T.Vector3());g.position.copy(p);world.add(g);addObstacle(p.x,p.z,1.7);
  if(!plant)continue;const root=new T.Group(),lean=new T.Group(),stem=hzPart('HZ_PlantStem'),top=hzPart('HZ_PlantJawTop'),bot=hzPart('HZ_PlantJawBot');
  for(const q of [top,bot])applyTint(q,'PlantPaint',plantCol);lean.add(stem,top,bot);root.add(lean);root.position.set(p.x,p.y+3.2,p.z);world.add(root);
  hz.plants.push({d,off,side,root,lean,top,bot,x:p.x,y:p.y+3.2,z:p.z,cd:0,lunge:0,ph:d*.37,head:new T.Vector3()});}
 // R44: Burgturm der Lava-Feste - Hochstrasse windet sich an ihm hinauf, oben Mauerdurchbruch und Kanonen-Portal
 const tw=P.tower;for(const [v] of course.towers||[]){const d=cpDist(v),tr=tw?.getObjectByName('LT_Tower');if(!tr)break;const inside=trackAt(d).kap>0?1:-1,p=samplePos(d,inside*(9.4+2+13.8),new T.Vector3()),g=tr.clone(true);g.position.set(p.x,0,p.z);g.rotation.y=sample(d).angle;g.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true;}});world.add(g);addObstacle(p.x,p.z,14.5);zones.push({d,half:0,x:p.x,z:p.z,r:24});}
 for(const [v,side,over] of course.cannons||[]){const d=cpDist(v),g=hzPart('HZ_Cannon');if(!g)break;
  // "ueber der Bahn": Kanone auf einem Steinportal mitten ueber der Strasse, frontal gegen die anfahrenden Karts
  if(over){const p=samplePos(d,0,new T.Vector3()),ang=sample(d).angle,gt=tw?.getObjectByName('LT_Gantry')?.clone(true);if(gt){gt.position.copy(p);gt.rotation.y=ang;world.add(gt);for(const sx of [-1,1]){const q=samplePos(d,sx*9.6,_hzv);addObstacle(q.x,q.z,1.4);}}
   g.position.set(p.x,p.y+11.4,p.z);g.rotation.y=ang+Math.PI;g.scale.setScalar(1.35);world.add(g);hz.cannons.push({d,off:0,g,next:0,k:0,pool:[],over:true});continue;}
  const off=side*(ROAD_HALF+6),p=samplePos(d,off,new T.Vector3());g.position.copy(p);g.rotation.y=sample(d).angle+Math.PI;g.scale.setScalar(1.35);world.add(g);addObstacle(p.x,p.z,2.6);
  hz.cannons.push({d,off:off*.86,g,next:0,k:0,pool:[]});}}
const _hzv=new T.Vector3();
function hzMissile(c){let m=c.pool.find(q=>!q.live);if(!m){const g=hzPart('HZ_Missile');if(!g)return null;g.scale.setScalar(1.25);world.add(g);m={g,live:false};c.pool.push(m);}
 m.live=true;m.t0=elapsed;m.lane=cannonLane(c.k++);m.g.visible=true;hz.missiles.push(m);m.c=c;return m;}
function hzBoom(x,y,z,col=0xffa53d,n=14){for(let i=0;i<n;i++){const a=Math.random()*TAU;emit(x,y,z,col,Math.sin(a)*6,2+Math.random()*4,Math.cos(a)*6,.5);}}
function updateHazards(dt,t=elapsed,live=true){if(!hz)return;const pl=racers[0];
 for(const s of hz.stampers){const st=stamperState(t,s.ph);s.st=st;s.g.position.y=s.base+st.y;s.g.rotation.z=st.phase==='up'&&st.warn>.7?Math.sin(t*46)*.035*(st.warn-.7)/.3:0;
  s.sh.material.opacity=.12+.45*(st.phase==='fall'?1:st.phase==='up'?st.warn*st.warn:.25);
  if(st.phase==='down'&&s.was!=='down'&&live){const p=s.g.position;for(let i=0;i<10;i++){const a=Math.random()*TAU;emit(p.x+Math.sin(a)*2.4,s.base+.3,p.z+Math.cos(a)*2.4,theme.space?0xd8ccff:0xb9a58a,Math.sin(a)*5,1+Math.random()*2,Math.cos(a)*5,.55);}
   if(pl){const dd=Math.hypot(pl.x-p.x,pl.z-p.z);if(dd<34){SFX.bump(Math.max(.3,1-dd/34));if(dd<20)shake=Math.max(shake,.35*(1-dd/20));}}}
  s.was=st.phase;}
 for(const f of hz.plants){let tgt=null,best=11;if(live)for(const r of racers){const dd=Math.hypot(r.x-f.x,r.z-f.z);if(dd<best){best=dd;tgt=r;}}
  const want=tgt?Math.atan2(tgt.x-f.x,tgt.z-f.z):f.root.rotation.y+Math.sin(t*.7+f.ph)*.01;f.root.rotation.y+=angleDiff(want,f.root.rotation.y)*Math.min(1,dt*5);
  f.cd=Math.max(0,f.cd-dt);const go=tgt&&best<8.5&&f.cd<=0;f.lunge=Math.max(0,Math.min(1,f.lunge+(go?dt*5:-dt*2.2)));if(f.lunge>=1&&go)f.cd=1.3;
  const open=f.lunge>0?.55*Math.sin(Math.min(1,f.lunge)*Math.PI):.12+.1*Math.sin(t*3+f.ph);f.lean.rotation.x=f.lunge*.95+Math.sin(t*1.3+f.ph)*.05;f.top.rotation.x=-open;f.bot.rotation.x=open*.5;
  f.head.set(0,2.3,.1).applyMatrix4(f.lean.matrixWorld);}
 if(!live)return;
 for(const w of hz.waves||[])waveTick(w,t);
 trenchObsTick(t);
 for(const c of hz.cannons){if(c.laser){if(!c.tur&&P.fortress)c.tur=fzTurret(c);if(c.tur)turretAim(c,dt);laserFire(c,t);continue;}const near=racers.some(r=>{const ahead=wrapDiff(c.d,r.distance);return ahead>0&&ahead<170;});if(near&&t>=c.next){c.next=t+CANNON.gap;const m=hzMissile(c);if(m&&pl&&Math.hypot(pl.x-c.g.position.x,pl.z-c.g.position.z)<90)SFX.shell();}}
 for(let i=hz.missiles.length-1;i>=0;i--){const m=hz.missiles[i],c=m.c;if(m.laser){if(!laserFly(m,t))hz.missiles.splice(i,1);continue;}const mp=missileAt(t-m.t0,c.off,m.lane),d=c.d-mp.back;
  if(!mp.alive){const p=m.g.position;hzBoom(p.x,p.y,p.z,0x9aa0ad,8);m.live=false;m.g.visible=false;hz.missiles.splice(i,1);continue;}
  const p=samplePos(d,mp.off,_hzv),k=c.over?Math.min(1,mp.back/30):1,hy=c.over?(1-k*k*(3-2*k))*14.8:0;m.g.position.set(p.x,p.y+1.35+hy,p.z);m.g.rotation.set(c.over?-(1-k)*.45:0,sample(d).angle+Math.PI,Math.sin((t-m.t0)*9)*.12);m.d=d;m.off=mp.off;m.hy=hy;}}
// ---------------------------------------------------------------- R59 Graben-Hindernisse (Graben-Flug)
// Sperrwand: Stahlplatten ueber die ganze Grabenbreite mit einer Luecke (Warnstreifen, rote Lampen). Schleusentor: die
// Luecke wandert hin und her. Laservorhang: waagrechte Strahlen im Takt, vorher blinken die Sender orange.
// Abluftschacht (Finale): kleiner leuchtender Ring - genau hindurch gibt es einen grossen Turbo und Feuerwerk.
const obsGap=(o,t)=>o.k==='gate'?Math.sin(t*TAU/o.per+o.ph)*o.amp:o.g;
function buildTrenchObs(){const L=course.trenchObs;if(!L)return [];const Wd=TRENCH_W,out=[];
 const steel=stdMat({color:0x3a404c,metalness:.6,roughness:.42}),red=new T.MeshBasicMaterial({color:0xff3a2a,toneMapped:false});
 const stripe=new T.MeshStandardMaterial({map:canvasTex(64,256,(q,w,h)=>{q.fillStyle='#ffc21a';q.fillRect(0,0,w,h);q.fillStyle='#161616';for(let y=-w;y<h;y+=48){q.beginPath();q.moveTo(0,y);q.lineTo(w,y+w);q.lineTo(w,y+w+22);q.lineTo(0,y+22);q.fill();}}),roughness:.6});
 const beamMat=new T.MeshBasicMaterial({color:0xff2a2a,transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
 const warnMat=new T.MeshBasicMaterial({color:0xff9a1a,toneMapped:false}),portMat=new T.MeshBasicMaterial({color:0xffa53d,toneMapped:false});
 L.forEach(([v,k,a,b,c],i)=>{const d=cpDist(v),g=new T.Group(),P=posAt(d,0,1.3,new T.Vector3());g.position.copy(P);g.rotation.y=sample(d).angle;world.add(g);
  const o={i,k,d,g,hit:0};
  const panel=(x0,x1,parent)=>{const w=Math.max(.1,x1-x0),m=mesh(new T.BoxGeometry(w,13,.7),steel,parent,(x0+x1)/2,3.2,0);m.castShadow=false;return m;};
  const edge=(x,parent)=>{mesh(new T.BoxGeometry(.55,13,.8),stripe,parent,x,3.2,0);mesh(new T.SphereGeometry(.28,10,8),red,parent,x,9.9,.3);};
  if(k==='wall'){o.g=a;o.w=b;panel(-Wd,a-b/2,g);panel(a+b/2,Wd,g);edge(a-b/2,g);edge(a+b/2,g);}
  else if(k==='gate'){o.amp=a;o.per=b;o.w=6;o.ph=i*1.3;o.L=new T.Group();o.R=new T.Group();g.add(o.L,o.R);panel(-2*Wd,0,o.L);edge(0,o.L);panel(0,2*Wd,o.R);edge(0,o.R);}
  else if(k==='laser'){o.per=a;o.on=b;o.ph=c||0;o.beams=[];o.em=[];
   for(const sx of [-1,1])o.em.push(mesh(new T.BoxGeometry(.6,8,.9),steel,g,sx*(Wd-.3),2.6,0));
   o.warn=[-1,1].map(sx=>mesh(new T.BoxGeometry(.25,7.4,.95),warnMat,g,sx*(Wd-.62),2.6,0));
   for(const y of [-1.1,.9,2.9,4.9])o.beams.push(mesh(new T.CylinderGeometry(.09,.09,Wd*2-.8,6).rotateZ(Math.PI/2),beamMat,g,0,y,0));}
  else if(k==='port'){const ring=mesh(new T.TorusGeometry(2.4,.32,10,32),portMat,g,0,0,0);ring.castShadow=false;const back=mesh(new T.CircleGeometry(2.2,28),new T.MeshBasicMaterial({color:0x100808}),g,0,0,-3);back.rotation.y=Math.PI;
   const sign=mesh(new T.PlaneGeometry(6.4,1.1),label('ABLUFTSCHACHT · MITTEN REIN!','#ff9a1a','#1a1010',768,130),g,0,6.6,.4);sign.castShadow=false;o.ring=ring;}
  out.push(o);});
 return out;}
function trenchObsTick(t){for(const o of hz.obs||[]){
 if(o.k==='gate'){const gc=obsGap(o,t);o.L.position.x=gc-o.w/2;o.R.position.x=gc+o.w/2;}
 else if(o.k==='laser'){const ph=((t+o.ph)%o.per)/o.per,on=ph<o.on,warn=!on&&ph>.82;o.live=on;for(const b of o.beams)b.visible=on;for(const w of o.warn)w.visible=on||(warn&&Math.sin(t*40)>0);}
 else if(o.k==='port'&&o.ring){o.ring.rotation.z=t*1.5;o.ring.scale.setScalar(1+Math.sin(t*6)*.05);}}}
function trenchObsHit(r,me){for(const o of hz.obs){if(Math.abs(wrapDiff(r.distance,o.d))>1.5)continue;r.obsCd??={};if((r.obsCd[o.i]||0)>elapsed)continue;
 if(o.k==='port'){r.obsCd[o.i]=elapsed+2;if(Math.abs(r.offset)<2.4){r.boost=Math.max(r.boost,me?2.8:1.4);burst(r,0xffa53d,34);if(me){toast('VOLLTREFFER! 🎯 SCHACHT-TURBO',1.8,'good');flashScreen(.45);SFX.boom?.();SFX.cheer?.();shake=Math.max(shake,.5);}}continue;}
 let hit=false,dir=0;
 if(o.k==='laser'){hit=!!o.live;}
 else{const gc=obsGap(o,elapsed),half=o.w/2-.9;if(Math.abs(r.offset-gc)>half){hit=true;dir=Math.sign(gc-r.offset);}}
 if(!hit)continue;r.obsCd[o.i]=elapsed+1.2;hitKart(r,0,me?.55:.8);
 if(dir){const a=sample(r.distance).angle,qx=Math.cos(a),qz=-Math.sin(a);r.vx+=qx*dir*9;r.vz+=qz*dir*9;}
 burst(r,o.k==='laser'?0xff3a2a:0xffc21a,14);if(me){SFX.bump(.8);shake=Math.max(shake,.4);toast(o.k==='laser'?'LASERVORHANG!':o.k==='gate'?'SCHLEUSENTOR!':'SPERRWAND!',.9,'bad');}}}
// R57 Graben-Flug-Gegner (art/r57/create_fortress.py): Geschuetztuerme am Grabenrand zielen auf den Spieler und feuern
// die Festungs-Laser; Brezn-Jaeger-Staffeln stuerzen sich vorn in den Graben, feuern entgegen und ziehen ueber den
// Spieler hinweg hoch (eigene Entwuerfe, keine Filmvorlagen)
const FORT={warn:230,speed:36,pull:34};
function fzClone(n){const o=P.fortress?.getObjectByName(n);if(!o)return null;const c=o.clone(true);c.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=false;}});return c;}
function fzTurret(c){const base=fzClone('FZ_TurretBase'),head=fzClone('FZ_TurretHead');if(!base||!head)return null;
 const g=new T.Group(),p=samplePos(c.d,c.side*(TRENCH_W+3.2),new T.Vector3(),TRENCH_H+trenchLift(c.d));g.position.copy(p);g.rotation.y=sample(c.d).angle;g.scale.setScalar(1.25);
 const pivot=head.position.clone();head.rotation.order='YXZ';g.add(base,head);world.add(g);return {g,head,pivot,kick:0};}
const _ta2=new T.Vector3(),_tb2=new T.Vector3();
function turretAim(c,dt){const tu=c.tur,pl=racers[0];if(!pl?.mesh)return;tu.head.getWorldPosition(_ta2);pl.mesh.getWorldPosition(_tb2);
 tu.g.worldToLocal(_tb2);tu.g.worldToLocal(_ta2);const dx=_tb2.x-_ta2.x,dy=_tb2.y-_ta2.y,dz=_tb2.z-_ta2.z;
 const yaw=Math.atan2(dx,dz),pitch=Math.atan2(-dy,Math.hypot(dx,dz));tu.head.rotation.y+=angleDiff(yaw,tu.head.rotation.y)*Math.min(1,dt*4);tu.head.rotation.x+=(clamp(pitch,-.2,1.1)-tu.head.rotation.x)*Math.min(1,dt*4);
 tu.kick=Math.max(0,tu.kick-dt*5);tu.head.position.copy(tu.pivot).addScaledVector(_ta2.set(Math.sin(tu.head.rotation.y),0,Math.cos(tu.head.rotation.y)),-tu.kick*.35);}
let fzFallback=null;
// kommt fortress.glb erst waehrend des Rennens an, werden Tuerme und Jaeger nachgeruestet (kein Neuaufbau im Rennen)
function fzShip(){let g=fzClone('FZ_Jaeger');if(!g){fzFallback??=new T.Mesh(new T.SphereGeometry(1,12,8),stdMat({color:0x2a2e38,metalness:.6,roughness:.4}));g=fzFallback.clone();g.userData.fb=true;}
 g.visible=false;g.scale.setScalar(1.55);g.rotation.order='YXZ';world.add(g);return g;}
function waveTick(w,t){const pl=racers[0];if(!pl)return;const ahead=wrapDiff(w.d,pl.distance);
 if(!w.on){if(state==='race'&&t>w.cd&&ahead>FORT.warn-40&&ahead<FORT.warn&&elemAt(pl.distance)?.kind==='flug'){w.on=true;w.t0=t;w.cd=t+9;for(const q of w.ships){if(q.g.userData.fb&&P.fortress){world.remove(q.g);q.g=fzShip();}q.g.visible=true;q.fired=0;q.pullT=undefined;}
   sfxNoise(1.1,300,2600,.07,1.2);sfxTone(240,90,1,'sawtooth',.018);}return;}
 const s=t-w.t0;let alive=false;
 w.ships.forEach((q,i)=>{const d=lapDist(w.d-FORT.speed*s+i*7),rel=wrapDiff(d,pl.distance);if(q.pullT===undefined&&rel<FORT.pull){q.pullT=s;if(nearPlayer(pl,60)){sfxNoise(.7,500,3400,.06,1.5);}}
  const dv=Math.min(1,s/1.4),e=dv*dv*(3-2*dv),pu=q.pullT===undefined?0:Math.min(1,(s-q.pullT)/1.2),weave=Math.sin(s*2.1+i*2)*1.3;
  const h=3.2+(1-e)*30+pu*pu*42,off=q.lane*(.4+.6*e)+weave;posAt(d,off,h,q.g.position);q.d=d;q.h=h;
  q.g.rotation.set((1-e)*.55-pu*.9,sample(d).angle+Math.PI,-weave*.25+Math.sin(s*3+i)*.1);
  if(q.pullT===undefined&&e>.9&&q.fired<1&&s>1.5+i*.25){q.fired++;fzShot(q,d,off,t);}
  if(pu<1&&s<8)alive=true;else q.g.visible=false;});
 if(!alive){w.on=false;for(const q of w.ships)q.g.visible=false;}}
// Salve eines Jaegers: fliegt mit Jaeger-Tempo plus Schuss nach vorn, faengt auf Hoehe des Jaegers an
function fzShot(q,d,off,t){const c=hz.cannons.find(x=>x.laser);if(c)laserFire(c,t,{d0:d,lane:clamp(off,-5.5,5.5),spd:FORT.speed+40,merge:14,side:0,h0:1.9});}
// R57 Festungs-Laser (Graben-Flug): Salve = heller Kern + additiver Schein, fliegt die Spur entlang den Karts entgegen
// Streifschuss statt Vollbremsung: im engen Graben staute sich sonst das ganze Feld hinter einem getroffenen Kart
const LASER={speed:46,range:150,gap:2.8,gapAlarm:1.8,lanes:[-4.5,0,4.5,-2.2,2.2,-5.5,5.5]};
let laserGeo=null,laserBall=null,laserMat=null,laserGlow=null;
// o: vorgegebene Salve (Jaeger), sonst feuert der Turm c nach Takt
function laserFire(c,t,o){if(!o&&(t<c.next||state!=='race'))return;const pl=racers[0];
 // nur wenn der Spieler anfliegt - die Salven sind fuer ihn da, weit entfernte Bots bleiben unbehelligt
 if(!o){const pa=pl?wrapDiff(c.d,pl.distance):-1;if(!(pa>35&&pa<230))return;
  c.next=t+((wxM?.alarm||0)>.3?LASER.gapAlarm:LASER.gap)*(.85+Math.random()*.3);}
 // frontal anfliegend liest sich eine leuchtende Kugel besser als ein Stab; der Schweif zeigt nach hinten (+z = Fahrtrichtung)
 if(!laserGeo){laserGeo=new T.CylinderGeometry(.05,.22,7.5,8).rotateX(Math.PI/2).translate(0,0,3.2);laserBall=new T.SphereGeometry(1,14,10);laserMat=new T.MeshBasicMaterial({color:0xffb3a0,toneMapped:false});
  laserGlow=new T.MeshBasicMaterial({color:0xff2a1a,transparent:true,opacity:.5,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});}
 let m=c.pool.find(q=>!q.live);if(!m){const g=new T.Group(),core=new T.Mesh(laserBall,laserMat),halo=new T.Mesh(laserBall,laserGlow),tail=new T.Mesh(laserGeo,laserGlow);core.scale.setScalar(.5);halo.scale.setScalar(1.25);tail.scale.set(3,3,1);g.add(core,halo,tail);g.traverse(o=>{o.castShadow=false;o.frustumCulled=false;});world.add(g);m={g,live:false,laser:true};c.pool.push(m);}
 // jede dritte Salve zielt auf die aktuelle Spur des naechsten Karts, sonst feste Spuren (lesbar, ausweichbar)
 if(o)Object.assign(m,{live:true,t0:t,c,d:undefined},o);else{
 const k=c.k++,tgt=racers.filter(r=>{const a=wrapDiff(c.d,r.distance);return a>35&&a<230;}).sort((a,b)=>wrapDiff(c.d,a.distance)-wrapDiff(c.d,b.distance))[0];
 m.lane=k%3===2&&tgt?clamp(tgt.offset,-5.5,5.5):LASER.lanes[k%LASER.lanes.length];Object.assign(m,{live:true,t0:t,c,d:undefined,d0:c.d,spd:LASER.speed,merge:34,side:c.side,h0:0});}m.g.visible=true;hz.missiles.push(m);
 const p=laserStart(m,m.d0,_hzv);if(!o&&c.tur)c.tur.kick=1;for(let i=0;i<6;i++){const a=Math.random()*TAU;emit(p.x,p.y,p.z,0xff6a4a,Math.sin(a)*3,Math.random()*2,Math.cos(a)*3,.3);}
 if(pl&&Math.abs(wrapDiff(m.d0,pl.distance))<160){const v=clamp(1-Math.abs(wrapDiff(m.d0,pl.distance))/160,.25,1);sfxTone(1900,260,.16,'square',.022*v);sfxTone(2600,420,.1,'sawtooth',.01*v,.015);}}
function laserOff(m){const p=m.g.position;hzBoom(p.x,p.y,p.z,0xff5a4a,8);m.live=false;m.g.visible=false;m.d=undefined;}
// Startpunkt einer Salve: Turm-Muendung am Grabenrand (side) oder die Hoehe des Jaegers (h0) ueber der Spur
const _lzA=new T.Vector3(),_lzB=new T.Vector3();
function laserStart(m,d,out){return m.side?samplePos(d,m.side*(TRENCH_W+1.6),out,TRENCH_H+2.8+trenchLift(d)):posAt(d,m.lane,1.3+m.h0,out);}
function laserFly(m,t){const run=(t-m.t0)*m.spd,d=lapDist(m.d0-run),z=elemAt(d);
 if(run>LASER.range||!z||z.kind!=='flug'){laserOff(m);return false;}
 const k=Math.min(1,run/m.merge),e=k*k*(3-2*k),a=laserStart(m,d,_lzA),b=posAt(d,m.lane,1.3,_lzB);m.g.position.lerpVectors(a,b,e);
 // Flugrichtung inkl. Sinkflug aus dem Turm: Blick auf den naechsten Punkt der Bahn
 const d2=lapDist(d-2),k2=Math.min(1,(run+2)/m.merge),e2=k2*k2*(3-2*k2);laserStart(m,d2,_lzA);posAt(d2,m.lane,1.3,_lzB);_lzA.lerp(_lzB,e2);m.g.lookAt(_lzA);m.g.rotateY(Math.PI);
 // treffen und ausweichen erst, wenn die Salve in der Flugspur angekommen ist
 if(e>.8){m.d=d;m.off=m.lane;}else m.d=undefined;return true;}
// Treffer und Kollision je Kart (Stampfer quetscht/sperrt, Schnappblume beisst, Kugelblitz explodiert)
function hazardHits(r,me){if(!hz)return;
 if(hz.obs?.length)trenchObsHit(r,me);
 for(const s of hz.stampers){const st=s.st;if(!st||!stamperBlocks(st))continue;const dd=wrapDiff(r.distance,s.d),doff=r.offset-s.off;if(Math.abs(dd)>STAMP.half+1.2||Math.abs(doff)>STAMP.half+1.3)continue;
  if(stamperCrushes(st)&&!((r.crushCd||0)>elapsed)){r.crushCd=elapsed+1.6;if(r.shield>0){r.shield=0;burst(r,0xffe263,12);continue;}hitKart(r,1.35,.12);flatten(r);loseSpores(r,2);if(me){stats.squashed++;SFX.hit();shake=.6;toast('PLATT WIE EINE FLUNDER! 📄',1.2,'bad');}}
  else{const p=s.g.position,dx=r.x-p.x,dz=r.z-p.z,dl=Math.hypot(dx,dz)||1,rr=3.3;if(dl<rr){r.x=p.x+dx/dl*rr;r.z=p.z+dz/dl*rr;bounce(r,dx/dl,dz/dl,true);}}}
 for(const f of hz.plants){if(f.lunge<.55)continue;const dx=r.x-f.head.x,dz=r.z-f.head.z;if(dx*dx+dz*dz>4.4||Math.abs((r.y||0)+.9-f.head.y)>2.6||(r.biteCd||0)>elapsed)continue;r.biteCd=elapsed+1.8;
  if(r.shield>0){r.shield=0;burst(r,0xffe263,10);continue;}hitKart(r,.95,.45);loseSpores(r,1);if(me){SFX.hit(.8);toast('GESCHNAPPT!',.9,'bad');}}
 for(let i=hz.missiles.length-1;i>=0;i--){const m=hz.missiles[i];if(m.laser){if(m.d===undefined||Math.abs(wrapDiff(r.distance,m.d))>2.4||Math.abs(r.offset-m.off)>1.6)continue;
   laserOff(m);hz.missiles.splice(i,1);if(r.shield>0){r.shield=0;burst(r,0xffe263,10);continue;}
   // ohne Betaeubung (die deckelt das Tempo auf 5 m/s und kostete im Flug Sekunden): nur Tempoverlust; Bots noch weniger,
   // sonst staut sich das 12er-Feld im engen Graben hinter jedem getroffenen Kart
   hitKart(r,0,me?.7:.85);burst(r,0xff5a4a,10);loseSpores(r,1);if(me){SFX.hit(.8);shake=.35;toast('LASERTREFFER!',.9,'bad');}continue;}
  if(m.d===undefined||(m.hy||0)>2.4)continue;if(Math.abs(wrapDiff(r.distance,m.d))>1.9||Math.abs(r.offset-m.off)>1.7||r.air&&r.y>3)continue;
  const p=m.g.position;hzBoom(p.x,p.y,p.z);m.live=false;m.g.visible=false;hz.missiles.splice(i,1);if(r.shield>0){r.shield=0;continue;}hitKart(r,1.15,.25);loseSpores(r,2);if(me){SFX.hit();shake=.5;toast('KUGELBLITZ!',.9,'bad');}}}
// ---------------------------------------------------------------- R44: Themen-Wahrzeichen (art/r44/create_landmarks.py)
// Pilz-Promenade: Maerchenschloss (Neuschwanstein-Stil) am Inselrand, Maibaeume, blau-weisse Wimpel.
// Neon-Pilzwald: Oktoberfest - Festzelt mit Leuchtschild, Maibaeume, Lebkuchenherzen und Brezeln als Neonschilder.
// Sonnen-Canyon: Dampf-Gueterzug auf einem Gleisring mit zwei Bahnuebergaengen ueber die Strasse.
function lmPart(n){const o=P.landmarks?.getObjectByName(n);if(!o)return null;const c=o.clone(true);c.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true;}});return c;}
function lmAt(g,d,off,scale=1){const s=sample(d,off),c=sample(d,0).p;g.position.set(s.p.x,Math.max(0,groundAt(d,off).y),s.p.z);g.rotation.y=Math.atan2(c.x-s.p.x,c.z-s.p.z);g.scale.setScalar(scale);world.add(g);return s.p;}
// freie Stelle am Inselrand (moeglichst weit weg von Strecke und Zonen) fuer grosse Wahrzeichen
function rimSpot(minTrack,rad){let best=null;for(let a=0;a<TAU;a+=TAU/72){const x=Math.cos(a)*rad,z=Math.sin(a)*rad,d=projectGlobal(x,z),q=sample(d).p,dist=Math.hypot(q.x-x,q.z-z);if(dist<minTrack||zones.some(zn=>Math.hypot(zn.x-x,zn.z-z)<zn.r+30))continue;if(!best||dist>best.dist)best={x,z,dist};}return best;}
let trainFx=null;
function buildLandmarks(){trainFx=null;if(!P.landmarks)return;const L=course.landmarks||{};
 if(L.castle){const sp=rimSpot(70,158*WK);if(sp){const g=lmPart('LM_Castle');g.position.set(sp.x,-1.5,sp.z);g.rotation.y=Math.atan2(-sp.x,-sp.z);g.scale.setScalar(1.25);world.add(g);addObstacle(sp.x,sp.z,30);zones.push({d:projectGlobal(sp.x,sp.z),half:0,x:sp.x,z:sp.z,r:38});}}
 for(const [v,side] of L.maypoles||[]){const p=lmAt(lmPart('LM_Maypole'),cpDist(v),side*17);addObstacle(p.x,p.z,1);}
 if(L.tent){const [v,side]=L.tent,d=cpDist(v),g=lmPart('LM_Tent'),p=lmAt(g,d,side*34,1.15);addObstacle(p.x,p.z,16);zones.push({d,half:0,x:p.x,z:p.z,r:22});
  const sign=mesh(new T.PlaneGeometry(7.3,1.45),label("O'ZAPFT IS!",'#ff4fae','#fff6fb',512,100),g,0,7.1,7.24);sign.castShadow=false;}
 for(const [v,side] of L.hearts||[]){const g=new T.Group(),h=lmPart('LM_Heart');h.position.set(0,7.6,0);g.add(h);mesh(new T.CylinderGeometry(.12,.14,6.4,8),mat(0x5a3a22),g,0,3.2,0);const p=lmAt(g,cpDist(v),side*13);addObstacle(p.x,p.z,.6);}
 for(const [v,side] of L.pretzels||[]){const p=lmAt(lmPart('LM_Pretzel'),cpDist(v),side*13,1.1);addObstacle(p.x,p.z,.6);}
 if(course.train)buildTrain();}
// ---------------------------------------------------------------- R53: Pilz-Wiesn und Gothic-Geisterhaus
// Modelle: art/r53/create_wiesn.py (wiesn.glb) und art/r53/create_gothic.py (gothic.glb), Teile per Name.
// Kurs-Eintraege [cp, Seite, Versatz m]: wiesn:{stalls, steins, barrels, benches, carousels, tent2, bunting:[cp], ferris}
// gothic:{candles, ruins, coffins, bats}, wizard:[cpVon, cpBis] (Abschnitt, in dem der Besen-Zauberer mitfliegt).
function r53Part(file,n){const o=P[file]?.getObjectByName(n);if(!o)return null;const c=o.clone(true);c.position.set(0,0,0);c.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true;}});return c;}
// Freie Stelle neben der Strasse: keine Zone und kein anderer Streckenteil naeher als der eigene Versatz;
// dicht an der Strasse zusaetzlich nicht an Tunneln, Bruecken, Rollzonen, Luecken oder Hochstrassen
// R67: Retro-Voxel-Deko am Streckenrand je Thema (Kakteen, Schneemaenner, Palmen, Kuerbisse, Fliegenpilze, Masskruege, Lollis)
// - instanziert (ein Zeichenaufruf je Art), feste Verteilung je Strecke, nur an freien Plaetzen (decoSpot), mit kleiner Kollision
const DECO_SIZE={cactus:.34,snowman:.26,palm:.36,pumpkin:.24,shroom:.3,mug:.3,lolly:.3},decoGeos={};
function decoGeo(k){if(decoGeos[k])return decoGeos[k];const m=decoModel(k),d=voxelMesh(m.vox,m.pal,DECO_SIZE[k]||.3,{ground:true}),g=new T.BufferGeometry();
 g.setAttribute('position',new T.BufferAttribute(d.positions,3));g.setAttribute('normal',new T.BufferAttribute(d.normals,3));g.setAttribute('color',new T.BufferAttribute(d.colors,3));g.setIndex(new T.BufferAttribute(d.indices,1));g.computeBoundingSphere();sharedGeo.add(g);return decoGeos[k]=g;}
function buildVoxDeco(){const kinds=DECO_FOR[course.theme];if(!kinds||course.openWorld||!length)return;let sd=(course.seed||1)*7919+13;const rnd=()=>((sd=(sd*16807)%2147483647)/2147483647);
 for(const k of kinds){const want=LITE?10:Math.min(26,Math.round(length/60)),im=new T.InstancedMesh(decoGeo(k),voxMat,want);im.castShadow=!LITE;im.receiveShadow=true;let n=0;
  for(let a=0;a<want*5&&n<want;a++){const d=rnd()*length,side=rnd()<.5?-1:1,of=side*(15+rnd()*24),sp=decoSpot(d,of,1.6);if(!sp)continue;
   const y=Math.max(0,groundAt(d,of).y),sc=.85+rnd()*.45;_e.set(0,rnd()*TAU,0);_q.setFromEuler(_e);_m.compose(_v.set(sp.p.x,y,sp.p.z),_q,_s.setScalar(sc));im.setMatrixAt(n++,_m);addObstacle(sp.p.x,sp.p.z,.9*sc);}
  im.count=n;if(n)world.add(im);else im.dispose();}}
// R70: Easter Egg - auf jeder Strecke ein verstecktes Spielmodul: ueber einer Sprungschanze (nur im Sprung erreichbar) oder
// knapp am Fahrbahnrand. Einmal gefunden, bleibt es gefunden; alle zwoelf schalten den Aufsatz "Spielmodul" frei.
let modSpot=null;
function buildModule(){modSpot=null;if(course.openWorld||selected<0||selected>=12||!length)return;const got=store.get('mods',[]).includes(selected);
 let d,off,lift;const rs=ramps.filter(q=>!q.gap);
 if(rs.length){const q=rs[(course.seed||0)%rs.length];d=lapDist(q.end+8);off=q.off;lift=3.4;}else{d=lapDist(length*.62);off=((course.seed||0)%2?1:-1)*8.3;lift=1.4;}
 for(let i=0;i<12&&(inGap(d)||hasMag(d)||inTunnel(d)||loopAt(d));i++)d=lapDist(d+18);
 const s=sample(d,off),y=Math.max(0,groundAt(d,off).y)+lift,g=new T.Group(),m=voxObj('top_cart');m.scale.setScalar(1.35);g.add(m);g.position.set(s.p.x,y,s.p.z);g.visible=!got;world.add(g);
 modSpot={g,m,d,off,x:s.p.x,y,z:s.p.z,got};}
function modTick(dt){const M=modSpot;if(!M||M.got||!M.g.parent)return;const t=performance.now()*.001;M.m.rotation.y=t*2.2;M.m.position.y=Math.sin(t*3)*.18;
 if(Math.random()<dt*6)emit(M.x+(Math.random()-.5)*1.4,M.y+(Math.random()-.5)*1.2,M.z+(Math.random()-.5)*1.4,[0xffd23a,0xffffff,0xb48cff][Math.floor(Math.random()*3)],0,1.2,0,.5);
 const p=racers[0];if(state!=='race'||!p)return;const dx=p.x-M.x,dz=p.z-M.z;if(dx*dx+dz*dz>6.5||Math.abs((p.mesh?.position.y??p.y)+.8-M.y)>2.4)return;
 M.got=true;M.g.visible=false;const list=[...new Set([...store.get('mods',[]),selected])];store.set('mods',list);topperMine=undefined;
 for(let i=0;i<30;i++){const a=i/30*TAU;emit(M.x,M.y,M.z,[0xffd23a,0xb48cff,0xffffff][i%3],Math.sin(a)*6,3+Math.random()*4,Math.cos(a)*6,.8);}
 SFX.crown();toast(`🎮 SPIELMODUL GEFUNDEN! (${list.length}/12)`,2.4,'good');emote(p,'happy');
 if(list.length>=12){setTimeout(()=>{grantAch('modules');toast('🎮 ALLE MODULE! Aufsatz „Spielmodul“ frei',2.6,'good');},2600);}}
function decoSpot(d,off,rad){if(inZone(d,rad*.5)||nearLoop(d)||forkBlocks(d,off))return null;
 if(Math.abs(off)<18&&(inGap(d)||inTunnel(d)||inBridge(d)||hasRoll(d)||raiseH(d)>.5||(hpipes.length&&hpAt(d,8))))return null;
 const s=sample(d,off);if(!Number.isFinite(groundAt(d,off).y)||nearTrack(s.p.x,s.p.z,Math.min(Math.abs(off)-1.5,rad+9.5)))return null;
 for(const cell of obsGrid.values())for(const o of cell)if(Math.hypot(s.p.x-o.x,s.p.z-o.z)<(o.r||0)+rad)return null;return s;}

function buildDeco(){deco=null;const W=course.wiesn,Gt=course.gothic;if(!W&&!Gt&&!course.wizard&&!course.lab&&!course.gothic2&&!course.eggs)return;
 deco={spin:[],flameMat:null,bats:null,wizard:null,tram:null,klos:[],tents:[]};
 if(course.eggs)buildEggs(course.eggs);
 if(W&&P.wiesn)buildWiesn(W);if(Gt&&P.gothic)buildGothic(Gt);if(course.wizard&&P.gothic)buildWizard(course.wizard);
 if(course.lab&&P.lab)buildLab(course.lab);if(course.gothic2&&P.gothic2)buildGothic2(course.gothic2);}
function decoPut(file,name,list,off,rad,sc=1,after){let n=0;for(const [v,side,o2] of list||[]){const d=cpDist(v),of=side*(o2||off);if(!decoSpot(d,of,rad))continue;
  const g=r53Part(file,name);if(!g)continue;const p=lmAt(g,d,of,sc);addObstacle(p.x,p.z,rad*.8);after?.(g,p,d);n++;}return n;}
function buildWiesn(W){
 decoPut('wiesn','WS_Stall',W.stalls,16,3);decoPut('wiesn','WS_Stein',W.steins,12.5,.7);decoPut('wiesn','WS_Barrels',W.barrels,14.5,1.8);decoPut('wiesn','WS_Bench',W.benches,21,2.3);
 for(const [v,side,o2=32] of W.carousels||[]){const d=cpDist(v),of=side*o2;if(!decoSpot(d,of,10))continue;const base=r53Part('wiesn','WS_CarouselBase'),top=r53Part('wiesn','WS_CarouselTop');if(!base||!top)continue;
  const g=new T.Group();top.position.y=9.8;g.add(base,top);const p=lmAt(g,d,of);addObstacle(p.x,p.z,8.5);zones.push({d,half:0,x:p.x,z:p.z,r:12});deco.spin.push({o:top,w:.85+deco.spin.length*.12});}
 // zweites Festzelt mit eigenem Leuchtschild
 if(W.tent2&&P.landmarks){const [v,side]=W.tent2,d=cpDist(v);if(decoSpot(d,side*36,16)){const g=lmPart('LM_Tent'),p=lmAt(g,d,side*36,1.1);addObstacle(p.x,p.z,16);zones.push({d,half:0,x:p.x,z:p.z,r:22});
  const sign=mesh(new T.PlaneGeometry(7.3,1.45),label('PILZBRÄU','#1a5fd0','#fffbe8',512,100),g,0,7.1,7.24);sign.castShadow=false;}}
 if(W.bunting)buildBunting(W.bunting);}
// Wimpelketten quer ueber die Strasse: blau-weisse Dreiecke an durchhaengender Leine zwischen zwei Masten
function buildBunting(list){const pos=[[],[]],pm=mat(0x3a2a1c),pole=new T.CylinderGeometry(.11,.14,9.6,6).translate(0,4.8,0);
 for(const v of list){const d=cpDist(v);if(inTunnel(d)||inBridge(d)||hasRoll(d)||nearLoop(d)||inGap(d)||raiseH(d)>.5)continue;
  const a=sample(d,-11.6).p,b=sample(d,11.6).p,ya=Math.max(0,groundAt(d,-11.6).y),yb=Math.max(0,groundAt(d,11.6).y);if(!Number.isFinite(ya+yb))continue;
  mesh(pole,pm,world,a.x,ya,a.z);mesh(pole,pm,world,b.x,yb,b.z);addObstacle(a.x,a.z,.4);addObstacle(b.x,b.z,.4);
  const at=k=>[a.x+(b.x-a.x)*k,ya+(yb-ya)*k+9.3-1.7*4*k*(1-k),a.z+(b.z-a.z)*k],n=24;
  for(let i=0;i<n;i++){const p0=at((i+.1)/n),p1=at((i+.9)/n),pm2=at((i+.5)/n);pos[i%2].push(...p0,...p1,pm2[0],pm2[1]-.95,pm2[2]);}}
 [0x1a73e8,0xffffff].forEach((c,i)=>{if(!pos[i].length)return;const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos[i],3));geo.computeVertexNormals();
  const m=new T.Mesh(geo,stdMat({color:c,roughness:.7,side:T.DoubleSide,emissive:c,emissiveIntensity:theme.glow?.18:0}));m.castShadow=false;world.add(m);});}
function buildGothic(Gt){
 decoPut('gothic','GT_Candelabra',Gt.candles,11.6,.8,1.15,g=>{const f=r53Part('gothic','GT_Flame');if(f){g.add(f);f.traverse(q=>{if(q.isMesh){q.castShadow=false;if(!deco.flameMat)deco.flameMat=q.material;}});}});
 decoPut('gothic','GT_Ruin',Gt.ruins,26,5.5,1.2);decoPut('gothic','GT_Coffin',Gt.coffins,12.8,.9,1.15);
 // Fledermaus-Schwaerme: Koerper und Fluegel als Instanzen, die Fluegel schlagen (Hoehen-Skalierung)
 const body=P.gothic.getObjectByName('GT_BatBody'),wing=P.gothic.getObjectByName('GT_BatWing');if(!Gt.bats||!body||!wing)return;
 const centers=[];for(const [v,side,o2=0] of Gt.bats){const d=cpDist(v),s=sample(d,side*o2).p;centers.push([s.x,Math.max(0,groundAt(d,side*o2).y)+11,s.z]);}
 const PER=6,n=centers.length*PER,parts=[];for(const src of [body,wing])src.traverse(q=>{if(q.isMesh){const im=new T.InstancedMesh(q.geometry,q.material,n);im.frustumCulled=false;im.userData.wing=src===wing;world.add(im);parts.push(im);}});
 deco.bats={parts,centers,n,PER};}
function buildWizard([a,b]){const src=P.gothic.getObjectByName('GT_Wizard');if(!src)return;const g=r53Part('gothic','GT_Wizard');g.visible=false;g.scale.setScalar(1.7);world.add(g);
 const shapes=['GT_SpellRing','GT_SpellSquare','GT_SpellTri'].map(n=>P.gothic.getObjectByName(n)).filter(Boolean);
 deco.wizard={g,sec:[cpDist(a),cpDist(b)],shapes,spells:[],castT:WIZARD.warmup,t:0,show:0,casts:0};}
// ---------------------------------------------------------------- R57: Canyon-Forschungsanlage und Gothic-Schloss
// Modelle: art/r57/create_lab.py (lab.glb) und art/r57/create_gothic2.py (gothic2.glb) - eigene Entwuerfe, nur Anklaenge
function buildLab(L){
 decoPut('lab','LB_Bunker',L.bunker,42,10,1,g=>{const s=mesh(new T.PlaneGeometry(5.9,.8),label('TESTLABOR 7 · SPERRZONE','#1a2a3a','#f4f4ee',768,104),g,0,7.55,.8);s.castShadow=false;});
 decoPut('lab','LB_Dish',L.dishes,30,3,1,g=>{deco.spin.push({o:g.children[0]||g,w:.18,dish:true});});
 decoPut('lab','LB_Silo',L.silos,36,5);decoPut('lab','LB_Crates',L.crates,16,2.2);decoPut('lab','LB_Clock',L.clock,30,3.5);
 if(L.tram)buildTram(L.tram);}
// Hochbahn: Pfeiler und Traeger neben der Strecke, ein Wagen pendelt hin und her
function buildTram([a,b,side,off]){const src=r53Part('lab','LB_Tram');if(!src)return;const d0=cpDist(a),d1=d0+lapDist(cpDist(b)-d0),H=7.5,pts=[];
 for(let d=d0;d<=d1;d+=4){const q=sample(d,side*off).p,gy=Math.max(0,groundAt(d,side*off).y);if(!Number.isFinite(gy)||nearTrack(q.x,q.z,off-4))return;pts.push([q.x,gy,q.z]);}
 if(pts.length<6)return;const conc=stdMat({color:0x8a8a86,roughness:.9}),beam=new T.InstancedMesh(new T.BoxGeometry(1.2,.9,4.3),conc,pts.length-1),pyl=new T.InstancedMesh(new T.BoxGeometry(1,1,1),conc,Math.ceil(pts.length/3));
 let k=0;for(let i=0;i<pts.length-1;i++){const [x0,y0,z0]=pts[i],[x1,y1,z1]=pts[i+1];_m.compose(_v.set((x0+x1)/2,Math.max(y0,y1)+H,(z0+z1)/2),_q.setFromEuler(_e.set(0,Math.atan2(x1-x0,z1-z0),0)),_s.set(1,1,1));beam.setMatrixAt(i,_m);
  if(i%3===0){_m.compose(_v.set(x0,y0+H/2,z0),_q.identity(),_s.set(1.1,H,1.1));pyl.setMatrixAt(k++,_m);addObstacle(x0,z0,1);}}
 pyl.count=k;beam.castShadow=pyl.castShadow=true;beam.receiveShadow=true;world.add(beam,pyl);world.add(src);deco.tram={g:src,d0,d1,side,off,H,t:0};}
function buildGothic2(G2){
 decoPut('gothic2','G2_Armor',G2.armor,12,1.2,1.05);decoPut('gothic2','G2_Gargoyle',G2.gargoyles,13,1.1);
 decoPut('gothic2','G2_Window',G2.windows,24,4.5,1.1);decoPut('gothic2','G2_Fence',G2.fences,12.2,3.4);
 decoPut('gothic2','G2_Spire',G2.spires,75,6,1.15);}
function updateTram(dt){const T0=deco.tram;if(!T0)return;T0.t+=dt;const span=T0.d1-T0.d0,per=span/9,ph=(T0.t%(2*per))/per,k=ph<1?ph:2-ph,e=k*k*(3-2*k),d=T0.d0+span*e,dir=ph<1?1:-1;
 const q=sample(d,T0.side*T0.off),gy=Math.max(0,groundAt(d,T0.side*T0.off).y);T0.g.position.set(q.p.x,gy+T0.H+.45,q.p.z);T0.g.rotation.y=q.angle+(dir<0?Math.PI:0);}
// Zeitsprung (R57, Sonnen-Canyon): ab 142 km/h Blitz, Donner und zwei brennende Reifenspuren auf dem Boden
let warp=null;
function timeWarpTick(p,dt){if(!course.timewarp||state!=='race'||!p)return;warp??={cd:0,trail:[],t:0,geo:null,mat:null};const W0=warp;W0.cd=Math.max(0,W0.cd-dt);
 const kmh=Math.abs(p.speed)*3.6;
 if(kmh>=142&&!p.air&&W0.cd<=0){W0.cd=9;W0.t=1.6;flashScreen(.6);SFX.thunder();burst(p,0xbfe8ff,26);toast('142 KM/H – ZEITSPRUNG! ⚡',1.8,'good');shake=Math.max(shake,.35);}
 if(W0.t>0){W0.t-=dt;if(!W0.geo){W0.geo=new T.PlaneGeometry(.55,2.4).rotateX(-Math.PI/2);W0.mat=new T.MeshBasicMaterial({color:0xff7a1a,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});}
  for(const sx of [-.95,.95]){const c=Math.cos(p.h),sn=Math.sin(p.h),x=p.x+c*sx-sn*1.4,z=p.z-sn*sx-c*1.4,m=new T.Mesh(W0.geo,W0.mat.clone());m.position.set(x,(p.y||0)+.12,z);m.rotation.y=p.h;world.add(m);W0.trail.push({m,t:2.4});
   emit(x,(p.y||0)+.4,z,0xffa53d,(Math.random()-.5)*2,2+Math.random()*2,(Math.random()-.5)*2,.4);}}
 for(let i=W0.trail.length-1;i>=0;i--){const f=W0.trail[i];f.t-=dt;f.m.material.opacity=Math.max(0,f.t/2.4)*.9;if(f.t<=0){world.remove(f.m);f.m.material.dispose();W0.trail.splice(i,1);}}}
// ---------------------------------------------------------------- R59: Easter Eggs (Anklang an klassische Zeitreise-Adventures)
// Zeitklo (art/r59/create_eggs.py): Tuer springt auf, gruener Blitz, kleiner Zeitsprung-Turbo. Tentakel aus Gullydeckeln
// (lila und gruen, ohne Gesicht) schnellen hoch, wenn jemand kommt. Dazu ein Warnschild. Kurs: eggs:{klos,tentacles,signs}
function buildEggs(E){
 if(P.eggs)for(const k0 of E.klos||[])for(const extra of [0,3,6,10]){const n0=deco.klos.length;decoPut('eggs','EG_Klo',[[k0[0],k0[1],12.8+extra]],12.8,1.1,1.05,(g,p,d)=>{const door=r53Part('eggs','EG_KloDoor');if(door){door.position.set(-.56,0,.61);g.add(door);}
  const s=mesh(new T.PlaneGeometry(.86,.2),label('ZEITKLO','#0a2a7a','#ffffff',256,60),g,0,2.13,.64);s.castShadow=false;deco.klos.push({g,door,x:p.x,z:p.z,d,open:0,cd:0});});if(deco.klos.length>n0)break;}
 // freie Stelle: erst der Wunschabstand, sonst etwas weiter draussen
 for(const [v,side,o2=13,col] of E.tentacles||[]){const d=cpDist(v),of=[0,3,6,10,15].map(k=>side*(o2+k)).find(o=>decoSpot(d,o,2.2));if(of===undefined)continue;const g=new T.Group(),m=stdMat({color:col==='green'?0x3fbf4a:0x8a2cc9,roughness:.45}),sm=stdMat({color:col==='green'?0xb8f5a8:0xf0a8ff,roughness:.5});
  mesh(new T.CylinderGeometry(1.25,1.25,.12,20),mat(0x2a2a30,{metalness:.6,roughness:.4}),g,0,.06,0);mesh(new T.TorusGeometry(1.2,.1,6,24).rotateX(Math.PI/2),mat(0x45454d,{metalness:.7}),g,0,.12,0);
  const segs=[];let parent=g,y=.12;for(let i=0;i<10;i++){const sg=new T.Group();sg.position.y=i?.52:y;parent.add(sg);const r0=.42-i*.036,r1=.42-(i+1)*.036;
   const c=mesh(new T.CylinderGeometry(Math.max(.05,r1),Math.max(.06,r0),.56,12).translate(0,.28,0),m,sg,0,0,0);c.castShadow=true;
   for(const sy of [.14,.38])mesh(new T.SphereGeometry(Math.max(.035,r0*.32),8,6),sm,sg,0,sy,Math.max(.06,r0)*.92);segs.push(sg);parent=sg;}
  const p=lmAt(g,d,of,1.5);addObstacle(p.x,p.z,1.9);deco.tents.push({g,segs,x:p.x,z:p.z,d,up:.25,ph:Math.random()*6});}
 for(const [v,side] of E.signs||[]){const d=cpDist(v),of=side*12.4;if(!decoSpot(d,of,.8))continue;const g=new T.Group();mesh(new T.CylinderGeometry(.08,.1,3.2,8),mat(0x9a9aa0,{metalness:.6}),g,0,1.6,0);
  const tex=canvasTex(256,256,(q,w,h)=>{q.fillStyle='#ffd21f';q.strokeStyle='#c1121f';q.lineWidth=18;q.beginPath();q.moveTo(w/2,16);q.lineTo(w-14,h-30);q.lineTo(14,h-30);q.closePath();q.fill();q.stroke();
   q.strokeStyle='#8a2cc9';q.lineWidth=16;q.lineCap='round';q.beginPath();q.moveTo(w/2-6,h-60);q.bezierCurveTo(w/2-40,h-110,w/2+40,h-130,w/2+8,h-165);q.stroke();q.fillStyle='#8a2cc9';q.beginPath();q.arc(w/2-6,h-58,14,0,7);q.fill();});
  const tri=mesh(new T.PlaneGeometry(1.6,1.6),new T.MeshStandardMaterial({map:tex,transparent:true,alphaTest:.5,side:T.DoubleSide}),g,0,3.5,.06);tri.castShadow=false;
  mesh(new T.PlaneGeometry(1.9,.42),label('ACHTUNG TENTAKEL!','#c1121f','#fffbe8',512,110),g,0,2.45,.08);const p=lmAt(g,d,of);addObstacle(p.x,p.z,.4);}}
function updateEggs(dt,now){if(!deco)return;const t=now/1000,pl=racers[0];
 for(const k of deco.klos){k.cd=Math.max(0,k.cd-dt);k.open=Math.max(0,k.open-dt*.8);if(k.door)k.door.rotation.y=-Math.min(1,k.open*2.5)*1.9;
  if(state==='race'&&pl&&!k.cd&&Math.hypot(pl.x-k.x,pl.z-k.z)<7.5){k.cd=7;k.open=1.6;for(let i=0;i<22;i++){const a=Math.random()*TAU;emit(k.x,1.4,k.z,0x6dff8a,Math.sin(a)*5,1+Math.random()*4,Math.cos(a)*5,.6);}
   flashScreen(.25);SFX.warp?.();playClip('s_c_levelup',sfxGain,.45);pl.boost=Math.max(pl.boost,1.3);toast('ZEITKLO! ⏳ Grüße aus der Zukunft',1.6,'good');}}
 for(const e of deco.tents){const near=pl&&Math.hypot(pl.x-e.x,pl.z-e.z)<32;e.up+=((near?1:.3)-e.up)*Math.min(1,dt*(near?3:.8));
  e.segs[0].scale.setScalar(.35+.65*e.up);e.segs.forEach((sg,i)=>{sg.rotation.x=Math.sin(t*2.2+e.ph+i*.55)*.16*(1+i*.08);sg.rotation.z=Math.cos(t*1.7+e.ph+i*.4)*.12;});}}
// Zauber nur auf ebene, freie Strasse (nicht in Tunneln, Rollzonen, Loopings, Elementen, Luecken, Achterbahn)
function spellOk(d){return !(inTunnel(d)||hasRoll(d)||nearLoop(d)||inGap(d)||elemAt(d)||raiseH(d)>.5||(hpipes.length&&hpAt(d))||coasters.some(c=>lapDist(d-c.s)<c.span));}
const _kv=new T.Vector3(),_kw=new T.Vector3(),_kq=new T.Quaternion(),_ke=new T.Euler(),_ks=new T.Vector3();
function updateDeco(dt,now){
 for(const s of deco.spin)s.o.rotation.y+=dt*s.w;
 updateTram(dt);updateEggs(dt,now);
 if(deco.flameMat)deco.flameMat.emissiveIntensity=4.2+Math.sin(now*.023)*.9+Math.sin(now*.061+1.3)*.6;
 const B=deco.bats;if(B){for(let i=0;i<B.n;i++){const c=B.centers[Math.floor(i/B.PER)],a=now*.0008*(1+(i%3)*.22)+i*1.9,rr=6+(i%4)*2.4;
   _kv.set(c[0]+Math.cos(a)*rr,c[1]+Math.sin(now*.0017+i)*1.6+(i%3),c[2]+Math.sin(a)*rr);_ke.set(0,-a,0);_kq.setFromEuler(_ke);
   for(const im of B.parts){_ks.set(.6,im.userData.wing?.6*3*Math.sin(now*.019+i*1.3):.6,.6);_m.compose(_kv,_kq,_ks);im.setMatrixAt(i,_m);}}
  for(const im of B.parts)im.instanceMatrix.needsUpdate=true;}
 if(deco.wizard)updateWizard(dt);}
function updateWizard(dt){const k=deco.wizard,p=racers[0];if(!p)return;const racing=state==='race';
 // Menue, Countdown, Ziel: liegende Zauber raeumen (sonst schweben sie beim naechsten Start noch in der Luft)
 if(!racing&&state!=='paused'&&k.spells.length){for(const s of k.spells)world.remove(s.m);k.spells.length=0;k.castT=WIZARD.warmup;}
 const want=racing&&!isTT()&&inSection(k.sec,p.distance,length);k.show=clamp(k.show+(want?dt*.8:-dt*.6),0,1);k.t+=dt;k.g.visible=k.show>.01;
 if(k.g.visible){const d=p.distance+WIZARD.lead,off=Math.sin(k.t*.7)*WIZARD.sway,s=sample(d,off),gy=groundAt(d,off).y;
  k.g.position.set(s.p.x,(Number.isFinite(gy)?Math.max(0,gy):0)+WIZARD.height+Math.sin(k.t*2.1)*.5+(1-k.show)*(1-k.show)*30,s.p.z);
  k.g.rotation.set(0,s.angle+Math.PI,Math.cos(k.t*.7)*.22);
  // Wurf: meist auf den Spieler, sonst auf ein Kart in der Naehe; nie in Tunnel, Loopings oder Rollzonen
  if(want&&k.show>.9&&(k.castT-=dt)<=0){k.castT=castInterval(Math.random());
   let r=p;if(Math.random()<.35){const near=racers.filter(q=>q!==p&&!q.finishTime&&Math.abs(q.distance-p.distance)<45);if(near.length)r=near[Math.floor(Math.random()*near.length)];}
   const tg=pickTarget(r,Math.random());if(spellOk(tg.d)&&k.spells.length<WIZARD.maxSpells&&k.shapes.length){
    const shape=k.shapes[k.casts++%k.shapes.length],m=shape.clone(true);m.scale.setScalar(1.35);world.add(m);k.g.updateMatrixWorld(true);
    const from=k.g.localToWorld(new T.Vector3(1.12,2,1.55)),tp=sample(tg.d,tg.off).p,ty=groundAt(tg.d,tg.off).y;
    k.spells.push({m,d:tg.d,off:tg.off,from:{x:from.x,y:from.y,z:from.z},to:{x:tp.x,y:(Number.isFinite(ty)?Math.max(0,ty):0)+.35,z:tp.z},age:0,landed:false});
    if(nearPlayer({distance:tg.d},70))SFX.magic();}}}
 for(let i=k.spells.length-1;i>=0;i--){const s=k.spells[i],was=s.landed,st=stepSpell(s,racing?dt:0);
  if(st==='gone'||s.gone){world.remove(s.m);k.spells.splice(i,1);continue;}
  if(st==='fly'){spellPos(s.from,s.to,s.age,_kv);s.m.position.set(_kv.x,_kv.y,_kv.z);s.m.rotation.set(Math.sin(s.age*9)*.6,s.age*8,0);continue;}
  const fade=Math.min(1,(WIZARD.flight+WIZARD.life-s.age)*2);s.m.position.set(s.to.x,s.to.y+.12*Math.sin(s.age*5),s.to.z);s.m.rotation.set(0,s.age*2.4,0);s.m.scale.setScalar(1.35*Math.max(.05,fade));
  if(!was){for(let j=0;j<10;j++){const a=j/10*TAU;emit(s.to.x,s.to.y+.3,s.to.z,[0xff5a6a,0x5aff7a,0x6a8aff][j%3],Math.cos(a)*4,2+Math.random()*2,Math.sin(a)*4,.5);}if(nearPlayer({distance:s.d},50))SFX.spellLand();}
  if(!racing)continue;
  for(const r of racers){if(!spellHits(s,r,length))continue;s.gone=true;const me=r===p;
   if(r.shield>0){r.shield=0;burst(r,0xffe263,10);}else{hitKart(r,.9,.4);loseSpores(r,1);if(me){SFX.hit();shake=.35;toast('VERZAUBERT!',.9,'bad');}}break;}}}
// Gleisring: Sehne durch die Insel (kreuzt die Strasse zweimal) plus Bogen am Inselrand zurueck
function buildTrain(){const [cpA,ang=0]=course.train,dA=cpDist(cpA),sA=sample(dA),RIM=192*WK;
 const okAt=d=>!inGap(d)&&!inZone(d,18)&&!inTunnel(d)&&!(agrav.length&&hasMag(d))&&!loops.some(q=>lapDist(d-q.s+30)<q.span+60)&&raiseH(d)<.5&&Math.abs(wrapDiff(d,0))>30&&!forkAt(d,20);
 const why=d=>[inGap(d)?'gap':'',inZone(d,18)?'zone':'',inTunnel(d)?'tunnel':'',agrav.length&&hasMag(d)?'mag':'',loops.some(q=>lapDist(d-q.s+30)<q.span+60)?'loop':'',raiseH(d)>=.5?'raise':'',Math.abs(wrapDiff(d,0))<=30?'start':'',forkAt(d,20)?'fork':''].filter(Boolean).join(',');
 if(TEST){window.__train={a:why(dA),tries:[]};window.__trainWhy=why;}
 if(!okAt(dA))return;
 let dir=null,B=null;for(const da of [0,.2,-.2,.4,-.4,.6,-.6]){const a=sA.angle+Math.PI/2+ang+da,dx=Math.sin(a),dz=Math.cos(a);let hit=null;
  for(let t=18;t<2*RIM;t+=2){const x=sA.p.x+dx*t,z=sA.p.z+dz*t;if(Math.hypot(x,z)>RIM)break;const d=projectGlobal(x,z),q=sample(d).p;if(Math.hypot(q.x-x,q.z-z)<3){hit={d,x,z};break;}}
  if(TEST)window.__train.tries.push(hit?Math.round(hit.d)+':'+why(hit.d):'nohit');if(hit&&okAt(hit.d)){dir=[dx,dz];B=hit;break;}}
 if(!dir)return;
 // Sehne von Rand zu Rand durch A und B, dann Bogen aussen herum zurueck
 const line=[],P0={x:sA.p.x,z:sA.p.z};let t0=0,t1=0;while(Math.hypot(P0.x-dir[0]*t0,P0.z-dir[1]*t0)<RIM)t0+=2;while(Math.hypot(P0.x+dir[0]*t1,P0.z+dir[1]*t1)<RIM)t1+=2;
 for(let t=-t0;t<=t1;t+=3)line.push([P0.x+dir[0]*t,P0.z+dir[1]*t]);
 const a0=Math.atan2(line[line.length-1][1],line[line.length-1][0]),a1=Math.atan2(line[0][1],line[0][0]);let da=a1-a0;while(da<=0)da+=TAU;if(da>Math.PI)da-=TAU;
 const arc=[],n=Math.ceil(Math.abs(da)*RIM/3);for(let i=1;i<n;i++){const a=a0+da*i/n;arc.push([Math.cos(a)*RIM,Math.sin(a)*RIM]);}
 let pts=line.concat(arc);
 for(let it=0;it<6;it++)pts=pts.map((p,i)=>{const a=pts[(i-1+pts.length)%pts.length],b=pts[(i+1)%pts.length];return [(a[0]+2*p[0]+b[0])/4,(a[1]+2*p[1]+b[1])/4];});
 const cum=[0];for(let i=1;i<=pts.length;i++){const a=pts[i-1],b=pts[i%pts.length];cum.push(cum[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1]));}
 const len=cum[pts.length];
 // Schienen (ein Mesh) und Schwellen (Instanzen)
 const rails=[],sl=[],M4=new T.Matrix4(),Q=new T.Quaternion(),E=new T.Euler(),V=new T.Vector3(),S=new T.Vector3(1,1,1);
 for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],yaw=Math.atan2(b[0]-a[0],b[1]-a[1]),segL=Math.hypot(b[0]-a[0],b[1]-a[1]);
  for(const side of [-.8,.8]){const cx=(a[0]+b[0])/2+Math.cos(yaw)*side,cz=(a[1]+b[1])/2-Math.sin(yaw)*side;rails.push(new T.BoxGeometry(.12,.14,segL+.05).rotateY(yaw).translate(cx,.26,cz));}
  for(let k=0;k<segL;k+=1.4){M4.compose(V.set(a[0]+(b[0]-a[0])*k/segL,.1,a[1]+(b[1]-a[1])*k/segL),Q.setFromEuler(E.set(0,yaw,0)),S);sl.push(M4.clone());}}
 world.add(new T.Mesh(mergeGeometries(rails),mat(0x9aa0aa,{roughness:.4,metalness:.7})));
 const slM=new T.InstancedMesh(new T.BoxGeometry(2.6,.16,.42),mat(0x5a3a22),sl.length);sl.forEach((m,i)=>slM.setMatrixAt(i,m));slM.receiveShadow=true;world.add(slM);
 // Zug: Lok und drei Wagen
 const loco=lmPart('LM_Loco');if(!loco)return;world.add(loco);const cars=[{g:loco,half:4.7,off:0}];
 for(let k=0;k<3;k++){const w=lmPart('LM_Wagon');world.add(w);cars.push({g:w,half:3.7,off:9.2+k*8.2});}
 // Bahnuebergaenge: Blinksignale beidseitig der Strasse
 const sigMat=[],crossings=[{d:dA,s:0},{d:B.d,s:0}].map(c=>{let bi=0,bd=1e9;const cp=sample(c.d).p;for(let i=0;i<pts.length;i++){const e=Math.hypot(pts[i][0]-cp.x,pts[i][1]-cp.z);if(e<bd){bd=e;bi=i;}}c.s=cum[bi];
  for(const side of [-1,1]){const g=lmPart('LM_Crossing');if(!g)continue;const sp=sample(c.d+side*9,side*13.2);g.position.copy(sp.p);g.rotation.y=sp.angle+(side>0?Math.PI:0);world.add(g);addObstacle(sp.p.x,sp.p.z,.5);
   g.traverse(q=>{if(q.isMesh&&q.material.name==='SignalRed'){q.material=q.material.clone();sigMat.push(q.material);}});}
  return c;});
 trainFx={pts,cum,len,cars,crossings,sigMat,s:0,speed:17,bellT:0,whT:0};updateTrain(0,0);}
function trainAt(s,out){const f=trainFx;s=((s%f.len)+f.len)%f.len;let lo=0,hi=f.pts.length;while(hi-lo>1){const m=(lo+hi)>>1;if(f.cum[m]<=s)lo=m;else hi=m;}const a=f.pts[lo],b=f.pts[(lo+1)%f.pts.length],k=(s-f.cum[lo])/Math.max(1e-6,f.cum[lo+1]-f.cum[lo]);out.x=a[0]+(b[0]-a[0])*k;out.z=a[1]+(b[1]-a[1])*k;out.yaw=Math.atan2(b[0]-a[0],b[1]-a[1]);return out;}
const _ta={x:0,z:0,yaw:0};
function updateTrain(dt,t){const f=trainFx;if(!f)return;f.s=(f.s+f.speed*dt)%f.len;
 for(const c of f.cars){trainAt(f.s-c.off,_ta);c.g.position.set(_ta.x,.14,_ta.z);c.g.rotation.y=_ta.yaw;c.x=_ta.x;c.z=_ta.z;c.yaw=_ta.yaw;}
 f.whT-=dt;{const p0=racers[0];if(p0&&f.whT<=0&&Math.hypot(f.cars[0].x-p0.x,f.cars[0].z-p0.z)<110&&state==='race'){SFX.whistle();f.whT=7;}}
 const lo=f.cars[0],near=f.crossings.some(c=>{const ds=((c.s-f.s)%f.len+f.len)%f.len;return ds<70||ds>f.len-45;}),on=near&&Math.floor(t*2.4)%2===0;
 for(const m of f.sigMat)m.emissiveIntensity=near?(on?3:.2):.15;
 const pl=racers[0];f.bellT-=dt;if(near&&pl&&f.bellT<=0&&state==='race'){const dd=Math.min(...f.crossings.map(c=>{const q=sample(c.d).p;return Math.hypot(q.x-pl.x,q.z-pl.z);}));if(dd<80){SFX.bell();f.bellT=.5;}}
 if(pl&&frame%3===0&&Math.hypot(lo.x-pl.x,lo.z-pl.z)<120)emit(lo.x+Math.sin(lo.yaw)*3.1,5.2,lo.z+Math.cos(lo.yaw)*3.1,0xe8e4dc,(Math.random()-.5)*1.5,3+Math.random()*2,(Math.random()-.5)*1.5,1.1);}
// Zug erwischt ein Kart: seitlich wegschleudern und Dreher
function trainHits(r,me){const f=trainFx;if(!f||(r.trainCd||0)>elapsed)return;for(const c of f.cars){const dx=r.x-c.x,dz=r.z-c.z,fx=Math.sin(c.yaw),fz=Math.cos(c.yaw),along=dx*fx+dz*fz,lat=dx*fz-dz*fx;
  if(Math.abs(along)<c.half+.9&&Math.abs(lat)<2.2&&(r.y||0)<4){r.trainCd=elapsed+1.6;const sgn=Math.sign(lat)||1;r.vx=fz*sgn*14+fx*f.speed;r.vz=-fx*sgn*14+fz*f.speed;hitKart(r,1.5,1);loseSpores(r,2);burst(r,0xe8e4dc,18);if(me){stats.trainHits++;SFX.hit();shake=.7;toast('VOM ZUG ERWISCHT!',1,'bad');}return;}}}
// ---------------------------------------------------------------- R44: Wuestensturm (Sonnen-Canyon)
// Duenen: rhythmische Sandkaemme auf der Geraden (Hoehenprofil), ab ~28 m/s hebt man auf jedem Kamm ab - Hops/Drift
// in der Luft = Trick-Turbo bei der Landung. Sandhosen: wandernde Wirbelstuerme quer ueber die Bahn, heben das Kart
// hoch und drehen es. Treibsand: Senke an der Innenseite einer Ecke, bremst stark und zieht zur Mitte (Turbo rettet).
function dunesH(d){let h=0;for(const [a,b,amp,wave] of course.dunes||[]){const d0=cpDist(a),span=lapDist(cpDist(b)-d0),rel=lapDist(d-d0);if(rel>span)continue;
 const env=sstep(Math.min(rel,span-rel)/14),s=Math.sin(Math.PI*rel/wave);h+=amp*env*s*s;}return h;}
let desert=null;
function buildDesert(){desert=null;const tw=course.twisters||[],qs=course.sand||[];if(!tw.length&&!qs.length)return;desert={twisters:[],pits:[]};
 if(tw.length){const tex=canvasTex(64,128,(q,w,h)=>{q.fillStyle='rgba(0,0,0,0)';q.clearRect(0,0,w,h);for(let i=0;i<22;i++){q.strokeStyle=`rgba(${220+Math.random()*30|0},${170+Math.random()*40|0},${110+Math.random()*30|0},${.35+Math.random()*.5})`;q.lineWidth=3+Math.random()*7;q.beginPath();const y=Math.random()*h;q.moveTo(0,y);q.bezierCurveTo(w*.3,y-18,w*.7,y+18,w,y-6);q.stroke();}},true);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(2,1);
  const prof=[];for(let i=0;i<=12;i++){const t=i/12;prof.push(new T.Vector2(1.1+Math.pow(t,1.7)*5.4,t*15));}
  const geo=new T.LatheGeometry(prof,20),m=new T.MeshBasicMaterial({map:tex,color:0xf0c890,transparent:true,opacity:.62,depthWrite:false,side:T.DoubleSide});
  for(const [v,amp,spd,ph] of tw){const d=cpDist(v),g=new T.Group(),a=new T.Mesh(geo,m),b=new T.Mesh(geo,m);b.scale.set(.72,.9,.72);b.rotation.y=1.3;g.add(a,b);world.add(g);desert.twisters.push({d,amp,spd,ph,g,a,b,x:0,z:0});}}
 for(const [v,side,rad=8.5] of qs){const d=cpDist(v),k=trackAt(d).kap,inside=side||(k>0?1:-1),off=inside*(8.2+rad*.5),p=samplePos(d,off,new T.Vector3());
  const tex=canvasTex(128,128,(q,w,h)=>{const g=q.createRadialGradient(64,64,6,64,64,64);g.addColorStop(0,'#8a5a2c');g.addColorStop(.55,'#c98d4c');g.addColorStop(1,'rgba(214,160,96,0)');q.fillStyle=g;q.fillRect(0,0,w,h);q.strokeStyle='rgba(90,55,25,.55)';q.lineWidth=4;for(let a=0;a<6;a++){q.beginPath();for(let t=0;t<1;t+=.02){const r=6+t*54,an=a*TAU/6+t*5;q.lineTo(64+Math.cos(an)*r,64+Math.sin(an)*r);}q.stroke();}});
  const disc=new T.Mesh(new T.CircleGeometry(rad,40).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));disc.position.set(p.x,p.y+.1,p.z);disc.renderOrder=1;world.add(disc);
  desert.pits.push({x:p.x,z:p.z,r:rad,disc,d,off});}}
function updateDesert(dt,t){if(!desert)return;const pl=racers[0];
 for(const s of desert.twisters){const off=Math.sin(t*s.spd+s.ph)*s.amp,dd=s.d+Math.sin(t*s.spd*.43+s.ph*2)*10,p=samplePos(dd,off,_sp);s.x=p.x;s.z=p.z;s.dd=dd;s.off=off;s.g.position.set(p.x,p.y,p.z);
  s.a.rotation.y+=dt*5.5;s.b.rotation.y-=dt*7;s.a.material.map.offset.y-=dt*.9;
  if(pl&&frame%4===0&&Math.hypot(pl.x-p.x,pl.z-p.z)<90)for(let i=0;i<2;i++){const a=Math.random()*TAU;emit(p.x+Math.cos(a)*2,p.y+.4,p.z+Math.sin(a)*2,0xe6b77a,Math.cos(a+1.6)*6,1+Math.random()*3,Math.sin(a+1.6)*6,.8);}
  if(pl&&state==='race'){const dd2=Math.hypot(pl.x-p.x,pl.z-p.z);s.cd=Math.max(0,(s.cd||0)-dt);if(dd2<34&&!s.cd){s.cd=1.1;SFX.whirl(Math.max(.25,1-dd2/34));}}}
 for(const q of desert.pits)q.disc.rotation.y+=dt*.35;}
function desertHits(r,me,dt){if(!desert)return;
 for(const s of desert.twisters){const dx=r.x-s.x,dz=r.z-s.z;if(dx*dx+dz*dz>11.5||(r.twCd||0)>elapsed||(r.y||0)>trackAt(s.d).h+7)continue;r.twCd=elapsed+1.8;
  if(r.shield>0){r.shield=0;burst(r,0xffe263,10);continue;}r.air=true;r.airT=0;r.vy=10.5;r.y=(r.y||0)+.1;hitKart(r,.8,.6);loseSpores(r,1);burst(r,0xe6b77a,16);if(me){stats.twisterHits++;toast('SANDHOSE!',.9,'bad');shake=.4;}}
 for(const q of desert.pits){const dx=q.x-r.x,dz=q.z-r.z,dl=Math.hypot(dx,dz);if(dl>q.r||r.air)continue;const k=1-dl/q.r;
  if(r.boost<=0){const cap=9+10*(1-k);const sp=Math.hypot(r.vx,r.vz);if(sp>cap){const f=Math.max(cap/sp,Math.exp(-2.6*dt));r.vx*=f;r.vz*=f;}}
  r.vx+=dx/(dl||1)*3.2*k*dt*6;r.vz+=dz/(dl||1)*3.2*k*dt*6;if(me&&frame%10===0){SFX.sand();if(frame%40===0)toast('TREIBSAND!',.7,'bad');}}}
// ---------------------------------------------------------------- R44: Streckencharakter (assets/critters.glb)
// Pilz-Promenade "Almwiese": Kuehe wandern ueber die Strasse und grasen. Neon-Pilzwald "Beat": Taktschranken senken
// sich im Takt abwechselnd links/rechts, Turbo-Felder im Takt geben mehr Schub. Geisterhaus "Spuk": Geisterhaende
// schiessen aus dem Boden (Riss als Warnung) und packen zu, dazu Gewitter mit Blitz und Donner. Sternenbahn
// "Schwerelos": Mondschwerkraft-Zone (weite, lenkbare Spruenge) und Sternschnuppen mit Warnkreis.
const BEAT=.5; // Neon: 120 Schlaege pro Minute
// R59: huebschere Almkuh aus cow.glb (art/r59/create_cow.py), sonst die alte aus critters.glb
function cowPart(n){const o=P.cow?.getObjectByName(n.replace('CR_Cow','CW_'));if(!o)return crPart(n);const c=o.clone(true);c.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true;}});return c;}
function crPart(n){const o=P.critters?.getObjectByName(n);if(!o)return null;const c=o.clone(true);c.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true;}});return c;}
let chr=null,flashEl=null;const _cowQ=new T.Vector3();
function buildCharacter(){chr=null;const C=course;if(!(P.critters||P.cow)||!(C.cows||C.beatgates||C.hands||C.lowgrav||C.meteors))return;chr={cows:[],gates:[],hands:[],mets:[],flash:0,next:8};
 for(const [a,b,n] of C.cows||[]){const d0=cpDist(a),span=lapDist(cpDist(b)-d0);for(let k=0;k<n;k++){const g=new T.Group(),body=cowPart('CR_CowBody'),head=cowPart('CR_CowHead'),tail=P.cow?cowPart('CR_CowTail'):null,legs=[];if(!body||!head)continue;g.add(body,head);if(tail)g.add(tail);
   for(const [x,z] of [[-.38,.7],[.38,.7],[-.38,-.75],[.38,-.75]]){const l=cowPart('CR_CowLeg');l.position.set(x,1.1,z);g.add(l);legs.push(l);}g.scale.setScalar(1.35);world.add(g);
   const d=d0+span*(k+.5)/n;chr.cows.push({g,head,tail,legs,d,off:(k%2?1:-1)*(6.5+k*1.5),tgt:0,pause:1+k,walk:0,x:0,z:0,ph:k*1.7,moo:0,bell:0});}}
 for(const [v] of P.critters&&C.beatgates||[]){const d=cpDist(v),halves=[];for(const side of [-1,1]){const bar=crPart('CR_Bar');const p=samplePos(d,side*11.6,new T.Vector3()),c=samplePos(d,0,new T.Vector3()),grp=new T.Group();grp.position.copy(p);grp.rotation.y=Math.atan2(-(c.z-p.z),c.x-p.x);grp.scale.setScalar(1.35);world.add(grp);addObstacle(p.x,p.z,.5);
  // Pfosten bleibt stehen, nur der Arm (alle Teile ausser dem dunklen Pfosten) dreht am Scharnier in 1,55 m Hoehe
  const boom=new T.Group();boom.position.set(0,1.55,0);const ms=[];bar.traverse(q=>{if(q.isMesh)ms.push(q);});grp.add(bar);for(const q of ms)if(q.material.name!=='PostDark'){q.position.y-=1.55;boom.add(q);}grp.add(boom);halves.push({side,bar:boom,ang:1.4});}chr.gates.push({d,halves});}
 for(const [a,b,n] of P.critters&&C.hands||[]){const d0=cpDist(a),span=lapDist(cpDist(b)-d0);for(let k=0;k<n;k++){const g=crPart('CR_Hand');g.scale.setScalar(1.3);world.add(g);
   const crack=new T.Mesh(new T.CircleGeometry(1.4,16).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0x0c0812,transparent:true,opacity:0,depthWrite:false}));world.add(crack);
   chr.hands.push({g,crack,d0,span,d:d0,off:0,t:-k*1.3,up:0,x:0,z:0,y:0});}}
 chr.low=(C.lowgrav||[]).map(([a,b])=>({s:cpDist(a),span:lapDist(cpDist(b)-cpDist(a))}));
 for(const [a,b] of P.critters&&C.meteors||[]){const d0=cpDist(a),span=lapDist(cpDist(b)-d0);for(let k=0;k<2;k++){const m=crPart('CR_Meteor');m.visible=false;world.add(m);
   const ring=new T.Mesh(new T.RingGeometry(2.6,3.4,28).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0xff4fd8,transparent:true,opacity:0,depthWrite:false}));world.add(ring);chr.mets.push({m,ring,d0,span,t:-k*1.6,d:d0,off:0,x:0,z:0,gy:0});}}}
function gravMul(d){if(!chr||!chr.low.length)return 1;for(const z of chr.low){const rel=lapDist(d-z.s);if(rel<z.span)return .38;}return 1;}
const beatPhase=t=>(t%BEAT)/BEAT;
function updateCharacter(dt,t,live=true){if(!chr)return;const pl=racers[0];
 // R59 (Nutzerhinweis "bleibe immer an den Kuehen haengen"): Kuehe grasen meist am Rand und queren nur selten, dann zuegig
 for(const c of chr.cows){c.pause-=dt;if(c.pause<=0&&!c.walk){c.walk=1;const sd=Math.sign(c.off)||1;c.tgt=(Math.random()<.28?-sd:sd)*(6.5+Math.random()*4.5);}
  if(c.walk){const dir=Math.sign(c.tgt-c.off),cross=Math.abs(c.off)<8.6;c.off+=dir*(cross?2.6:1.3)*dt;if(Math.abs(c.tgt-c.off)<.2){c.walk=0;c.pause=2+Math.random()*3;}}
  const p=samplePos(c.d,c.off,_sp),s=sample(c.d);c.x=p.x;c.z=p.z;c.g.position.set(p.x,Math.max(0,groundAt(c.d,c.off).y),p.z);
  let face=s.angle+Math.PI*.6;if(c.walk){const q=samplePos(c.d,c.off+Math.sign(c.tgt-c.off||1),_cowQ);face=Math.atan2(q.x-p.x,q.z-p.z);}c.g.rotation.y+=angleDiff(face,c.g.rotation.y)*Math.min(1,dt*3);
  const sw=c.walk?Math.sin(t*7+c.ph)*.45:0;c.legs.forEach((l,i)=>l.rotation.x=(i%2?sw:-sw));c.head.rotation.x=c.walk?Math.sin(t*3.5)*.08:.45+Math.sin(t*2+c.ph)*.15;if(c.tail)c.tail.rotation.z=Math.sin(t*(c.walk?5:2.6)+c.ph)*.38;
  c.bell=Math.max(0,c.bell-dt);if(live&&pl&&!c.bell&&Math.hypot(pl.x-p.x,pl.z-p.z)<11){c.bell=2.5;playClip('s_c_bell',sfxGain,.3);}
  c.moo=Math.max(0,c.moo-dt);if(live&&pl&&!c.moo&&Math.hypot(pl.x-p.x,pl.z-p.z)<22){c.moo=6+Math.random()*4;SFX.moo();}}
 for(const gt of chr.gates){const beat=Math.floor(t/BEAT),ph=beat%4,pulse=1-beatPhase(t);
  for(const h of gt.halves){const down=(ph===0&&h.side<0)||(ph===2&&h.side>0);const want=down?0:1.35;h.ang+=(want-h.ang)*Math.min(1,dt*14);h.bar.rotation.z=h.ang;h.down=h.ang<.35;
   h.bar.traverse(q=>{if(q.isMesh&&q.material.emissive&&q.material.name==='BarNeon')q.material.emissiveIntensity=1.5+pulse*2.5;});}}
 for(const h of chr.hands){h.t+=dt;const cyc=h.t%4.2;if(h.t>0&&cyc<dt*1.5){h.d=h.d0+Math.random()*h.span;h.off=(Math.random()-.5)*12;const p=samplePos(h.d,h.off,_sp);h.x=p.x;h.z=p.z;h.y=p.y;h.crack.position.set(p.x,p.y+.08,p.z);}
  const warn=cyc<.8,up=cyc>=.8&&cyc<2.2,rise=up?Math.min(1,(cyc-.8)/.18):cyc>=2.2&&cyc<2.6?1-(cyc-2.2)/.4:0;h.up=h.t>0?rise:0;
  h.crack.material.opacity=h.t>0&&(warn||up)?(warn?.3+.4*Math.sin(t*20)*.5+.2:.55):0;h.g.visible=h.up>.02;h.g.position.set(h.x,h.y-3.2+h.up*3.2,h.z);h.g.rotation.y=Math.sin(t*3+h.d)*.4;}
 for(const m of chr.mets){m.t+=dt;const cyc=m.t%3.1;if(m.t>0&&cyc<dt*1.5){m.d=m.d0+Math.random()*m.span;m.off=(Math.random()-.5)*13;const p=samplePos(m.d,m.off,_sp);m.x=p.x;m.z=p.z;m.gy=p.y;m.ring.position.set(p.x,p.y+.1,p.z);m.hit=false;if(live&&pl&&Math.hypot(pl.x-p.x,pl.z-p.z)<90)SFX.meteor();}
  const f=m.t>0?Math.min(1,cyc/1.3):0;m.ring.material.opacity=m.t>0&&cyc<1.35?.35+.45*Math.abs(Math.sin(t*12)):0;m.m.visible=m.t>0&&cyc<1.3;m.m.position.set(m.x+(1-f)*14,m.gy+(1-f)*42,m.z-(1-f)*8);
  if(m.t>0&&cyc>=1.3&&!m.hit){m.hit=true;for(let i=0;i<14;i++){const a=Math.random()*TAU;emit(m.x,m.gy+.5,m.z,i%2?0xff4fd8:0xffd36b,Math.sin(a)*7,3+Math.random()*4,Math.cos(a)*7,.6);}if(live&&pl){const dd=Math.hypot(pl.x-m.x,pl.z-m.z);if(dd<40){SFX.boom(Math.max(.3,1-dd/40));shake=Math.max(shake,.3*(1-dd/40));}}m.boom=.25;}
  m.boom=Math.max(0,(m.boom||0)-dt);}
 if(course.theme==='haunted'&&live){chr.next-=dt;if(chr.next<=0){chr.next=11+Math.random()*7;chr.flash=.5;SFX.thunder();}chr.flash=Math.max(0,chr.flash-dt);
  if(!flashEl){flashEl=document.body.appendChild(document.createElement('div'));flashEl.style.cssText='position:fixed;inset:0;background:#eef4ff;pointer-events:none;z-index:4;opacity:0';}
  flashEl.style.opacity=String(chr.flash>.3?(chr.flash-.3)*4:chr.flash>.12&&chr.flash<.2?.35:0);}
 else if(flashEl)flashEl.style.opacity='0';}
function characterHits(r,me){if(!chr)return;
 // R59: Streifen statt Wand - kein Rueckprall, keine Betaeubung (die deckelte das Tempo), danach 1,2 s durchfahren
 for(const c of chr.cows){if((r.cowPass||0)>elapsed)break;const dx=r.x-c.x,dz=r.z-c.z,d2=dx*dx+dz*dz;if(d2<7.3&&(r.y||0)<trackAt(c.d).h+2.5){const dl=Math.sqrt(d2)||1,nx=dx/dl,nz=dz/dl;
  r.vx+=nx*4;r.vz+=nz*4;hitKart(r,0,.72);r.cowPass=elapsed+1.2;c.walk=1;c.tgt=(Math.sign(c.off)||1)*9.5;c.moo=0;
  if(me){stats.cowHits++;SFX.moo();toast('MUH!',.8,'bad');}break;}}
 for(const gt of chr.gates){if(Math.abs(wrapDiff(r.distance,gt.d))>1.4)continue;for(const h of gt.halves){if(!h.down||r.offset*h.side<1.2)continue;
   const t=tanAt(r.distance),back=Math.sign(wrapDiff(r.distance,gt.d))||-1;r.x+=t.x*back*.8;r.z+=t.z*back*.8;const vf=r.vx*t.x+r.vz*t.z;r.vx-=t.x*vf*1.3;r.vz-=t.z*vf*1.3;if((r.gateCd||0)<elapsed){r.gateCd=elapsed+1;hitKart(r,.4,.4);if(me){SFX.bump(1);toast('SCHRANKE!',.7,'bad');}}}}
 for(const h of chr.hands){if(h.up<.6)continue;const dx=r.x-h.x,dz=r.z-h.z;if(dx*dx+dz*dz>5.3||(r.handCd||0)>elapsed)continue;r.handCd=elapsed+2;if(r.shield>0){r.shield=0;burst(r,0xffe263,10);continue;}
  hitKart(r,.9,.3);loseSpores(r,1);burst(r,0x7dffb0,14);if(me){stats.grabs++;SFX.grab();toast('GEPACKT!',.9,'bad');}}
 for(const m of chr.mets){if(!m.boom)continue;const dx=r.x-m.x,dz=r.z-m.z;if(dx*dx+dz*dz>16||(r.metCd||0)>elapsed)continue;r.metCd=elapsed+1.5;if(r.shield>0){r.shield=0;continue;}r.air=true;r.airT=0;r.vy=8;r.y=(r.y||0)+.1;hitKart(r,1,.5);loseSpores(r,1);if(me){stats.meteorHits++;SFX.hit();toast('STERNSCHNUPPE!',.9,'bad');}}}
function updateSwingers(t=elapsed){const pl=racers[0];for(const s of swingers){const fb=s.fire&&s.side?fireballAt(t,s.ph,s.side):null,off=fb?fb.off:Math.sin(t*s.spd+s.ph)*s.amp,p=samplePos(s.d,off,_sp);s.x=p.x;s.z=p.z;if(fb){s.active=fb.vis&&fb.y<2.4;s.mesh.visible=fb.vis;}
 if(s.kind==='ghost'){s.y=p.y+.9+Math.sin(t*2.2+s.ph)*.45;s.mesh.position.set(p.x,s.y,p.z);const face=pl?Math.atan2(pl.x-p.x,pl.z-p.z):t;s.mesh.rotation.set(0,face,-Math.cos(t*s.spd+s.ph)*.25);const near=pl&&Math.hypot(pl.x-p.x,pl.z-p.z)<18;s.nearK=(s.nearK||0)+((near?1:0)-(s.nearK||0))*.08;s.mesh.scale.setScalar(1.2+s.nearK*.35);}
 else{s.mesh.position.copy(p);s.mesh.rotation.y=t*1.5+s.ph;
  if(s.fire){const fl=1+Math.sin(t*9+s.ph*3)*.12;s.mesh.scale.setScalar(1.5*fl);s.mesh.position.y=p.y+(fb?fb.y:1.4+Math.sin(t*3+s.ph)*.35);if(fb)s.mesh.rotation.y=sample(s.d).angle+(s.side>0?-Math.PI/2:Math.PI/2);
   s.cd=Math.max(0,(s.cd||0)-.016);
   if(pl&&state==='race'){const dd=Math.hypot(pl.x-p.x,pl.z-p.z);if(dd<20&&!s.cd){s.cd=1.4;SFX.fire(Math.max(.25,1-dd/20));}}}}}}

// ---------------------------------------------------------------- R60: Schildkroeten-Bucht, Eisstock-See, Riesendom
// Mechanik in surface.mjs. Alle Modelle prozedural (im Container gab es kein Blender): je Modell eine Geometrie mit
// Vertexfarben ("gebacken") plus hoechstens ein Leucht- oder Glasmaterial - 1-2 Draw-Calls je Modellart, als Instanzen.
const R60P=new Map(),_r6c=new T.Color();
function r60Bake(parts){const gs=[];for(const [g0,col] of parts){let g=g0.index?g0.toNonIndexed():g0;for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal')g.deleteAttribute(k);
  if(!g.attributes.normal)g.computeVertexNormals();_r6c.setHex(col);const n=g.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=_r6c.r;a[i*3+1]=_r6c.g;a[i*3+2]=_r6c.b;}g.setAttribute('color',new T.BufferAttribute(a,3));gs.push(g);}
 return mergeGeometries(gs,false);}
function r60Proto(key,build){let g=R60P.get(key);if(!g){g=build();if(g.traverse)markShared(g);else for(const v of Object.values(g)){if(v.traverse)markShared(v);else if(v.isBufferGeometry)sharedGeo.add(v);}R60P.set(key,g);}return g;}
function r60Group(list){const g=new T.Group();for(const [geo,m,shadow=true] of list){const o=new T.Mesh(geo,m);o.castShadow=shadow;o.receiveShadow=true;g.add(o);}return g;}
const r60Mat=p=>stdMat({vertexColors:true,roughness:.86,...p});
const r60Glow=(col,i=1.2)=>stdMat({color:col,emissive:col,emissiveIntensity:i,roughness:.4});
// Instanzen: list [{x,y,z,s,sy,ry,rx,rz,col}] - Material "Paint" wird je Instanz eingefaerbt, sway wiegt im Wind
function r60Inst(proto,list,sway=0){const out=[];if(!list.length)return out;proto.traverse(o=>{if(!o.isMesh)return;let m=o.material;const paint=m.name==='Paint';if(sway&&!paint)m=swayMat(m,sway);
  const im=new T.InstancedMesh(o.geometry,m,list.length);im.castShadow=o.castShadow;im.receiveShadow=true;
  list.forEach((t,i)=>{_e.set(t.rx||0,t.ry||0,t.rz||0);_q.setFromEuler(_e);const s=t.s||1;_m.compose(_v.set(t.x,t.y||0,t.z),_q,_s.set(s*(t.sx||1),s*(t.sy||1),s));im.setMatrixAt(i,_m);if(paint)im.setColorAt(i,_col.setHex(t.col??0xffffff));});
  im.computeBoundingSphere();world.add(im);out.push(im);});return out;}
// Freie Stellen aus einer Liste [cp, Seite, Versatz]: Blickrichtung zur Strasse (lokal +z), Hindernis gleich eintragen
function r60Spots(list,off0,rad,obst=true){const out=[];for(const [v,side,o2] of list||[]){const d=cpDist(v),of=side*(o2||off0),s=decoSpot(d,of,rad);if(!s)continue;
  const c=sample(d,0).p;out.push({d,off:of,side,x:s.p.x,y:Math.max(0,groundAt(d,of).y),z:s.p.z,ry:Math.atan2(c.x-s.p.x,c.z-s.p.z)});if(obst)addObstacle(s.p.x,s.p.z,rad*.8);}return out;}
function stripeTex(a,b,n=8,vert=false){return canvasTex(64,64,(q,w,h)=>{for(let i=0;i<n;i++){q.fillStyle=i%2?b:a;if(vert)q.fillRect(i*w/n,0,w/n+1,h);else q.fillRect(0,i*h/n,w,h/n+1);}});}

// ---------- Modelle Schildkroeten-Bucht
function palmProto(){return r60Proto('palm',()=>{const trunk=[],leaf=[];let x=0,y=0;
 for(let i=0;i<7;i++){const h=1.25,r0=.36-.026*i,r1=r0-.026,tilt=.04+i*.035,g=new T.CylinderGeometry(r1,r0*1.1,h,7,1);g.rotateZ(-tilt);g.translate(x+Math.sin(tilt)*h/2,y+Math.cos(tilt)*h/2,0);trunk.push([g,i%2?0x8e6c46:0x7a5a38]);x+=Math.sin(tilt)*h;y+=Math.cos(tilt)*h;}
 for(let k=0;k<3;k++){const a=k*2.1;trunk.push([new T.SphereGeometry(.24,8,6).translate(x+Math.cos(a)*.3,y-.28,Math.sin(a)*.3),0x5a3a1e]);}
 for(let k=0;k<9;k++){const a=k/9*TAU+(k%2)*.25,L=3.4+(k%3)*.5,g=new T.PlaneGeometry(1,L,1,7),pos=g.attributes.position;
  for(let i=0;i<pos.count;i++){const u=(pos.getY(i)+L/2)/L,w=pos.getX(i)*(1.15-u)*1.05;pos.setXYZ(i,w,u*.7-u*u*2.1,u*L);}
  g.computeVertexNormals();g.rotateY(a);g.translate(x,y+.05,0);leaf.push([g,[0x3faa4a,0x4fbf52,0x2e9444][k%3]]);}
 return r60Group([[r60Bake(trunk),r60Mat({roughness:.95})],[r60Bake(leaf),r60Mat({roughness:.75,side:T.DoubleSide})]]);});}
function hutProto(){return r60Proto('hut',()=>{const p=[];
 for(const [x,z] of [[-2.2,-1.7],[2.2,-1.7],[-2.2,1.7],[2.2,1.7]])p.push([new T.CylinderGeometry(.14,.16,1.2,6).translate(x,.6,z),0x6a4a2a]);
 p.push([new T.BoxGeometry(5.2,.25,4.2).translate(0,1.25,0),0x9a6a3e],[new T.BoxGeometry(4.6,2.3,3.6).translate(0,2.5,0),0xd49a5a],[new T.BoxGeometry(1.1,1.8,.1).translate(0,2.2,1.82),0x4a2e18],
  [new T.BoxGeometry(1.2,.8,.1).translate(-1.5,2.8,1.82),0x2a6a8a],[new T.BoxGeometry(1.2,.8,.1).translate(1.5,2.8,1.82),0x2a6a8a],[new T.BoxGeometry(4.6,.35,.5).translate(0,1.85,2.05),0xb07a44]);
 const roof=new T.ConeGeometry(4.3,2.4,4,1);roof.rotateY(Math.PI/4);p.push([roof.translate(0,4.85,0),0xe2c26e]);
 const fr=new T.CylinderGeometry(3.4,3.5,.45,4,1,true);fr.rotateY(Math.PI/4);p.push([fr.translate(0,3.6,0),0xcfa84e]);
 return r60Group([[r60Bake(p),r60Mat({side:T.DoubleSide})]]);});}
function chairProto(){return r60Proto('strandkorb',()=>{const p=[],f=[];
 p.push([new T.BoxGeometry(1.6,.7,1.0).translate(0,.35,0),0xe8d8b0],[new T.BoxGeometry(1.5,.12,.8).translate(0,.76,.08),0xf4efe0]);
 for(let k=0;k<6;k++){const g=new T.CylinderGeometry(.82,.82,1.25,6,1,true,-Math.PI/2+k*Math.PI/6,Math.PI/6);g.rotateX(Math.PI/2);g.rotateZ(Math.PI/2);g.scale(1,1.1,.9);g.translate(0,1.55,-.12);f.push([g,k%2?0xffffff:0x2a78d8]);}
 p.push([new T.BoxGeometry(1.6,1.2,.14).translate(0,1.3,-.5),0xe8d8b0]);
 return r60Group([[r60Bake(p),r60Mat()],[r60Bake(f),r60Mat({side:T.DoubleSide})]]);});}
function parasolProto(){return r60Proto('schirm',()=>{const p=[[new T.CylinderGeometry(.05,.06,2.7,6).translate(0,1.35,0),0xf4efe0]],c=[];
 for(let k=0;k<10;k++)c.push([new T.ConeGeometry(1.9,.7,2,1,true,k*TAU/10,TAU/10).translate(0,2.75,0),k%2?0xffffff:0xff5a4a]);
 return r60Group([[r60Bake(p),r60Mat()],[r60Bake(c),r60Mat({side:T.DoubleSide})]]);});}
function boardProto(){return r60Proto('brett',()=>{const b=new T.CapsuleGeometry(.3,1.7,4,10);b.scale(1,1,.16);b.translate(0,1.2,0);
 const paint=stdMat({name:'Paint',color:0xffffff,roughness:.35});
 return r60Group([[b,paint],[r60Bake([[new T.BoxGeometry(.04,.3,.25).translate(0,.45,-.06),0x222222],[new T.BoxGeometry(.62,.08,.06).translate(0,1.4,.05),0xffffff]]),r60Mat()]]);});}
function lighthouseProto(){return r60Proto('leuchtturm',()=>{const p=[];for(let i=0;i<5;i++){const y0=i*3.4,r0=2.7-i*.22,r1=r0-.22;p.push([new T.CylinderGeometry(r1,r0,3.4,18).translate(0,y0+1.7,0),i%2?0xffffff:0xe03a2e]);}
 p.push([new T.CylinderGeometry(3.3,3.6,1.2,18).translate(0,.6,0),0x8a8a8a],[new T.CylinderGeometry(2.2,2.2,.3,18).translate(0,17.1,0),0x2a2a2a],[new T.TorusGeometry(2.05,.07,5,24).rotateX(Math.PI/2).translate(0,17.9,0),0x2a2a2a],
  [new T.ConeGeometry(1.7,1.6,18).translate(0,20.1,0),0xe03a2e],[new T.SphereGeometry(.25,8,6).translate(0,21,0),0x2a2a2a]);
 for(let k=0;k<8;k++){const a=k/8*TAU;p.push([new T.BoxGeometry(.08,.8,.08).translate(Math.cos(a)*2.05,17.5,Math.sin(a)*2.05),0x2a2a2a]);}
 const lamp=new T.CylinderGeometry(1.3,1.3,1.7,14).translate(0,18.4,0);
 return r60Group([[r60Bake(p),r60Mat({roughness:.7})],[lamp,r60Glow(0xfff2b0,1.6),false]]);});}
function crabProto(){return r60Proto('krabbe',()=>{const p=[],red=0xe8482a,dk=0xb8321c;
 p.push([new T.SphereGeometry(1,16,10).scale(.95,.42,.72).translate(0,.62,0),red]);
 for(const sx of [-1,1]){p.push([new T.CylinderGeometry(.05,.06,.55,5).translate(sx*.28,1.15,.38),dk],[new T.SphereGeometry(.15,10,8).translate(sx*.28,1.45,.4),0xffffff],[new T.SphereGeometry(.075,8,6).translate(sx*.3,1.47,.53),0x111111]);
  p.push([new T.CylinderGeometry(.09,.11,.7,6).rotateZ(sx*1.1).translate(sx*.95,.8,.45),dk],[new T.SphereGeometry(.38,10,8).scale(1,.7,.8).translate(sx*1.35,1.02,.62),red],[new T.ConeGeometry(.16,.5,6).rotateX(Math.PI/2).translate(sx*1.25,1.1,1.0),red]);
  for(let k=0;k<3;k++){const g=new T.CylinderGeometry(.05,.07,1.05,5);g.rotateZ(sx*1.05);g.translate(sx*1.08,.36,-.35+k*.32);p.push([g,dk]);}}
 return r60Group([[r60Bake(p),r60Mat({roughness:.5})]]);});}
function turtleProto(){return r60Proto('schildkroete',()=>{const p=[[new T.SphereGeometry(1,16,10,0,TAU,0,Math.PI/2).scale(1.05,.42,1.35),0x5a7a36],[new T.CylinderGeometry(1.02,1.02,.12,16).scale(1,1,1.3).translate(0,.02,0),0xd8c890],
  [new T.SphereGeometry(.34,10,8).scale(1,.8,1.2).translate(0,.1,1.6),0x8aa860]];
 for(const [sx,z,l] of [[-1,.7,1.3],[1,.7,1.3],[-1,-.8,.7],[1,-.8,.7]])p.push([new T.BoxGeometry(l,.08,.45).rotateY(sx*(z>0?-.35:.4)).translate(sx*(.95+l*.35),.02,z),0x8aa860]);
 for(let k=0;k<6;k++){const a=k/6*TAU;p.push([new T.CircleGeometry(.28,6).rotateX(-Math.PI/2).translate(Math.cos(a)*.55,.37,Math.sin(a)*.7),0x3f5a24]);}
 return r60Group([[r60Bake(p),r60Mat({roughness:.6,side:T.DoubleSide}),false]]);});}
// ---------- Modelle Eisstock-See
function firProto(){return r60Proto('tanne',()=>{const p=[[new T.CylinderGeometry(.22,.3,1.6,6).translate(0,.8,0),0x5a3a22]];
 for(let k=0;k<4;k++){const r=2.2-k*.46,y=1.3+k*1.35;p.push([new T.ConeGeometry(r,2.1,8).translate(0,y+1.05,0),k%2?0x1f5a3a:0x245f40],[new T.ConeGeometry(r*.78,.9,8).translate(0,y+1.72,0),0xf4f8fc]);}
 return r60Group([[r60Bake(p),r60Mat({flatShading:true})]]);});}
function snowmanProto(){return r60Proto('schneemann',()=>{const w=0xf6f9fc,p=[[new T.SphereGeometry(1,14,10).translate(0,.9,0),w],[new T.SphereGeometry(.74,14,10).translate(0,2.25,0),w],[new T.SphereGeometry(.52,14,10).translate(0,3.3,0),w],
  [new T.ConeGeometry(.1,.55,8).rotateX(Math.PI/2).translate(0,3.3,.72),0xff7a1a],[new T.CylinderGeometry(.42,.42,.08,14).translate(0,3.72,0),0x1a1a1a],[new T.CylinderGeometry(.3,.32,.55,14).translate(0,4.0,0),0x1a1a1a],
  [new T.TorusGeometry(.56,.13,6,16).rotateX(Math.PI/2).translate(0,2.85,0),0xd7263d],[new T.BoxGeometry(.2,.7,.06).translate(.3,2.5,.62),0xd7263d]];
 for(const [x,y,z] of [[-.17,3.45,.46],[.17,3.45,.46],[0,2.45,.72],[0,2.15,.74],[0,1.2,.98]])p.push([new T.SphereGeometry(.06,6,5).translate(x,y,z),0x111111]);
 for(const sx of [-1,1])p.push([new T.CylinderGeometry(.04,.05,1.4,5).rotateZ(sx*1.1).translate(sx*1.2,2.6,0),0x5a3a22]);
 return r60Group([[r60Bake(p),r60Mat({roughness:.95})]]);});}
// Eisstock (bayerisches Eisstockschiessen): runder Stock mit Laufsohle, farbigem Ring und langem Stiel - hier riesig
function curlProto(){return r60Proto('eisstock',()=>{const p=[[new T.CylinderGeometry(1.55,1.7,.8,24).translate(0,.4,0),0x8a5a2e],[new T.CylinderGeometry(1.72,1.72,.18,24).translate(0,.1,0),0x2a2a2a],
  [new T.CylinderGeometry(.16,.2,2.6,8).rotateX(.18).translate(0,2.0,.2),0x6a4222],[new T.SphereGeometry(.28,10,8).translate(0,3.3,.44),0x3a2a1a]];
 const ring=new T.CylinderGeometry(1.58,1.58,.26,24,1,true).translate(0,.62,0);
 return r60Group([[r60Bake(p),r60Mat({roughness:.55})],[ring,stdMat({name:'Paint',color:0xffffff,roughness:.35,side:T.DoubleSide})]]);});}
function iceBlockMats(){return r60Proto('eisblock',()=>r60Group([[new T.BoxGeometry(2.3,2.1,2.3).translate(0,1.05,0),stdMat({color:0xbfe9ff,transparent:true,opacity:.62,roughness:.06,metalness:.1,emissive:0x5fb0e8,emissiveIntensity:.28,depthWrite:false})],
 [new T.BoxGeometry(1.5,1.4,1.5).rotateY(.5).translate(0,1.05,0),stdMat({color:0xf2fbff,transparent:true,opacity:.55,roughness:.2,emissive:0xcfefff,emissiveIntensity:.3})]]));}
function fishHutProto(){return r60Proto('eishuette',()=>{const p=[[new T.BoxGeometry(2.6,2.2,2.6).translate(0,1.1,0),0xa8322a],[new T.BoxGeometry(.8,1.5,.08).translate(0,.75,1.33),0x5a2a18]];
 const roof=new T.CylinderGeometry(1.9,1.9,3.0,3,1);roof.rotateZ(Math.PI/2);roof.scale(1,.55,1);p.push([roof.translate(0,2.75,0),0xf6f9fc],[new T.CircleGeometry(.7,12).rotateX(-Math.PI/2).translate(2.2,.04,.6),0x1a3a5a]);
 return r60Group([[r60Bake(p),r60Mat({side:T.DoubleSide})]]);});}
function cabinProto(){return r60Proto('almhuette',()=>{const p=[[new T.BoxGeometry(9,1.2,7).translate(0,.6,0),0x8a8a8a],[new T.BoxGeometry(8.4,3.4,6.4).translate(0,2.9,0),0x7a4a28],[new T.BoxGeometry(1.4,2.2,.1).translate(0,2.3,3.22),0x3a2212],
  [new T.BoxGeometry(1.2,4,1.2).translate(2.6,6.4,-1.2),0x7a7a7a],[new T.BoxGeometry(9.6,.25,.35).translate(0,4.45,3.4),0x5a3a1e]];
 const roof=new T.CylinderGeometry(5.2,5.2,10,3,1);roof.rotateZ(Math.PI/2);roof.scale(1,.42,1);p.push([roof.translate(0,5.6,0),0xf6f9fc]);
 const win=[];for(const x of [-2.6,2.6])win.push(new T.BoxGeometry(1.2,1,.1).translate(x,3.2,3.22));
 return r60Group([[r60Bake(p),r60Mat({side:T.DoubleSide})],[mergeGeometries(win),r60Glow(0xffc86a,1.1),false]]);});}
function chapelProto(){return r60Proto('kapelle',()=>{const w=0xf6f1e6,p=[[new T.BoxGeometry(6,5.5,10).translate(0,2.75,0),w],[new T.BoxGeometry(3,10,3).translate(0,5,-6),w],[new T.BoxGeometry(1.6,2.6,.1).translate(0,1.3,5.05),0x5a3a22]];
 const r2=new T.CylinderGeometry(4,4,10.6,3,1);r2.rotateZ(Math.PI/2);r2.rotateY(Math.PI/2);r2.scale(.85,.6,1);p.push([r2.translate(0,6.6,0),0x8a3a2a]);
 const pts=[];for(let i=0;i<=14;i++){const t=i/14,r=t<.55?1.2+Math.sin(t/.55*Math.PI)*.75:1.2*(1-(t-.55)/.45)+.02;pts.push(new T.Vector2(Math.max(.02,t<.55?r*(1-t*.3):r),t*3.6));}
 p.push([new T.LatheGeometry(pts,14).translate(0,10,-6),0x4a8a6a],[new T.BoxGeometry(.12,1.2,.12).translate(0,14.2,-6),0xd8b040],[new T.BoxGeometry(.7,.12,.12).translate(0,14.4,-6),0xd8b040]);
 for(const z of [-2,1.5])for(const sx of [-1,1])p.push([new T.BoxGeometry(.1,1.8,1).translate(sx*3.02,3.2,z),0x5a88c8]);
 return r60Group([[r60Bake(p),r60Mat({side:T.DoubleSide})]]);});}
function mountainGeo(random,n,R0,R1){const p=[];for(let i=0;i<n;i++){const a=i/n*TAU+random()*.25,r=(R0+random()*(R1-R0))*WK,rad=28+random()*34,h=60+random()*70,x=Math.cos(a)*r,z=Math.sin(a)*r;
 p.push([new T.ConeGeometry(rad,h,7,1).translate(x,h/2-12,z),random()<.5?0x7a8ca0:0x8a9aae],[new T.ConeGeometry(rad*.46,h*.46,7,1).translate(x,h-12-h*.23+.4,z),0xf6f9fc]);}return r60Bake(p);}

// ---------- Modelle Riesendom
const DOME_STONE=0xd9c9a6,DOME_DARK=0xa8987a,DOME_GOLD=0xe8b84a,DOME_ROOF=0x5a6078;
function sentinelParts(){return r60Proto('waechter',()=>{const s=DOME_STONE,g=DOME_GOLD,d=0x8e8a9a,p=[
  [new T.BoxGeometry(4.4,1.4,4.4).translate(0,.7,0),DOME_DARK],[new T.BoxGeometry(1.25,4.2,1.35).translate(-.8,3.5,0),d],[new T.BoxGeometry(1.25,4.2,1.35).translate(.8,3.5,0),d],
  [new T.BoxGeometry(1.5,1.1,1.9).translate(-.8,1.95,.25),d],[new T.BoxGeometry(1.5,1.1,1.9).translate(.8,1.95,.25),d],
  [new T.CylinderGeometry(1.35,1.9,2.6,8).translate(0,6.6,0),d],[new T.BoxGeometry(3.4,3.6,2.1).translate(0,8.9,0),d],[new T.BoxGeometry(2.6,2.6,.25).translate(0,9.1,1.1),g],
  [new T.SphereGeometry(1.15,12,8).scale(1,.8,1).translate(-2.1,10.5,0),d],[new T.SphereGeometry(1.15,12,8).scale(1,.8,1).translate(2.1,10.5,0),d],
  [new T.CylinderGeometry(.85,.95,1.6,10).translate(0,11.8,0),d],[new T.ConeGeometry(.95,.9,10).translate(0,13.05,0),d],[new T.BoxGeometry(.25,1.4,2.2).translate(0,13.2,-.1),g],
  [new T.BoxGeometry(.8,3.6,.8).rotateZ(-.12).translate(-2.4,8.6,0),d],
  // Schild am linken Arm (aussen), Umhang hinten
  [new T.CylinderGeometry(1.7,1.7,.3,16).scale(1,1,1.35).rotateZ(Math.PI/2).translate(-3.05,7.6,.3),g],[new T.CylinderGeometry(1.35,1.35,.32,16).scale(1,1,1.35).rotateZ(Math.PI/2).translate(-3.1,7.6,.3),0x6a3a8a],
  [new T.BoxGeometry(3.2,7.5,.2).translate(0,6.4,-1.15),0x5a2a7a]];
 const eyes=new T.BoxGeometry(.9,.14,.1).translate(0,12.0,.9);
 return {body:r60Group([[r60Bake(p),r60Mat({roughness:.7,metalness:.25})]]),eyes};});}
// Hellebarde: Drehpunkt am Fuss (Ursprung), Schaft nach +y, Axtblatt und Spitze oben
function halberdGeo(){return r60Proto('hellebarde',()=>{const L=SENT.reach,p=[[new T.CylinderGeometry(.42,.48,L,10).translate(0,L/2,0),0x5a3a22]];for(let k=1;k<7;k++)p.push([new T.CylinderGeometry(.52,.52,.35,10).translate(0,L*k/7,0),DOME_GOLD]);
 const blade=new T.Shape();blade.moveTo(0,-1.6);blade.quadraticCurveTo(2.6,-1.2,2.8,.2);blade.quadraticCurveTo(2.6,1.5,0,1.9);blade.lineTo(0,-1.6);
 const bg=new T.ExtrudeGeometry(blade,{depth:.22,bevelEnabled:false,curveSegments:8});bg.translate(0,0,-.11);p.push([bg.clone().translate(.25,L-2.2,0),0xc8ccd8],[new T.ConeGeometry(.35,2.2,6).translate(0,L+1.0,0),0xc8ccd8],[new T.BoxGeometry(1.4,.4,.3).translate(-.8,L-2.4,0),0xc8ccd8]);
 return r60Group([[r60Bake(p),r60Mat({roughness:.4,metalness:.55})]]);});}
// Spitzbogen ueber die Strasse (lokal: x quer, y hoch, z = Tiefe)
function archProto(){return r60Proto('spitzbogen',()=>{const sh=new T.Shape(),W=14.6,Wi=11.6,H=12,Hi=10.6,top=22,topi=19.2;
 sh.moveTo(-W,0);sh.lineTo(-W,H);sh.quadraticCurveTo(-W,top*.92,0,top);sh.quadraticCurveTo(W,top*.92,W,H);sh.lineTo(W,0);sh.lineTo(Wi,0);sh.lineTo(Wi,Hi);sh.quadraticCurveTo(Wi,topi*.9,0,topi);sh.quadraticCurveTo(-Wi,topi*.9,-Wi,Hi);sh.lineTo(-Wi,0);sh.lineTo(-W,0);
 const g=new T.ExtrudeGeometry(sh,{depth:2.2,bevelEnabled:false,curveSegments:10});g.translate(0,0,-1.1);
 const p=[[g,DOME_STONE],[new T.BoxGeometry(2.2,1.6,2.8).translate(0,topi+.4,0),DOME_GOLD]];for(const sx of [-1,1])p.push([new T.BoxGeometry(3.6,1.2,3.4).translate(sx*13.1,.6,0),DOME_DARK],[new T.ConeGeometry(.9,3.4,4).translate(sx*13.1,H+4.2,0),DOME_STONE]);
 return r60Group([[r60Bake(p),r60Mat()]]);});}
function saintProto(){return r60Proto('heiliger',()=>r60Group([[r60Bake([[new T.BoxGeometry(2.4,2.2,2.4).translate(0,1.1,0),DOME_DARK],[new T.ConeGeometry(1.25,4.6,10).translate(0,4.5,0),DOME_STONE],[new T.SphereGeometry(.95,10,8).scale(1.1,.6,.9).translate(0,6.4,0),DOME_STONE],
 [new T.SphereGeometry(.55,10,8).translate(0,7.2,0),DOME_STONE],[new T.BoxGeometry(.35,2.4,.35).rotateZ(.5).translate(.8,5.6,.5),DOME_STONE],[new T.TorusGeometry(.72,.08,6,18).translate(0,7.55,-.25),DOME_GOLD]]),r60Mat({roughness:.75,metalness:.12})]]));}
function candleProto(){return r60Proto('leuchter',()=>{const p=[[new T.CylinderGeometry(.9,1.1,.35,10).translate(0,.18,0),0x2a2230],[new T.CylinderGeometry(.09,.12,4.2,6).translate(0,2.3,0),0x2a2230],[new T.TorusGeometry(.9,.07,5,14,Math.PI).rotateX(Math.PI).translate(0,4.3,0),0x2a2230]],fl=[];
 for(const x of [-.9,0,.9]){p.push([new T.CylinderGeometry(.11,.11,.55,6).translate(x,x?4.55:4.95,0),0xf4ecd8]);fl.push(new T.ConeGeometry(.12,.38,6).translate(x,(x?4.55:4.95)+.46,0));}
 return r60Group([[r60Bake(p),r60Mat({roughness:.5,metalness:.4})],[mergeGeometries(fl),r60Glow(0xffb84a,2.2),false]]);});}
function bannerProto(){return r60Proto('banner',()=>{const tex=canvasTex(64,192,(q,w,h)=>{q.fillStyle='#ffffff';q.fillRect(0,0,w,h);q.fillStyle='#e8b84a';q.fillRect(0,0,6,h);q.fillRect(w-6,0,6,h);
  q.beginPath();q.moveTo(0,h-26);q.lineTo(w/2,h-2);q.lineTo(w,h-26);q.lineTo(w,h);q.lineTo(0,h);q.fill();q.beginPath();q.arc(w/2,70,17,0,TAU);q.fill();q.fillStyle='#ffffff';q.beginPath();q.arc(w/2,70,10,0,TAU);q.fill();
  q.fillStyle='#e8b84a';for(let k=0;k<8;k++){const a=k/8*TAU;q.fillRect(w/2+Math.cos(a)*22-2,70+Math.sin(a)*22-2,4,4);}});
 const g=new T.PlaneGeometry(1.7,5.6,1,6).translate(0,5.4,.12),cut=g.attributes.position;for(let i=0;i<cut.count;i++)if(cut.getY(i)<2.8)cut.setY(i,cut.getY(i)+(Math.abs(cut.getX(i))<.1?-.4:0));
 return r60Group([[r60Bake([[new T.CylinderGeometry(.09,.12,9,6).translate(0,4.5,0),0x2a2230],[new T.BoxGeometry(2.1,.12,.12).translate(0,8.25,.12),0x2a2230],[new T.SphereGeometry(.2,8,6).translate(0,9.1,0),DOME_GOLD]]),r60Mat({metalness:.3})],
  [g,stdMat({name:'Paint',map:tex,color:0xffffff,roughness:.8,side:T.DoubleSide})]]);});}
// Buergerhaus der Goetterstadt: schmaler Sandsteinbau, steiles Schieferdach, zwei Fensterreihen (leuchten warm), Erkertuermchen
function houseProto(){return r60Proto('stadthaus',()=>{const p=[[new T.BoxGeometry(8,11,7).translate(0,5.5,0),DOME_STONE],[new T.BoxGeometry(8.6,.8,7.6).translate(0,.4,0),DOME_DARK],[new T.BoxGeometry(8.4,.5,7.4).translate(0,11.2,0),DOME_DARK],
  [new T.CylinderGeometry(1.2,1.2,5,8).translate(3.6,12,3.2),DOME_STONE],[new T.ConeGeometry(1.6,4.2,8).translate(3.6,16.6,3.2),DOME_ROOF],[new T.BoxGeometry(1.8,3.2,.3).translate(0,1.6,3.55),0x4a3a2a]];
 const roof=new T.ConeGeometry(6.2,7,4,1);roof.rotateY(Math.PI/4);roof.scale(1,1,.85);p.push([roof.translate(0,14.9,0),DOME_ROOF]);
 const w=[];for(const y of [4.6,8.2])for(const x of [-2.4,2.4]){w.push(new T.BoxGeometry(1.1,2,.2).translate(x,y,3.55));w.push(new T.BoxGeometry(.2,2,1.1).translate(4.05,y,x*.8));w.push(new T.BoxGeometry(.2,2,1.1).translate(-4.05,y,x*.8));}
 return r60Group([[r60Bake(p),r60Mat({roughness:.85})],[mergeGeometries(w),r60Glow(0xffc070,.85),false]]);});}
function cypressProto(){return r60Proto('zypresse',()=>r60Group([[r60Bake([[new T.CylinderGeometry(.16,.22,1.4,6).translate(0,.7,0),0x5a3a22],[new T.SphereGeometry(1,10,12).scale(1.05,5.2,1.05).translate(0,5.6,0),0x2f4a2a],[new T.SphereGeometry(1,8,8).scale(.7,2.4,.7).translate(.3,8.8,.1),0x3a5a30]]),r60Mat({roughness:.95})]]));}
function columnProto(){return r60Proto('saeule',()=>r60Group([[r60Bake([[new T.BoxGeometry(2.4,.6,2.4).translate(0,.3,0),DOME_DARK],[new T.CylinderGeometry(.8,.9,6.4,14).translate(0,3.6,0),DOME_STONE],[new T.BoxGeometry(2.2,.7,2.2).translate(0,7.1,0),DOME_STONE],[new T.CylinderGeometry(.8,.8,1.4,14).rotateZ(1.4).translate(1.8,.7,1.6),DOME_STONE]]),r60Mat()]]));}
// Tuerme im Hintergrund auf Felspfeilern, die aus dem Wolkenmeer ragen (eine Geometrie, Fenster leuchten)
function spireGeo(random,n){const p=[],w=[];for(let i=0;i<n;i++){const a=i/n*TAU+random()*.3,r=(236+random()*95)*WK,x=Math.cos(a)*r,z=Math.sin(a)*r,h=34+random()*42,bw=6+random()*5;
 p.push([new T.CylinderGeometry(bw*1.3,bw*2.2,110,7).translate(x,-55-10,z),0x6a5a58],[new T.BoxGeometry(bw,h,bw).translate(x,h/2-10,z),random()<.5?DOME_STONE:DOME_DARK],[new T.ConeGeometry(bw*.8,h*.55,4).rotateY(Math.PI/4).translate(x,h-10+h*.275,z),DOME_ROOF]);
 for(let k=0;k<3;k++)w.push(new T.BoxGeometry(bw*1.02,2.6,.8).translate(x,h*(.35+k*.2)-10,z));}
 return {body:r60Bake(p),win:mergeGeometries(w)};}
// ---------- Aufbau (frueh: Figuren, Hindernisse, Zonen) und spaet (nach der Strasse: Belaege, Wasser, Bruecken-Zierrat)
const r60SeaSide=d=>{const a=sample(d,30).p,b=sample(d,-30).p;return Math.hypot(a.x,a.z)>Math.hypot(b.x,b.z)?1:-1;};
// flaches Band neben der Strasse (Querversatz o0..o1, feste Hoehe y) - fuer Brandungswasser und Seeufer
function r60Band(d0,d1,o0,o1,y,steps,uvLen=20){const n=steps+1,v=new Float32Array(n*6),uv=new Float32Array(n*4),idx=[];
 for(let i=0;i<n;i++){const d=d0+(d1-d0)*i/steps;for(let s=0;s<2;s++){const p=sample(d,s?o1:o0).p;v.set([p.x,y,p.z],(i*2+s)*3);uv.set([s,(d-d0)/uvLen],(i*2+s)*2);}if(i<steps){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(v,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();if(g.attributes.normal.getY(0)<0)for(let i=0;i<g.attributes.normal.count;i++)g.attributes.normal.setY(i,Math.abs(g.attributes.normal.getY(i)));return g;}
function buildR60(){r60=null;const C=course;if(!C.surf&&!C.tide&&!C.crabs&&!C.bay&&!C.ice&&!C.curling&&!C.blocks&&!C.snow&&!C.sentinels&&!C.dome)return;
 r60={surf:[],tide:null,crabs:[],turtles:[],beam:null,ice:[],curls:[],blocks:[],sents:[],smoke:null,flames:[],lake:null,glowMats:[]};
 // --- Bucht: Brandung, Krabben, Strandleben, Leuchtturm, Schildkroeten im Meer
 for(const [a,b] of C.surf||[]){const s=cpDist(a),span=lapDist(cpDist(b)-s),side=r60SeaSide(s+span/2);r60.surf.push({s,span,side,ph:r60.surf.length*.37,front:null,mesh:null,hitT:new Map()});
  for(let x=0;x<=span;x+=12){const q=sample(s+x,side*34).p;zones.push({d:NaN,half:0,x:q.x,z:q.z,r:21});}}
 for(const [a,b,n] of C.crabs||[]){const d0=cpDist(a),span=lapDist(cpDist(b)-d0);for(let k=0;k<n;k++){const g=cloneProto(crabProto());g.scale.setScalar(1.25);world.add(g);
  r60.crabs.push({g,d:lapDist(d0+span*(k+.5)/n),off:(k%2?1:-1)*(7+k%3),tgt:0,pause:.5+k*.7,walk:0,x:0,z:0,ph:k*1.3,click:0,flee:0});}}
 const B=C.bay;if(B){const pl=r60Spots(B.palms,14,2.2).map(t=>({...t,s:.95+((t.d*7)%5)/10,ry:(t.d*1.7)%TAU}));r60Inst(palmProto(),pl,.018);
  r60Inst(hutProto(),r60Spots(B.huts,26,4.4));r60Inst(chairProto(),r60Spots(B.chairs,17,1.4).map(t=>({...t,ry:t.ry+Math.PI})));
  r60Inst(parasolProto(),r60Spots(B.shades,20,1.8,false));r60Inst(boardProto(),r60Spots(B.boards,16,.8,false).map((t,i)=>({...t,rz:(i%2?.15:-.12),col:[0xff6a3d,0x2ec4b6,0xffd23f,0xff4f8b,0x7a5cff][i%5]})));
  if(B.light){const [sp]=r60Spots([B.light],34,4.2);if(sp){const g=cloneProto(lighthouseProto());g.position.set(sp.x,sp.y,sp.z);world.add(g);zones.push({d:sp.d,half:0,x:sp.x,z:sp.z,r:12});
   const beam=new T.Group();beam.position.set(sp.x,sp.y+18.4,sp.z);const bm=new T.MeshBasicMaterial({color:0xfff2b0,transparent:true,opacity:.2,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false});
   for(const s of [1,-1]){const c=new T.Mesh(new T.ConeGeometry(4.5,70,16,1,true),bm);c.rotation.z=s*Math.PI/2;c.position.x=s*35;beam.add(c);}world.add(beam);r60.beam=beam;}}
  const tp=turtleProto();for(let i=0;i<(B.turtles||0);i++){const g=cloneProto(tp);g.scale.setScalar(1.3+(i%3)*.25);world.add(g);r60.turtles.push({g,a:i/B.turtles*TAU+Math.random()*.3,r:(218+(i%4)*9)*WK,v:(.012+Math.random()*.01)*(i%2?1:-1),ph:i*1.7});}}
 // --- Eisstock-See: Glatteis-Abschnitte, Eisstoecke, Eisbloecke, Winterdorf
 r60.ice=(C.ice||[]).map(([a,b])=>({s:cpDist(a),e:cpDist(b),span:lapDist(cpDist(b)-cpDist(a))}));
 if(r60.ice.length){const z=r60.ice[0],pts=[];let sx=0,sz=0;for(let x=0;x<=z.span;x+=6){const p=sample(z.s+x,0).p;pts.push(p);sx+=p.x;sz+=p.z;}const cx=sx/pts.length,cz=sz/pts.length;let r=0;for(const p of pts)r=Math.max(r,Math.hypot(p.x-cx,p.z-cz));
  r60.lake={x:cx,z:cz,r:Math.min(r+24,96),k:1};zones.push({d:NaN,half:0,x:cx,z:cz,r:r60.lake.r+3});}
 const cp=C.curling?curlProto():null;for(const [v,amp,spd,ph] of C.curling||[]){const g=cloneProto(cp);g.scale.setScalar(1.05);world.add(g);g.traverse(o=>{if(o.isMesh&&o.material.name==='Paint'){o.material=o.material.clone();o.material.color.setHex(r60.curls.length%2?0x2f6bff:0xd7263d);}});
  r60.curls.push({g,d:cpDist(v),amp,spd,ph,off:0,x:0,z:0,rot:0});}
 const ib=C.blocks?iceBlockMats():null;for(const [v,off] of C.blocks||[]){const d=cpDist(v),g=cloneProto(ib),p=samplePos(d,off,new T.Vector3());g.position.copy(p);g.rotation.y=sample(d).angle+off*.3;world.add(g);r60.blocks.push({g,d,off,x:p.x,z:p.z,broke:null});}
 const S=C.snow;if(S){r60Inst(firProto(),r60Spots(S.firs,15,2.4).map(t=>({...t,s:.9+((t.d*3)%6)/10})),.008);r60Inst(snowmanProto(),r60Spots(S.men,16,1.4));
  if(S.cabin){const [sp]=r60Spots([S.cabin],34,6);if(sp){const g=cloneProto(cabinProto());g.position.set(sp.x,sp.y,sp.z);g.rotation.y=sp.ry;world.add(g);zones.push({d:sp.d,half:0,x:sp.x,z:sp.z,r:12});
   const ch=new T.Vector3(2.6,8.6,-1.2).applyEuler(new T.Euler(0,sp.ry,0)).add(g.position);r60.smoke={x:ch.x,y:ch.y,z:ch.z,t:0};}}
  if(S.chapel){const [sp]=r60Spots([S.chapel],40,7);if(sp){const g=cloneProto(chapelProto());g.position.set(sp.x,sp.y,sp.z);g.rotation.y=sp.ry;world.add(g);zones.push({d:sp.d,half:0,x:sp.x,z:sp.z,r:14});}}
  if(S.lane){const [sp]=r60Spots([S.lane],30,5,false);if(sp){const g=new T.Group();g.position.set(sp.x,sp.y,sp.z);g.rotation.y=sp.ry+Math.PI/2;world.add(g);
   mesh(new T.PlaneGeometry(3.6,26).rotateX(-Math.PI/2),stdMat({color:0xd8f0ff,roughness:.1,metalness:.05}),g,0,.06,0).castShadow=false;
   for(const sx of [-1,1])box(g,mat(0x2f6bff),sx*1.95,.25,0,.2,.5,26);const st=cloneProto(curlProto());st.scale.setScalar(.32);st.position.set(0,.06,-9);g.add(st);const s2=cloneProto(curlProto());s2.scale.setScalar(.32);s2.position.set(.8,.06,10.5);g.add(s2);
   const sign=mesh(new T.PlaneGeometry(7,1.2),label('EISSTOCKSCHIESSEN','#2f6bff','#ffffff',768,130),g,0,2.6,-13.6);sign.castShadow=false;box(g,dark,-3.2,1.2,-13.6,.12,2.4,.12);box(g,dark,3.2,1.2,-13.6,.12,2.4,.12);
   g.updateMatrixWorld(true);for(let z=-12;z<=12;z+=6){const v=new T.Vector3(0,0,z).applyMatrix4(g.matrixWorld);addObstacle(v.x,v.z,2.2);}}}}
 // --- Riesendom: Kathedrale ums Kirchenschiff, Waechter, Boegen, Heilige, Leuchter, Banner, Zypressen, Saeulen
 const Dm=C.dome;if(Dm||C.sentinels){const sp=sentinelParts(),hb=halberdGeo();
  for(const [v,side,ph] of C.sentinels||[]){const d=cpDist(v),s=sample(d,0),base=sample(d,side*(SENT.base+.9)).p,piv=sample(d,side*(SENT.base-.9)).p,gy=Math.max(0,groundAt(d,side*SENT.base).y);
   const g=cloneProto(sp.body);g.position.set(base.x,gy,base.z);g.rotation.y=s.angle+(side>0?-Math.PI/2:Math.PI/2);world.add(g);
   const eyeM=r60Glow(0xffb040,.2),eyes=new T.Mesh(sp.eyes,eyeM);g.add(eyes);
   const pv=new T.Group();pv.position.set(piv.x,gy+.3,piv.z);pv.rotation.y=s.angle;const h=cloneProto(hb);pv.add(h);world.add(pv);
   // Warnstreifen: zeigt beim Ausholen, wo die Hellebarde aufschlaegt
   const [lo,hi]=sentinelSpan(side),wm=new T.MeshBasicMaterial({color:0xff3a2a,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});const warn=addStrip(strip(d-SENT.band,d+SENT.band,(lo+hi)/2,hi-lo,.1,4,4),wm,false);warn.renderOrder=2;warn.castShadow=false;
   addObstacle(base.x,base.z,2.6);zones.push({d,half:0,x:base.x,z:base.z,r:6});r60.sents.push({d,side,ph:ph||0,g,pv,eyeM,wm,st:null,boomT:-9,x:piv.x,z:piv.z});}}
 if(Dm){r60Inst(saintProto(),r60Spots(Dm.statues,16,1.9).map(t=>({...t,s:1.05})));
  const cl=r60Spots(Dm.candles,13,1.1);r60Inst(candleProto(),cl);r60.flames=cl.map(t=>new T.Vector3(t.x,t.y+5.2,t.z));
  r60Inst(bannerProto(),r60Spots(Dm.banners,12.6,.6).map((t,i)=>({...t,col:i%2?0x5a2a8a:0x8a2a3a})),.012);
  r60Inst(cypressProto(),r60Spots(Dm.cypress,16,1.6).map(t=>({...t,s:.9+((t.d*5)%4)/10})),.006);
  r60Inst(columnProto(),r60Spots(Dm.columns,17,1.8).map(t=>({...t,sy:.7+((t.d*3)%5)/10})));
  // Spitzboegen quer ueber die Strasse: nur wo frei (kein Tunnel, keine Bruecke, keine Rollzone, kein Looping)
  const ap=archProto(),arches=[];for(const [v] of Dm.arches||[]){const d=cpDist(v);if(inZone(d,20)||inTunnel(d)||inBridge(d)||hasRoll(d)||nearLoop(d)||inGap(d)||raiseH(d)>.5||forkAt(d,20))continue;
   const s=sample(d,0);arches.push({x:s.p.x,y:Math.max(0,s.p.y)-.2,z:s.p.z,ry:s.angle});for(const sd of [-1,1]){const q=sample(d,sd*13.1).p;addObstacle(q.x,q.z,1.9);}}
  r60Inst(ap,arches);
  r60Cathedral();}}
// Kathedrale um den Kirchenschiff-Tunnel: Seitenwaende mit Buntglasfenstern, Strebepfeiler, Dach, Westfassade mit zwei
// Tuermen, Chor mit Rosette und goldene Kuppel ueber der Vierung. Steht als Gruppe laengs der (geraden) Tunnelachse.
function r60Cathedral(){const t=(course.tunnel||[]).find(q=>q[2]==='nave');if(!t)return;const s0=cpDist(t[0]),span=lapDist(cpDist(t[1])-s0),a=sample(s0,0).p,b=sample(s0+span,0).p;
 const L=span+6,cx=(a.x+b.x)/2,cz=(a.z+b.z)/2,ang=Math.atan2(b.x-a.x,b.z-a.z),gy=Math.max(0,Math.min(groundAt(s0,0).y,groundAt(s0+span,0).y));
 const g=new T.Group();g.position.set(cx,gy,cz);g.rotation.y=ang;world.add(g);const S=DOME_STONE,Dk=DOME_DARK,p=[],glass=[],gold=[];
 const W=19.5,H=24;
 for(const sx of [-1,1]){p.push([new T.BoxGeometry(2.2,H,L).translate(sx*W,H/2,0),S]);
  for(let z=-L/2+6;z<=L/2-6;z+=9){p.push([new T.BoxGeometry(3.2,H+4,3).translate(sx*(W+2.4),(H+4)/2,z),Dk],[new T.ConeGeometry(1.3,5,4).rotateY(Math.PI/4).translate(sx*(W+2.4),H+6.5,z),S]);
   const arch=new T.BoxGeometry(6.5,1.1,1.1);arch.rotateZ(sx*-.72);p.push([arch.translate(sx*(W+1.6),H+1.2,z),S]);
   if(z+4.5<L/2-4)glass.push(new T.PlaneGeometry(3.2,11).rotateY(sx*Math.PI/2).translate(sx*(W+1.12),H*.52,z+4.5),new T.PlaneGeometry(3.2,11).rotateY(-sx*Math.PI/2).translate(sx*(W-1.12),H*.52,z+4.5));}}
 // Dach (Satteldach aus zwei Platten) und First
 for(const sx of [-1,1]){const r=new T.BoxGeometry(W*1.18,1.2,L+2);r.rotateZ(sx*-.62);p.push([r.translate(sx*W*.46,H+7.2,0),DOME_ROOF]);}
 p.push([new T.BoxGeometry(1.2,1.2,L+2).translate(0,H+13.4,0),Dk]);
 // Westfassade (Einfahrt, lokal -z) mit Portal-Aussparung und zwei Tuermen; Ostseite (Ausfahrt) mit Rosette
 for(const [zz,towers] of [[-L/2,1],[L/2,0]]){const dz=zz<0?-1:1;
  for(const sx of [-1,1])p.push([new T.BoxGeometry(W-13.6+2.2,H+6,3).translate(sx*(13.6+(W-13.6)/2+.4),(H+6)/2,zz+dz*.4),S]);
  p.push([new T.BoxGeometry(27.6,H+6-11.6,3).translate(0,11.6+(H+6-11.6)/2,zz+dz*.4),S]);
  const gab=new T.ConeGeometry(W*1.02,12,3);gab.rotateY(Math.PI/2);gab.scale(1,1,.12);p.push([gab.translate(0,H+6+5.4,zz+dz*.4),S]);
  gold.push(new T.TorusGeometry(4.6,.35,6,32).translate(0,H-.5,zz+dz*2.05));glass.push(new T.CircleGeometry(4.4,28).rotateY(dz<0?Math.PI:0).translate(0,H-.5,zz+dz*2));
  if(towers)for(const sx of [-1,1]){const tx=sx*(W+3.5);p.push([new T.BoxGeometry(8,52,8).translate(tx,26,zz+dz*1.5),S],[new T.BoxGeometry(9,2,9).translate(tx,52.6,zz+dz*1.5),Dk],[new T.ConeGeometry(5.2,26,4).rotateY(Math.PI/4).translate(tx,66.5,zz+dz*1.5),DOME_ROOF]);
   for(const cx2 of [-3.4,3.4])p.push([new T.ConeGeometry(.9,6,4).translate(tx+cx2,56.5,zz+dz*1.5+3.4),S]);
   glass.push(new T.PlaneGeometry(2.4,9).rotateY(dz<0?Math.PI:0).translate(tx,34,zz+dz*5.52),new T.PlaneGeometry(2.4,9).rotateY(dz<0?Math.PI:0).translate(tx,18,zz+dz*5.52));
   gold.push(new T.SphereGeometry(.7,8,6).translate(tx,80.3,zz+dz*1.5));}}
 // Kuppel ueber der Vierung
 const kz=L*.12;p.push([new T.CylinderGeometry(13,14,8,24).translate(0,H+15,kz),S]);gold.push(new T.SphereGeometry(13.2,28,14,0,TAU,0,Math.PI/2).translate(0,H+19,kz),new T.CylinderGeometry(1.6,2,4,10).translate(0,H+33.8,kz),new T.ConeGeometry(1.4,5,10).translate(0,H+38.3,kz));
 for(let k=0;k<12;k++){const a2=k/12*TAU;glass.push(new T.PlaneGeometry(1.8,4.2).rotateY(a2+Math.PI/2).translate(Math.cos(a2)*14.05,H+15,kz-Math.sin(a2)*14.05));}
 g.add(r60Group([[r60Bake(p),r60Mat({roughness:.82,side:T.DoubleSide})],[mergeGeometries(gold),stdMat({color:DOME_GOLD,roughness:.28,metalness:.85,emissive:0x5a3a08,emissiveIntensity:.35})],
  [mergeGeometries(glass),r60GlassMat(),false]]));
 g.updateMatrixWorld(true);const v=new T.Vector3();for(let z=-L/2;z<=L/2;z+=4)for(const sx of [-1,1]){v.set(sx*(W+1),0,z).applyMatrix4(g.matrixWorld);addObstacle(v.x,v.z,2.4);}
 for(const sx of [-1,1]){v.set(sx*(W+3.5),0,-L/2-1.5).applyMatrix4(g.matrixWorld);addObstacle(v.x,v.z,5.8);}
 zones.push({d:lapDist(s0+span/2),half:span/2+14,x:cx,z:cz,r:Math.hypot(W+8,L/2)+6});}
// Buntglas: Farbfelder mit Bleiruten, leuchtet von innen (Abendsonne)
let _r60Glass=null;
function r60GlassMat(){if(_r60Glass)return _r60Glass;const tex=canvasTex(64,128,(q,w,h)=>{q.fillStyle='#1a1020';q.fillRect(0,0,w,h);const cols=['#e8b84a','#3a6ad8','#c83a4a','#4ab87a','#8a5ad8','#f0d890'];let sd=7;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
  for(let y=4;y<h-4;y+=10)for(let x=4;x<w-4;x+=10){q.fillStyle=cols[Math.floor(rnd()*cols.length)];q.fillRect(x,y,8,8);}q.strokeStyle='#1a1020';q.lineWidth=3;q.beginPath();q.arc(w/2,h*.3,w*.34,0,TAU);q.stroke();});
 _r60Glass=stdMat({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:1.15,roughness:.3,side:T.DoubleSide});persistentMats.add(_r60Glass);return _r60Glass;}
function r60IceTex(){return r60Proto('eistex',()=>{const t=canvasTex(128,256,(q,w,h)=>{const g=q.createLinearGradient(0,0,w,0);g.addColorStop(0,'#cfeeff');g.addColorStop(.5,'#9fd8f8');g.addColorStop(1,'#cfeeff');q.fillStyle=g;q.fillRect(0,0,w,h);
  let sd=11;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;q.strokeStyle='rgba(255,255,255,.75)';q.lineWidth=1.2;
  for(let k=0;k<14;k++){let x=rnd()*w,y=rnd()*h;q.beginPath();q.moveTo(x,y);for(let m=0;m<5;m++){x+=(rnd()-.5)*40;y+=(rnd()-.5)*40;q.lineTo(x,y);}q.stroke();}
  q.strokeStyle='rgba(255,255,255,.35)';q.lineWidth=2.5;for(let k=0;k<30;k++){const x=rnd()*w,y=rnd()*h;q.beginPath();q.moveTo(x,y);q.lineTo(x+(rnd()-.5)*8,y+10+rnd()*30);q.stroke();}},true);return {t};}).t;}
function r60OnIce(d){if(!r60||!r60.ice.length)return false;const dl=lapDist(d);for(const z of r60.ice)if(lapDist(dl-z.s)<=z.span)return true;return false;}
function buildR60Late(){if(!r60)return;const C=course;
 // Glatteis: glaenzender Eisbelag ueber der Fahrbahn und ein zugefrorener See darunter
 if(r60.ice.length){const it=r60IceTex(),iceM=stdMat({map:it,color:0xffffff,roughness:.06,metalness:.18,emissive:0x2a6a9a,emissiveIntensity:.12,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  for(const z of r60.ice){const m=addStrip(strip(z.s,z.s+z.span,0,15.6,.086,16,Math.ceil(z.span/1.2)),iceM);m.castShadow=false;
   // Warnschild am Eisanfang
   const s0=sample(z.s-8,0);for(const sd of [-1,1]){const q=sample(z.s-8,sd*12.4),g=new T.Group();g.position.copy(q.p);g.position.y=Math.max(0,q.p.y);g.rotation.y=s0.angle+Math.PI;world.add(g);box(g,dark,0,1.2,0,.12,2.4,.12);
    mesh(new T.PlaneGeometry(3.2,1.1),label('❄ GLATTEIS','#2f6bff','#ffffff',512,170),g,0,2.6,.02).castShadow=false;addObstacle(q.p.x,q.p.z,.5);}}
  if(r60.lake){const L=r60.lake,lm=stdMat({map:it,color:0xe8f6ff,roughness:.1,metalness:.12,emissive:0x2a5a8a,emissiveIntensity:.1});
   const disc=mesh(new T.CircleGeometry(L.r,64).rotateX(-Math.PI/2),lm,world,L.x,.025,L.z);disc.castShadow=false;disc.scale.set(1,1,L.k);
   const rim=mesh(new T.RingGeometry(L.r,L.r+5,64).rotateX(-Math.PI/2),stdMat({color:0xffffff,roughness:1}),world,L.x,.03,L.z);rim.castShadow=false;rim.scale.set(1,1,L.k);}}
 // Gezeiten: Wasser ueber Insel und Abzweigung, dazu ein Schild mit Ebbe/Flut am Abzweig
 if(C.tide&&forks.length){const f=forks[C.tide[0]]||forks[0],N=f.pts.length-1,s=f.side;let i0=0,i1=N;while(i0<N&&!forkEdges(f.pts[i0],s))i0++;while(i1>0&&!forkEdges(f.pts[i1],s))i1--;
  const wm=stdMat({color:0x2fc6da,transparent:true,opacity:.78,roughness:.12,metalness:.08,emissive:0x0a3a48,emissiveIntensity:.3,depthWrite:false});r60.glowMats.push(wm);
  const water=addStrip(polyStripVar(f.pts,Math.max(0,i0-2),Math.min(N,i1+2),p=>{const e=forkEdges(p,s);const o=e?e.outer+11:MAIN_EDGE+.5;return {c:s*(MAIN_EDGE+.4+o)/2,w:Math.max(0,o-MAIN_EDGE-.4)};},0,10),wm,false);
  water.renderOrder=2;water.castShadow=false;
  const txt=(t,bg)=>{const m=label(t,bg,'#ffffff',640,150);m.side=T.DoubleSide;return m;},signs={dry:txt('🏝 EBBE · SANDBANK FREI','#1f9a5a'),warn:txt('🌊 DIE FLUT KOMMT!','#e8871a'),wet:txt('🌊 FLUT · SANDBANK ZU','#d33a2a')};
  const d0=f.dA-14,s0=sample(d0,0),q=sample(d0,s*12.2),g=new T.Group();g.position.copy(q.p);g.position.y=Math.max(0,q.p.y);g.rotation.y=s0.angle+Math.PI;world.add(g);
  box(g,dark,-1.7,1.5,0,.14,3,.14);box(g,dark,1.7,1.5,0,.14,3,.14);const sg=mesh(new T.PlaneGeometry(4.4,1.05),signs.dry,g,0,3.1,.05);sg.castShadow=false;addObstacle(q.p.x,q.p.z,1.2);
  r60.tide={f,i0,i1,water,signs,sign:sg,state:'dry',lvl:0,flooded:false};}
 // Brandung: flaches Wasser auf der Meerseite und je Zone eine Welle, die ueber die Strasse rollt (Verschiebung im Shader)
 for(const z of r60.surf){const steps=Math.ceil(z.span/2),side=z.side;
  const sw=stdMat({color:0x38d0e0,transparent:true,opacity:.7,roughness:.1,metalness:.06,emissive:0x0a3a48,emissiveIntensity:.25,depthWrite:false});r60.glowMats.push(sw);
  const band=addStrip(r60Band(z.s-12,z.s+z.span+12,side*13.4,side*62,.05,steps+12),sw,false);band.renderOrder=1;band.castShadow=false;
  addStrip(r60Band(z.s-12,z.s+z.span+12,side*12.9,side*14.2,.06,steps+12),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.75,depthWrite:false}),false).castShadow=false;
  // Welle: vier Laengslinien (Vorderkante, Kamm, Ruecken, Hinterkante) mit Vertexfarbe inkl. Alpha
  const prof=[[-2.2,.05,[1,1,1,.85]],[-1.3,1.45,[1,1,1,1]],[-.3,1.1,[.62,.9,.96,.95]],[1.4,.55,[.2,.7,.84,.85]],[3.6,.05,[.12,.6,.76,.3]]],L=prof.length,n=steps+1,pos=[],col=[],aq=[],idx=[],_p=new T.Vector3();
  for(let i=0;i<n;i++){const d=z.s+z.span*i/steps,t=tanAt(d),fade=Math.min(1,i/4,(n-1-i)/4),wob=1+.18*Math.sin(i*.9);for(const [lo,y,c] of prof){const l=-side*lo;posAt(d,l,y*fade*wob+.12,_p);pos.push(_p.x,_p.y,_p.z);col.push(c[0],c[1],c[2],c[3]*fade);aq.push(t.z,0,-t.x);}
   if(i<n-1)for(let k=0;k<L-1;k++){const a=i*L+k;idx.push(a,a+L,a+1,a+1,a+L,a+L+1);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,4));g.setAttribute('aQ',new T.Float32BufferAttribute(aq,3));g.setIndex(idx);g.computeVertexNormals();
  const u={uOff:{value:0}},wv=stdMat({vertexColors:true,transparent:true,depthWrite:false,roughness:.25,side:T.DoubleSide,emissive:0x0a3a48,emissiveIntensity:.35});r60.glowMats.push(wv);
  wv.onBeforeCompile=sh=>{sh.uniforms.uOff=u.uOff;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 aQ;uniform float uOff;').replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed+=aQ*uOff;');};
  wv.customProgramCacheKey=()=>'r60wave';const m=new T.Mesh(g,wv);m.frustumCulled=false;m.renderOrder=3;m.visible=false;world.add(m);z.mesh=m;z.u=u;}
 // Riesendom: Strebepfeiler mit Strebeboegen neben der Hochbruecke
 if(course.theme==='dome'){const p=[];for(const q of raises){if(!q.bridge)continue;const span=lapDist(q.e-q.s);for(let o=q.r+6;o<span-q.r-4;o+=26){const d=q.s+o,h=trackAt(d).h;if(h<4)continue;
   for(const side of [-1,1]){const tp=sample(d,side*21).p;if(nearOtherRoad(tp.x,tp.z,d,14))continue;const s=sample(d,0),ang=s.angle;
    p.push([new T.BoxGeometry(3.6,h+9,3.6).rotateY(ang).translate(tp.x,(h+9)/2-.5,tp.z),DOME_DARK],[new T.ConeGeometry(1.8,6,4).rotateY(ang+Math.PI/4).translate(tp.x,h+11.4,tp.z),DOME_STONE]);
    const e=sample(d,side*9.6).p,mx=(tp.x+e.x)/2,mz=(tp.z+e.z)/2,len=Math.hypot(tp.x-e.x,tp.z-e.z),fb=new T.BoxGeometry(1.4,1.3,len+2);fb.rotateX(-Math.atan2(7,len));fb.rotateY(Math.atan2(tp.x-e.x,tp.z-e.z));p.push([fb.translate(mx,h+4.2,mz),DOME_STONE]);addObstacle(tp.x,tp.z,2.6);}}}
  if(p.length)world.add(r60Group([[r60Bake(p),r60Mat()]]));}}
// ---------- Bewegung (auch im Menue, dann ohne Ton)
function updateR60(dt,t,live=true){if(!r60)return;const pl=racers[0];
 for(const z of r60.surf){const f=surfFront(t,z.side,z.ph);z.front=f;if(!z.mesh)continue;z.mesh.visible=!!f;if(!f)continue;z.u.uOff.value=f.off;
  if(live&&pl&&f.k>.3&&f.k<.36&&!z.crash&&Math.abs(wrapDiff(pl.distance,z.s+z.span/2))<z.span/2+50){z.crash=1;if(soundOn&&ctx){sfxNoise(1.1,1600,260,.16,.7);}}if(f.k<.2)z.crash=0;
  if(pl&&frame%3===0&&Math.abs(wrapDiff(pl.distance,z.s+z.span/2))<z.span/2+30){const d=pl.distance+8+Math.random()*30,p=samplePos(d,f.off-z.side*.9,_sp,1);emit(p.x,p.y,p.z,0xffffff,(Math.random()-.5)*2,1.5+Math.random()*2,(Math.random()-.5)*2,.4);}}
 const T6=r60.tide;if(T6){const l=tideLevel(t);T6.lvl=l;T6.flooded=tideFlooded(l);T6.water.position.y=-.62+l*.98;T6.water.visible=l>.03;
  const st=T6.flooded?'wet':(l>TIDE.warn*.5&&tideRising(t))?'warn':'dry';if(st!==T6.state){T6.state=st;T6.sign.material=T6.signs[st];}
  if(st==='warn')T6.sign.visible=Math.sin(t*9)>-.3;else T6.sign.visible=true;}
 for(const c of r60.crabs){c.pause-=dt;c.flee=Math.max(0,c.flee-dt);if(c.pause<=0&&!c.walk){c.walk=1;const sd=Math.sign(c.off)||1;c.tgt=(Math.random()<.45?-sd:sd)*(7+Math.random()*4);}
  if(c.walk){const dir=Math.sign(c.tgt-c.off),sp=c.flee>0?6:Math.abs(c.off)<8.6?3.4:1.8;c.off+=dir*sp*dt;if(Math.abs(c.tgt-c.off)<.2){c.walk=0;c.pause=1.5+Math.random()*3;}}
  const p=samplePos(c.d,c.off,_sp),s=sample(c.d);c.x=p.x;c.z=p.z;c.g.position.set(p.x,Math.max(0,groundAt(c.d,c.off).y)+(c.walk?Math.abs(Math.sin(t*16+c.ph))*.08:0),p.z);
  c.g.rotation.set(0,s.angle+(c.walk?Math.sin(t*16+c.ph)*.08:Math.sin(t*1.3+c.ph)*.25),c.walk?Math.sin(t*16+c.ph)*.06:0);
  c.click=Math.max(0,c.click-dt);if(live&&pl&&!c.click&&c.walk&&Math.hypot(pl.x-p.x,pl.z-p.z)<14){c.click=1.4;sfxTone(2400,1800,.04,'square',.02);sfxTone(2600,2000,.04,'square',.02,.08);}}
 for(const q of r60.turtles){q.a+=q.v*dt;const x=Math.cos(q.a)*q.r,z=Math.sin(q.a)*q.r;q.g.position.set(x,(r60.seaY??-2.7)+.35+Math.sin(t*1.1+q.ph)*.12,z);q.g.rotation.set(Math.sin(t*1.7+q.ph)*.06,Math.atan2(-Math.sin(q.a)*Math.sign(q.v),Math.cos(q.a)*Math.sign(q.v)),Math.sin(t*2.2+q.ph)*.08);}
 if(r60.beam){r60.beam.rotation.y+=dt*.8;const k=nightK();for(const c of r60.beam.children)c.material.opacity=.025+.3*k;}
 for(const c of r60.curls){const off=curlOff(t,c.amp,c.spd,c.ph),v=c.amp*c.spd*Math.cos(t*c.spd+c.ph);c.off=off;c.v=v;const p=samplePos(c.d,off,_sp);c.x=p.x;c.z=p.z;c.g.position.copy(p);c.rot+=v*dt*.35;c.g.rotation.y=sample(c.d).angle+c.rot;}
 for(const b of r60.blocks){const sc=blockScale(t,b.broke);if(b.broke!==null&&sc>=1)b.broke=null;b.g.visible=sc>.01;b.g.scale.set(Math.max(.001,sc),Math.max(.001,sc),Math.max(.001,sc));}
 for(const s of r60.sents){const st=sentinelState(t,s.ph),was=s.st;s.st=st;s.pv.rotation.z=s.side*st.ang;s.eyeM.emissiveIntensity=st.warn?2.2+Math.sin(t*22)*1.2:.25;s.eyeM.emissive.setHex(st.warn?0xff5a2a:0xffb040);s.wm.opacity=st.phase==='windup'?.18+.22*Math.abs(Math.sin(t*9)):st.hot?.45:st.phase==='slam'?.4:0;
  if(was&&was.phase==='slam'&&st.phase==='lie'){s.boomT=t;const [lo,hi]=sentinelSpan(s.side);for(let k=0;k<10;k++){const o=lo+(hi-lo)*Math.random(),p=samplePos(s.d,o,_sp);emit(p.x,p.y+.3,p.z,0xd9c9a6,(Math.random()-.5)*6,2+Math.random()*3,(Math.random()-.5)*6,.6);}
   if(live&&pl){const dd=Math.hypot(pl.x-s.x,pl.z-s.z);if(dd<70){SFX.boom(Math.max(.25,1-dd/70));shake=Math.max(shake,.35*(1-dd/70));}}}}
 if(r60.smoke&&frame%9===0){const s=r60.smoke;emit(s.x+(Math.random()-.5)*.4,s.y,s.z+(Math.random()-.5)*.4,0xdde4ec,.4+Math.random()*.4,1.4+Math.random(),(Math.random()-.5)*.4,1.4);}
 for(const m of r60.glowMats){const k=wxM?(wxM.seaglow||0):0;m.emissiveIntensity=(m.userData.base??(m.userData.base=m.emissiveIntensity))+k*1.6;if(k>.01)m.emissive.setHex(0x1aa8ff);else m.emissive.setHex(0x0a3a48);}}
// ---------------------------------------------------------------- R63 Dreher, platt wie eine Flunder, Oelpfuetzen, Rueckspiegel
// Dreher (Nutzerwunsch, wie in klassischen Kart-Spielen): nach Banane, Such-/Blauer Brezn, Oel oder einem Rempler ohne Sporen
// dreht sich das Kart zwei-, dreimal um die eigene Achse und huepft dabei leicht. Stampfer druecken es papierduenn - es flattert
// wie ein Blatt und ploppt nach 1,9 s zurueck. Der Rueckspiegel blendet ein, wenn ein Geschoss hinter mir auf mich zufliegt.
function spinOut(r,turns=2,dur=1.1){if(r.spinO>0&&r.spinO>dur*.5)return;r.spinO=dur;r.spinD=dur;r.spinN=turns;emote(r,'angry');if(r.lastHitBy!==undefined&&r.lastHitBy!==r.id&&elapsed-(r.lastHitT??-9)<.4)emote(racers[r.lastHitBy],'happy');if(nearPlayer(r,45))SFX.spin(r.id===0?1:.45);if(nearPlayer(r,50))for(let k=0;k<8;k++){const a=k/8*TAU;emit(r.x+Math.sin(a)*1.2,(r.y||0)+.4,r.z+Math.cos(a)*1.2,0xd8d2c4,Math.sin(a)*2,1+Math.random(),Math.cos(a)*2,.5);}}
function flatten(r,dur=1.9){r.flat=dur;r.squash=0;if(nearPlayer(r,50))SFX.flat(r.id===0?1:.5);if(nearPlayer(r,60)){for(let k=0;k<10;k++)emit(r.x,(r.y||0)+.3,r.z,0xfff6d8,(Math.random()-.5)*6,.5+Math.random()*2,(Math.random()-.5)*6,.5);}}
function r63Tick(r,me,dt){
 if(r.flat>0){r.flat=Math.max(0,r.flat-dt);if(r.flat===0){r.squash=.6;if(me||nearPlayer(r,40)){if(!playClip('s_c_unflat',sfxGain,me?.8:.4)){sfxTone(240,720,.16,'square',.05);sfxTone(480,1100,.1,'triangle',.04,.08);}}}}
 if(oils.length&&!r.air&&Math.abs(r.speed)>6&&!((r.oilCd||0)>elapsed)){for(const o of oils){if(Math.abs(wrapDiff(r.distance,o.d))<o.r&&Math.abs(r.offset-o.off)<o.r*.9){r.oilCd=elapsed+1.4;
   if(r.shield>0||r.cannon>0||r.mega>0){burst(r,0xffe263,6);break;}spinOut(r,2,1.15);hitKart(r,.7,.55);if(me){toast('🌀 ÖLPFÜTZE!',1,'bad');SFX.slip?.();stats.hitsTaken=(stats.hitsTaken||0)+1;}break;}}}}
let oils=[];
function oilTex(){if(oilTex.t)return oilTex.t;oilTex.t=canvasTex(128,128,(q,w,h)=>{q.clearRect(0,0,w,h);const g=q.createRadialGradient(w/2,h/2,4,w/2,h/2,w/2);g.addColorStop(0,'#0c0b10');g.addColorStop(.72,'#141220');g.addColorStop(.86,'#1a1626cc');g.addColorStop(1,'#1a162600');q.fillStyle=g;q.beginPath();q.arc(w/2,h/2,w/2,0,7);q.fill();
  q.globalCompositeOperation='source-atop';for(let i=0;i<5;i++){const cols=['#ff3fd044','#3fd0ff44','#ffe23f44','#7dff5a44','#a86bff44'];q.strokeStyle=cols[i];q.lineWidth=5;q.beginPath();q.ellipse(w*(.4+Math.random()*.2),h*(.4+Math.random()*.2),w*(.12+i*.05),h*(.08+i*.04),Math.random()*3,0,7);q.stroke();}});return oilTex.t;}
function buildOil(){oils=[];const C=course.oil;if(!C)return;const m=stdMat({map:oilTex(),transparent:true,roughness:.05,metalness:.4,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
 for(const [v,off,rr] of C){const d=cpDist(v),g=addStrip(strip(d-rr,d+rr,off,rr*2,.1,rr*2,6),m,false);g.renderOrder=2;oils.push({d,off,r:rr});}}
const mirrorCam=new T.PerspectiveCamera(58,3.2,.3,420),_mv=new T.Vector2();let mirrorK=0;
const mirrorEl=document.createElement('div');mirrorEl.id='mirror';mirrorEl.hidden=true;mirrorEl.innerHTML='<b>⚠ VON HINTEN!</b>';document.body.append(mirrorEl);
function threatBehind(){const pl=racers[0];if(!pl||state!=='race'||pl.finishTime!==null)return false;
 for(const sh of shots){if(sh.spiky&&sh.owner!==0&&!sh.hit.has(0)){if(sh.free)return true;const gap=wrapDiff(pl.distance,sh.d);if(gap>-2&&gap<90)return true;}if(sh.target!==0)continue;if(sh.free)return true;const gap=wrapDiff(pl.distance,sh.d);if(gap>-2&&gap<90)return true;}
 for(const b of blues)if(b.target===0&&!b.dive)return true;return false;}
function renderMirror(dt){const want=threatBehind()?1:0;if(want&&mirrorK<.05&&state==='race')SFX.warnBehind();mirrorK+=(want-mirrorK)*Math.min(1,dt*9);if(mirrorK<.03){if(!mirrorEl.hidden)mirrorEl.hidden=true;return;}
 renderer.getSize(_mv);const W=_mv.x,H=_mv.y,w=Math.round(Math.min(440,W*.52)),h=Math.round(w/3.2),x=Math.round((W-w)/2),top=Math.round(H*.1+(W<700?64:40));
 mirrorEl.hidden=false;mirrorEl.style.cssText=`left:${x-4}px;top:${top-4}px;width:${w}px;height:${h}px;opacity:${Math.min(1,mirrorK*1.4).toFixed(2)}`;
 const pl=racers[0],hd=pl.h||0,p=pl.mesh.position;mirrorCam.aspect=w/h;mirrorCam.updateProjectionMatrix();mirrorCam.position.set(p.x+Math.sin(hd)*.4,p.y+2.3,p.z+Math.cos(hd)*.4);mirrorCam.up.set(0,1,0);mirrorCam.lookAt(p.x-Math.sin(hd)*25,p.y+1.2,p.z-Math.cos(hd)*25);
 const y=H-top-h;renderer.setScissorTest(true);renderer.setScissor(x,y,w,h);renderer.setViewport(x,y,w,h);renderer.render(scene,mirrorCam);renderer.setScissorTest(false);renderer.setViewport(0,0,W,H);}
// ---------------------------------------------------------------- R62 Intro-Fanfare (eigene Komposition, Chiptune)
// D-Dur, 160 bpm: Lead als 25-%-Pulswelle, Harmonie 50 %, Dreieck-Bass, Trommelwirbel und Becken zum Schluss (~4,7 s).
// Eigene Oszillatoren an einem eigenen Gain (zaehlt nicht gegen die Effekt-Obergrenze), Ueberspringen blendet aus.
let fanfare=null;const _pw={};
function pulseWave(d){if(_pw[d])return _pw[d];const n=40,re=new Float32Array(n),im=new Float32Array(n);for(let k=1;k<n;k++)re[k]=2*Math.sin(Math.PI*k*d)/(Math.PI*k);return _pw[d]=ctx.createPeriodicWave(re,im);}
const FANFARE=[  // [Stimme, Start (Achtel), Laenge (Achtel), MIDI]
 ['L',0,1,69],['L',1,1,74],['L',2,1,78],['L',3,3,81],['L',6,1,79],['L',7,1,78],['L',8,1,76],['L',9,1,74],['L',10,2,76],
 ['L',12,1,71],['L',13,1,74],['L',14,1,79],['L',15,3,83],['L',18,1,81],['L',19,1,83],['L',20,1,85],['L',21,5,86],
 ['H',0,1,66],['H',1,1,69],['H',2,1,74],['H',3,3,78],['H',6,1,74],['H',7,1,74],['H',8,1,73],['H',9,1,71],['H',10,2,73],
 ['H',12,1,67],['H',13,1,71],['H',14,1,74],['H',15,3,79],['H',18,1,78],['H',19,1,79],['H',20,1,81],['H',21,5,81],
 ['B',0,6,50],['B',6,6,45],['B',12,6,43],['B',18,3,45],['B',21,5,50]];
function playFanfare(){stopFanfare(0);if(!ctx||!soundOn)return;const g=ctx.createGain();g.gain.value=1;g.connect(sfxGain||masterGain);
 const t0=ctx.currentTime+.06,E=60/160/2,hz=m=>440*2**((m-69)/12);
 for(const [v,st,len,m] of FANFARE){const o=ctx.createOscillator(),e=ctx.createGain(),t=t0+st*E,d=len*E,vol=v==='L'?.085:v==='H'?.045:.11;
  if(v==='B')o.type='triangle';else o.setPeriodicWave(pulseWave(v==='L'?.25:.5));o.frequency.value=hz(m);
  if(v==='L'&&len>2){o.frequency.setValueAtTime(hz(m),t+.12);for(let k=0;k<Math.floor(d/.06);k++)o.frequency.setValueAtTime(hz(m)*(k%2?1.006:.994),t+.12+k*.06);}
  e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(vol,t+.012);e.gain.setValueAtTime(vol*.8,t+.06);e.gain.linearRampToValueAtTime(vol*.7,t+d*.8);e.gain.linearRampToValueAtTime(0,t+d*.98);
  o.connect(e);e.connect(g);o.start(t);o.stop(t+d+.05);}
 if(!noiseBuf){noiseBuf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const dd=noiseBuf.getChannelData(0);for(let i=0;i<dd.length;i++)dd[i]=Math.random()*2-1;}
 const hit=(t,dur,f,vol)=>{const n=ctx.createBufferSource(),bp=ctx.createBiquadFilter(),e=ctx.createGain();n.buffer=noiseBuf;bp.type='bandpass';bp.frequency.value=f;bp.Q.value=.8;
  e.gain.setValueAtTime(vol,t);e.gain.exponentialRampToValueAtTime(.001,t+dur);n.connect(bp);bp.connect(e);e.connect(g);n.start(t,Math.random());n.stop(t+dur+.02);};
 for(const st of [0,3,6,9,12,15])hit(t0+st*E,.12,1800,.12);
 for(let k=0;k<6;k++)hit(t0+(18+k*.5)*E,.08,2600,.06+k*.012);
 hit(t0+21*E,1.2,6000,.16);hit(t0+21*E,.25,900,.18);
 fanfare={g};}
function stopFanfare(fade=.1){if(!fanfare||!ctx){fanfare=null;return;}const g=fanfare.g;fanfare=null;try{g.gain.cancelScheduledValues(ctx.currentTime);g.gain.setTargetAtTime(0,ctx.currentTime,Math.max(.01,fade/3));setTimeout(()=>{try{g.disconnect();}catch(e){}},fade*1000+400);}catch(e){}}
// ---------------------------------------------------------------- R62 Kamerafahrt vor dem Start und der Luft-Loisl (assets/loisl.glb)
// Vor dem Countdown faehrt die Kamera tief an der Startaufstellung entlang (von hinten nach vorn, mit Namen), dann schwenkt
// sie hinter das eigene Kart; jede Taste ueberspringt. Der Luft-Loisl (eigene Figur: Bayer im fliegenden Masskrug mit
// Propeller) schwebt vor dem Feld mit der Startampel, zeigt bei falscher Richtung sein Schild und fischt Abgestuerzte mit
// der Angel aus Wasser und Abgrund.
const INTRO_S=4.6;let introT=0,introForce=false,introPrev=null,loisl=null;const _iv=new T.Vector3(),_iq=new T.Vector3();
function introCam(){const k=1-introT/INTRO_S,pl=racers[0];let dMin=1e9,dMax=-1e9;for(const r of racers){dMin=Math.min(dMin,r.distance);dMax=Math.max(dMax,r.distance);}
 if(k<.78){const u=k/.78,e=u*u*(3-2*u),d=dMax+16-(dMax+16-(dMin+4))*e,side=Math.sin(u*Math.PI)*2.5+6.5,p=samplePos(d,side,_iv),q=samplePos(d-9,-.5,_iq);
  camera.up.set(0,1,0);camera.position.set(p.x,p.y+2.3+Math.sin(u*Math.PI)*1.6,p.z);camera.lookAt(q.x,q.y+1,q.z);
  let near=null,best=1e9;for(const r of racers){const a=Math.abs(r.distance-(d-6));if(a<best){best=a;near=r;}}
  if(near&&best<6&&near!==introPrev){introPrev=near;setText('message','');const nm=near.id===0?'DU':near.name||'';if(nm)notice(nm,.55);}}
 else{const u=(k-.78)/.22,e=u*u*(3-2*u),a=samplePos(dMin+4,6.5,_iv),h=pl.h||0,bx=pl.x-Math.sin(h)*7,bz=pl.z-Math.cos(h)*7,by=(pl.y||0)+3.2;
  camera.position.set(a.x+(bx-a.x)*e,a.y+3.4+(by-a.y-3.4)*e,a.z+(bz-a.z)*e);camera.lookAt(pl.x+Math.sin(h)*6,(pl.y||0)+1.1,pl.z+Math.cos(h)*6);}
 camera.updateMatrixWorld();}
function loislLabel(){const t=canvasTex(512,256,(q,w,h)=>{q.fillStyle='#fffbe8';q.fillRect(0,0,w,h);q.fillStyle='#c1121f';q.textAlign='center';q.textBaseline='middle';
 q.font='900 86px "Trebuchet MS","Arial Black",sans-serif';q.fillText('FALSCHE',w/2,h*.3);q.fillText('RICHTUNG ↺',w/2,h*.72);});return new T.MeshBasicMaterial({map:t,toneMapped:false});}
function loislBuild(){if(!P.loisl)return null;const part=n=>r53Part('loisl',n),g=new T.Group(),body=part('LO_Body'),prop=part('LO_Prop');if(!body)return null;g.add(body);
 const piv=new T.Group();piv.position.y=3.8;if(prop){prop.position.set(0,0,0);piv.add(prop);}g.add(piv);
 const light=new T.Group(),lamps=[];const lf=part('LO_Light');if(lf)light.add(lf);for(let i=1;i<=3;i++){const m=part('LO_L'+i);if(!m)continue;m.traverse(o=>{if(o.isMesh){o.material=o.material.clone();lamps.push(o.material);}});light.add(m);}g.add(light);
 const sign=new T.Group(),sp=part('LO_Sign');if(sp)sign.add(sp);const pl=new T.Mesh(new T.PlaneGeometry(1.7,.86),loislLabel());pl.position.set(-1.05,3.55,.53);sign.add(pl);g.add(sign);
 const rod=new T.Group(),rp=part('LO_Rod');if(rp)rod.add(rp);g.add(rod);
 const line=new T.Mesh(new T.CylinderGeometry(.018,.018,1,5).translate(0,-.5,0),new T.MeshBasicMaterial({color:0xf2f2f2}));g.add(line);
 g.scale.setScalar(1.15);g.traverse(o=>{if(o.isMesh)o.castShadow=true;});
 return {g,piv,light,lamps,sign,rod,line,mode:'',t:0,x:0,y:0,z:0};}
function loislMode(m){if(!loisl)return;if(loisl.mode===m)return;const from=loisl.mode;loisl.mode=m;loisl.t=0;
 if(m==='wrong'||m==='rescue'){loisl.sx=loisl.x;loisl.sy=loisl.y;loisl.sz=loisl.z;if(!loisl.g.visible||from===''||from==='away'){const c=camera.position;loisl.x=loisl.sx=c.x;loisl.y=loisl.sy=c.y+14;loisl.z=loisl.sz=c.z;}}}
function updateLoisl(dt){if(!P.loisl||state==='menu'){if(loisl)loisl.g.visible=false;return;}
 if(!loisl||loisl.g.parent!==world){loisl=loislBuild();if(!loisl)return;world.add(loisl.g);}
 const L=loisl,pl=racers[0];if(!pl)return;if(pl.rescue&&L.mode!=='rescue')loislMode('rescue');L.t+=dt;L.piv.rotation.y+=dt*22;const bob=Math.sin(performance.now()/300)*.18;let want=null,face=null;
 const showLight=state==='countdown'&&introT<=0,atStart=state==='countdown'||(state==='race'&&elapsed<2.2&&L.mode==='');
 L.light.visible=atStart;L.sign.visible=L.mode==='wrong';L.rod.visible=L.mode==='rescue';L.line.visible=L.mode==='rescue'&&!!pl.rescue;
 if(atStart&&L.mode===''){const d=pl.distance+10,p=samplePos(d,-1.2,_iv);L.g.scale.setScalar(1.45);want=[p.x,p.y+2.6+(state==='race'?elapsed*elapsed*4:0),p.z];face=[pl.x,(pl.y||0)+2,pl.z];
  const n=lightState;L.lamps.forEach((m,i)=>{const on=showLight&&(n===4||i<n);m.color.setHex(!on?0x3a3a3a:n===4?0x2bd653:0xff3b2f);if(m.emissive){m.emissive.setHex(!on?0:n===4?0x3dff6a:0xff2a1f);m.emissiveIntensity=on?3:0;}});
  L.g.visible=introT<=0||introT<1.2;}
 else if(L.mode==='wrong'){const c=camera;L.g.scale.setScalar(1);_iv.set(2.3,-2.7,-11).applyMatrix4(c.matrixWorld);want=[_iv.x,_iv.y,_iv.z];face=[c.position.x,c.position.y,c.position.z];L.g.visible=true;}
 else if(L.mode==='rescue'){const r=pl.rescue;L.g.scale.setScalar(1.15);if(r){want=[pl.x-1.4,(pl.y||0)+4.6,pl.z-.6];face=[camera.position.x,(pl.y||0)+3,camera.position.z];L.g.visible=true;
   const tip=_iq.set(2.6,3.4,.8).multiplyScalar(1.15);L.g.localToWorld(tip);const dx=pl.x-tip.x,dy=(pl.y||0)+1.2-tip.y,dz=pl.z-tip.z,len=Math.hypot(dx,dy,dz)||1;
   L.line.position.copy(L.g.worldToLocal(tip.clone()));L.line.scale.set(1,len/1.15,1);const dir=new T.Vector3(dx,dy,dz).normalize(),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,-1,0),dir);
   const inv=L.g.quaternion.clone().invert();L.line.quaternion.copy(inv.multiply(q));}else loislMode('away');}
 else if(L.mode==='away'){want=[L.x,L.y+dt*14,L.z];if(L.t>1.4){L.g.visible=false;L.mode='idle';}}
 else{L.g.visible=false;}
 if(want){const k=L.mode==='wrong'||L.mode==='rescue'?Math.min(1,dt*6):Math.min(1,dt*8);L.x+=(want[0]-L.x)*k;L.y+=(want[1]-L.y)*k;L.z+=(want[2]-L.z)*k;L.g.position.set(L.x,L.y+bob,L.z);
  if(face)L.g.rotation.set(0,Math.atan2(face[0]-L.x,face[2]-L.z),Math.sin(performance.now()/500)*.08);}}
// Angel-Rettung: das Kart haengt an der Schnur und wird in 1,4 s auf die Strecke gesetzt (kein Steuern, kein Schwung)
function rescueTick(r,dt){const R=r.rescue;R.t+=dt;const k=Math.min(1,R.t/1.4),e=k*k*(3-2*k);r.y=R.gy+2.2+(1-e)*5.5;r.vy=0;r.vx=r.vz=0;r.speed=0;r.air=true;
 if(k>=1){r.rescue=null;r.air=true;if(r.id===0&&loisl)loislMode('away');}}
// ---------------------------------------------------------------- R61 Items: Boellerschuss und Blaue Brezn (eigene Entwuerfe)
// Boellerschuss: eine eiserne Boellerkugel umschliesst das Kart (Lunte mit Funken, Rauchringe), 4,2 s faehrt die KI-Linie
// mit 42 % mehr Spitzentempo; wer beruehrt wird, fliegt zur Seite. Blaue Brezn: blau leuchtende Brezn mit Fluegeln fliegt
// hoch ueber der Strecke zum Fuehrenden, stuerzt herab und trifft mit Druckwelle (7 m) - das Mass Bier blockt.
const _cbM={};
function cannonBall(r=1.55){const g=new T.Group(),iron=_cbM.iron||(_cbM.iron=stdMat({color:0x23262c,roughness:.35,metalness:.85})),band=_cbM.band||(_cbM.band=stdMat({color:0xb8862e,roughness:.3,metalness:.9}));
 mesh(new T.SphereGeometry(r,24,16),iron,g,0,0,0);mesh(new T.TorusGeometry(r*1.01,r*.06,8,32),band,g,0,0,0);mesh(new T.TorusGeometry(r*1.01,r*.06,8,32).rotateY(Math.PI/2),band,g,0,0,0);
 const fuse=mesh(new T.CylinderGeometry(r*.08,r*.1,r*.5,8),band,g,0,r*1.05,-r*.35);fuse.rotation.x=-.5;
 const spark=mesh(new T.SphereGeometry(r*.14,8,6),new T.MeshBasicMaterial({color:0xffb030}),g,0,r*1.3,-r*.5);g.userData.spark=spark;return g;}
function startCannon(r){if(r.cannonG)return;const g=cannonBall();g.position.y=.95;r.mesh.add(g);r.cannonG=g;r.cannonS=0;
 const me=r.id===0;if(nearPlayer(r,70)){SFX.boom?.(me?1:.5);for(let k=0;k<16;k++)emit(r.x,(r.y||0)+1,r.z,k%2?0xffb030:0xdde0e6,(Math.random()-.5)*6,2+Math.random()*4,(Math.random()-.5)*6,.7);}
 if(me){shake=Math.max(shake,.45);flashScreen?.(.2);}}
function cannonTick(r,me,dt){if(!(r.cannon>0)){if(r.cannonG){r.mesh.remove(r.cannonG);r.cannonG=null;if(nearPlayer(r,60))for(let k=0;k<14;k++)emit(r.x,(r.y||0)+1,r.z,0xdde0e6,(Math.random()-.5)*5,1+Math.random()*3,(Math.random()-.5)*5,.9);if(me)toast('💨 Gelandet – weiter geht\'s!',.9);}return;}
 r.cannon=Math.max(0,r.cannon-dt);r.stun=0;const g=r.cannonG;if(g){g.rotation.x+=Math.max(r.speed,0)*dt/1.55;g.userData.spark.scale.setScalar(.7+Math.random()*.8);}
 r.cannonS=(r.cannonS||0)-dt;if(r.cannonS<=0&&nearPlayer(r,70)){r.cannonS=.05;const h=r.h||0;emit(r.x-Math.sin(h)*2,(r.y||0)+1.2,r.z-Math.cos(h)*2,Math.random()<.4?0xffb030:0xcfd3da,(Math.random()-.5)*2,1+Math.random()*2,(Math.random()-.5)*2,.8);}
 for(const q of racers){if(q===r||q.finishTime!==null||q.air||(q.cannon>0))continue;if(Math.abs(wrapDiff(q.distance,r.distance))<3&&Math.abs(q.offset-r.offset)<2.6&&!((q.cbHitT||0)>elapsed)){q.cbHitT=elapsed+1;
  if(q.shield>0){burst(q,0xffe263,8);continue;}hitKart(q,.9,.45);q.offset+=Math.sign(q.offset-r.offset||1)*1.5;burst(q,0x9aa0aa,10);if(q.id===0){toast('💥 VON DER BÖLLERKUGEL GERAMMT!',1,'bad');SFX.hit(.9);}else if(me){SFX.bump?.();stats.hitsDealt=(stats.hitsDealt||0)+1;}}}}
function blueBrezn(){const g=new T.Group();let b=null;
 if(P.shell){b=cloneProto(P.shell);b.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.color?.setHex(0x3a78ff);if(o.material.emissive){o.material.emissive.setHex(0x1a4dff);o.material.emissiveIntensity=.9;}}});}
 else b=new T.Mesh(new T.TorusGeometry(.5,.18,8,20),stdMat({color:0x3a78ff,emissive:0x1a4dff,emissiveIntensity:.9}));
 b.scale.setScalar(1.3);g.add(b);const wm=_cbM.wing||(_cbM.wing=stdMat({color:0xffffff,emissive:0x9fc4ff,emissiveIntensity:.5,side:T.DoubleSide}));
 for(const s of [-1,1]){const w=mesh(new T.PlaneGeometry(1.1,.5),wm,g,s*.95,.45,0);w.rotation.set(-.3,0,s*.35);w.userData.flap=s;}return g;}
let blues=[];
function fireBlue(r,target){if(target===undefined)return;const g=blueBrezn();actors.add(g);blues.push({g,d:r.distance,off:r.offset,target,owner:r.id,t:0,dive:0});
 if(target===0&&r.id!==0){toast('⚠ BLAUE BREZN IM ANFLUG!',1.6,'bad');for(let i=0;i<3;i++)sfxTone(880,660,.18,'square',.05,i*.28);}}
function updateBlues(dt){for(let i=blues.length-1;i>=0;i--){const b=blues[i],tg=racers[b.target];b.t+=dt;
  if(!tg||tg.finishTime!==null||b.t>14){burst({mesh:b.g},0x3a78ff,10);actors.remove(b.g);blues.splice(i,1);continue;}
  for(const c of b.g.children)if(c.userData.flap)c.rotation.z=c.userData.flap*(.35+Math.sin(b.t*22)*.5);
  if(!b.dive){b.d+=(Math.max(tg.speed,0)+42)*dt;b.off+=(tg.offset-b.off)*Math.min(1,dt*3);const s=samplePos(b.d,b.off,_sp);b.g.position.set(s.x,s.y+10+Math.sin(b.t*5)*.6,s.z);b.g.rotation.y+=dt*6;
   if(frame%2===0)emit(s.x,s.y+10,s.z,0x7fb0ff,(Math.random()-.5)*2,-.5,(Math.random()-.5)*2,.5);
   if(b.d>=tg.distance-3){b.dive=.001;b.y0=b.g.position.y;}continue;}
  b.dive+=dt/.4;const k=Math.min(1,b.dive),p=tg.mesh.position;b.g.position.set(p.x,b.y0+(p.y+1-b.y0)*k*k,p.z);b.g.rotation.x=k*1.2;
  if(k>=1){blueImpact(b);actors.remove(b.g);blues.splice(i,1);}}}
function blueImpact(b){const tg=racers[b.target],me=b.owner===0;let n=0;
 for(let k=0;k<30;k++){const a=Math.random()*TAU;emit(tg.x,(tg.y||0)+1,tg.z,k%3?0x3a78ff:0xffffff,Math.sin(a)*9,3+Math.random()*5,Math.cos(a)*9,.8);}
 if(nearPlayer(tg,90)){SFX.boom?.(tg.id===0||me?1:.6);shake=Math.max(shake,tg.id===0?.8:.3);}
 for(const q of racers){if(q.finishTime!==null)continue;const r=blastHit(q,q.x-tg.x,q.z-tg.z,7);if(r===true){n++;hitSpores(q);spinOut(q,3,1.4);if(q.id===0){stats.hitsTaken=(stats.hitsTaken||0)+1;toast('💥 BLAUE BREZN! Von oben erwischt',1.4,'bad');}}else if(r==='blocked'&&q.id===0)toast('🍺 ABGEWEHRT!',1,'good');}
 if(me&&n){stats.hitsDealt=(stats.hitsDealt||0)+n;toast(`🔷 BLAUE BREZN TRIFFT DIE SPITZE! ×${n}`,1.3,'good');}}
// ---------------------------------------------------------------- R61 Tsunami in der Schildkroeten-Bucht (tsunami.mjs)
// Wasserteppich ueber der ganzen Strecke, die Insel lauft voll, eine Wellenwand mit Schaumkrone rollt vom Meer ueber alles.
let tsu=null;
function tsuTex(){if(tsuTex.t)return tsuTex.t;tsuTex.t=canvasTex(128,128,(q,w,h)=>{q.fillStyle='#1d9fd0';q.fillRect(0,0,w,h);q.strokeStyle='#bff4ff';q.globalAlpha=.55;q.lineWidth=3;
  for(let i=0;i<7;i++){q.beginPath();for(let x=0;x<=w;x+=8){const y=(i+.5)*h/7+Math.sin(x/w*TAU*2+i)*4;x?q.lineTo(x,y):q.moveTo(x,y);}q.stroke();}q.globalAlpha=1;},true);tsuTex.t.repeat.set(3,60);return tsuTex.t;}
function buildTsunami(){tsu=null;const C=course.tsunami;if(!C)return;
 const tx=tsuTex(),rm=stdMat({map:tx,color:0xffffff,transparent:true,opacity:0,roughness:.08,metalness:.1,emissive:0x0a4a6a,emissiveIntensity:.35,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const ribbon=addStrip(strip(0,length,0,48,.55,length/60,Math.ceil(length/3)),rm,false);ribbon.visible=false;ribbon.renderOrder=2;
 const pm=stdMat({color:0x1d9fd0,transparent:true,opacity:.82,roughness:.1,metalness:.1,emissive:0x083a55,emissiveIntensity:.4,depthWrite:false});
 const plane=mesh(new T.CircleGeometry(214*WK,64).rotateX(-Math.PI/2),pm,world,0,-3,0);plane.visible=false;plane.renderOrder=1;
 // Wellenwand: Flaeche 560 x 30 m, oben nach vorn eingerollt, weisse Schaumkrone
 const wg=new T.PlaneGeometry(560,30,1,14),pos=wg.attributes.position;for(let i=0;i<pos.count;i++){const v=(pos.getY(i)+15)/30;pos.setY(i,v*26);pos.setZ(i,Math.pow(v,2.2)*9-Math.sin(v*Math.PI)*3);}wg.computeVertexNormals();
 const wave=new T.Group(),wm=stdMat({color:0x1a8fc4,transparent:true,opacity:.9,roughness:.15,emissive:0x0b4d70,emissiveIntensity:.5,side:T.DoubleSide,depthWrite:false});
 wave.add(new T.Mesh(wg,wm));const foam=new T.Mesh(new T.CylinderGeometry(1.6,1.6,560,10).rotateZ(Math.PI/2),new T.MeshBasicMaterial({color:0xf2fcff}));foam.position.set(0,26,9);wave.add(foam);
 wave.visible=false;world.add(wave);const a=C.dir||0;tsu={at:C.at||44,t0:null,ribbon,rm,plane,pm,wave,dx:Math.cos(a),dz:Math.sin(a),ph:'off',surf:false,msg:''};}
function updateTsunami(dt,t,live=true){if(!tsu)return;
 if(tsu.t0===null&&live&&state==='race'&&t>=tsu.at)tsu.t0=tsu.at;
 const ph=tsunamiPhase(tsu.t0===null?-1:t-tsu.t0),wet=ph.water;tsu.ph=ph.phase;tsu.surf=tsunamiSurf(ph);
 tsu.ribbon.visible=wet>.01;tsu.rm.opacity=Math.min(.86,wet*1.1);tsu.rm.map.offset.y=(t*.35)%1;tsu.rm.map.offset.x=Math.sin(t*.7)*.05;
 tsu.plane.visible=wet>.01;tsu.plane.position.y=-3+wet*3.3+Math.sin(t*1.3)*.08;
 const f=waveFront(ph,260);tsu.wave.visible=f!==null;if(f!==null){tsu.wave.position.set(tsu.dx*f,-2,tsu.dz*f);tsu.wave.rotation.y=Math.atan2(tsu.dx,tsu.dz);
  if(live&&frame%2===0){const pl=racers[0];if(pl){const along=pl.x*tsu.dx+pl.z*tsu.dz,cx=pl.x+tsu.dx*(f-along),cz=pl.z+tsu.dz*(f-along);for(let k=0;k<4;k++){const w=(Math.random()-.5)*80;emit(cx-tsu.dz*w,22+Math.random()*6,cz+tsu.dx*w,0xf2fcff,(Math.random()-.5)*4,2+Math.random()*3,(Math.random()-.5)*4,.8);}}}}
 if(!live||state!=='race')return;
 if(ph.phase!==tsu.msg){const was=tsu.msg;tsu.msg=ph.phase;
  if(ph.phase==='warn'){toast('🌊 TSUNAMI-WARNUNG! Gleich wird gesurft!',2.4,'bad');for(let i=0;i<4;i++)sfxTone(620,940,.42,'square',.05,i*.5);}
  else if(ph.phase==='wave'){SFX.whoosh?.();sfxNoise(3.2,80,900,.2,.8);shake=Math.max(shake,.6);}
  else if(ph.phase==='flood'){toast('🏄 WAVE-RIDER! Surf die Flut!',1.8,'good');SFX.splash?.();stats.tsunami=(stats.tsunami||0)+1;}
  else if(ph.phase==='recede'&&was==='flood')toast('🏝 Das Wasser läuft ab …',1.4);}
 if(tsu.surf&&frame%3===0)for(const r of racers){if(!nearPlayer(r,45)||Math.abs(r.speed)<6)continue;const h=r.h||0;emit(r.x-Math.sin(h)*1.8,(r.y||0)+.5,r.z-Math.cos(h)*1.8,0xe8fbff,(Math.random()-.5)*4,2.5+Math.random()*2.5,(Math.random()-.5)*4,.45);}}
// ---------------------------------------------------------------- R61 Wahrzeichen Bucht & Eissee (assets/bayice.glb)
// Seewaerts: vom Streckenpunkt radial nach aussen ueber den Inselrand hinaus. Delfine springen in Boegen aus der Lagune.
let bayIce=null;
function buildBayIce(){bayIce=null;const B=course.bay2,I=course.ice2;if((!B&&!I)||!P.bayice)return;bayIce={n:0,dol:[]};
 const part=n=>r53Part('bayice',n),seaward=(v,extra)=>{const p=sample(cpDist(v),0).p,l=Math.hypot(p.x,p.z)||1;return {x:p.x/l*(206*WK+extra),z:p.z/l*(206*WK+extra),ux:p.x/l,uz:p.z/l};};
 const onLand=(n,list,rad,sc)=>{for(const [v,side,o2,name] of list||[]){const d=cpDist(v);for(const o of [o2,o2+8,o2+16]){const of=side*o;if(!decoSpot(d,of,rad))continue;const g=part(name||n);if(!g)break;lmAt(g,d,of,sc);addObstacle(g.position.x,g.position.z,rad*.8);bayIce.n++;break;}}};
 if(B){for(const v of B.isle||[]){const q=seaward(v,70),g=part('BY_TurtleIsle');if(!g)continue;g.position.set(q.x,-1.2,q.z);g.rotation.y=Math.atan2(q.uz,-q.ux)+.6;world.add(g);bayIce.n++;}
  for(const v of B.wreck||[]){const q=seaward(v,22),g=part('BY_Wreck');if(!g)continue;g.position.set(q.x,-1.6,q.z);g.rotation.set(0,Math.atan2(q.ux,q.uz)+1.2,.2);world.add(g);bayIce.n++;}
  onLand('BY_Sandcastle',B.castles,6,1.1);onLand('BY_Lifeguard',B.guards,2,1.15);
  for(const v of B.dolphins||[]){const q=seaward(v,34+Math.random()*30),g=part('BY_Dolphin');if(!g)continue;g.scale.setScalar(1.6);g.visible=false;world.add(g);
   bayIce.dol.push({g,x:q.x,z:q.z,tx:-q.uz,tz:q.ux,ph:Math.random()*9,per:4.5+Math.random()*3,was:false});}}
 if(I){onLand('IC_Palace',I.palace,18,1.3);onLand('IC_Stein',I.sculpt,2.2,1.2);onLand('IC_Igloo',I.igloos,3.6,1.1);onLand('IC_Falls',I.falls,9,1.1);}}
function updateBayIce(dt,t,live=true){if(!bayIce)return;const sea=-2.7;
 for(const q of bayIce.dol){const u=((t+q.ph)%q.per)/q.per,k=u/.32;if(k>1){if(q.g.visible&&live)for(let i=0;i<6;i++)emit(q.x+q.tx*6,sea+.2,q.z+q.tz*6,0xe8fffb,(Math.random()-.5)*3,2+Math.random()*2,(Math.random()-.5)*3,.5);q.g.visible=false;continue;}
  const s=(k-.5)*12,y=sea-.8+Math.sin(Math.PI*k)*5.5;q.g.visible=true;q.g.position.set(q.x+q.tx*s,y,q.z+q.tz*s);q.g.rotation.set(0,Math.atan2(q.tx,q.tz)-Math.PI/2,Math.cos(Math.PI*k)*.9);
  if(!q.was&&live&&k<.1)for(let i=0;i<6;i++)emit(q.g.position.x,sea+.2,q.g.position.z,0xe8fffb,(Math.random()-.5)*3,2+Math.random()*2,(Math.random()-.5)*3,.5);q.was=k<.9;}}
// ---------------------------------------------------------------- R64 Retro-Pixel-Voxel-Charme im Riesendom (assets/voxdome.glb)
// Pixel-Sonne tief im Abendhimmel, blockige Pixelwolken treiben ueber dem Wolkenmeer, am Strassenrand Pixel-Banner,
// Voxel-Waechter und Kohlebecken (ohne Kollision - die Anti-Grav-Roehren schwingen weit nach aussen), Vogelschwaerme.
let domePix=null;
function buildDomePix(){domePix=null;const X=course.pixel;if(!X||!P.voxdome)return;domePix={deco:0,clouds:[],birds:[],fires:[],sun:null};
 const part=n=>r53Part('voxdome',n),noFog=g=>g.traverse(q=>{if(q.isMesh){q.material=q.material.clone();q.material.fog=false;q.castShadow=false;q.receiveShadow=false;}});
 const put=(n,list,rad,sc,after)=>{for(const [v,side,off] of list||[]){const d=cpDist(v),of=side*off;if(!decoSpot(d,of,rad))continue;const g=part(n);if(!g)continue;lmAt(g,d,of,sc);after?.(g);domePix.deco++;}};
 put('VD_Banner',X.banners,.6,1.25);put('VD_Knight',X.knights,1.2,1.3);put('VD_Brazier',X.braziers,.6,1.15,g=>{const p=g.position;domePix.fires.push({x:p.x,y:p.y+3.4,z:p.z});});
 if(X.sun){const g=part('VD_Sun');if(g){noFog(g);const s=theme.sunPos||[-150,42,-120],l=Math.hypot(s[0],s[2])||1;g.position.set(s[0]/l*470,28,s[2]/l*470);g.lookAt(0,28,0);g.scale.setScalar(5.2);world.add(g);domePix.sun=g;}}
 for(let i=0;i<(X.clouds||0);i++){const g=part('VD_Cloud');if(!g)break;const a=i/X.clouds*TAU+(i%3)*.2,rr=226*WK+40+(i*47)%130,y=-46+(i*29)%70,sc=1.6+(i*13)%10*.14;
  g.position.set(Math.cos(a)*rr,y,Math.sin(a)*rr);g.rotation.y=-a+Math.PI/2;g.scale.setScalar(sc);g.traverse(q=>{if(q.isMesh){q.castShadow=false;}});world.add(g);domePix.clouds.push({g,a,rr,y,spd:.004+(i%5)*.0015});}
 const b0=part('VD_Bird0'),b1=part('VD_Bird1');if(b0&&b1)for(let f=0;f<(X.birds||0);f++){const c=sample(cpDist(2+f*4.5)).p;for(let k=0;k<6;k++){const g=new T.Group(),u=b0.clone(),w=b1.clone();g.add(u,w);g.scale.setScalar(2.2);world.add(g);
  domePix.birds.push({g,u,w,cx:c.x,cz:c.z,r:18+k*3,h:34+f*9+k*1.5,ph:k*.45+f,spd:.35+f*.05});}}}
function updateDomePix(dt,t,live=true){if(!domePix)return;
 for(const c of domePix.clouds){c.a+=c.spd*dt;c.g.position.set(Math.cos(c.a)*c.rr,c.y+Math.sin(t*.2+c.a*3)*1.5,Math.sin(c.a)*c.rr);}
 const fl=Math.floor(t*6)%2;for(const b of domePix.birds){const a=t*b.spd+b.ph;b.g.position.set(b.cx+Math.cos(a)*b.r,b.h+Math.sin(a*2)*1.2,b.cz+Math.sin(a)*b.r);b.g.rotation.y=-a;b.u.visible=((fl+Math.round(b.ph*2))%2)===0;b.w.visible=!b.u.visible;}
 if(live&&frame%4===0&&racers[0])for(const f of domePix.fires){if(Math.abs(f.x-racers[0].x)+Math.abs(f.z-racers[0].z)>90)continue;emit(f.x+(Math.random()-.5)*.6,f.y,f.z+(Math.random()-.5)*.6,Math.random()<.5?0xffb030:0xff6a10,(Math.random()-.5)*.6,1.5+Math.random()*1.5,(Math.random()-.5)*.6,.5);}}
// ---------------------------------------------------------------- R61 XXL-Kathedralenstadt im Riesendom (assets/domecity.glb)
// Strebebogen-Tore spannen quer ueber die Fahrbahn (Pfeiler 22,5 m neben der Mitte), Arkadenzeilen saeumen die Anti-Grav-
// Schluchten, weiter draussen Riesen-Kathedralen, Glockentuerme und Kuppel-Rotunden (nur auf der Insel, nie ueber anderer Strecke).
let cityN=null;
function buildCity(){cityN=null;const C=course.city;if(!C||!P.domecity)return;cityN={arches:0,rows:0,big:0};
 const part=n=>r53Part('domecity',n),onIsland=(x,z,rad)=>Math.hypot(x,z)<198*WK-rad;
 // R61 Fix (Nutzerhinweis "bleibe an einer Spirale haengen"): die Anti-Grav-Roehre hebt und schwingt das Kart weit zur
 // Seite - dort standen Kollisionspunkte der Pfeiler. Tore und Arkaden haben keine Kollision mehr, Tore ueber Anti-Grav-Zonen
 // sind 1,6-fach (Pfeiler 36 m neben der Mitte, lichte Hoehe 45 m)
 for(const v of C.arches||[]){const d=cpDist(v),g=part('DC_Arch');if(!g)continue;const s=sample(d,0),y=groundAt(d,0).y;g.position.set(s.p.x,Math.max(0,y),s.p.z);g.rotation.y=s.angle;if(agrav.some(z=>lapDist(d-z.s+12)<=z.span+24))g.scale.setScalar(1.6);world.add(g);cityN.arches++;}
 for(const [a,b,side,off] of C.rows||[]){const d0=cpDist(a),span=lapDist(cpDist(b)-d0);for(let x=6;x<span;x+=54){const d=lapDist(d0+x),o=side*off;if(!decoSpot(d,o,6))continue;const g=part('DC_Row');if(!g)continue;lmAt(g,d,o,1);cityN.rows++;}}
 const big=(n,list,rad,sc)=>{for(const [v,side,o2] of list||[]){const d=cpDist(v);for(const o of [o2,o2+18,o2+36]){const of=side*o,s=sample(d,of);if(!onIsland(s.p.x,s.p.z,rad)||!decoSpot(d,of,rad))continue;const g=part(n);if(!g)break;lmAt(g,d,of,sc);addObstacle(g.position.x,g.position.z,rad*.7);cityN.big++;break;}}};
 big('DC_Cathedral',C.cathedrals,34,1);big('DC_Tower',C.towers,9,1);big('DC_Rotunda',C.rotundas,32,1);
 // Skyline: ein Ring riesiger Bauten ragt rund um die Insel aus dem Wolkenmeer (Sockel tief in den Wolken, bis 2,4-fach)
 const ring=['DC_Cathedral','DC_Tower','DC_Rotunda','DC_Tower','DC_Row','DC_Cathedral','DC_Tower','DC_Tower'],n=C.skyline||0;cityN.sky=0;
 for(let i=0;i<n;i++){const a=i/n*TAU+(i%3)*.07,rr=222*WK+30+((i*37)%5)*16,g=part(ring[i%ring.length]);if(!g)continue;const sc=1.5+((i*53)%7)*.14;
  g.position.set(Math.cos(a)*rr,-62+(ring[i%ring.length]==='DC_Row'?40:0),Math.sin(a)*rr);g.rotation.y=Math.atan2(-g.position.x,-g.position.z);g.scale.setScalar(sc);
  g.traverse(q=>{if(q.isMesh)q.castShadow=false;});world.add(g);cityN.sky++;}}
// ---------------------------------------------------------------- R61 Pixel-/Voxel-Gothic im Geisterhaus (assets/voxel.glb)
// Kandelaber stehen auf der Fahrbahn und zerspringen beim Durchfahren in Pixelwuerfel - der Spieler bekommt ein Item
// (oder einen kleinen Schub, wenn er schon eins hat) und ein Pixel-Herz steigt auf; nach 9 s stehen sie wieder.
function vxPart(n){return r53Part('voxel',n);}
function buildVoxel(){vox=null;const V=course.voxel;if(!V||!P.voxel)return;vox={candles:[],bats:[],ghosts:[],hearts:[],deco:0,moon:null};
 for(const [v,off] of V.candles||[]){const d=cpDist(v),g=vxPart('VX_Candle');if(!g)continue;const s=samplePos(d,off,new T.Vector3());g.position.copy(s);g.rotation.y=sample(d).angle;g.scale.setScalar(1.25);world.add(g);
  vox.candles.push({d,off,g,broke:0,x:s.x,z:s.z,y:s.y});}
 const put=(n,list,off,rad,sc)=>{vox.deco+=decoPut('voxel',n,list,off,rad,sc);};
 put('VX_Skulls',V.skulls,13,1,1.3);put('VX_Window',V.windows,17,2,1.6);put('VX_Armor',V.armors,12.5,.9,1.4);
 for(const [a,b,side,off] of V.walls||[]){const d0=cpDist(a),d1=cpDist(b),span=lapDist(d1-d0);for(let x=0;x<span;x+=8.2){const d=lapDist(d0+x),o=side*off;if(!decoSpot(d,o,3.5))continue;const g=vxPart('VX_Wall');if(!g)continue;lmAt(g,d,o,1);addObstacle(g.position.x,g.position.z,3);vox.deco++;}}
 for(const [v,side] of V.ghosts||[]){const d=cpDist(v),g=vxPart('VX_Ghost');if(!g)continue;g.traverse(q=>{if(q.isMesh){q.material=q.material.clone();q.material.transparent=true;q.material.opacity=.78;q.castShadow=false;}});world.add(g);vox.ghosts.push({d,side,g,ph:Math.random()*6});}
 const b0=vxPart('VX_Bat0'),b1=vxPart('VX_Bat1');if(b0&&b1){const n=(V.bats||3)*4;for(let i=0;i<n;i++){const g=new T.Group(),u=b0.clone(),w=b1.clone();g.add(u,w);g.scale.setScalar(1.3);world.add(g);vox.bats.push({g,u,w,d:cpDist((i*2.3)%16),r:6+Math.random()*8,h:9+Math.random()*7,ph:Math.random()*6,spd:.5+Math.random()*.5});}}
 if(V.moon){const m=vxPart('VX_Moon');if(m){m.traverse(q=>{if(q.isMesh){q.material=q.material.clone();q.material.fog=false;q.castShadow=false;q.receiveShadow=false;}});const s=theme.sunPos||[-70,130,90],l=Math.hypot(s[0],s[2])||1;
  m.position.set(-s[0]/l*420,105,-s[2]/l*420);m.lookAt(0,40,0);m.scale.setScalar(4.2);world.add(m);vox.moon=m;}}}
function updateVoxel(dt,t,live=true){if(!vox)return;const pl=racers[0];
 for(const c of vox.candles){if(c.broke&&t>c.broke){c.broke=0;c.g.visible=true;}
  if(!c.broke&&live&&state==='race')for(const r of racers){if(r.air||r.finishTime!==null)continue;if(Math.abs(wrapDiff(r.distance,c.d))<1.6&&Math.abs(r.offset-c.off)<1.5){c.broke=t+9;c.g.visible=false;const me=r===pl;
   for(let k=0;k<16;k++)emit(c.x,c.y+1+Math.random()*2.2,c.z,[0xffc23a,0xff7a1a,0xfff0a0,0xb8860b][k%4],(Math.random()-.5)*7,2+Math.random()*4,(Math.random()-.5)*7,.7);
   if(me){SFX.crumble();const h=vxPart('VX_Heart');if(h){h.position.set(c.x,c.y+1.4,c.z);h.scale.setScalar(1.4);world.add(h);vox.hearts.push({g:h,t0:t});}
    if(!r.item&&!r.itemPending){r.itemPending=true;roulette={t:.95,tick:0,final:rollItem(ranking(racers).indexOf(r)+1,racers.length)};toast('🕯 KANDELABER ZERSCHLAGEN – ITEM!',1.1,'good');}
    else{r.boost=Math.max(r.boost,.7);toast('🕯 KANDELABER ZERSCHLAGEN!',.9,'good');}stats.candles=(stats.candles||0)+1;}
   break;}}}
 for(let i=vox.hearts.length-1;i>=0;i--){const h=vox.hearts[i],k=t-h.t0;h.g.position.y+=dt*2.2;h.g.rotation.y+=dt*4;if(k>1.4||k<0){world.remove(h.g);vox.hearts.splice(i,1);}}
 for(const g of vox.ghosts){const o=g.side*(11+Math.sin(t*.6+g.ph)*3),p=samplePos(g.d+Math.sin(t*.35+g.ph)*6,o,_sp);g.g.position.set(p.x,p.y+2.2+Math.sin(t*2.1+g.ph)*.5,p.z);g.g.rotation.y=sample(g.d).angle+(g.side>0?-Math.PI/2:Math.PI/2)+Math.sin(t+g.ph)*.3;}
 const fl=Math.floor(t*7)%2;for(const b of vox.bats){const a=t*b.spd+b.ph,c=sample(b.d).p;b.g.position.set(c.x+Math.cos(a)*b.r,b.h+Math.sin(a*2.3)*1.2,c.z+Math.sin(a)*b.r);b.g.rotation.y=-a;b.u.visible=!!((fl+(b.ph>3?1:0))%2);b.w.visible=!b.u.visible;}}
// ---------------------------------------------------------------- R61 Schoko-Matsch: Pfuetzen, Schokobrocken, Suessigkeiten
// Pfuetzen als glaenzende Schoko-Streifen auf der Fahrbahn (unregelmaessiger Rand, Karamell-Schlieren) mit Blubberblasen;
// Brocken warten wackelnd am Hang (rosa Warnstreifen blinkt), rollen quer und versinken im Schokofluss.
function chocoMudTex(){if(chocoMudTex.t)return chocoMudTex.t;chocoMudTex.t=canvasTex(128,256,(q,w,h)=>{q.clearRect(0,0,w,h);
  const g=q.createRadialGradient(w/2,h/2,4,w/2,h/2,w*.62);g.addColorStop(0,'#4a220e');g.addColorStop(.7,'#2e1408');g.addColorStop(1,'#1e0c04');q.fillStyle=g;
  for(let i=0;i<48;i++){const u=i/47,y=h*(.03+.94*u),rw=w*.47*Math.sqrt(Math.sin(Math.PI*u))+2;q.beginPath();q.ellipse(w/2+(Math.random()-.5)*7,y,Math.max(1,rw*(.86+Math.random()*.16)),h*.045,0,0,7);q.fill();}
  q.globalCompositeOperation='source-atop';q.lineWidth=3;for(let i=0;i<8;i++){q.strokeStyle=i%2?'#8a4a22':'#b8733a';q.globalAlpha=.32;q.beginPath();q.moveTo(w*(.2+Math.random()*.6),h*Math.random());q.bezierCurveTo(w*Math.random(),h*Math.random(),w*Math.random(),h*Math.random(),w*(.2+Math.random()*.6),h*Math.random());q.stroke();}
  q.globalAlpha=1;q.globalCompositeOperation='source-over';});return chocoMudTex.t;}
function buildChoco(){choco=null;const C=course.choco;if(!C)return;choco={mud:[],bould:[],deco:0};
 const mm=stdMat({map:chocoMudTex(),transparent:true,roughness:.12,metalness:.1,emissive:0x1a0802,emissiveIntensity:.3,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
 const bm=stdMat({color:0x4a220e,roughness:.1,metalness:.1}),bg=new T.SphereGeometry(.24,10,8);
 for(const [v,off,len,hw] of C.mud||[]){const d0=lapDist(cpDist(v)-len/2),m=addStrip(strip(d0,d0+len,off,hw*2+.8,.1,len,Math.ceil(len/1.5)),mm,false);m.renderOrder=2;
  const p={d0,len,off,hw,bub:[]};for(let k=0;k<5;k++){const rel=len*(.2+.6*Math.random()),o=off+(Math.random()-.5)*hw*.9,q=samplePos(d0+rel,o,new T.Vector3(),.1),b=new T.Mesh(bg,bm);b.position.copy(q);world.add(b);p.bub.push({m:b,ph:Math.random(),spd:.35+Math.random()*.4});}
  choco.mud.push(p);}
 const wm=new T.MeshBasicMaterial({color:0xff6fae,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
 for(const [v,side,ph=0] of C.boulders||[]){const d=cpDist(v),g=new T.Group(),piv=new T.Group(),sc=1.15;let inner=r53Part('choco','CH_Boulder');
  if(inner)inner.position.y=-1.05*sc;else{inner=new T.Mesh(new T.IcosahedronGeometry(1.3,1),stdMat({color:0x3a1a0c,roughness:.35}));inner.castShadow=true;}
  inner.scale.setScalar(sc);piv.position.y=1.05*sc;piv.add(inner);g.add(piv);world.add(g);
  const wM=wm.clone(),warn=addStrip(strip(d-1.6,d+1.6,0,16.5,.12,3.2,2),wM,false);warn.renderOrder=3;
  choco.bould.push({d,side,ph,g,piv,wM,x:0,z:0,off:side*BOULDER.from,st:null,lastPh:''});}
 // Suessigkeiten-Deko (assets/choco.glb, art/r61/create_choco.py)
 if(P.choco){const put=(n,list,off,rad,sc)=>{choco.deco+=decoPut('choco',n,list,off,rad,sc);};
  put('CH_Heart',C.hearts,14,1.8,1.3);put('CH_Brezn',C.brezn,20,2,1.9);put('CH_Wafer',C.wafers,17,1.4,1.5);put('CH_Cream',C.creams,16,1.3,1.7);put('CH_Praline',C.pralines,15,1.2,1.5);
  for(const [v,side] of C.trees||[])put(Math.random()<.55?'CH_TreePink':'CH_TreeBlue',[[v,side,22+Math.random()*12]],22,2,1.5+Math.random()*.6);
  if(C.fountain){const [v,side,o2]=C.fountain;put('CH_Fountain',[[v,side,o2]],o2,5,2.3);}}}
function updateChoco(dt,t,live=true){if(!choco)return;const pl=racers[0];
 for(const b of choco.bould){const st=boulderState(t,b.side,b.ph);b.st=st;let off=st.off,y=0;
  if(st.phase==='wait')off+=Math.sin(t*19+b.ph*9)*.14*st.k;else if(st.phase==='sink')y=-st.k*2.8;
  const p=samplePos(b.d,off,_sp);b.g.position.set(p.x,p.y+y,p.z);b.g.rotation.y=sample(b.d).angle;b.g.visible=st.phase!=='gone';
  if(st.phase==='roll'){b.piv.rotation.z-=Math.sign(st.v)*BOULDER.speed*dt/BOULDER.r;if(live&&frame%3===0)emit(p.x,p.y+.2,p.z,0x6a3a1c,(Math.random()-.5)*2,1+Math.random()*1.5,(Math.random()-.5)*2,.5);}
  else if(st.phase==='wait')b.piv.rotation.z=Math.sin(t*19+b.ph*9)*.05*st.k;
  b.off=off;b.x=p.x;b.z=p.z;b.wM.opacity=st.phase==='wait'?(.12+.3*Math.abs(Math.sin(t*9)))*st.k:st.phase==='roll'?.2*(1-st.k):0;
  if(live&&pl){const dd=Math.hypot(pl.x-p.x,pl.z-p.z);
   if(st.phase==='roll'&&b.lastPh!=='roll'&&dd<80)SFX.rumble(Math.max(.2,1-dd/80));
   if(st.phase==='sink'&&b.lastPh==='roll'){for(let k=0;k<12;k++)emit(p.x,p.y+.3,p.z,0x3a1a0c,(Math.random()-.5)*6,2+Math.random()*3,(Math.random()-.5)*6,.6);if(dd<60)SFX.splash?.();}}
  b.lastPh=st.phase;}
 for(const p of choco.mud)for(const q of p.bub){const k=((t*q.spd+q.ph)%1+1)%1;q.m.visible=k<.8;q.m.scale.set(.25+k*1.2,.18+k*.9,.25+k*1.2);}}
function chocoHits(r,me,dt,sf){if(!choco)return;
 if(sf.mud){if(frame%2===0&&nearPlayer(r,50)){const h=r.h||0;emit(r.x-Math.sin(h)*1.3,(r.y||0)+.25,r.z-Math.cos(h)*1.3,0x3a1a0c,(Math.random()-.5)*3,1.5+Math.random()*2,(Math.random()-.5)*3,.5);}
  if(me&&!r.mudOn){SFX.squelch();if((r.mudMsg||0)<elapsed){r.mudMsg=elapsed+4;toast(r.boost>0?'🍫 MIT TURBO DURCH DEN MATSCH!':'🍫 SCHOKOMATSCH!',1.1,r.boost>0?'good':'bad');}}}
 r.mudOn=sf.mud;if(r.air)return;
 for(const b of choco.bould){if(!b.st||b.st.phase!=='roll')continue;const dd=wrapDiff(r.distance,b.d);if(!boulderHits(b.st,dd,r.offset)||(r.bHitT||0)>elapsed)continue;r.bHitT=elapsed+1.2;
  if(r.shield>0){r.shield=0;burst(r,0xffe263,10);continue;}if(r.mega>0){burst(r,0x6a3a1c,14);continue;}
  hitKart(r,me?.6:.5,.4);if(me){SFX.hit(.9);shake=Math.max(shake,.5);toast('🍫 VOM SCHOKOBROCKEN ERWISCHT!',1.2,'bad');stats.bumps=(stats.bumps||0)+1;}}}
function chocoLine(r,line,sp){
 if(r.skill>.35)for(const p of choco.mud){const ahead=wrapDiff(p.d0+p.len/2,r.distance);if(ahead>-p.len/2&&ahead<38+p.len/2){line=mudDodge(line,p);break;}}
 for(const b of choco.bould){const ahead=wrapDiff(b.d,r.distance);if(ahead>0&&ahead<45){const st=boulderState(elapsed+ahead/Math.max(sp,6),b.side,b.ph);if(st.phase==='roll'&&Math.abs(st.off-line)<3.6)line=st.off>line?st.off-4.4:st.off+4.4;}}
 return line;}
// ---------- Fahrbahn-Einfluss je Kart (vor driveKart): Glatteis, Flut auf der Sandbank
const _r6s={speedMul:1,gripMul:1,ice:false,wet:false};
function r60Surf(r){const o=_r6s;o.speedMul=1;o.gripMul=1;o.ice=false;o.wet=false;o.mud=false;if(r.air)return o;
 if(choco&&Math.abs(r.offset)<10){const dl=lapDist(r.distance);for(const p of choco.mud)if(onMud(p,lapDist(dl-p.d0),r.offset)){const m=mudSurf(true,r.boost>0);o.mud=true;o.speedMul=m.speedMul;o.gripMul=m.gripMul;break;}}
 if(!r60)return o;
 if(r60.ice.length&&Math.abs(r.offset)<12&&r60OnIce(r.distance)){o.ice=true;o.gripMul=ICE.grip;}
 const T6=r60.tide;if(T6&&T6.flooded&&forkBand(r.distance,r.offset)){const fk=forkAt(r.distance);if(fk&&fk.f===T6.f&&Math.abs(fk.off)>9){o.wet=true;o.speedMul=TIDE.slow;o.gripMul=TIDE.grip;}}
 return o;}
function r60Hits(r,me,dt,sf){if(!r60)return;const pl=racers[0];
 if(sf.ice&&r.driftDir)r.drift+=dt*(ICE.charge-1);
 if(sf.wet){if(frame%2===0&&nearPlayer(r,50)){const h=r.h||0;emit(r.x-Math.sin(h)*1.4,(r.y||0)+.3,r.z-Math.cos(h)*1.4,0xcff6ff,(Math.random()-.5)*3,2+Math.random()*2,(Math.random()-.5)*3,.45);}
  if(me&&(r.wetMsg||0)<elapsed){r.wetMsg=elapsed+3;toast('🌊 FLUT! Die Sandbank steht unter Wasser',1.3,'bad');SFX.splash();}}
 // Sandbank-Durchfahrt verbuchen (trocken = Erfolg "Gezeitenkenner")
 const T6=r60.tide;if(T6&&me){const fk=forkAt(r.distance),on=!!fk&&fk.f===T6.f&&forkBand(r.distance,r.offset)&&Math.abs(fk.off)>9;
  if(on&&!r.tideRun)r.tideRun={wet:false};if(on&&sf.wet&&r.tideRun)r.tideRun.wet=true;
  if(!on&&r.tideRun){const done=!fk||fk.rel>fk.f.span*.8;if(done&&!r.tideRun.wet){stats.tideDry=(stats.tideDry||0)+1;toast('🏝 TROCKEN ÜBER DIE SANDBANK!',1.2,'good');}r.tideRun=null;}}
 if(r.air)return;
 for(const z of r60.surf){const f=z.front;if(!f||!surfHits(f,r.offset))continue;const rel=lapDist(r.distance-z.s);if(rel>z.span)continue;if((r.surfT||0)>elapsed)continue;r.surfT=elapsed+1.4;
  if(r.shield>0){burst(r,0xbff4ff,10);continue;}const t=tanAt(r.distance),lx=t.z,lz=-t.x;r.vx+=-z.side*lx*SURF.push;r.vz+=-z.side*lz*SURF.push;hitKart(r,0,SURF.keep);burst(r,0xe8fbff,14);
  if(me){stats.waveHits=(stats.waveHits||0)+1;SFX.splash();toast('🌊 WELLE!',.8,'bad');shake=Math.max(shake,.25);}}
 for(const c of r60.crabs){if((r.crabT||0)>elapsed)break;const dx=r.x-c.x,dz=r.z-c.z,d2=dx*dx+dz*dz;if(d2>6.5)continue;const dl=Math.sqrt(d2)||1;r.vx+=dx/dl*3.5;r.vz+=dz/dl*3.5;hitKart(r,0,.74);r.crabT=elapsed+1.2;
  c.walk=1;c.flee=1.2;c.tgt=(Math.sign(c.off)||1)*10;if(me){stats.crabHits=(stats.crabHits||0)+1;toast('🦀 ZWICK!',.8,'bad');SFX.bump(.7);}break;}
 for(const c of r60.curls){const dx=r.x-c.x,dz=r.z-c.z,d2=dx*dx+dz*dz;if(d2>(2.9)**2||(r.curlT||0)>elapsed)continue;const dl=Math.sqrt(d2)||1,nx=dx/dl,nz=dz/dl,vn=r.vx*nx+r.vz*nz;
  r.x=c.x+nx*2.95;r.z=c.z+nz*2.95;if(vn<0){r.vx-=nx*vn*1.6;r.vz-=nz*vn*1.6;}const t=tanAt(c.d);r.vx+=t.z*c.v*.6;r.vz+=-t.x*c.v*.6;r.curlT=elapsed+.9;
  if(r.shield>0){burst(r,0xffe263,8);continue;}hitKart(r,.3,.66);if(me){stats.iceHits=(stats.iceHits||0)+1;SFX.bump(1);toast('EISSTOCK!',.8,'bad');shake=Math.max(shake,.3);}}
 for(const b of r60.blocks){if(b.broke!==null)continue;const dx=r.x-b.x,dz=r.z-b.z;if(dx*dx+dz*dz>(BLOCK.r+1)**2)continue;b.broke=elapsed;
  for(let k=0;k<18;k++){const a=Math.random()*TAU;emit(b.x,1+Math.random()*1.5,b.z,k%3?0xd8f4ff:0xffffff,Math.sin(a)*7,2+Math.random()*5,Math.cos(a)*7,.7);}
  if(nearPlayer(r,60)&&soundOn&&ctx){sfxNoise(.35,5200,1800,.14,2.2);[1760,2349,2637].forEach((f,i)=>sfxTone(f,f*.8,.12,'triangle',.03,i*.03));}
  if(r.shield>0||r.mega>0)continue;hitKart(r,BLOCK.stun,BLOCK.keep);if(me){stats.iceHits=(stats.iceHits||0)+1;toast('❄ EISBLOCK!',.8,'bad');shake=Math.max(shake,.25);}}
 for(const s of r60.sents){if(!s.st||!s.st.hot||(r.halT||0)>elapsed)continue;const dd=wrapDiff(r.distance,s.d);if(!sentinelHits(s.st,s.side,dd,r.offset))continue;r.halT=elapsed+1.6;
  if(r.shield>0){r.shield=0;burst(r,0xffe263,12);continue;}hitKart(r,1.1,.3);loseSpores(r,1);burst(r,0xd9c9a6,16);if(me){stats.halberdHits=(stats.halberdHits||0)+1;SFX.hit();toast('⚔ HELLEBARDE!',1,'bad');shake=Math.max(shake,.5);}}}
// KI: Krabben, Eisstoecken und Eisbloecken ausweichen, vor dem Schlag des Waechters die ferne Spur waehlen
function r60Line(r,line,sp){if(!r60)return line;
 for(const c of r60.crabs){const a=wrapDiff(c.d,r.distance);if(a>0&&a<30&&Math.abs(c.off-line)<3.4)line=c.off>line?c.off-4.2:c.off+4.2;}
 for(const c of r60.curls){const a=wrapDiff(c.d,r.distance);if(a>-2&&a<50){const ta=elapsed+Math.max(0,a)/Math.max(sp,6),off=curlOff(ta,c.amp,c.spd,c.ph);if(Math.abs(off-line)<5)line=clamp(off>line?off-5.4:off+5.4,-6.8,6.8);}}
 for(const b of r60.blocks){if(b.broke!==null)continue;const a=wrapDiff(b.d,r.distance);if(a>-2&&a<36&&Math.abs(b.off-line)<3.6)line=clamp(b.off>line?b.off-4:b.off+4,-6.6,6.6);}
 for(const s of r60.sents){const a=wrapDiff(s.d,r.distance);if(a<-3||a>55)continue;const ta=Math.max(0,a)/Math.max(sp,6),nx=sentinelNextHot(elapsed,s.ph);if(nx>ta-.8&&nx<ta+1.4)line=-s.side*6.3;}
 return line;}
function r60ForkOk(f,r,sp){const T6=r60&&r60.tide;if(!T6||T6.f!==f)return true;return tideDryFor(elapsed,(26+f.span)/Math.max(sp,14)+.5);}
// Landschaft der drei Themen (zufaellig verteilt, frei von Strecke, Zonen und Abzweigungen)
function r60Scenery(random,clear){const th=course.theme,list=(n,min,R=184,s0=1,s1=1)=>{const out=[];for(let i=0;i<Math.round(n*AK);i++){const x=(random()-.5)*2*R*WK,z=(random()-.5)*2*R*WK;if(Math.hypot(x,z)>R*WK||!clear(x,z,min))continue;const s=s0+random()*(s1-s0);out.push({x,z,s,ry:random()*TAU});addObstacle(x,z,.5*s);}return out;};
 if(th==='beach'){r60Inst(palmProto(),list(70,13,190,.85,1.35),.018);
  if(P.rock){const rocks=list(22,12,196,.6,1.8).map(t=>({...t,sx:.8+random()*.5,sy:.5+random()*.5}));scatterInstanced(P.rock,rocks,{StonePaint:0x9a8a7a,MossPaint:0x7a9a5a},140);}
  // Muscheln und Seesterne am Strand (winzig, ohne Hindernis)
  const sh=[];for(let i=0;i<Math.round(160*DENS);i++){const d=random()*length,off=(random()<.5?-1:1)*(12+random()*18);if(inGap(d)||forkRoadNear(d,off,7.5)||inTunnel(d))continue;const q=sample(d,off).p;sh.push({x:q.x,y:.05,z:q.z,s:.5+random()*.6,ry:random()*TAU,col:[0xffffff,0xffb0a0,0xffd28a,0xff7a5a][i%4]});}
  r60Inst(r60Proto('muschel',()=>r60Group([[new T.ConeGeometry(.35,.18,5).translate(0,.09,0),stdMat({name:'Paint',color:0xffffff,roughness:.6}),false]])),sh);}
 if(th==='ice'){r60Inst(firProto(),list(150,13,188,.75,1.4),.008);
  if(P.rock){const rocks=list(24,12,190,.7,2).map(t=>({...t,sx:.8+random()*.5,sy:.6+random()*.7}));scatterInstanced(P.rock,rocks,{StonePaint:0x8a96a8,MossPaint:0xf4f8fc},140);}
  const mt=new T.Mesh(mountainGeo(random,15,250,330),r60Mat({flatShading:true,roughness:.95}));mt.receiveShadow=true;world.add(mt);}
 if(th==='dome'){r60Inst(houseProto(),list(70,21,188,.75,1.15).map(t=>({...t,sy:.8+random()*.7})));r60Inst(cypressProto(),list(40,13,186,.8,1.25),.006);r60Inst(columnProto(),list(10,14,180,.8,1.1).map(t=>({...t,sy:.6+random()*.6})));
  const sp=spireGeo(random,13),mt=new T.Mesh(sp.body,r60Mat({roughness:.9,flatShading:true}));world.add(mt);const wm=new T.Mesh(sp.win,r60Glow(0xffc870,.9));wm.castShadow=false;world.add(wm);}}
// Inseln zwischen Abzweigung und Hauptstrecke: Palmen, Tannen oder Zypressen statt Pilzen
function r60IslandDecor(){const th=course.theme,proto=th==='beach'?palmProto():th==='ice'?firProto():th==='dome'?cypressProto():null;if(!proto)return false;const list=[];
 for(const f of forks)for(let rel=10;rel<f.span-10;rel+=13){const off=f.offT[Math.round(rel)],width=Math.abs(off)-FORK_HALF-9.4;if(width<4)continue;const mid=f.side*(9.4+width/2),p=samplePos(f.dA+rel,mid,new T.Vector3());list.push({x:p.x,y:Math.max(0,p.y-.2),z:p.z,s:Math.min(1.2,.2*width),ry:rel});addObstacle(p.x,p.z,.7);}
 r60Inst(proto,list,.012);return true;}

// ---------------------------------------------------------------- Partikel (Pool, keine Allokation im Rennen)
const _zeroM=new T.Matrix4().makeScale(0,0,0),_col=new T.Color();
function fxMesh(geo,material,n){const im=new T.InstancedMesh(geo,material,n);im.instanceMatrix.setUsage(T.DynamicDrawUsage);im.frustumCulled=false;im.castShadow=false;for(let i=0;i<n;i++){im.setMatrixAt(i,_zeroM);im.setColorAt(i,_col.setHex(0xffffff));}scene.add(im);return im;}
const SPARKS=260,sparkMesh=fxMesh(new T.BoxGeometry(.16,.16,.16),new T.MeshBasicMaterial({color:0xffffff}),SPARKS),sparkPool=Array.from({length:SPARKS},()=>({x:0,y:0,z:0,vx:0,vy:0,vz:0,life:0}));let sparkIdx=0;
// Konfetti (R30): eigene Instanzen statt Funken - groessere, drehende Zettelchen mit Schwanken
// Schwindel-Sterne (R46): nach einem Dreher kreisen drei gelbe Sterne ueber dem Kopf des Fahrers
const DIZZY_N=36,dizzyGeo=(()=>{const sh=new T.Shape();for(let i=0;i<10;i++){const a=i/10*TAU-Math.PI/2,rr=i%2?.1:.24;sh[i?'lineTo':'moveTo'](Math.cos(a)*rr,Math.sin(a)*rr);}return new T.ExtrudeGeometry(sh,{depth:.07,bevelEnabled:false}).center();})(),dizzyMesh=fxMesh(dizzyGeo,new T.MeshBasicMaterial({color:0xffe14a}),DIZZY_N);let dizzyOn=false;
function updateDizzy(now){let any=false;racers.forEach((r,i)=>{if(i*3+2>=DIZZY_N)return;const on=r.stun>.05&&r.finishTime===null&&r.mesh.visible&&(state==='race'||state==='countdown');
  for(let j=0;j<3;j++){if(!on){dizzyMesh.setMatrixAt(i*3+j,_zeroM);continue;}any=true;const p=r.mesh.position,sc=r.mesh.scale.y||1,f=Math.min(1,r.stun*3.5)*sc,a=now*.0075+j*TAU/3+i;
   _e.set(0,-a*1.6,Math.sin(now*.01+j)*.3);_q.setFromEuler(_e);_m.compose(_v.set(p.x+Math.cos(a)*.62*sc,p.y+2.35*sc+Math.sin(now*.012+j*2)*.09,p.z+Math.sin(a)*.62*sc),_q,_s.set(f,f,f));dizzyMesh.setMatrixAt(i*3+j,_m);}});
 if(any||dizzyOn)dizzyMesh.instanceMatrix.needsUpdate=true;dizzyOn=any;}
const CONFETTI=150,confettiGeo=new T.PlaneGeometry(.34,.24),confettiMesh=fxMesh(confettiGeo,new T.MeshBasicMaterial({side:T.DoubleSide}),CONFETTI),confettiPool=Array.from({length:CONFETTI},()=>({x:0,y:0,z:0,vy:0,ph:0,rv:0,sw:0,life:0}));let confettiIdx=0;
function dropConfettiBit(x,y,z,col){const i=confettiIdx++%CONFETTI,c=confettiPool[i];c.x=x;c.y=y;c.z=z;c.vy=-1.4-Math.random()*1.1;c.ph=Math.random()*TAU;c.rv=(Math.random()-.5)*9;c.sw=.6+Math.random()*.9;c.life=2.6+Math.random()*1.2;confettiMesh.setColorAt(i,_col.setHex(col));confettiMesh.instanceColor.needsUpdate=true;}
function emit(x,y,z,color,vx,vy,vz,life=.5){const i=sparkIdx++%SPARKS,s=sparkPool[i];s.x=x;s.y=y;s.z=z;s.vx=vx;s.vy=vy;s.vz=vz;s.life=life;sparkMesh.setColorAt(i,_col.setHex(color));sparkMesh.instanceColor.needsUpdate=true;}
function burst(r,color,n=5){const p=r.mesh.position;for(let i=0;i<n;i++){const a=Math.random()*TAU;emit(p.x,p.y+.5,p.z,color,Math.sin(a)*4,2+Math.random()*3,Math.cos(a)*4,.6);}}
const marks=new T.Group();scene.add(marks);
const markGeo=new T.PlaneGeometry(.32,.95);markGeo.rotateX(-Math.PI/2);sharedGeo.add(markGeo);
// R67: mehr und laenger liegende Spuren, Farbe je Untergrund (Eis hell, Sand/Schoko braun), auch beim Dreher
const SKIDS=LITE?160:420,skidMesh=fxMesh(markGeo,new T.MeshBasicMaterial({color:0x14181f,transparent:true,opacity:.36,depthWrite:false}),SKIDS),skids=Array.from({length:SKIDS},()=>({x:0,y:0,z:0,a:0,life:0}));let skidIdx=0;
function setSkid(i,s){if(s.life<=0){skidMesh.setMatrixAt(i,_zeroM);return;}_e.set(0,s.a,0);_q.setFromEuler(_e);_m.compose(_v.set(s.x,s.y,s.z),_q,_s.set(Math.min(1,s.life*.4),1,1));skidMesh.setMatrixAt(i,_m);}
function dropSkid(x,y,z,angle){const i=skidIdx++%SKIDS,s=skids[i];s.x=x;s.y=y+.08;s.z=z;s.a=angle;s.life=9;setSkid(i,s);skidMesh.instanceMatrix.needsUpdate=true;}
const puffGeo=new T.SphereGeometry(.18,8,6);sharedGeo.add(puffGeo);
const PUFFS=40,puffMesh=fxMesh(puffGeo,new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.36,depthWrite:false}),PUFFS),puffPool=Array.from({length:PUFFS},()=>({x:0,y:0,z:0,vx:0,vy:0,vz:0,life:0}));let puffIdx=0;
function dropPuff(r,color=0xdfe8e8){const i=puffIdx++%PUFFS,p=puffPool[i],s=Math.sin(r.h),c=Math.cos(r.h);p.x=r.x-s*1.4;p.y=(r.y||0)+.5;p.z=r.z-c*1.4;p.vx=-s*2+(Math.random()-.5);p.vy=.9;p.vz=-c*2+(Math.random()-.5);p.life=.75;puffMesh.setColorAt(i,_col.setHex(color));puffMesh.instanceColor.needsUpdate=true;}

// ---------------------------------------------------------------- Kart-Physik (vertikal), Kollisionen, Darstellung
function vertical(r,dt){let {y:ground,rh}=groundAt(r.distance,r.offset);
 // R57 Kotzhuegel-Arena: fester Sandboden. Die Hoehe aus der Streckenprojektion (fast 300 m entfernt) sprang am Rand auf
 // Luecken oder den See - Bots fielen durch den Boden und ruckelten
 if(course._arena&&worldMode){const A=course._arena;if((r.x-A.x)**2+(r.z-A.z)**2<(A.r+10)**2){ground=.06;rh=0;}}
 // Halfpipe (R52): an Wand und ueber der Lippe haelt die Pipe-Physik das Kart (update); flach bleibt es am Boden.
 // Wer mit normalem Luftstand (Kuppe, Treffer) an die Wand kommt, setzt dort auf.
 if(r.hpOn){if(r.y===undefined)r.y=ground;const roadVy=clamp((ground-(r.lastGround??ground))/Math.max(dt,1e-3),-45,45);r.lastGround=ground;
  if(r.air&&!r.hpAir)land(r,ground,roadVy);r.y=ground;r.vy=roadVy;r.rampY=0;r.onGapRamp=false;
  if(r.air)r.airT+=dt;if(r.trick>0)r.trick=Math.min(.45,r.trick+dt);return;}
 if(r.y===undefined){r.y=ground;r.vy=0;r.air=false;r.airT=0;r.trick=0;r.lastGround=ground;r.rampY=0;r.padCd=0;r.ringCd=0;r.stall=0;r.driftVis=0;}
 const roadVy=clamp((ground-r.lastGround)/Math.max(dt,1e-3),-45,45);r.lastGround=ground;
 // Anti-Grav: in der Rollzone haelt die Bahn bedingungslos fest. Aus JEDER
 // Hoehe wird das Kart eingeholt (Anflug ueber der Zone, Absprung, Treffer) - das alte Fenster
 // (nur unter ground+3.4) liess jeden fallen, der hoch hineinflog. Einholen mit festem Zug,
 // damit sich der Fang wie ein Magnet anfuehlt, nicht wie ein Teleport.
 // Vorfeld: der Magnet greift schon ~12 m vor der Zone - wer hoch ueber die Einfahrt anreist,
 // wird an der Bahnschwelle gefangen statt davor in die Leere zu segeln.
 if(magOn()&&!(worldMode&&Math.abs(r.offset)>14)&&(hasMag(r.distance)||agrav.some(q=>{const a=wrapDiff(q.s,r.distance);return a>0&&a<12;})||coasters.some(q=>{const a=wrapDiff(q.s,r.distance);return a>0&&a<12;}))&&!rh){if(r.air){r.air=false;r.airT=0;r.trick=0;}
  r.y+=(ground-r.y)*(1-Math.exp(-dt*16));if(Math.abs(ground-r.y)<.05)r.y=ground;
  r.vy=roadVy;r.rampY=0;r.onGapRamp=false;return;}
 if(r.air){r.vy-=G*gravMul(r.distance)*dt;r.y+=r.vy*dt;r.airT+=dt;
  // Kanten-Gnade (R26): wer eine Landekante knapp unter Niveau kreuzt (zu kurzer Sprung),
  // knallt auf die Fahrbahn und faehrt weiter, statt sofort am Rettungspilz zu landen.
  // Vorher pruefte y<ground-1.5 VOR der Landung - jeder grenzwertige Sprung ueber eine
  // Schlucht endete in einem Respawn-Zyklus (Canyon-Autopilot: 429 Respawns je Rennen).
  // R55 Wiesnland: abseits der Strasse springt die Zuordnung zur Strecke mal auf einen erhoehten Abschnitt (Bruecke) -
  // dann lag der "Boden" ploetzlich ueber dem Kart und der Rettungspilz setzte zurueck. Auf der Wiese wird gelandet.
  if(r.y<ground-1.5&&r.vy<0&&ground>-20){if(ground-r.y<6||(worldMode&&Math.abs(r.offset)>11)){land(r,ground,roadVy);}else{respawn(r);return;}}
  if(r.y<=ground&&ground>-20)land(r,ground,roadVy);}
 else if(!rh&&r.rampY>RAMP_H*.55){armGlider(r,'ramp');r.air=true;r.airT=0;r.vy=Math.min(16,6+Math.max(0,r.speed)*.22+(r.onGapRamp?2:0));r.y+=r.vy*dt;if(nearPlayer(r,50))SFX.ramp(r.id===0?1:.4);}
 // Kuppenabsprung nur, wenn die Fahrbahn schneller wegknickt, als die Haftung (G_STICK) haelt -
 // entschieden aus der Hoehenkruemmung, also unabhaengig von der Bildrate. Vorher verglich jeder
 // Frame Soll- und Ist-Hoehe: bei 20 fps hob das Kart schon an sanften Wellen ab und setzte wieder
 // auf (Buckelpiste auf dem Handy).
 else{const sp=Math.max(0,r.speed);if(sp>12&&sp*sp*vcurv(r.distance)<-G_STICK&&!(worldMode&&Math.abs(r.offset)>11)){r.air=true;r.airT=0;r.y=ground+.02;r.vy=roadVy;}else{r.y=ground;r.vy=roadVy;}}
 r.rampY=rh&&!r.air?rh.y:0;r.onGapRamp=rh?rh.ramp.gap:false;if(r.trick>0)r.trick=Math.min(.45,r.trick+dt);
 if(r.y<-4&&!hasMag(r.distance)){if(worldMode&&!inGap(r.distance)){r.y=Math.max(0,ground);r.vy=0;r.air=false;}else respawn(r);}}
function land(r,ground,roadVy){resetGlider(r);const impact=r.vy-roadVy,me=r.id===0;r.y=ground;r.vy=roadVy;r.air=false;r.airT=0;if(impact<-4)r.squash=clamp(-impact/40,.1,.3);
 if(r.trick>0){if(r.trick>=.42){r.boost=Math.max(r.boost,1.1);burst(r,0x7ceaff,14);if(me){stats.tricks++;SFX.trick();say('trick');toast('TRICK-TURBO!',1,'good');}}else{r.vx*=.7;r.vz*=.7;if(me)toast('WACKLIG!',.8,'bad');}r.trick=0;}
 if(me&&impact<-9){shake=Math.max(shake,Math.min(.3,-impact*.012));dropPuff(r);dropPuff(r);SFX.land(clamp(-impact/25,.25,1));}}
function startTrick(r){r.trick=.001;if(r.id===0)SFX.whoosh();}
// Rettungspilz: nach einem Sturz in die Schlucht zurueck vor die Anlaufstrecke
// Die Hoehe kommt aus groundAt, nicht aus sample: in einer Rollzone schwebt die sichtbare Bahn
// bis zu 12,5 m ueber dem Boden, und wer dort oben eingesetzt wird, faellt endlos im Kreis.
function respawn(r){resetGlider(r,true);const me=r.id===0,d=r.safeD??0,fromD=Math.round(lapDist(r.distance)),fromOff=+(r.offset||0).toFixed(1),s=sample(d,0),gy=groundAt(d,0).y,fell=gaps.some(g=>Math.abs(wrapDiff(g.c,lapDist(r.distance)))<40);r.x=s.p.x;r.z=s.p.z;r.h=s.angle;r.vx=r.vz=0;r.speed=0;r.distance+=wrapDiff(d,lapDist(r.distance));r.offset=0;r.y=gy+2.2;r.vy=0;r.air=true;r.airT=0;r.trick=0;r.hpOn=r.hpAir=r.hpOut=false;r.hpIn=null;r.driftDir=0;r.drift=0;r.stun=.5;r.lastGround=gy;
 if(me&&stats){stats.falls++;r.lapDirty=true;(stats.fallAt||(stats.fallAt=[])).push([fromD,fromOff,Math.round(lapDist(r.distance))]);toast(fell?'🎣 DER LUFT-LOISL FISCHT DICH RAUS! Mehr Tempo über die Schanze':'🎣 DER LUFT-LOISL FISCHT DICH RAUS!',2,'bad');if(P.loisl){r.rescue={t:0,gy};loislMode('rescue');}if(fell)SFX.splash();shake=.3;}}
const nearPlayer=(r,range)=>racers[0]&&Math.abs(r.distance-racers[0].distance)<range;
function collideStatic(r){hazardHits(r,r.id===0);trainHits(r,r.id===0);characterHits(r,r.id===0);if(r.hpOn&&Math.abs(r.offset)>HP.flat)return;const ix=Math.floor(r.x/16),iz=Math.floor(r.z/16);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const cell=obsGrid.get((ix+a+500)*1000+(iz+b+500));if(!cell)continue;for(const o of cell){const dx=r.x-o.x,dz=r.z-o.z,rr=o.r+1.05,d2=dx*dx+dz*dz;if(d2<rr*rr&&r.y<o.h){const d=Math.sqrt(d2)||1,nx=dx/d,nz=dz/d;r.x=o.x+nx*rr;r.z=o.z+nz*rr;bounce(r,nx,nz);}}}
 for(const s of swingers){if(s.kind==='ghost')continue;if(s.side){if(!s.active)continue;const dx=r.x-s.x,dz=r.z-s.z;if(dx*dx+dz*dz<7.3&&(r.burnCd||0)<elapsed&&(r.y||0)<trackAt(s.d).h+3){r.burnCd=elapsed+1.4;if(r.shield>0){r.shield=0;burst(r,0xffe263,10);}else{hitKart(r,1,.4);loseSpores(r,1);burst(r,0xff7a1a,16);if(r.id===0){SFX.hit();toast('ANGEBRANNT!',.9,'bad');}}}continue;}
  const dx=r.x-s.x,dz=r.z-s.z,rr=2.3+1.05,d2=dx*dx+dz*dz;if(d2<rr*rr&&r.y<trackAt(s.d).h+3){const d=Math.sqrt(d2)||1,nx=dx/d,nz=dz/d;r.x=s.x+nx*rr;r.z=s.z+nz*rr;bounce(r,nx,nz,true);}}
 const R=Math.hypot(r.x,r.z),RB=WK>1?210*WK-30:189;if(R>RB){const nx=-r.x/R,nz=-r.z/R;r.x=-nx*RB;r.z=-nz*RB;bounce(r,nx,nz);}}
function bounce(r,nx,nz,hard=false){const vn=r.vx*nx+r.vz*nz;if(vn>=0)return;r.vx-=nx*vn*1.06;r.vz-=nz*vn*1.06;const loss=Math.min(.35,-vn/70+(hard?.18:0));r.vx*=1-loss;r.vz*=1-loss;if(hard&&-vn>4)hitKart(r,.45,.9);
 if(-vn>5)r.combo=0;if(r.id===0&&-vn>5){shake=Math.max(shake,Math.min(.35,-vn*.02));SFX.bump(clamp(-vn/25,.2,1));stats.bumps++;r.lapDirty=true;}}
const _agP=new T.Vector3(),_agV=new T.Vector3(),_agAxis=new T.Vector3(),_agL=new T.Vector3(),_agB=new T.Vector3();
const _kX=new T.Vector3(),_kY=new T.Vector3(),_kZ=new T.Vector3(),_kM=new T.Matrix4(),_kQ=new T.Quaternion(),_kE=new T.Euler();
function syncKart(r,dt){const s=tanAt(r.distance),e=r.mesh.rotation,dot=Math.sin(r.h)*s.x+Math.cos(r.h)*s.z,bank=s.b;
 r.driftVis=(r.driftVis||0)+((r.driftDir||0)*.38-(r.driftVis||0))*Math.min(1,dt*10);
 const hopY=r.hop>0?Math.sin((HOP_T-r.hop)/HOP_T*Math.PI)*.42:0;
 const lift=.1+hopY+(r.air?0:Math.sin(elapsed*22+r.id)*.03*(Math.abs(r.speed)/30))+(r.spinO>0?Math.abs(Math.sin((1-r.spinO/r.spinD)*Math.PI*r.spinN))*.28:0);
 // R57: weit neben der Strasse (offene Welt, Kotzhuegel-Arena) direkt an die Physik-Lage. posAt verformte dort mit bis zu
 // 300 m Querversatz Rollzonen, Steilkurven und die See-Tauchspirale der zugeordneten Streckenstelle ins Bild - Karts
 // tauchten bis y=-338 ab, Neigung und Kamera ruckelten. Auf flacher Wiese liefert posAt dasselbe, der Wechsel springt nicht.
 const far=worldMode&&Math.abs(r.offset)>14;
 const inLoop=loops.length&&!far?loopAt(r.distance):null;
 // Immer derselbe Weg ins Bild - keine Schwelle, an der umgeschaltet wird. Ohne Rolle, Hub und
 // Looping gibt posAt genau die physikalische Lage zurueck, flach aendert sich also nichts.
 r.czFloatS=(r.czFloatS||0)+((r.czFloat||0)-(r.czFloatS||0))*Math.min(1,dt*9);
 if(far)r.mesh.position.set(r.x,(r.y??0)+lift+r.czFloatS,r.z);
 else r.mesh.position.copy(posAt(r.distance,r.offset,(r.y??0)-roadRef(r.distance,r.offset)+lift+r.czFloatS,_agP));e.order='YXZ';
 // R54 gegen das Ruckeln im Pulk: Kollisions-Korrekturen (Auseinanderschieben) springen nicht mehr ins Bild, sondern
 // werden als Versatz aufgefangen und klingen in ~0,1 s ab - die Physik bleibt exakt, nur die Darstellung ist weich
 if(r.vox||r.voz){const k=Math.exp(-dt*11);r.vox*=k;r.voz*=k;if(Math.abs(r.vox)+Math.abs(r.voz)<.002)r.vox=r.voz=0;if(!dbg.noSmooth){r.mesh.position.x+=r.vox;r.mesh.position.z+=r.voz;}}
 const spin=r.trick>0?Math.min(1,r.trick/.42)*TAU:0;
 // Der Looping ist reine Nickbewegung um die Querachse - Lenken bleibt davon unberuehrt
 if(r.spinO>0)r.spinO=Math.max(0,r.spinO-dt);const spk=r.spinO>0?1-r.spinO/r.spinD:1,spA=r.spinO>0?(1-Math.pow(1-spk,2.2))*r.spinN*TAU:0;
 e.y=r.h+r.driftVis+(r.spinO>0?spA:r.stun>0?elapsed*14:0)+spin;
 e.x=inLoop?-loopFrame(inLoop,r.distance).pitch:r.air?clamp(-r.vy*.02,-.45,.45):far?0:-Math.atan((slopeAt(r.distance)+(coasters.length?coasterP(r.distance).s:0))*dot);
 e.z=(far?0:-bank*dot+rollTot(r.distance))+(r.id===0?-(r.steerS||0)*.07:0)-r.driftVis*.12;
 // Im Schraeg-Looping zeigt das Kart entlang der geneigten Bahn: Grundlage ist der Rahmen aus
 // Tangente und Normale, Lenk- und Driftwinkel und die Schraeglage kommen lokal obendrauf.
 if(inLoop){const st=loopFrame(inLoop,r.distance),tn=tanAt(r.distance),tx=tn.x,tz=tn.z,yaw=angleDiff(e.y,Math.atan2(tx,tz)),roll=e.z;
  _kZ.set(tx*st.tf+tz*st.tl,st.tu,tz*st.tf-tx*st.tl);_kY.set(tx*st.nf,st.nu,tz*st.nf);
  _kX.crossVectors(_kY,_kZ).normalize();_kY.crossVectors(_kZ,_kX);
  r.mesh.quaternion.setFromRotationMatrix(_kM.makeBasis(_kX,_kY,_kZ)).multiply(_kQ.setFromEuler(_kE.set(0,yaw,roll,'YXZ')));}
 // Halfpipe (R52): auf der Wand steht das Kart auf der gekippten Flaeche - Rahmen aus Streckentangente und
 // Wandnormale, Lenk-, Drift- und Trickwinkel drehen um die Wandnormale (bei Winkel 0 genau die flache Lage)
 if(r.hpOn&&!inLoop){const hz=hpAt(r.distance);if(hz){hpProfile(r.offset,hpEnvAt(hz,r.distance),_hpp);if(Math.abs(_hpp.phi)>1e-4){const tn=tanAt(r.distance),tx=tn.x,tz=tn.z,c=Math.cos(_hpp.phi),sn=Math.sin(_hpp.phi),yaw=angleDiff(e.y,Math.atan2(tx,tz));
  _kZ.set(tx,0,tz);_kY.set(-tz*sn,c,tx*sn);_kX.crossVectors(_kY,_kZ).normalize();_kY.crossVectors(_kZ,_kX);
  r.mesh.quaternion.setFromRotationMatrix(_kM.makeBasis(_kX,_kY,_kZ)).multiply(_kQ.setFromEuler(_kE.set(e.x,yaw,e.z,'YXZ')));}}}
 // R45 Riesenpilz: waechst weich auf 1,75-fach, blinkt in der letzten Sekunde zwischen gross und klein
 {const tgt=r.mega>0?(r.mega<1.1&&Math.sin(elapsed*26)>0?1.25:1.75):1;r.megaS=(r.megaS||1)+(tgt-(r.megaS||1))*Math.min(1,dt*(r.mega>0&&r.mega<1.1?30:5));}
 let sv=(r.shrinkVis??1)+(((r.shrink||0)>0?.58:1)-(r.shrinkVis??1))*Math.min(1,dt*7);if(Math.abs(sv-1)<.002)sv=1;r.shrinkVis=sv;
 const ks0=r.kartScale||[1,1,1],sm=sv*(r.megaS||1),ks=sm===1?ks0:[ks0[0]*sm,ks0[1]*sm,ks0[2]*sm];
 if(r.flat>0){const fk=Math.min(1,(1.9-r.flat)/.12),ft=elapsed*9+r.id;r.mesh.scale.set(ks[0]*(1+.42*fk),ks[1]*(1-.88*fk),ks[2]*(1+.42*fk));r.mesh.rotation.x+=Math.sin(ft*1.3)*.18*fk;r.mesh.rotation.z+=Math.sin(ft)*.22*fk;}
 else if(r.squash>0){r.squash=Math.max(0,r.squash-dt*1.4);const q=Math.sin(r.squash/.3*Math.PI)*r.squash*.55;r.mesh.scale.set(ks[0]*(1+q*.6),ks[1]*(1-q),ks[2]*(1+q*.6));}
 else if(r.mesh.scale.y!==ks[1])r.mesh.scale.set(ks[0],ks[1],ks[2]);
 // Federung: Laengsbeschleunigung geglaettet, daraus Nicken und gegenlaeufiges Einfedern.
 // Ohne das steht das Kart starr auf den Raedern und wirkt wie ein Brett.
 {const sp=r.speed||0,a=(sp-(r.spdPrev??sp))/Math.max(dt,1e-3);
  r.spdPrev=sp;r.accS=(r.accS||0)+(a-(r.accS||0))*Math.min(1,dt*7);}
 const squat=clamp((r.accS||0)*.006,-.075,.075);
 e.x-=squat*.85;                                        // beschleunigen: Nase hoch, bremsen: Nase runter
 const parts=r.mesh.userData.parts;if(parts){const st=r.steerS||0;
  for(const w of parts.wheels){w.wh.rotation.x+=(r.speed*dt)/w.r*w.dir;if(w.front)w.piv.rotation.y=st*.42+(r.driftDir||0)*.12;
   if(w.y0===undefined)w.y0=w.piv.position.y;
   const c=(w.front?-squat:squat)*1.25-(r.air?.05:0);   // in der Luft haengen die Raeder aus
   w.piv.position.y=w.y0+c;}
  if(parts.dino)dinoAnim(parts.dino,r,dt);
  const d=parts.driver;if(d){const lean=-st*.2-(r.driftVis||0)*.3,done=r.finishTime!==null;d.rotation.z+=(lean-d.rotation.z)*Math.min(1,dt*8);d.rotation.x+=((r.air?-.2:r.czFloatS>.05?-.3:r.boost>0?.12:0)-d.rotation.x)*Math.min(1,dt*6);
   d.position.y=.95+(parts.dy||0)+(r.air?.14:0)+Math.min(.2,(r.czFloatS||0)*.6)+(done?Math.abs(Math.sin(elapsed*8+r.id))*.3:0)+Math.sin(elapsed*17+r.id)*.015*Math.min(1,Math.abs(r.speed)/20);if((frame+r.id)%6===0)r.lookT=driverLook(r);r.lookS=(r.lookS||0)+((r.lookT||0)-(r.lookS||0))*Math.min(1,dt*5);
   d.rotation.y=r.stun>0?Math.sin(elapsed*28)*.35:done?Math.sin(elapsed*5+r.id)*.4:r.lookS;}}
 syncGlider(r,dt,spin);r.mesh.userData.shield.visible=r.shield>0&&!(r.mega>0);const fl=r.boost>0;for(const f of r.mesh.userData.flames){f.visible=fl;if(fl)f.scale.set(1,1,.7+Math.random()*.7);}
 const ug=r.mesh.userData.underglow;if(ug)ug.visible=!r.air&&magOn()&&hasMag(r.distance)&&Math.abs(r.speed)>5;
 for(const b of r.mesh.userData.brakes||[])b.visible=!!r.braking;
 syncTransform(r,dt);}
// R67: Fahrer schauen zum naechsten Kart neben sich (oder kurz nach hinten, wenn einer dicht auffaehrt)
function driverLook(r){if(!nearPlayer(r,50))return 0;let best=null,bd=64;for(const o of racers){if(o===r||!o.mesh?.visible)continue;const dx=o.x-r.x,dz=o.z-r.z,d2=dx*dx+dz*dz;if(d2<bd){bd=d2;best=o;}}
 if(!best)return Math.sin(elapsed*.7+r.id*1.7)*.12;const a=angleDiff(Math.atan2(best.x-r.x,best.z-r.z),r.h);return clamp(a,-1.3,1.3)*.45;}
// Lenkhilfe (R39, Flow): wie Smart Steering - das Kart folgt der Kurve auf der Spur, auf der es
// gerade faehrt; die eigene Lenkung kommt obendrauf (Spur wechseln, Ideallinie, Drift). Vor Kurven,
// die zu eng fuer das Tempo sind, geht sie vom Gas. Rechnet auf der flachen Mittellinie - in
// Looping und Rollzone liegt das Bild woanders, gefahren wird aber flach.
// Lenkhilfe (R55 dreistufig): 'voll' lenkt die Kurven mit und bremst vor Ecken (frueher der Standard - man musste
// fast nur Gas geben), 'leicht' faengt nur am Fahrbahnrand ab, 'aus' ist reines Fahren (mehr XP). Neue Spieler am
// Rechner starten ohne, auf Touch-Geraeten mit leichter Hilfe; wer frueher bewusst "An" gewaehlt hatte, behaelt 'voll'.
let assistMode=(()=>{const v=store.get('assist2',null);if(v==='aus'||v==='leicht'||v==='voll')return v;const old=store.get('assist',null);
 if(old===false)return 'aus';if(old===true)return 'voll';return matchMedia('(pointer:coarse)').matches?'leicht':'aus';})(),raceAssist='aus';
// Saubere Runde (R55): kein Gras, keine Wand, kein Absturz - zaehlt fuer XP und den Erfolg "Blitzsauber"
function lapClean(r){const c=!r.lapDirty;r.lapDirty=false;if(c&&stats)stats.cleanLaps=(stats.cleanLaps||0)+1;return c;}
const _fa=new T.Vector3();
function flatPt(d,off,out){const [i,j,k]=tIdx(d);let tx=TP.tx[i]+(TP.tx[j]-TP.tx[i])*k,tz=TP.tz[i]+(TP.tz[j]-TP.tz[i])*k;const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;
 return out.set(TP.x[i]+(TP.x[j]-TP.x[i])*k+tz*off,0,TP.z[i]+(TP.z[j]-TP.z[i])*k-tx*off);}
function steerAssist(r,lim=6.5){const sp=Math.max(0,r.speed),look=6+sp*.34,tgt=flatPt(r.distance+look,clamp(r.offset,-lim,lim),_fa);
 const L=Math.hypot(tgt.x-r.x,tgt.z-r.z)||1,err=angleDiff(Math.atan2(tgt.x-r.x,tgt.z-r.z),r.h);
 return clamp(Math.max(sp,4)*2*Math.sin(err)/L/(PHYS.turn*Math.max(.2,turnCurve(sp))),-1,1);}
// Kurventempo voraus (wie die KI, ohne Drift): so schnell geht die engste Kurve im Bremsweg noch
function assistTop(r){const sp=Math.max(0,r.speed);let t=99;for(let s=6;s<=14+sp*1.2;s+=4){const v=trackAt(r.distance+s).v;t=Math.min(t,Math.sqrt(v*v+2*PHYS.coast*6*s));}return t;}
// Controller-Zustand (R50) vorab, damit steering()/hud() ihn schon vor dem Controller-Block kennen
const pad={steer:0,prev:null,gp:null,feel:null,modal:null,modalT:0};let padHints=false,padToasted=false;
const keys=new Set(),tkeys=new Set(),pkeys=new Set(),touchPtr=new Map(),held=c=>keys.has(c)||tkeys.has(c)||pkeys.has(c);function steering(){return (held('ArrowLeft')||held('KeyA')?1:0)-(held('ArrowRight')||held('KeyD')?1:0)||(oh.on?oh.steer:0)||pad.steer;}
// Ein-Hand-Steuerung (R45, Handy hochkant): ein Finger wischt links/rechts (stufenlos, der Nullpunkt wandert mit),
// Auto-Gas, Tippen = Hops (in der Luft Trick), weit wischen und kurz halten = Drift (Loslassen = Turbo),
// nach oben wischen = Item. Im Countdown zaehlt der aufgelegte Finger als Gas (Raketenstart).
const oh={on:false,id:null,x0:0,y0:0,t0:0,ax:0,moved:0,steer:0,full:0,opp:0,drift:false,dir:0,hop:0,item:false,taps:new Map()};
// Kurzanleitung: ab dem Countdown bis 4 s nach dem Start, in den ersten fuenf Rennen mit Ein-Hand-Steuerung
let ohHintOn=false;function ohHint(v){if(v===ohHintOn)return;ohHintOn=v;$('ohHint').classList.toggle('show',v);if(!v&&state==='race')store.set('ohHints',store.get('ohHints',0)+1);}
function ohTick(dt,p){if(oh.id===null){oh.drift=false;oh.full=0;return;}const s=oh.steer;
 if(!oh.drift){if(Math.abs(s)>=.9&&p.speed>12&&!p.air&&p.stun<=0){oh.full+=dt;if(oh.full>=.14){oh.drift=true;oh.dir=Math.sign(s);oh.opp=0;}}else oh.full=0;}
 // voll zur Gegenseite gewischt: Drift loesen (Turbo) - bleibt der Finger dort, driftet es gleich andersherum weiter
 else if(s*oh.dir<-.6){oh.opp+=dt;if(oh.opp>.22){oh.drift=false;oh.full=0;}}else oh.opp=0;}

// ---------------------------------------------------------------- KI-Fahrer: Ideallinie, Bremspunkte, Drifts (Koennen je Klasse)
function aiInput(r,dt){const sk=r.skill,sp=Math.max(0,r.speed),look=5+sp*.38;
 let kap=0;for(let s=10;s<=26;s+=8)kap+=trackAt(r.distance+s).kap;kap/=3;
 let line=clamp(kap*90,-4,4)*sk+r.laneBias*(1-sk*.6);
 // R49: geschickte Fahrer nehmen den naechsten Sonnen-Turbo mit
 for(const sp of sunPads){const g=wrapDiff(sp.d,r.distance);if(g>3&&g<55){line+=(sp.off-line)*sk*.8;break;}}
 // R48: ein Riesenpilz dicht dahinter - geschickte Fahrer weichen zur Seite aus (je besser, desto frueher)
 if(!r.mega){for(const q of racers)if(q!==r&&q.mega>0){const gap=r.distance-q.distance;if(gap>0&&gap<14+sk*22){line+=(r.offset>=q.offset?1:-1)*(3+sk*3);break;}}}
 const fkNear=forkAt(r.distance+22)||forkAt(r.distance);let onFork=false;if(fkNear){if(r.forkFor!==fkNear.f){r.forkFor=fkNear.f;r.forkPick=Math.random()<.2+sk*.4&&r60ForkOk(fkNear.f,r,sp);}onFork=r.forkPick;}else r.forkFor=null;
 // Schanzen/Schlucht: Ideallinie auf die Rampe; Bananen und Pendelpilzen ausweichen
 for(const rp of ramps){const ahead=wrapDiff(rp.d,r.distance);if(ahead>0&&ahead<(rp.gap?95:30))line=rp.off;}
 for(const h of hazards){if(h.fake&&h.fool&&(r.id+h.fool)%2)continue;const p=project(h.x,h.z,r.distance),ahead=wrapDiff(p.d,r.distance);if(ahead>2&&ahead<28&&Math.abs(p.off-line)<2.4)line=p.off+(p.off>line?-3.5:3.5);}
 for(const s of swingers){const ahead=wrapDiff(s.d,r.distance);if(ahead>0&&ahead<35){const ta=elapsed+ahead/Math.max(sp,5);if(s.side){const fb=fireballAt(ta,s.ph,s.side);if(fb.vis&&fb.y<2.4&&Math.abs(fb.off-line)<4)line=fb.off>line?line-3.5:line+3.5;continue;}const off=Math.sin(ta*s.spd+s.ph)*s.amp;if(Math.abs(off-line)<4)line=off>0?-4.6:4.6;}}
 if(chr){for(const c of chr.cows){const ahead=wrapDiff(c.d,r.distance);if(ahead>0&&ahead<34&&Math.abs(c.off-line)<3.6)line=c.off>line?c.off-4.4:c.off+4.4;}
  for(const h of chr.hands){if(h.up<.05&&h.crack.material.opacity<.1)continue;const ahead=wrapDiff(h.d,r.distance);if(ahead>0&&ahead<30&&Math.abs(h.off-line)<3)line=h.off>line?h.off-3.8:h.off+3.8;}
  for(const m of chr.mets){if(m.ring.material.opacity<.05)continue;const ahead=wrapDiff(m.d,r.distance);if(ahead>0&&ahead<36&&Math.abs(m.off-line)<4.2)line=m.off>line?m.off-5:m.off+5;}
  for(const gt of chr.gates){const ahead=wrapDiff(gt.d,r.distance);if(ahead>0&&ahead<40){const ph=Math.floor((elapsed+ahead/Math.max(sp,5))/BEAT)%4;if(ph===0)line=Math.max(line,3.5);else if(ph===2)line=Math.min(line,-3.5);}}}
 if(desert){for(const s of desert.twisters){const ahead=wrapDiff(s.d,r.distance);if(ahead>0&&ahead<40){const ta=elapsed+ahead/Math.max(sp,5),off=Math.sin(ta*s.spd+s.ph)*s.amp;if(Math.abs(off-line)<4.2)line=off>line?off-4.6:off+4.6;}}
  for(const q of desert.pits){const ahead=wrapDiff(q.d,r.distance);if(ahead>-12&&ahead<45&&Math.sign(q.off)*line>2)line=Math.sign(q.off)*2;}}
 if(hz){for(const st of hz.stampers){const ahead=wrapDiff(st.d,r.distance);if(ahead>0&&ahead<40&&Math.abs(st.off-line)<4.6){const a=stamperState(elapsed+ahead/Math.max(sp,5),st.ph);if(a.y<3||a.phase==='fall')line=st.off>0?st.off-5.4:st.off+5.4;}}
  for(const m of hz.missiles){if(m.d===undefined)continue;const ahead=wrapDiff(m.d,r.distance);if(ahead>0&&ahead<45&&Math.abs(m.off-line)<2.6)line=m.off>line?m.off-3.4:m.off+3.4;}
  // Graben-Hindernisse haben Vorrang: Wand und Tor durch die (vorausberechnete) Luecke, Finale mittig
  for(const o of hz.obs||[]){const ahead=wrapDiff(o.d,r.distance);if(ahead<=0||ahead>75)continue;if(o.k==='port'){if(ahead<60)line=0;continue;}if(o.k==='laser')continue;
   line=o.k==='gate'?obsGap(o,elapsed+ahead/Math.max(sp,8)):o.g;break;}}
 if(r60)line=r60Line(r,line,sp);
 if(choco)line=chocoLine(r,line,sp);
 if(oils.length&&r.skill>.3)for(const o of oils){const ahead=wrapDiff(o.d,r.distance);if(ahead>-o.r&&ahead<34){line=mudDodge(line,{off:o.off,hw:o.r});break;}}
 // R53 Verkehr (Nutzerhinweis "Karts verkeilen sich fuzzy"): nicht mehr stur auffahren. Langsameres Kart dicht voraus:
 // auf der freieren Seite vorbei; wer noch direkt dahinter klemmt, faehrt dessen Tempo mit. Nebeneinander: Abstand halten.
 let follow=Infinity;
 if(!onFork)for(const q of racers){if(q===r||q.finishTime!==null||q.air)continue;const ahead=wrapDiff(q.distance,r.distance),lat=q.offset-r.offset;
  if(ahead>0&&ahead<10+sp*.2&&Math.abs(lat)<2.6&&q.speed<sp+.5){const side=Math.abs(q.offset)>1.5?-Math.sign(q.offset):(lat>=0?-1:1);
   line=clamp(q.offset+side*3.4,-6.2,6.2);if(ahead<5.5&&Math.abs(lat)<2.2)follow=Math.min(follow,Math.max(0,q.speed)+.4);}
  else if(Math.abs(ahead)<=3&&Math.abs(lat)<2.9){r.sepQ=q;r.sepSide=lat===0?(r.id%2?-1:1):-Math.sign(lat);r.sepT=elapsed+.7;}}
 // R54 Hysterese: die Abstands-Entscheidung haelt 0,7 s (und solange der Nachbar noch neben einem ist) - sonst pendelte
 // die KI jedes Bild zwischen "ausweichen" und "zurueck auf die Linie", sichtbar als Zittern im Pulk
 if(!onFork&&r.sepQ&&(r.sepT>elapsed||Math.abs(wrapDiff(r.sepQ.distance,r.distance))<3.5)&&Math.abs(wrapDiff(r.sepQ.distance,r.distance))<6)line=clamp(r.sepQ.offset+r.sepSide*3.1,-6.2,6.2);else r.sepQ=null;
 if(onFork){const fa=forkAt(r.distance+look);if(fa)line=fa.off;}else line=clamp(line,-6.2,6.2);
 // Halfpipe (R52): je nach Koennen sucht sich ein KI-Fahrer eine Wand und zielt ueber die Lippe; nach dem Air
 // wechselt er die Seite oder bleibt unten (halfpipeStep). Ziel flach gerechnet - im Bild liegt die Wand woanders.
 const hzA=hpipes.length?hpAt(r.distance+look):null;
 if(hzA){if(r.hpFor!==hzA){r.hpFor=hzA;r.hpPick=Math.random()<.2+sk*.65?(Math.random()<.5?-1:1):0;}
  const x=lapDist(r.distance+look-hzA.s);if(r.hpPick&&x>HP.ramp-4&&x<hzA.span-HP.ramp-6)line=r.hpPick*(HP.flat+HP.R*Math.PI/2+5);}r.lineS=r.lineS===undefined?line:r.lineS+(line-r.lineS)*Math.min(1,dt*(onFork?8:hzA?5:2.6));line=onFork?line:r.lineS;
 // Pure Pursuit: Zielpunkt auf der Linie, daraus benoetigte Gierrate -> Lenkeinschlag
 const tgt=hzA||r.hpOn?flatPt(r.distance+look,line,_sp):samplePos(r.distance+look,line,_sp),L=Math.hypot(tgt.x-r.x,tgt.z-r.z)||1,err=angleDiff(Math.atan2(tgt.x-r.x,tgt.z-r.z),r.h);
 const needYaw=Math.max(sp,4)*2*Math.sin(err)/L;
 let steer=needYaw/(PHYS.turn*Math.max(.2,turnCurve(sp)))+Math.sin(elapsed*1.3+r.id*2)*.18*(1-sk);
 // Zieltempo: kleinste erlaubte Geschwindigkeit innerhalb der Bremsdistanz
 let target=PHYS.top*1.2;const brakeDecel=PHYS.brake*.8,dcap=sk>.55;
 for(let s=4;s<=12+sp*1.4;s+=4){const tr=trackAt(r.distance+s);let vc=(r.driftDir||dcap?tr.vd:tr.v)*(.84+.16*sk)*(r60&&r60.ice.length&&r60OnIce(r.distance+s)?ICE.aiCorner:1);if(onFork){const fa=forkAt(r.distance+s);if(fa)vc=Math.min(vc,fa.f.vT[fa.rel]*(.88+.12*sk));}target=Math.min(target,Math.sqrt(vc*vc+2*brakeDecel*s));}
 const gapAhead=gaps.some(g=>{const a=wrapDiff(g.start,r.distance);return a>0&&a<120;});if(gapAhead)target=99;
 // Anti-Grav-Einfahrt mit Bodenkontakt anfahren: Deckel verhindert Abspruenge/Turbo am Wandeintritt

 // Bahnuebergang (R44): ist der Zug bei Ankunft auf dem Uebergang, abbremsen und warten
 if(trainFx)for(const c of trainFx.crossings){const ahead=wrapDiff(c.d,r.distance);if(ahead>0&&ahead<55){const ta=ahead/Math.max(sp,4),fr=((trainFx.s+trainFx.speed*ta-c.s)%trainFx.len+trainFx.len)%trainFx.len;if(fr<34||fr>trainFx.len-8)target=Math.min(target,ahead<14?0:6);}}
 if(!gapAhead)target=Math.min(target,follow);
 const gas=sp<target-.3,brake=sp>target+2.5&&!gapAhead;
 // Drift: nur bei langen Kurven; Radius per Gegenlenken regeln; Ladestufe je Koennen, Release wenn die Kurve oeffnet
 let drift=false;r.driftCd=Math.max(0,r.driftCd-dt);
 // Anti-Grav dreht nur das Bild, gefahren wird normal: die KI darf hier driften wie ueberall
 const agNear=false;
 let turnAhead=0;for(let s=6;s<=46;s+=4)turnAhead+=trackAt(r.distance+s).kap*4;
 if(r.driftDir){const f=(needYaw*r.driftDir)/(PHYS.turn*Math.min(1,sp/10)),goal=sk>.85?2.35:sk>.6?1.45:.75;
  let exitSoon=0;for(let s=4;s<=20;s+=4)exitSoon+=trackAt(r.distance+s).kap*4;
  drift=!((f<.12&&r.drift>.45)||(r.drift>=goal&&Math.abs(exitSoon)<.28)||Math.abs(r.offset)>7.2||gapAhead||agNear);
  if(drift)steer=clamp(((f-.35)/.7)*2-1,-1,1)*r.driftDir;}
 // Bunny-Hop (R44): Taste ueber den Hopser halten und in die Kurve lenken, dann beginnt der Drift bei der Landung
 else if((r.hopT>0||r.hopGrace>0)&&r.aiHopDir){drift=true;steer=r.aiHopDir*.55;}
 else if(Math.abs(turnAhead)>.75&&sp>17&&r.driftCd<=0&&!r.air&&!gapAhead&&!agNear&&Math.abs(r.offset)<5){r.driftCd=1.5;r.aiHopDir=0;if(Math.random()<sk*.95){drift=true;steer=Math.sign(turnAhead);r.aiHopDir=steer;}}
 // R45: mit Tinte flattert die Linie, zwischendurch geht die KI vom Gas
 // (nicht vor Luecken, nicht in der Luft, nicht am Rand und nicht in Rollzonen - dort waere ein Sturz die Folge)
 if(r.ink>0&&!gapAhead&&!agNear&&!r.air&&Math.abs(r.offset)<5.5){steer+=Math.sin(elapsed*4.2+r.id*1.7)*.24;return {gas:gas&&(sp<14||Math.sin(elapsed*2.3+r.id)<=.55),brake,steer:clamp(steer,-1,1),drift};}
 // R54: Lenkeinschlag leicht glaetten (Zeitkonstante ~70 ms) - im Pulk zuckte die KI sonst bei jedem Schubser
 steer=clamp(steer,-1,1);if(!dbg.noSmooth){r.aiSt=r.aiSt===undefined?steer:r.aiSt+(steer-r.aiSt)*Math.min(1,dt*14);steer=r.aiSt;}
 return {gas,brake,steer,drift};}
function aiItems(r,order){if(TRAIL_ITEMS.has(r.item)&&!r.itemPending&&!r.trail)r.trail=r.item;if(r.cooldown>0||!r.item||r.itemPending)return;const pl=order.indexOf(r),ahead=order[pl-1],behind=order[pl+1],kap=Math.abs(trackAt(r.distance+20).kap);
 const use=r.item==='bomb'?ahead&&ahead.distance-r.distance>12&&ahead.distance-r.distance<45:r.item==='shell'?ahead&&ahead.distance-r.distance<70:r.item==='spiky'?ahead&&ahead.distance-r.distance<60:r.item==='coins'?(r.spores||0)<7:r.item==='banana'||r.item==='fake'?behind&&r.distance-behind.distance<35:r.item==='red3'?ahead&&ahead.distance-r.distance<70:r.item==='green3'?(ahead&&ahead.distance-r.distance<28&&Math.abs(ahead.offset-r.offset)<2.2)||(behind&&r.distance-behind.distance<14&&Math.abs(behind.offset-r.offset)<2.2&&(r.aiBack=true)):r.item==='mega'?(ahead&&ahead.distance-r.distance<30)||kap<1/120:r.item==='ink'?!!ahead:r.item==='cannon'?kap<1/60:r.item==='boost'||r.item==='triple'?kap<1/80&&!agrav.some(q=>{const a=wrapDiff(q.s,r.distance);return a>4&&a<55;}):true;
 if(use){useItem(r);r.cooldown=chargesFor(r.item)?1.2:2.5;}}

// ---------------------------------------------------------------- Audio: Sprecher, SFX (ElevenLabs), Musik
let audioReady=false;
function armAudio(){if(audioReady)return;audioReady=true;if(soundOn){audioInit();playBgm(state==='menu'||state==='finished'?'menu':raceTrack());if(state==='menu')say('welcome');}}
addEventListener('pointerdown',armAudio,{once:true});addEventListener('keydown',armAudio,{once:true});
addEventListener('keydown',e=>{if(introT>.3&&!e.repeat){introT=.3;stopFanfare(.12);}});addEventListener('pointerdown',()=>{if(introT>.3){introT=.3;stopFanfare(.12);}});
// R54: 'shield' (sagte noch "Sternenschild") und 'welcome' (alter Spielname) sind stumm, bis neue Aufnahmen da sind
const VOICE={start:'Auf die Plätze — fertig — los!',lap2:'Runde zwei',lastlap:'Letzte Runde!',turbo:'Turbo!',hit:'Volltreffer!',ouch:'Autsch!',banana:'Banane gelegt!',lead:'Du führst!',win:'Erster Platz!',podium:'Aufs Treppchen!',finish:'Im Ziel!',best:'Neue Bestzeit!',rocket:'Raketenstart!',early:'Zu früh!',trick:'Super Trick!',spores:'Volle Sporen-Power!',gpnext:'Weiter zum nächsten Rennen!',gpwin:'Grand-Prix-Sieger!',gppodium:'Aufs Grand-Prix-Treppchen!',gpfinish:'Grand Prix beendet!',coaster:'Super-Achterbahn!',launch:'Magnet-Katapult!'};
const VIP=new Set(['start','lap2','lastlap','win','podium','finish','best','gpnext','gpwin','gppodium','gpfinish']);
const SFX_MAX={c_win:5.2,c_lose:3.4,pickup:1.2,banana:1.6,hit:1,cheer:4,jingle:8,goodtry:6,finallap:4,spore:.6,ramp:1.3,trick:1.1,rocket:1.8,boost:1.4,lap:1.6,bump:.8,drift:1.2,launch:2.4};
// Musik bleibt das Fundament. Kurze Hinweise liegen darueber, Kollisionen und Jubel dahinter.
const AUDIO_MIX={effects:.78,voice:.95,music:.49,world:.82};
const SFX_RMS={c_star:.085,hit:.095,bump:.075,drift:.075,cheer:.075,boost:.105,rocket:.105,ramp:.095,spore:.09,jingle:.14,goodtry:.12,finallap:.115,launch:.11};
const CLIPS={};for(const k of Object.keys(VOICE))CLIPS['v_'+k]='assets/audio/voice/'+k+'.mp3';for(const k of Object.keys(SFX_MAX))CLIPS['s_'+k]='assets/audio/sfx/'+k+'.mp3';
// R44: selbst synthetisierte Chiptune-Effekte (art/r44/make_chiptune.mjs) haben Vorrang vor den Samples
const CHIP=['coin','item','lap','mt1','mt2','mt3','boost','hit','bump','slip','trick','ring','rocket','beep','go','cheer','whirl','sand','whistle','bell','moo','grab','meteor','boom','thunder','levelup','unlock','star','mega','shrink','squash','ink','megaloop','sun',
 'throw','fake','fakepop','spin','flat','unflat','warn','crown','select','whoosh','land','splash','wrong','bonus','spiky','crush','win','lose'];for(const k of CHIP)CLIPS['s_c_'+k]='assets/audio/sfx/chip/'+k+'.wav';
const clipData={},clipBuf={},clipFail={},clipNorm={},clipPlayed={},effectSources=new Set();let echoSend=null,ambSrc=null,ambGain=null,ambLfo=null,voiceGain=null,sfxGain=null,effectsOut=null,voiceSrc=null,voiceKey=null,voiceQueue=null,pendingVoice=null,duckUntil=0,ducked=false,engine=null,raceFilter=null,masterGain=null,worldGain=null,mixMuted=false,duckLevel=1,duckTick=0;
for(const [k,url] of Object.entries(CLIPS))clipData[k]=fetch(url).then(r=>{if(!r.ok)throw new Error(url);return r.arrayBuffer();}).catch(()=>{clipFail[k]=true;return null;});
const LOOP_CLIPS=new Set(['s_c_star','s_c_megaloop']);
function prepClip(k,b){if(LOOP_CLIPS.has(k)){let sum=0,n=0,peak=0;for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i++){peak=Math.max(peak,Math.abs(d[i]));if(i%3===0){sum+=d[i]*d[i];n++;}}}clipNorm[k]=Math.min(2.5,(SFX_RMS[k.slice(2)]||.11)/Math.max(Math.sqrt(sum/Math.max(1,n)),1e-4),.82/Math.max(peak,1e-4));return b;}
 const sr=b.sampleRate,ch=b.numberOfChannels,channels=Array.from({length:ch},(_,i)=>b.getChannelData(i)),d0=channels[0],audible=i=>channels.some(d=>Math.abs(d[i])>=.004);let start=0;while(start<d0.length&&!audible(start))start++;start=Math.max(0,start-Math.floor(sr*.005));const max=k.startsWith('s_')?(SFX_MAX[k.slice(2)]??2):10;let end=Math.min(d0.length,start+Math.floor(sr*max)),e=end-1;while(e>start&&!audible(e))e--;end=Math.min(end,e+Math.floor(sr*.03));
 const len=Math.max(1,end-start),out=ctx.createBuffer(ch,len,sr),fade=Math.min(len,Math.floor(sr*.04));let sum=0,n=0,peak=0;for(let c=0;c<ch;c++){const dst=out.getChannelData(c);dst.set(b.getChannelData(c).subarray(start,end));for(let i=0;i<fade;i++)dst[len-1-i]*=i/fade;for(let i=0;i<len;i++){peak=Math.max(peak,Math.abs(dst[i]));if(i%3===0){sum+=dst[i]*dst[i];n++;}}}
 const target=k.startsWith('v_')?.16:(SFX_RMS[k.slice(2)]||.11);
 // Spitzen begrenzen, statt leise Dateien samt Rauschen beliebig hochzuziehen.
 clipNorm[k]=Math.min(2.5,target/Math.max(Math.sqrt(sum/Math.max(1,n)),1e-4),.82/Math.max(peak,1e-4));return out;}
// Nacheinander dekodieren (kleine Pausen), damit der Start nicht an vielen gleichzeitigen Audio-Jobs haengt
async function decodeClips(){for(const k of Object.keys(CLIPS)){try{const ab=await clipData[k];if(ab){const b=await ctx.decodeAudioData(ab);clipBuf[k]=prepClip(k,b);if(pendingVoice&&'v_'+pendingVoice.key===k&&performance.now()-pendingVoice.t<900){const key=pendingVoice.key;pendingVoice=null;say(key);}}}catch(e){clipFail[k]=true;}await new Promise(r=>setTimeout(r,12));}}
function trackEffect(src){effectSources.add(src);src.onended=()=>{effectSources.delete(src);src.disconnect();};return src;}
function playClip(k,bus,vol=1,rate=1){const b=clipBuf[k],fx=k.startsWith('s_');if(!soundOn||!b||!ctx||(fx&&state==='paused'))return null;
 const t=ctx.currentTime;if(fx&&((t-(clipPlayed[k]??-99))<.09||effectSources.size>=18))return true;
 const s=ctx.createBufferSource();s.buffer=b;s.playbackRate.value=rate;const g=ctx.createGain();g.gain.value=vol*(clipNorm[k]||1);s.connect(g);g.connect(bus||sfxGain||masterGain);if(fx){clipPlayed[k]=t;trackEffect(s);}s.start();return s;}
function speak(text){if(!('speechSynthesis' in window))return;try{const u=new SpeechSynthesisUtterance(text);u.lang='de-DE';const v=speechSynthesis.getVoices().find(v=>v.lang&&v.lang.toLowerCase().startsWith('de'));if(v)u.voice=v;u.rate=1.1;u.volume=.6;speechSynthesis.cancel();speechSynthesis.speak(u);}catch{}}
function say(key){if(!soundOn||!VOICE[key])return;const now=performance.now(),busy=voiceSrc&&now<duckUntil;
 if(busy&&VIP.has(voiceKey)){if(VIP.has(key))voiceQueue=key;return;}
 if(ctx&&clipBuf['v_'+key]){try{voiceSrc?.stop();}catch{}voiceSrc=playClip('v_'+key,voiceGain,1);voiceKey=key;duckUntil=now+clipBuf['v_'+key].duration*1000+180;return;}
 if(!clipFail['v_'+key]){pendingVoice={key,t:now};return;}speak(VOICE[key]);}
function stopVoice(){try{voiceSrc?.stop();}catch{}voiceSrc=null;voiceQueue=null;pendingVoice=null;duckUntil=0;try{speechSynthesis.cancel();}catch{}}
// AudioParam nur bei spuerbarer Aenderung und laufendem Kontext nachfuehren (R44): jeder setTargetAtTime-
// Aufruf legt ein Automationsereignis an. Bei pausiertem Kontext (Handy vor dem ersten Tippen, Ton aus,
// Kopflos-Tests) laeuft die Zeit nicht weiter, die Listen wachsen endlos und kosteten im Profil 16 % CPU.
function aset(p,v,t,tc){if(ctx.state!=='running')return;const tol=Math.abs(v)*.006+1e-4;if(p._mrV!==undefined&&Math.abs(v-p._mrV)<=tol&&Math.abs(p.value-v)<=tol*4)return;p._mrV=v;p.cancelScheduledValues?.(t);p.setTargetAtTime(v,t,tc);}
function syncAudioMix(){if(!ctx)return;const quiet=!soundOn||state==='paused',t=ctx.currentTime;
 if(quiet||state!=='race')draftTick(0);
 if(quiet!==mixMuted){if(quiet){for(const s of effectSources){try{s.stop();}catch{}}effectSources.clear();}mixMuted=quiet;}
 aset(sfxGain.gain,quiet?0:AUDIO_MIX.effects,t,.045);aset(effectsOut.gain,quiet?0:1,t,.035);aset(worldGain.gain,quiet||!['race','countdown'].includes(state)?0:AUDIO_MIX.world,t,.08);aset(masterGain.gain,soundOn?.92:0,t,.035);}
// Mass Bier (R45 Schild; R54 Herzschild, R56 Mass Bier): eigene Chiptune-Schleife solange der Schild haelt, die Streckenmusik tritt so lange zurueck
let starSrc=null,starOut=null;
// R48: waehrend des Riesenpilzes laeuft statt der Stern-Melodie ein eigener Marsch (der Riesenpilz setzt intern das Schild)
function starTick(p){const k=p&&p.mega>0?'s_c_megaloop':p&&p.shield>0?'s_c_star':null,want=soundOn&&!!ctx&&!!k&&(state==='race'||state==='paused');
 if(want&&starSrc&&starSrc._k!==k&&clipBuf[k]){const t=ctx.currentTime,s0=starSrc,g0=starOut;g0.gain.setTargetAtTime(0,t,.04);try{s0.stop(t+.2);}catch{}s0.onended=()=>{s0.disconnect();g0.disconnect();};starSrc=starOut=null;}
 if(want&&!starSrc&&clipBuf[k]){starSrc=ctx.createBufferSource();starSrc._k=k;starSrc.buffer=clipBuf[k];starSrc.loop=true;starOut=ctx.createGain();starOut.gain.value=.95*(clipNorm[k]||1);starSrc.connect(starOut);starOut.connect(sfxGain||masterGain);starSrc.start();}
 else if(!want&&starSrc){const t=ctx.currentTime,s=starSrc,g=starOut;g.gain.setTargetAtTime(0,t,.05);try{s.stop(t+.3);}catch{}s.onended=()=>{s.disconnect();g.disconnect();};starSrc=starOut=null;}}
// Drift-Knistern (R46): solange der Spieler driftet, ein leises Chiptune-Trillern plus Funkenrauschen. Jede
// Drift-Turbo-Stufe hebt Tonhoehe und Tempo (blau -> rot -> lila) und klickt kurz - man hoert, wann loslassen lohnt.
const DRIFT_SND=[[196,14,.016,1400],[392,20,.022,2600],[587,26,.026,3800],[880,34,.03,5200]];let driftSnd=null;
function driftTick(level){const want=soundOn&&!!ctx&&level>=0&&state==='race';
 if(!want){if(driftSnd){const d=driftSnd,t=ctx.currentTime;driftSnd=null;d.g.gain.setTargetAtTime(0,t,.03);for(const o of d.src)try{o.stop(t+.2);}catch{}d.src[0].onended=()=>d.g.disconnect();}return;}
 const t=ctx.currentTime;
 if(!driftSnd){const o=ctx.createOscillator(),lfo=ctx.createOscillator(),lg=ctx.createGain(),n=ctx.createBufferSource(),bp=ctx.createBiquadFilter(),ng=ctx.createGain(),g=ctx.createGain();
  if(!noiseBuf){noiseBuf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  o.type='square';lfo.type='square';lfo.connect(lg);lg.connect(o.frequency);n.buffer=noiseBuf;n.loop=true;bp.type='bandpass';bp.Q.value=3;ng.gain.value=.55;
  o.connect(g);n.connect(bp);bp.connect(ng);ng.connect(g);g.gain.value=0;g.connect(sfxGain||masterGain);o.start(t);lfo.start(t);n.start(t);driftSnd={o,lfo,lg,bp,g,src:[o,lfo,n],lvl:-1};}
 if(level!==driftSnd.lvl){const [f,rate,vol,bf]=DRIFT_SND[Math.min(3,level)],d=driftSnd;
  // Trillern: Rechteck springt im LFO-Takt um eine Quinte (NES-Aufladegeraeusch)
  d.o.frequency.setTargetAtTime(f,t,.02);d.lg.gain.setTargetAtTime(f*.5,t,.02);d.lfo.frequency.setTargetAtTime(rate,t,.02);d.bp.frequency.setTargetAtTime(bf,t,.03);d.g.gain.setTargetAtTime(vol,t,.04);
  if(d.lvl>=0&&level>d.lvl)sfxTone(f*2,f*2.5,.06,'square',.03);d.lvl=level;}}
// Windschatten: ein leises Luftband steigt mit der Ladung; keine wiederholten Einzel-Samples.
let draftSnd=null;
function draftTick(charge=0){charge=Number.isFinite(charge)?clamp(charge,0,1):0;const want=soundOn&&!!ctx&&state==='race'&&charge>0;
 if(!want){if(draftSnd){const d=draftSnd,t=ctx.currentTime;draftSnd=null;d.g.gain.setTargetAtTime(0,t,.035);try{d.s.stop(t+.22);}catch{}d.s.onended=()=>{d.s.disconnect();d.f.disconnect();d.g.disconnect();};}return;}
 const t=ctx.currentTime;if(!draftSnd){if(!noiseBuf){noiseBuf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const data=noiseBuf.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;}const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseBuf;s.loop=true;f.type='bandpass';f.Q.value=.85;g.gain.value=0;s.connect(f);f.connect(g);g.connect(worldGain);s.start();draftSnd={s,f,g};}
 aset(draftSnd.f.frequency,650+charge*1650,t,.09);aset(draftSnd.g.gain,.012+charge*.026,t,.06);}
function duckBgm(now){if(voiceQueue&&now>=duckUntil){const k=voiceQueue;voiceQueue=null;say(k);}ducked=now<duckUntil;const dt=duckTick?Math.min(.1,Math.max(0,(now-duckTick)/1000)):1/60;duckTick=now;const target=(ducked?.66:1)*(starSrc?.28:1);duckLevel+=(target-duckLevel)*(1-Math.exp(-dt/(ducked||starSrc?.12:.48)));syncAudioMix();bgmTick(now);}
function audioInit(){if(ctx){if(ctx.state==='suspended')ctx.resume().catch(()=>{});return;}ctx=new (window.AudioContext||window.webkitAudioContext)();ctx.resume().catch(()=>{});
 masterGain=ctx.createGain();masterGain.gain.value=.92;masterGain.connect(ctx.destination);setTimeout(()=>bitOn&&bitAudio(),0);worldGain=ctx.createGain();worldGain.gain.value=AUDIO_MIX.world;worldGain.connect(masterGain);
 const o1=ctx.createOscillator();o1.type='sawtooth';const o2=ctx.createOscillator();o2.type='square';const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=700;f.Q.value=1.1;const g=ctx.createGain();g.gain.value=0;o1.connect(f);o2.connect(f);f.connect(g);g.connect(worldGain);o1.start();o2.start();
 const nb=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;const ns=ctx.createBufferSource();ns.buffer=nb;ns.loop=true;const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=950;bp.Q.value=3.2;const ng=ctx.createGain();ng.gain.value=0;ns.connect(bp);bp.connect(ng);ng.connect(worldGain);ns.start();
 engine={o1,o2,f,g,noise:ng,bp};
 voiceGain=ctx.createGain();voiceGain.gain.value=AUDIO_MIX.voice;voiceGain.connect(masterGain);sfxGain=ctx.createGain();sfxGain.gain.value=AUDIO_MIX.effects;
 const hp=ctx.createBiquadFilter(),soft=ctx.createBiquadFilter(),comp=ctx.createDynamicsCompressor();hp.type='highpass';hp.frequency.value=85;hp.Q.value=.7;soft.type='lowpass';soft.frequency.value=6500;soft.Q.value=.65;
 comp.threshold.value=-18;comp.knee.value=15;comp.ratio.value=3;comp.attack.value=.008;comp.release.value=.16;effectsOut=ctx.createGain();effectsOut.connect(masterGain);sfxGain.connect(hp);hp.connect(soft);soft.connect(comp);comp.connect(effectsOut);
 // Hallweg: im Tunnel wird er aufgezogen
 echoSend=ctx.createGain();echoSend.gain.value=0;const dl=ctx.createDelay(.6),fb=ctx.createGain(),lp=ctx.createBiquadFilter();
 dl.delayTime.value=.165;fb.gain.value=.22;lp.type='lowpass';lp.frequency.value=2200;
 const wet=ctx.createGain();wet.gain.value=.28;comp.connect(echoSend);echoSend.connect(dl);dl.connect(lp);lp.connect(fb);fb.connect(dl);lp.connect(wet);wet.connect(effectsOut);buildRaceFilter();decodeClips();}
let noiseBuf=null;
// Dauerklang der Lavawelt: gefiltertes Rauschen mit langsam atmender Lautstaerke
function setAmbience(on){if(!ctx)return;
 if(on&&!ambSrc){if(!noiseBuf){noiseBuf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  ambSrc=ctx.createBufferSource();ambSrc.buffer=noiseBuf;ambSrc.loop=true;
  const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=170;lp.Q.value=.7;
  ambGain=ctx.createGain();ambGain.gain.value=0;
  const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=.12;lg.gain.value=.055;lfo.connect(lg);lg.connect(ambGain.gain);lfo.start();ambLfo=lfo;
  ambSrc.connect(lp);lp.connect(ambGain);ambGain.connect(worldGain);ambSrc.start();
  ambGain.gain.setTargetAtTime(.18,ctx.currentTime,1.2);}
 else if(!on&&ambSrc){const s=ambSrc,g=ambGain,lfo=ambLfo;ambSrc=null;ambGain=null;ambLfo=null;g.gain.setTargetAtTime(0,ctx.currentTime,.4);setTimeout(()=>{try{s.stop();lfo?.stop();}catch(e){}},1400);}}
function sfxNoise(dur,f0,f1,vol=.2,q=2){if(!soundOn||!ctx||state==='paused'||effectSources.size>=18)return;const t=ctx.currentTime;if(!noiseBuf){noiseBuf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}const s=trackEffect(ctx.createBufferSource());s.buffer=noiseBuf;const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.Q.value=q;bp.frequency.setValueAtTime(f0,t);bp.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+dur);const gg=ctx.createGain();gg.gain.setValueAtTime(.001,t);gg.gain.linearRampToValueAtTime(vol,t+.006);gg.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(bp);bp.connect(gg);gg.connect(sfxGain);s.start(t,Math.random()*.9,dur+.02);}
function sfxTone(f0,f1,dur,type='square',vol=.08,delay=0){if(!soundOn||!ctx||state==='paused'||effectSources.size>=18)return;const t=ctx.currentTime+delay,o=trackEffect(ctx.createOscillator());o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);const gg=ctx.createGain();gg.gain.setValueAtTime(.001,t);gg.gain.linearRampToValueAtTime(vol,t+.005);gg.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(gg);gg.connect(sfxGain);o.start(t);o.stop(t+dur+.02);}
let agHum=null;
const SFX={
 // Magnetfeld-Summen des Spielers in Rollzonen: leiser Sawtooth durch Tiefpass, weich ein/ausgeblendet
 hum(on){if(!ctx||(on?agHum:!agHum))return;if(on&&!soundOn)return;
  if(on){const o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();
   o.type='sawtooth';o.frequency.value=50;f.type='lowpass';f.frequency.value=240;g.gain.value=0;
   o.connect(f);f.connect(g);g.connect(sfxGain||masterGain);o.start();
   g.gain.linearRampToValueAtTime(.045,ctx.currentTime+.25);agHum={o,g};}
  else{const h=agHum;agHum=null;h.g.gain.linearRampToValueAtTime(0,ctx.currentTime+.3);
   setTimeout(()=>{try{h.o.stop()}catch(e){}},450);}},
 pickup(){if(playClip('s_c_item',sfxGain,.7)||playClip('s_pickup',sfxGain,.6))return;[880,1108,1318].forEach((f,i)=>sfxTone(f,f,.09,'square',.05,i*.07));},
 tick(){sfxTone(1500,1400,.03,'square',.018);},
 // R61 Schoko-Matsch: schmatzender Matsch und rumpelnder Brocken
 // R61 8-Bit: zerspringender Kandelaber (Rechteck-Arpeggio abwaerts + Rauschen)
 crumble(){[1320,990,740,560].forEach((f,i)=>sfxTone(f,f*.97,.05,'square',.05,i*.035));sfxNoise(.18,900,3200,.08,1);},
 // R64: Dreher (Reifenquietschen), platt gedrueckt (Pfff + Papierflattern), Warnung von hinten (Doppelpiep)
 spin(v=1){if(playClip('s_c_spin',sfxGain,.75*v))return;sfxNoise(.55,2600,900,.09*v,7);sfxTone(950,420,.45,'sawtooth',.018*v);},
 flat(v=1){if(playClip('s_c_flat',sfxGain,.8*v))return;sfxNoise(.3,3200,700,.12*v,1.2);sfxTone(320,110,.22,'square',.05*v);sfxNoise(.5,5200,4000,.035*v,3);},
 warnBehind(){if(playClip('s_c_warn',sfxGain,.6))return;sfxTone(1250,1250,.07,'square',.045);sfxTone(1250,1250,.07,'square',.045,.12);},
 squelch(){sfxNoise(.3,160,520,.13,2.5);sfxTone(240,85,.24,'sine',.06);sfxTone(150,60,.18,'triangle',.04,.08);},
 rumble(v=1){sfxNoise(1.1,50,190,.17*v,1.2);sfxTone(72,42,.9,'triangle',.07*v);},
 drift(){playClip('s_drift',sfxGain,.5);},
 boost(){if(playClip('s_c_boost',sfxGain,.8)||playClip('s_boost',sfxGain,.85))return;sfxNoise(.5,400,3200,.18,1.5);sfxTone(180,760,.35,'sawtooth',.035);},
 // Windschatten bereit: kurzer Dur-Dreiklang; Schub bekommt eine eigene, tiefere Oktav-Figur.
 // R53 Besen-Zauberer: Wurf = aufsteigendes Zauber-Arpeggio, Landung = Funkelrauschen mit tiefem Plopp
 magic(){[784,1047,1319,1760].forEach((f,i)=>sfxTone(f,f*1.25,.07,'square',.022,i*.045));sfxTone(2600,3400,.2,'triangle',.012,.18);},
 spellLand(){sfxNoise(.3,2400,900,.07,3);sfxTone(330,180,.14,'square',.03);},
 draftready(){[659,988,1318].forEach((f,i)=>sfxTone(f,f,.09,'square',.029,i*.065));},
 draftboost(){[392,784,1175,1568].forEach((f,i)=>sfxTone(f,f*1.015,.12,'square',.033,i*.045));sfxNoise(.42,500,2600,.10,1.1);},
 // Hopser: kurzer Chiptune-Sprung (Rechteck, aufwaerts)
 moo(){playClip('s_c_moo',sfxGain,.6);},
 grab(){playClip('s_c_grab',sfxGain,.8);},
// R45: Riesenpilz, Tintenpilz, Tagesaufgabe (Chiptune)
mega(){playClip('s_c_mega',sfxGain,.85);},sun(){playClip('s_c_sun',sfxGain,.8);},shrink(){playClip('s_c_shrink',sfxGain,.75);},squash(){playClip('s_c_squash',sfxGain,.8);},ink(){playClip('s_c_ink',sfxGain,.85);},
 meteor(){playClip('s_c_meteor',sfxGain,.55);},
 boom(v=1){playClip('s_c_boom',sfxGain,.8*v);},
 thunder(){playClip('s_c_thunder',sfxGain,.8);},
 whirl(v=1){playClip('s_c_whirl',sfxGain,.7*v);},
 sand(){playClip('s_c_sand',sfxGain,.5);},
 whistle(){playClip('s_c_whistle',sfxGain,.75);},
 bell(){playClip('s_c_bell',sfxGain,.45);},
 hop(){sfxTone(300,640,.075,'square',.045);sfxTone(640,520,.05,'square',.025,.07);},
 mt(level){if(playClip('s_c_mt'+({mini:1,super:2,ultra:3}[level]||1),sfxGain,.85))return;const base={mini:520,super:660,ultra:880}[level]||520;[1,1.25,1.5].forEach((m,i)=>sfxTone(base*m,base*m*1.02,.09,'square',.045,i*.05));sfxNoise(.45,500,3600,level==='ultra'?.22:.14,1.4);},
 overtake(){sfxTone(988,1318,.08,'triangle',.05);},
 shell(){sfxTone(900,180,.22,'sawtooth',.06);sfxNoise(.15,2000,400,.08,2);},
 banana(){sfxTone(520,220,.3,'triangle',.07);},
 slip(v=1){if(playClip('s_c_slip',sfxGain,.8*v)||playClip('s_banana',sfxGain,.8*v))return;sfxTone(520,160,.45,'triangle',.08*v);},
 shield(){[660,880,1320].forEach((f,i)=>sfxTone(f,f*.99,.4,'triangle',.035,i*.03));},
 hit(v=1){if(playClip('s_c_hit',sfxGain,.9*v)||playClip('s_hit',sfxGain,.9*v))return;sfxTone(160,60,.25,'square',.1*v);sfxNoise(.18,300,90,.1*v,1);},
 bump(v=1){if(playClip('s_c_bump',sfxGain,.8*v)||playClip('s_bump',sfxGain,.75*v))return;sfxTone(130,55,.16,'sine',.16*v);sfxNoise(.12,700,150,.1*v,1);},
 splash(){if(playClip('s_c_splash',sfxGain,.8))return;sfxNoise(.9,1800,200,.25,.8);sfxTone(300,90,.5,'sine',.08);},
 cheer(){playClip('s_c_cheer',sfxGain,.7)||playClip('s_cheer',sfxGain,.6);},
 lap(){if(playClip('s_c_lap',sfxGain,.85)||playClip('s_lap',sfxGain,.8))return;sfxTone(784,784,.1,'square',.05);sfxTone(1046,1046,.22,'square',.05,.11);},
 fanfare(){[523,659,784,1046].forEach((f,i)=>sfxTone(f,f,i===3?.5:.13,'square',.06,i*.12));},
 // R62 Ampel: drei kurze Pieptoene (rot), ein langer hoher (gruen) - als eigene Rechteck-Toene, klar und gleich laut
 count(go){if(go){sfxTone(880,880,.62,'square',.075);sfxTone(1760,1760,.62,'square',.018);}else sfxTone(440,440,.17,'square',.075);},
 rocket(){if(playClip('s_c_rocket',sfxGain,.85)||playClip('s_rocket',sfxGain,.9))return;sfxNoise(.7,300,2600,.2,1.2);},
 ramp(v=1){if(playClip('s_ramp',sfxGain,.7*v))return;sfxTone(200,620,.3,'sine',.08*v);},
 boing(v=1){if(playClip('s_ramp',sfxGain,.7*v,1.25))return;sfxTone(160,700,.35,'triangle',.1*v);},
 trick(){if(playClip('s_c_trick',sfxGain,.8)||playClip('s_trick',sfxGain,.8,1.1))return;sfxTone(600,1500,.25,'triangle',.07);},
 whoosh(){if(playClip('s_c_whoosh',sfxGain,.7))return;sfxNoise(.3,500,2500,.1,1.4);},
 // R65: Brezn-Trio, Fake-Block, Pixel-Krone, Online-Bonus (art/r65/make_sfx.mjs)
 throw(){playClip('s_c_throw',sfxGain,.75)||sfxTone(420,1500,.15,'square',.04);},
 fake(){playClip('s_c_fake',sfxGain,.7);},fakepop(v=1){playClip('s_c_fakepop',sfxGain,.8*v);},
 crown(){playClip('s_c_crown',sfxGain,.9);},spiky(){playClip('s_c_spiky',sfxGain,.9)||SFX.rumble(1);},crush(v=1){playClip('s_c_crush',sfxGain,.85*v)||SFX.boom(v);},bonus(){playClip('s_c_bonus',sfxGain,.8);},select(){playClip('s_c_select',sfxGain,.5)||SFX.tick();},
 // Magnet-Katapult (R38): aufheulendes Linearmotor-Surren mit Schub. Ohne Clip: Synthese.
 launch(){if(playClip('s_launch',sfxGain,.95))return;sfxTone(90,900,.9,'sawtooth',.05);sfxTone(180,1800,.9,'square',.018);sfxNoise(.9,300,4200,.16,1.3);},
 // Jeder weitere Magnetbogen: kurzer, steigender Zap
 // Verwandlung (R39): Zischen und zwei helle Klicks, je Form eine andere Tonhoehe
 transform(form){if(!soundOn||!ctx||state==='paused')return;const t=ctx.currentTime,base=form==='plane'?660:form==='dive'?330:480;sfxNoise(.32,900,3400,.11,1.2);
  for(const [d0,f] of [[.05,base],[.15,base*1.5]]){const o=trackEffect(ctx.createOscillator()),g=ctx.createGain();o.type='square';o.frequency.setValueAtTime(f,t+d0);g.gain.setValueAtTime(.0001,t+d0);g.gain.exponentialRampToValueAtTime(.05,t+d0+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d0+.12);o.connect(g);g.connect(sfxGain);o.start(t+d0);o.stop(t+d0+.14);}},
 // Platschen beim Ein- und Auftauchen: Rauschen plus tiefer Plumps
 splash(){if(!soundOn||!ctx||state==='paused')return;sfxNoise(.5,2600,300,.2,.7);const t=ctx.currentTime,o=trackEffect(ctx.createOscillator()),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(55,t+.25);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(sfxGain);o.start(t);o.stop(t+.32);},
 // Drachengebruell (R39): tiefer, schwankender Saegezahn plus Rauschen - ohne Clip, rein synthetisch
 roar(){if(!soundOn||!ctx||state==='paused')return;const t=ctx.currentTime,o=trackEffect(ctx.createOscillator()),lfo=ctx.createOscillator(),lg=ctx.createGain(),f=ctx.createBiquadFilter(),g=ctx.createGain();
  o.type='sawtooth';o.frequency.setValueAtTime(95,t);o.frequency.linearRampToValueAtTime(70,t+1.3);lfo.frequency.value=17;lg.gain.value=9;lfo.connect(lg);lg.connect(o.frequency);
  f.type='lowpass';f.frequency.setValueAtTime(900,t);f.frequency.exponentialRampToValueAtTime(260,t+1.4);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(.16,t+.12);g.gain.exponentialRampToValueAtTime(.001,t+1.5);
  o.connect(f);f.connect(g);g.connect(sfxGain);o.start(t);lfo.start(t);o.stop(t+1.55);lfo.stop(t+1.55);sfxNoise(1.3,1200,300,.12,.8);},
 // Kamera-Ausloeser fuer das On-Ride-Foto
 shutter(){sfxNoise(.06,5200,2400,.1,2.5);sfxTone(2100,1500,.035,'square',.02,.03);},
 zap(i=1){sfxTone(260+i*110,760+i*150,.11,'sawtooth',.026);sfxNoise(.08,2600,5200,.035,3);},
 // Airtime: vorhandener ElevenLabs-Whoosh (Schanze) hoeher gespielt, darueber ein heller Schimmer
 airtime(){playClip('s_ramp',sfxGain,.45,1.3)||sfxNoise(.6,1400,400,.09,.9);[988,1318,1760].forEach((f,i)=>sfxTone(f,f*1.01,.16,'sine',.022,.08+i*.06));},
 fire(v=1){sfxNoise(.55,260,1700,.16*v,1.1);sfxTone(90,220,.4,'sawtooth',.05*v);},
 sail(){if(playClip('s_ramp',sfxGain,.18,.85))return;sfxNoise(.35,450,1100,.035,1.1);},
 ring(precise=false){if(playClip('s_c_ring',sfxGain,.7,precise?1.12:1))return;if(precise&&playClip('s_trick',sfxGain,.45,.92))return;[660,825,990].forEach((f,i)=>sfxTone(f,f,.13,'triangle',.028,i*.055));},
 spore(n){if(playClip('s_c_coin',sfxGain,.6,1+n*.012))return;if(playClip('s_spore',sfxGain,.4,1+n*.035))return;sfxTone(1200+n*60,1800+n*60,.08,'sine',.05);},
 land(v){if(playClip('s_c_land',sfxGain,.8*v))return;sfxTone(110,45,.2,'sine',.14*v);sfxNoise(.14,500,120,.08*v,1);},
 scrape(){sfxNoise(.14,2600,1500,.045,3);},
 boom(v=1){sfxNoise(1.1,1200,50,.4*v,.6);sfxTone(140,38,.7,'sine',.22*v);sfxTone(90,30,.9,'triangle',.12*v,.05);},
 combo(c){[0,1,2,3].slice(0,Math.min(4,c)).forEach((k,i)=>sfxTone(660*Math.pow(1.26,k),700*Math.pow(1.26,k),.08,'square',.04,i*.055));},
 spook(v=1){sfxTone(620,170,.6,'triangle',.07*v);sfxTone(640,185,.6,'sine',.05*v,.05);sfxNoise(.5,900,260,.07*v,2);},
 wrong(){if(playClip('s_c_wrong',sfxGain,.7))return;sfxTone(300,300,.12,'square',.04);sfxTone(240,240,.18,'square',.04,.14);}};
// Ein einziges Ereignis kann von Physik und Item-Logik im selben Bild gemeldet werden.
const FX_INTERVAL={boost:320,draftready:700,draftboost:650,bump:150,hit:150,drift:750,cheer:1800,ramp:180,boing:180,spore:70,land:150,scrape:150,ring:160,fire:180,spook:350,whoosh:180},fxPlayed={};
for(const [name,ms] of Object.entries(FX_INTERVAL)){const play=SFX[name];SFX[name]=(...args)=>{const now=ctx?ctx.currentTime*1000:performance.now();if(!soundOn||state==='paused'||now-(fxPlayed[name]??-9999)<ms)return;fxPlayed[name]=now;return play(...args);};}
// R61: eigene Chiptune-Stuecke je Strecke (art/r61/chiptune.mjs -> Blender-Mixdown), die alten drei bleiben fuer Pilz, Canyon, Neon
// R65: eigene Chiptune-Stuecke auch fuer Menue, Pilz-Promenade, Sonnen-Canyon, Neon-Pilzwald und Lobby-Welt (art/r61/chiptune.mjs, ffmpeg-MP3)
const BGM_SRC={menu:'bgm_menu8.mp3',alm:'bgm_alm.mp3',canyon:'bgm_canyon.mp3',neon:'bgm_neon.mp3',lobby:'bgm_lobby.mp3',race:'bgm_race.mp3',gothic8:'bgm_gothic8.mp3',polka:'bgm_polka.mp3',space:'bgm_space.mp3',beach:'bgm_beach.mp3',ice:'bgm_ice.mp3',dome:'bgm_dome.mp3',choco:'bgm_choco.mp3',lava:'bgm_lava.mp3',kirmes:'bgm_kirmes.mp3'},BGM_VOL=AUDIO_MIX.music,BGM_XF=2.2;
// R61: Chiptune-Stuecke auf die Lautheit der alten Musik (-15 dB RMS) und 1 dB leiser (Rechteckwellen klingen haerter)
const TRACK_GAIN={menu:.75,alm:.65,canyon:.66,neon:.67,lobby:.72,race:1,gothic8:.63,polka:.8,space:.65,beach:.86,ice:.72,dome:.71,choco:.71,lava:.62,kirmes:.99};
const bgm={current:null,ready:{},failed:{},tracks:{},rate:1};
for(const [name,src] of Object.entries(BGM_SRC)){const els=[0,1].map(()=>{const a=new Audio('assets/audio/'+src);a.preload=name==='menu'?'auto':'metadata';a.volume=0;return a;});els[0].addEventListener('canplaythrough',()=>bgm.ready[name]=true);els[0].addEventListener('error',()=>bgm.failed[name]=true);bgm.tracks[name]={els,gains:null,active:0,xf:-1,t0:0};}
const raceTrack=()=>{const m=courseAt(selected).music;return bgm.failed[m]?'race':m;};
function buildRaceFilter(){if(raceFilter||!ctx)return;try{raceFilter=ctx.createBiquadFilter();raceFilter.type='lowpass';raceFilter.frequency.value=4000;raceFilter.connect(masterGain);for(const n of Object.keys(BGM_SRC)){const tr=bgm.tracks[n];tr.gains=tr.els.map(a=>{const g=ctx.createGain();g.gain.value=0;ctx.createMediaElementSource(a).connect(g);g.connect(n==='menu'?masterGain:raceFilter);a.volume=1;return g;});}}catch{raceFilter=null;}}
function setTrackVol(tr,i,v){if(tr.gains)tr.gains[i].gain.value=v;else tr.els[i].volume=clamp(v,0,1);}
function setBgmRate(rate){bgm.rate=rate;const tr=bgm.tracks[bgm.current];if(!tr)return;for(const a of tr.els){a.preservesPitch=false;a.mozPreservesPitch=false;a.playbackRate=rate;}}
function stopBgm(){for(const tr of Object.values(bgm.tracks))tr.els.forEach((a,i)=>{a.pause();setTrackVol(tr,i,0);});bgm.current=null;}
function playBgm(name){if(!bgm.tracks[name])name='race';if(!soundOn||bgm.failed[name])return;if(bgm.current===name)return;stopBgm();const tr=bgm.tracks[name];tr.active=0;tr.xf=-1;tr.t0=performance.now();for(const a of tr.els)a.playbackRate=1;bgm.rate=1;const a=tr.els[0];try{a.currentTime=0;}catch{}bgm.current=name;a.play().catch(()=>{if(bgm.current===name)bgm.current=null;});}
function bgmTick(now){const tr=bgm.tracks[bgm.current];if(!tr)return;const a=tr.els[tr.active],b=tr.els[1-tr.active],dur=a.duration,base=BGM_VOL*(TRACK_GAIN[bgm.current]??.9)*duckLevel*(state==='paused'?.65:1)*Math.min(1,(now-tr.t0)/700),xfDur=BGM_XF*bgm.rate;
 if(tr.xf<0&&isFinite(dur)&&dur>BGM_XF*3&&a.currentTime>dur-xfDur){tr.xf=now;try{b.currentTime=0;}catch{}if(b.currentTime>1)b.load();b.playbackRate=bgm.rate;b.play().catch(()=>{});}
 let va=1,vb=0;if(tr.xf>=0){const k=Math.min(1,(now-tr.xf)/(BGM_XF*1000));va=Math.cos(k*Math.PI/2);vb=Math.sin(k*Math.PI/2);if(k>=1){a.pause();tr.active=1-tr.active;tr.xf=-1;setTrackVol(tr,1-tr.active,0);setTrackVol(tr,tr.active,base);return;}}
 setTrackVol(tr,tr.active,base*va);setTrackVol(tr,1-tr.active,base*vb);}
function setSound(){soundOn=!soundOn;if(soundOn)audioInit();if(engine)engine.g.gain.value=0;if(!soundOn){stopBgm();stopVoice();}else playBgm(state==='menu'||state==='finished'||state==='ceremony'?'menu':raceTrack());syncAudioMix();$('sound').textContent=soundOn?'♪ AN':'♪ AUS';$('sound').setAttribute('aria-label',soundOn?'Ton ausschalten':'Ton einschalten');}

// ---------------------------------------------------------------- Spielablauf
function newStats(){return {sunBoosts:0,megaSquash:0,inkBest:0,cowHits:0,twisterHits:0,trainHits:0,grabs:0,squashed:0,meteorHits:0,beatBoosts:0,rocket:0,mt:{mini:0,super:0,ultra:0},maxCombo:0,drafts:0,tricks:0,rings:0,precisionRings:0,airtime:0,coasters:0,hitsDealt:0,hitsTaken:0,overtakes:0,bestLap:Infinity,lapStart:0,falls:0,bumps:0,maxSpores:0};}
// R50: three.js bewertet das Shader-Programm neu, sobald ein Material abwechselnd fuer instanzierte und normale Meshes
// oder mit wechselndem receiveShadow gezeichnet wird - auf dem Handy kostete das bei jedem Zeichenaufruf CPU.
// Instanzierte Nutzer gemeinsamer Modell-Materialien bekommen eine feste Kopie (bleibt ueber Neuaufbauten gleich);
// ohne Schatten (Leicht-Modus) empfangen alle Meshes einheitlich "Schatten" (sieht gleich aus, kein Wechsel mehr).
const MAT_SPLIT=new WeakMap();
function splitSharedMaterials(root){
 if(LITE)root.traverse(o=>{if(o.isMesh)o.receiveShadow=true;});
 const plain=new Set(),inst=new Set();
 root.traverse(o=>{if(!o.isMesh||!o.material)return;for(const m of [].concat(o.material))if(m)(o.isInstancedMesh?inst:plain).add(m);});
 root.traverse(o=>{if(!o.isInstancedMesh||!o.material)return;let ch=false;
  const mats=[].concat(o.material).map(m=>{const keep=sharedMat.has(m)||persistentMats.has(m);if(!m||!plain.has(m)||!inst.has(m)||m.isShaderMaterial||!keep)return m;
   let alt=MAT_SPLIT.get(m);if(!alt){alt=m.clone();alt.name=m.name;alt.onBeforeCompile=m.onBeforeCompile;alt.customProgramCacheKey=m.customProgramCacheKey;MAT_SPLIT.set(m,alt);sharedMat.add(alt);persistentMats.add(alt);}ch=true;return alt;});
  if(ch)o.material=Array.isArray(o.material)?mats:mats[0];});}
function start(){$('shareBtn').hidden=true;wxRestore();blues=[];introT=(introForce||(!TEST&&!(net&&net.setup)))&&!worldMode?INTRO_S:0;introPrev=null;if(loisl)loisl.mode='';if(tsu){tsu.t0=null;tsu.msg='';tsu.at=course.tsunami?.at??44;}if(!(net&&net.setup&&net.setup.b))battleStop();setTimeout(()=>{if(worldMode&&!net&&mode==='world'&&state==='countdown'&&!battle)battleStart();},0);if(gp.active)selected=gp.list?gp.list[gp.race]:gp.race;worldMode=isOW(mode)&&!gp.active;if(worldMode){if(selected!==WORLD_IDX)lastRaceSel=selected;selected=WORLD_IDX;}else if(selected===WORLD_IDX)selected=lastRaceSel;document.body.classList.toggle('ow',worldMode);if(!worldMode)owPortalHide();syncTrackButtons();keys.clear();buildCourse();if(worldMode)owReset();setAmbience(!!theme.ember);state='countdown';elapsed=0;countdown=3;startPress=-1;noticeTimer=0;stats=newStats();wxStart();
 for(const id of ['menu','result','ceremony','pausePanel'])$(id).hidden=true;$('hud').hidden=false;$('pause').hidden=false;$('touch').hidden=false;$('gpBadge').hidden=!gp.active;$('hud').classList.toggle('tt',isTT());$('ttGhost').hidden=$('ttMedal').hidden=!isTT();if(isTT())for(const b of boxes)b.cooldown=1e9;
 raceMirror=!(net&&net.setup)&&mirrorOn&&!worldMode&&!isTT()&&progLevel()>=MIRROR_LVL;document.body.classList.toggle('mirror',raceMirror);
 document.body.classList.add('racing');document.body.classList.remove('cer');if(soundOn)audioInit();finishMusicAt=0;if(introT>0){stopBgm();playFanfare();}else playBgm(raceTrack());setBgmRate(course.bgmRate||1);stopVoice();say('start');updateCamera(1,true);
 splitSharedMaterials(scene);toast(`${course.name} · ${isTT()?'Zeitfahren':ccName(cc)}${raceMirror?' · 🪞 Spiegel':''}`,2.2);if(isTT()&&ghost)setTimeout(()=>toast('👻 Dein Geist fährt mit – schlag ihn!',2),2300);if(rivalId!==null){const rn=racers[rivalId].name;setTimeout(()=>{if(state==='countdown'||state==='race')toast(`⚔ RIVALE: ${rn.toUpperCase()}`,1.8);},2400);}if(coarseInput){wantFs=true;enterFs();}}
function home(){if(menuMode==='online'&&mode!=='online'){mode='online';setTimeout(()=>{syncModeUi();refreshMenu();syncModeUi();},0);}wxRestore();battleStop();document.body.classList.remove('mirror','ow');raceMirror=false;owPortalHide();setAmbience(false);gp.active=false;state='menu';keys.clear();buildCourse();for(const id of ['hud','touch','pause','pausePanel','result','ceremony'])$(id).hidden=true;$('menu').hidden=false;setText('message','');document.body.classList.remove('racing','cer');if(engine)engine.g.gain.value=0;SFX.hum(false);stopVoice();finishMusicAt=0;playBgm('menu');refreshMenu();}
let beforePause='race';function pause(){if(state==='paused'){state=beforePause;$('pausePanel').hidden=true;}else if(state==='race'||state==='countdown'){beforePause=state;state='paused';keys.clear();$('pausePanel').hidden=false;stopVoice();}if(engine)engine.g.gain.value=soundOn&&state==='race'?.011:0;}
function use(){if(state!=='race')return;useItem(racers[0]);}
// R67: Item hinter sich halten - Taste gedrueckt halten: Banane/Fake-Block haengen hinten am Kart und fangen einen Treffer ab,
// loslassen legt sie ab (kurzes Tippen wie bisher). Nach 10 s wird automatisch abgelegt.
const TRAIL_ITEMS=new Set(['banana','fake']),trailFx=new Map();
function itemDown(){if(state!=='race')return;const p=racers[0];if(p&&TRAIL_ITEMS.has(p.item)&&!p.itemPending&&!p.trail){p.trail=p.item;p.trailT=elapsed;SFX.select();return;}use();}
function itemUp(){const p=racers[0];if(!p?.trail)return;p.trail=null;if(state==='race'&&TRAIL_ITEMS.has(p.item))use();}
function trailTick(){const p=racers[0];if(p?.trail&&(state!=='race'||!TRAIL_ITEMS.has(p.item)||elapsed-p.trailT>10)){if(state==='race'&&TRAIL_ITEMS.has(p.item)&&elapsed-p.trailT>10){p.trail=null;use();}else p.trail=null;}
 // Anzeige fuer alle Karts in der Naehe (die KI haelt ihre Banane auch hinter sich, bis sie sie ablegt)
 for(const r of racers){const want=r.trail&&TRAIL_ITEMS.has(r.item)&&state!=='menu'&&nearPlayer(r,60)?r.trail:null;let fx=trailFx.get(r);
  if(fx&&(!want||fx.userData.k!==want||!fx.parent)){if(fx.parent)actors.remove(fx);trailFx.delete(r);fx=null;}if(!want)continue;
  if(!fx){fx=new T.Group();fx.userData.k=want;const m=want==='fake'?voxObj('qfake'):P.banana?cloneProto(P.banana):voxObj('qfake');m.scale.setScalar(want==='fake'?.55:.95);fx.add(m);actors.add(fx);trailFx.set(r,fx);}
  const mp=r.mesh.position;fx.position.set(mp.x-Math.sin(r.h)*2.7,mp.y+.08+Math.abs(Math.sin(elapsed*9+r.id))*.08,mp.z-Math.cos(r.h)*2.7);fx.rotation.y=r.h+Math.sin(elapsed*6+r.id)*.2;}}
function useItem(r){if(r.itemPending||(battle&&r.out))return null;if(r.id!==0)r.trail=null;const prevStun=racers.map(x=>x.stun),res=activate(r,racers);if(!res)return null;const me=r.id===0;
 if(res.type==='shell'&&res.target!==undefined)racers[res.target].stun=prevStun[res.target];
 if(me&&(res.type==='boost'||res.type==='triple'))SFX.boost();else if(me&&SFX[res.type])SFX[res.type]();
 if((res.type==='shell'||res.type==='red3')&&arenaFor(r)){const q=arenaTarget(r,70,true);res.target=q?q.id:undefined;}
 if(res.type==='red3'){fireShell(r,res.target,'red');if(nearPlayer(r,60))SFX.throw();}if(res.type==='green3'){res.back=r.id===0?(held('ArrowDown')||held('KeyS')):!!r.aiBack;r.aiBack=false;fireGreen(r,res.back);}if(res.type==='fake')dropFake(r);if(res.type==='spiky')fireSpiky(r);if(res.type==='coins')coinRain(r,res.gained||0);
 if(res.type==='cannon')startCannon(r);if(res.type==='blue')fireBlue(r,res.target);
 if(res.type==='banana')dropBanana(r);if(res.type==='shell')fireShell(r,res.target);if(res.type==='bomb')throwBomb(r);if(res.type==='storm')stormStrike(r,res.hit);
 if(res.type==='shield')emote(r,'love');
 if(res.type==='mega'){burst(r,0xff4a3d,16);if(!me&&Math.hypot(r.x-racers[0].x,r.z-racers[0].z)<60)SFX.mega();}
 if(res.type==='ink'){for(const id of res.targets)spawnInkcap(racers[id]);if(me)stats.inkBest=Math.max(stats.inkBest||0,res.targets.length);if(res.targets.includes(0)){inkSplash();SFX.ink();toast('TINTE! 🖋',1.1,'bad');}}
 if(net&&net.setup&&!r.net)netItem(r,res);
 if(me){coachLearn('item');if(res.type==='boost'||res.type==='triple')say('turbo');if(res.type==='shield')say('shield');if(res.type==='banana')say('banana');notice({coins:'MÜNZREGEN! +'+(res.gained||0),spiky:'XXL-STACHELPANZER!',green3:'GRÜNE BREZN! ×'+(res.charges||0),red3:'ROTE BREZN! ×'+(res.charges||0),fake:'FAKE-BLOCK! 😈',boost:'TURBO!',triple:'TURBO ×'+(res.charges||0),shield:'MASS BIER – PROSIT!',banana:'BANANE!',shell:'SUCH-BREZN!',bomb:'PILZBOMBE!',storm:'GEWITTERWOLKE!',mega:'RIESENWUCHS!',cannon:'BÖLLERSCHUSS!',blue:'BLAUE BREZN!',ink:res.targets&&res.targets.length?'TINTE FÜR '+res.targets.length+'!':'TINTENPILZ!'}[res.type],.8);}
 return res;}
const MAX_HAZARDS=14;
// Gewitterwolke (R46): ueber jedem getroffenen Kart eine dunkle Wolke, ein Zickzack-Blitz faehrt herab (geteilte
// Geometrie und Materialien, nach 0,7 s wieder weg), Donner und Bildblitz; getroffene Karts schrumpfen (core.mjs)
const stormMat=stdMat({color:0x4a4170,roughness:.85}),stormMatHi=stdMat({color:0x6a5fa0,roughness:.8}),boltMat=new T.MeshBasicMaterial({color:0xfff6b0}),boltGeo=new T.BoxGeometry(1,1,1),puffBall=new T.SphereGeometry(1,12,9);
[stormMat,stormMatHi,boltMat].forEach(m=>persistentMats.add(m));[boltGeo,puffBall].forEach(g=>sharedGeo.add(g));let stormFx=[];
function stormCloud(icon){const g=new T.Group();for(const [x,y,z,r,hi] of [[0,.1,0,.62,1],[-.62,-.05,.05,.46,0],[.6,-.04,-.04,.5,0],[-.2,-.18,.32,.42,0],[.25,.32,-.1,.44,1]]){const m=new T.Mesh(puffBall,hi?stormMatHi:stormMat);m.position.set(x,y,z);m.scale.set(r,r*.85,r);g.add(m);}
 if(icon){const b=new T.Mesh(new T.ExtrudeGeometry(boltShape(),{depth:.2,bevelEnabled:true,bevelSize:.04,bevelThickness:.04,bevelSegments:1}),stdMat({color:0xffe27a,emissive:0xffa51f,emissiveIntensity:.8,roughness:.3}));b.scale.setScalar(.5);b.position.set(.05,-.78,.1);g.add(b);}return g;}
function spawnBolt(k,blocked){const g=new T.Group(),top=9,cloud=stormCloud(false);cloud.scale.setScalar(1.9);cloud.position.y=top;g.add(cloud);
 const pts=[];for(let i=0;i<=6;i++){const t=i/6;pts.push(new T.Vector3(i&&i<6?(Math.random()-.5)*1.3:0,top-.6-t*(top-(blocked?2.4:1.4)),i&&i<6?(Math.random()-.5)*1.3:0));}
 const bolt=new T.Group();for(let i=0;i<6;i++){const a=pts[i],b=pts[i+1],d=_v.subVectors(b,a),len=d.length(),m=new T.Mesh(boltGeo,boltMat);m.scale.set(.2,len,.2);m.position.addVectors(a,b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(_kY.set(0,1,0),d.normalize());bolt.add(m);}
 g.add(bolt);g.position.set(k.x,(k.y||0),k.z);actors.add(g);stormFx.push({g,bolt,k,life:.7});}
function updateStorm(dt){for(let i=stormFx.length-1;i>=0;i--){const f=stormFx[i];f.life-=dt;f.g.position.set(f.k.x,f.k.y||0,f.k.z);f.bolt.visible=f.life>.3&&Math.sin(f.life*90)>-.3;f.g.children[0].scale.setScalar(1.9*Math.min(1,f.life*3));if(f.life<=0){actors.remove(f.g);stormFx.splice(i,1);}}}
// R52: Bildblitz hoechstens halbweiss (Gewitterwolken-Treffer war 70 %), bei "Bewegung reduzieren" nur ein Hauch
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)'),calmK=()=>REDUCED.matches?.25:1;
function flashScreen(v){const f=$('flash');if(!f)return;v=Math.min(v,.5)*calmK();f.style.transition='none';f.style.opacity=String(v);requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.transition='opacity .45s';f.style.opacity='0';}));}
function stormStrike(u,hit){const me=u.id===0;let meHit=false,dealt=0,near=me;
 for(const h of hit){const k=racers[h.id];if(!k)continue;if(nearPlayer(k,140)){spawnBolt(k,h.blocked);near=true;}
  if(h.id===0){if(h.blocked)toast('SCHILD HÄLT DEN BLITZ AB!',1,'good');else{meHit=true;stats.hitsTaken++;if(roulette){roulette=null;k.itemPending=false;}}}else if(!h.blocked)dealt++;}
 if(me){stats.hitsDealt+=dealt;stats.stormBest=Math.max(stats.stormBest||0,dealt);toast(dealt?`⚡ ${dealt} GETROFFEN!`:'⚡ NIEMAND VOR DIR',1.1,dealt?'good':'');}
 if(meHit){toast('⚡ GEWITTER! DU BIST KLEIN',1.4,'bad');shake=.5;say('ouch');}
 if(near||meHit){SFX.thunder();flashScreen(me||meHit?.7:.3);}}
// R47 Tintenpilz. Spieler: Tintenkleckse auf dem Bild, die langsam abrutschen; mit Turbo schneller weg.
// Getroffene Karts: ein Tintling (Blender-Modell) ploppt ueber ihnen auf, wackelt und zerlaeuft zu Tinte.
const inkEl=document.createElement('div');inkEl.id='inkFx';inkEl.setAttribute('aria-hidden','true');document.body.appendChild(inkEl);
const INK_BLOB="<svg viewBox='0 0 100 100'><path fill='#0d0b14' d='M50 8c9 0 12 10 20 9s15 6 13 15-3 11 4 17-1 17-9 18-9 9-8 17-6 9-11 3-7-6-14-4-15-1-14-10 4-9-3-14-9-14 0-19 11-4 11-13 11-19 21-20z'/><ellipse cx='36' cy='34' rx='9' ry='5' fill='#fff' opacity='.12' transform='rotate(-30 36 34)'/></svg>";
function inkSplash(){let h='';for(let i=0;i<6;i++){const sz=18+Math.random()*22,x=8+Math.random()*(84-sz),y=10+Math.random()*(70-sz*.6);h+=`<i style="left:${x}vw;top:${y}vh;width:${sz}vmin;height:${sz}vmin;animation-delay:${(i*.06).toFixed(2)}s,${(.6+Math.random()*.8).toFixed(2)}s;transform:rotate(${Math.round(Math.random()*360)}deg)">${INK_BLOB}</i>`;}inkEl.innerHTML=h;inkEl.classList.remove('on');void inkEl.offsetWidth;inkEl.classList.add('on');}
const inkcaps=[];
function spawnInkcap(r){if(!P.inkcap||!r)return;let e=inkcaps.find(q=>!q.g.visible);if(!e){const g=cloneProto(P.inkcap);g.traverse(o=>{if(o.isMesh)o.castShadow=false;});actors.add(g);e={g};inkcaps.push(e);}
 e.r=r;e.t=0;e.g.visible=true;e.g.scale.setScalar(.01);burst(r,0x15121c,10);}
function updateInk(dt){const pl=racers[0];if(pl){if(pl.ink>0&&pl.boost>0)pl.ink=Math.max(0,pl.ink-dt*1.4);const o=pl.ink>0?Math.min(1,pl.ink/1.1):0;if(inkEl._o!==o){inkEl.style.opacity=o.toFixed(2);inkEl._o=o;}if(!(pl.ink>0)&&inkEl.innerHTML&&o===0)inkEl.innerHTML='';}
 for(const e of inkcaps){if(!e.g.visible)continue;e.t+=dt;const t=e.t,r=e.r,p=r.mesh.position,life=1.5;if(t>life||!r.mesh.visible){e.g.visible=false;continue;}
  const pop=Math.min(1,t/.18),melt=Math.max(0,(t-.9)/(life-.9)),s=(t<.18?pop*1.15:1+Math.sin(t*22)*.06*(1-melt))*1.45;
  e.g.scale.set(s*(1+melt*.6),s*(1-melt*.85),s*(1+melt*.6));e.g.position.set(p.x,p.y+2.2+(1-pop)*.6-melt*1.6,p.z);e.g.rotation.set(0,camH+Math.PI,Math.sin(t*14)*.18*(1-melt));
  if(melt>0&&Math.random()<dt*25)emit(p.x+(Math.random()-.5)*1.6,p.y+1.2,p.z+(Math.random()-.5)*1.6,0x15121c,0,-3,0,.5);}}
function dropBanana(r){if(hazards.length>=MAX_HAZARDS){const old=hazards.shift();actors.remove(old.mesh);}const x=r.x-Math.sin(r.h)*3.2,z=r.z-Math.cos(r.h)*3.2,g=new T.Group();actors.add(g);g.position.set(x,r.y,z);
 // In Achterbahn und Rollzone liegt die Bahn im Bild hoeher als in der Physik - sonst laege die
 // Banane unsichtbar unter der schwebenden Fahrbahn. Getroffen wird weiter flach (x/z, r.y).
 if(hasMag(r.distance-3.2))posAt(r.distance-3.2,r.offset,0,g.position);g.rotation.y=Math.random()*TAU;
 // R52: auf der Halfpipe-Wand liegt sie an der Wand (Bild), gekippt wie die Wand; getroffen wird weiter flach
 {const hd=r.distance-3.2,hz=hpipes.length&&Math.abs(r.offset)<HP.outer?hpAt(hd):null;if(hz){posAt(hd,r.offset,0,g.position);hpProfile(r.offset,hpEnvAt(hz,hd),_hpp);if(_hpp.phi){const tn=tanAt(hd);g.quaternion.setFromAxisAngle(_agAxis.set(tn.x,0,tn.z),_hpp.phi).multiply(_kQ.setFromEuler(_kE.set(0,Math.random()*TAU,0)));}}}if(P.banana){const b=cloneProto(P.banana);b.scale.setScalar(1.6);g.add(b);}else mesh(new T.ConeGeometry(.6,1.3,5),gold,g,0,.7,0);hazards.push({mesh:g,x,z,y:r.y,life:25,owner:r.id,arm:.4});}
function fireShell(r,target,kind){const g=new T.Group();if(kind==='red'){const v=voxObj('brezn_red');v.scale.setScalar(1.1);g.add(v);}else if(P.shell){const s=cloneProto(P.shell);s.scale.setScalar(1.25);g.add(s);}else sphere(g,mat(0x5cc46a),0,.4,0,.55,.4,.55);actors.add(g);
 if(arenaFor(r)){const fx=Math.sin(r.h),fz=Math.cos(r.h),sp=Math.max(r.speed,0)+30;shots.push({g,free:true,x:r.x+fx*2.6,z:r.z+fz*2.6,y:(r.y||0)+.2,vx:fx*sp,vz:fz*sp,owner:r.id,target,t:0});return;}
 shots.push({g,d:r.distance+2.5,off:r.offset,owner:r.id,target,t:0});}
// Gruene Brezn: faehrt stur geradeaus die Strecke entlang (feste Spur), trifft den Ersten, den sie erwischt - auch den Werfer
function fireGreen(r,back=false){const g=new T.Group(),v=voxObj('brezn_green');v.scale.setScalar(1.1);g.add(v);actors.add(g);if(nearPlayer(r,60))SFX.throw();
 if(arenaFor(r)){const k=back?-1:1,fx=Math.sin(r.h)*k,fz=Math.cos(r.h)*k,sp=back?24:Math.max(r.speed,0)+32;shots.push({g,green:true,free:true,x:r.x+fx*2.6,z:r.z+fz*2.6,y:(r.y||0)+.2,vx:fx*sp,vz:fz*sp,owner:r.id,t:0});return;}
 shots.push(back?{g,green:true,d:r.distance-2.8,off:r.offset,v:-24,owner:r.id,t:0}:{g,green:true,d:r.distance+2.6,off:r.offset,v:Math.max(r.speed,18)+30,owner:r.id,t:0});}
function greenStep(sh,dt){let hit=null;
 if(sh.free){sh.x+=sh.vx*dt;sh.z+=sh.vz*dt;sh.g.position.set(sh.x,sh.y+.15+Math.abs(Math.sin(sh.t*18))*.18,sh.z);
  for(const k of racers){if(k.finishTime!==null||k.out||(k.id===sh.owner&&sh.t<.5))continue;if(Math.hypot(k.x-sh.x,k.z-sh.z)<1.9){hit=k;break;}}
  if(!hit&&sh.t<3.2&&Math.hypot(sh.x-ARENA.x,sh.z-ARENA.z)<ARENA.r+4)return false;}
 else{sh.d+=sh.v*dt;const s=samplePos(sh.d,sh.off,_sp);sh.g.position.set(s.x,s.y+.15+Math.abs(Math.sin(sh.t*18))*.18,s.z);
  for(const k of racers){if(k.finishTime!==null||(k.id===sh.owner&&sh.t<.5))continue;if(Math.abs(wrapDiff(k.distance,sh.d))<1.8&&Math.abs(k.offset-sh.off)<1.7&&Math.abs((k.y||0)-s.y)<3){hit=k;break;}}
  if(!hit&&sh.t<3.2)return false;}
 sh.g.rotation.y+=dt*16;
 if(hit)shellImpact({target:hit.id,owner:sh.owner,g:sh.g});else burst({mesh:sh.g},0x8beb73,8);return true;}
// R66: Fahrschule - Tipps nur, wenn sie gebraucht werden (kein Gas nach dem Start, erste Kurve ohne Drift-Turbo, Item
// liegt ungenutzt im Slot), passend zu Tastatur, Touch oder Controller. Jeder Tipp hoechstens dreimal, gelernt = nie wieder.
const COACH={gas:{kb:'⬆ / W = Gas geben · ⬅ ➡ / A D = lenken',touch:'GAS halten · ◀ ▶ lenken',pad:'A oder RT = Gas · Stick = lenken'},
 drift:{kb:'Kurve! SHIFT halten = Hopsen & Driften → Funken → loslassen = Turbo',touch:'Kurve! HOPS halten = Driften → loslassen = Turbo',pad:'Kurve! LB/RB halten = Driften → loslassen = Turbo'},
 item:{kb:'LEERTASTE = Item benutzen',touch:'Item-Blase antippen = Item benutzen',pad:'X = Item benutzen'},
 hold:{kb:'LEERTASTE halten = Banane hinten als Schutz · loslassen = ablegen',touch:'Item-Blase halten = Banane hinten als Schutz',pad:'X halten = Banane hinten als Schutz'}};
let coachT=0,coachHold=0,coachSeen=null;
function coachState(){return coachSeen||(coachSeen=store.get('coach',{}));}
function coachLearn(id){const c=coachState();if(c[id]==='ok')return;c[id]='ok';store.set('coach',c);if(coachT>0&&$('coach')?.dataset.id===id){coachT=Math.min(coachT,.6);}}
let coachLast=-99;function coachShow(id){const c=coachState();if(c[id]==='ok'||(c[id]||0)>=3||coachT>0||elapsed-coachLast<18)return;coachLast=elapsed;c[id]=(c[id]||0)+1;store.set('coach',c);
 const dev=padHints?'pad':coarseInput?'touch':'kb',el=$('coach');el.dataset.id=id;el.innerHTML=`<b>💡 TIPP</b><span>${COACH[id][dev]}</span>`;el.hidden=false;el.classList.add('on');coachT=4.2;SFX.select();}
function coachTick(dt){const el=$('coach');if(coachT>0){coachT-=dt;if(coachT<=0&&el){el.classList.remove('on');setTimeout(()=>{if(coachT<=0)el.hidden=true;},300);}}
 if(state!=='race'||isTT()||!racers[0])return;const pl=racers[0],c=coachState();
 const mt=stats.mt?stats.mt.mini+stats.mt.super+stats.mt.ultra:0;if(mt>0&&c.drift!=='ok')coachLearn('drift');
 if(c.gas!=='ok'){if(pl.speed>14)coachLearn('gas');else if(elapsed>2.5&&pl.speed<4)coachShow('gas');}
 if(c.drift!=='ok'&&!worldMode&&pl.speed>13&&elapsed>6&&Math.abs(trackAt(pl.distance+22).kap)>1/40)coachShow('drift');
 if(c.item!=='ok'){coachHold=pl.item&&!pl.itemPending?coachHold+dt:0;if(coachHold>2.5)coachShow('item');}
 else if(c.hold!=='ok'&&TRAIL_ITEMS.has(pl.item)&&!pl.itemPending){if(pl.trail)coachLearn('hold');else coachShow('hold');}}
// R67: Pixel-Sprechblasen ueber den Fahrern (getroffen: wuetend, Treffer gelandet/ueberholt/Ziel: froh, Riesenpanzer: Schreck)
const emoteMats={},emotes=[];
function emoteMat(k){if(emoteMats[k])return emoteMats[k];const c=document.createElement('canvas');c.width=c.height=64;const q=c.getContext('2d'),px=4,cell=(x,y,col)=>{q.fillStyle=col;q.fillRect(x*px,y*px,px,px);};
 for(let y=0;y<16;y++)for(let x=0;x<16;x++){const inB=y>=1&&y<=12&&x>=1&&x<=14&&!((y===1||y===12)&&(x===1||x===14)),tail=(y===13&&x>=6&&x<=8)||(y===14&&x===7);
  if(inB||tail){const edge=tail?(y===14||x===6||x===8):(y===1||y===12||x===1||x===14||((y===2||y===11)&&(x===2||x===13)));cell(x,y,edge?'#14264a':'#fffdf3');}}
 cell(7,12,'#fffdf3');
 for(const [x,y,col] of pixels(EMOTE_PIX[k],EMOTE_PAL))cell(x+3,y+2,'#'+col.toString(16).padStart(6,'0'));
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.magFilter=T.NearestFilter;t.minFilter=T.NearestFilter;t.generateMipmaps=false;
 const m=new T.SpriteMaterial({map:t,transparent:true,depthWrite:false});persistentMats.add(m);return emoteMats[k]=m;}
function emote(r,k){if(!r?.mesh||!r.mesh.visible||(r.emoteCd||0)>elapsed||!nearPlayer(r,55))return;r.emoteCd=elapsed+2.2;babble(r,k);
 for(const e of emotes)if(e.r===r){e.sp.material=emoteMat(k);e.t=0;return;}
 const sp=new T.Sprite(emoteMat(k));sp.renderOrder=5;actors.add(sp);emotes.push({sp,r,t:0});}
// R69: Fahrer-Brabbeln - kurze Chiptune-Silben in eigener Tonhoehe je Fahrer (wie Comic-Sprechblasen); wuetend tiefer, froh hoeher
function babble(r,k){const pl=racers[0];if(!pl||!soundOn)return;const dist=Math.hypot(pl.x-r.x,pl.z-r.z);if(dist>40)return;
 const drv=r.id===0?driverIndex:(r.drv??AI_DRIVERS?.[r.id]??r.id),base=250+((drv*53)%7)*42,mood={angry:.82,happy:1.15,shock:1.32,love:1.05}[k]||1,v=(r.id===0?.034:.026)*clamp(1-dist/40,.25,1),n=3+((r.id+drv)%2);
 for(let i=0;i<n;i++){const f=base*mood*(.86+Math.random()*.34),up=k==='shock'?1.25:k==='angry'?.9:1.04;sfxTone(f,f*up,.055,'square',v,i*.075);}}
function updateEmotes(dt){for(let i=emotes.length-1;i>=0;i--){const e=emotes[i];e.t+=dt;const p=e.r.mesh.position,top=(e.r.id===0?myTopper():e.r.topper)?.9:0;
 const s=e.t<.14?e.t/.14*1.25:e.t<.24?1.25-(e.t-.14)*2.5:e.t>1.35?Math.max(0,(1.65-e.t)/.3):1;e.sp.scale.set(1.5*s,1.5*s,1);e.sp.position.set(p.x,p.y+2.9+top+Math.sin(e.t*9)*.05,p.z);
 if(e.t>1.65||!e.r.mesh.parent){actors.remove(e.sp);emotes.splice(i,1);}}}
// R66: "?"-Block zerspringt beim Einsammeln in Pixel-Splitter (Farben des Voxel-Blocks)
function boxPop(b){const y=b.baseY;for(let i=0;i<22;i++){const a=Math.random()*TAU,sp=3+Math.random()*5;emit(b.x+Math.sin(a)*.5,y+Math.random()*.8,b.z+Math.cos(a)*.5,[0xf6c23c,0xf6c23c,0x8a5a10,0xffffff,0xffe89a][i%5],Math.sin(a)*sp,2.5+Math.random()*5,Math.cos(a)*sp,.55+Math.random()*.35);}}
// R69: Pixel-Konfetti auf dem Treppchen (bunte Wuerfel schiessen hoch und rieseln)
function confetti(r,n){const p=r.mesh.position,cols=[0xe8352e,0xffd23a,0x2f7fd8,0x3cc85a,0xff5fa8,0xffffff];for(let i=0;i<n;i++){const a=Math.random()*TAU,sp=2+Math.random()*5;
 emit(p.x+Math.sin(a)*.6,p.y+1.6,p.z+Math.cos(a)*.6,cols[i%cols.length],Math.sin(a)*sp,7+Math.random()*7,Math.cos(a)*sp,1.4+Math.random()*.8);}}
// R69: Muenzregen - goldene Funken regnen aufs Kart, Muenz-Klaenge steigen auf
function coinRain(r,n){const p=r.mesh.position,me=r.id===0;if(me)stats.maxSpores=Math.max(stats.maxSpores||0,r.spores||0);
 if(nearPlayer(r,60))for(let i=0;i<30;i++){const a=Math.random()*TAU;emit(p.x+Math.sin(a)*1.6,p.y+4+Math.random()*2,p.z+Math.cos(a)*1.6,i%3?0xffd23a:0xfff4b0,-Math.sin(a)*1.5,-2-Math.random()*2,-Math.cos(a)*1.5,.8);}
 if(me)for(let i=0;i<Math.max(1,n);i++)setTimeout(()=>SFX.spore((r.spores||0)-n+i+1),i*90);}
// R66: XXL-Stachelpanzer (Nutzerwunsch) - riesige stachelige Voxel-Kuppel, rollt schlingernd die Strecke entlang und walzt
// jeden auf ihrer Spur um (bleibt nicht stehen, trifft jeden nur einmal); Mass Bier und Riesenwuchs halten stand
function fireSpiky(r){const g=new T.Group(),m=voxObj('spiky');const bb=(m.geometry.boundingBox||(m.geometry.computeBoundingBox(),m.geometry.boundingBox));m.position.y=-bb.min.y-.1;g.add(m);actors.add(g);
 const sh={g,m,spiky:true,owner:r.id,t:0,hit:new Set(),rumble:0};
 if(arenaFor(r)){const fx=Math.sin(r.h),fz=Math.cos(r.h),sp=Math.max(r.speed,0)+24;Object.assign(sh,{free:true,x:r.x+fx*3.5,z:r.z+fz*3.5,y:r.y||0,vx:fx*sp,vz:fz*sp});}
 else Object.assign(sh,{d:r.distance+3.5,off0:clamp(r.offset,-4,4),off:r.offset,v:Math.max(r.speed,20)+17});
 shots.push(sh);if(nearPlayer(r,90))SFX.spiky();}
function spikyStep(sh,dt){const k0=sh.t;let x,z,y;
 if(sh.free){sh.x+=sh.vx*dt;sh.z+=sh.vz*dt;const dx=sh.x-ARENA.x,dz=sh.z-ARENA.z,dd=Math.hypot(dx,dz),lim=ARENA.r-4;
  if(dd>lim){const nx=dx/dd,nz=dz/dd,vn=sh.vx*nx+sh.vz*nz;if(vn>0){sh.vx-=2*vn*nx;sh.vz-=2*vn*nz;SFX.bump(.6);}sh.x=ARENA.x+nx*lim;sh.z=ARENA.z+nz*lim;}x=sh.x;z=sh.z;y=sh.y;}
 else{sh.d+=sh.v*dt;sh.off=clamp(sh.off0+Math.sin(sh.t*1.25)*2.6,-5.5,5.5);const s=samplePos(sh.d,sh.off,_sp);x=s.x;z=s.z;y=s.y;}
 sh.g.position.set(x,y+Math.abs(Math.sin(sh.t*5.5))*.35,z);sh.m.rotation.y+=dt*7;sh.g.rotation.z=Math.sin(sh.t*5.5)*.06;
 if(Math.random()<dt*14)emit(x+(Math.random()-.5)*2.4,y+.2,z+(Math.random()-.5)*2.4,0x8a8494,(Math.random()-.5)*4,2+Math.random()*2,(Math.random()-.5)*4,.4);
 sh.rumble-=dt;if(sh.rumble<=0){sh.rumble=.55;const pl=racers[0],dist=Math.hypot(pl.x-x,pl.z-z);if(dist<70)SFX.rumble(clamp(1-dist/70,.15,.9));}
 for(const k of racers){if(sh.hit.has(k.id)||k.finishTime!==null||k.out||(k.id===sh.owner&&sh.t<1))continue;
  const near=sh.free?Math.hypot(k.x-x,k.z-z)<2.9:Math.abs(wrapDiff(k.distance,sh.d))<2.6&&Math.abs(k.offset-sh.off)<2.8;if(!near||Math.abs((k.y||0)-y)>3.5)continue;
  sh.hit.add(k.id);spikyHit(k,sh.owner);}
 for(const k of racers)if(!sh.free&&!sh.hit.has(k.id)&&k.id!==sh.owner){const g=wrapDiff(k.distance,sh.d);if(g>3&&g<14)emote(k,'shock');}
 return sh.t>(sh.free?7:6.5);}
function spikyHit(k,owner){const me=k.id===0,near=nearPlayer(k,70);
 if(k.shield>0||k.mega>0){burst(k,0xffe263,14);if(me)toast('HÄLT STAND! 🍺',.9,'good');if(near)SFX.shield?.();return;}
 if(orbitBlock(k)){burst(k,0x8beb73,14);if(me)toast('BREZN OPFERT SICH!',.9,'good');return;}
 hitKart(k,1.5,.2);spinOut(k,3,1.4);hitSpores(k);resetGlider(k);k.air=true;k.airT=0;k.vy=10;k.y=(k.y||0)+.2;k.lastHitBy=owner;k.lastHitT=elapsed;burst(k,0xf7f5ee,18);burst(k,0x49a84f,14);
 if(near)SFX.crush(me||owner===0?1:.5);
 if(me){stats.hitsTaken++;say('ouch');toast('PLATTGEWALZT! 🦔',1.2,'bad');shake=.6;}else if(owner===0){stats.hitsDealt++;toast('WALZE! 🦔',.8,'good');}}
// Kreisende Brezn: drei Pixel-Brezn um jedes Kart mit Brezn-Trio im Slot; wer sie beruehrt, dreht sich (kostet eine Ladung)
const orbitFx=new Map(),topFx=new Map();
// R65/R66: Aufsatz (Pixel-Krone, Lebkuchenherz ...) schwebt ueber dem Kart - online sehen ihn alle Mitspieler.
// Offline tragen ein paar KI-Fahrer auch einen, damit man sieht, was es zu holen gibt.
const AI_TOPS=['heart','mug','brezn','star','crown','trophy','cart'];
function topperTick(r,now){if(r.topper===undefined)r.topper=r.id!==0&&!(net&&net.setup)&&(r.id*7)%10<3?AI_TOPS[r.id%AI_TOPS.length]:null;
 const id=r.id===0?myTopper():r.topper,want=!!id&&!!r.mesh&&state!=='menu'&&!isTT();let c=topFx.get(r);
 if(c&&(!want||c.userData.top!==id)){c.visible=false;if(want){actors.remove(c);topFx.delete(r);c=null;}}
 if(!want)return;
 if(!c||!c.parent){c=voxObj('top_'+id);c.userData.top=id;actors.add(c);topFx.set(r,c);}
 // nah an der Kamera (fremde Karts direkt vor der Linse) ausblenden, sonst verdeckt der Aufsatz die Sicht
 const p=r.mesh.position,cd=r.id===0?99:camera.position.distanceTo(p);c.visible=r.mesh.visible&&cd>9;c.position.set(p.x,p.y+2.55+Math.sin(now*3+r.id)*.1,p.z);c.rotation.y=now*1.4;c.scale.setScalar(r.id===0?.72:clamp((cd-9)/6,0,1)*.8);}
function updateOrbits(dt){const now=performance.now()*.001;
 for(const r of racers){topperTick(r,now);let n=r.net?(r.netOrbit||0):orbitCount(r);const k=r.net?r.netOrbitK:r.item;if(state!=='race'&&state!=='countdown'&&state!=='paused')n=0;
  let fx=orbitFx.get(r);if(!n){if(fx)fx.g.visible=false;continue;}
  if(!fx||!fx.g.parent||fx.kind!==k){if(fx)actors.remove(fx.g);const g=new T.Group(),balls=[0,1,2].map(()=>{const m=voxObj(k==='red3'?'brezn_red':'brezn_green');g.add(m);return m;});actors.add(g);fx={g,balls,kind:k};orbitFx.set(r,fx);}
  const p=r.mesh.position;fx.g.visible=true;fx.g.position.set(p.x,p.y+.75,p.z);
  for(let i=0;i<3;i++){const b=fx.balls[i],a=now*5.2+i*TAU/3;b.visible=i<n;b.position.set(Math.sin(a)*1.9,Math.sin(now*9+i)*.12,Math.cos(a)*1.9);b.rotation.y=-a;}
  if(!n||r.stun>0)continue;
  // Beruehrung: jedes Kart prueft nur Karts, die auf diesem Rechner gefahren werden (online prueft jeder seine eigenen -
  // auch gegen die kreisenden Brezn der Mitspieler, deren Anzahl ueber die Kart-Flags mitkommt)
  for(const o of racers){if(o===r||o.net||o.finishTime!==null||o.out||o.stun>0||(o.orbitCd||0)>elapsed)continue;const dx=o.x-r.x,dz=o.z-r.z;if(dx*dx+dz*dz>7.5||Math.abs((o.y||0)-(r.y||0))>1.5)continue;
   let near=false;for(let i=0;i<n;i++){const a=now*5.2+i*TAU/3,bx=r.x+Math.sin(a)*1.9-o.x,bz=r.z+Math.cos(a)*1.9-o.z;if(bx*bx+bz*bz<1.7){near=true;break;}}if(!near)continue;
   o.orbitCd=elapsed+.8;if(r.net)r.netOrbit=Math.max(0,n-1);else orbitBlock(r);
   if(o.shield>0){burst(o,0xffe263,10);continue;}if(orbitBlock(o)){burst(o,0x8beb73,10);continue;}
   hitKart(o,1.2,.4);spinOut(o,2,1.1);hitSpores(o);o.lastHitBy=r.id;o.lastHitT=elapsed;burst(o,k==='red3'?0xff6a5a:0x8beb73,14);
   if(o.id===0){stats.hitsTaken++;say('ouch');toast('BREZN-KLATSCHER!',1,'bad');shake=.35;SFX.hit();}else if(r.id===0){stats.hitsDealt++;toast('KLATSCH! 🥨',.9,'good');SFX.hit(.8);}}}}
// Fake-Fragezeichen-Block: sieht aus wie eine Itembox (Pixel-Block mit kopfstehendem "¿"), wirkt wie eine Bananenschale
function dropFake(r){if(hazards.length>=MAX_HAZARDS){const old=hazards.shift();actors.remove(old.mesh);}const x=r.x-Math.sin(r.h)*3.4,z=r.z-Math.cos(r.h)*3.4,g=new T.Group();actors.add(g);g.position.set(x,r.y||0,z);
 if(hasMag(r.distance-3.4))posAt(r.distance-3.4,r.offset,0,g.position);const box=voxObj('qfake');box.position.y=1.6;g.add(box);
 hazards.push({mesh:g,box,x,z,y:r.y||0,life:30,owner:r.id,arm:.5,fake:true,fool:1+Math.floor(Math.random()*2)});if(r.id!==0&&nearPlayer(r,50))SFX.fake();}
function fakePop(h){const p=h.mesh.position;for(let i=0;i<18;i++){const a=Math.random()*TAU;emit(p.x,p.y+1.6,p.z,[0xf6c23c,0xd42a1c,0x9a3a16][i%3],Math.sin(a)*5,3+Math.random()*4,Math.cos(a)*5,.6);}if(nearPlayer({x:p.x,z:p.z,distance:racers[0].distance},50))SFX.fakepop();}
function hitSpores(r){const lost=loseSpores(r);if(lost){const p=r.mesh.position;for(let i=0;i<lost*3;i++){const a=Math.random()*TAU;emit(p.x,p.y+.8,p.z,0xfff27a,Math.sin(a)*5,4+Math.random()*3,Math.cos(a)*5,.9);}}return lost;}
function shellImpact(sh){const t=racers[sh.target],me=sh.owner===0,onMe=sh.target===0,near=nearPlayer(t,60);
 if(t.shield>0){burst(t,0xffe263,14);if(onMe)toast('ABGEWEHRT!',.9,'good');if(near)SFX.shield();return;}
 if(orbitBlock(t)){burst(t,0x8beb73,14);if(onMe)toast('BREZN FÄNGT AB!',.9,'good');if(near)SFX.bump(.7);return;}
 if(t.trail&&TRAIL_ITEMS.has(t.item)){t.trail=null;t.item=null;burst(t,0xffd23f,14);if(onMe){toast('HINTEN ABGEWEHRT! 🍌',1,'good');SFX.fakepop();}return;}
 if(t.finishTime===null){hitKart(t,1.6,.25);hitSpores(t);spinOut(t,2,1.2);}t.lastHitBy=sh.owner;t.lastHitT=elapsed;emote(racers[sh.owner],'happy');burst(t,0x8beb73,18);if(me||onMe||near)SFX.hit(me||onMe?1:.5);
 if(me){stats.hitsDealt++;say('hit');toast('VOLLTREFFER!',1,'good');}if(onMe){stats.hitsTaken++;say('ouch');toast('AUTSCH! −✦',1,'bad');shake=.45;}}
// Bombe fliegt im Bogen voraus, landet, zischt kurz und explodiert (oder sofort bei Kontakt). Druckwelle schleudert Karts hoch.
let bombs=[];const bombGeo=new T.SphereGeometry(.62,16,12),fuseGeo=new T.CylinderGeometry(.06,.06,.45,6),bombMat=stdMat({color:0x2a2238,roughness:.35,metalness:.2}),bombCap=stdMat({color:0xff3b30,roughness:.5}),sparkBall=new T.MeshBasicMaterial({color:0xffe066});
const shockGeo=new T.TorusGeometry(1,.16,6,40),shocks=[0,1,2,3].map(()=>{const m=new T.Mesh(shockGeo,new T.MeshBasicMaterial({color:0xffb347,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));m.rotation.x=-Math.PI/2;m.visible=false;scene.add(m);persistentMats.add(m.material);return {m,t:9};});
[bombMat,bombCap,sparkBall].forEach(m=>persistentMats.add(m));[bombGeo,fuseGeo,shockGeo].forEach(g=>sharedGeo.add(g));let shockIdx=0;
function bombMesh(){const g=new T.Group(),b=new T.Mesh(bombGeo,bombMat);b.castShadow=true;g.add(b);const cap=new T.Mesh(new T.SphereGeometry(.64,16,8,0,TAU,0,Math.PI*.33),bombCap);g.add(cap);const f=new T.Mesh(fuseGeo,bombMat);f.position.y=.75;g.add(f);const s=new T.Mesh(new T.SphereGeometry(.14,8,6),sparkBall);s.position.y=1;g.add(s);g.userData.spark=s;return g;}
function throwBomb(r){const g=bombMesh();actors.add(g);
 if(arenaFor(r)){const fx=Math.sin(r.h),fz=Math.cos(r.h),sp=Math.max(r.speed,14)+14;bombs.push({g,free:true,x:r.x+fx*2,z:r.z+fz*2,y:(r.y||0)+1.2,vx:fx*sp,vz:fz*sp,vy:10,landed:false,fuse:1.1,owner:r.id,t:0});if(r.id===0)SFX.whoosh();return;}
 bombs.push({g,d:r.distance+2,off:r.offset,y:(r.y||0)+1.2,vy:11,fwd:Math.max(r.speed,18)+16,landed:false,fuse:1.1,owner:r.id,t:0});if(r.id===0)SFX.whoosh();}
function explode(b){const p=b.g.position,pl=racers[0],dist=Math.hypot(pl.x-p.x,pl.z-p.z);
 for(let i=0;i<46;i++){const a=Math.random()*TAU,sp=6+Math.random()*9;emit(p.x,p.y+.5,p.z,[0xffb347,0xffe066,0xff5a36,0x8a8494][i%4],Math.sin(a)*sp,3+Math.random()*8,Math.cos(a)*sp,.5+Math.random()*.5);}
 const sh=shocks[shockIdx++%shocks.length];sh.t=0;sh.m.position.set(p.x,p.y+.4,p.z);sh.m.visible=true;
 for(const r of racers){if(r.finishTime!==null)continue;if(Math.abs((r.y||0)-p.y)>4)continue;const res=blastHit(r,r.x-p.x,r.z-p.z);if(!res)continue;if(res==='blocked'){burst(r,0xffe263,12);continue;}r.lastHitBy=b.owner;r.lastHitT=elapsed;hitSpores(r);resetGlider(r);r.air=true;r.airT=0;r.vy=9;r.y=(r.y||0)+.2;burst(r,0xffb347,14);
  if(r.id===0){stats.hitsTaken++;say('ouch');toast('BUMM! 💥',1.1,'bad');}else if(b.owner===0){stats.hitsDealt++;}}
 if(b.owner===0&&racers.some(r=>r.id!==0&&r.stun>=1.2))say('hit');
 if(dist<90){SFX.boom(clamp(1-dist/90,.15,1));shake=Math.max(shake,clamp(.6-dist/60,0,.6));}}
function updateBombs(dt){for(let i=bombs.length-1;i>=0;i--){const b=bombs[i];b.t+=dt;
   if(b.free){if(!b.landed){b.x+=b.vx*dt;b.z+=b.vz*dt;b.vy-=G*dt;b.y+=b.vy*dt;if(b.y<=.62&&b.vy<0){b.y=.62;b.landed=true;b.vx=b.vz=0;if(nearPlayer({x:b.x,z:b.z,distance:racers[0].distance},60))SFX.land(.5);}}
    b.g.position.set(b.x,b.y,b.z);b.g.rotation.y+=dt*(b.landed?2:9);
    if(b.landed){b.fuse-=dt;const hitNow=racers.some(r=>(r.id!==b.owner||b.t>1.4)&&Math.hypot(r.x-b.x,r.z-b.z)<2.2&&Math.abs((r.y||0)-b.y)<2.5);if(b.fuse<=0||hitNow){explode(b);actors.remove(b.g);bombs.splice(i,1);}}
    continue;}
  if(!b.landed){b.d+=b.fwd*dt;b.vy-=G*dt;b.y+=b.vy*dt;const gy=groundAt(b.d,b.off).y;if(b.y<=gy+.62&&b.vy<0){b.y=gy+.62;b.landed=true;if(nearPlayer({distance:b.d},60))SFX.land(.5);}}
  else{b.fuse-=dt;const hitNow=racers.some(r=>r.id!==b.owner||b.t>1.4?Math.hypot(r.x-b.g.position.x,r.z-b.g.position.z)<2.2&&Math.abs((r.y||0)-b.g.position.y)<2.5:false);if(b.fuse<=0||hitNow){explode(b);actors.remove(b.g);bombs.splice(i,1);continue;}}
  const s=samplePos(b.d,b.off,_sp);b.g.position.set(s.x,b.landed?b.y:b.y,s.z);b.g.rotation.y+=dt*(b.landed?2:9);const blink=b.landed&&Math.sin(b.t*(10+(1.1-b.fuse)*30))>0;b.g.userData.spark.scale.setScalar(blink?1.8:1);b.g.scale.setScalar(b.landed?1+Math.max(0,.3-b.fuse)*.8:1);}
 for(const sh of shocks){if(sh.t>=.5){if(sh.m.visible)sh.m.visible=false;continue;}sh.t+=dt;const k=sh.t/.5;sh.m.scale.setScalar(1+k*9);sh.m.material.opacity=Math.max(0,1-k);}}
function updateShots(dt){for(let i=shots.length-1;i>=0;i--){const sh=shots[i];sh.t+=dt;
  if(sh.green){if(greenStep(sh,dt)){actors.remove(sh.g);shots.splice(i,1);}continue;}
  if(sh.spiky){if(spikyStep(sh,dt)){burst({mesh:sh.g},0x49a84f,20);actors.remove(sh.g);shots.splice(i,1);}continue;}
  if(sh.free){const tg=sh.target!==undefined?racers[sh.target]:null;if(tg&&tg.hearts>0){const want=Math.atan2(tg.x-sh.x,tg.z-sh.z),cur=Math.atan2(sh.vx,sh.vz),tr=clamp(angleDiff(want,cur),-3.4*dt,3.4*dt),sp=Math.hypot(sh.vx,sh.vz);sh.vx=Math.sin(cur+tr)*sp;sh.vz=Math.cos(cur+tr)*sp;}
   sh.x+=sh.vx*dt;sh.z+=sh.vz*dt;sh.g.position.set(sh.x,sh.y+.15+Math.abs(Math.sin(sh.t*18))*.18,sh.z);sh.g.rotation.y+=dt*16;
   const hit=tg&&Math.hypot(tg.x-sh.x,tg.z-sh.z)<1.9,out=sh.t>3.6||Math.hypot(sh.x-ARENA.x,sh.z-ARENA.z)>ARENA.r+4;
   if(hit||out){if(hit)shellImpact(sh);else burst({mesh:sh.g},0x8beb73,8);actors.remove(sh.g);shots.splice(i,1);}continue;}const tg=sh.target!==undefined?racers[sh.target]:null;sh.d+=((tg?Math.max(tg.speed,0):Math.max(racers[sh.owner].speed,20))+24)*dt;if(tg)sh.off+=(tg.offset-sh.off)*Math.min(1,dt*5);const s=samplePos(sh.d,sh.off,_sp);sh.g.position.set(s.x,s.y+.15+Math.abs(Math.sin(sh.t*18))*.18,s.z);sh.g.rotation.y+=dt*16;
  if((tg&&sh.d>=tg.distance-1.2)||(!tg&&sh.t>1.2)||sh.t>4.5){if(tg)shellImpact(sh);else burst({mesh:sh.g},0x8beb73,8);actors.remove(sh.g);shots.splice(i,1);}}}

// R52 Wiesnland: wer an Baum, Fels oder Wall haengt, wird nicht mehr auf die Strasse zurueckgesetzt (Nutzerhinweis) -
// das Kart setzt ein Stueck zurueck und wendet, man faehrt dort weiter, wo man war
function owUnstick(r){const fx=Math.sin(r.h),fz=Math.cos(r.h);r.x-=fx*2.6;r.z-=fz*2.6;r.h+=Math.PI;r.vx=r.vz=0;r.speed=0;r.slowT=r.stuckT=0;r.driftDir=0;r.drift=0;
 if(r.id===0){toast('↺ GEWENDET',.9);SFX.whoosh();}}
// Halfpipe (R52): Schwerkraft entlang des Querschnitts, Kante in Ein-/Ausfahrt als Bande, Absprung ueber die Lippe
// (senkrecht - man faellt in die Pipe zurueck), Wertung bei der Rueckkehr. Die Nase folgt der Bahn des Karts: die
// Wand hinauf, ueber die Kuppe des Flugs und wieder hinunter - wie ein Skater, der nach dem Air zurueckfaehrt.
function halfpipeStep(r,dt,me){const hz=hpAt(r.distance);if(!hz){if(r.hpAir){r.hpAir=false;land(r,groundAt(r.distance,r.offset).y,0);}r.hpOn=r.hpOut=false;r.hpIn=null;return;}
 const env=hpEnvAt(hz,r.distance),pf=hpProfile(r.offset,env,_hpq),tn=tanAt(r.distance),sg=pf.s,ox=tn.z*sg,oz=-tn.x*sg;
 // Wer neben der Strasse (Wiesnland-Wiese) in den Abschnitt kommt, ist draussen: der Erdwall haelt ihn fern. Sonst
 // laese die Pipe seinen grossen Querversatz als Flughoehe ueber der Lippe.
 if(r.hpIn!==hz){r.hpIn=hz;r.hpOut=!r.hpOn&&!r.hpAir&&Math.abs(r.offset)>HP.flat+3.5;}
 if(r.hpOut){r.hpOn=false;const ao=Math.abs(r.offset),want=HP.outer+.6;if(ao<want){const push=Math.min(want-ao,dt*(6+(want-ao)*4));r.x+=ox*push;r.z+=oz*push;r.offset=sg*(ao+push);const vn=r.vx*ox+r.vz*oz;
  // am Wall entlang abgleiten statt stehen zu bleiben: Anteil nach innen in Laengsrichtung umlenken, Nase folgt
  if(vn<0){const sp0=Math.hypot(r.vx,r.vz);r.vx-=ox*vn;r.vz-=oz*vn;const sp1=Math.hypot(r.vx,r.vz);if(sp1>.5){const k=Math.min(1,sp0*.85/sp1);r.vx*=k;r.vz*=k;r.h+=angleDiff(Math.atan2(r.vx,r.vz),r.h)*Math.min(1,dt*6);}}}return;}
 // Hinweis bei den ersten Einfahrten (je Durchfahrt einmal, insgesamt dreimal)
 if(me&&r.hpHintFor!==hz&&state==='race'){r.hpHintFor=hz;const n=store.get('hpHints',0);if(n<3){store.set('hpHints',n+1);toast(coarseInput?'HALFPIPE! Schräg hochfahren':'HALFPIPE! Schräg hoch · Luft: SHIFT',2,'good');}}
 r.hpOn=pf.u>-.3||!!r.hpAir;if(!r.hpOn)return;
 if(pf.u>0){const a=HP.g*Math.sin(pf.th)*dt;r.vx-=ox*a;r.vz-=oz*a;
  // Wand und Flug drehen mit der Pipe mit: in einer Kurve trug es das Kart sonst nach aussen (in der Luft
  // wie zusaetzliche Hoehe, bis 2,8 m ueber dem Deckel) - so ist jede Pipe in ihrem eigenen Rahmen gerade
  const fwd=r.vx*tn.x+r.vz*tn.z,t1=tanAt(r.distance+fwd*dt),tr=angleDiff(Math.atan2(t1.x,t1.z),Math.atan2(tn.x,tn.z));
  if(tr){const c=Math.cos(tr),sn=Math.sin(tr),vx=r.vx*c+r.vz*sn,vz=-r.vx*sn+r.vz*c;r.vx=vx;r.vz=vz;r.h+=tr;}}
 const vn=r.vx*ox+r.vz*oz;
 if(!r.hpAir&&pf.u>pf.top){
  if(env<HP.launchEnv){const ex=pf.u-pf.top,back=Math.min(ex,dt*(5+ex*8));r.x-=ox*back;r.z-=oz*back;r.offset=sg*(Math.abs(r.offset)-back);if(vn>0){r.vx-=ox*vn*1.3;r.vz-=oz*vn*1.3;}}
  else{// der Flug muss vor dem Ende der Pipe wieder unten sein: sonst Quertempo kappen (die Lippe haelt)
   const fwd=Math.max(5,r.vx*tn.x+r.vz*tn.z),room=Math.max(0,hz.span-HP.ramp*.6-lapDist(r.distance-hz.s)),cap=Math.min(hpLaunchCap(Math.max(vn,0)),HP.g*room/(2*fwd));
   if(vn>cap){r.vx-=ox*(vn-cap);r.vz-=oz*(vn-cap);}
   r.hpAir=true;r.hpSide=sg;r.hpMax=0;r.air=true;r.airT=0;r.trick=0;r.driftDir=0;r.drift=0;
   // geschickte KI-Fahrer drehen auch einen Trick
   if(!me&&Math.random()<r.skill*.9)r.trick=.001;
   if(me){SFX.ramp(1);stats.hpLaunch=(stats.hpLaunch||0)+1;}else if(nearPlayer(r,45))SFX.ramp(.35);
   // Funken von der Metallkante
   if(nearPlayer(r,60)){const p=r.mesh.position;for(let i=0;i<10;i++){const a=Math.random()*TAU;emit(p.x,p.y,p.z,i%2?0xffe16a:0xffffff,Math.sin(a)*3-ox*2,2+Math.random()*4,Math.cos(a)*3-oz*2,.45);}}}}
 if(r.hpAir){
  // Deckel: Rempler zweier Karts in der Luft koennen Schwung nach aussen uebertragen
  const over=pf.u-pf.top-HP.maxAir-.3;if(over>0){r.x-=ox*over;r.z-=oz*over;r.offset=sg*(Math.abs(r.offset)-over);const v2=r.vx*ox+r.vz*oz;if(v2>0){r.vx-=ox*v2;r.vz-=oz*v2;}}
  r.hpMax=Math.max(r.hpMax,Math.min(HP.maxAir,pf.u-pf.top));
  if(pf.u<=pf.top||sg!==r.hpSide){r.hpAir=false;const tr=r.trick,h=r.hpMax;land(r,groundAt(r.distance,r.offset).y,0);
   if(me)SFX.land(clamp(h/8,.2,.55));
   const rt=hpRating(h,tr>=.42);if(rt){r.boost=Math.max(r.boost,rt.boost);if(rt.spores)r.spores=Math.min(MAX_SPORES,(r.spores||0)+rt.spores);
    if(me){stats.hpAirs=(stats.hpAirs||0)+1;if(tr>=.42)stats.hpTricks=(stats.hpTricks||0)+1;stats.hpBest=Math.max(stats.hpBest||0,h);toast(rt.label,1.3,'good');if(h>=4.5)burst(r,0xffe45c,16);}}
   if(!me)r.hpPick=Math.random()<.55?-(r.hpPick||sg):0;}}
 const sp=Math.hypot(r.vx,r.vz);if(pf.u>0&&sp>4){const k=1-Math.exp(-dt*(r.hpAir?10:6));r.h+=angleDiff(Math.atan2(r.vx,r.vz),r.h)*k;}}
function update(dt){
 if(worldMode&&state==='race'){for(const r of racers)if(r.distance>length*1.5){r.distance-=length;if(r.safeD!==undefined)r.safeD=lapDist(r.safeD);}updateOW(dt);}
 // Feuerwerk vom Zieleinlauf abarbeiten (laeuft auch im Result-Schirm weiter)
 for(const f of fworks)if(!f.done&&elapsed>=f.at){f.done=1;try{const p=posAt(0,f.off,f.h,new T.Vector3());burstAt(p.x,p.y,p.z,f.col);}catch(e){}}
 if(state==='ceremony'){updateCeremony(dt);return;}
 if(state!=='race'&&state!=='countdown')return;
 if(net&&net.setup)netSend();
 if(battle){battleUpdate();if(arenaOn())arenaTick(dt);}
 timeWarpTick(racers[0],dt);
 const player=racers[0],ohGas=state==='countdown'&&oh.on&&oh.id!==null,gasHeld=held('ArrowUp')||held('KeyW')||ohGas;
 if(state==='countdown'){oh.hop=0;if(!worldReady){setText('message','');return;}if(net&&net.setup&&!net.go){netWaitGo();for(const r of racers)if(r.net)netDrive(r,dt);syncKartInstances();return;}
  if(introT>0){introT=Math.max(0,introT-dt);setLights(0);setText('message','');if(introT<=0){stopFanfare(.4);playBgm(raceTrack());setBgmRate(course.bgmRate||1);}syncKartInstances();return;}ohHint(oh.on&&store.get('ohHints',0)<5);const prev=Math.ceil(countdown);countdown-=dt;if(gasHeld){if(startPress<0)startPress=countdown;}else startPress=-1;
  {const ln=countdown>2?1:countdown>1?2:countdown>0?3:4;if(ln!==lightState)SFX.count(ln===4);setLights(ln);}setText('message',countdown>0?String(Math.ceil(countdown)):'O\'ZAPFT IS!');
  if(engine&&ctx){const t=ctx.currentTime;aset(engine.o1.frequency,gasHeld?170:60,t,.08);aset(engine.o2.frequency,gasHeld?85:30,t,.08);aset(engine.f.frequency,gasHeld?1500:500,t,.1);aset(engine.g.gain,soundOn?.008:0,t,.1);}
  if(countdown<=0){state='race';notice('O\'ZAPFT IS!',1.1);stats.lapStart=0;raceAssist=assistMode;player.lapDirty=false;if(isTT()){player.item='triple';player.charges=3;}
   if(net?.setup?.take)netTakeOver();
   const fx=Math.sin(player.h),fz=Math.cos(player.h);
   if(gasHeld&&startPress>0&&startPress<=1.0){player.boost=Math.max(player.boost,1.5);player.vx=fx*16;player.vz=fz*16;SFX.rocket();say('rocket');toast('RAKETENSTART!',1.2,'good');stats.rocket++;burst(player,0xffa53d,20);}
   else if(gasHeld&&startPress>=2.2&&!ohGas){player.stall=1.1;say('early');toast('ZU FRÜH! Motor abgewürgt',1.4,'bad');}
   for(const r of racers)if(r.id&&Math.random()<CLASSES[cc].skill*.6){r.boost=.9;}}
  for(const r of racers){if(r.net)netDrive(r,dt);else syncKart(r,dt);}syncKartInstances();return;}
 elapsed+=dt;updateSwingers();updateHazards(dt);updateTrain(dt,elapsed);updateDesert(dt,elapsed);updateCharacter(dt,elapsed);updateR60(dt,elapsed);updateChoco(dt,elapsed);updateVoxel(dt,elapsed);updateDomePix(dt,elapsed);updateBayIce(dt,elapsed);updateTsunami(dt,elapsed);updateBlues(dt);setLights(elapsed<2.5?4:0);recordGhost(player);updateGhost();
 if(oh.on)ohTick(dt,player);const ohHop=oh.hop>0;oh.hop=0;if(ohHintOn&&(elapsed>4||!oh.on))ohHint(false);
 const order=ranking(racers),placeOf=r=>order.indexOf(r)+1,driftKey=held('ShiftLeft')||held('ShiftRight')||(oh.on&&(oh.drift||ohHop));
 if(!autopilot&&driftKey&&!prevDrift&&player.air&&player.airT>.06&&!player.trick)startTrick(player);prevDrift=driftKey;
 if((player.megaWas||0)>0&&!(player.mega>0))SFX.shrink();player.megaWas=player.mega||0;
 if(roulette){roulette.t-=dt;roulette.tick-=dt;if(roulette.tick<=0){roulette.tick=.075;SFX.tick();}if(roulette.t<=0){player.item=roulette.final;player.charges=chargesFor(player.item);player.itemPending=false;SFX.pickup();toast(ITEM_NAMES[player.item]+'!',.9);roulette=null;}}
 const cls=CLASSES[cc];
 for(const r of racers){if(r.net){netDrive(r,dt);continue;}if(battle)battleTick(r);if(r.finishTime!==null){r.vx*=.98;r.vz*=.98;r.x+=r.vx*dt;r.z+=r.vz*dt;syncKart(r,dt);continue;}const me=r.id===0;
  r.stall=Math.max(0,(r.stall||0)-dt);r.padCd=Math.max(0,(r.padCd||0)-dt);r.ringCd=Math.max(0,(r.ringCd||0)-dt);
  let input;
  if(me&&!autopilot&&!(r.cannon>0)){const target=(raceMirror?-1:1)*steering(),rate=(Math.sign(target)!==Math.sign(r.steerS||0)&&target!==0)?11:7;r.steerS=(r.steerS||0)+clamp(target-(r.steerS||0),-dt*rate,dt*rate);
   let st=r.steerS,gas=(autoGas||gasHeld||oh.on)&&r.stall<=0;
   let brk=held('ArrowDown')||held('KeyS');
   if(assistMode!=='aus'&&!r.driftDir&&r.stun<=0&&!(worldMode&&Math.abs(r.offset)>7.5)&&!(r.hpOn&&Math.abs(r.offset)>HP.flat-1)){if(assistMode==='voll'){st=clamp(st+steerAssist(r)*(1-.55*Math.abs(st)),-1,1);const top=assistTop(r);if(r.boost<=0&&r.speed>top+1.5)gas=false;if(r.speed>top+5)brk=true;}
    else{const edge=clamp((Math.abs(r.offset)-5)/2,0,1);if(edge>0)st=clamp(st+steerAssist(r,4.6)*edge*.85*(1-.45*Math.abs(st)),-1,1);}}
   input={gas,brake:brk,steer:st,drift:driftKey};}
  else{input=arenaFor(r)?arenaAI(r,dt):aiInput(r,dt);r.steerS=(r.steerS||0)+(input.steer-(r.steerS||0))*Math.min(1,dt*8);}
  // Steckenbleib-Schutz: wer mit Gas laenger als 1,6 s fast steht, wird auf die Strecke gesetzt
  if(state==='race'&&r.stun<=0&&r.stall<=0&&input.gas&&Math.abs(r.speed)<2.5){r.slowT=(r.slowT||0)+dt;
   if(r.slowT>(worldMode?4:1.6)){r.slowT=0;if(worldMode&&(me||arenaOn()))owUnstick(r);else{respawn(r);if(me)toast('ZURÜCK AUF DIE STRECKE',1.2);}}}
  else r.slowT=0;
  if(!me){if(arenaFor(r))arenaItems(r);else aiItems(r,order);}
  // In einer Rollzone schwebt die Bahn - daneben ist kein Gelaende, sondern nichts. Die
  // Offroad-Bremse (Hoechsttempo 12,5) gehoert dort nicht hin; seitlich haelt die Fuehrung.
  // Achterbahn (R38) zaehlt als Magnetbahn (Halten, kein Offroad), hat aber ihr eigenes Tempo:
  // Katapult statt Dauer-Turbo, Energie aus den Huegeln statt Energieband.
  // R56: auf der Wiese (Wiesnland, >14 m neben der Strasse) wirken Looping, Rollzonen, Achterbahn und Elemente nicht -
  // ihre Fuehrung zog Karts aus der Arena quer ueber die Insel auf die Bahn
  const farOff=worldMode&&Math.abs(r.offset)>14;
  const czn=coasters.length&&!farOff?coasterAt(r.distance):null;
  const inSpiral=!farOff&&(agrav.length||loops.length)&&hasRoll(r.distance),inRoll=inSpiral||!!czn;
  // Durchgaengige Turbo-Streifen: das Energieband der Rollzone schiebt permanent an -
  // der Schwung bleibt oben, niemand schleppt sich durch die Spirale (Nutzerwunsch).
  if(inSpiral&&!r.air&&Math.abs(r.speed)>5)r.boost=Math.max(r.boost,.55);
  // Magnetfeld-Spuren: Funken unterm Kart zeigen, dass die Bahn traegt (sparsam, nur beim Spieler-Umfeld)
  if(inRoll&&!r.air&&frame%2===0&&nearPlayer(r,60)){const p=r.mesh.position;
   emit(p.x+(Math.random()-.5)*1.6,p.y+.15,p.z+(Math.random()-.5)*1.6,theme.glow?0x7cf3ff:0x59d7ff,(Math.random()-.5)*2.5,-1.5-Math.random()*2.5,(Math.random()-.5)*2.5,.4);}
  // Saubere Spirale: wer die Rollzone auf der Linie durchfaehrt (nie an die Magnetbande),
  // kriegt beim Austritt einen Drift-Turbo - belohnt Fahren statt Anecken.
  if(inSpiral){if(!r.inAgPrev)r.agMax=0;r.agMax=Math.max(r.agMax||0,Math.abs(r.offset));}
  else if(r.inAgPrev&&r.finishTime===null&&(r.agMax||9)<5.5&&Math.abs(r.speed)>15){r.boost=Math.max(r.boost,.8);
   if(me){toast('SAUBERE SPIRALE!',1,'good');SFX.whoosh();}}
  r.inAgPrev=inSpiral;
  if(me)SFX.hum(inRoll);
  const czMove=czn?coasterRide(r,czn,me):1;
  if(!czn&&r.czRun)coasterExit(r,me);
  const offroad=!worldMode&&!r.air&&!onRoad(r.distance,r.offset)&&!inGap(r.distance)&&!inRoll&&!(elems.length&&elemAt(r.distance));
  const meadow=worldMode&&!r.air&&!onRoad(r.distance,r.offset);if(TEST){r.tOff=(r.tOff||0)+(offroad?dt:0);r.tAll=(r.tAll||0)+dt;}
  const s=trackAt(r.distance),tan=tanAt(r.distance),dot=Math.sin(r.h)*tan.x+Math.cos(r.h)*tan.z;
  // Mildes Gummiband: Rivalen weit vorn werden minimal langsamer, weit hinten minimal schneller (Sieg bleibt verdient)
  const rubber=me?1:1+clamp((player.distance-r.distance)/400,-1,1)*cls.rubber,speedMul=me?1:cls.ai*(.96+.04*r.skill)*rubber;
  const oldLap=lap(r,length),oldBoost=r.boost;
  // Im Looping wird der Vorschub auf der Fahrbahn gebremst, damit das Bild in normalem Tempo
  // durch den Kreis laeuft. Gefahren wird geradeaus, also braucht es keinen Extra-Grip.
  const lp=loops.length&&!farOff?loopAt(r.distance):null,tfF=elems.length||tsu?r.mesh.userData.tf?.cur:null;
  // In Rollzonen uebernimmt die Magnetbahn den Hoehenweg: Hang-Widerstand faellt weg, sonst
  // fehlt genau dort der Schwung, wo die Strecke zusaetzlich noch kippt.
  if(me&&offroad&&!r.air&&state==='race')r.lapDirty=true;
  const sf=r60Surf(r);if(tsu&&tsu.surf&&!r.air){sf.speedMul*=TSU.speed;sf.gripMul*=TSU.grip/.85;}if(r.cannon>0){sf.speedMul*=1.42;sf.gripMul*=1.8;}if(r.flat>0){sf.speedMul*=.62;}
  driveKart(r,dt,input,{air:r.air,offroad,meadow,slope:inRoll?0:slopeAt(r.distance)*dot,speedMul:sf.speedMul*(meadow?.95:1)*(r.mega>0?1.1:1)*speedMul*(czn&&r.czRun?.launched?COASTER.launchTop/PHYS.boostTop:1)*(tfF==='dive'?.95:tfF==='plane'?1.04:1),gripMul:(lp?1.5:inRoll?2.3:1)*(tfF==='boat'?.85:1)*(lp||inRoll?1:wxGripMul*sf.gripMul),moveMul:lp?1/loopStretch(lp,loopFrame(lp,r.distance)):czMove});
  if(wxWindA&&!r.air&&!inRoll&&!czn&&!lp){r.vx+=Math.sin(wxWindDir)*wxWindA*dt;r.vz+=Math.cos(wxWindDir)*wxWindA*dt;}   // R50 Sturmboeen (fuer alle gleich)
  if(me&&r.hopT>0&&!r.hopWas)SFX.hop();r.hopWas=r.hopT>0;desertHits(r,me,dt);r60Hits(r,me,dt,sf);chocoHits(r,me,dt,sf);cannonTick(r,me,dt);if(r.rescue)rescueTick(r,dt);r63Tick(r,me,dt);
  // Luftfuehrung (R44): nach Schanzen und Luecken folgt das Kart in der Luft sanft dem Streckenverlauf und wird
  // Richtung Mitte gezogen - eine Kurve direkt hinter dem Sprung (12 Stellen im Audit) fuehrt nicht mehr zum Absturz
  // R55 Wiesnland: auf der freien Wiese (weit neben der Strasse) keine Luftfuehrung - sie zog Karts zur Strasse zurueck
  if(r.air&&!r.gliding&&!inRoll&&!lp&&!r.hpOn&&r.stun<=0&&Math.abs(r.speed)>8&&!(worldMode&&Math.abs(r.offset)>11)){const tn=tanAt(r.distance+Math.abs(r.speed)*.3),want=Math.atan2(tn.x,tn.z),dh=angleDiff(want,r.h);
   if(Math.abs(dh)<1.3){const tr=clamp(dh,-1.4*dt,1.4*dt),c=Math.cos(tr),sn=Math.sin(tr),vx=r.vx*c+r.vz*sn,vz=-r.vx*sn+r.vz*c;r.h+=tr;r.vx=vx;r.vz=vz;}
   if(Math.abs(r.offset)>4){const [i,j,k]=tIdx(r.distance),cx=TP.x[i]+(TP.x[j]-TP.x[i])*k,cz=TP.z[i]+(TP.z[j]-TP.z[i])*k,dx=cx-r.x,dz=cz-r.z,dl=Math.hypot(dx,dz)||1,pull=Math.min(6,(Math.abs(r.offset)-4)*2.2)*dt*(gravMul(r.distance)<1?2.5:1);r.vx+=dx/dl*pull*6;r.vz+=dz/dl*pull*6;}}
  r.braking=!!input.brake&&r.speed>1.5&&!r.air;
  if(me&&r.driftDir&&!r.prevDrift)SFX.drift();
  r.prevDrift=!!r.driftDir;
  collideStatic(r);
  // Kart haengt fest (Hindernis, Wand, Spirale): nach kurzer Zeit per Rettungspilz zurueck auf die
  // Strecke. Seit R26 auch fuer den Spieler - wer in einer Spirale oder an Deko festhaengt und
  // trotz Gas nicht vorankommt, kommt ohne Handarbeit (Taste R) frei. Laengerer Limit und erst
  // nach dem Countdown, damit der Raketenstart (Gas halten bei Tempo 0) nichts faelschlich loest.
  const stuckLimit=me?2.6:1.6;
  if(elapsed>4&&input.gas&&!r.air&&Math.abs(r.speed)<3&&r.stun<=0){r.stuckT=(r.stuckT||0)+dt;if(r.stuckT>stuckLimit){r.stuckT=0;if(worldMode&&(me||arenaOn()))owUnstick(r);else respawn(r);}}else r.stuckT=0;
  let pr=project(r.x,r.z,r.distance),skipped=false;
  // Weit neben der lokalen Projektion (Kurve abgeschnitten): global neu zuordnen; grosse Abkuerzungen setzen zurueck.
  if(Math.abs(pr.off)>14&&!forkBand(pr.d,pr.off,4)&&!nearLoop(r.distance)&&!hpAt(r.distance,6)){const g2=project(r.x,r.z,projectGlobal(r.x,r.z,r.y||0));if(Math.abs(g2.off)<9){const jump=wrapDiff(g2.d,lapDist(r.distance));if(jump>60&&!worldMode){respawn(r);if(me)toast('ABKÜRZUNG ZÄHLT NICHT!',1.6,'bad');skipped=true;}else{r.distance+=jump;pr=g2;}}}
  if(!skipped){advanceProgress(r,pr.d,length);r.offset=pr.off;railCollide(r,me);
   // Anti-Grav-Seitenmagnet: in Rollzonen stehen keine Leitplanken – die Magnetbahn haelt das Kart
   // seitlich fest (wie vertikal). Weicher exponentieller Pull statt hartem Snap: kein Ruck im Bild,
   // denn bei ~90 Grad Roll wird seitliche Korrektur als vertikale Bewegung sichtbar.
   // Im Looping wird gefuehrt: seitlich sanft zur Mitte gezogen und die Fahrtrichtung nachgefuehrt.
   // Ohne das traegt die Fliehkraft in der engen Kreisbahn jedes Kart an den Rand (Arcade-Konvention).
   // Fuehrung in Looping und Spiralen: wirkt wie Seitenhaftung, nicht wie eine Wand.
   // Innerhalb des freien Bands (+-6 m) bleibt das Lenken voellig frei; darueber hinaus zieht es
   // zunehmend zurueck, und zwar ueber die Geschwindigkeit statt ueber die Position - ein
   // Positions-Snap fuehlt sich beim Fahren wie Verkanten an.
   // Reine Steilkurven fuehren lockerer: breiteres freies Band, keine Winkel-Klemme (Driften bleibt frei)
   // Elemente-Parcours (R39): See und Flug fuehren wie eine Steilkurve - sonst glitt das Kart neben
   // die Bootsspur oder in der Luft neben die Flugbahn (bis 28 m Versatz)
   const inElem=elems.length>0&&!lp&&!farOff&&!!elemAt(r.distance),soft=!!(czn&&!czn.spec.hills.length)||inElem;
   if(inRoll||inElem){const tn=tanAt(r.distance),free=lp?6.2:soft?5.8:rollFree(r.distance,3.2),ao=Math.abs(r.offset),ex=ao-free;
    const sg=Math.sign(r.offset)||1,ox=tn.z*sg,oz=-tn.x*sg,vn=r.vx*ox+r.vz*oz;
    if(ex>0){
     // Haltekraft waechst mit dem Abstand: im freien Band nur der sanfte Grundzug (siehe unten),
     // weiter aussen wie ein Magnet. Mit fester Staerke war sie schwaecher als die Querbewegung
     // beim Lenken - dann faellt man raus.
     if(vn>0){const sp0=Math.hypot(r.vx,r.vz),kk=1-Math.exp(-dt*(3.5+ex*2.2));
      r.vx-=ox*vn*kk;r.vz-=oz*vn*kk;
      // Betrag erhalten: Daempfen kostet Schwung und fuehlt sich wie Anecken an
      const sp1=Math.hypot(r.vx,r.vz);if(sp1>.01&&sp0>.01){const f=sp0/sp1;r.vx*=f;r.vz*=f;}}
     const pull=Math.min(ex,dt*(2.5+ex*3.4));
     r.x-=ox*pull;r.z-=oz*pull;r.offset=sg*(Math.abs(r.offset)-pull);
     // Harte Grenze an der sichtbaren Energiewand (8.75): bis knapp davor haengen, aber nie
     // durch sie durch - und immer noch auf der Fahrbahn (onRoad greift unter 8.6).
     const cap=Math.min(free+6,8.45),ab=Math.abs(r.offset);
     if(ab>cap){const back=ab-cap;r.x-=ox*back;r.z-=oz*back;r.offset=sg*cap;}
     // Fahrtrichtung zurueckfuehren, je weiter aussen desto deutlicher
     r.h+=angleDiff(Math.atan2(tn.x,tn.z),r.h)*Math.min(1,dt*(1.0+ex*.9));}
    else{
     // Durchgaengige Bahnmagnetik (R27): auch innerhalb des freien Bands haelt die Bahn das
     // Kart wie auf Schienen. Vorher gab es dort keine Fuehrung - in Spiralen sackte das Kart
     // seitlich weg und klebte an der Leitplanke (Neon-Korkenzieher, Voll-Lenkung: Sitzt bei
     // 8,4 m Versatz bis die Zone endet). Zwei Kraefte: die Abdrift nach aussen wird weich auf
     // ~3,2 m/s begrenzt (bewusstes Ausscheren bleibt moeglich, Durchsacken nicht), und ein
     // proportionaler Zug zur Mitte. Auf der Ideallinie (unter 0,4 m) bleibt alles unberuehrt.
     if(!lp&&ao>.4){const g=Math.min(ao/free,1),vcap=3.2+g*1.6;
      // Harter Cap der Aussen-Komponente pro Frame (Schiene): weiche Daempfung verlor gegen
      // die staendig erneuerte Lenkrate - Voll-Lenkung drueckte trotzdem bis zur Bande durch.
      if(vn>vcap){const exv=vn-vcap,sp0=Math.hypot(r.vx,r.vz);
       r.vx-=ox*exv;r.vz-=oz*exv;
       const sp1=Math.hypot(r.vx,r.vz);if(sp1>.01&&sp0>.01){const f=sp0/sp1;r.vx*=f;r.vz*=f;}}
      const pull=Math.min(ao*.5,dt*(2.2+g*2.6));
      r.x-=ox*pull;r.z-=oz*pull;r.offset=sg*(ao-pull);
      // Winkel-Klemme: maximal ~20 Grad schraeg zur Bahn. Die Lenkrate einer Rollzone
      // (Grip 2,3) schlaegt jede weiche Nachfuehrung - ohne Klemme stand das Kart quer zur
      // Spirale und sackte durch die Kurve bis zur Leitplanke durch. 0.35 rad Slip bleiben
      // deutlich spuerbare Linienwahl, die Bahn fuehrt.
      const th=Math.atan2(tn.x,tn.z),dh=angleDiff(r.h,th);
      if(!soft&&Math.abs(dh)>.35)r.h=th+Math.sign(dh)*.35;}
     if(lp)r.h+=angleDiff(Math.atan2(tn.x,tn.z),r.h)*(1-Math.exp(-dt*1.4));}}}
  if(hpipes.length)halfpipeStep(r,dt,me);
  vertical(r,dt);
  if(!r.air&&!inRoll&&Math.abs(r.offset)<ROAD_HALF&&!r.rampY){const toGap=gaps.find(g=>{const a=wrapDiff(g.start,r.distance);return a>0&&a<95;});if(!toGap)r.safeD=lapDist(r.distance);}
  if(r.lastMT){r.mts=(r.mts||0)+(r.lastMT==='ultra'?100:r.lastMT==='super'?10:1);if(me){stats.mt[r.lastMT]++;SFX.mt(r.lastMT);const combo=comboStep(r,elapsed);if(combo>=2){stats.maxCombo=Math.max(stats.maxCombo||0,combo);if(r.spores<MAX_SPORES)r.spores++;SFX.combo(combo);toast(`${MT_LABEL[r.lastMT]} · COMBO ×${combo}`,1,'mt-'+r.lastMT);}else toast(MT_LABEL[r.lastMT]+'!',.8,'mt-'+r.lastMT);const p=r.mesh.position;for(let i=0;i<14;i++){const a=Math.random()*TAU;emit(p.x,p.y+.4,p.z,MT_COLORS[r.lastMT],Math.sin(a)*3-Math.sin(r.h)*6,1+Math.random()*2,Math.cos(a)*3-Math.cos(r.h)*6,.5);}}r.lastMT=null;}
  // R52: Aufladen, dann seitlich ausscheren; Bruecken/Kreuzungen werden ausgeschlossen.
  const ds=updateDraft(r.draftState||(r.draftState=createDraftState()),r,racers,dt,{autoRelease:!me||autopilot,trackLength:length});
  r.draft=ds.charge*1.3;
  if(me&&ds.charge>.08&&frame%3===0){const sh=Math.sin(r.h),ch=Math.cos(r.h);for(const side of [-1,1])emit(r.x+ch*side*1.4+sh*2,r.y+1.1,r.z-sh*side*1.4+ch*2,ds.ready?0x7fffe0:0xe8f6ff,-sh*16,0,-ch*16,.18+ds.charge*.16);}
  if(me&&ds.readyTransition&&!ds.boostTriggered){SFX.draftready();toast('AUSSCHEREN → TURBO!',1.2,'good');}
  if(ds.boostTriggered){r.boost=Math.max(r.boost,ds.boostSeconds);if(me){stats.drafts++;SFX.draftboost();toast('WINDSCHATTEN-TURBO!',1.1,'good');burst(r,0x8ffff0,14);}}
  // In Rollzonen zaehlt ein breiteres Band, sonst verfehlt man den Streifen beim Drehen
  if(!r.air){const pw=inRoll?7.4:5.6,pl=inRoll?3.7:2.4;
   // R49 Sonnen-Turbo: durch den Lichtfleck unter einer Deckenoeffnung fahren gibt einen kurzen Schub
   for(const sp of sunPads)if(Math.abs(wrapDiff(r.distance,sp.d))<2.8&&Math.abs(r.offset-sp.off)<3.1&&!((r.sunT||0)>elapsed)){r.sunT=elapsed+1.2;r.boost=Math.max(r.boost,.65);if(me){stats.sunBoosts=(stats.sunBoosts||0)+1;SFX.sun();toast('SONNEN-TURBO!',.7,'good');burst(r,0xffe9a8,12);}}
   for(const d of boostPads)if(Math.abs(wrapDiff(r.distance,d))<pl&&Math.abs(r.offset)<pw){const onBeat=course.beatgates&&beatPhase(elapsed)<.24;if(onBeat&&r.boost<1.5&&me){stats.beatBoosts++;toast('IM TAKT! +TURBO',.8,'good');SFX.mt('super');}r.boost=Math.max(r.boost,onBeat?1.7:1);}}
  if(me&&r.boost>oldBoost&&oldBoost===0&&!ds.boostTriggered)SFX.boost();
  if(me&&r.stall>0&&frame%5===0)dropPuff(r);
  for(const pad of pads)if(!r.air&&r.padCd<=0&&Math.abs(wrapDiff(r.distance,pad.d))<1.9&&Math.abs(r.offset-pad.off)<2){armGlider(r,'bounce');r.air=true;r.airT=0;r.vy=11+Math.max(0,r.speed)*.1;r.y+=.1;r.boost=Math.max(r.boost,.5);r.padCd=.6;pad.squash=.45;if(nearPlayer(r,50))SFX.boing(me?1:.4);}
  // Magnet-Ringe (ag) nehmen auch gebunden mit: in der Rollzone haelt die Bahn die Hoehe,
  // deshalb prueft der Luft-Filter dort nicht, nur Streckenmeter und Linie.
  for(const ring of rings)if(r.ringCd<=0&&(ring.ag?inRoll:ring.fly?r.mesh.userData.tf?.cur==='plane':r.air)&&Math.abs(wrapDiff(r.distance,ring.d))<2.2&&Math.abs(r.offset-ring.off)<3.4&&(ring.ag||ring.fly||Math.abs(r.y+.9-ring.y)<2.9)){const precise=isPrecisionFlight(r,ring);r.boost=Math.max(r.boost,ringBoostDuration(precise));r.ringCd=.8;ring.flash=.5;ring.precision=precise;if(me&&worldMode&&ring.fly)owRingHit(ring);if(me){stats.rings++;if(precise)stats.precisionRings++;SFX.ring(precise);toast(precise?'PRÄZISIONSFLUG!  EXTRA TURBO':ring.ag?'RING-BOOST!':'WINDRING-TURBO!',1,'good');burst(r,precise?0xffe5a0:0x59d7cf,precise?24:16);}}
  for(const sp of spores)if(sp.cd<=0&&Math.abs(wrapDiff(r.distance,sp.d))<1.8&&Math.abs(r.offset-sp.off)<1.8&&Math.abs(r.y+.8+coasterH(sp.d)+(elems.length?elemH(sp.d):0)-sp.y)<2.3){sp.cd=10;if(r.spores<MAX_SPORES){r.spores++;if(me){stats.maxSpores=Math.max(stats.maxSpores,r.spores);SFX.spore(r.spores);if(r.spores===MAX_SPORES){say('spores');toast('VOLLE SPOREN-POWER!',1.2,'good');}}}}
  if(!isTT())for(const b of boxes){if(b.cooldown<=0&&!r.item&&!r.itemPending&&Math.abs(wrapDiff(r.distance,b.distance))<2.6&&Math.abs(r.offset-b.offset)<2.2&&Math.abs(r.y+1+coasterH(b.distance)+(elems.length?elemH(b.distance):0)-b.baseY)<3){b.cooldown=4;if(nearPlayer(r,70))boxPop(b);if(me){r.itemPending=true;roulette={t:.95,tick:0,final:rollItem(placeOf(r),racers.length)};}else{r.item=rollItem(placeOf(r),racers.length);r.charges=chargesFor(r.item);r.cooldown=1+Math.random()*2;}}}
  if(me&&!worldMode&&lap(r,length)>oldLap){const lt=elapsed-stats.lapStart,best=lt<stats.bestLap;stats.bestLap=Math.min(stats.bestLap,lt);stats.lapStart=elapsed;const isLast=lap(r,length)===LAPS,clean=lapClean(r);
   toast(`RUNDE ${oldLap}: ${format(lt)}${best&&oldLap>1?' · BESTE RUNDE!':''}${clean?' · SAUBER ✓':''}`,2,best&&oldLap>1||clean?'good':'');notice(isLast?'LETZTE RUNDE!':'RUNDE 2',1.5);say(isLast?'lastlap':'lap2');if(isLast){if(!playClip('s_finallap',sfxGain,.9))SFX.lap();setBgmRate((course.bgmRate||1)*1.07);}else SFX.lap();}
  if(finish(r,length,elapsed)&&me){const lt=elapsed-stats.lapStart;stats.bestLap=Math.min(stats.bestLap,lt);if(r.cleanFin===undefined)r.cleanFin=lapClean(r);planFireworks();}
  syncKart(r,dt);
  // Drift-Funken je Ladestufe (blau/orange/lila) an den Hinterraedern, Reifenspuren beim Rutschen
  const sx=Math.sin(r.h),cz=Math.cos(r.h);
  if(r.driftDir&&!r.air&&frame%2===0&&nearPlayer(r,90)){const lvl=miniTurbo(r.drift)?.[2]||null;if(lvl)for(const side of [-1,1])emit(r.x-sx*1.3+cz*side*.9,r.y+.25,r.z-cz*1.3-sx*side*.9,MT_COLORS[lvl],-sx*3+(Math.random()-.5)*3,1.5+Math.random()*2,-cz*3+(Math.random()-.5)*3,.3);}
  // Reifenspuren liegen flach am Boden - an der Halfpipe-Wand landeten sie sonst hinter der Pipe im Gras (R52)
  if(!r.air&&!(r.hpOn&&Math.abs(r.offset)>HP.flat-.6)&&(r.driftDir||Math.abs(r.slide)>2.2||(r.spinO>0&&Math.abs(r.speed)>3))&&(Math.abs(r.speed)>8||r.spinO>0)&&frame%3===0&&nearPlayer(r,70))for(const side of [-1,1])dropSkid(r.x-sx*.9+cz*side*.85,r.y,r.z-cz*.9-sx*side*.85,r.h);
  if(me&&offroad&&r.combo){if(r.combo>=2)toast('COMBO WEG',.7,'bad');r.combo=0;}
 // Ueberkopf: kopfueber zieht das Kart eine Funkenspur
 {const lq3=loops.length?loopAt(r.distance):null;
  const upDot=lq3?loopFrame(lq3,r.distance).nu:Math.cos(rollTot(r.distance));
  if(upDot<-.4){if(!r.ovh){r.ovh=1;if(me)toast('ÜBERKOPF!',1,'good');}
   if(frame%2===0&&nearPlayer(r,90)){const pm=r.mesh.position;
    emit(pm.x,pm.y+.2,pm.z,0x8fe8ff,(Math.random()-.5)*5,(Math.random()-.5)*5,(Math.random()-.5)*5,.4);}}
  else r.ovh=0;}
 // Looping sauber durchfahren gibt Schwung mit heraus
 if(loops.length){const inLp=!!loopAt(r.distance);
  if(inLp)r.lpT=(r.lpT||0)+dt;
  else if(r.lpT>1.5){r.lpT=0;r.boost=Math.max(r.boost,1.15);
   if(me){SFX.boost();toast('LOOPING-SCHWUNG!',1.2,'good');stats.boosts=(stats.boosts||0)+1;}}
  else r.lpT=0;}
 // Anti-Grav sauber durchfahren gibt Schwung mit heraus
 if(agrav.length){const inAg=hasRoll(r.distance);
  if(inAg){r.agT=(r.agT||0)+dt;if(offroad)r.agBad=1;}
  else if(r.agT>.4){const clean=!r.agBad;r.agT=0;r.agBad=0;
   if(clean){r.boost=Math.max(r.boost,.85);if(me){SFX.boost();toast('ANTI-GRAV-SCHUB!',1,'good');stats.boosts=(stats.boosts||0)+1;}}}
  else{r.agT=0;r.agBad=0;}}
  if(me&&offroad&&Math.abs(r.speed)>6&&frame%4===0)dropPuff(r,course.theme==='canyon'?0xe0a070:0xb7d59a);
  if(r.boost>0&&frame%3===0&&nearPlayer(r,80))emit(r.x-sx*1.8,r.y+.6,r.z-cz*1.8,0xffc04a,-sx*5,.5,-cz*5,.25);
  for(const s of swingers){if(s.kind!=='ghost'||(r.spookCd||0)>elapsed)continue;const dx=r.x-s.x,dz=r.z-s.z;if(dx*dx+dz*dz<5.3&&Math.abs(r.y+.8-s.y)<2.3){r.spookCd=elapsed+1.5;if(r.shield>0){burst(r,0xffe263,10);continue;}hitKart(r,.8,.6);loseSpores(r,1);burst(r,0xb48cff,16);if(me){stats.hitsTaken++;SFX.spook();toast('BUUUH! 👻',1.1,'bad');shake=.3;}else if(nearPlayer(r,40))SFX.spook(.4);}}
  // Bananen treffen jeden (auch den Leger nach kurzer Schonzeit), nicht in der Luft; Schild zerstoert sie.
  for(const h of hazards){if(h.life<=0||r.air||(h.owner===r.id&&h.arm>0))continue;const dx=r.x-h.x,dz=r.z-h.z;if(dx*dx+dz*dz<(h.fake?3.4:2.2)&&Math.abs((r.y||0)-h.y)<2){h.life=0;if(h.fake)fakePop(h);if(r.shield>0){burst(r,0xffe263,10);continue;}if(orbitBlock(r)){burst(r,0x8beb73,10);if(me)toast('BREZN FÄNGT AB!',.9,'good');continue;}hitKart(r,me?1.1:1.4,.45);spinOut(r);r.lastHitBy=h.owner;r.lastHitT=elapsed;hitSpores(r);burst(r,h.fake?0xf6c23c:0xffd23f,12);if(me){stats.hitsTaken++;SFX.slip();say('ouch');toast(h.fake?'FAKE! REINGELEGT 😈':'AUSGERUTSCHT!',1,'bad');shake=.35;}else{if(h.owner===0)stats.hitsDealt++;if(nearPlayer(r,45))SFX.slip(h.owner===0?.8:.4);}}}
 }
 // Kart-Kollisionen (Rempeln)
 for(let i=0;i<racers.length;i++)for(let j=i+1;j<racers.length;j++){const a=racers[i],b=racers[j];if(Math.abs(a.x-b.x)>3||Math.abs(a.z-b.z)>3||Math.abs(a.y-b.y)>1.2)continue;
  // an Kreuzungen (Looping, Acht) liegen zwei Streckenteile uebereinander: dort nicht rempeln
  // Im Looping stecken in einem Fahrbahnmeter mehrere Bildmeter: zwei Karts, die im Bild weit
  // auseinander sind, liegen auf der Fahrbahn dicht beieinander und duerfen sich nicht rempeln.
  const lq2=loops.length&&(loopAt(a.distance)||loopAt(b.distance));
  if(Math.abs(wrapDiff(lapDist(a.distance),lapDist(b.distance)))>(lq2?14/(lq2.sig+1):14))continue;
  // R45: Riesenpilz walzt kleine Karts platt (einmal je Sekunde und Opfer), statt abzuprallen
  if((a.mega>0)!==(b.mega>0)){const big=a.mega>0?a:b,sm=big===a?b:a;if(Math.hypot(a.x-b.x,a.z-b.z)<3.3){if(!(sm.shield>0)&&!(sm.squashCd>elapsed)){sm.squashCd=elapsed+1;hitKart(sm,1.1,.3);sm.lastHitBy=big.id;sm.lastHitT=elapsed;sm.squash=.6;burst(sm,0xff4a3d,12);
    if(big.id===0){stats.megaSquash=(stats.megaSquash||0)+1;stats.hitsDealt++;SFX.squash();toast('PLATT GEMACHT!',.9,'good');}else if(sm.id===0){stats.hitsTaken++;SFX.squash();toast('PLATT! 🍄',1,'bad');shake=.4;}}continue;}}
  const rel=Math.hypot(a.vx-b.vx,a.vz-b.vz),ax0=a.x,az0=a.z,bx0=b.x,bz0=b.z;if(collideKarts(a,b)){
   // Bild-Versatz gegen den Korrektursprung (syncKart laesst ihn weich abklingen), hoechstens 1,2 m
   const cv=(r,x0,z0)=>{r.vox=clamp((r.vox||0)+x0-r.x,-1.2,1.2);r.voz=clamp((r.voz||0)+z0-r.z,-1.2,1.2);};cv(a,ax0,az0);cv(b,bx0,bz0);
   // Gewitterwolke: ein kleines Kart wird vom grossen plattgefahren
   if(rel>6.5)for(const k of [a,b]){if((k.spores||0)>0||k.shield>0||k.mega>0||k.cannon>0||k.spinO>0||k.air)continue;spinOut(k,1,.85);hitKart(k,.45,.72);if(k.id===0){toast('🌀 OHNE SPOREN – DREHER!',1,'bad');SFX.slip?.();}}
   const fl=flattenSmall(a,b,rel);if(fl){flatten(fl,1.3);burst(fl,0xfff27a,10);if(fl.id===0){stats.hitsTaken++;toast('ÜBERROLLT!',1,'bad');SFX.hit();shake=.4;}else if(a.id===0||b.id===0){stats.hitsDealt++;toast('PLATT GEFAHREN!',.9,'good');SFX.hit(.7);}}
   else if((a.id===0||b.id===0)&&rel>6){SFX.bump(clamp(rel/25,.2,.8));shake=Math.max(shake,.15);}}}
 // R57: Arena-Wand auch nach den Rempeleien - sonst schoben Kollisionen Bots ueber den Rand, wo der Boden fehlte
 if(battle&&arenaOn())for(const r of racers)if(!r.net&&(!battle.open||r.fighter))arenaWall(r);
 updateShots(dt);updateBombs(dt);updateInk(dt);updateOrbits(dt);coachTick(dt);updateEmotes(dt);trailTick();modTick(dt);
 const newOrder=ranking(racers),place=newOrder.indexOf(player)+1;
 if(place<lastPlace&&elapsed>2&&!battle){stats.overtakes+=lastPlace-place;SFX.overtake();if(place<=3||Math.random()<.35)emote(racers[0],'happy');toast(`▲ PLATZ ${place}`,.9,'good');}
 if(place===1&&lastPlace>1&&elapsed>8&&elapsed-leadAt>15){leadAt=elapsed;say('lead');}lastPlace=place;
 // Falsche Richtung
 // R52: im Wiesnland gibt es keine falsche Richtung - dort faehrt man, wohin man will (Nutzerhinweis: staendige Anzeige)
 const tan=tanAt(player.distance),fdot=Math.sin(player.h)*tan.x+Math.cos(player.h)*tan.z;wrongT=!worldMode&&fdot<-.35&&Math.abs(player.speed)>4?wrongT+dt:0;if(wrongT>1&&noticeTimer<=0){notice('↺ UMDREHEN!',1);SFX.wrong();}if(loisl&&state==='race'){if(wrongT>.8&&loisl.mode!=='rescue')loislMode('wrong');else if(wrongT===0&&loisl.mode==='wrong')loislMode('away');}
 if(engine&&ctx){const t=ctx.currentTime,sp=Math.abs(player.speed);aset(engine.o1.frequency,55+sp*5.2+(player.air?50:0)+(player.boost>0?30:0),t,.06);aset(engine.o2.frequency,28+sp*2.6,t,.06);aset(engine.f.frequency,480+sp*36,t,.08);aset(engine.g.gain,soundOn?.011:0,t,.09);aset(engine.noise.gain,soundOn&&(player.driftDir||Math.abs(player.slide)>2.5)&&sp>8&&!player.air?.045:0,t,.07);aset(engine.bp.frequency,player.driftDir?1100+player.drift*260:900,t,.1);if(raceFilter)aset(raceFilter.frequency,Math.min(20000,3000+sp*430)*(1-.85*(elemFx?elemFx.uw:0)),t,.18);}
 syncKartInstances();if(player.finishTime!==null)end();}

// Direkt nach dem Rendern im selben Takt auslesen: ohne preserveDrawingBuffer ist das Bild danach weg.
// Das HUD liegt im DOM, das Foto zeigt also nur die Szene. Klein und als JPEG, damit es leicht bleibt.
// Wie bei echten Achterbahnen haengt die Fotokamera an der Strecke VOR dem Wagen und schaut zurueck
// aufs Gesicht: kurz umstellen, rendern, auslesen, zurueckstellen und neu rendern (einmal je Rennen).
function takeRidePhoto(){photoPending=false;const p=racers[0];if(!p)return;
 const pos=camera.position.clone(),q=camera.quaternion.clone(),up=camera.up.clone(),fov=camera.fov;
 try{const look=p.mesh.position.clone();look.y+=1.2;
  // Freie Sicht: kein anderes Kart naeher als 1,7 m an der Sichtlinie (sonst ist ein Rivale im Bild)
  const _s=new T.Vector3(),_c=new T.Vector3(),clearLine=e=>racers.every(o=>{if(o===p)return true;_s.subVectors(look,e);const L=_s.length()||1;_s.divideScalar(L);
   _c.subVectors(o.mesh.position,e);const t=clamp(_c.dot(_s),0,L);return _c.addScaledVector(_s,-t).length()>1.7;});
  let eye=null;for(const [ahead,side,up] of [[6,2.4,2.4],[4.5,-2.6,2.2],[5,3.4,3.4],[3.8,0,3.8],[7,-3.2,3]]){const e=posAt(p.distance+ahead,p.offset+side,up,new T.Vector3());if(clearLine(e)){eye=e;break;}}
  if(!eye)eye=posAt(p.distance+3.6,p.offset+1.6,3.2,new T.Vector3());
  // R40: Das Foto kostete einen Frame mit zwei vollen Zusatz-Bildern, blockierendem Pixel-Ruecklauf
  // und JPEG-Kodierung - auf dem Handy ein deutlicher Ruckler. Jetzt: ein Bild (Schattenkarte
  // wiederverwendet), asynchroner Schnappschuss, Kodierung im Leerlauf; das normale Bild kommt im
  // naechsten Frame, der Blitz deckt den einen Frame ab.
  camera.up.set(0,1,0);camera.position.copy(eye);camera.lookAt(look);camera.fov=48;camera.updateProjectionMatrix();
  const sa=renderer.shadowMap.autoUpdate;renderer.shadowMap.autoUpdate=false;renderer.render(scene,camera);renderer.shadowMap.autoUpdate=sa;
  const src=renderer.domElement,w=480,h=Math.round(w*src.height/Math.max(1,src.width));
  createImageBitmap(src,{resizeWidth:w,resizeHeight:h,resizeQuality:'medium'}).then(bmp=>{const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(bmp,0,0);if(bmp.close)bmp.close();
   (window.requestIdleCallback||setTimeout)(()=>{ridePhoto=c.toDataURL('image/jpeg',.82);});}).catch(()=>{ridePhoto=null;});}
 catch(e){ridePhoto=null;}
 camera.position.copy(pos);camera.quaternion.copy(q);camera.up.copy(up);camera.fov=fov;camera.updateProjectionMatrix();
 const f=$('flash');if(f){f.style.transition='none';f.style.opacity='.8';requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.transition='opacity .5s';f.style.opacity='0';}));}
 SFX.shutter();}
function showRidePhoto(){const rp=$('ridePhoto');if(!rp)return;rp.hidden=!ridePhoto;if(ridePhoto){rp.querySelector('img').src=ridePhoto;rp.querySelector('figcaption').textContent='ON-RIDE-FOTO · '+course.name.toUpperCase();}}
// R44: Fortschritt nach dem Rennen - XP-Balken fuellt sich (auch ueber Stufen hinweg), neue Erfolge und Lackierungen
function showProgress(res){store.set('prog',res.prog);const el=$('resultProg');if(!el)return;const lv0=levelOf(res.prog.xp-res.xp.total),lv1=levelOf(res.prog.xp);
 const unl=res.levelUp?KART_COLORS.filter(k=>k.lvl&&k.lvl>res.before&&k.lvl<=res.after):[];
 el.innerHTML=`<div class="xp-head"><b>STUFE <span id="xpLvl">${lv0.level}</span></b><span>+${res.xp.total} XP${res.xp.mul>1?` (×${res.xp.mul})`:''}</span></div><div class="xp-bar"><i id="xpFill" style="width:${Math.round(lv0.into/lv0.need*100)}%"></i></div>`+
  `<div class="xp-parts">${res.xp.parts.map(([k,v])=>`<span>${k} <b>+${v}</b></span>`).join('')}</div>`+
  (res.levelUp?`<div class="xp-up">⬆ FAHRERSTUFE ${res.after}!${unl.length?' · Neue Lackierung: '+unl.map(k=>k.n.split(' /')[0]).join(', '):''}</div>`:'')+
  (res.fresh.length?`<div class="ach-new">${res.fresh.map(id=>{const a=achById(id);return `<div class="ach"><i>🏅</i><b>${a.n}</b><small>${a.d}</small></div>`;}).join('')}</div>`:'');
 const fill=$('xpFill');setTimeout(()=>{if(res.levelUp){fill.style.width='100%';setTimeout(()=>{setText('xpLvl',String(lv1.level));fill.style.transition='none';fill.style.width='0%';void fill.offsetWidth;fill.style.transition='';fill.style.width=Math.round(lv1.into/lv1.need*100)+'%';playClip('s_c_levelup',sfxGain,.9);},700);}else fill.style.width=Math.round(lv1.into/lv1.need*100)+'%';},450);
 if(res.fresh.length)setTimeout(()=>playClip('s_c_unlock',sfxGain,.8),res.levelUp?1600:900);}
function end(){document.body.classList.remove('mirror');elapsed=racers[0].finishTime??elapsed;qualityRaceEnd();if(isTT())return endTT();state='finished';keys.clear();roulette=null;SFX.hum(false);burst(racers[0],0xffd452,26);burst(racers[0],0xed6350,16);burst(racers[0],0x55bdb2,16);
 $('result').hidden=false;$('lbBox').hidden=true;$('touch').hidden=true;showRidePhoto();const order=ranking(racers),place=order.indexOf(racers[0])+1,board=$('leaderboard'),rs=raceStars(place,stats.hitsTaken);
 $('resultTitle').textContent=place===1?(rs.perfect?'Perfektes Rennen!':'Der Pokal gehört dir!'):place<=3?`Platz ${place} – aufs Treppchen!`:place===order.length?'GAME OVER? NÖ – NOCHMAL!':`Platz ${place}. Da geht noch was!`;
 $('resultTime').textContent=`${course.name} · ${ccName(cc)} · ${format(elapsed)}`;lastResult={place,n:order.length,track:course.name,icon:course.icon,cc:ccName(cc),time:format(elapsed),best:Number.isFinite(stats.bestLap)?format(stats.bestLap):'',stars:rs.stars,online:!!(net&&net.setup),name:net&&net.setup?myNetName():(DRIVERS[driverIndex]?.n||'Fahrer')};$('shareBtn').hidden=false;
 $('resultStars').innerHTML=[0,1,2].map(i=>`<i class="${i<rs.stars?'on':''}">★</i>`).join('')+(rs.perfect?'<b>PERFEKT</b>':'');
 stopVoice();say(place===1?'win':place<=3?'podium':'finish');if(place<=3){SFX.cheer();confetti(racers[0],place===1?110:60);}board.replaceChildren();board.classList.toggle('many',order.length>8);
 // Statistik: macht sichtbar, womit man das Rennen gewonnen (oder verloren) hat
 const bestKey=`bestlap-${selected}`,oldBestLap=store.get(bestKey,Infinity),newBestLap=stats.bestLap<oldBestLap;if(newBestLap)store.set(bestKey,stats.bestLap);
 const st=[['Beste Runde',format(stats.bestLap)+(newBestLap?' ★ NEU':'')],['Saubere Runden',`${stats.cleanLaps||0} / ${LAPS}`],['Drift-Turbos · beste Combo',`${stats.mt.mini} · ${stats.mt.super} · ${stats.mt.ultra} · ×${stats.maxCombo||0}`],['Tricks · Ringe · Windschatten',`${stats.tricks} · ${stats.rings} · ${stats.drafts}`],['Präzisionsflüge',stats.precisionRings||0],...(coasters.length?[['Airtime · Achterbahn',`${stats.airtime||0} · ${stats.coasters||0}`]]:[]),...(hpipes.length?[['Halfpipe · Airs · Tricks',`${stats.hpAirs||0} · ${stats.hpTricks||0}`+(stats.hpBest>=1?` · ${stats.hpBest.toFixed(1).replace('.',',')} m`:'')]]:[]),['Überholt',stats.overtakes],['Treffer gelandet / kassiert',`${stats.hitsDealt} / ${stats.hitsTaken}`],['Rempler / Stürze',`${stats.bumps} / ${stats.falls}`]];
 $('resultStats').innerHTML=st.map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join('');
 // Rivale und Tages-Herausforderung (R46) vor dem Verbuchen, damit XP und Erfolge sie sehen
 if(rivalId!==null){stats.rivalBeaten=rivalBeaten(order.map(r=>r.id),rivalId);$('resultStats').insertAdjacentHTML('beforeend',`<div class="rival ${stats.rivalBeaten?'won':'lost'}"><span>⚔ Rivale ${racers[rivalId].name}</span><b>${stats.rivalBeaten?'GESCHLAGEN ✓':'vor dir'}</b></div>`);}
 {const ch=dailyChallenge(dayKey());if(!worldMode&&store.get('dailyDone','')!==ch.day&&dailyDone(ch,{track:selected,cc,place,finished:true,stats})){stats.daily=true;store.set('dailyDone',ch.day);dailyShown=null;setTimeout(()=>toast(`📅 TAGESAUFGABE GESCHAFFT! +${DAILY_XP} XP`,2,'good'),600);}}
 const onl=!!(net&&net.setup&&!worldMode),humansBeaten=onl&&net.humans?order.slice(place).filter(r=>r.id!==0&&net.humans.has(toGlobal(r.id,net.mySlot))).length:0,onlFirst=onl&&store.get('onlDay','')!==dayKey();if(onlFirst)store.set('onlDay',dayKey());
 const topOpen0=new Set(TOPPERS.filter(t=>topperUnlocked(t,topperMe())).map(t=>t.id)),onl0=onlRaces(),crown0=hasCrown(),yday=dayKey(new Date(Date.now()-864e5)),stk=streakUpdate(store.get('streak',{}),dayKey(),yday);store.set('streak',{last:stk.last,days:stk.days,best:stk.best});
 showProgress(recordRace(store.get('prog',{xp:0,ach:[],done:[],won:[]}),{track:selected,cc,place,finished:true,stats:{...stats},mirror:raceMirror,assist:raceAssist,online:onl,humansBeaten,onlineFirst:onlFirst,streakDays:stk.fresh?stk.days:0}));
 if(stk.fresh&&stk.days>1)setTimeout(()=>toast(`🔥 WIESN-SERIE: ${stk.days} TAGE! +${streakXP(stk.days)} XP`,2,'good'),300);
 {const wr=weeklyStep(store.get('weekly',null),weekKey(),{place,finished:true,online:onl,track:selected,stats:{...stats}});store.set('weekly',wr.st);
  if(wr.fresh.length){const pr=store.get('prog',{xp:0,ach:[],done:[],won:[]});pr.xp=(pr.xp||0)+WEEKLY_XP*wr.fresh.length;store.set('prog',pr);
   wr.fresh.forEach((g,i)=>setTimeout(()=>{toast(`📆 WOCHENZIEL: ${g.t} ✓ +${WEEKLY_XP} XP`,2.2,'good');SFX.bonus();},1800+i*1500));}
  if(wr.allDone){store.set('weeklyWins',store.get('weeklyWins',0)+1);setTimeout(()=>{toast('🏆 ALLE WOCHENZIELE GESCHAFFT!',2.4,'good');SFX.crown();},1800+wr.fresh.length*1500);}}
 crownMine=null;topperMine=undefined;{const fresh=TOPPERS.filter(t=>!topOpen0.has(t.id)&&topperUnlocked(t,topperMe()));fresh.forEach((t,i)=>setTimeout(()=>{toast(`🎁 NEUER AUFSATZ: ${t.icon} ${t.n}`,2.4,'good');SFX.bonus();},2600+i*1400));if(fresh.length)menuToppers();}
 if(onl){const u=ONLINE_UNLOCKS.find(q=>q.n>onl0&&q.n<=onlRaces());if(u)setTimeout(()=>toast('🌐 FREIGESCHALTET: '+u.what,2.4,'good'),1400);if(onlFirst)setTimeout(()=>{toast(`🌐 ERSTES ONLINE-RENNEN HEUTE: +${ONLINE_DAILY_XP} XP`,2,'good');SFX.bonus();},500);crownMine=null;if(!crown0&&hasCrown()){racers[0].crown=true;setTimeout(()=>{toast('👑 PIXEL-KRONE! Alle sehen sie ab jetzt über deinem Kart',2.6,'good');SFX.crown();},2200);}}
 if(gp.active){const gained={};order.forEach((r,i)=>gained[r.id]=gpPoints(i,order.length));addGpPoints(gp.points,order);$('resultEyebrow').textContent=`${gpName().toUpperCase()} ${ccName(cc).toUpperCase()} · RENNEN ${gp.race+1} / ${gpN()}`;
  gpStandings(gp.points,racers.map(r=>r.id)).forEach((id,i)=>{const li=document.createElement('li');if(id===0)li.className='me';li.innerHTML=`<span>${i+1}.</span><span>${racers[id].name}</span><span class="gain">+${gained[id]}</span><span>${gp.points[id]} P</span>`;board.append(li);});
  $('again').textContent=gp.race<gpN()-1?'Nächstes Rennen →':'Zur Siegerehrung 🏆';if(gp.race<gpN()-1)say('gpnext');}
 else{if(net&&net.setup&&place===1)lbWin();$('resultEyebrow').textContent=net&&net.setup?'ONLINE · ZIEL ERREICHT':'ZIEL ERREICHT';$('again').textContent=net&&net.setup?(net.setup.cyc?'⏳ Gleich zurück in die Lobby-Welt':'Zurück zur Lobby 🌐'):'Nochmal – schneller! ↻';order.forEach((r,i)=>{const li=document.createElement('li');if(r.id===0)li.className='me';li.innerHTML=`<span>${i+1}.</span><span>${r.name}</span><span>${r.finishTime!==null?format(r.finishTime):'noch im Rennen'}</span>`;board.append(li);});}
 if(engine)engine.g.gain.value=0;let wasBest=false;const key=`best-${selected}-${cc}`,old=store.get(key,Infinity);if(elapsed<old&&place<=3){store.set(key,elapsed);wasBest=true;}
 const starKey=`stars-${selected}-${cc}`;if(rs.stars>store.get(starKey,0))store.set(starKey,rs.stars);refreshBest();
 if(wasBest&&!TEST){say('best');burst(racers[0],0xffe16a,36);notice('NEUE BESTZEIT!',2.6);}
 stopBgm();if(!playClip(place<=3?'s_c_win':'s_c_lose',sfxGain,.85)&&!playClip(place<=3?'s_jingle':'s_goodtry',sfxGain,.8))SFX.fanfare();finishMusicAt=performance.now()+(place<=3?6800:4800);if(!wasBest)setText('message','');}
function endTT(){state='finished';keys.clear();roulette=null;const p=racers[0];$('result').hidden=false;$('touch').hidden=true;showRidePhoto();if(ghost)ghost.mesh.visible=false;
 const m=medalOf(elapsed),key=`tt-${selected}`,old=store.get(key,Infinity),record=elapsed<old,prevMedal=store.get(`medal-${selected}`,3);
 if(record){store.set(key,elapsed);if(rec&&rec.x.length)store.set(`ghost-${selected}`,{...rec,next:undefined,color:KART_COLORS[colorIndex].c,time:elapsed});}
 if(m<prevMedal)store.set(`medal-${selected}`,m);
 burst(p,m===0?0xffd23f:m===1?0xdfe6ee:m===2?0xd08a4a:0x55bdb2,34);
 $('resultEyebrow').textContent='ZEITFAHREN · '+course.name.toUpperCase();
 $('resultTitle').textContent=m<3?`${['Gold','Silber','Bronze'][m]}-Medaille!`:'Knapp daneben – der Geist wartet!';
 $('resultTime').textContent=`${format(elapsed)}${record?' · NEUER REKORD 👻':isFinite(old)?' · Rekord '+format(old):''}`;
 $('resultStars').innerHTML=[0,1,2].map(i=>`<i class="${i<3-m?'on':''}">★</i>`).join('')+(m<prevMedal&&m<3?'<b>NEUE MEDAILLE</b>':'');
 const st=[['Beste Runde',format(stats.bestLap)],['Drift-Turbos',`${stats.mt.mini} · ${stats.mt.super} · ${stats.mt.ultra}`],['Tricks / Ringe',`${stats.tricks} / ${stats.rings}`],['Präzisionsflüge',stats.precisionRings||0],...(coasters.length?[['Airtime · Achterbahn',`${stats.airtime||0} · ${stats.coasters||0}`]]:[]),...(hpipes.length?[['Halfpipe · Airs · Tricks',`${stats.hpAirs||0} · ${stats.hpTricks||0}`]]:[]),['Rempler / Stürze',`${stats.bumps} / ${stats.falls}`]];
 $('resultStats').innerHTML=st.map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join('');
 const board=$('leaderboard');board.replaceChildren();board.classList.remove('many');course.medals.forEach((t,i)=>{const li=document.createElement('li');if(i===m)li.className='me';li.innerHTML=`<span>${MEDALS[i]}</span><span>${elapsed<=t?'✓ geschafft':'noch '+(elapsed-t).toFixed(1)+' s'}</span><span>${format(t)}</span>`;board.append(li);});
 $('again').textContent=record?'Gegen den neuen Geist ↻':'Nochmal versuchen ↻';refreshBest();{const b=$('lbBox');b.hidden=false;lbPanel(b,ttBoard(selected));}
 stopVoice();say(record?'best':'finish');if(m<3)SFX.cheer();if(engine)engine.g.gain.value=0;stopBgm();if(!playClip(m<3?'s_c_win':'s_c_lose',sfxGain,.85)&&!playClip(m<3?'s_jingle':'s_goodtry',sfxGain,.8))SFX.fanfare();finishMusicAt=performance.now()+(m<3?6800:4800);setText('message','');}
function nextAfterResult(){if(net&&net.setup&&net.setup.cyc){toast('⏳ Gleich geht es zurück in die Lobby-Welt …',1.8);return;}if(net&&net.setup){if(net.host&&net.pub)net.autoT=Math.min(net.autoT||0,performance.now()+4000);home();openOnline();return;}if(gp.active){if(gp.race<gpN()-1){gp.race++;start();}else ceremony();}else start();}

// ---------------------------------------------------------------- Grand-Prix-Siegerehrung, Pokale & Freischaltung
function ceremony(){state='ceremony';worldDirty=true;clearGroup(actors);kartInst=null;kartPool=null;bombs=[];stormFx=[];hazards=[];shots=[];puffs=[];
 for(const id of ['result','hud','touch','pause'])$(id).hidden=true;document.body.classList.remove('racing');document.body.classList.add('cer');
 const standings=gpStandings(gp.points,racers.map(r=>r.id)),pos=sample(length*.035,-34).p,group=new T.Group();group.position.set(pos.x,0,pos.z);const look=sample(length*.035,0).p;
 world.traverse(o=>{if((o.isGroup||o.isMesh)&&o.parent===world&&!o.isInstancedMesh&&o.position.y<20&&Math.hypot(o.position.x-pos.x,o.position.z-pos.z)<26&&Math.hypot(o.position.x-pos.x,o.position.z-pos.z)>0.5)o.visible=false;});group.rotation.y=Math.atan2(look.x-pos.x,look.z-pos.z);actors.add(group);
 const S=2.2,podium=[];if(P.podium){const pd=cloneProto(P.podium);pd.scale.setScalar(S);group.add(pd);}else[[0,1.5],[-2.6,1],[2.6,.7]].forEach(([x,h])=>box(group,cream,x*S,h*S/2,0,2.5*S,h*S,2.2*S));
 [[0,1.5],[-2.6,1],[2.6,.7]].forEach(([x,h],i)=>{const r=racers[standings[i]],k=kart(r.color,r.id===0&&KART_COLORS[colorIndex].gold,r.id===0?driverIndex:AI_DRIVERS[r.id]);k.position.set(x*S,h*S,0);k.scale.setScalar(1.25);group.add(k);podium.push(k);});
 let trophy=null;if(P.trophy){trophy=cloneProto(P.trophy);trophy.scale.setScalar(1.6);trophy.position.set(0,1.5*S+3.1,0);group.add(trophy);}
 group.updateMatrixWorld(true);cer={group,trophy,podium,t:0,burstT:0,center:new T.Vector3(pos.x,4,pos.z),angle:group.rotation.y};
 const mine=standings.indexOf(0)+1,tKey=trophyKey(gp.cup||'alle',cc),prevT=store.get(tKey,9);if(mine<=3&&mine<prevT)store.set(tKey,mine);
 let unlock='';if(mine===1)grantAch('gp');if(mine===1&&cc>=100&&!store.get('gold',false)){store.set('gold',true);unlock='🔓 GOLDPILZ-KART FREIGESCHALTET!';}
 $('cerTitle').textContent=mine===1?`${gpName()}-Sieger ${ccName(cc)}! 🏆`:mine<=3?`Platz ${mine} im ${gpName()} ${ccName(cc)}!`:`${gpName()} beendet – Platz ${mine}`;
 $('cerUnlock').textContent=unlock||(mine===1&&cc<150?`Nächste Herausforderung: Klasse ${ccName(cc===50?100:150)}`:mine>1?'Hol dir Gold – drifte die Kurven sauberer!':'');
 const board=$('cerBoard');board.replaceChildren();board.classList.toggle('many',racers.length>8);standings.forEach((id,i)=>{const li=document.createElement('li');if(id===0)li.className='me';li.innerHTML=`<span>${['🥇','🥈','🥉'][i]||(i+1)+'.'}</span><span>${racers[id].name}</span><span>${gp.points[id]} P</span>`;board.append(li);});
 $('ceremony').hidden=false;stopVoice();say(mine===1?'gpwin':mine<=3?'gppodium':'gpfinish');SFX.cheer();stopBgm();if(!playClip(mine<=3?'s_c_win':'s_c_lose',sfxGain,.85)&&!playClip(mine<=3?'s_jingle':'s_goodtry',sfxGain,.8))SFX.fanfare();finishMusicAt=performance.now()+(mine<=3?6800:4800);}
function updateCeremony(dt){if(!cer)return;cer.t+=dt;cer.burstT-=dt;cer.podium.forEach((k,i)=>{const d=k.userData.parts?.driver;if(!d)return;d.position.y=.95+Math.abs(Math.sin(cer.t*(6-i)+i))*(i===0?.5:.3);d.rotation.z=Math.sin(cer.t*4+i)*.18;d.rotation.y=i===0?Math.sin(cer.t*2)*.5:0;});if(cer.trophy){cer.trophy.rotation.y+=dt*1.2;cer.trophy.position.y=1.5*2.2+3.1+Math.sin(cer.t*2)*.25;}
 if(cer.burstT<=0){cer.burstT=.3;const p=new T.Vector3((Math.random()-.5)*14,4+Math.random()*4,(Math.random()-.5)*4).applyMatrix4(cer.group.matrixWorld);burst({mesh:{position:p}},FAN_COLS[Math.floor(Math.random()*FAN_COLS.length)],10);}}

// ---------------------------------------------------------------- HUD, Karte, Kamera
const draftHud=document.createElement('div');draftHud.id='draftHud';draftHud.hidden=true;
draftHud.innerHTML='<span class="draft-wind" aria-hidden="true">»</span><div><b id="draftTitle">WINDSCHATTEN</b><span id="draftHint">DRANBLEIBEN</span><div id="draftMeter" role="progressbar" aria-label="Windschatten aufladen" aria-valuemin="0" aria-valuemax="100"><i></i></div></div>';$('hud').appendChild(draftHud);
function updateDraftHud(p){const ds=p.draftState,on=state==='race'&&!isTT()&&!worldMode&&!!ds&&(ds.charge>.03||ds.ready);
 draftHud.hidden=!on;if(!on)return;
 const pct=Math.round(ds.charge*100);draftHud.classList.toggle('ready',ds.ready);setText('draftTitle',ds.ready?'TURBO BEREIT':'WINDSCHATTEN');setText('draftHint',ds.ready?'← AUSSCHEREN →':'DRANBLEIBEN · '+pct+' %');
 const m=$('draftMeter');m.setAttribute('aria-valuenow',String(pct));m.firstElementChild.style.transform='scaleX('+ds.charge.toFixed(3)+')';}
function format(time){if(!isFinite(time))return '--:--.-';return `${String(Math.floor(time/60)).padStart(2,'0')}:${(time%60).toFixed(1).padStart(4,'0')}`;}
function hud(){if(state==='menu'||state==='ceremony'||!racers.length)return;const p=racers[0];updateDraftHud(p);
 const boosting=state==='race'&&p.boost>0?'1':'0';if(HC.boosting!==boosting){HC.boosting=boosting;document.body.classList.toggle('boosting',boosting==='1');}
 if(isTT()){const m=[0,1,2].find(i=>elapsed<=course.medals[i])??2;setText('ttMedalLabel',MEDALS[m]);setText('ttMedalTime',format(course.medals[m]));
  let dl='—',cls='';if(ghost&&isFinite(ghost.dist)&&state==='race'){const gap=(ghost.dist-p.distance)/Math.max(12,Math.abs(p.speed));dl=(gap>0?'+':'−')+Math.abs(gap).toFixed(1)+' s';cls=gap>0?'behind':'ahead';}setText('ttDelta',dl);if(HC.ttc!==cls){HC.ttc=cls;$('ttDelta').className=cls;}}
 setText('place',String(ranking(racers).indexOf(p)+1));setText('placeOf','/ '+racers.length);const lapHtml=`${lap(p,length)} <em>/ 3</em>`;if(HC.lap!==lapHtml){HC.lap=lapHtml;$('lap').innerHTML=lapHtml;}
 if(gp.active){const g=`${cupById(gp.cup||'alle').icon} ${gp.race+1} <em>/ ${gpN()}</em>`;if(HC.gp!==g){HC.gp=g;$('gpRace').innerHTML=g;}}
 setText('time',format(elapsed));setText('speed',String(Math.round(Math.abs(p.speed)*(p.czVis||1)*3.6)));setText('sporeCount',String(p.spores||0));
 {const on=rivalId!==null&&!!racers[rivalId];const tag=$('rivalTag');if(tag.hidden===on)tag.hidden=!on;
  if(on){const rv=racers[rivalId],ahead=rv.finishTime!==null&&p.finishTime===null||(rv.finishTime===null&&p.finishTime===null&&rv.distance>p.distance),t=(ahead?'▲ ':'▼ ')+rv.name.toUpperCase();if(HC.rv!==t){HC.rv=t;$('rivalName').textContent=t;tag.classList.toggle('ahead',ahead);}}}
 let key='empty',name='ITEM SAMMELN';
 if(roulette){const ks=['boost','shell','banana','shield','green3','bomb','storm','fake','mega','red3','spiky','coins','ink'];key=ks[Math.floor(performance.now()/75)%ks.length];name='…';}
 else if(p.item){key=p.item;name=ITEM_NAMES[p.item];}
 const tag=key+(chargesFor(key)?p.charges:'');
 if(HC.art!==tag){HC.art=tag;const pic=itemThumbs[key];
  const html=(pic?'<img src="'+pic+'" alt="">':(ITEM_ART[key]||ITEM_ART.empty))+(chargesFor(key)?'<b class="cnt">'+p.charges+'</b>':''),col=ITEM_COL[key]||'#cfe0d4';
  for(const id of ['itemIcon','titemIcon']){const el=$(id);if(el){el.innerHTML=html;el.parentElement.style.setProperty('--it',col);}}
  $('item').classList.toggle('spin',!!roulette);$('titem').classList.toggle('spin',!!roulette);}
 setText('itemName',name);const ready=p.item?'1':'0';if(HC.ready!==ready){HC.ready=ready;$('titem').classList.toggle('ready',!!p.item);$('item').classList.toggle('ready',!!p.item);}
 const full=p.spores>=MAX_SPORES?'1':'0';if(HC.full!==full){HC.full=full;$('spores').classList.toggle('full',full==='1');}
 const lvl=miniTurbo(p.drift)?.[2]||'';const w=(p.driftDir?Math.min(100,p.drift/1.9*100):0).toFixed(0)+'%';if(HC.dw!==w){HC.dw=w;$('driftbar').style.width=w;}const dc=lvl?'#'+MT_COLORS[lvl].toString(16).padStart(6,'0'):'#9fb4c2';if(HC.dc!==dc){HC.dc=dc;$('driftbar').style.background=dc;}
 setText('driftlabel',p.boost>0?'TURBO!':p.air?(p.trick?'TRICK!':oh.on?'IN DER LUFT · TIPPEN = TRICK':p.gliding?'PILZGLEITER · DRIFT = TRICK':'IN DER LUFT · DRIFT = TRICK'):p.driftDir?(lvl?MT_LABEL[lvl]+' BEREIT':oh.on?'FINGER HALTEN …':'DRIFT HALTEN …'):p.hopT>0?'HOPS! JETZT LENKEN':(p.draft||0)>.25?'WINDSCHATTEN …':oh.on?'WEIT WISCHEN = DRIFT':padHints?'LB/RB + LENKEN = DRIFT':coarseInput?'DRIFT + LENKEN':'SHIFT + LENKEN = DRIFT');}
function refreshBest(){document.querySelectorAll('#tracks .track').forEach((b,i)=>{let span=b.querySelector('.best');if(!span){span=document.createElement('span');span.className='best';b.append(span);}
 if(mode==='tt'){const t=store.get(`tt-${i}`,null),md=store.get(`medal-${i}`,3);span.textContent=(md<3?['🥇','🥈','🥉'][md]+' ':'')+(t?format(t):'—');return;}
 const t=store.get(`best-${i}-${cc}`,null),stars=store.get(`stars-${i}-${cc}`,0);span.textContent=(stars?'★'.repeat(stars)+' ':'')+(t?format(t):'—');});}
function drawMap(){const {cx,cz,k}=mapInfo,X=x=>100+(x-cx)*k,Y=z=>80+(z-cz)*k,out=$('map').getContext('2d');
 if(!mapBase){mapBase=document.createElement('canvas');mapBase.width=200;mapBase.height=160;const q=mapBase.getContext('2d');q.lineWidth=9;q.lineJoin='round';q.strokeStyle='#0b1a2288';q.beginPath();for(let i=0;i<=PS;i+=16){const j=i%PS;i?q.lineTo(X(TP.x[j]),Y(TP.z[j])):q.moveTo(X(TP.x[j]),Y(TP.z[j]));}q.stroke();q.lineWidth=3;q.strokeStyle='#fff6dd';q.stroke();
 q.fillStyle='#ffd23f';for(const r of ramps){const p=sample(r.d,r.off).p;q.fillRect(X(p.x)-2.5,Y(p.z)-2.5,5,5);}q.fillStyle='#b48cff';for(const z of zones)if(!z.hp)q.fillRect(X(z.x)-4,Y(z.z)-4,8,8);
 // R52: Halfpipes als eigenes Band (rosa mit dunklem Rand)
 for(const z of hpipes){q.beginPath();for(let x=0;x<=z.span;x+=4){const [i,j,k]=tIdx(z.s+x),px=X(TP.x[i]+(TP.x[j]-TP.x[i])*k),pz=Y(TP.z[i]+(TP.z[j]-TP.z[i])*k);x?q.lineTo(px,pz):q.moveTo(px,pz);}
  q.lineCap='round';q.lineWidth=9;q.strokeStyle='#15133a';q.stroke();q.lineWidth=5;q.strokeStyle='#ff6fcf';q.stroke();q.lineCap='butt';}q.fillStyle='#2fb7d8';for(const g of gaps){const p=sample(g.c).p;q.beginPath();q.arc(X(p.x),Y(p.z),5,0,TAU);q.fill();}
 for(const f of forks){q.beginPath();f.pts.forEach((p,i)=>i?q.lineTo(X(p.x),Y(p.z)):q.moveTo(X(p.x),Y(p.z)));q.lineWidth=7;q.strokeStyle='#0b1a2288';q.stroke();q.lineWidth=2;q.strokeStyle='#ffe9a8';q.stroke();}}
 const q=out;q.clearRect(0,0,200,160);q.drawImage(mapBase,0,0);
 for(let n=racers.length-1;n>=0;n--){const r=racers[n];q.fillStyle=r.id===0?'#ffe16a':'#fff';q.beginPath();q.arc(X(r.x),Y(r.z),r.id===0?5:3,0,TAU);q.fill();if(r.id===0){q.strokeStyle='#203e2f';q.lineWidth=1.5;q.stroke();}}}
const tempLook=new T.Vector3(),camFlat=new T.Vector3(),camUp=new T.Vector3(0,1,0);
// Blickpunkt fuers Menue: die Stelle der Runde mit dem groessten Abstand zu allen Bauwerken.
// Sonst steht ein Wurzeltor oder eine Burg direkt vor der Kamera und verdeckt die Strecke.
let menuSpotD=-1,menuSpotFor=-2;
function menuSpot(){if(menuSpotFor===builtSel)return menuSpotD;
 let best=length*.03,bd=-1;
 for(let i=0;i<32;i++){const d=length*i/32,q=sample(d).p;let m=1e9;
  for(const z of zones)m=Math.min(m,Math.hypot(q.x-z.x,q.z-z.z)-(z.r||0));
  if(!zones.length)m=999;
  if(m>bd){bd=m;best=d;}}
 menuSpotFor=builtSel;menuSpotD=best;return best;}
function updateCameraMenuSpot(){return menuSpot();}
function updateCamera(dt,snap=false){const portrait=camera.aspect<.9;
 if(introT>0&&state==='countdown'&&racers.length){introCam();return;}
 if(state==='menu'){camera.up.set(0,1,0);const s=sample(menuSpot()),angle=performance.now()*.00004;
  const r=portrait?58:74,hy=portrait?30:38;
  camera.position.set(s.p.x+Math.sin(angle)*r,hy+s.p.y,s.p.z+Math.cos(angle)*r);camera.lookAt(s.p.x,4,s.p.z);
  // Auf breiten Schirmen steht das Menue links. Den Blickpunkt nach links schieben, dann liegt
  // die Strecke rechts daneben im Bild statt hinter dem Panel.
  if(!portrait&&innerWidth>900){camera.updateMatrixWorld();
   tempLook.setFromMatrixColumn(camera.matrixWorld,0).multiplyScalar(-30).add(s.p);tempLook.y=4;camera.lookAt(tempLook);}
  setFov(portrait?72:54,dt,true);return;}
 if(state==='ceremony'&&cer){camera.up.set(0,1,0);const a=cer.angle+Math.sin(cer.t*.25)*.9,r=portrait?30:23;camera.position.set(cer.center.x+Math.sin(a)*r,cer.center.y+5+Math.sin(cer.t*.4),cer.center.z+Math.cos(a)*r);camera.lookAt(cer.center.x,cer.center.y+(portrait?-4.5:1.5),cer.center.z);
  if(!portrait&&innerWidth>900){camera.updateMatrixWorld();tempLook.setFromMatrixColumn(camera.matrixWorld,0).multiplyScalar(7).add(cer.center);tempLook.y+=1.5;camera.lookAt(tempLook);}
  setFov(portrait?70:52,dt,true);return;}
 if(!racers.length)return;const p=racers[0];
 // Verfolgerkamera haengt am Kart (nicht an der Strecke): man sieht, wohin man wirklich faehrt
 let targetH=p.h+(p.driftDir?-p.driftDir*.12:0);
 // Halfpipe (R52): die Kamera schaut die Pipe entlang - folgte sie der Nase, stuende sie beim Herunterfahren hinter der Wand
 if(p.hpOn){const tn=tanAt(p.distance),ta=Math.atan2(tn.x,tn.z);targetH=ta+clamp(angleDiff(targetH,ta),-.3,.3);}
 camH=snap?targetH:camH+angleDiff(targetH,camH)*Math.min(1,dt*(p.driftDir?3.2:5));
 const mgC=(p.megaS||1)-1,back0=(dbg.camBack??(portrait?10.5:8.4))*(1+mgC*.14),up0=(dbg.camUp??(portrait?4.8:3.7))*(1+mgC*.18),sx=Math.sin(camH),cz=Math.cos(camH),py=p.y??0;

 // Anti-Grav: Kamera folgt der gedrehten Fahrbahn (Versatz und Hochachse um die Fahrtrichtung gedreht)
 // Feed-Forward: das analytische Roll-Delta wird direkt uebernommen, nur der Restfehler wird geglaettet.
 // So hinkt der Horizont bei schnellen Korkenziehern nicht (alt: dt*7-Nachlauf ~30 Grad) und die
 // TAU/0-Naht am Ende eines Roll-Moduls loest keinen Rueckwaertssalto aus (angleDiff ist wrap-sicher).
 // Eine einzige Kameraführung fuer flach, Spirale und Looping: Position, Hochachse und
 // Blickrichtung kommen aus demselben Rahmen und werden durchgehend geglättet. Frueher waren das
 // drei Modi mit harten Umschaltern - genau dort ruckte das Bild.
 // R57: weit neben der Strasse (offene Welt, Arena) folgt die Kamera nur dem Kart - Looping, Rollwinkel, Hub und Hoehe der
 // zugeordneten Streckenstelle verzerrten dort das Bild (Ruckeln im Kotzhuegel Fight)
 const farC=worldMode&&Math.abs(p.offset)>14;
 const lq=loops.length&&!farC?loopAt(p.distance):null;
 // R44: Achterbahn-Twists drehen die Kamera nur zu 40 % mit (Horizont bleibt ruhiger), und die Kamera-Rolle ist auf
 // 3,2 rad/s begrenzt - schnelle Spiralen drehten das Bild vorher mit bis zu 15 rad/s
 const rl=farC?0:(agrav.length?rollAt(p.distance):0)+(coasters.length?coasterCamRoll(p.distance):0);
 // Gewicht fuer die Bahnkamera: der Sichthub der Rollzone faehrt ohnehin weich hoch und runter
 // Achterbahn (R38): ab ein paar Metern Hoehe setzt sich die Kamera ebenfalls auf die Bahn hinter
 // dem Kart - sonst schneidet sie an Kuppe und Abfahrt durch den Huegel.
 const rw=farC?0:Math.max(agrav.length&&!lq?Math.min(1,liftAt(p.distance)/7):0,coasters.length&&!lq?Math.min(1,coasterH(p.distance)/6)*.85:0,elems.length&&!lq?Math.min(1,Math.abs(elemH(p.distance))/4)*.9:0);
 if(snap)camRoll=camRollPrev=rl;
 else{const dRl=clamp(angleDiff(rl,camRollPrev),-3.2*dt,3.2*dt),pred=camRoll+dRl;camRoll=angleDiff(pred+clamp(angleDiff(rl,pred)*(1-Math.exp(-dt*10)),-3.2*dt,3.2*dt),0);camRollPrev=angleDiff(camRollPrev+dRl,0);}
 let kx=p.x,ky=py,kz=p.z,fx=sx,fy=0,fz=cz,ux=0,uy=1,uz=0;
 // Im Looping wird der Kamerarahmen aus der Blickrichtung des Karts aufgebaut (nicht aus der
 // Streckentangente): am Ein- und Ausgang ist er damit exakt die flache Kamera, also kein Ruck.
 if(lq){const st=loopFrame(lq,p.distance);
  posAt(p.distance,p.offset,py-roadRef(p.distance,p.offset),_agP);kx=_agP.x;ky=_agP.y;kz=_agP.z;
  fx=sx*st.tf+cz*st.tl;fy=st.tu;fz=cz*st.tf-sx*st.tl;ux=sx*st.nf;uy=st.nu;uz=cz*st.nf;}
 else if(farC){kx=p.x;ky=py;kz=p.z;}
 else {posAt(p.distance,p.offset,py-roadRef(p.distance,p.offset),_agP);kx=_agP.x;ky=_agP.y;kz=_agP.z;
  // Der Versatz nach hinten folgt der Steigung der sichtbaren Fahrbahn. Waagerecht gerechnet
  // landete die Kamera an der abfallenden Rampe einer Anti-Grav-Zone unter der Fahrbahn - dann
  // verdeckt die Bahn die Sicht nach vorn und man weiss nicht mehr, wohin man faehrt.
  posAt(p.distance+3,p.offset,0,_agB);posAt(p.distance-3,p.offset,0,_agL);
  const dy=clamp(_agB.y-_agL.y,-5,5),dxz=Math.hypot(_agB.x-_agL.x,_agB.z-_agL.z)||1,pl=Math.hypot(dxz,dy);
  fx=sx*dxz/pl;fy=dy/pl;fz=cz*dxz/pl;
  if(Math.abs(camRoll)>1e-4){const tn=tanAt(p.distance);_agAxis.set(tn.x,0,tn.z);_agV.set(0,1,0).applyAxisAngle(_agAxis,camRoll);ux=_agV.x;uy=_agV.y;uz=_agV.z;}}
 const kk=snap?1:1-Math.exp(-dt*15);
 camUp.x+=(ux-camUp.x)*kk;camUp.y+=(uy-camUp.y)*kk;camUp.z+=(uz-camUp.z)*kk;
 if(camUp.lengthSq()<1e-4)camUp.set(0,1,0);camUp.normalize();
 // In Rollzonen bleibt die Kamera nah dran (normale Verfolgerhoehe plus wenig). Frueher stand sie
 // 11 m ueber der Fahrbahn - bei 180 Grad Roll heisst kartseitig "ueber" weltoffen "11 m UNTER dem
 // schwebenden Band", mitten zwischen den Spiralgängen: das sah aus wie Kamera unter der Strecke.
 // Die Bahn-Kamera rotiert mit der Fahrbahn mit, kann also von ihr nicht ueberstrichen werden;
 // nur die Rest-Glaettung braucht Abstand, dafuer zieht sie in Rollzonen schneller nach.
 const back=back0*(1-rw*.34);let up=up0+rw*2.4;
 // Korkenzieher um den Drachen (R39): die Kamera bleibt unter der Drehachse, sonst saesse sie im Drachenkoerper
 if(coasters.length){coasterRoll(p.distance,_rax3);if(_rax3.A>0)up=Math.min(up,_rax3.A-3.6);}
 _agV.set(kx-fx*back+camUp.x*up,ky-fy*back+camUp.y*up,kz-fz*back+camUp.z*up);
 // ... und steht hinter dem Kart zur Mitte der Pipe versetzt und etwas hoeher, je weiter es die Wand hinauf ist
 if(p.hpOn&&hpipes.length){const hz=hpAt(p.distance);if(hz){hpProfile(p.offset,hpEnvAt(hz,p.distance),_hpp);const w=clamp(_hpp.u/3+.35,0,1);
  if(w>0){const dB=lapDist(p.distance-back),tn=tanAt(dB),lat=_hpp.lat*.5;posAt(dB,0,0,_agB);_agB.x+=tn.z*lat;_agB.z-=tn.x*lat;_agB.y+=up+_hpp.up*.55;_agV.lerp(_agB,w);}}}
 // und sie setzt sich auf die Bahn an ihrer eigenen Stelle, nicht in den Rahmen des Karts
 if(rw>0){posAt(lapDist(p.distance-back),p.offset,up,_agB);_agV.lerp(_agB,rw);}
 if(snap)camera.position.copy(_agV);else camera.position.lerp(_agV,1-Math.exp(-dt*(7+rw*5)));
 camera.up.copy(camUp);
 camera.lookAt(kx+fx*8+camUp.x*1.3,ky+fy*8+camUp.y*1.3,kz+fz*8+camUp.z*1.3);
 if(p.boost>0){camera.position.y+=Math.sin(elapsed*63)*.05;camera.position.x+=Math.sin(elapsed*49)*.04;}
 if(shake>0){shake=Math.max(0,shake-dt);const sk=shake*calmK();camera.position.x+=(Math.random()-.5)*sk*.9;camera.position.y+=(Math.random()-.5)*sk*.7;}
 setFov((portrait?74:62)+(p.boost>0?10:0)+clamp(Math.abs(p.speed)-24,0,16)*.35+(p.czFloatS>.05?6:0),dt,snap);}
function setFov(target,dt,snap){camFov=snap?target:camFov+(target-camFov)*Math.min(1,dt*6);if(Math.abs(camera.fov-camFov)>.01){camera.fov=camFov;camera.updateProjectionMatrix();}}
function adaptQuality(fps){if(gfxMode!=='auto'||(state!=='race'&&state!=='countdown')||fps>=50||quality.level>=5)return;quality.level++;
 // R44: mitten im Rennen nur Aufloesung, Schattenkarte und Schattenrhythmus - nie Schatten oder Material umschalten
 quality.dprCap=Math.max(.7,quality.dprCap-(quality.level<=2?.15:.1));
 if(quality.level===1&&!LITE){sun.shadow.mapSize.set(512,512);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}
 if(quality.level===2)shadowEvery=2;
 renderer.setPixelRatio(Math.min(devicePixelRatio,quality.dprCap));resize();
 if(store.get('gfxAuto',0)<Math.min(quality.level,3))store.set('gfxAuto',Math.min(quality.level,3));}
// Laeuft ein ganzes Rennen fluessig (ueber 58 fps), darf die naechste Sitzung eine Stufe hoeher starten
function qualityRaceEnd(){if(gfxMode!=='auto'||!quality.raceFrames)return;const fps=quality.raceFrames/Math.max(1,quality.raceSec);const l=store.get('gfxAuto',0);if(fps>58&&l>0)store.set('gfxAuto',l-1);quality.raceFrames=0;quality.raceSec=0;}
const dbg={};let tunnelMix=0,shadowEvery=1;
const GFX={auto:{n:'Auto'},mid:{n:'Mittel'},low:{n:'Sparsam'}};
let gfxMode=store.get('gfx','auto');
// Feste Stufen: Aufloesung, Schattenkarte, Schattenrhythmus. 'auto' startet hoch und regelt bei Bedarf herunter.
function applyGfx(){const m=gfxMode;
 if(m==='low'||LITE){const lr=store.get('gfxAuto',0);quality.level=m==='low'?3:lr;quality.dprCap=m==='low'?.85:Math.max(.9,1.5-.15*lr);shadowEvery=1;renderer.shadowMap.enabled=false;sun.castShadow=false;}
 else{renderer.shadowMap.enabled=true;sun.castShadow=true;
  if(m==='mid'){quality.level=2;quality.dprCap=1;shadowEvery=2;sun.shadow.mapSize.set(512,512);}
  // Touch-Geraete (Handy) starten sparsamer: volle Aufloesung kostet dort am meisten Bildrate (R39)
  else{quality.level=coarseInput?1:0;quality.dprCap=coarseInput?1:1.25;shadowEvery=coarseInput?2:1;sun.shadow.mapSize.set(coarseInput?512:768,coarseInput?512:768);
   // R44: gelernte Stufe aus frueheren Rennen gleich anwenden - Herunterregeln mitten im Rennen (v. a. Schatten aus)
   // zwingt jeden Shader zum Neukompilieren und ruckelte die ganze erste Runde lang
   const learned=Math.min(2,store.get('gfxAuto',0));if(learned>quality.level){quality.level=learned;quality.dprCap=learned>=2?.9:1;sun.shadow.mapSize.set(512,512);if(learned>=2)shadowEvery=2;}}
  if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}
 renderer.shadowMap.autoUpdate=shadowEvery<=1&&!coarseInput;
 scene.traverse(o=>{if(o.isMesh)for(const mm of [].concat(o.material))if(mm)mm.needsUpdate=true;});
 renderer.setPixelRatio(Math.min(devicePixelRatio,quality.dprCap));resize();}
function animateWorld(dt,now){wxTick(dt,now);updateLoisl(dt);updateDizzy(now);updateRival();if(stormFx.length)updateStorm(dt);
 // Energiewaende der Anti-Grav-Zonen atmen leicht - macht das Magnetfeld lebendig
 for(let i=0;i<agravWalls.length;i++)agravWalls[i].opacity=.24+.08*Math.sin(now*.0022+i*1.3);
 for(let i=0;i<agravGates.length;i++)agravGates[i].scale.setScalar(1+.04*Math.sin(now*.0025+i*1.1));
 if(UG_MAT)UG_MAT.opacity=.45+.15*Math.sin(now*.004);
 // Magnetboegen (R38): Lauflicht in Fahrtrichtung wie bei einer echten Abschussbahn, beim
 // Durchfahren blitzt der Bogen hell auf (flash, klingt ab)
 if(coasterGlow){const g=coasterGlow;for(let i=0;i<g.list.length;i++){const t=g.list[i],c=t.c;c.flash[t.i]*=Math.exp(-dt*3.2);
   const ch=Math.pow(.5+.5*Math.sin(now*.009-t.i*1.15),4),b=.28+.55*ch+2.2*c.flash[t.i];
   g.mesh.setColorAt(i,_col.copy(g.col).multiplyScalar(b));}
  if(g.mesh.instanceColor)g.mesh.instanceColor.needsUpdate=true;}
 if(ferris)updateFerris(dt,now);
 if(deco)updateDeco(dt,now);
 tailTick();
 if(dragon)updateDragon(dt);
 if(elemFx)updateElems(dt,now);
 // Energie-Kristalle: langsame Eigendrehung und Schwebe-Bob
 for(let i=0;i<crystals.length;i++){const c=crystals[i];c.m.rotation.y+=dt*.6;c.m.position.y=c.base+Math.sin(now*.0012+c.ph)*.5;}
 if(!dbg.noBoxes&&boxInst.length&&boxQ){const qa=boxQ.geometry.attributes.position.array;_e.set(0,now*.001,0);_q.setFromEuler(_e);boxes.forEach((b,i)=>{b.cooldown=Math.max(0,b.cooldown-dt);const vis=b.cooldown<=0,y=b.baseY+Math.sin(now*.003+b.distance)*.2;
   // R67: nach dem Einsammeln federnd wieder aufploppen statt schlagartig da zu sein
   if(!vis)b.hid=true;else if(b.hid){b.hid=false;b.popT=now;}const pt=b.popT?(now-b.popT)/380:1,pk=pt>=1?1:1+2.7*Math.pow(pt-1,3)+1.7*Math.pow(pt-1,2);_m.compose(_v.set(b.x,y,b.z),_q,_s.setScalar(vis?1.05*Math.max(0,pk):0));for(const im of boxInst)im.setMatrixAt(i,_m);qa[i*3]=b.x;qa[i*3+1]=vis?y+1.3:-999;qa[i*3+2]=b.z;});for(const im of boxInst)im.instanceMatrix.needsUpdate=true;boxQ.geometry.attributes.position.needsUpdate=true;boxQ.visible=false;}
 {let dirty=false;for(let i=0;i<SPARKS;i++){const s=sparkPool[i];if(s.life<=0)continue;s.life-=dt;s.vy-=dt*8;s.x+=s.vx*dt;s.y+=s.vy*dt;s.z+=s.vz*dt;if(s.life>0){const k=s.life*2;_m.makeScale(k,k,k).setPosition(s.x,s.y,s.z);sparkMesh.setMatrixAt(i,_m);}else sparkMesh.setMatrixAt(i,_zeroM);dirty=true;}if(dirty)sparkMesh.instanceMatrix.needsUpdate=true;
 {let dirty=false;for(let i=0;i<CONFETTI;i++){const c=confettiPool[i];if(c.life<=0)continue;c.life-=dt;c.ph+=c.rv*dt;c.x+=Math.sin(c.ph*.6)*c.sw*dt;c.y+=c.vy*dt;if(c.life>0){_e.set(c.ph*.4,c.ph,0);_q.setFromEuler(_e);_m.compose(_v.set(c.x,c.y,c.z),_q,_s.set(1,1,1));confettiMesh.setMatrixAt(i,_m);}else confettiMesh.setMatrixAt(i,_zeroM);dirty=true;}if(dirty)confettiMesh.instanceMatrix.needsUpdate=true;}
  dirty=false;for(let i=0;i<PUFFS;i++){const p=puffPool[i];if(p.life<=0)continue;p.life-=dt;p.vy+=dt*1.1;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;if(p.life>0){const k=(1+(.75-p.life)*1.8)*Math.min(1,p.life*3);_m.makeScale(k,k,k).setPosition(p.x,p.y,p.z);puffMesh.setMatrixAt(i,_m);}else puffMesh.setMatrixAt(i,_zeroM);dirty=true;}if(dirty)puffMesh.instanceMatrix.needsUpdate=true;
  dirty=false;for(let i=0;i<SKIDS;i++){const s=skids[i];if(s.life<=0)continue;s.life-=dt;if(s.life<2.5){setSkid(i,s);dirty=true;}}if(dirty)skidMesh.instanceMatrix.needsUpdate=true;}
 if(!dbg.noFlags&&frame%2===0)for(const f of flags){const pos=f.mesh.geometry.attributes.position,q=pos.array;for(let v=0;v<pos.count;v++){const xn=f.xn[v],w=Math.sin(now*.006+xn*4+v*.02)*(f.amp||.11)*xn;q[v*3]=f.base[v*3]+f.dx[v]*w;q[v*3+2]=f.base[v*3+2]+f.dz[v]*w;}pos.needsUpdate=true;}
 for(const b of balloons){b.g.position.y=b.base+Math.sin(now*.00045+b.ph)*2.4;b.g.rotation.y=now*.00008+b.ph;}
 if(bats&&zones.length){const z=zones[0];for(let i=0;i<bats.count;i++){const a=now*.0005*(1+(i%3)*.25)+i*1.7,rr=10+(i%5)*4;_e.set(0,-a,0);_q.setFromEuler(_e);_m.compose(_v.set(z.x+Math.cos(a)*rr,24+Math.sin(now*.001+i)*4+(i%4)*2.5,z.z+Math.sin(a)*rr),_q,_s.set(1,Math.sin(now*.03+i*2),1));bats.setMatrixAt(i,_m);}bats.instanceMatrix.needsUpdate=true;}
 if(foamRing)foamRing.material.opacity=.16+Math.sin(now*.0012)*.09;
 for(let i=hazards.length-1;i>=0;i--){const h=hazards[i];h.life-=dt;h.arm=Math.max(0,h.arm-dt);if(h.fake&&h.box){h.box.rotation.y=now*.001;h.box.position.y=1.6+Math.sin(now*.003+h.x)*.2;}if(h.life<=0){actors.remove(h.mesh);hazards.splice(i,1);}}
 for(const pad of pads){pad.squash=Math.max(0,pad.squash-dt*1.6);const k=pad.squash>0?Math.sin(pad.squash*14)*pad.squash:0;pad.mesh.scale.set(1+k*.4,1-k,1+k*.4);}
 for(const ring of rings){ring.flash=Math.max(0,ring.flash-dt);if(!ring.flash)ring.precision=false;if(!ring.ag)ring.mesh.rotation.z=now*.00032;ring.mesh.scale.setScalar(1+ring.flash*(ring.ag?.6:.24));
  for(const m of ring.glow||[ring.mesh.material]){m.emissiveIntensity=(ring.ag?.9:.55)+ring.flash*2.5;if(!ring.ag&&!ring.fly)m.emissive.setHex(ring.precision?0xffc867:0x42d8be);}}
 if(boostTex)boostTex.offset.y=-(now*.0022)%1;
 if(rainbowTex)rainbowTex.offset.y=(now*.00008)%1;
 if(state==='menu')updateSwingersMenu(now);
 {const p=racers[0],want=p&&tunnels.length&&inTunnel(p.distance)?1:0;
  if(want||tunnelMix>.002){tunnelMix+=(want-tunnelMix)*Math.min(1,dt*4.5);renderer.toneMappingExposure=(wxExp??theme.exposure)*(1-.26*tunnelMix);
   headlight.intensity=Math.max(wxHead??(theme.head!==undefined?theme.head:(theme.stars?90:0)),tunnelMix*130);if(echoSend)echoSend.gain.value=tunnelMix*.5;}}
 if(!dbg.noSpores)updateSpores(dt,now);if(!dbg.noCrowd&&frame%2===0)updateCrowd(now);
 if(noticeTimer>0){noticeTimer-=dt;if(noticeTimer<=0&&state!=='countdown')setText('message','');}
 if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('toast').className='';}}
function updateSwingersMenu(now){updateSwingers(now*.001);updateHazards(.016,now*.001,false);updateTrain(.016,now*.001);updateDesert(.016,now*.001);updateCharacter(.016,now*.001,false);updateR60(.016,now*.001,false);updateChoco(.016,now*.001,false);updateVoxel(.016,now*.001,false);updateDomePix(.016,now*.001,false);updateBayIce(.016,now*.001,false);}
// ?fps in der Adresse: Bildrate, Modus, Aufloesungsfaktor und Draw-Calls oben links (zum Testen auf dem Handy)
const fpsEl=new URLSearchParams(location.search).has('fps')?Object.assign(document.body.appendChild(document.createElement('div')),{id:'fpsMeter'}):null;let fpsN=0,fpsT=0;
function loop(now){requestAnimationFrame(loop);if(dbg.manual)return;padPoll(now);if(net)netTick(now);chatBubbleTick();const dt=Math.min((now-last)/1000||.016,.05);last=now;
 if(finishMusicAt&&now>finishMusicAt){finishMusicAt=0;if(state==='finished'||state==='ceremony')playBgm('menu');}
 if(fpsEl){fpsN++;if(now-fpsT>500){fpsEl.textContent=`${Math.round(fpsN*1000/(now-fpsT))} fps · ${LITE?'Leicht':'Voll'} · ${renderer.getPixelRatio().toFixed(2)}x · ${renderer.info.render.calls} DC`;fpsN=0;fpsT=now;}}
 quality.fpsFrames++;if(state==='race'){quality.raceFrames=(quality.raceFrames||0)+1;quality.raceSec=(quality.raceSec||0)+dt;}if(quality.fpsStart&&now-quality.fpsStart>1200){adaptQuality(quality.fpsFrames*1000/(now-quality.fpsStart));quality.fpsFrames=0;quality.fpsStart=now;}else if(!quality.fpsStart)quality.fpsStart=now;
 frameStep(dt,now);}
const prof={upd:0,anim:0,hud:0,ren:0,n:0};
function frameStep(dt,now){if(dbg.freeze)return;frame++;
 if(shadowEvery>1&&renderer.shadowMap.enabled){renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=frame%shadowEvery===0;}
 if(revealQueue){const n=Math.max(10,Math.ceil(revealQueue.length/8));for(let i=0;i<n&&revealQueue.length;i++)revealQueue.shift().visible=true;if(!revealQueue.length)revealQueue=null;}shaderTime.value=now/1000;beatPulse.value=(state==='race'||state==='countdown')&&theme.glow?1-beatPhase(elapsed):0;starTick(racers[0]);{const p=racers[0];driftTick(p&&p.driftDir&&!p.air&&!autopilot?({mini:1,super:2,ultra:3}[miniTurbo(p.drift)?.[2]]||0):-1);}draftTick(state==='race'?(racers[0]?.draftState?.charge||0):0);duckBgm(now);
 const p0=performance.now();if(state!=='paused'){update(dt);const p1=performance.now();prof.upd+=p1-p0;animateWorld(dt,now);updateCamera(dt);prof.anim+=performance.now()-p1;}
 if(frame%3===0){hud();if(state==='race'||state==='countdown')drawMap();}
 if(racers[0]&&headlight.intensity>0){const p=racers[0];headlight.position.set(p.x+Math.sin(p.h)*5,(p.y||0)+3.2,p.z+Math.cos(p.h)*5);}
 if(racers[0]){sun.target.position.set(racers[0].x,0,racers[0].z);sun.position.set(racers[0].x+theme.sunPos[0]*.8,theme.sunPos[1]*.8,racers[0].z+theme.sunPos[2]*.8);}
 if(!renderer.shadowMap.autoUpdate)renderer.shadowMap.needsUpdate=frame%2===0;const p2=performance.now();crtRender();renderMirror(dt);if(photoPending)takeRidePhoto();prof.ren+=performance.now()-p2;prof.n++;}
// ---------------------------------------------------------------- R61 CRT-Modus (optional, Nutzerwunsch)
// Szene in ein HDR-Zwischenbild, dann ein Vollbild-Shader: Roehrenwoelbung, Farbsaeume, leichtes Leuchten, ~270 Scanlines,
// Streifenmaske, Vignette und ein Hauch Flimmern; Tonemapping und sRGB wie sonst am Bildschirm. HUD bekommt per CSS feine Zeilen.
let crtOn=store.get('crt',false),crt=null;const _crtV=new T.Vector2();
function crtInit(){if(crt)return crt;const rt=new T.WebGLRenderTarget(4,4,{type:T.HalfFloatType});
 const u={tD:{value:rt.texture},res:{value:new T.Vector2(1,1)},time:{value:0}};
 const m=new T.ShaderMaterial({uniforms:u,depthTest:false,depthWrite:false,toneMapped:true,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`uniform sampler2D tD;uniform vec2 res;uniform float time;varying vec2 vUv;
   vec2 bend(vec2 uv){uv=uv*2.-1.;vec2 o=abs(uv.yx)/vec2(5.2,4.2);uv+=uv*o*o;return uv*.5+.5;}
   void main(){vec2 uv=bend(vUv);if(uv.x<0.||uv.x>1.||uv.y<0.||uv.y>1.){gl_FragColor=vec4(0.,0.,0.,1.);return;}
    float ca=.0018+.0022*length(uv-.5);vec3 c=vec3(texture2D(tD,uv+vec2(ca,0.)).r,texture2D(tD,uv).g,texture2D(tD,uv-vec2(ca,0.)).b);
    vec2 px=1.6/res;vec3 g=(texture2D(tD,uv+vec2(px.x,0.)).rgb+texture2D(tD,uv-vec2(px.x,0.)).rgb+texture2D(tD,uv+vec2(0.,px.y)).rgb+texture2D(tD,uv-vec2(0.,px.y)).rgb)*.25;
    c=mix(c,max(c,g),.4);
    float sl=.5+.5*cos(uv.y*270.*6.2831853);c*=.7+.3*sl;
    float mk=mod(gl_FragCoord.x,3.);c*=vec3(mk<1.?1.:.8,(mk>=1.&&mk<2.)?1.:.8,mk>=2.?1.:.8)*1.22;
    vec2 v=uv*(1.-uv.yx);c*=pow(clamp(v.x*v.y*18.,0.,1.),.28);
    c*=.975+.025*sin(time*57.);
    gl_FragColor=vec4(c,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`});
 const sc=new T.Scene(),q=new T.Mesh(new T.PlaneGeometry(2,2),m);q.frustumCulled=false;sc.add(q);
 crt={rt,u,scene:sc,cam:new T.OrthographicCamera(-1,1,1,-1,0,1)};return crt;}
// R70: 16-BIT-Modus - Szene in Konsolen-Aufloesung (224 Zeilen) rendern, dann auf 15-Bit-Farben (5 Bit je Kanal) mit
// 4x4-Bayer-Raster bringen und pixelig hochskalieren; mit CRT kombinierbar (dann linear in den CRT-Puffer), dazu gedaempfter Klang mit Hall
let bitOn=store.get('bit16',false),bit=null;
function bitInit(){if(bit)return bit;const rt=new T.WebGLRenderTarget(4,4,{type:T.HalfFloatType,minFilter:T.NearestFilter,magFilter:T.NearestFilter});
 const u={tD:{value:rt.texture},low:{value:new T.Vector2(4,4)},fin:{value:1}};
 const m=new T.ShaderMaterial({uniforms:u,depthTest:false,depthWrite:false,toneMapped:true,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`uniform sampler2D tD;uniform vec2 low;uniform float fin;varying vec2 vUv;
   float b2(vec2 p){return mod(2.*p.x+3.*p.y,4.);}
   float b4(vec2 p){p=floor(mod(p,4.));return 4.*b2(mod(p,2.))+b2(floor(p/2.));}
   vec3 toS(vec3 c){return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c));}
   vec3 toL(vec3 c){return mix(c/12.92,pow((c+.055)/1.055,vec3(2.4)),step(.04045,c));}
   void main(){vec3 c=texture2D(tD,vUv).rgb;gl_FragColor=vec4(c,1.);
    #include <tonemapping_fragment>
    vec3 s=toS(clamp(gl_FragColor.rgb,0.,1.));s=s*1.06-.02;
    float d=(b4(floor(vUv*low))+.5)/16.-.5;s=clamp(floor(s*31.+.5+d*.9)/31.,0.,1.);
    gl_FragColor=vec4(fin>.5?s:toL(s),1.);}`});
 const sc=new T.Scene(),q=new T.Mesh(new T.PlaneGeometry(2,2),m);q.frustumCulled=false;sc.add(q);
 bit={rt,u,scene:sc,cam:new T.OrthographicCamera(-1,1,1,-1,0,1)};return bit;}
function bitRender(){const b=bitInit();renderer.getDrawingBufferSize(_crtV);const asp=_crtV.x/Math.max(1,_crtV.y);
 let lw,lh;if(asp>=1){lh=224;lw=Math.round(224*asp);}else{lw=256;lh=Math.round(256/asp);}
 if(b.rt.width!==lw||b.rt.height!==lh)b.rt.setSize(lw,lh);b.u.low.value.set(lw,lh);
 renderer.setRenderTarget(b.rt);renderer.render(scene,camera);
 if(crtOn){const c=crtInit();if(c.rt.width!==_crtV.x||c.rt.height!==_crtV.y)c.rt.setSize(_crtV.x,_crtV.y);b.u.fin.value=0;renderer.setRenderTarget(c.rt);renderer.render(b.scene,b.cam);renderer.setRenderTarget(null);
  c.u.res.value.copy(_crtV);c.u.time.value=performance.now()/1000;renderer.render(c.scene,c.cam);}
 else{b.u.fin.value=1;renderer.setRenderTarget(null);renderer.render(b.scene,b.cam);}}
let bitFx=null;
function bitAudio(){if(!ctx||!masterGain)return;try{masterGain.disconnect();}catch{}
 if(!bitOn){masterGain.connect(ctx.destination);return;}
 if(!bitFx){const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=6800;lp.Q.value=.4;const dl=ctx.createDelay(.5);dl.delayTime.value=.16;const fb=ctx.createGain();fb.gain.value=.28;const wet=ctx.createGain();wet.gain.value=.22;
  lp.connect(ctx.destination);lp.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wet);wet.connect(ctx.destination);bitFx=lp;}
 masterGain.connect(bitFx);}
function bitSet(on){bitOn=!!on;store.set('bit16',bitOn);document.body.classList.toggle('bit16',bitOn);bitAudio();
 for(const [id,txt] of [['bitBtn',null],['pauseBit','16-BIT-Modus: ']]){const b=$(id);if(!b)continue;b.setAttribute('aria-pressed',String(bitOn));b.classList.toggle('selected',bitOn);if(txt)b.textContent=txt+(bitOn?'AN':'AUS');}}
function crtRender(){if(bitOn){bitRender();return;}if(!crtOn){renderer.render(scene,camera);return;}const c=crtInit();renderer.getDrawingBufferSize(_crtV);
 if(c.rt.width!==_crtV.x||c.rt.height!==_crtV.y)c.rt.setSize(_crtV.x,_crtV.y);
 renderer.setRenderTarget(c.rt);renderer.render(scene,camera);renderer.setRenderTarget(null);c.u.res.value.copy(_crtV);c.u.time.value=performance.now()/1000;renderer.render(c.scene,c.cam);}
function crtSet(on){crtOn=!!on;store.set('crt',crtOn);document.body.classList.toggle('crt',crtOn);
 for(const [id,txt] of [['crtBtn',null],['pauseCrt','Röhren-Look (CRT): ']]){const b=$(id);if(!b)continue;b.setAttribute('aria-pressed',String(crtOn));b.classList.toggle('selected',crtOn);if(txt)b.textContent=txt+(crtOn?'AN':'AUS');}}
{const b=$('bitBtn');if(b)b.onclick=()=>{bitSet(!bitOn);toast(bitOn?'🎮 16-BIT-Modus an':'16-BIT-Modus aus',1.1);SFX.select();};const pb=$('pauseBit');if(pb)pb.onclick=()=>bitSet(!bitOn);bitSet(bitOn);}
{const b=$('crtBtn');if(b)b.onclick=()=>{crtSet(!crtOn);toast(crtOn?'📺 Röhren-Look an':'Röhren-Look aus',1.1);};const pb=$('pauseCrt');if(pb)pb.onclick=()=>crtSet(!crtOn);crtSet(crtOn);}
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}addEventListener('resize',resize);
addEventListener('error',e=>{try{const el=$('error');el.hidden=false;el.textContent='Darsteller abgestürzt — bitte neu laden. ('+e.message+')';console.error(e.error||e.message);}catch{}});

// ---------------------------------------------------------------- Menue, Eingabe, Vollbild
function syncTrackButtons(){$('tracks').querySelectorAll('button').forEach((x,j)=>{x.classList.toggle('selected',selected===j);x.setAttribute('aria-pressed',String(selected===j));});}
// Fahrerfiguren als kleine Renderbilder in der Auswahl (statt Emoji)
let thumbRT=null;
function driverThumbs(){ensureR60Protos();const btns=[...document.querySelectorAll('#drivers button')];if(!btns.length||!P.driver)return;
 const S=176;if(!thumbRT)thumbRT=new T.WebGLRenderTarget(S,S);thumbRT.texture.colorSpace=T.SRGBColorSpace;
 const sc=new T.Scene(),cam=new T.PerspectiveCamera(32,1,.4,24);cam.position.set(.5,1.45,3.0);cam.lookAt(0,.66,0);
 sc.add(new T.HemisphereLight(0xffffff,0x5a6472,2.4));const dl=new T.DirectionalLight(0xfff2dc,2.6);dl.position.set(2.5,4,3);sc.add(dl);
 const dl2=new T.DirectionalLight(0x9fc7ff,.9);dl2.position.set(-3,2,-2);sc.add(dl2);
 const buf=new Uint8Array(S*S*4),oldC=new T.Color();renderer.getClearColor(oldC);const oldA=renderer.getClearAlpha();renderer.setClearColor(0x000000,0);
 btns.forEach((b,i)=>{const proto=P[(DRIVERS[i]||DRIVERS[0]).k];if(!proto)return;
  const g=cloneProto(proto);applyTint(g,'CapPaint',KART_COLORS[colorIndex].c);g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});
  for(const c of g.children.slice())if(c.isGroup&&!c.isMesh)g.remove(c);   // Heckteile gehoeren ans Kart, nicht in die Figurvorschau
  g.rotation.y=-.42;sc.add(g);
  renderer.setRenderTarget(thumbRT);renderer.clear();renderer.render(sc,cam);renderer.setRenderTarget(null);
  renderer.readRenderTargetPixels(thumbRT,0,0,S,S,buf);sc.remove(g);
  let cv=b.querySelector('canvas');if(!cv){cv=document.createElement('canvas');cv.width=cv.height=S;b.textContent='';b.append(cv);}
  const q=cv.getContext('2d'),img=q.createImageData(S,S);
  for(let y=0;y<S;y++)img.data.set(buf.subarray((S-1-y)*S*4,(S-y)*S*4),y*S*4);
  q.putImageData(img,0,0);});
 renderer.setClearColor(oldC,oldA);}
// Item-Vorschau: die echten Modelle einmal in kleine Bilder rendern (Blitz und Stern als Extrusion)
const itemThumbs={};
function boltShape(){const s=new T.Shape();s.moveTo(.18,1);s.lineTo(-.55,.02);s.lineTo(-.05,.02);s.lineTo(-.22,-1);s.lineTo(.55,.06);s.lineTo(.05,.06);s.lineTo(.18,1);return s;}
function starShape(){const s=new T.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?.44:1;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?s.lineTo(x,y):s.moveTo(x,y);}s.closePath();return s;}
function itemModel(key){const ex={depth:.32,bevelEnabled:true,bevelSize:.06,bevelThickness:.06,bevelSegments:2};
 if(key==='cannon')return cannonBall(.55);if(key==='blue')return blueBrezn();
 if(key==='green3'||key==='red3'){const g=new T.Group();[0,1,2].forEach(i=>{const m=voxObj(key==='red3'?'brezn_red':'brezn_green');const a=i*TAU/3+Math.PI/2;m.position.set(Math.cos(a)*.9,Math.sin(a)*.9,0);g.add(m);});return g;}
 if(key==='fake')return voxObj('qfake');
 if(key==='spiky')return voxObj('spiky');
 if(key==='coins'){if(!P.coin)return null;const g=new T.Group();[[-.55,0,0],[.55,.1,.2],[0,.65,-.1]].forEach(([x,y,z],i)=>{const c=cloneProto(P.coin);c.position.set(x,y,z);c.rotation.y=i*.6;g.add(c);});return g;}
 if(key==='banana')return P.banana?cloneProto(P.banana):null;
 if(key==='shell')return P.shell?cloneProto(P.shell):null;
 if(key==='empty')return voxObj('qreal');
 if(key==='bomb')return bombMesh();
 if(key==='storm')return stormCloud(true);
 // R45: Riesenpilz = roter Streckenpilz, Tintenpilz = Tintling aus Blender
 if(key==='mega'){if(!P.mushroom)return null;const g=cloneProto(P.mushroom);applyTint(g,'CapPaint',0xe8352e);return g;}
 if(key==='ink')return P.inkcap?cloneProto(P.inkcap):null;
 if(key==='shield'){const g=new T.Group();g.add(new T.Mesh(new T.ExtrudeGeometry(starShape(),ex),stdMat({color:0xffe9fb,emissive:0xff9ee0,emissiveIntensity:.55,roughness:.35,metalness:.2})));return g;}
 if(key==='triple'){const g=new T.Group();[-0.62,0,0.62].forEach((x,i)=>{const m=new T.Mesh(new T.ExtrudeGeometry(boltShape(),ex),stdMat({color:i===1?0xfff0ad:0xffd45c,emissive:0xffa51f,emissiveIntensity:.7,roughness:.3,metalness:.25}));m.position.set(x,0,i===1?.15:0);m.scale.setScalar(i===1?.85:.62);g.add(m);});return g;}
 const g=new T.Group();g.add(new T.Mesh(new T.ExtrudeGeometry(boltShape(),ex),stdMat({color:0xffe27a,emissive:0xffa51f,emissiveIntensity:.8,roughness:.3,metalness:.25})));return g;}
function buildItemThumbs(){if(!renderer||itemThumbs.done)return;
 const S=176,rt=new T.WebGLRenderTarget(S,S);rt.texture.colorSpace=T.SRGBColorSpace;
 const sc=new T.Scene(),cam=new T.PerspectiveCamera(30,1,.1,40);cam.position.set(1.5,1.7,3.6);cam.lookAt(0,0,0);
 sc.add(new T.HemisphereLight(0xffffff,0x5a6472,2.3));
 const dl=new T.DirectionalLight(0xfff2dc,2.8);dl.position.set(2.5,4,3);sc.add(dl);
 const dl2=new T.DirectionalLight(0x9fc7ff,1.1);dl2.position.set(-3,1.5,-2);sc.add(dl2);
 const buf=new Uint8Array(S*S*4),oldC=new T.Color();renderer.getClearColor(oldC);const oldA=renderer.getClearAlpha();renderer.setClearColor(0x000000,0);
 const box=new T.Box3(),size=new T.Vector3(),mid=new T.Vector3();
 for(const key of ['empty','boost','triple','shell','banana','shield','bomb','storm','mega','ink','cannon','blue','green3','red3','fake','spiky','coins']){
  if(itemThumbs[key])continue;
  let g;try{g=itemModel(key);}catch(e){continue;}
  if(!g)continue;
  g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});
  box.setFromObject(g);box.getSize(size);box.getCenter(mid);
  const k=(key==='ink'?2.45:2.0)/Math.max(size.x,size.y,size.z,.001);
  g.scale.setScalar(k);g.position.set(-mid.x*k,-mid.y*k,-mid.z*k);
  g.rotation.y=key==='banana'?-.9:key==='shell'?.4:key==='ink'?-.35:.35;g.rotation.x=key==='shell'||key==='banana'?.25:.12;
  sc.add(g);renderer.setRenderTarget(rt);renderer.clear();renderer.render(sc,cam);renderer.setRenderTarget(null);
  renderer.readRenderTargetPixels(rt,0,0,S,S,buf);sc.remove(g);
  const cv=document.createElement('canvas');cv.width=cv.height=S;const q=cv.getContext('2d'),img=q.createImageData(S,S);
  for(let y=0;y<S;y++)img.data.set(buf.subarray((S-1-y)*S*4,(S-y)*S*4),y*S*4);
  q.putImageData(img,0,0);itemThumbs[key]=cv.toDataURL('image/png');}
 renderer.setClearColor(oldC,oldA);rt.dispose();
 itemThumbs.done=['empty','boost','triple','shell','banana','shield','bomb','storm','mega','ink'].every(k=>itemThumbs[k]);}
function openAchievements(){const pr=store.get('prog',{xp:0,ach:[]}),lv=levelOf(pr.xp||0),got=new Set(pr.ach||[]);
 setText('achLevel',`Fahrerstufe ${lv.level}`);$('achBar').innerHTML=`<i style="width:${Math.round(lv.into/lv.need*100)}%"></i><span>${lv.into} / ${lv.need} XP</span>`;
 $('achCount').textContent=`${got.size} / ${ACH.length} Erfolge`;
 $('achList').innerHTML=ACH.map(a=>`<div class="ach ${got.has(a.id)?'on':''}"><i>${got.has(a.id)?'🏅':'🔒'}</i><b>${a.n}</b><small>${a.d}</small></div>`).join('')+
  `<div class="ach-colors">${KART_COLORS.filter(k=>k.lvl).map(k=>`<span class="${lv.level>=k.lvl?'on':''}" style="--c:#${k.c.toString(16).padStart(6,'0')}">${lv.level>=k.lvl?'':'🔒 '}${k.n.split(' /')[0]} · Stufe ${k.lvl}</span>`).join('')}</div>`;
 $('achPanel').hidden=false;}
function refreshMirror(){const b=$('mirrorBtn');if(!b)return;const lock=progLevel()<MIRROR_LVL;b.classList.toggle('locked',lock);b.classList.toggle('selected',mirrorOn&&!lock);b.setAttribute('aria-pressed',String(mirrorOn&&!lock));b.title=lock?`Spiegel-Modus ab Fahrerstufe ${MIRROR_LVL}`:'Spiegel-Modus: Strecken seitenverkehrt';}
function refreshMenu(){refreshMirror();quickRefresh();const goldOk=store.get('gold',false),lv=progLevel();$('colors').querySelectorAll('button').forEach((b,i)=>{const k=KART_COLORS[i],locked=!!(k.gold&&!goldOk)||!!(k.lvl&&lv<k.lvl)||!!(k.onl&&onlRaces()<k.onl)||!!(k.cheat&&!store.get('cheat',false));b.classList.toggle('locked',locked);b.classList.toggle('onl',!!k.onl);b.title=locked?(k.cheat?'??? – ein gewisser Code …':k.onl?`🌐 Nach ${k.onl} Online-Rennen`:k.lvl?`Ab Fahrerstufe ${k.lvl}`:'Gewinne einen Grand Prix ab Klasse Flott'):k.n;});setText('achBtnLvl','Stufe '+lv);
 const troL=CUPS.map(c=>{const t=store.get(trophyKey(c.id,cc),9);return t<=3?c.icon+trophyIcon(t):'';}).filter(Boolean),tro=troL.length?`Pokale ${ccName(cc)}: ${troL.join(' ')}`:'';const medals=courses.map((_,i)=>store.get(`medal-${i}`,3)),mc=[0,1,2].map(k=>medals.filter(x=>x===k).length);setText('trophies',[tro,mc.some(Boolean)?`🥇${mc[0]} 🥈${mc[1]} 🥉${mc[2]}`:''].filter(Boolean).join('   '));$('classes').classList.toggle('locked',mode==='tt'||mode==='online');
 document.querySelectorAll('#classes .cls').forEach(b=>{const on=Number(b.dataset.cc)===cc;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});$('tracks').classList.toggle('locked',isOW(mode)||mode==='online');syncCups();
 // Medaille je Strecke auf die Karte
 $('tracks').querySelectorAll('.track').forEach((b,i)=>{const m=medals[i];b.dataset.medal=String(m);const em=b.querySelector('.medal');if(em)em.textContent=m<3?['\ud83e\udd47','\ud83e\udd48','\ud83e\udd49'][m]:'';});
 refreshBest();refreshDaily();}
KART_COLORS.forEach((k,i)=>{const b=document.createElement('button');b.className='swatch'+(i===0?' selected':'')+(k.gold?' gold':'');b.style.setProperty('--swatch','#'+k.c.toString(16).padStart(6,'0'));b.setAttribute('aria-label',k.n);b.setAttribute('aria-pressed',String(i===0));
 b.onclick=()=>{if(k.gold&&!store.get('gold',false)){toast('🔒 Gewinne einen Grand Prix ab Klasse Flott',2,'bad');return;}if(k.lvl&&progLevel()<k.lvl){toast(`🔒 Ab Fahrerstufe ${k.lvl}`,2,'bad');return;}colorIndex=i;$('colors').querySelectorAll('button').forEach((x,j)=>{x.classList.toggle('selected',i===j);x.setAttribute('aria-pressed',String(i===j));});try{driverThumbs();}catch(e){}buildCourse();};$('colors').append(b);});
// Mini-Streckenplan fuer die Auswahlkarten: dieselbe Mittellinie wie im Spiel, nur flach gezeichnet
function trackThumb(cv,c){const q=cv.getContext('2d'),W=cv.width,H=cv.height,th=THEMES[c.theme];
 const cur=new T.CatmullRomCurve3(c.points.map(([x,z])=>new T.Vector3(x,0,z)),true,'catmullrom',.38),p=cur.getSpacedPoints(220);
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const v of p){x0=Math.min(x0,v.x);x1=Math.max(x1,v.x);z0=Math.min(z0,v.z);z1=Math.max(z1,v.z);}
 const pad=13,k=Math.min((W-pad*2)/(x1-x0||1),(H-pad*2)/(z1-z0||1)),ox=(W-(x1-x0)*k)/2-x0*k,oz=(H-(z1-z0)*k)/2-z0*k;
 q.clearRect(0,0,W,H);q.lineJoin=q.lineCap='round';
 const path=()=>{q.beginPath();p.forEach((v,i)=>{const X=v.x*k+ox,Y=v.z*k+oz;i?q.lineTo(X,Y):q.moveTo(X,Y);});q.closePath();};
 path();q.strokeStyle='#00000059';q.lineWidth=11;q.stroke();
 path();q.strokeStyle=hex(th.edge);q.lineWidth=6.5;q.globalAlpha=.85;q.stroke();q.globalAlpha=1;
 path();q.strokeStyle=th.line;q.lineWidth=1.4;q.setLineDash([4,6]);q.stroke();q.setLineDash([]);
 const s=p[0];q.fillStyle=th.curbA;q.beginPath();q.arc(s.x*k+ox,s.z*k+oz,4.2,0,7);q.fill();
 q.strokeStyle='#ffffffcc';q.lineWidth=1.6;q.stroke();}
// Tages-Herausforderung (R46): Karte ueber dem Startknopf - antippen waehlt Strecke, Klasse und Modus
let dailyShown=null;const dailyBtn=document.createElement('button');dailyBtn.id='daily';dailyBtn.type='button';$('start').before(dailyBtn);
function refreshDaily(){const ch=dailyChallenge(dayKey()),done=store.get('dailyDone','')===ch.day,key=ch.day+done;if(dailyShown===key)return;dailyShown=key;
 dailyBtn.classList.toggle('done',done);dailyBtn.innerHTML=`<i>📅</i><span><small>TAGESAUFGABE${done?' · GESCHAFFT':''}</small><b>${ch.text}</b><em>${courses[ch.track].name} · ${ccName(ch.cc)}${done?' · morgen gibt es eine neue':` · +${DAILY_XP} XP`}</em></span>${done?'<u>✓</u>':'<u>▶</u>'}`;}
dailyBtn.onclick=()=>{const ch=dailyChallenge(dayKey());if(mode!=='single')document.querySelector('#modes [data-mode="single"]').click();document.querySelector(`#classes [data-cc="${ch.cc}"]`)?.click();$('tracks').children[ch.track]?.click();toast('📅 Aufgabe gewählt – los geht\'s!',1.4,'good');};
courses.forEach((c,i)=>{const b=document.createElement('button'),th=THEMES[c.theme];b.className='track'+(i===0?' selected':'');
 const wide=courses.length%2===1&&i===courses.length-1;   // letzte Karte einer ungeraden Anzahl geht ueber die ganze Breite
 b.innerHTML=`<canvas width="${wide?520:240}" height="${wide?150:126}"></canvas><i>${c.icon}</i><em class="medal"></em><b>${c.name}</b><u class="kind">${c.kind}</u><span class="best"></span>`;
 b.style.setProperty('--c1',hex(th.skyBottom));b.style.setProperty('--c2',hex(th.road));b.style.setProperty('--acc',th.curbA);
 b.title=c.kind;b.setAttribute('aria-pressed',String(i===0));b.onclick=()=>{if(mode==='gp'){if(cupOf(i)!==gpCup||!(cupById(gpCup).tracks||[]).length)setCup(cupOf(i),i);else{selected=i;syncTrackButtons();buildCourse();}return;}selected=i;syncTrackButtons();buildCourse();};
 $('tracks').append(b);try{trackThumb(b.querySelector('canvas'),c);}catch(e){}});
$('tracks').classList.toggle('many',courses.length>8);
// R61 Cup-Auswahl (nur im Grand Prix sichtbar): vier Strecken je Cup, der Marathon faehrt alle
const cupBox=document.createElement('div');cupBox.id='cups';cupBox.className='seg';cupBox.setAttribute('role','group');cupBox.setAttribute('aria-label','Cup');cupBox.hidden=true;$('tracks').before(cupBox);
CUPS.forEach(c=>{const b=document.createElement('button');b.type='button';b.className='cup';b.dataset.cup=c.id;b.innerHTML=`<i>${c.icon}</i><b>${c.name}</b><small>${c.tracks?c.tracks.length+' Strecken':'alle Strecken'}</small><em class="cup-tro"></em>`;b.onclick=()=>{setCup(c.id);SFX.tick();};cupBox.append(b);});
function setCup(id,sel){gpCup=cupById(id).id;store.set('cup',gpCup);const list=cupTracks(gpCup,courses.length);const want=sel!==undefined&&list.includes(sel)?sel:list[0];if(mode==='gp'&&want!==undefined&&selected!==want){selected=want;syncTrackButtons();buildCourse();}syncCups();}
function syncCups(){const cupBox=$('cups');if(!cupBox)return;const on=mode==='gp';cupBox.hidden=!on;$('tracks').classList.toggle('gpcups',on);const list=cupTracks(gpCup,courses.length);
 cupBox.querySelectorAll('.cup').forEach(b=>{const sel=b.dataset.cup===gpCup;b.classList.toggle('selected',sel);b.setAttribute('aria-pressed',String(sel));const t=store.get(trophyKey(b.dataset.cup,cc),9);b.querySelector('.cup-tro').textContent=trophyIcon(t);});
 $('tracks').querySelectorAll('.track').forEach((b,i)=>{const k=list.indexOf(i);b.classList.toggle('incup',on&&k>=0);b.classList.toggle('outcup',on&&k<0);if(on&&k>=0&&list.length<=4)b.dataset.cupn=String(k+1);else delete b.dataset.cupn;});}
{const pb=$('owPortal');if(pb)pb.onclick=()=>{if(owPortalAt)owEnterTrack(owPortalAt.ti);};}
{const ab=$('achBtn');if(ab)ab.onclick=()=>{SFX.pickup();openAchievements();};const ac=$('achClose');if(ac)ac.onclick=()=>{$('achPanel').hidden=true;};}
{const box=$('kstyle');if(box)KSTYLES.forEach(([v,n])=>{const b=document.createElement('button');b.type='button';b.textContent=n;b.className=v===kartStyle?'selected':'';b.setAttribute('aria-pressed',String(v===kartStyle));
 b.onclick=()=>{kartStyle=v;store.set('kartStyle',v);box.querySelectorAll('button').forEach(x=>{const on=x===b;x.classList.toggle('selected',on);x.setAttribute('aria-pressed',String(on));});kartPool=null;if(state==='menu'&&racers.length)placeRacers();toast('Karosserie: '+n,1.1);};box.append(b);});}
{const box=$('assist');if(box)[['aus','Aus'],['leicht','Leicht'],['voll','Voll']].forEach(([v,n])=>{const b=document.createElement('button');b.textContent=n;b.className=v===assistMode?'selected':'';b.setAttribute('aria-pressed',String(v===assistMode));b.title={aus:'Du lenkst und bremst selbst - +25 % XP',leicht:'Hilft nur am Fahrbahnrand - +10 % XP',voll:'Lenkt Kurven mit und bremst vor Ecken'}[v];
 b.onclick=()=>{assistMode=v;store.set('assist2',v);box.querySelectorAll('button').forEach((x,j)=>{const on=j===['aus','leicht','voll'].indexOf(v);x.classList.toggle('selected',on);x.setAttribute('aria-pressed',String(on));});toast('Lenkhilfe: '+n+({aus:' · +25 % XP',leicht:' · +10 % XP',voll:''}[v]),1.4);};box.append(b);});}
{const box=$('gfx');if(box)Object.keys(GFX).forEach(k=>{const b=document.createElement('button');b.textContent=GFX[k].n;b.className=k===gfxMode?'selected':'';
 b.setAttribute('aria-pressed',String(k===gfxMode));
 b.onclick=()=>{if(liteFor(k)!==LITE&&!TEST){store.set('gfx',k);toast('Grafik: '+GFX[k].n+' – lädt neu …',1.2);setTimeout(()=>location.reload(),500);return;}gfxMode=k;store.set('gfx',k);box.querySelectorAll('button').forEach((x,j)=>{const on=Object.keys(GFX)[j]===k;x.classList.toggle('selected',on);x.setAttribute('aria-pressed',String(on));});applyGfx();toast('Grafik: '+GFX[k].n,1.1);};
 box.append(b);});}
DRIVERS.forEach((d,i)=>{const b=document.createElement('button');b.className=i===driverIndex?'selected':'';b.innerHTML=d.i;b.title=d.n+' \u00b7 '+d.kart+': '+d.tip;
 b.setAttribute('aria-label','Fahrer: '+d.n);b.setAttribute('aria-pressed',String(i===driverIndex));
 b.onclick=()=>{driverIndex=i;store.set('driver',i);$('drivers').querySelectorAll('button').forEach((x,j)=>{x.classList.toggle('selected',i===j);x.setAttribute('aria-pressed',String(i===j));});toast(d.n+' \u00b7 '+d.kart+' ('+d.tip+')',1.6);buildCourse();};
 $('drivers').append(b);});
// R61 Online ist der Standardmodus (Nutzerwunsch): der Startknopf springt direkt in die oeffentliche Lobby-Welt
function syncModeUi(){document.querySelectorAll('#modes .mode').forEach(x=>{const on=x.dataset.mode===mode;x.classList.toggle('selected',on);x.setAttribute('aria-pressed',String(on));});
 const on=mode==='online',sb=$('start');document.body.classList.toggle('m-online',on);if(sb){sb.dataset.orig??=sb.innerHTML;sb.innerHTML=on?'<b>🌐 Online los!</b><span>→</span>':sb.dataset.orig;}
 if(on){$('tracks').classList.add('locked');$('classes').classList.add('locked');}}
document.querySelectorAll('#modes .mode').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;menuMode=mode;document.querySelectorAll('#modes .mode').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});$('tracks').classList.toggle('locked',isOW(mode));$('classes').classList.toggle('locked',isOW(mode));
 if(isOW(mode)){if(selected!==WORLD_IDX){lastRaceSel=selected;selected=WORLD_IDX;buildCourse();}}else if(selected===WORLD_IDX){selected=lastRaceSel;syncTrackButtons();buildCourse();}
 if(mode==='gp')setCup(gpCup,selected);refreshMenu();syncModeUi();});
document.querySelectorAll('#classes .cls').forEach(b=>b.onclick=()=>{cc=Number(b.dataset.cc);store.set('class',cc);refreshMenu();});
$('mirrorBtn').onclick=()=>{if(progLevel()<MIRROR_LVL){toast(`🔒 Spiegel-Modus ab Fahrerstufe ${MIRROR_LVL}`,2,'bad');return;}mirrorOn=!mirrorOn;store.set('mirror',mirrorOn);refreshMirror();if(mirrorOn)toast('🪞 Spiegel-Modus an',1.4);};
$('start').onclick=()=>{if(mode==='online'){openOnline();$('onQuick')?.click();return;}gp=newGp(mode==='gp');start();};
// R65: einfaches Startmenue (Nutzerwunsch "Menue am Anfang zu abschreckend"): Online, Schnelles Rennen, Fahrer, Tagesaufgabe -
// alles andere hinter "Alle Modi". Wer das volle Menue aufmacht, bekommt es beim naechsten Mal wieder (merkt sich das Spiel).
// R66: Aufsatz-Wahl im Menue (Fahrer-Karte): gesperrte zeigen, womit man sie bekommt
function menuToppers(){const box=$('toppers');if(!box)return;const me=topperMe(),cur=myTopper()||'none';box.replaceChildren();
 for(const t of TOPPERS){const ok=topperUnlocked(t,me),b=document.createElement('button');b.type='button';b.className='top'+(ok?'':' locked')+(t.id===cur?' selected':'');b.textContent=t.icon;
  b.title=ok?t.n:`${t.n} – ${topperHint(t)}`;b.setAttribute('aria-label',b.title);b.setAttribute('aria-pressed',String(t.id===cur));
  b.onclick=()=>{if(!ok){toast(`🔒 ${t.n}: ${topperHint(t)}`,1.8);SFX.wrong();return;}store.set('topper',t.id);topperMine=undefined;SFX.select();toast(t.id==='none'?'Ohne Aufsatz':`${t.icon} ${t.n} – schwebt über deinem Kart`,1.4);menuToppers();};
  box.append(b);}}
menuToppers();
// R69: Garagen-Vorschau - das eigene Kart mit Fahrer, Farbe, Karosserie und Aufsatz als Bild in der Fahrer-Karte; neu gerendert,
// sobald sich etwas aendert (oder ein Modell fertig geladen ist)
let garageKey='',garageScene=null,garageCam=null;
function garageTick(){if(state!=='menu'||!renderer||!P.kart||document.hidden)return;const dk=(DRIVERS[driverIndex]||DRIVERS[0]).k,key=[driverIndex,colorIndex,kartStyle,myTopper()||'',!!P[dk],!!P.kartwheel,!!P.kartbodies].join('|');if(key===garageKey)return;garageKey=key;
 const W=360,H=220;if(!garageScene){garageScene=new T.Scene();garageScene.add(new T.HemisphereLight(0xffffff,0x5a6472,2.2));const dl=new T.DirectionalLight(0xfff2dc,2.6);dl.position.set(3,5,4);garageScene.add(dl);const d2=new T.DirectionalLight(0x9fc7ff,1.1);d2.position.set(-3,2,-3);garageScene.add(d2);
  garageCam=new T.PerspectiveCamera(27,W/H,.1,60);garageCam.position.set(4.5,2.6,5.6);garageCam.lookAt(0,1.3,0);}
 let k;try{k=kart(KART_COLORS[colorIndex].c,!!KART_COLORS[colorIndex].gold,driverIndex,kartStyle);}catch(e){return;}k.rotation.y=.45;garageScene.add(k);
 const tid=myTopper();let top=null;if(tid){top=voxObj('top_'+tid);top.position.set(0,3.05,-.35);top.rotation.y=.6;garageScene.add(top);}
 const rt=new T.WebGLRenderTarget(W,H,{samples:4});rt.texture.colorSpace=T.SRGBColorSpace;const buf=new Uint8Array(W*H*4),oc=new T.Color();renderer.getClearColor(oc);const oa=renderer.getClearAlpha();
 renderer.setClearColor(0,0);renderer.setRenderTarget(rt);renderer.clear();renderer.render(garageScene,garageCam);renderer.readRenderTargetPixels(rt,0,0,W,H,buf);renderer.setRenderTarget(null);renderer.setClearColor(oc,oa);rt.dispose();
 garageScene.remove(k);if(top)garageScene.remove(top);
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;const q=cv.getContext('2d'),img=q.createImageData(W,H);for(let y=0;y<H;y++)img.data.set(buf.subarray((H-1-y)*W*4,(H-y)*W*4),y*W*4);q.putImageData(img,0,0);
 const el=$('garage');if(el)el.src=cv.toDataURL('image/png');}
setInterval(garageTick,450);
// R66: Taegliche Gluecksbrezn - Pixel-Brezn im einfachen Menue, einmal am Tag aufbrechen
function pixelCanvas(rows,pal,px=4){const w=Math.max(...rows.map(r=>r.length)),c=document.createElement('canvas');c.width=w*px;c.height=rows.length*px;const q=c.getContext('2d');
 for(const [x,y,col] of pixels(rows,pal)){q.fillStyle='#'+col.toString(16).padStart(6,'0');q.fillRect(x*px,y*px,px,px);}return c;}
function luckyRefresh(){const b=$('lucky');if(!b)return;const ready=luckyReady(store.get('luckyDay',''),dayKey());b.hidden=!ready;
 if(ready&&!b.querySelector('canvas'))b.prepend(pixelCanvas(BREZN,{B:0xc07a34,s:0xffffff},4));}
function luckyOpen(){const b=$('lucky');if(!luckyReady(store.get('luckyDay',''),dayKey()))return;store.set('luckyDay',dayKey());
 const xp=luckyReward(),pr=store.get('prog',{xp:0,ach:[],done:[],won:[]}),l0=levelOf(pr.xp||0).level;pr.xp=(pr.xp||0)+xp;store.set('prog',pr);const l1=levelOf(pr.xp).level;
 b.classList.add('open');SFX.bonus();const r=b.getBoundingClientRect();
 for(let i=0;i<18;i++){const d=document.createElement('i');d.className='lucky-px';const a=i/18*TAU;d.style.left=(r.left+r.width*.18)+'px';d.style.top=(r.top+r.height/2)+'px';
  d.style.setProperty('--dx',Math.cos(a)*(60+Math.random()*50)+'px');d.style.setProperty('--dy',Math.sin(a)*(40+Math.random()*40)-30+'px');d.style.background=['#ffd23a','#c07a34','#ffffff','#3cc85a','#e8352e'][i%5];document.body.append(d);setTimeout(()=>d.remove(),950);}
 toast(`🥨 GLÜCKSBREZN: +${xp} XP${xp>=250?' – JACKPOT!':''}`,2.2,'good');
 if(l1>l0)setTimeout(()=>{toast(`⬆ FAHRERSTUFE ${l1}!`,2,'good');playClip('s_c_levelup',sfxGain,.9);},1200);
 topperMine=undefined;setTimeout(()=>{b.classList.remove('open');refreshMenu();luckyRefresh();},900);}
$('lucky').onclick=luckyOpen;luckyRefresh();
// R69: Wochenziele-Karte (unter der Tagesaufgabe): eingeklappt eine Zeile mit drei Punkten, aufgeklappt Ziele mit Balken
{const w=document.createElement('button');w.id='weekly';w.type='button';$('daily').after(w);}
function weeklyRefresh(){const weeklyEl=$('weekly');if(!weeklyEl)return;const wk=weekKey(),st=store.get('weekly',null),s=st&&st.week===wk?st:{prog:{},done:[]},goals=weeklyGoals(wk),open=store.get('weeklyOpen',false),nd=s.done.length;
 const now=new Date(),left=(7-((now.getDay()+6)%7));weeklyEl.classList.toggle('open',open);weeklyEl.classList.toggle('done',nd===3);
 weeklyEl.innerHTML=`<span class="wk-head"><b>📆 WOCHENZIELE</b><i>${goals.map(g=>s.done.includes(g.id)?'●':'○').join('')}</i><em>${nd===3?'🏆 geschafft!':`noch ${left} ${left===1?'Tag':'Tage'} · +${WEEKLY_XP} XP je Ziel`}</em><u>${open?'▴':'▾'}</u></span>`+
  (open?goals.map(g=>{const v=Math.min(g.n,s.prog[g.id]||0),ok=s.done.includes(g.id);return `<span class="wk-row${ok?' ok':''}"><small>${ok?'✓ ':''}${g.t}</small><s style="--p:${Math.round(v/g.n*100)}%"></s><small>${v}/${g.n}</small></span>`;}).join('')+`<span class="wk-foot">Alle drei: Aufsatz 🏆 Wochen-Pokal</span>`:'');}
$('weekly').onclick=()=>{store.set('weeklyOpen',!store.get('weeklyOpen',false));SFX.select();weeklyRefresh();};weeklyRefresh();
function menuSimple(on){document.body.classList.toggle('menu-simple',on);store.set('menuFull',!on);quickRefresh();}
function pickMode(m){const b=document.querySelector(`#modes .mode[data-mode="${m}"]`);if(b&&mode!==m)b.click();}
function quickRefresh(){menuToppers();luckyRefresh();weeklyRefresh();const c=courseAt(selected);if(c&&!c.openWorld)setText('qRaceSub',`${c.icon} ${c.name} · ${ccName(cc)}`);
 const onl=onlRaces(),nx=onlineNext(onl),first=store.get('onlDay','')!==dayKey();
 setText('qOnlineBadge',first?`+${ONLINE_DAILY_XP} XP heute`:`×${ONLINE_MUL} XP`);
 {const st=store.get('streak',{}),y=dayKey(new Date(Date.now()-864e5)),d=streakIfToday(st,dayKey(),y);setText('qStreak',st.last===dayKey()?`🔥 Wiesn-Serie: ${st.days} ${st.days===1?'Tag':'Tage'} – morgen wieder fahren!`:`🔥 Erstes Rennen heute: +${streakXP(d)} XP${d>1?` (Serie Tag ${d})`:''}`);}
 setText('qHint',nx?`🌐 Noch ${nx.n-onl} Online-Rennen bis zur ${nx.what}`:hasCrown()?'👑 Du trägst die Pixel-Krone – verteidige sie online!':'👑 Gewinne online gegen einen Menschen und hol dir die Pixel-Krone');}
$('menu').addEventListener('pointerdown',e=>{const b=e.target.closest?.('button');if(b&&!b.matches('.q-btn,.q-more,.lucky,#weekly,#qBack,#start'))SFX.tick();});
// R70: Easter Egg - fuenfmal schnell auf den Titel tippen oeffnet den SOUND TEST (alle Chiptune-Stuecke und Klaenge)
const SONG_TITLES={menu8:'Wiesn-Ouvertüre',alm:'Almwiesen-Galopp',canyon:'Wüstenritt',neon:'Leuchtpilz-Beat',lobby:'Festzelt-Boogie',polka:'Maßkrug-Polka',gothic8:'Kerzen im Nordturm',space:'Sturzflug',beach:'Lagunen-Calypso',ice:'Walzer auf dem Eis',dome:'Choral der Wächter',choco:'Schokoladen-Swing',lava:'Magma-Galopp',kirmes:'Rummelwalzer'};
let titleTaps=[];
function soundTest(){let box=$('soundTest');if(!box){box=document.createElement('section');box.id='soundTest';box.className='modal';box.hidden=true;document.body.append(box);}
 const bgms=Object.keys(SONG_TITLES).filter(k=>k==='menu8'||BGM_SRC[k]),sfx=['coin','item','lap','mt1','mt2','mt3','boost','trick','ring','levelup','unlock','star','crown','bonus','throw','fake','fakepop','spiky','crush','spin','flat','unflat','win','lose','moo','whistle','bell'];
 box.innerHTML=`<div class="st-card"><h2>SOUND TEST</h2><p class="st-sub">Alle Stücke und Klänge – eigene Chiptune-Kompositionen</p><h3>♪ MUSIK</h3><ol class="st-list">${bgms.map((k,i)=>`<li><button type="button" data-bgm="${k}">${String(i+1).padStart(2,'0')}</button><span>${SONG_TITLES[k]}</span></li>`).join('')}</ol>
  <h3>✦ KLÄNGE</h3><div class="st-sfx">${sfx.map((k,i)=>`<button type="button" data-sfx="${k}">${String(i+1).padStart(2,'0')} ${k.toUpperCase()}</button>`).join('')}</div><button type="button" class="st-close">ENDE</button></div>`;
 box.querySelectorAll('[data-bgm]').forEach(b=>b.onclick=()=>{audioInit();if(!soundOn)setSound();const k=b.dataset.bgm==='menu8'?'menu':b.dataset.bgm;bgm.current=null;playBgm(k);box.querySelectorAll('[data-bgm]').forEach(x=>x.classList.toggle('on',x===b));});
 box.querySelectorAll('[data-sfx]').forEach(b=>b.onclick=()=>{audioInit();playClip('s_c_'+b.dataset.sfx,sfxGain,.9);});
 box.querySelector('.st-close').onclick=()=>{box.hidden=true;bgm.current=null;playBgm('menu');};box.hidden=false;}
document.querySelector('.menu-title')?.addEventListener('click',()=>{const t=performance.now();titleTaps=[...titleTaps.filter(x=>t-x<2500),t];if(titleTaps.length>=5){titleTaps=[];SFX.select();soundTest();}});
$('qOnline').onclick=()=>{SFX.select();pickMode('online');syncModeUi();$('start').click();};
$('qRace').onclick=()=>{if(courseAt(selected)?.openWorld)selected=0;pickMode('single');gp=newGp(false);start();};
$('qMore').onclick=()=>{SFX.select();menuSimple(false);$('menu').scrollTop=0;};
$('qBack').onclick=()=>{SFX.select();menuSimple(true);};
menuSimple(TEST?false:!store.get('menuFull',false));
// R68: Pixel-Siegerkarte zum Teilen (Bild mit Platz, Strecke, Zeit, Pixel-Brezn und Link) - teilt per Share-Menue oder laedt herunter
let lastResult=null;
function shareCard(R){const W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const q=c.getContext('2d'),F="'Rubik','Baloo 2','Trebuchet MS',Arial,sans-serif";
 const g=q.createLinearGradient(0,0,0,H);g.addColorStop(0,'#62c9ff');g.addColorStop(.62,'#bfe8ff');g.addColorStop(.62,'#6ab04c');g.addColorStop(1,'#3f8a36');q.fillStyle=g;q.fillRect(0,0,W,H);
 for(let x=0;x<W;x+=60)for(const y of [0,H-60]){q.fillStyle=((x/60+(y?1:0))%2)?'#1f78d1':'#ffffff';q.fillRect(x,y,60,60);}                 // Rauten-Rand
 const pix=(rows,pal,px,ox,oy)=>{for(const [x,y,col] of pixels(rows,pal)){q.fillStyle='#'+col.toString(16).padStart(6,'0');q.fillRect(ox+x*px,oy+y*px,px,px);}};
 pix(BREZN,{B:0xc07a34,s:0xffffff},22,W/2-165,150);
 const txt=(t,y,size,fill,stroke=14)=>{q.font=`italic 900 ${size}px ${F}`;q.textAlign='center';q.lineJoin='round';q.lineWidth=stroke;q.strokeStyle='#14264a';q.strokeText(t,W/2,y);q.fillStyle=fill;q.fillText(t,W/2,y);};
 txt('SUPPA LEDERHOSN KARTS',110,56,'#ffffff',10);
 txt(R.place===1?'SIEG!':`PLATZ ${R.place}`,560,R.place===1?210:170,R.place===1?'#ffc83a':R.place<=3?'#ffffff':'#ffe0d0',24);
 txt(`von ${R.n}${R.online?' · 🌐 ONLINE':''}`,640,48,'#ffffff',10);
 txt('★'.repeat(R.stars)+'☆'.repeat(3-R.stars),740,96,'#ffc83a',12);
 txt(`${R.icon||''} ${R.track}`,860,64,'#ffffff',12);txt(`${R.cc} · Zeit ${R.time}${R.best?' · Runde '+R.best:''}`,940,44,'#ffffff',10);
 txt(R.name,1060,70,'#ffc83a',12);
 const tp=topperById(myTopper());if(tp&&tp.id!=='none')txt(tp.icon+' '+tp.n,1130,40,'#ffffff',9);
 txt('Fahr mit! → madd1in.github.io/wiesnkart',1240,40,'#ffffff',9);
 return new Promise(res=>c.toBlob(b=>res(b),'image/png'));}
async function shareResult(){if(!lastResult)return;SFX.select();const blob=await shareCard(lastResult);if(!blob)return;const file=new File([blob],'wiesnkart-ergebnis.png',{type:'image/png'}),text=`${lastResult.place===1?'Sieg':'Platz '+lastResult.place} auf ${lastResult.track} in Suppa Lederhosn Karts! Fahr mit: https://madd1in.github.io/wiesnkart/`;
 try{if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],text});return;}}catch(e){if(e?.name==='AbortError')return;}
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);toast('📸 Siegerkarte gespeichert',1.6,'good');}
$('shareBtn').onclick=shareResult;
$('again').onclick=nextAfterResult;$('home').onclick=home;$('quit').onclick=home;$('pause').onclick=pause;$('resume').onclick=pause;$('sound').onclick=setSound;
$('cerAgain').onclick=()=>{gp=newGp(true);start();};syncModeUi();$('cerHome').onclick=home;
$('item').onclick=use;$('titem').onpointerdown=e=>{e.preventDefault();itemDown();};$('titem').onpointerup=$('titem').onpointercancel=$('titem').onpointerleave=()=>itemUp();
// R57: Tippen in Eingabefeldern (Name, Raumcode) steuert nicht das Kart - sonst fehlten Leerzeichen, P pausierte
// R70: Easter Egg - der klassische Konsolen-Code im Menue (Tastatur oder Controller): 16-BIT-Modus, Lackierung "Konsolengrau", Erfolg
const CHEAT=['up','up','down','down','left','right','left','right','b','a'];let cheatIdx=0;
function cheatStep(k){if(state!=='menu')return false;cheatIdx=k===CHEAT[cheatIdx]?cheatIdx+1:k===CHEAT[0]?1:0;if(cheatIdx<CHEAT.length)return false;cheatIdx=0;
 store.set('cheat',true);bitSet(true);grantAch('cheat');refreshMenu();playClip('s_c_levelup',sfxGain,.9);flashScreen?.(.35);
 toast('🎮 CHEAT AKTIVIERT! 16-BIT-MODUS + LACKIERUNG „KONSOLENGRAU“',3,'good');return true;}
addEventListener('keydown',e=>{const ck={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',KeyB:'b',KeyA:'a'}[e.code];if(ck&&!e.repeat&&!e.target?.closest?.('input,select,textarea'))cheatStep(ck);});
addEventListener('keydown',e=>{if(e.target?.closest?.('input,select,textarea'))return;if(padHints)padUi(false);if(e.code==='Enter'&&worldMode&&owPortalAt&&state==='race'){owEnterTrack(owPortalAt.ti);return;}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault();keys.add(e.code);if(!e.repeat){if(e.code==='Space')itemDown();if(e.code==='Escape'||e.code==='KeyP')pause();if(e.code==='KeyR'&&state==='race'){racers[0].safeD=lapDist(racers[0].distance);respawn(racers[0]);}if(e.code==='Enter'&&state==='menu')$('start').click();}});
addEventListener('keyup',e=>{keys.delete(e.code);if(e.code==='Space')itemUp();});addEventListener('blur',()=>{keys.clear();touchPtr.clear();touchRefresh();if(state==='race'||state==='countdown')pause();});
// ---------- Wetter & Tageszeit (R50): wechseln von Runde zu Runde (weather.mjs). Plan je Rennen, Ueberblendung an der
// Ziellinie, Licht, Himmel und Nebel aus dem Thema gemischt. Regen, Schnee, Sand, Asche und Gluehwuermchen sind
// Teilchen im Shader (folgen der Kamera, keine CPU-Arbeit je Tropfen). Dazu Blitze mit Donner, Windboeen, nasse
// Fahrbahn (weniger Grip fuer alle), ein UFO mit Schwebe-Strahl, Regenbogen, Polarlicht, Sternschnuppen und
// Sonnenfinsternis. Zeitfahren und Wiesnland bleiben ruhig (faire Bestzeiten), in der Pause abschaltbar.
let wxOn=store.get('weather',true)!==false,wxPlan=calmPlan(LAPS),wxRacePlan=null,wxM=null,wxExp=null,wxHead=null,wxGripMul=1,wxWindA=0,wxWindDir=0,wxActive=false,
 wxBase=null,wxSkyKey='',wxLapSeen=0,wxNewsT=-1,wxNews='',wxBoltT=4,wxFlash=0,wxThunderT=-1,wxSeed=1,wxStripKey='';
const WX_DARK=['night','haunted','rainbow','lava'],_wv1=new T.Vector3(),_wv2=new T.Vector3();
const wxSkyCanvas=document.createElement('canvas');wxSkyCanvas.width=2;wxSkyCanvas.height=256;
const wxSkyTex=new T.CanvasTexture(wxSkyCanvas);wxSkyTex.colorSpace=T.SRGBColorSpace;
function wxSky(top,bot){const q=wxSkyCanvas.getContext('2d'),g=q.createLinearGradient(0,0,0,256);g.addColorStop(0,hex(top));g.addColorStop(.62,hex(bot));g.addColorStop(1,hex(bot));q.fillStyle=g;q.fillRect(0,0,2,256);wxSkyTex.needsUpdate=true;}
const wxRoot=new T.Group();wxRoot.name='weather';scene.add(wxRoot);
const WX_WRAP='vec3 wxWrap(vec3 p,vec3 c,vec3 b){return mod(p-c+b*.5,b)+c-b*.5;}';
const wxU=()=>({uTime:{value:0},uAmt:{value:0},uCam:{value:new T.Vector3()},uVel:{value:new T.Vector3(0,-30,0)},uBox:{value:new T.Vector3(60,30,60)},uCol:{value:new T.Color(0xffffff)},uAlpha:{value:1}});
// Regen: je Tropfen ein Strich (zwei Ecken), Kopf und Schweif aus derselben Saat; Dichte ueber uAmt (Tropfen mit seed.w < uAmt)
function wxRainMesh(n){const pos=new Float32Array(n*6),seed=new Float32Array(n*8),tip=new Float32Array(n*2);
 for(let i=0;i<n;i++){const s=[Math.random(),Math.random(),Math.random(),Math.random()];for(let v=0;v<2;v++){seed.set(s,(i*2+v)*4);tip[i*2+v]=v;}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('seed',new T.BufferAttribute(seed,4));g.setAttribute('tip',new T.BufferAttribute(tip,1));
 const m=new T.ShaderMaterial({uniforms:{...wxU(),uLen:{value:1.5}},transparent:true,depthWrite:false,fog:false,
  vertexShader:`uniform float uTime,uAmt,uLen;uniform vec3 uCam,uVel,uBox;attribute vec4 seed;attribute float tip;varying float vA,vT;${WX_WRAP}
   void main(){vec3 p=wxWrap(seed.xyz*uBox+uVel*uTime,uCam,uBox)-normalize(uVel)*uLen*tip;vA=step(seed.w,uAmt);vT=tip;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`,
  fragmentShader:`uniform vec3 uCol;uniform float uAlpha;varying float vA,vT;void main(){if(vA<.5)discard;gl_FragColor=vec4(uCol,uAlpha*(1.-vT*.85));}`});
 const l=new T.LineSegments(g,m);l.frustumCulled=false;l.visible=false;l.renderOrder=6;wxRoot.add(l);return l;}
// Flocken (Schnee, Sand, Asche) und Gluehwuermchen: Punkte mit Pendeln, optional Blinken
function wxPointsMesh(n,additive){const pos=new Float32Array(n*3),seed=new Float32Array(n*4);for(let i=0;i<n*4;i++)seed[i]=Math.random();
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('seed',new T.BufferAttribute(seed,4));
 const m=new T.ShaderMaterial({uniforms:{...wxU(),uSize:{value:.2},uPx:{value:600},uSway:{value:1},uBlink:{value:0},uOff:{value:new T.Vector3()}},transparent:true,depthWrite:false,fog:false,blending:additive?T.AdditiveBlending:T.NormalBlending,
  vertexShader:`uniform float uTime,uAmt,uSize,uPx,uSway,uBlink;uniform vec3 uCam,uVel,uBox,uOff;attribute vec4 seed;varying float vA;${WX_WRAP}
   void main(){vec3 p=seed.xyz*uBox+uVel*uTime;float w=seed.w;p+=vec3(sin(uTime*1.3+w*40.),sin(uTime*.9+w*17.)*.4,cos(uTime*1.1+w*31.))*uSway;
    p=wxWrap(p,uCam+uOff,uBox);vec4 mv=viewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=uSize*uPx*(.55+w*.9)/max(1.,-mv.z);
    vA=step(w,uAmt)*mix(1.,.15+.85*pow(max(0.,sin(uTime*2.4+w*60.)),3.),uBlink);}`,
  fragmentShader:`uniform vec3 uCol;uniform float uAlpha;varying float vA;void main(){vec2 c=gl_PointCoord-.5;float d=length(c);if(d>.5||vA<.02)discard;gl_FragColor=vec4(uCol,vA*uAlpha*smoothstep(.5,.12,d));}`});
 const p=new T.Points(g,m);p.frustumCulled=false;p.visible=false;p.renderOrder=6;wxRoot.add(p);return p;}
const wxRain=wxRainMesh(LITE?520:1400),wxFlakes=wxPointsMesh(LITE?420:1000,false),wxBugs=wxPointsMesh(LITE?90:170,true);
wxBugs.material.uniforms.uCol.value.setHex(0xd6ff5a);wxBugs.material.uniforms.uBlink.value=1;wxBugs.material.uniforms.uSway.value=1.6;wxBugs.material.uniforms.uBox.value.set(46,4.5,46);wxBugs.material.uniforms.uOff.value.set(0,-2.4,0);wxBugs.material.uniforms.uSize.value=.34;wxBugs.material.uniforms.uVel.value.set(0,0,0);
// R53 Strecken-Ereignisse als Leuchtpunkte um die Kamera: Himmelslaternen (Pilz-Wiesn, steigen auf), Irrlichter
// (Geisterhaus, gruen, dicht ueber dem Boden) und Luftballons in drei Farben (Magnet-Kirmes, steigen auf)
const wxLanterns=wxPointsMesh(LITE?50:110,true),wxWisps=wxPointsMesh(LITE?40:90,true),wxParty=[0xff3b6b,0xffd23f,0x3fa8ff].map(()=>wxPointsMesh(LITE?22:45,false));
{const u=wxLanterns.material.uniforms;u.uCol.value.setHex(0xffa040);u.uBlink.value=0;u.uSway.value=.6;u.uBox.value.set(80,40,80);u.uOff.value.set(0,14,0);u.uSize.value=1.2;u.uVel.value.set(.4,1.6,.3);}
{const u=wxWisps.material.uniforms;u.uCol.value.setHex(0x7dffb0);u.uBlink.value=1;u.uSway.value=2.4;u.uBox.value.set(60,6,60);u.uOff.value.set(0,-1.5,0);u.uSize.value=.55;u.uVel.value.set(0,0,0);}
wxParty.forEach((p,i)=>{const u=p.material.uniforms;u.uCol.value.setHex([0xff3b6b,0xffd23f,0x3fa8ff][i]);u.uBlink.value=0;u.uSway.value=.8;u.uBox.value.set(90,60,90);u.uOff.value.set(0,20,0);u.uSize.value=1.15;u.uVel.value.set(.3,2.6,.2);});
// Feuerwerk (Kirmes): Raketen platzen vor der Kamera am Himmel - Teilchen mit Schwerkraft, Farbe verglueht
const FW_N=LITE?260:520;
const wxFw=(()=>{const g=new T.BufferGeometry(),pos=new Float32Array(FW_N*3);g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('color',new T.BufferAttribute(new Float32Array(FW_N*3),3));
 const dot=canvasTex(32,32,q=>{const r=q.createRadialGradient(16,16,0,16,16,16);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.75)');r.addColorStop(1,'rgba(255,255,255,0)');q.fillStyle=r;q.fillRect(0,0,32,32);});
 const p=new T.Points(g,new T.PointsMaterial({size:4.2,map:dot,vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));
 p.frustumCulled=false;p.visible=false;p.renderOrder=6;wxRoot.add(p);p.userData={vel:new Float32Array(FW_N*3),base:new Float32Array(FW_N*3),life:new Float32Array(FW_N),max:new Float32Array(FW_N),spawnT:.4,cur:0};return p;})();
const FW_COLS=[0xff4f7a,0xffd23f,0x5ad8ff,0x9dff7a,0xc98bff,0xffffff];
function wxFireworks(dt,amt){const u=wxFw.userData,P=wxFw.geometry.attributes.position.array,C=wxFw.geometry.attributes.color.array,p=racers[0];
 if(amt>.3&&p&&(state==='race'||state==='countdown')){u.spawnT-=dt;if(u.spawnT<=0){u.spawnT=.5+Math.random()*.8;
   const a=camH+(Math.random()-.5)*1.1,dist=100+Math.random()*70,cx=camera.position.x+Math.sin(a)*dist,cz=camera.position.z+Math.cos(a)*dist,cy=(p.y||0)+26+Math.random()*22,col=_col.setHex(FW_COLS[Math.floor(Math.random()*FW_COLS.length)]),sp=13+Math.random()*7;
   for(let n=0;n<52;n++){const i=u.cur=(u.cur+1)%FW_N,k=i*3,th=Math.random()*TAU,ph=Math.acos(2*Math.random()-1),s=sp*(.75+Math.random()*.25);
    P[k]=cx;P[k+1]=cy;P[k+2]=cz;u.vel[k]=Math.sin(ph)*Math.cos(th)*s;u.vel[k+1]=Math.cos(ph)*s;u.vel[k+2]=Math.sin(ph)*Math.sin(th)*s;u.base[k]=col.r;u.base[k+1]=col.g;u.base[k+2]=col.b;u.life[i]=u.max[i]=1.5+Math.random()*.8;}
   if(soundOn&&ctx){sfxNoise(.5,420,90,.06,1.2);sfxTone(1800,900,.18,'square',.012,.12);}}}
 let alive=0;for(let i=0;i<FW_N;i++){const k=i*3;if(u.life[i]<=0){C[k]=C[k+1]=C[k+2]=0;continue;}alive++;u.life[i]-=dt;const f=Math.max(0,u.life[i]/u.max[i]),drag=Math.exp(-dt*1.6);
  u.vel[k]*=drag;u.vel[k+1]=u.vel[k+1]*drag-7.5*dt;u.vel[k+2]*=drag;P[k]+=u.vel[k]*dt;P[k+1]+=u.vel[k+1]*dt;P[k+2]+=u.vel[k+2]*dt;const tw=f*(.7+.3*Math.sin(i*7.3+u.life[i]*30));C[k]=u.base[k]*tw;C[k+1]=u.base[k+1]*tw;C[k+2]=u.base[k+2]*tw;}
 wxFw.visible=alive>0;if(alive){wxFw.geometry.attributes.position.needsUpdate=true;wxFw.geometry.attributes.color.needsUpdate=true;}}
// Ballonfestival (Pilz-Promenade): Heissluftballons steigen rund um die Strecke langsam auf
const wxBalloons=[];
function wxBalloonsTick(dt,amt){if(amt<.02&&!wxBalloons.some(b=>b.visible))return;const p=racers[0];if(!p||!P.balloon)return;
 if(!wxBalloons.length)for(let i=0;i<(LITE?6:11);i++){const g=cloneProto(P.balloon);applyTint(g,'CapPaint',[0xed6350,0xffc93c,0x4fb0ff,0x9d6bff,0x3fc97a,0xff7ac8][i%6]);g.visible=false;g.userData={a:i/11*TAU+Math.random()*.4,r:70+Math.random()*120,y:0,v:1.2+Math.random()*1.4,s:1.8+Math.random()*1.4};wxRoot.add(g);wxBalloons.push(g);}
 for(const g of wxBalloons){const u=g.userData;g.visible=amt>.02;if(!g.visible){u.y=0;continue;}u.y+=u.v*dt;if(u.y>85)u.y=0;u.a+=dt*.01;
  g.position.set(p.x+Math.sin(u.a)*u.r,(p.y||0)+8+u.y,p.z+Math.cos(u.a)*u.r);g.scale.setScalar(u.s*Math.min(1,amt*1.3)*Math.min(1,u.y/6+.2));g.rotation.y+=dt*.1;}}
// Fledermaus-Schwarm (Geisterhaus): ein Strom Fledermaeuse zieht ueber die Strecke (Modelle aus gothic.glb)
let wxBats=null;
function wxBatsTick(dt,amt){if(!wxBats){if(amt<.02)return;const body=P.gothic?.getObjectByName('GT_BatBody'),wing=P.gothic?.getObjectByName('GT_BatWing');if(!body||!wing)return;
  const n=LITE?24:48,parts=[];for(const src of [body,wing])src.traverse(q=>{if(q.isMesh){const im=new T.InstancedMesh(q.geometry,q.material,n);im.frustumCulled=false;im.userData.wing=src===wing;im.visible=false;wxRoot.add(im);parts.push(im);}});wxBats={parts,n,t:0};}
 const on=amt>.02;for(const im of wxBats.parts)im.visible=on;if(!on)return;wxBats.t+=dt;const p=racers[0];if(!p)return;const cam=camera.position;
 for(let i=0;i<wxBats.n;i++){const lane=(i%6)/6,ph=((wxBats.t*.09+i*.137)%1),a=camH+(lane-.5)*.35,side=(ph-.5)*200;
  _kv.set(cam.x+Math.sin(a)*(40+lane*30)+Math.cos(a)*side,(p.y||0)+7+lane*7+Math.sin(wxBats.t*2+i)*1.8,cam.z+Math.cos(a)*(40+lane*30)-Math.sin(a)*side);
  _ke.set(0,a+Math.PI/2,Math.sin(wxBats.t*3+i)*.3);_kq.setFromEuler(_ke);
  for(const im of wxBats.parts){const s=1.5*Math.min(1,amt*1.4);_ks.set(s,im.userData.wing?s*3.2*Math.sin(wxBats.t*17+i*1.7):s,s);_m.compose(_kv,_kq,_ks);im.setMatrixAt(i,_m);}}
 for(const im of wxBats.parts)im.instanceMatrix.needsUpdate=true;}
// Komet (Sternenbahn): langer Schweif, zieht langsam ueber den Himmel; Vulkanausbruch (Lava-Feste): gluehende
// Lavabomben stuerzen am Horizont herab, der Boden bebt kurz
const wxStreak=col=>{const s=new T.Sprite(new T.SpriteMaterial({map:wxStreakTex,color:col,transparent:true,depthWrite:false,fog:false,blending:T.AdditiveBlending}));s.visible=false;s.userData={t:-1,p:new T.Vector3(),v:new T.Vector3()};wxRoot.add(s);return s;};
let wxComet=null,wxBombs=null;
function wxCometTick(dt,amt){if(!wxComet){if(amt<.3)return;wxComet=wxStreak(0xbfe8ff);}const s=wxComet,u=s.userData;if(u.t<0){if(amt<.3){s.visible=false;return;}const a=camH+(Math.random()-.5)*.8,r=420;u.p.set(camera.position.x+Math.sin(a+.6)*r,230,camera.position.z+Math.cos(a+.6)*r);
  u.v.set(Math.sin(a-.9)*38,-3,Math.cos(a-.9)*38);u.t=12;}
 u.t-=dt;u.p.addScaledVector(u.v,dt);s.visible=u.t>0;if(!s.visible)return;s.position.copy(u.p);_wv1.copy(u.p).project(camera);_wv2.copy(u.p).addScaledVector(u.v,-.5).project(camera);
 s.material.rotation=Math.atan2(_wv1.y-_wv2.y,(_wv1.x-_wv2.x)*camera.aspect);s.scale.set(190,11,1);s.material.opacity=Math.min(1,u.t*.6,(12-u.t)*.8)*amt;}
let wxQuakeT=3;
function wxEruptionTick(dt,amt){if(!wxBombs){if(amt<.3)return;wxBombs=Array.from({length:5},()=>wxStreak(0xff7a2a));}for(const s of wxBombs){const u=s.userData;if(u.t<0){if(amt>.3&&Math.random()<dt*1.1){const a=camH+(Math.random()-.5)*1.6,r=180+Math.random()*120;u.p.set(camera.position.x+Math.sin(a)*r,120+Math.random()*60,camera.position.z+Math.cos(a)*r);
   u.v.set((Math.random()-.5)*30,-70,(Math.random()-.5)*30);u.t=1.8;}else{s.visible=false;continue;}}
  u.t-=dt;u.p.addScaledVector(u.v,dt);u.v.y-=30*dt;if(u.t<0||u.p.y<-5){u.t=-1;s.visible=false;continue;}s.visible=true;s.position.copy(u.p);_wv1.copy(u.p).project(camera);_wv2.copy(u.p).addScaledVector(u.v,-.2).project(camera);
  s.material.rotation=Math.atan2(_wv1.y-_wv2.y,(_wv1.x-_wv2.x)*camera.aspect);s.scale.set(42,7,1);s.material.opacity=Math.min(1,u.t*2)*amt;}
 if(amt>.5&&state==='race'){wxQuakeT-=dt;if(wxQuakeT<=0){wxQuakeT=5+Math.random()*5;shake=Math.max(shake,.28);flashScreen(.12);if(soundOn&&ctx){sfxNoise(1.1,160,40,.12,.8);}}}}
// Himmelsbilder: Regenbogen (Halbring), Polarlicht (zwei wehende Baender), Sternschnuppen (Sprites), Finsternis-Scheibe
const wxSkyMat=(vs,fs,extra={})=>new T.ShaderMaterial({uniforms:{uTime:{value:0},uAmt:{value:0}},transparent:true,depthWrite:false,fog:false,blending:T.AdditiveBlending,side:T.DoubleSide,vertexShader:vs,fragmentShader:fs,...extra});
const wxBow=new T.Mesh(new T.RingGeometry(100,119,80,1,0,Math.PI),wxSkyMat(`varying float vR;void main(){vR=(length(position.xy)-100.)/19.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 `uniform float uAmt;varying float vR;void main(){vec3 c=clamp(abs(fract(vec3(vR*.82)+vec3(0.,.667,.333))*6.-3.)-1.,0.,1.);float a=uAmt*.5*smoothstep(0.,.14,vR)*smoothstep(1.,.86,vR);gl_FragColor=vec4(c*a,a);}`));
wxBow.visible=false;wxBow.frustumCulled=false;wxRoot.add(wxBow);
const wxAurora=[0,1,2].map(k=>{const m=new T.Mesh(new T.PlaneGeometry(700,150,80,1),wxSkyMat(`uniform float uTime;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z-=p.x*p.x/1800.;p.y+=sin(p.x*.011+uTime*.35)*16.;p.z+=sin(p.x*.019+uTime*.27)*22.;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
 `uniform float uTime,uAmt;varying vec2 vUv;void main(){float y=vUv.y;vec3 c=mix(vec3(.18,1.,.58),vec3(.66,.34,1.),smoothstep(.35,1.,y));float band=.5+.5*sin(vUv.x*42.+uTime*1.2+sin(vUv.x*9.+uTime*.6)*2.2);float a=uAmt*(.3+.7*band*band)*smoothstep(0.,.18,y)*pow(1.-y,1.1)*1.35;gl_FragColor=vec4(c*a,a);}`));
 m.visible=false;m.frustumCulled=false;m.userData.k=k;wxRoot.add(m);return m;});
const wxStreakTex=canvasTex(128,16,(q,w,h)=>{const g=q.createLinearGradient(0,0,w,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.85,'rgba(220,240,255,.7)');g.addColorStop(1,'rgba(255,255,255,1)');q.fillStyle=g;q.beginPath();q.moveTo(0,h/2);q.lineTo(w-6,h/2-5);q.arc(w-6,h/2,5,-Math.PI/2,Math.PI/2);q.closePath();q.fill();});
const wxMeteors=Array.from({length:4},()=>{const s=new T.Sprite(new T.SpriteMaterial({map:wxStreakTex,transparent:true,depthWrite:false,fog:false,blending:T.AdditiveBlending}));s.visible=false;s.userData={t:-1,p:new T.Vector3(),v:new T.Vector3()};wxRoot.add(s);return s;});
const wxMoonDisc=(()=>{const t=canvasTex(128,128,(q)=>{const g=q.createRadialGradient(64,64,30,64,64,63);g.addColorStop(0,'rgba(6,8,20,1)');g.addColorStop(.62,'rgba(6,8,20,1)');g.addColorStop(.68,'rgba(255,240,200,.95)');g.addColorStop(.8,'rgba(255,220,160,.35)');g.addColorStop(1,'rgba(255,220,160,0)');q.fillStyle=g;q.fillRect(0,0,128,128);});
 const s=new T.Sprite(new T.SpriteMaterial({map:t,transparent:true,depthWrite:false,fog:false}));s.visible=false;wxRoot.add(s);return s;})();
// Blitz am Horizont: Zickzack aus den Gewitterwolken-Balken (boltGeo/boltMat)
const wxBolt=(()=>{const g=new T.Group();for(let i=0;i<8;i++)g.add(new T.Mesh(boltGeo,boltMat));g.visible=false;wxRoot.add(g);return g;})();
function wxStrike(){const p=racers[0];if(!p)return;const a=(p.h||0)+(Math.random()-.5)*1.9,dist=110+Math.random()*120,x=p.x+Math.sin(a)*dist,z=p.z+Math.cos(a)*dist,y0=(p.y||0)-6,top=y0+150;
 let px=x,py=top,pz=z;wxBolt.children.forEach((m,i)=>{const ny=top-(top-y0)*(i+1)/8,nx=x+(i<7?(Math.random()-.5)*16:0),nz=z+(i<7?(Math.random()-.5)*16:0);_wv1.set(nx-px,ny-py,nz-pz);const len=_wv1.length();
  m.scale.set(1.6,len,1.6);m.position.set((px+nx)/2,(py+ny)/2,(pz+nz)/2);m.quaternion.setFromUnitVectors(_kY.set(0,1,0),_wv1.normalize());px=nx;py=ny;pz=nz;});
 wxBolt.visible=true;wxBolt.userData.t=.3;wxFlash=1;flashScreen(.38);wxThunderT=.25+dist/340;}
// UFO: Untertasse mit Glaskuppel, kleinem Piloten, Lichterkranz und Schwebe-Strahl. Wer unter dem Strahl faehrt, wird
// wie vom Sprungpilz angehoben (Trick moeglich); das UFO wartet vor dem Spieler und fliegt weiter, sobald er vorbei ist.
const wxUfo=(()=>{const g=new T.Group(),body=new T.Group();g.add(body);
 const hull=new T.Mesh(new T.SphereGeometry(1,28,12),stdMat({color:0xc6d0de,metalness:.65,roughness:.28}));hull.scale.set(4.3,.95,4.3);hull.castShadow=true;body.add(hull);
 const rim=new T.Mesh(new T.TorusGeometry(4.15,.3,8,40),stdMat({color:0x7d88a0,metalness:.6,roughness:.35}));rim.rotation.x=Math.PI/2;body.add(rim);
 const dome=new T.Mesh(new T.SphereGeometry(1.75,22,12,0,TAU,0,Math.PI/2),stdMat({color:0x9ff6ff,emissive:0x2bc8ff,emissiveIntensity:.45,transparent:true,opacity:.55,roughness:.1}));dome.position.y=.55;body.add(dome);
 const head=new T.Mesh(new T.SphereGeometry(.62,16,12),stdMat({color:0x7dff6a,emissive:0x2a8a20,emissiveIntensity:.3,roughness:.6}));head.position.y=1.05;body.add(head);
 for(const s of [-1,1]){const e=new T.Mesh(new T.SphereGeometry(.2,10,8),new T.MeshBasicMaterial({color:0x10131e}));e.scale.set(.8,1.25,.5);e.position.set(s*.24,1.16,.52);body.add(e);}
 const lights=[];for(let i=0;i<10;i++){const a=i/10*TAU,m=new T.Mesh(new T.SphereGeometry(.26,8,6),new T.MeshBasicMaterial({color:0xffe45c}));m.position.set(Math.sin(a)*3.95,-.08,Math.cos(a)*3.95);body.add(m);lights.push(m);}
 const glow=new T.Mesh(new T.CircleGeometry(2.4,24),new T.MeshBasicMaterial({color:0x8dffc0,transparent:true,opacity:.8}));glow.rotation.x=Math.PI/2;glow.position.y=-.9;body.add(glow);
 const beamMat=new T.ShaderMaterial({uniforms:{uTime:{value:0},uAmt:{value:1}},transparent:true,depthWrite:false,fog:false,blending:T.AdditiveBlending,side:T.DoubleSide,
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform float uTime,uAmt;varying vec2 vUv;void main(){float a=(.16+.34*vUv.y+.3*smoothstep(.08,0.,vUv.y))*(.62+.38*sin(vUv.y*34.-uTime*7.))*uAmt;gl_FragColor=vec4(vec3(.5,1.,.72)*a,a);}`});
 const beam=new T.Mesh(new T.CylinderGeometry(1.3,3.9,1,28,1,true),beamMat);beam.position.y=-.5;g.add(beam);
 g.visible=false;g.userData={body,lights,beam,beamMat,d:0,off:0,from:new T.Vector3(),to:new T.Vector3(),fly:0,show:0,warp:0};wxRoot.add(g);return g;})();
function wxSafe(d){for(let x=-8;x<=10;x+=2){const q=lapDist(d+x);if(inTunnel(q)||hasRoll(q)||coasterAt(q)||(elems.length&&elemAt(q)))return false;}
 for(const g of gaps)if(Math.abs(wrapDiff(d,(g.start+g.end)/2))<(g.end-g.start)/2+14)return false;for(const r of ramps)if(Math.abs(wrapDiff(d,r.start))<16||Math.abs(wrapDiff(d,r.end))<16)return false;return true;}
function wxUfoSpot(from){for(let k=0;k<30;k++){const d=lapDist(from+k*9);if(wxSafe(d))return d;}return null;}
function wxUfoPlace(d,instant){const u=wxUfo.userData,off=(Math.random()-.5)*5,gy=groundAt(d,off).y;u.d=d;u.off=off;posAt(d,off,0,u.to);u.to.y=gy+12.5;
 if(instant){wxUfo.position.copy(u.to);u.fly=0;}else{u.from.copy(wxUfo.position);u.fly=1;}}
function wxUfoTick(dt,t,amt){const u=wxUfo.userData,p=racers[0];u.show+=((amt>.5&&state!=='finished'?1:0)-u.show)*Math.min(1,dt*2.2);
 if(u.show<.01){if(wxUfo.visible){wxUfo.visible=false;u.placed=false;}return;}
 if(!u.placed&&p){const d=wxUfoSpot(p.distance+120);if(d===null)return;wxUfoPlace(d,true);u.placed=true;wxUfo.visible=true;wxUfoSound();}
 if(p&&u.fly<=0&&state==='race'&&wrapDiff(p.distance,u.d)>26){const d=wxUfoSpot(p.distance+150);if(d!==null){wxUfoPlace(d,false);wxUfoSound(.5);}}
 if(u.fly>0){u.fly=Math.max(0,u.fly-dt/2.2);const k=1-u.fly,e=k*k*(3-2*k);wxUfo.position.lerpVectors(u.from,u.to,e);wxUfo.position.y+=Math.sin(k*Math.PI)*14;}
 else{wxUfo.position.x=u.to.x+Math.sin(t*.8)*.6;wxUfo.position.z=u.to.z+Math.cos(t*.7)*.6;wxUfo.position.y=u.to.y+Math.sin(t*1.6)*.45;}
 const s=u.show;wxUfo.scale.setScalar(Math.max(.01,s));u.body.rotation.y=t*1.7;u.body.rotation.z=Math.sin(t*1.3)*.08+(u.fly>0?.25:0);
 u.lights.forEach((m,i)=>m.material.color.setHex(((i+Math.floor(t*8))%3)===0?0xff4fd8:((i+Math.floor(t*8))%3)===1?0x6fffe0:0xffe45c));
 const beamOn=u.fly<=0&&s>.9;u.beam.visible=beamOn;if(beamOn){const hgt=wxUfo.position.y-(u.to.y-12.5);u.beam.scale.set(1,hgt,1);u.beam.position.y=-hgt/2-.6;u.beamMat.uniforms.uTime.value=t;}
 if(beamOn&&state==='race'&&frame%3===0&&p&&Math.abs(wrapDiff(p.distance,u.d))<90)emit(u.to.x+(Math.random()-.5)*5,u.to.y-12.5+Math.random()*2,u.to.z+(Math.random()-.5)*5,0x9dffc8,0,5+Math.random()*4,0,.9);
 if(!beamOn||state!=='race')return;
 for(const r of racers){if(r.finishTime!==null||r.air||r.stun>0||(r.ufoCd||0)>elapsed)continue;if(Math.abs(wrapDiff(r.distance,u.d))<3.4&&Math.abs(r.offset-u.off)<3.6){
  armGlider(r,'bounce');r.air=true;r.airT=0;r.vy=12+Math.max(0,r.speed)*.08;r.y+=.1;r.boost=Math.max(r.boost,.6);r.ufoCd=elapsed+3;
  if(r.id===0){stats.ufoLifts=(stats.ufoLifts||0)+1;toast('🛸 UFO-LIFT! JETZT TRICK!',1.2,'good');wxLiftSound();burst(r,0x9dffc8,18);}else if(nearPlayer(r,60))wxLiftSound(.4);}}}
function wxUfoSound(v=1){if(!ctx||!soundOn)return;sfxTone(560,980,.2,'sine',.05*v);sfxTone(980,480,.22,'sine',.05*v,.2);sfxTone(480,1150,.32,'sine',.05*v,.42);}
function wxLiftSound(v=1){if(!ctx||!soundOn)return;sfxTone(260,1300,.5,'sine',.07*v);sfxTone(520,2100,.45,'triangle',.03*v,.05);}
// Regen- und Windrauschen (Weltkanal: im Menue stumm)
let wxAud=null;
function wxAudio(rain,wind){if(!ctx)return;if(!wxAud){const b=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const mk=(type,f,q,f2)=>{const s=ctx.createBufferSource();s.buffer=b;s.loop=true;const a=ctx.createBiquadFilter();a.type=type;a.frequency.value=f;a.Q.value=q;const g=ctx.createGain();g.gain.value=0;s.connect(a);
   if(f2){const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=f2;a.connect(lp);lp.connect(g);}else a.connect(g);g.connect(worldGain);s.start(0,Math.random()*1.5);return g;};
  wxAud={rain:mk('highpass',1300,.5,7200),wind:mk('lowpass',360,1.4)};}
 const t=ctx.currentTime,on=soundOn&&state!=='paused';wxAud.rain.gain.setTargetAtTime(on?rain*.085:0,t,.4);wxAud.wind.gain.setTargetAtTime(on?wind*.16:0,t,.25);}
// Rennen: Plan waehlen (Zeitfahren/Wiesnland/aus: ruhig), Themawerte merken
// R60 Strecken-Ereignisse: Delfine (Bucht), Diamantstaub und Lawine (Eisstock-See), Goetterstrahlen und Tauben (Riesendom).
// Meeresleuchten faerbt Wasser und Wellen der Bucht (updateR60), hier nur Leuchtpunkte ueber dem Wasser.
const wxDiamond=wxPointsMesh(LITE?60:140,true);{const u=wxDiamond.material.uniforms;u.uCol.value.setHex(0xe8fbff);u.uBlink.value=1;u.uSway.value=.5;u.uBox.value.set(50,18,50);u.uOff.value.set(0,4,0);u.uSize.value=.22;u.uVel.value.set(.3,-.25,.2);}
const wxGlowDots=wxPointsMesh(LITE?50:110,true);{const u=wxGlowDots.material.uniforms;u.uCol.value.setHex(0x3ad8ff);u.uBlink.value=1;u.uSway.value=1.2;u.uBox.value.set(70,3,70);u.uOff.value.set(0,-1.2,0);u.uSize.value=.4;u.uVel.value.set(0,0,0);}
let wxDolph=null,wxDoves=null,wxRays=null,wxAval=null;
function wxDolphinsTick(dt,amt){if(!wxDolph){if(amt<.02)return;const p=[[new T.SphereGeometry(1,14,10).scale(.55,.5,2.2),0x6a8aa8],[new T.SphereGeometry(1,10,8).scale(.42,.3,1.6).translate(0,-.22,.2),0xe8eef4],[new T.ConeGeometry(.3,.9,4).translate(0,.65,-.2),0x5a7a98],
  [new T.ConeGeometry(.2,.6,6).rotateX(Math.PI/2).translate(0,0,2.5),0x6a8aa8],[new T.BoxGeometry(1.6,.08,.5).translate(0,0,-2.3),0x5a7a98]];
  const geo=r60Bake(p),m=r60Mat({roughness:.3});wxDolph=[];for(let i=0;i<5;i++){const o=new T.Mesh(geo,m);o.visible=false;wxRoot.add(o);wxDolph.push({o,t:-Math.random()*3,a:0,r:0});}}
 const pl=racers[0];for(const d of wxDolph){if(amt<.02||!pl){d.o.visible=false;continue;}d.t-=dt;if(d.t<=-.2){d.t=2.4;const a=camH+(Math.random()-.5)*1.4;d.ang=Math.atan2(pl.z+Math.cos(a)*80,pl.x+Math.sin(a)*80);d.r=(222+Math.random()*26)*WK;d.dir=Math.random()<.5?1:-1;}
  const k=1-d.t/2.4;if(d.t<0){d.o.visible=false;continue;}const ang=d.ang+d.dir*k*.06,x=Math.cos(ang)*d.r,z=Math.sin(ang)*d.r,y=(r60?.seaY??-2.7)+Math.sin(k*Math.PI)*5.5-.8;
  d.o.visible=true;d.o.position.set(x,y,z);d.o.rotation.set(0,0,0);d.o.rotation.order='YXZ';d.o.rotation.y=Math.atan2(-Math.sin(ang)*d.dir,Math.cos(ang)*d.dir);d.o.rotation.x=-Math.cos(k*Math.PI)*.9;d.o.scale.setScalar(1.3*Math.min(1,amt*1.5));
  if(Math.abs(k-.92)<.02&&soundOn&&ctx&&frame%2===0&&Math.hypot(x-pl.x,z-pl.z)<120)sfxNoise(.3,2200,500,.05,1);}}
function wxDovesTick(dt,amt){if(!wxDoves){if(amt<.02)return;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,0,.35,-1.1,.25,-.1,-.3,0,-.3,0,0,.35,.3,0,-.3,1.1,.25,-.1],3));g.computeVertexNormals();
  const im=new T.InstancedMesh(g,new T.MeshBasicMaterial({color:0xfdfbf4,side:T.DoubleSide}),LITE?30:60);im.frustumCulled=false;im.visible=false;wxRoot.add(im);wxDoves={im,t:0};}
 const on=amt>.02;wxDoves.im.visible=on;if(!on)return;wxDoves.t+=dt;const pl=racers[0];if(!pl)return;const cam=camera.position,n=wxDoves.im.count;
 for(let i=0;i<n;i++){const ring=i%3,a=wxDoves.t*(.22+ring*.05)+i*.61,r=26+ring*12+Math.sin(i)*4,cx=cam.x+Math.sin(camH)*55,cz=cam.z+Math.cos(camH)*55;
  _kv.set(cx+Math.cos(a)*r,(pl.y||0)+18+ring*6+Math.sin(wxDoves.t*1.3+i)*2.5,cz+Math.sin(a)*r);_ke.set(0,-a,Math.sin(wxDoves.t*2+i)*.2);_kq.setFromEuler(_ke);const s=.9*Math.min(1,amt*1.4);_ks.set(s,s*Math.sin(wxDoves.t*14+i*1.9),s);_m.compose(_kv,_kq,_ks);wxDoves.im.setMatrixAt(i,_m);}
 wxDoves.im.instanceMatrix.needsUpdate=true;
 if(amt>.5&&soundOn&&ctx&&state==='race'){wxDoves.bell=(wxDoves.bell||0)-dt;if(wxDoves.bell<=0){wxDoves.bell=9+Math.random()*5;[392,523,659].forEach((f,i)=>sfxTone(f,f*.995,1.6,'sine',.05,i*.9));}}}
// Goetterstrahlen: lange, weiche Lichtbahnen aus Richtung der tiefen Sonne ueber die Stadt
function wxRaysTick(dt,amt){if(!wxRays){if(amt<.02)return;const tex=canvasTex(64,256,(q,w,h)=>{const g=q.createLinearGradient(0,0,w,0);g.addColorStop(0,'rgba(255,220,150,0)');g.addColorStop(.5,'rgba(255,230,170,1)');g.addColorStop(1,'rgba(255,220,150,0)');q.fillStyle=g;q.fillRect(0,0,w,h);
   const v=q.createLinearGradient(0,0,0,h);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.2,'rgba(0,0,0,1)');v.addColorStop(.85,'rgba(0,0,0,1)');v.addColorStop(1,'rgba(0,0,0,0)');q.globalCompositeOperation='destination-in';q.fillStyle=v;q.fillRect(0,0,w,h);});
  wxRays=[];for(let i=0;i<6;i++){const m=new T.Mesh(new T.PlaneGeometry(18+i*4,260),new T.MeshBasicMaterial({map:tex,color:0xffd89a,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false}));m.visible=false;wxRoot.add(m);wxRays.push(m);}}
 const on=amt>.02,sp=theme.sunPos||[0,1,0],sv=_wv1.set(sp[0],sp[1],sp[2]).normalize(),cam=camera.position;
 wxRays.forEach((m,i)=>{m.visible=on;if(!on)return;const a=(i-2.5)*.16+Math.sin(performance.now()*.0002+i)*.03,side=_wv2.set(-sv.z,0,sv.x).normalize();
  m.position.set(cam.x+sv.x*110+side.x*(i-2.5)*26,cam.y+46+Math.sin(i*1.7)*8,cam.z+sv.z*110+side.z*(i-2.5)*26);m.lookAt(cam);m.rotateZ(Math.atan2(sv.y,Math.hypot(sv.x,sv.z))*.5+a);m.material.opacity=amt*(.09+.05*Math.sin(performance.now()*.0007+i*1.3));});}
// Lawine: an einem Berg im Blickfeld rollt eine Schneewolke herab, der Boden bebt kurz
function wxAvalancheTick(dt,amt){if(!wxAval){if(amt<.3)return;const tex=radialSprite([[0,'rgba(255,255,255,.95)'],[.5,'rgba(240,246,255,.6)'],[1,'rgba(240,246,255,0)']],1,[0,0,0]);scene.remove(tex);
  wxAval={parts:Array.from({length:14},(_,i)=>{const s=tex.clone();s.material=tex.material.clone();s.visible=false;wxRoot.add(s);return s;}),t:-1,next:3};}
 const A=wxAval;if(amt<.3){for(const s of A.parts)s.visible=false;A.t=-1;return;}
 if(A.t<0){A.next-=dt;if(A.next<=0&&state==='race'){A.t=0;A.next=14+Math.random()*8;const a=camH+(Math.random()-.5)*1.1,r=290*WK;A.p=new T.Vector3(camera.position.x+Math.sin(a)*r,110,camera.position.z+Math.cos(a)*r);
   if(soundOn&&ctx){sfxNoise(3.2,220,50,.2,.6);}shake=Math.max(shake,.22);toast('🏔 LAWINE AM BERG!',1.4,'good');}}
 if(A.t>=0){A.t+=dt;const k=A.t/6;A.parts.forEach((s,i)=>{const f=clamp(k*1.3-i*.05,0,1);s.visible=f>0&&f<1;if(!s.visible)return;s.position.set(A.p.x+(i%4-1.5)*12,A.p.y-f*95+Math.sin(i)*6,A.p.z+(i%3-1)*10);s.scale.setScalar(20+f*38+(i%5)*4);s.material.opacity=Math.min(1,(1-f)*1.6)*amt;});
  if(A.t>6.5){A.t=-1;for(const s of A.parts)s.visible=false;}}}
function wxR60Tick(dt,m,pts){pts(wxDiamond,m.diamonddust||0,.95);pts(wxGlowDots,course&&course.theme==='beach'?m.seaglow||0:0,.9);wxDolphinsTick(dt,m.dolphins||0);wxDovesTick(dt,m.doves||0);wxRaysTick(dt,m.godrays||0);wxAvalancheTick(dt,m.avalanche||0);}

function wxStart(){wxRestore();wxSeed=net&&net.setup?net.setup.wx>>>0:(Math.random()*4294967296)>>>0;const calm=!wxOn||isTT()||worldMode;
 wxRacePlan=calm?null:weatherPlan(wxSeed,course.theme,LAPS);wxPlan=wxRacePlan||calmPlan(LAPS);wxLapSeen=0;wxNewsT=-1;wxBoltT=5+Math.random()*4;wxThunderT=-1;wxFlash=0;wxStripKey='';
 const th=theme;wxBase={bg:scene.background,fog:scene.fog?{o:scene.fog,c:scene.fog.color.getHex(),n:scene.fog.near,f:scene.fog.far}:null,look:{skyTop:th.skyTop,skyBottom:th.skyBottom,fog:th.fog,fogNear:th.fogNear,fogFar:th.fogFar,exposure:th.exposure,hemiSky:th.hemiSky,hemiInt:th.hemiInt,sunCol:th.sunCol,sunInt:th.sunInt,head:th.head!==undefined?th.head:(th.stars?90:0),dark:WX_DARK.includes(course.theme),stars:!!th.stars,sunGlow:!th.stars}};
 const a=Math.random()*TAU;wxWindDir=a;wxActive=!!wxRacePlan;if(stats)stats.wxRough=!!wxRacePlan&&wxRacePlan.some(s=>s.wx==='storm'||s.wx==='snow'||s.wx==='sand');wxUfo.userData.placed=false;wxUfo.userData.show=0;wxUfo.visible=false;wxStrip();}
function wxRestore(){const wasOn=!!wxBase;if(wxBase){if(scene.background===wxSkyTex)scene.background=wxBase.bg;const fo=wxBase.fog;if(fo){fo.o.color.setHex(fo.c);fo.o.near=fo.n;fo.o.far=fo.f;}}
 wxBase=null;wxExp=wxHead=null;wxGripMul=1;wxWindA=0;wxM=null;wxActive=false;wxSkyKey='';
 if(course&&theme&&wasOn){applyTheme();stars.material.opacity=.95;moon.material.opacity=1;sunGlow.material.opacity=1;}
 for(const o of wxRoot.children)o.visible=false;moon.material.color.setHex(0xffffff);wxUfo.userData.placed=false;wxUfo.userData.show=0;if(wxAud)wxAudio(0,0);const el=$('wxStrip');if(el)el.hidden=true;}
function wxToggle(on){wxOn=on;store.set('weather',on);const b=$('pauseWx');if(b){b.textContent='Wetter: '+(on?'WECHSELHAFT':'AUS');b.setAttribute('aria-pressed',String(on));}
 if(state==='race'||state==='countdown'||state==='paused'){if(!on){const keep=wxRacePlan;wxRestore();wxRacePlan=keep;wxPlan=calmPlan(LAPS);if(stats)stats.wxRough=false;}else if(!isTT()&&!worldMode){const keep=wxRacePlan||weatherPlan(wxSeed,course.theme,LAPS),bg=scene.background;wxStart();wxRacePlan=keep;wxPlan=keep;wxActive=true;wxBase.bg=bg;wxStrip();}}}
function wxStrip(){const el=$('wxStrip');if(!el)return;if(!wxActive){el.hidden=true;return;}const p=racers[0],cur=p?Math.min(LAPS-1,Math.max(0,lap(p,length)-1)):0,key=cur+'|'+wxSeed;if(key===wxStripKey&&!el.hidden)return;wxStripKey=key;
 const fc=forecast(wxPlan,course.theme);el.innerHTML=fc.map((f,i)=>`<i class="${i===cur?'on':i<cur?'past':''}">${f}</i>`).join('<b>›</b>');el.hidden=false;el.title='Wetterbericht: '+fc.join(' → ');}
function wxTick(dt,now){const live=state==='race'||state==='countdown'||state==='paused'||state==='finished';
 if(!live){if(wxActive||wxBase)wxRestore();return;}if(!wxActive||!wxBase)return;const p=racers[0];if(!p)return;
 const prog=state==='countdown'?0:Math.max(0,p.distance/length),m=weatherMix(wxPlan,p.finishTime!==null?LAPS-.5:prog),L=weatherLook(wxBase.look,m),t=(now/1000)%600;wxM=m;
 // Licht, Himmel, Nebel (unter Wasser uebernimmt das Element-Wasser Nebel und Hintergrund)
 const uw=elemFx&&elemFx.uw>0,f=scene.fog;
 if(!uw){const key=L.skyTop+'|'+L.skyBottom;if(key!==wxSkyKey){wxSkyKey=key;wxSky(L.skyTop,L.skyBottom);}scene.background=wxSkyTex;if(f){f.color.setHex(L.fog);f.near=L.fogNear;f.far=L.fogFar;}}
 wxFlash=Math.max(0,wxFlash-dt*3.2);hemi.color.setHex(L.hemiSky);hemi.intensity=L.hemiInt*(1+wxFlash*1.8*calmK());sun.color.setHex(L.sunCol);sun.intensity=L.sunInt;
 wxExp=L.exposure;wxHead=L.head;
 // R53 Kirmes bei Nacht (Nutzerhinweis "wirkt nachts so dunkel"): Lichterglanz von Buden, Riesenrad und Achterbahn -
 // Umgebungslicht bleibt heller und warm-rosa, dazu ein bunter Fuelllicht-Schein und etwas mehr Belichtung
 if(course.theme==='fair'){const n=Math.min(1,(m.night||0)+(m.dusk||0)*.4);if(n>.01){hemi.intensity*=1+n*1.25;hemi.color.lerp(_col.setHex(0xffc8ee),n*.4);fill.color.setHex(0xff7ad0);fill.intensity=theme.fillInt+n*1.5;wxExp+=n*.14;}else{fill.color.setHex(theme.fillCol);fill.intensity=theme.fillInt;}}
 // R55 Wueste bei Nacht: heller Sand wirft Mondlicht zurueck - mehr Umgebungslicht in warmem Blaugrau
 if(course.theme==='canyon'){const n=Math.min(1,(m.night||0)+(m.dusk||0)*.3);if(n>.01){hemi.intensity*=1+n*.55;hemi.color.lerp(_col.setHex(0xc8c0e8),n*.35);wxExp+=n*.08;}}
 if(tunnelMix<=.002){renderer.toneMappingExposure=wxExp;headlight.intensity=wxHead;}
 stars.visible=L.stars>.02;stars.material.opacity=.95*L.stars;moon.visible=L.moon>.02;moon.material.opacity=L.moon;sunGlow.visible=L.sunGlow>.02;sunGlow.material.opacity=L.sunGlow;
 // Fahrphysik fuer alle gleich: nasse Fahrbahn, Windboeen
 wxGripMul=wxGrip(m);wxWindA=wxWind(m,elapsed);
 // Teilchen um die Kamera
 const cam=camera.position,px=renderer.domElement.height*.5/Math.tan(camera.fov*Math.PI/360),wx=Math.sin(wxWindDir),wz=Math.cos(wxWindDir),gust=Math.abs(wxWindA);
 const rain=Math.min(1,(m.rain||0)+(m.storm||0)*.15),inT=tunnelMix>.5;
 wxRain.visible=rain>.02&&!inT&&!uw;if(wxRain.visible){const u=wxRain.material.uniforms;u.uTime.value=t;u.uAmt.value=rain*(m.storm>.5?1:.8);u.uCam.value.copy(cam);u.uVel.value.set(wx*(3+gust*4),-34,wz*(3+gust*4));u.uBox.value.set(64,34,64);
  u.uCol.value.setHex(L.L<.4?0x9fb4d8:0xd4e4ff);u.uAlpha.value=L.L<.4?.34:.5;}
 const fl=[['snow',m.snow||0],['sand',m.sand||0],['ash',m.ash||0]].sort((a,b)=>b[1]-a[1])[0];
 wxFlakes.visible=fl[1]>.02&&!inT&&!uw;if(wxFlakes.visible){const u=wxFlakes.material.uniforms,k=fl[0];u.uTime.value=t;u.uAmt.value=fl[1];u.uCam.value.copy(cam);u.uPx.value=px;
  if(k==='snow'){u.uVel.value.set(wx*1.5,-3.1,wz*1.5);u.uBox.value.set(58,30,58);u.uSway.value=1.1;u.uSize.value=.27;u.uCol.value.setHex(0xffffff);u.uAlpha.value=.92;}
  else if(k==='sand'){u.uVel.value.set(wx*(16+gust*5),-.6,wz*(16+gust*5));u.uBox.value.set(58,16,58);u.uSway.value=.6;u.uSize.value=.11;u.uCol.value.setHex(0xe7b779);u.uAlpha.value=.75;}
  else{u.uVel.value.set(wx*1.2+.4,-2.2,wz*1.2);u.uBox.value.set(58,30,58);u.uSway.value=.7;u.uSize.value=.15;u.uCol.value.setHex(0x6b5a55);u.uAlpha.value=.85;}}
 const bugs=m.fireflies||0;wxBugs.visible=bugs>.02&&!inT;if(wxBugs.visible){const u=wxBugs.material.uniforms;u.uTime.value=t;u.uAmt.value=bugs;u.uCam.value.copy(cam);u.uPx.value=px;u.uAlpha.value=1;}
 // R53 Strecken-Ereignisse: Laternen, Irrlichter, Luftballons, Feuerwerk, Ballone, Fledermaeuse, Komet, Vulkan, Blutmond
 const pts=(o,a,alpha=1)=>{o.visible=a>.02&&!inT&&!uw;if(o.visible){const u=o.material.uniforms;u.uTime.value=t;u.uAmt.value=a;u.uCam.value.copy(cam);u.uPx.value=px;u.uAlpha.value=alpha;}};
 pts(wxLanterns,m.lanterns||0);pts(wxWisps,m.wisps||0);for(const q of wxParty)pts(q,m.partyballoons||0,.95);
 wxFireworks(dt,m.fireworks||0);wxBalloonsTick(dt,m.balloons||0);wxBatsTick(dt,m.batswarm||0);wxCometTick(dt,m.comet||0);wxEruptionTick(dt,m.eruption||0);wxR60Tick(dt,m,pts);
 moon.material.color.setHex(L.moonCol??0xffffff);
 // Nasse Gischt hinter den Karts in Kameranaehe
 if(rain>.3&&frame%3===0)for(const r of racers){if(r.air||Math.abs(r.speed)<8||!nearPlayer(r,35))continue;const h=r.h||0;emit(r.x-Math.sin(h)*1.3,(r.y||0)+.25,r.z-Math.cos(h)*1.3,0xe4f2ff,(Math.random()-.5)*2,1.6+Math.random()*1.6,(Math.random()-.5)*2,.28);}
 // Gewitter: Blitz am Horizont, Donner mit Laufzeit
 if((m.storm||0)>.5&&state==='race'){wxBoltT-=dt;if(wxBoltT<=0){wxBoltT=4.5+Math.random()*5.5;wxStrike();}}
 if(wxBolt.visible){wxBolt.userData.t-=dt;wxBolt.children.forEach(c=>c.visible=Math.sin(wxBolt.userData.t*95)>-.4);if(wxBolt.userData.t<=0)wxBolt.visible=false;}
 if(wxThunderT>=0){wxThunderT-=dt;if(wxThunderT<0)SFX.thunder();}
 // Himmelsereignisse
  // Himmelsbilder stehen in der Blickrichtung, in der sie auftauchen (sonst oft hinter der Kamera), und bleiben dort fest
 const skyDir=(o,on)=>{if(!on){o.userData.dir=undefined;return false;}if(o.userData.dir===undefined)o.userData.dir=camH;return true;};
 wxBow.visible=skyDir(wxBow,(m.rainbow||0)>.02);if(wxBow.visible){const a=wxBow.userData.dir,cy=(p.y||0)-10;wxBow.material.uniforms.uAmt.value=m.rainbow*(1-wxOc(m)*.45);wxBow.position.set(cam.x+Math.sin(a)*340,cy,cam.z+Math.cos(a)*340);wxBow.lookAt(cam.x,cy,cam.z);}
 const au=m.aurora||0;for(const a of wxAurora){a.visible=skyDir(a,au>.02);if(!a.visible)continue;const k=a.userData.k,ang=a.userData.dir+k*2.1;a.material.uniforms.uTime.value=t+k*7;a.material.uniforms.uAmt.value=au*(k?.75:1);a.position.set(cam.x+Math.sin(ang)*430,(p.y||0)+95+k*18,cam.z+Math.cos(ang)*430);a.lookAt(cam.x,(p.y||0)+120,cam.z);}
 const me=m.meteors||0;for(const s of wxMeteors){const u=s.userData;if(u.t<0){if(me>.3&&Math.random()<dt*.9){const a=Math.random()*TAU,r=380;u.p.set(cam.x+Math.sin(a)*r,190+Math.random()*90,cam.z+Math.cos(a)*r);u.v.set(-Math.sin(a)*.4+(Math.random()-.5),-.45,-Math.cos(a)*.4+(Math.random()-.5)).normalize().multiplyScalar(260);u.t=.9;}else{s.visible=false;continue;}}
  u.t-=dt;u.p.addScaledVector(u.v,dt);if(u.t<0){s.visible=false;continue;}s.visible=true;s.position.copy(u.p);_wv1.copy(u.p).project(camera);_wv2.copy(u.p).addScaledVector(u.v,-.2).project(camera);
  s.material.rotation=Math.atan2(_wv1.y-_wv2.y,(_wv1.x-_wv2.x)*camera.aspect);s.scale.set(70,5,1);s.material.opacity=Math.min(1,u.t*3)*me;}
 const ec=m.eclipse||0;wxMoonDisc.visible=ec>.02&&sunGlow.visible;if(wxMoonDisc.visible){const k=Math.min(1,ec*1.25);wxMoonDisc.position.copy(sunGlow.position).multiplyScalar(.97);wxMoonDisc.position.x+=(1-k)*70;wxMoonDisc.position.y+=(1-k)*25;wxMoonDisc.scale.setScalar(sunGlow.scale.x*.62);}
 wxUfoTick(dt,t,m.ufo||0);
 // Ansage beim Rundenwechsel (nach der Rundenzeit) und Wetterbericht im HUD
 const lp=state==='race'?Math.floor(prog):0;if(lp>wxLapSeen&&lp<LAPS){wxLapSeen=lp;const news=lapNews(wxPlan,lp);if(news){wxNews=news;wxNewsT=1.7;}}
 if(wxNewsT>=0){wxNewsT-=dt;if(wxNewsT<0&&state==='race')toast(wxNews,2.4,'good');}
 wxStrip();wxAudio(rain,Math.min(1,gust/2.6*((m.storm||0)+(m.sand||0))+(m.snow||0)*.25));}
const wxOc=m=>Math.min(1,Math.max((m.clouds||0)*.45,(m.rain||0)*.75,m.storm||0));
{const b=$('pauseWx');if(b){b.onclick=()=>wxToggle(!wxOn);b.textContent='Wetter: '+(wxOn?'WECHSELHAFT':'AUS');b.setAttribute('aria-pressed',String(wxOn));}}
// ---------- Controller (R50): Gamepad-API mit Standard-Belegung (pad.mjs). Stick/Steuerkreuz lenken stufenlos,
// A/RT Gas, B/LT Bremse, LB/RB Hops & Drift (in der Luft Trick), X/Y Item, START Pause, VIEW/SELECT zuruecksetzen.
// Im Menue: links/rechts Strecke, hoch/runter Klasse, LB/RB Modus, A/START los, Y Erfolge; in Fenstern
// hoch/runter waehlen, A bestaetigen, B zurueck. Rumpeln bei Treffern, Turbos und harten Landungen.
const PAD_TXT={tip:'Stick lenken · A/RT Gas · B/LT Bremse · LB/RB Hops & Drift · in der Luft = Trick · X Item · START Pause · VIEW Zurücksetzen',
 menu:'🎮 Steuerkreuz/Stick wählen · Ⓐ OK · Ⓑ zurück · LB/RB Modus · ☰ Start · Ⓧ Röhren-Look'};const padOrig={};
function padUi(on){if(padHints===on)return;padHints=on;if(on)$('tvHint')?.remove();document.body.classList.toggle('pad',on);
 for(const [sel,key] of [['#raceTip','tip'],['#menu .controls','menu']]){const el=document.querySelector(sel);if(!el)continue;if(on){if(padOrig[key]===undefined)padOrig[key]=el.innerHTML;el.textContent=PAD_TXT[key];}else if(padOrig[key]!==undefined)el.innerHTML=padOrig[key];}
 const k=document.querySelector('#item kbd');if(k)k.textContent=on?'X':'SPACE';if(owPortalAt){owHudKey='';}}
function rumble(strong,weak,ms){const a=pad.gp?.vibrationActuator;if(!a||!padHints)return;try{a.playEffect?.('dual-rumble',{startDelay:0,duration:ms,strongMagnitude:strong,weakMagnitude:weak})?.catch?.(()=>{});}catch(e){}}
function padFeel(p){const s=pad.feel||(pad.feel={stun:0,boost:0,air:false,airT:0});
 if(p.stun>0&&!(s.stun>0))rumble(.85,.6,260);else if(p.boost>s.boost+.05)rumble(.12,.5,160);else if(s.air&&!p.air&&s.airT>.55)rumble(.4,.2,100);
 s.stun=p.stun;s.boost=p.boost;s.air=!!p.air;s.airT=p.airT||0;}
const padModalIds=['achPanel','pausePanel','result','ceremony','online'],PAD_BACK={achPanel:'achClose',result:'home',ceremony:'cerHome',online:'onClose'};
// R61 Controller-Menue (Xbox/Edge, Fernseher): raeumliche Fokus-Navigation ueber alle sichtbaren Knoepfe, gelber Fokusrahmen
const TV=isConsole(navigator.userAgent,location.search);if(TV){document.body.classList.add('tv');const h=document.createElement('div');h.id='tvHint';h.innerHTML='🎮 Controller in Edge auf der Xbox: <b>Menü-Taste ☰ gedrückt halten</b> → „Spielsteuerung verwenden“ – dann läuft alles übers Pad';document.body.append(h);}
function padRoot(){const m=padModal();return m||(state==='menu'?$('menu'):null);}
function padFocusables(root){return [...root.querySelectorAll('button,input,select')].filter(b=>!b.disabled&&!b.closest('[hidden]')&&b.getClientRects().length&&getComputedStyle(b).visibility!=='hidden');}
function padMark(el){if(pad.focusEl&&pad.focusEl!==el)pad.focusEl.classList.remove('padf');pad.focusEl=el||null;if(!el)return;el.classList.add('padf');try{el.focus({preventScroll:true});}catch(e){}el.scrollIntoView?.({block:'nearest',inline:'nearest'});}
function padPress(el){if(!el)return;if(el.tagName==='SELECT'){const n=el.options.length;if(n){el.selectedIndex=(el.selectedIndex+1)%n;el.dispatchEvent(new Event('change',{bubbles:true}));}return;}if(el.tagName==='INPUT'){el.focus();return;}el.click();}
function padNavStep(root,dir){const els=padFocusables(root);if(!els.length)return;const cur=pad.focusEl&&els.includes(pad.focusEl)?pad.focusEl:null;
 if(!cur){const st=root.id==='menu'?(document.body.classList.contains('menu-simple')?$('qOnline'):$('start')):els.find(e=>e.tagName==='BUTTON');padMark(els.includes(st)?st:els[0]);SFX.tick();return;}
 const rects=els.map(e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};}),i=navPick(rects[els.indexOf(cur)],rects,dir);if(i>=0){padMark(els[i]);SFX.tick();}}
function padModal(){for(const id of padModalIds){const m=$(id);if(m&&!m.hidden)return m;}return null;}
function padButtons(m){return [...m.querySelectorAll('button')].filter(b=>!b.hidden&&b.offsetParent!==null&&!b.disabled);}
function padFocus(m,d){const bs=padButtons(m);if(!bs.length)return;const i=bs.indexOf(document.activeElement),n=i<0?(d>0?0:bs.length-1):cycle(i,d,bs.length);bs[n].focus({preventScroll:true});bs[n].scrollIntoView?.({block:'nearest'});}
function padMenu(a){const md=[...document.querySelectorAll('#modes .mode')];
 if(a==='lb'||a==='rb'){const i=Math.max(0,md.findIndex(b=>b.dataset.mode===mode));md[cycle(i,a==='rb'?1:-1,md.length)]?.click();SFX.tick();}
 else if(a==='a'){const el=pad.focusEl;if(el&&$('menu').contains(el)&&padFocusables($('menu')).includes(el))padPress(el);else $('start').click();}
 else if(a==='start')$('start').click();else if(a==='y')$('achBtn')?.click();else if(a==='x'){crtSet(!crtOn);toast(crtOn?'📺 Röhren-Look an':'Röhren-Look aus',1);}}
function padAction(a,now){const m=padModal();
 if(m){if(m!==pad.modal){pad.modal=m;pad.modalT=now;}
  if(a==='a'){if(now-pad.modalT<600)return;const els=padFocusables(m);padPress(pad.focusEl&&els.includes(pad.focusEl)?pad.focusEl:els.find(e=>e.tagName==='BUTTON'));}
  else if(a==='b'||a==='start'){if(m.id==='pausePanel')pause();else if(a==='b')$(PAD_BACK[m.id])?.click();}
  return;}
 if(state==='menu'){if(['b','a'].includes(a)&&cheatStep(a))return;padMenu(a);return;}
 if(state==='race'||state==='countdown'){
  if(a==='start')pause();
  else if(a==='y'&&worldMode&&owPortalAt&&state==='race')owEnterTrack(owPortalAt.ti);
  else if(a==='x'||a==='y')itemDown();
  else if(a==='back'&&state==='race'){racers[0].safeD=lapDist(racers[0].distance);respawn(racers[0]);}}}
function padPoll(now){if(pad.modal&&pad.modal.hidden){if(pad.modal.contains(document.activeElement))document.activeElement.blur();pad.modal=null;}   // Fokus nicht im geschlossenen Fenster lassen (Leertaste loeste sonst den Knopf aus)
 if(!navigator.getGamepads)return;let gp=null;try{gp=pickPad(navigator.getGamepads());}catch(e){}
 if(!gp){if(pad.gp){pad.gp=null;pad.prev=null;pad.steer=0;pkeys.clear();}return;}
 const cur=readPad(gp),evs=padPressed(cur,pad.prev),rel=pad.prev&&((pad.prev.hold.x&&!cur.hold.x)||(pad.prev.hold.y&&!cur.hold.y));pad.prev=cur;pad.gp=gp;if(rel)itemUp();
 if(cur.active&&!padHints){padUi(true);if(!padToasted){padToasted=true;toast('🎮 Controller bereit',1.4,'good');}}
 const drive=state==='race'||state==='countdown';pad.steer=drive?cur.steer:0;pkeys.clear();
 if(drive){if(cur.gas)pkeys.add('ArrowUp');if(cur.brake)pkeys.add('ArrowDown');if(cur.drift)pkeys.add('ShiftLeft');}
 const nroot=padRoot();if(nroot){const dir=cur.hold.up?'up':cur.hold.down?'down':cur.hold.left?'left':cur.hold.right?'right':null,st=navRepeat(pad.navSt||(pad.navSt={}),dir,now/1000);if(st)padNavStep(nroot,st);}else pad.navSt=null;
 if(introT>.3&&evs.length){introT=.3;stopFanfare(.12);}
 if(state==='menu')for(const a of evs)if(['up','down','left','right'].includes(a))cheatStep(a);
 for(const a of evs)if(!nroot||!['up','down','left','right'].includes(a))padAction(a,now);
 if(state==='race'&&racers[0])padFeel(racers[0]);else pad.feel=null;}
addEventListener('gamepaddisconnected',()=>{pad.gp=null;pad.prev=null;pad.steer=0;pkeys.clear();if(padHints)padUi(false);});
const keyButtons=[...document.querySelectorAll('[data-key]')];
function touchRefresh(){tkeys.clear();const els=new Set();for(const p of touchPtr.values()){if(!p.el)continue;els.add(p.el);for(const k of p.el.dataset.key.split(' '))tkeys.add(k);}for(const b of keyButtons)b.classList.toggle('down',els.has(b));}
function touchTarget(x,y,prev){const el=document.elementFromPoint(x,y)?.closest?.('[data-key]');if(el)return el;if(prev){const r=prev.getBoundingClientRect(),dx=Math.max(r.left-x,0,x-r.right),dy=Math.max(r.top-y,0,y-r.bottom);if(Math.hypot(dx,dy)<34)return prev;}return null;}
$('touch').addEventListener('pointerdown',e=>{const el=e.target.closest?.('[data-key]');if(!el)return;e.preventDefault();touchPtr.set(e.pointerId,{el});touchRefresh();});
addEventListener('pointermove',e=>{const p=touchPtr.get(e.pointerId);if(!p)return;const el=touchTarget(e.clientX,e.clientY,p.el);if(el!==p.el){p.el=el;touchRefresh();}},{passive:true});
const touchEnd=e=>{if(touchPtr.delete(e.pointerId))touchRefresh();};addEventListener('pointerup',touchEnd);addEventListener('pointercancel',touchEnd);
for(const b of keyButtons)b.oncontextmenu=e=>e.preventDefault();
let wantFs=false;
function enterFs(){const d=document.documentElement;if(!wantFs||document.fullscreenElement||!d.requestFullscreen)return;d.requestFullscreen({navigationUI:'hide'}).catch(()=>{});}
function armFs(){if(wantFs&&!document.fullscreenElement)addEventListener('pointerdown',enterFs,{once:true,capture:true});}
// Nach dem Drehen melden manche Browser die neue Groesse erst spaeter: zweimal nachmessen, Seite nie verschoben lassen
function onRotate(){for(const ms of [150,500])setTimeout(()=>{scrollTo(0,0);fixZoom();enterFs();armFs();resize();ohSync();},ms);}
// Blieb der Browser nach dem Drehen trotzdem gezoomt, setzt ein neu geschriebenes Viewport-Tag den Massstab auf 1 zurueck
function fixZoom(){const m=document.querySelector('meta[name=viewport]'),vv=window.visualViewport;if(!m||!vv||Math.abs(vv.scale-1)<.02)return;const c=m.content;m.content=c.replace('initial-scale=1','initial-scale=1.0001');requestAnimationFrame(()=>{m.content=c;});}
visualViewport?.addEventListener?.('resize',()=>{if(visualViewport.scale>1.01||visualViewport.scale<.99||scrollX||scrollY)scrollTo(0,0);resize();});
addEventListener('orientationchange',onRotate);screen.orientation?.addEventListener?.('change',onRotate);
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)armFs();setTimeout(resize,80);});
$('full').onclick=()=>{if(document.fullscreenElement){wantFs=false;document.exitFullscreen().catch(()=>{});}else{wantFs=true;enterFs();}};
const autoButton=document.createElement('button');autoButton.id='autoGas';
function setAutoGas(v){autoGas=v;store.set('autogas',v);document.body.classList.toggle('autogas',v);for(const b of [autoButton,$('pauseAutoGas')]){if(!b)continue;b.textContent='Auto-Gas: '+(v?'AN':'AUS');b.setAttribute('aria-pressed',String(v));}}
// Ein-Hand-Steuerung: Wischflaeche ueber dem Spielbild (unter Kopfzeile und Item-Blase), nur hochkant auf Touch
const ohPad=$('ohPad'),ohStick=$('ohStick'),ohKnob=ohStick.firstElementChild,ctrlButton=document.createElement('button');ctrlButton.id='ctrlMode';
const ohRadius=()=>clamp(innerWidth*.15,44,80);
function ohRelease(){oh.id=null;oh.steer=0;oh.drift=false;oh.full=0;oh.taps.clear();ohStick.classList.remove('on');}
let ohPref=store.get('onehand',true),hudMinPref=store.get('hudMin',true);
function ohSync(){const pref=ohPref,on=coarseInput&&pref&&innerHeight>innerWidth;if(on!==oh.on){oh.on=on;if(!on)ohRelease();}
 document.body.classList.toggle('onehand',on);
 for(const b of [ctrlButton,$('pauseCtrl')]){if(!b)continue;b.hidden=!coarseInput;b.innerHTML='<span class="pre">Hochkant: </span>'+(pref?'Ein-Hand':'Knöpfe');b.setAttribute('aria-pressed',String(pref));}
 // R52 Minimal-HUD (Nutzerwunsch: Anzeige im Rennen zu voll) - Platz, Runde, Item, Pause, Drift-Balken;
 // Zeit, Wetterleiste, Rivalen-Schild, Sporen, Tempo und Karte nur mit "Anzeige: VOLL" (Pause).
 // R53: auf allen Geraeten Standard (Desktop und quer ebenfalls, "ingame gui minimal")
 const hm=hudMinPref;document.body.classList.toggle('hudmin',hm);
 const hb=$('pauseHud');if(hb){hb.hidden=false;hb.textContent='Anzeige: '+(hudMinPref?'MINIMAL':'VOLL');hb.setAttribute('aria-pressed',String(hudMinPref));}}
function ohDraw(x,y){const R=ohRadius(),dx=clamp(x-oh.ax,-R,R);ohStick.style.transform=`translate(${oh.ax}px,${y}px)`;ohStick.style.setProperty('--r',R+'px');ohKnob.style.transform=`translateX(${dx}px)`;}
// Zeiten aus dem Ereignis-Zeitstempel (Beruehrung selbst), nicht aus dem Handler-Aufruf: ruckelt ein Bild, kaemen
// Aufsetzen und Loslassen sonst verspaetet an und ein kurzes Tippen zaehlte nicht als Hops
const evT=e=>e.timeStamp>0?e.timeStamp:performance.now();
ohPad.addEventListener('pointerdown',e=>{e.preventDefault();try{ohPad.setPointerCapture(e.pointerId);}catch{}const now=evT(e);
 if(oh.id!==null){oh.taps.set(e.pointerId,{x:e.clientX,y:e.clientY,t:now});return;}
 Object.assign(oh,{id:e.pointerId,x0:e.clientX,y0:e.clientY,ax:e.clientX,t0:now,moved:0,steer:0,full:0,item:false});ohStick.classList.add('on');ohDraw(e.clientX,e.clientY);});
ohPad.addEventListener('pointermove',e=>{if(e.pointerId!==oh.id)return;const R=ohRadius(),x=e.clientX,y=e.clientY;
 // Nullpunkt folgt dem Finger, sobald er ueber den vollen Ausschlag hinaus wischt: Gegenlenken wirkt sofort
 if(x-oh.ax>R)oh.ax=x-R;else if(oh.ax-x>R)oh.ax=x+R;
 oh.moved=Math.max(oh.moved,Math.hypot(x-oh.x0,y-oh.y0));const d=(x-oh.ax)/R,a=Math.abs(d);oh.steer=a<.08?0:-Math.sign(d)*Math.min(1,(a-.08)/.84);
 const up=oh.y0-y;if(!oh.item&&evT(e)-oh.t0<600&&up>54&&Math.abs(x-oh.x0)<up*.7){oh.item=true;use();}
 ohDraw(x,oh.y0);},{passive:true});
function ohUp(e){const now=evT(e);
 if(e.pointerId===oh.id){const tap=!oh.item&&now-oh.t0<280&&oh.moved<16;ohRelease();if(tap&&e.type==='pointerup')oh.hop=1;return;}
 const t=oh.taps.get(e.pointerId);if(t){oh.taps.delete(e.pointerId);if(e.type==='pointerup'&&now-t.t<280&&Math.hypot(e.clientX-t.x,e.clientY-t.y)<16)oh.hop=1;}}
ohPad.addEventListener('pointerup',ohUp);ohPad.addEventListener('pointercancel',ohUp);ohPad.oncontextmenu=e=>e.preventDefault();
// Flaeche verschwindet mit dem Finger drauf (Ziel, Pause): kein Finger darf "kleben" bleiben
ohPad.addEventListener('lostpointercapture',e=>{if(e.pointerId===oh.id)ohRelease();else oh.taps.delete(e.pointerId);});
addEventListener('blur',ohRelease);addEventListener('resize',ohSync);
ctrlButton.onclick=$('pauseCtrl').onclick=()=>{ohPref=!ohPref;store.set('onehand',ohPref);ohSync();};
if($('pauseHud'))$('pauseHud').onclick=()=>{hudMinPref=!hudMinPref;store.set('hudMin',hudMinPref);ohSync();};
autoButton.onclick=()=>setAutoGas(!autoGas);document.querySelector('.controls').after(autoButton,ctrlButton);ohSync();if($('pauseAutoGas'))$('pauseAutoGas').onclick=()=>setAutoGas(!autoGas);if(store.get('autogasV',0)<44){store.set('autogas',false);store.set('autogasV',44);}setAutoGas(store.get('autogas',false));

// ---------------------------------------------------------------- Laden & Start
const protoRecovery=createPrototypeRecovery(PROTO_FILES,P,()=>{
 // Auch im Menue vorgebaute Strecken enthalten sonst dauerhaft die alten Fallbacks.
 for(const i of [...worldCache.keys()])if(i!==builtSel)disposeCourse(i);
 if(state==='menu')buildCourse(true);else worldDirty=true;
});
const protoAll=Promise.all(PROTO_FILES.map(loadProto));
protoAll.then(()=>{protoRecovery.settle();
 try{buildItemThumbs();}catch(e){console.error('itemThumbs',e);}try{driverThumbs();}catch(e){console.error('driverThumbs',e);}});
Promise.race([protoAll,new Promise(r=>setTimeout(r,9000))]).finally(()=>{protoRecovery.snapshot();try{applyGfx();}catch(e){}buildCourse();resize();refreshMenu();try{driverThumbs();}catch(e){}try{buildItemThumbs();}catch(e){console.error('itemThumbs0',e);}readyPromise.then(()=>{updateCamera(1/60,true);try{renderer.render(scene,camera);}catch(e){}
 requestAnimationFrame(()=>{playBgm('menu');const l=$('loader');l.classList.add('done');setTimeout(()=>l.hidden=true,600);requestAnimationFrame(loop);setInterval(prebuildTick,900);
  // Grossbauten nachladen und die betroffenen Strecken neu bauen lassen
  Promise.all(LATE_FILES.map(loadProto)).then(()=>{for(let i=0;i<courses.length;i++){const hzC=courses[i].choco||courses[i].voxel||courses[i].city||courses[i].pixel||courses[i].bay2||courses[i].ice2||courses[i].stampers||courses[i].pipes||courses[i].cannons||courses[i].lasers||courses[i].lab||courses[i].gothic2||courses[i].eggs||courses[i].landmarks||courses[i].wiesn||courses[i].train||courses[i].towers||courses[i].cows||courses[i].beatgates||courses[i].hands||courses[i].lowgrav||courses[i].meteors||courses[i].theme==='lava'||courses[i].theme==='forest';if(!hzC&&courses[i].mansion===undefined&&courses[i].castle===undefined&&!(courses[i].builds||[]).length&&!(courses[i].coaster||[]).length)continue;if(i===builtSel){if(state==='menu')buildCourse(true);else worldDirty=true;}else disposeCourse(i);}
   // R54: auch das Wiesnland (Index 99) neu bauen - sonst blieben nach einem Erststart dort Platzhalter (blaue Scheibe statt Glockenschalter)
   if(builtSel===WORLD_IDX){if(state==='menu')buildCourse(true);else worldDirty=true;}else disposeCourse(WORLD_IDX);});});});});

// ---------------------------------------------------------------- R55 Online: Rennen und Wiesnland zu mehreren
// Peer-to-Peer ueber WebRTC (vendor/trystero.mjs; oeffentliche Nostr-Relays vermitteln nur den Verbindungsaufbau).
// Der Host legt den Raum an, waehlt Wiesnland oder eine Strecke und faehrt die Bots. Jeder Browser faehrt sein
// eigenes Kart und schickt ~15-mal pro Sekunde seinen Zustand; fremde Karts erscheinen 110 ms verzoegert und
// interpoliert (net.mjs). Items wirken beim Besitzer des getroffenen Karts: der Werfer meldet den Wurf, jeder
// Browser spielt ihn nach, getroffen wird aber nur, wer im eigenen Browser gefahren wird.
// Verbindungsaufbau (R55): Standard sind oeffentliche MQTT-Broker (schnell, zuverlaessig), ?net=nostr nimmt Nostr-Relays.
// Alle im Raum muessen dieselbe Variante nutzen - der Einladungslink traegt sie deshalb mit, wenn sie abweicht.
const NET_MODS={torrent:'./vendor/trystero-torrent.mjs',nostr:'./vendor/trystero.mjs'},netStrat=()=>{const q=new URLSearchParams(location.search).get('net');return NET_MODS[q]?q:'nostr';};
const NET_APP='wiesnkart-r55',
 // feste Relay-Auswahl: grosse, stabile Nostr-Relays (in der Standard-Auswahl fuer diese App-ID waren zwei defekt)
 NET_RELAYS=['wss://relay.damus.io','wss://nos.lol','wss://relay.primal.net','wss://nostr.mom','wss://relay.snort.social','wss://offchain.pub','wss://nostr.oxtr.dev','wss://purplerelay.com','wss://nostr.data.haus'];
// R60 Test: eigener Relay nur im Testmodus (?test=1&relay=ws://127.0.0.1:PORT) - fuer das Zwei-Browser-Pruefskript
const netRelays=()=>{const r=TEST&&new URLSearchParams(location.search).get('relay');return r&&/^wss?:\/\/(127\.0\.0\.1|localhost):\d+$/.test(r)?[r]:NET_RELAYS;};
const cleanName=s=>String(s??'').replace(/[^\p{L}\p{N} _.\-!?]/gu,'').replace(/\s+/g,' ').trim().slice(0,12);
const clampInt=(v,a,b)=>Math.max(a,Math.min(b,Math.floor(Number(v)||0)));
// R66: wer keinen Namen eingibt, bekommt automatisch einen Wiesn-Spitznamen (nick.mjs), einmal vergeben und gemerkt
const myNetName=()=>{let n=cleanName(store.get('netName',''));if(!n||n==='Fahrer'){n=cleanName(autoNick());store.set('netName',n);}return n;};
function netMsg(t){setText('onStatus',t||'');}
function netUrl(code){const st=netStrat(),u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('room',code);if(st!=='nostr')u.searchParams.set('net',st);return u.toString();}
async function netOpen(code,host,quick,pub){netLeave(true);netMsg('Verbinde …');if(pub)lobbyOpen();
 let TR;const strat=netStrat();try{TR=await (trysteroP??=import(NET_MODS[strat]));}catch(e){trysteroP=null;netMsg('Online-Modul konnte nicht geladen werden – Internetverbindung prüfen.');return;}
 let room;try{room=TR.joinRoom(strat==='nostr'?{appId:NET_APP,relayConfig:{urls:netRelays(),warnOnRelayFailure:false}}:{appId:NET_APP},'wk-'+code);}catch(e){netMsg('Verbindung fehlgeschlagen.');return;}
 const A={};for(const k of ['hello','lobby','setup','ready','go','st','item','bt','humans','chat','vote','lob'])A[k]=room.makeAction(k);
 net={room,A,code,host,pub:pub||null,selfId:TR.selfId,mySlot:host?0:-1,peers:new Map(),slots:new Map(),hostId:host?TR.selfId:null,lobby:null,setup:null,humans:new Map(),go:false,readySent:false,ready:new Set(),bufs:new Map(),sendT:0,goT:0,what:'world',track:0,humFinT:{},cycle:false,waiting:false,lobS:null,lobT:null};
 const hello=()=>({n:myNetName(),d:driverIndex,c:colorIndex,k:hasCrown()?1:0,t:myTopper(),v:NET_VER});
 room.onPeerJoin=id=>{if(!net)return;A.hello.send(hello(),{target:id}).catch(()=>{});if(net.host)netLobby();};
 room.onPeerLeave=id=>netPeerLeft(id);
 A.hello.onMessage=(d,{peerId})=>{if(!net||!d||typeof d!=='object')return;if(d.v!==NET_VER){if(net.host)netMsg('Ein Gast hat eine andere Spielversion – bitte neu laden.');return;}
  const known=net.peers.has(peerId);net.peers.set(peerId,{n:cleanName(d.n)||'Gast',d:clampInt(d.d,0,DRIVERS.length-1),c:clampInt(d.c,0,KART_COLORS.length-1),k:d.k?1:0,t:topperOk(d.t)});if(!known)chatSys(`👋 ${cleanName(d.n)||'Gast'} ist dabei`);if(net.host){netLobby();netDropIn(peerId);}netRenderLobby();};
 A.lobby.onMessage=(d,{peerId})=>{if(!net||!d||!Array.isArray(d.p))return;
  // Zwei Hosts im selben Raum (Schnell-online, beide starteten mit Bots): die kleinere Kennung bleibt Host, der andere
  // wechselt ohne neue Verbindung zum Gast und laesst sich per erneutem Hallo in die laufende Runde setzen
  if(net.host){if(String(peerId)<String(net.selfId)){net.host=false;net.hostId=peerId;net.slots=new Map();toast('Offene Runde gefunden – du steigst ein',1.6,'good');
    net.A.hello.send({n:myNetName(),d:driverIndex,c:colorIndex,k:hasCrown()?1:0,t:myTopper(),v:NET_VER},{target:peerId}).catch(()=>{});}else return;}
  if(net.quickT){clearTimeout(net.quickT);net.quickT=0;}net.hostId=peerId;
  net.lobby={p:d.p.slice(0,MAX_PLAYERS).map(q=>({id:String(q.id),s:clampInt(q.s,0,MAX_PLAYERS-1),n:cleanName(q.n)||'Gast',d:clampInt(q.d,0,DRIVERS.length-1),c:clampInt(q.c,0,KART_COLORS.length-1),tp:topperOk(q.t)||(q.k?'crown':null)})),w:d.w==='race'?'race':'world',t:clampInt(d.t,0,courses.length-1),cc:[50,100,150].includes(d.cc)?d.cc:100};
  net.lobby.st=d.st==='race'||d.st==='world'?d.st:'menu';
  const mine=net.lobby.p.find(q=>q.id===net.selfId);net.mySlot=mine?mine.s:-1;netMsg(mine?'Verbunden!':'Raum ist voll – du schaust zu.');netRenderLobby();
  // Warte-Kampf: der Raum faehrt gerade ein Rennen, fuer uns ist kein Platz frei (kein Setup kommt) - bis dahin kaempfen
  if(mine&&net.lobby.st==='race'&&!net.setup&&!net.waiting){const me0=net;setTimeout(()=>{if(net===me0&&!net.setup&&!net.waiting&&state==='menu')netWaitBattle();},2600);}};
 A.setup.onMessage=(d,{peerId})=>{if(!net||net.host||peerId!==net.hostId||!d||!Array.isArray(d.p))return;netStart(d);};
 A.ready.onMessage=(d,{peerId})=>{if(!net?.host)return;net.ready.add(peerId);netMaybeGo();};
 A.go.onMessage=(d,{peerId})=>{if(net&&peerId===net.hostId)net.go=true;};
 A.st.onMessage=(d,{peerId})=>netRecvState(d,peerId);
 A.item.onMessage=(d,{peerId})=>netRecvItem(d,peerId);
 A.bt.onMessage=(d,{peerId})=>{if(net&&battle&&d&&d.k==='ko'){const s=clampInt(d.s,0,FIELD_MAX-1),by=Number(d.by)>=0?clampInt(d.by,0,FIELD_MAX-1):null;if(net.humans.get(s)?.id===peerId||peerId===net.hostId)battleKo(s,by);return;}
  if(!net||peerId!==net.hostId||!d||!battle)return;if(d.k==='win')battleShowWin(d.s===-1?null:toLocal(clampInt(d.s,0,FIELD_MAX-1),net.mySlot));else if(d.k==='new')battleStart();};
 A.humans.onMessage=(d,{peerId})=>{if(!net?.setup||peerId!==net.hostId||!Array.isArray(d))return;netHumans(d);};
 A.chat.onMessage=(d,{peerId})=>netRecvChat(d,peerId);
 A.vote.onMessage=(d,{peerId})=>{if(!net?.host||!net.lobT||!d)return;const t=Number(d.t);if(!Number.isInteger(t)||t<0||t>=courses.length)return;net.lobT.votes[peerId]=t;netLobBroadcast();
  chatSys(`🗳 ${net.peers.get(peerId)?.n||'Gast'} stimmt für ${courses[t].name}`);};
 A.lob.onMessage=(d,{peerId})=>{if(!net||net.host||peerId!==net.hostId||!d)return;net.lobS={u:clamp(Number(d.u)||0,0,600000),t:clampInt(d.t,0,courses.length-1),c:Array.isArray(d.c)?d.c.slice(0,courses.length).map(x=>clampInt(x,0,99)):[],at:performance.now()};lobbyBar();};
 if(host){net.what=store.get('netWhat2','world');net.track=clampInt(selected===WORLD_IDX?lastRaceSel:selected,0,courses.length-1);netLobby();netMsg('Raum offen – schick den Link an deine Freunde.');}
 else if(quick){net.quick=true;netMsg('Suche Mitspieler … wenn niemand da ist, geht es gleich mit Bots los.');
  const me0=net;net.quickT=setTimeout(()=>{if(net!==me0||net.lobby||net.host)return;net.quickT=0;net.host=true;net.hostId=net.selfId;net.mySlot=0;
   if(net.pub&&net.pub.mode==='race'){net.what='world';cc=net.pub.cc||100;netLobby();netMsg('Niemand da – ab in die Lobby-Welt. Das Rennen startet gleich, wer dazukommt, fährt mit.');netHostGo();return;}
   net.what='battle';netLobby();netMsg('Niemand online – los geht es mit Bots. Wer dazukommt, steigt direkt ein.');netHostGo();},12000);}
 else{netMsg('Suche den Raum … das kann bis zu 20 Sekunden dauern.');const me0=net;setTimeout(()=>{if(net===me0&&!net.lobby)netMsg('Noch kein Host gefunden – Code prüfen oder den Host bitten, den Raum offen zu lassen.');},35000);}
 try{history.replaceState(null,'',netUrl(code));}catch{}netRenderLobby();netUi();
 // R60: eigener Raum - der Host faehrt sofort in die Lobby-Welt, Freunde steigen dort ein
 if(host&&!pub){const me0=net;setTimeout(()=>{if(net===me0&&net.host&&!net.setup)netHostGo();},500);}}
addEventListener('pagehide',()=>{try{net?.room.leave();}catch{}});
function netLeave(silent){if(!net)return;if(net.quickT)clearTimeout(net.quickT);try{net.room.leave();}catch{}for(const r of racers)r.net=false;net=null;netUi();lobbyBar();
 try{const u=new URL(location.href);u.searchParams.delete('room');history.replaceState(null,'',u.toString());}catch{}
 if(!silent)netMsg('');netRenderLobby();}
function netLobby(){if(!net?.host)return;net.slots=assignSlots([...net.peers.keys()],net.slots);
 const p=[{id:net.selfId,s:0,n:myNetName(),d:driverIndex,c:colorIndex,k:hasCrown()?1:0,t:myTopper()}];for(const [id,s] of net.slots){const q=net.peers.get(id);if(q)p.push({id,s,n:q.n,d:q.d,c:q.c,k:q.k?1:0,t:q.t||null});}
 net.lobby={p,w:net.what,t:net.track,cc,st:net.setup?(net.setup.w?'world':'race'):'menu'};net.A.lobby.send(net.lobby).catch(()=>{});netRenderLobby();}
function netHostGo(){if(!net?.host)return;netLobby();const L=net.lobby,world=L.w!=='race';
 net.cycle=L.w!=='battle';const setup={w:world?1:0,b:L.w==='battle'?1:L.w==='world'?2:0,lob:L.w==='world'?1:0,cyc:net.cycle?1:0,n:world?8:FIELD_MAX,t:L.t,cc:L.cc,wx:(Math.random()*4294967296)>>>0,p:L.p,k:Date.now()};
 net.A.setup.send(setup).catch(()=>{});netStart(setup);}
function netStart(s){if(!net)return;const p=s.p.slice(0,MAX_PLAYERS).map(q=>({id:String(q.id),s:clampInt(q.s,0,MAX_PLAYERS-1),n:cleanName(q.n)||'Gast',d:clampInt(q.d,0,DRIVERS.length-1),c:clampInt(q.c,0,KART_COLORS.length-1)}));
 const mine=p.find(q=>q.id===net.selfId);if(!mine){netMsg('Raum ist voll – du schaust zu.');return;}
 const tk=s.take&&!s.w&&[s.take.d,s.take.o,s.take.h,s.take.sp,s.take.el].every(Number.isFinite)?{d:+s.take.d,o:clamp(+s.take.o,-20,20),h:+s.take.h,sp:clamp(+s.take.sp,0,60),el:Math.max(0,+s.take.el),race:!!s.take.st,t:performance.now()}:null;
 net.setup={take:tk,w:s.w?1:0,b:s.w?clampInt(s.b,0,2):0,lob:s.w&&s.lob?1:0,cyc:s.cyc?1:0,n:s.w?8:clampInt(s.n||8,8,FIELD_MAX),late:s.late?1:0,t:clampInt(s.t,0,courses.length-1),cc:[50,100,150].includes(s.cc)?s.cc:100,wx:Number(s.wx)>>>0,p,k:Number(s.k)||0};
 net.mySlot=mine.s;net.humans=new Map(p.map(q=>[q.s,q]));net.go=false;net.waiting=false;net.humFinT={};net.lobS=null;net.myVote=undefined;net.readySent=false;net.ready=new Set();net.bufs=new Map();net.goT=performance.now()+15000;
 cc=net.setup.cc;mode=net.setup.w?(net.setup.b===1?'world':'roam'):'single';gp={active:false,race:0,points:{}};if(!net.setup.w)selected=net.setup.t;
 document.querySelectorAll('#modes .mode').forEach(x=>{const on=x.dataset.mode===mode;x.classList.toggle('selected',on);x.setAttribute('aria-pressed',String(on));});
 $('online').hidden=true;start();if(net.setup.b===2)battleStart(true);else if(net.setup.b)battleStart();else battleStop();
 if(net.setup.lob){if(net.host)netLobbyStart();chatSys('🎡 Lobby-Welt: Portale = Stimme für die nächste Strecke, Arena = kämpfen');}else if(!net.setup.w)chatSys(`🏁 Rennen: ${courses[net.setup.t].icon} ${courses[net.setup.t].name}`);lobbyBar(true);
 // laufendes Rennen: kein eigener Countdown, sofort ins Rennen und das Kart des Bots uebernehmen
 if(net.setup.take&&net.setup.take.race){countdown=.01;toast('Du steigst ins laufende Rennen ein!',2,'good');}}
function netTakeOver(){const T0=net?.setup?.take;if(!T0)return;net.setup.take=null;const p=racers[0];if(!p)return;
 posAt(T0.d,T0.o,0,_agP);Object.assign(p,{distance:T0.d,offset:T0.o,x:_agP.x,z:_agP.z,h:T0.h,speed:T0.sp,vx:Math.sin(T0.h)*T0.sp,vz:Math.cos(T0.h)*T0.sp,y:undefined,vy:0,air:false,airT:0,stun:0,safeD:lapDist(T0.d),boost:0,driftDir:0,drift:0});
 if(T0.race)elapsed=T0.el+(performance.now()-T0.t)/1000;stats.lapStart=elapsed;p.lapDirty=true;vertical(p,1/60);syncKart(p,0);updateCamera(1,true);}
function netMaybeGo(){if(!net?.host||net.go||!net.setup||!net.readySent)return;
 const all=net.setup.p.every(q=>q.id===net.selfId||!net.peers.has(q.id)||net.ready.has(q.id));
 if(all||performance.now()>net.goT){net.go=true;net.A.go.send({}).catch(()=>{});}}
// Wartet im Countdown, bis alle ihre Strecke gebaut haben; der Host gibt dann gemeinsam frei
function netWaitGo(){if(!net.readySent){net.readySent=true;if(net.host){net.ready.add(net.selfId);}else net.A.ready.send({}).catch(()=>{});}netMaybeGo();
 if(!net.host&&(net.setup.late||performance.now()>net.goT+10000))net.go=true;setText('message',net.go?'':'Warte auf Mitspieler …');}
function netPeerLeft(id){if(!net)return;const name=net.peers.get(id)?.n||'Jemand';net.peers.delete(id);net.ready.delete(id);
 if(id===net.hostId&&!net.host){toast('Der Host hat den Raum verlassen – es geht allein weiter',2.4,'bad');netLeave(true);netMsg('Der Host hat den Raum verlassen.');return;}
 for(const [g,h] of net.humans)if(h.id===id){net.humans.delete(g);const r=racers[toLocal(g,net.mySlot)];if(r&&net.host)r.net=false;}
 if(state==='race'||state==='countdown')toast(`${name} ist raus – ein Bot übernimmt`,1.6);chatSys(`👋 ${name} ist gegangen`);
 if(net.host){net.slots.delete(id);netLobby();netMaybeGo();}netRenderLobby();}
// Startaufstellung: wer faehrt Platz g? Menschen aus dem Setup, sonst Bot mit festem Namen, Fahrer und Lack
function netSlot(id){const g=toGlobal(id,net.mySlot),h=net.humans.get(g);
 return h?{human:true,g,n:h.n,d:h.d,c:KART_COLORS[h.c]?.c??AI_COLORS[(g+10)%11]}:{human:false,g,n:AI_NAMES[g]||'Bot',d:AI_DRIVERS[g]??0,c:AI_COLORS[(g+10)%11]};}
function netTag(r,text){const u=r.mesh.userData;if(u.netTag){r.mesh.remove(u.netTag);u.netTag.material.map.dispose();u.netTag.material.dispose();u.netTag=null;}if(!text)return;
 const tex=canvasTex(256,64,(q,w,h)=>{q.font='900 italic 34px Rubik, "Baloo 2", sans-serif';q.textAlign='center';q.textBaseline='middle';q.lineWidth=9;q.strokeStyle='#14264a';q.strokeText(text,w/2,h/2+2);q.fillStyle='#ffffff';q.fillText(text,w/2,h/2+2);});
 const sp=new T.Sprite(new T.SpriteMaterial({map:tex,depthWrite:false,transparent:true}));sp.scale.set(3.4,.85,1);sp.position.set(0,3.1,0);sp.renderOrder=5;r.mesh.add(sp);u.netTag=sp;}
function netSend(){const now=performance.now();if(now-net.sendT<1000/SEND_HZ)return;net.sendT=now;
 const lvl=r=>r.driftDir?({mini:1,super:2,ultra:3}[miniTurbo(r.drift)?.[2]]||0):0,out=[packKart(racers[0],net.mySlot,lvl(racers[0]))];
 if(net.host)for(const r of racers)if(r.id!==0&&!r.net)out.push(packKart(r,toGlobal(r.id,net.mySlot),lvl(r)));
 net.A.st.send(out).catch(()=>{});}
// Nur der Besitzer darf ein Kart melden: Menschen sich selbst, Bots der Host
const netOwns=(g,peerId)=>{const h=net.humans.get(g);return h?h.id===peerId:peerId===net.hostId;};
function netRecvState(d,peerId){if(!net?.setup||!Array.isArray(d))return;const now=performance.now();
 for(const a of d.slice(0,FIELD_MAX)){const s=unpackKart(a);if(!s||s.slot<0||s.slot>=FIELD_MAX||s.slot===net.mySlot||!netOwns(s.slot,peerId))continue;
  if(s.fin!==null&&net.humans.has(s.slot)&&net.humFinT[s.slot]===undefined)net.humFinT[s.slot]=now;
  const id=toLocal(s.slot,net.mySlot);let b=net.bufs.get(id);if(!b)net.bufs.set(id,b=snapBuf());pushSnap(b,now,s);}}
function netDrive(r,dt){const b=net?.bufs.get(r.id),s=b&&sampleSnap(b,performance.now()-INTERP_MS);
 if(s){r.x=s.x;r.y=s.y;r.z=s.z;r.h=s.h;r.speed=s.speed;r.vx=Math.sin(s.h)*s.speed;r.vz=Math.cos(s.h)*s.speed;r.distance=s.distance;r.offset=s.offset;const f=s.flags;
  r.driftDir=f&NF.drift?(f&NF.driftR?1:-1):0;r.boost=f&NF.boost?.25:0;r.air=!!(f&NF.air);r.stun=f&NF.stun?.25:0;r.shield=f&NF.shield?1:0;r.mega=f&NF.mega?1:0;r.shrink=f&NF.shrink?1:0;r.braking=!!(f&NF.brake);{const o=orbitOf(f);r.netOrbit=o.n;r.netOrbitK=o.red?'red3':'green3';}
  if(s.fin!==null&&r.finishTime===null&&!worldMode)r.finishTime=s.fin;r.mesh.visible=true;
  if(battle&&s.hearts!==null&&s.hearts!==r.hearts){const lost=r.hearts>s.hearts;r.hearts=s.hearts;r.out=s.hearts===0;heartTag(r);if(lost)heartPop(r);}
  else if(battle&&battle.open&&s.hearts===null&&r.hearts!==undefined){r.hearts=undefined;r.out=false;heartTag(r);}}
 syncKart(r,dt);}
function netItem(r,res){const G=id=>toGlobal(id,net.mySlot),m={s:G(r.id),k:res.type};
 if((res.type==='shell'||res.type==='red3')&&res.target!==undefined)m.g=G(res.target);
 if(res.charges!==undefined)m.c=res.charges;if(res.back)m.b=1;
 if(res.type==='storm')m.h=res.hit.map(h=>[G(h.id),h.blocked?1:0]);
 if(res.type==='ink')m.i=res.targets.map(G);
 net.A.item.send(m).catch(()=>{});}
function netRecvItem(d,peerId){if(!net?.setup||!d||typeof d.k!=='string')return;const g=clampInt(d.s,0,FIELD_MAX-1);if(g===net.mySlot||!netOwns(g,peerId))return;
 const u=racers[toLocal(g,net.mySlot)],L=x=>toLocal(clampInt(x,0,FIELD_MAX-1),net.mySlot),own=r=>r&&!r.net&&r.finishTime===null;if(!u)return;
 if(d.k==='banana')dropBanana(u);else if(d.k==='bomb')throwBomb(u);else if(d.k==='mega'){burst(u,0xff4a3d,16);if(nearPlayer(u,60))SFX.mega();}
 else if(d.k==='shell'){const t=d.g===undefined?undefined:L(d.g);fireShell(u,t);}
 else if(d.k==='red3'){const t=d.g===undefined?undefined:L(d.g);fireShell(u,t,'red');u.netOrbit=clampInt(d.c,0,3);u.netOrbitK='red3';}
 else if(d.k==='green3'){fireGreen(u,!!d.b);u.netOrbit=clampInt(d.c,0,3);u.netOrbitK='green3';}
 else if(d.k==='fake')dropFake(u);
 else if(d.k==='spiky')fireSpiky(u);
 else if(d.k==='storm'){const hit=(Array.isArray(d.h)?d.h:[]).slice(0,FIELD_MAX).map(q=>({id:L(Array.isArray(q)?q[0]:q),blocked:!!(Array.isArray(q)&&q[1])}));
  for(const q of hit){const k=racers[q.id];if(!own(k)||q.blocked)continue;if(k.shield>0){q.blocked=true;continue;}k.shrink=Math.max(k.shrink||0,SHRINK_T);k.stun=Math.max(k.stun,.8);k.driftDir=0;k.drift=0;k.item=null;k.charges=0;}
  stormStrike(u,hit);}
 else if(d.k==='ink'){const ids=(Array.isArray(d.i)?d.i:[]).slice(0,FIELD_MAX).map(L);for(const id of ids){const k=racers[id];if(!k)continue;spawnInkcap(k);if(own(k)&&!(k.shield>0))k.ink=INK_T;}
  if(ids.includes(0)&&racers[0].ink>0){inkSplash();SFX.ink();toast('TINTE! 🖋',1.1,'bad');}}}
// Einsteigen in eine laufende Wiesnland-Runde (R55): der Host gibt dem Neuen den Platz eines Bots und schickt ihm das Setup
// R58: auch laufende Rennen - der Neue uebernimmt das Kart eines Bots samt Lage, Runde und Rennzeit
function netDropIn(peerId){const S=net.setup;if(!S||(state!=='race'&&state!=='countdown'))return;
 // R60: wer in die Lobby-Welt kommt, soll noch abstimmen koennen - mindestens 25 s bis zum Rennen
 if(net.lobT){net.lobT.until=Math.max(net.lobT.until,performance.now()+25000);netLobBroadcast();}
 // schon eingetragen (z. B. zweiter Hallo nach einem Host-Wechsel): Setup nur erneut schicken
 if(!S.p.some(q=>q.id===peerId)){const s=net.slots.get(peerId),q0=net.peers.get(peerId);if(s===undefined||!q0)return;const q={id:peerId,s,n:q0.n,d:q0.d,c:q0.c};
  if(!S.w&&racers[toLocal(s,net.mySlot)]?.finishTime!==null)return;   // Bot schon im Ziel: der Neue faehrt das naechste Rennen
  S.p=[...S.p.filter(x=>x.s!==s),q];netHumans(S.p);net.A.humans.send(S.p).catch(()=>{});toast(`${q.n} steigt ein!`,1.6,'good');}
 let take=null;if(!S.w){const q=S.p.find(x=>x.id===peerId),r=q&&racers[toLocal(q.s,net.mySlot)];if(!r||r.finishTime!==null)return;
  take={d:+r.distance.toFixed(2),o:+r.offset.toFixed(2),h:+r.h.toFixed(3),sp:+Math.max(0,r.speed).toFixed(2),el:+elapsed.toFixed(2),st:state==='race'?1:0};}
 net.A.setup.send({...S,late:1,take},{target:peerId}).catch(()=>{});}
// Wer faehrt welchen Platz (nach Ein- und Ausstiegen): Namensschilder und Besitz der Karts nachziehen
function netHumans(list){const p=list.slice(0,MAX_PLAYERS).map(q=>({id:String(q.id),s:clampInt(q.s,0,MAX_PLAYERS-1),n:cleanName(q.n)||'Gast',d:clampInt(q.d,0,DRIVERS.length-1),c:clampInt(q.c,0,KART_COLORS.length-1),k:q.k?1:0,t:topperOk(q.t)}));
 net.setup.p=p;net.humans=new Map(p.map(q=>[q.s,q]));
 for(const r of racers){if(r.id===0)continue;const g=toGlobal(r.id,net.mySlot),h=net.humans.get(g);r.net=!!h||!net.host;r.topper=h?(h.t||(h.k?'crown':null)):null;r.drv=h?h.d:undefined;r.name=h?h.n:(AI_NAMES[g]||'Bot');netTag(r,h?((r.topper?topperById(r.topper)?.icon+' ':'')+h.n):'');}}
// ---------------------------------------------------------------- R55 Herzerl-Schlacht (Wiesnland online, auch mit Bots)
// Jedes Kart traegt drei Lebkuchenherzen; schwere Treffer (Items, Stampfer, Blitz ...) kosten eins, wer keine mehr hat,
// faehrt als Zuschauer weiter. Es gewinnt, wer zuletzt noch Herzen hat - nach 3 Minuten, wer die meisten hat.
const heartTex=[];
function heartTexFor(n){if(heartTex[n])return heartTex[n];heartTex[n]=canvasTex(256,64,(q,w,h)=>{q.textAlign='center';q.textBaseline='middle';
 if(n===0){q.font='900 italic 34px Rubik, sans-serif';q.lineWidth=8;q.strokeStyle='#14264a';q.strokeText('K.O.',w/2,h/2+2);q.fillStyle='#ffc83a';q.fillText('K.O.',w/2,h/2+2);return;}
 q.font='44px sans-serif';const t='❤'.repeat(n);q.lineWidth=6;q.strokeStyle='#5a1c10';q.strokeText(t,w/2,h/2+3);q.fillStyle='#e8352e';q.fillText(t,w/2,h/2+3);});return heartTex[n];}
function heartTag(r){const u=r.mesh.userData;if(!battle||!Number.isFinite(r.hearts)){if(u.heartTag){r.mesh.remove(u.heartTag);u.heartTag.material.dispose();u.heartTag=null;}return;}
 if(!u.heartTag){const sp=new T.Sprite(new T.SpriteMaterial({depthWrite:false,transparent:true}));sp.scale.set(2.6,.65,1);sp.position.set(0,2.45,0);sp.renderOrder=5;r.mesh.add(sp);u.heartTag=sp;}
 const tex=heartTexFor(Math.max(0,Math.min(HEARTS,r.hearts)));if(u.heartTag.material.map!==tex){u.heartTag.material.map=tex;u.heartTag.material.needsUpdate=true;}}
function heartPop(r){burst(r,0xe8352e,16);if(nearPlayer(r,60))SFX.hit(.6);}
function battleStart(open){document.body.classList.toggle('battle',!open);battle={t0:elapsed,over:false,next:0,shown:null,open:!!open,score:new Map()};
 for(const r of racers){r.fighter=!!open&&r.id!==0&&!r.net&&r.id%3===1;r.hearts=open&&!r.fighter?undefined:HEARTS;r.out=false;r.bInv=0;r._bs=0;r.koT=0;heartTag(r);}arenaPlace();
 $('battleHud').hidden=!!open;if(!open)toast('⚔ KOTZHÜGEL FIGHT! Triff die anderen – wer zuletzt Herzen hat, gewinnt',2.6,'good');battleHud();}
function battleStop(){document.body.classList.remove('battle');if(!battle)return;battle=null;for(const r of racers){r.hearts=undefined;r.out=false;r.fighter=false;heartTag(r);}$('battleHud').hidden=true;}
function battleTick(r){if(battle.open){if(arenaOn())openArenaTick(r);return;}if(arenaOn()){arenaWall(r);if(!r.out)arenaPickup(r);}
 if(battle.over||!(r.hearts>0)){r._bs=r.stun||0;return;}
 if(battleHit(r,r._bs,elapsed)){heartTag(r);heartPop(r);if(r.hearts===0){r.out=true;r.item=null;r.charges=0;}
  if(r.id===0){shake=Math.max(shake,.4);toast(r.hearts?`❤ HERZ VERLOREN! Noch ${r.hearts}`:'💨 K.O.! Du schaust jetzt zu',1.6,'bad');battleHud();}}
 r._bs=r.stun||0;}
function battleHud(){if(!battle)return;const p=racers[0];
 if(battle.open){const inA=!!p&&p.hearts!==undefined;$('battleHud').hidden=!inA;if(!inA)return;let best=null,bv=0;for(const [g,n] of battle.score)if(n>bv){bv=n;best=g;}
  setText('bHearts',p.hearts>0?'❤'.repeat(p.hearts):'K.O.');setText('bInfo',`Deine K.O.s: ${battle.score.get(koSlot(0))||0}${best!==null?` · 👑 ${koName(best)} ${bv}`:''}`);return;}
 const alive=racers.filter(r=>r.hearts>0).length,left=Math.max(0,BATTLE_SECS-(elapsed-battle.t0));
 setText('bHearts',p&&p.hearts>0?'❤'.repeat(p.hearts):'K.O.');setText('bInfo',`Noch ${alive} im Spiel · ${Math.floor(left/60)}:${String(Math.floor(left%60)).padStart(2,'0')}`);}
// Rundenende entscheidet der Host (ohne Netz: dieser Browser); danach nach 6 s die naechste Runde
function battleUpdate(){if(!battle||state!=='race')return;if(frame%15===0)battleHud();if(battle.open)return;const host=!net||!net.setup||net.host,share=!!(net&&net.setup);
 if(battle.over){if(host&&elapsed>battle.next){if(share)net.A.bt.send({k:'new'}).catch(()=>{});battleStart();}return;}
 if(!host||frame%10)return;const res=battleResult(racers.map(r=>({id:r.id,hearts:r.hearts||0})),elapsed-battle.t0>BATTLE_SECS);if(!res.done)return;
 battle.over=true;battle.next=elapsed+6;if(share)net.A.bt.send({k:'win',s:res.winner===null?-1:toGlobal(res.winner,net.mySlot)}).catch(()=>{});battleShowWin(res.winner);}
function battleShowWin(id){if(!battle)return;battle.over=true;const r=id===null||id===undefined?null:racers[id];
 const txt=!r?'Unentschieden!':r.id===0?'🏆 DU GEWINNST DEN KOTZHÜGEL FIGHT!':`🏆 ${r.name} gewinnt!`;toast(txt+' Nächste Runde gleich …',3.2,r&&r.id===0?'good':'');
 if(r){burst(r,0xffd452,30);if(r.id===0){SFX.cheer();stats&&(stats.battleWins=(stats.battleWins||0)+1);lbWin();}}}
// ---------------------------------------------------------------- R56 Graben-Flug: Stahlgraben einer Weltraum-Festung
// course.trench=[[cpVon,cpBis]]: senkrechte Waende links und rechts der Bahn (Paneele mit Lichtern), oben die
// Stationsoberflaeche mit Tuermen, Geschuetzen und Positionslichtern entlang der Kante. Reine Kulisse.
const TRENCH_H=24,TRENCH_W=12.5;
function trenchTex(light){return canvasTex(256,256,(q,w,h)=>{let sd=light?91:77;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
 q.fillStyle='#343a46';q.fillRect(0,0,w,h);
 for(let y=0;y<h;y+=32)for(let x=0;x<w;x+=64){const c=44+rnd()*34|0;q.fillStyle=`rgb(${c+6},${c+10},${c+20})`;q.fillRect(x+2,y+2,60,28);}
 q.strokeStyle='#161a22';q.lineWidth=2;for(let y=0;y<=h;y+=32){q.beginPath();q.moveTo(0,y);q.lineTo(w,y);q.stroke();}
 for(let i=0;i<12;i++){q.fillStyle='#1e222a';q.fillRect(rnd()*w,rnd()*h,18+rnd()*34,5+rnd()*12);}
 for(let i=0;i<16;i++){q.fillStyle=rnd()<.55?'#ff6a3a':'#9fd8ff';q.fillRect(rnd()*w,rnd()*h,7,3);}},true);}
function buildTrench(){if(!course.trench)return;posFix=elems.some(z=>z.plain)?trenchLift:null;try{buildTrenchInner();}finally{posFix=null;}}
function buildTrenchInner(){const TR=course.trench;const H=TRENCH_H,Wd=TRENCH_W;
 const wallMat=stdMat({map:trenchTex(false),roughness:.5,metalness:.55,emissive:0x1a1e28,side:T.DoubleSide}),topMat=stdMat({map:trenchTex(true),roughness:.6,metalness:.45});
 const floorMat=stdMat({map:trenchTex(false),color:0x8a93a6,roughness:.55,metalness:.5});
 const lights=[],towers=[],guns=[];let sd=202;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
 for(const [a,b] of TR){const d0=cpDist(a),d1=d0+lapDist(cpDist(b)-d0),steps=Math.max(8,Math.ceil((d1-d0)/3));
  for(const side of [-1,1]){const n=steps+1,v=new Float32Array(n*6),uv=new Float32Array(n*4),idx=[];
   for(let i=0;i<n;i++){const d=d0+(d1-d0)*i/steps,p=samplePos(d,side*Wd,_sp,-1.5);v.set([p.x,p.y,p.z,p.x,p.y+H+1.5,p.z],i*6);const u=(d-d0)/16;uv.set([u,0,u,(H+1.5)/16],i*4);
    if(i<steps){const k=i*2;idx.push(k,k+2,k+1,k+1,k+2,k+3);}
    if(i%3===0)lights.push([p.x,p.y+H+1.7,p.z]);}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(v,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
   const m=new T.Mesh(g,wallMat);m.receiveShadow=true;world.add(m);
   addStrip(strip(d0,d1,side*(Wd+40),80,H+.05,24,steps),topMat,false);
   if(side<0)addStrip(strip(d0,d1,0,Wd*2+1,-1.45,20,steps),floorMat,false);   // Stahlboden unter der Flugbahn
   for(let d=d0+6;d<d1-6;d+=9+rnd()*10){const off=side*(Wd+5+rnd()*62),p=samplePos(d,off,_sp,H);const hh=2+rnd()*rnd()*16;
    if(rnd()<.14)guns.push([p.x,p.y,p.z,rnd()*TAU]);else towers.push([p.x,p.y+hh/2,p.z,3+rnd()*8,hh,3+rnd()*8,rnd()*TAU]);}}}
 const tw=new T.InstancedMesh(new T.BoxGeometry(1,1,1),stdMat({map:trenchTex(true),roughness:.55,metalness:.5}),towers.length);
 towers.forEach(([x,y,z,sx,sy,sz,ry],i)=>{_m.compose(_v.set(x,y,z),_q.setFromEuler(_e.set(0,ry,0)),_s.set(sx,sy,sz));tw.setMatrixAt(i,_m);});tw.castShadow=tw.receiveShadow=true;world.add(tw);
 const gunMat=stdMat({color:0x2a2e38,roughness:.4,metalness:.7}),base=new T.InstancedMesh(new T.CylinderGeometry(1.6,2,2.2,12).translate(0,1.1,0),gunMat,guns.length),barrel=new T.InstancedMesh(new T.BoxGeometry(.5,.5,5).translate(0,2.6,1.6),gunMat,guns.length);
 guns.forEach(([x,y,z,ry],i)=>{_m.compose(_v.set(x,y,z),_q.setFromEuler(_e.set(0,ry,0)),_s.set(1,1,1));base.setMatrixAt(i,_m);barrel.setMatrixAt(i,_m);});world.add(base,barrel);
 // R58 Oberflaechenphase: solange der Flug ueber der Station liegt (Hoehenflug), ist der Graben mit Stahlplatten gedeckelt -
 // man fliegt ueber geschlossene Oberflaeche zwischen Tuermen und Geschuetzen, bis sich der Graben oeffnet und der Sturzflug beginnt
 for(const z of elems){if(z.kind!=='flug'||!z.plan.hi)continue;const c=z.plan.pieces.find(q=>q.type==='climb'),dI=z.plan.pieces.find(q=>q.key==='dropIn');if(!c||!dI)continue;
  const a=z.s+c.x1+4,b=z.s+dI.x0+6,n=Math.max(6,Math.ceil((b-a)/3));addStrip(strip(a,b,0,Wd*2+1,H-.35,24,n),topMat,false);
  // Warnstreifen und Leuchtband an der Grabenoeffnung
  const e=samplePos(b,0,new T.Vector3(),H),ang=sample(b).angle,bar=mesh(new T.BoxGeometry(Wd*2+1,.3,1.4),new T.MeshBasicMaterial({color:0xff5a3a}),world,e.x,e.y+.05,e.z);bar.rotation.y=ang;bar.castShadow=false;}
 const lm=new T.InstancedMesh(new T.BoxGeometry(.6,.35,.6),new T.MeshBasicMaterial({color:0xff5a3a}),lights.length);lights.forEach(([x,y,z],i)=>{_m.compose(_v.set(x,y,z),_q.identity(),_s.set(1,1,1));lm.setMatrixAt(i,_m);});world.add(lm);}
// ---------------------------------------------------------------- R56 Kotzhuegel-Fight-Arena (Wiesnland)
// Runder Festplatz auf der Wiese suedlich des Pilzbergs: Strohballen-Ring, Schild, Fass-Deckungen, zehn Itemboxen.
// Im Kampf bleiben alle Karts in der Arena (weiche Wand); Bots jagen frei statt der Strasse zu folgen.
const arenaOn=()=>!!(battle&&worldMode&&course&&course._arena);
function buildArena(){const A={...ARENA,boxes:[],g:new T.Group()};course._arena=A;world.add(A.g);
 const ground=new T.Mesh(new T.CircleGeometry(A.r+2.5,72),stdMat({map:speckleTexture('#d2ae74','#b89058',1400),roughness:.96}));ground.rotation.x=-Math.PI/2;ground.position.set(A.x,.05,A.z);ground.receiveShadow=true;A.g.add(ground);
 const n=Math.round(TAU*(A.r+1.6)/2.4),bale=new T.InstancedMesh(new T.BoxGeometry(2.2,1.15,1.2),stdMat({color:0xd8b04a,roughness:.95}),n);
 for(let i=0;i<n;i++){const a=i/n*TAU;_m.compose(_v.set(A.x+Math.sin(a)*(A.r+1.6),.58+(i%3===0?.0:0),A.z+Math.cos(a)*(A.r+1.6)),_q.setFromEuler(_e.set(0,a+Math.PI/2,0)),_s.set(1,1,1));bale.setMatrixAt(i,_m);}
 bale.castShadow=true;bale.receiveShadow=true;A.g.add(bale);
 // Schild zur Pilzberg-Seite
 const sign=new T.Group();sign.position.set(A.x,0,A.z+A.r+3.2);A.g.add(sign);const post=mat(0x5a3a22,{roughness:.8});
 for(const x of [-7.4,7.4])mesh(new T.CylinderGeometry(.22,.26,6.2,8),post,sign,x,3.1,0);
 mesh(new T.PlaneGeometry(15.4,2.4),label('KOTZHÜGEL FIGHT','#1a5fd0','#fffbe8',768,120),sign,0,5.1,.1);
 const back=mesh(new T.PlaneGeometry(15.4,2.4),label('KOTZHÜGEL FIGHT','#1a5fd0','#fffbe8',768,120),sign,0,5.1,-.1);back.rotation.y=Math.PI;
 // Deckung: sechs Fass-Stapel, dazwischen sechs Strohballen-Waelle (R57, fuer die groessere Arena) und ein Maibaum in der Mitte
 for(let k=0;k<6;k++){const a=k/6*TAU+Math.PI/6,x=A.x+Math.sin(a)*A.r*.42,z=A.z+Math.cos(a)*A.r*.42,b=r53Part('wiesn','WS_Barrels');if(b){b.position.set(x,0,z);b.rotation.y=a;A.g.add(b);}addObstacle(x,z,2.2);}
 {const wall=new T.InstancedMesh(new T.BoxGeometry(2.2,1.15,1.2),stdMat({color:0xd8b04a,roughness:.95}),6*4);let i=0;
  for(let k=0;k<6;k++){const a=k/6*TAU,cx=A.x+Math.sin(a)*A.r*.7,cz=A.z+Math.cos(a)*A.r*.7,tx=Math.cos(a),tz=-Math.sin(a);
   for(let j=0;j<4;j++){const s=(j-1.5)*2.25,x=cx+tx*s,z=cz+tz*s;_m.compose(_v.set(x,.58,z),_q.setFromEuler(_e.set(0,a+Math.PI/2,0)),_s.set(1,1,1));wall.setMatrixAt(i++,_m);addObstacle(x,z,1.25);}}
  wall.castShadow=wall.receiveShadow=true;A.g.add(wall);}
 if(P.landmarks){const mp=lmPart('LM_Maypole');if(mp){mp.position.set(A.x,0,A.z);A.g.add(mp);addObstacle(A.x,A.z,.9);}}
 // Itemboxen: zwoelf im Ring (zwischen den Ballen-Waellen), drei nahe der Mitte
 const spots=[];for(let k=0;k<12;k++){const a=(k+.5)/12*TAU;spots.push([A.x+Math.sin(a)*A.r*.62,A.z+Math.cos(a)*A.r*.62]);}
 for(let k=0;k<3;k++){const a=k/3*TAU+.5;spots.push([A.x+Math.sin(a)*10,A.z+Math.cos(a)*10]);}
 for(const [x,z] of spots){const g=P.itembox?cloneProto(P.itembox):new T.Mesh(new T.BoxGeometry(1.4,1.4,1.4),mat(0xffc83a,{emissive:0xffa51f,emissiveIntensity:.4}));g.position.set(x,1.2,z);A.g.add(g);A.boxes.push({x,z,g,cool:0});}
 arenaDeco(A);}
// R59 Arena-Kulisse: vier Tribuenen mit Publikum schraeg rund um den Strohballen-Ring (zur Mitte gedreht), dazwischen
// Wiesn-Buden, auf dem Ring ein Kranz weiss-blauer Fahnen. Die Fans huepfen, solange gekaempft wird.
function arenaDeco(A){const v=new T.Vector3(),fans=[];
 if(P.grandstand)for(let k=0;k<4;k++){const a=k/4*TAU+Math.PI/4,cx=A.x+Math.sin(a)*(A.r+13.5),cz=A.z+Math.cos(a)*(A.r+13.5),ry=Math.atan2(A.x-cx,A.z-cz),rx=Math.cos(ry),rz=-Math.sin(ry);
  for(const seg of [-STAND_SEG,0,STAND_SEG]){const g=cloneProto(P.grandstand);g.position.set(cx+rx*seg,0,cz+rz*seg);g.rotation.y=ry;A.g.add(g);g.updateMatrixWorld(true);
   for(let kk=-8;kk<=8;kk+=4){v.set(kk,0,-1.5).applyMatrix4(g.matrixWorld);addObstacle(v.x,v.z,2.8);}
   for(let row=0;row<4;row++)for(let i=0;i<18;i++){if((i*7+row*3+k)%5===0)continue;v.set(-8.1+i*.95,.45+row*.75+.16,-(row*1.1-.2)).applyMatrix4(g.matrixWorld);
    fans.push({x:v.x,y:v.y,z:v.z,ry:ry+Math.sin(i*7.3+row)*.35,ph:(i*1.7+row*2.3+seg+k)%TAU,col:FAN_COLS[(row*7+i*3+k)%FAN_COLS.length]});}}}
 if(P.spectator&&fans.length){const insts=[];P.spectator.traverse(o=>{if(!o.isMesh)return;const im=new T.InstancedMesh(o.geometry,o.material,fans.length);im.instanceMatrix.setUsage(T.DynamicDrawUsage);im.castShadow=false;im.frustumCulled=false;
  if(o.material.name==='FanCap'){const c=new T.Color();fans.forEach((f,i)=>im.setColorAt(i,c.setHex(f.col)));}A.g.add(im);insts.push(im);});A.crowd={fans,insts};arenaCrowd(A,0);}
 if(P.wiesn)for(const a of [Math.PI/2,Math.PI,Math.PI*1.5]){const st=r53Part('wiesn','WS_Stall');if(!st)break;const x=A.x+Math.sin(a)*(A.r+11),z=A.z+Math.cos(a)*(A.r+11);st.position.set(x,0,z);st.rotation.y=Math.atan2(A.x-x,A.z-z);A.g.add(st);addObstacle(x,z,4);}
 {const n=24,pole=new T.InstancedMesh(new T.CylinderGeometry(.07,.09,4.6,6).translate(0,2.3,0),mat(0x5a3a22,{roughness:.8}),n),flags=[new T.InstancedMesh(new T.PlaneGeometry(1.3,.8).translate(.65,4.1,0),stdMat({color:0x1a73e8,side:T.DoubleSide,roughness:.7}),n/2),new T.InstancedMesh(new T.PlaneGeometry(1.3,.8).translate(.65,4.1,0),stdMat({color:0xffffff,side:T.DoubleSide,roughness:.7}),n/2)];
  for(let i=0;i<n;i++){const a=(i+.5)/n*TAU,x=A.x+Math.sin(a)*(A.r+2.4),z=A.z+Math.cos(a)*(A.r+2.4);_m.compose(_v.set(x,0,z),_q.setFromEuler(_e.set(0,a,0)),_s.set(1,1,1));pole.setMatrixAt(i,_m);flags[i%2].setMatrixAt(i>>1,_m);}
  pole.castShadow=true;A.g.add(pole,...flags);A.flags=flags;}}
function arenaCrowd(A,t){const C=A.crowd;if(!C)return;const live=!!battle&&!battle.over;C.fans.forEach((f,i)=>{const y=f.y+(live?Math.abs(Math.sin(t*6.5+f.ph))*.42:Math.sin(t*1.8+f.ph)*.03);
 _e.set(0,f.ry,live?Math.sin(t*9+f.ph)*.12:0);_q.setFromEuler(_e);_m.compose(_v.set(f.x,y,f.z),_q,_s.set(1.5,1.5,1.5));for(const im of C.insts)im.setMatrixAt(i,_m);});for(const im of C.insts)im.instanceMatrix.needsUpdate=true;}
// R57: Start knapp an der Mitte vorbei ausgerichtet - sonst stand der Maibaum genau vor der Kamera
function arenaPlace(){const A=arenaOn()&&course._arena;if(!A)return;let k=0;const n=racers.length;
 // online nach globalem Platz: das eigene Kart ist lokal immer Nr. 0 - sonst starteten alle Menschen am selben Punkt
 for(const r of racers){const i=net&&net.setup?toGlobal(r.id,net.mySlot):k;k++;if(r.net||(battle.open&&!r.fighter))continue;const a=i/n*TAU,x=A.x+Math.sin(a)*A.r*.8,z=A.z+Math.cos(a)*A.r*.8,h=Math.atan2(A.x-x,A.z-z)+.42,d0=projectGlobal(x,z,0),pr=project(x,z,d0);
  Object.assign(r,{x,z,h,vx:0,vz:0,speed:0,y:0,vy:0,air:false,airT:0,stun:0,distance:pr.d,offset:pr.off,safeD:pr.d,lastGround:0,boost:0,driftDir:0,drift:0,item:null,charges:0,itemPending:false});}
 if(racers[0]&&!racers[0].net&&!battle.open){roulette=null;updateCamera(1,true);}}
function arenaWall(r){const A=course._arena,dx=r.x-A.x,dz=r.z-A.z,d=Math.hypot(dx,dz),lim=A.r-.8;if(d<=lim)return;
 const nx=dx/d,nz=dz/d;r.x=A.x+nx*lim;r.z=A.z+nz*lim;const vn=r.vx*nx+r.vz*nz;if(vn>0){r.vx-=nx*vn*1.4;r.vz-=nz*vn*1.4;if(r.id===0&&vn>6)SFX.bump(clamp(vn/25,.2,.7));}}
// R58: in der Arena nur Angriffs-Items (Such-Brezn, Pilzbombe, Banane als Falle, Riesenwuchs) - kein Turbo, kein Mass Bier
function arenaRoll(){const pool=['shell','shell','shell','red3','green3','green3','bomb','bomb','bomb','banana','fake','mega'];return pool[Math.floor(Math.random()*pool.length)];}
function arenaPickup(r){const A=course._arena;for(const b of A.boxes){if(b.cool>0)continue;const dx=r.x-b.x,dz=r.z-b.z;if(dx*dx+dz*dz>5.8)continue;
  b.cool=5;b.g.visible=false;burst({mesh:b.g},0xffd452,12);if(r.item||r.itemPending)continue;
  if(r.id===0){r.itemPending=true;roulette={t:.8,tick:0,final:arenaRoll()};SFX.pickup();}else{r.item=arenaRoll();r.charges=chargesFor(r.item);r.cooldown=.6+Math.random()*1.4;}}}
function arenaTick(dt){const A=course._arena;if(A.crowd&&(frame&1))arenaCrowd(A,elapsed);for(const b of A.boxes){if(b.cool>0){b.cool-=dt;if(b.cool<=0){b.g.visible=true;b.g.scale.setScalar(.01);}}
  else{b.g.rotation.y+=dt*1.6;const s=b.g.scale.x;if(s<1)b.g.scale.setScalar(Math.min(1,s+dt*3));b.g.position.y=1.2+Math.sin(elapsed*2.4+b.x)*.18;}}}
// Naechster Gegner mit Herzen (front: bevorzugt, was vor dem Kart liegt)
function arenaTarget(r,maxD=130,front=false){let best=null,bs=1e9;for(const q of racers){if(q===r||!(q.hearts>0))continue;const d=Math.hypot(q.x-r.x,q.z-r.z);if(d>maxD)continue;
  const a=Math.abs(angleDiff(Math.atan2(q.x-r.x,q.z-r.z),r.h)),sc=d*(front?1+a*1.2:1);if(sc<bs){bs=sc;best=q;}}return best;}
// Jagd-KI: Ziel alle 1-2 s neu - ohne Item die naechste Itembox, sonst (oder je nach Koennen) der naechste Gegner
function arenaAI(r,dt){const A=course._arena,sp=Math.max(0,r.speed);if(r.out)return {gas:false,brake:sp>1,steer:0,drift:false};
 if(!r.aT||elapsed>(r.aRe||0)){r.aRe=elapsed+1+Math.random()*1.2;let t=null;
  if(!r.item){let bd=1e9;for(const b of A.boxes){if(b.cool>0)continue;const d=Math.hypot(b.x-r.x,b.z-r.z);if(d<bd){bd=d;t=b;}}}
  const q=arenaTarget(r,140);if(q&&(!t||r.item||Math.random()<(r.skill||.5)*.4))t=q;r.aT=t||{x:A.x,z:A.z};}
 let tx=r.aT.x,tz=r.aT.z;if(r.aT.speed!==undefined){const lead=Math.min(1,Math.hypot(tx-r.x,tz-r.z)/40);tx+=r.aT.vx*lead*.5;tz+=r.aT.vz*lead*.5;}
 if(Math.hypot(r.x-A.x,r.z-A.z)>A.r*.9){tx=A.x;tz=A.z;}
 const err=angleDiff(Math.atan2(tx-r.x,tz-r.z),r.h);return {gas:true,brake:Math.abs(err)>2.2&&sp>13,steer:clamp(err*2.4,-1,1),drift:false};}
function arenaItems(r){if(!r.item||r.cooldown>0||r.itemPending||r.out)return;const it=r.item,q=arenaTarget(r,70);
 if(!q){if(it==='boost'||it==='triple'){useItem(r);r.cooldown=1.5;}return;}
 const d=Math.hypot(q.x-r.x,q.z-r.z),a=Math.abs(angleDiff(Math.atan2(q.x-r.x,q.z-r.z),r.h));
 const go=((it==='shell'||it==='red3')&&d<50&&a<1)||(it==='green3'&&d<30&&a<.3)||(it==='spiky'&&d<40&&a<.5)||(it==='fake'&&((d<16&&a>2.2)||Math.random()<.004))||(it==='bomb'&&d<28&&a<.55)||(it==='banana'&&((d<16&&a>2.2)||Math.random()<.004))||(it==='shield'&&d<16)||(it==='mega'&&d<24&&a<.8)||((it==='boost'||it==='triple')&&d<36&&a<.35);
 if(go){useItem(r);r.cooldown=.8+Math.random()*1.2;}}
// ---------------------------------------------------------------- R60 Lobby-Welt, offene Arena, Warte-Kampf, Chat
// Nutzerwunsch "verstaerkter Fokus auf online, die Open World ist die Lobby, Battle verkuerzt die Wartezeit":
//  - Renn-Raeume und eigene Raeume starten in der Lobby-Welt (Wiesnland mit allen Mitspielern). Ein Zeitgeber laeuft,
//    Portale sind Stimmen fuer die naechste Strecke; ist er abgelaufen, faehrt der Raum gemeinsam das Rennen und kehrt
//    danach automatisch in die Lobby-Welt zurueck.
//  - In der Lobby-Welt ist die Kotzhuegel-Arena offen: wer hineinfaehrt, kaempft mit drei Herzen, wer K.O. geht, fliegt raus
//    und darf nach kurzer Pause wieder rein. K.O.s zaehlen fuer den, der zuletzt getroffen hat (Arena-Koenig).
//  - Wer einem laufenden Rennen nicht mehr beitreten kann, faehrt bis zum naechsten gemeinsamen Start einen Kotzhuegel
//    Fight gegen Bots (Warte-Kampf).
//  - Chat mit Text, Emojis und Schnellspruechen (chat.mjs), Emojis und Sprueche erscheinen als Sprechblase ueber dem Kart.
const isLobby=()=>!!(net&&net.setup&&net.setup.lob);
const inArena=r=>{const A=course&&course._arena;return !!A&&Math.hypot(r.x-A.x,r.z-A.z)<A.r+.5;};
const arenaFor=r=>arenaOn()&&(!battle.open||!!r.fighter||inArena(r));
const nextPubTrack=()=>(net.pubTrack=((net.pubTrack??-1)+1)%courses.length);
// Host: Lobby-Zeitgeber starten (allein kuerzer); Vorwahl = naechste Strecke im Wechsel bzw. die gewaehlte
function netLobbyStart(){if(!net?.host)return;const humans=(net.setup?.p||[]).length;
 net.lobT={until:performance.now()+(humans>1?LOBBY_SECS:LOBBY_SOLO_SECS)*1000,votes:{},fallback:net.pub&&net.pub.mode==='race'?nextPubTrack():net.track,sent:0};netLobBroadcast();}
function netLobBroadcast(){const L=net?.lobT;if(!L)return;const res=voteTally(L.votes,courses.length,L.fallback);L.sent=performance.now();
 net.lobS={u:Math.max(0,L.until-performance.now()),t:res.track,c:res.counts,at:performance.now()};net.A.lob.send({u:Math.round(net.lobS.u),t:res.track,c:res.counts}).catch(()=>{});}
function netVote(ti){if(!isLobby())return false;net.myVote=ti;owPortalHide();
 if(net.host){if(net.lobT){net.lobT.votes[net.selfId]=ti;netLobBroadcast();}}else net.A.vote.send({t:ti}).catch(()=>{});
 toast(`🗳 Deine Stimme: ${courses[ti].icon} ${courses[ti].name}`,1.6,'good');SFX.pickup();lobbyBar(true);return true;}
// Menschen im Ziel (Host-Sicht): Zeitpunkt, zu dem jeder erstmals mit Zielzeit gemeldet wurde
function netFinishInfo(){const hs=[...(net.humans?.values()||[])];let first=null,last=null,all=hs.length>0;
 for(const h of hs){const t=h.s===net.mySlot?(racers[0]&&racers[0].finishTime!==null?(net.humFinT[h.s]??=performance.now()):null):net.humFinT[h.s];
  if(t===null||t===undefined){all=false;continue;}first=first===null?t:Math.min(first,t);last=last===null?t:Math.max(last,t);}
 return {first,last:all?last:null};}
// Jeden Frame: Host fuehrt Zeitgeber und Rueckkehr, alle zeigen die Lobby-Leiste
function netTick(now){if(!net)return;
 if(net.host&&isLobby()&&net.lobT&&(state==='race'||state==='countdown')){const L=net.lobT;if(now-L.sent>1000)netLobBroadcast();
  if(now>=L.until&&state==='race'){const res=voteTally(L.votes,courses.length,L.fallback);net.lobT=null;net.what='race';net.track=res.track;if(net.pub?.cc)cc=net.pub.cc;
   chatSys(`🏁 Auf geht's: ${courses[res.track].icon} ${courses[res.track].name}${res.votes?` (${res.counts[res.track]} ${res.counts[res.track]===1?'Stimme':'Stimmen'})`:''}`,true);netHostGo();return;}}
 if(net.host&&net.cycle&&net.setup&&!net.setup.w&&(state==='race'||state==='finished')){const f=netFinishInfo(),at=lobbyReturnAt(f.first===null?null:f.first/1000,f.last===null?null:f.last/1000);
  if(at!==null&&now/1000>=at){net.what='world';if(!net.pub)net.track=(net.setup.t+1+Math.floor(Math.random()*(courses.length-1)))%courses.length;netHostGo();return;}}
 if(frame%8===0)lobbyBar();}
// Lobby-Leiste oben: Zeit bis zum Rennen, Stimmen, Hinweis; der Host kann sofort starten
let lobbyKey='';
function lobbyBar(force){const el=$('lobbyBar');if(!el)return;const on=isLobby()&&(state==='race'||state==='countdown')&&!!net.lobS;
 if(!on){if(!el.hidden){el.hidden=true;lobbyKey='';}return;}const S=net.lobS,left=Math.max(0,S.u-(performance.now()-S.at))/1000,tc=courses[S.t]||courses[0],n=S.c?.[S.t]||0;
 const k=`${Math.ceil(left)}|${S.t}|${n}|${net.host?1:0}|${net.myVote??-1}`;if(k===lobbyKey&&!force)return;lobbyKey=k;el.hidden=false;
 const sec=Math.ceil(left);setText('lobTime',`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`);
 $('lobTrack').textContent=`${tc.icon} ${tc.name}${n?` · ${n} ${n===1?'Stimme':'Stimmen'}`:' · Vorschlag'}`;
 $('lobHint').textContent=net.myVote!==undefined?`Deine Stimme: ${courses[net.myVote].name} · ⚔ Arena = kämpfen`:'Fahr durch ein Portal = Stimme · ⚔ Arena = kämpfen';
 $('lobGo').hidden=!net.host||left<LOBBY_GO_SECS+.5;}
// Warte-Kampf: laufendes Rennen ohne freien Platz - bis zum naechsten gemeinsamen Start gegen Bots in der Arena
function netWaitBattle(){if(!net||net.setup||net.waiting||state!=='menu')return;net.waiting=true;mode='world';gp.active=false;$('online').hidden=true;
 document.querySelectorAll('#modes .mode').forEach(x=>{const on=x.dataset.mode==='world';x.classList.toggle('selected',on);x.setAttribute('aria-pressed',String(on));});
 start();battleStart();setTimeout(()=>toast('⏳ Rennen läuft – bis zum nächsten Start: Kotzhügel Fight!',2.8,'good'),2600);chatSys('⏳ Du steigst beim nächsten Rennen ein – bis dahin Kotzhügel Fight gegen Bots.');}
// K.O. in der offenen Arena: Gutschrift fuer den letzten Treffer (online an alle)
function battleKo(victim,by){if(!battle)return;const sc=battle.score;if(by!==null&&by!==undefined&&by!==victim)sc.set(by,(sc.get(by)||0)+1);battleHud();}
const koSlot=id=>net&&net.setup?toGlobal(id,net.mySlot):id,koName=g=>{const id=net&&net.setup?toLocal(g,net.mySlot):g;return id===0?'Du':racers[id]?.name||'?';};
// Offene Arena: rein = drei Herzen, raus = Herzen weg, K.O. = raus und kurz gesperrt; Bots mit fighter bleiben drin
function openArenaTick(r){const A=course._arena,ia=inArena(r);
 if(ia&&!(r.hearts>0)&&!(r.koT>elapsed)){r.hearts=HEARTS;r.out=false;r.bInv=elapsed+1;r._bs=r.stun||0;heartTag(r);if(r.id===0){toast('⚔ ARENA! Drei Herzen – triff die anderen',1.8,'good');battleHud();}return;}
 if(!ia&&r.hearts!==undefined&&!r.fighter){r.hearts=undefined;r.out=false;heartTag(r);if(r.id===0){toast('Arena verlassen',1);battleHud();}return;}
 if(!(r.hearts>0))return;if(!r.fighter)arenaPickup(r);else{arenaWall(r);if(!r.out)arenaPickup(r);}
 if(battleHit(r,r._bs,elapsed)){heartTag(r);heartPop(r);if(r.id===0){shake=Math.max(shake,.4);toast(r.hearts?`❤ HERZ VERLOREN! Noch ${r.hearts}`:'💨 K.O.!',1.4,'bad');battleHud();}
  if(r.hearts===0){const by=r.lastHitBy!==undefined&&elapsed-(r.lastHitT||-9)<3?r.lastHitBy:null,vg=koSlot(r.id),bg=by===null?null:koSlot(by);battleKo(vg,bg);
   if(net&&net.setup)net.A.bt.send({k:'ko',s:vg,by:bg===null?-1:bg}).catch(()=>{});
   if(by===0&&r.id!==0){toast(`👊 K.O. für dich! (${battle.score.get(koSlot(0))||0})`,1.4,'good');SFX.cheer();}
   // raus aus dem Ring: am Rand nach aussen setzen, 3 s Sperre (Bots kommen danach selbst wieder rein)
   const a=Math.atan2(r.x-A.x,r.z-A.z),x=A.x+Math.sin(a)*(A.r+7),z=A.z+Math.cos(a)*(A.r+7),d0=projectGlobal(x,z,0),pr=project(x,z,d0);
   Object.assign(r,{x,z,h:a,vx:0,vz:0,speed:0,distance:pr.d,offset:pr.off,safeD:pr.d,hearts:undefined,out:false,koT:elapsed+3,item:null,charges:0});heartTag(r);if(r.id===0)updateCamera(1,true);}}
 r._bs=r.stun||0;}

// ---------- Chat
const chatLog=[],chatLim=new Map(),chatMe=chatLimiter({burst:5,win:8000,gap:300});
function chatName(peerId){return peerId===net?.selfId?myNetName():net?.peers.get(peerId)?.n||'Gast';}
function chatSend(msg){if(!net)return false;const p=packChat(msg);if(!p)return false;if(!chatMe.ok(performance.now())){toast('Nicht so schnell 🙂',1);return false;}
 net.A.chat.send(p).catch(()=>{});chatShow(net.selfId,unpackChat(p),true);return true;}
function netRecvChat(d,peerId){if(!net)return;let L=chatLim.get(peerId);if(!L)chatLim.set(peerId,L=chatLimiter());if(!L.ok(performance.now()))return;const m=unpackChat(d);if(m)chatShow(peerId,m,false);}
function chatShow(peerId,m,mine){const name=chatName(peerId);pushLog(chatLog,{name,text:m.text,kind:m.kind,mine,t:performance.now()});renderChat();
 if(!mine&&soundOn&&ctx)sfxTone(1320,1560,.06,'triangle',.03);
 // Sprechblase ueber dem Kart des Absenders (Emoji gross, Text gekuerzt)
 let id=-1;if(mine)id=0;else if(net?.setup)for(const [g,h] of net.humans)if(h.id===peerId)id=toLocal(g,net.mySlot);
 const r=racers[id];if(r&&(state==='race'||state==='countdown'||state==='finished'))chatBubble(r,m.kind==='emoji'?m.text:(Array.from(m.text).length>22?Array.from(m.text).slice(0,21).join('')+'…':m.text),m.kind==='emoji');}
function chatSys(text,send){pushLog(chatLog,{sys:true,text,t:performance.now()});renderChat();if(send&&net)net.A.chat.send({t:text}).catch(()=>{});}
// Verlauf: im Spiel die letzten Zeilen (verblassen nach 9 s), im Online-Fenster alles - nur als Text eingesetzt, nie als HTML
function renderChat(){const now=performance.now(),row=(e)=>{const li=document.createElement('li');if(e.sys)li.className='sys';else if(e.mine)li.className='me';
  if(!e.sys){const b=document.createElement('b');b.textContent=e.name;li.append(b,' ');}const s=document.createElement('span');s.textContent=e.text;if(e.kind==='emoji')s.className='emo';li.append(s);return li;};
 const feed=$('chatFeed');if(feed){feed.replaceChildren(...chatLog.slice(-5).filter(e=>now-e.t<12000).map(row));feed.hidden=!feed.children.length||!net;}
 const log=$('onChatLog');if(log){log.replaceChildren(...chatLog.slice(-30).map(row));log.scrollTop=log.scrollHeight;}}
setInterval(()=>{const f=$('chatFeed');if(f&&!f.hidden)renderChat();},1500);
const bubbleTex=new Map();
function chatBubble(r,text,emo){const u=r.mesh.userData;let sp=u.chatB;
 if(!sp){sp=new T.Sprite(new T.SpriteMaterial({depthWrite:false,transparent:true}));sp.renderOrder=6;r.mesh.add(sp);u.chatB=sp;}
 let tex=bubbleTex.get(text);if(!tex){tex=canvasTex(256,128,(q,w,h)=>{q.fillStyle='#ffffff';q.strokeStyle='#14264a';q.lineWidth=7;q.beginPath();q.roundRect(8,8,w-16,h-40,26);q.fill();q.stroke();
   q.beginPath();q.moveTo(w/2-16,h-33);q.lineTo(w/2,h-10);q.lineTo(w/2+16,h-33);q.fillStyle='#ffffff';q.fill();q.stroke();q.fillRect(w/2-13,h-40,26,8);
   q.fillStyle='#14264a';q.textAlign='center';q.textBaseline='middle';q.font=emo?'62px sans-serif':'900 italic 28px Rubik, sans-serif';q.fillText(text,w/2,(h-32)/2+6,w-36);});
  if(bubbleTex.size>40){const [k,v]=bubbleTex.entries().next().value;v.dispose();bubbleTex.delete(k);}bubbleTex.set(text,tex);}
 sp.material.map=tex;sp.material.needsUpdate=true;sp.scale.set(emo?2.4:4.2,emo?1.2:2.1,1);sp.position.set(0,emo?3.9:4.3,0);sp.visible=true;u.chatT=performance.now()+3200;}
function chatBubbleTick(){const now=performance.now();for(const r of racers){const u=r.mesh?.userData;if(u?.chatB&&u.chatB.visible&&now>u.chatT)u.chatB.visible=false;}}
function chatOpen(on){const bar=$('chatBar');if(!bar)return;bar.hidden=!on||!net;if(!bar.hidden){const i=$('chatIn');i.value='';setTimeout(()=>i.focus(),0);}else $('chatIn')?.blur();}
{const bar=$('chatBar');if(bar){
 const emo=bar.querySelector('.ch-emo'),qk=bar.querySelector('.ch-quick');
 EMOJIS.forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.title='Emoji senden';b.onclick=()=>{chatSend({e:i});chatOpen(false);};emo.append(b);});
 QUICK.forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>{chatSend({q:i});chatOpen(false);};qk.append(b);});
 $('chatForm').onsubmit=e=>{e.preventDefault();const v=$('chatIn').value;if(v.trim())chatSend({t:v});chatOpen(false);};
 $('chatIn').onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();chatOpen(false);}e.stopPropagation();};
 $('chatBtn').onclick=()=>chatOpen(bar.hidden);$('netBtn').onclick=()=>openOnline();
 const f2=$('onChatForm');if(f2)f2.onsubmit=e=>{e.preventDefault();const v=$('onChatIn').value;if(v.trim()&&chatSend({t:v}))$('onChatIn').value='';};
 const oe=$('onChatEmo');if(oe)EMOJIS.slice(0,8).forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>chatSend({e:i});oe.append(b);});
 $('lobGo').onclick=()=>{if(net?.host&&net.lobT){net.lobT.until=Math.min(net.lobT.until,performance.now()+LOBBY_GO_SECS*1000);netLobBroadcast();lobbyBar(true);toast('🏁 Rennen startet gleich!',1.4,'good');}};}}
// Tasten: T = Chat, 1-6 = Emoji (nur online, nicht beim Tippen)
addEventListener('keydown',e=>{if(!net||e.target?.closest?.('input,select,textarea'))return;
 if(e.code==='KeyT'&&!e.repeat){e.preventDefault();chatOpen(true);return;}
 const k=/^Digit([1-6])$/.exec(e.code);if(k&&!e.repeat&&(state==='race'||state==='countdown'||state==='finished'))chatSend({e:+k[1]-1});});
// HUD-Knoepfe nur online
function netUi(){const on=!!net;document.body.classList.toggle('netlive',on);const cb=$('chatBtn'),nb=$('netBtn');if(cb)cb.hidden=!on;if(nb)nb.hidden=!on;if(!on){chatOpen(false);const f=$('chatFeed');if(f)f.hidden=true;}}

// ---------------------------------------------------------------- R56 Offene Raeume (ohne Codes)
// Feste oeffentliche Raeume; wer die Online-Tafel offen hat, sitzt zusaetzlich im Lobby-Kanal "wk-lobby". Die Hosts
// offener Raeume melden dort alle 3 s ihre Belegung, der Ping wird direkt zum Host gemessen (WebRTC, Trystero ping).
// Leerer Raum: wer beitritt, startet nach 12 s selbst mit Bots; Renn-Raeume starten das naechste Rennen automatisch.
const PUB_ROOMS=[{code:'WKRACE1',name:'🎡 Lobby-Welt · Rennen Flott',mode:'race',cc:100},{code:'WKRACE2',name:'🎡 Lobby-Welt · Rennen Wild',mode:'race',cc:150},
 {code:'WKFEST1',name:'⚔ Kotzhügel Fight 1',mode:'battle'},{code:'WKFEST2',name:'⚔ Kotzhügel Fight 2',mode:'battle'}];
let lobby=null;
async function lobbyOpen(){if(lobby)return;lobby={pending:true,rooms:new Map()};let TR;const strat=netStrat();
 try{TR=await (trysteroP??=import(NET_MODS[strat]));}catch(e){trysteroP=null;lobby=null;return;}
 let room;try{room=TR.joinRoom(strat==='nostr'?{appId:NET_APP,relayConfig:{urls:netRelays(),warnOnRelayFailure:false}}:{appId:NET_APP},'wk-lobby');}catch(e){lobby=null;return;}
 const ann=room.makeAction('ann');Object.assign(lobby,{pending:false,room,ann,timer:setInterval(lobbyTick,1000)});
 ann.onMessage=(d,{peerId})=>{if(!lobby||!d||typeof d.c!=='string'||!PUB_ROOMS.some(q=>q.code===d.c))return;const old=lobby.rooms.get(d.c)||{};
  const e={...old,n:clampInt(d.n,0,MAX_PLAYERS),max:MAX_PLAYERS,peer:peerId,t:performance.now(),st:d.s==='race'?'race':'lobby'};lobby.rooms.set(d.c,e);
  if(!e.pingT||performance.now()-e.pingT>4000){e.pingT=performance.now();room.ping(peerId).then(ms=>{const x=lobby?.rooms.get(d.c);if(x)x.ping=Math.round(ms);}).catch(()=>{});}};}
function lobbyTick(){if(!lobby||lobby.pending)return;const now=performance.now();
 if(net&&net.host&&net.pub&&now-(lobby.lastAnn||0)>3000){lobby.lastAnn=now;lobby.ann.send({c:net.code,n:1+net.peers.size,s:state==='race'||state==='countdown'?'race':'lobby'}).catch(()=>{});
  lobby.rooms.set(net.code,{...(lobby.rooms.get(net.code)||{}),n:1+net.peers.size,max:MAX_PLAYERS,t:now,ping:0,st:state==='race'?'race':'lobby'});}
 for(const [c,e] of lobby.rooms)if(now-e.t>10000)lobby.rooms.delete(c);
 // Renn-Raeume: der Host startet das naechste Rennen selbst (wechselnde Strecke), 25 s nach dem letzten Start
 if(net&&net.host&&net.pub&&net.pub.mode==='race'&&state==='menu'&&now>(net.autoT||0)){net.autoT=now+8000;net.what='world';cc=net.pub.cc||100;netHostGo();}
 if(!$('online').hidden)renderRooms();onlineCount();}
// R60: Menue-Knopf zeigt, wie viele gerade online sind (Summe der offenen Raeume)
function onlineCount(){const sm=document.querySelector('#onlineBtn small');if(!sm||!lobby)return;let n=0;for(const e of lobby.rooms.values())n+=e.n||0;
 const t=n>0?`${n} online – mitfahren!`:'mit Freunden';{const q=$('qOnlineSub'),qt=n>0?`🟢 ${n} ${n===1?'Spieler':'Spieler'} online – jetzt mitfahren!`:'Mit Freunden & der ganzen Wiesn';if(q&&q.textContent!==qt){q.textContent=qt;$('qOnline').classList.toggle('live',n>0);}}if(sm.textContent!==t){sm.textContent=t;sm.classList.toggle('live',n>0);$('onlineBtn').classList.toggle('pulse',n>0);}}
function renderRooms(){const box=$('onRooms');if(!box)return;box.replaceChildren();
 for(const pr of PUB_ROOMS){const e=lobby?.rooms.get(pr.code),mine=net&&net.code===pr.code,row=document.createElement('div');row.className='on-room'+(mine?' mine':'');
  const n=document.createElement('b');n.textContent=pr.name;const inf=document.createElement('span');
  inf.textContent=e?`${e.n}/${e.max} Spieler · ${mine&&net.host?'du bist Host':e.ping!=null?'Ping '+e.ping+' ms':'Ping …'}${e.st==='race'?' · läuft – sofort einsteigen':''}`:'frei · startet mit Bots';
  const bt=document.createElement('button');bt.type='button';bt.textContent=mine?'Drin ✓':'Beitreten';bt.disabled=!!mine;
  bt.onclick=()=>{store.set('netName',cleanName($('onName').value));netOpen(pr.code,false,true,pr);};row.append(n,inf,bt);box.append(row);}}
// Lobby-Tafel
function netRenderLobby(){const box=$('online');if(!box)return;const inRoom=!!net;$('onStart').hidden=inRoom;$('onRoom').hidden=!inRoom;if(!inRoom){$('onlineBtn')?.classList.remove('live');return;}
 $('onlineBtn')?.classList.add('live');$('onCodeShow').textContent=net.code;const L=net.lobby,list=$('onPlayers');list.replaceChildren();
 const ps=L?L.p:[{id:net.selfId,s:0,n:myNetName(),d:driverIndex,c:colorIndex}];
 for(let s=0;s<MAX_PLAYERS;s++){const q=ps.find(x=>x.s===s),li=document.createElement('li');
  if(q){li.className=q.id===net.selfId?'me':'';const ic=document.createElement('i');ic.textContent=DRIVERS[q.d]?.i||'🙂';const b=document.createElement('b');const tpi=topperById(q.id===net.selfId?myTopper():(q.tp||q.t))?.icon;b.textContent=(tpi&&tpi!=='✖'?tpi+' ':'')+q.n;const em=document.createElement('em');em.textContent=s===0?'Host':q.id===net.selfId?'Du':'';li.append(ic,b,em);}
  else{li.className='bot';li.textContent='🤖 '+(AI_NAMES[s]||'Bot');}list.append(li);}
 $('onHost').hidden=!net.host;$('onWait').hidden=net.host;
 if(net.host){document.querySelectorAll('#onWhat button').forEach(b=>b.classList.toggle('selected',b.dataset.w===net.what));const tr=$('onTrack');if(!tr.options.length)courses.forEach((c,i)=>tr.add(new Option(c.name,String(i))));tr.value=String(net.track);tr.disabled=net.what!=='race';$('onClass').value=String(cc);$('onClass').disabled=net.what!=='race';}
 else $('onWait').textContent=L?`Warte auf den Host … (${L.w==='battle'?'Kotzhügel Fight':L.w==='world'?'Kotzhügel – frei fahren':courses[L.t]?.name+' · '+ccName(L.cc)})`:'Warte auf den Host …';}
function openOnline(){const box=$('online');if(!box)return;box.hidden=false;myNetName();{const nx=onlineNext(onlRaces()),first=store.get('onlDay','')!==dayKey();$('onPerks').innerHTML=`<span>⭐ <b>×${ONLINE_MUL} XP</b> je Online-Rennen</span><span>🤝 <b>+20 XP</b> je geschlagenem Menschen</span>${first?`<span>📅 <b>+${ONLINE_DAILY_XP} XP</b> fürs erste Online-Rennen heute</span>`:''}<span>${nx?`🎨 ${nx.what}: noch <b>${nx.n-onlRaces()}</b>`:'🎨 Alle Online-Lackierungen frei'}</span><span>👑 ${hasCrown()?'Du trägst die <b>Pixel-Krone</b>':'<b>Pixel-Krone</b> für den ersten Online-Sieg'}</span>`;}$('onName').value=store.get('netName','');netRenderLobby();lobbyOpen();renderRooms();lbOnline();renderChat();}
{const box=$('online');if(box){
 $('onlineBtn').onclick=openOnline;$('onClose').onclick=()=>{box.hidden=true;};$('onLeave').onclick=()=>{netLeave();netMsg('Raum verlassen.');};
 const saveName=()=>{let n=cleanName($('onName').value);if(!n)n=cleanName(autoNick());store.set('netName',n);$('onName').value=n;return n;};
 $('onDice').onclick=e=>{e.preventDefault();const n=cleanName(autoNick());$('onName').value=n;store.set('netName',n);SFX.select();if(net?.host)netLobby();};
 $('onName').onchange=()=>{saveName();if(net?.host)netLobby();};
 $('onCreate').onclick=()=>{saveName();netOpen(makeCode(),true);};
 $('onQuick').onclick=()=>{saveName();const best=PUB_ROOMS.filter(q=>q.mode==='race').map(q=>({q,n:lobby?.rooms.get(q.code)?.n||0})).sort((a,b)=>b.n-a.n).find(x=>x.n<MAX_PLAYERS)||{q:PUB_ROOMS[0]};netOpen(best.q.code,false,true,best.q);};
 $('onJoin').onclick=()=>{const c=normCode($('onCode').value);if(c.length<4){netMsg('Bitte den Raumcode eingeben.');return;}saveName();netOpen(c,false);};
 $('onCode').onkeydown=e=>{if(e.key==='Enter')$('onJoin').click();};
 $('onCopy').onclick=async()=>{if(!net)return;const url=netUrl(net.code);try{if(navigator.share&&coarseInput)await navigator.share({title:'Wiesn Kart',text:'Fahr mit mir Wiesn Kart!',url});else{await navigator.clipboard.writeText(url);toast('Link kopiert',1.2,'good');}}catch{netMsg(url);}};
 document.querySelectorAll('#onWhat button').forEach(b=>b.onclick=()=>{if(!net?.host)return;net.what=b.dataset.w;store.set('netWhat2',net.what);netLobby();});
 $('onTrack').onchange=e=>{if(!net?.host)return;net.track=clampInt(e.target.value,0,courses.length-1);netLobby();};
 $('onClass').onchange=e=>{if(!net?.host)return;cc=Number(e.target.value)||100;store.set('class',cc);refreshMenu();netLobby();};
 $('onGo').onclick=netHostGo;
 const code=normCode(new URLSearchParams(location.search).get('room'));if(code.length>=4){openOnline();$('onCode').value=code;if(!TEST)setTimeout(()=>netOpen(code,false),300);}
 else if(!TEST)setTimeout(()=>{if(!lobby)lobbyOpen();},3500);}}
// ---------------------------------------------------------------- R57 Online-Bestenliste (lb.mjs)
// Ohne eigenen Server: signierte Nostr-App-Daten (NIP-78) auf oeffentlichen Relays, signiert mit derselben Bibliothek wie
// das Online-Spiel. Eingetragen wird nur auf Knopfdruck; der Schluessel liegt nur in diesem Browser.
const LB_RELAYS=['wss://nos.lol','wss://relay.damus.io','wss://relay.primal.net','wss://nostr.mom','wss://offchain.pub','wss://relay.snort.social'];
const hexOf=b=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join(''),bytesOf=h=>new Uint8Array(h.match(/../g).map(x=>parseInt(x,16)));
let lbModP=null;
async function lbKeys(){const S=(await (lbModP??=import(NET_MODS.nostr))).schnorr;let sk=store.get('lbKey','');if(!/^[0-9a-f]{64}$/.test(sk)){sk=hexOf(S.keygen().secretKey);store.set('lbKey',sk);}
 const sec=bytesOf(sk),pub=hexOf(S.getPublicKey(sec));store.set('lbPub',pub);return {S,sec,pub};}
// Eine Anfrage an ein Relay: oeffnen, senden, Antworten lesen, bis onMsg true meldet oder die Zeit um ist
function lbTalk(url,msg,onMsg,ms=6000){return new Promise(res=>{let ws=null,done=false,t=0;const end=()=>{if(done)return;done=true;clearTimeout(t);try{ws&&ws.close();}catch(e){}res();};t=setTimeout(end,ms);
 try{ws=new WebSocket(url);}catch(e){end();return;}ws.onopen=()=>{try{ws.send(JSON.stringify(msg));}catch(e){end();}};ws.onerror=end;ws.onclose=end;
 ws.onmessage=ev=>{let m;try{m=JSON.parse(ev.data);}catch(e){return;}if(Array.isArray(m)&&onMsg(m))end();};});}
// Zeiten unter 70 % der Gold-Medaille gelten als unmoeglich (Schutz gegen offensichtlich gefaelschte Eintraege)
const lbOpts=board=>{const m=/^tt:(\d+)$/.exec(board),c=m&&courses[+m[1]];return {minTime:c?c.medals[0]*.7:0,maxTime:900,drivers:DRIVERS.length};};
async function lbFetch(board){const sub='wk'+Math.random().toString(36).slice(2,9),evs=[];let answered=0;
 await Promise.all(LB_RELAYS.map(u=>lbTalk(u,['REQ',sub,lbFilter(board)],m=>{if(m[0]==='EVENT'&&m[1]===sub&&evs.length<3000)evs.push(m[2]);if(m[0]==='EOSE'&&m[1]===sub){answered++;return true;}return m[0]==='CLOSED';})));
 return answered?lbParse(evs,board,lbOpts(board)):null;}
async function lbPublish(board,data){const {S,sec,pub}=await lbKeys(),ev=lbDraft(board,data,pub),id=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(lbSerial(ev))));
 ev.id=hexOf(id);ev.sig=hexOf(await S.signAsync(id,sec));let ok=0;
 await Promise.all(LB_RELAYS.map(u=>lbTalk(u,['EVENT',ev],m=>{if(m[0]==='OK'&&m[1]===ev.id){if(m[2]===true)ok++;return true;}return false;})));return ok;}
// Online-Siege zaehlen nur mit mindestens einem anderen Menschen im Raum (gegen reine Bots zaehlt es nicht)
function lbWin(){if(!net?.setup||net.humans.size<2)return;store.set('onWins',store.get('onWins',0)+1);}
const lbMine=board=>{if(board==='wins'){const w=store.get('onWins',0);return w>0?w:null;}const t=store.get('tt-'+board.slice(3),Infinity);return isFinite(t)?+t.toFixed(3):null;};
const lbFmt=(board,e)=>board==='wins'?`${e.w} ${e.w===1?'Sieg':'Siege'}`:format(e.t);
// Namen anderer Spieler nur als Text einsetzen, nie als HTML
function lbRender(ol,board,list){ol.replaceChildren();const me=store.get('lbPub',''),note=t=>{const li=document.createElement('li');li.className='lb-note';li.textContent=t;ol.append(li);};
 if(!list)return note('Bestenliste gerade nicht erreichbar – später nochmal.');if(!list.length)return note('Noch keine Einträge – trag dich als Erste(r) ein!');
 const rank=me?lbRank(list,me):0,rows=list.slice(0,LB_TOP).map((e,i)=>[i,e]);if(rank>LB_TOP)rows.push([rank-1,list[rank-1]]);
 for(const [i,e] of rows){const li=document.createElement('li');if(e.pubkey===me)li.className='me';const a=document.createElement('span'),b=document.createElement('span'),c=document.createElement('span');
  a.textContent=(i+1)+'.';b.textContent=`${DRIVERS[e.d]?.i||''} ${e.n}`;c.textContent=lbFmt(board,e);li.append(a,b,c);ol.append(li);}}
// Liste, Eintragen-Knopf und Hinweis in einem Kasten (.lb-list, .lb-post, .lb-hint, optional .lb-name)
async function lbPanel(root,board){const ol=root.querySelector('.lb-list'),btn=root.querySelector('.lb-post'),hint=root.querySelector('.lb-hint'),nm=root.querySelector('.lb-name');root.dataset.board=board;
 const v=lbMine(board),sent=store.get('lbSent-'+board,null),bad=board!=='wins'&&v!==null&&v<lbOpts(board).minTime,fresh=lbBetter(board,v,sent);
 const say=()=>{hint.textContent=v===null?(board==='wins'?'Gewinne online gegen Freunde (Rennen oder Kotzhügel Fight), dann kannst du dich eintragen.':'Fahr hier ein Zeitfahren, dann kannst du dich eintragen.'):`Eintragen speichert „${myNetName()}“ und ${board==='wins'?'deine Siege':'deine Zeit'} öffentlich (Nostr-Relays, ohne Anmeldung).`;};
 if(nm){nm.value=store.get('netName','');nm.oninput=()=>{store.set('netName',cleanName(nm.value));say();};}
 btn.hidden=v===null||bad;btn.disabled=!fresh;btn.textContent=!fresh?'✓ Dein Eintrag ist aktuell':board==='wins'?`🌍 Meine ${v} ${v===1?'Sieg':'Siege'} eintragen`:`🌍 Meine Bestzeit ${format(v)} eintragen`;say();
 btn.onclick=async()=>{btn.disabled=true;btn.textContent='trägt ein …';let ok=0;try{ok=await lbPublish(board,board==='wins'?{n:myNetName(),w:v,d:driverIndex}:{n:myNetName(),t:v,d:driverIndex});}catch(e){ok=0;}
  if(ok){store.set('lbSent-'+board,v);toast('🌍 Eingetragen!',1.4,'good');lbPanel(root,board);}else{btn.disabled=false;btn.textContent='Hat nicht geklappt – nochmal?';}};
 ol.replaceChildren();{const li=document.createElement('li');li.className='lb-note';li.textContent=TEST?'(Testmodus: keine Abfrage)':'lädt …';ol.append(li);}if(TEST)return;
 const list=await lbFetch(board);if(root.dataset.board===board)lbRender(ol,board,list);}
function lbOnline(){const sel=$('lbSel'),root=$('onLb');if(!sel||!root)return;
 if(!sel.options.length){sel.append(new Option('🏆 Online-Siege','wins'));courses.forEach((c,i)=>sel.append(new Option(`⏱ ${c.name}`,ttBoard(i))));sel.value=store.get('lbSel','wins');if(!sel.value)sel.value='wins';sel.onchange=()=>{store.set('lbSel',sel.value);lbPanel(root,sel.value);};}
 lbPanel(root,sel.value);}
// Testschnittstelle nur mit ?test=1
if(TEST){window.rallyTest={dbg,start,home,use,pause,say,ceremony,hud,classes:()=>CLASSES,net:()=>net?{code:net.code,host:net.host,slot:net.mySlot,peers:[...net.peers.values()].map(q=>q.n),go:net.go,setup:!!net.setup,bufs:[...net.bufs.keys()],netRacers:racers.filter(r=>r.net).map(r=>r.id),lobby:net.lobby}:null,netOpen:(c,h,q)=>netOpen(c,h,q),chatSend:m=>chatSend(m),chatLog:()=>chatLog.map(e=>(e.sys?'* ':e.name+': ')+e.text),vote:t=>netVote(t),
 lob:()=>net&&{lobS:net.lobS&&{u:Math.round(net.lobS.u),t:net.lobS.t,c:net.lobS.c},lobT:net.lobT&&{left:Math.round(net.lobT.until-performance.now()),votes:net.lobT.votes},setup:net.setup&&{w:net.setup.w,b:net.setup.b,lob:net.setup.lob,cyc:net.setup.cyc,t:net.setup.t},
  humans:[...net.humans.keys()],waiting:!!net.waiting,cycle:net.cycle,state,selected,worldMode,bar:!$('lobbyBar').hidden,barText:$('lobbyBar').innerText,battle:battle&&{open:battle.open,score:[...battle.score]},hearts:racers.map(r=>r.hearts??null),fighters:racers.filter(r=>r.fighter).length},
 drive:(d,off=0,speed=30,n=300)=>{const r=racers[0],s=sample(d,off),gy=groundAt(d,off).y;Object.assign(r,{distance:d,offset:off,x:s.p.x,z:s.p.z,h:s.angle,speed,vx:Math.sin(s.angle)*speed,vz:Math.cos(s.angle)*speed,y:gy,vy:0,air:false,stun:0,finishTime:null});
  state='race';autopilot=true;if(owCh)owCh.prevD=null;for(let i=0;i<n;i++)update(1/60);return {d:Math.round(r.distance),sp:+r.speed.toFixed(1),run:owCh?.run?owCh.run.c.id:null,pop:$('chPop').hidden?'':$('chPop').innerText.replace(/\n/g,' | '),
   list:owCh?owCh.list.map(c=>[c.id,c.kind,Math.round(c.d??c.s),c.e!==undefined?Math.round(c.e):null]):null};},
 chFree:d=>[chFree(d),!elemAt(d,12),!hasRoll(d),!nearLoop(d),!(hpipes.length&&hpAt(d,12)),!inTunnel(d),!inBridge(d),!inGap(d)],waitBattle:()=>{netWaitBattle();return {battle:!!battle,open:!!battle?.open,world:worldMode,waiting:!!net?.waiting,bots:racers.length};},lobGo:ms=>{if(net?.lobT){net.lobT.until=performance.now()+ms;return true;}return false;},
 toBox:(i=0,back=14)=>{const b=boxes[i],r=racers[0];if(!b)return null;const s=sample(b.distance-back,b.offset),tn=tanAt(b.distance-back);Object.assign(r,{x:s.p.x,z:s.p.z,y:s.p.y,vx:0,vz:0,speed:0,distance:b.distance-back+length*Math.max(0,Math.floor(r.distance/length)),offset:b.offset,safeD:b.distance-back,h:Math.atan2(tn.x,tn.z)});return [boxes.length,b.distance];},tp:(x,z)=>{const r=racers[0],d0=projectGlobal(x,z,0),pr=project(x,z,d0);Object.assign(r,{x,z,vx:0,vz:0,speed:0,distance:pr.d,offset:pr.off,safeD:pr.d});return pr;},arena:()=>course._arena&&{x:course._arena.x,z:course._arena.z,r:course._arena.r},battle:()=>battle&&{over:battle.over,hearts:racers.map(r=>r.hearts),out:racers.map(r=>!!r.out)},battleStart:()=>battleStart(),netGo:()=>netHostGo(),wizard:()=>{const k=deco?.wizard;if(!k)return null;const p=k.g.getWorldPosition(new T.Vector3());return {vis:k.g.visible,show:+k.show.toFixed(2),casts:k.casts,spells:k.spells.length,sec:k.sec,pos:p.toArray().map(v=>+v.toFixed(1)),kids:k.g.children.length};},oh:()=>({...oh,taps:oh.taps.size}),dizzy:()=>{const m=new T.Matrix4(),out=[];for(let i=0;i<6;i++){dizzyMesh.getMatrixAt(i,m);out.push(new T.Vector3().setFromMatrixPosition(m).toArray().map(v=>+v.toFixed(1)));}return {out,cam:camera.position.toArray().map(v=>+v.toFixed(1)),p:racers[0].mesh.position.toArray().map(v=>+v.toFixed(1))};},star:()=>({playing:!!starSrc,loaded:!!clipBuf.s_c_star,dur:clipBuf.s_c_star?.duration,duck:+duckLevel.toFixed(2)}),
 windsocks:()=>world.userData.windsocks||[],
 windringInfo:()=>rings.filter(r=>!r.ag).map(r=>({d:r.d,off:r.off,y:r.y,asset:!!P.windring,materials:r.glow?.length||0,precision:r.precision})),
 gliderState:()=>racers.map(r=>({id:r.id,armed:!!r.glideArmed,gliding:!!r.gliding,open:r.gliderOpen||0,visible:!!r.mesh.userData.glider?.visible,asset:!!P.glider})),
 gliderPose:(phase='flight')=>{if(!racers.length)return null;const r=racers[0],rp=ramps.find(q=>!q.gap&&!hasRoll(q.end+7))||ramps[0],d=rp?rp.end+7:20,off=rp?.off||0,s=sample(d,off),gy=groundAt(d,off).y;r.distance=d;r.offset=off;r.x=s.p.x;r.z=s.p.z;r.h=s.angle;r.speed=28;r.vx=Math.sin(r.h)*28;r.vz=Math.cos(r.h)*28;r.y=gy+(phase==='ground'?0:3.4);r.vy=-2;r.air=phase!=='ground';r.airT=.35;r.stun=0;r.trick=0;r.finishTime=null;r.steerS=.3;r.lastGround=gy;resetGlider(r,true);armGlider(r,phase==='respawn'?'respawn':'ramp');state='inspect';for(let i=0;i<40;i++)syncKart(r,1/60);syncKartInstances();updateCamera(1/60,true);hud();renderer.render(scene,camera);return window.rallyTest.gliderState()[0];},next:nextAfterResult,track:d=>({...trackAt(d),x:sample(d).p.x,z:sample(d).p.z}),zones:()=>zones,cp:v=>cpDist(v),
 setMode:m=>document.querySelector(`#modes [data-mode="${m}"]`).click(),setClass:c=>{cc=c;refreshMenu();},setTrack:i=>{selected=i;syncTrackButtons();buildCourse();},posAt:(d,off=0,h=0)=>posAt(d,off,h,new T.Vector3()).toArray().map(v=>+v.toFixed(2)),ow:()=>owFx?{world:worldMode,total:owFx.total,done:owFx.done,switches:owFx.switches.map(s=>({id:s.id,d:Math.round(s.d),state:s.m.state,got:s.m.got})),slaloms:owFx.slaloms.map(s=>({id:s.m.id,gates:s.m.gates.length,next:s.m.next,state:s.m.state})),rings:owFx.ringMs.map(r=>({id:r.m.id,n:r.m.count,got:r.m.got.size,state:r.m.state})),portals:owFx.portals.map(p=>[Math.round(p.d),p.ti]),portalAt:owPortalAt}:null,
 loopDbg:()=>loopMiss.slice(-12),assist:v=>{if(v!==undefined)assistMode=v===true?'voll':v===false?'aus':v;return assistMode;},trk:d=>{const t=trackAt(d);return [+t.kap.toFixed(4),+t.v.toFixed(1),+t.vd.toFixed(1),+t.h.toFixed(2)];},obsNear:(x,z,R=15)=>{const out=[];for(const c of obsGrid.values())for(const o of c)if(Math.hypot(o.x-x,o.z-z)<R+o.r)out.push([+o.x.toFixed(1),+o.z.toFixed(1),+o.r.toFixed(1),o.h]);return out;},phys:()=>{const r=racers[0];return {d:r.distance,off:r.offset,y:r.y,ref:roadRef(r.distance,r.offset),g:groundAt(r.distance,r.offset).y,air:r.air,vy:r.vy,sp:r.speed,mag:hasMag(r.distance)};},elems:()=>elems.map(z=>({s:Math.round(z.s),span:Math.round(z.span),kind:z.kind,water:+z.water.toFixed(2),ok:z.plan.ok,pieces:z.plan.pieces.map(q=>q.type+':'+Math.round(q.x0)),hidden:z.hidden.map(h=>h.map(Math.round))})),tf:()=>racers.map(r=>r.mesh.userData.tf?.cur||null),uw:()=>elemFx?elemFx.uw:null,loopClear:(step=.2,far=30)=>loops.map(q=>{const pts=[];let sl=0,pv=null;
  for(let x=0;x<=q.span;x+=step){const c=posAt(q.s+x,0,0,new T.Vector3());if(pv)sl+=c.distanceTo(pv);pv=c;for(const o of [-LOOP.half,0,LOOP.half])pts.push([posAt(q.s+x,o,0,new T.Vector3()),sl]);}
  let m=1e9;for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){if(Math.abs(pts[i][1]-pts[j][1])<far)continue;const dd=pts[i][0].distanceTo(pts[j][0]);if(dd<m)m=dd;}
  return {s:Math.round(q.s),span:Math.round(q.span),n:q.n,R:+q.R.toFixed(1),style:q.style,len:Math.round(sl),min:+m.toFixed(2)};}),
 autopilot:v=>{autopilot=v;},finishNow:()=>{racers[0].distance=length*LAPS+1;finish(racers[0],length,elapsed);end();},
 coach:id=>{coachLast=-99;coachShow(id);return $("coach").textContent;},vdeco:()=>{const out={};world.traverse(o=>{if(o.isInstancedMesh)for(const [k,g] of Object.entries(decoGeos))if(o.geometry===g)out[k]=(out[k]||0)+o.count;});return out;},state:()=>({state,elapsed,length,mode,cc,gp,stats,racers:racers.map(({mesh,...r})=>r)}),setItem:item=>{racers[0].item=item;racers[0].charges=chargesFor(item);},inkMe:()=>{racers[0].ink=INK_T;inkSplash();},sunPads:()=>sunPads.map(p=>[Math.round(p.d),+p.off.toFixed(1)]),sunStats:()=>stats.sunBoosts||0,inkcaps:()=>({proto:!!P.inkcap,list:inkcaps.map(e=>({vis:e.g.visible,t:+(e.t||0).toFixed(2),y:+e.g.position.y.toFixed(1),s:+e.g.scale.y.toFixed(2),parent:!!e.g.parent}))}),
 padPoll:()=>{padPoll(performance.now());return {steer:pad.steer,pkeys:[...pkeys],hints:padHints,state,selected,cc,mode,focus:document.activeElement?.id||document.activeElement?.tagName};},
 wxForce:plan=>{wxOn=true;wxStart();if(plan){wxRacePlan=wxPlan=plan;wxActive=true;wxStripKey='';wxStrip();}return wxActive;},
 wxSafe:d=>wxSafe(d),wxStrike:()=>{wxStrike();return true;},
 wxInfo:()=>({active:wxActive,plan:wxPlan,m:wxM&&Object.fromEntries(Object.entries(wxM).map(([k,v])=>[k,+(+v).toFixed(2)])),grip:+wxGripMul.toFixed(3),wind:+wxWindA.toFixed(2),exp:+renderer.toneMappingExposure.toFixed(2),rain:wxRain.visible,flakes:wxFlakes.visible,bugs:wxBugs.visible,bow:wxBow.visible,aurora:wxAurora[0].visible,moon:wxMoonDisc.visible,meteors:wxMeteors.filter(s=>s.visible).length,ufo:{vis:wxUfo.visible,d:Math.round(wxUfo.userData.d),show:+wxUfo.userData.show.toFixed(2),fly:+wxUfo.userData.fly.toFixed(2),beam:wxUfo.userData.beam.visible},strip:$('wxStrip')?.textContent,lifts:stats.ufoLifts||0}),
 perf:()=>({drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,dpr:renderer.getPixelRatio(),qualityLevel:quality.level}),
 bgm:()=>({ready:bgm.ready,failed:bgm.failed,playing:bgm.current,rate:bgm.rate}),
 chr:()=>chr&&{cows:chr.cows.map(c=>[Math.round(c.x),Math.round(c.z),Math.round(c.d)]),gates:chr.gates.map(g=>Math.round(g.d)),hands:chr.hands.map(h=>[Math.round(h.x),Math.round(h.z),+h.up.toFixed(2),Math.round(h.d)]),mets:chr.mets.map(m=>[Math.round(m.x),Math.round(m.z),Math.round(m.d)])},desert:()=>desert&&{tw:desert.twisters.map(q=>[Math.round(q.x),Math.round(q.z),Math.round(q.dd||q.d)]),pits:desert.pits.map(q=>[Math.round(q.x),Math.round(q.z),q.r,Math.round(q.d)])},train:()=>trainFx&&{len:Math.round(trainFx.len),cross:trainFx.crossings.map(c=>Math.round(c.d)),loco:[+trainFx.cars[0].x.toFixed(1),+trainFx.cars[0].z.toFixed(1)]},lm:()=>!!P.landmarks,hz:()=>hz&&{stampers:hz.stampers.map(q=>[Math.round(q.d),q.off,q.g.position.toArray().map(v=>+v.toFixed(1))]),plants:hz.plants.map(q=>[Math.round(q.d),q.side,+q.x.toFixed(1),+q.y.toFixed(1),+q.z.toFixed(1)]),cannons:hz.cannons.map(q=>[Math.round(q.d),q.g?q.g.position.toArray().map(v=>+v.toFixed(1)):'laser']),missiles:hz.missiles.length,lasers:hz.missiles.filter(m=>m.laser).length,waves:(hz.waves||[]).map(w=>w.on?1:0),ships:(hz.waves||[]).flatMap(w=>w.on?w.ships.filter(q=>q.g.visible&&q.d!==undefined).map(q=>[Math.round(wrapDiff(q.d,racers[0].distance)),Math.round(q.h)]):[]),turrets:hz.cannons.filter(c=>c.tur).length,fz:P.fortress===undefined?'pending':P.fortress?'ok':'failed',kb:!!P.kartbodies,drv:!!P.driver_sepp,laserAhead:hz.missiles.filter(m=>m.laser&&m.d!==undefined&&racers[0]).map(m=>Math.round(wrapDiff(m.d,racers[0].distance))),statues:swingers.filter(q=>q.statue).map(q=>q.statue.position.toArray().map(v=>+v.toFixed(1))),loaded:!!P.hazards},jumps:()=>({ramps:ramps.map(r=>[+r.start.toFixed(1),+r.end.toFixed(1),r.gap?1:0,+r.off.toFixed(1)]),gaps:gaps.map(g=>[+g.start.toFixed(1),+g.end.toFixed(1)]),length}),items:()=>({hazards:hazards.length,shots:shots.length,ramps:ramps.length,pads:pads.length,rings:rings.length,spores:spores.length,swingers:swingers.length,gaps:gaps.length,obstacles:[...obsGrid.values()].reduce((a,c)=>a+c.length,0),crowd:crowd?crowd.fans.length:0,protos:Object.fromEntries(PROTO_FILES.map(n=>[n,!!P[n]]))}),
 saveGhost:()=>{try{localStorage.setItem('mr-ghost-'+selected,JSON.stringify({...rec,next:undefined,color:0xffffff}));}catch{}return rec&&rec.x.length;},ghost:()=>ghost&&{n:ghost.data.x.length,dist:ghost.dist,visible:ghost.mesh.visible},medalOf:t=>medalOf(t),aiUse:(id,item)=>{racers[id].item=item;racers[id].charges=chargesFor(item);return useItem(racers[id]);},racers:()=>racers,world:()=>({ramps,pads,rings,spores,gaps,swingers}),keys,
 loops:()=>loops.map(q=>({...q,s:Math.round(q.s),span:Math.round(q.span),R:Math.round(q.R)})),
 coasters:()=>coasters.map(c=>({s:Math.round(c.s),span:Math.round(c.span),kind:c.spec.kind,launch:c.spec.launch.map(Math.round),hills:c.spec.hills.map(q=>({c:Math.round(q.c),w:Math.round(q.w),h:+q.h.toFixed(1)})),arches:c.archX.map(Math.round),assets:{arch:!!P.magnetarch,truss:!!P.coastertruss},glow:!!coasterGlow})),
 // Videoaufnahme (R38): Bilder im festen Takt selbst weiterschalten (rAF-Schleife ruht bei dbg.manual)
 step:(n=2,dt=1/60)=>{for(let i=0;i<n-1;i++){update(dt);animateWorld(dt,performance.now());updateCamera(dt);}frameStep(dt,performance.now());},
 audio:()=>{armAudio();audioInit();return {ctx,masterGain};},
 coasterH:d=>coasterH(d),ridePhoto:()=>ridePhoto?ridePhoto.length:0,ridePhotoURL:()=>ridePhoto,coasterRun:()=>racers.map(r=>({id:r.id,run:r.czRun?{arch:r.czRun.arch,air:r.czRun.airHills,maxOff:+r.czRun.maxOff.toFixed(2),launched:r.czRun.launched}:null,g:r.czG,float:r.czFloat,vis:r.czVis,speed:r.speed})),
 // Standbild an beliebiger Stelle: Spieler auf Streckenmeter d setzen, Kamera einrasten, rendern
 field:n=>{fieldForce=n|0;kartPool=null;return fieldSize();},
 r60At:t=>{updateR60(0,t,false);renderer.render(scene,camera);return true;},
 spinTest:(n=0)=>{spinOut(racers[n]);return racers[n].spinO;},fireAt:n=>{fireShell(racers[n],0);return shots.length;},agravZones:()=>agrav.map(z=>[Math.round(z.s),Math.round(z.span),z.mode]),flatTest:(n=0)=>{flatten(racers[n]);return racers[n].flat;},mirror:()=>({k:+mirrorK.toFixed(2),threat:threatBehind()}),oils:()=>oils.map(o=>[Math.round(o.d),o.off,o.r]),
 intro:v=>{introForce=!!v;return introT;},fall:()=>{const r=racers[0];r.safeD=lapDist(r.distance);respawn(r);return !!r.rescue;},loisl:()=>({mode:loisl?.mode,vis:loisl?.g.visible,rescue:!!racers[0]?.rescue,fan:!!fanfare,light:lightState,bgm:bgm.current}),
 tsunami:()=>tsu&&{t0:tsu.t0,ph:tsu.ph,surf:tsu.surf},tsuAt:v=>{if(tsu){tsu.at=v<0?elapsed:v;tsu.t0=null;tsu.msg='';}return !!tsu;},
 bayice:()=>bayIce&&{n:bayIce.n,dol:bayIce.dol.length},
 pix:()=>domePix&&{deco:domePix.deco,clouds:domePix.clouds.length,birds:domePix.birds.length,sun:!!domePix.sun,sunPos:domePix.sun?domePix.sun.position.toArray().map(Math.round):null},
 city:()=>cityN,
 vox:()=>vox&&{candles:vox.candles.map(c=>[Math.round(c.d),c.off,c.broke?1:0]),bats:vox.bats.length,ghosts:vox.ghosts.length,deco:vox.deco,moon:!!vox.moon},
 crt:v=>{if(v!==undefined)crtSet(v);return crtOn;},bit16:v=>{if(v!==undefined)bitSet(v);return bitOn;},mod:()=>modSpot&&{d:modSpot.d,off:modSpot.off,x:modSpot.x,y:modSpot.y,z:modSpot.z,got:modSpot.got},
 choco:()=>choco&&{mud:choco.mud.map(p=>[Math.round(p.d0),Math.round(p.len),p.off,p.hw]),bould:choco.bould.map(b=>[Math.round(b.d),b.st?.phase||'-',+(b.off||0).toFixed(1)]),deco:choco.deco},
 r60:()=>r60&&{surf:r60.surf.map(z=>({s:Math.round(z.s),span:Math.round(z.span),side:z.side,front:z.front?+z.front.off.toFixed(1):null})),tide:r60.tide&&{lvl:+r60.tide.lvl.toFixed(2),flooded:r60.tide.flooded,state:r60.tide.state,fork:Math.round(r60.tide.f.dA)},
  crabs:r60.crabs.map(c=>[Math.round(c.d),+c.off.toFixed(1)]),turtles:r60.turtles.length,ice:r60.ice.map(z=>[Math.round(z.s),Math.round(z.span)]),curls:r60.curls.map(c=>[Math.round(c.d),+c.off.toFixed(1)]),blocks:r60.blocks.map(b=>b.broke===null?1:0),
  sents:r60.sents.map(s=>[Math.round(s.d),s.side,s.st?.phase||'-']),beam:!!r60.beam,smoke:!!r60.smoke,seaY:r60.seaY},
 cp:v=>cpDist(v),eggs:()=>deco&&{klos:deco.klos.map(k=>[Math.round(k.x),Math.round(k.z),Math.round(k.d)]),tents:deco.tents.map(k=>[Math.round(k.x),Math.round(k.z),Math.round(k.d)])},
 probe:()=>({cam:camera.position.toArray().map(v=>+v.toFixed(3)),cq:camera.quaternion.toArray().map(v=>+v.toFixed(4)),me:racers[0]?.mesh.position.toArray().map(v=>+v.toFixed(3)),mh:+(racers[0]?.mesh.rotation.y||0).toFixed(4),d:+(racers[0]?.distance||0).toFixed(2),off:+(racers[0]?.offset||0).toFixed(2),sp:+(racers[0]?.speed||0).toFixed(2),bots:racers.slice(1).map(r=>r.mesh.position.toArray().map(v=>+v.toFixed(3)))}),
 lbView:(board,events,me)=>{if(me)store.set('lbPub',me);const root=$('onLb');$('online').hidden=false;lbRender(root.querySelector('.lb-list'),board,lbParse(events,board,lbOpts(board)));return root.innerText;},
 pose:(d,off=0,speed=30,frames=40)=>{if(!racers.length)return null;const r=racers[0],s=sample(d,off),gy=groundAt(d,off).y;r.distance=d;r.offset=off;r.x=s.p.x;r.z=s.p.z;r.h=s.angle;r.speed=speed;r.vx=Math.sin(r.h)*speed;r.vz=Math.cos(r.h)*speed;r.y=gy;r.vy=0;r.air=false;r.airT=0;r.stun=0;r.trick=0;r.finishTime=null;r.lastGround=gy;
  const cz=coasterAt(d);if(cz){r.czRun=null;coasterRide(r,cz,false);}else{r.czFloat=0;r.czVis=1;}
  state='inspect';for(let i=0;i<frames;i++){syncKart(r,1/60);updateCamera(1/60,i===0);animateWorld(1/60,performance.now());}syncKartInstances();hud();renderer.render(scene,camera);return {d,y:r.mesh.position.y,g:r.czG,float:r.czFloat};},
 // Blick von oben auf die Strecke (Layout-Pruefung)
 topView:(cx=0,cz=0,h=420,fov=50)=>{state='inspect';camera.up.set(0,0,-1);camera.position.set(cx,h,cz);camera.lookAt(cx,0,cz);camera.fov=fov;camera.updateProjectionMatrix();renderer.render(scene,camera);camera.up.set(0,1,0);return true;},
 shot:(x,y,z,lx,ly,lz,fov=55)=>{state='inspect';camera.up.set(0,1,0);camera.position.set(x,y,z);camera.lookAt(lx,ly,lz);camera.fov=fov;camera.updateProjectionMatrix();animateWorld(1/60,performance.now());renderer.render(scene,camera);return true;},
 thumbs:()=>({items:Object.keys(itemThumbs),drivers:document.querySelectorAll('#drivers canvas').length}),
 dbg,gfx:m=>{if(m){gfxMode=m;applyGfx();}return {gfxMode,level:quality.level,dpr:renderer.getPixelRatio(),shadowEvery,shadows:renderer.shadowMap.enabled};},bprof:()=>bprof.slice(),three:()=>({renderer,scene,camera,sun,world,actors,headlight,T}),prof:()=>{const r=Object.fromEntries(Object.entries(prof).map(([k,v])=>[k,k==='n'?v:+(v/Math.max(1,prof.n)).toFixed(2)]));for(const k in prof)prof[k]=0;return r;},bench:(n=120)=>{const gl=renderer.getContext();let cpu=0,gpu=0,worst=0;for(let i=0;i<n;i++){const a=performance.now();frameStep(1/60,a);const b=performance.now();gl.finish();const c=performance.now();cpu+=b-a;gpu+=c-b;worst=Math.max(worst,c-a);}
  return {cpuMs:+(cpu/n).toFixed(2),finishMs:+(gpu/n).toFixed(2),worstMs:+worst.toFixed(1),calls:renderer.info.render.calls,tris:renderer.info.render.triangles,programs:renderer.info.programs.length,geos:renderer.info.memory.geometries};},
 ready:()=>readyPromise.then(()=>new Promise(res=>{const c=()=>revealQueue?setTimeout(c,30):res(worldReady);c();})),forkTest:(a,b,k)=>{const f=computeFork(a,b,k);return {maxOff:+f.maxOff.toFixed(1),minR:Math.round(f.minR),saved:Math.round(f.span-f.len),span:Math.round(f.span),back:f.pts.filter((p,i)=>i&&p.rel<f.pts[i-1].rel-.3).length,jump:Math.round(Math.max(...f.pts.map((p,i)=>i?p.rel-f.pts[i-1].rel:0)))};},prebuild:i=>{const a=performance.now();prebuild(i);return Math.round(performance.now()-a);},cache:()=>[...worldCache.keys()],
 forks:()=>forks.map(f=>({dA:Math.round(f.dA),span:Math.round(f.span),maxOff:+f.maxOff.toFixed(1),minR:Math.round(f.minR),len:Math.round(f.len),main:Math.round(f.span)})),rails:()=>rails.map(r=>[Math.round(r.d0),Math.round(r.d1),r.side,r.kind]),
 minRadius:()=>{let m=1e9,at=0;for(let i=0;i<PS;i++){const r=1/Math.max(1e-4,Math.abs(TP.k[i]));if(r<m){m=r;at=i*length/PS;}}return {r:+m.toFixed(1),at:Math.round(at),length:Math.round(length)};},timeStart:()=>{const a=performance.now();start();const b=performance.now();const gl=renderer.getContext();renderer.render(scene,camera);gl.finish();return {startMs:+(b-a).toFixed(1),firstFrameMs:+(performance.now()-b).toFixed(1)};},
 // R52 Halfpipe: Zonen, Zustand je Kart, Wertung; hpScan sucht freie gerade Stellen fuer eine neue Zone
 hp:()=>({zones:hpipes.map(z=>({s:Math.round(z.s),span:z.span})),racers:racers.map(r=>({id:r.id,on:!!r.hpOn,air:!!r.hpAir,off:+(r.offset||0).toFixed(1),max:+(r.hpMax||0).toFixed(1),pick:r.hpPick||0})),stats:stats&&{air:stats.hpAirs||0,trick:stats.hpTricks||0,best:+(stats.hpBest||0).toFixed(1),launch:stats.hpLaunch||0}}),
 hpScan:(span=150)=>{const busy=courseBusy(),out=[];for(let near=0;near<length;near+=30){const s=hpFindSpot({length,kap:d=>trackAt(d).kap,busy,span,near,search:15,step:3});if(s>=0&&!out.includes(Math.round(s)))out.push(Math.round(s));}
  const st=[];let a=-1;for(let d=0;d<=length;d+=2){const ok=Math.abs(trackAt(d).kap)<1/HP.minR;if(ok&&a<0)a=d;if((!ok||d+2>length)&&a>=0){if(d-a>=40)st.push([a,d]);a=-1;}}
  return {name:course.name,length:Math.round(length),cps:course.points.map((_,i)=>+cpDist(i).toFixed(0)),free:out,busy:busy.map(([x,y,k])=>[Math.round(x),Math.round(y),k]),straight:st};},
 upd:(n=1,dt=1/60)=>{for(let i=0;i<n;i++)update(dt);return state;},
 camSnap:()=>{updateCamera(1/60,true);for(let i=0;i<20;i++)updateCamera(1/60);syncKartInstances();animateWorld(1/60,performance.now());hud();renderer.render(scene,camera);return true;},
 tick:(n=60,dt=1/60)=>{for(let i=0;i<n;i++){update(dt);animateWorld(dt,performance.now());updateCamera(dt);}duckBgm(performance.now());renderer.render(scene,camera);if(photoPending)takeRidePhoto();return {state,elapsed:+elapsed.toFixed(2),place:ranking(racers).indexOf(racers[0])+1};}};
 const panel=document.createElement('aside');panel.id='testPanel';panel.style.cssText='position:fixed;bottom:0;left:35%;z-index:30;background:#111;padding:10px;display:flex;gap:8px';
 for(const [text,action] of [['Test: Turbo',()=>{window.rallyTest.setItem('boost');state='race';use();}],['Test: Ziel',()=>{state='race';window.rallyTest.finishNow();}]]){const b=document.createElement('button');b.textContent=text;b.style.cssText='color:#fff;background:#345;padding:10px';b.onclick=action;panel.append(b);}document.body.append(panel);}
