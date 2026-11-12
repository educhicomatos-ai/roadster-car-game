/* Rocket Car Game: service worker.
   - index.html e manifesto: rede primeiro (atualiza sozinho), cache só se estiver offline.
   - Motor 3D, fontes e ícones: cache primeiro (baixados uma vez, depois funcionam offline).
   - Supabase (ranking, conta, nuvem): NUNCA passa pelo cache, para todos verem os mesmos dados. */
var CACHE='rocket-car-game-v4';
var CORE=['./','index.html','manifest.webmanifest','assets/icons/icon-192.png','assets/icons/icon-512.png','dist/game.js','src/styles/layout.css','src/styles/tema-velho-oeste.css','src/styles/hud.css','src/js/pwa/registrar-service-worker.js'];
var CACHEABLE=['cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(CORE);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  var req=e.request; if(req.method!=='GET') return;
  var url=new URL(req.url), same=url.origin===location.origin;
  if(same){
    e.respondWith(fetch(req,{cache:'no-cache'}).then(function(res){
      if(res.ok){var copy=res.clone(); caches.open(CACHE).then(function(c){c.put(req,copy);});}
      return res;
    }).catch(function(){return caches.match(req).then(function(m){return m||caches.match('index.html');});}));
  }else if(CACHEABLE.indexOf(url.hostname)>=0){
    e.respondWith(caches.match(req).then(function(m){
      return m||fetch(req).then(function(res){
        if(res.ok||res.type==='opaque'){var copy=res.clone(); caches.open(CACHE).then(function(c){c.put(req,copy);});}
        return res;
      });
    }));
  } /* qualquer outro endereço (Supabase etc.): segue direto para a rede */
});
