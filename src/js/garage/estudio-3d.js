/* ---------- customization studio: a stylised 3D garage where every change shows on the car at once ---------- */
var studio=false, GX=4000, GZ=0, garageG=null, garA={};
var ST={view:'cats',cat:null,focus:'_',idx:0,ty:0.85,tz:0,fx:null,note:'',noteT:0,rings:null,clk:null,phi:0.65,h:2.2,r:8.2,dPhi:0,dH:0,zoom:1,idle:0,cmt:{},ring:new THREE.Color('#9aa6c0'),emitT:0};
var STCATS=[['paint','Pintura'],['air','Ar dos propulsores'],['trim','Detalhes'],['decal','Adesivos'],['acc','Acessórios']];
var CAMP={paint:{phi:0.8,h:2.5,r:9.4},air:{phi:2.35,h:1.6,r:9.0},trim:{phi:2.5,h:2.8,r:8.8},decal:{phi:1.5708,h:1.7,r:9.0},acc:{phi:-0.7,h:3.2,r:8.8},_:{phi:0.65,h:2.8,r:10.2},
  z_paint:{phi:0.8,h:1.9,r:6.8,ty:0.7},z_trim:{phi:2.5,h:2.0,r:6.8,ty:0.8},z_decal:{phi:1.5708,h:1.4,r:6.8,ty:0.7},z_acc:{phi:-0.7,h:2.9,r:6.6,ty:1.0},
  up_motor:{phi:2.75,h:1.3,r:6.2,ty:0.6,tz:1.8},z_motor:{phi:2.55,h:0.9,r:3.7,ty:0.55,tz:2.0},
  up_tank:{phi:1.45,h:0.9,r:6.4,ty:0.4,tz:0.3},z_tank:{phi:1.5,h:0.45,r:3.6,ty:0.3,tz:0.5},
  up_armor:{phi:1.15,h:1.3,r:6.4,ty:0.65,tz:0},z_armor:{phi:1.05,h:1.0,r:3.9,ty:0.6,tz:-0.2},
  up_magnet:{phi:0.45,h:1.8,r:6.6,ty:0.8,tz:-1.5},z_magnet:{phi:0.35,h:1.4,r:4.0,ty:0.8,tz:-1.7},
  up_clock:{phi:0.95,h:2.1,r:6.2,ty:1.1,tz:0.3},z_clock:{phi:0.8,h:1.9,r:3.8,ty:1.15,tz:0.35}};

