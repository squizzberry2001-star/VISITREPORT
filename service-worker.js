const CACHE_NAME = 'bestie-visit-v17-focus-fix-20260430';
const CORE_ASSETS = [
  './',
  './index.html',
  './src/theme.css?v=20260430-focusfix2',
  './src/tailwind.generated.css',
  './src/app.js?v=20260430-focusfix2',
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
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function shouldUseNetworkFirst(request) {
  const url = new URL(request.url);
  return request.mode === 'navigate'
    || url.pathname.endsWith('/index.html')
    || url.pathname.endsWith('/src/app.js')
    || url.pathname.endsWith('/src/theme.css')
    || url.pathname.endsWith('/service-worker.js');
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (shouldUseNetworkFirst(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => undefined);
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => undefined);
      return response;
    }).catch(() => cached))
  );
});
