/**
 * Service Worker for Push Notifications
 * Handles push events and notification clicks
 */

/* eslint-env serviceworker */

// Service worker version for cache management
const SW_VERSION = "v1.0.0";

// Install event
self.addEventListener("install", (event) => {
  console.log(`[SW] Installing service worker ${SW_VERSION}`);
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log(`[SW] Activating service worker ${SW_VERSION}`);
  event.waitUntil(self.clients.claim());
});

// Push event - handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  if (!event.data) {
    console.warn("[SW] Push event has no data");
    return;
  }

  try {
    const data = event.data.json();
    const { title, body, icon, badge, tag, actions } = data;

    const options = {
      body: body || "",
      icon: icon || "/icons/icon-192x192.png",
      badge: badge || "/icons/badge-72x72.png",
      tag: tag || "default",
      data: data.data || {},
      requireInteraction: false,
      actions: actions || [],
      vibrate: [200, 100, 200],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error("[SW] Error showing notification:", error);
  }
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  // Handle different actions
  if (action === "dismiss") {
    return;
  }

  let url = "/";

  // Determine URL based on notification type and action
  if (data.type === "agent-message") {
    url = `/dashboard/agents/${data.agentId || ""}`;
  } else if (data.type === "subscription-expiring" && action === "renew") {
    url = "/pricing";
  } else if (data.type === "usage-warning" && action === "upgrade") {
    url = "/pricing";
  } else if (action === "view") {
    url = data.url || "/dashboard";
  }

  // Open or focus window
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }

        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});

// Handle push subscription change
self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("[SW] Push subscription changed");

  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription.options)
      .then((subscription) => {
        console.log("[SW] Resubscribed to push notifications");
        return fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subscription }),
        });
      })
  );
});

// Background sync for offline support (future enhancement)
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);

  if (event.tag === "sync-messages") {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  // Placeholder for syncing messages when back online
  console.log("[SW] Syncing messages...");
}

// Fetch event - for caching strategies (optional)
self.addEventListener("fetch", (event) => {
  // For now, just pass through all requests
  // In the future, implement caching strategies here
  event.respondWith(fetch(event.request));
});

console.log(`[SW] Service worker ${SW_VERSION} loaded`);
