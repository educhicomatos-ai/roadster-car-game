/* ---------- impact / animation FX ---------- */
var fx={cine:0,dmg:0,jp:0,jpv:0,jr:0,jrv:0,kick:0,kickS:0,hit:0,prevTL:0,smoke:0}, fxBars=false, elBars=$('bars');
var shocks=[], shockGeo=new THREE.RingGeometry(0.82,1,40), shockI=0;
(function(){
  for(var i=0;i<12;i++){
    var m=new THREE.Mesh(shockGeo,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
    m.rotation.x=-Math.PI/2; m.visible=false; scene.add(m); shocks.push({m:m,t:0,T:1,R:1,on:false});
  }
})();
function shock(x,y,z,col,R,T){
  var q=shocks[shockI]; shockI=(shockI+1)%shocks.length;
  q.on=true; q.t=0; q.T=T||0.55; q.R=R||5; q.m.material.color.setHex(col); q.m.position.set(x,y+0.12,z); q.m.visible=true;
}
var markMatR=new THREE.MeshBasicMaterial({color:0x4aff6a,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
var markMatD=new THREE.MeshBasicMaterial({color:0x4aff6a,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
var marker=new THREE.Group();
(function(){
  var r1=new THREE.Mesh(new THREE.RingGeometry(2.3,2.75,56),markMatR), r2=new THREE.Mesh(new THREE.RingGeometry(1.6,1.75,56),markMatR), d=new THREE.Mesh(new THREE.CircleGeometry(2.3,56),markMatD);
  [r1,r2,d].forEach(function(m){m.rotation.x=-Math.PI/2; marker.add(m);});
  marker.visible=false; marker.renderOrder=2; scene.add(marker);
})();
function hitFreeze(t){fx.hit=Math.max(fx.hit,t);}
function impactFx(mag,col){
  fx.dmg=2.4; fx.jpv=rand(-1.4,1.4)*mag; fx.jrv=rand(-2.6,2.6)*mag; fx.kick=Math.max(fx.kick,0.35*mag);
  hitFreeze(0.07+0.07*mag);
  var gy=Math.max(0,c.y);
  shock(c.x,gy,c.z,col||0xffa040,5+4*mag,0.5); shock(c.x,gy,c.z,0xffffff,3+2*mag,0.3);
  burst(c.x,c.y+0.9,c.z,18,0xffb040,14,0.6); burst(c.x,c.y+0.9,c.z,10,0x3a3f4d,6,1.5);
}
function updateFx(dt,playing){
  fx.jpv+=(-fx.jp*120-fx.jpv*10)*dt; fx.jp+=fx.jpv*dt;
  fx.jrv+=(-fx.jr*120-fx.jrv*10)*dt; fx.jr+=fx.jrv*dt;
  fx.kick=Math.max(0,fx.kick-dt*1.6); fx.kickS+=(fx.kick-fx.kickS)*Math.min(1,6*dt);
  for(var i=0;i<shocks.length;i++){
    var q=shocks[i]; if(!q.on) continue;
    q.t+=dt; var u=q.t/q.T;
    if(u>=1){q.on=false; q.m.visible=false; continue;}
    q.m.scale.setScalar(Math.max(0.1,q.R*(1-Math.pow(1-u,2.2))));
    q.m.material.opacity=0.85*(1-u);
  }
  var mv=fx.cine>0.03;
  marker.visible=mv;
  if(mv){
    var pk=0.5+0.5*Math.sin(performance.now()*0.006), ec=ease(fx.cine);
    marker.position.set(c.x,groundH(c.x,c.z)+0.09,c.z);
    marker.scale.setScalar(1+0.07*pk);
    markMatR.opacity=0.95*ec; markMatD.opacity=(0.16+0.12*pk)*ec;
  }
  var pm=player.userData.paint;
  if(fx.dmg>0){
    fx.dmg-=dt; fx.smoke-=dt;
    if(fx.smoke<=0){
      fx.smoke=0.05;
      burst(c.x+rand(-0.5,0.5),c.y+0.9,c.z-0.8,1,0x4a4e5a,2.5,1.1);
      if(Math.random()<0.3) burst(c.x+rand(-0.6,0.6),c.y+0.8,c.z-0.5,1,0xffb040,6,0.4);
    }
    if(!zapOn){var pu=0.5+0.5*Math.sin(performance.now()*0.03); pm.emissive.setHex((Math.floor(130*pu*Math.min(1,fx.dmg))<<16));}
  }else if(!zapOn && pm.emissive.getHex()!==0 && fx.dmg<=0){pm.emissive.setHex(0);}
  if(playing && timeLeft<=8 && Math.random()<0.12) burst(c.x+rand(-0.5,0.5),c.y+0.9,c.z-0.8,1,0x6a6f7c,2,0.9);
}
/* shield: absorbs exactly one hit (super boost keeps full invincibility) */
function absorb(){
  if(c.turbo>0) return true;
  if(c.shield>0){
    c.shield=0; hitFreeze(0.06);
    shock(c.x,Math.max(0,c.y),c.z,0xffc24a,7,0.5); shock(c.x,Math.max(0,c.y)+0.8,c.z,0xffffff,4,0.3);
    burst(c.x,c.y+0.9,c.z,22,0xffc24a,13,0.9);
    return true;
  }
  return false;
}
function hurt(label,pen,slow){
  if(absorb()){addScore(50); toast('Escudo quebrou! '+label+' bloqueado','good'); sfx('shield'); shake=Math.max(shake,0.4); return false;}
  pen=Math.round(pen*(1-0.08*up.armor)*(1+0.6*diffT())*10)/10; timeLeft-=pen; c.speed*=slow; shake=1; impactFx(0.5+Math.min(1,pen/4),0xffa040);
  var f=$('flash'); f.style.transition='none'; f.style.opacity='0.45'; void f.offsetWidth; f.style.transition=''; f.style.opacity='0';
  toast(label+' −'+String(pen).replace('.',',')+' s','bad'); sfx('hit'); buzz(80);
  return true;
}
function spawnFall(kind,tx,tz,sx,sy,sz,T,o){
  o=o||{};
  var f={kind:kind,tx:tx,tz:tz,sx:sx,sy:sy,sz:sz,T:T,t:0,state:'fall',life:0,m:null,ring:null,
    R:o.R||(kind==='meteor'?3.8:2.2),ty:o.ty||0,arc:o.arc,hold:o.hold||0,hl:o.hl||2.8,hw:o.hw||2.3,clear:o.clear||1.7};
  var g;
  if(kind==='carthrow'){
    g=o.mesh;
  }else{
    g=new THREE.Group();
    if(kind==='meteor'){
      g.add(new THREE.Mesh(meteorGeo,evMats.rock));
      var tail=new THREE.Mesh(tailGeo,evMats.tail), dir=new THREE.Vector3(sx-tx,sy,sz-tz).normalize();
      tail.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir); tail.position.copy(dir).multiplyScalar(7); g.add(tail);
    }else if(kind==='crate'){
      addBox(g,1.9,1.6,1.9,0,0,0,evMats.box); addBox(g,0.5,1.64,1.94,0,0,0,evMats.tape);
    }else if(kind==='bomb'){
      var bm=new THREE.Mesh(new THREE.SphereGeometry(0.9,14,10),lamb(0x23262f)); g.add(bm);
      addBox(g,1.9,0.25,0.5,0,0,0,new THREE.MeshBasicMaterial({color:0xff4a3a}));
    }else{
      g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.0,0),lamb(0x2a7fa8)));
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.45,10,8),new THREE.MeshBasicMaterial({color:0x4ad8ff})));
    }
  }
  g.position.set(sx,sy,sz); scene.add(g); f.m=g;
  var r=new THREE.Mesh(warnGeo,kind==='abomb'?evMats.warn2:evMats.warn); r.rotation.x=-Math.PI/2; r.position.set(tx,0.07,tz); r.scale.setScalar(f.R); scene.add(r); f.ring=r;
  falls.push(f);
}
function removeFall(f){scene.remove(f.m); if(f.ring) scene.remove(f.ring);}
function killNearbyCars(x,z,rad){
  cars.forEach(function(o){
    if(o.dead||!o.m) return;
    var ax=o.m.position.x-x, az=o.m.position.z-z;
    if(Math.sqrt(ax*ax+az*az)<rad){o.dead=true; o.vel=new THREE.Vector3(ax*1.2,rand(7,11),az*1.2-8);}
  });
}
function updateFalls(dt,playing){
  evMats.warn.opacity=0.45+0.3*Math.sin(performance.now()*0.014);
  evMats.warn2.opacity=evMats.warn.opacity;
  for(var i=falls.length-1;i>=0;i--){
    var f=falls[i], k=f.kind;
    if(f.state==='fall'){
      if(f.hold>0){
        f.hold-=dt;
        if(hero) f.m.position.set(hero.px,hero.py+2.4,hero.pz+2.6);
        if(f.hold<=0){f.sx=f.m.position.x; f.sy=f.m.position.y; f.sz=f.m.position.z;}
        continue;
      }
      f.t+=dt;
      var u=Math.min(1,f.t/f.T), pos=f.m.position;
      pos.x=f.sx+(f.tx-f.sx)*u; pos.z=f.sz+(f.tz-f.sz)*u;
      pos.y=(f.arc!==undefined)?f.sy+(f.ty-f.sy)*u+f.arc*Math.sin(Math.PI*u):f.sy*(1-u*u);
      if(k==='crate') f.m.rotation.y+=dt*3;
      else if(k==='meteor') burst(pos.x,pos.y,pos.z,2,0xffb060,2,0.8);
      else{f.m.rotation.x+=dt*4; f.m.rotation.z+=dt*2.5;}
      if(u>=1){
        if(k==='meteor'||k==='bomb'){
          burst(f.tx,0.6,f.tz,k==='bomb'?34:26,0xff9a4a,16,1.4); burst(f.tx,0.6,f.tz,10,0x6a5a50,9,2);
          shock(f.tx,0.2,f.tz,0xff9a4a,k==='bomb'?9:8,0.6); shock(f.tx,0.2,f.tz,0xffffff,4,0.3);
          sfx('boom'); if(Math.abs(f.tz-c.z)<70) flashScreen(0.2);
          var dxm=c.x-f.tx, dzm=c.z-f.tz;
          if(playing && Math.sqrt(dxm*dxm+dzm*dzm)<f.R && c.y<3.5){
            if(hurt(k==='meteor'?'Atingido por meteoro':'Explosivo',2,0.7)) bossHits++;
          }
          killNearbyCars(f.tx,f.tz,6.5);
          if(Math.abs(f.tz-c.z)<90) shake=Math.max(shake,0.45);
          removeFall(f); falls.splice(i,1);
        }else if(k==='abomb'){
          burst(f.tx,f.ty,f.tz,30,0x7fe6ff,15,1.3); burst(f.tx,f.ty,f.tz,10,0xffffff,10,1.8);
          sfx('boom');
          var ax=c.x-f.tx, ay=(c.y+0.7)-f.ty, az=c.z-f.tz;
          if(playing && Math.sqrt(ax*ax+ay*ay+az*az)<f.R){
            if(hurt('Explosivo aéreo',2,0.8)) bossHits++;
          }
          if(Math.abs(f.tz-c.z)<90) shake=Math.max(shake,0.35);
          removeFall(f); falls.splice(i,1);
        }else{
          f.state='landed'; f.life=(k==='carthrow')?7:9;
          if(k==='carthrow'){f.m.position.set(f.tx,0,f.tz); f.m.rotation.set(0,rand(0,TAU),rand(-0.4,0.4)); shake=Math.max(shake,0.3);}
          else{f.m.position.set(f.tx,0.8,f.tz); f.m.rotation.set(0,rand(0,TAU),0);}
          scene.remove(f.ring); f.ring=null;
          burst(f.tx,0.4,f.tz,k==='carthrow'?16:8,0xb8a080,6,1.1);
        }
      }
    }else{
      f.life-=dt;
      if(playing && Math.abs(c.z-f.tz)<f.hl && Math.abs(c.x-f.tx)<f.hw && c.y<f.clear){
        if(k==='carthrow'){ if(hurt('Carro arremessado',3,0.6)) bossHits++; }
        else if(hurt('Caixa do drone',2,0.7)) bossHits++;
        burst(f.tx,0.8,f.tz,16,0xe6cf9f,10,1.0);
        removeFall(f); falls.splice(i,1); continue;
      }
      if(f.life<=0 || f.tz>c.z+40){removeFall(f); falls.splice(i,1);}
    }
  }
}

