'use client'

import { useState } from 'react'

type Badge = {
  label: string
  color: 'gray' | 'green' | 'red' | 'blue' | 'amber' | 'purple'
}

type Block = {
  type: 'heading' | 'paragraph' | 'list' | 'hash' | 'banner'
  text: string
}

type Step = {
  url: string
  title: string
  description: string
  badges: Badge[]
  blocks: Block[]
  borderColor: 'gray' | 'green' | 'red'
  aha?: string
}

type Scenario = {
  id: string
  label: string
  steps: Step[]
}

const BADGE_COLORS: Record<string, string> = {
  gray: '#6b7280',
  green: '#059669',
  red: '#dc2626',
  blue: '#2563eb',
  amber: '#d97706',
  purple: '#7c3aed',
}

const BORDER_COLORS: Record<string, string> = {
  gray: 'rgba(255,255,255,0.1)',
  green: '#059669',
  red: '#dc2626',
}

const SCENARIOS: Scenario[] = [
  {
    id: 'clinical',
    label: 'Clinical Record',
    steps: [
      {
        url: 'creator.hive.baby',
        title: 'Author the discharge summary',
        description: 'Clinician writes a structured discharge summary as a .udr. Each section is a semantic block — heading, paragraph, medication list, follow-up instruction — not positioned glyphs.',
        badges: [{ label: 'UDR — draft', color: 'gray' }],
        blocks: [
          { type: 'heading', text: 'Discharge Summary — Kofi Mensah' },
          { type: 'paragraph', text: 'Admitted 14 Apr 2026. Diagnosis: hypertensive crisis. BP on admission 198/112 mmHg.' },
          { type: 'list', text: 'Amlodipine 10mg od · Lisinopril 5mg od · Follow-up GP in 7 days' },
        ],
        borderColor: 'gray',
      },
      {
        url: 'utilities.hive.baby/translate',
        title: 'Add parallel language stream',
        description: 'Patient speaks Twi. Claude translates block-by-block preserving semantic structure. Two language streams live inside one file. The Reader detects device language and renders automatically.',
        badges: [
          { label: 'UDR — draft', color: 'gray' },
          { label: 'EN + TW', color: 'blue' },
        ],
        blocks: [
          { type: 'heading', text: 'Discharge Summary — Kofi Mensah' },
          { type: 'paragraph', text: '[EN] Admitted 14 Apr 2026. Diagnosis: hypertensive crisis.' },
          { type: 'paragraph', text: '[TW] Wobrɛ wɔ 14 Apr 2026. Nsunsuansoɔ: bogya tumi a ɛboro so...' },
        ],
        borderColor: 'gray',
      },
      {
        url: 'signer.hive.baby',
        title: 'Seal and sign as UDS',
        description: 'Physician seals the document. SHA-256 computed over the entire block tree. Registry record written. The document becomes immutable — a tamper-evident .uds.',
        badges: [
          { label: 'UDS — sealed', color: 'green' },
          { label: 'EN + TW', color: 'blue' },
          { label: 'Registry record', color: 'amber' },
        ],
        blocks: [
          { type: 'heading', text: 'Discharge Summary — Kofi Mensah' },
          { type: 'paragraph', text: 'Amlodipine 10mg od · Lisinopril 5mg od' },
          { type: 'hash', text: 'seal.hash  a3f8c2d1e4b7f09a3c56e8d2f1a4b7c9e2f5a3d1e7b4c9f2a3e6d1b8c5f9a2…91d4' },
        ],
        borderColor: 'green',
      },
      {
        url: 'reader.hive.baby',
        title: 'Patient opens on phone',
        description: 'Reader detects device language. Twi stream rendered automatically. Hash verified against registry — document unchanged since sealing. The insurer, the pharmacist, and the patient all open the same file.',
        badges: [
          { label: 'UDS — sealed', color: 'green' },
          { label: 'EN + TW', color: 'blue' },
          { label: 'Hash verified', color: 'green' },
        ],
        blocks: [
          { type: 'heading', text: 'Discharge Summary — Kofi Mensah' },
          { type: 'paragraph', text: '[TW] Wobrɛ wɔ 14 Apr 2026. Nsunsuansoɔ: bogya tumi a ɛboro so...' },
          { type: 'hash', text: 'seal.hash  a3f8c2…91d4  ✓ verified' },
        ],
        borderColor: 'green',
        aha: 'The insurer, the pharmacist, and the patient all open the same file. Each sees what they need. The document knows who is reading it.',
      },
      {
        url: 'utilities.hive.baby/revoke',
        title: 'Medication updated — revoke original',
        description: 'Amlodipine dose changed. The original .uds is revoked server-side. Every Reader instance that opens it now shows the revocation banner. The error does not persist.',
        badges: [{ label: 'Revoked', color: 'red' }],
        blocks: [
          { type: 'banner', text: 'This document has been revoked. Reason: medication update 22 Apr 2026. See superseding document.' },
          { type: 'heading', text: 'Discharge Summary — Kofi Mensah' },
          { type: 'paragraph', text: 'Amlodipine 10mg od · Lisinopril 5mg od' },
        ],
        borderColor: 'red',
        aha: 'This is what PDF cannot do. The document travels. The correction travels with it. The error does not persist.',
      },
    ],
  },
  {
    id: 'contract',
    label: 'Contract Lifecycle',
    steps: [
      {
        url: 'converter.hive.baby',
        title: 'Convert existing lease to UDR',
        description: 'A Word lease agreement is converted to a structured .udr. Each clause becomes a semantic block — parties, rent, duration, obligations — queryable and diff-able.',
        badges: [{ label: 'UDR — draft', color: 'gray' }],
        blocks: [
          { type: 'heading', text: 'Residential Lease Agreement' },
          { type: 'paragraph', text: 'Landlord: Meridian Properties Ltd · Tenant: James Okafor' },
          { type: 'list', text: 'Rent: £1,450/mo · Term: 12 months · Deposit: £2,900' },
        ],
        borderColor: 'gray',
      },
      {
        url: 'utilities.hive.baby/watermark',
        title: 'Apply draft watermark',
        description: 'Not a visual overlay — a machine-readable status flag embedded in the manifest. Any system reading this document knows it is under negotiation. The flag travels with the file.',
        badges: [
          { label: 'UDR — draft', color: 'gray' },
          { label: 'Under negotiation', color: 'amber' },
        ],
        blocks: [
          { type: 'heading', text: 'Residential Lease Agreement' },
          { type: 'paragraph', text: 'manifest.status: "under_negotiation"' },
          { type: 'paragraph', text: 'Rent: £1,450/mo · Term: 12 months' },
        ],
        borderColor: 'gray',
      },
      {
        url: 'utilities.hive.baby/compare',
        title: 'Landlord returns amended version',
        description: 'Structural diff shows exactly what changed: rent raised to £1,520, break clause added at month 6. Not tracked-changes in a margin — a machine-readable diff of block content.',
        badges: [{ label: 'UDR — amended', color: 'amber' }],
        blocks: [
          { type: 'heading', text: 'Residential Lease Agreement' },
          { type: 'paragraph', text: '− Rent: £1,450/mo' },
          { type: 'paragraph', text: '+ Rent: £1,520/mo  +  Break clause: month 6' },
        ],
        borderColor: 'gray',
      },
      {
        url: 'signer.hive.baby',
        title: 'Both parties sign — UDS sealed',
        description: 'Two signatures embedded in the seal envelope, each with timestamp. SHA-256 computed over the final block tree. Both parties\' commitment cryptographically bound to this exact content.',
        badges: [
          { label: 'UDS — executed', color: 'green' },
          { label: 'Registry record', color: 'amber' },
        ],
        blocks: [
          { type: 'heading', text: 'Residential Lease Agreement' },
          { type: 'paragraph', text: 'Signers: James Okafor · Meridian Properties Ltd' },
          { type: 'hash', text: 'seal.hash  f71a9e3d2c8b5f1a7e4c9d2b6f3a8e1c5d9b2f4a7e3c6d1b8f5a2e9c4d7b1…3bc2' },
        ],
        borderColor: 'green',
      },
      {
        url: 'utilities.hive.baby/notarize',
        title: 'Notarised — jurisdiction recorded',
        description: 'Notarisation recorded as a custody event inside the document. Jurisdiction, notary name, and timestamp are structural metadata — not a scanned PDF of a stamp.',
        badges: [
          { label: 'UDS — notarised', color: 'green' },
          { label: 'Registry record', color: 'amber' },
          { label: 'Notary: IL USA', color: 'blue' },
        ],
        blocks: [
          { type: 'heading', text: 'Residential Lease Agreement' },
          { type: 'paragraph', text: 'custody_events[0]: notarised · Cook County IL · 20 Apr 2026' },
          { type: 'hash', text: 'seal.hash  f71a9e…3bc2  ✓ unchanged' },
        ],
        borderColor: 'green',
      },
      {
        url: 'reader.hive.baby',
        title: 'Dispute — document proves itself',
        description: 'Two years later, the tenant disputes the rent clause. Hash matches registry exactly. Document unchanged since signing. No court filing needed to establish authenticity.',
        badges: [
          { label: 'UDS — executed', color: 'green' },
          { label: 'Hash verified', color: 'green' },
          { label: 'Unchanged since signing', color: 'green' },
        ],
        blocks: [
          { type: 'heading', text: 'Residential Lease Agreement' },
          { type: 'paragraph', text: 'Rent: £1,520/mo · Signed: 2 May 2024' },
          { type: 'hash', text: 'seal.hash  f71a9e…3bc2  ✓ verified  ✓ registry match' },
        ],
        borderColor: 'green',
        aha: 'The document carries its own provenance. No lawyer required to certify authenticity. One file. One truth.',
      },
    ],
  },
  {
    id: 'research',
    label: 'Research Paper',
    steps: [
      {
        url: 'utilities.hive.baby/academic-paper',
        title: 'Author the research paper',
        description: 'Structured .udr — abstract, methodology, results, data tables. The tables are queryable objects, not images. An AI system anywhere can read this paper\'s data directly.',
        badges: [{ label: 'UDR — preprint', color: 'gray' }],
        blocks: [
          { type: 'heading', text: 'Cardiovascular outcomes in hypertensive patients' },
          { type: 'paragraph', text: 'Abstract · Methodology · Results · Data tables [queryable]' },
          { type: 'list', text: 'n=1,240 · Primary endpoint: MACE · Follow-up: 36mo' },
        ],
        borderColor: 'gray',
      },
      {
        url: 'utilities.hive.baby/translate',
        title: 'Four language streams in one file',
        description: 'EN, FR, ES, and ZH parallel streams added block-by-block. Every abstract, every table header exists in all four languages inside one file. No separate PDFs. No translation management system.',
        badges: [
          { label: 'UDR — preprint', color: 'gray' },
          { label: 'EN + FR + ES + ZH', color: 'blue' },
        ],
        blocks: [
          { type: 'heading', text: 'Cardiovascular outcomes in hypertensive patients' },
          { type: 'paragraph', text: '[EN] Methods: Prospective RCT, 36-month follow-up.' },
          { type: 'paragraph', text: '[ZH] 方法：前瞻性随机对照试验，36个月随访。' },
        ],
        borderColor: 'gray',
      },
      {
        url: 'utilities.hive.baby/watermark',
        title: 'Preprint watermark applied',
        description: 'Machine-readable status flag: "not_peer_reviewed". Any journal submission system, any citation manager, any AI reading this document knows its review status without parsing prose.',
        badges: [
          { label: 'UDR — preprint', color: 'gray' },
          { label: 'EN + FR + ES + ZH', color: 'blue' },
          { label: 'Not peer reviewed', color: 'amber' },
        ],
        blocks: [
          { type: 'heading', text: 'Cardiovascular outcomes in hypertensive patients' },
          { type: 'paragraph', text: 'manifest.status: "preprint_not_peer_reviewed"' },
          { type: 'paragraph', text: 'n=1,240 · Primary endpoint: MACE' },
        ],
        borderColor: 'gray',
      },
      {
        url: 'signer.hive.baby',
        title: 'Sealed and Bitcoin-anchored',
        description: 'SHA-256 sealed. OpenTimestamps fires async — Bitcoin block height recorded as cryptographic anchor. The paper\'s existence at this exact moment is now provable from the blockchain.',
        badges: [
          { label: 'UDS — sealed', color: 'green' },
          { label: 'EN + FR + ES + ZH', color: 'blue' },
          { label: 'Bitcoin anchored', color: 'amber' },
        ],
        blocks: [
          { type: 'heading', text: 'Cardiovascular outcomes in hypertensive patients' },
          { type: 'paragraph', text: 'OpenTimestamps: BTC block #894,771 · 18 Apr 2026 09:14 UTC' },
          { type: 'hash', text: 'seal.hash  c29f1a8e3d7b2f5c4a9e6d1b3f8c5a2e7d4b1f9c6a3e8d5b2f7c4a1e6d3b…77e8' },
        ],
        borderColor: 'green',
      },
      {
        url: 'utilities.hive.baby/document-vault',
        title: 'Archived with DOI metadata',
        description: 'DOI, journal metadata, and submission timestamp recorded as custody events. The paper is self-describing — it carries its own publication record. No separate metadata database needed.',
        badges: [
          { label: 'UDS — archived', color: 'green' },
          { label: 'EN + FR + ES + ZH', color: 'blue' },
          { label: 'Bitcoin anchored', color: 'amber' },
          { label: 'DOI registered', color: 'purple' },
        ],
        blocks: [
          { type: 'heading', text: 'Cardiovascular outcomes in hypertensive patients' },
          { type: 'paragraph', text: 'DOI: 10.2139/ssrn.9112847 · Journal of Hypertension' },
          { type: 'paragraph', text: 'custody_events[1]: journal_accepted · 22 Apr 2026' },
        ],
        borderColor: 'green',
        aha: 'An AI system anywhere in the world can query this paper\'s data tables directly. No parser. No reconstruction. The paper is AI-native by construction.',
      },
    ],
  },
]

