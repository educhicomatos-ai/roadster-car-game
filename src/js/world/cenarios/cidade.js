/* ---------- traditional city by day ---------- */
var tlRed=new THREE.MeshBasicMaterial({color:0xff3b3b}), tlYel=new THREE.MeshBasicMaterial({color:0xffc83a}), tlGrn=new THREE.MeshBasicMaterial({color:0x35e07a});
(function(){
  var V=[], awn=[0xb23a3a,0x2f6f4f,0x2a4f9e], cols=[0xe9d9b8,0xc9573f,0xb8c4d8,0xf1e7d0,0xd7b898,0xa9b8a0], i;
  for(i=0;i<10;i++){
    var ex=rand(14,24), fz=rand(18,30), h=rand(22,66), col=new THREE.Color(cols[i%cols.length]), p=[];
    p.push(part(facadeGeo(ex,h,fz,3.4,3.6),0,h/2,0,1,1,1,col));
    p.push(part(gBoxPlain,-ex/2-0.05,2.3,0,0.3,4.6,fz*0.96,0x2b2f3a));
    p.push(part(gBoxPlain,-ex/2-0.9,4.9,0,1.9,0.3,fz*0.8,awn[i%3]));
    p.push(part(gBoxPlain,0,h+0.4,0,ex+0.8,0.8,fz+0.8,col.clone().multiplyScalar(0.72)));
    if(i%2===0){var h2=rand(8,20); p.push(part(facadeGeo(ex*0.6,h2,fz*0.6,3.4,3.6),ex*0.1,h+0.8+h2/2,0,1,1,1,col));}
    p.push(part(gBoxPlain,rand(-3,3),h+1.6,rand(-5,5),3,2,3,0x888c96));
    V.push({g:mergeParts(p),ex:ex});
  }
  addLinear({biome:2,L:36,xs:[-1,1],mk:function(){return new THREE.Mesh(V[0].g,matBldDay);},
    setup:function(it,k,s){
      var side=s?1:-1, v=V[Math.floor(hash2(k,s)*V.length)];
      if(hash2(k+9,s)<0.12){it.o.visible=false; it.gap=true; return;}
      it.o.visible=true; it.o.geometry=v.g; it.o.position.x=side*(ROAD_HALF+14+v.ex/2); it.o.scale.x=side;
    }});
  var far=[];
  for(i=0;i<6;i++){var w=rand(20,34), hh=rand(80,150); far.push(mergeParts([part(facadeGeo(w,hh,rand(20,34),3.6,3.8),0,hh/2,0,1,1,1,[0x9aa6c4,0xa9b4cf,0x8e9ab8][i%3])]));}
  addPool({biome:2,n:22,mk:function(i){return new THREE.Mesh(far[i%6],matBldDay);},near:95,far:210,dens:0.03,noRot:true});
  var lamp=mergeParts([part(gCy,0,4,0,0.15,8,0.15,0x3a3f4a),part(gB,-1.3,8.05,0,2.7,0.16,0.16,0x3a3f4a),part(gB,-2.5,7.85,0,1.0,0.22,0.5,0xfff0b0)]);
  addLinear({biome:2,L:45,zo:11,xs:[-(ROAD_HALF+2.6),ROAD_HALF+2.6],mk:function(){return new THREE.Mesh(lamp,matV);},setup:function(it,k,s){it.o.scale.x=s?-1:1;}});
  var tree=[0x4f9a3a,0x62b04a].map(function(c){return mergeParts([part(gCy,0,1.6,0,0.28,3.2,0.28,0x6b4a2b),part(gSp,0,4.6,0,2.6,2.6,2.6,c),part(gSp,0.8,3.8,0.4,1.7,1.5,1.7,new THREE.Color(c).multiplyScalar(0.82))]);});
  addLinear({biome:2,L:45,zo:-11,xs:[-(ROAD_HALF+4.4),ROAD_HALF+4.4],mk:function(i){var m=new THREE.Mesh(tree[i%2],matV); m.userData.ph=rand(0,TAU); return m;},
    anim:function(it,t){it.o.rotation.z=Math.sin(t*1.4+it.o.userData.ph)*0.02;}});
  var pole=mergeParts([part(gCy,0,3.3,0,0.16,6.6,0.16,0x3a3f4a),part(gB,-2.6,6.3,0,5.2,0.18,0.18,0x3a3f4a),part(gB,-5.0,5.55,0,0.55,1.5,0.5,0x20232c)]);
  addLinear({biome:2,L:90,zo:-17,xs:[-(ROAD_HALF+2.2),ROAD_HALF+2.2],
    mk:function(){
      var g=new THREE.Group(); g.add(new THREE.Mesh(pole,matV));
      [[tlRed,6.05],[tlYel,5.55],[tlGrn,5.05]].forEach(function(l){var b=new THREE.Mesh(gSp0,l[0]); b.scale.setScalar(0.17); b.position.set(-5.0,l[1],-0.27); g.add(b);});
      return g;
    },setup:function(it,k,s){it.o.scale.x=s?-1:1;}});
  function vsign(word){
    var cv=document.createElement('canvas'); cv.width=96; cv.height=384; var g=cv.getContext('2d');
    g.fillStyle='#12303a'; g.fillRect(0,0,96,384); g.strokeStyle='#6ff0d0'; g.lineWidth=6; g.strokeRect(4,4,88,376);
    g.fillStyle='#e8fff8'; g.font='700 52px sans-serif'; g.textAlign='center'; g.textBaseline='middle';
    for(var i=0;i<word.length;i++) g.fillText(word[i],48,(i+0.5)*(384/word.length));
    return new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),side:THREE.DoubleSide});
  }
  var sm=['HOTEL','CAFÉ','CINE','LOJA','PIZZA'].map(vsign);
  addLinear({biome:2,L:72,zo:-30,xs:[-(ROAD_HALF+12.6),ROAD_HALF+12.6],
    mk:function(i){var m=new THREE.Mesh(new THREE.PlaneGeometry(2.6,9),sm[i%5]); m.userData.rot=(i%2?1:-1)*Math.PI/2; return m;},
    setup:function(it,k,s){it.o.position.y=15; it.o.rotation.y=s?-Math.PI/2:Math.PI/2;}});
  var curbG=mergeParts([part(gB,0,0.11,0,7,0.22,100.2,0x9a96a3)]);
  addLinear({biome:2,L:100,xs:[-(ROAD_HALF+4.6),ROAD_HALF+4.6],mk:function(){return new THREE.Mesh(curbG,matV);}});
  var cw=[]; for(i=0;i<16;i++) cw.push(part(gB,-ROAD_HALF+1.4+i*2.6,0,0,1.4,0.02,5,0xf2f2f2));
  var cwMat=new THREE.MeshBasicMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  var cwG=mergeParts(cw);
  addLinear({biome:2,L:180,zo:-60,xs:[0],y:0.02,mk:function(){return new THREE.Mesh(cwG,cwMat);}});
})();

