'use client'
import { useState, useCallback, useEffect, useRef } from 'react'

const FORMAT_TOOLS = [
  { slug: 'seal',             name: 'UD Seal',              icon: '🔏', desc: 'Convert a draft .udr into a sealed, tamper-evident .uds document.',              free: true  },
  { slug: 'chain-of-custody', name: 'UD Chain of Custody',  icon: '🔗', desc: 'Parse and display the full provenance timeline of any Universal Document™.',      free: true  },
  { slug: 'udz-zipper',       name: 'UDZ Zipper',           icon: '📦', desc: 'Bundle multiple .uds files into a single .udz archive with shared metadata.',      free: true  },
  { slug: 'udz-unzipper',     name: 'UDZ Unzipper',         icon: '📂', desc: 'Extract all .uds files from a .udz bundle with integrity verification.',          free: true  },
]

const AI_TOOLS = [
  { slug: 'translate',           name: 'UD Translate',           icon: '🌐', desc: 'Translate any Universal Document™ into another language. Translation embedded as a parallel language stream.',         badge: 'AI'  as const },
  { slug: 'summarise',           name: 'UD Summarise',           icon: '✦',  desc: 'Generate a plain-language summary embedded as a Clarity Layer in the output .uds file.',                               badge: 'AI'  as const },
  { slug: 'accessibility-check', name: 'UD Accessibility Check', icon: '♿', desc: 'Check any document against WCAG 2.1 and Section 508. Outputs a compliance report and remediated .uds file.',          badge: 'AI'  as const },
  { slug: 'classify',            name: 'UD Classify',            icon: '🏷', desc: 'Claude assigns Public / Internal / Confidential / Restricted classification with reasoning, embedded in metadata.',    badge: 'Pro' as const },
  { slug: 'clinical-summary',   name: 'UD Clinical Summary',   icon: '🏥', desc: 'Two summaries from one clinical document: plain language for patients, structured clinical summary for professionals.', badge: 'Pro' as const },
]

const LIFECYCLE_TOOLS = [
  { slug: 'expire',           name: 'UD Expire',           icon: '⏳', desc: 'Add or update an expiration date on any Universal Document™.',                                         badge: 'FREE' as const },
  { slug: 'revoke',           name: 'UD Revoke',           icon: '🚫', desc: 'Mark a document as revoked. Generates a revocation hash embedded in provenance metadata.',             badge: 'FREE' as const },
  { slug: 'version-history',  name: 'UD Version History',  icon: '📋', desc: 'Parse the full provenance timeline of any UDS file — creation, sealing, translation, revocation.',     badge: 'FREE' as const },
  { slug: 'metadata-editor',  name: 'UD Metadata Editor',  icon: '✏️', desc: 'Edit title, author, classification, audience, jurisdiction, and custom fields in any .uds document.', badge: 'Pro'  as const },
]

const SECURITY_TOOLS = [
  { slug: 'dynamic-watermark', name: 'UD Dynamic Watermark', icon: '💧', desc: 'Embed recipient name, email, and organisation as a persistent watermark in any .uds document.',       badge: 'Pro'  as const },
  { slug: 'steg-watermark',    name: 'UD Steg Watermark',    icon: '🔐', desc: 'Embed a cryptographic ownership mark (SHA-256) invisibly in document metadata.',                     badge: 'Pro'  as const },
  { slug: 'audit-trail',       name: 'UD Audit Trail',       icon: '📜', desc: 'Extract and visualise the complete event timeline from any Universal Document™.',                     badge: 'FREE' as const },
  { slug: 'highlight',         name: 'UD Highlight',         icon: '🖊', desc: 'Embed structural highlights in any document. Tamper-evident and inseparable from the file — unlike PDF annotation layers that can be stripped.', badge: 'Pro' as const },
]

const LEGAL_TOOLS = [
  { slug: 'legal-bundle',      name: 'UD Legal Bundle',      icon: '⚖️', desc: 'Bates-numbered .udz bundle with cover sheet and privilege log. Output: .udz bundle.',               badge: 'Pro'  as const },
  { slug: 'deposition-package',name: 'UD Deposition Package',icon: '📁', desc: 'Package a deposition transcript with exhibits into a .udz bundle with exhibit index.',              badge: 'Pro'  as const },
  { slug: 'privilege-log',     name: 'UD Privilege Log',     icon: '🔒', desc: 'Generate a tamper-evident privilege log .uds with attorney-client, work product, and common interest entries and chain of custody.', badge: 'Pro' as const },
  { slug: 'smart-contract',        name: 'UD Smart Contract',        icon: '📝', desc: 'Create a structured contract .uds with both party details, expiry, auto-renewal clause, and signature placeholders for UD Signer.', badge: 'Pro' as const },
  { slug: 'legal-bundle-verify',  name: 'UD Legal Bundle Verify',  icon: '✔', desc: 'Verify any .udz legal bundle is complete, untampered, and Bates sequence intact. Generates an admissible verification report.', badge: 'Pro' as const },
]

const MEDIA_TOOLS = [
  { slug: 'audio-embed',         name: 'UD Audio Embed',         icon: '🎙', desc: 'Embed an audio file (mp3, wav, m4a) as a base64 media object inside a .uds document.',                                                            badge: 'Pro'     as const },
  { slug: 'video-embed',         name: 'UD Video Embed',         icon: '🎬', desc: 'Embed a video file (mp4, mov, webm) as a base64 media object inside a .uds document. Max 200 MB.',                                                badge: 'Pro'     as const },
  { slug: 'media-sync',          name: 'UD Media Sync',          icon: '⏱', desc: 'AI-generated timestamp sync points align document text with audio or video media.',                                                                badge: 'AI'      as const },
  { slug: 'media-sync-advanced', name: 'UD Media Sync Advanced', icon: '⏱', desc: 'Bidirectional sync between document and media. Chapter markers navigate both directions. Claude auto-generates chapters from document structure.', badge: 'Premium' as const },
]

const HEALTHCARE_TOOLS = [
  { slug: 'prescription',    name: 'UD Prescription',    icon: '💊', desc: 'Structured prescription .uds with 30-day expiry, multilingual streams, and prescriber details.',       badge: 'Pro'  as const },
  { slug: 'consent-manager', name: 'UD Consent Manager', icon: '✍️', desc: 'Consent form .uds tied to procedure date with expiry and multilingual output streams.',                badge: 'Pro'  as const },
  { slug: 'medication-list', name: 'UD Medication List', icon: '📋', desc: 'Structured medication list with per-entry expiry, dose, frequency, and prescriber.',                   badge: 'Pro'  as const },
  { slug: 'emr-export',      name: 'UD EMR Export',      icon: '🏥', desc: 'Convert HL7, FHIR, C-CDA, or CCD health records to .uds with patient + clinical Clarity Layers.',     badge: 'Ent'  as const },
]