function buildGarage(){
  var W=30, D=26, H=9, i, j, x, y;
  var G=new THREE.Group(); G.position.set(GX,0,GZ); G.visible=false;
  function mkc(w,h){var e=document.createElement('canvas'); e.width=w; e.height=h; return e;}
  function mkt(e){var t=new THREE.CanvasTexture(e); t.anisotropy=4; return t;}
  function blob(g,bx,by,rx,ry,rgb,a){g.save(); g.translate(bx,by); g.scale(1,ry/rx); var gr=g.createRadialGradient(0,0,0,0,0,rx); gr.addColorStop(0,'rgba('+rgb+','+a+')'); gr.addColorStop(1,'rgba('+rgb+',0)'); g.fillStyle=gr; g.beginPath(); g.arc(0,0,rx,0,TAU); g.fill(); g.restore();}
  function neon(g,s,nx,ny,font,col,glow){g.save(); g.font=font; g.textAlign='center'; g.textBaseline='middle'; g.lineJoin='round'; g.shadowColor=glow||col; g.shadowBlur=34; g.lineWidth=9; g.strokeStyle=col; g.strokeText(s,nx,ny); g.shadowBlur=14; g.fillStyle='#fff'; g.fillText(s,nx,ny); g.restore();}
  var FNT='"Barlow Condensed","Arial Narrow",Impact,sans-serif';

  /* floor: concrete with joints, oil, tyre marks, a bay outline and a baked pool of light */
  var fe=mkc(1024,1024), fg=fe.getContext('2d');
  fg.fillStyle='#2b2e37'; fg.fillRect(0,0,1024,1024);
  for(i=0;i<9000;i++){fg.fillStyle=(Math.random()<0.5?'rgba(255,255,255,':'rgba(0,0,0,')+rand(0.02,0.07)+')'; fg.fillRect(Math.random()*1024,Math.random()*1024,rand(1,3),rand(1,3));}
  fg.strokeStyle='rgba(0,0,0,.4)'; fg.lineWidth=2;
  for(i=0;i<=8;i++){fg.beginPath(); fg.moveTo(i*128,0); fg.lineTo(i*128,1024); fg.stroke(); fg.beginPath(); fg.moveTo(0,i*128); fg.lineTo(1024,i*128); fg.stroke();}
  for(i=0;i<16;i++) blob(fg,rand(40,980),rand(40,980),rand(24,80),rand(16,60),'0,0,0',rand(0.15,0.35));
  fg.strokeStyle='rgba(0,0,0,.22)'; fg.lineWidth=7;
  for(i=0;i<6;i++){fg.beginPath(); fg.moveTo(rand(0,1024),rand(0,1024)); fg.quadraticCurveTo(rand(0,1024),rand(0,1024),rand(0,1024),rand(0,1024)); fg.stroke();}
  fg.strokeStyle='rgba(255,214,60,.8)'; fg.lineWidth=5; fg.setLineDash([26,18]); fg.strokeRect(262,182,500,660); fg.setLineDash([]);
  blob(fg,512,512,340,390,'255,244,225',0.5);
  var floor=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshBasicMaterial({map:mkt(fe)})); floor.rotation.x=-Math.PI/2; G.add(floor);

  /* walls: brick above, painted steel panels below, with hand-drawn decor baked into each one */
  function wallTex(w,h,kind){
    var e=mkc(w,h), g=e.getContext('2d'), Wm=(kind==='back'||kind==='front')?W:D, s=w/Wm, k, X=function(m){return m*s;};
    g.fillStyle='#5a463f'; g.fillRect(0,0,w,h);
    var bh=Math.round(h/24), bw=Math.round(bh*2.6), row=0, bx;
    for(y=0;y<h;y+=bh,row++) for(bx=-(row%2)*bw/2;bx<w;bx+=bw){g.fillStyle='hsl('+(12+Math.random()*10)+',26%,'+(26+Math.random()*14)+'%)'; g.fillRect(bx+1,y+1,bw-2,bh-2);}
    var wy=h*0.62; g.fillStyle='#2b3550'; g.fillRect(0,wy,w,h-wy);
    g.strokeStyle='rgba(0,0,0,.35)'; g.lineWidth=2; for(bx=0;bx<w;bx+=w/16){g.beginPath(); g.moveTo(bx,wy); g.lineTo(bx,h); g.stroke();}
    g.fillStyle='rgba(255,255,255,.07)'; for(bx=0;bx<w;bx+=w/16) g.fillRect(bx+3,wy+4,4,h-wy-8);
    for(bx=0;bx<w;bx+=26){g.fillStyle=((bx/26)%2)?'#ffd23a':'#14151a'; g.beginPath(); g.moveTo(bx,wy-12); g.lineTo(bx+26,wy-12); g.lineTo(bx+13,wy+4); g.lineTo(bx-13,wy+4); g.closePath(); g.fill();}
    for(k=0;k<30;k++) blob(g,rand(0,w),rand(0,h),rand(30,110),rand(20,70),'0,0,0',rand(0.05,0.16));
    function poster(xm,ym,wm,hm,t){
      var px=X(xm), py=X(ym), pw=X(wm), ph=X(hm), q, r2;
      g.save(); g.translate(px+pw/2,py+ph/2); g.rotate((Math.random()-0.5)*0.05); g.translate(-pw/2,-ph/2);
      g.fillStyle='rgba(0,0,0,.4)'; g.fillRect(5,7,pw,ph);
      if(t===0){
        var gr=g.createLinearGradient(0,0,0,ph); gr.addColorStop(0,'#1a1450'); gr.addColorStop(1,'#d6336c'); g.fillStyle=gr; g.fillRect(0,0,pw,ph);
        g.fillStyle='#fff'; g.font='700 '+Math.round(ph*0.17)+'px '+FNT; g.textAlign='center'; g.fillText('ROCKET',pw/2,ph*0.22);
        g.fillStyle='#ff3b4a'; g.fillRect(pw*0.2,ph*0.55,pw*0.6,ph*0.16); g.fillStyle='#12162a'; g.fillRect(pw*0.34,ph*0.45,pw*0.3,ph*0.12);
        g.fillStyle='#ffb02a'; g.beginPath(); g.moveTo(pw*0.8,ph*0.6); g.lineTo(pw*0.98,ph*0.64); g.lineTo(pw*0.8,ph*0.69); g.fill();
        g.fillStyle='#0b0c10'; g.beginPath(); g.arc(pw*0.32,ph*0.72,ph*0.06,0,TAU); g.arc(pw*0.68,ph*0.72,ph*0.06,0,TAU); g.fill();
      }else if(t===1){
        q=pw/6; for(var a=0;a<6;a++) for(var b=0;b<Math.ceil(ph/q);b++){g.fillStyle=((a+b)%2)?'#f4f6fb':'#14151a'; g.fillRect(a*q,b*q,q+1,q+1);}
        g.fillStyle='#d92b3a'; g.fillRect(0,ph*0.4,pw,ph*0.2); g.fillStyle='#fff'; g.font='700 '+Math.round(ph*0.14)+'px '+FNT; g.textAlign='center'; g.fillText('RACE DAY',pw/2,ph*0.55);
      }else{
        g.fillStyle='#ffd23a'; g.fillRect(0,0,pw,ph); g.fillStyle='#14151a'; boltPath(g,pw/2,ph*0.4,ph*0.55,0); g.fill();
        g.font='700 '+Math.round(ph*0.15)+'px '+FNT; g.textAlign='center'; g.fillText('NITRO',pw/2,ph*0.88);
      }
      g.strokeStyle='#e8e8ee'; g.lineWidth=3; g.strokeRect(0,0,pw,ph);
      g.fillStyle='rgba(230,220,180,.8)'; g.fillRect(pw/2-12,-6,24,12);
      g.restore();
    }
    function rollDoor(xm,ym,wm,hm){
      var dx=X(xm), dy=X(ym), dw=X(wm), dh=X(hm);
      g.fillStyle='#101218'; g.fillRect(dx-10,dy-10,dw+20,dh+10);
      for(var sy=0;sy<dh;sy+=13){var gg=g.createLinearGradient(0,dy+sy,0,dy+sy+13); gg.addColorStop(0,'#aab0bd'); gg.addColorStop(1,'#6d7380'); g.fillStyle=gg; g.fillRect(dx,dy+sy,dw,12);}
      g.fillStyle='rgba(255,214,120,.5)'; g.fillRect(dx,dy+dh-5,dw,5);
      var sh=g.createLinearGradient(0,dy,0,dy+dh*0.4); sh.addColorStop(0,'rgba(0,0,0,.45)'); sh.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=sh; g.fillRect(dx,dy,dw,dh*0.4);
      g.fillStyle='#ffd23a'; g.fillRect(dx-10,dy-10,10,dh+10); g.fillRect(dx+dw,dy-10,10,dh+10);
      g.fillStyle='#14151a'; for(var hy=0;hy<dh;hy+=40){g.fillRect(dx-10,dy+hy+20,10,20); g.fillRect(dx+dw,dy+hy+20,10,20);}
    }
    function shelf(xm,ym,wm,hm){
      var sx=X(xm), sy=X(ym), sw=X(wm), sh=X(hm), lv=3, lh=sh/lv, l, n, bxx, bc=['#b98a52','#d9b06a','#8a6a40','#c0392b','#2a5db0','#e6c34a','#3a7a4a'];
      g.fillStyle='#2b2f3a'; g.fillRect(sx-5,sy,8,sh); g.fillRect(sx+sw-3,sy,8,sh);
      for(l=0;l<lv;l++){
        var by=sy+lh*(l+1); bxx=sx+6;
        while(bxx<sx+sw-24){var bw2=rand(lh*0.35,lh*0.7), bh2=rand(lh*0.4,lh*0.85); g.fillStyle=bc[(Math.random()*bc.length)|0]; g.fillRect(bxx,by-bh2,bw2,bh2); g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(bxx,by-bh2,bw2,3); g.fillStyle='rgba(255,255,255,.18)'; g.fillRect(bxx+bw2*0.3,by-bh2*0.6,bw2*0.4,bh2*0.2); bxx+=bw2+rand(4,12);}
        g.fillStyle='#8a6a40'; g.fillRect(sx-8,by,sw+16,7);
      }
    }
    function peg(xm,ym,wm,hm){
      var px=X(xm), py=X(ym), pw=X(wm), ph=X(hm), q;
      g.fillStyle='#3b3f4a'; g.fillRect(px,py,pw,ph); g.fillStyle='#1d2027'; for(var hx=px+8;hx<px+pw-4;hx+=14) for(var hy=py+8;hy<py+ph-4;hy+=14) g.fillRect(hx,hy,3,3);
      g.strokeStyle='rgba(255,255,255,.55)'; g.fillStyle='rgba(255,255,255,.2)'; g.lineWidth=5; g.lineCap='round';
      for(q=0;q<9;q++){
        var tx=px+pw*(0.08+0.1*q), ty=py+ph*0.2, tl=ph*rand(0.35,0.6);
        g.beginPath(); g.moveTo(tx,ty); g.lineTo(tx+rand(-6,6),ty+tl); g.stroke();
        g.beginPath(); g.arc(tx,ty,rand(7,12),0,TAU); g.fill(); g.stroke();
      }
      g.strokeStyle='#ffd23a'; g.lineWidth=4; g.strokeRect(px,py,pw,ph);
    }
    function clock(xm,ym,rm){var cx=X(xm), cy=X(ym), r=X(rm); g.fillStyle='#e8e8ee'; g.beginPath(); g.arc(cx,cy,r,0,TAU); g.fill(); g.strokeStyle='#14151a'; g.lineWidth=r*0.14; g.stroke(); g.lineWidth=r*0.08; g.beginPath(); g.moveTo(cx,cy); g.lineTo(cx+r*0.5,cy-r*0.3); g.moveTo(cx,cy); g.lineTo(cx-r*0.1,cy-r*0.7); g.stroke();}
    function extinguisher(xm,ym){var ex=X(xm), ey=X(ym); g.fillStyle='#c0272d'; g.fillRect(ex-12,ey,24,X(0.9)); g.fillStyle='#14151a'; g.fillRect(ex-6,ey-12,12,12); g.fillStyle='#f4f6fb'; g.fillRect(ex-12,ey+X(0.3),24,X(0.16));}
    function win(xm,ym,wm,hm){var wx=X(xm), wyy=X(ym), ww=X(wm), wh=X(hm); g.fillStyle='#14151a'; g.fillRect(wx-6,wyy-6,ww+12,wh+12); var gg=g.createLinearGradient(0,wyy,0,wyy+wh); gg.addColorStop(0,'#bfe0ff'); gg.addColorStop(1,'#5a7ab8'); g.fillStyle=gg; g.fillRect(wx,wyy,ww,wh); g.fillStyle='#14151a'; g.fillRect(wx+ww/2-3,wyy,6,wh); g.fillRect(wx,wyy+wh/2-3,ww,6);}
    function tireRack(xm,ym,wm){var rx=X(xm), ry=X(ym), rw=X(wm), rr=X(0.55), cx0; g.fillStyle='#2b2f3a'; g.fillRect(rx-8,ry,rw+16,10); g.fillRect(rx-8,ry+X(1.25),rw+16,10); g.fillRect(rx-8,ry+X(2.5),rw+16,10);
      for(var rowT=0;rowT<3;rowT++) for(cx0=rx+rr;cx0<rx+rw-rr+2;cx0+=rr*2.1){g.fillStyle='#101116'; g.beginPath(); g.arc(cx0,ry+X(1.25)*rowT+X(0.6),rr,0,TAU); g.fill(); g.fillStyle='#8a90a0'; g.beginPath(); g.arc(cx0,ry+X(1.25)*rowT+X(0.6),rr*0.5,0,TAU); g.fill(); g.fillStyle='#1a1b20'; g.beginPath(); g.arc(cx0,ry+X(1.25)*rowT+X(0.6),rr*0.18,0,TAU); g.fill();}}
    if(kind==='back'){
      rollDoor(1.5,2.4,7,6.6); win(2,0.6,2.2,1.3); win(5.2,0.6,2.2,1.3); poster(22.4,2.6,2.2,3.0,0); poster(25.2,3.0,1.8,2.5,2); shelf(22,6.2,7,2.8);
      clock(9.6,1.6,0.55); extinguisher(21.2,5.7);
    }else if(kind==='front'){
      tireRack(4,3.2,9); win(15,1.4,3.2,2.2); win(19,1.4,3.2,2.2); poster(23.5,2.8,2.4,3.2,1); poster(26.5,3.2,2,2.6,0);
      g.fillStyle='rgba(255,210,60,.9)'; g.font='700 '+Math.round(X(0.9))+'px '+FNT; g.textAlign='center'; g.fillText('OFICINA 24H · NITRO · TURBO',X(15),X(7.9));
    }else if(kind==='left'){
      rollDoor(5,2.2,13,6.8); poster(1.2,2.8,2.2,3.0,1); poster(21.6,2.6,2.4,3.2,0); clock(20.2,1.5,0.5); extinguisher(3.8,5.6);
      for(k=0;k<18;k++){g.fillStyle=(k%2)?'#f4f6fb':'#14151a'; g.fillRect(X(5)+k*X(0.72),X(1.0),X(0.72),X(0.5));}
    }else{
      peg(4.2,3.0,7.2,2.8); poster(13.6,2.8,2.2,3.0,2); poster(16.4,2.6,2.4,3.2,0); shelf(19.2,5.4,6,3.2); win(1.2,0.9,2.2,1.5); win(4.4,0.9,2.2,1.5);
      var fh=X(2.0); flagDraw(g,X(11.2),X(2.2),fh);
    }
    var gr2=g.createLinearGradient(0,0,0,h); gr2.addColorStop(0,'rgba(0,0,0,.65)'); gr2.addColorStop(0.3,'rgba(0,0,0,0)'); gr2.addColorStop(0.88,'rgba(0,0,0,0)'); gr2.addColorStop(1,'rgba(0,0,0,.5)'); g.fillStyle=gr2; g.fillRect(0,0,w,h);
    for(k=0;k<5;k++) blob(g,w*(0.1+0.2*k),0,w*0.07,h*0.55,'255,246,225',0.17);
    return mkt(e);
  }
  var wallDefs=[['back',1536,460,0,-D/2,0,0],['front',1536,460,0,D/2,0,Math.PI],['left',1330,460,-W/2,0,0,Math.PI/2],['right',1330,460,W/2,0,0,-Math.PI/2]];
  wallDefs.forEach(function(d){
    var m=new THREE.Mesh(new THREE.PlaneGeometry(d[0]==='back'||d[0]==='front'?W:D,H),new THREE.MeshBasicMaterial({map:wallTex(d[1],d[2],d[0])}));
    m.position.set(d[3],H/2,d[4]||d[5]); m.rotation.y=d[6]; if(d[0]==='left'||d[0]==='right') m.position.z=0; G.add(m);
  });
  var ceil=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshBasicMaterial({color:0x14161d})); ceil.rotation.x=Math.PI/2; ceil.position.y=H; G.add(ceil);

  /* neon signs */
  function signPlane(txtA,txtB,colA,colB,w,h,px,py,pz,ry){
    var e=mkc(1024,Math.round(1024*h/w)), g=e.getContext('2d'), ew=e.width, eh=e.height;
    neon(g,txtA,ew/2,eh*0.38,'italic 700 '+Math.round(eh*0.52)+'px '+FNT,colA,colA);
    if(txtB){
      g.save(); g.strokeStyle=colB; g.shadowColor=colB; g.shadowBlur=26; g.lineWidth=8; var bx0=ew*0.18, bw0=ew*0.64, by0=eh*0.68, bh0=eh*0.27; g.beginPath(); g.moveTo(bx0+30,by0); g.lineTo(bx0+bw0-30,by0); g.quadraticCurveTo(bx0+bw0,by0,bx0+bw0,by0+30); g.lineTo(bx0+bw0,by0+bh0-30); g.quadraticCurveTo(bx0+bw0,by0+bh0,bx0+bw0-30,by0+bh0); g.lineTo(bx0+30,by0+bh0); g.quadraticCurveTo(bx0,by0+bh0,bx0,by0+bh0-30); g.lineTo(bx0,by0+30); g.quadraticCurveTo(bx0,by0,bx0+30,by0); g.stroke(); g.restore();
      neon(g,txtB,ew/2,by0+bh0/2,'700 '+Math.round(bh0*0.62)+'px '+FNT,colB,colB);
    }
    var mat=new THREE.MeshBasicMaterial({map:mkt(e),transparent:true,depthWrite:false}), m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);
    m.position.set(px,py,pz); m.rotation.y=ry; G.add(m);
    var gl=new THREE.Mesh(new THREE.PlaneGeometry(w*1.6,h*1.8),new THREE.MeshBasicMaterial({map:softTex('rgba(255,255,255,.9)','rgba(255,255,255,0)'),color:colB,transparent:true,opacity:0.28,depthWrite:false,blending:THREE.AdditiveBlending}));
    gl.position.set(px,py,pz); gl.rotation.y=ry; gl.translateZ(-0.05); G.add(gl);
    return {m:m,gl:gl};
  }
  var sg1=signPlane('ROCKET','CUSTOMS','#28e1ff','#ff2fd0',11.5,5,0,5.6,-D/2+0.06,0);
  var sg2=signPlane('NITRO',null,'#ff2fd0','#ff2fd0',4.6,1.6,W/2-0.06,6.8,-6,-Math.PI/2);
  var sg3=signPlane('TURBO',null,'#ffd23a','#ffb02a',4.6,1.6,-W/2+0.06,6.9,6,Math.PI/2);
  var sg4=signPlane('OPEN',null,'#6aff9a','#3affc8',3.4,1.3,-4,7.0,D/2-0.06,Math.PI);

  /* solid props: tyres, drums, tool chests, a workbench, shelves, lift posts and cones, all merged into one mesh */
  var PP=[];
  function B(ox,oz,ry,lx,ly,lz,sx,sy,sz,col,geo){var cs=Math.cos(ry), sn=Math.sin(ry); PP.push(part(geo||gB,ox+lx*cs+lz*sn,ly,oz-lx*sn+lz*cs,sx,sy,sz,col,0,ry,0));}
  function tyreStack(tx,tz,n){for(var k=0;k<n;k++){B(tx,tz,0,0,0.14+k*0.27,0,0.55,0.27,0.55,0x14151a,gCy); B(tx,tz,0,0,0.145+k*0.27,0,0.34,0.275,0.34,0x9298a6,gCy);}}
  tyreStack(-13.5,-11.5,5); tyreStack(-12.3,-11.7,4); tyreStack(-13.4,-10.2,3); tyreStack(13.4,11.4,5); tyreStack(12.2,11.6,3); tyreStack(-13.5,11.4,4);
  function drum(dx,dz,col){B(dx,dz,0,0,0.52,0,0.42,1.04,0.42,col,gCy); B(dx,dz,0,0,0.3,0,0.435,0.07,0.435,0x1a1b20,gCy); B(dx,dz,0,0,0.78,0,0.435,0.07,0.435,0x1a1b20,gCy); B(dx,dz,0,0,1.06,0,0.36,0.05,0.36,0x2a2d36,gCy);}
  drum(13.6,-11.6,0xc0392b); drum(12.6,-11.7,0x2a5db0); drum(13.7,-10.5,0xe6b02a); drum(-13.6,5.4,0x2a5db0); drum(-13.4,6.4,0xc0392b);
  function chest(cx,cz,ry){B(cx,cz,ry,0,0.62,0,0.8,1.24,1.7,0xc0272d); B(cx,cz,ry,0,1.27,0,0.86,0.06,1.76,0x20232c); for(var k=0;k<4;k++){B(cx,cz,ry,0.41,0.2+k*0.28,0,0.03,0.2,1.5,0x8f1a22); B(cx,cz,ry,0.44,0.28+k*0.28,0,0.03,0.04,0.7,0xd8dde6);} for(var w2=0;w2<4;w2++) B(cx,cz,ry,0,0.06,0,0.1,0.12,0.1,0x14151a);}
  chest(-14.0,-3.4,0); chest(13.9,3.6,Math.PI);
  /* workbench with a monitor */
  B(13.7,-6.2,0,0,1.0,0,1.1,0.1,5.0,0x8a6a40); B(13.7,-6.2,0,0,0.5,0,1.0,0.08,4.8,0x3a3f4c); B(13.7,-6.2,0,0.1,0.52,-2.3,0.8,1.0,0.08,0x2b2f3a); B(13.7,-6.2,0,0.1,0.52,2.3,0.8,1.0,0.08,0x2b2f3a);
  B(13.7,-6.2,0,0.1,1.2,1.4,0.5,0.28,0.35,0x1b1d24); B(13.7,-6.2,0,0.1,1.08,-1.4,0.4,0.12,0.9,0xc0272d); B(13.7,-6.2,0,0.2,1.12,0.2,0.3,0.14,0.5,0x2a5db0);
  /* steel shelf unit with cartons on the front wall */
  for(i=0;i<2;i++) for(j=0;j<3;j++){var shx=-9+i*0; B(-9,12.3,0,-2.5+j*2.5,1.4,0,0.08,2.8,0.08,0x39404f);} 
  for(i=0;i<4;i++) B(-9,12.3,0,0,0.2+i*0.85,0,5.2,0.06,0.6,0x7a808f);
  var cartons=[0xb98a52,0xd9b06a,0x8a6a40,0xc0392b,0x2a5db0,0xe6c34a];
  for(i=0;i<4;i++) for(j=0;j<5;j++) if(Math.random()<0.8) B(-9,12.3,0,-2.2+j*1.0+rand(-0.1,0.1),0.2+i*0.85+rand(0.18,0.3),rand(-0.05,0.05),rand(0.5,0.85),rand(0.36,0.58),rand(0.35,0.5),cartons[(Math.random()*6)|0]);
  /* lift posts */
  [[-11.6,-7],[11.6,7]].forEach(function(p){B(p[0],p[1],0,0,2.1,0,0.45,4.2,0.45,0xffc83a); B(p[0],p[1],0,0,0.15,0,0.9,0.3,0.9,0x2a2d36); for(var q=0;q<5;q++) B(p[0],p[1],0,0,0.7+q*0.75,0,0.47,0.3,0.47,0x14151a);});
  /* cones and crates */
  [[-10.6,8.4],[10.5,-8.8],[-10.2,-8.6],[10.8,9.4]].forEach(function(p){B(p[0],p[1],0,0,0.34,0,0.28,0.68,0.28,0xff6a1f,gCo); B(p[0],p[1],0,0,0.03,0,0.5,0.06,0.5,0x14151a); B(p[0],p[1],0,0,0.3,0,0.2,0.1,0.2,0xf4f6fb,gCy);});
  B(-12.6,8.2,0,0,0.12,0,1.4,0.16,1.4,0x8a6a40); B(-12.6,8.2,0,0,0.6,0,1.1,0.8,1.1,0xb98a52); B(-12.6,8.2,0,0.1,1.25,0.05,0.8,0.5,0.8,0xd9b06a);
  /* ceiling beams */
  for(i=-2;i<=2;i++) PP.push(part(gB,i*6,H-0.35,0,0.5,0.7,D,0x1e2129));
  for(i=-1;i<=1;i++) PP.push(part(gB,0,H-0.2,i*8,W,0.4,0.4,0x1e2129));
  G.add(new THREE.Mesh(mergeParts(PP),matV));

  /* fluorescent fixtures and the shafts of light they cast on the car */
  var fixM=new THREE.MeshBasicMaterial({color:0xf4f8ff}), beamM=[];
  var fixG=new THREE.BoxGeometry(4.2,0.12,0.5);
  [[-6,-6],[6,-6],[-6,0],[6,0],[-6,6],[6,6]].forEach(function(p,k2){
    var fm=new THREE.Mesh(fixG,fixM); fm.position.set(p[0],H-0.75,p[1]); G.add(fm);
    for(var q=0;q<2;q++){
      var bm=new THREE.Mesh(new THREE.PlaneGeometry(3.0,8.0),new THREE.MeshBasicMaterial({map:BEAM_TEX,color:0xfff0d8,transparent:true,opacity:0.16,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
      bm.position.set(p[0],H-0.8-4.0,p[1]); bm.rotation.z=Math.PI; bm.rotation.y=q*Math.PI/2; G.add(bm); beamM.push(bm);
    }
  });

  /* neon strips running along the foot of the walls */
  var strips=[];
  [[0,-D/2+0.2,W-2,0.12],[0,D/2-0.2,W-2,0.12],[-W/2+0.2,0,0.12,D-2],[W/2-0.2,0,0.12,D-2]].forEach(function(p,k2){
    var sm=new THREE.MeshBasicMaterial({color:0x28e1ff}), m=new THREE.Mesh(new THREE.BoxGeometry(p[2],0.1,p[3]),sm); m.position.set(p[0],0.14,p[1]); G.add(m); strips.push(sm);
    var m2=new THREE.Mesh(new THREE.BoxGeometry(p[2],0.1,p[3]),sm); m2.position.set(p[0],H-0.12,p[1]); G.add(m2);
  });
  var mon=new THREE.Mesh(new THREE.PlaneGeometry(0.7,0.42),new THREE.MeshBasicMaterial({color:0x4affc8})); mon.position.set(13.7-0.1,1.35,-4.8); mon.rotation.y=-Math.PI/2; G.add(mon);

  /* the turntable */
  var tt=new THREE.Group(); G.add(tt);
  var base=new THREE.Mesh(new THREE.CylinderGeometry(4.0,4.15,0.14,48),new THREE.MeshLambertMaterial({color:0x1b1e27})); base.position.y=0.07; tt.add(base);
  var de=mkc(512,512), dg=de.getContext('2d'), dgr=dg.createRadialGradient(256,256,20,256,256,256); dgr.addColorStop(0,'#3a3f52'); dgr.addColorStop(1,'#14161f'); dg.fillStyle=dgr; dg.fillRect(0,0,512,512);
  dg.strokeStyle='rgba(255,255,255,.18)'; dg.lineWidth=2; for(i=60;i<256;i+=48){dg.beginPath(); dg.arc(256,256,i,0,TAU); dg.stroke();}
  for(i=0;i<36;i++){var an=i*TAU/36; dg.strokeStyle=(i%3===0)?'rgba(255,214,60,.8)':'rgba(255,255,255,.2)'; dg.lineWidth=(i%3===0)?5:2; dg.beginPath(); dg.moveTo(256+Math.cos(an)*200,256+Math.sin(an)*200); dg.lineTo(256+Math.cos(an)*244,256+Math.sin(an)*244); dg.stroke();}
  var disc=new THREE.Mesh(new THREE.CircleGeometry(3.95,48),new THREE.MeshBasicMaterial({map:mkt(de)})); disc.rotation.x=-Math.PI/2; disc.position.y=0.145; tt.add(disc);
  var ring=new THREE.Mesh(new THREE.RingGeometry(3.98,4.22,64),new THREE.MeshBasicMaterial({color:0x9aa6c0,side:THREE.DoubleSide,transparent:true,opacity:0.95})); ring.rotation.x=-Math.PI/2; ring.position.y=0.16; G.add(ring);
  var rglow=new THREE.Mesh(new THREE.RingGeometry(4.0,5.6,64),new THREE.MeshBasicMaterial({color:0x9aa6c0,side:THREE.DoubleSide,transparent:true,opacity:0.22,depthWrite:false,blending:THREE.AdditiveBlending})); rglow.rotation.x=-Math.PI/2; rglow.position.y=0.05; G.add(rglow);

  scene.add(G);
  garA.sign=[sg1,sg2,sg3,sg4]; garA.disc=disc; garA.ring=ring; garA.rglow=rglow; garA.strips=strips; garA.beams=beamM; garA.mon=mon;
  garA.upd=function(t,dt){
    var fl=(Math.sin(t*37)>0.985 && Math.random()<0.4)?0.4:1;
    garA.sign.forEach(function(s,k2){var f=(k2===1||k2===3)?(Math.sin(t*3+k2)>0.92?0.45:1):fl; s.m.material.opacity=0.95*f; s.gl.material.opacity=0.28*f;});
    garA.strips.forEach(function(m,k2){m.color.setHSL((t*0.04+k2*0.22)%1,0.95,0.6);});
    garA.beams.forEach(function(b,k2){b.material.opacity=0.15+0.035*Math.sin(t*1.2+k2*1.7);});
    tt.rotation.y+=dt*0.12;
    var kq=Math.min(1,dt*6); garA.ring.material.color.lerp(ST.ring,kq); garA.rglow.material.color.lerp(ST.ring,kq);
    garA.mon.material.color.setHSL(0.45+0.05*Math.sin(t*0.7),0.8,0.55);
  };
  garageG=G;
}

function stOwn(cat,id){return save.own[cat].indexOf(id)>=0;}
function stItems(){return LOOK[ST.cat].items;}
function stRevert(){var ch=false, k; for(k in ST.cmt) if(save.sel[k]!==ST.cmt[k]){save.sel[k]=ST.cmt[k]; ch=true;} if(ch) applyLook();}
function stPreview(cat,id){if(save.sel[cat]===id) return; save.sel[cat]=id; applyLook();}
function stRender(){
  var h='', i;
  $('stCrumb').textContent=ST.view==='cats'?'Garagem':(ST.view==='roul'?'Roleta de itens':(ST.view==='upg'?'Melhorias do carro':LOOK[ST.cat].title));
  if(ST.view==='roul'){$('stList').innerHTML=renderRoulView(); stInfo(); $('stMoney').textContent=money(save.money); return;}
  if(ST.view==='cats'){
    h+='<button class="stRow'+(ST.idx===0?' sel':'')+'" type="button" data-i="0" style="--rc:#ffc24a"><span class="stNm">★ Roleta de itens</span><span class="stRt">ganhar itens</span></button>';
    h+='<button class="stRow'+(ST.idx===1?' sel':'')+'" type="button" data-i="1" style="--rc:#3affc8"><span class="stNm">⚙ Melhorias</span><span class="stRt">motor, tanque…</span></button>';
    STCATS.forEach(function(e,k){
      var cat=e[0], it=lookItem(cat,ST.cmt[cat]);
      h+='<button class="stRow'+(k+2===ST.idx?' sel':'')+'" type="button" data-i="'+(k+2)+'" style="--rc:'+RAR[it.r].col+'"><span class="stNm">'+e[1]+'</span><span class="stRt">'+it.name+'</span></button>';
    });
    h+='<button class="stRow'+(ST.idx===7?' sel':'')+'" type="button" data-i="7"><span class="stNm">‹ Sair da garagem</span></button>';
  }else if(ST.view==='upg'){
    h+='<button class="stRow'+(ST.idx===0?' sel':'')+'" type="button" data-i="0"><span class="stNm">‹ Voltar</span></button>';
    UPG.forEach(function(u,k){
      var lv=up[u.id], mx=u.max||MAXL, max=lv>=mx;
      h+='<button class="stRow'+(k+1===ST.idx?' sel':'')+'" type="button" data-i="'+(k+1)+'" style="--rc:#3affc8"><span class="stNm">'+u.name+' <small style="opacity:.6">nv '+lv+'</small></span><span class="stRt'+(max?' eq':'')+'">'+(max?'Máximo':(save.dev?'Grátis':'$ '+upPrice(u).toLocaleString('pt-BR')))+'</span></button>';
    });
  }else{
    h+='<button class="stRow'+(ST.idx===0?' sel':'')+'" type="button" data-i="0"><span class="stNm">‹ Voltar</span></button>';
    stItems().forEach(function(it,k){
      var own=stOwn(ST.cat,it.id), eq=(ST.cmt[ST.cat]===it.id);
      h+='<button class="stRow'+(k+1===ST.idx?' sel':'')+(own?'':' lock')+'" type="button" data-i="'+(k+1)+'" style="--rc:'+RAR[it.r].col+'"><i class="stSw" style="background:'+swatchCss(it,ST.cat)+'"></i><span class="stNm">'+it.name+'</span><span class="stRt'+(eq?' eq':'')+'">'+(eq?'Em uso':(own?RAR[it.r].n:'Bloqueado'))+'</span></button>';
    });
  }
  var L=$('stList'); L.innerHTML=h;
  var s=L.querySelector('.sel'); if(s&&s.scrollIntoView) s.scrollIntoView({block:'nearest'});
  stInfo();
  $('stMoney').textContent=money(save.money);
}
function stCur(){
  if(ST.view==='roul') return lastWin?lookItem(lastWin.cat,lastWin.id):null;
  return ST.view==='items'&&ST.idx>0?stItems()[ST.idx-1]:null;
}
function stCatOf(){return ST.view==='roul'?(lastWin?lastWin.cat:null):ST.cat;}
function stInfo(){
  var el=$('stInfo'), it=null, cat=null, h='', roul=(ST.view==='roul'), nt=ST.note?'<small style="color:var(--good);margin-top:4px">'+ST.note+'</small>':'';
  if(ST.view==='upg'){
    var u=UPG[ST.idx-1];
    el.style.setProperty('--rc','#3affc8'); ST.ring.set('#3affc8');
    if(!u){el.innerHTML='<b>Melhorias</b><small>Escolha uma melhoria. A câmera mostra a parte do carro que ela melhora.</small>'+nt; return;}
    var lv=up[u.id], mx=u.max||MAXL, max=lv>=mx, pips='', q, pr=upPrice(u);
    for(q=0;q<mx;q++) pips+='<i'+(q<lv?' class="on"':'')+'></i>';
    h='<b>'+u.name+'</b><small>'+u.desc+'</small><div class="pips">'+pips+'</div>'+nt;
    h+=max?'<button class="buy" type="button" disabled>Máximo</button>':'<button class="buy'+(canPay(pr)?'':' no')+'" type="button" data-sa="buyup">Comprar · '+(save.dev?'Grátis':'$ '+pr.toLocaleString('pt-BR'))+'</button>';
    el.innerHTML=h; return;
  }
  if(roul||ST.view==='items'){it=stCur(); cat=stCatOf();}
  else if(ST.idx>=2&&ST.idx<=6){cat=STCATS[ST.idx-2][0]; it=lookItem(cat,ST.cmt[cat]);}
  if(!it){
    var gold=(roul||(ST.view==='cats'&&ST.idx===0));
    el.style.setProperty('--rc',gold?'#ffc24a':'#28e1ff'); ST.ring.set(gold?'#ffc24a':'#28e1ff');
    if(roul) h='<b>Roleta de itens</b><small>Gire para ganhar um item. Ele aparece no carro na hora, só como pré-visualização: equipe se gostar.</small>';
    else if(ST.view==='items') h='<b>Voltar</b><small>Volta para a lista de categorias. O que você não equipou não é salvo.</small>';
    else if(ST.idx===1) h='<b>Melhorias</b><small>Motor, tanque de ar, blindagem, ímã e cronômetro. Cada compra dá um zoom na parte melhorada.</small>';
    else if(ST.idx===0) h='<b>Roleta de itens</b><small>Gire para desbloquear pinturas, adesivos e acessórios. O item sorteado aparece no carro na hora.</small>';
    else if(ST.idx===7) h='<b>Sair</b><small>Volta ao menu.</small>';
    else h='<b>Estúdio</b><small>Escolha uma categoria. Você vê cada mudança no carro na hora.</small>';
    el.innerHTML=h+nt; return;
  }
  var col=RAR[it.r].col, own=stOwn(cat,it.id), eq=(ST.cmt[cat]===it.id);
  el.style.setProperty('--rc',col); ST.ring.set(col);
  h='<b>'+it.name+'</b><span class="pill">'+RAR[it.r].n+'</span><small>'+LOOK[cat].tag+' · '+(ST.view==='cats'?'em uso agora':(eq?'em uso':(roul?'pré-visualização · ainda não equipado':(own?'no seu inventário':'bloqueado · ganhe na roleta'))))+'</small>';
  if(ST.view!=='cats'){
    if(eq) h+='<button class="buy" type="button" disabled>Em uso</button>';
    else if(own) h+='<button class="buy" type="button" data-sa="equip">Equipar</button>';
    else h+='<button class="buy no" type="button" data-sa="roulette">Ir para a roleta</button>';
  }
  el.innerHTML=h+nt;
}
function stNote(t){ST.note=t; ST.noteT=3; stInfo();}
function stFocus(){ST.focus=(ST.view==='items')?ST.cat:(ST.view==='roul'?'_':(ST.view==='upg'?(ST.idx>0?'up_'+UPG[ST.idx-1].id:'_'):(ST.idx>=2&&ST.idx<=6?STCATS[ST.idx-2][0]:'_')));}
function stGoRoul(){stRevert(); ST.view='roul'; ST.cat=null; lastWin=null; lastStrip=null; stFocus(); sfx('tick'); stRender();}
function stSelect(i,act){
  if(spinning) return;
  if(ST.view==='cats'){
    ST.idx=i; stFocus();
    if(act){
      if(i===0){stGoRoul(); return;}
      if(i===1){ST.view='upg'; ST.cat=null; ST.idx=0; stFocus(); sfx('tick'); stRender(); return;}
      if(i>=2&&i<=6){ST.cat=STCATS[i-2][0]; ST.view='items'; var cur=-1, a=stItems(); for(var k=0;k<a.length;k++) if(a[k].id===ST.cmt[ST.cat]) cur=k; ST.idx=cur+1; stFocus(); sfx('tick');}
      else{closeStudio(); return;}
    }
    stRender(); return;
  }
  if(ST.view==='upg'){
    if(i===0){if(act){ST.view='cats'; ST.idx=1; stFocus(); sfx('tick'); stRender(); return;} ST.idx=0; stFocus(); stRender(); return;}
    ST.idx=i; if(!ST.fx) stFocus(); if(act) stBuy(); else{sfx('tick'); stRender();} return;
  }
  if(i===0){
    if(act){stRevert(); ST.idx=STCATS.map(function(e){return e[0];}).indexOf(ST.cat)+2; ST.view='cats'; ST.cat=null; stFocus(); sfx('tick'); stRender(); return;}
    ST.idx=0; stRevert(); stRender(); return;
  }
  var it=stItems()[i-1]; if(!it) return;
  ST.idx=i; stPreview(ST.cat,it.id);
  if(act) stEquip();
  else{sfx('tick'); stRender();}
}
function stBuy(){
  var u=UPG[ST.idx-1]; if(!u) return;
  var pr=upPrice(u);
  if(up[u.id]>=(u.max||MAXL)){stNote('Já está no máximo.'); return;}
  if(!canPay(pr)){stNote('Dinheiro insuficiente. Jogue mais corridas.'); sfx('hit'); return;}
  pay(pr); up[u.id]++; persist(); applyUpgrades(); sfx('pickup'); sfx('bonus');
  ST.fx={id:u.id,t:0}; ST.focus='z_'+u.id; ST.idle=0; ST.dPhi=0; ST.dH=0;
  ST.note=u.name+' nível '+up[u.id]+'!'; ST.noteT=3;
  stRender();
}
function stEquip(){
  var it=stCur(), cat=stCatOf(); if(!it||!cat) return;
  if(!stOwn(cat,it.id)){stNote('Bloqueado: ganhe na roleta.'); sfx('hit'); return;}
  var oldId=ST.cmt[cat]; ST.cmt[cat]=it.id; save.sel[cat]=it.id; persist(); sfx('pickup');
  var kind=(cat==='paint'||cat==='trim'||cat==='decal')?'spray':(cat==='acc'?'weld':null);
  if(kind==='weld'){applyLook(); if(!accG||!accG.children.length) kind=null;}
  if(kind==='spray'){ST.fx={kind:'spray',cat:cat,t:0,col:(it.c||0xffffff),applied:false,nid:it.id}; if(oldId!==it.id){save.sel[cat]=oldId; applyLook();} ST.focus='z_'+cat; ST.idle=0; ST.dPhi=0; ST.dH=0;}
  else if(kind==='weld'){ST.fx={kind:'weld',cat:cat,t:0}; ST.focus='z_acc'; ST.idle=0; ST.dPhi=0; ST.dH=0; accG.position.y=5; accG.scale.setScalar(1);}
  else applyLook();
  stRender();
}
function openStudio(){
  initAudio(); if(!garageG) buildGarage();
  studio=true; ST.view='cats'; ST.idx=0; ST.cat=null; ST.focus='_'; ST.ty=0.85; ST.tz=0; ST.fx=null; ST.note=''; ST.cmt={}; ST.dPhi=0; ST.dH=0; ST.zoom=1; ST.idle=0;
  for(var k in LOOK) ST.cmt[k]=save.sel[k];
  $('overlay').hidden=true; $('ui').style.visibility='hidden'; $('studio').hidden=false;
  garageG.visible=true; sky.visible=false;
  scene.fog.near=70; scene.fog.far=420; scene.fog.color.set(0x14161f);
  hemi.color.set(0xd8e0ff); hemi.groundColor.set(0x4a3a30); hemi.intensity=0.55;
  sunLight.color.set(0xfff1e0); sunLight.intensity=0.85; sunLight.position.set(-20,40,-30);
  fillLight.color.set(0x7aa8ff); fillLight.intensity=0.6; fillLight.position.set(30,14,28);
  camera.fov=42; camera.updateProjectionMatrix(); camera.up.set(0,1,0);
  var pr=CAMP._; ST.phi=pr.phi; ST.h=pr.h; ST.r=pr.r;
  player.rotation.set(0,0,0); player.position.set(GX,0.145,GZ); player.updateMatrixWorld(true);
  shadow.position.set(GX,0.17,GZ); shadow.scale.set(1.6,3.0,1); shadow.material.opacity=0.6;
  shieldMesh.visible=false;
  stRender(); studioUpdate(0.016);
}
function closeStudio(next){
  stRevert(); studio=false; $('studio').hidden=true; $('ui').style.visibility='';
  garageG.visible=false; sky.visible=true;
  camera.position.set(c.x,c.y*0.65+3.6,c.z+9.5); camera.fov=60; camera.updateProjectionMatrix(); camera.up.set(0,1,0); camera.lookAt(c.x,1.3,c.z-14);
  P.forEach(function(p){p.life=0; p.m.visible=false;});
  garMsg(''); showSheet(state==='over'?'endSheet':'homeSheet');
}


function lookAnim(dt,f){
  var i, ph=(CAMP[ST.focus]||CAMP._).phi, dx=Math.sin(ph), dz=-Math.cos(ph), tx=-dz, tz=dx;
  if(f.kind==='spray'){
    if(!ST.can){
      var g=new THREE.Group(), mb=new THREE.MeshLambertMaterial({color:0xb9c2d4}), mc=new THREE.MeshLambertMaterial({color:0xffffff});
      var bd=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.62,14),mb); g.add(bd);
      var band=new THREE.Mesh(new THREE.CylinderGeometry(0.205,0.205,0.2,14),mc); band.position.y=0.05; g.add(band); g.userData.band=band;
      var dome=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.2,0.1,14),mb); dome.position.y=0.36; g.add(dome);
      var cap=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.12,10),new THREE.MeshLambertMaterial({color:0x1b1d26})); cap.position.y=0.47; g.add(cap);
      var nz=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.05,0.05),new THREE.MeshLambertMaterial({color:0xe9eef8})); nz.position.set(0.1,0.5,0); g.add(nz);
      g.visible=false; garageG.add(g); ST.can=g;
      ST.spr=[]; var sg=new THREE.SphereGeometry(0.07,6,5);
      for(i=0;i<44;i++){var m=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.9,depthWrite:false})); m.visible=false; m.userData={v:new THREE.Vector3(),l:0}; garageG.add(m); ST.spr.push(m);}
      ST.sprI=0;
    }
    var can=ST.can, u=f.t/2.1, vis=f.t<2.1, sw=Math.sin(f.t*3.4)*1.25, cy=1.05+0.12*Math.sin(f.t*2.3);
    can.visible=vis; var sc=Math.min(1,f.t/0.25,Math.max(0,(2.1-f.t)/0.3))*1.0; can.scale.setScalar(Math.max(0.01,sc));
    can.userData.band.material.color.setHex(f.col);
    can.position.set(dx*1.9+tx*sw, cy, dz*1.9+tz*sw);
    can.rotation.set(0,Math.atan2(dz,-dx),0.35+0.12*Math.sin(f.t*40));
    if(f.t>0.25&&f.t<1.85){
      for(i=0;i<3;i++){
        var q=ST.spr[ST.sprI]; ST.sprI=(ST.sprI+1)%ST.spr.length;
        q.position.set(can.position.x-dx*0.35, cy+0.48*0.9, can.position.z-dz*0.35);
        q.userData.v.set(-dx*3.6+(Math.random()-0.5)*1.1, (Math.random()-0.5)*1.1-0.7, -dz*3.6+(Math.random()-0.5)*1.1);
        q.userData.v.x+=tx*(Math.random()-0.5)*1.2; q.userData.v.z+=tz*(Math.random()-0.5)*1.2;
        q.userData.l=0.42; q.material.color.setHex(f.col); q.visible=true;
      }
    }
    ST.spr.forEach(function(q){ if(!q.visible) return; q.userData.l-=dt; if(q.userData.l<=0){q.visible=false; return;} q.position.addScaledVector(q.userData.v,dt); q.material.opacity=Math.min(0.9,q.userData.l*3); q.scale.setScalar(0.7+(0.42-q.userData.l)*3);});
    if(!f.applied&&f.t>0.75){f.applied=true; save.sel[f.cat]=f.nid; applyLook(); sfx('bonus');}
    if(f.t>2.4){ST.can.visible=false; ST.spr.forEach(function(q){q.visible=false;}); if(!f.applied){save.sel[f.cat]=f.nid; applyLook();} ST.fx=null; stFocus();}
  }else if(f.kind==='weld'){
    var t=f.t, y;
    if(t<0.55){var a=t/0.55; y=5*(1-a*a);} else if(t<0.9){var b=(t-0.55)/0.35; y=0.9*(1-Math.pow(2*b-1,2));} else y=0;
    if(t>0.52&&!f.land){f.land=true; sfx('hit');}
    accG.position.y=y; var sq=(t>0.5&&t<0.65)?1-0.18*Math.sin((t-0.5)/0.15*Math.PI):1; accG.scale.set(1+(1-sq)*0.6,sq,1+(1-sq)*0.6);
    if(t>0.95&&t<2.2){
      var wx=GX+(Math.random()-0.5)*0.9, wz=GZ+0.3+(Math.random()-0.5)*0.9;
      if(Math.random()<0.8) burst(wx,1.3,wz,3,Math.random()<0.5?0xffb347:0xfff2b0,5,0.12);
      if(!ST.wl){ST.wl=new THREE.PointLight(0xaee0ff,0,8); garageG.add(ST.wl);}
      ST.wl.position.set(0,1.9,0.3); ST.wl.intensity=(Math.random()<0.6?3.2:0.8);
    } else if(ST.wl) ST.wl.intensity=0;
    if(t>2.4){accG.position.y=0; accG.scale.setScalar(1); if(ST.wl) ST.wl.intensity=0; ST.fx=null; stFocus();}
  }
}
function upgFx(dt,t){
  var f=ST.fx, i, id=f.id; f.t+=dt;
  if(f.kind){lookAnim(dt,f); return;}
  if(id==='motor'&&f.t<1.8){for(i=0;i<REAR.length;i++) emit(REAR[i],BACK,15,0.6,1.1);}
  if(id==='tank'&&f.t<1.8){for(i=0;i<BELLY.length;i++) if(Math.random()<0.8) emit(BELLY[i],DOWN,11,0.5,0.9);}
  if(id==='armor'){
    var a=Math.max(0,1-f.t/2.0); shieldMesh.visible=a>0; shieldMesh.material.opacity=0.42*a*(0.65+0.35*Math.sin(f.t*26)); shieldMesh.scale.setScalar(1+0.12*Math.sin(f.t*9));
    if(f.t<0.12) burst(GX+0.95,0.7,GZ,16,0xffc24a,7,0.5);
  }
  if(id==='magnet'){
    if(!ST.rings){ST.rings=[]; for(i=0;i<3;i++){var rm=new THREE.Mesh(new THREE.RingGeometry(0.9,1.0,48),new THREE.MeshBasicMaterial({color:0xff4ad8,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending})); rm.position.set(0,1.0,-1.5); rm.visible=false; garageG.add(rm); ST.rings.push(rm);}}
    ST.rings.forEach(function(r,k){var u=(f.t-k*0.35)/1.1; r.visible=u>0&&u<1; if(r.visible){r.scale.setScalar(0.5+u*4.5); r.material.opacity=0.9*(1-u); r.lookAt(camera.position);}});
  }
  if(id==='clock'){
    if(!ST.clk){
      var g=new THREE.Group(), cv=document.createElement('canvas'); cv.width=cv.height=256; var cg=cv.getContext('2d');
      cg.fillStyle='#14151a'; cg.beginPath(); cg.arc(128,128,120,0,TAU); cg.fill(); cg.strokeStyle='#ffc83a'; cg.lineWidth=12; cg.stroke();
      cg.fillStyle='#f4f1e6'; for(i=0;i<12;i++){cg.save(); cg.translate(128,128); cg.rotate(i*TAU/12); cg.fillRect(-4,-108,8,i%3?14:26); cg.restore();}
      var face=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.5),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false})); g.add(face);
      var hand=new THREE.Mesh(new THREE.PlaneGeometry(0.1,0.55),new THREE.MeshBasicMaterial({color:0xffc83a,transparent:true,depthWrite:false})); hand.geometry.translate(0,0.25,0); hand.position.z=0.01; g.add(hand); g.userData.hand=hand;
      g.position.set(0,2.5,0.3); g.visible=false; garageG.add(g); ST.clk=g;
    }
    var g2=ST.clk, u2=f.t/2.2; g2.visible=u2<1; if(g2.visible){var sc=u2<0.2?u2/0.2*1.25:(u2<0.3?1.25-(u2-0.2)*2.5:1)*(u2>0.8?(1-u2)/0.2:1); g2.scale.setScalar(Math.max(0.01,sc)); g2.position.y=2.5+0.15*Math.sin(f.t*3); g2.userData.hand.rotation.z=-f.t*9; g2.lookAt(camera.position);}
  }
  if(f.t>2.5){
    ST.fx=null; shieldMesh.visible=false; shieldMesh.scale.setScalar(1); if(ST.clk) ST.clk.visible=false; if(ST.rings) ST.rings.forEach(function(r){r.visible=false;});
    if(ST.view==='upg') stFocus();
  }
}
function studioUpdate(dt){
  shadowFollow(GX,GZ,-20,40,-30); beam.visible=false;
  var t=performance.now()*0.001, pr=CAMP[ST.focus]||CAMP._, k=1-Math.exp(-3.2*dt);
  ST.idle+=dt;
  var dd=Math.atan2(Math.sin(pr.phi-ST.phi),Math.cos(pr.phi-ST.phi)); ST.phi+=dd*k; ST.h+=(pr.h-ST.h)*k; ST.r+=(pr.r-ST.r)*k;
  ST.ty+=((pr.ty===undefined?0.85:pr.ty)-ST.ty)*k; ST.tz+=((pr.tz||0)-ST.tz)*k;
  if(ST.idle>3){var dk=Math.exp(-dt*0.6); ST.dPhi*=dk; ST.dH*=dk;}
  var ph=ST.phi+ST.dPhi+Math.sin(t*0.35)*0.22, rr=ST.r*ST.zoom, hh=ST.h+ST.dH+Math.sin(t*0.5)*0.12;
  camera.position.set(GX+Math.sin(ph)*rr,hh,GZ-Math.cos(ph)*rr);
  var shift=rr*(camera.aspect>1.3?0.2:0.04);
  camera.lookAt(GX+Math.cos(ph)*shift*(ST.zoomed?0.6:1),ST.ty,GZ+ST.tz+Math.sin(ph)*shift*(ST.zoomed?0.6:1));
  sky.position.copy(camera.position);
  player.position.set(GX,0.145,GZ); player.rotation.set(0,0,0);
  if(garA.upd) garA.upd(t,dt);
  if(ST.noteT>0){ST.noteT-=dt; if(ST.noteT<=0){ST.note=''; stInfo();}}
  if(ST.fx) upgFx(dt,t);
  if(ST.focus==='air'){ST.emitT-=dt; while(ST.emitT<=0){ST.emitT+=0.03; REAR.forEach(function(n){emit(n,BACK,10,0.55,0.9);});}}
  updateParticles(dt);
}
(function(){
  var d=$('stDrag'), pts={}, ids;
  d.addEventListener('pointerdown',function(e){try{d.setPointerCapture(e.pointerId);}catch(err){} pts[e.pointerId]=[e.clientX,e.clientY]; ST.idle=0;});
  d.addEventListener('pointermove',function(e){
    var p=pts[e.pointerId]; if(!p) return; ids=Object.keys(pts); ST.idle=0;
    if(ids.length>=2){
      var o=pts[ids[0]==e.pointerId?ids[1]:ids[0]], d0=Math.hypot(p[0]-o[0],p[1]-o[1]), d1=Math.hypot(e.clientX-o[0],e.clientY-o[1]);
      if(d0>1) ST.zoom=clamp(ST.zoom*d0/Math.max(1,d1),0.65,1.05);
    }else{ST.dPhi-=(e.clientX-p[0])*0.008; ST.dH=clamp(ST.dH+(e.clientY-p[1])*0.01,-1.6,2.6);}
    p[0]=e.clientX; p[1]=e.clientY;
  });
  function up(e){delete pts[e.pointerId];}
  d.addEventListener('pointerup',up); d.addEventListener('pointercancel',up);
  d.addEventListener('wheel',function(e){e.preventDefault(); ST.zoom=clamp(ST.zoom*(1+e.deltaY*0.001),0.65,1.05); ST.idle=0;},{passive:false});
  $('stList').addEventListener('click',function(e){
    var sa=e.target.closest?e.target.closest('[data-sa]'):null;
    if(sa){initAudio(); if(sa.getAttribute('data-sa')==='spin') doSpin(); return;}
    var b=e.target.closest?e.target.closest('.stRow'):null; if(!b) return;
    var i=+b.getAttribute('data-i'); initAudio();
    stSelect(i,i===ST.idx||ST.view==='cats');
  });
  $('stInfo').addEventListener('click',function(e){
    var b=e.target.closest?e.target.closest('[data-sa]'):null; if(!b) return;
    if(spinning) return;
    var sa2=b.getAttribute('data-sa'); if(sa2==='equip') stEquip(); else if(sa2==='buyup') stBuy(); else stGoRoul();
  });
  $('stBack').addEventListener('click',function(){stBackKey();});
  function stBackKey(){if(spinning) return; if(ST.view==='items'||ST.view==='upg') stSelect(0,true); else if(ST.view==='roul'){stRevert(); ST.view='cats'; ST.idx=0; stFocus(); stRender();} else closeStudio();}
  window.addEventListener('keydown',function(e){
    if(!studio) return;
    if(ST.view==='roul'){
      if(e.key==='Enter'){e.preventDefault(); if(!spinning) doSpin();}
      else if(e.key==='Escape'||e.key==='Backspace'||e.key==='ArrowLeft'){e.preventDefault(); stBackKey();}
      return;
    }
    if(spinning) return;
    var n=(ST.view==='cats')?8:(ST.view==='upg'?UPG.length+1:stItems().length+1);
    if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){e.preventDefault(); stSelect((ST.idx+1)%n,false);}
    else if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'){e.preventDefault(); stSelect((ST.idx+n-1)%n,false);}
    else if(e.key==='Enter'){e.preventDefault(); if(ST.view==='items'&&ST.idx>0) stEquip(); else if(ST.view==='upg'&&ST.idx>0) stBuy(); else stSelect(ST.idx,true);}
    else if(e.key==='Escape'||e.key==='Backspace'||e.key==='ArrowLeft'){e.preventDefault(); stBackKey();}
    else if(e.key==='ArrowRight'&&ST.view==='cats'&&ST.idx>=1&&ST.idx<=6){e.preventDefault(); stSelect(ST.idx,true);}
  },true);
})();


