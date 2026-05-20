'use client'

import { useState, useEffect } from 'react'

export interface Checkpoint {
  id: string
  category: string
  label: string
  description: string
}

interface GoldenExchangeProps {
  systemTitle: string
  checkpoints: Checkpoint[]
  storageKey: string
  tokenPrefix: string
  submitUrl: string
}

export default function GoldenExchange({
  systemTitle,
  checkpoints,
  storageKey,
  tokenPrefix,
  submitUrl,
}: GoldenExchangeProps) {
  // Load initial completed checkpoints from localStorage if available
  const [completed, setCompleted] = useState<string[]>([])
  const [rating, setRating] = useState<number>(8)
  const [comments, setComments] = useState<string>('')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [screenshotName, setScreenshotName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [licenseKey, setLicenseKey] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Load from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        try {
          setCompleted(JSON.parse(stored))
        } catch (e) {
          // ignore
        }
      }
    }
  }, [storageKey])

  // Save to local storage on change
  const toggleCheckpoint = (id: string) => {
    const updated = completed.includes(id)
      ? completed.filter((c) => c !== id)
      : [...completed, id]
    setCompleted(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(updated))
    }
  }

  // Generate license key once at least 5 checkpoints are completed
  useEffect(() => {
    if (completed.length >= 5 && !licenseKey) {
      const generated = `${tokenPrefix}-PRO-365-${generateShortUUID()}`
      setLicenseKey(generated)
    } else if (completed.length < 5 && licenseKey) {
      setLicenseKey(null)
    }
  }, [completed.length, tokenPrefix, licenseKey])

  function generateShortUUID() {
    return 'xxxx-xxxx'.replace(/[x]/g, () => {
      return (Math.random() * 16 | 0).toString(16).toUpperCase()
    })
  }

  // Calculate tier levels
  const count = completed.length
  let tierName = 'Observer Advocate'
  if (count >= 20) {
    tierName = 'Legendary Platform Architect'
  } else if (count >= 15) {
    tierName = 'Elite Quality Auditor'
  } else if (count >= 10) {
    tierName = 'Rigorous Platform Validator'
  } else if (count >= 5) {
    tierName = 'Introductory Reviewer'
  }

  const progressPercent = Math.min(100, Math.round((count / 20) * 100))

  // Color mapping based on HSL for rating slider
  // 1 is red (H=0), 10 is emerald/green (H=140), gold is in the middle
  const getRatingColor = (val: number) => {
    const hue = (val - 1) * 15 // 0 to 135 hue
    return `hsl(${hue}, 85%, 45%)`
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Attachment must be an image screenshot.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setScreenshot(e.target.result)
        setScreenshotName(file.name)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const clearScreenshot = (e: React.MouseEvent) => {
    e.stopPropagation()
    setScreenshot(null)
    setScreenshotName(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch(submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemTitle,
          completedCount: completed.length,
          completedCheckpoints: completed,
          rating,
          comments,
          screenshot,
          licenseKey,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`)
      }

      setSubmitStatus('success')
    } catch (err) {
      setSubmitStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unknown transport error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={containerStyle}>
      {/* Header Info */}
      <div style={headerCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={titleStyle}>{systemTitle} Golden Exchange</h2>
            <p style={subtitleStyle}>
              Join our pre-flight verification system. Accomplish diagnostic checklists, report findings, and earn premium access keys.
            </p>
          </div>
          <div style={badgeContainerStyle}>
            <span style={tierBadgeStyle}>{tierName}</span>
          </div>
        </div>

        {/* Progress Tracker */}
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            <span style={{ color: '#fff' }}>Checkpoints Cleared: {count} / {checkpoints.length}</span>
            <span style={{ color: '#c8960a' }}>{progressPercent}% Achieved</span>
          </div>
          <div style={progressBgStyle}>
            <div style={{ ...progressFillStyle, width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={gridStyle}>
        {/* Left Side: Diagnostic Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={panelStyle}>
            <h3 style={panelTitleStyle}>1. Diagnostic Test Cases</h3>
            <p style={panelHelpStyle}>
              Execute these 20 standardized pre-flight checkpoints in your browser environment. Tap each item to mark it as verified.
            </p>

            <div style={checkboxListStyle}>
              {checkpoints.map((cp) => {
                const isDone = completed.includes(cp.id)
                return (
                  <div
                    key={cp.id}
                    onClick={() => toggleCheckpoint(cp.id)}
                    style={{
                      ...checkpointRowStyle,
                      border: isDone ? '1px solid #c8960a' : '1px solid rgba(255,255,255,0.08)',
                      background: isDone ? 'rgba(200, 150, 10, 0.05)' : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <div style={checkboxWrapperStyle}>
                      <div style={{
                        ...checkboxStyle,
                        borderColor: isDone ? '#c8960a' : '#475569',
                        background: isDone ? '#c8960a' : 'transparent',
                      }}>
                        {isDone && '✓'}
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={categoryLabelStyle}>{cp.category}</span>
                        <h4 style={{ ...checkpointTitleStyle, color: isDone ? '#fff' : '#e2e8f0' }}>{cp.label}</h4>
                      </div>
                      <p style={checkpointDescStyle}>{cp.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Feedback submission, screenshots and license code */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* License code dispenser */}
          <div style={{ ...panelStyle, background: 'linear-gradient(135deg, #0b131f 0%, #172436 100%)', border: '1px solid rgba(200, 150, 10, 0.25)' }}>
            <h3 style={panelTitleStyle}>2. Professional License Dispenser</h3>
            {completed.length < 5 ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  Complete at least <strong style={{ color: '#c8960a' }}>5 diagnostic checkpoints</strong> to unlock your complimentary 1-year License key (valued at $228).
                </p>
                <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                  Current checkpoints cleared: {completed.length} / 5
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.75rem' }}>🔑</span>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#c8960a', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Unconditional Premium Token</div>
                    <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>1 Year Professional Access Granted</div>
                  </div>
                </div>
                
                <div style={tokenCodeContainerStyle}>
                  <code style={tokenCodeStyle}>{licenseKey}</code>
                </div>
                
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.75rem', lineHeight: 1.5 }}>
                  This professional key bypasses document volume caps and watermark footprints dynamically on the live network.
                </p>
              </div>
            )}
          </div>

          {/* Verification Audit submission form */}
          <div style={panelStyle}>
            <h3 style={panelTitleStyle}>3. Verification Report</h3>
            <p style={panelHelpStyle}>
              Provide your review notes and ratings. The data will be logged directly to the local secure network storage.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Rating Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94a3b8' }}>Fluidity Rating</span>
                  <span style={{ color: getRatingColor(rating), fontWeight: 700 }}>{rating} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  style={sliderStyle}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569', marginTop: '0.25rem' }}>
                  <span>1 (Fragile)</span>
                  <span>5 (Standard)</span>
                  <span>10 (Flawless)</span>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Review Comments & Findings
                </label>
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Describe details, bugs encountered, or suggested modifications..."
                  style={textareaStyle}
                  required
                />
              </div>

              {/* Drag and Drop Screenshot */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Visual Proof Attachment (Optional)
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('screenshotInput')?.click()}
                  style={{
                    ...dropzoneStyle,
                    borderColor: isDragging ? '#c8960a' : 'rgba(255,255,255,0.15)',
                    background: isDragging ? 'rgba(200, 150, 10, 0.04)' : 'rgba(255,255,255,0.01)',
                  }}
                >
                  <input
                    id="screenshotInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFile(file)
                    }}
                    style={{ display: 'none' }}
                  />
                  {screenshot ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={screenshot} alt="Preview" style={previewImageStyle} />
                      <button onClick={clearScreenshot} style={clearBtnStyle}>×</button>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                        {screenshotName}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📷</div>
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Drag & drop screenshot here</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>or click to browse local files</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit panel state */}
              {submitStatus === 'success' && (
                <div style={successBoxStyle}>
                  <strong>✓ Verification Logged Successfully</strong>
                  <p style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>
                    Your feedback is synchronized to our server scratch storage. Thank you for validating the system.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div style={errorBoxStyle}>
                  <strong>✗ Submission Failed</strong>
                  <p style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>{errorMessage}</p>
                </div>
              )}

              {/* Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  ...submitBtnStyle,
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Submitting Log...' : 'Submit Verification Report'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

// Inline Styles to guarantee 100% beautiful glassmorphism/slate design
const containerStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  color: '#f8fafc',
  padding: '1.5rem',
  maxWidth: '1200px',
  margin: '0 auto',
}

const headerCardStyle: React.CSSProperties = {
  background: '#131e2e',
  border: '1px solid rgba(200, 150, 10, 0.2)',
  borderRadius: '12px',
  padding: '1.5rem',
  marginBottom: '2rem',
  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.75rem',
  fontWeight: 700,
  color: '#ffffff',
  margin: 0,
  letterSpacing: '-0.01em',
}

const subtitleStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#94a3b8',
  marginTop: '0.5rem',
  lineHeight: 1.5,
  margin: '0.5rem 0 0 0',
}

const badgeContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
}

const tierBadgeStyle: React.CSSProperties = {
  background: 'rgba(200, 150, 10, 0.15)',
  border: '1px solid #c8960a',
  color: '#c8960a',
  padding: '0.4rem 0.8rem',
  borderRadius: '20px',
  fontSize: '0.78rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
}

const progressBgStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  height: '8px',
  overflow: 'hidden',
}

const progressFillStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, #c8960a 0%, #e8b420 100%)',
  height: '100%',
  borderRadius: '20px',
  transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
  gap: '2rem',
  alignItems: 'start',
}

const panelStyle: React.CSSProperties = {
  background: '#131e2e',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '12px',
  padding: '1.5rem',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
}

const panelTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.2rem',
  fontWeight: 600,
  color: '#fff',
  margin: '0 0 0.5rem 0',
}

const panelHelpStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#64748b',
  lineHeight: 1.4,
  margin: '0 0 1.25rem 0',
}

const checkboxListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  maxHeight: '680px',
  overflowY: 'auto',
  paddingRight: '0.25rem',
}

const checkpointRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  padding: '0.9rem',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
}

const checkboxWrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  paddingTop: '0.15rem',
}

const checkboxStyle: React.CSSProperties = {
  width: '18px',
  height: '18px',
  border: '1px solid',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.65rem',
  fontWeight: 900,
  color: '#0b131f',
  transition: 'all 0.15s ease',
}

const categoryLabelStyle: React.CSSProperties = {
  fontSize: '0.68rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#c8960a',
  background: 'rgba(200, 150, 10, 0.08)',
  padding: '0.15rem 0.4rem',
  borderRadius: '4px',
}

const checkpointTitleStyle: React.CSSProperties = {
  fontSize: '0.88rem',
  fontWeight: 600,
  margin: 0,
}

const checkpointDescStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  color: '#94a3b8',
  lineHeight: 1.4,
  margin: '0.35rem 0 0 0',
}

const tokenCodeContainerStyle: React.CSSProperties = {
  background: 'rgba(0, 0, 0, 0.25)',
  border: '1px dashed rgba(200, 150, 10, 0.3)',
  borderRadius: '8px',
  padding: '0.75rem',
  display: 'flex',
  justifyContent: 'center',
  marginTop: '0.75rem',
}

const tokenCodeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.95rem',
  color: '#e8b420',
  fontWeight: 700,
  letterSpacing: '0.08em',
}

const sliderStyle: React.CSSProperties = {
  width: '100%',
  cursor: 'pointer',
  accentColor: '#c8960a',
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  padding: '0.75rem',
  color: '#fff',
  fontFamily: 'inherit',
  fontSize: '0.85rem',
  outline: 'none',
  resize: 'vertical',
}

const dropzoneStyle: React.CSSProperties = {
  border: '1.5px dashed',
  borderRadius: '8px',
  padding: '1.5rem',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
}

const previewImageStyle: React.CSSProperties = {
  maxWidth: '100%',
  maxHeight: '120px',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.1)',
}

const clearBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-8px',
  right: '-8px',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  background: '#e24b4a',
  border: 'none',
  color: '#fff',
  fontSize: '11px',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const successBoxStyle: React.CSSProperties = {
  background: 'rgba(29, 158, 117, 0.1)',
  border: '1px solid #1d9e75',
  borderRadius: '6px',
  padding: '0.75rem',
  color: '#2dd4bf',
  fontSize: '0.82rem',
}

const errorBoxStyle: React.CSSProperties = {
  background: 'rgba(226, 75, 74, 0.1)',
  border: '1px solid #e24b4a',
  borderRadius: '6px',
  padding: '0.75rem',
  color: '#fca5a5',
  fontSize: '0.82rem',
}

const submitBtnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #c8960a 0%, #a67808 100%)',
  border: 'none',
  borderRadius: '8px',
  padding: '0.85rem 1rem',
  color: '#fff',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  fontWeight: 700,
  transition: 'transform 0.1s ease',
}
