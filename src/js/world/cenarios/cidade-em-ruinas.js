/* ---------- post-apocalyptic city: ruined towers, broken overpasses, rusted wrecks, smoke ---------- */
(function(){
  var rtex=(function(){
    var S=256, cell=S/4, cv=document.createElement('canvas'); cv.width=cv.height=S; var g=cv.getContext('2d'), ix, iy, i;
    g.fillStyle='#ffffff'; g.fillRect(0,0,S,S);
    for(iy=0;iy<4;iy++) for(ix=0;ix<4;ix++){
      var x=ix*cell, y=iy*cell, r=Math.random();
      if(r<0.72){g.fillStyle='#2b2723'; g.fillRect(x+12,y+10,cell-24,cell-22); g.fillStyle='rgba(255,255,255,0.18)'; g.fillRect(x+12,y+10,cell-24,3);}
      else if(r<0.88){g.fillStyle='#4a443c'; g.fillRect(x+12,y+10,cell-24,cell-22); g.strokeStyle='#b8aea0'; g.lineWidth=2; g.beginPath(); g.moveTo(x+12,y+10); g.lineTo(x+cell-12,y+cell-12); g.stroke();}
      else{g.fillStyle='#1a1714'; g.fillRect(x+2,y+6,cell-4,cell-10);}
      g.fillStyle='rgba(0,0,0,0.12)'; g.fillRect(x,y+cell-5,cell,5);
    }
    for(i=0;i<30;i++){g.fillStyle='rgba(70,110,40,'+rand(0.25,0.55)+')'; g.fillRect(Math.random()*S,Math.random()*S,rand(2,5),rand(14,60));}
    for(i=0;i<30;i++){g.fillStyle='rgba(40,30,20,'+rand(0.08,0.2)+')'; g.fillRect(Math.random()*S,Math.random()*S,rand(10,40),rand(6,30));}
    var t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=4; return t;
  })();
  var matRuin=new THREE.MeshLambertMaterial({map:rtex,vertexColors:true});
  var tints=[0x9c968c,0x857f78,0xaaa398,0x726e6a,0x9a8f82], V=[], i, k;
  function ruinGeo(ex,fz,h,ti){
    var tn=tints[ti%5], bp=[part(facadeGeo(ex,h,fz,3.4,3.6),0,h/2,0,1,1,1,tn)], sh=h*rand(0.12,0.28);
    bp.push(part(facadeGeo(ex*rand(0.5,0.7),sh,fz*0.7,3.4,3.6),ex*rand(-0.12,0.12),h+sh*0.4,rand(-2,2),1,1,1,tn,rand(-0.08,0.08),0,rand(-0.16,0.16)));
    for(k=0;k<5;k++) bp.push(part(gCy,rand(-ex*0.4,ex*0.4),h+rand(1,4),rand(-fz*0.4,fz*0.4),0.07,rand(3,7),0.07,0x3a2a22,rand(-0.4,0.4),0,rand(-0.4,0.4)));
    for(k=0;k<3;k++) bp.push(part(gSp0,rand(-ex*0.35,ex*0.35),h+rand(0.2,1.2),rand(-fz*0.35,fz*0.35),rand(1.2,2.6),rand(0.6,1.2),rand(1.2,2.6),k%2?0x4f7a2e:0x6a8a34));
    for(k=0;k<3;k++){var vh=h*rand(0.35,0.8); bp.push(part(gB,-ex/2-0.12,vh/2+rand(0,4),rand(-fz*0.4,fz*0.4),0.5,vh,0.7,0x4c7a2e));}
    return mergeParts(bp);
  }
  for(i=0;i<8;i++) V.push({g:ruinGeo(rand(14,24),rand(18,28),rand(26,62),i),ex:0});
  for(i=0;i<8;i++) V[i].ex=14+(i%3)*4;
  addLinear({biome:5,L:34,xs:[-1,1],
    mk:function(){return new THREE.Mesh(V[0].g,matRuin);},
    setup:function(it,k2,s){
      var side=s?1:-1, v=V[Math.floor(hash2(k2,s+3)*V.length)];
      if(hash2(k2+9,s)<0.16){it.o.visible=false; return;}
      it.o.geometry=v.g; it.o.position.x=side*(ROAD_HALF+14+v.ex*0.7); it.o.scale.x=side;
    }});
  var far=[];
  for(i=0;i<8;i++) far.push(ruinGeo(rand(16,30),rand(16,30),rand(70,170),i+2));
  addPool({biome:5,n:28,mk:function(i2){return new THREE.Mesh(far[i2%8],matRuin);},near:95,far:240,dens:0.04,noRot:true});
  /* collapsed overpasses: one end snapped and hanging */
  var ov=[];
  for(i=0;i<3;i++){
    var op=[part(gB,0,11,0,12,1.3,34,0x6e6b66),part(gB,-5.8,12,0,0.4,1.0,34,0x7e7a72),part(gB,5.8,12,0,0.4,1.0,34,0x7e7a72),part(gB,0,5.5,-10,2.4,11,2.4,0x625f5a),part(gB,0,5.5,10,2.4,11,2.4,0x625f5a),
      part(gB,0,8.4,24,12,1.3,16,0x6e6b66,0.62,0,0),part(gB,-5.8,9.2,24,0.4,1.0,16,0x7e7a72,0.62,0,0)];
    for(k=0;k<5;k++) op.push(part(gCy,rand(-5,5),10.5-k*0.4,18.5+rand(-1,1),0.07,rand(3,6),0.07,0x3a2a22,rand(0.9,1.5),0,rand(-0.3,0.3)));
    for(k=0;k<7;k++) op.push(part(gSp0,rand(-5,5),rand(0.4,1.6),rand(26,34),rand(1,2.4),rand(0.7,1.5),rand(1,2.4),k%2?0x6a665e:0x857f76));
    ov.push(mergeParts(op));
  }
  addPool({biome:5,n:12,mk:function(i2){return new THREE.Mesh(ov[i2%3],matV);},near:34,far:78,dens:0.016,noRot:true,setup:function(it,side){it.o.rotation.y=Math.random()<0.5?0:Math.PI;}});
  /* rusted wrecks */
  var wr=[], rc=[0x8a4a2a,0x6a5a4a,0x7a3a2a,0x5a6a6a];
  for(i=0;i<4;i++){
    var wp=[part(gB,0,0.7,0,2.0,0.9,4.2,rc[i]),part(gB,0,1.45,-0.2,1.7,0.7,2.2,new THREE.Color(rc[i]).multiplyScalar(0.55))];
    [[-1,-1.4],[1,-1.4],[-1,1.4],[1,1.4]].forEach(function(w){wp.push(part(gCy,w[0]*1.0,0.35,w[1],0.36,0.3,0.36,0x1a1a1a,0,0,Math.PI/2));});
    wr.push(mergeParts(wp));
  }
  wr.push(mergeParts([part(gB,0,1.5,0,2.6,2.2,6.5,0x7a4a30),part(gB,0,3.0,-2.6,2.4,1.6,1.4,0x5a3a28),part(gB,0,1.3,0,2.7,0.15,6.6,0x3a2a22)]));
  addPool({biome:5,n:26,mk:function(i2){return new THREE.Mesh(wr[i2%5],matV);},near:23.5,far:46,dens:0.05,
    setup:function(it){it.o.rotation.z=rand(-0.16,0.16); it.o.rotation.x=rand(-0.06,0.06);}});
  /* rubble, slabs, dead trees and weeds */
  var rb=[];
  for(i=0;i<4;i++) rb.push(mergeParts([part(gSp0,0,0.5,0,rand(1.6,2.8),rand(0.7,1.3),rand(1.6,2.6),0x77726a),part(gSp0,rand(1,2),0.35,rand(-1,1),rand(1,1.8),rand(0.5,0.9),rand(1,1.8),0x8d877d),part(gB,rand(-1.5,1.5),0.6,rand(-1,1),rand(2,3.4),0.35,rand(1.4,2.4),0x6a665e,rand(-0.3,0.3),rand(0,3),rand(-0.4,0.4))]));
  addPool({biome:5,n:60,mk:function(i2){return new THREE.Mesh(rb[i2%4],matV);},near:22.5,far:80,dens:0.16});
  var dt=[];
  for(i=0;i<3;i++){
    var dp=[part(gCy,0,3,0,0.28,6,0.28,0x3a2c22)];
    for(k=0;k<4;k++) dp.push(part(gCy,rand(-1,1),3+k*0.9,rand(-1,1),0.1,rand(2,3.4),0.1,0x3a2c22,rand(-0.9,0.9),rand(0,3),rand(-0.9,0.9)));
    dp.push(part(gSp0,0,0.3,0,1.1,0.5,1.1,0x4f7a2e));
    dt.push(mergeParts(dp));
  }
  addPool({biome:5,n:34,mk:function(i2){return new THREE.Mesh(dt[i2%3],matV);},near:25,far:110,dens:0.06,
    setup:function(it){var s2=rand(0.9,1.5); it.o.scale.set(s2,s2,s2);}});
  var wd=mergeParts([part(gSp0,0,0.3,0,1.2,0.5,1.0,0x4f7a2e),part(gSp0,0.9,0.25,0.3,0.8,0.4,0.7,0x6a8a34),part(gSp0,-0.8,0.25,-0.3,0.9,0.4,0.8,0x5a7a2c)]);
  addPool({biome:5,n:60,mk:function(){return new THREE.Mesh(wd,matV);},near:22,far:70,dens:0.2});
  /* columns of smoke rising far away */
  var smokeM=new THREE.MeshBasicMaterial({map:softTex('rgba(70,58,56,0.55)','rgba(70,58,56,0)'),transparent:true,depthWrite:false});
  addPool({biome:5,n:10,mk:function(){
      var g=new THREE.Group(), s2;
      for(s2=0;s2<6;s2++){var m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),smokeM); m.scale.setScalar(14+s2*9); m.position.set(s2*3,10+s2*22,0); g.add(m);}
      return g;
    },near:70,far:200,dens:0.012,noRot:true,
    setup:function(it){it.ph=rand(0,TAU);},
    anim:function(it,t){for(var q=0;q<it.o.children.length;q++){it.o.children[q].position.x=q*3+Math.sin(t*0.15+it.ph+q*0.6)*(2+q*2.2);}}});
  /* cracked asphalt */
  var ck=(function(){
    var cv=document.createElement('canvas'); cv.width=cv.height=256; var g=cv.getContext('2d'), i2, j;
    g.lineCap='round';
    for(i2=0;i2<7;i2++){
      var x=Math.random()*256, y=Math.random()*256, a=rand(0,TAU);
      g.strokeStyle='rgba(15,12,10,'+rand(0.55,0.85)+')'; g.lineWidth=rand(1.2,3);
      g.beginPath(); g.moveTo(x,y);
      for(j=0;j<7;j++){a+=rand(-0.8,0.8); x+=Math.cos(a)*rand(10,26); y+=Math.sin(a)*rand(10,26); g.lineTo(x,y);}
      g.stroke();
    }
    return new THREE.CanvasTexture(cv);
  })();
  var ckM=new THREE.MeshBasicMaterial({map:ck,transparent:true,depthWrite:false,color:0x8a8078});
  addLinear({biome:5,L:42,xs:[0],y:0.1,
    mk:function(){return new THREE.Mesh(new THREE.PlaneGeometry(40,42),ckM);},
    setup:function(it,k2){it.o.rotation.set(-Math.PI/2,0,(hash2(k2,3)<0.5?0:Math.PI)); it.o.position.x=(hash2(k2,9)-0.5)*3;}});
})();