const GOVERNMENT_TOOLS = [
  { slug: 'foi-bundle',         name: 'UD FOI Bundle',         icon: '🏛', desc: 'Package FOI response documents into a .udz bundle with completeness statement and redaction log.',  badge: 'Pro' as const },
  { slug: 'policy-publisher',   name: 'UD Policy Publisher',   icon: '📋', desc: 'Publish versioned organisational policies as sealed .uds documents with effective date and review date.', badge: 'Pro' as const },
  { slug: 'certificate-issuer', name: 'UD Certificate Issuer', icon: '🎓', desc: 'Issue verifiable certificates as sealed .uds documents with unique ID, recipient, and optional expiry.', badge: 'Pro' as const },
  { slug: 'regulatory-filing',  name: 'UD Regulatory Filing',  icon: '📁', desc: 'Create sealed compliance filing records with regulator, entity reference, reporting period, and jurisdiction.', badge: 'Pro' as const },
]

const RESEARCH_TOOLS = [
  { slug: 'financial-statement', name: 'UD Financial Statement', icon: '📊', desc: 'Seal financial statements as .uds with entity, period, preparer, and optional CSV data import.',       badge: 'Pro' as const },
  { slug: 'pre-registration',    name: 'UD Pre-registration',    icon: '🔬', desc: 'Timestamp research hypotheses before data collection with FNV-1a integrity hash. Always free.',        badge: 'FREE' as const },
  { slug: 'data-package',        name: 'UD Data Package',        icon: '🗂', desc: 'Bundle research datasets with DOI, licence, authors, and institution into a .udz data package.',        badge: 'Pro' as const },
]

const EDUCATION_TOOLS = [
  { slug: 'credential',  name: 'UD Credential',  icon: '🏅', desc: 'Issue verifiable credentials (licences, certifications) as sealed .uds with optional expiry.',          badge: 'Pro' as const },
  { slug: 'transcript',  name: 'UD Transcript',  icon: '🎓', desc: 'Generate academic transcripts with dynamic course entries, grade, credits, and institution seal.',         badge: 'Pro' as const },
]

const REAL_ESTATE_TOOLS = [
  { slug: 'smart-lease',  name: 'UD Smart Lease',  icon: '🏠', desc: 'Create sealed lease agreements with landlord, tenant, property, rent, and term. Expires on lease end date.', badge: 'Pro' as const },
  { slug: 'title-chain',  name: 'UD Title Chain',  icon: '🏛', desc: 'Generate a .udz title chain archive recording the complete chain of ownership for a property with provenance metadata.', badge: 'Ent' as const },
]

const INSURANCE_TOOLS = [
  { slug: 'insurance-policy', name: 'UD Insurance Policy', icon: '🛡', desc: 'Sealed insurance policy .uds with type, premium, excess, coverage, and automatic expiry on end date.',  badge: 'Pro' as const },
  { slug: 'claims-package',   name: 'UD Claims Package',   icon: '📋', desc: 'Bundle claim form, incident report, and evidence into a .udz with chain-of-custody proof.',           badge: 'Pro' as const },
]

const FORMAT_CONVERSION_TOOLS = [
  { slug: 'reformat',    name: 'UD Reformat',    icon: '⇄',  desc: 'Convert any Universal Document™ between .uds, .udr, and plain JSON. Strip layers or provenance.',          badge: 'FREE' as const },
  { slug: 'bates-stamp', name: 'UD Bates Stamp', icon: '🔢', desc: 'Apply sequential Bates numbers to multiple documents. Output: .udz bundle with live range preview.',        badge: 'FREE' as const },
  { slug: 'verify',      name: 'UD Verify',      icon: '✔',  desc: '8-point document checker: format, expiry, revocation, provenance, integrity, and clarity layers.',          badge: 'FREE' as const },
]

const TRUST_PROOF_TOOLS = [
  { slug: 'proof',        name: 'UD Proof',        icon: '🔏', desc: 'Cryptographic proof of existence. SHA-256 hash + cryptographic timestamp. Free for 3/month.',                badge: 'Free · 3/month' as const },
  { slug: 'time-capsule', name: 'UD Time Capsule', icon: '⏳', desc: 'Seal any message or document with a future unlock date. Letters to children, future self, business plans.', badge: 'Free · 1/month' as const },
  { slug: 'will',         name: 'UD Will',         icon: '📜', desc: 'Create a structured will or advance directive as a tamper-evident .uds with dual audience layers.',        badge: 'Free · 1 basic' as const },
  { slug: 'notarize',     name: 'UD Notarize',     icon: '✍️', desc: 'Self-certify any document cryptographically or prepare it for Remote Online Notarization.',              badge: 'Free · 3/month' as const },
]

const GOVERNANCE_SUITE_TOOLS = [
  { slug: 'contract-intelligence',    name: 'UD Contract Intelligence',    icon: '📋', desc: 'AI extracts key dates, obligations, and risk flags from any contract. Never miss a renewal.',            badge: 'Pro'        as const },
  { slug: 'policy-attestation',       name: 'UD Policy Attestation',       icon: '✔',  desc: 'Tamper-evident employee policy read-and-sign records. GDPR, SOX, ISO 27001 compliant.',                 badge: 'Pro'        as const },
  { slug: 'board-pack',               name: 'UD Board Pack',               icon: '🏛', desc: 'Governed board meeting document packages as .udz. Auto-expiry after meeting. Chain of custody.',         badge: 'Enterprise' as const },
  { slug: 'due-diligence-room',       name: 'UD Due Diligence Room',       icon: '🔍', desc: 'Virtual data room as a governed .udz bundle. Dynamic watermarking, audit trails, auto-expiry.',          badge: 'Enterprise' as const },
  { slug: 'regulatory-change-tracker', name: 'UD Regulatory Change Tracker', icon: '📡', desc: 'Monitor FDA, FCA, NHS documents for changes. Structured diff shows exactly what changed.',           badge: 'Enterprise' as const },
  { slug: 'whistleblower-package',    name: 'UD Whistleblower Package',    icon: '🔒', desc: 'Anonymous secure evidence submission with tamper-evident seal. EU Whistleblowing Directive compliant.',     badge: 'Enterprise' as const },
]

const HEALTHCARE_SUITE_TOOLS = [
  { slug: 'clinical-trial-master-file', name: 'UD Clinical Trial Master File', icon: '🧪', desc: 'ICH E6(R3) GCP compliant Trial Master File as a governed .udz archive. Replaces Veeva Vault for smaller sponsors.', badge: 'Enterprise' as const },
  { slug: 'medical-history',            name: 'UD Medical History',            icon: '🏥', desc: 'Personal medical history as a multilingual .uds with patient, responder, and specialist audience layers.',             badge: 'Free · 1/month' as const },
]

