/* jurassic rush: dinosaurs run and fly toward the player */
var dinoRingGeo=new THREE.RingGeometry(0.78,1,28), dinoRingMat=new THREE.MeshBasicMaterial({color:0xffe03a,transparent:true,opacity:0.95,side:THREE.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
var dinos=[], dinoEv=null, coneGeo=new THREE.ConeGeometry(1,1,8), dinoShadowGeo=new THREE.CircleGeometry(1,16);
var dinoShadowMat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.3,depthWrite:false});
var dinoMats={green:lamb(0x5e7a3a), greenDark:lamb(0x3d5226), belly:lamb(0xd8cf9a), rexBody:lamb(0x7a5c3a), rexDark:lamb(0x4e3b24),
  tooth:lamb(0xf1f3f8), ptero:lamb(0xc77b3a), membrane:lamb(0xe0a56a), black:lamb(0x14161f), eye:new THREE.MeshBasicMaterial({color:0xffd23a})};
var DT={
  raptor:{hl:2.8,hw:1.4,clear:2.4,v:[24,32],pts:150,name:'velociraptor'},
  rex:{hl:5.7,hw:2.2,clear:5.0,v:[16,22],pts:400,name:'T-rex'},
  ptero:{hl:2.0,hw:3.7,clear:0,v:[26,36],pts:0,name:'pterodáctilo'}
};
function makeDino(type){
  var rex=(type==='rex'), S=rex?2.4:1, W=rex?1.25:1, m=dinoMats, skin=rex?m.rexBody:m.green, dk=rex?m.rexDark:m.greenDark;
  var g=new THREE.Group(), body=grp(g,0,1.55*S,0);
  addSph(body,0.5*S*W,0.5*S*W,1.0*S,0,0.2*S,0,skin);
  addSph(body,0.38*S*W,0.3*S,0.7*S,0,0.0,0.05*S,m.belly);
  if(!rex) for(var i=0;i<3;i++) addBox(body,0.5,0.06,0.18,0,0.68,-0.3+i*0.45,dk);
  var neck=addCyl(body,0.2*S*W,0.8*S,0.2*S*W,0,0.6*S,0.85*S,skin); neck.rotation.x=0.9;
  var hs=rex?1.3:1, head=grp(body,0,1.0*S,1.2*S);
  addSph(head,0.28*S*hs,0.25*S*hs,0.5*S*hs,0,0,0.2*S,skin);
  var jaw=grp(head,0,-0.1*S,0.1*S);
  addBox(jaw,0.3*S*hs,0.1*S*hs,0.5*S*hs,0,-0.07*S,0.2*S,dk);
  [-1,1].forEach(function(sd){
    var e=new THREE.Mesh(sphGeo,m.eye); e.scale.setScalar(0.07*S*hs); e.position.set(sd*0.2*S*hs,0.1*S*hs,0.25*S*hs); head.add(e);
    if(rex){for(var j=0;j<3;j++) addBox(jaw,0.05*S,0.12*S,0.05*S,sd*0.14*S*hs,0.0,(0.1+j*0.15)*S*hs,m.tooth);}
  });
  var tail=[], prev=null;
  for(var t=0;t<4;t++){
    var sg=prev?grp(prev,0,0,-1.1*S):grp(body,0,0.25*S,-0.9*S), k=1-0.22*t;
    addBox(sg,0.5*S*k*W,0.45*S*k*W,1.1*S,0,0,-0.55*S,skin); tail.push(sg); prev=sg;
  }
  function leg(x){
    var hp=grp(body,x,-0.1*S,-0.1*S), lt=rex?1.35:1;
    addCyl(hp,0.17*S*lt,0.75*S,0.17*S*lt,0,-0.375*S,0,skin);
    var kn=grp(hp,0,-0.75*S,0);
    addCyl(kn,0.12*S*lt,0.7*S,0.12*S*lt,0,-0.35*S,0,skin);
    addBox(kn,0.26*S*lt,0.1*S,0.55*S,0,-0.72*S,0.15*S,dk);
    return {hp:hp,kn:kn};
  }
  var lL=leg(-0.38*S*W), lR=leg(0.38*S*W);
  [-1,1].forEach(function(sd){
    var ar=grp(body,sd*0.3*S*W,0.2*S,0.8*S); addCyl(ar,0.07*S*(rex?0.8:1),0.45*S,0.07*S*(rex?0.8:1),0,-0.22*S,0,skin); ar.rotation.x=-0.6;
  });
  g.userData={body:body,head:head,jaw:jaw,hipL:lL.hp,kneeL:lL.kn,hipR:lR.hp,kneeR:lR.kn,tail:tail,S:S,baseY:1.55*S};
  return g;
}
function makePtero(){
  var g=new THREE.Group(), m=dinoMats;
  addSph(g,0.35,0.3,0.8,0,0,0,m.ptero); addSph(g,0.25,0.22,0.35,0,0.1,0.85,m.ptero);
  var beak=new THREE.Mesh(coneGeo,m.ptero); beak.scale.set(0.12,1.5,0.12); beak.rotation.x=Math.PI/2; beak.position.set(0,0.05,1.6); g.add(beak);
  var crest=addBox(g,0.08,0.5,0.7,0,0.35,0.5,m.ptero); crest.rotation.x=0.5;
  [-1,1].forEach(function(sd){var e=new THREE.Mesh(sphGeo,m.eye); e.scale.setScalar(0.06); e.position.set(sd*0.2,0.18,0.95); g.add(e);});
  var tl=new THREE.Mesh(coneGeo,m.ptero); tl.scale.set(0.15,1.0,0.15); tl.rotation.x=-Math.PI/2; tl.position.set(0,0,-1.3); g.add(tl);
  var wings=[], outers=[];
  [-1,1].forEach(function(sd){
    var wp=grp(g,sd*0.3,0.1,0.1);
    addBox(wp,2.0,0.05,1.4,sd*1.0,0,0,m.membrane); addBox(wp,2.1,0.1,0.1,sd*1.05,0.03,-0.45,m.black);
    var ow=grp(wp,sd*2.0,0,0);
    addBox(ow,1.4,0.05,0.9,sd*0.7,0,0.1,m.membrane); addBox(ow,1.45,0.08,0.08,sd*0.72,0.02,-0.3,m.black);
    wings.push(wp); outers.push(ow);
  });
  g.userData={wL:wings[0],wR:wings[1],oL:outers[0],oR:outers[1]};
  return g;
}
function spawnDino(type,x,z){
  var d=DT[type], m=(type==='ptero')?makePtero():makeDino(type);
  var o={type:type,m:m,x:x,y:0,z:z,v:rand(d.v[0],d.v[1]),t:rand(0,6),dead:false,vel:null,hit:false,jumped:false,done:false,cry:false,
    hl:d.hl,hw:d.hw,clear:d.clear,pts:d.pts,name:d.name,sh:null,py:0,pamp:1};
  if(type==='ptero'){
    var low=Math.random()<0.4; o.py=low?rand(1.6,2.2):rand(4.5,8); o.pamp=low?0.3:1;
    o.sh=new THREE.Mesh(dinoShadowGeo,dinoShadowMat); o.sh.rotation.x=-Math.PI/2; scene.add(o.sh);
  }
  o.ring=new THREE.Mesh(dinoRingGeo,dinoRingMat); o.ring.rotation.x=-Math.PI/2; o.rr=Math.max(2.2,d.hw+1.1,type==='rex'?3.4:0); scene.add(o.ring);
  m.position.set(x,o.py,z); scene.add(m); dinos.push(o);
}
function animateDino(d){
  var u=d.m.userData, t=d.t;
  if(d.type==='ptero'){
    var f=Math.sin(t*10), f2=Math.sin(t*10-0.9);
    u.wR.rotation.z=f*0.7; u.wL.rotation.z=-f*0.7; u.oR.rotation.z=f2*0.5; u.oL.rotation.z=-f2*0.5;
    d.m.rotation.z=Math.sin(t*1.3)*0.15; d.m.rotation.x=-0.08;
    return;
  }
  var rex=(d.type==='rex'), w=t*(rex?7:13), sn=Math.sin(w), S=u.S;
  u.body.position.y=u.baseY+Math.abs(sn)*0.12*S; u.body.rotation.z=sn*0.04; u.body.rotation.x=0.05;
  u.hipL.rotation.x=sn*0.9; u.hipR.rotation.x=-sn*0.9;
  u.kneeL.rotation.x=Math.max(0,Math.sin(w+1.2))*0.9+0.2; u.kneeR.rotation.x=Math.max(0,Math.sin(w+1.2+Math.PI))*0.9+0.2;
  for(var i=0;i<u.tail.length;i++){u.tail[i].rotation.y=Math.sin(w*0.5-i)*0.22;}
  u.head.rotation.x=Math.sin(w*2)*0.08;
  var near=(d.z<c.z && c.z-d.z<90);
  u.jaw.rotation.x=near?0.5+0.2*Math.sin(t*12):0.05;
}
function hitDino(d){
  d.hit=true;
  var s0=c.speed, info={raptor:['Velociraptor',2,0.6],rex:['T-rex',4,0.35],ptero:['Pterodáctilo',2,0.7]}[d.type];
  if(hurt(info[0],info[1],info[2])) bossHits++;
  burst(c.x,c.y+1,c.z,18,0xc9a06a,12,1.2);
  if(d.type!=='rex'){d.dead=true; d.vel=new THREE.Vector3(rand(-6,6),rand(6,10),-Math.max(s0,20)*0.5);}
}
function updateDinos(dt,playing){
  if(dinoEv){
    var e=dinoEv, lim=ROAD_HALF-2; e.t+=dt; e.rap-=dt; e.rex-=dt; e.pt-=dt;
    if(playing && e.t<e.dur-3){
      if(e.rap<=0 && dinos.length<16){
        e.rap=rand(1.8,2.8)/dif();
        var n=2+(Math.random()<0.4?1:0), lanes=[0,1,2,3,4,5,6], z0=c.z-rand(280,340);
        for(var q=0;q<n;q++){var li=lanes.splice((Math.random()*lanes.length)|0,1)[0]; spawnDino('raptor',laneX(li)+rand(-1,1),z0+rand(-14,14));}
      }
      if(e.rex<=0 && dinos.length<16){e.rex=rand(5,7.5)/dif(); spawnDino('rex',laneX((Math.random()*LANES)|0),c.z-300);}
      if(e.pt<=0 && dinos.length<16){
        e.pt=rand(1.3,2.2)/dif();
        var np=Math.random()<0.4?2:1;
        for(var r=0;r<np;r++) spawnDino('ptero',rand(-lim,lim),c.z-rand(300,360));
      }
    }
    if(e.t>=e.dur){dinoEv=null; finishMajor(playing,'A corrida jurássica acabou','A corrida jurássica acabou');}
  }
  for(var i=dinos.length-1;i>=0;i--){
    var d=dinos[i], m=d.m;
    d.t+=dt;
    if(d.dead){
      d.vel.y-=22*dt; d.x+=d.vel.x*dt; d.y+=d.vel.y*dt; d.z+=d.vel.z*dt;
      if(d.y<=0){d.y=0; d.vel.y=0; d.vel.x*=0.92; d.vel.z*=0.92;}
      m.rotation.x+=d.vel.z*0.004; m.rotation.z+=d.vel.x*0.02;
    }else{
      d.z+=d.v*dt;
      if(d.type==='raptor'){
        if(Math.abs(c.z-d.z)<160) d.x+=clamp(c.x-d.x,-2.5,2.5)*dt;
        d.x=clamp(d.x,-(ROAD_HALF-1.2),ROAD_HALF-1.2);
      }
      if(d.type==='ptero'){d.y=d.py+Math.sin(d.t*3)*0.4*d.pamp; d.x+=Math.sin(d.t*1.3)*1.2*dt;}
      else d.y=groundH(d.x,d.z);
      animateDino(d);
      if(!d.cry && playing && d.z<c.z && c.z-d.z<90){d.cry=true; if(d.type==='rex') sfx('roar'); else if(d.type==='ptero') sfx('screech');}
      if(d.type==='rex' && c.z-d.z<40 && c.z-d.z>-10) shake=Math.max(shake,0.12);
    }
    m.position.set(d.x,d.y,d.z);
    if(d.ring){d.ring.visible=!d.dead; d.ring.position.set(d.x,0.09,d.z); var rp=d.rr*(1+0.06*Math.sin(d.t*6)); d.ring.scale.set(rp,rp,1);}
    if(d.sh){d.sh.position.set(d.x,0.05,d.z); var sc=1/(1+d.y*0.12); d.sh.scale.set(2.8*sc,1.1*sc,1);}
    var dz=c.z-d.z, dx=c.x-d.x;
    if(playing && !d.dead && !d.hit && Math.abs(dz)<d.hl && Math.abs(dx)<d.hw){
      if(d.type==='ptero'){ if(Math.abs((c.y+0.7)-d.y)<1.5) hitDino(d); }
      else if(c.y<d.clear) hitDino(d);
      else d.jumped=true;
    }
    if(!d.done && d.z>c.z+d.hl){
      d.done=true;
      if(playing && d.jumped && !d.hit && d.type!=='ptero'){
        addScore(d.pts); timeLeft+=(d.type==='rex'?3:1);
        toast('Salto sobre '+d.name+' +'+d.pts,'good'); sfx('bonus');
      }
    }
    if(!d.dead && d.type!=='ptero'){
      cars.forEach(function(o){
        if(o.dead||!o.m) return;
        if(Math.abs(o.m.position.x-d.x)<d.hw*0.8+1 && Math.abs(o.m.position.z-d.z)<d.hl*0.6+o.L/2){
          o.dead=true; o.vel=new THREE.Vector3(rand(-8,8),rand(6,10),d.v*0.5); burst(o.m.position.x,1,o.m.position.z,10,0xc9a06a,9,1);
        }
      });
    }
    if(d.z>c.z+60 || d.z<c.z-700){scene.remove(m); if(d.sh) scene.remove(d.sh); if(d.ring) scene.remove(d.ring); dinos.splice(i,1);}
  }
}
function startDino(){
  evJoin('dino'); ev.lastDino=elapsed; bossHits=0;
  dinoEv={t:0,dur:24,rap:0.8,rex:3.5,pt:1.2};
  eventIntro('Corrida jurássica','Dinossauros vindo na contramão'); sfx('roar');
}

