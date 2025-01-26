const CACHE_NAME = 'storyvoice-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/scripts.js',
  '/styles.css',
  '/icons/web-app-manifest-192x192.png',
  '/icons/web-app-manifest-512x512.png',
  // Add other assets like fonts, images, etc.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
    ))
  );
});

const CACHE_NAME = 'storyvoice-v2';
const OFFLINE_URL = '/offline.html';

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(OFFLINE_URL))
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
                .catch(() => {
                    if (event.request.destination === 'image') {
                        return caches.match('/icons/offline-image.png');
                    }
                })
        );
    }
});