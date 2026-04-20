'use client'

const TOOLS = [
  {
    slug: 'merge',
    name: 'UD Merge',
    desc: 'Combine multiple PDFs into one document.',
    icon: '⊕',
    color: '#003A8C',
    free: true,
  },
  {
    slug: 'split',
    name: 'UD Split',
    desc: 'Split a PDF into separate pages or ranges.',
    icon: '⊘',
    color: '#003A8C',
    free: true,
  },
  {
    slug: 'compress',
    name: 'UD Compress',
    desc: 'Reduce PDF file size without losing quality.',
    icon: '⊛',
    color: '#003A8C',
    free: true,
  },
  {
    slug: 'extract-pages',
    name: 'UD Extract Pages',
    desc: 'Pull specific pages out of any PDF.',
    icon: '⊡',
    color: '#003A8C',
    free: true,
  },
  {
    slug: 'rearrange',
    name: 'UD Rearrange',
    desc: 'Drag and drop to reorder pages visually.',
    icon: '⇅',
    color: '#003A8C',
    free: true,
  },
  {
    slug: 'protect',
    name: 'UD Protect',
    desc: 'Add password protection to any PDF.',
    icon: '⊠',
    color: '#1a3a6b',
    free: true,
  },
  {
    slug: 'unlock',
    name: 'UD Unlock',
    desc: 'Remove password from a PDF you own.',
    icon: '⊟',
    color: '#1a3a6b',
    free: true,
  },
  {
    slug: 'ocr',
    name: 'UD OCR',
    desc: 'Extract text from scanned PDFs and images using AI.',
    icon: '⊜',
    color: '#4DA3FF',
    free: false,
    proLabel: 'AI',
  },
  {
    slug: 'watermark',
    name: 'UD Watermark',
    desc: 'Add text or UD-certified watermarks to documents.',
    icon: '⊙',
    color: '#4DA3FF',
    free: true,
  },
  {
    slug: 'page-numbers',
    name: 'UD Page Numbers',
    desc: 'Add customisable page numbers to any PDF.',
    icon: '#',
    color: '#003A8C',
    free: true,
  },
  {
    slug: 'compare',
    name: 'UD Compare',
    desc: 'Side-by-side diff of two documents.',
    icon: '⊷',
    color: '#4DA3FF',
    free: false,
    proLabel: 'AI',
  },
  {
    slug: 'redact',
    name: 'UD Redact',
    desc: 'Permanently black out sensitive text or regions.',
    icon: '▬',
    color: '#1a1a2e',
    free: false,
    proLabel: 'Pro',
  },
  {
    slug: 'optimize',
    name: 'UD Optimize',
    desc: 'Optimise PDF structure for web, print, or archiving.',
    icon: '⊕',
    color: '#003A8C',
    free: true,
  },
]

export default function UtilitiesHub() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(0,58,140,0.15)',
          border: '1px solid rgba(0,58,140,0.3)',
          color: '#4DA3FF',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '4px 14px',
          borderRadius: 20,
          marginBottom: 24,
        }}>
          Universal Document Ecosystem
        </div>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: '#f1f5f9',
          lineHeight: 1.1,
          marginBottom: 20,
        }}>
          UD Utilities
        </h1>
        <p style={{ fontSize: 18, color: '#8892a4', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Thirteen tools for every document operation.
          Free forever at the base tier.
        </p>
      </div>

      {/* Tool Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}>
        {TOOLS.map(tool => (
          <a
            key={tool.slug}
            href={`/${tool.slug}`}
            style={{
              display: 'block',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              padding: 24,
              transition: 'border-color 0.2s, background 0.2s',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(77,163,255,0.3)'
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(77,163,255,0.05)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40,
                background: tool.color,
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: '#fff', fontWeight: 700,
              }}>
                {tool.icon}
              </div>
              {!tool.free && (
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                  padding: '3px 8px', borderRadius: 8,
                  background: tool.proLabel === 'AI' ? 'rgba(77,163,255,0.15)' : 'rgba(241,196,15,0.15)',
                  color: tool.proLabel === 'AI' ? '#4DA3FF' : '#F1C40F',
                }}>
                  {tool.proLabel}
                </span>
              )}
              {tool.free && (
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                  padding: '3px 8px', borderRadius: 8,
                  background: 'rgba(46,204,113,0.12)',
                  color: '#2ECC71',
                }}>FREE</span>
              )}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>
              {tool.name}
            </div>
            <div style={{ fontSize: 13, color: '#8892a4', lineHeight: 1.5 }}>
              {tool.desc}
            </div>
          </a>
        ))}
      </div>

      {/* UD Ecosystem bar */}
      <div style={{
        marginTop: 64,
        padding: '24px',
        background: 'rgba(0,58,140,0.1)',
        border: '1px solid rgba(0,58,140,0.2)',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
            Part of the Universal Document ecosystem
          </div>
          <div style={{ fontSize: 13, color: '#8892a4' }}>
            Convert → Read → Edit → Utilities → back to UDS
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href="https://converter.hive.baby" className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
            Converter
          </a>
          <a href="https://ud.hive.baby" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', background: '#003A8C', color: '#fff',
            fontWeight: 600, fontSize: 13, borderRadius: 8,
          }}>
            UD Hub →
          </a>
        </div>
      </div>
    </div>
  )
}
