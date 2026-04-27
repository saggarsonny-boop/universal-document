import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret') || req.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, unknown> = {}

  // Tester data from testing station DB
  const dbUrl = process.env.TESTING_STATION_DATABASE_URL
  if (dbUrl) {
    try {
      const sql = neon(dbUrl)
      const testers = await sql`
        SELECT
          id, tester_id, email, name, engine_slug, engine_name,
          email_verified, created_at, credit_earned_usd, credit_granted_usd,
          engines_tested, notes
        FROM hive_testers
        ORDER BY created_at DESC
        LIMIT 500
      `
      const slots = await sql`SELECT slug, name, current_testers, max_testers FROM engine_slots ORDER BY name`
      const feedback = await sql`
        SELECT tester_id, engine_slug, submitted_at, rating
        FROM tester_feedback
        ORDER BY submitted_at DESC
        LIMIT 100
      `
      results.testers = testers
      results.slots = slots
      results.feedback = feedback
    } catch (e) {
      results.testerError = String(e)
    }
  } else {
    results.testerError = 'TESTING_STATION_DATABASE_URL not configured'
  }

  // Vercel Analytics for each property
  const vercelToken = process.env.VERCEL_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID || ''

  const properties = [
    { name: 'ud.hive.baby', projectId: process.env.VERCEL_PROJECT_LANDING || '' },
    { name: 'reader.hive.baby', projectId: process.env.VERCEL_PROJECT_READER || '' },
    { name: 'converter.hive.baby', projectId: process.env.VERCEL_PROJECT_CONVERTER || '' },
    { name: 'creator.hive.baby', projectId: process.env.VERCEL_PROJECT_CREATOR || '' },
    { name: 'validator.hive.baby', projectId: process.env.VERCEL_PROJECT_VALIDATOR || '' },
    { name: 'signer.hive.baby', projectId: process.env.VERCEL_PROJECT_SIGNER || '' },
    { name: 'utilities.hive.baby', projectId: process.env.VERCEL_PROJECT_UTILITIES || '' },
    { name: 'test.hive.baby', projectId: process.env.VERCEL_PROJECT_TESTING || '' },
    { name: 'hivephoto.hive.baby', projectId: process.env.VERCEL_PROJECT_HIVEPHOTO || '' },
  ]

  if (vercelToken) {
    const now = Date.now()
    const dayMs = 86400000
    const analyticsData: Record<string, unknown> = {}

    for (const prop of properties) {
      if (!prop.projectId) continue
      try {
        const params = new URLSearchParams({
          projectId: prop.projectId,
          from: new Date(now - 30 * dayMs).toISOString().split('T')[0],
          to: new Date(now).toISOString().split('T')[0],
          limit: '1000',
        })
        if (teamId) params.set('teamId', teamId)

        const res = await fetch(
          `https://api.vercel.com/v1/web/analytics/events?${params}`,
          { headers: { Authorization: `Bearer ${vercelToken}` }, next: { revalidate: 300 } }
        )
        if (res.ok) {
          analyticsData[prop.name] = await res.json()
        } else {
          analyticsData[prop.name] = { error: `${res.status} ${res.statusText}` }
        }
      } catch (e) {
        analyticsData[prop.name] = { error: String(e) }
      }
    }
    results.analytics = analyticsData
  } else {
    results.analyticsError = 'VERCEL_TOKEN not configured'
  }

  return NextResponse.json(results)
}
