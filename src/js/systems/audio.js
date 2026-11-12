/* ---------- audio ---------- */
var audio=null, soundOn=true;
function initAudio(){
  if(audio) return;
  try{
    var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    var ctx=new AC(), len=ctx.sampleRate*2, buf=ctx.createBuffer(1,len,ctx.sampleRate), d=buf.getChannelData(0);
    for(var i=0;i<len;i++) d[i]=Math.random()*2-1;
    var master=ctx.createGain(); master.gain.value=0.9; master.connect(ctx.destination);
    var src=ctx.createBufferSource(); src.buffer=buf; src.loop=true;
    var bp=ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=2400; bp.Q.value=0.6;
    var g=ctx.createGain(); g.gain.value=0;
    src.connect(bp); bp.connect(g); g.connect(master); src.start();
    var osc=ctx.createOscillator(); osc.type='sawtooth'; osc.frequency.value=60;
    var lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=380;
    var og=ctx.createGain(); og.gain.value=0.03;
    osc.connect(lp); lp.connect(og); og.connect(master); osc.start();
    var losc=ctx.createOscillator(); losc.type='sawtooth'; losc.frequency.value=300;
    var llp=ctx.createBiquadFilter(); llp.type='lowpass'; llp.frequency.value=1800;
    var lg=ctx.createGain(); lg.gain.value=0;
    losc.connect(llp); llp.connect(lg); lg.connect(master); losc.start();
    var dosc=ctx.createOscillator(); dosc.type='sawtooth'; dosc.frequency.value=85;
    var dlp=ctx.createBiquadFilter(); dlp.type='lowpass'; dlp.frequency.value=420;
    var dg=ctx.createGain(); dg.gain.value=0;
    dosc.connect(dlp); dlp.connect(dg); dg.connect(master); dosc.start();
    audio={ctx:ctx,master:master,nbuf:buf,g:g,og:og,osc:osc,lg:lg,losc:losc,dg:dg,dosc:dosc};
  }catch(e){audio=null;}
}
$('snd').addEventListener('click',function(){
  soundOn=!soundOn; this.setAttribute('aria-pressed',String(soundOn));
  if(audio){ try{ soundOn?audio.ctx.resume():audio.ctx.suspend(); }catch(e){} }
});
function tone(f,type,dur,vol,slide,delay){
  if(!audio||!soundOn) return;
  try{
    var x=audio.ctx, t=x.currentTime+(delay||0), o=x.createOscillator(), g=x.createGain();
    o.type=type||'triangle'; o.frequency.setValueAtTime(f,t);
    if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+dur);
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.connect(g); g.connect(audio.master); o.start(t); o.stop(t+dur+0.03);
  }catch(e){}
}
function noiseHit(dur,vol,f0,f1,delay){
  if(!audio||!soundOn) return;
  try{
    var x=audio.ctx, t=x.currentTime+(delay||0), s=x.createBufferSource(), fl=x.createBiquadFilter(), g=x.createGain();
    s.buffer=audio.nbuf; fl.type='lowpass'; fl.frequency.setValueAtTime(f0,t); fl.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+dur);
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    s.connect(fl); fl.connect(g); g.connect(audio.master); s.start(t,Math.random()*1.5); s.stop(t+dur+0.03);
  }catch(e){}
}
function sfx(name){
  if(!audio||!soundOn) return;
  switch(name){
    case 'crash': noiseHit(0.5,0.5,1800,120); tone(90,'sawtooth',0.35,0.3,40); break;
    case 'hit': noiseHit(0.35,0.4,1200,150); tone(120,'square',0.25,0.16,50); break;
    case 'thunder': noiseHit(1.7,0.24,520,50,0.05); tone(46,'sine',1.3,0.22,28,0.05); break;
    case 'boom': noiseHit(0.9,0.6,900,60); tone(70,'sine',0.7,0.5,30); break;
    case 'pickup': tone(660,'triangle',0.1,0.14); tone(880,'triangle',0.1,0.14,null,0.07); tone(1320,'triangle',0.2,0.14,null,0.14); break;
    case 'shield': tone(300,'sine',0.45,0.2,900); tone(450,'triangle',0.3,0.1,1200,0.05); break;
    case 'bonus': tone(784,'triangle',0.1,0.14); tone(1175,'triangle',0.2,0.14,null,0.09); break;
    case 'alarm': for(var i=0;i<3;i++){tone(880,'square',0.12,0.09,null,i*0.3); tone(620,'square',0.12,0.09,null,i*0.3+0.15);} break;
    case 'land': noiseHit(0.18,0.25,500,100); tone(60,'sine',0.2,0.3,35); break;
    case 'whoosh': noiseHit(0.5,0.14,300,3000); break;
    case 'throw': noiseHit(0.4,0.18,2500,300); break;
    case 'drop': tone(300,'triangle',0.25,0.08,120); break;
    case 'tick': tone(1000,'square',0.06,0.07); break;
    case 'count': tone(520,'square',0.12,0.09); break;
    case 'start': tone(880,'square',0.3,0.1); tone(1320,'square',0.3,0.07,null,0.04); break;
    case 'scrape': noiseHit(0.2,0.1,3200,1200); break;
    case 'launch': noiseHit(2.2,0.16,500,70); break;
    case 'monkey': tone(900,'square',0.08,0.08,1500); tone(1200,'square',0.08,0.08,1800,0.1); tone(900,'square',0.1,0.08,1600,0.2); break;
    case 'mini': tone(1400,'square',0.06,0.08); tone(1000,'square',0.06,0.08,null,0.09); break;
    case 'roar': noiseHit(0.9,0.35,900,200); tone(110,'sawtooth',0.8,0.22,55); tone(80,'square',0.7,0.12,40,0.05); break;
    case 'screech': tone(1800,'sawtooth',0.3,0.05,900); tone(2200,'sawtooth',0.22,0.04,1100,0.1); break;
    case 'jet': noiseHit(1.6,0.3,3500,300); tone(240,'sawtooth',1.2,0.1,90); break;
    case 'missile': noiseHit(0.35,0.1,3000,600); break;
    case 'turbo': tone(300,'sawtooth',0.8,0.14,1800); tone(600,'square',0.6,0.08,2400,0.1); noiseHit(0.8,0.2,500,4000); break;
    case 'splat': noiseHit(0.3,0.3,1800,200); tone(320,'sine',0.35,0.22,70); tone(180,'square',0.2,0.08,60,0.05); break;
    case 'ploc': tone(520,'sine',0.14,0.18,140); noiseHit(0.12,0.1,2000,500); break;
    case 'cackle': tone(300,'square',0.1,0.07,220); tone(340,'square',0.1,0.07,240,0.12); tone(300,'square',0.1,0.07,220,0.24); tone(360,'square',0.14,0.07,200,0.36); break;
    case 'zap': noiseHit(0.6,0.35,3500,200); tone(1700,'sawtooth',0.5,0.16,180); tone(90,'square',0.5,0.14,40); break;
    case 'charge': tone(220,'sawtooth',1.1,0.07,1500); tone(330,'triangle',1.1,0.05,2000); break;
    case 'over': tone(440,'sawtooth',0.35,0.12,220); tone(330,'sawtooth',0.4,0.12,160,0.3); tone(220,'sawtooth',0.6,0.12,90,0.65); break;
    case 'record': [523,659,784,1047].forEach(function(f,i){tone(f,'triangle',0.22,0.14,null,i*0.12);}); break;
  }
}
function blip(f){tone(f,'triangle',0.2,0.12,f*1.8);}
function buzz(ms){try{if(navigator.vibrate) navigator.vibrate(ms);}catch(e){}}
function updateAudio(thrusting){
  if(!audio||!soundOn) return;
  try{
    var t=audio.ctx.currentTime;
    audio.g.gain.setTargetAtTime(thrusting?0.22:0,t,0.05);
    audio.osc.frequency.setTargetAtTime(48+c.speed*1.9,t,0.1);
    audio.og.gain.setTargetAtTime(state==='play'?0.035:0.012,t,0.2);
    var lv=0, lf=300;
    if(hero&&(hero.phase==='charge'||hero.phase==='fire')){
      lv=hero.phase==='fire'?0.07:0.025; lf=hero.phase==='fire'?330+40*Math.sin(t*40):200+hero.pt*500;
    }
    audio.lg.gain.setTargetAtTime(lv,t,0.03); audio.losc.frequency.setTargetAtTime(lf,t,0.03);
    var dv=boss?0.04:(bomber?0.03:0);
    audio.dg.gain.setTargetAtTime(dv,t,0.3); audio.dosc.frequency.setTargetAtTime(boss?95+8*Math.sin(t*6):70,t,0.1);
  }catch(e){}
}

