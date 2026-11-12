/* ---------- DEV: choose the next random event ---------- */
var DEV_EVENTS=[['meteors','Chuva de meteoros'],['bomber','Caminhão bombardeiro'],['boss','Drone de entregas'],['hero','Super-herói'],['monkey','Macaco faminto'],['dino','Corrida jurássica'],['jet','Caça bombardeiro'],['octo','Doutor Tentáculo'],['slime','Monstro de gosma'],['fire','Carro flamejante']];
var devNext=null, devPaused=false;
function devName(k){for(var i=0;i<DEV_EVENTS.length;i++) if(DEV_EVENTS[i][0]===k) return DEV_EVENTS[i][1]; return 'Aleatório';}
function renderDevLists(){
  var h='<button class="dvb'+(!devNext?' sel':'')+'" type="button" data-ev="">Aleatório (padrão)</button>';
  DEV_EVENTS.forEach(function(e){h+='<button class="dvb'+(devNext===e[0]?' sel':'')+'" type="button" data-ev="'+e[0]+'">'+e[1]+'</button>';});
  h+='<span class="lbl" style="margin-top:8px">DEV · cenário agora</span>';
  BIO.forEach(function(b,i){h+='<button class="dvb" type="button" data-bio="'+i+'">'+b.name+'</button>';});
  $('devList').innerHTML=h; $('devListCon').innerHTML=h;
}
function devUi(){
  var on=save.dev; $('devBtn').hidden=!on; $('devPickCon').hidden=!on;
  if(!on){devNext=null; closeDevPanel();}
  renderDevLists();
}
function closeDevPanel(){
  if(!$('devPanel').hidden){$('devPanel').hidden=true; if(devPaused){devPaused=false; if(paused) setPause(false);}}
}
function pickDev(e){
  var bb=e.target.closest?e.target.closest('[data-bio]'):null;
  if(bb){ENV.snap(+bb.getAttribute('data-bio')); return;}
  var b=e.target.closest?e.target.closest('[data-ev]'):null; if(!b) return;
  var v=b.getAttribute('data-ev'); devNext=v||null; renderDevLists();
  toast(devNext?('Próximo evento: '+devName(devNext)):'Próximo evento: aleatório','info');
}
$('devList').addEventListener('click',pickDev); $('devListCon').addEventListener('click',pickDev);
$('devBtn').addEventListener('click',function(){
  this.blur();
  if(!$('devPanel').hidden){closeDevPanel(); return;}
  $('devPanel').hidden=false;
  if(state==='play' && !paused){setPause(true); devPaused=true;}
});
$('devClose').addEventListener('click',closeDevPanel);
$('devNow').addEventListener('click',function(){
  if(state!=='play'){toast('Inicie uma corrida primeiro','info'); return;}
  if(ev.kind){toast('Aguarde o evento atual terminar','info'); return;}
  closeDevPanel(); startRandomEvent();
});
devUi();

