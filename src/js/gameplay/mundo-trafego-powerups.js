/* ---------- world ---------- */
var ramps=[], spawnZ=-120;
var CAR_COLORS=[0xf2f4f8,0xc8202f,0x2a4f9e,0x30343f,0x9aa3b2,0x111318,0xd9a21b,0x2f8f5b];

function groundH(x,z){
  for(var i=0;i<ramps.length;i++){
    var r=ramps[i];
    if(Math.abs(x-r.x)<RAMP_W/2 && z<=r.z0 && z>=r.z0-RAMP_L){
      var t=(r.z0-z)/RAMP_L; return RAMP_H*Math.pow(t,1.4);
    }
  }
  return 0;
}
function addRamp(x,z0){
  var sh=new THREE.Shape(), N=16; sh.moveTo(0,0);
  for(var i=1;i<=N;i++){var t=i/N; sh.lineTo(t*RAMP_L,RAMP_H*Math.pow(t,1.4));}
  sh.lineTo(RAMP_L,0); sh.lineTo(0,0);
  var geo=new THREE.ExtrudeGeometry(sh,{depth:RAMP_W,bevelEnabled:false,steps:1});
  geo.rotateY(Math.PI/2); geo.translate(-RAMP_W/2,0,0);
  var mesh=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:0x3b4052}));
  var g=new THREE.Group(); g.position.set(x,0,z0); g.add(mesh);
  addBox(g,RAMP_W,0.12,0.35,0,RAMP_H+0.02,-RAMP_L+0.2,new THREE.MeshBasicMaterial({color:0xffc24a}));
  scene.add(g);
  ramps.push({x:x,z0:z0,group:g});
}

