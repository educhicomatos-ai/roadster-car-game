/* ---------- download an offline copy ---------- */
(function(){
  var btn=$('dlGame'), dl=null;
  try{ if(window.claude && window.claude.use) window.claude.use('downloads').then(function(d){ if(d){dl=d; btn.hidden=false;} },function(){}); }catch(e){}
  function gameSource(){
    var src=''; var ss=document.scripts;
    for(var i=0;i<ss.length;i++){ if(!ss[i].src && ss[i].textContent.indexOf('function makeRoadster')>=0){src=ss[i].textContent; break;} }
    return src;
  }
  btn.addEventListener('click',function(){
    var b=this; if(!dl) return; b.disabled=true; var old=b.textContent; b.textContent='Preparando...';
    var body=PRISTINE.cloneNode(true), sc=body.querySelectorAll('script'); for(var i=0;i<sc.length;i++) sc[i].parentNode.removeChild(sc[i]);
    var three='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    function build(lib){
      var libTag=lib?'<script>'+lib.replace(/<\/script/gi,'<\\/script')+'<\/script>':'<script src="'+three+'"><\/script>';
      var game=gameSource().replace(/<\/script/gi,'<\\/script');
      return '<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no"><meta name="theme-color" content="#0a0f2e"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Rocket Car Game"><title>Rocket Car Game</title>'
        +'<style>*{box-sizing:border-box}html,body{margin:0;height:100%;background:#0a0f2e}[hidden]{display:none!important}</style></head><body>'+body.innerHTML+libTag+'<script>'+game+'<\/script></body></html>';
    }
    function finish(html){
      dl.save({filename:'rocket-car-game.html',data:new Blob([html],{type:'text/html'})}).then(function(){toast('Arquivo salvo. Abra-o no navegador do celular.','good');},function(err){ if(err&&err.code!=='declined') toast('Não foi possível baixar aqui.','bad'); }).then(function(){b.disabled=false; b.textContent=old;});
    }
    var done=false;
    try{
      fetch(three).then(function(r){if(!r.ok) throw 0; return r.text();}).then(function(t){done=true; finish(build(t));},function(){done=true; finish(build(''));});
    }catch(e){ finish(build('')); }
  });
})();

