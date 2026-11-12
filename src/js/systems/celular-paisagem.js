/* ---------- phones: always landscape ---------- */
var coarse=false; try{coarse=window.matchMedia('(pointer:coarse)').matches;}catch(e){}
function fitOrientation(){
  var w=window.innerWidth, h=window.innerHeight, rot=coarse && h>w, b=document.body;
  b.classList.toggle('rot',rot);
  if(rot){b.style.width=h+'px'; b.style.height=w+'px';}
  else{b.style.width=''; b.style.height='';}
  resize();
}
window.addEventListener('resize',fitOrientation);
window.addEventListener('orientationchange',function(){setTimeout(fitOrientation,150);});
function lockLandscape(){
  if(!coarse) return;
  try{
    var el=document.documentElement, fs=el.requestFullscreen||el.webkitRequestFullscreen;
    var pr=fs?fs.call(el):null;
    var lock=function(){try{var r=screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape'); if(r&&r.catch) r.catch(function(){});}catch(e){}};
    if(pr&&pr.then) pr.then(lock,function(){}); else lock();
  }catch(e){}
}
fitOrientation();

