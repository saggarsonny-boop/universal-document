import { NextRequest, NextResponse } from 'next/server'
import { sql, ensureSession, ensureTables } from '@/lib/db'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  try {
    const { email, session_id } = await req.json()

    if (!email || !session_id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 })

    await ensureTables()
    await ensureSession(session_id)

    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await sql`
      INSERT INTO creator_magic_links (id, session_id, token, email, expires_at)
      VALUES (${crypto.randomUUID()}, ${session_id}, ${token}, ${email}, ${expiresAt.toISOString()})
    `
    await sql`UPDATE creator_sessions SET email = ${email} WHERE id = ${session_id}`

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://creator.hive.baby'
    const link = `${appUrl}/api/auth/verify?token=${token}&session=${session_id}&email=${encodeURIComponent(email)}`

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set — link:', link)
      return NextResponse.json({ success: true, email_sent: false })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'UD Creator <hive@hive.baby>',
      to: email,
      subject: 'Your UD Creator access link',
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:2rem;background:#0a0f1a">
          <div style="background:#0d1b2a;border-radius:0.75rem;padding:2rem;border:1px solid #1e3a5f">
            <p style="margin:0 0 0.25rem;font-size:1.1rem;font-weight:700;color:#f1f5f9">Access UD Creator</p>
            <p style="margin:0 0 1.5rem;color:#64748b;font-size:0.9rem">Click below to sign in and access your saved documents. Link expires in 1 hour.</p>
            <a href="${link}" style="display:inline-block;padding:0.75rem 1.75rem;background:#1e2d3d;color:#ffffff;text-decoration:none;border-radius:0.5rem;font-weight:600;font-size:0.95rem">Open UD Creator</a>
            <p style="margin:1.5rem 0 0;font-size:0.75rem;color:#475569">If you didn't request this, you can safely ignore this email.</p>
            <p style="margin:0.5rem 0 0;font-size:0.75rem;color:#334155">UD Creator · Universal Document · No ads · No investors</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true, email_sent: true })
  } catch (e) {
    console.error('send-magic-link error:', e)
    return NextResponse.json({ error: 'Failed to send link' }, { status: 500 })
  }
}
