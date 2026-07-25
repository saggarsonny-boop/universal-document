import { useEffect } from 'react';

// This URL will point to the deployed Space Station (ud-creator) in production.
const TELEMETRY_ENDPOINT = process.env.NEXT_PUBLIC_TELEMETRY_URL || 'https://creator.universaldocument.org/api/telemetry';

export function sendTelemetryEvent(type: 'visit' | 'revenue', engine: string, amount?: number) {
  // Silent fail if endpoint is unreachable to avoid breaking the engine
  fetch(TELEMETRY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, engine, amount }),
    // Use keepalive so the request finishes even if the user navigates away
    keepalive: true
  }).catch(() => {});
}

/**
 * React hook to automatically record a page view for a specific engine.
 * @param engineName The canonical name of the engine (e.g. 'hive-plainscan')
 */
export function useHiveTelemetry(engineName: string) {
  useEffect(() => {
    // We only want to track this once per mount in production
    if (process.env.NODE_ENV === 'production') {
      sendTelemetryEvent('visit', engineName);
    } else {
      // Log to console in dev mode
      console.log(`[Telemetry] Recorded visit for ${engineName}`);
      sendTelemetryEvent('visit', engineName); // We can still send it to test local integration
    }
  }, [engineName]);
}
