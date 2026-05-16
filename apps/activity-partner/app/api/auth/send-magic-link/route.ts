import { NextRequest, NextResponse } from 'next/server'
import { sql, ensureSession, ensureTables } from '@/app/_lib/db'
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
      INSERT INTO aac_magic_links (id, session_id, token, email, expires_at)
      VALUES (${crypto.randomUUID()}, ${session_id}, ${token}, ${email}, ${expiresAt.toISOString()})
    `

    const appUrl = req.nextUrl.origin
    const link = `${appUrl}/api/auth/verify?token=${token}&session=${session_id}&email=${encodeURIComponent(email)}`

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set — link:', link)
      return NextResponse.json({ success: true, email_sent: false, link_for_dev: link })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'AAC Enterprise Portal <hive@hive.baby>',
      to: email,
      subject: 'Access AAC Enterprise Portal',
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:2rem;background:#0a0a0a;color:#f5f1e6">
          <div style="background:#111;border-radius:0.75rem;padding:2rem;border:1px solid #333">
            <h2 style="margin:0 0 1rem;font-size:1.5rem;font-weight:600;color:#D4AF37;letter-spacing:-0.02em;">Adaptive AI Activity Companion</h2>
            <p style="margin:0 0 1.5rem;color:#aaa;font-size:1rem;line-height:1.5;">Click below to securely authenticate your session. This link expires in 1 hour.</p>
            <a href="${link}" style="display:inline-block;padding:0.75rem 1.75rem;background:#D4AF37;color:#000;text-decoration:none;border-radius:0.5rem;font-weight:600;font-size:1rem">Authenticate Session</a>
            <hr style="margin:2rem 0;border:none;border-top:1px solid #222;" />
            <p style="margin:0;font-size:0.75rem;color:#555">AAC Enterprise Portal · Universal Document™</p>
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