const IDENTITY_TRUST_TOOLS = [
  { slug: 'identity-document', name: 'UD Identity Document', icon: '🪪', desc: 'Self-sovereign verifiable identity record. SHA-256 sealed. No central database. Free for 1/month.',           badge: 'Free · 1/month' as const },
  { slug: 'job-application',   name: 'UD Job Application',   icon: '💼', desc: 'Governed job application package as .udz — CV, cover letter, certificates in one tamper-evident bundle.',     badge: 'Free · 3/month' as const },
  { slug: 'reference-letter',  name: 'UD Reference Letter',  icon: '📝', desc: 'Tamper-evident reference letters. Cannot be altered after issuance. Verify without contacting the referee.',  badge: 'Free · 3/month' as const },
  { slug: 'statement',         name: 'UD Statement',         icon: '📣', desc: 'Formally structured, tamper-evident statements. Cryptographic timestamp proves when the statement was made.',    badge: 'Free · 3/month' as const },
  { slug: 'consent-form',      name: 'UD Consent Form',      icon: '✅', desc: 'GDPR-compliant consent forms: photo, model release, data processing, research participation.',                badge: 'Free · 5/month' as const },
]

const FINANCE_COMMERCE_TOOLS = [
  { slug: 'receipt',                  name: 'UD Receipt',                  icon: '🧾', desc: 'Any purchase receipt or invoice converted to tamper-evident .uds. Cannot be altered after sealing.',          badge: 'Free' as const },
  { slug: 'event-ticket',             name: 'UD Event Ticket',             icon: '🎟', desc: 'Tamper-evident event tickets as .uds files. Unique hash per ticket. Validate at the door via UD Validator.', badge: 'Free · 5/month' as const },
  { slug: 'insurance-claim-consumer', name: 'UD Insurance Claim',          icon: '🛡', desc: 'Consumer insurance claim documentation tool. Photos, receipts, incident details as tamper-evident .udz.',    badge: 'Free · 3/month' as const },
  { slug: 'debt-acknowledgment',      name: 'UD Debt Acknowledgment',      icon: '🤝', desc: 'Tamper-evident debt acknowledgment between two parties. The IOU that actually holds up in court.',           badge: 'Free · 3/month' as const },
  { slug: 'freelance-agreement',      name: 'UD Freelance Agreement',      icon: '💻', desc: 'Governed freelance contracts with scope, payment, IP ownership. Expiry on project end.',                     badge: 'Free · 3/month' as const },
  { slug: 'proposal',                 name: 'UD Proposal',                 icon: '📊', desc: 'Sales proposals as .uds with executive, detailed, and pricing audience layers.',                              badge: 'Free · 3/month' as const },
]

const CIVIC_COMMUNITY_TOOLS = [
  { slug: 'petition', name: 'UD Petition', icon: '✊', desc: 'Tamper-evident petitions. Text sealed on first signature — mathematical proof it was never changed.', badge: 'Free Forever' as const },
]

const DYNAMIC_DOCUMENTS_TOOLS = [
  { slug: 'living-document', name: 'UD Living Document', icon: '📖', desc: 'A .udr that evolves with full version history, change attribution, and tamper-evident state at every version.', badge: 'Free · 3/month' as const },
]

const REAL_ESTATE_TOOLS_NEW = [
  { slug: 'rental-agreement', name: 'UD Rental Agreement', icon: '🏠', desc: 'Short-term rental agreements for holiday lets and room rentals. Expiry on checkout. Guest and host layers.',   badge: 'Free · 1/month' as const },
  { slug: 'tenancy-deposit',  name: 'UD Tenancy Deposit',  icon: '🔑', desc: 'Document rental property condition at check-in and check-out. Prevents deposit disputes with sealed evidence.', badge: 'Free · 1/month' as const },
]

const RESEARCH_TOOLS_NEW = [
  { slug: 'academic-paper',   name: 'UD Academic Paper',   icon: '📚', desc: 'Convert academic papers or preprints to .uds with citations as queryable data and figures as first-class content.', badge: 'Free' as const },
  { slug: 'grant-application', name: 'UD Grant Application', icon: '🏆', desc: 'Tamper-evident grant applications with submission timestamp proving on-time delivery.',                          badge: 'Free' as const },
]

const LEGAL_SUITE_NEW = [
  { slug: 'sports-contract',  name: 'UD Sports Contract',  icon: '⚽', desc: 'Tamper-evident sports contracts, player transfers, and agent agreements with FIFA/UEFA compliance metadata.',     badge: 'Pro' as const },
  { slug: 'signing-workflow', name: 'UD Signing Workflow',  icon: '✍️', desc: 'Multi-party signing workflows. Sequential or parallel. Chain of custody on every signature.',                    badge: 'Pro' as const },
  { slug: 'contract-lifecycle', name: 'UD Contract Lifecycle', icon: '🔄', desc: 'End-to-end CLM: create, negotiate, sign, store, and monitor renewals in one governed pipeline.',              badge: 'Enterprise' as const },
]

const GOVERNANCE_SUITE_NEW = [
  { slug: 'safety-report',    name: 'UD Safety Report',    icon: '⚠️', desc: 'Tamper-evident safety incident reports. Sealed at time of writing. Cannot be backdated. Legally defensible.',    badge: 'Free' as const },
  { slug: 'esg-report',       name: 'UD ESG Report',       icon: '🌱', desc: 'Tamper-evident ESG reports and carbon credit certificates. Cryptographic provenance record prevents greenwashing.',        badge: 'Pro' as const },
  { slug: 'training-record',  name: 'UD Training Record',  icon: '🎓', desc: 'Tamper-evident training completion certificates. Cannot be backdated. Enterprise bulk issuance.',                badge: 'Free' as const },
  { slug: 'document-vault',   name: 'UD Document Vault',   icon: '🏦', desc: 'Organisation-level governed document storage with audit trails, expiry alerts, and department access controls.',  badge: 'Enterprise' as const },
  { slug: 'capture',          name: 'UD Capture',          icon: '📥', desc: 'Bulk document ingestion pipeline. Claude classifies and converts each document to governed .uds automatically.',  badge: 'Enterprise' as const },
]

const TRUST_PROOF_NEW = [
  { slug: 'separation-agreement', name: 'UD Separation Agreement', icon: '⚖️', desc: 'Structured separation agreement as tamper-evident .uds. Neither party can claim terms were different.', badge: 'Free · 1 basic' as const },
  { slug: 'power-of-attorney',    name: 'UD Power of Attorney',    icon: '🖊', desc: 'Structured POA draft as .uds — General, Lasting, Financial, or Medical. Starting point for legal review.', badge: 'Free · 1 basic' as const },
]

const AI_POWERED_NEW = [
  { slug: 'document-intelligence', name: 'UD Document Intelligence', icon: '🤖', desc: 'AI-powered analysis of any document. Ask questions, extract obligations, risks, dates, and anomalies.', badge: 'Free · 3/month' as const },
]

const DOC_OPS_NEW = [
  { slug: 'pdf-editor', name: 'UD PDF Editor', icon: '✏️', color: 'var(--ud-ink)', free: true, anim: 'pdf-editor', animLabel: 'click to edit', proLabel: undefined as string | undefined, desc: 'In-browser PDF text editing. Click to edit text, add form fields, annotate. Output as PDF or .uds.' },
]

