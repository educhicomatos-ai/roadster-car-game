/* ---------- reflections: sky environment map ---------- */
var envTex=null, envPM=null, carEnv=[], phongEnv=[];
(function(){
  var cv=document.createElement('canvas'); cv.width=512; cv.height=256; var x=cv.getContext('2d');
  var gr=x.createLinearGradient(0,0,0,256);
  gr.addColorStop(0,'#4f7fd6'); gr.addColorStop(0.3,'#9dc0ee'); gr.addColorStop(0.47,'#ffe0b0'); gr.addColorStop(0.5,'#e9a577'); gr.addColorStop(0.56,'#4a4048'); gr.addColorStop(1,'#15141a');
  x.fillStyle=gr; x.fillRect(0,0,512,256);
  var sg=x.createRadialGradient(128,104,0,128,104,70); sg.addColorStop(0,'rgba(255,250,235,1)'); sg.addColorStop(0.15,'rgba(255,225,170,.9)'); sg.addColorStop(1,'rgba(255,190,120,0)');
  x.fillStyle=sg; x.fillRect(0,0,512,256);
  x.fillStyle='rgba(255,255,255,.55)'; [[40,40,150],[300,30,120],[360,56,90]].forEach(function(r){x.fillRect(r[0],r[1],r[2],5);});
  envTex=new THREE.CanvasTexture(cv); envTex.mapping=THREE.EquirectangularReflectionMapping;
  try{var pm=new THREE.PMREMGenerator(renderer); envPM=pm.fromEquirectangular(envTex).texture; pm.dispose();}catch(e){envPM=null;}
})();
function stdMat(o){var m=new THREE.MeshStandardMaterial(o); if(envPM) m.envMap=envPM; m.envMapIntensity=0.9; carEnv.push(m); return m;}
function phEnv(o,r){o.envMap=envTex; o.reflectivity=r; o.combine=THREE.MixOperation; var m=new THREE.MeshPhongMaterial(o); m.userData.r0=r; phongEnv.push(m); return m;}
var bodyMats={}, glassPh=null;
function carBody(color){return bodyMats[color]||(bodyMats[color]=phEnv({color:color,specular:0x555555,shininess:60,side:THREE.DoubleSide},0.22));}
function carGlass(){return glassPh||(glassPh=phEnv({color:0x0b1022,specular:0xffffff,shininess:90,side:THREE.DoubleSide},0.6));}

