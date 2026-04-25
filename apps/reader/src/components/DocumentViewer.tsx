'use client'

import { useState, useEffect } from 'react'
import type { UDDocument } from '@/lib/types'
import BlockRenderer from './BlockRenderer'
import { PrescriptionViewer } from './PrescriptionViewer'
import { checkExpiry, checkRevoked } from '@/lib/validator'

interface Props {
  doc: UDDocument
}

interface RegistryResult {
  registered: boolean
  hashMatch?: boolean
  revoked?: boolean
  sealed_at?: string
  blockchain_tx?: string | null
  error?: string
}

export default function DocumentViewer({ doc }: Props) {
  const { metadata, manifest, blocks, seal } = doc
  const identity = metadata.visual_identity

  const layers = manifest.clarity_layer_manifest || []
  const languages = manifest.language_manifest || []

  const [activeLayer, setActiveLayer] = useState(layers[0]?.id || 'default')
  const [activeLanguage, setActiveLanguage] = useState(manifest.base_language)
  const [showCustody, setShowCustody] = useState(false)
  const [registry, setRegistry] = useState<RegistryResult | null>(null)

  const isExpired = checkExpiry(doc)
  const isRevoked = checkRevoked(doc)

  // Fetch registry status when document has a seal with ID
  useEffect(() => {
    const docId = metadata.id
    const sealHash = seal?.hash
    if (!docId || !sealHash) return

    fetch(`https://ud.hive.baby/api/verify?id=${encodeURIComponent(docId)}`)
      .then(r => r.json())
      .then((data: { registered: boolean; hash?: string; revoked?: boolean; sealed_at?: string; blockchain_tx?: string | null }) => {
        if (!data.registered) {
          setRegistry({ registered: false })
          return
        }
        setRegistry({
          registered: true,
          hashMatch: data.hash === sealHash,
          revoked: data.revoked,
          sealed_at: data.sealed_at,
          blockchain_tx: data.blockchain_tx,
        })
      })
      .catch(() => setRegistry({ registered: false, error: 'Registry unavailable' }))
  }, [metadata.id, seal?.hash])

  const activeLanguageEntry = languages.find((l) => l.code === activeLanguage)
  const direction = activeLanguageEntry?.direction || 'ltr'

  function saveAsFile(ext: 'uds' | 'udr') {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(doc.metadata.title || 'document').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isRevoked) {
    return (
      <div style={alertStyle('#fef2f2', '#dc2626', '#fee2e2')}>
        <strong>Document Revoked</strong>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
          This document has been revoked and can no longer be viewed.
        </p>
      </div>
    )
  }

  if (isExpired) {
    return (
      <div style={alertStyle('#fffbeb', '#d97706', '#fef3c7')}>
        <strong>Document Expired</strong>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
          This document expired on {new Date(metadata.expiry!).toLocaleDateString()} and can no longer be viewed.
        </p>
      </div>
    )
  }

  const isPrescription =
    metadata.document_type === 'prescription' ||
    metadata.title?.toLowerCase().includes('prescription') ||
    metadata.title?.toLowerCase().includes('pharmacy')

  if (isPrescription) {
    return <PrescriptionViewer doc={doc} />
  }

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {identity && (
        <div style={{
          marginBottom: '1.25rem',
          border: '1px solid #dbeafe',
          background: '#eff6ff',
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: identity.watermark_hex,
              color: '#fff',
              fontSize: '0.68rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {identity.file_metadata.extension_hint.toUpperCase()}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#1e3a8a' }}>
              {identity.role === 'sealed' ? 'UDS sealed identity' : 'UDR editable identity'} · {identity.watermark_tone.replace('_', ' ')} watermark
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>
            Desktop/Finder/Explorer/Preview IDs embedded in metadata
          </div>
        </div>
      )}

      {/* Document header */}
      <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={badgeStyle(doc.state === 'UDS' ? '#ffffff' : '#1e40af', doc.state === 'UDS' ? '#1e2d3d' : '#bfdbfe')}>
            {doc.state}
          </span>
          {metadata.document_type && (
            <span style={badgeStyle('#374151', '#f3f4f6')}>{metadata.document_type}</span>
          )}
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
          {metadata.title}
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span>Created by <strong>{metadata.created_by}</strong></span>
          {metadata.organisation && metadata.organisation !== metadata.created_by && <span>{metadata.organisation}</span>}
          <span>{new Date(metadata.created_at).toLocaleDateString()}</span>
          {metadata.expiry && (
            <span style={{ color: '#d97706' }}>
              Expires {new Date(metadata.expiry).toLocaleDateString()}
            </span>
          )}
          <button
            onClick={() => saveAsFile(doc.state === 'UDS' ? 'uds' : 'udr')}
            style={{
              background: 'none',
              border: '1px solid #e5e7eb',
              borderRadius: '0.4rem',
              padding: '0.2rem 0.6rem',
              fontSize: '0.78rem',
              color: '#6b7280',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Save as .{doc.state === 'UDS' ? 'uds' : 'udr'} ↓
          </button>
        </div>
      </div>

      {/* Registry verification panel */}
      {seal && (
        <div style={{ marginBottom: '1.5rem', padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Provenance Registry</div>
          {!registry ? (
            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Checking registry…</div>
          ) : registry.error ? (
            <RegistryRow icon="○" color="#9ca3af" label="Registry unavailable" />
          ) : !registry.registered ? (
            <RegistryRow icon="⚠" color="#d97706" label="Not registered — document not sealed via UD infrastructure" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <RegistryRow icon="✓" color="#059669" label={`Registered · sealed ${registry.sealed_at ? new Date(registry.sealed_at).toLocaleDateString() : ''}`} />
              {registry.hashMatch === true && <RegistryRow icon="✓" color="#059669" label="Hash verified — document intact" />}
              {registry.hashMatch === false && <RegistryRow icon="✗" color="#dc2626" label="Hash mismatch — document has been modified since sealing" />}
              {registry.revoked ? <RegistryRow icon="✗" color="#dc2626" label="Revoked" /> : <RegistryRow icon="✓" color="#059669" label="Not revoked" />}
              {registry.blockchain_tx && <RegistryRow icon="✓" color="#6366f1" label="Bitcoin anchor proof available (OpenTimestamps)" />}
              {seal.verification_url && (
                <a href={seal.verification_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4, display: 'inline-block' }}>
                  View public record →
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      {(languages.length > 1 || layers.length > 0) && (
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
          padding: '1rem',
          background: '#f9fafb',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb',
        }}>

          {languages.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Language
              </span>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setActiveLanguage(lang.code)}
                    style={controlButton(activeLanguage === lang.code)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {layers.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                View
              </span>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {layers.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => setActiveLayer(layer.id)}
                    style={controlButton(activeLayer === layer.id)}
                  >
                    {layer.label}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Blocks */}
      <div style={{ position: 'relative' }}>
        {identity && (
          <div style={{
            position: 'absolute',
            inset: '0 0 auto 0',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: 0.07,
            fontSize: '4.2rem',
            fontWeight: 800,
            letterSpacing: '0.1em',
            color: identity.watermark_hex,
            textAlign: 'center',
            paddingTop: '6rem',
          }}>
            {identity.file_metadata.extension_hint.toUpperCase()} · UNIVERSAL DOCUMENT
          </div>
        )}
        {blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            activeLayer={activeLayer}
            activeLanguage={activeLanguage}
            direction={direction}
          />
        ))}
      </div>

      {identity && (
        <div style={{ marginTop: '2rem', border: '1px solid #e5e7eb', borderRadius: '0.75rem', overflow: 'hidden' }}>
          <div style={{ padding: '0.7rem 0.9rem', borderBottom: '1px solid #e5e7eb', background: '#f8fafc', fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
            File Preview Pane Metadata
          </div>
          <div style={{ padding: '0.9rem', fontSize: '0.8rem', color: '#334155', display: 'grid', gap: '0.4rem' }}>
            <div>Format family: {identity.file_metadata.format_family}</div>
            <div>Extension hint: .{identity.file_metadata.extension_hint}</div>
            <div>Desktop icon id: {identity.icon.desktop}</div>
            <div>Finder preview id: {identity.icon.finder_preview}</div>
            <div>Explorer preview id: {identity.icon.explorer_preview}</div>
            <div>Preview pane id: {identity.icon.preview_pane}</div>
          </div>
        </div>
      )}

      {metadata.viral_links && (
        <div style={{ marginTop: '1rem', border: '1px solid #dbeafe', borderRadius: '0.75rem', background: '#eff6ff', padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Ecosystem Links
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
            <a href={metadata.viral_links.open_in_reader} style={{ color: '#1d4ed8' }}>Open in UD Reader</a>
            <a href={metadata.viral_links.convert_to_uds} style={{ color: '#1d4ed8' }}>Convert your files to UDS</a>
            <a href={metadata.viral_links.create_udr} style={{ color: '#1d4ed8' }}>Create your own UDR</a>
          </div>
        </div>
      )}

      {/* Chain of custody */}
      {seal && seal.chain_of_custody && seal.chain_of_custody.length > 0 && (
        <div style={{ marginTop: '3rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
          <button
            onClick={() => setShowCustody(!showCustody)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#6b7280',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {showCustody ? '▾' : '▸'} Chain of Custody ({seal.chain_of_custody.length} events)
          </button>

          {showCustody && (
            <div style={{ marginTop: '1rem' }}>
              {seal.chain_of_custody.map((entry, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '0.6rem 0',
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={badgeStyle('#374151', '#f3f4f6')}>{entry.event}</span>
                  <span style={{ color: '#374151' }}>{entry.actor}</span>
                  <span style={{ color: '#9ca3af', marginInlineStart: 'auto' }}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                  {entry.note && <span style={{ color: '#6b7280' }}>{entry.note}</span>}
                </div>
              ))}
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                SHA-256: {seal.hash}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6', fontSize: '0.75rem', color: '#d1d5db', textAlign: 'center' }}>
        Universal Document™ v{doc.ud_version} · UD Reader by The Hive Engines · Free forever
      </div>

    </div>
  )
}

function RegistryRow({ icon, color, label }: { icon: string; color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
      <span style={{ color, fontWeight: 700, fontSize: '0.85rem', minWidth: 16 }}>{icon}</span>
      <span style={{ color: '#374151' }}>{label}</span>
    </div>
  )
}

function alertStyle(bg: string, color: string, border: string): React.CSSProperties {
  return {
    maxWidth: '600px',
    margin: '4rem auto',
    padding: '1.5rem',
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: '0.75rem',
    color,
    textAlign: 'center',
  }
}

function badgeStyle(color: string, bg: string): React.CSSProperties {
  return {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color,
    background: bg,
  }
}

function controlButton(active: boolean): React.CSSProperties {
  return {
    padding: '0.3rem 0.75rem',
    borderRadius: '9999px',
    border: active ? '2px solid #2563eb' : '2px solid #e5e7eb',
    background: active ? '#eff6ff' : '#ffffff',
    color: active ? '#2563eb' : '#374151',
    fontSize: '0.8rem',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s',
  }
}
