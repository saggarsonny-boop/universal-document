"use client";

// Registers /sw.js on first paint after hydration. The worker caches the
// app shell so the engine loads on a flaky connection.

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Worker registration is non-fatal — the app works without it.
    });
  }, []);
  return null;
}
