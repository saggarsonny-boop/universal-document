'use client'
import { useState } from 'react'

const FORMAT_TOOLS = [
  { slug: 'seal',             name: 'UD Seal',              icon: '🔏', desc: 'Convert a draft .udr into a sealed, tamper-evident .uds document.',              free: true  },
  { slug: 'chain-of-custody', name: 'UD Chain of Custody',  icon: '🔗', desc: 'Parse and display the full provenance timeline of any Universal Document™.',      free: true  },
  { slug: 'udz-zipper',       name: 'UDZ Zipper',           icon: '📦', desc: 'Bundle multiple .uds files into a single .udz archive with shared metadata.',      free: true  },
  { slug: 'udz-unzipper',     name: 'UDZ Unzipper',         icon: '📂', desc: 'Extract all .uds files from a .udz bundle with integrity verification.',          free: true  },
]

const AI_TOOLS = [
  { slug: 'translate',  name: 'UD Translate',  icon: '🌐', desc: 'Translate any Universal Document™ into another language using Claude. Embeds translation as a parallel language stream.', free: true, proLabel: 'AI' },
  { slug: 'summarise',  name: 'UD Summarise',  icon: '✦',  desc: 'Generate a plain-language summary of any Universal Document™. Embedded as a Clarity Layer in the output file.',          free: true, proLabel: 'AI' },
]

/* Per-tool mini-animation: CSS keyframe name + rendered SVG/emoji sequence */
const TOOLS = [
  {
    slug: 'merge',    name: 'UD Merge',          icon: '⊕',   color: 'var(--ud-ink)',   free: true,
    anim: 'merge',    animLabel: '2 docs → 1',
    desc: 'Combine multiple PDFs or Universal Documents™ into one.',
  },
  {
    slug: 'split',    name: 'UD Split',           icon: '⊘',   color: 'var(--ud-ink)',   free: true,
    anim: 'split',    animLabel: '1 doc → pages',
    desc: 'Split a PDF or Universal Document™ into separate pages or ranges.',
  },
  {
    slug: 'compress', name: 'UD Compress',        icon: '⊛',   color: 'var(--ud-ink)',   free: true,
    anim: 'compress', animLabel: '10 MB → 2 MB',
    desc: 'Reduce PDF or Universal Document™ file size without losing quality.',
  },
  {
    slug: 'extract-pages', name: 'UD Extract Pages', icon: '⊡', color: 'var(--ud-ink)', free: true,
    anim: 'extract',  animLabel: 'pick pages',
    desc: 'Pull specific pages out of any PDF or Universal Document™.',
  },
  {
    slug: 'rearrange', name: 'UD Rearrange',      icon: '⇅',   color: 'var(--ud-ink)',   free: true,
    anim: 'rearrange', animLabel: 'drag to reorder',
    desc: 'Drag and drop to reorder pages in any document visually.',
  },
  {
    slug: 'protect',  name: 'UD Protect',         icon: '⊠',   color: 'var(--ud-ink)',   free: true,
    anim: 'protect',  animLabel: 'add password',
    desc: 'Add password protection to any PDF or Universal Document™.',
  },
  {
    slug: 'unlock',   name: 'UD Unlock',          icon: '⊟',   color: 'var(--ud-ink)',   free: true,
    anim: 'unlock',   animLabel: 'remove password',
    desc: 'Remove password from a PDF or Universal Document™ you own.',
  },
  {
    slug: 'ocr',      name: 'UD OCR',             icon: '⊜',   color: 'var(--ud-teal)',  free: false, proLabel: 'AI',
    anim: 'ocr',      animLabel: 'scan → text',
    desc: 'Extract text from scanned PDFs, images, or Universal Documents™ using AI.',
  },
  {
    slug: 'watermark', name: 'UD Watermark',      icon: '⊙',   color: 'var(--ud-teal)',  free: true,
    anim: 'watermark', animLabel: 'stamp document',
    desc: 'Add text or UD-certified watermarks to any document.',
  },
  {
    slug: 'page-numbers', name: 'UD Page Numbers', icon: '#',  color: 'var(--ud-ink)',   free: true,
    anim: 'pagenums', animLabel: 'add numbering',
    desc: 'Add customisable page numbers to any PDF or Universal Document™.',
  },
  {
    slug: 'compare',  name: 'UD Compare',         icon: '⊷',   color: 'var(--ud-teal)',  free: false, proLabel: 'AI',
    anim: 'compare',  animLabel: 'A vs B → diff',
    desc: 'Side-by-side diff of two documents. Upload original and revised.',
  },
  {
    slug: 'redact',   name: 'UD Redact & Highlight', icon: '▬', color: 'var(--ud-ink)',  free: false, proLabel: 'Pro',
    anim: 'redact',   animLabel: 'black out text',
    desc: 'Permanently redact sensitive text or highlight key regions in any document.',
  },
  {
    slug: 'optimize', name: 'UD Optimize',        icon: '⊕',   color: 'var(--ud-ink)',   free: true,
    anim: 'optimize', animLabel: 'tune structure',
    desc: 'Optimise PDF or Universal Document™ structure for web, print, or archiving.',
  },
]