/* Per-tool mini-animation: CSS keyframe name + rendered SVG/emoji sequence */
const TOOLS = [
  {
    slug: 'merge',    name: 'UD Merge',          icon: '⊕',   color: 'var(--ud-ink)',   free: true,
    anim: 'merge',    animLabel: '2 docs → 1',
    desc: 'Combine multiple PDFs or Universal Documents™ into one.',
  },
  {
    slug: 'split',    name: 'UD Split',           icon: '⊘',   color: 'var(--ud-ink)',   free: true,
    anim: 'split',    animLabel: '1 doc → pages',
    desc: 'Split a PDF or Universal Document™ into separate pages or ranges.',
  },
  {
    slug: 'compress', name: 'UD Compress',        icon: '⊛',   color: 'var(--ud-ink)',   free: true,
    anim: 'compress', animLabel: '10 MB → 2 MB',
    desc: 'Reduce PDF or Universal Document™ file size without losing quality.',
  },
  {
    slug: 'extract-pages', name: 'UD Extract Pages', icon: '⊡', color: 'var(--ud-ink)', free: true,
    anim: 'extract',  animLabel: 'pick pages',
    desc: 'Pull specific pages out of any PDF or Universal Document™.',
  },
  {
    slug: 'rearrange', name: 'UD Rearrange',      icon: '⇅',   color: 'var(--ud-ink)',   free: true,
    anim: 'rearrange', animLabel: 'drag to reorder',
    desc: 'Drag and drop to reorder pages in any document visually.',
  },
  {
    slug: 'protect',  name: 'UD Protect',         icon: '⊠',   color: 'var(--ud-ink)',   free: true,
    anim: 'protect',  animLabel: 'add password',
    desc: 'Add password protection to any PDF or Universal Document™.',
  },
  {
    slug: 'unlock',   name: 'UD Unlock',          icon: '⊟',   color: 'var(--ud-ink)',   free: true,
    anim: 'unlock',   animLabel: 'remove password',
    desc: 'Remove password from a PDF or Universal Document™ you own.',
  },
  {
    slug: 'ocr',      name: 'UD OCR',             icon: '⊜',   color: 'var(--ud-teal)',  free: false, proLabel: 'AI',
    anim: 'ocr',      animLabel: 'scan → text',
    desc: 'Extract text from scanned PDFs, images, or Universal Documents™ using AI.',
  },
  {
    slug: 'watermark', name: 'UD Watermark',      icon: '⊙',   color: 'var(--ud-teal)',  free: true,
    anim: 'watermark', animLabel: 'stamp document',
    desc: 'Add text or UD-certified watermarks to any document.',
  },
  {
    slug: 'page-numbers', name: 'UD Page Numbers', icon: '#',  color: 'var(--ud-ink)',   free: true,
    anim: 'pagenums', animLabel: 'add numbering',
    desc: 'Add customisable page numbers to any PDF or Universal Document™.',
  },
  {
    slug: 'compare',  name: 'UD Compare',         icon: '⊷',   color: 'var(--ud-teal)',  free: false, proLabel: 'AI',
    anim: 'compare',  animLabel: 'A vs B → diff',
    desc: 'Side-by-side diff of two documents. Upload original and revised.',
  },
  {
    slug: 'redact',   name: 'UD Redact & Highlight', icon: '▬', color: 'var(--ud-ink)',  free: false, proLabel: 'Pro',
    anim: 'redact',   animLabel: 'black out text',
    desc: 'Permanently redact sensitive text or highlight key regions in any document.',
  },
  {
    slug: 'optimize', name: 'UD Optimize',        icon: '⊕',   color: 'var(--ud-ink)',   free: true,
    anim: 'optimize', animLabel: 'tune structure',
    desc: 'Optimise PDF or Universal Document™ structure for web, print, or archiving.',
  },
]

const ALL_TOOLS_FLAT: { slug: string; name: string }[] = [
  ...FORMAT_TOOLS.map(({slug,name})=>({slug,name})),
  ...AI_TOOLS.map(({slug,name})=>({slug,name})),
  ...LIFECYCLE_TOOLS.map(({slug,name})=>({slug,name})),
  ...TOOLS.map(({slug,name})=>({slug,name})),
  ...SECURITY_TOOLS.map(({slug,name})=>({slug,name})),
  ...LEGAL_TOOLS.map(({slug,name})=>({slug,name})),
  ...MEDIA_TOOLS.map(({slug,name})=>({slug,name})),
  ...HEALTHCARE_TOOLS.map(({slug,name})=>({slug,name})),
  ...GOVERNMENT_TOOLS.map(({slug,name})=>({slug,name})),
  ...RESEARCH_TOOLS.map(({slug,name})=>({slug,name})),
  ...EDUCATION_TOOLS.map(({slug,name})=>({slug,name})),
  ...REAL_ESTATE_TOOLS.map(({slug,name})=>({slug,name})),
  ...INSURANCE_TOOLS.map(({slug,name})=>({slug,name})),
  ...FORMAT_CONVERSION_TOOLS.map(({slug,name})=>({slug,name})),
  ...TRUST_PROOF_TOOLS.map(({slug,name})=>({slug,name})),
  ...GOVERNANCE_SUITE_TOOLS.map(({slug,name})=>({slug,name})),
  ...HEALTHCARE_SUITE_TOOLS.map(({slug,name})=>({slug,name})),
  ...IDENTITY_TRUST_TOOLS.map(({slug,name})=>({slug,name})),
  ...FINANCE_COMMERCE_TOOLS.map(({slug,name})=>({slug,name})),
  ...CIVIC_COMMUNITY_TOOLS.map(({slug,name})=>({slug,name})),
  ...DYNAMIC_DOCUMENTS_TOOLS.map(({slug,name})=>({slug,name})),
  ...REAL_ESTATE_TOOLS_NEW.map(({slug,name})=>({slug,name})),
  ...RESEARCH_TOOLS_NEW.map(({slug,name})=>({slug,name})),
  ...LEGAL_SUITE_NEW.map(({slug,name})=>({slug,name})),
  ...GOVERNANCE_SUITE_NEW.map(({slug,name})=>({slug,name})),
  ...TRUST_PROOF_NEW.map(({slug,name})=>({slug,name})),
  ...AI_POWERED_NEW.map(({slug,name})=>({slug,name})),
  ...DOC_OPS_NEW.map(({slug,name})=>({slug,name})),
]

