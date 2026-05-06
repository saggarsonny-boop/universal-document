// Operator role bypass — lets specific users bypass tier gates entirely
// for testing, debugging, and emergency access. Wins over Pro / Plus /
// Free in checkRateLimit; treated as Pro tier downstream (50 MB cap, no
// captcha, no rate limit, no lifetime/daily cap).
//
// Three valid markers in priority order:
//   1. Clerk publicMetadata.role === 'operator' (skipped silently when
//      Clerk isn't wired into this engine — currently the case for UD
//      Converter; cookie + header markers cover the auth path).
//   2. Signed `ud_operator` cookie (HMAC-SHA256 with OPERATOR_AUTH_SECRET,
//      same shape as ud_plus). Issued by /api/operator/login on first
//      use of OPERATOR_SETUP_CODE.
//   3. Header `x-ud-operator-key` matching env var OPERATOR_KEY (for
//      CLI/automation use; bypasses the cookie roundtrip).
//
// Every operator action is logged to converter_operator_audit. The
// rate-limit decision carries an `operator: { identity }` field so the
// route handler can call `recordOperatorAudit` after a successful
// conversion (or other action).

import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'ud_operator'
const TTL_SECONDS = 60 * 60 * 24 * 30  // 30 days

type OperatorPayload = {
  identity: string  // email or "cli" or whatever the login route sets
  exp: number
}

function getSecret(): string {
  const s = process.env.OPERATOR_AUTH_SECRET
  if (!s || s.length < 16) {
    throw new Error('OPERATOR_AUTH_SECRET env var is missing or too short. Generate with `openssl rand -base64 32`.')
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

function sign(payload: OperatorPayload): string {
  const json = JSON.stringify(payload)
  const body = b64url(Buffer.from(json, 'utf-8'))
  const mac = createHmac('sha256', getSecret()).update(body).digest()
  return `${body}.${b64url(mac)}`
}

function verify(token: string): OperatorPayload | null {
  const dot = token.indexOf('.')
  if (dot < 0) return null
  const body = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  let expected: Buffer
  try {
    expected = createHmac('sha256', getSecret()).update(body).digest()
  } catch {
    return null
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
    const payload = JSON.parse(json) as OperatorPayload
    if (typeof payload.identity !== 'string' || typeof payload.exp !== 'number') return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

/** Issue a signed operator cookie. The TTL is 30 days; the caller is
 * responsible for rotating it (or for re-running the setup code). */
export function issueOperatorCookie(opts: { identity: string }): { name: string; value: string; serialized: string } {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS
  const token = sign({ identity: opts.identity, exp })
  const serialized = `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${TTL_SECONDS}`
  return { name: COOKIE_NAME, value: token, serialized }
}

export type OperatorDetection = {
  isOperator: boolean
  identity?: string
  marker?: 'clerk' | 'cookie' | 'header'
}

/** Returns operator status for a request. Synchronous-friendly: the only
 * I/O would be the Clerk session lookup, which doesn't apply to UD
 * Converter today, so this stays sync. Cookie + header markers are
 * timing-safe-compared. */
export function checkOperator(req: NextRequest): OperatorDetection {
  // 1. Clerk: not wired for UD Converter today. Left as a placeholder
  //    so other engines that DO use Clerk can fork/extend by populating
  //    `req.headers.get('x-clerk-user-role')` in a Clerk middleware.
  const clerkRole = req.headers.get('x-clerk-user-role')
  if (clerkRole === 'operator') {
    const id = req.headers.get('x-clerk-user-email') ?? 'clerk-operator'
    return { isOperator: true, identity: id, marker: 'clerk' }
  }

  // 2. Header: `x-ud-operator-key` (constant-time match against env var).
  const header = req.headers.get('x-ud-operator-key')
  const expected = process.env.OPERATOR_KEY
  if (header && expected && header.length === expected.length) {
    try {
      if (timingSafeEqual(Buffer.from(header), Buffer.from(expected))) {
        return { isOperator: true, identity: 'cli', marker: 'header' }
      }
    } catch {
      // Length mismatch already filtered; any other error means malformed input.
    }
  }

  // 3. Signed `ud_operator` cookie.
  const cookie = req.cookies.get(COOKIE_NAME)
  if (cookie?.value) {
    const payload = verify(cookie.value)
    if (payload) {
      return { isOperator: true, identity: payload.identity, marker: 'cookie' }
    }
  }

  return { isOperator: false }
}

export const OPERATOR_COOKIE_NAME = COOKIE_NAME