/* traffic: cars, vans, buses and trucks, each with its own lane, speed and lane-change timer */
var VT={
  sedan:{name:'sedã',L:4.5,W:1.9,clear:1.55,v:[16,32],pts:200,w:3},
  hatch:{name:'hatch',L:3.8,W:1.8,clear:1.5,v:[18,32],pts:200,w:2},
  suv:{name:'SUV',L:4.8,W:2.0,clear:2.0,v:[14,28],pts:250,w:2},
  pickup:{name:'picape',L:5.4,W:2.0,clear:1.95,v:[14,26],pts:250,w:1.2},
  van:{name:'van',L:5.2,W:2.0,clear:2.5,v:[12,24],pts:300,w:1.2},
  bus:{name:'ônibus',L:11,W:2.5,clear:3.3,v:[10,18],pts:500,w:0.8,heavy:true},
  truck:{name:'caminhão',L:12,W:2.5,clear:3.6,v:[8,16],pts:600,w:1,heavy:true},
  tanker:{name:'caminhão-tanque',L:11,W:2.4,clear:3.1,v:[9,15],pts:500,w:0.7,heavy:true}
};
function pickW(table){
  var tot=0,k;
  for(k in table) tot+=table[k].w;
  var r=Math.random()*tot;
  for(k in table){r-=table[k].w; if(r<=0) return k;}
  return Object.keys(table)[0];
}
function pickOf(a){return a[(Math.random()*a.length)|0];}
/* turn signals: amber lamps at the four corners, flashing 1.5x per second (the legal range is 60-120 flashes per minute) */
var BL_ON=0xffb400, BL_OFF=0x5a3a08, blGlowMat=new THREE.MeshBasicMaterial({map:softTex('rgba(255,170,20,0.95)','rgba(255,170,20,0)'),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}), blGlowGeo=new THREE.PlaneGeometry(1.5,1.5);
function makeVehicle(type){
  var d=VT[type], g=new THREE.Group(), hl=d.L/2;
  var tail=new THREE.MeshBasicMaterial({color:0xff3b4a}), glass=carGlass(), dark=lamb(0x1a1d28);
  var body=carBody(pickOf(CAR_COLORS));
  function lm(st,m){var o=new THREE.Mesh(loftGeo(st),m); g.add(o); return o;}
  function wheels(zs,x,r){zs.forEach(function(z){addWheel(g,-x,r,z,r,0.28); addWheel(g,x,r,z,r,0.28);});}
  var blm=[new THREE.MeshBasicMaterial({color:BL_OFF}),new THREE.MeshBasicMaterial({color:BL_OFF})], blg=[[],[]];
  g.userData.bl=blm; g.userData.blg=blg;
  function lights(y,w){
    addBox(g,w,0.1,0.05,0,y,hl+0.01,tail);
    [0,1].forEach(function(si){
      var sx=si?1:-1, x=sx*(w/2-0.13);
      addBox(g,0.3,0.15,0.07,x,y,hl+0.03,blm[si]); addBox(g,0.3,0.15,0.07,x,y,-hl-0.03,blm[si]);
      var gr=new THREE.Mesh(blGlowGeo,blGlowMat); gr.position.set(x,y,hl+0.12); gr.visible=false; g.add(gr); blg[si].push(gr);
      var gf=new THREE.Mesh(blGlowGeo,blGlowMat); gf.position.set(x,y,-hl-0.12); gf.rotation.y=Math.PI; gf.visible=false; g.add(gf); blg[si].push(gf);
    });
  }
  function cab(z,mat){addBox(g,2.4,2.2,2.4,0,1.7,z,mat); addBox(g,2.2,0.9,0.08,0,2.2,z-1.21,glass);}
  var box;
  if(type==='sedan'){
    lm([[-2.25,0.4,0.85,0.8,0.8],[-1.85,0.38,1.12,0.95,0.95],[2.0,0.38,1.12,0.95,0.95],[2.25,0.4,1.1,0.9,0.9]],body);
    lm([[-0.95,1.1,1.14,0.85,0.8],[-0.4,1.1,1.66,0.86,0.64],[0.95,1.1,1.66,0.86,0.64],[1.4,1.1,1.14,0.84,0.78]],glass); addBox(g,1.3,0.04,1.4,0,1.68,0.28,body);
    wheels([-1.4,1.4],0.95,0.36); lights(0.85,1.5);
  }else if(type==='hatch'){
    lm([[-1.9,0.4,0.85,0.75,0.75],[-1.55,0.38,1.12,0.9,0.9],[1.9,0.38,1.12,0.9,0.9]],body);
    lm([[-0.9,1.1,1.14,0.8,0.76],[-0.4,1.1,1.75,0.8,0.62],[1.3,1.1,1.75,0.8,0.62],[1.55,1.1,1.14,0.8,0.76]],glass); addBox(g,1.2,0.04,1.7,0,1.77,0.45,body);
    wheels([-1.15,1.15],0.9,0.34); lights(0.85,1.4);
  }else if(type==='suv'){
    lm([[-2.4,0.5,1.0,0.85,0.85],[-2.0,0.45,1.35,1.0,1.0],[2.4,0.45,1.35,1.0,1.0]],body);
    lm([[-1.0,1.35,1.4,0.92,0.88],[-0.55,1.35,2.1,0.92,0.72],[1.7,1.35,2.1,0.92,0.72],[2.1,1.35,1.4,0.92,0.86]],glass); addBox(g,1.4,0.04,2.2,0,2.12,0.6,body);
    addBox(g,1.9,0.1,2.6,0,2.2,0.6,dark);
    wheels([-1.5,1.5],1.0,0.42); lights(1.0,1.6);
  }else if(type==='pickup'){
    addBox(g,2.0,0.8,5.4,0,0.8,0,body); addBox(g,1.8,0.7,1.8,0,1.55,-1.0,glass);
    addBox(g,0.1,0.4,2.4,-0.95,1.4,1.4,body); addBox(g,0.1,0.4,2.4,0.95,1.4,1.4,body); addBox(g,1.9,0.4,0.1,0,1.4,2.6,body);
    wheels([-1.7,1.7],1.0,0.42); lights(0.95,1.6);
  }else if(type==='van'){
    addBox(g,2.0,1.5,5.2,0,1.35,0,body); addBox(g,1.8,0.6,0.1,0,1.8,-2.62,glass);
    addBox(g,2.04,0.45,1.6,0,1.85,-0.8,glass);
    wheels([-1.7,1.7],1.0,0.4); lights(1.0,1.7);
  }else if(type==='bus'){
    var bc=pickOf([0xd9a21b,0xe8ebf0,0x2a7fa8,0xc8202f]);
    addBox(g,2.5,2.4,11,0,1.8,0,lamb(bc)); addBox(g,2.54,0.8,9.6,0,2.45,0.2,glass);
    addBox(g,2.3,1.0,0.1,0,2.3,-5.55,glass); addBox(g,1.6,0.3,3,0,3.15,0.5,dark);
    wheels([-3.8,3.2,4.4],1.1,0.5); lights(1.1,2.2);
  }else if(type==='truck'){
    cab(-4.8,body);
    addBox(g,2.5,2.9,8.2,0,2.15,1.9,lamb(pickOf([0xe8ebf0,0xf1f3f8,0x2a4f9e,0xc8202f,0xd9a21b])));
    addBox(g,2.2,0.3,12,0,0.75,0,dark);
    wheels([-4.8,3.6,5.0],1.05,0.5); lights(1.0,2.2);
  }else{
    cab(-4.3,body);
    addBox(g,2.2,0.3,11,0,0.75,0,dark);
    var tk=new THREE.Mesh(geoCyl,lamb(pickOf([0xc0c8d8,0xe8ebf0,0xd9a21b]))); tk.scale.set(1.2,8,1.2); tk.rotation.x=Math.PI/2; tk.position.set(0,1.85,1.4); g.add(tk);
    wheels([-4.3,3.4,4.8],1.0,0.5); lights(1.0,2.0);
  }
  return g;
}
var cars=[], TRAFFIC=34, LANEW=ROAD_HALF*2/LANES;
function laneX(i){return -ROAD_HALF+LANEW*(i+0.5);}
function laneFree(o,lane,z,gap){
  for(var i=0;i<cars.length;i++){
    var q=cars[i];
    if(q===o || q.dead || !q.m) continue;
    if(Math.abs(q.lane-lane)<1 && Math.abs(q.m.position.z-z)<gap+(q.L+o.L)/2) return false;
  }
  return true;
}
function resetCar(o,zRef){
  if(o.m) scene.remove(o.m);
  var type=pickW(VT), d=VT[type];
  o.type=type; o.name=d.name; o.L=d.L; o.hl=d.L/2+1.2; o.hw=d.W/2+0.95; o.clear=d.clear; o.pts=d.pts; o.heavy=!!d.heavy;
  var lane=0,z=zRef,tries=0;
  do{ lane=(Math.random()*LANES)|0; z=zRef-rand(0,260-110*diffT()); tries++; }while(!laneFree(o,lane,z,16)&&tries<14);
  o.lane=lane; o.tx=laneX(lane); o.v=rand(d.v[0],d.v[1]); o.lcT=o.heavy?9999:rand(2,8)/(1+diffT());
  o.dead=false; o.vel=null; o.done=false; o.jumped=false; o.near=false; o.sp=0; o.sigDir=0; o.sigT=0; o.sigClk=0; o.pend=-1; o.blOn=-1;
  o.m=makeVehicle(type); o.sh=false; o.m.position.set(o.tx,0,z); scene.add(o.m);
}
function fillTraffic(){
  for(var i=0;i<TRAFFIC;i++){
    var o={m:null,L:4.5,lane:0,tx:0,v:20,lcT:5,dead:false,vel:null,done:false,jumped:false};
    cars.push(o); resetCar(o,c.z-60);
  }
}

