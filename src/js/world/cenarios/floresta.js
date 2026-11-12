/* ---------- forest: lime and pine trees, bushes, hills, fences, falling leaves ---------- */
(function(){
  var ovals=[], pines=[], bushes=[], hills=[], v;
  var lime=[0xd6d62a,0xb9cc2a,0xe8dc3a,0x9fbf2e];
  for(v=0;v<4;v++){
    var h=rand(4.5,6.5), col=new THREE.Color(lime[v]), dark=col.clone().multiplyScalar(0.78);
    ovals.push(mergeParts([part(gCy,0,2.2,0,0.3,4.4,0.3,0x6b4a2b),part(gSp,0,3.2+h,0,2.1,h,2.1,col),part(gSp,0.6,3.6+h*0.4,0.3,1.6,h*0.45,1.6,dark)]));
  }
  for(v=0;v<3;v++){
    var cg=[0x6f8a22,0x5c7a1e,0x7f9a26][v], s=rand(0.85,1.25);
    pines.push(mergeParts([part(gCy,0,1.2,0,0.35,2.4,0.35,0x6b4a2b),part(gCo,0,4.6*s,0,2.9*s,4.4*s,2.9*s,cg),part(gCo,0,7.2*s,0,2.3*s,3.8*s,2.3*s,new THREE.Color(cg).multiplyScalar(1.12)),part(gCo,0,9.5*s,0,1.5*s,3.4*s,1.5*s,new THREE.Color(cg).multiplyScalar(1.22))]));
  }
  for(v=0;v<2;v++) bushes.push(mergeParts([part(gSp,0,0.7,0,1.6,1.0,1.4,0x6f9a2a),part(gSp,1.0,0.5,0.4,1.0,0.7,1.0,0x86ac32)]));
  for(v=0;v<3;v++) hills.push(mergeParts([part(gSp,0,0,0,rand(70,120),rand(26,44),rand(70,110),[0x9fbf3a,0x8fb336,0xb5c93e][v])]));
  addPool({biome:1,n:96,mk:function(i){return new THREE.Mesh(i%5<3?ovals[i%4]:pines[i%3],matV);},near:27,far:125,dens:0.15,
    setup:function(it){it.ph=rand(0,TAU); var s=rand(0.85,1.3); it.o.scale.set(s,s*rand(0.9,1.15),s);},
    anim:function(it,t){it.o.rotation.z=Math.sin(t*1.25+it.ph)*0.028;}});
  addPool({biome:1,n:34,mk:function(i){return new THREE.Mesh(bushes[i%2],matV);},near:24,far:60,dens:0.055});
  addPool({biome:1,n:14,mk:function(i){return new THREE.Mesh(hills[i%3],matV);},near:150,far:320,dens:0.02,y:-9});
  var fp=[];
  for(var q=-6;q<=6;q+=4) fp.push(part(gB,0,0.95,q,0.28,1.9,0.28,0x7a2e2e));
  fp.push(part(gB,0,0.6,0,0.14,0.16,16,0x8a3a30)); fp.push(part(gB,0,1.4,0,0.14,0.16,16,0x8a3a30));
  var fenceG=mergeParts(fp);
  addLinear({biome:1,L:16,xs:[-(ROAD_HALF+6),ROAD_HALF+6],mk:function(){return new THREE.Mesh(fenceG,matV);}});
})();

