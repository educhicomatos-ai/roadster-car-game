/* ---------- desert (the old scenery, plus cacti, mesas and tumbleweeds) ---------- */
(function(){
  var small=scenery.filter(function(o){return !o.userData.big;}), big=scenery.filter(function(o){return o.userData.big;});
  addPool({biome:0,n:small.length,mk:function(i){return small[i];},near:30,far:100,dens:0.1});
  addPool({biome:0,n:big.length,mk:function(i){return big[i];},near:60,far:140,dens:0.0215});
  var cactus=[];
  for(var v=0;v<3;v++){
    var parts=[], h=rand(5,8), gc=[0x3f8f52,0x4aa05c,0x378248][v];
    parts.push(part(gCy,0,h/2,0,0.6,h,0.6,gc)); parts.push(part(gSp,0,h,0,0.6,0.6,0.6,gc));
    [-1,1].forEach(function(sd){
      if(Math.random()<0.75){
        var y=rand(2,h*0.6), up=rand(1.4,2.6);
        parts.push(part(gCy,sd*1.0,y,0,0.38,2.0,0.38,gc,0,0,Math.PI/2));
        parts.push(part(gCy,sd*1.95,y+up/2,0,0.38,up,0.38,gc)); parts.push(part(gSp,sd*1.95,y+up,0,0.38,0.38,0.38,gc));
      }
    });
    if(v===1) parts.push(part(gSp0,0.2,h+0.5,0.2,0.28,0.28,0.28,0xff6fa8));
    cactus.push(mergeParts(parts));
  }
  addPool({biome:0,n:30,mk:function(i){return new THREE.Mesh(cactus[i%3],matV);},near:26,far:78,dens:0.045});
  var mesas=[];
  for(v=0;v<4;v++){
    var mp=[], w=rand(26,40), d=rand(22,34), y=-3;
    var layers=[[1,22,0xc8602e],[0.78,16,0xd9743a],[0.52,19,0xe08a4a]];
    layers.forEach(function(L,li){
      var hh=L[1]*rand(0.9,1.3); mp.push(part(gB,rand(-2,2),y+hh/2,rand(-2,2),w*L[0],hh,d*L[0],L[2])); y+=hh;
    });
    mp.push(part(gB,0,y+1.2,0,w*0.56,2.4,d*0.56,0xb85028));
    mesas.push(mergeParts(mp));
  }
  addPool({biome:0,n:10,mk:function(i){return new THREE.Mesh(mesas[i%4],matV);},near:120,far:260,dens:0.012});
  var tw=new THREE.MeshLambertMaterial({color:0x8a6a3a});
  addPool({biome:0,n:7,mk:function(){var m=new THREE.Mesh(gSp0,tw); m.scale.setScalar(1.1); return m;},near:28,far:60,dens:0.012,y:1.1,
    setup:function(it){it.sp=rand(5,9);},
    anim:function(it,t,dt){it.o.position.z-=it.sp*dt; it.z=it.o.position.z; it.o.rotation.x-=it.sp*dt/1.1;}});
})();

