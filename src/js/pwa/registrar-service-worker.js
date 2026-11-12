if('serviceWorker' in navigator){
  window.addEventListener('load',function(){
    navigator.serviceWorker.register('sw.js').then(function(reg){
      reg.addEventListener('updatefound',function(){
        var w=reg.installing; if(!w) return;
        w.addEventListener('statechange',function(){ if(w.state==='installed' && navigator.serviceWorker.controller){ /* nova versão pronta: vale na próxima abertura */ } });
      });
    }).catch(function(){});
  });
}
