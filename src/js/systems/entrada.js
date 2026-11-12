/* ---------- input ---------- */
var kb={left:false,right:false,brake:false,boost:false,lift:false}, btn={left:false,right:false,brake:false,boost:false,lift:false};
function tryRoll(){
  if(state==='play' && !c.grounded && c.y>1.2 && !c.rolling){c.rolling=true; c.rollAng=0; sfx('whoosh');}
}
var KEYMAP={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowDown:'brake',KeyS:'brake',ShiftLeft:'boost',ShiftRight:'boost',KeyW:'boost',ArrowUp:'boost',Space:'lift'};
window.addEventListener('keydown',function(e){
  if(e.target && e.target.tagName==='INPUT') return;
  if(e.target && e.target.tagName==='BUTTON' && state!=='play') return;
  var k=KEYMAP[e.code];
  if(k){kb[k]=true; e.preventDefault();}
  if((e.code==='KeyE'||e.code==='KeyR') && !e.repeat){tryRoll(); e.preventDefault();}
});
window.addEventListener('keyup',function(e){var k=KEYMAP[e.code]; if(k){kb[k]=false; e.preventDefault();}});
window.addEventListener('blur',function(){for(var k in kb) kb[k]=false;});
function bindBtn(id,key,onDown){
  var el=$(id);
  function down(e){
    e.preventDefault();
    try{el.setPointerCapture(e.pointerId);}catch(err){}
    if(key) btn[key]=true;
    el.classList.add('on');
    if(onDown) onDown();
  }
  function up(){ if(key) btn[key]=false; el.classList.remove('on'); }
  el.addEventListener('pointerdown',down);
  el.addEventListener('pointerup',up);
  el.addEventListener('pointercancel',up);
  el.addEventListener('lostpointercapture',up);
  el.addEventListener('contextmenu',function(e){e.preventDefault();});
}
bindBtn('bL','left'); bindBtn('bR','right'); bindBtn('bBrake','brake'); bindBtn('bBoost','boost'); bindBtn('bLift','lift'); bindBtn('bRoll',null,tryRoll);

