/**
 * Service Worker para PWA - ESTOKI WMS
 * Suporte offline, cache e sincronização em background
 */

const CACHE_NAME = 'estoki-v1';
const STATIC_CACHE = 'estoki-static-v1';
const DYNAMIC_CACHE = 'estoki-dynamic-v1';
const API_CACHE = 'estoki-api-v1';

// Arquivos para cache estático
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
];

// URLs de API que devem ser cacheadas
const API_ROUTES = [
  '/api/products',
  '/api/locations',
  '/api/categories',
];

// Instalação - cachear assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação - limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== API_CACHE)
            .map((key) => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Estratégia de cache
function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || url.hostname.includes('supabase');
}

function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/.test(url.pathname);
}

// Cache First para assets estáticos
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

// Network First para API
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
    
    // Retornar resposta de erro offline
    return new Response(
      JSON.stringify({ error: 'offline', message: 'Você está offline' }),
      { headers: { 'Content-Type': 'application/json' }, status: 503 }
    );
  }
}

// Stale While Revalidate
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

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorar requisições de outros domínios (exceto Supabase)
  if (url.origin !== location.origin && !url.hostname.includes('supabase')) {
    return;
  }
  
  // APIs - Network First
  if (isApiRequest(url)) {
    event.respondWith(networkFirst(event.request, API_CACHE));
    return;
  }
  
  // Assets estáticos - Cache First
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }
  
  // Páginas HTML - Stale While Revalidate
  event.respondWith(staleWhileRevalidate(event.request, DYNAMIC_CACHE));
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
  if (!event.data) return;
  
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'ESTOKI WMS', {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: data.tag || 'default',
      data: data.data,
      actions: data.actions || [],
    })
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Foca janela existente ou abre nova
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
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
