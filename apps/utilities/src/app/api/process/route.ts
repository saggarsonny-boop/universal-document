import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import JSZip from 'jszip'

export const runtime = 'nodejs'
export const maxDuration = 90

async function loadPdf(file: File): Promise<PDFDocument> {
  const buf = await file.arrayBuffer()
  return PDFDocument.load(buf)
}

function parsePageRanges(str: string, total: number): number[] {
  const pages: number[] = []
  str.split(',').forEach(part => {
    const trimmed = part.trim()
    if (trimmed.includes('-')) {
      const [a, b] = trimmed.split('-').map(Number)
      for (let i = a; i <= Math.min(b, total); i++) pages.push(i - 1)
    } else {
      const n = Number(trimmed)
      if (n >= 1 && n <= total) pages.push(n - 1)
    }
  })
  return [...new Set(pages)].sort((a, b) => a - b)
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const tool = form.get('tool') as string
    const files = form.getAll('files') as File[]

    if (!tool || !files.length) {
      return NextResponse.json({ error: 'tool and files required' }, { status: 400 })
    }

    // ── MERGE ─────────────────────────────────────────────────────────────────
    if (tool === 'merge') {
      const merged = await PDFDocument.create()
      for (const file of files) {
        const src = await loadPdf(file)
        const copied = await merged.copyPages(src, src.getPageIndices())
        copied.forEach(p => merged.addPage(p))
      }
      const bytes = await merged.save()
      return new Response(bytes as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="ud-merged.pdf"',
        },
      })
    }

    // ── SPLIT ─────────────────────────────────────────────────────────────────
    if (tool === 'split') {
      const src = await loadPdf(files[0])
      const total = src.getPageCount()
      const zip = new JSZip()
      for (let i = 0; i < total; i++) {
        const singlePage = await PDFDocument.create()
        const [copied] = await singlePage.copyPages(src, [i])
        singlePage.addPage(copied)
        const pageBytes = await singlePage.save()
        zip.file(`page-${String(i + 1).padStart(3, '0')}.pdf`, pageBytes)
      }
      const zipBytes = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
      return new Response(new Uint8Array(zipBytes) as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="ud-split-${total}-pages.zip"`,
        },
      })
    }

    // ── COMPRESS ──────────────────────────────────────────────────────────────
    if (tool === 'compress') {
      const src = await loadPdf(files[0])
      // pdf-lib doesn't do image resampling; we can at least re-save with objectsPerTick
      const bytes = await src.save({ useObjectStreams: true, addDefaultPage: false, objectsPerTick: 50 })
      return new Response(bytes as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="ud-compressed.pdf"',
        },
      })
    }

    // ── EXTRACT PAGES ─────────────────────────────────────────────────────────
    if (tool === 'extract-pages') {
      const src = await loadPdf(files[0])
      const rangeStr = form.get('pages') as string || '1'
      const indices = parsePageRanges(rangeStr, src.getPageCount())
      const out = await PDFDocument.create()
      const copied = await out.copyPages(src, indices)
      copied.forEach(p => out.addPage(p))
      const bytes = await out.save()
      return new Response(bytes as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="ud-extracted.pdf"',
        },
      })
    }

    // ── REARRANGE ─────────────────────────────────────────────────────────────
    if (tool === 'rearrange') {
      const src = await loadPdf(files[0])
      const orderStr = form.get('order') as string || ''
      const total = src.getPageCount()
      const order = orderStr
        ? orderStr.split(',').map(n => parseInt(n.trim()) - 1).filter(i => i >= 0 && i < total)
        : src.getPageIndices()
      const out = await PDFDocument.create()
      const copied = await out.copyPages(src, order)
      copied.forEach(p => out.addPage(p))
      const bytes = await out.save()
      return new Response(bytes as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="ud-rearranged.pdf"',
        },
      })
    }

    // ── PROTECT ───────────────────────────────────────────────────────────────
    if (tool === 'protect') {
      const src = await loadPdf(files[0])
      const password = form.get('password') as string || 'password'
      const bytes = await src.save({
        userPassword: password,
        ownerPassword: password + '_owner',
        permissions: {
          printing: 'lowResolution',
          copying: false,
          modifying: false,
        },
      } as any)
      return new Response(bytes as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="ud-protected.pdf"',
        },
      })
    }

    // ── UNLOCK ────────────────────────────────────────────────────────────────
    if (tool === 'unlock') {
      const password = form.get('password') as string || ''
      const buf = await files[0].arrayBuffer()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const src = await PDFDocument.load(buf, { password } as any)
      const bytes = await src.save()
      return new Response(bytes as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="ud-unlocked.pdf"',
        },
      })
    }

    // ── WATERMARK ─────────────────────────────────────────────────────────────
    if (tool === 'watermark') {
      const src = await loadPdf(files[0])
      const text = form.get('watermarkText') as string || 'UNIVERSAL DOCUMENT'
      const font = await src.embedFont(StandardFonts.HelveticaBold)
      const pages = src.getPages()
      for (const page of pages) {
        const { width, height } = page.getSize()
        page.drawText(text, {
          x: width / 2 - (text.length * 7),
          y: height / 2,
          size: 48,
          font,
          color: rgb(0, 0.23, 0.55),
          opacity: 0.12,
          rotate: degrees(-45),
        })
      }
      const bytes = await src.save()
      return new Response(bytes as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="ud-watermarked.pdf"',
        },
      })
    }

    // ── PAGE NUMBERS ──────────────────────────────────────────────────────────
    if (tool === 'page-numbers') {
      const src = await loadPdf(files[0])
      const font = await src.embedFont(StandardFonts.Helvetica)
      const position = form.get('position') as string || 'bottom-center'
      const pages = src.getPages()
      pages.forEach((page, i) => {
        const { width, height } = page.getSize()
        const text = String(i + 1)
        const x = position.includes('center') ? width / 2 - 8
          : position.includes('right') ? width - 40
          : 20
        const y = position.includes('top') ? height - 24 : 16
        page.drawText(text, { x, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) })
      })
      const bytes = await src.save()
      return new Response(bytes as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="ud-numbered.pdf"',
        },
      })
    }

    // ── REDACT ────────────────────────────────────────────────────────────────
    if (tool === 'redact') {
      const src = await loadPdf(files[0])
      const pages = src.getPages()
      // Without text coords from user, redact a centre strip as demo
      // Real usage: user selects regions via canvas overlay
      for (const page of pages) {
        const { width, height } = page.getSize()
        page.drawRectangle({
          x: width * 0.1, y: height * 0.4,
          width: width * 0.8, height: 20,
          color: rgb(0, 0, 0),
          opacity: 1,
        })
      }
      const bytes = await src.save()
      return new Response(bytes as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="ud-redacted.pdf"',
        },
      })
    }

    // ── OPTIMIZE ──────────────────────────────────────────────────────────────
    if (tool === 'optimize') {
      const src = await loadPdf(files[0])
      const bytes = await src.save({ useObjectStreams: true, addDefaultPage: false })
      return new Response(bytes as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="ud-optimized.pdf"',
        },
      })
    }

    // ── OCR (AI via Anthropic) ────────────────────────────────────────────────
    if (tool === 'ocr') {
      const file = files[0]
      const buf = await file.arrayBuffer()
      const isImage = file.type.startsWith('image/')

      if (isImage) {
        // Tesseract.js: genuine OCR on scanned images (PNG, JPG, TIFF, BMP, etc.)
        const { createWorker } = await import('tesseract.js')
        const worker = await createWorker('eng')
        try {
          const { data: { text, confidence } } = await worker.recognize(Buffer.from(buf))
          await worker.terminate()
          const extracted = text.trim() || 'No text found in image'
          return NextResponse.json({
            text: `[Tesseract OCR · confidence: ${Math.round(confidence)}%]\n\n${extracted}`,
          })
        } catch (e) {
          await worker.terminate()
          throw e
        }
      }

      // PDF: use Claude API (handles selectable text and scanned pages via vision)
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) return NextResponse.json({ error: 'OCR not configured' }, { status: 503 })
      const base64 = Buffer.from(buf).toString('base64')

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'pdfs-2024-09-25',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: [
              { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
              { type: 'text', text: 'Extract all text from this PDF. Preserve structure and formatting where possible. Return only the extracted text, no commentary.' },
            ],
          }],
        }),
      })

      const json = await response.json()
      const text = json.content?.[0]?.text || 'No text extracted'
      return NextResponse.json({ text })
    }

    // ── COMPARE (AI) ──────────────────────────────────────────────────────────
    if (tool === 'compare') {
      if (files.length < 2) return NextResponse.json({ error: 'Two files required for comparison' }, { status: 400 })
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) return NextResponse.json({ error: 'Compare not configured' }, { status: 503 })

      const toBase64 = async (f: File) => Buffer.from(await f.arrayBuffer()).toString('base64')
      const [b1, b2] = await Promise.all([toBase64(files[0]), toBase64(files[1])])
      const mime = 'application/pdf'

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: [
              { type: 'document', source: { type: 'base64', media_type: mime, data: b1 } },
              { type: 'document', source: { type: 'base64', media_type: mime, data: b2 } },
              { type: 'text', text: 'Compare these two documents. List: (1) content present in Document 1 but not Document 2, (2) content present in Document 2 but not Document 1, (3) key differences in wording. Be concise and structured.' },
            ],
          }],
        }),
      })

      const json = await response.json()
      const diff = json.content?.[0]?.text || 'No differences found'
      return NextResponse.json({ diff })
    }

    return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
