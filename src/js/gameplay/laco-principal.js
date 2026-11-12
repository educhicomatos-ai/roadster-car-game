/* ---------- main loop ---------- */
resetRun();
var last=performance.now();
var lowGfx=false, perfAcc=0, perfN=0;
function frame(now){
  requestAnimationFrame(frame);
  var raw=(now-last)/1000, dt=Math.min(0.05,Math.max(0.001,raw)); last=now;
  if(state==='play'&&!paused&&!lowGfx&&raw<0.5){perfAcc+=raw; perfN++; if(perfAcc>4){ if(perfAcc/perfN>0.036){lowGfx=true; sunLight.castShadow=false; renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.1)); resize();} perfAcc=0; perfN=0; }}
  var ts=1; if(fx.hit>0){ts=0.12; fx.hit-=dt;}
  if(!paused) update(dt*ts);
  lookFx(now/1000);
  musicTick();
  var hv=(state==='menu'||state==='over')&&!studio&&!$('overlay').hidden&&!$('homeSheet').hidden&&camera.aspect>1.25;
  homeOff+=((hv?1:0)-homeOff)*Math.min(1,4*dt);
  if(homeOff>0.003){var vw=canvas.parentElement.clientWidth, vh=canvas.parentElement.clientHeight; camera.setViewOffset(vw,vh,-vw*0.2*homeOff,0,vw,vh);}
  else if(camera.view&&camera.view.enabled) camera.clearViewOffset();
  renderer.render(scene,camera);
}
requestAnimationFrame(frame);
