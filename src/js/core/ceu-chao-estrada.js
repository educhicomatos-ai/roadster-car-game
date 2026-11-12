/* sky dome follows the camera; colours are repainted every frame from the active biome */
var sky=new THREE.Group(); scene.add(sky);
var SKY_Y=[-1,0,0.07,0.22,0.5,1];
var skyGeo=new THREE.SphereGeometry(900,32,20), skySeg=[], skyTt=[];
(function(){
  var pos=skyGeo.attributes.position;
  for(var i=0;i<pos.count;i++){
    var y=pos.getY(i)/900, j=1;
    while(j<SKY_Y.length-1 && y>SKY_Y[j]) j++;
    skySeg.push(j-1); skyTt.push(clamp((y-SKY_Y[j-1])/(SKY_Y[j]-SKY_Y[j-1]),0,1));
  }
  skyGeo.setAttribute('color',new THREE.BufferAttribute(new Float32Array(pos.count*3),3));
})();
function paintSky(cols){
  var a=skyGeo.attributes.color.array, n=skySeg.length;
  for(var i=0;i<n;i++){
    var s=skySeg[i], t=skyTt[i], c0=cols[s], c1=cols[s+1], k=i*3;
    a[k]=c0.r+(c1.r-c0.r)*t; a[k+1]=c0.g+(c1.g-c0.g)*t; a[k+2]=c0.b+(c1.b-c0.b)*t;
  }
  skyGeo.attributes.color.needsUpdate=true;
}
var skyDome=new THREE.Mesh(skyGeo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false}));
skyDome.renderOrder=-4; sky.add(skyDome);
var skyHalo=new THREE.Mesh(new THREE.CircleGeometry(170,40),new THREE.MeshBasicMaterial({color:0xff9a5a,transparent:true,opacity:0.35,fog:false,depthWrite:false}));
skyHalo.position.set(0,50,-850); skyHalo.renderOrder=-3; sky.add(skyHalo);
var skyDisc=new THREE.Mesh(new THREE.CircleGeometry(48,40),new THREE.MeshBasicMaterial({color:0xffe2b0,fog:false,depthWrite:false}));
skyDisc.position.set(0,55,-849); skyDisc.renderOrder=-2; sky.add(skyDisc);

/* stars, two layers that twinkle out of phase */
var starsA, starsB;
(function(){
  function mk(){
    var n=260, p=new Float32Array(n*3);
    for(var i=0;i<n;i++){
      var y=0.04+Math.random()*0.96, a=Math.random()*TAU, r=Math.sqrt(1-y*y)*860;
      p[i*3]=Math.cos(a)*r; p[i*3+1]=y*860; p[i*3+2]=Math.sin(a)*r;
    }
    var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(p,3));
    var s=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:2.4,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));
    s.renderOrder=-3; s.frustumCulled=false; s.visible=false; sky.add(s); return s;
  }
  starsA=mk(); starsB=mk();
})();

/* clouds drift slowly around the horizon */
var cloudGroup=new THREE.Group(); sky.add(cloudGroup);
var cloudMat=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0.6,fog:false,depthWrite:false});
(function(){
  var sg=new THREE.IcosahedronGeometry(1,1);
  for(var i=0;i<20;i++){
    var parts=[], n=4+((Math.random()*4)|0), w=rand(34,70), hh=w*0.14;
    for(var k=0;k<n;k++){
      var r=rand(0.55,1)*w*0.5, y=rand(0,hh), sh=0.74+0.26*(y/hh);
      parts.push(part(sg,(k-(n-1)/2)*w*0.3+rand(-4,4),y,rand(-6,6),r,r*0.5,r*0.75,new THREE.Color(sh,sh,sh*1.02)));
    }
    var m=new THREE.Mesh(mergeParts(parts),cloudMat), ang=rand(0,TAU);
    m.position.set(Math.cos(ang)*640,rand(70,250),Math.sin(ang)*640); m.lookAt(0,m.position.y,0);
    m.renderOrder=-2; m.frustumCulled=false; cloudGroup.add(m);
  }
})();

