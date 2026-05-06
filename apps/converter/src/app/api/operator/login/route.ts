// /api/operator/login — bootstrap an operator session via OPERATOR_SETUP_CODE.
//
// Flow:
//   1. Sonny POSTs { code: "...", identity: "sonny" } where `code` matches
//      the OPERATOR_SETUP_CODE env var.
//   2. The route checks that this code's digest hasn't been used before
//      (looked up in converter_operator_setup_code_state).
//   3. On match, the route stores the digest as last-used + issues a
//      signed `ud_operator` cookie via issueOperatorCookie.
//   4. To re-issue, Sonny rotates OPERATOR_SETUP_CODE in Vercel env
//      (the new digest won't match the stored last-used one).
//
// This is intentionally minimal — no Clerk integration, no rate limiting
// at this endpoint specifically. The setup code is single-use; brute
// forcing would require ~10^6 requests against a 6-digit code, after
// which a fresh code rotation invalidates everything anyway.

import { NextRequest, NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'crypto'
import { ensureSchema, getOperatorSetupCodeLastDigest, setOperatorSetupCodeLastDigest, recordOperatorAudit } from '@/lib/db'
import { issueOperatorCookie } from '@/lib/operator-auth'

export const runtime = 'nodejs'
export const maxDuration = 5

type Body = {
  code?: string
  identity?: string
}

function digest(s: string): string {
  return createHash('sha256').update(s).digest('hex')
}

export async function POST(req: NextRequest) {
  try { await ensureSchema() } catch (e) { console.warn('ensureSchema failed in operator login:', e) }

  let body: Body = {}
  try {
    body = await req.json() as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const submitted = body.code
  const expected = process.env.OPERATOR_SETUP_CODE
  if (!submitted || typeof submitted !== 'string') {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 })
  }
  if (!expected) {
    return NextResponse.json({ error: 'OPERATOR_SETUP_CODE env var not configured' }, { status: 503 })
  }
  // Constant-time match (length-aware).
  if (submitted.length !== expected.length) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
  }
  let match = false
  try {
    match = timingSafeEqual(Buffer.from(submitted), Buffer.from(expected))
  } catch {
    match = false
  }
  if (!match) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
  }

  // Single-use: refuse if this exact code (by digest) has been used
  // before. Sonny rotates OPERATOR_SETUP_CODE in Vercel env to issue a
  // new cookie — the new digest won't match the stored last-used one.
  const submittedDigest = digest(submitted)
  let lastDigest: string | null = null
  try {
    lastDigest = await getOperatorSetupCodeLastDigest()
  } catch (e) {
    console.warn('getOperatorSetupCodeLastDigest failed; allowing first use:', e)
  }
  if (lastDigest && lastDigest === submittedDigest) {
    return NextResponse.json(
      {
        error: 'setup_code_already_used',
        message: 'This setup code has already been used. Rotate OPERATOR_SETUP_CODE in Vercel env to issue a new operator cookie.',
      },
      { status: 410 },
    )
  }

  const identity = (body.identity && typeof body.identity === 'string') ? body.identity : 'operator'

  try {
    await setOperatorSetupCodeLastDigest(submittedDigest)
  } catch (e) {
    // Log but don't fail; the cookie still issues, the code just isn't
    // single-use-locked. Better to issue and audit than to fail closed.
    console.warn('setOperatorSetupCodeLastDigest failed (non-fatal):', e)
  }

  void recordOperatorAudit({ userIdentity: identity, action: 'login' })

  const cookie = issueOperatorCookie({ identity })
  const res = NextResponse.json({
    ok: true,
    identity,
    issuedAt: new Date().toISOString(),
  })
  res.headers.set('Set-Cookie', cookie.serialized)
  return res
}
