/* ---------- trilha sonora: 3 músicas sintetizadas por código (sem arquivos de áudio) ----------
   play   = gameplay: rock pesado e rápido (riff agudo repetido, bateria, power chords, coro)
   menu   = menus: versão épica em meio tempo (pads, arpejo com eco, melodia heroica)
   garage = garagem: versão calma (pads suaves, notas com eco, batida leve)
   As músicas são originais: inspiradas na energia dos hinos de estádio e do rock de games de corrida. */
var MUS={on:false,mode:'',tr:{},bus:null,revIn:null,timer:0,hot:false};
function mf(n){return 440*Math.pow(2,(n-69)/12);}
function mCurve(k){var n=2048,c=new Float32Array(n);for(var i=0;i<n;i++){var v=i*2/n-1;c[i]=Math.tanh(v*k);}return c;}
function mkTrack(name){
  var x=audio.ctx, t={name:name,active:false,step:0,next:0,out:x.createGain()};
  t.out.gain.value=0; t.out.connect(MUS.bus);
  function chain(drive,cut,vol,rev){
    var inp=x.createGain(), o=x.createGain(); o.gain.value=vol; var last=inp;
    if(drive){var sh=x.createWaveShaper(); sh.curve=mCurve(drive); sh.oversample='2x'; last.connect(sh); last=sh;}
    var lp=x.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=cut; lp.Q.value=0.5; last.connect(lp); lp.connect(o); o.connect(t.out);
    if(rev){var s=x.createGain(); s.gain.value=rev; o.connect(s); s.connect(MUS.revIn);}
    return inp;
  }
  if(name==='play'){ t.bpm=140; t.gtr=chain(9,3600,0.5,0.05); t.lead=chain(4.5,4600,0.55,0.18); t.bass=chain(2,520,0.75,0); }
  else if(name==='menu'){
    t.bpm=96; t.gtr=chain(8,3200,0.45,0.1); t.lead=chain(3,3800,0.5,0.3); t.bass=chain(1.5,420,0.7,0); t.pad=chain(0,1500,0.34,0.5); t.pl=chain(0,4200,0.5,0.55);
    var dl=x.createDelay(1); dl.delayTime.value=60/96*0.75; var fb=x.createGain(); fb.gain.value=0.38; var dg=x.createGain(); dg.gain.value=0.45;
    t.pl.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(dg); dg.connect(t.out);
  }else{
    t.bpm=72; t.pad=chain(0,1100,0.4,0.55); t.pl=chain(0,3000,0.55,0.6); t.bass=chain(0,300,0.6,0);
    var d2=x.createDelay(1); d2.delayTime.value=60/72*0.75; var f2=x.createGain(); f2.gain.value=0.42; var g2=x.createGain(); g2.gain.value=0.5;
    t.pl.connect(d2); d2.connect(f2); f2.connect(d2); d2.connect(g2); g2.connect(t.out);
  }
  var dr=x.createGain(); dr.gain.value=name==='garage'?0.5:1; dr.connect(t.out); t.drum=dr;
  return t;
}
function musInit(){
  if(MUS.on||!audio) return;
  try{
    var x=audio.ctx;
    MUS.bus=x.createGain(); MUS.bus.gain.value=0.5;
    var comp=x.createDynamicsCompressor(); comp.threshold.value=-20; comp.knee.value=12; comp.ratio.value=4; comp.attack.value=0.006; comp.release.value=0.22;
    MUS.bus.connect(comp); comp.connect(audio.master);
    var rl=Math.floor(x.sampleRate*2.4), ib=x.createBuffer(2,rl,x.sampleRate);
    for(var ch=0;ch<2;ch++){var d=ib.getChannelData(ch); for(var i=0;i<rl;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/rl,2.7);}
    var rv=x.createConvolver(); rv.buffer=ib; var rg=x.createGain(); rg.gain.value=0.55; rv.connect(rg); rg.connect(MUS.bus);
    MUS.revIn=x.createGain(); MUS.revIn.connect(rv);
    ['play','menu','garage'].forEach(function(n){MUS.tr[n]=mkTrack(n);});
    MUS.timer=setInterval(musSched,30); MUS.on=true;
  }catch(e){MUS.on=false;}
}
/* vozes */
function mEnv(g,t,att,d,vol){g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vol,t+att); g.gain.exponentialRampToValueAtTime(0.0001,t+d);}
function mOsc(type,f,t,d,vol,dest,att,det){
  var x=audio.ctx, o=x.createOscillator(), g=x.createGain(); o.type=type; o.frequency.value=f; if(det) o.detune.value=det;
  mEnv(g,t,att||0.004,d,vol); o.connect(g); g.connect(dest); o.start(t); o.stop(t+d+0.05);
}
function mPad(f,t,d,vol,dest,type){
  var x=audio.ctx, att=Math.min(0.9,d*0.35);
  [-7,7].forEach(function(det){
    var o=x.createOscillator(), g=x.createGain(); o.type=type||'sawtooth'; o.frequency.value=f; o.detune.value=det;
    g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vol,t+att); g.gain.setValueAtTime(vol,t+d-att); g.gain.linearRampToValueAtTime(0.0001,t+d+0.6);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t+d+0.7);
  });
}
function mNoise(t,d,vol,type,freq,q,dest){
  var x=audio.ctx, s=x.createBufferSource(); s.buffer=audio.nbuf; var f=x.createBiquadFilter(); f.type=type; f.frequency.value=freq; f.Q.value=q||0.7;
  var g=x.createGain(); mEnv(g,t,0.002,d,vol); s.connect(f); f.connect(g); g.connect(dest); s.start(t,Math.random()*1.5,d+0.05);
}
function mChord(tr,t,root,d,vol,notes){
  (notes||[0,7,12]).forEach(function(n){var f=mf(root+n); mOsc('sawtooth',f,t,d,vol,tr.gtr,0.003,-7); mOsc('sawtooth',f,t,d,vol,tr.gtr,0.003,7);});
}
function mKick(tr,t,v){
  var x=audio.ctx, o=x.createOscillator(), g=x.createGain(); o.type='sine'; o.frequency.setValueAtTime(150,t); o.frequency.exponentialRampToValueAtTime(42,t+0.11);
  mEnv(g,t,0.002,0.22,v); o.connect(g); g.connect(tr.drum); o.start(t); o.stop(t+0.25); mNoise(t,0.02,v*0.25,'highpass',3000,0.5,tr.drum);
}
function mSnare(tr,t,v){ mNoise(t,0.16,v,'bandpass',1900,0.6,tr.drum); mOsc('triangle',190,t,0.09,v*0.6,tr.drum); }
function mHat(tr,t,v,open){ mNoise(t,open?0.2:0.04,v,'highpass',7500,0.7,tr.drum); }
function mCrash(tr,t,v){ mNoise(t,1.5,v,'highpass',5200,0.5,tr.drum); }
function mTom(tr,t,f,v){
  var x=audio.ctx, o=x.createOscillator(), g=x.createGain(); o.type='sine'; o.frequency.setValueAtTime(f,t); o.frequency.exponentialRampToValueAtTime(f*0.55,t+0.18);
  mEnv(g,t,0.003,0.26,v); o.connect(g); g.connect(tr.drum); o.start(t); o.stop(t+0.3);
}
function mShout(tr,t,v){ mNoise(t,0.2,v,'bandpass',900,2.2,tr.drum); mNoise(t,0.2,v*0.7,'bandpass',1700,3,tr.drum); }
function mClap(tr,t,v){ mNoise(t,0.07,v,'bandpass',1500,1.2,tr.drum); mNoise(t+0.012,0.09,v*0.8,'bandpass',1500,1.2,tr.drum); }

