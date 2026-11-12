/* ---------- efeitos visuais compartilhados dos eventos novos ---------- */
function cvTex(w,h,draw){var cv=document.createElement('canvas'); cv.width=w; cv.height=h; draw(cv.getContext('2d'),w,h); return new THREE.CanvasTexture(cv);}
var texGlow=cvTex(128,128,function(x,w,h){var g=x.createRadialGradient(64,64,0,64,64,64); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.25,'rgba(255,255,255,.55)'); g.addColorStop(0.6,'rgba(255,255,255,.14)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(0,0,w,h);});
var texFlame=cvTex(128,256,function(x,w,h){
  x.shadowColor='rgba(255,110,20,1)'; x.shadowBlur=16;
  var g=x.createLinearGradient(0,236,0,12); g.addColorStop(0,'rgba(255,245,200,1)'); g.addColorStop(0.3,'rgba(255,195,70,1)'); g.addColorStop(0.65,'rgba(255,95,18,.92)'); g.addColorStop(1,'rgba(200,20,0,0)');
  x.fillStyle=g; x.beginPath(); x.moveTo(64,14); x.bezierCurveTo(72,70,116,120,100,188); x.bezierCurveTo(92,236,36,236,28,188); x.bezierCurveTo(12,120,56,70,64,14); x.fill();
  x.shadowBlur=0; var g2=x.createRadialGradient(64,192,2,64,192,52); g2.addColorStop(0,'rgba(255,255,240,.95)'); g2.addColorStop(1,'rgba(255,225,130,0)'); x.fillStyle=g2; x.fillRect(0,100,128,156);
});
var texSmoke=cvTex(128,128,function(x,w,h){for(var i=0;i<14;i++){var px=64+(Math.random()-0.5)*44, py=64+(Math.random()-0.5)*44, r=22+Math.random()*20, g=x.createRadialGradient(px,py,0,px,py,r); g.addColorStop(0,'rgba(255,255,255,.34)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(0,0,w,h);}});
function mkSprite(tex,color,add,op){
  var s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:color,transparent:true,opacity:op===undefined?1:op,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,fog:false}));
  return s;
}
var evLight=new THREE.PointLight(0xff7a2a,0,60,1.4); scene.add(evLight);
function updateEvLight(dt){
  var tt=performance.now()*0.001, tgt=null;
  if(fireV){evLight.color.setHex(0xff7a2a); evLight.position.set(fireV.m.position.x,3.8,fireV.m.position.z+3); evLight.distance=64; evLight.intensity=2.8+0.7*Math.sin(tt*23)+0.4*Math.sin(tt*41);}
  else if(slimeV){evLight.color.setHex(0x7dff4a); evLight.position.set(slimeV.m.position.x,5.5,slimeV.m.position.z+7); evLight.distance=60; evLight.intensity=2.4+0.35*Math.sin(tt*3);}
  else{
    var bd=1e9;
    firePats.forEach(function(p){var d=c.z-p.z; if(d>-10 && d<bd && p.life>1){bd=d; tgt=p;}});
    if(tgt){evLight.color.setHex(0xff7a2a); evLight.position.set(tgt.x,2.5,tgt.z); evLight.distance=40; evLight.intensity=1.8+0.5*Math.sin(tt*25);}
    else evLight.intensity=Math.max(0,evLight.intensity-5*dt);
  }
}
/* fumaça (sprites macios que sobem, giram e escurecem) e brasas */
var smokes=[], smokeI=0, embers=[], emberI=0;
(function(){
  var i, s;
  for(i=0;i<56;i++){s=mkSprite(texSmoke,0x2a2522,false,0); s.visible=false; scene.add(s); smokes.push({m:s,t:0,T:1,on:false,vy:3,vx:0,sz:1,sp:0});}
  for(i=0;i<46;i++){s=mkSprite(texGlow,0xffb050,true,0); s.visible=false; scene.add(s); embers.push({m:s,t:0,T:1,on:false,vx:0,vy:0,vz:0,ph:0});}
})();
function smokePuff(x,y,z,big){
  var q=smokes[smokeI]; smokeI=(smokeI+1)%smokes.length;
  q.on=true; q.t=0; q.T=rand(1.8,2.8); q.sz=big?rand(3.2,4.4):rand(2.2,3.2); q.vy=rand(3,5.2); q.vx=rand(-0.8,0.8); q.sp=rand(-1,1);
  q.m.material.rotation=rand(0,TAU); q.m.position.set(x,y,z); q.m.visible=true;
}
function ember(x,y,z){
  var q=embers[emberI]; emberI=(emberI+1)%embers.length;
  q.on=true; q.t=0; q.T=rand(0.8,1.6); q.vx=rand(-2.5,2.5); q.vy=rand(3,7); q.vz=rand(-2.5,2.5); q.ph=rand(0,6); q.m.position.set(x,y,z); q.m.visible=true;
}
function updateSmokes(dt){
  smokes.forEach(function(q){
    if(!q.on) return;
    q.t+=dt; var u=q.t/q.T;
    if(u>=1){q.on=false; q.m.visible=false; return;}
    q.m.position.y+=q.vy*dt*(1-0.5*u); q.m.position.x+=q.vx*dt;
    var sz=q.sz*(0.45+u*1.6); q.m.scale.set(sz,sz,1); q.m.material.rotation+=q.sp*dt;
    q.m.material.opacity=Math.min(1,u*8)*0.62*Math.pow(1-u,0.9);
    var w=Math.max(0,1-u*4); q.m.material.color.setRGB(0.16+0.84*w*0.95,0.15+0.5*w,0.14+0.2*w);
  });
  embers.forEach(function(q){
    if(!q.on) return;
    q.t+=dt; var u=q.t/q.T;
    if(u>=1){q.on=false; q.m.visible=false; return;}
    q.vy-=5*dt; q.m.position.x+=q.vx*dt; q.m.position.y=Math.max(0.1,q.m.position.y+q.vy*dt); q.m.position.z+=q.vz*dt;
    var sz=0.3*(1-u*0.6); q.m.scale.set(sz,sz,1); q.m.material.opacity=(1-u)*(0.7+0.3*Math.sin(q.t*40+q.ph));
  });
}

