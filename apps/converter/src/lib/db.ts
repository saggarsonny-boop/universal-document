import { neon } from '@neondatabase/serverless'
import { createHash } from 'crypto'

function getDb() {
  return neon(process.env.DATABASE_URL!)
}

export async function ensureSchema() {
  const sql = getDb()
  await sql`
    CREATE TABLE IF NOT EXISTS converter_subscriptions (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      email TEXT NOT NULL UNIQUE,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS converter_api_keys (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      email TEXT NOT NULL,
      key_prefix TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_used_at TIMESTAMPTZ
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS converter_usage (
      ip_hash TEXT NOT NULL,
      day TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      PRIMARY KEY (ip_hash, day)
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS converter_custody_log (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      email TEXT,
      api_key_prefix TEXT,
      file_name TEXT,
      file_size INTEGER,
      output_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  // UD Converter v2 cost telemetry. Every conversion (orchestrated or
  // legacy) writes one row here so we can monitor average cost-per-
  // conversion against the <$0.001 target. Indexed on timestamp for
  // dashboard queries; cost is NUMERIC so 6-decimal-place precision
  // (sub-thousandths-of-a-cent) survives.
  await sql`
    CREATE TABLE IF NOT EXISTS conversion_costs (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      user_tier TEXT NOT NULL,
      route TEXT NOT NULL,
      input_format TEXT,
      output_format TEXT,
      input_tokens INTEGER DEFAULT 0,
      output_tokens INTEGER DEFAULT 0,
      estimated_cost_usd NUMERIC(10, 6) DEFAULT 0,
      file_name TEXT,
      success BOOLEAN DEFAULT TRUE,
      error_message TEXT
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS conversion_costs_timestamp_idx ON conversion_costs (timestamp DESC)`
}

export function hashIp(ip: string) {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16)
}

export function hashKey(key: string) {
  return createHash('sha256').update(key).digest('hex')
}

export async function getFreeUsage(ipHash: string): Promise<number> {
  const sql = getDb()
  const day = new Date().toISOString().slice(0, 10)
  const rows = await sql`
    SELECT count FROM converter_usage WHERE ip_hash = ${ipHash} AND day = ${day}
  `
  return rows.length > 0 ? Number((rows[0] as { count: number }).count) : 0
}

export async function incrementFreeUsage(ipHash: string): Promise<number> {
  const sql = getDb()
  const day = new Date().toISOString().slice(0, 10)
  const rows = await sql`
    INSERT INTO converter_usage (ip_hash, day, count)
    VALUES (${ipHash}, ${day}, 1)
    ON CONFLICT (ip_hash, day) DO UPDATE SET count = converter_usage.count + 1
    RETURNING count
  `
  return Number((rows[0] as { count: number }).count)
}

export async function getSubscriptionByEmail(email: string) {
  const sql = getDb()
  const rows = await sql`
    SELECT * FROM converter_subscriptions WHERE email = ${email} AND status = 'active'
  `
  return rows[0] ?? null
}

export async function upsertSubscription(params: {
  email: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  status: string
}) {
  const sql = getDb()
  await sql`
    INSERT INTO converter_subscriptions (email, stripe_customer_id, stripe_subscription_id, status)
    VALUES (${params.email}, ${params.stripeCustomerId}, ${params.stripeSubscriptionId}, ${params.status})
    ON CONFLICT (email) DO UPDATE SET
      stripe_customer_id = ${params.stripeCustomerId},
      stripe_subscription_id = ${params.stripeSubscriptionId},
      status = ${params.status},
      updated_at = NOW()
  `
}

export async function updateSubscriptionStatus(subscriptionId: string, status: string) {
  const sql = getDb()
  await sql`
    UPDATE converter_subscriptions SET status = ${status}, updated_at = NOW()
    WHERE stripe_subscription_id = ${subscriptionId}
  `
}

export async function validateApiKey(key: string): Promise<{ email: string; prefix: string } | null> {
  const sql = getDb()
  const keyHash = hashKey(key)
  const rows = await sql`
    SELECT k.email, k.key_prefix FROM converter_api_keys k
    JOIN converter_subscriptions s ON k.email = s.email
    WHERE k.key_hash = ${keyHash} AND s.status = 'active'
  `
  if (!rows.length) return null
  const row = rows[0] as { email: string; key_prefix: string }
  // update last_used_at async
  sql`UPDATE converter_api_keys SET last_used_at = NOW() WHERE key_hash = ${keyHash}`.catch(() => {})
  return { email: row.email, prefix: row.key_prefix }
}

export async function getApiKeyByEmail(email: string) {
  const sql = getDb()
  const rows = await sql`
    SELECT key_prefix, created_at, last_used_at FROM converter_api_keys WHERE email = ${email}
    ORDER BY created_at DESC LIMIT 1
  `
  return rows[0] ?? null
}

export async function createApiKey(email: string, key: string) {
  const sql = getDb()
  const keyHash = hashKey(key)
  const prefix = key.slice(0, 12)
  // delete existing keys for email first
  await sql`DELETE FROM converter_api_keys WHERE email = ${email}`
  await sql`
    INSERT INTO converter_api_keys (email, key_prefix, key_hash)
    VALUES (${email}, ${prefix}, ${keyHash})
  `
}

export async function logCustody(params: {
  email: string
  apiKeyPrefix: string
  fileName: string
  fileSize: number
  outputId: string
}) {
  const sql = getDb()
  await sql`
    INSERT INTO converter_custody_log (email, api_key_prefix, file_name, file_size, output_id)
    VALUES (${params.email}, ${params.apiKeyPrefix}, ${params.fileName}, ${params.fileSize}, ${params.outputId})
  `
}

// UD Converter v2 — append a single conversion's cost telemetry. Called by
// the orchestrator after every conversion, success or failure. Failures
// to write are swallowed (telemetry is fire-and-forget; conversion path
// must not be blocked by a logging hiccup).
export async function logConversionCost(params: {
  userTier: 'free' | 'plus' | 'pro' | 'unknown'
  route: string
  inputFormat?: string
  outputFormat?: string
  inputTokens?: number
  outputTokens?: number
  estimatedCostUsd?: number
  fileName?: string
  success?: boolean
  errorMessage?: string
}): Promise<void> {
  try {
    const sql = getDb()
    await sql`
      INSERT INTO conversion_costs (
        user_tier, route, input_format, output_format,
        input_tokens, output_tokens, estimated_cost_usd,
        file_name, success, error_message
      ) VALUES (
        ${params.userTier},
        ${params.route},
        ${params.inputFormat ?? null},
        ${params.outputFormat ?? null},
        ${params.inputTokens ?? 0},
        ${params.outputTokens ?? 0},
        ${params.estimatedCostUsd ?? 0},
        ${params.fileName ?? null},
        ${params.success ?? true},
        ${params.errorMessage ?? null}
      )
    `
  } catch (err) {
    // Telemetry is non-fatal — never block a conversion on logging.
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[ud-converter-v2] logConversionCost failed:', err)
    }
  }
}
