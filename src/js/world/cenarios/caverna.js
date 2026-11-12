/* ---------- underground cavern: lit stalactites, a glowing turquoise lake, a lantern path and a shaft of daylight ---------- */
var seaMat=null, caveBack=null, caveBeams=[];
(function(){
  var warm=[0x6a4a30,0x8a6038,0xb88650,0xd8a868,0xf0c890,0xffd9a0], i, k, zz;
  function W(a,b){return warm[a+((Math.random()*(b-a+1))|0)];}
  /* lit rock walls with hanging curtains of stalactites */
  var WL=[];
  for(i=0;i<5;i++){
    var wp=[];
    for(zz=-21;zz<=21;zz+=7) wp.push(part(gSp,rand(8,12),0,zz+rand(-2,2),rand(9,14),rand(18,26),rand(8,12),W(0,2)));
    for(zz=-21;zz<=21;zz+=7) wp.push(part(gSp,rand(4,9),rand(20,26),zz+rand(-2,2),rand(8,12),rand(9,13),rand(8,11),W(2,4)));
    for(zz=-21;zz<=21;zz+=8) wp.push(part(gSp,rand(3,8),rand(36,46),zz+rand(-2,2),rand(7,10),rand(8,12),rand(8,11),W(1,3)));
    for(k=0;k<18;k++){var len=rand(7,24), r=rand(0.9,2.8); wp.push(part(gCo,rand(-3,12),rand(34,46)-len*0.5,rand(-21,21),r,len,r,W(3,5),Math.PI,0,0));}
    for(k=0;k<9;k++){var l2=rand(3,12), r2=rand(0.8,2.2); wp.push(part(gCo,rand(-2,5),l2*0.5,rand(-21,21),r2,l2,r2,W(3,5)));}
    if(i%2===0) wp.push(part(gSp,-1.5,3,rand(-8,8),2.4,3.6,3.2,0x1a0f08));
    WL.push(mergeParts(wp));
  }
  addLinear({biome:7,L:44,xs:[-1,1],
    mk:function(i2){return new THREE.Mesh(WL[i2%5],matV);},
    setup:function(it,k2,s){
      var g=Math.max(0.03,edgeGrow(k2*44)), side=s?1:-1;
      it.o.geometry=WL[Math.floor(hash2(k2,s+3)*5)];
      it.o.position.x=side*(s?ROAD_HALF+14:ROAD_HALF+62); it.o.scale.set(side,g,1);
    }});
  /* the great columns and far rock masses that fill the distance */
  var col=[];
  for(i=0;i<4;i++){
    var cp=[], y=0, r=rand(6,9);
    for(k=0;k<7;k++){var h=rand(9,14); cp.push(part(gCy,0,y+h/2,0,r,h,r,W(2,5))); cp.push(part(gCy,0,y+h,0,r*1.12,1.2,r*1.12,W(1,3))); y+=h; r*=0.8;}
    cp.push(part(gCo,0,y+6,0,r*1.1,12,r*1.1,0xf0d8a8));
    for(k=0;k<9;k++){var l3=rand(8,22), r3=rand(1,2.4); cp.push(part(gCo,rand(-14,14),y+rand(40,60)-l3*0.5,rand(-14,14),r3,l3,r3,W(3,5),Math.PI,0,0));}
    col.push(mergeParts(cp));
  }
  addPool({biome:7,n:14,mk:function(i2){return new THREE.Mesh(col[i2%4],matV);},near:70,far:190,dens:0.035,noRot:true,
    setup:function(it,side){var g=Math.max(0.05,edgeGrow(it.z)); var sc=rand(0.8,1.4); it.o.scale.set(sc,sc*g,sc);}});
  var far=[];
  for(i=0;i<3;i++) far.push(mergeParts([part(gSp,0,0,0,rand(30,50),rand(40,60),rand(26,40),W(0,2)),part(gSp,rand(-14,14),rand(25,40),rand(-8,8),rand(18,30),rand(18,28),rand(16,26),W(1,3))]));
  addPool({biome:7,n:16,mk:function(i2){return new THREE.Mesh(far[i2%3],matV);},near:90,far:230,dens:0.06,y:-6,noRot:true,
    setup:function(it){var g=Math.max(0.05,edgeGrow(it.z)); it.o.scale.set(1,g,1);}});
  var ce=[];
  for(i=0;i<3;i++){var ep=[]; for(k=0;k<14;k++){var l4=rand(14,42), r4=rand(1.5,4); ep.push(part(gCo,rand(-16,16),-l4*0.5,rand(-16,16),r4,l4,r4,W(2,5),Math.PI,0,0));} ep.push(part(gSp,0,2,0,20,5,20,W(0,2))); ce.push(mergeParts(ep));}
  addPool({biome:7,n:16,mk:function(i2){return new THREE.Mesh(ce[i2%3],matV);},near:44,far:130,dens:0.06,y:80,noRot:true,
    setup:function(it){var g=Math.max(0.05,edgeGrow(it.z)); it.o.scale.set(1,g,1); it.o.position.y=40+40*g;}});
  /* stalagmites by the road */
  var sm=[];
  for(i=0;i<4;i++){var sp=[]; for(k=0;k<4;k++){var l5=rand(3,11), r5=rand(0.7,1.8); sp.push(part(gCo,rand(-1.6,1.6),l5*0.5,rand(-1.6,1.6),r5,l5,r5,W(2,5)));} sm.push(mergeParts(sp));}
  addPool({biome:7,n:50,mk:function(i2){return new THREE.Mesh(sm[i2%4],matV);},near:ROAD_HALF+8,far:ROAD_HALF+26,dens:0.1,
    setup:function(it){it.o.scale.y=Math.max(0.03,edgeGrow(it.z));}});
  /* turquoise lake on the left */
  var st=(function(){
    var cv=document.createElement('canvas'); cv.width=cv.height=256; var g=cv.getContext('2d'), i2;
    var gr=g.createLinearGradient(0,0,256,0); gr.addColorStop(0,'#0c5a6c'); gr.addColorStop(1,'#1fa4aa'); g.fillStyle=gr; g.fillRect(0,0,256,256);
    for(i2=0;i2<40;i2++){g.fillStyle='rgba(120,230,215,'+rand(0.12,0.3)+')'; g.beginPath(); g.ellipse(Math.random()*256,Math.random()*256,rand(8,26),rand(5,14),rand(0,3),0,TAU); g.fill();}
    for(i2=0;i2<26;i2++){var x=Math.random()*256; g.fillStyle='rgba(255,170,70,'+rand(0.18,0.45)+')'; g.fillRect(x,Math.random()*256,rand(2,5),rand(20,70));}
    for(i2=0;i2<40;i2++){g.strokeStyle='rgba(200,255,250,'+rand(0.15,0.4)+')'; g.lineWidth=1.5; var y=Math.random()*256, x2=Math.random()*256; g.beginPath(); g.moveTo(x2,y); g.quadraticCurveTo(x2+12,y+rand(-3,3),x2+rand(24,50),y); g.stroke();}
    var t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(4,4); return t;
  })();
  seaMat=new THREE.MeshBasicMaterial({map:st,color:0xffffff}); seaMat.color.setScalar(1.7);
  addLinear({biome:7,L:100,xs:[-30],y:0.035,
    mk:function(){return new THREE.Mesh(new THREE.PlaneGeometry(64,100),seaMat);},
    setup:function(it,k2){var g=Math.max(0.02,edgeGrow(k2*100)); it.o.rotation.set(-Math.PI/2,0,0); it.o.scale.set(g,1,1); it.o.position.x=-(ROAD_HALF+8+32*g);}});
  var rim=[];
  for(i=0;i<3;i++) rim.push(mergeParts([part(gSp,0,0.5,-5,rand(2,3.4),rand(1.1,2),rand(4,6),W(0,1)),part(gSp,rand(-1,1),0.6,5,rand(2,3.4),rand(1.1,2),rand(4,6),W(0,2)),part(gSp0,rand(-1,1),0.3,0,rand(1.4,2.4),0.8,rand(1.5,2.8),W(0,1))]));
  addLinear({biome:7,L:30,xs:[-(ROAD_HALF+7)],mk:function(i2){return new THREE.Mesh(rim[i2%3],matV);},setup:function(it,k2){if(hash2(k2,8)<0.4){it.o.visible=false; return;} it.o.scale.set(0.55,0.4*Math.max(0.05,edgeGrow(k2*30)),0.8); it.o.position.x-=hash2(k2,2)*2;}});
  /* lantern path on the right */
  var pt=(function(){
    var cv=document.createElement('canvas'); cv.width=128; cv.height=256; var g=cv.getContext('2d'), x, y;
    g.fillStyle='#5a4030'; g.fillRect(0,0,128,256);
    for(y=0;y<256;y+=26) for(x=(y/26%2)*16;x<128;x+=32){g.fillStyle='rgba('+((150+Math.random()*60)|0)+','+((100+Math.random()*40)|0)+',60,0.9)'; g.fillRect(x+2,y+2,28,22);}
    var t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(1,4); return t;
  })();
  var pathM=new THREE.MeshBasicMaterial({map:pt,color:0xffcf9a});
  addLinear({biome:7,L:100,xs:[26.5],y:0.04,
    mk:function(){return new THREE.Mesh(new THREE.PlaneGeometry(7,100),pathM);},
    setup:function(it,k2){var g=Math.max(0.02,edgeGrow(k2*100)); it.o.rotation.set(-Math.PI/2,0,0); it.o.scale.set(g,1,1); it.o.position.x=ROAD_HALF+2+3.5*g;}});
  var glowO=new THREE.MeshBasicMaterial({map:softTex('rgba(255,170,70,0.9)','rgba(255,170,70,0)'),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  var lp=mergeParts([part(gCy,0,0.8,0,0.07,1.6,0.07,0x4a3322),part(gB,0,1.85,0,0.34,0.4,0.34,0xffb040),part(gB,0,2.12,0,0.42,0.08,0.42,0x3a2818),part(gB,0,1.05,4.5,0.06,0.06,9,0x3a2818)]);
  addLinear({biome:7,L:9,xs:[-(ROAD_HALF+3),ROAD_HALF+3],
    mk:function(){var g=new THREE.Group(); g.add(new THREE.Mesh(lp,matVB)); var gl=new THREE.Mesh(new THREE.PlaneGeometry(8,8),glowO); gl.rotation.x=-Math.PI/2; gl.position.y=0.12; g.add(gl); return g;},
    setup:function(it,k2,s){var g=Math.max(0.03,edgeGrow(k2*9)); it.o.scale.set(1,g,1); it.ph=hash2(k2,s)*TAU;},
    anim:function(it,t){it.o.children[1].scale.setScalar(0.85+0.18*Math.sin(t*4.2+it.ph));}});
  addLinear({biome:7,L:12,xs:[ROAD_HALF+10],
    mk:function(){var gl=new THREE.Mesh(new THREE.PlaneGeometry(9,9),glowO); gl.rotation.y=-Math.PI/2; gl.position.y=3; return gl;},
    setup:function(it,k2){it.o.position.y=1.5+hash2(k2,5)*5; it.o.position.x=ROAD_HALF+8+hash2(k2,6)*5; it.o.scale.setScalar(Math.max(0.03,edgeGrow(k2*12)));}});
  /* backdrop that closes the horizon + the shaft of daylight pouring in from the opening above */
  var cv=document.createElement('canvas'); cv.width=1024; cv.height=512; var g=cv.getContext('2d'), j;
  g.fillStyle='#120a06'; g.fillRect(0,0,1024,512);
  for(j=0;j<26;j++){var rg=g.createRadialGradient(Math.random()*1024,300+Math.random()*180,0,0,0,1); }
  for(j=0;j<70;j++){ /* hanging stalactites against the far dark */
    var x0=Math.random()*1024, ln=rand(60,230), wd=rand(10,34), a=rand(0.25,0.7);
    g.fillStyle='rgba('+((180+Math.random()*60)|0)+','+((110+Math.random()*60)|0)+',50,'+a+')'; g.beginPath(); g.moveTo(x0-wd,0); g.lineTo(x0+wd,0); g.lineTo(x0+rand(-6,6),ln); g.closePath(); g.fill();
  }
  for(j=0;j<110;j++){var lx=Math.random()*1024, ly=250+Math.random()*250, lr=rand(5,22); var lg=g.createRadialGradient(lx,ly,0,lx,ly,lr); lg.addColorStop(0,'rgba(255,170,70,'+rand(0.35,0.8)+')'); lg.addColorStop(1,'rgba(255,170,70,0)'); g.fillStyle=lg; g.fillRect(lx-lr,ly-lr,lr*2,lr*2);}
  var og=g.createRadialGradient(512,40,0,512,40,150); og.addColorStop(0,'rgba(230,245,255,1)'); og.addColorStop(0.5,'rgba(150,200,255,0.7)'); og.addColorStop(1,'rgba(100,150,230,0)');
  g.fillStyle=og; g.fillRect(250,0,524,260);
  var wg=g.createRadialGradient(512,500,0,512,500,260); wg.addColorStop(0,'rgba(255,190,110,0.55)'); wg.addColorStop(1,'rgba(255,190,110,0)'); g.fillStyle=wg; g.fillRect(200,240,624,272);
  caveBack=new THREE.Mesh(new THREE.PlaneGeometry(1700,700),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,fog:false,depthWrite:false,opacity:0}));
  caveBack.position.set(0,300,-792); caveBack.renderOrder=-2; caveBack.frustumCulled=false; caveBack.visible=false; sky.add(caveBack);
  [[0,110,0.02],[-70,80,-0.14],[75,90,0.16]].forEach(function(b){
    var m=new THREE.Mesh(new THREE.PlaneGeometry(b[1],760),new THREE.MeshBasicMaterial({map:BEAM_TEX,color:0xa8d4ff,transparent:true,opacity:0,fog:false,depthWrite:false,blending:THREE.AdditiveBlending}));
    m.geometry.translate(0,380,0); m.position.set(b[0],330,-780); m.rotation.z=Math.PI+b[2]; m.renderOrder=-1; m.visible=false; m.frustumCulled=false; m.userData.b=b[2]; sky.add(m); caveBeams.push(m);
  });
})();

