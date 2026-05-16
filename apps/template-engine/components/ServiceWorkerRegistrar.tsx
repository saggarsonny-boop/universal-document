"use client";

// Registers the engine's service worker on first load. The SW handles
// stale-while-revalidate for the app shell and excludes /api/* so the AI
// endpoints always hit the live route. Silent on failure — the engine
// works without it; SW is purely an offline + install-to-home-screen win.

import { useEffect } from "react";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Silent — SW is best-effort.
    });
  }, []);
  return null;
}
