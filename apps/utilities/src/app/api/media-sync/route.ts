import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 60

function extractText(doc: Record<string, unknown>): string {
  if (typeof doc.content === 'string') return doc.content
  if (Array.isArray(doc.content)) return (doc.content as Record<string, unknown>[]).map(b => typeof b.text === 'string' ? b.text : '').join('\n\n')
  return ''
}

const PROMPT = `You are a media synchronisation specialist. Given document text and a media duration, produce a timestamp alignment — mapping each section/paragraph of text to an estimated media timestamp.

Rules:
- Assume content flows linearly through the media
- Estimate based on content density and typical speech rate (~140 wpm)
- Return timestamps as MM:SS
- Each sync point: { "timestamp": "MM:SS", "text_preview": "first 8 words of section…", "section_index": number }

Respond ONLY with JSON (no markdown):
{ "sync_points": [ { "timestamp": "MM:SS", "text_preview": "...", "section_index": 1 } ], "total_duration_estimate": "MM:SS", "sync_method": "content-density" }`

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Service temporarily unavailable — configuration issue. Please contact support.' }, { status: 503 })
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const duration = form.get('duration') as string | null
    if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

    const text = await file.text()
    let doc: Record<string, unknown>
    try { doc = JSON.parse(text) } catch { return NextResponse.json({ error: 'File must be a valid .uds file.' }, { status: 400 }) }

    const sourceText = extractText(doc)
    if (!sourceText.trim()) return NextResponse.json({ error: 'No text content found in document.' }, { status: 400 })

    const userMsg = `Media duration: ${duration || 'unknown'}\n\nDocument text:\n${sourceText.slice(0, 8000)}`
    const message = await client.messages.create({ model: 'claude-opus-4-5', max_tokens: 1024, messages: [{ role: 'user', content: `${PROMPT}\n\n${userMsg}` }] })
    const raw = (message.content[0] as { type: string; text: string }).text.trim()
    let sync: Record<string, unknown>
    try { sync = JSON.parse(raw) } catch { return NextResponse.json({ error: 'Model returned unexpected format.' }, { status: 500 }) }

    const now = new Date().toISOString()
    const updated = {
      ...doc,
      media_sync: { generated_at: now, model: 'claude-opus-4-5', duration_input: duration, ...sync },
      provenance: { ...(typeof doc.provenance === 'object' && doc.provenance ? doc.provenance as Record<string, unknown> : {}), media_synced_at: now },
    }
    return NextResponse.json({ sync, uds: JSON.stringify(updated, null, 2), filename: file.name.replace(/\.(uds|udr)$/, '') + '-synced.uds' })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Media sync failed' }, { status: 500 })
  }
}
