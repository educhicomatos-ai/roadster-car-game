/* ---------- Space: the ground vanishes, a dark neon road floats among planets, nebulae and a dense starfield ---------- */
var spaceUpd=null;
(function(){
  var i, j, TX=function(w,h){var cv=document.createElement('canvas'); cv.width=w; cv.height=h; return cv;};
  /* dense coloured stars, two layers that twinkle out of phase (forward half of the sphere only) */
  function starLayer(n,size){
    var p=new Float32Array(n*3), cl=new Float32Array(n*3), cc=new THREE.Color(), pal=[0xffffff,0xffffff,0xffffff,0xcfe0ff,0xffe2c0,0xffc0e8,0xa8ffff];
    for(var k=0;k<n;k++){
      var y=-1+Math.random()*2, a=Math.PI+Math.random()*Math.PI, r=Math.sqrt(1-y*y)*870;
      p[k*3]=Math.cos(a)*r; p[k*3+1]=y*870; p[k*3+2]=Math.sin(a)*r;
      cc.setHex(pal[(Math.random()*pal.length)|0]); var b=0.55+Math.random()*0.45;
      cl[k*3]=cc.r*b; cl[k*3+1]=cc.g*b; cl[k*3+2]=cc.b*b;
    }
    var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(p,3)); g.setAttribute('color',new THREE.BufferAttribute(cl,3));
    var m=new THREE.Points(g,new THREE.PointsMaterial({size:size,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:0,fog:false,depthWrite:false}));
    m.renderOrder=-3.5; m.frustumCulled=false; m.visible=false; sky.add(m); return m;
  }
  var stA=starLayer(3000,2.0), stB=starLayer(1300,3.2);
  function soft(g,x,y,rx,ry,rgb,a){
    g.save(); g.translate(x,y); g.scale(1,ry/rx);
    var gr=g.createRadialGradient(0,0,0,0,0,rx); gr.addColorStop(0,'rgba('+rgb+','+a+')'); gr.addColorStop(1,'rgba('+rgb+',0)');
    g.fillStyle=gr; g.beginPath(); g.arc(0,0,rx,0,TAU); g.fill(); g.restore();
  }
  /* nebula: a soft, additive sky sphere painted with brown, orange and teal gas */
  var NW=1536, NH=768, nc=TX(NW,NH), ng=nc.getContext('2d');
  ng.globalCompositeOperation='lighter';
  var ncols=['150,70,30','110,50,30','70,30,60','40,100,120','190,100,50'];
  for(i=0;i<170;i++){
    var an=rand(0,TAU), dd=Math.pow(Math.random(),0.7)*rand(0,520);
    soft(ng,NW*0.75+Math.cos(an)*dd*1.5,NH*0.5-80+Math.sin(an)*dd*0.55,rand(30,120),rand(30,120),ncols[(Math.random()*ncols.length)|0],rand(0.04,0.13));
  }
  for(i=0;i<40;i++) soft(ng,rand(0,NW),rand(NH*0.2,NH*0.8),rand(90,240),rand(70,170),ncols[(Math.random()*ncols.length)|0],rand(0.03,0.07));
  var nebula=new THREE.Mesh(new THREE.SphereGeometry(880,48,24),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(nc),side:THREE.BackSide,transparent:true,opacity:0,fog:false,depthWrite:false,blending:THREE.AdditiveBlending}));
  nebula.renderOrder=-3.8; nebula.frustumCulled=false; nebula.visible=false; sky.add(nebula);

  /* planets: procedural textures on a lit sphere (light comes from a fixed direction on screen) */
  function planetTex(kind){
    var cv=TX(256,128), g=cv.getContext('2d'), k;
    if(kind==='earth'){
      g.fillStyle='#1d56a8'; g.fillRect(0,0,256,128);
      for(k=0;k<26;k++) soft(g,rand(0,256),rand(20,108),rand(10,30),rand(7,18),k%2?'96,122,70':'150,128,84',0.9);
      for(k=0;k<90;k++) soft(g,rand(0,256),rand(8,120),rand(14,40),rand(3,8),'255,255,255',rand(0.25,0.6));
    }else if(kind==='mars'){
      g.fillStyle='#b4532e'; g.fillRect(0,0,256,128);
      for(k=0;k<60;k++) soft(g,rand(0,256),rand(0,128),rand(8,34),rand(6,22),k%3?'122,47,24':'222,140,88',rand(0.35,0.8));
    }else if(kind==='moon'){
      g.fillStyle='#9d9d9d'; g.fillRect(0,0,256,128);
      for(k=0;k<30;k++) soft(g,rand(0,256),rand(0,128),rand(14,40),rand(10,26),'70,70,76',rand(0.2,0.45));
      for(k=0;k<80;k++){var cx=rand(0,256), cy=rand(6,122), cr=rand(2,8); g.strokeStyle='rgba(60,60,66,.55)'; g.lineWidth=1.2; g.beginPath(); g.arc(cx,cy,cr,0,TAU); g.stroke(); g.fillStyle='rgba(60,60,66,.25)'; g.fill();}
    }else if(kind==='gas' || kind==='ring'){
      var pal=kind==='gas'?['#2a4a9c','#3a62c0','#1a2f78','#5a82d8','#27418a']:['#cfae82','#b8946a','#e2c8a0','#a07c58','#d8bc92'];
      for(k=0;k<128;k+=3){g.fillStyle=pal[(Math.random()*pal.length)|0]; g.fillRect(0,k,256,4);}
      for(k=0;k<14;k++) soft(g,rand(0,256),rand(10,118),rand(14,30),rand(3,7),'255,255,255',0.18);
    }else{ /* pink-red world */
      g.fillStyle='#c0405a'; g.fillRect(0,0,256,128);
      for(k=0;k<60;k++) soft(g,rand(0,256),rand(0,128),rand(10,34),rand(6,20),k%2?'88,30,100':'230,120,150',rand(0.3,0.7));
    }
    var t=new THREE.CanvasTexture(cv); t.wrapS=THREE.RepeatWrapping; return t;
  }
  var PVS='varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){vUv=uv; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv;}';
  var PFS='uniform sampler2D map; uniform vec3 L; uniform vec3 atm; uniform float op; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){vec3 n=normalize(vN); float d=max(dot(n,L),0.0); float lit=0.05+0.95*smoothstep(0.0,0.55,d); float rim=pow(1.0-max(dot(n,normalize(vV)),0.0),3.0); vec3 col=texture2D(map,vUv).rgb*lit+atm*rim*(0.2+0.8*d); gl_FragColor=vec4(col,op);}';
  var planets=[], ringMats=[];
  function addPlanet(kind,x,y,r,L,atm,spin,ring){
    var mat=new THREE.ShaderMaterial({uniforms:{map:{value:planetTex(kind)},L:{value:new THREE.Vector3(L[0],L[1],L[2]).normalize()},atm:{value:new THREE.Color(atm)},op:{value:0}},vertexShader:PVS,fragmentShader:PFS,transparent:true});
    var grp=new THREE.Group(), m=new THREE.Mesh(new THREE.SphereGeometry(1,40,28),mat); m.scale.setScalar(r); m.rotation.z=0.25; grp.add(m);
    if(ring){
      var rg=new THREE.RingGeometry(1.45,2.5,72), uv=rg.attributes.uv, pa=rg.attributes.position;
      for(var q=0;q<uv.count;q++){var rr=Math.sqrt(pa.getX(q)*pa.getX(q)+pa.getY(q)*pa.getY(q)); uv.setXY(q,(rr-1.45)/1.05,0.5);}
      var rc=TX(256,4), g2=rc.getContext('2d'), gx=g2.createLinearGradient(0,0,256,0);
      gx.addColorStop(0,'rgba(210,180,140,0)'); gx.addColorStop(0.08,'rgba(210,180,140,.85)'); gx.addColorStop(0.4,'rgba(170,140,104,.55)'); gx.addColorStop(0.5,'rgba(60,50,40,.05)'); gx.addColorStop(0.58,'rgba(214,186,150,.9)'); gx.addColorStop(0.92,'rgba(190,160,120,.7)'); gx.addColorStop(1,'rgba(190,160,120,0)');
      g2.fillStyle=gx; g2.fillRect(0,0,256,4);
      var rm=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(rc),transparent:true,side:THREE.DoubleSide,fog:false,alphaTest:0.06,opacity:0}), rmesh=new THREE.Mesh(rg,rm);
      rmesh.scale.setScalar(r); rmesh.rotation.x=-1.32; grp.add(rmesh); ringMats.push(rm);
    }
    grp.position.set(x,y,-760); grp.rotation.z=ring?0.32:0; grp.visible=false;
    grp.traverse(function(o){o.renderOrder=-2.9; o.frustumCulled=false;});
    sky.add(grp); planets.push({g:grp,m:m,mat:mat,spin:spin});
  }
  addPlanet('earth',-310,190,95,[0.85,0.25,0.45],0x6aa8ff,0.012);
  addPlanet('pink',215,265,52,[0.95,0.05,-0.35],0xff6a9a,0.01);
  addPlanet('ring',420,120,62,[0.7,0.45,0.55],0xffd8a0,0.02,true);
  addPlanet('mars',575,-105,135,[-0.6,0.5,0.6],0xff8a5a,0.006);
  addPlanet('moon',-150,-80,44,[0.8,0.3,0.5],0xcfd8ff,0.008);
  addPlanet('gas',-560,390,115,[0.5,-0.2,0.8],0x6a8aff,0.008);

  spaceUpd=function(sp,t,dt){
    var on=sp>0.02, i;
    stA.visible=stB.visible=on; nebula.visible=on;
    if(on){
      stA.material.opacity=sp*(0.7+0.3*Math.sin(t*1.3)); stB.material.opacity=sp*(0.65+0.35*Math.sin(t*1.9+2.4));
      nebula.material.opacity=sp*0.9;
    }
    for(i=0;i<planets.length;i++){var pl=planets[i]; pl.g.visible=on; if(on){pl.mat.uniforms.op.value=sp; pl.m.rotation.y+=dt*pl.spin;}}
    for(i=0;i<ringMats.length;i++) ringMats[i].opacity=sp;
  };

  /* low-poly floating rocks near the road */
  function rockGeo(cols){
    var g=new THREE.IcosahedronGeometry(1,1), pa=g.attributes.position, cl=[], c0=new THREE.Color(), v=new THREE.Vector3(), k;
    for(k=0;k<pa.count;k++){
      v.fromBufferAttribute(pa,k); var h=hash2(Math.round(v.x*40+v.y*70+v.z*90),k*0+7); var f=0.7+0.5*hash2(Math.round(v.x*30),Math.round(v.y*30+v.z*50));
      pa.setXYZ(k,v.x*f,v.y*f*(0.7+0.3*h),v.z*f);
    }
    g.computeVertexNormals();
    for(k=0;k<pa.count;k+=3){c0.setHex(cols[(k/3)%cols.length|0]); var b=0.8+0.4*hash2(k,3); cl.push(c0.r*b,c0.g*b,c0.b*b,c0.r*b,c0.g*b,c0.b*b,c0.r*b,c0.g*b,c0.b*b);}
    g.setAttribute('color',new THREE.Float32BufferAttribute(cl,3)); return g;
  }
  var rocks=[rockGeo([0x7a6a8a,0x6a5a7a,0x8a7a98]),rockGeo([0x8a5a4a,0x9a6a56,0x7a4a3c]),rockGeo([0x5a6a8a,0x6a7a9a,0x4a5a78]),rockGeo([0xa07ab8,0x8a6aa8,0x6a4a90])];
  addPool({biome:9,n:32,mk:function(i2){return new THREE.Mesh(rocks[i2%4],matV);},near:32,far:210,dens:0.05,
    setup:function(it){it.o.position.y=rand(-34,70); it.o.scale.setScalar(rand(1.4,9)*Math.max(0.05,edgeGrow(it.z))); it.sp=rand(-0.5,0.5);},
    anim:function(it,t,dt){it.o.rotation.y+=dt*it.sp; it.o.rotation.x+=dt*it.sp*0.6;}});

  /* distant banded planetoids with real 3D shading, parallaxing past the road */
  function worldGeo(pal){
    var g=new THREE.IcosahedronGeometry(1,3), pa=g.attributes.position, cl=[], a=new THREE.Color(), b=new THREE.Color(), c2=new THREE.Color(), ph=Math.random()*6;
    for(var k=0;k<pa.count;k++){
      var y=pa.getY(k), x=pa.getX(k), z=pa.getZ(k), band=0.5+0.5*Math.sin(y*pal.f+ph+Math.sin(x*3+z*2)*0.6);
      a.setHex(pal.a); b.setHex(pal.b); c2.copy(a).lerp(b,band); if(Math.abs(y)>0.82) c2.lerp(new THREE.Color(pal.p),0.6);
      cl.push(c2.r,c2.g,c2.b);
    }
    g.setAttribute('color',new THREE.Float32BufferAttribute(cl,3)); return g;
  }
  var worlds=[worldGeo({a:0xd98b5a,b:0xa8502e,p:0xf0d0b0,f:7}),worldGeo({a:0x5a8ad8,b:0xb8d8ff,p:0xffffff,f:6}),worldGeo({a:0xc0405a,b:0x6a2a6a,p:0xe8a0c0,f:8}),worldGeo({a:0x9a9aa6,b:0x60606c,p:0xd0d0dc,f:5}),worldGeo({a:0x7a58c8,b:0x3a2a88,p:0xc8b0ff,f:9})];
  addPool({biome:9,n:8,mk:function(i2){return new THREE.Mesh(worlds[i2%5],matV);},near:300,far:480,dens:0.012,
    setup:function(it){it.o.position.y=rand(-70,170); it.o.scale.setScalar(rand(13,34)*Math.max(0.05,edgeGrow(it.z))); it.sp=rand(-0.05,0.05);},
    anim:function(it,t,dt){it.o.rotation.y+=dt*it.sp;}});

  /* the road signs: "TERRA 2.0" and friends */
  var SN=['TERRA 2.0','MARTE 12 km','LUA 5 min','ANÉIS ADIANTE','ÚLTIMO POSTO'], plateMats=[];
  function signTex(txt){
    var cv=TX(256,80), g=cv.getContext('2d'); g.fillStyle='#e8ecf8'; g.fillRect(0,0,256,80); g.strokeStyle='#1a2a5a'; g.lineWidth=5; g.strokeRect(3,3,250,74);
    g.fillStyle='#1a2a5a'; g.font='700 '+(txt.length>10?24:32)+'px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(txt,128,42); return new THREE.CanvasTexture(cv);
  }
  SN.forEach(function(s2){plateMats.push(new THREE.MeshBasicMaterial({map:signTex(s2),side:THREE.DoubleSide}));});
  var arrowCv=TX(128,128), ag=arrowCv.getContext('2d');
  ag.fillStyle='#fff'; ag.beginPath(); ag.arc(64,64,62,0,TAU); ag.fill(); ag.strokeStyle='#1f6fe0'; ag.lineWidth=10; ag.beginPath(); ag.arc(64,64,56,0,TAU); ag.stroke();
  ag.fillStyle='#10131c'; ag.beginPath(); ag.moveTo(64,22); ag.lineTo(94,58); ag.lineTo(74,58); ag.lineTo(74,104); ag.lineTo(54,104); ag.lineTo(54,58); ag.lineTo(34,58); ag.closePath(); ag.fill();
  var arrowMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(arrowCv),side:THREE.DoubleSide});
  var poleMat=new THREE.MeshLambertMaterial({color:0xb8bccc});
  addLinear({biome:9,L:420,zo:120,xs:[1],
    mk:function(){
      var g=new THREE.Group(), pole=new THREE.Mesh(gCy,poleMat); pole.scale.set(0.09,5.2,0.09); pole.position.y=2.6; g.add(pole);
      var disc=new THREE.Mesh(new THREE.CircleGeometry(1.05,32),arrowMat); disc.position.set(0,5.4,0.06); g.add(disc);
      var plate=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.0),plateMats[0]); plate.position.set(0,3.95,0.06); g.add(plate);
      return g;},
    setup:function(it,k2){it.o.position.x=ROAD_HALF+3.2; it.o.rotation.y=0.18; it.o.children[2].material=plateMats[Math.floor(hash2(k2,90)*SN.length)]; it.o.scale.setScalar(Math.max(0.05,edgeGrow(k2*420)));}});
})();

