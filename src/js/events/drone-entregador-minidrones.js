/* mini drones launched by the delivery drone: hover, lock on, home in and explode on contact */
var minis=[], miniRotM=new THREE.MeshBasicMaterial({color:0xaab2c8,transparent:true,opacity:0.3,depthWrite:false,side:THREE.DoubleSide});
function makeMini(){
  var g=new THREE.Group(), dark=lamb(0x262a36), mid=lamb(0x4a5062), rotors=[];
  addBox(g,0.9,0.35,0.9,0,0,0,dark);
  var led=new THREE.Mesh(sphGeo,new THREE.MeshBasicMaterial({color:0xff3030})); led.scale.setScalar(0.14); led.position.set(0,0.22,0.3); g.add(led);
  addCyl(g,0.22,0.3,0.22,0,-0.3,0,lamb(0xff7a2a));
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(sg){
    var arm=addBox(g,0.7,0.06,0.1,sg[0]*0.4,0.12,sg[1]*0.4,mid); arm.rotation.y=sg[0]*sg[1]*0.78;
    var piv=grp(g,sg[0]*0.75,0.2,sg[1]*0.75);
    var disc=new THREE.Mesh(geoCyl,miniRotM); disc.scale.set(0.45,0.03,0.45); piv.add(disc);
    addBox(piv,0.9,0.03,0.08,0,0,0,dark);
    rotors.push(piv);
  });
  g.userData={led:led,rotors:rotors};
  g.scale.setScalar(1.4);
  return g;
}
function launchMinis(){
  if(!boss || minis.length>=5) return;
  var n=Math.random()<0.5?1:2, bp=boss.m.position;
  for(var i=0;i<n;i++){
    var m=makeMini(); scene.add(m);
    minis.push({m:m,x:clamp(bp.x+rand(-3,3),-(ROAD_HALF-2),ROAD_HALF-2),y:bp.y-2,rz:bp.z-c.z,vx:0,vy:-3,s:0,t:0});
  }
  sfx('mini');
}
function updateMinis(dt,playing){
  for(var i=minis.length-1;i>=0;i--){
    var o=minis[i]; o.t+=dt;
    var tx=c.x, ty=c.y+0.7, hold=o.t<0.7;
    o.s=hold?0:Math.min(30,o.s+30*dt);
    var dvx=clamp((tx-o.x)*2.2,-14,14), dvy=clamp((ty-o.y)*2.2,-10,10), kk=Math.min(1,2.2*dt);
    o.vx+=(dvx-o.vx)*kk; o.vy+=(dvy-o.vy)*kk;
    if(hold){o.vx*=0.6; o.vy=Math.sin(o.t*10)*0.8;}
    o.x+=o.vx*dt; o.y=Math.max(0.8,o.y+o.vy*dt); o.rz+=o.s*dt;
    var wz=c.z+o.rz, m=o.m, u=m.userData;
    m.position.set(o.x,o.y,wz);
    m.lookAt(o.x+o.vx*0.4,o.y+o.vy*0.4,wz+Math.max(2,o.s*0.3));
    u.rotors.forEach(function(r){r.rotation.y+=60*dt;});
    u.led.visible=hold?(Math.floor(o.t*16)%2===0):true;
    var hit=playing && Math.abs(o.rz)<2.0 && Math.abs(o.x-c.x)<1.9 && Math.abs(o.y-ty)<1.9;
    if(hit || o.rz>8 || o.t>7){
      burst(o.x,o.y,wz,hit?24:10,0xffa040,14,1.2); sfx('boom');
      if(hit){ if(hurt('Mini drone',2,0.8)) bossHits++; flashScreen(0.2); }
      scene.remove(m); minis.splice(i,1);
    }
  }
}

