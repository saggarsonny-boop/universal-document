// Cloudflare Turnstile server-side verification.
//
// Free tier shows the Turnstile widget on the second-and-later free
// conversion of the day (first conversion is captcha-free per Sonny's
// spec — we want zero friction on the first interaction). Plus + Pro
// tiers skip captcha entirely.
//
// Required env vars:
//   - NEXT_PUBLIC_TURNSTILE_SITE_KEY  (public; embedded in client widget)
//   - TURNSTILE_SECRET_KEY            (server-only; used by this module)
//
// Sonny creates a Turnstile site at cloudflare.com/turnstile for
// converter.hive.baby and adds both keys to Vercel env. Until they're set,
// `verifyTurnstileToken` returns true in development (NODE_ENV !==
// 'production') and false in production — failing closed.

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export type TurnstileResult = {
  ok: boolean
  /** When ok=false, an error code from Cloudflare or 'no-secret' / 'no-token'. */
  reason?: string
  /** Cloudflare's own challenge action if returned. */
  action?: string
}

/** Verify a Turnstile token returned from the client widget. Pass the
 * client's IP for additional binding (Cloudflare uses it as one signal). */
export async function verifyTurnstileToken(token: string | null | undefined, clientIp?: string): Promise<TurnstileResult> {
  if (!token) return { ok: false, reason: 'no-token' }

  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    if (process.env.NODE_ENV !== 'production') {
      // Dev / test environments without a Turnstile site set up should
      // still let the rest of the flow run. Production fails closed.
      return { ok: true, reason: 'no-secret-dev-bypass' }
    }
    return { ok: false, reason: 'no-secret' }
  }

  const params = new URLSearchParams({ secret, response: token })
  if (clientIp) params.set('remoteip', clientIp)

  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      body: params,
    })
    const data = await res.json() as {
      success: boolean
      'error-codes'?: string[]
      action?: string
    }
    if (!data.success) {
      return { ok: false, reason: (data['error-codes'] ?? []).join(',') || 'verify-failed' }
    }
    return { ok: true, action: data.action }
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) }
  }
}
