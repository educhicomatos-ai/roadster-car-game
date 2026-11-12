/* Doutor Tentáculo (original): hovering octopus scientist that lobs sticky octopuses onto the road */
var octoV=null, octos=[], stuckO=[];
var octoMats={body:lamb(0x8a4fd0), body2:lamb(0xb07ae8), white:lamb(0xf5f5fb), black:lamb(0x14161f), metal:lamb(0x4a5062), yellow:lamb(0xffc24a),
  glass:new THREE.MeshBasicMaterial({color:0x9fe8ff,transparent:true,opacity:0.2,depthWrite:false}), lamp:new THREE.MeshBasicMaterial({color:0xff5a5f})};
function makeOcto(sc,goggles){
  var g=new THREE.Group(), m=octoMats, tents=[];
  var body=grp(g,0,0,0);
  addSph(body,0.62,0.74,0.62,0,0.95,0,m.body);
  addSph(body,0.5,0.4,0.5,0,1.5,-0.05,m.body2);
  [-1,1].forEach(function(sd){
    addSph(body,0.21,0.23,0.16,sd*0.26,1.0,0.5,m.white); addSph(body,0.09,0.1,0.07,sd*0.26,1.0,0.64,m.black);
    if(goggles){addCyl(body,0.27,0.1,0.27,sd*0.26,1.02,0.56,m.yellow).rotation.x=Math.PI/2;}
  });
  if(goggles) addBox(body,1.3,0.07,0.07,0,1.04,0.1,m.black);
  addBox(body,0.5,0.06,0.05,0,0.62,0.6,m.black);
  for(var i=0;i<8;i++){
    var a=i/8*TAU, pv=grp(g,Math.cos(a)*0.38,0.45,Math.sin(a)*0.38);
    pv.rotation.y=Math.atan2(Math.cos(a),Math.sin(a));
    var s1=grp(pv,0,0,0); addCyl(s1,0.13,0.75,0.13,0,-0.37,0,m.body);
    var s2=grp(s1,0,-0.75,0); addCyl(s2,0.09,0.7,0.09,0,-0.35,0,m.body2);
    tents.push([s1,s2]);
  }
  g.userData={tents:tents,body:body};
  g.scale.setScalar(sc);
  return g;
}
function animOcto(m,t,fast){
  var T=m.userData.tents, k=fast?9:5;
  for(var i=0;i<T.length;i++){
    T[i][0].rotation.x=-0.9+Math.sin(t*k+i*0.8)*0.35; T[i][1].rotation.x=0.8+Math.sin(t*k*1.2+i*0.8+1)*0.5;
  }
}
function makeOctoCraft(){
  var g=new THREE.Group(), m=octoMats;
  addCyl(g,2.6,0.6,2.6,0,0,0,m.metal); addCyl(g,2.0,0.4,2.0,0,-0.45,0,m.black);
  for(var i=0;i<6;i++){var a=i/6*TAU; addSph(g,0.18,0.18,0.18,Math.cos(a)*2.3,0.1,Math.sin(a)*2.3,m.lamp);}
  var gl=new THREE.Mesh(new THREE.SphereGeometry(2.5,20,14),m.glass); gl.position.y=2.4; g.add(gl);
  var oc=makeOcto(1.6,true); oc.position.y=0.5; g.add(oc);
  [-1,1].forEach(function(sd){var f=new THREE.Mesh(flameGeo,new THREE.MeshBasicMaterial({color:0x7fe6ff,transparent:true,opacity:0.8})); f.rotation.x=Math.PI; f.position.set(sd*1.2,-1.5,0); f.scale.set(1.4,1,1.4); g.add(f);});
  g.userData={oc:oc};
  return g;
}

