import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 60

function extractText(doc: Record<string, unknown>): string {
  if (typeof doc.content === 'string') return doc.content
  if (Array.isArray(doc.content)) {
    return (doc.content as Record<string, unknown>[])
      .map(block => typeof block.text === 'string' ? block.text : '')
      .join('\n\n')
  }
  if (typeof doc.body === 'string') return doc.body
  return JSON.stringify(doc, null, 2)
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Service temporarily unavailable — configuration issue. Please contact support.' }, { status: 503 })
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'file required' }, { status: 400 })
    }

    const text = await file.text()
    let doc: Record<string, unknown>
    try { doc = JSON.parse(text) } catch {
      return NextResponse.json({ error: 'File does not appear to be a valid .uds document.' }, { status: 400 })
    }

    const sourceText = extractText(doc)
    if (!sourceText.trim()) {
      return NextResponse.json({ error: 'No text content found in this document.' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Summarise the following document clearly and concisely. Write 3-5 sentences covering the main topic, key points, and any conclusions or actions. Use plain language accessible to a general audience. Output only the summary with no preamble or explanation.\n\n---\n\n${sourceText}`,
      }],
    })

    const summary = (message.content[0] as { type: string; text: string }).text
    const now = new Date().toISOString()

    const updated = {
      ...doc,
      clarity_layers: {
        ...(typeof doc.clarity_layers === 'object' && doc.clarity_layers !== null ? doc.clarity_layers as Record<string, unknown> : {}),
        summary: {
          generated_at: now,
          model: 'claude-opus-4-5',
          text: summary,
        },
      },
      provenance: {
        ...(typeof doc.provenance === 'object' && doc.provenance !== null ? doc.provenance as Record<string, unknown> : {}),
        summarised_at: now,
        summarised_by: 'UD Utilities · Claude claude-opus-4-5',
      },
    }

    const baseName = file.name.replace(/\.(uds|udr)$/, '')
    const outputName = `${baseName}-summarised.uds`

    return new Response(JSON.stringify(updated, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${outputName}"`,
      },
    })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Summarisation failed' }, { status: 500 })
  }
}
