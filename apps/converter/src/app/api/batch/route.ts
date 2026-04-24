import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, ensureSchema, logCustody } from '@/lib/db'
import { convertCsv, convertDocx, convertHtml, convertImage, convertPdf, convertTxt } from '@/lib/convert'
import JSZip from 'jszip'
import { v4 as uuidv4 } from 'uuid'
import { isUDUtility, preprocessForUD, UDUtilityId } from '@/lib/preprocess'

export const runtime = 'nodejs'
export const maxDuration = 60

const ALLOWED = ['pdf', 'docx', 'txt', 'md', 'csv', 'html', 'png', 'jpg', 'jpeg', 'webp', 'gif']
const MAX_FILES = 50

export async function POST(req: NextRequest) {
  try {
    try {
      await ensureSchema()
    } catch (dbErr) {
      console.warn('DB unavailable in batch route:', dbErr)
    }

    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required. Include X-API-Key header.' }, { status: 401 })
    }

    const proUser = await validateApiKey(apiKey).catch(() => null)
    if (!proUser) {
      return NextResponse.json({ error: 'Invalid or expired API key' }, { status: 403 })
    }

    const formData = await req.formData()
    const zipFile = formData.get('archive') as File | null
    const files = formData.getAll('files') as File[]
    const utilityInput = formData.get('utility')?.toString() ?? 'optimize'
    const utility: UDUtilityId = isUDUtility(utilityInput) ? utilityInput : 'optimize'

    let filesToProcess: { name: string; buffer: Buffer }[] = []

    if (zipFile) {
      const zipBuffer = Buffer.from(await zipFile.arrayBuffer())
      const zip = await JSZip.loadAsync(zipBuffer)
      const entries = Object.entries(zip.files).filter(([name, f]) => {
        const ext = name.split('.').pop()?.toLowerCase() ?? ''
        return !f.dir && ALLOWED.includes(ext)
      })
      if (entries.length > MAX_FILES) {
        return NextResponse.json({ error: `ZIP contains more than ${MAX_FILES} supported files` }, { status: 422 })
      }
      filesToProcess = await Promise.all(
        entries.map(async ([name, f]) => ({
          name,
          buffer: Buffer.from(await f.async('arraybuffer')),
        }))
      )
    } else if (files.length > 0) {
      if (files.length > MAX_FILES) {
        return NextResponse.json({ error: `Maximum ${MAX_FILES} files per batch` }, { status: 422 })
      }
      filesToProcess = await Promise.all(
        files.map(async (f) => ({ name: f.name, buffer: Buffer.from(await f.arrayBuffer()) }))
      )
    } else {
      return NextResponse.json({ error: 'Provide archive (zip) or files[] form fields' }, { status: 400 })
    }

    const outputZip = new JSZip()
    const results: { file: string; status: 'ok' | 'error'; error?: string }[] = []

    await Promise.all(
      filesToProcess.map(async ({ name, buffer }) => {
        const ext = name.split('.').pop()?.toLowerCase() ?? ''
        if (!ALLOWED.includes(ext)) {
          results.push({ file: name, status: 'error', error: `Unsupported type .${ext}` })
          return
        }
        try {
          let doc
          if (ext === 'docx') {
            doc = await convertDocx(buffer, name)
          } else if (ext === 'html') {
            const rawHtml = buffer.toString('utf-8')
            const pre = preprocessForUD({ fileName: name, baseText: rawHtml.replace(/<[^>]+>/g, ' '), utility })
            doc = await convertHtml(pre.normalizedText, name)
          } else if (ext === 'csv') {
            const pre = preprocessForUD({ fileName: name, baseText: buffer.toString('utf-8'), utility })
            doc = await convertCsv(pre.normalizedText, name)
          } else if (ext === 'pdf') {
            doc = await convertPdf(buffer, name)
            const joined = doc.blocks
              .map((block) => String(block.base_content?.text ?? block.base_content?.html ?? ''))
              .filter(Boolean)
              .join('\n')
            const pre = preprocessForUD({ fileName: name, baseText: joined, utility })
            doc.blocks = await convertTxt(pre.normalizedText, name).then((d) => d.blocks)
          } else if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
            doc = await convertImage(name)
            const pre = preprocessForUD({ fileName: name, baseText: `Image imported for UD preprocessing.`, utility })
            doc.blocks = await convertTxt(pre.normalizedText, name).then((d) => d.blocks)
          } else {
            const pre = preprocessForUD({ fileName: name, baseText: buffer.toString('utf-8'), utility })
            doc = await convertTxt(pre.normalizedText, name)
          }
          const outputId = uuidv4()
          doc.metadata.id = outputId
          doc.metadata.tags.push('utility:' + utility)
          outputZip.file(name.replace(/\.[^.]+$/, '.uds'), JSON.stringify(doc, null, 2))
          results.push({ file: name, status: 'ok' })
          await logCustody({ email: proUser.email, apiKeyPrefix: proUser.prefix, fileName: name, fileSize: buffer.length, outputId })
        } catch {
          results.push({ file: name, status: 'error', error: 'Conversion failed' })
        }
      })
    )

    const zipBuffer = await outputZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="converted.zip"',
        'X-Batch-Results': JSON.stringify(results),
      },
    })
  } catch (e) {
    console.error('Batch error:', e)
    return NextResponse.json({ error: 'Batch conversion failed' }, { status: 500 })
  }
}
