// Tesseract WASM OCR for png/jpg → text.
//
// PDF-rasterise → Tesseract path is intentionally NOT in this PR — it
// requires pdfjs canvas rendering (node-canvas or @napi-rs/canvas), both
// of which add heavy native binaries. PR D scope.
//
// Tesseract.js downloads its language data on first use; we set
// `langPath` so it caches inside the function's writable /tmp directory.
// Each invocation pays a ~1-2s warm-up; subsequent calls in the same
// container reuse the worker if Vercel keeps it warm.

import type { Converter } from './types'
import { thrownToFailure } from './types'

async function ocrImage(input: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tesseract: any = await import('tesseract.js')
  const result = await Tesseract.recognize(input, 'eng', {
    // Cache the language data inside /tmp so warm containers reuse it.
    cachePath: '/tmp/tesseract-cache',
  })
  return (result.data.text as string).trim()
}

export const imageToText: Converter = async (input, options) => {
  try {
    const text = await ocrImage(input)
    if (text.length === 0) {
      return {
        ok: true,
        buffer: Buffer.from('[OCR returned no text — image may not contain readable text or quality was too low.]', 'utf-8'),
        contentType: 'text/plain',
        warnings: ['OCR completed but extracted no text. Try a higher-resolution scan.'],
      }
    }
    return {
      ok: true,
      buffer: Buffer.from(text, 'utf-8'),
      contentType: 'text/plain',
    }
  } catch (err) {
    return thrownToFailure(err, { code: 'rate_limit_or_resource', recoverable: true })
  }
}
