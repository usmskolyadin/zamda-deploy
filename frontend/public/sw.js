self.addEventListener("push", function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "Zamda";
    const options = {
      body: data.body || "",
      icon: data.icon || "/icons/favicon.ico",
      badge: "/icons/favicon.ico",
      data: data.data || {},
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    console.error("Push notification error:", e);
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const url = event.notification.data?.url || "/messages";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
