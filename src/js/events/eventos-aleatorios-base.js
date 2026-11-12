/* ---------- random events: meteors, rockets in the sky, delivery drone boss ---------- */
var ev={kind:null,next:12,t:0,dur:0,sp:0,lastBoss:-99,lastBomber:-99,lastHero:-99,lastMonkey:-99,lastDino:-99,lastJet:-99,lastOcto:-99,lastSlime:-99,lastFire:-99,prev:''}, bomber=null, hero=null, falls=[], rockets=[], boss=null, rocketNext=3, elapsed=0, bossHits=0;
var elEvBar=$('evbar'), elEvName=$('evname'), elEvFill=$('evfill');
var warnGeo=new THREE.RingGeometry(0.82,1,32), meteorGeo=new THREE.IcosahedronGeometry(1.7,0), tailGeo=new THREE.ConeGeometry(1.3,13,8);
var evMats={
  warn:new THREE.MeshBasicMaterial({color:0xff5a5f,transparent:true,opacity:0.7,depthWrite:false,side:THREE.DoubleSide}),
  warn2:new THREE.MeshBasicMaterial({color:0x4ad8ff,transparent:true,opacity:0.7,depthWrite:false,side:THREE.DoubleSide}),
  rock:new THREE.MeshBasicMaterial({color:0xff7a2a}),
  tail:new THREE.MeshBasicMaterial({color:0xffc24a,transparent:true,opacity:0.55,depthWrite:false}),
  box:lamb(0xb8895a), tape:lamb(0xe6cf9f)
};
function ease(x){x=clamp(x,0,1); return x*x*(3-2*x);}
function burst(x,y,z,n,col,spd,size){
  for(var i=0;i<n;i++){
    var q=P[pi]; pi=(pi+1)%P.length;
    q.m.position.set(x,y,z);
    q.v.set(rand(-1,1),rand(0.2,1.2),rand(-1,1)).normalize().multiplyScalar(spd*rand(0.4,1));
    q.life=q.max=rand(0.5,1); q.s=size; q.m.material.color.setHex(col); q.m.visible=true;
  }
}
