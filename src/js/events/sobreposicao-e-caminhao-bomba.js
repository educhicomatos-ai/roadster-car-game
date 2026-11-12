/* events can overlap once the score is high: ev.kind is the main one, ev.sec the second one running at the same time */
function evJoin(k){if(!ev.kind) ev.kind=k; else if(!ev.sec) ev.sec=k;}
function evHas(k){return ev.kind===k||ev.sec===k;}
function evLive(){var l=[]; if(boss)l.push('boss'); if(bomber)l.push('bomber'); if(hero)l.push('hero'); if(monkey)l.push('monkey'); if(octoV)l.push('octo'); if(slimeV)l.push('slime'); if(fireV)l.push('fire'); if(jet)l.push('jet'); if(dinoEv)l.push('dino'); if(ev.met)l.push('meteors'); return l;}
function evEnded(){var l=evLive(); ev.kind=l[0]||null; ev.sec=l[1]||null; if(!l.length) ev.next=rand(15,24)*gapMul();}
var MIX_TIERS=[[20000,['meteors','monkey']],[28000,['dino','bomber','fire']],[36000,['boss','octo','jet','hero','slime']]];
function eligibleKinds(){
  var m=[];
  if(elapsed-(ev.lastMet||-99)>25) m.push('meteors');
  if(elapsed>15 && elapsed-ev.lastBomber>35 && score>=1000) m.push('bomber');
  if(elapsed>22 && elapsed-ev.lastBoss>50 && score>=1400) m.push('boss');
  if(elapsed>28 && elapsed-ev.lastHero>55 && score>=2200) m.push('hero');
  if(elapsed>18 && elapsed-ev.lastMonkey>40 && score>=300) m.push('monkey');
  if(elapsed>20 && elapsed-ev.lastDino>40 && score>=700) m.push('dino');
  if(elapsed>24 && elapsed-ev.lastJet>45 && score>=2600) m.push('jet');
  if(elapsed>16 && elapsed-ev.lastOcto>40 && score>=1800) m.push('octo');
  if(elapsed>20 && elapsed-ev.lastSlime>45 && score>=1500) m.push('slime');
  if(elapsed>18 && elapsed-ev.lastFire>40 && score>=1000) m.push('fire');
  return m;
}
function tryMix(){
  var open=[]; MIX_TIERS.forEach(function(t){if(score>=t[0]) open=open.concat(t[1]);});
  var live=evLive(), pool=eligibleKinds().filter(function(k){return open.indexOf(k)>=0 && live.indexOf(k)<0;});
  if(!pool.length) return;
  var kind=pickOf(pool), bh=bossHits;
  ({meteors:startMeteors,bomber:startBomber,boss:startBoss,hero:startHero,monkey:startMonkey,dino:startDino,jet:startJet,octo:startOcto,slime:startSlime,fire:startFire})[kind]();
  bossHits=bh;
}
function finishMajor(playing,perfect,normal){
  if(playing){
    if(bossHits===0){addScore(1000); toast(perfect+' · sem batidas +1000','good');}
    else toast(normal,'info');
  }
  evEnded();
}

/* bomber truck: lobs explosives on the ground and in the air */
function makeBomber(){
  var g=new THREE.Group(), red=lamb(0xa8261f), dark=lamb(0x1a1d28), grey=lamb(0x4a5062), yel=lamb(0xffc24a), glass=lamb(0x12162a);
  addBox(g,2.4,2.2,2.4,0,1.7,-4.8,red); addBox(g,2.2,0.9,0.08,0,2.2,-6.01,glass);
  addBox(g,2.5,2.9,8.2,0,2.15,1.9,grey); addBox(g,2.56,0.5,8.0,0,1.3,1.9,yel); addBox(g,2.56,0.5,8.0,0,2.9,1.9,yel);
  addBox(g,2.2,0.3,12,0,0.75,0,dark);
  [-4.8,3.6,5.0].forEach(function(z){addWheel(g,-1.05,0.5,z,0.5,0.28); addWheel(g,1.05,0.5,z,0.5,0.28);});
  addBox(g,1.8,0.5,1.8,0,3.8,3.8,dark);
  var tube=new THREE.Mesh(geoCyl,dark); tube.scale.set(0.55,3.4,0.55); tube.position.set(0,5.0,5.0); tube.rotation.x=0.8; g.add(tube);
  var beacon=addBox(g,0.5,0.4,0.5,0,3.0,-4.8,new THREE.MeshBasicMaterial({color:0xff3030}));
  g.userData.beacon=beacon;
  g.scale.setScalar(1.5);
  return g;
}
function startBomber(){
  evJoin('bomber'); ev.lastBomber=elapsed; bossHits=0;
  var m=makeBomber(); scene.add(m);
  bomber={m:m,t:0,dur:26,drop:0,cx:c.x};
  m.position.set(c.x,0,c.z-320);
  eventIntro('Caminhão bombardeiro','Explosivos no chão e no ar');
}
function throwBombs(){
  var b=bomber, T=1.4, tz=c.z-c.speed*T-4, lim=ROAD_HALF-2, r=Math.random();
  sfx('throw');
  b.m.updateMatrixWorld(true);
  var o=b.m.localToWorld(new THREE.Vector3(0,6.3,6.4));
  function ground(x){spawnFall('bomb',clamp(x,-lim,lim),tz+rand(-3,3),o.x,o.y,o.z,T,{ty:0,arc:7,R:4.2});}
  function air(x){spawnFall('abomb',clamp(x,-lim,lim),tz+rand(-3,3),o.x,o.y,o.z,T,{ty:5.5,arc:3,R:5});}
  if(r<0.35){ground(c.x+rand(-3,3)); if(Math.random()<0.5) ground(c.x+(Math.random()<0.5?-6:6));}
  else if(r<0.65){air(c.x+rand(-2.5,2.5));}
  else{var sd=Math.random()<0.5?-1:1; ground(c.x+sd*4); air(c.x-sd*4);}
}
function updateBomber(dt,playing){
  if(!bomber) return;
  var b=bomber; b.t+=dt;
  var T=b.dur, tin=2.5, tout=2.5, t=b.t;
  var bx=clamp(c.x*0.75+Math.sin(t*0.8)*5,-(ROAD_HALF-3),ROAD_HALF-3), bz=c.z-80+Math.sin(t*0.6)*5;
  b.cx+=(bx-b.cx)*Math.min(1,1.6*dt);
  var pz=bz, e;
  if(t<tin){e=ease(t/tin); pz=c.z-320+(bz-c.z+320)*e;}
  else if(t>T-tout){e=ease((t-(T-tout))/tout); pz=bz+(c.z-480-bz)*e;}
  b.m.position.set(b.cx,0,pz);
  b.m.rotation.y=-clamp((bx-b.cx)*0.03,-0.15,0.15);
  b.m.userData.beacon.visible=(Math.floor(t*4)%2===0);
  if(playing && evHas('bomber') && t>tin && t<T-tout){
    b.drop-=dt;
    if(b.drop<=0){b.drop=rand(0.8,1.2)/dif(); throwBombs();}
  }
  if(t>=T){
    scene.remove(b.m); bomber=null;
    finishMajor(playing,'O bombardeiro foi embora','O caminhão bombardeiro foi embora');
  }
}

