/* ---------- weather and extras that follow the camera ---------- */
var RN=700, rainPos=new Float32Array(RN*6), rainD=[], rainGeo=new THREE.BufferGeometry();
(function(){for(var i=0;i<RN;i++) rainD.push({x:rand(-45,45),y:rand(-14,32),z:rand(-130,20)}); rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));})();
var rainLines=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0xc8d6ff,transparent:true,opacity:0,depthWrite:false}));
rainLines.frustumCulled=false; rainLines.visible=false; scene.add(rainLines);
function rainUpdate(dt){
  var a=cur.rain; rainLines.visible=a>0.03; if(!rainLines.visible) return;
  rainLines.material.opacity=a*0.5; rainLines.position.copy(camera.position);
  var vz=Math.max(12,c.speed), vy=60, i, d, k;
  for(i=0;i<RN;i++){
    d=rainD[i]; d.y-=vy*dt; d.z+=vz*dt;
    if(d.y<-16){d.y+=50; d.x=rand(-45,45); d.z=rand(-130,20);}
    if(d.z>22) d.z-=150;
    k=i*6; rainPos[k]=d.x; rainPos[k+1]=d.y; rainPos[k+2]=d.z; rainPos[k+3]=d.x; rainPos[k+4]=d.y+vy*0.035; rainPos[k+5]=d.z-vz*0.035;
  }
  rainGeo.attributes.position.needsUpdate=true;
}
var LN=150, leafPos=new Float32Array(LN*3), leafD=[], leafGeo=new THREE.BufferGeometry();
(function(){for(var i=0;i<LN;i++) leafD.push({x:rand(-40,40),y:rand(-3,16),z:rand(-90,12),ph:rand(0,TAU)}); leafGeo.setAttribute('position',new THREE.BufferAttribute(leafPos,3));})();
var dotTex=(function(){var cv=document.createElement('canvas'); cv.width=cv.height=32; var g=cv.getContext('2d'); g.fillStyle='#fff'; g.beginPath(); g.ellipse(16,16,14,9,0.6,0,TAU); g.fill(); return new THREE.CanvasTexture(cv);})();
var leafPts=new THREE.Points(leafGeo,new THREE.PointsMaterial({color:0xf2b830,size:0.24,map:dotTex,alphaTest:0.25,transparent:true,opacity:0,depthWrite:false}));
leafPts.frustumCulled=false; leafPts.visible=false; scene.add(leafPts);
function leafUpdate(dt,t){
  var a=cur.leaves; leafPts.visible=a>0.03; if(!leafPts.visible) return;
  leafPts.material.opacity=a*0.85; leafPts.material.color.copy(cur.leafC); leafPts.material.size=cur.leafS; leafPts.position.copy(camera.position);
  var vz=Math.max(8,c.speed);
  for(var i=0;i<LN;i++){
    var d=leafD[i]; d.y-=1.4*dt; d.z+=vz*dt; d.x+=Math.sin(t*1.3+d.ph)*2.2*dt;
    if(d.y<-8){d.y=14; d.x=rand(-40,40);} if(d.z>14) d.z-=105;
    leafPos[i*3]=d.x; leafPos[i*3+1]=d.y; leafPos[i*3+2]=d.z;
  }
  leafGeo.attributes.position.needsUpdate=true;
}
var edgeMat=new THREE.MeshBasicMaterial({color:0xff3fd0,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
var edgeGlow=[-1,1].map(function(s){var m=new THREE.Mesh(new THREE.PlaneGeometry(0.8,GS),edgeMat); m.rotation.x=-Math.PI/2; m.position.set(s*(ROAD_HALF-0.5),0.05,0); m.visible=false; m.frustumCulled=false; scene.add(m); return m;});

