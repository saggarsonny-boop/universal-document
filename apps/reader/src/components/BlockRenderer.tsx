'use client'

import { resolveRendering } from '@/lib/validator'
import type { ContentBlock } from '@/lib/types'

interface Props {
  block: ContentBlock
  activeLayer: string
  activeLanguage: string
  direction: 'ltr' | 'rtl'
}

export default function BlockRenderer({ block, activeLayer, activeLanguage, direction }: Props) {
  if (block.hidden) return null

  const resolved = resolveRendering(block, activeLayer, activeLanguage)
  const base = block.base_content as Record<string, unknown>

  const style: React.CSSProperties = {
    direction,
    textAlign: direction === 'rtl' ? 'right' : 'left',
  }

  switch (block.type) {
    case 'heading': {
      const level = typeof base.level === 'number' ? base.level : 1
      const text = resolved || String(base.text || '')
      const sizes: Record<number, string> = {
        1: '2rem',
        2: '1.5rem',
        3: '1.25rem',
        4: '1.1rem',
        5: '1rem',
        6: '0.9rem',
      }
      return (
        <div
          style={{
            ...style,
            fontSize: sizes[level] || '1rem',
            fontWeight: 700,
            margin: '1.5rem 0 0.75rem',
            lineHeight: 1.3,
            color: '#111827',
          }}
        >
          {text}
        </div>
      )
    }

    case 'paragraph': {
      const text = resolved || String(base.text || '')
      return (
        <p
          style={{
            ...style,
            margin: '0.75rem 0',
            lineHeight: 1.7,
            color: '#374151',
          }}
        >
          {text}
        </p>
      )
    }

    case 'list': {
      const items = Array.isArray(base.items) ? base.items as string[] : []
      const ordered = base.ordered === true
      const Tag = ordered ? 'ol' : 'ul'
      return (
        <Tag
          style={{
            ...style,
            margin: '0.75rem 0',
            paddingInlineStart: '1.5rem',
            color: '#374151',
          }}
        >
          {items.map((item, i) => (
            <li key={i} style={{ margin: '0.25rem 0' }}>{item}</li>
          ))}
        </Tag>
      )
    }

    case 'table': {
      const headers = Array.isArray(base.headers) ? base.headers as string[] : []
      const rows = Array.isArray(base.rows) ? base.rows as string[][] : []
      return (
        <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9rem',
              direction,
            }}
          >
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      background: '#f3f4f6',
                      padding: '0.6rem 0.75rem',
                      border: '1px solid #e5e7eb',
                      fontWeight: 600,
                      textAlign: direction === 'rtl' ? 'right' : 'left',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      style={{
                        padding: '0.6rem 0.75rem',
                        border: '1px solid #e5e7eb',
                        color: '#374151',
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    case 'image': {
      const src = String(base.src || '')
      const alt = String(base.alt || '')
      const caption = base.caption ? String(base.caption) : null
      return (
        <figure style={{ margin: '1.5rem 0', textAlign: 'center' }}>
          <img
            src={src}
            alt={alt}
            style={{ maxWidth: '100%', borderRadius: '0.5rem' }}
          />
          {caption && (
            <figcaption style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
              {caption}
            </figcaption>
          )}
        </figure>
      )
    }

    case 'code': {
      const code = String(base.code || '')
      const language = String(base.language || '')
      return (
        <div style={{ margin: '1rem 0' }}>
          {language && (
            <div
              style={{
                background: '#1f2937',
                color: '#9ca3af',
                fontSize: '0.75rem',
                padding: '0.4rem 1rem',
                borderRadius: '0.5rem 0.5rem 0 0',
                fontFamily: 'monospace',
              }}
            >
              {language}
            </div>
          )}
          <pre
            style={{
              background: '#111827',
              color: '#f9fafb',
              padding: '1rem',
              overflowX: 'auto',
              borderRadius: language ? '0 0 0.5rem 0.5rem' : '0.5rem',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              lineHeight: 1.6,
            }}
          >
            <code>{code}</code>
          </pre>
        </div>
      )
    }

    case 'divider': {
      return (
        <hr
          style={{
            border: 'none',
            borderTop: '1px solid #e5e7eb',
            margin: '2rem 0',
          }}
        />
      )
    }

    default:
      return (
        <div
          style={{
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            margin: '0.75rem 0',
            fontSize: '0.875rem',
            color: '#92400e',
          }}
        >
          Unsupported block type: {block.type}
        </div>
      )
  }
}
