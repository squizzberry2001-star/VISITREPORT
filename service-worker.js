const CACHE_NAME = 'bestie-visit-v6';
const CORE_ASSETS = [
  './',
  './index.html',
  './src/theme.css',
  './src/tailwind.generated.css',
  './src/app.js',
  './src/pdf-generator.js',
  './src/pdf-template-assets.js',
  './data.js',
  './store-master-data.js',
  './ca-assignment-export.js',
  './jszip.min.js',
  './convex-config.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => undefined));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => undefined);
    return response;
  }).catch(() => cached)));
});
