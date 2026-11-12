/* fighter jet: carpet-bombs the road with missiles that become a minefield */
var jet=null, missiles=[], msMat={body:lamb(0xd9dde6), dark:lamb(0x2b2f3a), tip:lamb(0xc9341f)},
  jetMat={hull:lamb(0x7d8594), dark:lamb(0x3a4050), glass:new THREE.MeshBasicMaterial({color:0x56b8ff}), red:lamb(0xc83a34), blue:lamb(0x2e56b8), white:lamb(0xf1f3f8)},
  mineMat=lamb(0x2a2d36), mineLight=new THREE.MeshBasicMaterial({color:0xff2a2a}),
  flameGeo=new THREE.ConeGeometry(0.5,4,8);
function makeJet(){
  var g=new THREE.Group(), m=jetMat;
  addSph(g,1.0,0.9,6.5,0,0,0,m.hull);
  var nose=new THREE.Mesh(coneGeo,m.hull); nose.scale.set(0.95,5,0.95); nose.rotation.x=-Math.PI/2; nose.position.set(0,0,-8.2); g.add(nose);
  addSph(g,0.7,0.6,2.0,0,0.75,-2.2,m.glass);
  [-1,1].forEach(function(sd){
    var w=addBox(g,6.5,0.2,5.5,sd*3.8,-0.1,1.6,m.hull); w.rotation.y=sd*0.55;
    var tl=addBox(g,0.2,2.6,2.2,sd*1.2,1.7,5.4,m.hull); tl.rotation.z=-sd*0.25;
    addBox(g,0.22,0.9,1.0,sd*1.2+(-sd*0.3),2.6,5.6,m.blue); addBox(g,0.22,0.5,1.0,sd*1.2+(-sd*0.25),2.1,5.6,m.white); addBox(g,0.22,0.5,1.0,sd*1.2+(-sd*0.2),1.6,5.6,m.red);
    addBox(g,2.6,0.14,1.8,sd*2.0,0,6.0,m.dark);
    addCyl(g,0.7,2.4,0.7,sd*0.8,-0.1,6.5,m.dark).rotation.x=Math.PI/2;
    var fl=new THREE.Mesh(flameGeo,new THREE.MeshBasicMaterial({color:0xffa23a,transparent:true,opacity:0.9})); fl.rotation.x=-Math.PI/2; fl.position.set(sd*0.8,-0.1,9.4); g.add(fl);
    g.userData['f'+(sd>0?'R':'L')]=fl;
  });
  g.scale.setScalar(1.25);
  return g;
}
function makeMissileMesh(){
  var g=new THREE.Group(), q=msMat;
  addCyl(g,0.22,2.0,0.22,0,0,0,q.body).rotation.x=Math.PI/2;
  var nose=new THREE.Mesh(coneGeo,q.tip); nose.scale.set(0.22,0.8,0.22); nose.rotation.x=Math.PI/2; nose.position.z=1.35; g.add(nose);
  addBox(g,1.0,0.05,0.4,0,0,-0.8,q.dark); addBox(g,0.05,1.0,0.4,0,0,-0.8,q.dark);
  g.scale.setScalar(1.5);
  return g;
}
function startJet(){
  evJoin('jet'); ev.lastJet=elapsed; bossHits=0;
  var m=makeJet(); scene.add(m);
  jet={m:m,t:0,dur:20,x:0,rz:80,cd:0,n:0};
  m.position.set(0,34,c.z+80);
  eventIntro('Caça bombardeiro','Campo minado! Desvie de todos os mísseis'); sfx('jet'); sfx('alarm');
}
function launchMissile(tx,tz,sx,sy,sz){
  var m=makeMissileMesh(); m.position.set(sx,sy,sz); m.lookAt(tx,0,tz); scene.add(m);
  var r=new THREE.Mesh(warnGeo,evMats.warn2); r.rotation.x=-Math.PI/2; r.position.set(tx,0.07,tz); r.scale.setScalar(2.6); scene.add(r);
  missiles.push({m:m,ring:r,state:'fall',t:0,T:1.25,tx:tx,tz:tz,sx:sx,sy:sy,sz:sz,life:0,blink:rand(0,3),det:false});
}
function missileBlast(o,hitCheck){
  var x=o.tx,z=o.tz;
  burst(x,0.8,z,36,0xff8a3a,18,1.6); burst(x,0.8,z,16,0xffe08a,12,1.2); burst(x,0.6,z,12,0x5a4e48,9,2.4);
  shock(x,0.2,z,0xff9a4a,9,0.6); shock(x,0.2,z,0xffffff,5,0.3);
  sfx('boom'); if(Math.abs(z-c.z)<120) flashScreen(0.25);
  if(Math.abs(z-c.z)<100) shake=Math.max(shake,0.55);
  killNearbyCars(x,z,6.5);
  if(hitCheck){ if(hurt('Míssil',4,0.5)) bossHits++; shake=1; flashScreen(0.55); }
}
function updateMissiles(dt,playing){
  mineLight.color.setHex((Math.floor(performance.now()/180)%2)?0xff2a2a:0x661010);
  for(var i=missiles.length-1;i>=0;i--){
    var o=missiles[i], m=o.m;
    if(o.state==='fall'){
      o.t+=dt; var u=Math.min(1,o.t/o.T), uu=u*u;
      m.position.set(o.sx+(o.tx-o.sx)*uu, o.sy*(1-uu), o.sz+(o.tz-o.sz)*uu);
      burst(m.position.x,m.position.y,m.position.z,1,0xffb060,2,0.7);
      if(u>=1){
        var dx=c.x-o.tx, dz=c.z-o.tz, near=Math.sqrt(dx*dx+dz*dz)<3.2 && c.y<3.5;
        missileBlast(o,playing&&near);
        scene.remove(m); scene.remove(o.ring);
        // leaves an armed mine
        var mine=new THREE.Group(); addSph(mine,0.9,0.4,0.9,0,0.15,0,mineMat); addSph(mine,0.3,0.2,0.3,0,0.5,0,mineLight);
        mine.position.set(o.tx,0,o.tz); scene.add(mine);
        var r=new THREE.Mesh(warnGeo,evMats.warn2); r.rotation.x=-Math.PI/2; r.position.set(o.tx,0.07,o.tz); r.scale.setScalar(2.4); scene.add(r);
        o.state='mine'; o.m=mine; o.ring=r; o.life=4.5;
      }
    }else{
      o.life-=dt;
      var ex=c.x-o.tx, ez=c.z-o.tz, trig=playing && Math.sqrt(ex*ex+ez*ez)<2.5 && c.y<2.3;
      if(trig || o.life<=0){
        if(trig){burst(o.tx,0.8,o.tz,36,0xff8a3a,18,1.6); burst(o.tx,0.8,o.tz,16,0xffe08a,12,1.2); sfx('boom'); flashScreen(0.55); killNearbyCars(o.tx,o.tz,6);
          if(hurt('Mina',4,0.5)) bossHits++; shake=1;}
        else{burst(o.tx,0.5,o.tz,8,0x8a8078,6,1);}
        scene.remove(o.m); scene.remove(o.ring); missiles.splice(i,1); continue;
      }
      if(o.tz>c.z+40){scene.remove(o.m); scene.remove(o.ring); missiles.splice(i,1);}
    }
  }
}
function updateJet(dt,playing){
  updateMissiles(dt,playing);
  if(!jet) return;
  var j=jet; j.t+=dt; j.cd-=dt;
  var T=j.dur, rzT=-85;
  if(j.t<3) rzT=-85+160*(1-ease(j.t/3));
  else if(j.t>T-3) rzT=-85-420*ease((j.t-(T-3))/3);
  j.rz+=(rzT-j.rz)*Math.min(1,6*dt);
  j.x=Math.sin(j.t*0.9)*(ROAD_HALF*0.8);
  var jz=c.z+j.rz, jy=34+Math.sin(j.t*1.7)*1.5;
  j.m.position.set(j.x,jy,jz); j.m.rotation.set(0,0,Math.cos(j.t*0.9)*0.35);
  var fs=1+0.25*Math.sin(j.t*40); j.m.userData.fL.scale.set(1,fs,1); j.m.userData.fR.scale.set(1,fs,1);
  if(playing && j.t>3 && j.t<T-3 && j.cd<=0){
    j.cd=0.17/dif(); j.n++;
    var aimed=(j.n%4===0), tx=aimed?clamp(c.x+rand(-3,3),-ROAD_HALF+1.5,ROAD_HALF-1.5):rand(-ROAD_HALF+1.5,ROAD_HALF-1.5);
    var tz=c.z-clamp(c.speed*1.25,50,130)-rand(10,60);
    launchMissile(tx,tz,j.x+rand(-1.5,1.5),jy-1,jz);
    if(j.n%3===0) sfx('missile');
  }
  if(j.t>=T){
    scene.remove(j.m); jet=null;
    if(playing && bossHits===0){
      c.turbo=8; c.speed=Math.max(c.speed,70);
      toast('SUPER BOOST + invencibilidade 8 s','good'); sfx('turbo'); flashScreen(0.4); addScore(1000);
    }else if(playing) toast('O caça foi embora','info');
    evEnded();
  }
}