function makeRocket(){
  var g=new THREE.Group(), white=lamb(0xf1f3f8), blk=lamb(0x15171f), grey=lamb(0x8a92a4);
  function cyl(r,h,y,mat){var m=new THREE.Mesh(geoCyl,mat); m.scale.set(r,h,r); m.position.y=y; g.add(m); return m;}
  cyl(1.8,28,14,white); cyl(1.86,3,29.5,blk); cyl(1.8,12,37,white);
  var nose=new THREE.Mesh(new THREE.ConeGeometry(1.8,5,16),white); nose.position.y=45.5; g.add(nose);
  cyl(2.0,1.4,0.7,blk);
  [[0.6,0],[-0.6,0]].forEach(function(f){addBox(g,0.2,3.4,2.2,f[0]>0?2.0:-2.0,27,0,blk);});
  var legs=new THREE.Group();
  [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){
    var l=addBox(legs,0.35,9,0.35,d[0]*3.4,3.5,d[1]*3.4,grey);
    l.rotation.z=-d[0]*0.42; l.rotation.x=d[1]*0.42;
  });
  g.add(legs);
  var flame=new THREE.Mesh(new THREE.ConeGeometry(1.7,16,10),new THREE.MeshBasicMaterial({color:0xffa040})); flame.rotation.x=Math.PI; flame.position.y=-8; g.add(flame);
  var plume=new THREE.Mesh(new THREE.ConeGeometry(3,60,10),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.22,depthWrite:false})); plume.rotation.x=Math.PI; plume.position.y=-40; g.add(plume);
  g.userData={flame:flame,plume:plume,legs:legs};
  g.scale.setScalar(1.7);
  return g;
}
function spawnRocket(){
  var side=Math.random()<0.5?-1:1, mode=Math.random()<0.6?'launch':'land', m=makeRocket();
  var r={m:m,mode:mode,side:side,x:side*rand(95,200),dz:rand(240,420),t:0,T:rand(10,13)};
  m.position.set(r.x,mode==='land'?240:0,c.z-r.dz); scene.add(m);
  rockets.push(r); if(mode==='launch') sfx('launch');
}
function updateRockets(dt){
  for(var i=rockets.length-1;i>=0;i--){
    var r=rockets[i], u=r.m.userData, y=0, flame=true;
    r.t+=dt;
    if(r.mode==='launch'){
      y=2.7*r.t*r.t;
      r.m.rotation.z=-r.side*Math.min(0.35,r.t*0.035);
      if(r.t>r.T){scene.remove(r.m); rockets.splice(i,1); continue;}
    }else{
      var q=Math.min(1,r.t/r.T);
      y=Math.pow(1-q,2)*240; if(q>=1) flame=false;
      if(r.t>r.T+4){scene.remove(r.m); rockets.splice(i,1); continue;}
    }
    r.m.position.set(r.x,y,c.z-r.dz);
    u.flame.visible=flame; u.plume.visible=flame && r.mode==='launch'; u.legs.visible=(r.mode==='land');
    if(flame) u.flame.scale.set(1,0.75+Math.random()*0.5,1);
  }
}

