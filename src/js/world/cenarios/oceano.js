/* ---------- ocean: the sea splits into two towering, animated walls over a wet sea floor ---------- */
var waveTex=(function(){
  var cv=document.createElement('canvas'); cv.width=cv.height=256; var g=cv.getContext('2d'), i;
  var gr=g.createLinearGradient(0,0,0,256); gr.addColorStop(0,'#d8eef6'); gr.addColorStop(0.5,'#9fc4d4'); gr.addColorStop(1,'#d0e6ee');
  g.fillStyle=gr; g.fillRect(0,0,256,256);
  g.lineCap='round';
  for(i=0;i<60;i++){ /* long vertical streaks of falling water */
    var sx=Math.random()*256; g.strokeStyle='rgba(20,70,100,'+rand(0.10,0.30)+')'; g.lineWidth=rand(1,5);
    g.beginPath(); g.moveTo(sx,Math.random()*256); g.lineTo(sx+rand(-8,8),Math.random()*256); g.stroke();
  }
  for(i=0;i<70;i++){
    g.strokeStyle='rgba(255,255,255,'+rand(0.35,0.85)+')'; g.lineWidth=rand(1,3.5);
    var x=Math.random()*256, y=Math.random()*256, r=rand(10,60);
    g.beginPath(); g.arc(x,y,r,rand(0,6),rand(0,6)+1.2); g.stroke();
  }
  for(i=0;i<50;i++){g.fillStyle='rgba(10,50,85,'+rand(0.12,0.3)+')'; g.fillRect(Math.random()*256,Math.random()*256,rand(8,50),rand(2,7));}
  for(i=0;i<40;i++){g.fillStyle='rgba(255,255,255,'+rand(0.15,0.4)+')'; g.beginPath(); g.arc(Math.random()*256,Math.random()*256,rand(1,3.5),0,TAU); g.fill();}
  var t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
})();
var foamMat=null, stormBack=null;
var waveMat=new THREE.MeshBasicMaterial({map:waveTex,vertexColors:true,side:THREE.DoubleSide});
(function(){
  var cv=document.createElement('canvas'); cv.width=1024; cv.height=512; var g=cv.getContext('2d'), i;
  var gr=g.createLinearGradient(0,0,0,512); gr.addColorStop(0,'#232a58'); gr.addColorStop(0.55,'#5a4a86'); gr.addColorStop(1,'#d88a78');
  g.fillStyle=gr; g.fillRect(0,0,1024,512);
  for(i=0;i<170;i++){
    var x=Math.random()*1024, y=Math.random()*470, r=rand(30,110), dk=Math.random()<0.6;
    var rg=g.createRadialGradient(x,y,0,x,y,r); rg.addColorStop(0,dk?'rgba(30,28,70,0.5)':'rgba(255,190,170,0.38)'); rg.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=rg; g.fillRect(x-r,y-r,r*2,r*2);
  }
  g.globalCompositeOperation='destination-out'; /* open window for the light at the end of the road */
  var hg=g.createRadialGradient(512,512,10,512,512,230); hg.addColorStop(0,'rgba(0,0,0,1)'); hg.addColorStop(0.55,'rgba(0,0,0,0.9)'); hg.addColorStop(1,'rgba(0,0,0,0)');
  g.save(); g.translate(512,512); g.scale(1,0.62); g.translate(-512,-512); g.fillStyle=hg; g.fillRect(0,0,1024,1024); g.restore();
  var t=new THREE.CanvasTexture(cv);
  stormBack=new THREE.Mesh(new THREE.PlaneGeometry(1700,700),new THREE.MeshBasicMaterial({map:t,transparent:true,fog:false,depthWrite:false,opacity:0}));
  stormBack.position.set(0,300,-790); stormBack.renderOrder=-2; stormBack.frustumCulled=false; stormBack.visible=false; sky.add(stormBack);
})();
var WAVE_P=[[46,0],[46,8],[45.5,20],[44,34],[41,46],[37,56],[33,64],[29,69],[26,71],[27,73.5],[32,75],[44,72],[62,66],[80,60],[80,0]];
var WAVE_C=[0x0a2a44,0x0c3556,0x0f4264,0x14587a,0x1a6c8c,0x2a86a0,0x5aaebf,0x8fd2de,0xe6f8fc,0xffffff,0xd8f2f8,0x9fd8e4,0x6ab6c8,0x3a8aa4,0x1a5878].map(function(h){return new THREE.Color(h);});
function makeWave(L){
  var Z=14, M=WAVE_P.length, pos=new Float32Array(M*(Z+1)*3), col=new Float32Array(M*(Z+1)*3), uv=new Float32Array(M*(Z+1)*2), idx=[], r, zi;
  for(r=0;r<M;r++) for(zi=0;zi<=Z;zi++){
    var i=r*(Z+1)+zi, cc=WAVE_C[r].clone();
    if(r>=6&&r<=10) cc.lerp(new THREE.Color(0xffffff),0.28*hash2(zi,r));
    pos[i*3]=WAVE_P[r][0]; pos[i*3+1]=WAVE_P[r][1]; pos[i*3+2]=-L/2+L*zi/Z;
    col[i*3]=cc.r; col[i*3+1]=cc.g; col[i*3+2]=cc.b; uv[i*2]=zi/Z*2.5; uv[i*2+1]=r*0.22;
  }
  for(r=0;r<M-1;r++) for(zi=0;zi<Z;zi++){var a=r*(Z+1)+zi, b=a+1, c2=a+Z+1, d=c2+1; idx.push(a,b,c2,b,d,c2);}
  var g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  g.setIndex(idx); g.userData.base=pos.slice(); return g;
}
(function(){
  addLinear({biome:3,L:100,xs:[0,0],
    mk:function(){var m=new THREE.Mesh(makeWave(100),waveMat); m.frustumCulled=false; return m;},
    setup:function(it,k,s){it.o.scale.set(s?1:-1,1,1);},
    anim:function(it,t){
      var g=it.o.geometry, p=g.attributes.position.array, b=g.userData.base, z0=it.o.position.z;
      for(var i=0;i<p.length;i+=3){
        var by=b[i+1], w=Math.min(1,by/60), wz=z0+b[i+2], gr=edgeGrow(wz); gr=Math.max(0.05,gr*gr*(3-2*gr));
        var wob=Math.sin(wz*0.045+t*0.9+by*0.09)*1.5+Math.sin(wz*0.11-t*1.6+by*0.2)*0.6+Math.sin(wz*0.23+t*2.3+by*0.35)*0.35;
        p[i]=b[i]-wob*w*gr; p[i+1]=by*gr+Math.sin(wz*0.07+t*1.1)*0.7*w*gr; p[i+2]=b[i+2];
      }
      g.attributes.position.needsUpdate=true;
    }});
  var bl=[];
  for(var v=0;v<3;v++) bl.push(mergeParts([part(gSp0,0,0.6,0,rand(2.5,4.5),rand(1.4,2.6),rand(2.5,4.5),[0x4a5068,0x3d4358,0x5a6078][v]),part(gSp0,rand(2,3),0.3,rand(-1,1),rand(1.2,2),rand(0.8,1.4),rand(1.2,2),0x353a4c)]));
  addPool({biome:3,n:70,mk:function(i){return new THREE.Mesh(bl[i%3],matV);},near:24,far:90,dens:0.1});
  /* wet sea floor between the road and the walls: ripples, puddles and glints */
  var rt=(function(){
    var cv=document.createElement('canvas'); cv.width=cv.height=256; var g=cv.getContext('2d'), i;
    g.fillStyle='rgba(70,95,135,0.7)'; g.fillRect(0,0,256,256);
    g.lineCap='round';
    for(i=0;i<46;i++){ /* sand ripples */
      var y=Math.random()*256, x=Math.random()*256; g.strokeStyle='rgba(200,225,250,'+rand(0.25,0.55)+')'; g.lineWidth=rand(1.5,4);
      g.beginPath(); g.moveTo(x,y); g.quadraticCurveTo(x+rand(20,50),y+rand(-6,6),x+rand(60,110),y+rand(-4,4)); g.stroke();
    }
    for(i=0;i<9;i++){ /* puddles */
      var px=Math.random()*256, py=Math.random()*256, rx=rand(14,38), ry=rand(5,12);
      g.fillStyle='rgba(120,170,215,0.45)'; g.beginPath(); g.ellipse(px,py,rx,ry,0,0,TAU); g.fill();
      g.strokeStyle='rgba(255,255,255,0.55)'; g.lineWidth=1.5; g.beginPath(); g.ellipse(px,py,rx*0.7,ry*0.6,0,3.4,5.4); g.stroke();
    }
    var t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(1,4); return t;
  })();
  var rippleMat=new THREE.MeshBasicMaterial({map:rt,transparent:true,depthWrite:false,color:0xffffff,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  addLinear({biome:3,L:100,xs:[-33.5,33.5],y:0.03,
    mk:function(){var m=new THREE.Mesh(new THREE.PlaneGeometry(25.5,100),rippleMat); m.frustumCulled=false; return m;},
    setup:function(it,k,s){var g=Math.max(0.02,edgeGrow(k*100)); it.o.rotation.set(-Math.PI/2,0,0); it.o.scale.set(g,1,1); it.o.position.x=(s?1:-1)*(21+12.75*g);}});
  /* foam where the water meets the floor */
  var ft=(function(){
    var cv=document.createElement('canvas'); cv.width=128; cv.height=256; var g=cv.getContext('2d'), i;
    for(i=0;i<260;i++){
      var x=Math.pow(Math.random(),0.7)*128, y=Math.random()*256, r=rand(2,9);
      var gg=g.createRadialGradient(x,y,0,x,y,r); gg.addColorStop(0,'rgba(255,255,255,'+rand(0.5,0.95)+')'); gg.addColorStop(1,'rgba(255,255,255,0)');
      g.fillStyle=gg; g.beginPath(); g.arc(x,y,r,0,TAU); g.fill();
    }
    var t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(1,4); return t;
  })();
  foamMat=new THREE.MeshBasicMaterial({map:ft,transparent:true,depthWrite:false,opacity:0.85,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  addLinear({biome:3,L:100,xs:[-42,42],y:0.06,
    mk:function(){var m=new THREE.Mesh(new THREE.PlaneGeometry(9,100),foamMat); m.frustumCulled=false; return m;},
    setup:function(it,k,s){var g=Math.max(0.02,edgeGrow(k*100)); it.o.rotation.set(-Math.PI/2,0,s?Math.PI:0); it.o.scale.set(g,1,1); it.o.position.x=(s?1:-1)*(46.5-4.5*g);}});
})();

