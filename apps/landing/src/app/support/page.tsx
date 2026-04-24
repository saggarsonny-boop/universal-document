'use client'

// TODO: update these with buy.stripe.com links after running create-support-products.js
const SUPPORT_LINK_MONTHLY = 'https://support.hive.baby'
const SUPPORT_LINK_ANNUAL  = 'https://support.hive.baby'
const SUPPORT_LINK_ONETIME = 'https://support.hive.baby'

const options = [
  {
    label: 'Monthly',
    price: '$1.99',
    unit: '/mo',
    description: 'Ongoing priority access. Cancel any time.',
    cta: 'Subscribe monthly',
    href: SUPPORT_LINK_MONTHLY,
    highlight: true,
  },
  {
    label: 'Annual',
    price: '$19',
    unit: '/yr',
    description: 'Best value. Save ~20% vs monthly.',
    cta: 'Subscribe annually',
    href: SUPPORT_LINK_ANNUAL,
    highlight: false,
  },
  {
    label: 'One-time',
    price: '$5',
    unit: '',
    description: 'Single query. No subscription.',
    cta: 'Pay once',
    href: SUPPORT_LINK_ONETIME,
    highlight: false,
  },
]

const faqs = [
  {
    q: 'What do I get with Priority Support?',
    a: 'A human reads your message and responds — not a bot, not an auto-reply. Direct help with any Universal Document™ or Hive tool.',
  },
  {
    q: 'How fast will I get a response?',
    a: 'Within 24 hours. If your issue is urgent, say so in your message and we prioritise.',
  },
  {
    q: 'What can I ask about?',
    a: 'Anything: the .uds/.udr/.udz format, converter issues, Utilities tools, Creator, Signer, Validator, Reader, feature requests, or billing.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Yes, any time — from your Stripe customer portal. No cancellation fees.',
  },
  {
    q: 'Can I just email for free?',
    a: 'Yes — hive@hive.baby. Priority Support moves you to the front of the queue with a guaranteed 24-hour window.',
  },
]

export default function SupportPage() {
  return (
    <main style={{ padding: '60px 24px 80px', maxWidth: 860, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 12, letterSpacing: '-0.02em' }}>
          Universal Document™ Support
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--ud-muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
          Real help from real humans. Every Universal Document™ tool, every Hive engine.
          Human response within 24 hours — guaranteed.
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 48 }}>
        {options.map(opt => (
          <div key={opt.label} style={{
            background: opt.highlight ? 'var(--ud-gold-3)' : 'var(--ud-paper-2)',
            border: opt.highlight ? '1px solid var(--ud-gold)' : '1px solid var(--ud-border)',
            borderRadius: 'var(--ud-radius-lg)',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--ud-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              {opt.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--ud-ink)' }}>{opt.price}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>{opt.unit}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              {opt.description}
            </p>
            <a href={opt.href} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', width: '100%', padding: '11px',
              background: 'var(--ud-ink)',
              color: '#fff',
              borderRadius: 'var(--ud-radius)',
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 13, fontWeight: 600, textAlign: 'center',
              transition: 'opacity 0.15s',
            }}>
              {opt.cta} →
            </a>
          </div>
        ))}
      </div>

      {/* What's included */}
      <div style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: '28px 32px', marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 16 }}>
          What&apos;s included
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'Human reads and responds — not a bot',
            'Covers all Universal Document™ tools and Hive engines',
            'Feature requests heard and logged',
            'Guaranteed response within 24 hours',
            'Direct email thread — no ticket system',
          ].map(item => (
            <li key={item} style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-muted)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ color: 'var(--ud-gold)', flexShrink: 0 }}>✦</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 20 }}>
          FAQ
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {faqs.map(faq => (
            <div key={faq.q} style={{ borderBottom: '1px solid var(--ud-border)', paddingBottom: 16 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', marginBottom: 6 }}>{faq.q}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-muted)', lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Free contact */}
      <div style={{ textAlign: 'center', padding: '28px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-muted)', marginBottom: 8 }}>
          Not ready to subscribe? Free contact always available.
        </p>
        <a href="mailto:hive@hive.baby" style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, color: 'var(--ud-ink)', textDecoration: 'none' }}>
          hive@hive.baby
        </a>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)', marginTop: 8 }}>
          No ads. No investors. No agenda.
        </p>
      </div>
    </main>
  )
}
