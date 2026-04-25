import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 60

function extractText(doc: Record<string, unknown>): string {
  if (typeof doc.content === 'string') return doc.content
  if (Array.isArray(doc.content)) {
    return (doc.content as Record<string, unknown>[])
      .map(b => typeof b.text === 'string' ? b.text : '')
      .join('\n\n')
  }
  if (typeof doc.body === 'string') return doc.body
  return JSON.stringify(doc).slice(0, 8000)
}

const PROMPT = `You are a WCAG 2.1 and Section 508 accessibility auditor. Analyse the document content below and produce a structured accessibility compliance report.

Check each of these criteria and report PASS, FAIL, or CANNOT_ASSESS:

1. alt_text — Images have descriptive alt text
2. heading_hierarchy — Headings follow logical order (H1 → H2 → H3)
3. colour_contrast — Text contrast ratio ≥ 4.5:1 (AA standard)
4. language_declaration — Document language is declared
5. table_headers — Tables have header rows/columns marked
6. form_labels — All form fields have associated labels
7. reading_order — Content reading order is logical
8. document_title — Document has a descriptive title
9. link_text — Links have descriptive text (not "click here")
10. list_structure — Lists use proper list markup

Respond ONLY with a JSON object in this exact shape (no markdown, no preamble):
{
  "overall": "PASS" | "FAIL" | "PARTIAL",
  "score": <number 0-100>,
  "checks": [
    {
      "id": "<criterion_id>",
      "label": "<human label>",
      "status": "PASS" | "FAIL" | "CANNOT_ASSESS",
      "wcag": "<WCAG criterion e.g. 1.1.1>",
      "note": "<brief finding, max 20 words>"
    }
  ],
  "summary": "<2-3 sentence overall assessment>",
  "remediation_steps": ["<step 1>", "<step 2>"]
}`

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Service temporarily unavailable — configuration issue. Please contact support.' }, { status: 503 })
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

    const text = await file.text()
    let sourceText = text
    try {
      const doc = JSON.parse(text)
      sourceText = extractText(doc)
    } catch { /* use raw text */ }

    if (!sourceText.trim()) return NextResponse.json({ error: 'No content found in file.' }, { status: 400 })

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: `${PROMPT}\n\n---\n\n${sourceText.slice(0, 12000)}` }],
    })

    const raw = (message.content[0] as { type: string; text: string }).text.trim()
    let report: Record<string, unknown>
    try { report = JSON.parse(raw) } catch {
      return NextResponse.json({ error: 'Model returned unexpected format.' }, { status: 500 })
    }

    const now = new Date().toISOString()
    // If file is UDS, embed report as clarity layer
    let outputDoc: Record<string, unknown> | null = null
    try {
      const doc = JSON.parse(text) as Record<string, unknown>
      outputDoc = {
        ...doc,
        clarity_layers: {
          ...(typeof doc.clarity_layers === 'object' && doc.clarity_layers ? doc.clarity_layers as Record<string, unknown> : {}),
          accessibility_report: { generated_at: now, model: 'claude-opus-4-5', report },
        },
        provenance: {
          ...(typeof doc.provenance === 'object' && doc.provenance ? doc.provenance as Record<string, unknown> : {}),
          accessibility_checked_at: now,
        },
      }
    } catch { /* not a UDS file, report only */ }

    return NextResponse.json({
      report,
      uds: outputDoc ? JSON.stringify(outputDoc, null, 2) : null,
      filename: file.name.replace(/\.(uds|udr|pdf)$/, '') + '-accessibility.uds',
    })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Accessibility check failed' }, { status: 500 })
  }
}