function envApply(dt,t){
  var d=Math.max(0,-c.z), k=Math.floor(d/ZONE_LEN), into=d-k*ZONE_LEN;
  var a=zoneBio(k), b=zoneBio(k+1), tt=clamp((into-(ZONE_LEN-ZONE_BLEND))/ZONE_BLEND,0,1); tt=tt*tt*tt*(tt*(tt*6-15)+10);
  blendBio(BIO[a],BIO[b],tt);
  if(k!==lastZone){if(state==='play'||state==='count') toast(BIO[a].name,'info'); lastZone=k;}
  if(cur.storm>0.4){nextBolt-=dt; if(nextBolt<=0){flash=1; flashSec=false; nextBolt=rand(3,7.5); genBolt(); thunderQ=rand(0.35,1.1);}}
  if(flash>0){flash-=dt*4.2; if(flash<0.3&&!flashSec){flashSec=true; flash=0.85;} if(flash<0) flash=0;}
  if(thunderQ>0){thunderQ-=dt; if(thunderQ<=0) sfx('thunder');}
  var fl=flash, i;
  for(i=0;i<6;i++) tmpSky[i].copy(cur.skyC[i]).lerp(FLASHC,fl*0.7);
  paintSky(tmpSky);
  scene.fog.color.copy(cur.skyC[1]).lerp(FLASHC,fl*0.45); scene.fog.near=cur.fogN; scene.fog.far=cur.fogF;
  hemi.color.copy(cur.hemiS); hemi.groundColor.copy(cur.hemiG); hemi.intensity=cur.hemiI+fl*1.0;
  sunLight.color.copy(cur.sunC); sunLight.intensity=cur.sunI+fl*0.6; sunLight.position.set(cur.sunX,cur.sunY,cur.sunZ);
  fillLight.color.copy(cur.fillC); fillLight.intensity=cur.fillI;
  var ek=clamp(0.2+0.5*(cur.hemiI+cur.sunI),0.2,1.15), ci, cq;
  for(ci=0;ci<carEnv.length;ci++) carEnv[ci].envMapIntensity=ek;
  for(ci=0;ci<phongEnv.length;ci++) phongEnv[ci].reflectivity=phongEnv[ci].userData.r0*ek;
  road.material.reflectivity=0.42*ek*(1-0.8*(cur.space||0));
  shadowFollow(c.x,c.z-4,cur.sunX,cur.sunY,cur.sunZ);
  beam.visible=true; beam.material.opacity=0.12+0.38*(1-clamp((cur.sunI+cur.hemiI)/1.9,0,1));
  for(ci=0;ci<cars.length;ci++){cq=cars[ci]; if(!cq.m) continue; var nr=Math.abs(cq.m.position.z-c.z)<50; if(nr!==cq.sh){cq.sh=nr; cq.m.traverse(function(mm){if(mm.isMesh) mm.castShadow=nr;});}}
  ground.material.color.copy(cur.ground); road.material.color.copy(cur.road); railMat.color.copy(cur.rail); stripeMat.color.copy(cur.stripe);
  skyHalo.material.color.copy(cur.haloC); skyHalo.material.opacity=cur.haloO; skyHalo.scale.setScalar(cur.haloS); skyHalo.position.set(cur.haloX,cur.haloY,-850);
  skyDisc.material.color.copy(cur.discC); skyDisc.scale.setScalar(cur.discS); skyDisc.position.set(cur.discX,cur.discY,-849);
  ground.visible=cur.space<0.97; if(spaceUpd) spaceUpd(cur.space,t,dt);
  var sv=cur.stars>0.02; starsA.visible=starsB.visible=sv;
  if(sv){starsA.material.opacity=cur.stars*(0.65+0.35*Math.sin(t*1.7)); starsB.material.opacity=cur.stars*(0.65+0.35*Math.sin(t*1.7+3.1));}
  cloudMat.color.copy(cur.cloudC).lerp(FLASHC,fl*0.5); cloudMat.opacity=cur.cloudO; cloudGroup.rotation.y=t*0.006;
  skyBeam.visible=cur.beam>0.03; skyBeam.material.opacity=cur.beam*(0.5+0.2*Math.sin(t*1.7)+fl*0.3);
  for(i=0;i<searchLights.length;i++){
    var m=searchLights[i]; m.visible=cur.search>0.03;
    if(m.visible){m.material.opacity=cur.search*0.3; m.rotation.z=m.userData.d*0.28+Math.sin(t*0.55+(m.userData.d>0?1.5:0))*0.35;}
  }
  stormBack.visible=cur.storm>0.03; if(stormBack.visible){stormBack.material.opacity=cur.storm; stormBack.material.color.setScalar(1+fl*1.6);}
  if(foamMat){foamMat.map.offset.y-=dt*0.05; foamMat.opacity=0.7+0.2*Math.sin(t*1.4);}
  for(i=0;i<sunRays.length;i++){
    var sr=sunRays[i]; sr.visible=cur.rays>0.03;
    if(sr.visible){sr.position.set(cur.discX,cur.discY,-848); sr.rotation.z=sr.userData.a+Math.sin(t*0.1+i)*0.03; sr.material.opacity=cur.rays*(0.10+0.06*Math.sin(t*0.6+i*1.7));}
  }
  if(copaSea){copaSea.map.offset.y-=dt*0.012; copaSea.map.offset.x+=dt*0.004;}
  if(seaMat){seaMat.map.offset.y-=dt*0.01; seaMat.map.offset.x+=dt*0.004;}
  caveBack.visible=cur.cave>0.03; if(caveBack.visible) caveBack.material.opacity=cur.cave;
  for(i=0;i<caveBeams.length;i++){var cb=caveBeams[i]; cb.visible=cur.cave>0.03; if(cb.visible){cb.material.opacity=cur.cave*(0.2+0.07*Math.sin(t*0.5+i*2)); cb.rotation.z=Math.PI+cb.userData.b+Math.sin(t*0.13+i)*0.02;}}
  boltMesh.visible=fl>0.3; boltMesh.material.opacity=Math.min(1,fl);
  waveMat.color.setScalar(1+fl*1.2); waveTex.offset.x+=dt*0.03; waveTex.offset.y-=dt*0.02;
  dustHex=tmpDust.copy(cur.ground).lerp(FLASHC,0.5).getHex();
  edgeMat.color.copy(cur.stripe); edgeMat.opacity=cur.glow*0.8;
  for(i=0;i<2;i++){edgeGlow[i].visible=cur.glow>0.03; edgeGlow[i].position.z=c.z;}
  /* neon flicker and the traffic lights */
  if(flkT>0) flkT-=dt; else if(Math.random()<0.006) flkT=0.3;
  for(i=0;i<3;i++){
    var br=0.82+0.18*Math.sin(t*(1.7+i*0.9)+i*2); if(i===1&&flkT>0) br*=(Math.random()<0.5?0.2:0.85);
    neonMats[i].color.setHex(NEON[i]).multiplyScalar(br);
  }
  for(i=0;i<neonSigns.length;i++) neonSigns[i].opacity=(i===2&&flkT>0)?0.35:0.8+0.2*Math.sin(t*2.1+i);
  var ph=t%12; tlGrn.color.setHex(ph<6?0x35e07a:0x103a22); tlYel.color.setHex(ph>=6&&ph<8?0xffc83a:0x3a300e); tlRed.color.setHex(ph>=8?0xff3b3b:0x3a1212);
}
function envUpdate(dt){
  var t=performance.now()*0.001, front=c.z-ENV_FAR, i, j, pl, it;
  if(front<envFront){fillStrip(Math.min(envFront,front+200),front); envFront=front;}
  for(i=0;i<POOLS.length;i++){
    pl=POOLS[i];
    if(pl.linear){
      linUpdate(pl);
      if(pl.anim) for(j=0;j<pl.items.length;j++){it=pl.items[j]; if(it.on&&it.o.visible) pl.anim(it,t,dt);}
    }else{
      for(j=0;j<pl.items.length;j++){
        it=pl.items[j]; if(!it.on) continue;
        if(pl.anim){pl.anim(it,t,dt); }
        if(it.z>c.z+70){it.on=false; it.o.visible=false;}
      }
    }
  }
  envApply(dt,t); rainUpdate(dt); leafUpdate(dt,t);
}
function envRefill(){
  POOLS.forEach(function(pl){pl.items.forEach(function(it){it.on=false; it.k=1e9; it.o.visible=false;});});
  envFront=c.z-ENV_FAR; fillStrip(c.z+70,c.z-ENV_FAR);
}
function envReset(){envSeq=[(Math.random()*BIO.length)|0]; lastZone=-1; flash=0; nextBolt=4; thunderQ=0; envRefill();}
var ENV={bio:BIO,upd:envUpdate,strike:function(){nextBolt=0;},seq:function(a){envSeq=a.slice(); lastZone=-1; envRefill();},snap:function(idx){
  zoneBio(Math.floor(Math.max(0,-c.z)/ZONE_LEN));
  var k=Math.floor(Math.max(0,-c.z)/ZONE_LEN); envSeq.length=k+1; envSeq[k]=idx; lastZone=k; envRefill();
  toast(BIO[idx].name,'info');
}};
envReset();

