import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 60

const LANG_CODES: Record<string, { code: string; label: string; direction: 'ltr' | 'rtl' }> = {
  'arabic':                   { code: 'ar', label: 'العربية',        direction: 'rtl' },
  'bengali':                  { code: 'bn', label: 'বাংলা',           direction: 'ltr' },
  'chinese (simplified)':     { code: 'zh-hans', label: '中文 (简体)', direction: 'ltr' },
  'chinese (traditional)':    { code: 'zh-hant', label: '中文 (繁體)', direction: 'ltr' },
  'czech':                    { code: 'cs', label: 'Čeština',         direction: 'ltr' },
  'danish':                   { code: 'da', label: 'Dansk',           direction: 'ltr' },
  'dutch':                    { code: 'nl', label: 'Nederlands',      direction: 'ltr' },
  'finnish':                  { code: 'fi', label: 'Suomi',           direction: 'ltr' },
  'french':                   { code: 'fr', label: 'Français',        direction: 'ltr' },
  'german':                   { code: 'de', label: 'Deutsch',         direction: 'ltr' },
  'greek':                    { code: 'el', label: 'Ελληνικά',        direction: 'ltr' },
  'hebrew':                   { code: 'he', label: 'עברית',           direction: 'rtl' },
  'hindi':                    { code: 'hi', label: 'हिन्दी',          direction: 'ltr' },
  'hungarian':                { code: 'hu', label: 'Magyar',          direction: 'ltr' },
  'indonesian':               { code: 'id', label: 'Bahasa Indonesia', direction: 'ltr' },
  'italian':                  { code: 'it', label: 'Italiano',        direction: 'ltr' },
  'japanese':                 { code: 'ja', label: '日本語',           direction: 'ltr' },
  'korean':                   { code: 'ko', label: '한국어',           direction: 'ltr' },
  'malay':                    { code: 'ms', label: 'Bahasa Melayu',   direction: 'ltr' },
  'norwegian':                { code: 'no', label: 'Norsk',           direction: 'ltr' },
  'persian':                  { code: 'fa', label: 'فارسی',           direction: 'rtl' },
  'polish':                   { code: 'pl', label: 'Polski',          direction: 'ltr' },
  'portuguese':               { code: 'pt', label: 'Português',       direction: 'ltr' },
  'romanian':                 { code: 'ro', label: 'Română',          direction: 'ltr' },
  'russian':                  { code: 'ru', label: 'Русский',         direction: 'ltr' },
  'spanish':                  { code: 'es', label: 'Español',         direction: 'ltr' },
  'swahili':                  { code: 'sw', label: 'Kiswahili',       direction: 'ltr' },
  'swedish':                  { code: 'sv', label: 'Svenska',         direction: 'ltr' },
  'tagalog':                  { code: 'tl', label: 'Tagalog',         direction: 'ltr' },
  'thai':                     { code: 'th', label: 'ภาษาไทย',         direction: 'ltr' },
  'turkish':                  { code: 'tr', label: 'Türkçe',          direction: 'ltr' },
  'ukrainian':                { code: 'uk', label: 'Українська',      direction: 'ltr' },
  'urdu':                     { code: 'ur', label: 'اردو',            direction: 'rtl' },
  'vietnamese':               { code: 'vi', label: 'Tiếng Việt',      direction: 'ltr' },
}

