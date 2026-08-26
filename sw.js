// sw.js - Service Worker para notificações em segundo plano
self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : { title: 'DívidaZero', body: 'Você tem uma conta pendente!' };

    const options = {
        body: data.body,
        icon: 'favicon.ico',
        badge: 'favicon.ico',
        vibrate: [200, 100, 200]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('https://teddyws1.github.io/DividaZero/')
    );
});