const FREE_NAV = [
  {slug:'seal',name:'UD Seal'},{slug:'chain-of-custody',name:'UD Chain of Custody'},
  {slug:'udz-zipper',name:'UDZ Zipper'},{slug:'udz-unzipper',name:'UDZ Unzipper'},
  {slug:'expire',name:'UD Expire'},{slug:'revoke',name:'UD Revoke'},
  {slug:'version-history',name:'UD Version History'},{slug:'audit-trail',name:'UD Audit Trail'},
  {slug:'merge',name:'UD Merge'},{slug:'split',name:'UD Split'},
  {slug:'compress',name:'UD Compress'},{slug:'extract-pages',name:'UD Extract Pages'},
  {slug:'rearrange',name:'UD Rearrange'},{slug:'protect',name:'UD Protect'},
  {slug:'unlock',name:'UD Unlock'},{slug:'watermark',name:'UD Watermark'},
  {slug:'page-numbers',name:'UD Page Numbers'},{slug:'optimize',name:'UD Optimize'},
  {slug:'pre-registration',name:'UD Pre-registration'},
  {slug:'reformat',name:'UD Reformat'},{slug:'bates-stamp',name:'UD Bates Stamp'},{slug:'verify',name:'UD Verify'},
  {slug:'proof',name:'UD Proof'},{slug:'time-capsule',name:'UD Time Capsule'},
  {slug:'will',name:'UD Will'},{slug:'notarize',name:'UD Notarize'},
  {slug:'receipt',name:'UD Receipt'},{slug:'petition',name:'UD Petition'},
  {slug:'medical-history',name:'UD Medical History'},
  {slug:'identity-document',name:'UD Identity Document'},
  {slug:'academic-paper',name:'UD Academic Paper'},{slug:'grant-application',name:'UD Grant Application'},
  {slug:'debt-acknowledgment',name:'UD Debt Acknowledgment'},
  {slug:'freelance-agreement',name:'UD Freelance Agreement'},
  {slug:'consent-form',name:'UD Consent Form'},{slug:'event-ticket',name:'UD Event Ticket'},
  {slug:'safety-report',name:'UD Safety Report'},{slug:'training-record',name:'UD Training Record'},
  {slug:'living-document',name:'UD Living Document'},{slug:'pdf-editor',name:'UD PDF Editor'},
  {slug:'accessibility-check',name:'UD Accessibility Check'},{slug:'classify',name:'UD Classify'},
  {slug:'summarise',name:'UD Summarise'},{slug:'translate',name:'UD Translate'},
  {slug:'audio-embed',name:'UD Audio Embed'},{slug:'media-sync',name:'UD Media Sync'},
  {slug:'video-embed',name:'UD Video Embed'},{slug:'dynamic-watermark',name:'UD Dynamic Watermark'},
  {slug:'highlight',name:'UD Highlight'},{slug:'ocr',name:'UD OCR'},
  {slug:'compare',name:'UD Compare'},{slug:'redact',name:'UD Redact & Highlight'},
  {slug:'metadata-editor',name:'UD Metadata Editor'},{slug:'power-of-attorney',name:'UD Power of Attorney'},
  {slug:'separation-agreement',name:'UD Separation Agreement'},{slug:'rental-agreement',name:'UD Rental Agreement'},
  {slug:'tenancy-deposit',name:'UD Tenancy Deposit'},
]

const SPECIALIST_CATS = [
  {cat:'Healthcare',       slugs:['clinical-summary','prescription','consent-manager','medication-list','emr-export','clinical-trial-master-file']},
  {cat:'Legal',            slugs:['legal-bundle','deposition-package','privilege-log','smart-contract','legal-bundle-verify','contract-intelligence']},
  {cat:'Governance',       slugs:['policy-attestation','board-pack','due-diligence-room','regulatory-change-tracker','whistleblower-package','document-vault','esg-report']},
  {cat:'Trust & Proof',    slugs:['proof','time-capsule','will','notarize']},
  {cat:'Government',       slugs:['foi-bundle','policy-publisher','certificate-issuer','regulatory-filing']},
  {cat:'Finance',          slugs:['financial-statement']},
  {cat:'Research',         slugs:['data-package']},
  {cat:'Education',        slugs:['credential','transcript']},
  {cat:'Real Estate',      slugs:['smart-lease','title-chain']},
  {cat:'Insurance',        slugs:['insurance-policy','claims-package','insurance-claim-consumer']},
  {cat:'Identity & Trust', slugs:['identity-document','job-application','reference-letter','statement','consent-form']},
  {cat:'Finance & Commerce', slugs:['receipt','event-ticket','debt-acknowledgment','freelance-agreement','proposal','sports-contract']},
  {cat:'Civic',            slugs:['petition']},
  {cat:'Dynamic Docs',     slugs:['living-document']},
  {cat:'Signing & CLM',    slugs:['signing-workflow','contract-lifecycle','document-intelligence']},
  {cat:'AI',               slugs:['document-intelligence','capture']},
  {cat:'Security',         slugs:['steg-watermark','dynamic-watermark','highlight']},
  {cat:'Media',            slugs:['media-sync-advanced','audio-embed','video-embed']},
]