function ToolAnim({ slug }: { slug: string }) {
  const s: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ud-muted)', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }
  const doc = (label?: string) => (
    <div style={{ width: 22, height: 28, background: 'var(--ud-paper-3)', border: '1px solid var(--ud-border)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>
      {label || 'pdf'}
    </div>
  )
  const arrow = <span style={{ fontSize: 11, color: 'var(--ud-muted)' }}>→</span>

  const anims: Record<string, React.ReactNode> = {
    merge: (
      <div style={s}>
        {doc()} {doc()} {doc()} {arrow}
        <div style={{ width: 26, height: 32, background: 'var(--ud-ink)', borderRadius: 3, animation: 'ud-rise 1.2s ease infinite alternate', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontFamily: 'var(--font-mono)' }}>1</div>
      </div>
    ),
    split: (
      <div style={s}>
        {doc('big')} {arrow}
        <div style={{ display: 'flex', gap: 3 }}>
          {[1,2,3].map(n => <div key={n} style={{ width: 16, height: 22, background: 'var(--ud-ink)', borderRadius: 2, animation: `ud-rise ${0.8 + n*0.15}s ease infinite alternate`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#fff', fontFamily: 'var(--font-mono)' }}>{n}</div>)}
        </div>
      </div>
    ),
    compress: (
      <div style={s}>
        <div style={{ width: 28, height: 36, background: 'var(--ud-paper-3)', border: '1px solid var(--ud-border)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>10M</div>
        {arrow}
        <div style={{ width: 18, height: 22, background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 3, animation: 'ud-bounce 1.4s ease-in-out infinite', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontFamily: 'var(--font-mono)', color: 'var(--ud-teal)' }}>2M</div>
      </div>
    ),
    extract: (
      <div style={s}>
        {doc()} {arrow}
        <div style={{ display: 'flex', gap: 3 }}>
          {['p2','p5'].map(p => <div key={p} style={{ width: 18, height: 24, background: 'var(--ud-gold-3)', border: '1px solid var(--ud-gold)', borderRadius: 2, animation: 'ud-rise 1s ease infinite alternate', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontFamily: 'var(--font-mono)', color: 'var(--ud-gold)' }}>{p}</div>)}
        </div>
      </div>
    ),
    rearrange: (
      <div style={s}>
        {[1,2,3].map(n => <div key={n} style={{ width: 16, height: 22, background: n === 2 ? 'var(--ud-gold-3)' : 'var(--ud-paper-3)', border: `1px solid ${n===2 ? 'var(--ud-gold)' : 'var(--ud-border)'}`, borderRadius: 2, animation: n === 2 ? 'ud-bounce 1.2s ease-in-out infinite' : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontFamily: 'var(--font-mono)', color: n===2?'var(--ud-gold)':'var(--ud-muted)' }}>{n}</div>)}
      </div>
    ),
    protect: (
      <div style={s}>
        {doc()} {arrow}
        <div style={{ fontSize: 18, animation: 'ud-bounce 1.5s ease-in-out infinite' }}>🔒</div>
      </div>
    ),
    unlock: (
      <div style={s}>
        <div style={{ fontSize: 18 }}>🔒</div> {arrow}
        <div style={{ fontSize: 18, animation: 'ud-rise 1.2s ease infinite alternate' }}>🔓</div>
      </div>
    ),
    ocr: (
      <div style={s}>
        <div style={{ width: 28, height: 28, background: 'var(--ud-paper-3)', border: '1px solid var(--ud-border)', borderRadius: 3, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🖼</div>
        {arrow}
        <div style={{ fontSize: 11, color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', animation: 'ud-rise 1.2s ease infinite alternate' }}>abc</div>
      </div>
    ),
    watermark: (
      <div style={s}>
        {doc()} {arrow}
        <div style={{ position: 'relative', width: 28, height: 34 }}>
          <div style={{ width: 28, height: 34, background: 'var(--ud-paper-3)', border: '1px solid var(--ud-border)', borderRadius: 3 }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: 'rgba(10,122,106,0.4)', fontFamily: 'var(--font-mono)', transform: 'rotate(-20deg)', fontWeight: 700, animation: 'ud-rise 1.2s ease infinite alternate' }}>UD</div>
        </div>
      </div>
    ),
    pagenums: (
      <div style={s}>
        {doc()} {arrow}
        <div style={{ width: 28, height: 34, background: 'var(--ud-paper-3)', border: '1px solid var(--ud-border)', borderRadius: 3, position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: 2, right: 0, left: 0, textAlign: 'center', fontSize: 7, fontFamily: 'var(--font-mono)', color: 'var(--ud-ink)', fontWeight: 700, animation: 'ud-rise 1.2s ease infinite alternate' }}>1</div>
        </div>
      </div>
    ),
    compare: (
      <div style={s}>
        <div style={{ width: 18, height: 24, background: 'var(--ud-paper-3)', border: '1px solid var(--ud-border)', borderRadius: 2 }} />
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--ud-muted)' }}>VS</span>
        <div style={{ width: 18, height: 24, background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 2, animation: 'ud-bounce 1.4s ease-in-out infinite' }} />
        {arrow}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {['+','–','+'].map((c,i) => <div key={i} style={{ height: 4, width: 20, borderRadius: 2, background: c==='+' ? 'var(--ud-teal)' : 'var(--ud-danger)', opacity: 0.7 }}/>)}
        </div>
      </div>
    ),
    redact: (
      <div style={s}>
        {doc()} {arrow}
        <div style={{ width: 28, height: 34, background: 'var(--ud-paper-3)', border: '1px solid var(--ud-border)', borderRadius: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3, padding: '4px 3px' }}>
          <div style={{ height: 4, borderRadius: 2, background: 'var(--ud-ink)', animation: 'ud-rise 1s ease infinite alternate' }} />
          <div style={{ height: 4, borderRadius: 2, background: 'var(--ud-ink)' }} />
          <div style={{ height: 4, width: '60%', borderRadius: 2, background: 'var(--ud-paper-3)', border: '1px solid var(--ud-border)' }} />
        </div>
      </div>
    ),
    optimize: (
      <div style={s}>
        {doc()} {arrow}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, animation: 'ud-rise 1.2s ease infinite alternate' }}>
          {[100,60,80].map((w,i) => <div key={i} style={{ height: 3, width: w*0.22, background: 'var(--ud-teal)', borderRadius: 2 }}/>)}
        </div>
      </div>
    ),
  }

  return <>{anims[slug] ?? null}</>
}

export default function UtilitiesHub() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <span className="ud-badge ud-badge-default" style={{ marginBottom: 20, display: 'inline-block' }}>
          Universal Document™ Ecosystem
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', lineHeight: 1.1, marginBottom: 20 }}>
          UD Utilities
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--ud-muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Everything you need for every document operation. Free at the base tier.
        </p>
      </div>

      {/* ── Core Tools ──────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Core Tools</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)' }}>Open · Convert · Create · Verify · Sign</span>
        </div>
        <div id="core-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[
            { label: 'UD Reader',    href: 'https://reader.hive.baby',    icon: '📖', desc: 'Open and read any Universal Document™ file.' },
            { label: 'UD Converter', href: 'https://converter.hive.baby', icon: '⇄',  desc: 'Convert PDFs, DOCX, and more to UDS format.' },
            { label: 'UD Creator',   href: 'https://creator.hive.baby',   icon: '✦',  desc: 'Author a new Universal Document™ from scratch.' },
            { label: 'UD Validator', href: 'https://validator.hive.baby', icon: '✔',  desc: 'Verify a UDS file is authentic and spec-compliant.' },
            { label: 'UD Sign',      href: 'https://signer.hive.baby',    icon: '✍',  desc: 'Cryptographically sign any Universal Document™.' },
            { label: 'UD iSDK',      href: 'https://ud.hive.baby/isdk',   icon: '⌥',  desc: 'Integrate Universal Document™ into your app.' },
          ].map(card => (
            <a key={card.href} href={card.href} style={{
              display: 'block', background: '#fff',
              border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)',
              padding: '18px 20px', textDecoration: 'none',
              transition: 'border-color 0.2s, background 0.2s', cursor: 'pointer',
              boxShadow: 'var(--ud-shadow)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-gold-3)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-gold)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 34, height: 34, background: 'var(--ud-gold-3)', border: '1px solid var(--ud-gold)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                  {card.icon}
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)' }}>{card.label}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5, margin: 0 }}>{card.desc}</p>
            </a>
          ))}
        </div>
      </div>

      {/* ── UD Format Tools ─────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>UD Format Tools</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)' }}>Seal · Bundle · Chain of Custody</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {FORMAT_TOOLS.map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-teal-2)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-teal)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge ud-badge-success">FREE</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── AI-Powered ───────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>AI-Powered</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)' }}>Translate · Summarise · Classify · Clinical</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {AI_TOOLS.map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-teal-2)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-teal)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-teal)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge" style={{ background: 'var(--ud-teal-2)', color: 'var(--ud-teal)' }}>AI · Beta</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Document Operations ─────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Document Operations</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)' }}>Merge · Split · Compress · OCR · Protect · Watermark</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {TOOLS.map(tool => (
          <a
            key={tool.slug}
            href={`/${tool.slug}`}
            onMouseEnter={() => setHovered(tool.slug)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'block',
              background: hovered === tool.slug ? 'var(--ud-teal-2)' : '#fff',
              border: `1px solid ${hovered === tool.slug ? 'var(--ud-teal)' : 'var(--ud-border)'}`,
              borderRadius: 'var(--ud-radius-lg)',
              padding: 22,
              transition: 'border-color 0.2s, background 0.2s',
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--ud-shadow)',
            }}
          >
            {/* Top row: icon + badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, background: tool.color || 'var(--ud-ink)',
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, color: '#fff', fontWeight: 700, flexShrink: 0,
              }}>
                {tool.icon}
              </div>
              {tool.free ? (
                <span className="ud-badge ud-badge-success">FREE</span>
              ) : (
                <span className="ud-badge" style={{ background: tool.proLabel === 'AI' ? 'var(--ud-teal-2)' : 'var(--ud-gold-3)', color: tool.proLabel === 'AI' ? 'var(--ud-teal)' : 'var(--ud-gold)' }}>{tool.proLabel}</span>
              )}
            </div>

            {/* Name + desc */}
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>
              {tool.name}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>
              {tool.desc}
            </div>

            {/* Mini animation — always visible, subtle */}
            <ToolAnim slug={tool.slug} />
          </a>
        ))}
      </div>

      {/* UD Ecosystem bar */}
      <div style={{
        marginTop: 64, padding: '24px',
        background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)',
        borderRadius: 'var(--ud-radius-lg)', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 4 }}>Part of the Universal Document™ ecosystem</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)' }}>Convert → Read → Edit → Utilities → back to UDS</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href="https://converter.hive.baby" className="ud-btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>Converter</a>
          <a href="https://ud.hive.baby" className="ud-btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>UD Hub →</a>
        </div>
      </div>
    </div>
  )
}
