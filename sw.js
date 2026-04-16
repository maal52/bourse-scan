const CACHE = 'bourse-v5';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('query1.finance') || e.request.url.includes('corsproxy') || 
      e.request.url.includes('allorigins') || e.request.url.includes('morningstar')) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const clone = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return r;
    }).catch(() => caches.match(e.request))
  );
});

self.addEventListener('periodicsync', e => {
  if (e.tag === 'scan-stocks') {
    e.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(c => c.postMessage({ type: 'background-scan-trigger' }));
      })
    );
  }
});
