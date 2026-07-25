"use client";

// Captures the browser's native install prompt (Chromium) and exposes
// a single trigger() that returns one of four outcomes — including an
// `ios-needs-overlay` sentinel telling the caller to open IOSInstallOverlay
// instead of attempting a non-existent native event.
//
// This is the canonical extraction of the ParkBack hook of the same name.
// Two intentional invariants from PR #70's iOS regression are preserved:
//
//   1. On iOS the hook attaches NO event listeners at all — it just reports
//      isIOS:true and short-circuits trigger() to "ios-needs-overlay".
//   2. Every state mutation inside the listeners is wrapped in try/catch so
//      a future browser quirk in the event payload cannot crash React's
//      render tree on Safari.
//
// usePlatform() is a thin wrapper exporting just `platform` for callers
// that don't need the trigger() function.

import { useCallback, useEffect, useRef, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type InstallTriggerResult =
  | "accepted"
  | "dismissed"
  | "ios-needs-overlay"
  | "unavailable";

export type InstallPlatform =
  | "ios"
  | "chromium"
  | "desktop-safari-firefox"
  | "unknown";

function detectIsIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPad Pro reports MacIntel + maxTouchPoints>1.
  const platform = (navigator as Navigator & { platform?: string }).platform;
  const maxTouch = (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints;
  return platform === "MacIntel" && (maxTouch || 0) > 1;
}

// Caller must already have ruled out iOS + chromium-installable before calling.
function detectFallbackPlatform(): "desktop-safari-firefox" | "unknown" {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/Safari/.test(ua) && !/Chrome|CriOS|EdgiOS|FxiOS|Edg\//.test(ua)) {
    return "desktop-safari-firefox";
  }
  if (/Firefox/.test(ua)) return "desktop-safari-firefox";
  return "unknown";
}

export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const isIOSRef = useRef(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ios = detectIsIOS();
    isIOSRef.current = ios;
    setIsIOS(ios);

    // CRITICAL: do not attach beforeinstallprompt or appinstalled listeners
    // on iOS. The events don't exist there, but past regressions suggest
    // the iOS code path is fragile to any extra listener-related work.
    if (ios) return;

    const onBefore = (e: Event) => {
      try {
        e.preventDefault();
        setDeferred(e as BeforeInstallPromptEvent);
      } catch {
        // Defensive — never let a future browser quirk crash the page.
      }
    };
    const onInstalled = () => {
      try {
        setInstalled(true);
        setDeferred(null);
      } catch {
        // Same defensive posture.
      }
    };
    window.addEventListener("beforeinstallprompt", onBefore as EventListener);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBefore as EventListener);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const trigger = useCallback(async (): Promise<InstallTriggerResult> => {
    if (isIOSRef.current) return "ios-needs-overlay";
    if (!deferred) return "unavailable";
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setDeferred(null);
      return choice.outcome;
    } catch {
      return "unavailable";
    }
  }, [deferred]);

  const canPromptNatively = deferred !== null;
  let platform: InstallPlatform;
  if (isIOS) {
    platform = "ios";
  } else if (canPromptNatively) {
    platform = "chromium";
  } else {
    platform = detectFallbackPlatform();
  }

  return {
    canPromptNatively,
    isIOS,
    installed,
    platform,
    trigger,
  };
}

/** Read-only view of `useInstallPrompt` for components that only need the
 *  platform classification (e.g. to choose copy) and not the trigger. */
export function usePlatform(): { platform: InstallPlatform; isIOS: boolean } {
  const { platform, isIOS } = useInstallPrompt();
  return { platform, isIOS };
}
