import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 90

function extractText(doc: Record<string, unknown>): string {
  if (typeof doc.content === 'string') return doc.content
  if (Array.isArray(doc.content)) return (doc.content as Record<string, unknown>[]).map(b => typeof b.text === 'string' ? b.text : '').join('\n\n')
  return ''
}

interface ChapterMarker {
  timestamp: string
  title: string
  linked_section?: string
}

const PROMPT = `You are an advanced media synchronisation specialist. Given document text, media metadata, and optional user-provided chapter markers, produce:

1. A full timestamp alignment mapping document sections to media timestamps
2. Auto-generated chapter markers at each major section transition
3. Bidirectional navigation metadata so each chapter links to both a document heading and a media timestamp

Rules:
- Assume content flows linearly through the media
- Estimate timestamps based on content density and typical speech rate (~140 wpm for audio, ~120 wpm for narrated video)
- Return timestamps as MM:SS or H:MM:SS
- Identify major section boundaries from headings, topic shifts, and structural breaks
- Each chapter marker must have both a document_section reference and a media_timestamp

Respond ONLY with valid JSON (no markdown fences):
{
  "sync_points": [{ "timestamp": "MM:SS", "text_preview": "first 8 words...", "section_index": 1 }],
  "chapters": [{ "chapter_number": 1, "title": "Chapter title", "timestamp": "MM:SS", "document_section": "Heading or section name", "synopsis": "1-sentence summary" }],
  "total_duration_estimate": "MM:SS",
  "sync_method": "content-density-advanced",
  "navigation": { "paragraph_to_timestamp": "bidirectional", "timestamp_to_section": "bidirectional" }
}`

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Service temporarily unavailable — configuration issue. Please contact support.' }, { status: 503 })
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  try {
    const form = await req.formData()
    const docFile = form.get('document') as File | null
    const mediaFile = form.get('media') as File | null
    const chaptersRaw = form.get('chapters') as string | null

    if (!docFile) return NextResponse.json({ error: 'document file required' }, { status: 400 })

    const text = await docFile.text()
    let doc: Record<string, unknown>
    try { doc = JSON.parse(text) } catch { return NextResponse.json({ error: 'Document must be a valid .uds file.' }, { status: 400 }) }

    const sourceText = extractText(doc)
    if (!sourceText.trim()) return NextResponse.json({ error: 'No text content found in document.' }, { status: 400 })

    // Media metadata (we use filename/size for context — cannot process binary audio/video with text API)
    const mediaInfo = mediaFile
      ? { name: mediaFile.name, size_mb: (mediaFile.size / 1024 / 1024).toFixed(1), type: mediaFile.type }
      : null

    // Estimate duration from file size (rough: ~1MB/min for mp3, ~10MB/min for mp4)
    let estimatedDuration = 'unknown'
    if (mediaFile) {
      const mb = mediaFile.size / 1024 / 1024
      const isVideo = mediaFile.type.startsWith('video/')
      const mins = isVideo ? mb / 10 : mb / 1
      estimatedDuration = `${Math.floor(mins)}:${String(Math.round((mins % 1) * 60)).padStart(2, '0')}`
    }

    let userChapters: ChapterMarker[] = []
    if (chaptersRaw) {
      try { userChapters = JSON.parse(chaptersRaw) } catch { /* ignore malformed */ }
    }

    const userMsg = [
      `Media file: ${mediaInfo ? `${mediaInfo.name} (${mediaInfo.size_mb} MB, ${mediaInfo.type})` : 'not provided'}`,
      `Estimated duration: ${estimatedDuration}`,
      userChapters.length > 0 ? `User-provided chapter anchors:\n${userChapters.map(c => `  ${c.timestamp} — ${c.title}${c.linked_section ? ` [section: ${c.linked_section}]` : ''}`).join('\n')}` : 'No user chapter anchors provided — auto-generate chapters from document structure.',
      `\nDocument text:\n${sourceText.slice(0, 8000)}`,
    ].join('\n')

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: `${PROMPT}\n\n${userMsg}` }],
    })

    const raw = (message.content[0] as { type: string; text: string }).text.trim()
    let syncData: Record<string, unknown>
    try { syncData = JSON.parse(raw) } catch { return NextResponse.json({ error: 'Model returned unexpected format.' }, { status: 500 }) }

    const now = new Date().toISOString()
    const updated = {
      ...doc,
      media_sync_advanced: {
        generated_at: now,
        model: 'claude-opus-4-5',
        media_file: mediaInfo,
        estimated_duration: estimatedDuration,
        user_chapter_anchors: userChapters.length > 0 ? userChapters : undefined,
        ...syncData,
      },
      provenance: {
        ...(typeof doc.provenance === 'object' && doc.provenance ? doc.provenance as Record<string, unknown> : {}),
        media_sync_advanced_at: now,
        sync_type: 'advanced_with_chapters',
      },
    }

    const safeName = docFile.name.replace(/\.(uds|udr)$/, '')
    return NextResponse.json({
      sync: syncData,
      uds: JSON.stringify(updated, null, 2),
      filename: `${safeName}-synced-advanced.uds`,
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Media sync failed' }, { status: 500 })
  }
}
