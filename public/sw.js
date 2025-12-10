self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: data.icon || '/vite.svg',
            badge: '/vite.svg',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2'
            }
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    // This looks to see if the current is already open and focuses if it is
    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then(function (clientList) {
            // Try to find a client that matches our scope
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
                    return client.focus();
                }
            }
            // If no client is found, open a new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
