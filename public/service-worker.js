// 📱 Service Worker for PWA
// מאפשר עבודה במצב offline וcaching חכם

const CACHE_NAME = 'family-finance-v1';
const OFFLINE_URL = '/offline.html';

// קבצים לcache
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// התקנת Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// הפעלת Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// טיפול בבקשות
self.addEventListener('fetch', (event) => {
  // דלג על בקשות לא-GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // שמור בcache רק תגובות מוצלחות
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // אם אין אינטרנט, נסה מהcache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // אם זה navigation request, החזר דף offline
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Background Sync - סנכרון כשחוזרים online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

// Push Notifications - התראות
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.message,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'פתח',
        icon: '/icons/open.png'
      },
      {
        action: 'close',
        title: 'סגור',
        icon: '/icons/close.png'
      }
    ],
    tag: data.tag || 'notification',
    requireInteraction: data.priority === 'high'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// טיפול בלחיצה על התראה
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // אם יש חלון פתוח, פוקוס עליו
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // אחרת, פתח חלון חדש
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// פונקציית עזר לסנכרון
async function syncTransactions() {
  try {
    // קריאה לAPI לסנכרון תנועות שנשמרו offline
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    const pendingTransactions = requests
      .filter(req => req.url.includes('/api/transactions') && req.method === 'POST');

    for (const req of pendingTransactions) {
      await fetch(req);
      await cache.delete(req);
    }

    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}
