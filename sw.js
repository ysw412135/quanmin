var CACHE = 'quanmin-v8';
var URLS = ['/quanmin', '/quanmin/', '/quanmin/index.html', '/quanmin/manifest.json', '/quanmin/trees.js', '/quanmin/app.js', '/quanmin/pwa.js', '/quanmin/icon-192.png', '/quanmin/icon-512.png'];

// Take control immediately (critical for PWA install to work on first visit)
self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(URLS); }));
});

self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
  // Clean old caches
  e.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
  }));
});

self.addEventListener('fetch', function(e) {
  // Skip non-GET requests and chrome-extension
  if(e.request.method !== 'GET') return;
  // Handle navigation requests (HTML) with network-first, cache-fallback
  if(e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(function() {
        return caches.match('/quanmin') || caches.match('/quanmin/');
      })
    );
    return;
  }
  // Cache-first for static assets
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).then(function(resp) {
        // Cache new static assets on the fly
        if(resp.status === 200) {
          var clone = resp.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return resp;
      });
    })
  );
});
