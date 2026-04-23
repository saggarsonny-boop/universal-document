import type { Tier } from './pricing'

type Gate = { tiers: Tier[]; betaFree: boolean }

const FREE: Tier[] = ['free', 'ud_solo', 'ud_pro', 'ud_premium', 'ud_signer_solo', 'ud_signer_business', 'enterprise_starter', 'enterprise_pro', 'enterprise_scale', 'csdk_lite', 'csdk_pro', 'csdk_scale']
const PRO: Tier[]  = ['ud_pro', 'ud_premium', 'enterprise_starter', 'enterprise_pro', 'enterprise_scale', 'csdk_lite', 'csdk_pro', 'csdk_scale']
const ENT: Tier[]  = ['enterprise_starter', 'enterprise_pro', 'enterprise_scale', 'csdk_lite', 'csdk_pro', 'csdk_scale']

export const FEATURE_GATES: Record<string, Gate> = {
  // ── Core Tools (always free) ───────────────────────────────────────────────
  'ud-reader':           { tiers: FREE, betaFree: true },
  'ud-converter':        { tiers: FREE, betaFree: true },
  'ud-creator':          { tiers: FREE, betaFree: true },
  'ud-validator':        { tiers: FREE, betaFree: true },
  'ud-sign':             { tiers: FREE, betaFree: true },

  // ── Document Operations ────────────────────────────────────────────────────
  'merge':               { tiers: FREE, betaFree: true },
  'split':               { tiers: FREE, betaFree: true },
  'compress':            { tiers: FREE, betaFree: true },
  'extract-pages':       { tiers: FREE, betaFree: true },
  'rearrange':           { tiers: FREE, betaFree: true },
  'protect':             { tiers: FREE, betaFree: true },
  'unlock':              { tiers: FREE, betaFree: true },
  'watermark':           { tiers: FREE, betaFree: true },
  'page-numbers':        { tiers: FREE, betaFree: true },
  'optimize':            { tiers: FREE, betaFree: true },
  'ocr':                 { tiers: FREE, betaFree: true }, // free 3/month post-beta
  'compare':             { tiers: FREE, betaFree: true }, // free 3/month post-beta
  'redact':              { tiers: PRO,  betaFree: true },

  // ── UD Format Tools ────────────────────────────────────────────────────────
  'seal':                { tiers: FREE, betaFree: true },
  'chain-of-custody':    { tiers: FREE, betaFree: true },
  'udz-zipper':          { tiers: FREE, betaFree: true },
  'udz-unzipper':        { tiers: FREE, betaFree: true },
  'expire':              { tiers: FREE, betaFree: true },
  'revoke':              { tiers: FREE, betaFree: true },
  'version-history':     { tiers: FREE, betaFree: true },
  'verify':              { tiers: FREE, betaFree: true },
  'metadata-editor':     { tiers: PRO,  betaFree: true },
  'bates-stamp':         { tiers: PRO,  betaFree: true },
  'reformat':            { tiers: FREE, betaFree: true }, // basic profiles free; advanced Pro

  // ── AI-Powered ─────────────────────────────────────────────────────────────
  'translate':           { tiers: FREE, betaFree: true }, // free 1/month post-beta
  'summarise':           { tiers: FREE, betaFree: true }, // free 3/month post-beta
  'accessibility-check': { tiers: FREE, betaFree: true }, // free 3/month post-beta
  'classify':            { tiers: PRO,  betaFree: true },
  'clinical-summary':    { tiers: PRO,  betaFree: true },

  // ── Security & Compliance ──────────────────────────────────────────────────
  'dynamic-watermark':        { tiers: PRO,  betaFree: true },
  'steganographic-watermark': { tiers: PRO,  betaFree: true },

  // ── Archive / Legal ────────────────────────────────────────────────────────
  'udz-legal-bundle':    { tiers: PRO,  betaFree: true },
  'udz-deposition':      { tiers: PRO,  betaFree: true },
  'privilege-log':       { tiers: PRO,  betaFree: true },
  'smart-lease':         { tiers: PRO,  betaFree: true },

  // ── Media ──────────────────────────────────────────────────────────────────
  'audio-embed':         { tiers: PRO,  betaFree: true },
  'video-embed':         { tiers: PRO,  betaFree: true },
  'media-sync':          { tiers: PRO,  betaFree: true },

  // ── Healthcare Suite ───────────────────────────────────────────────────────
  'ud-prescription':     { tiers: PRO,  betaFree: true },
  'ud-consent':          { tiers: PRO,  betaFree: true },
  'ud-medication-list':  { tiers: PRO,  betaFree: true },
  'ud-emr-export':       { tiers: ENT,  betaFree: true },

  // ── Government Suite ───────────────────────────────────────────────────────
  'foi-bundle':          { tiers: PRO,  betaFree: true },
  'policy-publisher':    { tiers: PRO,  betaFree: true },
  'certificate-issuer':  { tiers: PRO,  betaFree: true },
  'regulatory-filing':   { tiers: ENT,  betaFree: true },

  // ── Finance, Research, Education ──────────────────────────────────────────
  'financial-statement': { tiers: PRO,  betaFree: true },
  'audit-trail':         { tiers: PRO,  betaFree: true },
  'pre-registration':    { tiers: FREE, betaFree: true }, // open science: free forever
  'data-package':        { tiers: PRO,  betaFree: true },
  'ud-credential':       { tiers: PRO,  betaFree: true },
  'ud-transcript':       { tiers: PRO,  betaFree: true },
  'ud-title-chain':      { tiers: ENT,  betaFree: true },
  'ud-insurance-policy': { tiers: PRO,  betaFree: true },
  'ud-claims-package':   { tiers: PRO,  betaFree: true },
}

export function getGate(toolId: string): Gate {
  return FEATURE_GATES[toolId] ?? { tiers: FREE, betaFree: true }
}

export function canAccess(toolId: string, userTier: Tier): boolean {
  const gate = getGate(toolId)
  // Beta: betaFree tools are open to all
  if (gate.betaFree) return true
  return gate.tiers.includes(userTier)
}

export function getRequiredTier(toolId: string): Tier {
  const gate = getGate(toolId)
  return gate.tiers[0] ?? 'free'
}

export function isFreeForever(toolId: string): boolean {
  const gate = getGate(toolId)
  return gate.tiers[0] === 'free'
}
