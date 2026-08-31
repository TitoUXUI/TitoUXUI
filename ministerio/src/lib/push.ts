"use client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** true si el navegador es Safari de iOS y la app NO esta instalada (modo standalone). */
export function isIosBrowserTab() {
  if (typeof window === "undefined") return false;
  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return isIos && !isStandalone;
}

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.register("/sw.js");
}

export async function subscribeToPush(): Promise<{ ok: boolean; reason?: string }> {
  if (!isPushSupported()) return { ok: false, reason: "no_soportado" };
  if (isIosBrowserTab()) return { ok: false, reason: "ios_sin_instalar" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "permiso_denegado" };

  const registration = await registerServiceWorker();
  if (!registration) return { ok: false, reason: "sin_service_worker" };

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) return { ok: false, reason: "vapid_no_configurado" };

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON(), userAgent: navigator.userAgent }),
  });

  if (!response.ok) return { ok: false, reason: "error_guardando" };
  return { ok: true };
}
