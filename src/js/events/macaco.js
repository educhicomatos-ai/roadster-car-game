/* monkey: chases the car and throws bananas whenever the player slows down */
var monkey=null, bananas=[];
var monkeyMats={fur:lamb(0x7a4a2b), furDark:lamb(0x4a2a18), face:lamb(0xe8c39a), dark:lamb(0x14161f), white:lamb(0xf1f3f8)};
var bananaMat=lamb(0xffd23a), bananaTip=lamb(0x5a3a1a);
function makeBanana(){
  var g=new THREE.Group();
  for(var i=0;i<4;i++){
    var a=-0.9+i*0.6, seg=addBox(g,0.22,0.5,0.22,Math.sin(a)*0.5,(Math.cos(a)-1)*0.5,0,bananaMat); seg.rotation.z=-a;
  }
  addBox(g,0.14,0.14,0.14,Math.sin(-0.95)*0.5,(Math.cos(-0.95)-1)*0.5+0.1,0,bananaTip);
  g.scale.setScalar(1.5);
  return g;
}
function makeMonkey(){
  var g=new THREE.Group(), m=monkeyMats;
  var body=grp(g,0,1.0,0);
  addSph(body,0.5,0.62,0.45,0,0.55,0,m.fur); addSph(body,0.34,0.36,0.1,0,0.5,0.4,m.face);
  var head=grp(body,0,1.2,0.05);
  addSph(head,0.42,0.4,0.4,0,0.25,0,m.fur); addSph(head,0.3,0.26,0.18,0,0.17,0.3,m.face);
  [-1,1].forEach(function(sd){
    addSph(head,0.07,0.07,0.04,sd*0.13,0.34,0.38,m.white); addSph(head,0.035,0.035,0.03,sd*0.13,0.34,0.41,m.dark);
    addSph(head,0.16,0.16,0.07,sd*0.42,0.3,0,m.face);
  });
  addSph(head,0.07,0.05,0.04,0,0.22,0.46,m.dark);
  function limb(x,yy,len1,len2,r){
    var sh=grp(body,x,yy,0);
    addCyl(sh,r,len1,r,0,-len1/2,0,m.fur);
    var el=grp(sh,0,-len1,0);
    addCyl(el,r*0.9,len2,r*0.9,0,-len2/2,0,m.fur);
    return {sh:sh,el:el};
  }
  var aL=limb(-0.55,1.05,0.7,0.65,0.12), aR=limb(0.55,1.05,0.7,0.65,0.12);
  addSph(aL.el,0.14,0.14,0.14,0,-0.68,0,m.face); addSph(aR.el,0.14,0.14,0.14,0,-0.68,0,m.face);
  var banana=makeBanana(); banana.position.set(0,-0.7,0.15); banana.visible=false; aR.el.add(banana);
  var lL=limb(-0.25,0.1,0.65,0.6,0.15), lR=limb(0.25,0.1,0.65,0.6,0.15);
  addBox(lL.el,0.22,0.12,0.4,0,-0.62,0.1,m.furDark); addBox(lR.el,0.22,0.12,0.4,0,-0.62,0.1,m.furDark);
  var tail=[], prev=null;
  for(var i=0;i<4;i++){
    var seg=prev?grp(prev,0,-0.4,0):grp(body,0,0.3,-0.4);
    addCyl(seg,0.07,0.42,0.07,0,-0.2,0,m.furDark); tail.push(seg); prev=seg;
  }
  var root=new THREE.Group(); g.rotation.y=Math.PI; root.add(g); root.scale.setScalar(0.95);
  root.userData={body:body,head:head,aL:aL.sh,eL:aL.el,aR:aR.sh,eR:aR.el,lL:lL.sh,kL:lL.el,lR:lR.sh,kR:lR.el,tail:tail,banana:banana};
  return root;
}
function startMonkey(){
  evJoin('monkey'); ev.lastMonkey=elapsed; bossHits=0;
  var m=makeMonkey(); scene.add(m);
  monkey={m:m,t:0,dur:30,tension:0,cd:3,phase:'run',pt:0,x:c.x,rz:40,
    j:{aRx:0,aLx:0,eR:-0.5,eL:-0.5,lR:0,lL:0,kR:0.2,kL:0.2,lean:0.5}};
  m.position.set(c.x,0,c.z+40);
  eventIntro('Macaco faminto','Mantenha 250 km/h ou ele joga banana');
}
function animateMonkey(k,dt){
  var u=k.m.userData, w=k.t*22, ph=k.phase, s=Math.sin(w), kk=Math.min(1,14*dt);
  var tg={aRx:-s*1.1,aLx:s*1.1,eR:-0.5,eL:-0.5,lR:s*1.0,lL:-s*1.0,kR:Math.max(0,-s)*0.9+0.2,kL:Math.max(0,s)*0.9+0.2,lean:0.5};
  if(ph==='wind'){tg.aRx=2.8; tg.eR=-0.3; tg.aLx=-1.1; tg.lean=-0.15;}
  else if(ph==='throw'){tg.aRx=-2.7; tg.eR=-0.1; tg.lean=0.85;}
  var j=k.j; for(var key in tg) j[key]+=(tg[key]-j[key])*kk;
  u.body.rotation.x=j.lean; u.body.position.y=1.0+Math.abs(s)*0.12;
  u.aR.rotation.x=j.aRx; u.aL.rotation.x=j.aLx; u.eR.rotation.x=j.eR; u.eL.rotation.x=j.eL;
  u.lR.rotation.x=j.lR; u.lL.rotation.x=j.lL; u.kR.rotation.x=j.kR; u.kL.rotation.x=j.kL;
  u.head.rotation.x=-j.lean*0.5;
  for(var i=0;i<u.tail.length;i++){u.tail[i].rotation.x=0.45+0.3*Math.sin(w*0.5-i*0.8); u.tail[i].rotation.z=0.25*Math.sin(w*0.5-i*0.6);}
  u.banana.visible=(ph==='wind');
}
function updateMonkey(dt,playing){
  if(!monkey) return;
  var k=monkey; k.t+=dt; k.pt+=dt; k.cd-=dt;
  var T=k.dur, rzT=3.8, active=(k.t>2 && k.t<T-2);
  if(k.t<2) rzT=3.8+36*(1-ease(k.t/2));
  else if(k.t>T-2) rzT=3.8+60*ease((k.t-(T-2))/2);
  k.rz+=(rzT-k.rz)*Math.min(1,8*dt);
  var tx=clamp(c.x+2.6*Math.sin(k.t*0.9),-(ROAD_HALF-1.5),ROAD_HALF-1.5);
  k.x+=(tx-k.x)*Math.min(1,6*dt);
  var mz=c.z+k.rz, gh=groundH(k.x,mz);
  k.m.position.set(k.x,gh,mz);
  if(Math.random()<0.5) burst(k.x,gh+0.1,mz+0.6,1,dustHex,2,0.6);
  if(playing && active){
    if(k.t>5 && c.speed<250/3.6) k.tension=Math.min(1.1,k.tension+dt/(2.4-1.9*diffT())); else k.tension=Math.max(0,k.tension-dt*0.8);
    if(k.phase==='run' && k.tension>=1 && k.cd<=0){k.phase='wind'; k.pt=0; sfx('monkey');}
  }else k.tension=Math.max(0,k.tension-dt);
  if(k.phase==='wind' && k.pt>=0.4){
    var bm=makeBanana(); scene.add(bm);
    bananas.push({m:bm,t:0,T:0.5,off:new THREE.Vector3(k.x-c.x,(gh+1.6)-(c.y+0.8),k.rz-0.6)});
    k.phase='throw'; k.pt=0; k.cd=3.2/dif()*0.75; k.tension=0.2; sfx('throw');
  }else if(k.phase==='throw' && k.pt>=0.3){k.phase='run'; k.pt=0;}
  animateMonkey(k,dt);
  if(k.t>=T){
    scene.remove(k.m); monkey=null;
    finishMajor(playing,'O macaco desistiu','O macaco foi embora');
  }
}
function updateBananas(dt,playing){
  for(var i=bananas.length-1;i>=0;i--){
    var b=bananas[i]; b.t+=dt; var u=Math.min(1,b.t/b.T);
    b.m.position.set(c.x+b.off.x*(1-u),c.y+0.8+b.off.y*(1-u)+1.4*Math.sin(Math.PI*u),c.z+0.6+b.off.z*(1-u));
    b.m.rotation.x+=dt*14; b.m.rotation.z+=dt*9;
    if(u>=1){
      burst(c.x,c.y+0.8,c.z+0.6,16,0xffe066,9,1.0);
      if(playing && hurt('Banana!',3,0.55)){bossHits++; c.slip=1.0;}
      scene.remove(b.m); bananas.splice(i,1);
    }
  }
}


