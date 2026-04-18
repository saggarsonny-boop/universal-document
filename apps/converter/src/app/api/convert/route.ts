import { NextRequest, NextResponse } from 'next/server'
import { convertDocx, convertTxt } from '@/lib/convert'
import { ensureSchema, validateApiKey, hashIp, getFreeUsage, incrementFreeUsage, logCustody } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export const runtime = 'nodejs'
export const maxDuration = 30

const FREE_DAILY_LIMIT = 5
const MAX_FREE_BYTES = 10 * 1024 * 1024

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchema()

    const apiKey = req.headers.get('x-api-key')
    let proUser: { email: string; prefix: string } | null = null

    if (apiKey) {
      proUser = await validateApiKey(apiKey)
      if (!proUser) {
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
    const allowedTypes = ['docx', 'txt', 'md']

    if (!ext || !allowedTypes.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type .${ext}. Supported: .docx, .txt, .md` },
        { status: 422 }
      )
    }

    if (!proUser) {
      if (file.size > MAX_FREE_BYTES) {
        return NextResponse.json(
          { error: 'File exceeds 10 MB free tier limit. Upgrade to Pro for larger files.', upgrade: true },
          { status: 413 }
        )
      }
      const ipHash = hashIp(getIp(req))
      const usage = await getFreeUsage(ipHash)
      if (usage >= FREE_DAILY_LIMIT) {
        return NextResponse.json(
          { error: `Free tier limit: ${FREE_DAILY_LIMIT} files per day. Upgrade to Pro for unlimited conversions.`, upgrade: true, used: usage, limit: FREE_DAILY_LIMIT },
          { status: 429 }
        )
      }
      await incrementFreeUsage(ipHash)
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let doc

    if (ext === 'docx') {
      doc = await convertDocx(buffer, fileName)
    } else {
      const text = buffer.toString('utf-8')
      doc = await convertTxt(text, fileName)
    }

    if (proUser) {
      const outputId = uuidv4()
      doc.metadata.id = outputId
      await logCustody({ email: proUser.email, apiKeyPrefix: proUser.prefix, fileName, fileSize: file.size, outputId })
    }

    const outputName = fileName.replace(/\.[^.]+$/, '.uds')
    const json = JSON.stringify(doc, null, 2)

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${outputName}"`,
        ...(proUser ? { 'X-Pro': 'true' } : {}),
      },
    })
  } catch (e) {
    console.error('Convert error:', e)
    return NextResponse.json({ error: 'Conversion failed. Check your file and try again.' }, { status: 500 })
  }
}
