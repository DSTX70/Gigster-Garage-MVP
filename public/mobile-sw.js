/**
 * Mobile Service Worker for Offline Functionality
 * Enables offline access, background sync, and native-like performance
 */

const CACHE_VERSION = 'gigster-garage-mobile-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Files to cache for offline access
const STATIC_ASSETS = [
  '/mobile',
  '/mobile/dashboard',
  '/mobile/tasks', 
  '/mobile/projects',
  '/mobile/time-tracking',
  '/mobile/analytics',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add CSS and JS bundles (will be populated by build process)
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/tasks',
  '/api/projects', 
  '/api/users',
  '/api/timelogs',
  '/api/analytics'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.includes('gigster-garage-mobile') && 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim all clients immediately
  self.clients.claim();
});

// Fetch event - handle network requests with cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests with appropriate strategies
  if (request.method !== 'GET') {
    // Handle non-GET requests with background sync
    event.respondWith(handleNonGetRequest(request));
    return;
  }
  
  if (url.pathname.startsWith('/api/')) {
    // API requests: Network First with cache fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (STATIC_ASSETS.some(asset => url.pathname.includes(asset))) {
    // Static assets: Cache First
    event.respondWith(cacheFirstStrategy(request));
  } else if (url.pathname.startsWith('/mobile/')) {
    // Mobile pages: Stale While Revalidate
    event.respondWith(staleWhileRevalidateStrategy(request));
  } else {
    // Default: Network First
    event.respondWith(networkFirstStrategy(request));
  }
});

/**
 * Cache First Strategy - Good for static assets
 */
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);
    return new Response('Offline - Content not available', { 
      status: 503,
      statusText: 'Service Unavailable' 
    });
  }
}

/**
 * Network First Strategy - Good for API calls and dynamic content
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful API responses
    if (request.url.includes('/api/') && networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Add offline indicator header
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Served-From-Cache', 'true');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers
      });
    }
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) return offlinePage;
    }
    
    return new Response('Offline - No cached version available', { 
      status: 503,
      statusText: 'Service Unavailable' 
    });
  }
}

/**
 * Stale While Revalidate Strategy - Good for pages that can show stale content
 */
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

/**
 * Handle non-GET requests (POST, PUT, DELETE) with background sync
 */
async function handleNonGetRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.log('[SW] Non-GET request failed, queuing for background sync');
    
    // Store failed request for background sync
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text(),
      timestamp: Date.now()
    };
    
    await storeFailedRequest(requestData);
    
    // Register background sync
    if (self.registration.sync) {
      await self.registration.sync.register('background-sync');
    }
    
    return new Response(JSON.stringify({ 
      message: 'Request queued for sync when online',
      queued: true 
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Store failed request in IndexedDB for background sync
 */
async function storeFailedRequest(requestData) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('gigster-garage-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['failed-requests'], 'readwrite');
      const store = transaction.objectStore('failed-requests');
      
      store.add(requestData);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('failed-requests')) {
        const store = db.createObjectStore('failed-requests', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

/**
 * Background sync event - retry failed requests
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(replayFailedRequests());
  }
});

/**
 * Replay failed requests when back online
 */
async function replayFailedRequests() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('gigster-garage-offline', 1);
    
    request.onsuccess = async () => {
      const db = request.result;
      const transaction = db.transaction(['failed-requests'], 'readwrite');
      const store = transaction.objectStore('failed-requests');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = async () => {
        const failedRequests = getAllRequest.result;
        console.log(`[SW] Replaying ${failedRequests.length} failed requests`);
        
        for (const requestData of failedRequests) {
          try {
            const response = await fetch(requestData.url, {
              method: requestData.method,
              headers: requestData.headers,
              body: requestData.body || undefined
            });
            
            if (response.ok) {
              // Successfully replayed, remove from storage
              store.delete(requestData.id);
              console.log('[SW] Successfully replayed request:', requestData.url);
            }
          } catch (error) {
            console.log('[SW] Failed to replay request:', requestData.url, error);
          }
        }
        
        resolve();
      };
    };
  });
}

/**
 * Push notification event
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ],
    data: {
      url: data.url,
      id: data.id
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Notification click event
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  const url = event.notification.data.url || '/mobile';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

/**
 * Message event - handle messages from main thread
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls;
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.addAll(urls);
      })
    );
  }
});

/**
 * Periodic background sync for data updates
 */
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'background-data-sync') {
    console.log('[SW] Periodic background sync triggered');
    event.waitUntil(syncAppData());
  }
});

/**
 * Sync app data in background
 */
async function syncAppData() {
  try {
    // Sync critical data like tasks, time logs, and notifications
    const syncEndpoints = ['/api/tasks', '/api/timelogs', '/api/notifications'];
    
    for (const endpoint of syncEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const cache = await caches.open(API_CACHE);
          await cache.put(endpoint, response.clone());
          console.log('[SW] Background sync updated:', endpoint);
        }
      } catch (error) {
        console.log('[SW] Background sync failed for:', endpoint);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

console.log('[SW] Service Worker loaded and ready');