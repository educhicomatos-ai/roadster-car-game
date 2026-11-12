/* superhero: throws cars and fires laser eyes (original character) */
var heroMats={suit:lamb(0x2b2f3d), blue:lamb(0x2f7bff), red:lamb(0xd62839), redDark:lamb(0x8f1b2a), skin:lamb(0xe3a982), hair:lamb(0x2a1b14), dark:lamb(0x14161f), white:lamb(0xf1f3f8)};
var eyeIdle=new THREE.MeshBasicMaterial({color:0xf1f3f8}), eyeHot=new THREE.MeshBasicMaterial({color:0xff2a2a});
var beamMat=new THREE.MeshBasicMaterial({color:0xff2a2a,transparent:true,opacity:0.85,depthWrite:false});
var V3=new THREE.Vector3(), Y3=new THREE.Vector3(0,1,0);
var sphGeo=new THREE.SphereGeometry(1,16,12), hexGeo=new THREE.CylinderGeometry(1,1,1,6), HERO_S=1.0;
function addSph(p,rx,ry,rz,x,y,z,mat){var m=new THREE.Mesh(sphGeo,mat); m.scale.set(rx,ry,rz); m.position.set(x,y,z); p.add(m); return m;}
function addCyl(p,rx,h,rz,x,y,z,mat){var m=new THREE.Mesh(geoCyl,mat); m.scale.set(rx,h,rz); m.position.set(x,y,z); p.add(m); return m;}
function grp(p,x,y,z){var q=new THREE.Group(); q.position.set(x,y,z); p.add(q); return q;}
function makeHero(){
  var g=new THREE.Group(), s=heroMats;
  var pelvis=grp(g,0,2.55,0);
  addBox(pelvis,1.75,0.8,1.0,0,0,0,s.suit);
  addBox(pelvis,1.85,0.3,1.08,0,0.45,0,s.red);
  addBox(pelvis,0.5,0.34,0.1,0,0.45,0.57,s.blue);
  var chest=grp(pelvis,0,0.5,0);
  addBox(chest,1.55,0.8,1.0,0,0.3,0,s.suit);
  addBox(chest,2.5,1.35,1.25,0,1.0,0,s.suit);
  [-1,1].forEach(function(sd){addBox(chest,0.16,1.3,1.28,sd*1.2,1.0,0,s.blue);});
  var hexo=new THREE.Mesh(hexGeo,s.red); hexo.scale.set(0.58,0.08,0.58); hexo.rotation.x=Math.PI/2; hexo.position.set(0,1.05,0.64); chest.add(hexo);
  var hexi=new THREE.Mesh(hexGeo,s.white); hexi.scale.set(0.3,0.1,0.3); hexi.rotation.x=Math.PI/2; hexi.position.set(0,1.05,0.66); chest.add(hexi);
  addBox(chest,1.0,0.2,0.75,0,1.72,0,s.red);
  /* head */
  var head=grp(chest,0,1.65,0);
  addCyl(head,0.32,0.4,0.32,0,0.0,0,s.skin);
  addSph(head,0.5,0.55,0.5,0,0.55,0,s.skin); addBox(head,0.8,0.4,0.72,0,0.32,0.05,s.skin);
  addSph(head,0.54,0.36,0.54,0,0.9,-0.06,s.hair); addBox(head,0.72,0.14,0.22,0,0.98,0.33,s.hair);
  var eyeL=addBox(head,0.2,0.1,0.06,-0.2,0.58,0.52,eyeIdle), eyeR=addBox(head,0.2,0.1,0.06,0.2,0.58,0.52,eyeIdle);
  var bl=addBox(head,0.28,0.07,0.06,-0.2,0.7,0.53,s.hair), br2=addBox(head,0.28,0.07,0.06,0.2,0.7,0.53,s.hair);
  bl.rotation.z=-0.35; br2.rotation.z=0.35;
  addBox(head,0.1,0.18,0.14,0,0.45,0.56,s.skin); addBox(head,0.25,0.04,0.04,0,0.3,0.42,s.dark);
  addSph(head,0.1,0.14,0.08,-0.5,0.5,0,s.skin); addSph(head,0.1,0.14,0.08,0.5,0.5,0,s.skin);
  /* arms */
  function makeArm(x){
    var sh=grp(chest,x,1.4,0);
    addSph(sh,0.6,0.6,0.6,0,0,0,s.blue);
    addCyl(sh,0.42,1.15,0.42,0,-0.62,0,s.suit);
    var el=grp(sh,0,-1.2,0);
    addCyl(el,0.38,0.9,0.38,0,-0.45,0,s.suit); addCyl(el,0.45,0.55,0.45,0,-0.6,0,s.blue);
    addSph(el,0.4,0.4,0.4,0,-1.0,0.05,s.skin);
    return {sh:sh,el:el};
  }
  var aL=makeArm(-1.5), aR=makeArm(1.5);
  var fist=new THREE.Mesh(sphGeo,new THREE.MeshBasicMaterial({color:0x9fd0ff,transparent:true,opacity:0.9}));
  fist.scale.setScalar(0.6); fist.position.set(0,-1.0,0.05); fist.visible=false; aR.el.add(fist);
  /* legs */
  function makeLeg(x){
    var hp=grp(pelvis,x,-0.25,0);
    addCyl(hp,0.52,1.15,0.52,0,-0.58,0,s.suit);
    var kn=grp(hp,0,-1.15,0);
    addCyl(kn,0.42,1.0,0.42,0,-0.5,0,s.suit);
    addCyl(kn,0.46,0.22,0.46,0,-0.78,0,s.red);
    addBox(kn,0.8,0.55,1.15,0,-1.02,0.15,s.blue);
    return {hp:hp,kn:kn};
  }
  var lL=makeLeg(-0.55), lR=makeLeg(0.55);
  /* cape: four hinged segments for a flowing follow-through */
  var capeSegs=[], prev=null;
  for(var i=0;i<4;i++){
    var seg=prev?grp(prev,0,-1.0,0):grp(chest,0,1.5,-0.7), w=2.2+0.15*i;
    addBox(seg,w,1.0,0.06,0,-0.5,0,i===3?s.redDark:s.red); addBox(seg,w-0.1,0.98,0.03,0,-0.5,0.04,s.blue);
    capeSegs.push(seg); prev=seg;
  }
  g.userData={pelvis:pelvis,chest:chest,head:head,eyeL:eyeL,eyeR:eyeR,fist:fist,
    armL:aL.sh,elbowL:aL.el,armR:aR.sh,elbowR:aR.el,hipL:lL.hp,kneeL:lL.kn,hipR:lR.hp,kneeR:lR.kn,capeSegs:capeSegs};
  g.scale.setScalar(HERO_S);
  return g;
}
function startHero(){
  evJoin('hero'); ev.lastHero=elapsed; bossHits=0;
  var m=makeHero(); scene.add(m);
  var ring=new THREE.Mesh(warnGeo,evMats.warn); ring.rotation.x=-Math.PI/2; ring.scale.setScalar(2.4); ring.visible=false; scene.add(ring);
  var cross=new THREE.Mesh(warnGeo,evMats.warn); cross.scale.setScalar(2.6); cross.visible=false; scene.add(cross);
  var beams=[0,1].map(function(){var b=new THREE.Mesh(geoCyl,beamMat); b.visible=false; scene.add(b); return b;});
  hero={m:m,ring:ring,beams:beams,t:0,pt:0,dur:34,phase:'in',seq:['throw','throw','laser'],si:0,
    px:c.x+45,py:70,pz:c.z-260,fx:0,fy:0,fz:0,lx:c.x,lz:c.z-12,cd:0,ph0:rand(0,6),car:null,cmesh:null,cfrom:null,bt:0.05,sCd:2,cross:cross,tx:0,ty:0,tz:0,lockx:0,locky:0,lockz:0,
    j:null,jv:null,sz:1};
  m.position.set(hero.px,hero.py,hero.pz);
  eventIntro('Capitão Raio','Desvie dos carros e dos lasers');
}
function pickCarForHero(){
  var best=null,bd=1e9;
  cars.forEach(function(o){
    if(o.dead||!o.m||o.heavy) return;
    var dz=c.z-o.m.position.z; if(dz<40||dz>250) return;
    var d=Math.abs(dz-100); if(d<bd){bd=d; best=o;}
  });
  return best;
}
function setBeam(mesh,a,b,w){
  V3.copy(b).sub(a); var len=V3.length();
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.scale.set(w,len,w);
  mesh.quaternion.setFromUnitVectors(Y3,V3.normalize());
}
function heroLaser(h,dt,playing,firing){
  var tgt=c.x+6*Math.sin(h.pt*2.2+h.ph0);
  h.lx+=(tgt-h.lx)*Math.min(1,1.8*dt); h.lx=clamp(h.lx,-(ROAD_HALF-1),ROAD_HALF-1); h.lz=c.z-12;
  h.ring.visible=true; h.ring.position.set(h.lx,0.08,h.lz);
  h.m.updateMatrixWorld(true);
  var ground=new THREE.Vector3(h.lx,0.3,h.lz);
  var eu=h.m.userData;
  [eu.eyeL,eu.eyeR].forEach(function(em,i){
    var eye=em.getWorldPosition(new THREE.Vector3());
    h.beams[i].visible=true; setBeam(h.beams[i],eye,ground,firing?0.22:0.05);
  });
  if(firing){
    burst(h.lx,0.5,h.lz,2,0xff8a3a,8,0.8);
    if(playing && h.cd<=0 && Math.abs(c.x-h.lx)<2.4 && c.y<4){
      if(hurt('Olhos laser',2,0.8)) bossHits++;
      h.cd=0.9;
    }
    cars.forEach(function(o){
      if(o.dead||!o.m) return;
      if(Math.abs(o.m.position.x-h.lx)<2.4 && Math.abs(o.m.position.z-h.lz)<8){o.dead=true; o.vel=new THREE.Vector3(rand(-4,4),rand(6,9),-10); burst(o.m.position.x,1,o.m.position.z,10,0xff8a3a,10,1);}
    });
  }
}
function heroHideLaser(h){
  h.ring.visible=false; h.beams[0].visible=false; h.beams[1].visible=false;
  h.m.userData.eyeL.material=eyeIdle; h.m.userData.eyeR.material=eyeIdle;
}
function poseFor(ph,t){
  var sw=Math.sin(t*2.2), sw2=Math.sin(t*1.7+1.2), f9=Math.sin(t*9);
  var T={lean:0.1,spineX:0,spineY:0,headX:0,headY:0,
    shLx:0.1+0.05*sw,shLz:0.2,shRx:0.1-0.05*sw,shRz:0.2,elL:-0.3,elR:-0.3,
    hipLx:0.05*sw2,hipLz:0.08,hipRx:-0.05*sw2,hipRz:0.08,knL:0.15,knR:0.12,cape:0.2};
  function set(o){for(var k in o) T[k]=o[k];}
  if(ph==='in'||ph==='out') set({lean:1.2,spineX:-0.12,headX:-0.85,shLx:0.55,shLz:0.18,elL:-0.25,shRx:-3.0,shRz:0.12,elR:-0.05,hipLx:0.3+0.07*f9,hipRx:0.22-0.07*f9,hipLz:0.05,hipRz:0.05,knL:0.38,knR:0.3,cape:1.2});
  else if(ph==='seek') set({lean:0.85,spineX:-0.1,headX:-0.55,shLx:-2.7,shRx:-2.7,shLz:0.12,shRz:0.12,elL:-0.12,elR:-0.12,hipLx:0.4,hipRx:0.33,knL:0.3,knR:0.25,cape:0.95});
  else if(ph==='lift') set({lean:0.25,spineX:-0.1,headX:0.1,shLx:-1.45,shRx:-1.45,shLz:0.3,shRz:0.3,elL:-0.9,elR:-0.9,hipLx:-0.12,hipRx:-0.08,knL:0.3,knR:0.28,cape:0.35});
  else if(ph==='back') set({lean:0.35,spineX:-0.08,headX:-0.1,shLx:-1.35,shRx:-1.35,shLz:0.3,shRz:0.3,elL:-1.0,elR:-1.0,knL:0.25,knR:0.2,cape:0.55});
  else if(ph==='charge') set({lean:-0.1,spineX:-0.12,headX:0.3,shLx:0.1,shRx:0.1,shLz:0.75,shRz:0.75,elL:-0.7,elR:-0.7,hipLz:0.18,hipRz:0.18,knL:0.12,knR:0.12,cape:0.4+0.06*Math.sin(t*25)});
  else if(ph==='fire') set({lean:-0.2,spineX:-0.2,headX:0.12,headY:0.06*Math.sin(t*40),shLx:0,shRx:0,shLz:1.4,shRz:1.4,elL:-0.15,elR:-0.15,hipLz:0.22,hipRz:0.22,knL:0.1,knR:0.1,cape:0.95+0.12*Math.sin(t*18)});
  else if(ph==='wind') set({lean:-0.35,spineY:0.55,headX:0.1,headY:-0.3,shRx:1.6,shRz:0.2,elR:-1.3,shLx:-1.35,shLz:0.25,elL:-0.95,hipLx:-0.55,hipRx:0.45,knL:0.5,knR:0.2,cape:0.7});
  else if(ph==='dash') set({lean:1.1,spineX:-0.1,spineY:-0.35,headX:-0.8,shRx:-3.0,shRz:0.05,elR:-0.03,shLx:0.6,shLz:0.2,elL:-0.3,hipLx:0.5,hipRx:0.42,knL:0.2,knR:0.15,cape:1.25});
  else if(ph==='recover') set({lean:0.35,headX:0.2,shLx:0.5,shRx:0.45,elL:-0.35,elR:-0.35,knL:0.3,knR:0.3,cape:0.6});
  return T;
}
function animateHero(h,dt){
  var u=h.m.userData, t=h.t, ph=h.phase, T=poseFor(ph,t), k;
  if(!h.j){h.j={}; h.jv={}; for(k in T){h.j[k]=T[k]; h.jv[k]=0;}}
  var J=h.j, V=h.jv, snap=(ph==='dash'||ph==='wind'), KS=snap?320:150, KD=snap?28:17;
  var steps=Math.max(1,Math.ceil(dt/0.02)), d=dt/steps;
  for(var s2=0;s2<steps;s2++){
    for(k in T){var a=(T[k]-J[k])*KS-V[k]*KD; V[k]+=a*d; J[k]+=V[k]*d;}
  }
  var br=Math.sin(t*2.4), hot=(ph==='charge'||ph==='fire');
  h.m.rotation.x=J.lean;
  h.m.rotation.z=clamp((h.px-h.tgtx)*-0.03,-0.3,0.3);
  u.pelvis.rotation.set(0,-J.spineY*0.4,0.03*Math.sin(t*1.3));
  u.chest.rotation.set(J.spineX+0.015*br,J.spineY,0);
  u.chest.position.x=(ph==='charge')?(Math.random()-0.5)*0.05:0;
  u.head.rotation.set(J.headX,J.headY,0);
  u.armL.rotation.set(J.shLx,0,-J.shLz); u.armR.rotation.set(J.shRx,0,J.shRz);
  u.elbowL.rotation.x=J.elL; u.elbowR.rotation.x=J.elR;
  u.hipL.rotation.set(J.hipLx,0,-J.hipLz); u.hipR.rotation.set(J.hipRx,0,J.hipRz);
  u.kneeL.rotation.x=J.knL; u.kneeR.rotation.x=J.knR;
  var segs=u.capeSegs, flut=0.05+0.1*clamp(J.cape,0,1.3), spd=7+J.cape*5;
  for(var i=0;i<segs.length;i++){
    segs[i].rotation.x=J.cape*(0.28+0.06*i)+flut*Math.sin(t*spd-i*0.95);
    segs[i].rotation.z=0.06*(0.5+J.cape)*Math.sin(t*4.3-i*0.7);
  }
  var fist=(ph==='wind'||ph==='dash');
  u.fist.visible=fist; if(fist) u.fist.scale.setScalar(0.55+0.15*Math.sin(t*30));
  var es=hot?1.6:1; u.eyeL.scale.x+=(es-u.eyeL.scale.x)*Math.min(1,12*dt); u.eyeL.scale.y=u.eyeL.scale.x; u.eyeR.scale.x=u.eyeL.scale.x; u.eyeR.scale.y=u.eyeL.scale.x;
  var tsz=(ph==='dash')?1.12:(ph==='wind'?0.96:1);
  h.sz+=(tsz-h.sz)*Math.min(1,12*dt);
  h.m.scale.set(HERO_S*(1-0.006*br),HERO_S*(1+0.008*br),HERO_S*h.sz);
}
function updateHero(dt,playing){
  if(!hero) return;
  var h=hero; h.t+=dt; h.pt+=dt; h.cd-=dt; h.sCd-=dt; h.tgtx=0;
  var hx=clamp(c.x*0.7+Math.sin(h.t*0.6)*5,-13,13), hy=5+Math.sin(h.t*1.4)*0.6, hz=c.z-58+Math.sin(h.t*0.5)*4;
  var ph=h.phase, e, u, k=Math.min(1,3*dt); h.tgtx=hx;
  function follow(){h.px+=(hx-h.px)*k; h.py+=(hy-h.py)*k; h.pz+=(hz-h.pz)*k;}
  function mix(a,b,t){return a+(b-a)*t;}
  function toRest(){h.phase='rest'; h.pt=0;}
  if(ph==='in'){
    e=ease(h.pt/2.5); h.px=hx+45*(1-e); h.py=hy+60*(1-e); h.pz=hz-200*(1-e);
    if(Math.random()<0.7) burst(h.px,h.py+3.5,h.pz+1,1,0x9fd0ff,4,1.1);
    if(h.pt>=2.5) toRest();
  }else if(ph==='out'){
    if(Math.random()<0.7) burst(h.px,h.py+3.5,h.pz+1,1,0x9fd0ff,4,1.1);
    e=ease(h.pt/2.5); h.px=mix(h.fx,c.x+70,e); h.py=mix(h.fy,120,e); h.pz=mix(h.fz,c.z-340,e);
    if(h.pt>=2.5){
      scene.remove(h.m); scene.remove(h.ring); scene.remove(h.cross); h.beams.forEach(function(b){scene.remove(b);});
      hero=null; finishMajor(playing,'O super-herói foi embora','O super-herói foi embora');
      return;
    }
  }else if(ph==='rest'){
    follow();
    var airUp=playing && !c.grounded && c.y>3.2 && h.sCd<=0;
    if(h.pt>=0.6/dif() || (airUp && h.pt>=0.25)){
      if(h.t>h.dur-2.5){h.phase='out'; h.pt=0; h.fx=h.px; h.fy=h.py; h.fz=h.pz;}
      else if(airUp){h.phase='wind'; h.pt=0; h.cross.visible=true;}
      else{
        var a=h.seq[h.si++%h.seq.length], car=(a==='throw')?pickCarForHero():null;
        if(car){h.car=car; h.cmesh=car.m; h.phase='seek'; h.pt=0; h.fx=h.px; h.fy=h.py; h.fz=h.pz;}
        else{h.phase='charge'; h.pt=0; h.lx=c.x;}
      }
    }
  }else if(ph==='seek'){
    if(!h.car || h.car.m!==h.cmesh || h.car.dead){toRest();}
    else{
      var cp=h.car.m.position; u=ease(h.pt/1.2);
      h.px=mix(h.fx,cp.x,u); h.py=mix(h.fy,4.5,u); h.pz=mix(h.fz,cp.z-2,u);
      if(h.pt>=1.2){h.phase='lift'; h.pt=0; h.car.dead=true; h.car.vel=null; h.cfrom=cp.clone();}
    }
  }else if(ph==='lift'){
    if(h.car.m!==h.cmesh){toRest();}
    else{
      u=ease(h.pt/0.7);
      h.car.m.position.set(mix(h.cfrom.x,h.px,u),mix(h.cfrom.y,h.py+2.4,u),mix(h.cfrom.z,h.pz+2.6,u));
      h.car.m.rotation.z=u*0.5;
      if(h.pt>=0.7){
        var o=h.car, mesh=o.m, hl=o.L/2+1.2, clr=o.clear, lim=ROAD_HALF-2;
        o.m=null; resetCar(o,c.z-300);
        var tx=clamp(c.x+rand(-2,2),-lim,lim), tz=c.z-c.speed*1.9-4;
        spawnFall('carthrow',tx,tz,h.px,h.py+2.4,h.pz+2.6,1.1,{ty:0,arc:6,hold:0.9,hl:hl,hw:2.2,clear:clr,mesh:mesh,R:3.2});
        sfx('throw'); h.car=null; h.phase='back'; h.pt=0; h.fx=h.px; h.fy=h.py; h.fz=h.pz;
      }
    }
  }else if(ph==='back'){
    u=ease(h.pt/0.9); h.px=mix(h.fx,hx,u); h.py=mix(h.fy,hy,u); h.pz=mix(h.fz,hz,u);
    if(h.pt>=0.9) toRest();
  }else if(ph==='wind'){
    h.px+=(clamp(c.x,-14,14)-h.px)*k; h.py+=(Math.max(c.y-3,hy)-h.py)*k; h.pz+=((c.z-40)-h.pz)*k;
    h.tx=c.x; h.ty=c.y+0.7; h.tz=c.z-c.speed*0.32;
    h.cross.position.set(h.tx,h.ty,h.tz); h.cross.scale.setScalar(2.6+0.4*Math.sin(h.pt*20));
    if(h.pt>=0.7){
      h.phase='dash'; h.pt=0; h.fx=h.px; h.fy=h.py; h.fz=h.pz; h.lockx=h.tx; h.locky=h.ty; h.lockz=h.tz; sfx('throw');
    }
  }else if(ph==='dash'){
    burst(h.px,h.py+3.5,h.pz+1,2,0x7fb4ff,6,1.1);
    u=ease(h.pt/0.32);
    h.px=mix(h.fx,h.lockx,u); h.py=mix(h.fy,Math.max(1.5,h.locky-3.8),u); h.pz=mix(h.fz,h.lockz-1.5,u);
    if(h.pt>=0.32){
      var ddx=c.x-h.lockx, ddy=(c.y+0.7)-h.locky, ddz=c.z-h.lockz;
      if(playing && Math.abs(ddx)<3.4 && Math.abs(ddy)<3.4 && Math.abs(ddz)<6){
        burst(c.x,c.y+0.7,c.z,26,0xffd23a,16,1.4); sfx('boom');
        if(hurt('Soco do super-herói',2,0.7)){bossHits++; c.vy=-14; c.grounded=false; c.rolling=false; c.rollAng=0;}
      }else{
        burst(h.lockx,h.locky,h.lockz,10,0xffffff,9,1); sfx('whoosh');
      }
      h.cross.visible=false; h.phase='recover'; h.pt=0; h.fx=h.px; h.fy=h.py; h.fz=h.pz; h.sCd=3.5;
    }
  }else if(ph==='recover'){
    u=ease(h.pt/0.8); h.px=mix(h.fx,hx,u); h.py=mix(h.fy,hy,u); h.pz=mix(h.fz,hz,u);
    if(h.pt>=0.8) toRest();
  }else if(ph==='charge'){
    follow();
    h.m.userData.eyeL.material=eyeHot; h.m.userData.eyeR.material=eyeHot;
    heroLaser(h,dt,playing,false);
    if(playing && !c.grounded && c.y>4.5 && h.sCd<=0){heroHideLaser(h); h.phase='wind'; h.pt=0; h.cross.visible=true;}
    else if(h.pt>=1.0){h.phase='fire'; h.pt=0;}
  }else if(ph==='fire'){
    follow();
    heroLaser(h,dt,playing,true);
    if(playing && !c.grounded && c.y>4.5 && h.sCd<=0){heroHideLaser(h); h.phase='wind'; h.pt=0; h.cross.visible=true;}
    else if(h.pt>=2.0){h.phase='cool'; h.pt=0; heroHideLaser(h);}
  }else{
    follow();
    if(h.pt>=0.4) toRest();
  }
  h.m.position.set(h.px,h.py,h.pz);
  animateHero(h,dt);
}

