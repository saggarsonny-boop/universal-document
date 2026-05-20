import fs from 'fs/promises'
import path from 'path'

async function simulateSubmit() {
  const payload = {
    systemTitle: 'UD Reader',
    completedCount: 8,
    completedCheckpoints: ['plain_udr_import', 'sealed_uds_import', 'invalid_json', 'unsupported_version', 'empty_manifest', 'clarity_layer', 'multilingual', 'expiring_check'],
    rating: 9,
    comments: 'The HSL slider styling and fluid rendering are absolutely exceptional! Pre-flight check passes all 20 checkpoints.',
    screenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    licenseKey: 'UDREADER-PRO-365-9F2E-4A8C',
    timestamp: new Date().toISOString()
  }

  const scratchDir = '/Users/sonnyneo/universal-document-t4/scratch'
  const filePath = path.join(scratchDir, 'beta_submissions.json')

  // Create scratch directory if not exists
  await fs.mkdir(scratchDir, { recursive: true })

  let submissions: any[] = []
  try {
    const existing = await fs.readFile(filePath, 'utf-8')
    if (existing.trim()) {
      submissions = JSON.parse(existing)
    }
  } catch (e) {
    // start clean
  }

  const newRecord = {
    id: `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    systemTitle: payload.systemTitle,
    completedCount: payload.completedCount,
    completedCheckpoints: payload.completedCheckpoints,
    rating: payload.rating,
    comments: payload.comments,
    screenshotAttached: !!payload.screenshot,
    screenshotBase64: payload.screenshot,
    licenseKey: payload.licenseKey,
    timestamp: payload.timestamp
  }

  submissions.push(newRecord)
  await fs.writeFile(filePath, JSON.stringify(submissions, null, 2), 'utf-8')
  console.log('SIMULATION SUCCESS: Written mock review to:', filePath)
  console.log('Record details:', { id: newRecord.id, rating: newRecord.rating, comments: newRecord.comments })
}

simulateSubmit().catch(console.error)
