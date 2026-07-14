"use client";

import { useAuth } from "@/src/features/context/auth-context";
import { apiFetchAuth } from "@/src/shared/api/auth.client";
import { useEffect, useRef } from "react";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushProvider({ children }: { children: React.ReactNode }) {
  const { user, accessToken } = useAuth();
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!user || !accessToken || registeredRef.current) return;

    if (!("Notification" in window)) return;
    if (!("serviceWorker" in navigator)) return;
    if (!("PushManager" in window)) return;
    if (!VAPID_PUBLIC_KEY) return;

    async function initPush() {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        await registration.update();

        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
        }

        await apiFetchAuth("/api/push/subscribe/", {
          method: "POST",
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            p256dh_key: arrayBufferToBase64(subscription.getKey("p256dh")),
            auth_key: arrayBufferToBase64(subscription.getKey("auth")),
          }),
        });

        if (Notification.permission === "default") {
          Notification.requestPermission();
        }

        registeredRef.current = true;
      } catch (err) {
        console.error("Push subscription failed:", err);
      }
    }

    initPush();
  }, [user, accessToken]);

  return <>{children}</>;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
