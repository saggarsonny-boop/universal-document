import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, ensureSchema, logCustody } from '@/lib/db'
import { convertDocx, convertTxt } from '@/lib/convert'
import JSZip from 'jszip'
import { v4 as uuidv4 } from 'uuid'

export const runtime = 'nodejs'
export const maxDuration = 60

const ALLOWED = ['docx', 'txt', 'md']
const MAX_FILES = 50

export async function POST(req: NextRequest) {
  try {
    await ensureSchema()

    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required. Include X-API-Key header.' }, { status: 401 })
    }

    const proUser = await validateApiKey(apiKey)
    if (!proUser) {
      return NextResponse.json({ error: 'Invalid or expired API key' }, { status: 403 })
    }

    const formData = await req.formData()
    const zipFile = formData.get('archive') as File | null
    const files = formData.getAll('files') as File[]

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
          } else {
            doc = await convertTxt(buffer.toString('utf-8'), name)
          }
          const outputId = uuidv4()
          doc.metadata.id = outputId
          outputZip.file(name.replace(/\.[^.]+$/, '.uds'), JSON.stringify(doc, null, 2))
          results.push({ file: name, status: 'ok' })
          await logCustody({ email: proUser.email, apiKeyPrefix: proUser.prefix, fileName: name, fileSize: buffer.length, outputId })
        } catch {
          results.push({ file: name, status: 'error', error: 'Conversion failed' })
        }
      })
    )

    const zipBuffer = await outputZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })

    return new NextResponse(zipBuffer, {
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
