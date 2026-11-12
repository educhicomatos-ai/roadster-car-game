/* ---------- cyberpunk megacity at night: towers, holo billboards, elevated roads, flying cars ---------- */
var NEON=[0xff3fd0,0x35e8ff,0xa86bff];
var neonMats=NEON.map(function(h){return new THREE.MeshBasicMaterial({color:h});});
var neonSigns=[];
(function(){
  var V=[], tints=[0xffffff,0xe8eaff,0xe0f4ff,0xf0e8ff], i, W=0xffffff;
  for(i=0;i<10;i++){
    var ex=rand(14,24), fz=rand(20,30), h=rand(28,72), tn=tints[i%4], bp=[part(facadeGeo(ex,h,fz,3.2,3.4),0,h/2,0,1,1,1,tn)];
    var h2=h*rand(0.22,0.38), h3=(i%2===0)?h2*0.6:0;
    bp.push(part(facadeGeo(ex*0.7,h2,fz*0.7,3.2,3.4),-ex*0.05,h+h2/2,0,1,1,1,tn));
    if(h3>0) bp.push(part(facadeGeo(ex*0.4,h3,fz*0.4,3.2,3.4),ex*0.05,h+h2+h3/2,0,1,1,1,tn));
    var top=h+h2+h3, tp=[
      part(gB,0,h*0.34,0,ex+0.35,0.4,fz+0.35,W),part(gB,0,h*0.68,0,ex+0.35,0.4,fz+0.35,W),part(gB,0,h+0.2,0,ex+0.35,0.4,fz+0.35,W),
      part(gB,-ex/2-0.2,h*0.5,-fz*0.36,0.4,h,0.4,W),part(gB,-ex/2-0.2,h*0.5,fz*0.36,0.4,h,0.4,W),
      part(gB,0,h+h2+0.2,0,ex*0.7+0.3,0.35,fz*0.7+0.3,W),part(gCy,0,top+5,0,0.22,10,0.22,W)
    ];
    V.push({body:mergeParts(bp),trim:mergeParts(tp),ex:ex});
  }
  addLinear({biome:4,L:30,xs:[-1,1],
    mk:function(){var g=new THREE.Group(); g.add(new THREE.Mesh(V[0].body,matBldNight)); g.add(new THREE.Mesh(V[0].trim,neonMats[0])); return g;},
    setup:function(it,k,s){
      var side=s?1:-1, v=V[Math.floor(hash2(k,s+3)*V.length)];
      if(hash2(k+9,s)<0.06){it.o.visible=false; return;}
      it.o.children[0].geometry=v.body; it.o.children[1].geometry=v.trim; it.o.children[1].material=neonMats[Math.floor(hash2(k,s+7)*3)];
      it.o.position.x=side*(ROAD_HALF+14+v.ex/2); it.o.scale.x=side;
    }});
  /* far megatowers: some crowned with a neon saucer, some with a beacon */
  var towers=[];
  for(i=0;i<8;i++){
    var w=rand(18,34), hh=rand(90,190), tpp=[part(gB,0,hh+1,0,w+1.2,2,w+1.2,W)];
    var bpp=[part(facadeGeo(w,hh,rand(18,32),3.6,3.8),0,hh/2,0,1,1,1,tints[i%4])];
    if(i%3===0){bpp.push(part(gCy,0,hh+7,0,w*0.8,2.6,w*0.8,0x2a2a50)); tpp.push(part(gCy,0,hh+7,0,w*0.86,0.6,w*0.86,W)); tpp.push(part(gCy,0,hh+12,0,0.3,14,0.3,W));}
    else if(i%3===1){tpp.push(part(gCy,0,hh+10,0,0.4,18,0.4,W)); tpp.push(part(gSp0,0,hh+20,0,1.6,1.6,1.6,W));}
    towers.push({b:mergeParts(bpp),t:mergeParts(tpp)});
  }
  addPool({biome:4,n:26,mk:function(i){var q=towers[i%8], g=new THREE.Group(); g.add(new THREE.Mesh(q.b,matBldNight)); g.add(new THREE.Mesh(q.t,neonMats[i%3])); return g;},near:95,far:230,dens:0.035,noRot:true});
  /* elevated neon roads running past the towers (far to the sides, never over the road) */
  var hw=mergeParts([part(gB,0,24,0,9,1.3,60,0x24203c),part(gB,-4.4,25,0,0.5,1.0,60,0x38325a),part(gB,4.4,25,0,0.5,1.0,60,0x38325a),part(gB,0,12,-20,2.4,24,2.4,0x2c2848),part(gB,0,12,20,2.4,24,2.4,0x2c2848)]);
  var hwE=mergeParts([part(gB,-4.7,24.4,0,0.28,0.3,60,W),part(gB,4.7,24.4,0,0.28,0.3,60,W),part(gB,0,23.3,0,8.6,0.12,60,W)]);
  addLinear({biome:4,L:60,xs:[-72,72],
    mk:function(){var g=new THREE.Group(); g.add(new THREE.Mesh(hw,matV)); g.add(new THREE.Mesh(hwE,neonMats[1])); return g;},
    setup:function(it,k,s){it.o.children[1].material=neonMats[(k+s)%2?1:0]; it.o.position.x=(s?1:-1)*(66+hash2(k,s+2)*14); it.o.position.y=hash2(k,s+4)*10;}});
  /* little taxis and shops along the sidewalk */
  var shopB=mergeParts([part(gB,0,2.0,0,6,4,9,0x1a1830),part(gB,-3.04,1.7,0,0.1,2.2,7.4,0xffd890),part(gB,0,4.1,0,6.3,0.3,9.3,0x2a2548)]);
  var shopT=mergeParts([part(gB,-3.15,3.7,0,0.3,0.4,8.8,W),part(gB,-3.15,0.25,0,0.3,0.3,8.8,W)]);
  addLinear({biome:4,L:34,zo:9,xs:[-(ROAD_HALF+6),ROAD_HALF+6],
    mk:function(){var g=new THREE.Group(); g.add(new THREE.Mesh(shopB,matVB)); g.add(new THREE.Mesh(shopT,neonMats[0])); return g;},
    setup:function(it,k,s){
      if(hash2(k,s+21)<0.35){it.o.visible=false; return;}
      it.o.scale.x=s?1:-1; it.o.children[1].material=neonMats[Math.floor(hash2(k,s+5)*3)];
    }});
  var lampG=mergeParts([part(gCy,0,4.6,0,0.12,9.2,0.12,0x2a2236),part(gB,-1.1,9.1,0,2.2,0.15,0.2,0x2a2236),part(gSp,-2.0,9.0,0,0.45,0.3,0.45,0xff9ae8)]);
  var glowM=[softTex('rgba(255,90,210,0.85)','rgba(255,90,210,0)'),softTex('rgba(60,230,255,0.8)','rgba(60,230,255,0)')].map(function(t){return new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});});
  addLinear({biome:4,L:26,xs:[-(ROAD_HALF+2.5),ROAD_HALF+2.5],
    mk:function(){
      var g=new THREE.Group(), l=new THREE.Mesh(lampG,matVB); g.add(l);
      var gl=new THREE.Mesh(new THREE.PlaneGeometry(20,20),glowM[0]); gl.rotation.x=-Math.PI/2; gl.position.set(-9,0.06,0); g.add(gl);
      return g;
    },
    setup:function(it,k,s){it.o.scale.x=s?-1:1; it.o.children[1].material=((k+s)&1)?glowM[1]:glowM[0];}});
  /* holographic billboards and blade signs on the building faces */
  function bbMat(word,hex,w,h){
    var cv=document.createElement('canvas'); cv.width=w; cv.height=h; var g=cv.getContext('2d'), col='#'+('000000'+hex.toString(16)).slice(-6);
    var gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#12083e'); gr.addColorStop(1,'#220a4a'); g.fillStyle=gr; g.fillRect(0,0,w,h);
    g.strokeStyle=col; g.shadowColor=col; g.shadowBlur=16; g.lineWidth=5; g.strokeRect(7,7,w-14,h-14);
    var ch=word.split(''), n=ch.length, vert=h>=w, fs=vert?Math.min(w*0.7,(h-30)/n*0.92):Math.min(h*0.62,(w-30)/n*1.05), i2;
    g.font='700 '+fs+'px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.lineWidth=6;
    for(i2=0;i2<n;i2++){
      var px=vert?w/2:(i2+0.5)*(w/n), py=vert?(i2+0.5)*(h/n):h/2+2;
      g.shadowBlur=22; g.strokeStyle=col; g.strokeText(ch[i2],px,py); g.shadowBlur=5; g.fillStyle='#ffffff'; g.fillText(ch[i2],px,py);
    }
    var m=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,side:THREE.DoubleSide}); neonSigns.push(m); return m;
  }
  var BBW=[['電脳',0xff3fd0],['ネオン',0x35e8ff],['酒場',0xffb03a],['寿司',0xff5a7a],['未来',0xa86bff],['RAMEN',0x35e8ff],['24H',0xff3fd0],['HOTEL',0xa86bff],['太天',0xff8a3a],['CLUB',0x35ffb0]];
  var bbP=BBW.map(function(b){return bbMat(b[0],b[1],128,256);}), bbL=BBW.map(function(b){return bbMat(b[0],b[1],256,128);});
  addLinear({biome:4,L:36,zo:-8,xs:[-(ROAD_HALF+13.4),ROAD_HALF+13.4],
    mk:function(){return new THREE.Mesh(new THREE.PlaneGeometry(10,14),bbP[0]);},
    setup:function(it,k,s){
      if(hash2(k,s+31)<0.2){it.o.visible=false; return;}
      it.o.material=bbP[Math.floor(hash2(k,s+13)*bbP.length)]; it.o.position.y=8+hash2(k,s+11)*14; it.o.rotation.y=s?-Math.PI/2:Math.PI/2;
    }});
  addLinear({biome:4,L:52,zo:14,xs:[-(ROAD_HALF+10.8),ROAD_HALF+10.8],
    mk:function(){return new THREE.Mesh(new THREE.PlaneGeometry(10,5),bbL[0]);},
    setup:function(it,k,s){
      if(hash2(k,s+41)<0.25){it.o.visible=false; return;}
      it.o.material=bbL[Math.floor(hash2(k,s+17)*bbL.length)]; it.o.position.y=5+hash2(k,s+19)*10; it.o.rotation.y=s?-Math.PI/2:Math.PI/2;
    }});
  /* flying traffic far above the sidewalks */
  var hv=mergeParts([part(gB,0,0,0,4.2,0.9,1.9,0x1a1a34),part(gB,0,-0.55,0,3.6,0.16,1.4,0xff3fd0),part(gB,2.1,0.1,0.6,0.15,0.25,0.4,0xffffff),part(gB,2.1,0.1,-0.6,0.15,0.25,0.4,0xffffff),part(gB,-2.1,0.1,0.6,0.15,0.25,0.4,0xff2a2a),part(gB,-2.1,0.1,-0.6,0.15,0.25,0.4,0xff2a2a)]);
  addPool({biome:4,n:18,mk:function(){return new THREE.Mesh(hv,matVB);},near:36,far:120,dens:0.03,noRot:true,
    setup:function(it){it.o.position.y=rand(16,64); it.vz=rand(-22,18); it.o.rotation.y=Math.PI/2*(Math.random()<0.5?1:-1);},
    anim:function(it,t,dt){it.o.position.z+=it.vz*dt; it.z=it.o.position.z;}});
})();

