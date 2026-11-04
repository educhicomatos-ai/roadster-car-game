/* Rocket Car Game: service worker.
   - index.html e manifesto: rede primeiro (atualiza sozinho), cache só se estiver offline.
   - Motor 3D, fontes e ícones: cache primeiro (baixados uma vez, depois funcionam offline). */
var CACHE='rocket-car-game-v2';
var CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
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
      var copy=res.clone(); caches.open(CACHE).then(function(c){c.put(req,copy);}); return res;
    }).catch(function(){return caches.match(req).then(function(m){return m||caches.match('index.html');});}));
  }else{
    e.respondWith(caches.match(req).then(function(m){
      return m||fetch(req).then(function(res){
        var copy=res.clone(); caches.open(CACHE).then(function(c){c.put(req,copy);}); return res;
      });
    }));
  }
});
