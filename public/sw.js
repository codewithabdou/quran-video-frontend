self.addEventListener('push', function (event) {
    console.log('[SW] Push event received');
    
    // Immediate heartbeat to main window for debugging
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                windowClients.forEach(client => {
                    client.postMessage({ type: 'PUSH_HEARTBEAT', timestamp: Date.now() });
                });
            })
    );

    let data;
    try {
        data = event.data ? event.data.json() : null;
    } catch (e) {
        console.error('[SW] Failed to parse push data:', e);
        // Show a fallback notification with raw text
        const rawText = event.data ? event.data.text() : 'New notification';
        event.waitUntil(
            self.registration.showNotification('Quran Video Generator', {
                body: rawText,
                icon: '/logo.png',
                badge: '/logo.png',
            })
        );
        return;
    }

    if (data) {
        console.log('[SW] Push data:', JSON.stringify(data));
        
        // Notify all clients (open windows) about the push event for easier debugging
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then(windowClients => {
                    windowClients.forEach(client => {
                        client.postMessage({
                            type: 'PUSH_RECEIVED',
                            payload: data
                        });
                    });
                })
        );

        const options = {
            body: data.body || 'Your video is ready!',
            icon: data.icon || '/logo.png',
            badge: '/logo.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2'
            }
        };
        event.waitUntil(
            self.registration.showNotification(data.title || 'Quran Video Generator', options)
                .then(() => console.log('[SW] Notification displayed successfully'))
                .catch(err => console.error('[SW] Failed to show notification:', err))
        );
    } else {
        console.log('[SW] Push event had no data, showing default notification');
        event.waitUntil(
            self.registration.showNotification('Quran Video Generator', {
                body: 'You have a new update!',
                icon: '/logo.png',
                badge: '/logo.png',
            })
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
