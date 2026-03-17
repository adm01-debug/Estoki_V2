/**
 * Service Worker para PWA - ESTOKI WMS
 * Suporte offline, cache e sincronização em background
 */

const CACHE_NAME = 'estoki-v2';
const STATIC_CACHE = 'estoki-static-v2';
const DYNAMIC_CACHE = 'estoki-dynamic-v2';
const API_CACHE = 'estoki-api-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
];

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || url.hostname.includes('supabase');
}

function isAppStaticAsset(url) {
  return /\.(css|png|jpg|jpeg|gif|svg|ico|woff|woff2|webp)$/.test(url.pathname);
}

function shouldBypassRequest(request, url) {
  if (request.method !== 'GET') return true;

  if (url.origin !== location.origin && !url.hostname.includes('supabase')) {
    return true;
  }

  return (
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.startsWith('/@vite/') ||
    url.pathname.startsWith('/@fs/') ||
    url.pathname.startsWith('/@id/') ||
    url.pathname.startsWith('/@react-refresh') ||
    url.searchParams.has('v')
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(key))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match('/offline.html');
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    return new Response(
      JSON.stringify({ error: 'offline', message: 'Você está offline' }),
      { headers: { 'Content-Type': 'application/json' }, status: 503 }
    );
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  return cached || networkPromise;
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (shouldBypassRequest(event.request, url)) {
    return;
  }

  if (isApiRequest(url)) {
    event.respondWith(networkFirst(event.request, API_CACHE));
    return;
  }

  if (isAppStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(event.request, DYNAMIC_CACHE));
  }
});

// Background Sync para operações offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-operations') {
    event.waitUntil(syncPendingOperations());
  }
});

async function syncPendingOperations() {
  const db = await openDB();
  const operations = await db.getAll('pendingOperations');
  
  for (const op of operations) {
    try {
      await fetch(op.url, {
        method: op.method,
        headers: op.headers,
        body: op.body,
      });
      await db.delete('pendingOperations', op.id);
    } catch {
      // Tentar novamente na próxima sincronização
      console.log('[SW] Sync failed, will retry:', op.id);
    }
  }
}

// Push Notifications
self.addEventListener('push', (event) => {
  let data = { title: 'ESTOKI WMS', body: 'Nova notificação', tag: 'default' };
  
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch {
    if (event.data) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'wms-notification',
    data: data.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: data.severity === 'critical',
    actions: data.actions || [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Dispensar' },
    ],
  };
  
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'dismiss') return;
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// IndexedDB helper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('estoki-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingOperations')) {
        db.createObjectStore('pendingOperations', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

console.log('[SW] Service Worker loaded - ESTOKI WMS');
