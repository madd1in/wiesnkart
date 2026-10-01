
"""Master the v3 music renders (art/audio-20261002/music-v3.mjs) to loop-ready MP3s and previews. No network/provider calls.
Requires task-local imageio-ffmpeg (the executable stays under .scratch/audio-tools) and numpy (Blender ships it).
Run after music-v3.mjs has rendered the WAVs into .scratch/music-v3.
"""
from pathlib import Path
import sys, json, subprocess, hashlib, wave
import numpy as np

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'.scratch/audio-tools'))
import imageio_ffmpeg
FF=str(next((ROOT/'.scratch/audio-tools/imageio_ffmpeg/binaries').glob('ffmpeg-*.exe')))
STAGE=ROOT/'.scratch/music-v3'
DEST=ROOT/'assets/audio/drive'
ART=Path(__file__).parent
DEST.mkdir(parents=True,exist_ok=True)
score=json.loads((STAGE/'report.json').read_text(encoding='utf8')) if (STAGE/'report.json').exists() else {}
manifest={'date':'2026-10-02','generation':'local synthesis only (music-v3.mjs)','provider_charges':0,'loop_tail_seconds':2.2,'tracks':{}}
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
wanted=sys.argv[1:] or ['dome','space','polka','gothic8','beach','ice','choco','lava','kirmes','alm','canyon','neon','lobby']
for key in wanted:
    wav_path=STAGE/('bgm_'+key+'.wav')
    data=decoded(wav_path)
    pre=metrics(data)
    gain=min(.78/max(pre['peak'],1e-9),.17/max(pre['rms'],1e-9))
    target=DEST/('bgm_'+key+'.mp3')
    run('-i',wav_path,'-af','volume='+str(gain),'-c:a','libmp3lame','-b:a','160k','-ar',44100,'-ac',2,'-write_xing',1,target)
    final=decoded(target)
    post=metrics(final)
    if not np.isfinite(final).all() or post['peak']>.96:
        raise ValueError('Invalid decoded master/headroom: '+key+' '+str(post))
    record={'source':'.scratch/music-v3/bgm_'+key+'.wav','asset':'assets/audio/drive/bgm_'+key+'.mp3','sha256':sha(target),'gain':gain,'decoded':post}
    end=round(score[key]['loopEnd']*44100)
    tail=round(2.2*44100)
    # PCM is copied, never independently re-synthesized.
    if not np.array_equal(data[end:end+tail],data[:tail]):
        raise ValueError('Copied-head mismatch: '+key)
    length=min(tail,len(final)-end)
    correlation=float(np.corrcoef(final[:length].ravel(),final[end:end+length].ravel())[0,1])
    if correlation<.97:
        raise ValueError('MP3 loop head correlation too low: '+key+' '+str(correlation))
    record.update({'bpm':score[key]['bpm'],'title':score[key]['title'],'loopEnd':score[key]['loopEnd'],'loopTail':2.2,'head_correlation':correlation,'composition_source':'art/r61/chiptune.mjs','composition_sha256':sha(ROOT/'art/r61/chiptune.mjs'),'mix_source':'art/audio-20261002/music-v3.mjs','mix_sha256':sha(ROOT/'art/audio-20261002/music-v3.mjs')})
    manifest['tracks'][key]=record
    manifest_file.write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8')
    if key in ['alm','dome','lava']:
        run('-i',target,'-t',18,'-af','afade=t=out:st=17:d=1','-c:a','libmp3lame','-b:a','160k',ART/(key+'-driving-preview.mp3'))
    print(key,json.dumps(post),flush=True)
print('Saved',manifest_file,flush=True)