/* light beam through the parted sea, and neon searchlights */
var BEAM_TEX=beamTex();
var skyBeam=new THREE.Mesh(new THREE.PlaneGeometry(26,420).translate(0,210,0),new THREE.MeshBasicMaterial({map:BEAM_TEX,color:0xffc890,transparent:true,opacity:0,fog:false,depthWrite:false,blending:THREE.AdditiveBlending}));
skyBeam.position.set(0,6,-846); skyBeam.renderOrder=-1; skyBeam.visible=false; skyBeam.frustumCulled=false; sky.add(skyBeam);
var searchLights=[];
(function(){
  [[-1,0xff7af0],[1,0x7affff]].forEach(function(d){
    var m=new THREE.Mesh(new THREE.PlaneGeometry(34,760).translate(0,380,0),new THREE.MeshBasicMaterial({map:BEAM_TEX,color:d[1],transparent:true,opacity:0,fog:false,depthWrite:false,blending:THREE.AdditiveBlending}));
    m.position.set(d[0]*300,-30,-760); m.renderOrder=-1; m.visible=false; m.frustumCulled=false; m.userData.d=d[0]; sky.add(m); searchLights.push(m);
  });
})();

var sunRays=[];
(function(){
  for(var i=0;i<9;i++){
    var m=new THREE.Mesh(new THREE.PlaneGeometry(46,900).translate(0,450,0),new THREE.MeshBasicMaterial({map:BEAM_TEX,color:0xffc890,transparent:true,opacity:0,fog:false,depthWrite:false,blending:THREE.AdditiveBlending}));
    m.renderOrder=-1; m.visible=false; m.frustumCulled=false; m.userData.a=(i-4)*0.3+rand(-0.06,0.06); sky.add(m); sunRays.push(m);
  }
})();

