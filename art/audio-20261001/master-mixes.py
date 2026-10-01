
"""Create local driving MP3 masters and previews. No network/provider calls.
Requires task-local imageio-ffmpeg (the executable stays under .scratch/audio-tools).
Run after driving-mix.mjs has rendered the nine scored WAVs.
"""
from pathlib import Path
import sys, json, subprocess, hashlib, wave
import numpy as np

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'.scratch/audio-tools'))
import imageio_ffmpeg
FF=str(next((ROOT/'.scratch/audio-tools/imageio_ffmpeg/binaries').glob('ffmpeg-*.exe')))
STAGE=ROOT/'.scratch/driving-music'
DEST=ROOT/'assets/audio/drive'
ART=Path(__file__).parent
DEST.mkdir(parents=True,exist_ok=True)
score=json.loads((STAGE/'report.json').read_text(encoding='utf8')) if (STAGE/'report.json').exists() else {}
legacy={'race':1.08,'sunset':1.08,'night':1.08}
manifest={'date':'2026-10-01','generation':'local synthesis and offline remix only','provider_charges':0,'loop_tail_seconds':2.2,'tracks':{}}
manifest_file=ART/'music-manifest.json'
if manifest_file.exists():
    manifest=json.loads(manifest_file.read_text(encoding='utf8'))

def run(*args):
    return subprocess.run([FF,'-hide_banner','-loglevel','error','-y',*map(str,args)],check=True,stdout=subprocess.PIPE).stdout
def decoded(path):
    return np.frombuffer(run('-i',path,'-f','f32le','-acodec','pcm_f32le','-ar',44100,'-ac',2,'pipe:1'),dtype='<f4').reshape(-1,2)
def metrics(samples):
    return {'peak':float(np.max(np.abs(samples))),'rms':float(np.sqrt(np.mean(samples.astype(np.float64)**2))),'frames':len(samples),'seconds':len(samples)/44100}
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
wanted=sys.argv[1:] or ['race','dome','space','polka','sunset','night','gothic8','beach','ice','choco','lava','kirmes']
for key in wanted:
    source=ROOT/'assets/audio'/('bgm_'+key+'.mp3')
    wav_path=STAGE/('bgm_'+key+'.wav')
    if key in legacy:
        # Pitch stays fixed while the groove is faster. Tighten the sub-bass and
        # add a little kick/bass presence without guessing an unsynced drum tempo.
        run('-i',source,'-af','atempo=1.08,highpass=f=32,bass=g=2.5:f=95:w=0.65,treble=g=0.8:f=4300,acompressor=threshold=0.24:ratio=1.6:attack=6:release=90:makeup=1','-ar',44100,'-ac',2,'-c:a','pcm_s16le',wav_path)
    data=decoded(wav_path)
    pre=metrics(data)
    gain=min(.78/max(pre['peak'],1e-9),.17/max(pre['rms'],1e-9))
    target=DEST/('bgm_'+key+'.mp3')
    run('-i',wav_path,'-af','volume='+str(gain),'-c:a','libmp3lame','-b:a','160k','-ar',44100,'-ac',2,'-write_xing',1,target)
    final=decoded(target)
    post=metrics(final)
    if not np.isfinite(final).all() or post['peak']>.96:
        raise ValueError('Invalid decoded master/headroom: '+key+' '+str(post))
    record={'source':'assets/audio/bgm_'+key+'.mp3','source_sha256':sha(source),'asset':'assets/audio/drive/bgm_'+key+'.mp3','sha256':sha(target),'gain':gain,'decoded':post}
    if key in legacy:
        record.update({'tempo_ratio':1.08,'pitch_preserved':True,'loop':'legacy crossfade'})
    else:
        end=round(score[key]['loopEnd']*44100)
        tail=round(2.2*44100)
        # PCM is copied, never independently re-synthesized.
        if not np.array_equal(data[end:end+tail],data[:tail]):
            raise ValueError('Copied-head mismatch: '+key)
        length=min(tail,len(final)-end)
        correlation=float(np.corrcoef(final[:length].ravel(),final[end:end+length].ravel())[0,1])
        if correlation<.97:
            raise ValueError('MP3 loop head correlation too low: '+key+' '+str(correlation))
        record.update({'bpm':score[key]['bpm'],'title':score[key]['title'],'loopEnd':score[key]['loopEnd'],'loopTail':2.2,'head_correlation':correlation,'composition_source':'art/r61/chiptune.mjs','composition_sha256':sha(ROOT/'art/r61/chiptune.mjs')})
    manifest['tracks'][key]=record
    manifest_file.write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8')
    if key in ['race','dome','space']:
        run('-i',target,'-t',18,'-af','afade=t=out:st=17:d=1','-c:a','libmp3lame','-b:a','160k',ART/(key+'-driving-preview.mp3'))
    print(key,json.dumps(post),flush=True)
print('Saved',manifest_file,flush=True)

