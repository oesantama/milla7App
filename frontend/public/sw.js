// Service Worker para PWA
// Cacheo de recursos y funcionamiento offline

const CACHE_NAME = 'milla7-v1.0.0';
const urlsToCache = [
  '/',
  '/desktop',
  '/login',
  '/manifest.json',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activación
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - Estrategia Network First, fallback a Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clonar la respuesta
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // Si falla el network, buscar en cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            
            // Si no hay cache, mostrar página offline
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data,
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Milla 7', options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
