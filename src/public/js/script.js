// Prüfen, ob der Browser die APIs unterstützt
if ("Notification" in window && "serviceWorker" in navigator) {
  const notifyBtn = document.getElementById("notify-btn");

  // Button-Click-Ereignis
  notifyBtn.addEventListener("click", async () => {
    // Berechtigung für Benachrichtigungen anfordern
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      // Service Worker registrieren
      const registration = await navigator.serviceWorker.register(
        "/js/service-worker.js"
      );
      console.log("Service Worker registriert:", registration);

      // Beispiel-Benachrichtigung auslösen
      registration.showNotification("Push-Benachrichtigung aktiviert!", {
        body: "Dies ist eine lokale Push-Benachrichtigung.",
        icon: "https://via.placeholder.com/128",
        vibrate: [200, 100, 200],
      });
    } else {
      alert("Benachrichtigungen wurden abgelehnt!");
    }
  });
  const testBtn = document.getElementById("test-btn");
  testBtn.addEventListener("click", async () => {
    const registration = await navigator.serviceWorker.register(
      "/js/service-worker.js"
    );
    console.log("Service Worker registriert:", registration);

    // Beispiel-Benachrichtigung auslösen
    registration.showNotification("Push-Benachrichtigung aktiviert!", {
      body: "Dies ist eine lokale Push-Benachrichtigung.",
      icon: "https://placehold.co/128",
      vibrate: [200, 100, 200],
    });
  });
} else {
  alert("Push-Benachrichtigungen werden in deinem Browser nicht unterstützt.");
}