function makeDrone(){
  var g=new THREE.Group(), dark=lamb(0x262a36), mid=lamb(0x4a5062), light=lamb(0xe8ebf0);
  var red=new THREE.MeshBasicMaterial({color:0xff4a4a});
  var rotM=new THREE.MeshBasicMaterial({color:0xaab2c8,transparent:true,opacity:0.28,depthWrite:false,side:THREE.DoubleSide});
  addBox(g,7,1.8,5,0,0,0,dark); addBox(g,6,0.3,3.6,0,1.05,0,light);
  addBox(g,1.6,0.5,0.2,-1.6,0.1,-2.55,red); addBox(g,1.6,0.5,0.2,1.6,0.1,-2.55,red);
  addBox(g,3.4,1.6,3.4,0,-1.6,0,evMats.box); addBox(g,0.7,1.64,3.44,0,-1.6,0,evMats.tape);
  var rotors=[];
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(sg){
    var arm=addBox(g,5.4,0.45,0.6,sg[0]*3.5,0.2,sg[1]*2.5,mid); arm.rotation.y=sg[0]*sg[1]*0.6;
    var piv=new THREE.Group(); piv.position.set(sg[0]*5.7,0.8,sg[1]*4.2); g.add(piv);
    var disc=new THREE.Mesh(geoCyl,rotM); disc.scale.set(3.2,0.06,3.2); piv.add(disc);
    addBox(piv,6.2,0.1,0.4,0,0,0,dark);
    rotors.push(piv);
  });
  g.userData.rotors=rotors;
  g.scale.setScalar(1.6);
  return g;
}
