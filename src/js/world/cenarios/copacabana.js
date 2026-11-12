/* ---------- driving the whole thing ---------- */
var FLASHC=new THREE.Color(0xd8d0ff), tmpSky=[0,1,2,3,4,5].map(function(){return new THREE.Color();});
var dustHex=0xcdb89a, tmpDust=new THREE.Color(), flash=0, flashSec=false, nextBolt=4, thunderQ=0, lastZone=-1, envFront=0, flkT=0;
/* ---------- Copacabana: seafront avenue, wave-pattern promenade, beach, palms, pastel towers, Sugarloaf ---------- */
var copaSea=null;
(function(){
  var i, k;
  /* the famous black-and-white wave pavement */
  var pav=(function(){
    var cv=document.createElement('canvas'); cv.width=128; cv.height=256; var g=cv.getContext('2d'), y, x, q;
    g.fillStyle='#f1ead6'; g.fillRect(0,0,128,256); g.fillStyle='#17171c';
    for(q=0;q<3;q++){
      g.beginPath();
      for(y=0;y<=256;y+=8){x=22+q*42+17*Math.sin(y/256*TAU*2+q*0.9)-10; if(y===0) g.moveTo(x,y); else g.lineTo(x,y);}
      for(y=256;y>=0;y-=8){g.lineTo(22+q*42+17*Math.sin(y/256*TAU*2+q*0.9)+10,y);}
      g.closePath(); g.fill();
    }
    for(q=0;q<900;q++){g.fillStyle='rgba('+(Math.random()<0.5?'255,255,255':'0,0,0')+','+rand(0.05,0.18)+')'; g.fillRect(Math.random()*128,Math.random()*256,rand(2,4),rand(2,4));}
    var t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=8; t.repeat.set(1,4); return t;
  })();
  var pavMat=new THREE.MeshLambertMaterial({map:pav,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  addLinear({biome:8,L:100,xs:[-1,1],y:0.04,
    mk:function(){var m=new THREE.Mesh(new THREE.PlaneGeometry(10,100),pavMat); m.frustumCulled=false; return m;},
    setup:function(it,k2,s){var g=Math.max(0.02,edgeGrow(k2*100)); it.o.rotation.set(-Math.PI/2,0,0); it.o.scale.set(g,1,1); it.o.position.x=(s?1:-1)*(ROAD_HALF+5*g);}});

  /* the sea: turquoise by the sand, deep blue farther out */
  var sg=new THREE.PlaneGeometry(480,100,32,1), sc=new Float32Array(sg.attributes.position.count*3), cs=[[0x0f4fa8],[0x1f8fd0],[0x2ec4c9]].map(function(a){return new THREE.Color(a[0]);}), tc=new THREE.Color();
  for(i=0;i<sg.attributes.position.count;i++){
    var u=(sg.attributes.position.getX(i)+240)/480; /* 0 far, 1 shore */
    var e=Math.pow(u,6); if(e<0.5) tc.copy(cs[0]).lerp(cs[1],e*2); else tc.copy(cs[1]).lerp(cs[2],(e-0.5)*2);
    sc[i*3]=tc.r; sc[i*3+1]=tc.g; sc[i*3+2]=tc.b;
  }
  sg.setAttribute('color',new THREE.BufferAttribute(sc,3));
  var st=(function(){
    var cv=document.createElement('canvas'); cv.width=cv.height=256; var g=cv.getContext('2d'), q;
    g.fillStyle='#d4dcea'; g.fillRect(0,0,256,256);
    for(q=0;q<70;q++){g.strokeStyle='rgba(255,255,255,'+rand(0.35,0.9)+')'; g.lineWidth=rand(1.5,3); var x=Math.random()*256, y=Math.random()*256; g.beginPath(); g.moveTo(x,y); g.quadraticCurveTo(x+rand(8,16),y+rand(-3,3),x+rand(22,46),y); g.stroke();}
    for(q=0;q<40;q++){g.fillStyle='rgba(120,160,215,'+rand(0.1,0.25)+')'; g.beginPath(); g.ellipse(Math.random()*256,Math.random()*256,rand(10,26),rand(3,7),0,0,TAU); g.fill();}
    var t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(60,6); return t;
  })();
  copaSea=new THREE.MeshBasicMaterial({map:st,vertexColors:true});
  addLinear({biome:8,L:100,xs:[-1],y:0.035,
    mk:function(){var m=new THREE.Mesh(sg,copaSea); m.frustumCulled=false; return m;},
    setup:function(it,k2){var g=Math.max(0.02,edgeGrow(k2*100)); it.o.rotation.set(-Math.PI/2,0,0); it.o.scale.set(g,1,1); it.o.position.x=-(54+240*g);}});
  addLinear({biome:8,L:100,xs:[-1],y:0.06,
    mk:function(){var m=new THREE.Mesh(new THREE.PlaneGeometry(9,100),foamMat); m.frustumCulled=false; return m;},
    setup:function(it,k2){var g=Math.max(0.02,edgeGrow(k2*100)); it.o.rotation.set(-Math.PI/2,0,Math.PI); it.o.scale.set(g,1,1); it.o.position.x=-54;}});

  /* palms */
  function palm(H,lean){
    var p=[], tc2=[0x8a6a4a,0x7a5c3e], seg=4, j, top={x:0,y:0};
    for(j=0;j<seg;j++){var h0=H/seg, cx=lean*Math.pow((j+0.5)/seg,2)*H*0.35; p.push(part(gCy,cx,h0*(j+0.5),0,0.3-j*0.025,h0*1.05,0.3-j*0.025,tc2[j%2],0,0,-lean*0.35));}
    var cxT=lean*H*0.35, cy=H, greens=[0x2f8f3a,0x3ba046,0x278a3a];
    for(j=0;j<9;j++){
      var a=j*TAU/9+rand(-0.15,0.15), L=rand(3.4,4.2), dr=rand(0.35,0.85), dx=Math.cos(a), dz=Math.sin(a);
      p.push(part(gB,cxT+dx*L*0.5*Math.cos(dr),cy-L*0.5*Math.sin(dr)+0.2,dz*L*0.5*Math.cos(dr),L,0.05,0.62,greens[j%3],0,-a,-dr));
    }
    p.push(part(gSp0,cxT+0.25,cy-0.35,0.2,0.28,0.28,0.28,0x6a4a2a)); p.push(part(gSp0,cxT-0.2,cy-0.4,-0.2,0.26,0.26,0.26,0x6a4a2a));
    return mergeParts(p);
  }
  var PL=[palm(8,0.25),palm(9.5,-0.2),palm(11,0.3),palm(7,-0.3),palm(10,0.1)];
  addLinear({biome:8,L:15,xs:[-(ROAD_HALF+11.5),ROAD_HALF+9],mk:function(i2){return new THREE.Mesh(PL[i2%5],matV);},
    setup:function(it,k2,s){
      if(hash2(k2,s+20)<0.12){it.o.visible=false; return;}
      it.o.geometry=PL[Math.floor(hash2(k2,s+21)*5)]; it.o.position.z+=(hash2(k2,s+22)-0.5)*6; it.o.position.x+=(hash2(k2,s+23)-0.5)*2.5; it.o.rotation.y=hash2(k2,s+24)*TAU;
      var g=Math.max(0.05,edgeGrow(k2*15)); it.o.scale.set(g,g,g); it.o.scale.multiplyScalar(0.9+hash2(k2,s+25)*0.35);
    }});
  /* beach umbrellas and towels */
  var UC=[0xe63946,0xffc300,0x1d7bd8,0xff7a1f,0xffffff,0x2bb673,0xff4fa0], UM=[];
  for(i=0;i<5;i++){
    var up=[];
    for(k=0;k<4;k++){
      var ux=rand(-5,5), uz=rand(-5,5), uc=UC[(Math.random()*UC.length)|0], lean=rand(-0.12,0.12);
      up.push(part(gCy,ux,1.1,uz,0.05,2.3,0.05,0xdddddd,0,0,lean)); up.push(part(gCo,ux-lean*1.2,2.3,uz,1.5,0.62,1.5,uc,0,0,lean));
      up.push(part(gB,ux+rand(-1,1),0.03,uz+1.5,1.1,0.04,1.9,UC[(Math.random()*UC.length)|0],0,rand(-0.5,0.5),0));
    }
    UM.push(mergeParts(up));
  }
  addLinear({biome:8,L:20,xs:[-1],mk:function(i2){return new THREE.Mesh(UM[i2%5],matV);},
    setup:function(it,k2){
      if(hash2(k2,31)<0.15){it.o.visible=false; return;}
      it.o.geometry=UM[Math.floor(hash2(k2,32)*5)]; it.o.position.x=-(38+hash2(k2,33)*12); it.o.position.z+=(hash2(k2,34)-0.5)*10; it.o.rotation.y=hash2(k2,35)*TAU;
      var g=Math.max(0.05,edgeGrow(k2*20)); it.o.scale.set(1,g,1);
    }});
  /* kiosks on the promenade and lifeguard towers on the sand */
  var KI=[mergeParts([part(gB,0,1.2,0,3.2,2.4,3.2,0xffffff),part(gB,0,2.5,0,4.2,0.25,4.2,0x2a7fb8),part(gB,0,0.9,1.62,2.2,1.1,0.1,0x1d4f7a),part(gB,1.2,3.0,1.2,0.12,1.2,0.12,0xdddddd),part(gCo,1.2,3.5,1.2,1.3,0.5,1.3,0xe63946)]),
          mergeParts([part(gB,0,1.2,0,3.2,2.4,3.2,0xf6efe0),part(gB,0,2.5,0,4.2,0.25,4.2,0xe6a020),part(gB,0,0.9,1.62,2.2,1.1,0.1,0x7a4a1a)])];
  addLinear({biome:8,L:80,zo:17,xs:[-(ROAD_HALF+8)],mk:function(i2){return new THREE.Mesh(KI[i2%2],matV);},setup:function(it,k2){if(hash2(k2,41)<0.25){it.o.visible=false; return;} it.o.geometry=KI[k2&1]; it.o.rotation.y=-Math.PI/2; it.o.scale.setScalar(Math.max(0.05,edgeGrow(k2*80)));}});
  var LG=[0xe84a3a,0xf2c230,0x2a7fb8].map(function(c){var p=[]; [-0.9,0.9].forEach(function(a){[-0.9,0.9].forEach(function(b){p.push(part(gCy,a,1.2,b,0.09,2.4,0.09,0xffffff));});}); p.push(part(gB,0,2.9,0,2.4,1.5,2.4,c)); p.push(part(gB,0,3.85,0,3.0,0.2,3.0,0xffffff)); p.push(part(gB,0,2.9,1.22,1.4,0.7,0.06,0x20303a)); return mergeParts(p);});
  addLinear({biome:8,L:210,zo:60,xs:[-1],mk:function(i2){return new THREE.Mesh(LG[i2%3],matV);},setup:function(it,k2){it.o.geometry=LG[Math.floor(hash2(k2,51)*3)]; it.o.position.x=-(45+hash2(k2,52)*6); it.o.rotation.y=-Math.PI/2; it.o.scale.setScalar(Math.max(0.05,edgeGrow(k2*210)));}});
  /* street lamps */
  var lp=mergeParts([part(gCy,0,4.6,0,0.15,9.2,0.15,0x9aa0a8),part(gB,-1.0,9.1,0,2.1,0.16,0.16,0x9aa0a8),part(gB,-2.0,8.95,0,0.8,0.2,0.5,0xfff2c0)]);
  addLinear({biome:8,L:45,zo:7,xs:[-(ROAD_HALF+1.8),ROAD_HALF+1.8],mk:function(){return new THREE.Mesh(lp,matV);},setup:function(it,k2,s){it.o.scale.x=s?-1:1;}});
  /* pastel apartment towers along the avenue */
  var V=[], pal=[0xf4f1ea,0xe9dcc4,0xdce8ee,0xf3ddc8,0xd8d3c6,0xc9dde6,0xf0e4a8], h, ex, fz, col, pp;
  for(i=0;i<10;i++){
    ex=rand(13,22); fz=rand(18,28); h=rand(28,78); col=new THREE.Color(pal[i%pal.length]); pp=[];
    pp.push(part(facadeGeo(ex,h,fz,3.4,3.6),0,h/2,0,1,1,1,col));
    pp.push(part(gBoxPlain,0,h+0.4,0,ex+0.8,0.8,fz+0.8,col.clone().multiplyScalar(0.8)));
    for(k=0;k<Math.floor(h/10);k++) pp.push(part(gBoxPlain,-ex/2-0.5,5+k*10,0,1.1,0.22,fz*0.94,0xffffff));
    if(i%3===0) pp.push(part(gBoxPlain,rand(-3,3),h+2,rand(-4,4),3.4,3,3.4,0xb8bcc4));
    V.push({g:mergeParts(pp),ex:ex});
  }
  addLinear({biome:8,L:34,xs:[1],mk:function(){return new THREE.Mesh(V[0].g,matBldDay);},
    setup:function(it,k2){
      if(hash2(k2+9,3)<0.1){it.o.visible=false; return;}
      var v=V[Math.floor(hash2(k2,60)*V.length)]; it.o.geometry=v.g; it.o.position.x=ROAD_HALF+16+v.ex/2; it.o.scale.x=1; it.o.scale.y=Math.max(0.05,edgeGrow(k2*34));
    }});
  var far=[];
  for(i=0;i<6;i++){var w2=rand(20,34), hh=rand(80,140); far.push(mergeParts([part(facadeGeo(w2,hh,rand(20,34),3.6,3.8),0,hh/2,0,1,1,1,pal[i%pal.length])]));}
  addLinear({biome:8,L:50,xs:[1],mk:function(i2){return new THREE.Mesh(far[i2%6],matBldDay);},setup:function(it,k2){if(hash2(k2,70)<0.2){it.o.visible=false; return;} it.o.geometry=far[Math.floor(hash2(k2,71)*6)]; it.o.position.x=ROAD_HALF+82+hash2(k2,72)*50; it.o.position.z+=(hash2(k2,73)-0.5)*20; it.o.scale.y=Math.max(0.05,edgeGrow(k2*50));}});
  /* green hills, the Sugarloaf and Christ the Redeemer on its mountain */
  var hl=[];
  for(i=0;i<4;i++) hl.push(mergeParts([part(gSp,0,0,0,rand(55,95),rand(40,75),rand(50,85),[0x3f7a3c,0x4a8a44,0x2f6a38,0x58963f][i])]));
  addPool({biome:8,n:14,mk:function(i2){return new THREE.Mesh(hl[i2%4],matV);},near:340,far:430,dens:0.017,y:-14,noRot:true});
  var sl=mergeParts([part(gSp,0,-20,0,92,52,82,0x3f7a3c),part(gSp,0,12,0,60,105,52,0x7d786c),part(gSp,0,60,0,34,40,30,0x908b7e),part(gSp,3,38,12,50,60,28,0x6a655a)]);
  addLinear({biome:8,L:900,zo:300,xs:[-1],mk:function(){return new THREE.Mesh(sl,matV);},setup:function(it,k2){it.o.position.x=-(300+hash2(k2,80)*70); it.o.position.y=-26; it.o.scale.setScalar(1.3*Math.max(0.05,edgeGrow(k2*900)));}});
  var cr=mergeParts([part(gSp,0,0,0,120,78,104,0x3a7438),part(gSp,10,48,-8,64,40,58,0x4a8244),part(gB,0,78,0,6,5,6,0xd2cbb9),part(gCy,0,88,0,2.2,16,1.7,0xf1f1e9),part(gB,0,95,0,30,2.2,2.6,0xf1f1e9),part(gSp0,0,99,0,2.4,2.8,2.4,0xf1f1e9)]);
  addLinear({biome:8,L:1300,zo:700,xs:[1],mk:function(){return new THREE.Mesh(cr,matV);},setup:function(it,k2){it.o.position.x=ROAD_HALF+300+hash2(k2,81)*60; it.o.position.y=-14; it.o.scale.setScalar(Math.max(0.05,edgeGrow(k2*1300)));}});
})();

