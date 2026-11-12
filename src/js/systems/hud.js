/* ---------- HUD helpers ---------- */
var toastTimer=0;
function toast(msg,kind){
  var t=$('toast'); t.textContent=msg; t.className='show '+(kind||'info');
  clearTimeout(toastTimer); toastTimer=setTimeout(function(){t.className='';},1500);
}
function getBest(){try{return parseInt(localStorage.getItem('roadster-rocket-best')||'0',10)||0;}catch(e){return 0;}}
function setBest(v){try{localStorage.setItem('roadster-rocket-best',String(v));}catch(e){}}
var best=getBest(); $('best').textContent=best; $('menuBest').textContent=best;
var elChips=$('fxrow'), fxKey='';
var elSpd=$('spd'), elAlt=$('alt'), elTime=$('time'), elScore=$('score'), elFill=$('tankfill'), elLit=$('liters'), elFx=$('speedfx');
function fmt1(v){return v.toFixed(1).replace('.',',');}