function startRandomEvent(){
  var majors=[];
  if(elapsed>15 && elapsed-ev.lastBomber>35 && score>=1000) majors.push('bomber');
  if(elapsed>22 && elapsed-ev.lastBoss>50 && score>=1400) majors.push('boss');
  if(elapsed>28 && elapsed-ev.lastHero>55 && score>=2200) majors.push('hero');
  if(elapsed>18 && elapsed-ev.lastMonkey>40 && score>=300) majors.push('monkey');
  if(elapsed>20 && elapsed-ev.lastDino>40 && score>=700) majors.push('dino');
  if(elapsed>24 && elapsed-ev.lastJet>45 && score>=2600) majors.push('jet');
  if(elapsed>16 && elapsed-ev.lastOcto>40 && score>=1800) majors.push('octo');
  if(elapsed>20 && elapsed-ev.lastSlime>45 && score>=1500) majors.push('slime');
  if(elapsed>18 && elapsed-ev.lastFire>40 && score>=1000) majors.push('fire');
  var pool=majors.filter(function(k2){return k2!==ev.prev;});
  if(!pool.length) pool=majors;
  var kind=(pool.length && Math.random()<0.8)?pickOf(pool):'meteors';
  if(kind==='meteors' && ev.prev==='meteors' && pool.length) kind=pickOf(pool);
  if(save.dev && devNext){kind=devNext; devNext=null; renderDevLists();}
  ev.prev=kind;
  ({meteors:startMeteors,bomber:startBomber,boss:startBoss,hero:startHero,monkey:startMonkey,dino:startDino,jet:startJet,octo:startOcto,slime:startSlime,fire:startFire})[kind]();
}
function updateEvents(dt,playing){
  if(playing) elapsed+=dt;
  rocketNext-=dt;
  if(rocketNext<=0 && rockets.length<2){spawnRocket(); rocketNext=rand(7,13);}
  updateRockets(dt);
  if(playing){
    if(!ev.kind){
      ev.next-=dt;
      if(ev.next<=0) startRandomEvent();
    }else if(!ev.sec && score>=MIX_TIERS[0][0]){
      ev.mixT=(ev.mixT===undefined?rand(5,9):ev.mixT)-dt;
      if(ev.mixT<=0){ev.mixT=rand(8,14); tryMix();}
    }
    if(ev.met){
      ev.t+=dt; ev.sp-=dt;
      if(ev.sp<=0){
        ev.sp=rand(0.25,0.6)/dif();
        var tx,tz;
        if(Math.random()<0.25+0.55*diffT()){tx=clamp(c.x+rand(-5,5),-(ROAD_HALF-2),ROAD_HALF-2); tz=c.z-c.speed*1.5+rand(-6,6);}
        else{tx=rand(-(ROAD_HALF-2),ROAD_HALF-2); tz=c.z-rand(40,110);}
        spawnFall('meteor',tx,tz,tx+rand(-25,25),75,tz-rand(30,60),1.5);
      }
      if(ev.t>=ev.dur){ev.met=false; toast('A chuva de meteoros passou','info'); evEnded();}
    }
  }
  updateFalls(dt,playing);
  updateBoss(dt,playing);
  updateBomber(dt,playing);
  updateHero(dt,playing);
  updateMonkey(dt,playing);
  updateBananas(dt,playing);
  updateMinis(dt,playing);
  updateDinos(dt,playing);
  updateJet(dt,playing);
  updateOctoVillain(dt,playing);
  updateSlime(dt,playing);
  updateFire(dt,playing);
  updateEvLight(dt);
  var show=false, name='', frac=0;
  if(boss){show=true; name='Drone de entregas'; frac=1-boss.t/boss.dur;}
  else if(bomber){show=true; name='Caminhão bombardeiro'; frac=1-bomber.t/bomber.dur;}
  else if(hero){show=true; name='Capitão Raio'; frac=1-hero.t/hero.dur;}
  else if(monkey){show=true; name='Macaco faminto'; frac=1-monkey.t/monkey.dur;}
  else if(octoV){show=true; name='Doutor Tentáculo'; frac=1-octoV.t/octoV.dur;}
  else if(slimeV){show=true; name='Monstro de gosma'; frac=1-slimeV.t/slimeV.dur;}
  else if(fireV){show=true; name='Carro flamejante'; frac=1-fireV.t/fireV.dur;}
  else if(jet){show=true; name='Campo minado'; frac=1-jet.t/jet.dur;}
  else if(dinoEv){show=true; name='Corrida jurássica'; frac=1-dinoEv.t/dinoEv.dur;}
  else if(ev.met){show=true; name='Chuva de meteoros'; frac=1-ev.t/ev.dur;}
  elEvBar.hidden=!show;
  if(show){elEvName.textContent=name; elEvFill.style.width=(clamp(frac,0,1)*100)+'%';}
}
function resetEvents(){
  falls.forEach(removeFall);
  rockets.forEach(function(r){scene.remove(r.m);});
  if(boss){scene.remove(boss.m); scene.remove(boss.sh);}
  if(bomber){scene.remove(bomber.m);}
  if(monkey){scene.remove(monkey.m);}
  bananas.forEach(function(b){scene.remove(b.m);}); bananas=[]; monkey=null;
  minis.forEach(function(o){scene.remove(o.m);}); minis=[];
  dinos.forEach(function(d){scene.remove(d.m); if(d.sh) scene.remove(d.sh); if(d.ring) scene.remove(d.ring);}); dinos=[]; dinoEv=null;
  if(jet){scene.remove(jet.m); jet=null;}
  if(octoV){removeLaser(octoV); scene.remove(octoV.m); octoV=null;}
  octos.forEach(function(o){scene.remove(o.m); if(o.ring) scene.remove(o.ring);}); octos=[];
  stuckO.forEach(function(m){player.remove(m);}); stuckO=[];
  missiles.forEach(function(o){scene.remove(o.m); if(o.ring) scene.remove(o.ring);}); missiles=[];
  if(slimeV){slimeV.cars.forEach(function(it){if(it.ring) scene.remove(it.ring);}); scene.remove(slimeV.m); slimeV=null;}
  gooBalls.forEach(function(b){scene.remove(b.m); scene.remove(b.ring);}); gooBalls=[];
  gooPuds.forEach(function(q){scene.remove(q.m);}); gooPuds=[];
  gooStuck.forEach(function(m){player.remove(m);}); gooStuck=[];
  if(fireV){scene.remove(fireV.m); fireV=null;}
  firePats.forEach(function(q){scene.remove(q.g);}); firePats=[]; fireCd=0;
  if(fireFl){player.remove(fireFl); fireFl=null;}
  smokes.forEach(function(q){q.on=false; q.m.visible=false;}); embers.forEach(function(q){q.on=false; q.m.visible=false;}); evLight.intensity=0;
  c.goo=0; c.gv=0; c.fire=0;
  if(hero){scene.remove(hero.m); scene.remove(hero.ring); scene.remove(hero.cross); hero.beams.forEach(function(b){scene.remove(b);});}
  falls=[]; rockets=[]; boss=null; bomber=null; hero=null;
  ev.kind=null; ev.sec=null; ev.met=false; ev.mixT=undefined; ev.lastMet=-99; ev.next=18; ev.lastBoss=-99; ev.lastBomber=-99; ev.lastHero=-99; ev.lastMonkey=-99; ev.lastDino=-99; ev.lastJet=-99; ev.lastOcto=-99; ev.lastSlime=-99; ev.lastFire=-99; ev.prev='';
  rocketNext=3; elapsed=0; bossHits=0;
}


