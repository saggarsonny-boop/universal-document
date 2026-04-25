import { NextRequest, NextResponse } from 'next/server'
import { convertCsv, convertDocx, convertHtml, convertImage, convertPdf, convertTxt, convertXlsx } from '@/lib/convert'
import { ensureSchema, validateApiKey, hashIp, getFreeUsage, incrementFreeUsage, logCustody } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { isUDUtility, preprocessForUD, UDUtilityId } from '@/lib/preprocess'

export const runtime = 'nodejs'
export const maxDuration = 30

const FREE_DAILY_LIMIT = 5
const MAX_FREE_BYTES = 10 * 1024 * 1024

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
}

export async function POST(req: NextRequest) {
  try {
    // DB is optional — if unavailable, conversion still works without rate limiting
    let dbAvailable = true
    try {
      await ensureSchema()
    } catch (dbErr) {
      console.warn('DB unavailable, proceeding without rate limiting:', dbErr)
      dbAvailable = false
    }

    const apiKey = req.headers.get('x-api-key')
    let proUser: { email: string; prefix: string } | null = null

    if (apiKey && dbAvailable) {
      proUser = await validateApiKey(apiKey).catch(() => null)
      if (proUser === null && apiKey) {
        return NextResponse.json({ error: 'Invalid or expired API key' }, { status: 403 })
      }
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileName = file.name
    const ext = fileName.split('.').pop()?.toLowerCase()
    const allowedTypes = ['pdf', 'docx', 'xlsx', 'txt', 'md', 'csv', 'html', 'png', 'jpg', 'jpeg', 'webp', 'gif']

    if (!ext || !allowedTypes.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type .${ext}. Supported: ${allowedTypes.join(', ')}` },
        { status: 422 }
      )
    }

    const utilityInput = formData.get('utility')?.toString() ?? 'optimize'
    const utility: UDUtilityId = isUDUtility(utilityInput) ? utilityInput : 'optimize'

    if (!proUser && dbAvailable) {
      if (file.size > MAX_FREE_BYTES) {
        return NextResponse.json(
          { error: 'File exceeds 10 MB free tier limit. Upgrade to Pro for larger files.', upgrade: true },
          { status: 413 }
        )
      }
      try {
        const ipHash = hashIp(getIp(req))
        const usage = await getFreeUsage(ipHash)
        if (usage >= FREE_DAILY_LIMIT) {
          return NextResponse.json(
            { error: `Free tier limit: ${FREE_DAILY_LIMIT} files per day. Upgrade to Pro for unlimited conversions.`, upgrade: true, used: usage, limit: FREE_DAILY_LIMIT },
            { status: 429 }
          )
        }
        await incrementFreeUsage(ipHash)
      } catch (usageErr) {
        console.warn('Rate limiting unavailable:', usageErr)
      }
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let doc

    if (ext === 'docx') {
      doc = await convertDocx(buffer, fileName)
    } else if (ext === 'xlsx') {
      doc = await convertXlsx(buffer, fileName)
    } else if (ext === 'html') {
      const rawHtml = buffer.toString('utf-8')
      const pre = preprocessForUD({ fileName, baseText: rawHtml.replace(/<[^>]+>/g, ' '), utility })
      doc = await convertHtml(pre.normalizedText, fileName)
      doc.metadata.tags.push('utility:' + utility)
      doc.metadata.tags.push('html-normalized')
    } else if (ext === 'csv') {
      const pre = preprocessForUD({ fileName, baseText: buffer.toString('utf-8'), utility })
      doc = await convertCsv(pre.normalizedText, fileName)
      doc.metadata.tags.push('utility:' + utility)
      doc.metadata.tags.push('preprocessed')
    } else if (ext === 'pdf') {
      doc = await convertPdf(buffer, fileName)
      const joined = doc.blocks
        .map((block) => String(block.base_content?.text ?? block.base_content?.html ?? ''))
        .filter(Boolean)
        .join('\n')
      const pre = preprocessForUD({ fileName, baseText: joined, utility })
      doc.blocks = await convertTxt(pre.normalizedText, fileName).then((d) => d.blocks)
      doc.metadata.tags.push('utility:' + utility)
      doc.metadata.tags.push('pdf-normalized')
    } else if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
      doc = await convertImage(fileName)
      const pre = preprocessForUD({
        fileName,
        baseText: `Image imported for UD preprocessing. OCR utility: ${utility === 'ocr' ? 'enabled' : 'disabled'}.`,
        utility,
      })
      doc.blocks = await convertTxt(pre.normalizedText, fileName).then((d) => d.blocks)
      doc.metadata.tags.push('utility:' + utility)
      doc.metadata.tags.push('image-normalized')
    } else {
      const text = buffer.toString('utf-8')
      const pre = preprocessForUD({ fileName, baseText: text, utility })
      doc = await convertTxt(pre.normalizedText, fileName)
      doc.metadata.tags.push('utility:' + utility)
      doc.metadata.tags.push('preprocessed')
    }

    if (proUser) {
      const outputId = uuidv4()
      doc.metadata.id = outputId
      logCustody({ email: proUser.email, apiKeyPrefix: proUser.prefix, fileName, fileSize: file.size, outputId }).catch(err =>
        console.warn('Custody log failed:', err)
      )
    }

    const outputName = fileName.replace(/\.[^.]+$/, '.uds')
    const json = JSON.stringify(doc, null, 2)

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${outputName}"`,
        'X-UD-Identity': doc.state === 'UDS' ? 'dark_blue' : 'light_blue',
        ...(proUser ? { 'X-Pro': 'true' } : {}),
      },
    })
  } catch (e) {
    console.error('Convert error:', e)
    return NextResponse.json({ error: 'Conversion failed. Check your file and try again.' }, { status: 500 })
  }
}
