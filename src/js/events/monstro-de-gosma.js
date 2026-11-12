/* ---------- evento: monstro de gosma ---------- */
var slimeV=null, gooBalls=[], gooPuds=[], gooStuck=[];
var gooMat=phEnv({color:0x25b814,emissive:0x0c6a08,specular:0xffffff,shininess:150,transparent:true,opacity:0.94,side:THREE.DoubleSide},0.3);
var gooRim=new THREE.MeshBasicMaterial({color:0x7dff3a,transparent:true,opacity:0.16,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.BackSide});
var gooCore=new THREE.MeshBasicMaterial({color:0x5dff2a,transparent:true,opacity:0.2,depthWrite:false,blending:THREE.AdditiveBlending});
var gooCoatMat=phEnv({color:0x2fc41a,emissive:0x107a0a,specular:0xffffff,shininess:150,transparent:true,opacity:0.74,depthWrite:false},0.35);
var gooDark=new THREE.MeshBasicMaterial({color:0x14540f}), gooEye=new THREE.MeshBasicMaterial({color:0xfff6c0}), gooShine=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.85});
var gooPudMat=phEnv({color:0x2fc41a,emissive:0x148a0c,specular:0xffffff,shininess:150,transparent:true,opacity:0.88,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3,depthWrite:false},0.55);
evMats.warn3=new THREE.MeshBasicMaterial({color:0x5dff3a,transparent:true,opacity:0.7,depthWrite:false,side:THREE.DoubleSide});
var gooSphere=new THREE.SphereGeometry(1,16,12);
var SLIME_PROF=[[1.35,0],[1.3,0.1],[1.12,0.26],[0.92,0.55],[0.7,0.9],[0.42,1.2],[0.16,1.38],[0.0,1.44]];
function slimeR(y){
  for(var i=1;i<SLIME_PROF.length;i++){var a=SLIME_PROF[i-1], b=SLIME_PROF[i]; if(y<=b[1]) return a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);}
  return 0;
}
var slimeGeo=(function(){
  var g=new THREE.LatheGeometry(SLIME_PROF.map(function(p){return new THREE.Vector2(p[0],p[1]);}),32), pa=g.attributes.position;
  for(var i=0;i<pa.count;i++){var y=pa.getY(i); pa.setX(i,pa.getX(i)-0.22*y*y);}
  g.computeVertexNormals(); return g;
})();
function makeSlime(){
  var g=new THREE.Group(), b=new THREE.Group(); g.add(b);
  var gA=slimeGeo.clone(), gB=slimeGeo.clone(), gC=slimeGeo.clone();
  var body=new THREE.Mesh(gA,gooMat); b.add(body);
  var rim=new THREE.Mesh(gC,gooRim); rim.scale.setScalar(1.05); b.add(rim);
  var core=new THREE.Mesh(gB,gooCore); core.scale.set(0.8,0.82,0.8); core.position.y=0.05; b.add(core);
  var tip=new THREE.Mesh(new THREE.ConeGeometry(0.11,0.38,10),gooMat); tip.position.set(-0.47,1.56,0); tip.rotation.z=0.25; b.add(tip);
  function surf(y,a){var r=slimeR(y); return [r*Math.sin(a)-0.22*y*y, y, r*Math.cos(a)];}
  var eyes=[];
  [[-0.06,0.92],[0.36,0.9]].forEach(function(e){
    var r=slimeR(e[1]), z=Math.sqrt(Math.max(0.01,r*r-Math.pow(e[0]+0.22*e[1]*e[1],2)))+0.1;
    var ey=new THREE.Mesh(gooSphere,gooEye); ey.scale.setScalar(0.17); ey.position.set(e[0],e[1],z); b.add(ey);
    var h=mkSprite(texGlow,0xfff0a0,true,0.9); h.scale.set(0.75,0.75,1); h.position.set(e[0],e[1],z+0.08); b.add(h); eyes.push(h);
  });
  var mo=new THREE.Mesh(new THREE.TorusGeometry(0.2,0.02,6,18,Math.PI),gooDark); mo.rotation.z=Math.PI; mo.position.set(0.16,0.7,slimeR(0.7)*1.0+0.09); b.add(mo);
  var drips=[];
  [[0.55,0.5,0.22],[0.3,0.9,0.3],[-0.5,0.7,0.26],[0.95,0.36,0.2],[1.2,0.5,0.17],[-1.1,0.4,0.18]].forEach(function(d){
    var p=surf(d[1],d[0]), dr=new THREE.Mesh(gooSphere,gooMat); dr.scale.set(0.07,d[2],0.07); dr.position.set(p[0]*1.02,p[1]-d[2]*0.4,p[2]*1.02); b.add(dr);
    var tp=new THREE.Mesh(gooSphere,gooMat); tp.scale.setScalar(0.1); tp.position.set(p[0]*1.02,p[1]-d[2]*1.4,p[2]*1.02); b.add(tp);
    drips.push({a:dr,b:tp,h:d[2],y:p[1]-d[2]*0.4,ph:rand(0,6)});
  });
  for(var i=0;i<6;i++){var a=i/6*TAU+0.3, lb=new THREE.Mesh(gooSphere,gooMat); lb.scale.set(0.5,0.24,0.5); lb.position.set(Math.sin(a)*1.25,0.13,Math.cos(a)*1.25); b.add(lb);}
  /* brilhos especulares brancos (como na ilustração) */
  [[-0.75,0.95,0.2,0.1],[-0.3,1.18,0.14,0.07],[1.0,0.7,0.18,0.09],[0.75,0.2,0.2,0.07],[-1.25,0.3,0.14,0.06]].forEach(function(d){
    var p=surf(d[1],d[0]), sh=new THREE.Mesh(gooSphere,gooShine); sh.scale.set(d[2],d[3],0.03);
    sh.position.set(p[0]*1.03,p[1]+0.02,p[2]*1.03); sh.rotation.y=Math.atan2(p[0],p[2]); sh.rotation.x=-Math.atan2(p[1]*0.4,Math.hypot(p[0],p[2])); b.add(sh);
  });
  var tw=[];
  for(i=0;i<7;i++){var a2=rand(0,TAU), y2=rand(0.2,1.2), p2=surf(y2,a2), sp=mkSprite(texGlow,0xe8ffc0,true,0); sp.position.set(p2[0]*1.05,p2[1],p2[2]*1.05); sp.scale.set(0.3,0.3,1); b.add(sp); tw.push({s:sp,ph:rand(0,6),sp:rand(1.5,3)});}
  var dp=new THREE.Mesh(gooSphere,gooMat); dp.scale.set(0.3,0.03,0.17); dp.position.set(-1.95,0.03,0.9); g.add(dp);
  var halo=mkSprite(texGlow,0x7dff3a,true,0.35); halo.scale.set(3.6,2.4,1); halo.position.set(0,0.9,0.2); g.add(halo);
  g.userData={body:b,gA:gA,gB:gB,gC:gC,baseA:gA.attributes.position.array.slice(),drips:drips,tw:tw,eyes:eyes,halo:halo};
  g.scale.setScalar(7);
  return g;
}
function jelly(sm,t){
  var u=sm.userData;
  [u.gA,u.gC,u.gB].forEach(function(g){
    var pa=g.attributes.position, ar=pa.array, base=u.baseA;
    for(var i=0;i<pa.count;i++){
      var bx=base[i*3], by=base[i*3+1], bz=base[i*3+2], ang=Math.atan2(bz,bx);
      var w=1+0.035*Math.sin(t*3.2+by*5+ang*2)+0.02*Math.sin(t*5.1-by*3+ang);
      ar[i*3]=bx*w; ar[i*3+1]=by*(1+0.022*Math.sin(t*2.4+ang*3)); ar[i*3+2]=bz*w;
    }
    pa.needsUpdate=true; g.computeVertexNormals();
  });
  u.drips.forEach(function(d){var k=1+0.25*Math.sin(t*1.6+d.ph); d.a.scale.y=d.h*k; d.b.position.y=d.y-d.h*(0.4+k*0.9);});
  u.tw.forEach(function(w){w.s.material.opacity=Math.max(0,Math.sin(t*w.sp+w.ph))*0.95;});
  u.eyes.forEach(function(e,i){var k=0.9+0.12*Math.sin(t*2.2+i); e.scale.set(0.75*k,0.75*k,1);});
  u.halo.material.opacity=0.2+0.08*Math.sin(t*2);
}
function startSlime(){
  evJoin('slime'); ev.lastSlime=elapsed; bossHits=0;
  var m=makeSlime(); scene.add(m);
  slimeV={m:m,t:0,dur:27,rz:-190,cd:2.4,sq:0,vx:clamp(c.x*0.5,-12,12),tx:0,swT:0,carCd:3.4,cars:[]};
  m.position.set(slimeV.vx,0,c.z+slimeV.rz); m.scale.setScalar(0.01);
  eventIntro('Monstro de gosma','Gosma na pista: você perde a aderência!'); sfx('roar');
}
function gooCoat(o){
  var hw=o.hw-0.95, s=new THREE.Mesh(gooSphere,gooCoatMat); s.scale.set(hw*1.12,0.95,o.L/2*1.06); s.position.y=0.9; o.m.add(s); o.gooShell=s;
  var sh=new THREE.Mesh(gooSphere,gooShine); sh.scale.set(hw*0.45,0.06,o.L*0.18); sh.position.set(-hw*0.3,1.7,-o.L*0.12); o.m.add(sh);
  [[-0.9,1.0],[0.8,0.2],[0.5,-1.0]].forEach(function(d){
    var dr=new THREE.Mesh(gooSphere,gooMat); dr.scale.set(0.09,0.3,0.09); dr.position.set(hw*d[0],0.7,o.L/2*0.6*d[1]); o.m.add(dr);
  });
}
function addPuddle(x,z,r,life){
  if(gooPuds.length>=14){var q=gooPuds.shift(); scene.remove(q.m);}
  var g=new THREE.Group(), y=groundH(x,z)+0.05;
  var m=new THREE.Mesh(gooSphere,gooPudMat); m.scale.set(r,0.05,r*rand(0.8,1.05)); g.add(m);
  for(var i=0;i<4;i++){var s=new THREE.Mesh(gooSphere,gooPudMat); var a=rand(0,TAU); s.scale.set(r*rand(0.2,0.34),0.04,r*rand(0.18,0.3)); s.position.set(Math.sin(a)*r*rand(0.85,1.15),0,Math.cos(a)*r*rand(0.85,1.15)); g.add(s);}
  var hl=new THREE.Mesh(gooSphere,gooShine); hl.scale.set(r*0.34,0.02,r*0.12); hl.position.set(-r*0.3,0.06,-r*0.3); hl.rotation.y=0.5; g.add(hl);
  var gl=mkSprite(texGlow,0x7dff3a,true,0.35); gl.scale.set(r*3.4,r*3.4,1); gl.position.y=0.3; g.add(gl);
  g.position.set(x,y,z); g.rotation.y=rand(0,TAU); scene.add(g);
  gooPuds.push({m:g,x:x,z:z,r:r,life:life,max:life,age:0,hit:false,gl:gl});
}
function applyGoo(d,soft){
  c.goo=Math.max(c.goo,d); c.gv=clamp(c.gv+(Math.random()<0.5?-1:1)*rand(8,12)*(soft?0.55:1),-16,16);
  sfx('splat'); burst(c.x,1,c.z,14,0x8aff4a,10,1.2); burst(c.x,1.4,c.z,8,0xe8ffc0,7,0.8);
  var n=soft?1:3;
  for(var i=0;i<n&&gooStuck.length<5;i++){
    var b=new THREE.Mesh(gooSphere,gooMat); b.scale.set(rand(0.25,0.45),0.12,rand(0.25,0.45)); b.position.set(rand(-0.8,0.8),rand(0.95,1.3),rand(-1.7,1.2)); player.add(b); gooStuck.push(b);
  }
}
function throwGoo(sx,sy,sz,tx,tz){
  var m=new THREE.Group(); var bl=new THREE.Mesh(gooSphere,gooMat); m.add(bl);
  var sh=new THREE.Mesh(gooSphere,gooShine); sh.scale.set(0.3,0.18,0.1); sh.position.set(-0.3,0.4,0.78); sh.rotation.z=0.5; m.add(sh);
  var gl=mkSprite(texGlow,0x7dff3a,true,0.7); gl.scale.set(3.6,3.6,1); m.add(gl);
  m.scale.setScalar(1.1); m.position.set(sx,sy,sz); scene.add(m);
  var r=new THREE.Mesh(warnGeo,evMats.warn3); r.rotation.x=-Math.PI/2; r.position.set(tx,0.07,tz); r.scale.setScalar(2.9); scene.add(r);
  gooBalls.push({m:m,bl:bl,ring:r,t:0,T:1.35,sx:sx,sy:sy,sz:sz,tx:tx,tz:tz});
}
function updateGoo(dt,playing){
  evMats.warn3.opacity=evMats.warn.opacity;
  var i;
  for(i=gooBalls.length-1;i>=0;i--){
    var b=gooBalls[i]; b.t+=dt; var u=Math.min(1,b.t/b.T), gy=groundH(b.tx,b.tz);
    b.m.position.set(b.sx+(b.tx-b.sx)*u, b.sy+(gy-b.sy)*u+9*Math.sin(Math.PI*u), b.sz+(b.tz-b.sz)*u);
    var w=Math.sin(b.t*18)*0.12; b.bl.scale.set(1-w,1+w*1.4,1-w);
    if(Math.random()<0.6) burst(b.m.position.x,b.m.position.y,b.m.position.z,1,0x8aff4a,2.5,0.7);
    if(u>=1){
      scene.remove(b.m); scene.remove(b.ring);
      burst(b.tx,0.6,b.tz,22,0x8aff4a,13,1.3); burst(b.tx,1,b.tz,10,0xe8ffc0,9,0.8); shock(b.tx,0.1,b.tz,0x9dff5a,5.5,0.5); sfx('ploc');
      addPuddle(b.tx,b.tz,2.7,7);
      var dx=c.x-b.tx, dz=c.z-b.tz;
      if(playing && dx*dx+dz*dz<2.9*2.9 && c.y<2.4){ if(hurt('Gosma na pista',1.2,0.88)){bossHits++; applyGoo(3.5,false);} }
      gooBalls.splice(i,1);
    }
  }
  for(i=gooPuds.length-1;i>=0;i--){
    var p=gooPuds[i]; p.life-=dt; p.age+=dt;
    var k=clamp(p.life/1.2,0,1), g0=Math.min(1,p.age/0.28), grow=g0<1?(1-Math.pow(1-g0,3))*(1+0.15*Math.sin(g0*Math.PI)):1;
    p.m.scale.set((0.7+0.3*k)*grow,k*Math.max(0.2,grow),(0.7+0.3*k)*grow); p.gl.material.opacity=0.35*k*(0.85+0.15*Math.sin(p.age*3));
    if(playing && p.life>0.3 && c.y<1.3){
      var ex=c.x-p.x, ez=c.z-p.z;
      if(ex*ex+ez*ez<p.r*p.r*0.85){
        c.goo=Math.max(c.goo,1.4);
        if(!p.hit){p.hit=true; c.gv=clamp(c.gv+(Math.random()<0.5?-1:1)*rand(5,8),-16,16); sfx('ploc'); burst(c.x,0.6,c.z,10,0x8aff4a,8,1);}
      }
    }
    if(p.life<=0 || p.z>c.z+40){scene.remove(p.m); gooPuds.splice(i,1);}
  }
  if(c.goo<=0 && gooStuck.length){
    gooStuck.forEach(function(m){player.remove(m);}); gooStuck=[];
    burst(c.x,1.1,c.z,12,0x8aff4a,8,1.1); if(playing) toast('Aderência recuperada','info');
  }
  gooStuck.forEach(function(m,k){m.scale.y=0.12+0.04*Math.sin(performance.now()*0.004+k);});
  if(c.goo>0 && c.grounded && Math.random()<0.35) burst(c.x+rand(-1,1),0.3,c.z+rand(0,2),1,0x8aff4a,4,0.8);
}
function updateSlime(dt,playing){
  updateGoo(dt,playing);
  if(!slimeV) return;
  var v=slimeV; v.t+=dt; v.cd-=dt; v.carCd-=dt; v.sq*=Math.max(0,1-5*dt);
  var T=v.dur, i, rzT=-82+Math.sin(v.t*0.6)*6;
  if(v.t<2.6) rzT=-82-110*(1-ease(v.t/2.6));
  v.rz+=(rzT-v.rz)*Math.min(1,5*dt);
  v.swT-=dt; if(v.swT<=0){v.swT=rand(2,3.4); v.tx=clamp(c.x*0.6+rand(-10,10),-14,14);}
  v.vx+=(v.tx-v.vx)*Math.min(1,1.3*dt);
  var vz=c.z+v.rz, sc=7;
  if(v.t<1.8){var e=ease(v.t/1.8); sc=7*(e+0.12*Math.sin(e*Math.PI));}
  else if(v.t>T-2.2){sc=7*ease((T-v.t)/2.2);}
  v.m.position.set(v.vx,groundH(v.vx,vz),vz); v.m.scale.setScalar(Math.max(0.01,sc));
  var s=Math.sin(v.t*3), body=v.m.userData.body; jelly(v.m,v.t);
  body.scale.set(1+0.04*s+v.sq*0.14,1-0.05*s-v.sq*0.2,1+0.04*s+v.sq*0.14); body.rotation.z=Math.sin(v.t*1.7)*0.035;
  var mx=v.vx+0.4, my=4.6, mz=vz+5;
  if(playing && v.t>2.6 && v.t<T-2.4 && v.cd<=0){
    v.cd=rand(1.5,2.3)/Math.pow(dif(),0.6); v.sq=0.9; sfx('throw');
    var k=1+(Math.random()<0.15+0.25*diffT()?1:0);
    for(var q=0;q<k;q++){
      var aimed=Math.random()<0.4, tx=aimed?clamp(c.x+rand(-3,3),-ROAD_HALF+1.5,ROAD_HALF-1.5):rand(-ROAD_HALF+1.5,ROAD_HALF-1.5);
      throwGoo(mx,my,mz,tx,c.z-clamp(c.speed*1.35,50,125)-rand(0,25));
    }
  }
  /* engole carros do trânsito e cospe de volta cobertos de gosma */
  if(playing && v.t>3 && v.t<T-6 && v.carCd<=0 && v.cars.length<2){
    var cand=null, bd=1e9;
    cars.forEach(function(o){
      if(o.dead||!o.m) return;
      var dz=o.m.position.z-vz, dx=o.m.position.x-v.vx;
      if(dz>-8 && dz<50 && Math.abs(dx)<24 && Math.abs(dz)<bd){bd=Math.abs(dz); cand=o;}
    });
    if(cand){cand.dead=true; cand.vel=null; v.cars.push({o:cand,s:'in',t:0,sx:cand.m.position.x,sy:cand.m.position.y,sz:cand.m.position.z}); v.carCd=rand(4.4,6.4)/Math.pow(dif(),0.5);}
    else v.carCd=1;
  }
  for(i=v.cars.length-1;i>=0;i--){
    var it=v.cars[i], o=it.o, m=o.m; it.t+=dt;
    if(!m){v.cars.splice(i,1); continue;}
    if(it.s==='in'){
      var u=ease(it.t/0.8);
      m.position.set(it.sx+(mx-it.sx)*u, it.sy+(my-it.sy)*u+Math.sin(Math.PI*u)*3, it.sz+(mz-it.sz)*u);
      m.scale.setScalar(1-0.85*u); m.rotation.z+=dt*8; m.rotation.x+=dt*4;
      if(it.t>=0.8){it.s='chew'; it.t=0; m.visible=false; v.sq=1; sfx('ploc'); burst(mx,my,mz,16,0x6aff3a,9,1.2);}
    }else if(it.s==='chew'){
      v.sq=0.45+0.45*Math.sin(it.t*14);
      if(it.t>=1.0){
        if(!playing){m.visible=true; m.scale.setScalar(1); resetCar(o,c.z-300); v.cars.splice(i,1); continue;}
        m.visible=true; m.rotation.set(0,0,0); gooCoat(o); v.sq=1.2; sfx('throw'); burst(mx,my,mz,16,0x6aff3a,10,1.2);
        it.s='out'; it.t=0; it.T=1.6; it.sx=mx; it.sy=my; it.sz=mz;
        it.tx=clamp(c.x+rand(-2.5,2.5),-ROAD_HALF+2,ROAD_HALF-2); it.tz=c.z-c.speed*it.T-2;
        var r=new THREE.Mesh(warnGeo,evMats.warn3); r.rotation.x=-Math.PI/2; r.position.set(it.tx,0.07,it.tz); r.scale.setScalar(3.4); scene.add(r); it.ring=r;
      }
    }else{
      var uu=Math.min(1,it.t/it.T);
      m.position.set(it.sx+(it.tx-it.sx)*uu, it.sy+(0.2-it.sy)*uu+8*Math.sin(Math.PI*uu), it.sz+(it.tz-it.sz)*uu);
      m.scale.setScalar(Math.min(1,0.15+uu*4)); m.rotation.x-=dt*3; m.rotation.z+=dt*2.2;
      if(Math.random()<0.5) burst(m.position.x,m.position.y,m.position.z,1,0x6aff3a,3,0.8);
      if(uu>=1){
        scene.remove(it.ring); m.rotation.set(0,rand(-0.3,0.3),0); m.position.set(it.tx,0,it.tz);
        burst(it.tx,0.6,it.tz,22,0x6aff3a,13,1.3); shock(it.tx,0.1,it.tz,0x7dff4a,7,0.55); sfx('crash'); shake=Math.max(shake,0.4);
        addPuddle(it.tx,it.tz,3.4,8);
        var ddx=c.x-it.tx, ddz=c.z-it.tz;
        if(playing && Math.abs(ddz)<o.hl+0.8 && Math.abs(ddx)<o.hw+0.6 && c.y<o.clear){
          if(hurt('Carro cuspido pela gosma',3,0.6)){bossHits++; applyGoo(4,false);}
        }
        o.vel=new THREE.Vector3(rand(-3,3),rand(4,6),-rand(10,20)); o.sp=rand(-4,4);
        v.cars.splice(i,1);
      }
    }
  }
  if(v.t>=T){
    addPuddle(v.vx,vz,4.4,9); burst(v.vx,1.5,vz,30,0x6aff3a,14,1.5);
    v.cars.forEach(function(it){if(it.ring) scene.remove(it.ring); if(it.o.m){it.o.m.visible=true; it.o.m.scale.setScalar(1);} resetCar(it.o,c.z-300);});
    scene.remove(v.m); slimeV=null;
    finishMajor(playing,'Nenhuma gosma te pegou','O monstro de gosma derreteu');
  }
}


