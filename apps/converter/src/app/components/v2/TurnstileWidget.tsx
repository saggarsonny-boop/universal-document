'use client'

// Cloudflare Turnstile widget. Loaded dynamically (only when needed —
// free user past their first conversion). Calls onToken with the
// verification token; client passes it to the convert request as
// `turnstileToken` form field.
//
// Site key from NEXT_PUBLIC_TURNSTILE_SITE_KEY. Until Sonny configures
// this in Vercel env, the widget renders a "Captcha not configured"
// placeholder rather than failing the whole UI.

import { useEffect, useRef, useState } from 'react'

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

// Minimal Turnstile global typing — we only call the methods we use.
type TurnstileGlobal = {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string
      callback?: (token: string) => void
      'error-callback'?: (err: string) => void
      'expired-callback'?: () => void
      theme?: 'light' | 'dark' | 'auto'
    },
  ) => string
  reset: (id?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileGlobal
  }
}

type Props = {
  onToken: (token: string | null) => void
}

export function TurnstileWidget({ onToken }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  // Load the Turnstile script once. The script is cheap (~10kB) and is
  // cached aggressively by Cloudflare's CDN, so loading on every render
  // of this component (which is itself rare) is fine.
  useEffect(() => {
    if (!siteKey) return
    if (typeof window === 'undefined') return
    if (window.turnstile) {
      setScriptLoaded(true)
      return
    }
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      // Already loading — just wait.
      const interval = window.setInterval(() => {
        if (window.turnstile) {
          window.clearInterval(interval)
          setScriptLoaded(true)
        }
      }, 100)
      return () => window.clearInterval(interval)
    }
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
    s.onload = () => setScriptLoaded(true)
    s.onerror = () => setError('Could not load captcha. Check your network connection.')
    document.head.appendChild(s)
  }, [siteKey])

  // Render the widget once the script is loaded and the container is
  // mounted. Cleanup on unmount via turnstile.reset().
  useEffect(() => {
    if (!siteKey) return
    if (!scriptLoaded) return
    if (!containerRef.current) return
    if (!window.turnstile) return

    try {
      const id = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onToken(token),
        'error-callback': (err: string) => setError(`Captcha error: ${err}`),
        'expired-callback': () => onToken(null),
        theme: 'light',
      })
      widgetIdRef.current = id
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Captcha render failed')
    }

    return () => {
      // No formal teardown API; reset() clears the widget state.
      try { window.turnstile?.reset(widgetIdRef.current ?? undefined) } catch { /* ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptLoaded])

  if (!siteKey) {
    return (
      <div style={{
        padding: '12px 14px',
        background: 'rgba(200, 150, 10, 0.08)',
        border: '1px solid rgba(200, 150, 10, 0.3)',
        borderRadius: 8,
        fontSize: 13,
        color: 'var(--ud-muted)',
      }}>
        Captcha not configured (NEXT_PUBLIC_TURNSTILE_SITE_KEY missing). The convert button works in dev/preview environments.
      </div>
    )
  }

  return (
    <div>
      <div ref={containerRef} />
      {error && (
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--ud-danger, #c0392b)' }}>{error}</p>
      )}
    </div>
  )
}
