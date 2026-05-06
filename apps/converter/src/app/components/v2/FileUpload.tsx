'use client'

// File upload area for UD Converter v2. Drag-drop + click to browse.
// Shows file name + size after selection.
//
// Tier-aware size cap: the parent (page.tsx) passes `tier` and
// `maxBytes` based on the current /api/usage response. Free tier is
// 4 MB (matches the legacy /api/convert fast path); Plus is 25 MB; Pro
// is 50 MB. Files over the cap are rejected client-side with a localized
// error before any network round-trip — server still re-validates at
// /api/upload-url + /api/convert/format-by-ref.

import { useCallback, useRef, useState } from 'react'
import { useStrings } from '@/lib/strings'

const GOLD = '#D4AF37'
const GOLD_DIM = '#8a6f1f'

type Tier = 'free' | 'plus' | 'pro'

type Props = {
  onFileSelected: (file: File) => void
  selectedFile: File | null
  disabled?: boolean
  tier: Tier
  maxBytes: number
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUpload({ onFileSelected, selectedFile, disabled = false, tier, maxBytes }: Props) {
  const s = useStrings()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [tooLargeMsg, setTooLargeMsg] = useState<string | null>(null)

  const maxMb = Math.round(maxBytes / (1024 * 1024))
  const tierLabel = tier === 'free' ? s.tier.freeLabel : tier === 'plus' ? s.tier.plusLabel : s.tier.proLabel

  const handleFile = useCallback((file: File) => {
    if (file.size > maxBytes) {
      setTooLargeMsg(
        s.fileUpload.tooLargeTemplate
          .replace('{{maxMb}}', String(maxMb))
          .replace('{{tier}}', tierLabel),
      )
      return
    }
    setTooLargeMsg(null)
    onFileSelected(file)
  }, [onFileSelected, s, maxBytes, maxMb, tierLabel])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile, disabled])

  const onPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      aria-label={s.fileUpload.uploadAria}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      style={{
        border: `2px dashed ${isDragging ? GOLD : 'var(--ud-border)'}`,
        borderRadius: 16,
        padding: '40px 24px',
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: isDragging ? 'rgba(212, 175, 55, 0.08)' : '#ffffff',
        transition: 'all 0.15s',
        opacity: disabled ? 0.6 : 1,
        minHeight: 140,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {selectedFile ? (
        <>
          <div style={{ fontSize: 28, color: GOLD }}>✓</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--ud-ink)', margin: 0, wordBreak: 'break-all' }}>
            {selectedFile.name}
          </p>
          <p style={{ fontSize: 13, color: 'var(--ud-muted)', margin: 0 }}>
            {s.fileUpload.sizeAndChangeTemplate.replace('{{size}}', formatFileSize(selectedFile.size))}
          </p>
        </>
      ) : (
        <>
          <div style={{ fontSize: 36 }}>📄</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--ud-ink)', margin: 0 }}>
            {s.fileUpload.dropHere}
          </p>
          <p style={{ fontSize: 13, color: 'var(--ud-muted)', margin: 0 }}>
            {s.fileUpload.tapToBrowse}
          </p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={onPick}
        disabled={disabled}
      />
      <span style={{ display: 'none' }} aria-hidden="true">{GOLD_DIM}</span>
      </div>
      {tooLargeMsg ? (
        <p role="alert" style={tooLargeStyle}>{tooLargeMsg}</p>
      ) : (
        <p style={maxSizeNoteStyle}>
          {s.fileUpload.maxSizeNote
            .replace('{{maxMb}}', String(maxMb))
            .replace('{{tier}}', tierLabel)}
        </p>
      )}
    </div>
  )
}

const tooLargeStyle: React.CSSProperties = {
  margin: 0,
  padding: '8px 12px',
  fontSize: 13,
  lineHeight: 1.45,
  color: '#7a2a2a',
  background: 'rgba(176, 50, 50, 0.08)',
  border: '1px solid rgba(176, 50, 50, 0.25)',
  borderRadius: 8,
}

const maxSizeNoteStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: 'var(--ud-muted)',
  textAlign: 'center',
}