function getBlockText(block: Record<string, unknown>): string {
  const bc = block.base_content as Record<string, unknown> | undefined
  if (typeof bc?.text === 'string') return bc.text
  if (typeof bc?.html === 'string') return bc.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return ''
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Service temporarily unavailable — configuration issue. Please contact support.' }, { status: 503 })
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
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

    const langMeta = LANG_CODES[language.toLowerCase()] ?? { code: language.toLowerCase().replace(/\s+/g, '-'), label: language, direction: 'ltr' as const }
    const langCode = langMeta.code

    // Extract translatable blocks
    const blocks = Array.isArray(doc.blocks) ? doc.blocks as Record<string, unknown>[] : []
    const translatableBlocks = blocks.filter(b => {
      const t = b.type as string
      return ['paragraph', 'heading', 'list', 'custom'].includes(t) && getBlockText(b).trim()
    })

    if (!translatableBlocks.length) {
      return NextResponse.json({ error: 'No translatable text content found in this document.' }, { status: 400 })
    }

    // Build input for Claude: array of { id, text } objects
    const blockInputs = translatableBlocks.map(b => ({ id: b.id as string, text: getBlockText(b) }))

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 8192,
      system: `You are a professional document translator. You will translate document text into ${language}.
You must return the exact same JSON structure with translated text.
CRITICAL: You must write the translation in the native script of the target language.
For Japanese use kanji/hiragana/katakana. For Arabic use Arabic script right-to-left.
For Chinese use simplified or traditional characters as appropriate.
For Korean use Hangul. For Hebrew use Hebrew script. For Thai use Thai script.
For Hindi use Devanagari. For Persian/Farsi use Persian script. For Urdu use Nastaliq/Arabic script.
For Bengali use Bengali script. For Greek use Greek alphabet. For Russian/Ukrainian use Cyrillic.
Never romanise or transliterate — always use the native writing system of the target language.
Return ONLY a JSON array of objects: [{"id":"...","text":"..."}].
No explanation, no markdown fences, no preamble. Raw JSON only.`,
      messages: [{
        role: 'user',
        content: JSON.stringify(blockInputs),
      }],
    })

    let translated: { id: string; text: string }[]
    let parseFailed = false
    try {
      const raw = (message.content[0] as { type: string; text: string }).text.trim()
      console.log(`[translate] language=${language} raw_length=${raw.length} raw_first200=${raw.slice(0, 200)}`)
      // Strip markdown code fences if present (handles ```json, ```, and leading/trailing whitespace)
      const jsonStr = raw.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?\s*```$/, '').trim()
      translated = JSON.parse(jsonStr)
      console.log(`[translate] parsed ok, entries=${translated.length}, first_text=${translated[0]?.text?.slice(0, 80)}`)
    } catch (parseErr) {
      console.error(`[translate] parse failed for language=${language}:`, parseErr)
      parseFailed = true
      translated = []
    }

    const translationMap = Object.fromEntries(translated.map(t => [t.id, t.text]))

    // Inject translations — replace base_content.text; output only id/type/base_content
    // Fall back to original text if translation is missing, empty, or whitespace-only
    const updatedBlocks = blocks.map(block => {
      const id = block.id as string
      const originalBc = (block.base_content ?? {}) as Record<string, unknown>
      const originalText = typeof originalBc.text === 'string' ? originalBc.text : ''
      const translatedText = translationMap[id]
      const finalText = (translatedText != null && translatedText.trim() !== '') ? translatedText : originalText
      return {
        id,
        type: block.type,
        base_content: { text: finalText },
      }
    })

    // Update manifest: add language if not present
    const existingManifest = (typeof doc.manifest === 'object' && doc.manifest !== null ? doc.manifest : {}) as Record<string, unknown>
    const existingLangManifest = Array.isArray(existingManifest.language_manifest) ? existingManifest.language_manifest as Record<string, unknown>[] : []
    const baseLanguage = typeof existingManifest.base_language === 'string' ? existingManifest.base_language : 'en'

    // Add English entry if language_manifest is empty
    const hasEn = existingLangManifest.some(l => l.code === baseLanguage)
    const newLangManifest = [
      ...(hasEn ? existingLangManifest : [{ code: baseLanguage, label: 'English', direction: 'ltr' }, ...existingLangManifest]),
      ...(existingLangManifest.some(l => l.code === langCode) ? [] : [{ code: langCode, label: langMeta.label, direction: langMeta.direction }]),
    ]

    // Reconstruct with only schema-allowed top-level keys (additionalProperties: false at root)
    // Do not spread ...doc — input may have extra top-level props from other utilities
    const updated: Record<string, unknown> = {
      ud_version: typeof doc.ud_version === 'string' ? doc.ud_version : '1.0.0',
      state: doc.state,
      metadata: doc.metadata,
      manifest: {
        base_language: baseLanguage,
        language_manifest: newLangManifest,
        clarity_layer_manifest: Array.isArray(existingManifest.clarity_layer_manifest)
          ? existingManifest.clarity_layer_manifest
          : [],
        permissions: typeof existingManifest.permissions === 'object' && existingManifest.permissions !== null
          ? existingManifest.permissions
          : {},
      },
      blocks: updatedBlocks,
    }
    if (doc.seal && typeof doc.seal === 'object') {
      const originalSeal = doc.seal as Record<string, unknown>
      const originalChain = Array.isArray(originalSeal.chain_of_custody)
        ? originalSeal.chain_of_custody as Array<Record<string, unknown>>
        : []
      updated.seal = {
        ...originalSeal,
        chain_of_custody: [
          ...originalChain,
          { event: 'edited', actor: `UD Translate`, timestamp: new Date().toISOString(), note: `Translated to ${language}` },
        ],
      }
    }

    if (parseFailed) {
      updated.provenance = {
        ...(typeof doc.provenance === 'object' && doc.provenance !== null ? doc.provenance as Record<string, unknown> : {}),
        translation_failed_at: new Date().toISOString(),
        translation_language: language,
        translation_note: 'Claude returned unparseable response; original text preserved.',
      }
    }

    const baseName = file.name.replace(/\.(uds|udr)$/, '')
    const outputName = `${baseName}-${langCode}.uds`

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
