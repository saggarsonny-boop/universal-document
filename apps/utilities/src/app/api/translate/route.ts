import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const language = form.get('language') as string | null

    if (!file || !language) {
      return NextResponse.json({ error: 'file and language required' }, { status: 400 })
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
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Translate the following document content into ${language}. Preserve paragraph structure, headings, and formatting conventions. Output only the translated text with no explanation or preamble.\n\n---\n\n${sourceText}`,
      }],
    })

    const translated = (message.content[0] as { type: string; text: string }).text
    const now = new Date().toISOString()

    const updated = {
      ...doc,
      languages: {
        ...(typeof doc.languages === 'object' && doc.languages !== null ? doc.languages as Record<string, unknown> : {}),
        [language.toLowerCase().replace(/\s+/g, '_')]: translated,
      },
      provenance: {
        ...(typeof doc.provenance === 'object' && doc.provenance !== null ? doc.provenance as Record<string, unknown> : {}),
        translated_at: now,
        translated_to: language,
        translated_by: 'UD Utilities · Claude claude-opus-4-5',
      },
    }

    const baseName = file.name.replace(/\.(uds|udr)$/, '')
    const outputName = `${baseName}-${language.toLowerCase().replace(/\s+/g, '-')}.uds`

    return new Response(JSON.stringify(updated, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${outputName}"`,
      },
    })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Translation failed' }, { status: 500 })
  }
}
