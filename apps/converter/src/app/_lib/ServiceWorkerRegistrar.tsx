"use client";

// Registers public/sw.js on first paint. SSR-safe (no window access at
// render time). Uses a useEffect so the SW registration never blocks
// hydration. Failures are non-fatal — the app still works without an
// offline shell.

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Don't try to register the SW from a Vercel preview / branch URL —
    // the service worker scope wouldn't survive the production cutover.
    if (typeof location !== "undefined" && /vercel\.app$/.test(location.hostname)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((err) => {
        if (typeof console !== "undefined" && console.warn) {
          console.warn("[ud-converter] sw register failed:", err);
        }
      });
  }, []);
  return null;
}