function ToolAnim({ slug }: { slug: string }) {
  const s: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }
  const doc = (label?: string) => (
    <div style={{ width: 22, height: 28, background: 'var(--ud-paper-3)', border: '1px solid var(--ud-border)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>
      {label || 'pdf'}
    </div>
  )
  const arrow = <span style={{ fontSize: 13, color: 'var(--ud-muted)' }}>→</span>

  const anims: Record<string, React.ReactNode> = {
    merge: (
      <div style={s}>
        {doc()} {doc()} {doc()} {arrow}
        <div style={{ width: 26, height: 32, background: 'var(--ud-ink)', borderRadius: 3, animation: 'ud-rise 1.2s ease infinite alternate', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontFamily: 'var(--font-mono)' }}>1</div>
      </div>
    ),
    split: (
      <div style={s}>
        {doc('big')} {arrow}
        <div style={{ display: 'flex', gap: 3 }}>
          {[1,2,3].map(n => <div key={n} style={{ width: 16, height: 22, background: 'var(--ud-ink)', borderRadius: 2, animation: `ud-rise ${0.8 + n*0.15}s ease infinite alternate`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#fff', fontFamily: 'var(--font-mono)' }}>{n}</div>)}
        </div>
      </div>
    ),
    compress: (
      <div style={s}>
        <div style={{ width: 28, height: 36, background: 'var(--ud-paper-3)', border: '1px solid var(--ud-border)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>10M</div>
        {arrow}
        <div style={{ width: 18, height: 22, background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 3, animation: 'ud-bounce 1.4s ease-in-out infinite', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontFamily: 'var(--font-mono)', color: 'var(--ud-teal)' }}>2M</div>
      </div>
    ),
    extract: (
      <div style={s}>
        {doc()} {arrow}
        <div style={{ display: 'flex', gap: 3 }}>
          {['p2','p5'].map(p => <div key={p} style={{ width: 18, height: 24, background: 'var(--ud-gold-3)', border: '1px solid var(--ud-gold)', borderRadius: 2, animation: 'ud-rise 1s ease infinite alternate', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontFamily: 'var(--font-mono)', color: 'var(--ud-gold)' }}>{p}</div>)}
        </div>
      </div>
    ),
    rearrange: (
      <div style={s}>
        {[1,2,3].map(n => <div key={n} style={{ width: 16, height: 22, background: n === 2 ? 'var(--ud-gold-3)' : 'var(--ud-paper-3)', border: `1px solid ${n===2 ? 'var(--ud-gold)' : 'var(--ud-border)'}`, borderRadius: 2, animation: n === 2 ? 'ud-bounce 1.2s ease-in-out infinite' : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontFamily: 'var(--font-mono)', color: n===2?'var(--ud-gold)':'var(--ud-muted)' }}>{n}</div>)}
      </div>
    ),
    protect: (
      <div style={s}>
        {doc()} {arrow}
        <div style={{ fontSize: 18, animation: 'ud-bounce 1.5s ease-in-out infinite' }}>🔒</div>
      </div>
    ),
    unlock: (
      <div style={s}>
        <div style={{ fontSize: 18 }}>🔒</div> {arrow}
        <div style={{ fontSize: 18, animation: 'ud-rise 1.2s ease infinite alternate' }}>🔓</div>
      </div>
    ),
    ocr: (
      <div style={s}>
        <div style={{ width: 28, height: 28, background: 'var(--ud-paper-3)', border: '1px solid var(--ud-border)', borderRadius: 3, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🖼</div>
        {arrow}
        <div style={{ fontSize: 13, color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', animation: 'ud-rise 1.2s ease infinite alternate' }}>abc</div>
      </div>
    ),
    watermark: (
      <div style={s}>
        {doc()} {arrow}
        <div style={{ position: 'relative', width: 28, height: 34 }}>
          <div style={{ width: 28, height: 34, background: 'var(--ud-paper-3)', border: '1px solid var(--ud-border)', borderRadius: 3 }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: 'rgba(10,122,106,0.4)', fontFamily: 'var(--font-mono)', transform: 'rotate(-20deg)', fontWeight: 700, animation: 'ud-rise 1.2s ease infinite alternate' }}>UD</div>
        </div>
      </div>
    ),
    pagenums: (
      <div style={s}>
        {doc()} {arrow}
        <div style={{ width: 28, height: 34, background: 'var(--ud-paper-3)', border: '1px solid var(--ud-border)', borderRadius: 3, position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: 2, right: 0, left: 0, textAlign: 'center', fontSize: 7, fontFamily: 'var(--font-mono)', color: 'var(--ud-ink)', fontWeight: 700, animation: 'ud-rise 1.2s ease infinite alternate' }}>1</div>
        </div>
      </div>
    ),
    compare: (
      <div style={s}>
        <div style={{ width: 18, height: 24, background: 'var(--ud-paper-3)', border: '1px solid var(--ud-border)', borderRadius: 2 }} />
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--ud-muted)' }}>VS</span>
        <div style={{ width: 18, height: 24, background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 2, animation: 'ud-bounce 1.4s ease-in-out infinite' }} />
        {arrow}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {['+','–','+'].map((c,i) => <div key={i} style={{ height: 4, width: 20, borderRadius: 2, background: c==='+' ? 'var(--ud-teal)' : 'var(--ud-danger)', opacity: 0.7 }}/>)}
        </div>
      </div>
    ),
    redact: (
      <div style={s}>
        {doc()} {arrow}
        <div style={{ width: 28, height: 34, background: 'var(--ud-paper-3)', border: '1px solid var(--ud-border)', borderRadius: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3, padding: '4px 3px' }}>
          <div style={{ height: 4, borderRadius: 2, background: 'var(--ud-ink)', animation: 'ud-rise 1s ease infinite alternate' }} />
          <div style={{ height: 4, borderRadius: 2, background: 'var(--ud-ink)' }} />
          <div style={{ height: 4, width: '60%', borderRadius: 2, background: 'var(--ud-paper-3)', border: '1px solid var(--ud-border)' }} />
        </div>
      </div>
    ),
    optimize: (
      <div style={s}>
        {doc()} {arrow}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, animation: 'ud-rise 1.2s ease infinite alternate' }}>
          {[100,60,80].map((w,i) => <div key={i} style={{ height: 3, width: w*0.22, background: 'var(--ud-teal)', borderRadius: 2 }}/>)}
        </div>
      </div>
    ),
  }

  return <>{anims[slug] ?? null}</>
}

export default function UtilitiesHub() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [freeOpen, setFreeOpen] = useState(false)
  const [specialistOpen, setSpecialistOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMsg, setSearchMsg] = useState('')
  const [highlightSlug, setHighlightSlug] = useState<string | null>(null)
  const freeRef = useRef<HTMLDivElement>(null)
  const specRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (freeRef.current && !freeRef.current.contains(e.target as Node)) setFreeOpen(false)
      if (specRef.current && !specRef.current.contains(e.target as Node)) setSpecialistOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!highlightSlug) return
    const el = document.querySelector(`a[href="/${highlightSlug}"]`) as HTMLElement | null
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.style.outline = '2.5px solid var(--ud-gold)'
    el.style.background = 'var(--ud-gold-3)'
    const t = setTimeout(() => { el.style.outline = ''; el.style.background = ''; setHighlightSlug(null) }, 2500)
    return () => clearTimeout(t)
  }, [highlightSlug])

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim().toLowerCase()
    if (!q) return
    const match = ALL_TOOLS_FLAT.find(t =>
      t.name.toLowerCase().includes(q) || t.slug.replace(/-/g, ' ').includes(q)
    )
    if (match) {
      setHighlightSlug(match.slug)
      setSearchQuery('')
    } else {
      try {
        await fetch('https://support.hive.baby/api/inbound', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: 'Utilities feedback', body: searchQuery, source: 'utilities.hive.baby' }),
        })
      } catch {}
      setSearchMsg("Thanks — we'll look into that.")
      setSearchQuery('')
      setTimeout(() => setSearchMsg(''), 4000)
    }
  }, [searchQuery])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>

      {/* ── Nav bar: dropdowns + search ─────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>

        {/* Free Tools dropdown */}
        <div ref={freeRef} style={{ position: 'relative' }}>
          <button onClick={() => { setFreeOpen(o => !o); setSpecialistOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: freeOpen ? 'var(--ud-teal-2)' : '#fff', border: `1px solid ${freeOpen ? 'var(--ud-teal)' : 'var(--ud-border)'}`, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ud-teal)', cursor: 'pointer' }}>
            Free Tools <span style={{ fontSize: 9, marginLeft: 2 }}>{freeOpen ? '▲' : '▼'}</span>
          </button>
          {freeOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 200, minWidth: 230, maxHeight: 420, overflowY: 'auto', padding: '6px 0' }}>
              {FREE_NAV.map(t => (
                <a key={t.slug} href={`/${t.slug}`} style={{ display: 'block', padding: '7px 16px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-ink)', textDecoration: 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-teal-2)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '' }}
                >{t.name}</a>
              ))}
            </div>
          )}
        </div>

        {/* Specialist Tools dropdown */}
        <div ref={specRef} style={{ position: 'relative' }}>
          <button onClick={() => { setSpecialistOpen(o => !o); setFreeOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: specialistOpen ? 'var(--ud-gold-3)' : '#fff', border: `1px solid ${specialistOpen ? 'var(--ud-gold)' : 'var(--ud-border)'}`, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ud-gold)', cursor: 'pointer' }}>
            Specialist Tools <span style={{ fontSize: 9, marginLeft: 2 }}>{specialistOpen ? '▲' : '▼'}</span>
          </button>
          {specialistOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 200, minWidth: 260, maxHeight: 500, overflowY: 'auto', padding: '8px 0' }}>
              {SPECIALIST_CATS.map(({cat, slugs}) => (
                <div key={cat}>
                  <div style={{ padding: '6px 16px 4px', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{cat}</div>
                  {slugs.map(slug => {
                    const tool = ALL_TOOLS_FLAT.find(t => t.slug === slug)
                    return tool ? (
                      <a key={slug} href={`/${slug}`} style={{ display: 'block', padding: '6px 16px 6px 24px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-ink)', textDecoration: 'none' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-gold-3)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '' }}
                      >{tool.name}</a>
                    ) : null
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search / ask box */}
        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: 8, minWidth: 220 }}>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tools or ask anything..."
            style={{ flex: 1, padding: '8px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-ink)', background: '#fff', outline: 'none' }}
          />
          <button type="submit" style={{ padding: '8px 16px', background: 'var(--ud-ink)', color: '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>→</button>
        </form>
      </div>

      {searchMsg && (
        <div style={{ marginBottom: 20, padding: '10px 16px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius)', fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-teal)' }}>{searchMsg}</div>
      )}

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <span className="ud-badge ud-badge-default" style={{ marginBottom: 20, display: 'inline-block' }}>
          Universal Document™ Ecosystem
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', lineHeight: 1.1, marginBottom: 20 }}>
          UD Utilities
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--ud-muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Everything you need for every document operation. Free at the base tier.
        </p>
      </div>

      {/* ── Core Tools ──────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Core Tools</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Open · Convert · Create · Verify · Sign</span>
        </div>
        <div id="core-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[
            { label: 'UD Reader',    href: 'https://reader.hive.baby',    icon: '📖', desc: 'Open and read any Universal Document™ file.' },
            { label: 'UD Converter', href: 'https://converter.hive.baby', icon: '⇄',  desc: 'Convert PDFs, DOCX, and more to UDS format.' },
            { label: 'UD Creator',   href: 'https://creator.hive.baby',   icon: '✦',  desc: 'Author a new Universal Document™ from scratch.' },
            { label: 'UD Validator', href: 'https://validator.hive.baby', icon: '✔',  desc: 'Verify a UDS file is authentic and spec-compliant.' },
            { label: 'UD Sign',      href: 'https://signer.hive.baby',    icon: '✍',  desc: 'Cryptographically sign any Universal Document™.' },
            { label: 'UD iSDK',      href: 'https://ud.hive.baby/isdk',   icon: '⌥',  desc: 'Integrate Universal Document™ into your app.' },
          ].map(card => (
            <a key={card.href} href={card.href} style={{
              display: 'block', background: '#fff',
              border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)',
              padding: '18px 20px', textDecoration: 'none',
              transition: 'border-color 0.2s, background 0.2s', cursor: 'pointer',
              boxShadow: 'var(--ud-shadow)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-gold-3)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-gold)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 34, height: 34, background: 'var(--ud-gold-3)', border: '1px solid var(--ud-gold)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                  {card.icon}
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)' }}>{card.label}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5, margin: 0 }}>{card.desc}</p>
            </a>
          ))}
        </div>
      </div>

      {/* ── UD Format Tools ─────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>UD Format Tools</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Seal · Bundle · Chain of Custody</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {FORMAT_TOOLS.map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-teal-2)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-teal)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge ud-badge-success">FREE</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── AI-Powered ───────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>AI-Powered</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Translate · Summarise · Classify · Clinical</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[...AI_TOOLS, ...AI_POWERED_NEW].map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-teal-2)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-teal)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: tool.badge === 'Pro' ? 'var(--ud-gold)' : 'var(--ud-teal)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge" style={{ background: tool.badge === 'Pro' ? 'var(--ud-gold-3)' : 'var(--ud-teal-2)', color: tool.badge === 'Pro' ? 'var(--ud-gold)' : 'var(--ud-teal)' }}>{tool.badge} · Beta</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Lifecycle & Governance ───────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Lifecycle &amp; Governance</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Expire · Revoke · Version History · Metadata Editor</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {LIFECYCLE_TOOLS.map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'box-shadow 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-paper-2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge" style={{ background: tool.badge === 'Pro' ? 'var(--ud-gold-3)' : 'var(--ud-teal-2)', color: tool.badge === 'Pro' ? 'var(--ud-gold)' : 'var(--ud-teal)' }}>{tool.badge}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Document Operations ─────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Document Operations</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Merge · Split · Compress · OCR · Protect · Watermark</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {[...TOOLS, ...DOC_OPS_NEW].map(tool => (
          <a
            key={tool.slug}
            href={`/${tool.slug}`}
            onMouseEnter={() => setHovered(tool.slug)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'block',
              background: hovered === tool.slug ? 'var(--ud-teal-2)' : '#fff',
              border: `1px solid ${hovered === tool.slug ? 'var(--ud-teal)' : 'var(--ud-border)'}`,
              borderRadius: 'var(--ud-radius-lg)',
              padding: 22,
              transition: 'border-color 0.2s, background 0.2s',
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--ud-shadow)',
            }}
          >
            {/* Top row: icon + badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, background: tool.color || 'var(--ud-ink)',
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, color: '#fff', fontWeight: 700, flexShrink: 0,
              }}>
                {tool.icon}
              </div>
              {tool.free ? (
                <span className="ud-badge ud-badge-success">FREE</span>
              ) : (
                <span className="ud-badge" style={{ background: tool.proLabel === 'AI' ? 'var(--ud-teal-2)' : 'var(--ud-gold-3)', color: tool.proLabel === 'AI' ? 'var(--ud-teal)' : 'var(--ud-gold)' }}>{tool.proLabel}</span>
              )}
            </div>

            {/* Name + desc */}
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>
              {tool.name}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>
              {tool.desc}
            </div>

            {/* Mini animation — always visible, subtle */}
            <ToolAnim slug={tool.slug} />
          </a>
        ))}
      </div>
      </div>

      {/* ── Security & Integrity ────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Security &amp; Integrity</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Watermark · Ownership · Audit Trail</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {SECURITY_TOOLS.map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-teal-2)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-teal)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge" style={{ background: tool.badge === 'FREE' ? 'var(--ud-teal-2)' : 'var(--ud-gold-3)', color: tool.badge === 'FREE' ? 'var(--ud-teal)' : 'var(--ud-gold)' }}>{tool.badge}{tool.badge !== 'FREE' ? ' · Beta' : ''}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Legal ───────────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Legal</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Bates numbering · Deposition · Privilege Log · Smart Contract · Bundle Verify</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[...LEGAL_TOOLS, ...LEGAL_SUITE_NEW].map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-teal-2)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-teal)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge" style={{ background: 'var(--ud-gold-3)', color: 'var(--ud-gold-text)' }}>Pro · Beta</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Media ───────────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Media</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Audio · Video · Sync · Chapter Markers</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {MEDIA_TOOLS.map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-teal-2)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-teal)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge" style={{ background: tool.badge === 'AI' ? 'var(--ud-teal-2)' : tool.badge === 'Premium' ? 'rgba(124,58,237,0.1)' : 'var(--ud-gold-3)', color: tool.badge === 'AI' ? 'var(--ud-teal)' : tool.badge === 'Premium' ? '#7c3aed' : 'var(--ud-gold)' }}>{tool.badge} · Beta</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Healthcare ──────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Healthcare</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Prescription · Consent · Medication · EMR</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {HEALTHCARE_TOOLS.map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-teal-2)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-teal)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge" style={{ background: 'var(--ud-gold-3)', color: 'var(--ud-gold-text)' }}>{tool.badge} · Beta</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Government ──────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Government &amp; Public Sector</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>FOI · Policy · Regulatory</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {GOVERNMENT_TOOLS.map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-teal-2)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-teal)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge" style={{ background: 'var(--ud-gold-3)', color: 'var(--ud-gold-text)' }}>Pro · Beta</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Research & Science ──────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Research &amp; Science</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Financial Statements · Pre-registration · Data Packages</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[...RESEARCH_TOOLS, ...RESEARCH_TOOLS_NEW].map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-teal-2)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-teal)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge" style={{ background: 'var(--ud-teal-2)', color: 'var(--ud-teal)' }}>{(tool as {badge?: string}).badge || tool.badge}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Education ───────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Education</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Credentials · Transcripts</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {EDUCATION_TOOLS.map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-teal-2)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-teal)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge" style={{ background: 'var(--ud-gold-3)', color: 'var(--ud-gold-text)' }}>Pro · Beta</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Real Estate ─────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Real Estate</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Leases · Title Chain</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[...REAL_ESTATE_TOOLS, ...REAL_ESTATE_TOOLS_NEW].map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-teal-2)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-teal)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge" style={{ background: 'var(--ud-teal-2)', color: 'var(--ud-teal)' }}>{(tool as {badge?: string}).badge || 'Free'}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Insurance ───────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Insurance</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Policies · Claims · Chain-of-custody</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {INSURANCE_TOOLS.map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-teal-2)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-teal)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge" style={{ background: 'var(--ud-gold-3)', color: 'var(--ud-gold-text)' }}>Pro · Beta</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Trust & Proof ───────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Trust &amp; Proof</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Proof · Time Capsule · Will · Notarize</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[...TRUST_PROOF_TOOLS, ...TRUST_PROOF_NEW].map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-teal-2)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-teal)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge" style={{ background: 'var(--ud-teal-2)', color: 'var(--ud-teal)' }}>{tool.badge}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Governance Suite ─────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Governance Suite</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Contract Intelligence · Attestation · Board Pack · Due Diligence · Whistleblower</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[...GOVERNANCE_SUITE_TOOLS, ...GOVERNANCE_SUITE_NEW].map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-gold-3)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-gold)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                {tool.badge === 'Pro'
                  ? <span className="ud-badge" style={{ background: 'var(--ud-gold-3)', color: 'var(--ud-gold-text)' }}>Pro · Beta</span>
                  : <span className="ud-badge" style={{ background: '#1e2d3d', color: '#fff' }}>Enterprise · Beta</span>}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Healthcare Suite ─────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Healthcare Suite</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Clinical Trial Master File</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {HEALTHCARE_SUITE_TOOLS.map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-gold-3)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-gold)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge" style={{ background: '#1e2d3d', color: '#fff' }}>Enterprise · Beta</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Identity & Trust ─────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Identity &amp; Trust</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Identity · Job Application · Reference · Statement · Consent</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {IDENTITY_TRUST_TOOLS.map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-gold-3)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-gold)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge" style={{ background: 'var(--ud-teal-2)', color: 'var(--ud-teal)' }}>{tool.badge}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Finance & Commerce ───────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Finance &amp; Commerce</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Receipt · Ticket · Claim · Debt · Freelance · Proposal</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {FINANCE_COMMERCE_TOOLS.map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-gold-3)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-gold)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge" style={{ background: 'var(--ud-teal-2)', color: 'var(--ud-teal)' }}>{tool.badge}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Civic & Community ────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Civic &amp; Community</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Petition · Public Records</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {CIVIC_COMMUNITY_TOOLS.map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-gold-3)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-gold)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge" style={{ background: 'var(--ud-teal-2)', color: 'var(--ud-teal)' }}>{tool.badge}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Dynamic Documents ────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Dynamic Documents</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Living Document · Version History</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {DYNAMIC_DOCUMENTS_TOOLS.map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-gold-3)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-gold)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge" style={{ background: 'var(--ud-teal-2)', color: 'var(--ud-teal)' }}>{tool.badge}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Format Conversion ───────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)' }}>Format Conversion &amp; Verification</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>Reformat · Bates Stamp · Verify</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {FORMAT_CONVERSION_TOOLS.map(tool => (
            <a key={tool.slug} href={`/${tool.slug}`} style={{ display: 'block', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: 22, textDecoration: 'none', cursor: 'pointer', boxShadow: 'var(--ud-shadow)', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ud-teal-2)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-teal)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ud-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--ud-ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <span className="ud-badge ud-badge-success">FREE</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* SEO comparison section */}
      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Utilities differs from iLovePDF, Smallpdf, and Adobe Acrobat Online</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Online document tools typically do format conversion. UD Utilities go further: AI-powered analysis, legal and medical specialisations, cryptographic integrity, and tools that embed intelligence into the document structure itself.</p>
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { title: 'iLovePDF / Smallpdf — format utilities only', body: 'These tools handle PDF merge, split, compress, and convert. They are excellent at what they do but limited to format manipulation. There are no AI tools, no legal bundle assemblers, no medical form generators, no cryptographic signing, and no structured document output.' },
            { title: 'Adobe Acrobat Online — PDF-ecosystem tools', body: 'Adobe\'s online tools are polished but locked to the PDF ecosystem. Every operation produces a PDF. There is no structured document output, no AI summarisation, no research pre-registration, and no way to embed media or provenance metadata in a machine-readable format.' },
            { title: 'UD Utilities — AI-powered document intelligence', body: '30+ tools use Claude AI for tasks that require understanding: summarise a document, classify its type, translate it, check accessibility, generate a media sync timeline, or extract clinical data. The output is enriched structured data, not just a reformatted file.' },
            { title: 'UD Utilities — specialised tools for real workflows', body: 'Legal bundle assembler, privilege log generator, deposition package, medical prescription form, consent manager, medication list, research pre-registration — these are not generic document tools. They are built for specific professional workflows that generic utilities cannot address.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '15px', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* UD Ecosystem bar */}
      <div style={{
        marginTop: 64, padding: '24px',
        background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)',
        borderRadius: 'var(--ud-radius-lg)', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 4 }}>Part of the Universal Document™ ecosystem</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)' }}>Convert → Read → Edit → Utilities → back to UDS</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href="https://converter.hive.baby" className="ud-btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>Converter</a>
          <a href="https://ud.hive.baby" className="ud-btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>UD Hub →</a>
        </div>
      </div>
    </div>
  )
}
