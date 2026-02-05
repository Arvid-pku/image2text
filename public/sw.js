// Service Worker for ASCII Art Installation PWA
const CACHE_NAME = 'ascii-art-v1';

// App shell files to cache on install
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Claim all clients immediately
  self.clients.claim();
});

// Fetch event - network-first strategy, skip user uploads
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip caching for:
  // - Non-GET requests
  // - Data URLs (uploaded media)
  // - Blob URLs (uploaded media)
  // - External resources (fonts, etc.)
  if (
    event.request.method !== 'GET' ||
    url.protocol === 'data:' ||
    url.protocol === 'blob:' ||
    !url.origin.includes(self.location.origin)
  ) {
    return;
  }

  // Network-first strategy
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response for caching
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Fallback to cache on network failure
        return caches.match(event.request);
      })
  );
});
