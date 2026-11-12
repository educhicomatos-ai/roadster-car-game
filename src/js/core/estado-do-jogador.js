/* ---------- player state ---------- */
var player=makeRoadster(); player.rotation.order='YXZ'; scene.add(player);
player.traverse(function(m){if(m.isMesh) m.castShadow=true;});
var beam=(function(){
  var cv=document.createElement('canvas'); cv.width=64; cv.height=256; var x=cv.getContext('2d');
  var g1=x.createLinearGradient(0,256,0,0); g1.addColorStop(0,'rgba(255,255,255,.9)'); g1.addColorStop(0.35,'rgba(255,255,255,.35)'); g1.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g1; x.fillRect(0,0,64,256);
  x.globalCompositeOperation='destination-in'; var g2=x.createLinearGradient(0,0,64,0); g2.addColorStop(0,'rgba(0,0,0,0)'); g2.addColorStop(0.5,'rgba(0,0,0,1)'); g2.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g2; x.fillRect(0,0,64,256);
  var m=new THREE.Mesh(new THREE.PlaneGeometry(7,28),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),color:0xfff0cc,transparent:true,opacity:0.3,depthWrite:false,blending:THREE.AdditiveBlending}));
  m.rotation.x=-Math.PI/2; m.position.set(0,0.07,-18); m.renderOrder=2; player.add(m); return m;
})();
(function(){
  var cv=document.createElement('canvas'); cv.width=cv.height=64; var x=cv.getContext('2d');
  var g=x.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'rgba(255,80,90,1)'); g.addColorStop(0.4,'rgba(255,50,70,.45)'); g.addColorStop(1,'rgba(255,40,60,0)'); x.fillStyle=g; x.fillRect(0,0,64,64);
  var sm=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});
  [-0.75,0.75].forEach(function(px){var sp=new THREE.Sprite(sm); sp.scale.set(1.15,0.7,1); sp.position.set(px,0.66,2.45); player.add(sp);});
})();
var shadow=new THREE.Mesh(new THREE.CircleGeometry(1,24),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.4,depthWrite:false}));
shadow.rotation.x=-Math.PI/2; shadow.scale.set(1.3,2.6,1); scene.add(shadow);
var shieldMesh=new THREE.Mesh(new THREE.SphereGeometry(2.9,20,14),new THREE.MeshBasicMaterial({color:0xffc24a,transparent:true,opacity:0.16,depthWrite:false}));
shieldMesh.position.y=0.8; shieldMesh.visible=false; shieldMesh.castShadow=false; player.add(shieldMesh);

var c={x:0,y:0,z:0,vy:0,speed:34,psi:0,grounded:true,slopeVy:0,pitch:0,rolling:false,rollAng:0,air:TANK,dist:0,shield:0,mult:0,nitro:0,turbo:0,slow:0,zap:0,slip:0,goo:0,gv:0,gvT:0,fire:0};
var state='menu', score=0, timeLeft=RUN_TIME, shake=0, demoT=0;
/* difficulty grows with the score of the run: dif() 0.55 (start) to 1.3 (score 5000+) */
function diffT(){return clamp(score/3500,0,1);}
function dif(){return 0.8+1.7*diffT();}
function gapMul(){return 1.5-0.7*diffT();}
function addScore(v){var g=v*(c.mult>0?2:1); score+=g; if(g>=40) popup('+'+Math.round(g));}

