// PR D — Plus tier signed-cookie auth.
//
// Plus tier ($0.97/mo) doesn't issue an API key (that's Pro-only). Auth
// is by signed cookie set on the Stripe checkout return:
//
//   1. User completes Stripe checkout for Plus
//   2. Stripe redirects to /?plus_session_id=cs_...
//   3. Client calls /api/auth/plus-session?id=cs_... which:
//      - Retrieves the Stripe session, confirms it's paid
//      - Verifies the subscription is for the Plus price
//      - Sets `ud_plus` HttpOnly+Secure cookie containing
//        base64url(payload).hmac, where payload = {email, customerId, exp}
//   4. Subsequent requests carry the cookie; rate-limit + /api/usage
//      verify HMAC and check `email` is still 'active' in
//      converter_subscriptions (defence against revoked subscriptions
//      where the cookie is still valid).
//
// PLUS_AUTH_SECRET env var = HMAC signing key (Sonny generates a 32-byte
// random secret and adds to Vercel env before deploy).

import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'
import { getSubscriptionWithTier } from './db'

const COOKIE_NAME = 'ud_plus'
const TTL_SECONDS = 60 * 60 * 24 * 30  // 30 days; auto-renewed on each successful conversion

type PlusPayload = {
  email: string
  customerId: string
  exp: number  // unix seconds
}

function getSecret(): string {
  const s = process.env.PLUS_AUTH_SECRET
  if (!s || s.length < 16) {
    throw new Error('PLUS_AUTH_SECRET env var is missing or too short. Generate a 32-byte random string and add to Vercel env.')
  }
  return s
}

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(str: string): Buffer {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4)
  return Buffer.from(padded, 'base64')
}

function sign(payload: PlusPayload): string {
  const json = JSON.stringify(payload)
  const body = b64url(Buffer.from(json, 'utf-8'))
  const mac = createHmac('sha256', getSecret()).update(body).digest()
  return `${body}.${b64url(mac)}`
}

function verify(token: string): PlusPayload | null {
  const dot = token.indexOf('.')
  if (dot < 0) return null
  const body = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  let expected: Buffer
  try {
    expected = createHmac('sha256', getSecret()).update(body).digest()
  } catch {
    return null  // Secret missing — treat as unauthenticated
  }
  let actual: Buffer
  try {
    actual = b64urlDecode(sig)
  } catch {
    return null
  }
  if (expected.length !== actual.length) return null
  if (!timingSafeEqual(expected, actual)) return null
  try {
    const json = b64urlDecode(body).toString('utf-8')
    const payload = JSON.parse(json) as PlusPayload
    if (typeof payload.email !== 'string' || typeof payload.customerId !== 'string' || typeof payload.exp !== 'number') {
      return null
    }
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

/** Issue a signed Plus cookie value. Returns the Set-Cookie value the
 * caller should attach to their NextResponse. The cookie is HttpOnly,
 * Secure, SameSite=Lax, Path=/, with the configured TTL. */
export function issuePlusCookie(opts: { email: string; customerId: string }): { name: string; value: string; serialized: string } {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS
  const token = sign({ email: opts.email, customerId: opts.customerId, exp })
  const serialized = `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${TTL_SECONDS}`
  return { name: COOKIE_NAME, value: token, serialized }
}

/** Read + verify the `ud_plus` cookie from a request. Returns the payload
 * if signed correctly + not expired + the email is still an active Plus
 * subscriber; returns null otherwise. */
export async function readPlusFromRequest(req: NextRequest): Promise<{ email: string; customerId: string } | null> {
  const cookie = req.cookies.get(COOKIE_NAME)
  if (!cookie?.value) return null
  const payload = verify(cookie.value)
  if (!payload) return null
  // Defence-in-depth: cookie HMAC valid + not expired, but verify the
  // subscription is still 'active' in our DB (so revoked subs can't keep
  // using a stolen-but-still-signed cookie).
  try {
    const sub = await getSubscriptionWithTier(payload.email)
    if (!sub || !sub.active || sub.tier !== 'plus') return null
    return { email: payload.email, customerId: payload.customerId }
  } catch {
    // DB error — fail closed (treat as unauthenticated). Better to ask
    // the user to log in again than to grant unlimited conversions on a
    // potentially stale cookie.
    return null
  }
}

export const PLUS_COOKIE_NAME = COOKIE_NAME