function BadgePill({ badge }: { badge: Badge }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 9999,
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      fontWeight: 600,
      letterSpacing: '0.04em',
      background: `${BADGE_COLORS[badge.color]}22`,
      color: BADGE_COLORS[badge.color],
      border: `1px solid ${BADGE_COLORS[badge.color]}44`,
    }}>
      {badge.label}
    </span>
  )
}

function DocumentBlock({ block }: { block: Block }) {
  if (block.type === 'banner') {
    return (
      <div style={{
        background: '#dc262615',
        border: '1px solid #dc262640',
        borderRadius: 4,
        padding: '8px 10px',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: '#dc2626',
        lineHeight: 1.5,
      }}>
        {block.text}
      </div>
    )
  }
  if (block.type === 'hash') {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 4,
        padding: '6px 10px',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: '#059669',
        letterSpacing: '0.02em',
        overflowX: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {block.text}
      </div>
    )
  }
  if (block.type === 'heading') {
    return (
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--ud-ink)',
        lineHeight: 1.3,
      }}>
        {block.text}
      </div>
    )
  }
  if (block.type === 'list') {
    return (
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--ud-muted)',
        lineHeight: 1.6,
        paddingLeft: 8,
        borderLeft: '2px solid rgba(255,255,255,0.1)',
      }}>
        {block.text}
      </div>
    )
  }
  return (
    <div style={{
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--ud-muted)',
      lineHeight: 1.55,
    }}>
      {block.text}
    </div>
  )
}

