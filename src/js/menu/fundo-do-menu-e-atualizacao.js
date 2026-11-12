/* ---------- menu background: the car drives itself, jumps ramps and does tricks ---------- */
var dmo={ang:0,air:0,mode:0,lift:false}, homeOff=0;
function demoPilot(){
  var i, tgt=null, best=1e9, r, o, d, lim=ROAD_HALF-2;
  if(!c.grounded) return clamp(-c.x*0.08,-0.4,0.4);
  for(i=0;i<ramps.length;i++){r=ramps[i]; d=c.z-r.z0; if(d>-4 && d<190 && d<best){best=d; tgt=r.x;}}
  if(tgt===null) tgt=Math.sin(demoT*0.5)*3;
  for(i=0;i<cars.length;i++){
    o=cars[i]; if(!o.m||o.dead) continue;
    d=c.z-o.m.position.z;
    if(d>4 && d<70 && Math.abs(o.m.position.x-c.x)<2.9){tgt=o.m.position.x+(c.x>=o.m.position.x?3.4:-3.4); break;}
  }
  tgt=clamp(tgt,-lim,lim);
  return clamp((tgt-c.x)*0.3,-1,1);
}
function demoTricks(dt){
  dmo.lift=false;
  if(c.grounded){
    if(dmo.air>0) dmo.air=0;
    var ta=Math.round(dmo.ang/TAU)*TAU; dmo.ang+=(ta-dmo.ang)*Math.min(1,14*dt); if(Math.abs(dmo.ang-ta)<0.01) dmo.ang=0;
    return;
  }
  if(dmo.air===0){dmo.air=0.001; dmo.mode=(Math.random()*4)|0; dmo.ang=0; if(dmo.mode===0||dmo.mode===3){c.rolling=true; c.rollAng=0;}}
  dmo.air+=dt;
  if(dmo.mode>=1 && dmo.air>0.12){
    var dir=dmo.mode===2?-1:1;
    if(Math.abs(dmo.ang)<TAU) dmo.ang+=dir*(TAU/0.9)*dt;
    if(Math.abs(dmo.ang)>TAU) dmo.ang=dir*TAU;
  }
  dmo.lift=(dmo.air<1.0 && c.y<14 && c.air>20);
}
function update(dt){
  if(studio){studioUpdate(dt); return;}
  if(state==='count'){
    countT-=dt;
    var cn=Math.ceil(countT);
    if(countT<=0){state='play'; showCount('GO!',true); sfx('start'); toast('Segure Impulso e Elevar','info');}
    else if(cn!==lastCount){lastCount=cn; showCount(String(cn)); sfx('count');}
  }
  scrapeCd-=dt;
  var playing=(state==='play');
  var inp=playing?{left:kb.left||btn.left,right:kb.right||btn.right,brake:kb.brake||btn.brake,boost:kb.boost||btn.boost,lift:kb.lift||btn.lift}:{};
  var wantBoost=!!inp.boost && c.air>0 && c.slow<=0 && c.zap<=0, wantLift=!!inp.lift && c.air>0 && c.zap<=0;

  /* heading */
  var steer=(inp.right?1:0)-(inp.left?1:0);
  var demo=(state==='menu'||state==='over');
  if(!playing){demoT+=dt; steer=demo?demoPilot():Math.sin(demoT*0.5)*0.2;}
  c.psi+=(steer*0.36-c.psi)*Math.min(1,(c.goo>0?1.1:3.4)*dt);
  if(c.goo>0) c.psi+=Math.sin(performance.now()*0.004+c.goo)*0.35*dt;
  if(c.slip>0){c.slip-=dt; c.psi+=Math.sin(c.slip*28)*0.9*dt;}

  /* speed */
  var offroad=c.grounded && Math.abs(c.x)>ROAD_HALF+0.5;
  var cruise=(offroad?22:(playing?46:(demo?44:34)))+(c.nitro>0?10:0)+((playing&&monkey&&!offroad)?43:0)+(c.turbo>0?54:0)+(offroad?0:up.motor*2.5);
  if(c.slow>0) cruise*=0.6;
  var a;
  if(wantBoost) a=62;
  else if(inp.brake) a=c.grounded?-44:-14;
  else if(c.speed<cruise) a=c.grounded?16:2;
  else a=-(c.grounded?11:6);
  c.speed=clamp(c.speed+a*dt,0,106);
  if(c.slow>0) c.speed=Math.min(c.speed,cruise);

  /* compressed air */
  if(wantBoost) c.air-=55*dt;
  if(wantLift){
    c.air-=85*dt;
    if(c.grounded){c.grounded=false; c.vy=Math.max(c.vy,1.5);}
  }
  if(c.air<0) c.air=0;
  else if(c.grounded && !wantBoost && !wantLift) c.air=Math.min(TANK,c.air+45*dt);
  if(playing){c.shield=Math.max(0,c.shield-dt); c.mult=Math.max(0,c.mult-dt); c.nitro=Math.max(0,c.nitro-dt); c.turbo=Math.max(0,c.turbo-dt); c.slow=Math.max(0,c.slow-dt); c.zap=Math.max(0,c.zap-dt); c.goo=Math.max(0,c.goo-dt);}
  if(c.nitro>0) c.air=TANK;
  if(c.zap>0) c.air=0;
  if(demo){demoTricks(dt); if(dmo.lift){wantLift=true; c.air=Math.max(c.air,60);}} else dmo.ang=0;

  /* movement */
  if(c.gv!==0){c.gv*=Math.max(0,1-(c.goo>0?0.5:2.5)*dt); if(Math.abs(c.gv)<0.05) c.gv=0;}
  if(c.goo>0 && c.grounded && playing){c.gvT-=dt; if(c.gvT<=0){c.gvT=rand(0.7,1.3); c.gv=clamp(c.gv+rand(-5,5),-14,14);}}
  var nx=c.x+Math.sin(c.psi)*c.speed*dt+c.gv*dt, lim=ROAD_HALF-1.3;
  if(nx>lim||nx<-lim){
    nx=clamp(nx,-lim,lim); c.psi*=0.4; c.gv*=-0.3; c.speed=Math.max(0,c.speed*(1-0.5*dt));
    if(c.grounded){burst(nx+(nx>0?1.1:-1.1),0.5,c.z,3,0xffd070,9,0.5); if(scrapeCd<=0 && playing){sfx('scrape'); scrapeCd=0.25;}}
  }
  c.x=nx;
  var dz=Math.cos(c.psi)*c.speed*dt;
  c.z-=dz; if(playing) c.dist+=dz;
  var gh=groundH(c.x,c.z);
  if(c.grounded){
    if(gh<c.y-0.06){c.grounded=false; c.vy=Math.max(0,c.slopeVy);}
    else{c.slopeVy=clamp((gh-c.y)/Math.max(dt,0.001),0,12); c.y=gh; c.vy=0;}
  }
  if(!c.grounded){
    c.vy+=((wantLift?18:0)-9.8)*dt;
    c.vy=clamp(c.vy,-30,9);
    c.y+=c.vy*dt;
    if(c.y>70){c.y=70; c.vy=Math.min(c.vy,0);}
    if(c.y<=gh && c.vy<=0) land(gh);
  }

  /* roll */
  if(c.rolling){
    c.rollAng+=(TAU/0.85)*dt;
    if(c.rollAng>=TAU){
      c.rolling=false; c.rollAng=0;
      if(playing){addScore(250); toast('Giro completo +250','good'); sfx('bonus');}
    }
  }

  /* traffic: movement, lane changes, collision, jump bonus */
  /* half of the traffic at the start; it fills up gradually and reaches 100% at 25000 points */
  var actCars=Math.round(TRAFFIC*(0.5+0.5*Math.min(1,score/25000)));
  cars.forEach(function(o,ci){
    if(ci>=actCars){if(o.m){scene.remove(o.m); o.m=null;} return;}
    if(!o.m){resetCar(o,c.z-rand(120,260));}
    var m=o.m;
    if(o.dead){
      if(o.vel){
        o.vel.y-=22*dt;
        m.position.addScaledVector(o.vel,dt);
        if(!o.heavy){m.rotation.x+=o.vel.z*0.004; m.rotation.z+=o.vel.x*0.02;} m.rotation.y+=(o.sp||0)*dt;
        if(m.position.y<=0){m.position.y=0; o.vel.y=0; o.vel.x*=0.92; o.vel.z*=0.92;}
      }
    }else{
      m.position.z-=o.v*dt;
      o.lcT-=dt;
      if(o.lcT<=0){
        o.lcT=rand(4,10)/(1+1.2*diffT());
        var nl=o.lane+(Math.random()<0.5?-1:1);
        if(!o.sigDir && nl>=0 && nl<LANES && laneFree(o,nl,m.position.z,16)){o.pend=nl; o.sigDir=nl>o.lane?1:-1; o.sigT=rand(1.1,1.7); o.sigClk=0;}
      }
      if(o.sigDir){
        o.sigClk+=dt;
        if(o.pend>=0){
          o.sigT-=dt;
          if(o.sigT<=0){
            if(laneFree(o,o.pend,m.position.z,16)){o.lane=o.pend; o.tx=laneX(o.pend);} else o.sigDir=0;
            o.pend=-1;
          }
        }else if(Math.abs(o.tx-m.position.x)<0.35) o.sigDir=0;
      }
      var dxl=o.tx-m.position.x;
      m.position.x+=clamp(dxl,-(4+3*diffT())*dt,(4+3*diffT())*dt);
      m.rotation.y=-clamp(dxl,-1,1)*0.14;
    }
    {
      var bu=m.userData, want=(!o.dead && o.sigDir)?((Math.floor(o.sigClk*3)%2===0)?o.sigDir:0):0, key=want+(o.sigDir&&!o.dead?10:0);
      if(bu.bl && o.blOn!==want){
        o.blOn=want;
        bu.bl[0].color.setHex(want<0?BL_ON:BL_OFF); bu.bl[1].color.setHex(want>0?BL_ON:BL_OFF);
        bu.blg[0].forEach(function(gm){gm.visible=want<0;}); bu.blg[1].forEach(function(gm){gm.visible=want>0;});
      }
    }
    var ddz=c.z-m.position.z, ddx=c.x-m.position.x;
    if(playing && !o.dead && Math.abs(ddz)<o.hl && Math.abs(ddx)<o.hw){
      if(c.y<o.clear) crash(o); else o.jumped=true;
    }else if(playing && !o.dead && !o.near && c.y<o.clear && Math.abs(ddz)<o.hl*0.7 && Math.abs(ddx)<o.hw+1.5){
      o.near=true; addScore(40); popup('Raspão +40'); sfx('whoosh'); burst(c.x+(ddx>0?-0.9:0.9),c.y+0.5,c.z,8,0xffe08a,9,0.5); shake=Math.max(shake,0.18);
    }
    if(!o.done && c.z<m.position.z-o.hl){
      o.done=true;
      if(playing && !o.dead){
        if(o.jumped){
          var bonus=o.pts>=500?4:(o.pts>=300?3:2); bonus=Math.max(1,Math.round(bonus*(1.1-0.5*diffT())));
          addScore(o.pts); timeLeft+=bonus;
          toast('Salto sobre '+o.name+' +'+o.pts+' · +'+bonus+' s','good'); sfx('bonus');
        }else addScore(20);
      }
    }
    if(m.position.z>c.z+60 || m.position.z<c.z-640) resetCar(o,c.z-300);
  });

  /* power-ups: spin, collect, recycle */
  pups.forEach(function(p){
    p.t+=dt;
    p.m.userData.core.rotation.y+=2.2*dt;
    p.m.position.y=p.py+Math.sin(p.t*2.4)*0.25;
    if(playing && Math.abs(c.z-p.z)<4+up.magnet*0.5 && Math.abs(c.x-p.x)<2.6+up.magnet*0.4 && Math.abs((c.y+0.7)-p.py)<2.6+up.magnet*0.25){collect(p); return;}
    if(p.z>c.z+30 || p.z<c.z-1700) resetPup(p,c.z-250);
  });

  updateEvents(dt,playing);

  /* score and clock */
  if(playing){
    addScore(c.speed*dt*0.1+(c.grounded?0:30*dt));
    timeLeft-=dt;
    if(timeLeft<=0){timeLeft=0; endGame();}
  }

  /* world streaming */
  while(spawnZ>c.z-460){addRamp(rand(-10,10),spawnZ); spawnZ-=rand(170,260);}
  ramps=ramps.filter(function(o){if(o.z0-RAMP_L>c.z+40){scene.remove(o.group); return false;} return true;});

  /* ground + road follow */
  ground.position.x=c.x; ground.position.z=c.z;
  groundTex.offset.set(c.x/GCELL,-c.z/GCELL);
  road.position.z=c.z;
  roadTex.offset.y=-c.z/RS;
  var base=Math.floor(c.z/20)*20;
  posts.forEach(function(p){p.m.position.set(p.side*(ROAD_HALF+0.9),0.5,base+40-p.i*20);});
  rails.forEach(function(r){r.position.z=c.z;});
  envUpdate(dt);
  sky.position.copy(camera.position);

  updateStreaks();

  /* player pose */
  var tp=(c.grounded?Math.atan2(c.slopeVy,Math.max(c.speed,5)):clamp(c.vy*0.045,-0.4,0.5))+(c.grounded?((inp.brake?-0.05:0)+(wantBoost?0.04:0)):0);
  c.pitch+=(tp-c.pitch)*Math.min(1,8*dt);
  player.position.set(c.x,c.y+(c.grounded?Math.sin(performance.now()*0.03*(0.5+c.speed/40))*0.018*Math.min(1,c.speed/30):0),c.z);
  player.rotation.y=-c.psi+c.gv*0.035+(c.slip>0?Math.sin(c.slip*14)*0.9*Math.min(1,c.slip):0);
  player.rotation.x=c.pitch+fx.jp+dmo.ang;
  player.rotation.z=c.psi*0.35+c.rollAng+fx.jr;
  player.userData.tail.color.setHex(inp.brake?0xffb0b0:tailBase);
  player.updateMatrixWorld(true);
  shadow.position.set(c.x,gh+0.03,c.z);
  var ah=Math.max(0,c.y-gh);
  shadow.material.opacity=0.45/(1+ah*0.25);
  shadow.scale.set(1.3+ah*0.04,2.6+ah*0.08,1);

  /* plumes */
  if(wantBoost){REAR.forEach(function(n){emit(n,BACK,11,0.55,0.9);}); shake=Math.max(shake,0.1);}
  if(wantLift){BELLY.forEach(function(n){emit(n,DOWN,12,0.45,0.8);});}
  if(c.grounded && c.speed>18 && state!=='over' && Math.random()<0.7) burst(c.x+rand(-0.9,0.9),0.15,c.z+2.4,1,dustHex,2.5,0.7);
  updateParticles(dt);
  updateFx(dt,playing);
  updateAudio(wantBoost||wantLift);

  /* camera */
  shake=Math.max(0,shake-dt*2.2);
  var cp=c.psi*0.6, tNow=performance.now()*0.001;
  fx.cine+=(((state==='play'&&ev.kind&&!RM)?1:0)-fx.cine)*Math.min(1,1.6*dt);
  var ce=ease(fx.cine);
  var tx=c.x-Math.sin(cp)*9.5, ty=c.y*0.65+3.6, tz=c.z+Math.cos(cp)*9.5;
  if(ce>0.001){
    tx+=(c.x*0.85+Math.sin(tNow*0.35)*7-tx)*ce;
    ty+=(c.y*0.5+11.5+Math.sin(tNow*0.5)*1.1-ty)*ce;
    tz+=(c.z+12.5+Math.cos(tNow*0.3)*2-tz)*ce;
  }
  var k=1-Math.exp(-(6-3*ce)*dt);
  camera.position.x+=(tx-camera.position.x)*k;
  camera.position.y+=(ty-camera.position.y)*k;
  camera.position.z+=(tz-camera.position.z)*k;
  var sk=RM?0.25:1, sx=(Math.random()-0.5)*shake*0.6*sk, sy=(Math.random()-0.5)*shake*0.25*sk;
  camera.position.x+=sx; camera.position.y+=sy-fx.kickS*0.3;
  var camFloor=groundH(camera.position.x,camera.position.z)+1.8; if(camera.position.y<camFloor) camera.position.y=camFloor;
  camRoll+=((RM?0:-c.psi*0.22*(1-0.7*ce))-camRoll)*Math.min(1,5*dt);
  camera.up.set(Math.sin(camRoll),Math.cos(camRoll),0);
  camera.lookAt(c.x*0.85*ce+(c.x+Math.sin(c.psi)*12)*(1-ce),(c.y*0.7+1.3)*(1-ce)+2*ce,c.z-14*(1-ce)-30*ce);
  var fov=60+(c.speed/106)*20+(wantBoost?4:0)+7*ce+fx.kickS*2;
  var barsOn=fx.cine>0.5; if(barsOn!==fxBars){fxBars=barsOn; elBars.classList.toggle('on',barsOn);}
  if(Math.abs(camera.fov-fov)>0.05){camera.fov+=(fov-camera.fov)*Math.min(1,4*dt); camera.updateProjectionMatrix();}

  /* HUD */
  elSpd.textContent=Math.round(c.speed*3.6);
  elAlt.textContent=fmt1(Math.max(0,c.y));
  elTime.textContent=Math.ceil(timeLeft);
  if(playing){
    var dtl=timeLeft-fx.prevTL;
    if(dtl<-0.6 && dtl>-30){elTime.classList.remove('tshake'); void elTime.offsetWidth; elTime.classList.add('tshake'); popup('−'+String(Math.round(-dtl*10)/10).replace('.',',')+' s','#ff5a5f');}
    else if(dtl>0.9){elTime.classList.remove('tgain'); void elTime.offsetWidth; elTime.classList.add('tgain');}
  }
  fx.prevTL=timeLeft;
  elTime.classList.toggle('low',timeLeft<=10 && playing);
  elDanger.classList.toggle('on',timeLeft<=10 && playing);
  var ct=Math.ceil(timeLeft);
  if(playing && timeLeft<=10 && ct!==lastCt){lastCt=ct; sfx('tick');}
  if(timeLeft>10) lastCt=99;
  var sc=Math.floor(score);
  if(sc-lastBump>=50){lastBump=sc; retrigger(elScore,'big bump');}
  if(sc<lastBump) lastBump=sc;
  elScore.textContent=sc;
  var pct=c.air/TANK*100;
  elFill.style.width=pct+'%';
  elFill.classList.toggle('low',pct<15);
  elLit.textContent=Math.round(c.air)+' L';
  elFx.style.opacity=String(clamp((c.speed-50)/55,0,1)*0.6);
  shieldMesh.visible=(c.shield>0||c.turbo>0);
  if(c.shield>0||c.turbo>0){shieldMesh.material.opacity=(c.turbo<=0 && c.shield<2 && Math.floor(c.shield*6)%2)?0.05:(c.turbo>0?0.3:0.18); shieldMesh.scale.setScalar(1+0.04*Math.sin(performance.now()*0.012));}
  var chips='';
  [['shield','Escudo · 1 batida',c.shield],['x2','Pontos ×2',c.mult],['nitro','Ar infinito',c.nitro]].forEach(function(f){
    if(f[2]>0) chips+='<span class="chip" style="color:#'+('000000'+PU[f[0]].color.toString(16)).slice(-6)+'">'+f[1]+' '+Math.ceil(f[2])+' s</span>';
  });
  if(state==='play') chips+='<span class="chip" style="color:#a9b0d0">Perigo '+(1+Math.floor(diffT()*4.99))+'/5</span>';
  if(save.dev && devNext) chips+='<span class="chip" style="color:#ff5a5f">DEV · próximo: '+devName(devNext)+'</span>';
  if(c.goo>0) chips+='<span class="chip" style="color:#7dff4a">Gosma · sem aderência '+Math.ceil(c.goo)+' s</span>';
  if(c.fire>0) chips+='<span class="chip" style="color:#ff8a2a">Em chamas</span>';
  if(c.zap>0) chips+='<span class="chip" style="color:#4aff6a">Ar bloqueado '+Math.ceil(c.zap)+' s</span>';
  if(c.slow>0) chips+='<span class="chip" style="color:#d9a0ff">Polvo grudado '+Math.ceil(c.slow)+' s</span>';
  if(c.turbo>0) chips+='<span class="chip" style="color:#ffe14a">SUPER BOOST '+Math.ceil(c.turbo)+' s</span>';
  if(monkey){
    var tn=monkey.tension>0.05;
    chips+='<span class="chip" style="color:'+(tn?'#ff5a5f':'#ffc24a')+'">Macaco · '+(tn?Math.round(Math.min(1,monkey.tension)*100)+'%':'mantenha 250 km/h')+'</span>';
  }
  if(minis.length) chips+='<span class="chip" style="color:#ff5a5f">Mini drones ×'+minis.length+'</span>';
  if(chips!==fxKey){fxKey=chips; elChips.innerHTML=chips;}
}

