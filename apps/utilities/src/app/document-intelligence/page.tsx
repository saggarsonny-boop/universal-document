'use client'

import { useState, useRef } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

interface AnalysisResult {
  type: string
  question: string
  answer: string
  timestamp: string
}

const QUICK_ANALYSES = [
  { label: 'Extract obligations', prompt: 'List all obligations and duties that each party must fulfil under this document. Format as a structured list with party name and obligation.' },
  { label: 'Identify risks', prompt: 'Identify the top risks, liabilities, or problematic clauses in this document. Rate each as High/Medium/Low and explain why.' },
  { label: 'Summarise key terms', prompt: 'Summarise the most important terms and conditions in plain English. Include parties, duration, financial terms, and key restrictions.' },
  { label: 'Find deadlines & dates', prompt: 'Extract all dates, deadlines, notice periods, and time-sensitive obligations mentioned in this document.' },
  { label: 'Check for red flags', prompt: 'Review this document for unusual, one-sided, or potentially unfair clauses. Highlight anything a reasonable party should question before signing.' },
  { label: 'Extract definitions', prompt: 'List all defined terms in this document and their definitions.' },
]

export default function DocumentIntelligencePage() {
  const [loadedDoc, setLoadedDoc] = useState<{ name: string; content: object; hash: string; rawText: string } | null>(null)
  const [question, setQuestion] = useState('')
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  async function loadDocument(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsLoading(true)
    setError('')
    try {
      const bytes = new Uint8Array(await file.arrayBuffer())
      const hash = await sha256hex(bytes)
      const text = new TextDecoder().decode(bytes)
      const content = JSON.parse(text)
      if (!content.ud_version || !content.format) {
        setError('Not a valid .uds file. Please load a Universal Document Sealed file.')
        setIsLoading(false)
        return
      }
      setLoadedDoc({ name: file.name, content, hash, rawText: text })
    } catch {
      setError('Could not parse file. Please ensure it is a valid .uds JSON file.')
    } finally {
      setIsLoading(false)
      e.target.value = ''
    }
  }

  async function analyse(customQuestion?: string) {
    const q = customQuestion || question
    if (!loadedDoc || !q) return
    setIsAnalysing(true)
    setError('')
    abortRef.current = new AbortController()

    const docSummary = JSON.stringify(loadedDoc.content, null, 2).slice(0, 6000)
    const prompt = `You are an expert document analyst reviewing a Universal Document (.uds).
The document contains:
${docSummary}

Question: ${q}

Provide a clear, structured, and accurate response based solely on what is in the document. If information is not present, say so clearly.`

    const result: AnalysisResult = {
      type: 'analysis',
      question: q,
      answer: '',
      timestamp: new Date().toISOString(),
    }
    setResults(prev => [result, ...prev])

    try {
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 1500 }),
        signal: abortRef.current.signal,
      })

      if (!response.ok || !response.body) {
        throw new Error(`API error: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullAnswer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              const text = parsed.delta?.text || parsed.choices?.[0]?.delta?.content || ''
              if (text) {
                fullAnswer += text
                setResults(prev => prev.map((r, i) => i === 0 ? { ...r, answer: fullAnswer } : r))
              }
            } catch { /* continue */ }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      const errMsg = err instanceof Error ? err.message : 'Analysis failed'
      setResults(prev => prev.map((r, i) => i === 0 ? { ...r, answer: `Error: ${errMsg}` } : r))
      setError(errMsg)
    } finally {
      setIsAnalysing(false)
      if (!customQuestion) setQuestion('')
    }
  }

  async function downloadAnalysisRecord() {
    if (!loadedDoc || results.length === 0) return
    const encoder = new TextEncoder()
    const doc = {
      sourceDocument: { name: loadedDoc.name, hash: loadedDoc.hash },
      analyses: results,
      generatedAt: new Date().toISOString(),
    }
    const hash = await sha256hex(encoder.encode(JSON.stringify(doc, null, 2)))
    const id = `DI-${Date.now().toString(36).toUpperCase()}`
    const uds = {
      ud_version: '1.0',
      format: 'uds',
      id,
      created: new Date().toISOString(),
      schema: 'document-intelligence/v1',
      metadata: { title: `Document Intelligence Report — ${loadedDoc.name}`, sourceHash: loadedDoc.hash, analysisCount: results.length },
      provenance: { sha256: hash, sealed: new Date().toISOString(), tool: 'UD Document Intelligence', version: '1.0' },
      content: doc,
    }
    const blob = new Blob([JSON.stringify(uds, null, 2)], { type: 'application/json' })
    const safeName = loadedDoc.name.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 20)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `di-report-${safeName}-${id}.uds`; a.click()
    URL.revokeObjectURL(url)
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]'
  const labelCls = 'block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide'

  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#1e2d3d]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <TooltipTour engineId="document-intelligence" tips={tourSteps['document-intelligence'] ?? []} />

      <div className="bg-[#c8960a] text-white text-center py-2 text-sm font-medium">
        Beta — Free during beta
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-3xl font-bold mb-2">
            UD Document Intelligence
          </h1>
          <p className="text-gray-500 text-sm">
            Load any .uds document and ask Claude AI to analyse it. Extract obligations, identify risks,
            summarise key terms, and ask any question about the document content.
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="inline-block px-2 py-0.5 text-xs rounded font-semibold" style={{ background: '#e6f4f1', color: '#0d7a6a' }}>
              Free · 3/month
            </span>
          </div>
        </div>

        {/* Load Document */}
        <section data-tour="load-document" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Load Document</h2>
          {!loadedDoc ? (
            <label className="flex items-center gap-4 p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#c8960a] transition-colors">
              <span className="text-4xl">📋</span>
              <div>
                <p className="text-sm font-medium">{isLoading ? 'Loading…' : 'Click to load .uds document'}</p>
                <p className="text-xs text-gray-400 mt-0.5">Load any Universal Document Sealed file for AI analysis</p>
              </div>
              <input type="file" accept=".uds,.json" className="hidden" onChange={loadDocument} disabled={isLoading} />
            </label>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-2xl">📋</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{loadedDoc.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Schema: {(loadedDoc.content as Record<string, string>).schema || 'Unknown'} · {(loadedDoc.content as Record<string, string>).format?.toUpperCase()}
                </p>
                <p className="text-xs font-mono text-gray-400">{loadedDoc.hash.slice(0, 20)}…</p>
              </div>
              <button onClick={() => { setLoadedDoc(null); setResults([]) }} className="text-xs text-red-500 hover:text-red-700 flex-shrink-0">Remove</button>
            </div>
          )}
          {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
        </section>

        {loadedDoc && (
          <>
            {/* Quick Analysis Buttons */}
            <section data-tour="quick-analysis" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-3">Quick Analysis</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QUICK_ANALYSES.map(qa => (
                  <button
                    key={qa.label}
                    onClick={() => analyse(qa.prompt)}
                    disabled={isAnalysing}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-left hover:border-[#c8960a] hover:bg-amber-50 disabled:opacity-40 transition-colors"
                  >
                    {qa.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Custom Question */}
            <section data-tour="custom-question" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-3">Ask a Question</h2>
              <div className="flex gap-3">
                <input
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !isAnalysing) analyse() }}
                  className={`${inputCls} flex-1`}
                  placeholder="e.g. What are the termination conditions? Who bears the cost of disputes?"
                  disabled={isAnalysing}
                />
                <button
                  onClick={() => analyse()}
                  disabled={isAnalysing || !question}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-40"
                  style={{ background: '#c8960a' }}
                >
                  {isAnalysing ? 'Analysing…' : 'Ask'}
                </button>
              </div>
            </section>

            {/* Results */}
            {results.length > 0 && (
              <section className="space-y-4 mb-6">
                {results.map((r, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                    <p className="text-xs font-semibold text-[#c8960a] uppercase tracking-wide mb-2">{r.question.slice(0, 80)}{r.question.length > 80 ? '…' : ''}</p>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {r.answer || (isAnalysing && i === 0 ? <span className="text-gray-400 animate-pulse">Analysing…</span> : '')}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">{new Date(r.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </section>
            )}

            {results.length > 0 && (
              <div className="text-center mb-6">
                <button onClick={downloadAnalysisRecord} className="px-6 py-2.5 rounded-xl border-2 border-[#1e2d3d] text-[#1e2d3d] font-semibold text-sm">
                  Download Analysis Record (.uds)
                </button>
              </div>
            )}
          </>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-xs text-amber-800">
            <strong>AI Analysis Notice:</strong> Document Intelligence uses Claude AI to analyse document content.
            AI analysis is not a substitute for legal or professional advice. Always consult a qualified professional
            for decisions with legal, financial, or regulatory implications.
          </p>
        </div>

        <section className="mt-8">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-2xl font-bold mb-6">
            How UD Document Intelligence differs from LexisNexis AI / Harvey / general LLM tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Works on .uds structured data', body: 'Unlike tools that only parse raw text, Document Intelligence reads the structured .uds schema — it knows which fields are obligations, which are parties, which are financial terms.' },
              { title: 'Analysis record is sealed', body: 'The AI analysis output can be downloaded as a tamper-evident .uds. The questions, answers, and source document hash are all cryptographically locked.' },
              { title: 'No document upload to third parties', body: 'Your document stays in your browser. Only the text content is sent to Claude API — no file upload, no third-party storage.' },
              { title: 'Any .uds document, not just contracts', body: 'Analyse any UD document — training records, ESG reports, grant applications, medical histories. The same intelligence engine works across the full UD ecosystem.' },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-sm mb-1">{c.title}</h3>
                <p className="text-gray-500 text-xs">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-xs text-gray-400 mt-12">No ads. No investors. No agenda.</p>
      </div>
    </main>
  )
}