/* power-ups: coloured beacons on the road, some floating high */
var PU={
  air:{color:0xd7f3ff,w:3,label:'Recarga de ar'},
  time:{color:0x8dffb4,w:2,label:'+8 s no relógio'},
  shield:{color:0xffc24a,w:1,label:'Escudo · absorve 1 batida'},
  x2:{color:0xff7ab8,w:2,label:'Pontos ×2 · 12 s'},
  nitro:{color:0xff6a3a,w:1.5,label:'Ar infinito · 8 s'}
};
var puGeo={
  ring:new THREE.TorusGeometry(1.2,0.1,8,28),
  beam:new THREE.CylinderGeometry(0.4,0.4,16,10,1,true),
  air:new THREE.CylinderGeometry(0.4,0.4,0.9,12),
  time:new THREE.OctahedronGeometry(0.7),
  shield:new THREE.DodecahedronGeometry(0.6),
  x2:new THREE.BoxGeometry(0.8,0.8,0.8),
  nitro:new THREE.ConeGeometry(0.5,1.1,10)
};
var puMats={}, puBeams={};
(function(){
  Object.keys(PU).forEach(function(k){
    puMats[k]=new THREE.MeshBasicMaterial({color:PU[k].color});
    puBeams[k]=new THREE.MeshBasicMaterial({color:PU[k].color,transparent:true,opacity:0.2,depthWrite:false,side:THREE.DoubleSide});
  });
})();
var pups=[], PUPS=3;
function makePickup(type,py){
  var g=new THREE.Group();
  var ring=new THREE.Mesh(puGeo.ring,puMats[type]); ring.rotation.x=Math.PI/2; g.add(ring);
  var core=new THREE.Mesh(puGeo[type],puMats[type]); g.add(core);
  var beam=new THREE.Mesh(puGeo.beam,puBeams[type]); beam.position.y=8-py; g.add(beam);
  g.userData.core=core;
  return g;
}
function resetPup(p,zRef){
  if(p.m) scene.remove(p.m);
  p.type=pickW(PU);
  var high=Math.random()<0.3;
  p.py=high?rand(5.5,8):1.5;
  p.x=laneX((Math.random()*LANES)|0);
  p.z=zRef-rand(250,800)*(1+0.5*diffT());
  p.t=rand(0,6.28);
  p.m=makePickup(p.type,p.py); p.m.position.set(p.x,p.py,p.z); scene.add(p.m);
}
function fillPups(){
  for(var i=0;i<PUPS;i++){var p={m:null}; pups.push(p); resetPup(p,c.z-90);}
}
function collect(p){
  var type=p.type;
  if(type==='air') c.air=TANK;
  else if(type==='time') timeLeft+=Math.round(8*(1.1-0.4*diffT()));
  else if(type==='shield') c.shield=6;
  else if(type==='x2') c.mult=12;
  else if(type==='nitro') c.nitro=8;
  addScore(50);
  toast(PU[type].label,'good'); burst(p.x,p.py,p.z,22,PU[type].color,11,1.1); shock(p.x,p.py-0.5,p.z,PU[type].color,5,0.6); shock(c.x,Math.max(0,c.y),c.z,PU[type].color,3,0.4); sfx(type==='shield'?'shield':'pickup');
  resetPup(p,c.z-300);
}
function clearWorld(){
  cars.forEach(function(o){if(o.m) scene.remove(o.m);});
  pups.forEach(function(o){if(o.m) scene.remove(o.m);});
  ramps.forEach(function(o){scene.remove(o.group);});
  cars=[]; pups=[]; ramps=[];
}

