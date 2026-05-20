import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()

    // Validate minimal payload constraints
    if (!payload.systemTitle || typeof payload.rating !== 'number' || !payload.comments) {
      return NextResponse.json({ error: 'Invalid or incomplete review payload' }, { status: 400 })
    }

    let scratchDir = '/Users/sonnyneo/universal-document-t4/scratch'
    try {
      await fs.mkdir(scratchDir, { recursive: true })
    } catch {
      // Fallback to /tmp in serverless/Vercel environments where the local user directory is write-protected or absent
      scratchDir = '/tmp'
      await fs.mkdir(scratchDir, { recursive: true })
    }

    const filePath = path.join(scratchDir, 'beta_submissions.json')

    let submissions: any[] = []
    try {
      const existing = await fs.readFile(filePath, 'utf-8')
      if (existing.trim()) {
        submissions = JSON.parse(existing)
      }
    } catch (e) {
      // File does not exist yet or is empty/corrupt, start clean
    }

    const newRecord = {
      id: `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      systemTitle: payload.systemTitle,
      completedCount: payload.completedCount ?? 0,
      completedCheckpoints: payload.completedCheckpoints ?? [],
      rating: payload.rating,
      comments: payload.comments,
      screenshotAttached: !!payload.screenshot,
      screenshotBase64: payload.screenshot || null,
      licenseKey: payload.licenseKey || null,
      timestamp: payload.timestamp || new Date().toISOString(),
    }

    submissions.push(newRecord)

    // Log to console so that it is captured in serverless application logs (like Vercel Logs)
    console.log(`[BETA SUBMISSION] ID: ${newRecord.id}, System: ${newRecord.systemTitle}, Rating: ${newRecord.rating}, Comments: ${newRecord.comments}`)

    await fs.writeFile(filePath, JSON.stringify(submissions, null, 2), 'utf-8')

    return NextResponse.json({ success: true, submissionId: newRecord.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