/* keyboard / hover navigation for the start menu */
(function(){
  var btns=['start','goGarage','goRank','goHow','goConsole','dlGame'].map($), sel=0;
  function vis(){return btns.filter(function(b){return !b.hidden;});}
  function mark(i){var v=vis(); sel=(i+v.length)%v.length; btns.forEach(function(b){b.classList.remove('sel');}); v[sel].classList.add('sel');}
  btns.forEach(function(b){b.addEventListener('mouseenter',function(){mark(vis().indexOf(b));});});
  window.addEventListener('keydown',function(e){
    if(studio||state!=='menu'||$('overlay').hidden||$('homeSheet').hidden) return;
    if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='BUTTON')) return;
    if(e.key==='ArrowDown'){e.preventDefault(); mark(sel+1);}
    else if(e.key==='ArrowUp'){e.preventDefault(); mark(sel-1);}
    else if(e.key==='Enter'){e.preventDefault(); vis()[sel].click();}
  });
})();

function conLog(html){var l=$('cmdLog'); l.innerHTML=html;}
function runCommand(raw){
  var cmd=raw.trim().toUpperCase();
  if(cmd==='/DEV'){
    save.dev=!save.dev; persist(); refreshMoney(); devUi();
    conLog(save.dev?'<b>Modo DEV ativado.</b>\nDinheiro infinito: as compras na garagem não gastam nada.\nDurante a corrida use o botão DEV para escolher o próximo evento.\nDigite /DEV de novo para desativar.':'<b>Modo DEV desativado.</b>\nO dinheiro volta a ser o saldo real ('+money(save.money)+').');
    sfx(save.dev?'bonus':'tick');
  }else if(cmd==='/RESET'){
    var dev=save.dev;
    var kn=save.name,kp=save.pid,ka=save.acct; save=freshSave(dev); save.name=kn; save.pid=kp; save.acct=ka;
    up=save.up; persist(); applyUpgrades(); applyLook(); refreshMoney(); devUi(); conLog('<b>Progresso zerado.</b> Dinheiro, melhorias e visual voltaram ao início.');
  }else if(cmd==='/HELP'||cmd==='/'){
    conLog('Comandos:\n<b>/DEV</b> liga ou desliga dinheiro infinito\n<b>/RESET</b> zera o progresso\n<b>/HELP</b> mostra esta lista');
  }else if(cmd){
    conLog('Comando desconhecido: '+raw.replace(/[<>&]/g,'')+'\nDigite /HELP para ver a lista.');
  }
}
$('cmdIn').addEventListener('keydown',function(e){
  if(e.key==='Enter'){runCommand(this.value); this.value='';}
  else if(e.key==='Escape'){this.blur(); showSheet('homeSheet');}
  e.stopPropagation();
});
window.addEventListener('keydown',function(e){
  if(e.target && e.target.tagName==='INPUT') return;
  if(e.key==='/' && (state==='menu'||state==='over') && !$('overlay').hidden){e.preventDefault(); showSheet('consoleSheet'); $('cmdIn').value='/';}
});
$('goGarage').addEventListener('click',function(){this.blur(); initAudio(); garMsg(''); showSheet('garageSheet');});
$('endGarage').addEventListener('click',function(){this.blur(); initAudio(); garMsg(''); showSheet('garageSheet');});

