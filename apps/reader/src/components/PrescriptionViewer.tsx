'use client'

import { useEffect, useState } from 'react'
import type { UDDocument } from '@/lib/types'

interface RegistryResult {
  registered: boolean
  hashMatch?: boolean
  revoked?: boolean
  sealed_at?: string
  blockchain_tx?: string | null
  error?: string
}

type RxBlock = {
  id: string
  type: string
  text?: string
  label?: string
  level?: number
  base_content?: Record<string, unknown>
}

function fieldText(block: RxBlock): string {
  if (block.text) return block.text
  return String(block.base_content?.text ?? '')
}

export function PrescriptionViewer({ doc }: { doc: UDDocument }) {
  const { metadata, seal } = doc
  const rxBlocks = doc.blocks as unknown as RxBlock[]

  const [registry, setRegistry] = useState<RegistryResult | null>(null)

  useEffect(() => {
    if (!metadata.id || !seal?.hash) return
    fetch(`https://ud.hive.baby/api/verify?id=${encodeURIComponent(metadata.id)}`)
      .then(r => r.json())
      .then((data: { registered: boolean; hash?: string; revoked?: boolean; sealed_at?: string; blockchain_tx?: string | null }) => {
        if (!data.registered) { setRegistry({ registered: false }); return }
        setRegistry({
          registered: true,
          hashMatch: data.hash === seal?.hash,
          revoked: data.revoked,
          sealed_at: data.sealed_at,
          blockchain_tx: data.blockchain_tx,
        })
      })
      .catch(() => setRegistry({ registered: false, error: 'Registry unavailable' }))
  }, [metadata.id, seal?.hash])

  // Parse blocks into sections
  const fields: Record<string, string> = {}
  const clinicalNotes: string[] = []
  let medicationText = ''
  let frequencyText = ''
  let inClinical = false

  for (const block of rxBlocks) {
    if (block.type === 'heading') {
      inClinical = block.text === 'Clinical Notes'
      continue
    }
    if (block.type === 'field' && block.label) {
      const t = fieldText(block)
      if (block.label === 'Medication') medicationText = t
      else if (block.label === 'Frequency') frequencyText = t
      else fields[block.label] = t
    }
    if (block.type === 'paragraph' && inClinical) {
      const t = fieldText(block)
      if (t) clinicalNotes.push(t)
    }
  }

  const expiresAt = metadata.expiry ? new Date(metadata.expiry) : null
  const daysLeft = expiresAt ? Math.floor((expiresAt.getTime() - Date.now()) / 86400000) : null
  const expiryWarning = daysLeft !== null && daysLeft <= 7

  const isVerified = registry?.registered && registry?.hashMatch === true && !registry?.revoked
  const sealFailed = registry?.hashMatch === false
  const notInRegistry = registry?.registered === false && !registry?.error

  function saveFile() {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(metadata.title || 'prescription').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.uds`
    a.click()
    URL.revokeObjectURL(url)
  }

  const patientFields = [
    ['Patient', fields['Patient']],
    ['Date of Birth', fields['Date of Birth']],
  ].filter(([, v]) => v) as [string, string][]

  const prescriberFields = [
    ['Prescriber', fields['Prescriber']],
    ['Organisation', fields['Organisation']],
    ['Date', fields['Date']],
    ['Expires', fields['Expires']],
  ].filter(([, v]) => v) as [string, string][]

  const instructionFields = [
    ['Dispensing', fields['Instructions']],
    ['Patient guidance', fields['Patient Guidance']],
  ].filter(([, v]) => v) as [string, string][]

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Prescription card */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #d1d5db',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 4px 28px rgba(0,0,0,0.09)',
        position: 'relative',
      }}>

        {/* Subtle UD watermark */}
        <div style={{
          position: 'absolute',
          bottom: 56,
          right: 22,
          fontSize: 10,
          fontFamily: 'monospace',
          color: '#f3f4f6',
          letterSpacing: '0.2em',
          fontWeight: 700,
          pointerEvents: 'none',
          userSelect: 'none',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
        }}>
          UNIVERSAL DOCUMENT™
        </div>

        {/* Header band */}
        <div style={{
          background: '#1e2d3d',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{
              fontSize: 34,
              color: '#c8960a',
              fontFamily: 'Georgia,serif',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}>℞</span>
            <div>
              <div style={{ color: '#ffffff', fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
                {metadata.organisation || metadata.created_by}
              </div>
              <div style={{ color: '#6b7280', fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>
                Universal Document™ Prescription
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={saveFile}
              style={{
                background: 'none',
                border: '1px solid #374151',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 11,
                color: '#9ca3af',
                cursor: 'pointer',
                fontFamily: 'monospace',
              }}
            >
              .uds ↓
            </button>
            {registry === null ? (
              <span style={{ background: '#374151', color: '#9ca3af', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace' }}>
                CHECKING…
              </span>
            ) : sealFailed ? (
              <span style={{ background: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace' }}>
                ✗ TAMPERED
              </span>
            ) : notInRegistry ? (
              <span style={{ background: '#6b7280', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace' }}>
                UDS · UNREGISTERED
              </span>
            ) : isVerified ? (
              <span style={{ background: '#059669', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace' }}>
                ✓ SEALED
              </span>
            ) : (
              <span style={{ background: '#374151', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace' }}>
                UDS
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: '28px 28px 24px' }}>

          {/* Patient section */}
          {patientFields.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={sectionLabel}>Patient</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {patientFields.map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={labelCell}>{k}</td>
                      <td style={valueCell}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Medication — prominent */}
          <div style={{
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderLeft: '4px solid #1e2d3d',
            borderRadius: 8,
            padding: '18px 20px',
            marginBottom: 22,
          }}>
            <div style={sectionLabel}>Medication</div>
            <div style={{
              fontSize: 21,
              fontWeight: 700,
              color: '#1e2d3d',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
              marginBottom: 6,
            }}>
              {medicationText}
            </div>
            {frequencyText && (
              <div style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{frequencyText}</div>
            )}
          </div>

          {/* Instructions */}
          {instructionFields.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={sectionLabel}>Instructions</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {instructionFields.map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid #f3f4f6', verticalAlign: 'top' }}>
                      <td style={{ ...labelCell, paddingTop: 10, paddingBottom: 10 }}>{k}</td>
                      <td style={{ ...valueCell, paddingTop: 10, paddingBottom: 10, lineHeight: 1.55 }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Clinical notes */}
          {clinicalNotes.length > 0 && (
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 8,
              padding: '14px 18px',
              marginBottom: 22,
            }}>
              <div style={{ ...sectionLabel, color: '#b45309' }}>Clinical Notes</div>
              {clinicalNotes.map((note, i) => (
                <p key={i} style={{
                  margin: i === 0 ? '0' : '8px 0 0',
                  fontSize: 13,
                  color: '#374151',
                  lineHeight: 1.6,
                }}>
                  {note}
                </p>
              ))}
            </div>
          )}

          {/* Prescriber + dates */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 18, marginBottom: 20 }}>
            <div style={sectionLabel}>Prescriber</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {prescriberFields.map(([k, v], i) => {
                  const isExpiry = k === 'Expires'
                  return (
                    <tr key={k} style={{ borderBottom: i < prescriberFields.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={labelCell}>{k}</td>
                      <td style={{
                        ...valueCell,
                        color: isExpiry && expiryWarning ? '#d97706' : isExpiry ? '#374151' : '#111827',
                        fontWeight: isExpiry && expiryWarning ? 600 : 400,
                      }}>
                        {isExpiry && expiryWarning ? '⚠ ' : ''}{v}
                        {isExpiry && expiryWarning && (
                          <span style={{ fontSize: 11, color: '#d97706', marginLeft: 8, fontFamily: 'monospace' }}>
                            ({daysLeft}d remaining)
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Signature area */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{
              borderTop: '1px solid #9ca3af',
              paddingTop: 8,
              minWidth: 200,
              textAlign: 'right',
            }}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                PRESCRIBER SIGNATURE
              </div>
              <div style={{ fontSize: 12, color: '#374151', marginTop: 4 }}>
                {fields['Prescriber']}
              </div>
            </div>
          </div>
        </div>

        {/* Footer — seal */}
        <div style={{
          background: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#9ca3af', letterSpacing: '0.04em' }}>
            {seal ? `SHA-256: ${seal.hash.slice(0, 20)}…` : 'No seal'}
          </div>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: isVerified ? '#059669' : '#9ca3af' }}>
            {registry === null ? '○ Checking registry…' :
              isVerified ? '✓ Verified · registry match' :
              sealFailed ? '✗ Hash mismatch — document modified' :
              notInRegistry ? '○ Not in registry' :
              registry?.error ? '○ Registry unavailable' :
              '○ Pending verification'}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p style={{
        textAlign: 'center',
        fontSize: 11,
        color: '#9ca3af',
        fontFamily: 'monospace',
        marginTop: 14,
        letterSpacing: '0.02em',
        lineHeight: 1.5,
      }}>
        Universal Document™ v{doc.ud_version} · UD Pharmacy · This document is not a substitute for clinical judgement
      </p>
    </div>
  )
}

const sectionLabel: React.CSSProperties = {
  fontSize: 9,
  fontFamily: 'monospace',
  color: '#9ca3af',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: 8,
  fontWeight: 700,
}

const labelCell: React.CSSProperties = {
  width: '34%',
  padding: '7px 12px 7px 0',
  fontSize: 12,
  color: '#6b7280',
  fontFamily: 'monospace',
  verticalAlign: 'top',
}

const valueCell: React.CSSProperties = {
  padding: '7px 0',
  fontSize: 13,
  color: '#111827',
  verticalAlign: 'top',
}
