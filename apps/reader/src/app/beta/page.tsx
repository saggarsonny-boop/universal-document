'use client'

import GoldenExchange, { Checkpoint } from '@/components/GoldenExchange'

const READER_CHECKPOINTS: Checkpoint[] = [
  // Category 1: Loading & Schema Parsers
  {
    id: 'plain_udr_import',
    category: 'Schema & Parsers',
    label: 'Plain UDR Import',
    description: 'Open a basic editable .udr document containing standard blocks and verify it parses cleanly.',
  },
  {
    id: 'sealed_uds_import',
    category: 'Schema & Parsers',
    label: 'Sealed UDS Import',
    description: 'Load a sealed .uds document and verify that the cryptographic identity pane appears.',
  },
  {
    id: 'invalid_json',
    category: 'Schema & Parsers',
    label: 'Invalid/Malformed JSON',
    description: 'Open a corrupted or malformed text file and verify that the system displays a premium error panel instead of crashing.',
  },
  {
    id: 'unsupported_version',
    category: 'Schema & Parsers',
    label: 'Unsupported Schema Version',
    description: 'Open a document claiming an unsupported version (e.g. v99.0.0) and verify that a dynamic warning banner is rendered.',
  },
  {
    id: 'empty_manifest',
    category: 'Schema & Parsers',
    label: 'Empty Document Manifest',
    description: 'Open a document with a missing manifest/blocks array and confirm it is rejected gracefully.',
  },

  // Category 2: Interactive Controls & Views
  {
    id: 'clarity_layer',
    category: 'Interactive Controls',
    label: 'Clarity Layer Switcher',
    description: 'Toggle between different viewpoints (e.g., summary, clinician, legal) and verify text updates instantly.',
  },
  {
    id: 'multilingual',
    category: 'Interactive Controls',
    label: 'Multilingual Switcher',
    description: 'Toggle between active document languages (e.g. English, Spanish) and verify text direction changes.',
  },
  {
    id: 'expiring_check',
    category: 'Interactive Controls',
    label: 'Expiring Document Check',
    description: 'Load a document with an expiry date in the past and check if the gold warning banner is displayed.',
  },
  {
    id: 'revocation_check',
    category: 'Interactive Controls',
    label: 'Revocation Check',
    description: 'Load a document marked as revoked and confirm access is blocked with a red security panel.',
  },
  {
    id: 'prescription_layout',
    category: 'Interactive Controls',
    label: 'Prescription Viewer Layout',
    description: 'Open a specialized medical prescription document and confirm it switches to the premium pharmacy layout.',
  },

  // Category 3: Cryptographic Integrity & Telemetry
  {
    id: 'provenance_query',
    category: 'Cryptography & Integrity',
    label: 'Provenance Registry Query',
    description: 'Trigger the registry query for a valid document ID and verify it contacts the network API securely.',
  },
  {
    id: 'tamper_detection',
    category: 'Cryptography & Integrity',
    label: 'Tamper Detection (Hash Mismatch)',
    description: 'Manually alter a single character in a sealed document block and verify a red hash mismatch error is shown.',
  },
  {
    id: 'custody_timeline',
    category: 'Cryptography & Integrity',
    label: 'Chain of Custody Timeline',
    description: 'Expand the custody timeline panel and verify the chronological events render with precise UTC timestamps.',
  },
  {
    id: 'bitcoin_anchor',
    category: 'Cryptography & Integrity',
    label: 'Blockchain Anchor Verification',
    description: 'Confirm that Bitcoin anchor proofs (OpenTimestamps) are retrieved and shown on the provenance panel.',
  },
  {
    id: 'permissions_enforce',
    category: 'Cryptography & Integrity',
    label: 'Permissions Enforcement',
    description: 'Set allow_copy: false in a document manifest and verify that text selection is disabled in the UI.',
  },

  // Category 4: UX & Premium Fluid Layouts
  {
    id: 'interactive_tour',
    category: 'UX & Fluid Layouts',
    label: 'Interactive Help Tour',
    description: 'Reset the onboard tutorial from the navigation menu and click through the step-by-step tooltip guide.',
  },
  {
    id: 'explorer_preview',
    category: 'UX & Fluid Layouts',
    label: 'Desktop/Explorer Preview Mock',
    description: 'Inspect the embedded OS finder/explorer preview metadata section at the footer of the document.',
  },
  {
    id: 'environment_links',
    category: 'UX & Fluid Layouts',
    label: 'Environment Links Panel',
    description: 'Click on navigation links at the bottom to verify they map to the correct platform endpoints.',
  },
  {
    id: 'export_offline',
    category: 'UX & Fluid Layouts',
    label: 'Export / Download Offline',
    description: 'Click the "Save as .uds/.udr" buttons and verify the formatted JSON downloads successfully.',
  },
  {
    id: 'responsive_design',
    category: 'UX & Fluid Layouts',
    label: 'Slate Blue & Gold Premium Responsive Test',
    description: 'Resize the browser to a narrow mobile width and verify that layout structures adjust gracefully.',
  },
]

export default function BetaPage() {
  return (
    <div style={pageWrapperStyle}>
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={badgeStyle}>Active Beta Program</span>
          <h1 style={titleStyle}>Pre-Flight Verification Portal</h1>
          <p style={subtitleStyle}>
            ATTORNEY EXCLUSIVE - HELP US VALIDATE UD READER UNDER REAL-WORLD CONDITIONS
          </p>
        </div>
        
        <GoldenExchange
          systemTitle="UD Reader"
          checkpoints={READER_CHECKPOINTS}
          storageKey="ud_reader_beta_checkpoints"
          tokenPrefix="UDREADER"
          submitUrl="/api/beta/submit"
        />
      </div>
    </div>
  )
}

const pageWrapperStyle: React.CSSProperties = {
  background: '#0b131f', // Dark slate blue background
  minHeight: '100vh',
  padding: '4rem 1.5rem 6rem',
}

const containerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
}

const badgeStyle: React.CSSProperties = {
  display: 'inline-block',
  background: 'rgba(200, 150, 10, 0.1)',
  border: '1px solid rgba(200, 150, 10, 0.3)',
  color: '#c8960a',
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  padding: '0.3rem 0.75rem',
  borderRadius: '20px',
  marginBottom: '0.75rem',
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '2.25rem',
  fontWeight: 700,
  color: '#ffffff',
  margin: '0 0 0.5rem 0',
  letterSpacing: '-0.02em',
}

const subtitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.78rem',
  color: '#64748b',
  letterSpacing: '0.05em',
  margin: 0,
}