var SHEETS=['homeSheet','howSheet','garageSheet','consoleSheet','endSheet','rankSheet','accountSheet'], garTab='up';
function showSheet(id){
  if(id==='garageSheet'){openStudio(); return;}
  SHEETS.forEach(function(s){$(s).hidden=(s!==id);});
  $('overlay').hidden=false; $('overlay').classList.toggle('lite',id==='garageSheet'); $('overlay').classList.toggle('home',id==='homeSheet');
  refreshMoney();
  if(id==='garageSheet') renderGarage();
  if(id==='consoleSheet'){setTimeout(function(){var i=$('cmdIn'); i.focus();},30);}
  if(id==='rankSheet') rkOpen();
  if(id==='accountSheet') acRender();
}
function hx(n){return '#'+('000000'+n.toString(16)).slice(-6);}
function swatchCss(it,cat){
  if(cat==='decal'||cat==='acc') return (cat==='decal'?'#cfd5e2':'#252d52')+' url('+lookThumb(cat,it.id)+') center/cover';
  if(it.fx==='rainbow') return 'conic-gradient(#ff3a3a,#ffd23a,#3aff7a,#3ad0ff,#8a4aff,#ff3ad0,#ff3a3a)';
  if(it.fx==='pulse') return 'linear-gradient(135deg,'+hx(it.c)+','+hx(it.c2||it.t2||it.c)+')';
  if(cat==='trim') return 'linear-gradient(135deg,'+hx(it.c)+' 50%,'+hx(it.t)+' 50%)';
  return hx(it.c);
}
function rng(seed){return function(){seed|=0; seed=seed+0x6D2B79F5|0; var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return((t^t>>>14)>>>0)/4294967296;};}
var rouCache={slot:-1,list:[]};
function slotNow(){return Math.floor(Date.now()/SPIN_SLOT_MS);}
/* the wheel holds at most 10 items and is the same for everyone; it is reshuffled every 2 hours */
function roulette(slot){
  if(rouCache.slot===slot) return rouCache.list;
  var list=[];
  RAR_ORDER.forEach(function(r,ri){
    var pool=[]; for(var cat in LOOK) LOOK[cat].items.forEach(function(it,ix){if(ix>0 && it.r===r) pool.push({cat:cat,id:it.id});});
    var rnd=rng(slot*7919+ri*104729+13);
    for(var i=pool.length-1;i>0;i--){var j=Math.floor(rnd()*(i+1)); var tmp=pool[i]; pool[i]=pool[j]; pool[j]=tmp;}
    list=list.concat(pool.slice(0,QUOTA[r]));
  });
  rouCache={slot:slot,list:list.slice(0,WHEEL_MAX)};
  return rouCache.list;
}
function cellHtml(e,cls){
  var it=lookItem(e.cat,e.id), rc=RAR[it.r].col;
  return '<div class="'+(cls||'cell')+'" style="--rc:'+rc+'"><i style="background:'+swatchCss(it,e.cat)+'"></i><span>'+it.name+'</span><em>'+LOOK[e.cat].tag+'</em></div>';
}
var spinning=false, lastWin=null, lastStrip=null, CELLW=82;
function timeLeftTxt(){
  var ms=(slotNow()+1)*SPIN_SLOT_MS-Date.now(), sec=Math.max(0,Math.floor(ms/1000)), p=function(n){return ('0'+n).slice(-2);};
  return p(Math.floor(sec/3600))+':'+p(Math.floor(sec/60)%60)+':'+p(sec%60);
}
function renderRoulView(){
  var R=roulette(slotNow()), h='';
  h+='<div class="rbox" style="margin:8px"><div class="rhead"><b>Roleta</b><span>Muda em <span id="rtimer">'+timeLeftTxt()+'</span></span></div>';
  h+='<button class="buy spin'+((!canPay(SPIN_COST))?' no':'')+'" type="button" data-sa="spin"'+(spinning?' disabled':'')+'>Girar roleta · '+(save.dev?'Grátis':'$ '+SPIN_COST.toLocaleString('pt-BR'))+'</button>';
  if(lastStrip) h+='<div class="reel" id="reel"><div class="strip" id="strip" style="left:50%;transform:translateX(-'+lastStrip.x+'px)">'+lastStrip.cells.map(function(e,i){return cellHtml(e,i===lastStrip.f?'cell hit':'cell');}).join('')+'</div><i class="mark"></i></div>';
  else h+='<div class="reel" id="reel"><div class="strip" id="strip">'+R.map(function(e){return cellHtml(e);}).join('')+'</div><i class="mark"></i></div>';
  if(lastWin){
    var wi=lookItem(lastWin.cat,lastWin.id), rc=RAR[wi.r].col;
    h+='<div class="win" style="--rc:'+rc+'"><i style="background:'+swatchCss(wi,lastWin.cat)+'"></i><div><small>'+RAR[wi.r].n+' · '+LOOK[lastWin.cat].tag+'</small><b>'+wi.name+'</b><small>'+(lastWin.dup?'Repetido! Você recebeu $ '+lastWin.refund.toLocaleString('pt-BR')+' de volta.':'Novo no inventário!')+'</small></div></div>';
  }
  h+='<p class="odds">Chances: '+RAR_ORDER.slice().reverse().map(function(r){return '<span style="color:'+RAR[r].col+'">'+RAR[r].n+' '+RAR[r].w+'%</span>';}).join(' · ')+'<br>Quanto mais raro, menos itens na roleta e mais difícil de sair.</p></div>';
  h+='<p class="catlbl" style="margin:8px">Itens na roleta agora ('+R.length+')</p><div class="rgrid" style="padding:0 8px 8px">'+R.map(function(e){return cellHtml(e,'cell mini');}).join('')+'</div>';
  return h;
}
function pickPrize(R){
  var tiers=RAR_ORDER.filter(function(r){return R.some(function(e){return lookItem(e.cat,e.id).r===r;});}), tot=0;
  tiers.forEach(function(r){tot+=RAR[r].w;});
  var x=Math.random()*tot, tier=tiers[tiers.length-1];
  for(var i=0;i<tiers.length;i++){x-=RAR[tiers[i]].w; if(x<0){tier=tiers[i]; break;}}
  var cand=R.filter(function(e){return lookItem(e.cat,e.id).r===tier;});
  return cand[Math.floor(Math.random()*cand.length)];
}
function doSpin(){
  if(spinning) return;
  if(!canPay(SPIN_COST)){toast('Dinheiro insuficiente. Jogue mais corridas para ganhar.','info'); sfx('hit'); return;}
  if(studio) stRevert();
  var R=roulette(slotNow()), prize=pickPrize(R), strip=$('strip'), reel=$('reel');
  if(!strip||!reel) return;
  spinning=true; lastWin=null; lastStrip=null; pay(SPIN_COST); persist(); refreshMoney(); garMsg(''); if(studio){ST.focus='_'; $('stMoney').textContent=money(save.money);}
  document.querySelectorAll('#shopList [data-act]').forEach(function(b){b.disabled=true;});
  var N=46, F=38, cells=[], i;
  for(i=0;i<N;i++) cells.push(i===F?prize:R[Math.floor(Math.random()*R.length)]);
  strip.innerHTML=cells.map(function(e){return cellHtml(e);}).join(''); strip.style.left='50%'; strip.style.transform='translateX(0px)';
  var tc=strip.children[F], cw=tc.offsetWidth||CELLW, target=tc.offsetLeft+cw/2, T=4200, t0=performance.now(), lastIdx=-1;
  function step(now){
    var u=Math.min(1,(now-t0)/T), e=1-Math.pow(1-u,4), pos=target*e;
    strip.style.transform='translateX('+(-pos)+'px)';
    var idx=Math.floor(pos/cw); if(idx!==lastIdx){lastIdx=idx; sfx('tick');}
    if(u<1){requestAnimationFrame(step); return;}
    /* the prize is whatever the marker is really over on screen */
    var mk=document.querySelector('#reel .mark'), fi=F;
    if(mk){
      var mr=mk.getBoundingClientRect(), mx=mr.left+mr.width/2, kids=strip.children, q;
      for(q=0;q<kids.length;q++){var cr=kids[q].getBoundingClientRect(); if(mx>=cr.left && mx<cr.right){fi=q; break;}}
    }
    prize=cells[fi]; target=strip.children[fi].offsetLeft+strip.children[fi].offsetWidth/2;
    var it=lookItem(prize.cat,prize.id), dup=save.own[prize.cat].indexOf(prize.id)>=0, refund=0;
    if(dup){refund=DUP_REFUND[it.r]; if(!save.dev) save.money+=refund;}
    else save.own[prize.cat].push(prize.id);
    lastWin={cat:prize.cat,id:prize.id,dup:dup,refund:refund}; lastStrip={cells:cells,f:fi,x:target}; spinning=false; persist(); refreshMoney();
    sfx(it.r==='c'?'pickup':'bonus'); buzz(it.r==='l'?200:60);
    garMsg(it.name+' ('+RAR[it.r].n+')'+(dup?' · repetido, reembolso de $ '+refund.toLocaleString('pt-BR'):' adicionado ao inventário.'));
    if(studio){$('stMoney').textContent=money(save.money); ST.focus=prize.cat; stPreview(prize.cat,prize.id); stRender();} else renderGarage();
  }
  requestAnimationFrame(step);
}
setInterval(function(){
  var el=$('rtimer'); if(!el||!studio||ST.view!=='roul'||spinning) return;
  if(rouCache.slot!==slotNow()){lastStrip=null; stRender();} else el.textContent=timeLeftTxt();
},1000);
function garMsg(t){$('garMsg').textContent=t||'';}
function canPay(p){return save.dev || save.money>=p;}
function pay(p){if(!save.dev) save.money-=p;}
function renderGarage(){
  $('tabUp').setAttribute('aria-selected',garTab==='up'); $('tabLook').setAttribute('aria-selected',garTab==='look');
  var h='';
  if(garTab==='up'){
    UPG.forEach(function(u){
      var lv=up[u.id], pips='', mx=u.max||MAXL, max=lv>=mx;
      for(var i=0;i<mx;i++) pips+='<i'+(i<lv?' class="on"':'')+'></i>';
      var pr=upPrice(u), ok=canPay(pr);
      h+='<div class="item"><div><b>'+u.name+'</b><small>'+u.desc+'</small><div class="pips">'+pips+'</div></div>'
        +'<button class="buy'+((!max&&!ok)?' no':'')+'" type="button" data-act="buyup" data-id="'+u.id+'"'+(max?' disabled':'')+'>'+(max?'Máximo':(save.dev?'Grátis':'$ '+pr.toLocaleString('pt-BR')))+'</button></div>';
    });
  }
  $('shopList').innerHTML=h;
  refreshMoney();
}
$('garageSheet').addEventListener('click',function(e){
  var b=e.target.closest?e.target.closest('[data-act]'):null; if(!b) return;
  var act=b.getAttribute('data-act'), id=b.getAttribute('data-id'), cat=b.getAttribute('data-cat');
  initAudio();
  if(spinning) return;
  if(act==='tab' && id==='look'){openStudio(); return;}
  if(act==='tab'){garTab=id; garMsg(''); renderGarage(); return;}
  if(act==='buyup'){
    var u=UPG.filter(function(x){return x.id===id;})[0], pr=upPrice(u);
    if(up[id]>=(u.max||MAXL)) return;
    if(!canPay(pr)){garMsg('Dinheiro insuficiente. Jogue mais corridas para ganhar.'); sfx('hit'); return;}
    pay(pr); up[id]++; persist(); applyUpgrades(); garMsg(u.name+' nível '+up[id]+' comprado.'); sfx('pickup'); renderGarage(); return;
  }
  if(act==='studio'){openStudio(); return;}
  if(act==='spin'){doSpin(); return;}
  if(act==='look'){
    if(spinning) return;
    var it=lookItem(cat,id);
    if(save.own[cat].indexOf(id)<0) return;
    save.sel[cat]=id; persist(); applyLook(); garMsg(it.name+' equipado.'); sfx('pickup'); renderGarage();
  }
});