/* scenery: scrub, rocks, test stands, air tanks */
var scenery=[];
(function(){
  var scrubM=lamb(0x4a5a2e), rockM=lamb(0x7a5a48), steel=lamb(0x8a8f9c), white=lamb(0xe6e9f0), lightM=new THREE.MeshBasicMaterial({color:0xff4a3a});
  function place(o,big){
    o.userData.big=big; scene.add(o); scenery.push(o);
  }
  var i,m;
  for(i=0;i<34;i++){
    m=new THREE.Mesh(new THREE.IcosahedronGeometry(rand(0.6,1.5),0),scrubM); m.scale.y=0.6; m.position.y=0.4; place(m,false);
  }
  for(i=0;i<22;i++){
    m=new THREE.Mesh(new THREE.DodecahedronGeometry(rand(0.8,2.4),0),rockM); m.position.y=0.5; place(m,false);
  }
  for(i=0;i<6;i++){
    var t=new THREE.Group();
    addBox(t,4,36,4,0,18,0,steel);
    addBox(t,9,1.2,1.2,0,30,0,steel);
    addBox(t,1.2,1.2,9,0,24,0,steel);
    addBox(t,1,1,1,0,36.6,0,lightM);
    place(t,true);
  }
  for(i=0;i<6;i++){
    var k=new THREE.Group();
    var cyl=new THREE.Mesh(geoCyl,white); cyl.scale.set(4,12,4); cyl.position.y=6; k.add(cyl);
    var dome=new THREE.Mesh(new THREE.SphereGeometry(4,16,10,0,TAU,0,Math.PI/2),white); dome.position.y=12; k.add(dome);
    place(k,true);
  }
})();
function placeScenery(o,zRef,spread){
  var side=Math.random()<0.5?-1:1;
  var off=o.userData.big?rand(60,140):rand(30,100);
  o.position.x=side*off;
  o.position.z=zRef-rand(0,spread);
  o.rotation.y=rand(0,TAU);
}


