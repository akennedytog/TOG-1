// BabyNest Service Worker for Push Notifications
// This service worker handles push events and notification clicks

const CACHE_NAME = 'babynest-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/favicon.ico',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Push event - receive and display push notification
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  if (!event.data) {
    console.warn('[Service Worker] Push event has no data');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    // If not JSON, use text
    data = {
      title: 'BabyNest Notification',
      body: event.data.text(),
    };
  }

  const title = data.title || 'BabyNest';
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    image: data.image || null,
    tag: data.tag || 'babynest-notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.data || {},
    silent: data.silent || false,
    vibrate: data.vibrate || [200, 100, 200],
    timestamp: data.timestamp || Date.now(),
    renotify: data.renotify || false,
    dir: 'auto',
    lang: 'en-US',
  };

  console.log('[Service Worker] Showing notification:', title, options);
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received:', event);
  
  event.notification.close();

  const notificationData = event.notification.data || {};
  const action = event.action;
  
  // Handle action buttons
  if (action) {
    console.log('[Service Worker] Action clicked:', action);
    
    switch (action) {
      case 'open':
        event.waitUntil(openApp(notificationData.url || '/dashboard'));
        break;
      case 'dismiss':
        // Just close the notification
        break;
      case 'complete':
        // Mark task as complete (if task_id provided)
        if (notificationData.taskId) {
          event.waitUntil(
            completeTask(notificationData.taskId).then(() => 
              openApp('/dashboard')
            )
          );
        }
        break;
      case 'view':
        event.waitUntil(openApp(notificationData.url || '/dashboard'));
        break;
      default:
        event.waitUntil(openApp(notificationData.url || '/dashboard'));
    }
  } else {
    // Default click behavior - open the app
    const url = notificationData.url || '/dashboard';
    event.waitUntil(openApp(url));
  }
});

// Notification close event (user dismissed without clicking)
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event);
});

// Message event - communicate with the main app
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Helper function to open the app
async function openApp(url) {
  console.log('[Service Worker] Opening app at:', url);
  
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });

  // Try to focus an existing window
  for (const client of clients) {
    if (client.url.includes(self.location.origin)) {
      await client.focus();
      // Navigate to the specific URL
      await client.navigate(url);
      return;
    }
  }

  // If no window exists, open a new one
  await self.clients.openWindow(url);
}

// Helper function to complete a task via API
async function completeTask(taskId) {
  console.log('[Service Worker] Completing task:', taskId);
  
  try {
    const response = await fetch('/api/tasks/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to complete task');
    }
    
    return await response.json();
  } catch (error) {
    console.error('[Service Worker] Error completing task:', error);
    throw error;
  }
}

// Background sync for offline support (future enhancement)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event);
  
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

async function syncTasks() {
  // Implementation for background sync
  console.log('[Service Worker] Syncing tasks...');
}

// Log that service worker is ready
console.log('[Service Worker] BabyNest Service Worker loaded');