export default function JourneyDemo() {
  const [activeScenario, setActiveScenario] = useState(0)
  const [activeStep, setActiveStep] = useState(0)

  const scenario = SCENARIOS[activeScenario]
  const step = scenario.steps[activeStep]
  const isLast = activeStep === scenario.steps.length - 1

  function goScenario(i: number) {
    setActiveScenario(i)
    setActiveStep(0)
  }

  function goStep(i: number) {
    setActiveStep(i)
  }

  function prev() {
    if (activeStep > 0) setActiveStep(activeStep - 1)
  }

  function next() {
    if (activeStep < scenario.steps.length - 1) setActiveStep(activeStep + 1)
  }

  return (
    <div style={{
      background: 'var(--ud-paper-2)',
      border: '1px solid var(--ud-border)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>

      {/* Scenario tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--ud-border)',
        background: 'rgba(0,0,0,0.2)',
      }}>
        {SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goScenario(i)}
            style={{
              flex: 1,
              padding: '12px 8px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: activeScenario === i ? 'var(--ud-gold)' : 'var(--ud-muted)',
              background: 'transparent',
              border: 'none',
              borderBottom: activeScenario === i ? '2px solid var(--ud-gold)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.15s',
              marginBottom: -1,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 0 }}>

        {/* Main area */}
        <div style={{ padding: '20px 20px 20px 20px', borderRight: '1px solid var(--ud-border)' }}>

          {/* URL */}
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--ud-muted)',
            opacity: 0.5,
            marginBottom: 12,
            letterSpacing: '0.04em',
          }}>
            ↗ {step.url}
          </div>

          {/* Step title */}
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--ud-ink)',
            marginBottom: 8,
            lineHeight: 1.3,
          }}>
            {step.title}
          </div>

          {/* Description */}
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'var(--ud-muted)',
            lineHeight: 1.65,
            marginBottom: 16,
          }}>
            {step.description}
          </div>

          {/* Document card */}
          <div style={{
            border: `1px solid ${BORDER_COLORS[step.borderColor]}`,
            borderRadius: 8,
            padding: '14px 16px',
            background: 'rgba(0,0,0,0.25)',
            transition: 'border-color 0.3s',
          }}>

            {/* Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
              {step.badges.map((b, i) => (
                <BadgePill key={i} badge={b} />
              ))}
            </div>

            {/* Blocks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {step.blocks.map((b, i) => (
                <DocumentBlock key={i} block={b} />
              ))}
            </div>

          </div>

          {/* Aha moment */}
          {isLast && step.aha && (
            <div style={{
              marginTop: 16,
              padding: '12px 16px',
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.25)',
              borderRadius: 8,
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontStyle: 'italic',
              color: 'var(--ud-gold)',
              lineHeight: 1.65,
            }}>
              {step.aha}
            </div>
          )}

          {/* Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 16,
          }}>
            <button
              onClick={prev}
              disabled={activeStep === 0}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: activeStep === 0 ? 'rgba(255,255,255,0.15)' : 'var(--ud-muted)',
                background: 'transparent',
                border: 'none',
                cursor: activeStep === 0 ? 'default' : 'pointer',
                padding: '6px 0',
                transition: 'color 0.15s',
              }}
            >
              ← prev
            </button>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--ud-muted)',
              opacity: 0.4,
            }}>
              {activeStep + 1} / {scenario.steps.length}
            </span>
            <button
              onClick={next}
              disabled={isLast}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: isLast ? 'rgba(255,255,255,0.15)' : 'var(--ud-gold)',
                background: 'transparent',
                border: 'none',
                cursor: isLast ? 'default' : 'pointer',
                padding: '6px 0',
                transition: 'color 0.15s',
              }}
            >
              next →
            </button>
          </div>

        </div>

        {/* Step list */}
        <div style={{ padding: '20px 0' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--ud-muted)',
            opacity: 0.45,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            paddingLeft: 16,
            marginBottom: 10,
          }}>
            Steps
          </div>
          {scenario.steps.map((s, i) => {
            const done = i < activeStep
            const active = i === activeStep
            return (
              <button
                key={i}
                onClick={() => goStep(i)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  width: '100%',
                  padding: '8px 16px',
                  background: active ? 'rgba(212,175,55,0.08)' : 'transparent',
                  border: 'none',
                  borderLeft: active ? '2px solid var(--ud-gold)' : '2px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: done ? '#059669' : active ? 'var(--ud-gold)' : 'rgba(255,255,255,0.2)',
                  marginTop: 1,
                  flexShrink: 0,
                  width: 12,
                }}>
                  {done ? '✓' : (i + 1)}
                </span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  color: active ? 'var(--ud-ink)' : done ? 'var(--ud-muted)' : 'rgba(255,255,255,0.3)',
                  lineHeight: 1.4,
                  transition: 'color 0.15s',
                }}>
                  {s.title}
                </span>
              </button>
            )
          })}
        </div>

      </div>

    </div>
  )
}
