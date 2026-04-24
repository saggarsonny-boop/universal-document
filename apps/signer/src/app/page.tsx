'use client'
import TooltipTour from '@/components/TooltipTour'

const FEATURES = [
  {
    icon: '🔐',
    title: 'Mathematical tamper evidence',
    body: 'Not an audit trail PDF. A SHA-256 hash of your document is embedded at signing. Any modification — even a single character — is detectable instantly.',
  },
  {
    icon: '⛓',
    title: 'Blockchain provenance',
    body: 'Your signature record is designed to be written to a permanent public ledger at the moment of signing. Not a centralised audit trail. A mathematical fact.',
  },
  {
    icon: '📄',
    title: 'Works on everything',
    body: 'PDF, Word, Excel, CSV, images, and Universal Document™ files. If it\'s a file, UD Signer can sign it. No format lock-in.',
  },
]

const COMPARISON = [
  ['Mathematical tamper proof',    true,  false, false],
  ['Blockchain provenance',        true,  false, false],
  ['Works on all file formats',    true,  false, false],
  ['Native document expiration',   true,  false, false],
  ['Native revocation',            true,  false, false],
  ['No lock-in (open format)',     true,  false, false],
  ['Free tier',                    '3/mo', 'Trial', 'Trial'],
  ['Pro price',                    '$12/mo', '$15+/mo', '$15+/mo'],
]

const COL_HEADERS = ['Feature', 'UD Signer', 'DocuSign', 'Adobe Sign']

function Check({ val }: { val: boolean | string }) {
  if (val === true)  return <span style={{ color: '#0a7a6a', fontWeight: 700, fontSize: 16 }}>✓</span>
  if (val === false) return <span style={{ color: 'var(--ud-muted)', fontSize: 16 }}>✗</span>
  return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>{val}</span>
}

export default function SignerHome() {
  return (
    <div style={{ background: 'var(--ud-paper)' }}>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' }}>
        <span style={{
          display: 'inline-block', marginBottom: 20,
          fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          padding: '4px 14px', borderRadius: 99,
          background: 'var(--ud-gold-3)', color: 'var(--ud-gold)',
          border: '1px solid var(--ud-gold)',
        }}>
          UD Signer · Universal Document™
        </span>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,6vw,60px)',
          fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ud-ink)',
          lineHeight: 1.05, marginBottom: 24,
        }}>
          Sign anything.<br />Prove everything.
        </h1>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--ud-muted)',
          lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px',
        }}>
          The only document signing tool with mathematical tamper evidence,
          blockchain provenance, and native revocation.
          Free for 3 signatures/month.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/sign" style={{
            padding: '14px 28px', background: 'var(--ud-ink)', color: '#fff',
            fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600,
            borderRadius: 'var(--ud-radius)', textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}>
            Sign a document →
          </a>
          <a href="/verify" style={{
            padding: '14px 28px', background: '#fff', color: 'var(--ud-ink)',
            fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600,
            borderRadius: 'var(--ud-radius)', textDecoration: 'none',
            border: '1px solid var(--ud-border)',
            transition: 'border-color 0.15s',
          }}>
            Verify a signature →
          </a>
        </div>
      </div>

      {/* ── Feature cards ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              padding: '28px 24px',
              background: '#fff',
              border: '1px solid var(--ud-border)',
              borderRadius: 'var(--ud-radius-lg)',
              boxShadow: 'var(--ud-shadow)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 10 }}>
                {f.title}
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-muted)', lineHeight: 1.6 }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Comparison table ──────────────────────────────────────── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 96px' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
          color: 'var(--ud-ink)', letterSpacing: '-0.02em',
          textAlign: 'center', marginBottom: 36,
        }}>
          Why not DocuSign?
        </h2>

        <div style={{ border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', overflow: 'hidden', boxShadow: 'var(--ud-shadow)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--ud-ink)' }}>
                {COL_HEADERS.map((h, i) => (
                  <th key={h} style={{
                    padding: '14px 20px', textAlign: i === 0 ? 'left' : 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
                    color: i === 1 ? '#c8960a' : 'rgba(255,255,255,0.7)',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : 'var(--ud-paper-2)', borderBottom: ri < COMPARISON.length - 1 ? '1px solid var(--ud-border)' : 'none' }}>
                  <td style={{ padding: '13px 20px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', fontWeight: 500 }}>
                    {String(row[0])}
                  </td>
                  {[row[1], row[2], row[3]].map((val, ci) => (
                    <td key={ci} style={{ padding: '13px 20px', textAlign: 'center' }}>
                      <Check val={val as boolean | string} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: 16, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>
          Prices shown are approximate. DocuSign and Adobe Sign pricing varies by plan.
        </p>
      </div>

      {/* ── CTA footer ────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--ud-ink)', padding: '64px 24px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em' }}>
          Ready to sign?
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 32, lineHeight: 1.6 }}>
          3 signatures free every month. No account. No credit card.
        </p>
        <a href="/sign" style={{
          padding: '14px 32px', background: '#c8960a', color: '#fff',
          fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700,
          borderRadius: 'var(--ud-radius)', textDecoration: 'none',
        }}>
          Sign a document →
        </a>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 24px 0' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Signer differs from DocuSign, Adobe Sign, and HelloSign</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>E-signature platforms are workflow tools — they manage routing, reminders, and audit trails inside their platform. UD Signer is a cryptographic proof tool — the signature travels with the document, not in a third-party database.</p>
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
          {[
            { title: 'DocuSign / Adobe Sign — platform-hosted signatures', body: 'Signatures are stored in the provider\'s database. If the provider shuts down, changes their API, or loses your account, the signature record is gone. Verification requires the originating platform to still be operational.' },
            { title: 'HelloSign / PandaDoc — workflow-first e-signatures', body: 'These tools excel at routing documents for signature. But the "signature" is a platform attestation, not a cryptographic proof. There is no way to verify the document independently — you need the platform to vouch for it.' },
            { title: 'UD Signer — platform-independent cryptographic proof', body: 'UD Signer generates a SHA-256 hash of your document and produces a .udsig companion file containing the signature, timestamp, and optional identity claim. Verification works with any hash tool — no platform dependency, no account required.' },
            { title: 'UD Signer — the proof travels with the document', body: 'The .udsig file stays alongside the document. Anyone with the document and its companion .udsig can verify integrity without contacting UD Signer, the UD ecosystem, or any third party. Truly portable tamper-evidence.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>

      <TooltipTour engineId="signer" tips={[
        { label: 'Sign a document', text: 'Attach your identity to any .uds or .udr file. The signature is embedded in the document metadata.' },
        { label: 'Tamper evidence', text: 'A SHA-256 hash is calculated at signing. Any change to the document after signing is mathematically detectable.' },
        { label: 'Verify a signature', text: 'Use the Verify tab to confirm a signature is intact and the document unchanged since signing.' },
        { label: 'Beta access', text: 'All Pro features are free during beta. No account required.' },
      ]} />
    </div>
  )
}