/* ===== GAMEPLAY: rock pesado, 140 BPM, mi menor ===== */
var PL_RIFF=[0,7,0,10,0,7,0,12,0,7,0,10,0,7,3,5];
var PL_VERSE=[40,40,43,45,40,40,38,36], PL_CHORUS=[40,38,45,40,40,38,43,45];
function plSection(b){ if(b>=40) b=2+((b-2)%38); return b; }
function plStep(tr,st,t){
  var b=plSection(Math.floor(st/16)), s=st%16, x=audio.ctx, sec, i, root, hot=MUS.hot;
  var q=60/tr.bpm/4;
  if(b<2){ sec='intro'; root=40; } else if(b<10){ sec='verse1'; root=PL_VERSE[b-2]; } else if(b<12){ sec='pre'; root=47; }
  else if(b<20){ sec='chorus'; root=PL_CHORUS[b-12]; } else if(b<28){ sec='verse2'; root=PL_VERSE[b-20]; } else if(b<30){ sec='pre'; root=47; }
  else if(b<38){ sec='chorus'; root=PL_CHORUS[b-30]; } else { sec='break'; root=40; }
  var first=(s===0);
  if(sec==='intro'){
    mOsc('square',mf(76+PL_RIFF[s]),t,q*0.9,0.2,tr.lead,0.003);
    if(b===1){ if(s%4===0) mKick(tr,t,0.55); if(s>=8&&s%2===0) mHat(tr,t,0.25,false); if(s===14) mSnare(tr,t,0.4); }
    return;
  }
  if(sec==='verse1'||sec==='verse2'){
    if(first&&b===2&&sec==='verse1') mCrash(tr,t,0.35);
    if([0,2,3,6,8,10,11,14].indexOf(s)>=0) mChord(tr,t,root+12,q*1.6,0.1,[0,7]);
    if(s%2===0) mOsc('sawtooth',mf(root),t,q*1.7,0.32,tr.bass,0.004);
    if([0,6,8,10].indexOf(s)>=0 || (s===14&&b%2===1)) mKick(tr,t,0.85);
    if(s===4||s===12) mSnare(tr,t,0.7);
    if(s%2===0) mHat(tr,t,0.22,false);
    if(sec==='verse2'||hot) mOsc('square',mf(76+PL_RIFF[s]),t,q*0.9,0.11,tr.lead,0.003);
    return;
  }
  if(sec==='pre'){
    var pb=b%2, last=(pb===1);
    if(s%2===0) mOsc('sawtooth',mf(root),t,q*1.9,0.3,tr.bass,0.004);
    if(s===0||s===8) mChord(tr,t,root+12,q*7,0.12,[0,7,12]);
    if(!last){ if(s%4===0) mKick(tr,t,0.8); if(s===4||s===12) mSnare(tr,t,0.65); mHat(tr,t,0.18,false); }
    else { mSnare(tr,t,0.3+0.5*(s/15)); if(s%4===0) mKick(tr,t,0.7); if(s>=12) mTom(tr,t,220-(s-12)*30,0.5); }
    if(sec==='pre'&&last&&s===15) mCrash(tr,t+q,0.0);
    return;
  }
  if(sec==='chorus'){
    var cb=(b>=30?b-30:b-12);
    if(first){ mCrash(tr,t,0.5); }
    if([0,6,8,14].indexOf(s)>=0){ mChord(tr,t,root+12,s===0||s===8?q*5.5:q*3,0.15,[0,7,12]); }
    if(s%2===0) mOsc('sawtooth',mf(root),t,q*1.8,0.36,tr.bass,0.004);
    if(s%4===0||s===10) mKick(tr,t,0.95);
    if(s===4||s===12) mSnare(tr,t,0.85);
    if(s%4===2) mHat(tr,t,0.3,true); else if(s%2===0) mHat(tr,t,0.18,false);
    if(first||s===8){ if(cb%2===0) mShout(tr,t,0.35); mOsc('square',mf(root+36),t,q*3,0.1,tr.lead,0.004); }
    if(s===4||s===12) mOsc('square',mf(root+31),t,q*2,0.07,tr.lead,0.004);
    return;
  }
  /* break: pisadas e palmas, e uma virada de tons no fim */
  if(s%4===0) mKick(tr,t,0.9); if(s===4||s===12) mClap(tr,t,0.8);
  if(b===39&&s>=8){ if(s%2===0) mTom(tr,t,260-(s-8)*14,0.55); }
  if(b===38&&s===0) mCrash(tr,t,0.3);
}
/* ===== MENUS: épico em meio tempo, 96 BPM, mi menor ===== */
var MN_CH=[[64,67,71],[64,67,71],[60,64,67],[60,64,67],[59,62,67],[59,62,67],[62,66,69],[62,66,69]];
var MN_BASS=[40,40,36,36,43,43,38,38];
var MN_MEL=[[[0,83,6],[6,81,2],[8,79,4],[12,76,4]],[[0,79,4],[4,81,4],[8,83,8]],
            [[0,84,6],[6,83,2],[8,79,4],[12,76,4]],[[0,79,8],[8,76,4],[12,79,4]],
            [[0,86,6],[6,83,2],[8,79,4],[12,83,4]],[[0,81,4],[4,83,4],[8,86,8]],
            [[0,86,4],[4,85,4],[8,81,4],[12,78,4]],[[0,81,16]]];
