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

const PROMPT = `You are a document security classification analyst. Read the document content below and assign the most appropriate sensitivity classification.

Classification levels:
- PUBLIC: No sensitivity. Safe to share with anyone. Examples: marketing materials, public announcements, general info.
- INTERNAL: Low sensitivity. For internal use only, not for external distribution. Examples: internal memos, team updates, internal processes.
- CONFIDENTIAL: Medium-high sensitivity. Contains sensitive business, personal, or professional information. Examples: financial projections, personnel records, client data, contracts, medical records, legal documents.
- RESTRICTED: Highest sensitivity. Extremely sensitive, tightly controlled access. Examples: trade secrets, classified research, sensitive personal data (passports, SSNs), privileged legal communications, critical infrastructure details.

Also identify any specific sensitivity indicators present in the document.

Respond ONLY with a JSON object in this exact shape (no markdown, no preamble):
{
  "classification": "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED",
  "confidence": <number 0-100>,
  "reasoning": "<2-3 sentence explanation of why this classification was assigned>",
  "indicators": ["<specific sensitivity indicator found>", ...],
  "recommended_handling": "<1-2 sentences on how this document should be handled/stored/shared>"
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
    let doc: Record<string, unknown> | null = null
    try {
      doc = JSON.parse(text)
      sourceText = extractText(doc!)
    } catch { /* use raw text */ }

    if (!sourceText.trim()) return NextResponse.json({ error: 'No content found in file.' }, { status: 400 })

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: `${PROMPT}\n\n---\n\n${sourceText.slice(0, 12000)}` }],
    })

    const raw = (message.content[0] as { type: string; text: string }).text.trim()
    let result: Record<string, unknown>
    try { result = JSON.parse(raw) } catch {
      return NextResponse.json({ error: 'Model returned unexpected format.' }, { status: 500 })
    }

    const now = new Date().toISOString()
    let outputDoc: Record<string, unknown> | null = null
    if (doc) {
      outputDoc = {
        ...doc,
        classification: result.classification,
        clarity_layers: {
          ...(typeof doc.clarity_layers === 'object' && doc.clarity_layers ? doc.clarity_layers as Record<string, unknown> : {}),
          classification_report: {
            generated_at: now,
            model: 'claude-opus-4-5',
            classification: result.classification,
            confidence: result.confidence,
            reasoning: result.reasoning,
            indicators: result.indicators,
            recommended_handling: result.recommended_handling,
          },
        },
        provenance: {
          ...(typeof doc.provenance === 'object' && doc.provenance ? doc.provenance as Record<string, unknown> : {}),
          classified_at: now,
        },
      }
    }

    return NextResponse.json({
      result,
      uds: outputDoc ? JSON.stringify(outputDoc, null, 2) : null,
      filename: file.name.replace(/\.(uds|udr|pdf)$/, '') + '-classified.uds',
    })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Classification failed' }, { status: 500 })
  }
}
