/* ---------- particles (cold gas plumes) ---------- */
var P=[], pi=0, pgeo=new THREE.IcosahedronGeometry(0.22,0);
(function(){
  for(var i=0;i<400;i++){
    var m=new THREE.Mesh(pgeo,new THREE.MeshBasicMaterial({color:0xdff6ff,transparent:true,opacity:0,depthWrite:false}));
    m.visible=false; scene.add(m);
    P.push({m:m,life:0,max:1,v:new THREE.Vector3(),s:1});
  }
})();
var tmpV=new THREE.Vector3(), tmpD=new THREE.Vector3();
var airColor=0xdff6ff;
function emit(local,dirLocal,spd,life,size){
  var p=P[pi]; pi=(pi+1)%P.length;
  tmpV.copy(local); player.localToWorld(tmpV);
  tmpD.copy(dirLocal).transformDirection(player.matrixWorld);
  p.m.position.copy(tmpV);
  p.v.copy(tmpD).multiplyScalar(spd).add(new THREE.Vector3(rand(-1.2,1.2),rand(-0.6,1.2),rand(-1.2,1.2)));
  p.life=p.max=life; p.s=size; p.m.material.color.setHex(airColor); p.m.visible=true;
}
var REAR=[-0.6,-0.2,0.2,0.6].map(function(x){return new THREE.Vector3(x,0.5,2.45);});
var BELLY=[[-0.8,-1.2],[0.8,-1.2],[-0.8,0.1],[0.8,0.1],[-0.8,1.3],[0.8,1.3]].map(function(p){return new THREE.Vector3(p[0],0.2,p[1]);});
var BACK=new THREE.Vector3(0,0,1), DOWN=new THREE.Vector3(0,-1,0);
function updateParticles(dt){
  for(var i=0;i<P.length;i++){
    var p=P[i]; if(p.life<=0) continue;
    p.life-=dt;
    if(p.life<=0){p.m.visible=false; continue;}
    p.m.position.addScaledVector(p.v,dt);
    var t=p.life/p.max;
    p.m.material.opacity=t*0.8;
    p.m.scale.setScalar(p.s*(1+(1-t)*2.4));
  }
}