/* lightning bolt ribbon (rebuilt on each strike) */
var BOLT_SEG=20, BOLT_R=3;
var boltGeo=new THREE.BufferGeometry();
(function(){
  var vn=BOLT_R*(BOLT_SEG+1)*2, idx=[];
  boltGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(vn*3),3));
  for(var r=0;r<BOLT_R;r++) for(var s=0;s<BOLT_SEG;s++){
    var a=r*(BOLT_SEG+1)*2+s*2; idx.push(a,a+1,a+2,a+1,a+3,a+2);
  }
  boltGeo.setIndex(idx);
})();
var boltMesh=new THREE.Mesh(boltGeo,new THREE.MeshBasicMaterial({color:0xece6ff,transparent:true,opacity:0,fog:false,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
boltMesh.renderOrder=0; boltMesh.visible=false; boltMesh.frustumCulled=false; sky.add(boltMesh);
function genBolt(){
  var p=boltGeo.attributes.position.array, z=-620, vi=0, pts=[];
  function ribbon(xa,ya,xb,yb,w,keep){
    var px=xa, py=ya;
    for(var s=0;s<=BOLT_SEG;s++){
      var t=s/BOLT_SEG, x=xa+(xb-xa)*t+((s>0&&s<BOLT_SEG)?rand(-26,26):0), y=ya+(yb-ya)*t;
      if(keep) pts.push([x,y]);
      p[vi++]=x-w; p[vi++]=y; p[vi++]=z; p[vi++]=x+w; p[vi++]=y; p[vi++]=z;
    }
  }
  var x0=rand(-110,110);
  ribbon(x0,520,x0+rand(-90,90),20,2.6,true);
  for(var b=0;b<2;b++){
    var q=pts[6+((Math.random()*8)|0)];
    ribbon(q[0],q[1],q[0]+rand(-160,160),q[1]-rand(120,260),1.2,false);
  }
  boltGeo.attributes.position.needsUpdate=true;
}

/* ground and road, textures anchored to the world */
function makeGroundTex(){
  var cv=document.createElement('canvas'); cv.width=cv.height=256;
  var g=cv.getContext('2d'); g.fillStyle='#c8c8c8'; g.fillRect(0,0,256,256);
  for(var i=0;i<1800;i++){
    var v=Math.random();
    g.fillStyle=v<0.5?'rgba(30,30,40,'+rand(0.08,0.25)+')':'rgba(255,255,255,'+rand(0.08,0.22)+')';
    var s=rand(1,4); g.fillRect(Math.random()*256,Math.random()*256,s,s);
  }
  var t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=4; return t;
}
function makeRoadTex(){
  var cv=document.createElement('canvas'); cv.width=128; cv.height=512;
  var g=cv.getContext('2d'); g.fillStyle='#23262f'; g.fillRect(0,0,128,512);
  for(var i=0;i<1400;i++){g.fillStyle='rgba(255,255,255,'+rand(0.02,0.07)+')'; g.fillRect(Math.random()*128,Math.random()*512,rand(1,3),rand(1,3));}
  g.fillStyle='#e8ecf4'; g.fillRect(2,0,4,512); g.fillRect(122,0,4,512);
  g.fillStyle='rgba(232,236,244,.9)';
  for(var k=1;k<7;k++){var x=128*k/7; g.fillRect(x-1.5,0,3,128); g.fillRect(x-1.5,256,3,128);}
  var t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=8; return t;
}
var GS=1200, GCELL=24, RS=32;
var groundTex=makeGroundTex(); groundTex.repeat.set(GS/GCELL,GS/GCELL);
var ground=new THREE.Mesh(new THREE.PlaneGeometry(GS,GS),new THREE.MeshLambertMaterial({map:groundTex}));
ground.rotation.x=-Math.PI/2; ground.position.y=-0.03; ground.receiveShadow=true; scene.add(ground);
var roadTex=makeRoadTex(); roadTex.repeat.set(1,GS/RS);
var road=new THREE.Mesh(new THREE.PlaneGeometry(ROAD_HALF*2,GS),new THREE.MeshPhongMaterial({map:roadTex,specular:0x3a322c,shininess:34,reflectivity:0.3,combine:THREE.AddOperation}));
road.receiveShadow=true;
try{var an=Math.min(8,renderer.capabilities.getMaxAnisotropy()); roadTex.anisotropy=an; groundTex.anisotropy=Math.min(4,an);}catch(e){}
road.rotation.x=-Math.PI/2; road.position.y=0.0; scene.add(road);

/* roadside delineator posts */
var posts=[], rails=[], railMat, stripeMat;
(function(){
  var pm=new THREE.MeshLambertMaterial({color:0xf1f3f8}), rm=new THREE.MeshBasicMaterial({color:0xff6a3a});
  var pg=new THREE.BoxGeometry(0.18,1,0.18), rg=new THREE.BoxGeometry(0.2,0.2,0.2);
  for(var s=0;s<2;s++){for(var i=0;i<28;i++){
    var m=new THREE.Mesh(pg,pm); m.position.y=0.5; var r=new THREE.Mesh(rg,rm); r.position.y=0.4; m.add(r);
    scene.add(m); posts.push({m:m,side:s?1:-1,i:i});
  }}
  railMat=new THREE.MeshLambertMaterial({color:0xb9c2d6}); stripeMat=new THREE.MeshBasicMaterial({color:0xff6a3a});
  var railGeo=new THREE.BoxGeometry(0.35,0.8,GS), stripeGeo=new THREE.BoxGeometry(0.38,0.12,GS);
  [-1,1].forEach(function(sd){
    var r=new THREE.Mesh(railGeo,railMat); r.position.set(sd*(ROAD_HALF+0.4),0.4,0); scene.add(r); rails.push(r);
    var t=new THREE.Mesh(stripeGeo,stripeMat); t.position.set(sd*(ROAD_HALF+0.4),0.62,0); scene.add(t); rails.push(t);
  });
})();

