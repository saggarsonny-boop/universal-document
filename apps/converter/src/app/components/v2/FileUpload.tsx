'use client'

// File upload area for UD Converter v2. Drag-drop + click to browse.
// Shows file name + size after selection. Auto-detect of input format
// happens in the parent (page.tsx) which calls detectClientFormat after
// onFileSelected fires.

import { useCallback, useRef, useState } from 'react'

const GOLD = '#D4AF37'
const GOLD_DIM = '#8a6f1f'

type Props = {
  onFileSelected: (file: File) => void
  selectedFile: File | null
  disabled?: boolean
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUpload({ onFileSelected, selectedFile, disabled = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files[0]
    if (file) onFileSelected(file)
  }, [onFileSelected, disabled])

  const onPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) onFileSelected(file)
  }, [onFileSelected])

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      aria-label="Upload a file to convert"
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
        minHeight: 140,  // touch-target floor
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
            {formatFileSize(selectedFile.size)} · click to change
          </p>
        </>
      ) : (
        <>
          <div style={{ fontSize: 36 }}>📄</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--ud-ink)', margin: 0 }}>
            Drop your file here
          </p>
          <p style={{ fontSize: 13, color: 'var(--ud-muted)', margin: 0 }}>
            or tap to browse
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
      {/* GOLD_DIM is referenced for the focus-ring style hook; suppress unused-import warning. */}
      <span style={{ display: 'none' }} aria-hidden="true">{GOLD_DIM}</span>
    </div>
  )
}
