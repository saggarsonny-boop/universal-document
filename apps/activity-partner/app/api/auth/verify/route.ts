import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/app/_lib/db'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    const sessionId = url.searchParams.get('session')
    const email = url.searchParams.get('email')

    if (!token || !sessionId || !email) {
      return new NextResponse('Invalid link parameters', { status: 400 })
    }

    const links = await sql`
      SELECT id, expires_at, used_at FROM aac_magic_links 
      WHERE token = ${token} AND email = ${email} AND session_id = ${sessionId}
    `

    if (links.length === 0) {
      return new NextResponse('Invalid link', { status: 400 })
    }

    const link = links[0]

    if (link.used_at) {
      return new NextResponse('Link already used', { status: 400 })
    }

    if (new Date(link.expires_at) < new Date()) {
      return new NextResponse('Link expired', { status: 400 })
    }

    // Mark as used
    await sql`UPDATE aac_magic_links SET used_at = CURRENT_TIMESTAMP WHERE id = ${link.id}`

    // Update session with verified email
    await sql`UPDATE aac_sessions SET email = ${email}, last_active = CURRENT_TIMESTAMP WHERE id = ${sessionId}`

    // Set a secure cookie for the session
    const response = NextResponse.redirect(new URL('/dashboard', req.url))
    response.cookies.set('aac_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    return response

  } catch (e) {
    console.error('verify-magic-link error:', e)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
