/* ---------- cherry-blossom avenue: pink trees, hedges, lanterns and a carpet of petals ---------- */
(function(){
  var pinks=[0xf6b9cf,0xffd3e2,0xf09ab8,0xffe6ee,0xe88fb0,0xfbc6d8], T=[], i, k;
  for(i=0;i<6;i++){
    var lean=rand(-0.1,0.1), bark=0x4a3a32, tp=[part(gCy,0,3.3,0,0.5,6.6,0.5,bark,0,0,lean),part(gCy,1.3,7.2,0,0.26,3.6,0.26,bark,0,0,-0.75),part(gCy,-1.3,7.0,0.5,0.24,3.4,0.24,bark,0.4,0,0.75),part(gCy,0.3,7.4,-1.2,0.22,3.2,0.22,bark,-0.5,0,0.2)];
    for(k=0;k<10;k++){var r=rand(2.2,3.3); tp.push(part(gSp,rand(-4.2,4.2),rand(7.6,11.4),rand(-4,4),r,r*0.74,r,pinks[(Math.random()*6)|0]));}
    T.push(mergeParts(tp));
  }
  addLinear({biome:6,L:13,xs:[-(ROAD_HALF+10.8),ROAD_HALF+10.8],
    mk:function(i2){return new THREE.Mesh(T[i2%6],matV);},
    setup:function(it,k2,s){
      if(hash2(k2,s+5)<0.08){it.o.visible=false; return;}
      var sc=0.92+hash2(k2,s+1)*0.26; it.o.scale.set(sc,sc*(0.95+hash2(k2,s+2)*0.2),sc);
      it.o.position.x+=(s?1:-1)*hash2(k2,s+3)*3.5; it.o.position.z+=(hash2(k2,s+4)-0.5)*4; it.o.rotation.y=hash2(k2,s+6)*TAU; it.ph=hash2(k2,s)*TAU;
      it.o.geometry=T[Math.floor(hash2(k2,s+7)*6)];
    },
    anim:function(it,t){it.o.rotation.z=Math.sin(t*0.9+it.ph)*0.012;}});
  addPool({biome:6,n:70,mk:function(i2){return new THREE.Mesh(T[i2%6],matV);},near:44,far:140,dens:0.14,
    setup:function(it){var sc=rand(0.95,1.4); it.o.scale.set(sc,sc,sc);}});
  var hd=[];
  for(i=0;i<2;i++) hd.push(mergeParts([part(gSp,0,0.8,-5,1.9,1.0,5.2,0x2e5a2c),part(gSp,0,0.8,5,1.9,1.0,5.2,0x376a31),part(gSp,0,0.7,0,1.8,0.9,3.5,0x2a5428),part(gSp0,0.4,1.55,rand(-4,4),0.7,0.4,0.9,0xf6b9cf)]));
  addLinear({biome:6,L:18,xs:[-(ROAD_HALF+4.4),ROAD_HALF+4.4],mk:function(i2){return new THREE.Mesh(hd[i2%2],matV);},setup:function(it,k2,s){it.o.scale.y=0.9+hash2(k2,s)*0.4;}});
  var lp=mergeParts([part(gCy,0,3.8,0,0.13,7.6,0.13,0x6a2c2c),part(gB,-0.8,7.5,0,1.6,0.12,0.15,0x6a2c2c),part(gSp,-1.6,7.3,0,0.32,0.4,0.32,0xfff0c8)]);
  addLinear({biome:6,L:36,zo:6,xs:[-(ROAD_HALF+2.6),ROAD_HALF+2.6],mk:function(){return new THREE.Mesh(lp,matV);},setup:function(it,k2,s){it.o.scale.x=s?-1:1;}});
  var ln=mergeParts([part(gCy,0,0.2,0,0.55,0.4,0.55,0x9a9a98),part(gCy,0,0.95,0,0.2,1.1,0.2,0xa6a6a4),part(gB,0,1.75,0,0.75,0.65,0.75,0xd8d4c8),part(gCo,0,2.4,0,0.85,0.6,0.85,0x8a8a88)]);
  addLinear({biome:6,L:72,zo:22,xs:[-(ROAD_HALF+6.5),ROAD_HALF+6.5],mk:function(){return new THREE.Mesh(ln,matV);},setup:function(it,k2,s){if(hash2(k2,s+33)<0.3) it.o.visible=false;}});
  /* petals scattered over the road */
  var pt=(function(){
    var cv=document.createElement('canvas'); cv.width=cv.height=512; var g=cv.getContext('2d'), i2, pal=['#ffd0e0','#ffb8d0','#fff0f6','#f6a0c0','#ffc6da'];
    for(i2=0;i2<1500;i2++){
      var x=Math.random()*512, e=Math.random()<0.45;
      if(e) x=Math.random()<0.5?Math.random()*110:512-Math.random()*110;
      g.fillStyle=pal[(Math.random()*5)|0]; g.globalAlpha=rand(0.45,0.95);
      g.beginPath(); g.ellipse(x,Math.random()*512,rand(2.4,4.6),rand(1.5,2.8),rand(0,3.14),0,TAU); g.fill();
    }
    var t=new THREE.CanvasTexture(cv); t.anisotropy=4; return t;
  })();
  var ptM=new THREE.MeshBasicMaterial({map:pt,transparent:true,depthWrite:false});
  addLinear({biome:6,L:60,xs:[0],y:0.1,
    mk:function(){return new THREE.Mesh(new THREE.PlaneGeometry(46,60),ptM);},
    setup:function(it,k2){it.o.rotation.set(-Math.PI/2,0,0); it.o.scale.x=hash2(k2,4)<0.5?1:-1;}});
  /* a far, snowy volcano */
  var mt=mergeParts([part(gCo,0,35,0,120,70,120,0xb2bedb),part(gCo,0,62.5,0,25.7,15,25.7,0xffffff)]);
  addPool({biome:6,n:6,mk:function(){return new THREE.Mesh(mt,matV);},near:250,far:420,dens:0.008,y:-14,noRot:true});
})();

