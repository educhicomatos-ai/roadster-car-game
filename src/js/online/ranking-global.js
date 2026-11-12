/* ---------- ranking global ---------- */
var rkFrom='homeSheet', rkBusy=false;
var RK_BAD=['porra','caralho','puta','putaria','viado','veado','buceta','boceta','foda','foder','fodase','fodido','cuzao','merda','bosta','arrombado','otario','vagabund','piranha','punheta','pirocao','rola','estupr','pedofil','nazi','hitler','racista','macaco','crioulo','fuck','shit','bitch','cunt','dick','pussy','nigger','nigga','faggot','whore','slut','rape','cock','asshole'];
var RK_SHORT=['cu','fdp','pnc','vsf','tnc','xxx','kkk','pau','pqp','vtnc'];
function rkNorm(n){
  var m={'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','@':'a','$':'s','!':'i','|':'i'};
  return n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[0134578@$!|]/g,function(ch){return m[ch];});
}
function rkBad(name){
  var t=rkNorm(name), toks=t.split(/[^a-z]+/).filter(Boolean), flat=t.replace(/[^a-z]/g,''), flat2=flat.replace(/(.)\1+/g,'$1'), i;
  for(i=0;i<toks.length;i++) if(RK_SHORT.indexOf(toks[i])>=0) return true;
  if(RK_SHORT.indexOf(flat)>=0||RK_SHORT.indexOf(flat2)>=0) return true;
  for(i=0;i<RK_BAD.length;i++){var w=RK_BAD[i]; if(flat.indexOf(w)>=0||flat2.indexOf(w.replace(/(.)\1+/g,'$1'))>=0) return true;}
  return false;
}
function rkCheckName(raw){
  var n=String(raw||'').replace(/\s+/g,' ').trim();
  if(n.length<3||n.length>12) return {ok:false,msg:'O apelido precisa ter de 3 a 12 caracteres.'};
  if(!/^[A-Za-zÀ-ÿ0-9 _.\-]+$/.test(n)) return {ok:false,msg:'Use só letras, números, espaço, ponto, hífen ou _.'};
  if(rkBad(n)) return {ok:false,msg:'Esse apelido não é permitido. Escolha outro.'};
  return {ok:true,name:n};
}
function rkOn(){return !!(RANK.url&&RANK.key);}
function rkPid(){
  if(typeof AC!=='undefined'&&AC&&AC.uid) return AC.uid;
  if(typeof AC!=='undefined'&&AC.uid) return AC.uid;
  if(!save.pid||save.pid.length<16){
    var a=new Uint8Array(16); try{crypto.getRandomValues(a);}catch(e){for(var i=0;i<16;i++) a[i]=Math.floor(Math.random()*256);}
    save.pid=Array.prototype.map.call(a,function(b){return ('0'+b.toString(16)).slice(-2);}).join(''); persist();
  }
  return save.pid;
}
function rkFetch(path,opts){
  opts=opts||{}; if(!opts.cache) opts.cache='no-store'; var ctl=(typeof AbortController!=='undefined')?new AbortController():null, to=setTimeout(function(){if(ctl) ctl.abort();},9000);
  opts.headers=Object.assign({apikey:RANK.key,'Content-Type':'application/json'},opts.headers||{});
  if(RANK.key.indexOf('eyJ')===0) opts.headers.Authorization='Bearer '+RANK.key; /* chaves sb_publishable não são JWT: só vão em apikey */
  if(ctl) opts.signal=ctl.signal;
  return fetch(RANK.url.replace(/\/+$/,'')+'/rest/v1/'+path,opts).then(function(r){clearTimeout(to); return r;},function(e){clearTimeout(to); throw e;});
}
var rkMine=null, rkRows=null;
function rkBody(s0,d0){
  var b={p_id:rkPid(),p_name:save.name,p_score:Math.floor(s0),p_dist:Math.floor(d0)};
  /* conta ligada: junta a entrada antiga deste aparelho (id aleatório) com a da conta, sem duplicar o jogador */
  if(typeof AC!=='undefined'&&AC&&AC.uid&&save.pid&&save.pid!==AC.uid) b.p_old_id=save.pid;
  return b;
}
function rkSubmit(sc,dist){
  /* devolve uma promessa com {rank,total,best} ou rejeita; guarda a pontuação para tentar de novo se falhar */
  if(!rkOn()||!save.name||save.dev) return Promise.reject(new Error('off'));
  var s0=Math.max(sc,save.pend?save.pend.s:0), d0=(save.pend&&save.pend.s>sc)?save.pend.d:dist;
  if(s0<=0) return Promise.reject(new Error('zero'));
  return rkFetch('rpc/submit_score',{method:'POST',body:JSON.stringify(rkBody(s0,d0))}).then(function(r){
    if(!r.ok) throw new Error('http '+r.status);
    return r.json();
  }).then(function(j){save.pend=null; persist(); if(j&&j.rank) rkMine=j; return j;},function(e){save.pend={s:Math.floor(s0),d:Math.floor(d0)}; persist(); throw e;});
}
function rkAfterRun(sc,dist){
  var el=$('endRank'); if(!rkOn()){el.hidden=true; return;}
  el.hidden=false;
  if(save.dev){el.textContent='Modo DEV ativo: esta pontuação não entra no ranking.'; return;}
  if(!save.name){el.textContent='Defina um apelido em Ranking global para entrar na disputa.'; return;}
  if(sc<=0&&!save.pend){el.textContent='Faça pontos para entrar no ranking.'; return;}
  el.textContent='Enviando pontuação…';
  rkSubmit(sc,dist).then(function(j){ if(state==='over') el.textContent='Ranking global: #'+j.rank+' de '+j.total+' jogadores · seu melhor: '+j.best; },function(){ if(state==='over') el.textContent=(sc>0||save.pend)?'Sem conexão: sua pontuação será enviada na próxima vez.':''; });
}
function rkMeRender(){
  var me=$('rkMe'); me.textContent='';
  if(!rkOn()||!save.name||save.dev){me.hidden=true; return;}
  me.hidden=false;
  var l=document.createElement('span'); l.appendChild(document.createTextNode('Você: ')); var b=document.createElement('b'); b.textContent=save.name; l.appendChild(b);
  if(rkMine&&rkMine.rank) l.appendChild(document.createTextNode(' · #'+rkMine.rank+' de '+rkMine.total+' · '+Number(rkMine.best).toLocaleString('pt-BR')));
  var bt=document.createElement('button'); bt.type='button'; bt.textContent='Mudar apelido'; bt.addEventListener('click',function(){$('rkForm').hidden=false; $('rkName').value=save.name; $('rkName').focus();});
  me.appendChild(l); me.appendChild(bt);
}
function rkRender(rows){
  var list=$('rkList'); list.textContent='';
  if(!rows.length){var e=document.createElement('p'); e.className='note'; e.textContent='Ainda não há pontuações. Seja o primeiro!'; list.appendChild(e); return;}
  var rk=0, prev=null;
  rows.forEach(function(r,i){
    if(prev===null||Number(r.score)!==prev){rk=i+1; prev=Number(r.score);}
    var d=document.createElement('div'); d.className='rkrow'+((save.name&&rkMine&&r.name===save.name&&Number(r.score)===Number(rkMine.best))?' me':''); d.setAttribute('role','listitem');
    var a=document.createElement('i'); a.textContent=rk+'.'; var n=document.createElement('span'); n.textContent=r.name; var sc=document.createElement('em'); sc.textContent=Number(r.score).toLocaleString('pt-BR');
    d.appendChild(a); d.appendChild(n); d.appendChild(sc); list.appendChild(d);
  });
}
function rkLoad(){
  var msg=$('rkMsg'); msg.textContent='Carregando…';
  var Q='leaderboard?select=name,score,dist&limit=50&offset=0&order=score.desc';
  rkFetch(Q+',updated_at.asc').then(function(r){return r.ok?r:rkFetch(Q);}).then(function(r){if(!r.ok) throw new Error('http'); return r.json();}).then(function(rows){
    msg.textContent=save.dev?'Modo DEV ativo: suas pontuações não são enviadas ao ranking.':''; rkRows=rows; rkRender(rows);
    if(save.name&&!save.dev) rkFetch('rpc/get_rank',{method:'POST',body:JSON.stringify({p_id:rkPid()})}).then(function(r){return r.ok?r.json():null;}).then(function(j){ if(j&&j.rank){rkMine=j; rkMeRender(); if(rkRows) rkRender(rkRows);} },function(){});
  },function(){msg.textContent='Não consegui carregar o ranking. Verifique a conexão e tente de novo.'; $('rkList').textContent='';});
}
function rkOpen(){
  var msg=$('rkMsg'), list=$('rkList');
  $('rkForm').hidden=true; list.textContent=''; msg.textContent=''; rkMine=null;
  if(!rkOn()){msg.textContent='O ranking global ainda não foi ativado neste jogo.'; $('rkMe').hidden=true; return;}
  if(!save.name&&!save.dev){$('rkForm').hidden=false; $('rkName').value=''; setTimeout(function(){$('rkName').focus();},60);}
  rkMeRender(); rkLoad();
  if(save.dev) msg.textContent='Modo DEV ativo: você pode ver o ranking, mas suas pontuações não são enviadas. Digite /DEV no console para desativar.';
  if(save.name&&save.pend) rkSubmit(0,0).then(function(){rkLoad();},function(){});
}
$('rkForm').addEventListener('submit',function(e){
  e.preventDefault(); var r=rkCheckName($('rkName').value), msg=$('rkMsg');
  if(save.dev){msg.textContent='Modo DEV ativo: não é possível participar do ranking.'; return;}
  if(!r.ok){msg.textContent=r.msg; sfx('hit'); return;}
  save.name=r.name; persist(); $('rkForm').hidden=true; rkMeRender(); sfx('pickup');
  var bs=save.pend?save.pend.s:0; /* só pontuações de corridas feitas com o ranking ativo; o recorde antigo do aparelho não é enviado */
  if(bs>0){msg.textContent='Enviando…'; rkSubmit(bs,0).then(function(){rkLoad();},function(){msg.textContent='Apelido salvo. A pontuação será enviada quando houver conexão.';});}
  else{msg.textContent='Apelido salvo! Faça pontos para entrar no ranking.'; rkLoad();}
});
function best_get(){return best|0;}
$('rkName').addEventListener('keydown',function(e){e.stopPropagation(); if(e.key==='Escape'){this.blur(); showSheet(rkFrom);}});
$('goRank').addEventListener('click',function(){this.blur(); rkFrom='homeSheet'; showSheet('rankSheet');});
$('endRankBtn').addEventListener('click',function(){this.blur(); rkFrom='endSheet'; showSheet('rankSheet');});
$('rkBack').addEventListener('click',function(){this.blur(); showSheet(rkFrom);});

