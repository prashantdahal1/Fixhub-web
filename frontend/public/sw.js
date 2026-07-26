// sw.js – simple service worker to handle notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Focus/open the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/dashboard');
      }
    })
  );
});
