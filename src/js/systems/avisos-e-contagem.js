/* ---------- polish: popups, banners, countdown, pause, streaks ---------- */
var RM=false; try{RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
var countT=0, lastCount=0, scrapeCd=0, lastCt=99, camRoll=0, lastSc=0, lastBump=0, paused=false, countTimer=0, bannerTimer=0;
var elDanger=$('danger');
function retrigger(el,cls){el.className=cls.split(' ')[0]; void el.offsetWidth; el.className=cls;}
function popup(text,col){
  var box=$('pops'), d=document.createElement('div'); d.className='pop'; d.textContent=text; if(col){d.style.color=col; d.style.fontSize='30px';} box.appendChild(d);
  while(box.children.length>4) box.removeChild(box.firstChild);
  setTimeout(function(){if(d.parentNode) d.parentNode.removeChild(d);},1000);
}
function showCount(text,go){
  var el=$('count'); el.textContent=text; retrigger(el,'bigcenter show'+(go?' go':''));
  clearTimeout(countTimer); countTimer=setTimeout(function(){el.className='bigcenter';},850);
}
function eventIntro(title,sub){
  var el=$('banner'); $('bnTitle').textContent=title; $('bnSub').textContent=sub; retrigger(el,'banner show');
  clearTimeout(bannerTimer); bannerTimer=setTimeout(function(){el.className='banner';},2300);
  sfx('alarm'); shake=Math.max(shake,0.45);
}
function flashScreen(op){
  var f=$('flash'); f.style.transition='none'; f.style.opacity=String(op); void f.offsetWidth; f.style.transition=''; f.style.opacity='0';
}
function countUp(el,target,ms){
  var t0=performance.now();
  function step(now){
    var q=clamp((now-t0)/ms,0,1); el.textContent=Math.round(target*(1-Math.pow(1-q,3)));
    if(q<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function setPause(v){
  if(state!=='play' && state!=='count') return;
  paused=v; $('pauseTag').hidden=!v; $('pause').textContent=v?'Retomar':'Pausa';
  if(audio){try{ v?audio.ctx.suspend():(soundOn&&audio.ctx.resume()); }catch(e){}}
  if(v) for(var k in kb) kb[k]=false;
}
$('pause').addEventListener('click',function(){this.blur(); setPause(!paused);});
window.addEventListener('keydown',function(e){if(e.target && e.target.tagName==='INPUT') return; if((e.code==='KeyP'||e.code==='Escape') && !e.repeat){setPause(!paused);}});
document.addEventListener('visibilitychange',function(){if(document.hidden) setPause(true);});

var streaks=[], streakMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false});
(function(){
  var g=new THREE.BoxGeometry(0.05,0.05,1);
  for(var i=0;i<40;i++){var m=new THREE.Mesh(g,streakMat); m.visible=false; scene.add(m); streaks.push(m);}
})();
function updateStreaks(){
  var op=clamp((c.speed-55)/45,0,1)*0.4; streakMat.opacity=op;
  var vis=op>0.02, len=clamp(c.speed*0.06,0.5,6);
  for(var i=0;i<streaks.length;i++){
    var m=streaks[i]; m.visible=vis; if(!vis) continue;
    if(!m.userData.p || m.position.z>c.z+15 || Math.abs(m.position.x-c.x)>30){
      m.position.set(c.x+rand(-20,20),rand(0.4,9),c.z-rand(-10,80)); m.userData.p=true;
    }
    m.scale.z=len;
  }
}