function startMeteors(){
  evJoin('meteors'); ev.met=true; ev.lastMet=elapsed; ev.t=0; ev.dur=8+6*diffT(); ev.sp=0.6;
  eventIntro('Chuva de meteoros','Fique de olho nos anéis vermelhos');
}
function startBoss(){
  evJoin('boss'); ev.lastBoss=elapsed;
  var m=makeDrone(); scene.add(m);
  var sh=new THREE.Mesh(new THREE.CircleGeometry(1,24),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.3,depthWrite:false}));
  sh.rotation.x=-Math.PI/2; sh.scale.set(9,6,1); scene.add(sh);
  boss={m:m,sh:sh,t:0,dur:27,drop:0,mini:3,cx:c.x+40};
  bossHits=0;
  m.position.set(boss.cx,80,c.z-240);
  eventIntro('Drone de entregas','Desvie das caixas e dos mini drones');
}
function dropPattern(){
  sfx('drop');
  var T=1.25, tz=c.z-c.speed*T-2, lim=ROAD_HALF-2, r=Math.random(), xs;
  if(r<0.5) xs=[c.x+rand(-2.5,2.5)];
  else if(r<0.8) xs=[c.x-3.5,c.x+3.5];
  else xs=[c.x-6.5,c.x,c.x+6.5];
  var bp=boss.m.position;
  xs.forEach(function(x){spawnFall('crate',clamp(x,-lim,lim),tz+rand(-3,3),bp.x+rand(-2,2),bp.y-2,bp.z,T);});
}
function updateBoss(dt,playing){
  if(!boss) return;
  boss.t+=dt;
  var T=boss.dur, tin=2.5, tout=2.5, t=boss.t;
  var hx=clamp(c.x*0.8+Math.sin(t*0.7)*8,-14,14), hy=22+Math.sin(t*1.3)*1.5, hz=c.z-62+Math.sin(t*0.5)*6;
  boss.cx+=(hx-boss.cx)*Math.min(1,2*dt);
  var px=boss.cx, py=hy, pz=hz, e;
  if(t<tin){e=ease(t/tin); px=c.x+40+(px-c.x-40)*e; py=80+(hy-80)*e; pz=c.z-240+(hz-c.z+240)*e;}
  else if(t>T-tout){e=ease((t-(T-tout))/tout); px=px+(c.x-70-px)*e; py=hy+(110-hy)*e; pz=hz+(c.z-320-hz)*e;}
  boss.m.position.set(px,py,pz);
  boss.m.rotation.z=clamp((hx-boss.cx)*0.03,-0.25,0.25);
  boss.m.rotation.x=0.06;
  boss.m.userData.rotors.forEach(function(r){r.rotation.y+=45*dt;});
  boss.sh.position.set(px,0.05,pz); boss.sh.material.opacity=0.32/(1+py*0.02);
  if(playing && evHas('boss') && t>tin && t<T-tout){
    boss.drop-=dt;
    if(boss.drop<=0){boss.drop=rand(0.8,1.3)/dif(); dropPattern();}
    boss.mini-=dt;
    if(boss.mini<=0){boss.mini=rand(2.2,3.4); launchMinis();}
  }
  if(t>=T){
    scene.remove(boss.m); scene.remove(boss.sh);
    boss=null;
    finishMajor(playing,'O drone foi embora','O drone de entregas foi embora');
  }
}
