/* ---------- game flow ---------- */
function resetRun(){
  clearWorld();
  c.x=0;c.y=0;c.z=0;c.vy=0;c.speed=34;c.psi=0;c.grounded=true;c.slopeVy=0;c.pitch=0;c.rolling=false;c.rollAng=0;c.air=TANK;c.dist=0;c.shield=0;c.mult=0;c.nitro=0;c.turbo=0;c.slow=0;c.zap=0;c.slip=0;c.goo=0;c.gv=0;c.fire=0;
  dmo.ang=0; dmo.air=0; score=0; timeLeft=RUN_TIME+up.clock*5; spawnZ=-120; shake=0;
  fx.dmg=0; fx.kick=0; fx.hit=0; fx.prevTL=timeLeft; fx.jp=fx.jpv=fx.jr=fx.jrv=0; if(player.userData.paint) player.userData.paint.emissive.setHex(0);
  envReset();
  fillTraffic(); fillPups(); resetEvents();
}
function startGame(){
  resetRun(); state='count'; countT=3; lastCount=0; paused=false; $('pauseTag').hidden=true;
  $('overlay').hidden=true;
  elTime.classList.remove('low'); lastCt=99; lastSc=0; lastBump=0;
}
function endGame(){
  state='over';
  var s=Math.floor(score), rec=s>best && s>0;
  if(s>best){best=s; setBest(s); $('best').textContent=best; $('menuBest').textContent=best;}
  $('endScore').textContent='0'; $('endBest').textContent=best; $('endDist').textContent=Math.round(c.dist);
  $('endBadge').hidden=!rec;
  var earned=Math.floor(s/10)+Math.floor(c.dist/60); save.money+=earned; persist();
  $('endMoney').textContent='+ $ '+earned.toLocaleString('pt-BR');
  showSheet('endSheet');
  countUp($('endScore'),s,1100);
  rkAfterRun(s,Math.round(c.dist));
  sfx(rec?'record':'over');
  kb.left=kb.right=kb.brake=kb.boost=kb.lift=false;
  elDanger.classList.remove('on');
}
$('start').addEventListener('click',function(){this.blur(); initAudio(); lockLandscape(); startGame();});
$('again').addEventListener('click',function(){this.blur(); initAudio(); startGame();});

var lampGray=0x6a6f7c;
function crash(o){
  o.dead=true;
  var s0=c.speed;
  if(absorb()){
    shake=Math.max(shake,0.5); addScore(50);
    toast('Escudo quebrou! '+o.name+' arremessado','good'); sfx('shield');
  }else{
    c.speed*=o.heavy?0.25:0.4; c.vy=Math.max(c.vy,4); c.grounded=false;
    var pen=Math.round((o.heavy?4:3)*(1-0.08*up.armor)*(1+0.4*diffT())*10)/10;
    timeLeft-=pen; shake=1; impactFx(o.heavy?1.3:0.9,0xffa040);
    var f=$('flash'); f.style.transition='none'; f.style.opacity='0.45'; void f.offsetWidth; f.style.transition=''; f.style.opacity='0';
    toast('Batida em '+o.name+' −'+String(pen).replace('.',',')+' s','bad'); sfx('crash'); buzz(80);
  }
  o.vel=new THREE.Vector3(rand(-6,6),o.heavy?rand(2,4):rand(6,10),-Math.max(s0,20)*rand(0.5,0.9));
  o.sp=rand(-5,5);
  burst(o.m.position.x,1,o.m.position.z,16,0xffd080,12,1); burst(o.m.position.x,1,o.m.position.z,8,lampGray,7,1.4);
  shock(o.m.position.x,0,o.m.position.z,0xffd080,o.heavy?9:6,0.45);
}
function land(gh){
  var impact=-c.vy;
  c.grounded=true; c.y=gh; c.vy=0; c.slopeVy=0;
  if(impact>4){burst(c.x,0.2,c.z,14,dustHex,8,1.3); if(state==='play') sfx('land'); shock(c.x,0,c.z,dustHex,3+impact*0.3,0.45); fx.kick=Math.max(fx.kick,Math.min(0.6,impact/30));}
  if(c.rolling){
    c.rolling=false; c.rollAng=0;
    if(state==='play'){c.speed*=0.72; timeLeft-=1.5; shake=Math.max(shake,0.7); toast('Pouso torto −1,5 s','bad'); sfx('hit');}
  }else if(impact>9){
    shake=Math.max(shake,0.35);
  }
}

