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

const PROMPT = `You are a specialist medical summariser. You will produce two distinct summaries of the clinical document below.

**Summary 1 — Patient / Plain Language**
- Written for a patient or non-medical reader
- Simple vocabulary, no jargon
- Empathetic, reassuring tone
- Focus: what this means for the patient, what happens next
- Max 120 words

**Summary 2 — Clinical Professional**
- Written for a doctor, nurse, or other clinician
- Precise medical terminology, structured
- Include: key diagnoses, medications, investigations, management plan, red flags
- SOAP-style where applicable
- Max 200 words

Respond ONLY with a JSON object in this exact shape (no markdown, no preamble):
{
  "patient_summary": "<plain language summary>",
  "clinical_summary": "<clinical professional summary>",
  "key_diagnoses": ["<diagnosis 1>", ...],
  "key_medications": ["<medication 1>", ...],
  "red_flags": ["<red flag 1>", ...],
  "follow_up": "<recommended follow-up action, 1 sentence>"
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
      max_tokens: 2048,
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
        clarity_layers: {
          ...(typeof doc.clarity_layers === 'object' && doc.clarity_layers ? doc.clarity_layers as Record<string, unknown> : {}),
          clinical_summary: {
            generated_at: now,
            model: 'claude-opus-4-5',
            patient_summary: result.patient_summary,
            clinical_summary: result.clinical_summary,
            key_diagnoses: result.key_diagnoses,
            key_medications: result.key_medications,
            red_flags: result.red_flags,
            follow_up: result.follow_up,
          },
        },
        provenance: {
          ...(typeof doc.provenance === 'object' && doc.provenance ? doc.provenance as Record<string, unknown> : {}),
          clinical_summary_generated_at: now,
        },
      }
    }

    return NextResponse.json({
      result,
      uds: outputDoc ? JSON.stringify(outputDoc, null, 2) : null,
      filename: file.name.replace(/\.(uds|udr|pdf)$/, '') + '-clinical-summary.uds',
    })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Clinical summary failed' }, { status: 500 })
  }
}
