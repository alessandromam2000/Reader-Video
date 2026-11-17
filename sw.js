/* Data Mampro's Volley - uso offline.
   Prima apertura con internet: il portale (e i font) si salvano nel browser. Dopo, parte anche senza rete.
   Con internet controlla da solo se c'e' una versione nuova e la prepara per la volta dopo. */
var CACHE = 'mv-portale-v1';
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin !== location.origin && !/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(r, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(r).then(function (res) { if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()); return res; }).catch(function () { return hit || (r.mode === 'navigate' ? c.match('index.html') || c.match('./') : undefined); });
      return hit || net;
    });
  }));
});
