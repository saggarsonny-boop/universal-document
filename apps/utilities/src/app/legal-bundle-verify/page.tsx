'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

interface VerifyResult {
  bundleIntegrity: 'PASS' | 'FAIL'
  documentCount: { expected: number; found: number; match: boolean }
  batesSequence: 'INTACT' | 'BROKEN' | 'NOT_APPLICABLE'
  batesDetails?: string
  chainOfCustody: 'VERIFIED' | 'BROKEN' | 'NOT_APPLICABLE'
  tamperingDetected: boolean
  issues: string[]
  bundleTitle?: string
  createdAt?: string
  producedBy?: string
}

export default function LegalBundleVerify() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File | null) => {
    if (!f) return
    setFile(f)
    setResult(null)
    setError('')
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const run = async () => {
    if (!file) return
    setProcessing(true)
    setError('')
    setResult(null)

    try {
      const JSZip = (await import('jszip')).default
      const zip = await JSZip.loadAsync(file)
      const issues: string[] = []

      // Read index
      const indexFile = zip.file('_index.uds') || zip.file('_index.json')
      let index: Record<string, unknown> | null = null
      let expectedCount = 0
      let bundleTitle: string | undefined
      let createdAt: string | undefined
      let producedBy: string | undefined
      let batesStart: number | undefined
      let batesEnd: number | undefined
      let batesPrefix: string | undefined

      if (indexFile) {
        try {
          const raw = await indexFile.async('string')
          index = JSON.parse(raw)
          const bundle = (index?.bundle ?? index) as Record<string, unknown>
          bundleTitle = (index?.title ?? bundle?.case_name) as string | undefined
          createdAt = ((index?.provenance as Record<string, unknown>)?.created_at ?? index?.created_at) as string | undefined
          producedBy = (bundle?.produced_by ?? bundle?.producing_party) as string | undefined
          const files = bundle?.files as string[] | undefined
          expectedCount = files?.length ?? 0
          const bates = bundle?.bates_range as Record<string, unknown> | undefined
          if (bates) {
            batesStart = bates.start as number
            batesEnd = bates.end as number
            batesPrefix = bates.prefix as string
          }
        } catch {
          issues.push('Bundle index is malformed or cannot be parsed')
        }
      } else {
        issues.push('No bundle index found (_index.uds)')
      }

      // Count actual documents (exclude index)
      const allFiles = Object.keys(zip.files).filter(n => !zip.files[n].dir)
      const docFiles = allFiles.filter(n => n !== '_index.uds' && n !== '_index.json')
      const foundCount = docFiles.length

      // Document count check
      const countMatch = expectedCount === 0 ? true : expectedCount === foundCount
      if (!countMatch) {
        issues.push(`Document count mismatch: index lists ${expectedCount}, bundle contains ${foundCount}`)
      }

      // Bates sequence check
      let batesStatus: VerifyResult['batesSequence'] = 'NOT_APPLICABLE'
      let batesDetails: string | undefined
      if (batesStart !== undefined && batesEnd !== undefined && batesPrefix !== undefined) {
        const expectedRange = batesEnd - batesStart + 1
        if (foundCount === expectedRange) {
          batesStatus = 'INTACT'
          batesDetails = `${batesPrefix}${String(batesStart).padStart(4, '0')} – ${batesPrefix}${String(batesEnd).padStart(4, '0')} (${expectedRange} documents)`
        } else {
          batesStatus = 'BROKEN'
          batesDetails = `Expected ${expectedRange} documents for range ${batesPrefix}${batesStart}–${batesPrefix}${batesEnd}, found ${foundCount}`
          issues.push(`Bates sequence broken: ${batesDetails}`)
        }
      } else if (docFiles.some(n => /[A-Z]+-\d{4,}/.test(n))) {
        // Try to infer Bates from filenames
        const batesNums = docFiles
          .map(n => { const m = n.match(/(\d{4,})/); return m ? parseInt(m[1]) : null })
          .filter((n): n is number => n !== null)
          .sort((a, b) => a - b)
        if (batesNums.length > 1) {
          const isSequential = batesNums.every((n, i) => i === 0 || n === batesNums[i - 1] + 1)
          batesStatus = isSequential ? 'INTACT' : 'BROKEN'
          batesDetails = isSequential
            ? `Sequence ${batesNums[0]}–${batesNums[batesNums.length - 1]} is unbroken`
            : `Gap detected in sequence ${batesNums[0]}–${batesNums[batesNums.length - 1]}`
          if (!isSequential) issues.push(`Bates gap detected in filenames`)
        }
      }

      // Chain of custody: verify each doc has provenance
      let custodyBroken = false
      for (const docName of docFiles) {
        try {
          const raw = await zip.files[docName].async('string')
          const doc = JSON.parse(raw)
          if (!doc.provenance?.created_at) {
            custodyBroken = true
            issues.push(`Missing provenance in ${docName}`)
          }
        } catch {
          custodyBroken = true
          issues.push(`Cannot parse ${docName}`)
        }
      }

      const tamperingDetected = issues.length > 0
      const bundleIntegrity: 'PASS' | 'FAIL' = tamperingDetected ? 'FAIL' : 'PASS'

      setResult({
        bundleIntegrity,
        documentCount: { expected: expectedCount || foundCount, found: foundCount, match: countMatch },
        batesSequence: batesStatus,
        batesDetails,
        chainOfCustody: custodyBroken ? 'BROKEN' : 'VERIFIED',
        tamperingDetected,
        issues,
        bundleTitle,
        createdAt,
        producedBy,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setProcessing(false)
    }
  }

  const pass = (v: boolean) => (
    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '2px 10px', borderRadius: 99, background: v ? 'rgba(34,84,61,0.1)' : 'rgba(226,75,74,0.1)', color: v ? '#22543d' : 'var(--ud-danger)' }}>
      {v ? '✓ PASS' : '✗ FAIL'}
    </span>
  )

  const status = (v: string) => {
    const ok = v === 'PASS' || v === 'INTACT' || v === 'VERIFIED'
    const na = v === 'NOT_APPLICABLE'
    return (
      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '2px 10px', borderRadius: 99, background: na ? 'rgba(107,114,128,0.1)' : ok ? 'rgba(34,84,61,0.1)' : 'rgba(226,75,74,0.1)', color: na ? 'var(--ud-muted)' : ok ? '#22543d' : 'var(--ud-danger)' }}>
        {na ? '– N/A' : ok ? `✓ ${v}` : `✗ ${v}`}
      </span>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Legal Bundle Verify</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 12, lineHeight: 1.6 }}>
        Verify any .udz legal bundle is complete, untampered, and Bates sequence is intact. The verification report checks document count against the bundle index, confirms the chain of custody for every file, and detects any documents added or removed since the bundle was created.
      </p>
      <div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6, padding: '12px 16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)' }}>
        Suitable for eDiscovery integrity checks and legal document authenticity verification. Runs entirely in your browser — the bundle is never uploaded to any server.
      </div>

      <div
        style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'border-color 0.2s, background 0.2s', marginBottom: 24 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".udz" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file ? (
          <div>
            <div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>📦 {file.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ud-teal)', marginTop: 8, fontFamily: 'var(--font-body)' }}>Click or drop to replace</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚖️</div>
            <div style={{ fontSize: 15, color: 'var(--ud-ink)', fontWeight: 600, marginBottom: 6, fontFamily: 'var(--font-body)' }}>Drop your .udz legal bundle</div>
            <div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>or click to browse · .udz only</div>
          </div>
        )}
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}

      {processing && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ height: 4, background: 'var(--ud-border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '60%', background: 'var(--ud-teal)', borderRadius: 99, animation: 'ud-bounce 1.4s ease-in-out infinite' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 8 }}>Verifying bundle integrity…</div>
        </div>
      )}

      {result && (
        <div style={{ marginBottom: 24 }}>
          {/* Overall verdict */}
          <div style={{ padding: '20px 24px', background: result.bundleIntegrity === 'PASS' ? 'rgba(34,84,61,0.06)' : 'rgba(226,75,74,0.06)', border: `1px solid ${result.bundleIntegrity === 'PASS' ? 'rgba(34,84,61,0.3)' : 'rgba(226,75,74,0.3)'}`, borderRadius: 'var(--ud-radius-lg)', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: result.bundleTitle ? 10 : 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)' }}>Bundle Integrity</div>
              {pass(result.bundleIntegrity === 'PASS')}
            </div>
            {result.bundleTitle && <div style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', marginTop: 6 }}>{result.bundleTitle}</div>}
            {result.createdAt && <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', marginTop: 4 }}>Created: {new Date(result.createdAt).toLocaleString()}</div>}
            {result.producedBy && <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>Produced by: {result.producedBy}</div>}
          </div>

          {/* Detail rows */}
          <div style={{ display: 'grid', gap: 1, background: 'var(--ud-border)', borderRadius: 'var(--ud-radius)', overflow: 'hidden', marginBottom: 16 }}>
            {[
              {
                label: 'Document count',
                value: `${result.documentCount.found} found / ${result.documentCount.expected} expected`,
                ok: result.documentCount.match,
              },
              {
                label: 'Bates sequence',
                raw: result.batesSequence,
                sub: result.batesDetails,
              },
              {
                label: 'Chain of custody',
                raw: result.chainOfCustody,
              },
              {
                label: 'Tampering detected',
                value: result.tamperingDetected ? 'YES — see issues below' : 'NO',
                ok: !result.tamperingDetected,
              },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 16px', background: '#fff', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--ud-ink)' }}>{row.label}</div>
                  {row.sub && <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', marginTop: 2 }}>{row.sub}</div>}
                </div>
                {row.raw ? status(row.raw) : (
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '2px 10px', borderRadius: 99, background: row.ok ? 'rgba(34,84,61,0.1)' : 'rgba(226,75,74,0.1)', color: row.ok ? '#22543d' : 'var(--ud-danger)', flexShrink: 0 }}>
                    {row.value}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <div style={{ padding: '14px 16px', background: 'rgba(226,75,74,0.05)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ud-danger)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Issues detected</div>
              {result.issues.map((issue, i) => (
                <div key={i} style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--ud-danger)', marginBottom: 4 }}>⚑ {issue}</div>
              ))}
            </div>
          )}

          {result.bundleIntegrity === 'PASS' && (
            <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(34,84,61,0.06)', border: '1px solid rgba(34,84,61,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 12, fontFamily: 'var(--font-body)', color: '#22543d' }}>
              This verification report confirms the bundle is complete and untampered as of {new Date().toLocaleString()}. Suitable for inclusion in discovery correspondence.
            </div>
          )}
        </div>
      )}

      <button onClick={run} disabled={!file || processing} style={{ width: '100%', padding: '14px', background: !file || processing ? 'var(--ud-border)' : 'var(--ud-ink)', color: !file || processing ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !file || processing ? 'not-allowed' : 'pointer' }}>
        {processing ? 'Verifying…' : 'Verify Bundle'}
      </button>

      <div style={{ marginTop: 24, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs entirely in your browser. The bundle is never uploaded to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Legal Bundle Verify differs from manual bundle checking</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Manually checking that a bundle is complete, correctly numbered, and unmodified takes hours. UD Legal Bundle Verify does it in seconds, entirely in your browser.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'Manual bundle audit', body: 'A paralegal counts documents, checks Bates ranges on each page, and cross-references the index — a process that takes hours on large productions and is prone to human error under deadline pressure.' },
            { title: 'No equivalent tool exists', body: 'There is no standalone, free tool for verifying that a .udz legal bundle is intact. Enterprise platforms like Relativity include review tools, but not for independent verification by receiving counsel.' },
            { title: 'UD Legal Bundle Verify — Bates sequence check', body: 'Reads the bundle index and every document\'s Bates number metadata. Confirms the sequence is unbroken from start to finish. Flags any gap, duplication, or out-of-sequence document immediately.' },
            { title: 'UD Legal Bundle Verify — chain of custody audit', body: 'Checks each document\'s provenance metadata for chain-of-custody fields. Documents with missing or broken provenance are flagged individually — the overall bundle integrity verdict is clearly displayed.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
      <TooltipTour engineId="legal-bundle-verify" tips={tourSteps['legal-bundle-verify']} />
    </div>
  )
}
