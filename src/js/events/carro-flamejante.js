/* ---------- evento: carro flamejante ---------- */
var fireV=null, firePats=[], fireCd=0, fireFl=null;
var fMatS=new THREE.MeshBasicMaterial({color:0x14100e,transparent:true,opacity:0.6,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
var fMatPool=new THREE.MeshBasicMaterial({map:texGlow,color:0xff6a18,transparent:true,opacity:0.55,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
var fDisc=new THREE.CircleGeometry(1,20), fPlane=new THREE.PlaneGeometry(1,1);
function mkFlame(parent,x,y,z,w,h,hot,ph){
  var s=mkSprite(texFlame,hot?0xffc878:0xff8a38,true,hot?0.6:0.78); s.center.set(0.5,0.08); s.position.set(x,y,z); s.scale.set(w,h,1); parent.add(s);
  return {s:s,w:w,h:h,ph:ph===undefined?rand(0,6):ph};
}
function flick(f,t,k){
  var s=(0.8+0.3*Math.sin(t*21+f.ph)+0.14*Math.sin(t*37+f.ph*2))*k;
  f.s.scale.set(f.w*(0.88+0.16*Math.sin(t*13+f.ph))*Math.max(0.25,k),Math.max(0.01,f.h*s),1);
  f.s.material.rotation=Math.sin(t*9+f.ph)*0.07;
}
function makeFireCar(){
  var g=new THREE.Group();
  var paint=phEnv({color:0x16181f,emissive:0x2c0c03,specular:0xffffff,shininess:110},0.42), glass=carGlass(), trim=lamb(0x2a2d38), blk=lamb(0x07080b);
  var glow=new THREE.MeshBasicMaterial({color:0xff6a1a}), hot=new THREE.MeshBasicMaterial({color:0xffc060}), red=new THREE.MeshBasicMaterial({color:0xff2a1a}), chrome=phEnv({color:0xcfd4e0,specular:0xffffff,shininess:140},0.8);
  var low=addBox(g,2.3,0.7,5.0,0,0.75,0,paint); addBox(g,2.12,0.34,2.2,0,1.2,-1.35,paint); addBox(g,0.8,0.16,1.0,0,1.42,-1.45,paint);
  addBox(g,0.6,0.1,0.7,0,1.5,-1.45,glow);
  addBox(g,1.85,0.62,1.9,0,1.28,0.6,glass); addBox(g,1.72,0.1,1.5,0,1.62,0.65,paint); addBox(g,2.44,0.14,0.5,0,1.4,2.35,paint);
  addBox(g,0.1,0.34,0.36,-1.05,1.2,2.2,paint); addBox(g,0.1,0.34,0.36,1.05,1.2,2.2,paint);
  addBox(g,2.0,0.1,0.5,0,0.38,-2.65,blk); addBox(g,1.9,0.26,0.1,0,0.84,-2.52,blk); addBox(g,1.9,0.05,0.12,0,0.96,-2.53,chrome);
  [-0.75,0.75].forEach(function(x){addBox(g,0.46,0.24,0.1,x,0.95,-2.55,hot); var h=mkSprite(texGlow,0xffd080,true,0.9); h.scale.set(2.2,2.2,1); h.position.set(x,0.95,-2.7); g.add(h);});
  addBox(g,2.0,0.08,4.6,0,0.36,0,glow);
  [-1.16,1.16].forEach(function(x){addBox(g,0.04,0.07,4.0,x,0.98,0.1,glow); addBox(g,0.04,0.07,4.0,x,0.58,0.1,glow);});
  addBox(g,0.5,0.2,0.1,-0.8,0.95,2.52,red); addBox(g,0.5,0.2,0.1,0.8,0.95,2.52,red);
  [-1.6,1.6].forEach(function(z){[-1,1].forEach(function(sd){
    addWheel(g,sd*1.18,0.42,z,0.45,0.3);
    var rim=new THREE.Mesh(geoCyl,glow); rim.scale.set(0.3,0.05,0.3); rim.rotation.z=Math.PI/2; rim.position.set(sd*1.34,0.42,z); g.add(rim);
  });});
  var under=new THREE.Mesh(fPlane,fMatPool); under.rotation.x=-Math.PI/2; under.position.y=0.12; under.scale.set(10,10,1); g.add(under);
  var fl=[];
  [[0,1.5,-1.4,1.4,2.6],[-0.9,1.0,0.2,1.2,2.3],[0.9,1.0,0.2,1.2,2.3],[0,1.7,0.6,1.5,3.2],[-1.0,0.8,-1.6,1.1,2.0],[1.0,0.8,-1.6,1.1,2.0],[-0.8,1.2,1.5,1.2,2.6],[0.8,1.2,1.5,1.2,2.6],[0,1.3,2.0,1.4,2.9]].forEach(function(d){
    fl.push(mkFlame(g,d[0],d[1],d[2],d[3],d[4],false)); fl.push(mkFlame(g,d[0],d[1]+0.05,d[2],d[3]*0.55,d[4]*0.6,true));
  });
  var tr=[];
  for(var i=0;i<9;i++){var t=mkSprite(texFlame,i%2?0xffb860:0xff8a38,true,0.7-i*0.05); t.center.set(0.5,0.12); g.add(t); tr.push({s:t,i:i,ph:rand(0,6)});}
  g.userData={fl:fl,tr:tr}; g.scale.setScalar(1.2);
  return g;
}
function animFireCar(m,t){
  var u=m.userData;
  u.fl.forEach(function(f){flick(f,t,1);});
  u.tr.forEach(function(f){
    var i=f.i, s=0.85+0.25*Math.sin(t*19+f.ph);
    f.s.position.set(Math.sin(t*7+i)*0.35,1.2+i*0.2,3.2+i*1.15);
    var w=(2.3-i*0.17)*(0.9+0.15*Math.sin(t*11+f.ph)), h=(3.6-i*0.28)*s;
    f.s.scale.set(Math.max(0.2,w),Math.max(0.2,h),1); f.s.material.rotation=Math.sin(t*8+f.ph)*0.1;
  });
}
function addFirePatch(x,z){
  if(firePats.length>=42){var o=firePats.shift(); scene.remove(o.g);}
  var g=new THREE.Group(); g.position.set(x,groundH(x,z),z);
  var sc=new THREE.Mesh(fDisc,fMatS); sc.rotation.x=-Math.PI/2; sc.position.y=0.04; sc.scale.set(2.3,3.0,1); g.add(sc);
  var gl=new THREE.Mesh(fPlane,fMatPool); gl.rotation.x=-Math.PI/2; gl.position.y=0.09; gl.scale.set(11,11,1); g.add(gl);
  var fl=[];
  for(var i=0;i<3;i++){var fx0=rand(-1.1,1.1), fz0=rand(-1.3,1.3); fl.push(mkFlame(g,fx0,0.05,fz0,rand(2.6,3.4),rand(4.2,6.2),false)); fl.push(mkFlame(g,fx0,0.06,fz0,rand(1.4,1.9),rand(2.4,3.4),true));}
  scene.add(g);
  firePats.push({g:g,x:x,z:z,life:rand(5.5,6.5),sc:sc,gl:gl,fl:fl,sm:rand(0,0.3),em:rand(0,0.4)});
}
function startFire(){
  evJoin('fire'); ev.lastFire=elapsed; bossHits=0;
  var m=makeFireCar(); scene.add(m);
  fireV={m:m,t:0,dur:25,rz:-300,x:clamp(c.x,-12,12),lx:0,tx:0,swT:0,sm:0,sp:0,lastZ:c.z-300};
  fireV.lx=fireV.x; m.position.set(fireV.x,0,c.z+fireV.rz);
  eventIntro('Carro flamejante','Desvie das trilhas de fogo!'); sfx('screech'); sfx('whoosh');
}
function updateFire(dt,playing){
  updateSmokes(dt); fireCd=Math.max(0,fireCd-dt);
  var i;
  if(fireV){
    var v=fireV; v.t+=dt; var T=v.dur;
    var rzT=-92+Math.sin(v.t*0.7)*10;
    if(v.t<3) rzT=-92-208*(1-ease(v.t/3));
    else if(v.t>T-3) rzT=-92-400*ease((v.t-(T-3))/3);
    v.rz+=(rzT-v.rz)*Math.min(1,5*dt);
    v.swT-=dt;
    if(v.swT<=0){v.swT=rand(0.9,1.8)/Math.pow(dif(),0.3); v.tx=(Math.random()<0.45+0.25*diffT())?clamp(c.x+rand(-3,3),-ROAD_HALF+3,ROAD_HALF-3):rand(-ROAD_HALF+3,ROAD_HALF-3);}
    var ox=v.x; v.x+=clamp(v.tx-v.x,-15*dt,15*dt);
    var zz=c.z+v.rz;
    v.m.position.set(v.x,groundH(v.x,zz),zz); v.m.rotation.y=-clamp((v.x-ox)/Math.max(dt,0.001)/20,-1,1)*0.3;
    animFireCar(v.m,v.t);
    if(zz>v.lastZ){v.lastZ=zz; v.lx=v.x;}
    else if(playing && v.t>1.6 && v.t<T-2.5){
      var n=Math.min(6,Math.floor((v.lastZ-zz)/4.6));
      for(var k=1;k<=n;k++){var f=k/n; addFirePatch(v.lx+(v.x-v.lx)*f,v.lastZ-4.6*k);}
      if(n>0){v.lastZ-=4.6*n; v.lx=v.x;}
    }else v.lastZ=zz;
    v.sm-=dt; if(v.sm<=0){v.sm=0.06; smokePuff(v.x+rand(-0.8,0.8),1.8,zz+6,true); ember(v.x+rand(-1,1),1.2,zz+4); burst(v.x,1.3,zz+4,2,0xffa040,8,0.8);}
    if(v.t>=T){scene.remove(v.m); fireV=null; finishMajor(playing,'Nenhuma queimadura','O carro flamejante sumiu');}
  }
  var tt=performance.now()*0.001;
  for(i=firePats.length-1;i>=0;i--){
    var p=firePats[i]; p.life-=dt;
    var kk=clamp(p.life/1.4,0,1);
    p.fl.forEach(function(f){flick(f,tt,kk);});
    var gs=11*(0.55+0.45*kk)*(0.95+0.08*Math.sin(tt*15+p.x)); p.gl.scale.set(gs,gs,1);
    p.sc.scale.set(2.3,3.0,1); p.sc.scale.multiplyScalar(0.7+0.3*clamp(p.life/2.5,0,1));
    p.sm-=dt; if(p.sm<=0 && p.life>0.8 && Math.abs(p.z-c.z)<170){p.sm=rand(0.2,0.34); smokePuff(p.x+rand(-0.8,0.8),3.2,p.z+rand(-1,1),false);}
    p.em-=dt; if(p.em<=0 && p.life>0.8 && Math.abs(p.z-c.z)<120){p.em=rand(0.15,0.4); ember(p.x+rand(-1,1),1.2,p.z+rand(-1.2,1.2));}
    if(p.life>0.8){
      if(playing && fireCd<=0 && c.y<1.7 && Math.abs(c.z-p.z)<2.7 && Math.abs(c.x-p.x)<2.0){
        fireCd=1.4;
        if(hurt('Queimado pelo fogo',2.5,0.7)){bossHits++; c.fire=2.4;}
      }
      for(var ci=0;ci<cars.length;ci++){
        var o=cars[ci];
        if(o.dead||!o.m) continue;
        if(Math.abs(o.m.position.z-p.z)<3.2 && Math.abs(o.m.position.x-p.x)<2.4){
          o.dead=true; o.vel=new THREE.Vector3(rand(-3,3),rand(6,9),-rand(5,12)); o.sp=rand(-4,4);
          burst(o.m.position.x,1,o.m.position.z,20,0xff8a2a,12,1.2); burst(o.m.position.x,1.5,o.m.position.z,10,0xffe08a,9,0.9); shock(o.m.position.x,0.1,o.m.position.z,0xff9a4a,6,0.5); smokePuff(o.m.position.x,1.8,o.m.position.z,true); smokePuff(o.m.position.x,2.4,o.m.position.z,true);
        }
      }
    }
    if(p.life<=0 || p.z>c.z+30){scene.remove(p.g); firePats.splice(i,1);}
  }
  if(c.fire>0){
    c.fire=Math.max(0,c.fire-dt);
    if(!fireFl){
      fireFl=new THREE.Group(); fireFl.fl=[];
      [[0,0.9,-1.0],[-0.7,0.9,0.2],[0.7,0.9,0.2],[0,1.0,1.3]].forEach(function(d,j){fireFl.fl.push(mkFlame(fireFl,d[0],d[1],d[2],1.1,2.0,j%2===1));});
      player.add(fireFl);
    }
    fireFl.fl.forEach(function(f){flick(f,tt,1);});
    if(Math.random()<0.5){ember(c.x+rand(-0.8,0.8),c.y+1,c.z+rand(-1.5,1.5)); if(Math.random()<0.35) smokePuff(c.x,c.y+1.8,c.z+1,false);}
  }else if(fireFl){player.remove(fireFl); fireFl=null;}
}