function mnStep(tr,st,t){
  var bar=Math.floor(st/16)%16, b8=bar%8, s=st%16, q=60/tr.bpm/4, ch=MN_CH[b8], second=bar>=8;
  if(s===0){ ch.forEach(function(n){mPad(mf(n),t,q*16,0.07,tr.pad,'sawtooth');}); mOsc('sawtooth',mf(MN_BASS[b8]),t,q*15,0.3,tr.bass,0.01); mOsc('sine',mf(MN_BASS[b8]-12),t,q*15,0.35,tr.bass,0.01); }
  if(s%2===0){ var idx=[0,1,2,1,2,1,2,1][s/2]; mOsc('triangle',mf(ch[idx]+12),t,q*5,0.16,tr.pl,0.004); mOsc('sine',mf(ch[idx]+24),t,q*3,0.05,tr.pl,0.004); }
  if(s===0||s===10) mKick(tr,t,0.75); if(s===8) mSnare(tr,t,0.65);
  if(s%2===0) mHat(tr,t,0.12,false);
  if(bar%4===3&&s>=12) mTom(tr,t,200-(s-12)*20,0.4);
  if(second){
    if(s===0){ if(b8===0) mCrash(tr,t,0.4); mChord(tr,t,MN_BASS[b8]+12,q*15,0.11,[0,7,12]); }
    MN_MEL[b8].forEach(function(m){ if(m[0]===s){ mOsc('sawtooth',mf(m[1]),t,q*m[2]*0.95,0.17,tr.lead,0.02,-5); mOsc('square',mf(m[1]),t,q*m[2]*0.95,0.07,tr.lead,0.02,6); } });
  }
}
/* ===== GARAGEM: calmo, 72 BPM, dó maior ===== */
var GA_CH=[[48,52,55,59],[45,48,52,55],[41,45,48,52],[43,47,50,52]];
var GA_MEL=[[[2,79,4],[10,76,6]],[[0,76,4],[8,72,4],[12,74,4]],[[4,72,6],[12,69,4]],[[0,74,6],[8,71,8]]];
function gaStep(tr,st,t){
  var bar=Math.floor(st/16)%8, c=Math.floor(bar/2), s=st%16, q=60/tr.bpm/4, ch=GA_CH[c];
  if(s===0&&bar%2===0){ ch.forEach(function(n){mPad(mf(n+12),t,q*32,0.07,tr.pad,'triangle'); mPad(mf(n),t,q*32,0.045,tr.pad,'sawtooth');}); mOsc('sine',mf(ch[0]-12),t,q*30,0.42,tr.bass,0.05); }
  if(s%2===0){ var seq=[0,2,1,3,2,3,1,2], n=ch[seq[(s/2+bar)%8]%4]; if(!((s/2+bar)%5===4)) mOsc('sine',mf(n+12),t,q*7,0.2,tr.pl,0.006); }
  GA_MEL[c].forEach(function(m){ if(bar%2===0&&m[0]===s) mOsc('triangle',mf(m[1]),t,q*m[2],0.17,tr.pl,0.03); });
  if(s===0||s===8) mKick(tr,t,0.28); if(s%4===2) mHat(tr,t,0.07,false);
}
var MUS_STEP={play:plStep,menu:mnStep,garage:gaStep};
function musSched(){
  if(!audio||!MUS.on||!soundOn) return;
  var now=audio.ctx.currentTime;
  for(var k in MUS.tr){
    var tr=MUS.tr[k]; if(!tr.active) continue;
    if(tr.next<now-0.3) tr.next=now+0.05;
    while(tr.next<now+0.16){ try{ MUS_STEP[k](tr,tr.step,tr.next); }catch(e){} tr.next+=60/tr.bpm/4; tr.step++; }
  }
}
function musSwitch(want){
  var now=audio.ctx.currentTime, old=MUS.tr[MUS.mode], tr=MUS.tr[want];
  if(old){ old.out.gain.cancelScheduledValues(now); old.out.gain.setTargetAtTime(0,now,want==='play'?0.25:0.5); setTimeout(function(){ if(MUS.mode!==old.name) old.active=false; },2600); }
  tr.step=0; tr.next=now+0.08; tr.active=true; tr.out.gain.cancelScheduledValues(now); tr.out.gain.setTargetAtTime(1,now,want==='play'?0.06:0.5);
  MUS.mode=want;
}
function musicTick(){
  if(!audio||!soundOn) return;
  if(!MUS.on){ musInit(); if(!MUS.on) return; }
  var want=studio?'garage':((state==='count'||state==='play')?'play':'menu');
  if(want!==MUS.mode) musSwitch(want);
  MUS.hot=!!(ev&&ev.kind);
}
