import { NextRequest, NextResponse } from 'next/server'
import { convertDocx, convertTxt } from '@/lib/convert'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
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

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let doc

    if (ext === 'docx') {
      doc = await convertDocx(buffer, fileName)
    } else {
      const text = buffer.toString('utf-8')
      doc = await convertTxt(text, fileName)
    }

    const outputName = fileName.replace(/\.[^.]+$/, '.uds')
    const json = JSON.stringify(doc, null, 2)

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${outputName}"`,
      },
    })
  } catch (e) {
    console.error('Convert error:', e)
    return NextResponse.json({ error: 'Conversion failed. Check your file and try again.' }, { status: 500 })
  }
}
