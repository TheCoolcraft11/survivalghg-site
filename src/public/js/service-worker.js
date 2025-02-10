// Ereignis: Wenn eine Push-Benachrichtigung empfangen wird
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.text() : "Keine Daten erhalten";

  event.waitUntil(
    self.registration.showNotification("Push-Benachrichtigung", {
      body: data,
      icon: "https://via.placeholder.com/128",
      vibrate: [200, 100, 200],
    })
  );
});

// Ereignis: Wenn der Benutzer auf die Benachrichtigung klickt
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("https://example.com") // URL, die geöffnet wird
  );
});
