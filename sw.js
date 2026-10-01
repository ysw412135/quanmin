var PREFIX='quanmin-jingfang:'+self.registration.scope+':';
var CACHE=PREFIX+'20261001-gongyi-v2-2';
var ASSETS=['./','./index.html','./manifest.json','./trees.js','./fde-engine.js','./app.js','./formula-matcher.js'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k.indexOf(PREFIX)===0&&k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){
 var url=new URL(e.request.url);
 if(e.request.method!=='GET'||!ASSETS.some(function(a){return new URL(a,self.registration.scope).href===url.href;}))return;
 e.respondWith(caches.open(CACHE).then(function(c){return c.match(e.request).then(function(r){return r||fetch(e.request);});}));
});
