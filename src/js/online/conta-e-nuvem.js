/* ---------- conta (login com Google via Supabase) e progresso na nuvem ---------- */
var AC={uid:'',email:'',name:'',at:'',rt:'',exp:0}, AC_KEY='rocketcar-auth-v1', acTimer=0, acDirty=false, acBusy=false, acRemote=null;
var IN_APK=/;\s*wv\)/.test(navigator.userAgent||''), IN_FRAME=(function(){try{return window.self!==window.top;}catch(e){return true;}})();
function acLoad(){try{var r=JSON.parse(localStorage.getItem(AC_KEY)||'null'); if(r&&r.uid&&r.rt){AC.uid=r.uid; AC.email=r.email||''; AC.name=r.name||''; AC.at=r.at||''; AC.rt=r.rt; AC.exp=r.exp||0;}}catch(e){}}
function acStore(){try{localStorage.setItem(AC_KEY,JSON.stringify(AC));}catch(e){}}
function acClear(){AC.uid=AC.email=AC.name=AC.at=AC.rt=''; AC.exp=0; try{localStorage.removeItem(AC_KEY);}catch(e){} save.acct=''; acRemote=null;}
function acUrl(path){return RANK.url.replace(/\/+$/,'')+path;}
function acToken(){
  if(!AC.rt) return Promise.reject(new Error('anon'));
  if(AC.at&&AC.exp>Date.now()+60000) return Promise.resolve(AC.at);
  return fetch(acUrl('/auth/v1/token?grant_type=refresh_token'),{method:'POST',headers:{apikey:RANK.key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:AC.rt})}).then(function(r){
    if(!r.ok){ if(r.status===400||r.status===401){acClear(); acRender(); acHomeBtn();} throw new Error('refresh '+r.status); }
    return r.json();
  }).then(function(j){AC.at=j.access_token; AC.rt=j.refresh_token||AC.rt; AC.exp=Date.now()+(j.expires_in||3600)*1000; acStore(); return AC.at;});
}
function acRest(path,opts){
  return acToken().then(function(t){
    opts=opts||{}; opts.headers=Object.assign({apikey:RANK.key,Authorization:'Bearer '+t,'Content-Type':'application/json'},opts.headers||{});
    return fetch(acUrl('/rest/v1/'+path),opts);
  });
}
function acPack(){return {money:save.money|0,up:save.up,own:save.own,sel:save.sel,name:save.name,best:best|0};}
function acHasProgress(){var o=false; for(var k in save.own){if(save.own[k].length>1) o=true;} var u=false; for(var q in save.up){if(save.up[q]>0) u=true;} return save.money>0||u||o||best>0;}
function acSanitize(r){
  var d=freshSave(false);
  d.money=Math.max(0,Math.floor(Number(r.money)||0));
  UPG.forEach(function(u){d.up[u.id]=clamp(Math.floor(Number(r.up&&r.up[u.id])||0),0,u.max||MAXL);});
  for(var cat in LOOK){
    var ids=LOOK[cat].items.map(function(x){return x.id;});
    var own=(r.own&&Array.isArray(r.own[cat]))?r.own[cat].filter(function(x){return ids.indexOf(x)>=0;}):[];
    if(own.indexOf(ids[0])<0) own.unshift(ids[0]);
    d.own[cat]=own; d.sel[cat]=(r.sel&&own.indexOf(r.sel[cat])>=0)?r.sel[cat]:ids[0];
  }
  d.name=String(r.name||'').slice(0,12);
  return d;
}
function acAdopt(row){
  var r=row.data||{}, d=acSanitize(r), dev=save.dev, pid=save.pid, pend=save.pend;
  save=d; save.dev=dev; save.pid=pid; save.pend=pend; save.acct=AC.uid; save.ts=Date.parse(row.updated_at)||Date.now(); up=save.up;
  var rb=Math.floor(Number(r.best)||0); if(rb>best){best=rb; setBest(rb); $('best').textContent=best; $('menuBest').textContent=best;}
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));}catch(e){}
  applyUpgrades(); applyLook(); refreshMoney();
}
function acQueue(){
  if(typeof AC==='undefined'||!AC.uid||!save.acct||save.acct!==AC.uid||acRemote) return;
  acDirty=true; clearTimeout(acTimer); acTimer=setTimeout(acAuto,2500);
}
/* envio automático: tenta de novo sozinho se falhar (sem internet etc.) */
function acAuto(){
  if(!AC.uid||!acDirty||save.acct!==AC.uid||acRemote) return;
  if(acBusy){acTimer=setTimeout(acAuto,2000); return;}
  acPush().catch(function(){acDirty=true; clearTimeout(acTimer); acTimer=setTimeout(acAuto,15000);});
}
/* ao fechar/esconder o app: manda o que faltar na hora (keepalive sobrevive ao fechamento) */
function acFlush(){
  if(!AC.uid||!acDirty||save.acct!==AC.uid||acRemote||!AC.at||AC.exp<=Date.now()+5000) return;
  try{
    var now=new Date().toISOString();
    fetch(acUrl('/rest/v1/profiles?on_conflict=user_id'),{method:'POST',keepalive:true,headers:{apikey:RANK.key,Authorization:'Bearer '+AC.at,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:AC.uid,data:acPack(),updated_at:now})}).then(function(r){if(r.ok){acDirty=false; save.ts=Date.parse(now); persistNoSync();}},function(){});
  }catch(e){}
}
/* puxa mudanças feitas em outro aparelho */
function acPoll(){ if(AC.uid&&save.acct===AC.uid&&!acDirty&&!acBusy&&!acRemote&&state==='menu'&&!document.hidden) acSync(true); }
setInterval(acPoll,45000);
window.addEventListener('focus',acPoll);
window.addEventListener('pagehide',acFlush);
document.addEventListener('visibilitychange',function(){ if(document.hidden) acFlush(); });
function acPush(){
  if(!AC.uid||acBusy) return Promise.resolve();
  acBusy=true;
  var now=new Date().toISOString();
  return acRest('profiles?on_conflict=user_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:AC.uid,data:acPack(),updated_at:now})}).then(function(r){
    acBusy=false; if(!r.ok) throw new Error('http '+r.status);
    acDirty=false; save.acct=AC.uid; save.ts=Date.parse(now); try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));}catch(e){}
    acMsg('Sincronizado às '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+'.');
  },function(e){acBusy=false; throw e;});
}
function acSync(quiet){
  if(!AC.uid) return Promise.resolve();
  if(quiet!==true) acMsg('Sincronizando…');
  return acRest('profiles?select=data,updated_at&user_id=eq.'+AC.uid).then(function(r){if(!r.ok) throw new Error('http '+r.status); return r.json();}).then(function(rows){
    var row=rows[0];
    if(!row){save.acct=AC.uid; return acPush();}
    var rts=Date.parse(row.updated_at)||0;
    if(!acHasProgress()){acAdopt(row); acMsg('Progresso da nuvem carregado.'); acRender(); return;}
    if(save.acct===AC.uid){
      if(rts>(save.ts||0)+1500){acAdopt(row); acMsg('Progresso atualizado a partir de outro aparelho.'); acRender();}
      else if(quiet===true){return;}
      else return acPush();
      return;
    }
    acRemote=row; acMsg(''); acRender();   /* primeiro vínculo com progresso diferente nos dois lados: o jogador decide */
  }).catch(function(){if(quiet!==true) acMsg('Sem conexão com a nuvem. Tente de novo mais tarde.');});
}
function acMsg(t){var m=$('acMsg'); if(m) m.textContent=t||'';}
function acHomeBtn(){var b=$('acctBtn'); b.textContent=AC.uid?('☁ '+(AC.name||AC.email||'Conta')):'☁ Entrar / Criar conta'; b.classList.toggle('on',!!AC.uid);}
function acRender(){
  acHomeBtn();
  var ok=rkOn(), lead=$('acLead');
  $('acMe').hidden=!AC.uid; $('acConflict').hidden=!acRemote;
  $('acLogin').hidden=!!AC.uid||!ok||(IN_FRAME&&!IN_APK); $('acForm').hidden=!!AC.uid||!ok; $('acSync').hidden=!AC.uid; $('acOut').hidden=!AC.uid;
  if(!ok) lead.textContent='O login ainda não foi ativado neste jogo.';
  else if(AC.uid) lead.textContent='Você está conectado e tudo é salvo na nuvem automaticamente. Dinheiro, melhorias, visuais, recorde e apelido seguem com você em qualquer aparelho: celular, computador, PWA ou app.';
  else lead.textContent='Crie uma conta (ou entre) para levar seu progresso (dinheiro, melhorias, visuais, recorde e apelido) para qualquer aparelho.'+((IN_FRAME&&!IN_APK)?' O login com Google só funciona fora desta pré-visualização.':'');
  var me=$('acMe'); me.textContent='';
  if(AC.uid){var l=document.createElement('span'); l.appendChild(document.createTextNode('Conta: ')); var b=document.createElement('b'); b.textContent=AC.email||AC.name||'Conta'; l.appendChild(b); me.appendChild(l);}
}
function acAuthUrl(){
  var back=IN_APK?'rocketcar://auth':(location.origin+location.pathname);
  return acUrl('/auth/v1/authorize?provider=google&redirect_to='+encodeURIComponent(back));
}
function acHandleHash(h){
  h=String(h||'').replace(/^#/,''); if(!h) return false;
  var q={}; h.split('&').forEach(function(kv){var i=kv.indexOf('='); if(i>0) q[decodeURIComponent(kv.slice(0,i))]=decodeURIComponent(kv.slice(i+1).replace(/\+/g,' '));});
  if(q.error_description||q.error){acMsg('Não foi possível entrar: '+(q.error_description||q.error)); showSheet('accountSheet'); return true;}
  if(!q.access_token||!q.refresh_token) return false;
  AC.at=q.access_token; AC.rt=q.refresh_token; AC.exp=Date.now()+(Number(q.expires_in)||3600)*1000;
  showSheet('accountSheet'); acMsg('Entrando…');
  fetch(acUrl('/auth/v1/user'),{headers:{apikey:RANK.key,Authorization:'Bearer '+AC.at}}).then(function(r){if(!r.ok) throw new Error('user'); return r.json();}).then(function(u){
    AC.uid=u.id; AC.email=u.email||''; AC.name=String((u.user_metadata&&(u.user_metadata.full_name||u.user_metadata.name))||String(u.email||'').split('@')[0]||'').split(' ')[0].slice(0,14); acStore(); acRender();
    if(q.type==='recovery'){$('acRec').hidden=false; acMsg('Defina sua nova senha abaixo.');}
    return acSync();
  }).catch(function(){acClear(); acRender(); acMsg('Não foi possível concluir o login. Tente de novo.');});
  return true;
}

/* login com email e senha (Supabase Auth) */
function acErr(j){
  var raw=String((j&&(j.msg||j.error_description||j.message||j.error))||''), code=String((j&&(j.error_code||j.code))||''), m=(raw+' '+code).toLowerCase();
  if(m.indexOf('signup_disabled')>=0||m.indexOf('signups not allowed')>=0||m.indexOf('email_provider_disabled')>=0||m.indexOf('provider is disabled')>=0) return 'O cadastro por email está desativado no Supabase (Authentication > Sign In / Providers > Email).';
  if(m.indexOf('email_not_confirmed')>=0) return 'Confirme seu email (veja a caixa de entrada e o spam) antes de entrar.';
  if(m.indexOf('over_email_send_rate_limit')>=0||m.indexOf('email rate limit')>=0) return 'Limite de envio de emails do Supabase atingido. Aguarde cerca de 1 hora ou desative "Confirm email" no painel.';
  if(m.indexOf('email_address_invalid')>=0) return 'Esse email não foi aceito. Tente outro endereço.';
  if(m.indexOf('invalid api key')>=0||m.indexOf('apikey')>=0) return 'Chave do Supabase inválida no jogo.';
  if(m.indexOf('invalid login')>=0) return 'Email ou senha incorretos.';
  if(m.indexOf('already')>=0) return 'Esse email já tem conta. Toque em Entrar.';
  if(m.indexOf('at least')>=0||m.indexOf('weak')>=0) return 'A senha precisa ter pelo menos 6 caracteres.';
  if(m.indexOf('not confirmed')>=0) return 'Confirme seu email (veja a caixa de entrada) antes de entrar.';
  if(m.indexOf('rate limit')>=0||m.indexOf('too many')>=0) return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
  if(m.indexOf('valid email')>=0||m.indexOf('invalid email')>=0) return 'Digite um email válido.';
  return 'Não foi possível concluir'+(raw||code?' ('+(code||raw).slice(0,80)+')':'')+'. Tente de novo.';
}
function acSession(j){
  var u=j.user||{}; AC.at=j.access_token; AC.rt=j.refresh_token; AC.exp=Date.now()+(Number(j.expires_in)||3600)*1000;
  AC.uid=u.id; AC.email=u.email||''; AC.name=String(AC.email.split('@')[0]).slice(0,14); acStore();
}
function acEmailAuth(mode){
  if(!rkOn()) return;
  var em=$('acEmail').value.trim().toLowerCase(), pw=$('acPass').value;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){acMsg('Digite um email válido.'); return;}
  if(pw.length<6){acMsg('A senha precisa ter pelo menos 6 caracteres.'); return;}
  acMsg(mode==='up'?'Criando conta…':'Entrando…');
  fetch(acUrl(mode==='up'?'/auth/v1/signup':'/auth/v1/token?grant_type=password'),{method:'POST',headers:{apikey:RANK.key,'Content-Type':'application/json'},body:JSON.stringify({email:em,password:pw})})
  .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
  .then(function(x){
    if(!x.ok) throw {msg:acErr(x.j)};
    if(mode==='up'&&x.j&&x.j.user&&x.j.user.identities&&x.j.user.identities.length===0){acMsg('Esse email já tem conta. Toque em Entrar.'); return;}
    if(!x.j.access_token){acMsg('Conta criada! Enviamos um email de confirmação: confirme e depois toque em Entrar.'); return;}
    acSession(x.j); $('acPass').value=''; acRender(); sfx('pickup'); return acSync();
  }).catch(function(e){acMsg(e&&e.msg?e.msg:'Sem conexão com o servidor. Verifique a internet e tente de novo.');});
}
$('acForm').addEventListener('submit',function(e){e.preventDefault(); acEmailAuth('in');});
$('acUp').addEventListener('click',function(){this.blur(); acEmailAuth('up');});
$('acForgot').addEventListener('click',function(){
  this.blur(); var em=$('acEmail').value.trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){acMsg('Digite seu email no campo acima e toque em "Esqueci a senha".'); return;}
  fetch(acUrl('/auth/v1/recover?redirect_to='+encodeURIComponent(location.origin+location.pathname)),{method:'POST',headers:{apikey:RANK.key,'Content-Type':'application/json'},body:JSON.stringify({email:em})})
  .then(function(r){acMsg(r.ok?'Se esse email tem conta, enviamos um link para criar uma nova senha. Abra o link no navegador.':'Não foi possível enviar agora. Tente mais tarde.');},function(){acMsg('Sem conexão. Tente de novo.');});
});
$('acRec').addEventListener('submit',function(e){
  e.preventDefault(); var pw=$('acNew').value; if(pw.length<6){acMsg('A senha precisa ter pelo menos 6 caracteres.'); return;}
  acToken().then(function(t){return fetch(acUrl('/auth/v1/user'),{method:'PUT',headers:{apikey:RANK.key,Authorization:'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify({password:pw})});})
  .then(function(r){ if(!r.ok) throw new Error('x'); $('acNew').value=''; $('acRec').hidden=true; acMsg('Senha alterada com sucesso.'); sfx('pickup'); },function(){acMsg('Não foi possível alterar a senha. Peça um novo link.');});
});
['acEmail','acPass','acNew'].forEach(function(id){$(id).addEventListener('keydown',function(e){e.stopPropagation(); if(e.key==='Escape'){this.blur(); showSheet('homeSheet');}});});
window.__authReturn=function(frag){acHandleHash(frag);};
acLoad();
$('acctBtn').addEventListener('click',function(){this.blur(); showSheet('accountSheet');});
$('acBack').addEventListener('click',function(){this.blur(); showSheet('homeSheet');});
$('acLogin').addEventListener('click',function(){this.blur(); if(!rkOn()) return; acMsg('Abrindo o login do Google…'); window.location.href=acAuthUrl();});
$('acSync').addEventListener('click',function(){this.blur(); acSync();});
$('acOut').addEventListener('click',function(){
  this.blur(); var t=AC.at; try{fetch(acUrl('/auth/v1/logout'),{method:'POST',headers:{apikey:RANK.key,Authorization:'Bearer '+t}});}catch(e){}
  acClear(); persistNoSync(); acRender(); acMsg('Você saiu da conta. O progresso continua salvo neste aparelho.');
});
function persistNoSync(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));}catch(e){}}
$('acCloud').addEventListener('click',function(){this.blur(); if(!acRemote) return; var row=acRemote; acRemote=null; acAdopt(row); acMsg('Progresso da nuvem carregado.'); acRender();});
$('acLocal').addEventListener('click',function(){this.blur(); acRemote=null; save.acct=AC.uid; acRender(); acPush().catch(function(){acMsg('Sem conexão: será enviado depois.'); acDirty=true; acTimer=setTimeout(acAuto,15000);});});
window.addEventListener('online',function(){if(AC.uid&&acDirty) acAuto();});
document.addEventListener('visibilitychange',function(){if(!document.hidden&&AC.uid&&save.acct===AC.uid&&!acDirty&&state==='menu') acSync();});
acHomeBtn();
(function(){
  var h=location.hash; if(h&&(h.indexOf('access_token=')>=0||h.indexOf('error_description=')>=0)){
    try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}
    setTimeout(function(){acHandleHash(h);},50);
  }else if(AC.uid&&rkOn()) setTimeout(acSync,800);
})();
$('goHow').addEventListener('click',function(){this.blur(); showSheet('howSheet');});
$('goConsole').addEventListener('click',function(){this.blur(); showSheet('consoleSheet');});
$('howBack').addEventListener('click',function(){this.blur(); showSheet('homeSheet');});
$('garBack').addEventListener('click',function(){this.blur(); showSheet('homeSheet');});
$('conBack').addEventListener('click',function(){this.blur(); showSheet('homeSheet');});
$('endMenu').addEventListener('click',function(){this.blur(); state='menu'; showSheet('homeSheet');});