function makeSedan(color){
  var g=new THREE.Group();
  addBox(g,1.9,0.75,4.5,0,0.75,0,lamb(color));
  addBox(g,1.7,0.6,2.3,0,1.38,0.2,lamb(0x12162a));
  [[-1,-1.4],[1,-1.4],[-1,1.4],[1,1.4]].forEach(function(p){addWheel(g,p[0]*0.95,0.36,p[1],0.36,0.26);});
  addBox(g,1.5,0.08,0.05,0,0.85,2.26,new THREE.MeshBasicMaterial({color:0xff3b4a}));
  return g;
}
function loftGeo(st){
  var pos=[], idx=[], i, n=st.length;
  st.forEach(function(q){var z=q[0],yb=q[1],yt=q[2],hb=q[3],ht=q[4]; pos.push(-hb,yb,z, hb,yb,z, ht,yt,z, -ht,yt,z);});
  for(i=0;i<n-1;i++){var o=i*4,p=o+4; for(var k=0;k<4;k++){var k2=(k+1)%4; idx.push(o+k,o+k2,p+k2, o+k,p+k2,p+k);}}
  idx.push(0,2,1,0,3,2); var l=(n-1)*4; idx.push(l,l+1,l+2,l,l+2,l+3);
  var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx);
  g=g.toNonIndexed(); g.computeVertexNormals(); return g;
}
function makeRoadster(){
  var g=new THREE.Group();
  var paint=stdMat({color:0xe9edf4,vertexColors:true,side:THREE.DoubleSide,metalness:0.55,roughness:0.28}), dark=stdMat({color:0x141826,vertexColors:true,metalness:0.2,roughness:0.55}), noz=stdMat({color:0x2a2f3f,metalness:0.7,roughness:0.35});
  var glass=stdMat({color:0x0b0f22,side:THREE.DoubleSide,metalness:0.9,roughness:0.06});
  var W=0xffffff, P=[], T=[], WH=[], sd, k;
  /* lower body: sloped nose, flat hood, tapered tail */
  P.push(part(loftGeo([[-2.95,0.34,0.60,0.60,0.60],[-2.55,0.28,0.78,0.86,0.86],[-2.1,0.28,0.80,0.95,0.95],[1.7,0.28,0.80,0.95,0.95],[2.25,0.30,0.80,0.90,0.90]]),0,0,0,1,1,1,W));
  /* roof panel + fender flares + mirrors */
  P.push(part(geoBox,0,1.205,0.4,1.28,0.04,0.82,W));
  for(sd=-1;sd<=1;sd+=2){
    [-1.4,1.4].forEach(function(z){P.push(part(geoBox,sd*1.06,0.72,z,0.2,0.27,1.12,W));});
    P.push(part(geoBox,sd*1.02,0.95,-0.3,0.14,0.1,0.2,W));
    T.push(part(geoBox,sd*0.93,0.9,-0.28,0.1,0.04,0.05,W));
  }
  g.add(new THREE.Mesh(mergeParts(P),paint));
  /* cabin glass (windshield, side windows, rear window) */
  g.add(new THREE.Mesh(loftGeo([[-0.5,0.80,0.82,0.84,0.80],[0.0,0.80,1.19,0.88,0.64],[0.8,0.80,1.19,0.88,0.64],[1.3,0.80,0.84,0.84,0.78]]),glass));
  /* trim: skirts, splitter, diffuser, bumper, grille, spoiler, end plates */
  for(sd=-1;sd<=1;sd+=2){
    T.push(part(geoBox,sd*0.97,0.3,0,0.08,0.08,2.2,W));
    T.push(part(geoBox,sd*0.7,0.5,-2.98,0.34,0.14,0.05,0x05060a));
    T.push(part(geoBox,sd*1.0,1.22,1.95,0.05,0.24,0.56,W));
    T.push(part(geoBox,sd*0.6,0.96,1.95,0.08,0.5,0.08,W));
  }
  T.push(part(geoBox,0,0.27,-2.78,1.5,0.05,0.4,W));
  T.push(part(geoBox,0,0.5,-2.98,0.7,0.12,0.05,0x05060a));
  T.push(part(geoBox,0,0.34,2.3,1.5,0.12,0.2,W));
  T.push(part(geoBox,0,1.2,1.95,2.0,0.07,0.5,W,-0.08,0,0));
  g.add(new THREE.Mesh(mergeParts(T),dark));
  /* wheels: tyre, dark disc, silver ring, 5 spokes, hub */
  [[-1,-1.4],[1,-1.4],[-1,1.4],[1,1.4]].forEach(function(q){
    var x=q[0], z=q[1], ox=x*1.0, fx=x*1.16;
    WH.push(part(geoCyl,ox,0.38,z,0.38,0.3,0.38,0x0c0d12,0,0,Math.PI/2));
    WH.push(part(geoCyl,x*1.1,0.38,z,0.27,0.2,0.27,0x15171d,0,0,Math.PI/2));
    WH.push(part(new THREE.TorusGeometry(1,0.13,6,20),fx,0.38,z,0.27,0.27,0.27,0xc9d0dc,0,Math.PI/2,0));
    for(k=0;k<5;k++) WH.push(part(geoBox,fx,0.38,z,0.03,0.05,0.52,0xc9d0dc,k*Math.PI*2/5,0,0));
    WH.push(part(geoCyl,fx,0.38,z,0.07,0.04,0.07,0x30343e,0,0,Math.PI/2));
    WH.push(part(geoBox,x*0.9,0.55,z,0.04,0.12,0.2,0xd8262f));
  });
  g.add(new THREE.Mesh(mergeParts(WH),stdMat({vertexColors:true,metalness:0.55,roughness:0.4})));
  /* lights */
  var hl=new THREE.MeshBasicMaterial({color:0xfff3cf});
  [-1,1].forEach(function(x){
    var h=addBox(g,0.42,0.07,0.22,x*0.6,0.77,-2.58,hl); h.rotation.x=-0.3;
    addBox(g,0.2,0.04,0.04,x*0.28,0.5,-2.99,hl);
  });
  var tailMat=new THREE.MeshBasicMaterial({color:0xff3b4a});
  addBox(g,1.7,0.07,0.05,0,0.72,2.27,tailMat); addBox(g,0.4,0.1,0.05,-0.75,0.64,2.27,tailMat); addBox(g,0.4,0.1,0.05,0.75,0.64,2.27,tailMat);
  g.userData.tail=tailMat;
  [-0.6,-0.2,0.2,0.6].forEach(function(x){
    var m=new THREE.Mesh(geoCyl,noz); m.scale.set(0.1,0.2,0.1); m.rotation.x=Math.PI/2; m.position.set(x,0.5,2.35); g.add(m);
  });
  g.userData.paint=paint; g.userData.dark=dark;
  return g;
}