/* green laser air strike by the Doutor Tentáculo */
var zapMesh=new THREE.Mesh(new THREE.SphereGeometry(2.8,20,14),new THREE.MeshBasicMaterial({color:0x4aff6a,transparent:true,opacity:0.22,depthWrite:false,blending:THREE.AdditiveBlending}));
zapMesh.position.y=0.8; zapMesh.visible=false; player.add(zapMesh);
var beamGeo=new THREE.CylinderGeometry(1,1,1,12,1,true), laserWarn=new THREE.MeshBasicMaterial({color:0x4aff6a,transparent:true,opacity:0.6,side:THREE.DoubleSide,depthWrite:false});
var elBar=document.querySelector('.tank .bar'), elLiters=$('liters'), zapOn=false;
function placeZap(m,ax,ay,az,bx,by,bz,r){
  var dx=bx-ax, dy=by-ay, dz=bz-az, len=Math.sqrt(dx*dx+dy*dy+dz*dz)||1;
  m.position.set((ax+bx)/2,(ay+by)/2,(az+bz)/2); m.scale.set(r,len,r);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx/len,dy/len,dz/len));
}
function removeLaser(v){
  if(v && v.laser){scene.remove(v.laser.ring); scene.remove(v.laser.beam); scene.remove(v.laser.core); v.laser=null;}
}
function startLaser(v){
  var ring=new THREE.Mesh(warnGeo,laserWarn); ring.rotation.x=-Math.PI/2; ring.scale.setScalar(2.6); scene.add(ring);
  var beam=new THREE.Mesh(beamGeo,new THREE.MeshBasicMaterial({color:0x2dff5a,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending}));
  var core=new THREE.Mesh(beamGeo,new THREE.MeshBasicMaterial({color:0xe8ffe8,transparent:true,opacity:0.95,depthWrite:false}));
  scene.add(beam); scene.add(core);
  v.laser={t:0,tx:c.x,tz:c.z-c.speed,ring:ring,beam:beam,core:core,hit:false,fired:false};
  sfx('charge'); toast('Raio laser! Troque de faixa','bad');
}
function zapPlayer(){
  if(absorb()){addScore(50); toast('Escudo quebrou! Raio bloqueado','good'); sfx('shield'); shake=Math.max(shake,0.5); return;}
  c.zap=7; c.air=0; shake=1; bossHits++;
  if(!c.grounded||c.y>0.3){c.vy=-30; c.rolling=false;}
  c.speed*=0.85;
  burst(c.x,c.y+1,c.z,26,0x4aff6a,14,1.3); sfx('zap'); buzz(120); impactFx(1.4,0x4aff6a);
  toast('Raio verde! Ar bloqueado 7 s','bad');
}
function updateLaser(v,dt,playing,vx,vy,vz){
  var L=v.laser; if(!L) return;
  L.t+=dt;
  if(L.t<1.2){
    L.tx+=(c.x-L.tx)*Math.min(1,5*dt); L.tz=c.z-c.speed*1.0;
    placeZap(L.beam,vx,vy-1,vz,L.tx,0.2,L.tz,0.12); L.beam.material.opacity=0.35; L.core.visible=false;
    L.ring.scale.setScalar(2.6);
  }else if(L.t<1.7){
    var bl=(Math.floor(L.t*20)%2)?1:0.3;
    placeZap(L.beam,vx,vy-1,vz,L.tx,0.2,L.tz,0.3); L.beam.material.opacity=0.6*bl; L.core.visible=false;
    L.ring.scale.setScalar(2.6+0.4*Math.sin(L.t*50));
  }else if(L.t<2.5){
    if(!L.fired){L.fired=true; sfx('zap'); shake=Math.max(shake,0.35);}
    placeZap(L.beam,vx,vy-1,vz,L.tx,0.2,L.tz,1.4+0.2*Math.sin(L.t*60)); L.beam.material.opacity=0.55;
    L.core.visible=true; placeZap(L.core,vx,vy-1,vz,L.tx,0.2,L.tz,0.5); L.ring.scale.setScalar(3.2);
    if(Math.random()<0.8) burst(L.tx+rand(-1.5,1.5),0.4,L.tz+rand(-1.5,1.5),2,0x4aff6a,9,1.1);
    if(playing && !L.hit && Math.abs(c.x-L.tx)<2.5 && Math.abs(c.z-L.tz)<3.2){L.hit=true; zapPlayer();}
  }else{
    removeLaser(v); v.lcd=rand(5,7)/dif(); return;
  }
  L.ring.position.set(L.tx,0.09,L.tz);
}
function updateZapFx(){
  var on=c.zap>0;
  zapMesh.visible=on;
  if(on){
    var pu=0.5+0.5*Math.sin(performance.now()*0.014);
    zapMesh.material.opacity=0.16+0.16*pu; zapMesh.scale.setScalar(1+0.06*pu);
    player.userData.paint.emissive.setHex(0x1fa83a); player.userData.dark.emissive.setHex(0x0a5a1a);
    if(Math.random()<0.4) burst(c.x+rand(-1,1),c.y+rand(0.4,1.4),c.z+rand(-2,2),1,0x4aff6a,3,0.6);
  }
  if(on!==zapOn){
    zapOn=on; elBar.classList.toggle('zap',on); elLiters.classList.toggle('zap',on);
    if(!on){player.userData.paint.emissive.setHex(0x000000); player.userData.dark.emissive.setHex(0x000000); toast('Ar comprimido liberado','good');}
  }
}
function startOcto(){
  evJoin('octo'); ev.lastOcto=elapsed; bossHits=0;
  var m=makeOctoCraft(); scene.add(m);
  octoV={m:m,t:0,dur:26,rz:60,cd:1.6,n:0,flail:0,lcd:4.5/dif(),laser:null};
  m.position.set(0,13,c.z+60);
  eventIntro('Doutor Tentáculo','Cuidado com os polvos grudentos!'); sfx('cackle'); sfx('alarm');
}
function throwOcto(sx,sy,sz,tx,tz){
  var m=makeOcto(0.95,false); m.position.set(sx,sy,sz); scene.add(m);
  var r=new THREE.Mesh(warnGeo,evMats.warn2); r.rotation.x=-Math.PI/2; r.position.set(tx,0.07,tz); r.scale.setScalar(2.2); scene.add(r);
  octos.push({m:m,ring:r,state:'fly',t:0,T:1.3,sx:sx,sy:sy,sz:sz,tx:tx,tz:tz,x:tx,z:tz,life:10,ph:rand(0,6)});
}
function stickOcto(o,playing){
  scene.remove(o.m); if(o.ring) scene.remove(o.ring); o.dead=true;
  burst(o.x,0.8,o.z,16,0xb07ae8,10,1.2);
  if(!playing) return;
  if(hurt('Polvo grudou',4,0.6)){
    bossHits++; c.slow=5; sfx('splat');
    if(stuckO.length<3){
      var m=makeOcto(0.7,false); m.position.set(rand(-0.5,0.5),1.05,rand(-1.6,-0.4)); m.rotation.y=rand(0,TAU); player.add(m); stuckO.push(m);
    }
  }
}
function updateOctos(dt,playing){
  var i;
  for(i=octos.length-1;i>=0;i--){
    var o=octos[i], m=o.m; o.t+=dt;
    if(o.state==='fly'){
      var u=Math.min(1,o.t/o.T), gy=groundH(o.tx,o.tz);
      m.position.set(o.sx+(o.tx-o.sx)*u, o.sy+(gy-o.sy)*u+7*Math.sin(Math.PI*u), o.sz+(o.tz-o.sz)*u);
      m.rotation.y+=dt*6; m.rotation.x=Math.sin(o.t*8)*0.4; animOcto(m,o.t,true);
      if(u>=1){
        o.state='ground'; o.x=o.tx; o.z=o.tz; m.rotation.set(0,rand(0,TAU),0); burst(o.x,0.4,o.z,8,0xb07ae8,6,1);
        if(o.ring){scene.remove(o.ring); o.ring=null;}
      }
    }else{
      o.life-=dt;
      if(Math.abs(c.z-o.z)<75) o.x+=clamp(c.x-o.x,-1,1)*3.4*dt;
      o.x=clamp(o.x,-(ROAD_HALF-1),ROAD_HALF-1);
      var gy2=groundH(o.x,o.z); m.position.set(o.x,gy2+Math.abs(Math.sin(o.t*5+o.ph))*0.25,o.z);
      m.rotation.y=Math.atan2(c.x-o.x,c.z-o.z)+Math.PI*0; animOcto(m,o.t,false);
    }
    var dx=c.x-(o.state==='fly'?o.tx:o.x), dz=c.z-(o.state==='fly'?o.tz:o.z);
    if(o.state==='ground' && playing && Math.abs(dx)<1.9 && Math.abs(dz)<2.4 && c.y<2.0){stickOcto(o,playing);}
    if(o.dead){octos.splice(i,1); continue;}
    if(o.life<=0 || o.z>c.z+40){scene.remove(m); if(o.ring) scene.remove(o.ring); octos.splice(i,1);}
  }
  if(c.slow<=0 && stuckO.length){
    stuckO.forEach(function(m){player.remove(m);}); stuckO=[];
    burst(c.x,1.2,c.z,16,0xb07ae8,9,1.2); sfx('ploc'); toast('O polvo soltou o carro','info');
  }
  stuckO.forEach(function(m,k){animOcto(m,performance.now()*0.001+k,true);});
}
function updateOctoVillain(dt,playing){
  updateOctos(dt,playing);
  updateZapFx();
  if(!octoV) return;
  var v=octoV; v.t+=dt; v.cd-=dt; v.flail=Math.max(0,v.flail-dt);
  var T=v.dur, rzT=-75;
  if(v.t<3) rzT=-75+135*(1-ease(v.t/3));
  else if(v.t>T-3) rzT=-75-420*ease((v.t-(T-3))/3);
  v.rz+=(rzT-v.rz)*Math.min(1,6*dt);
  var vx=Math.sin(v.t*0.7)*(ROAD_HALF*0.7), vy=13+Math.sin(v.t*2)*0.8, vz=c.z+v.rz;
  v.m.position.set(vx,vy,vz); v.m.rotation.set(0,0,Math.cos(v.t*0.7)*0.18);
  animOcto(v.m.userData.oc,v.t,v.flail>0);
  if(playing && v.t>3 && v.t<T-3 && v.cd<=0){
    v.cd=rand(1.7,2.5)/Math.pow(dif(),0.6); v.n++; v.flail=0.5; sfx('throw');
    var k=1+(Math.random()<0.15+0.2*diffT()?1:0);
    for(var q=0;q<k;q++){
      var aimed=(Math.random()<0.35), tx=aimed?clamp(c.x+rand(-3,3),-ROAD_HALF+1.5,ROAD_HALF-1.5):rand(-ROAD_HALF+1.5,ROAD_HALF-1.5);
      var tz=c.z-clamp(c.speed*1.35,50,125)-rand(0,35);
      throwOcto(vx+rand(-1,1),vy+1,vz,tx,tz);
    }
  }
  if(playing && v.t>4 && v.t<T-4){
    v.lcd-=dt;
    if(!v.laser && v.lcd<=0){startLaser(v); v.flail=1.2;}
  }
  if(v.laser) updateLaser(v,dt,playing,vx,vy,vz);
  if(v.t>=T){
    removeLaser(v); scene.remove(v.m); octoV=null;
    finishMajor(playing,'Nenhum polvo grudou','O Doutor Tentáculo fugiu');
  }
}

