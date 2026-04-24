export interface TourStep {
  label: string
  text: string
}

const BETA: TourStep = {
  label: 'Beta access',
  text: 'All Pro features are free during beta. No account required.',
}

const PROVENANCE: TourStep = {
  label: 'Tamper-evident output',
  text: 'Output is a tamper-evident .uds or .udz file with embedded provenance metadata.',
}

const CLAUDE: TourStep = {
  label: 'Powered by Claude AI',
  text: 'Analysis is powered by Claude. Results are embedded directly in your .uds output file.',
}

export const tourSteps: Record<string, TourStep[]> = {

  // ── Format / lifecycle ──────────────────────────────────────────────────────

  'seal': [
    { label: 'Upload zone', text: 'Drop your .udr (revisable) file here. Sealing converts it into a tamper-evident .uds document.' },
    { label: 'Seal button', text: 'Click Seal to lock the document. Once sealed, the content is cryptographically fixed.' },
    BETA,
  ],
  'chain-of-custody': [
    { label: 'Upload zone', text: 'Drop any .uds file here to parse its full provenance timeline.' },
    { label: 'Timeline view', text: 'Every event — creation, sealing, translation, revocation — is shown in chronological order.' },
    BETA,
  ],
  'udz-zipper': [
    { label: 'File selection', text: 'Select multiple .uds files to bundle together. Each file is individually verified before bundling.' },
    { label: 'Bundle metadata', text: 'Add a bundle title and shared tags that apply to the entire .udz archive.' },
    { label: 'Generate button', text: 'Click to create the .udz bundle. All files and their provenance are preserved inside.' },
    BETA,
  ],
  'udz-unzipper': [
    { label: 'Upload zone', text: 'Drop a .udz bundle here to extract the individual .uds files inside.' },
    { label: 'Integrity check', text: 'Each extracted file is verified against the bundle manifest. Any tampering is flagged.' },
    BETA,
  ],
  'expire': [
    { label: 'Upload zone', text: 'Drop your .uds file here. Expiry is embedded in the document metadata.' },
    { label: 'Expiry date field', text: 'Set the date after which this document should be considered expired. UD Reader will warn on open.' },
    { label: 'Update button', text: 'Click to write the expiry into the document and download the updated .uds file.' },
    BETA,
  ],
  'revoke': [
    { label: 'Upload zone', text: 'Drop the .uds document you want to revoke. Revocation is permanent and embedded in the file.' },
    { label: 'Reason field', text: 'Provide a reason for revocation — this is recorded in the provenance chain.' },
    { label: 'Revoke button', text: 'Generates a revocation hash and downloads the updated document with revoked status.' },
    BETA,
  ],
  'version-history': [
    { label: 'Upload zone', text: 'Drop any .uds file to see its full version timeline — creation, edits, sealing, and revocation.' },
    { label: 'Timeline', text: 'Events are shown with timestamps and actor information extracted from the provenance block.' },
    BETA,
  ],
  'audit-trail': [
    { label: 'Upload zone', text: 'Drop a .uds document here to extract its complete event log.' },
    { label: 'Event list', text: 'Every recorded action is shown — sealed_at, translated_at, revoked_at, and custom events.' },
    BETA,
  ],
  'reformat': [
    { label: 'Upload zone', text: 'Drop a .uds or .udr file to reformat or convert its structure.' },
    { label: 'Output format', text: 'Choose to strip layers, convert between UDR and UDS, or export as plain JSON.' },
    { label: 'Convert button', text: 'Click to apply the reformat. The output downloads immediately.' },
    BETA,
  ],
  'verify': [
    { label: 'Upload zone', text: 'Drop any .uds file here for an 8-point integrity check.' },
    { label: 'Verification report', text: 'Format, expiry, revocation, provenance, signature, integrity, schema, and clarity layers are all checked.' },
    BETA,
  ],
  'metadata-editor': [
    { label: 'Upload zone', text: 'Drop a .uds document to edit its metadata fields.' },
    { label: 'Editable fields', text: 'Change title, author, classification, audience, jurisdiction, and any custom metadata key.' },
    { label: 'Save button', text: 'Downloads the updated .uds with your changes embedded in the metadata block.' },
    BETA,
  ],

  // ── PDF-style utilities ─────────────────────────────────────────────────────

  'merge': [
    { label: 'Upload zone', text: 'Drop two or more .uds files here. They will be merged into a single document in order.' },
    { label: 'Merge button', text: 'Click to merge. Provenance from each source document is preserved in the output.' },
    BETA,
  ],
  'split': [
    { label: 'Upload zone', text: 'Drop a .uds file here to split it into separate documents by section or heading.' },
    { label: 'Split options', text: 'Choose to split at headings, at a specific block number, or into equal parts.' },
    { label: 'Split button', text: 'Click to split. Each section downloads as its own .uds file.' },
    BETA,
  ],
  'compress': [
    { label: 'Upload zone', text: 'Drop your .uds file here to compress it. Removes redundant whitespace and metadata.' },
    { label: 'Compress button', text: 'Click to compress. Your file downloads instantly.' },
    BETA,
  ],
  'extract-pages': [
    { label: 'Upload zone', text: 'Drop a .uds document here to extract specific sections.' },
    { label: 'Section selector', text: 'Choose which sections or block ranges to extract.' },
    { label: 'Extract button', text: 'Click to extract. Downloads as a new .uds file.' },
    BETA,
  ],
  'rearrange': [
    { label: 'Upload zone', text: 'Drop a .uds file here to rearrange its sections.' },
    { label: 'Section order', text: 'Drag sections into the order you want, or use the up/down controls.' },
    { label: 'Save button', text: 'Click to download the rearranged .uds document.' },
    BETA,
  ],
  'protect': [
    { label: 'Upload zone', text: 'Drop a .uds file here to restrict copy, print, or export permissions.' },
    { label: 'Permissions', text: 'Toggle allow_copy, allow_print, and allow_export to set document-level access controls.' },
    { label: 'Protect button', text: 'Downloads the protected .uds file with your permissions embedded.' },
    BETA,
  ],
  'unlock': [
    { label: 'Upload zone', text: 'Drop a protected .uds file here to remove permission restrictions.' },
    { label: 'Unlock button', text: 'Click to unlock. All copy, print, and export restrictions are removed from the metadata.' },
    BETA,
  ],
  'watermark': [
    { label: 'Upload zone', text: 'Drop a .uds file to add a visible watermark label to every section.' },
    { label: 'Watermark text', text: 'Enter the watermark text — e.g. "DRAFT", "CONFIDENTIAL", or a recipient name.' },
    { label: 'Apply button', text: 'Downloads the watermarked .uds with the label embedded in document metadata.' },
    BETA,
  ],
  'page-numbers': [
    { label: 'Upload zone', text: 'Drop a .uds file to add sequential page numbers to its sections.' },
    { label: 'Numbering options', text: 'Choose start number and format. Numbers are added to each block\'s metadata.' },
    { label: 'Apply button', text: 'Click to apply page numbers and download the updated file.' },
    BETA,
  ],
  'optimize': [
    { label: 'Upload zone', text: 'Drop a .uds file here to normalise and optimise its structure.' },
    { label: 'Optimize button', text: 'Removes duplicate blocks, normalises whitespace, and re-indexes block IDs. Downloads instantly.' },
    BETA,
  ],
  'highlight': [
    { label: 'Upload zone', text: 'Drop a .uds document to add structural highlights embedded in the file.' },
    { label: 'Highlight selection', text: 'Select text spans to highlight. Unlike PDF annotations, these cannot be stripped from the file.' },
    { label: 'Save button', text: 'Downloads the annotated .uds with highlights embedded in block metadata.' },
    BETA,
  ],
  'redact': [
    { label: 'Upload zone', text: 'Drop a .uds document to redact sensitive content.' },
    { label: 'Redaction targets', text: 'Mark spans for redaction. Redacted content is replaced with a hash placeholder — not just hidden.' },
    { label: 'Redact button', text: 'Downloads the redacted .uds. Original content is non-recoverable.' },
    BETA,
  ],

  // ── AI tools ────────────────────────────────────────────────────────────────

  'translate': [
    { label: 'Upload zone', text: 'Drop your .uds document here. Translation works on the full document text, preserving structure.' },
    { label: 'Target language', text: 'Select the language to translate into. Multiple language streams can be embedded in one file.' },
    { label: 'Translate button', text: 'Click to translate. Results are embedded as a parallel language stream in the output .uds.' },
    CLAUDE,
  ],
  'summarise': [
    { label: 'Upload zone', text: 'Drop your .uds file here. Claude will summarise the full document in plain language.' },
    { label: 'Summary style', text: 'Choose executive summary, bullet points, or plain-language overview.' },
    { label: 'Summarise button', text: 'Click to generate. The summary is embedded as a Clarity Layer in the output .uds file.' },
    CLAUDE,
  ],
  'accessibility-check': [
    { label: 'Upload zone', text: 'Drop a .uds document to check accessibility against WCAG 2.1 and Section 508.' },
    { label: 'Check options', text: 'Select which standards to check against. Both WCAG 2.1 and Section 508 are checked by default.' },
    { label: 'Check button', text: 'Claude analyses the document structure and outputs a compliance report and remediated .uds.' },
    CLAUDE,
  ],
  'classify': [
    { label: 'Upload zone', text: 'Drop a .uds document here. Claude will assign a classification level with full reasoning.' },
    { label: 'Classification output', text: 'Output is one of: Public, Internal, Confidential, or Restricted — with a reasoning paragraph.' },
    { label: 'Classify button', text: 'Click to classify. The classification and reasoning are embedded in the document metadata.' },
    CLAUDE,
  ],
  'compare': [
    { label: 'Document A', text: 'Upload the first .uds document — the original version.' },
    { label: 'Document B', text: 'Upload the second .uds document — the revised version.' },
    { label: 'Compare button', text: 'Claude performs a semantic diff and outputs a structured comparison report as a .uds file.' },
    CLAUDE,
  ],
  'ocr': [
    { label: 'Upload zone', text: 'Drop an image (PNG, JPG, TIFF) or PDF here. Images use Tesseract OCR; PDFs use Claude AI vision.' },
    { label: 'OCR button', text: 'Click to extract text. The output .uds file contains the extracted content as structured blocks.' },
    { label: 'Accuracy note', text: 'OCR confidence score is shown in the output. Higher quality scans produce better results.' },
    CLAUDE,
  ],
  'dynamic-watermark': [
    { label: 'Upload zone', text: 'Drop a .uds document here to embed a recipient-specific watermark.' },
    { label: 'Recipient details', text: 'Enter the recipient\'s name, email, and organisation. These are embedded persistently in the metadata.' },
    { label: 'Watermark button', text: 'Downloads the watermarked .uds. The recipient identity cannot be removed without invalidating the file.' },
    BETA,
  ],
  'steg-watermark': [
    { label: 'Upload zone', text: 'Drop a .uds document to embed an invisible cryptographic ownership mark.' },
    { label: 'Owner details', text: 'Enter your identity. A SHA-256 hash of your claim is embedded invisibly in the document metadata.' },
    { label: 'Mark button', text: 'Downloads the marked .uds. The mark is detectable by UD Validator even after content edits.' },
    BETA,
  ],

  // ── Media ───────────────────────────────────────────────────────────────────

  'audio-embed': [
    { label: 'Document upload', text: 'Drop your .uds document here first — the audio will be embedded inside it.' },
    { label: 'Audio upload', text: 'Drop your MP3, WAV, or M4A file here. It will be base64-encoded and embedded in the document.' },
    { label: 'Embed button', text: 'Click to embed. The output .uds carries the audio — no external hosting needed.' },
    BETA,
  ],
  'video-embed': [
    { label: 'Document upload', text: 'Drop your .uds document here — the video will be embedded inside it.' },
    { label: 'Video upload', text: 'Drop your MP4, MOV, or WebM file (max 200 MB). It will be base64-encoded inside the .uds.' },
    { label: 'Embed button', text: 'Click to embed. The document travels with the video — no YouTube link, no broken embeds.' },
    BETA,
  ],
  'media-sync': [
    { label: 'Document upload', text: 'Drop your .uds document here — the text content that will be synchronised with your media.' },
    { label: 'Duration field', text: 'Optionally enter your media duration (e.g. 45:30). Claude uses this to estimate timestamps.' },
    { label: 'Generate button', text: 'Claude maps each section of your document to a media timestamp. Sync points are embedded in the output .uds.' },
    CLAUDE,
  ],
  'media-sync-advanced': [
    { label: 'Document upload', text: 'Drop your .uds document here — the text that will be synchronised with your media.' },
    { label: 'Media upload', text: 'Drop your audio or video file here. Claude analyses both to align every paragraph to a timestamp.' },
    { label: 'Chapter markers', text: 'Add optional chapter markers as hints, or leave empty — Claude auto-generates them from your document structure.' },
    { label: 'Generate button', text: 'Click to generate bidirectional sync. Your output .uds lets readers jump between text and media in both directions.' },
  ],

  // ── Healthcare ──────────────────────────────────────────────────────────────

  'prescription': [
    { label: 'Patient details', text: 'Enter patient name, date of birth, and address. These are embedded in the sealed .uds.' },
    { label: 'Medication fields', text: 'Add medication name, dose, frequency, and instructions. Multiple medications are supported.' },
    { label: 'Generate button', text: 'Generates a sealed prescription .uds with 30-day expiry and prescriber details embedded.' },
    PROVENANCE,
  ],
  'consent-manager': [
    { label: 'Patient details', text: 'Enter the patient\'s name and the procedure being consented to.' },
    { label: 'Procedure date', text: 'Set the procedure date. The consent document auto-expires 24 hours after the procedure.' },
    { label: 'Generate button', text: 'Creates a sealed consent .uds with expiry and multilingual output streams embedded.' },
    PROVENANCE,
  ],
  'medication-list': [
    { label: 'Patient details', text: 'Enter the patient name and clinician details for this medication record.' },
    { label: 'Medication entries', text: 'Add each medication with dose, frequency, start date, and optional expiry. Supports multiple entries.' },
    { label: 'Generate button', text: 'Creates a structured medication list .uds with per-entry expiry embedded in the metadata.' },
    PROVENANCE,
  ],
  'clinical-summary': [
    { label: 'Upload zone', text: 'Drop a clinical .uds document here. Claude generates two summaries from a single input.' },
    { label: 'Summary types', text: 'Output includes a plain-language patient summary and a structured clinical summary for professionals.' },
    { label: 'Generate button', text: 'Click to generate. Both summaries are embedded as Clarity Layers in the output .uds file.' },
    CLAUDE,
  ],
  'emr-export': [
    { label: 'Upload zone', text: 'Drop a HL7, FHIR, C-CDA, or CCD health record here. All four formats are supported.' },
    { label: 'Output layers', text: 'The converted .uds contains both a patient-facing summary and a structured clinical layer.' },
    { label: 'Convert button', text: 'Converts the health record to a structured .uds with two Clarity Layers.' },
    PROVENANCE,
  ],

  // ── Legal ───────────────────────────────────────────────────────────────────

  'legal-bundle': [
    { label: 'Document upload', text: 'Upload your .uds documents for the bundle. Each is individually Bates-stamped.' },
    { label: 'Bundle details', text: 'Enter the case name, matter reference, and jurisdiction. These appear on the cover sheet.' },
    { label: 'Generate button', text: 'Creates a Bates-numbered .udz bundle with cover sheet and privilege log. Output: .udz.' },
    PROVENANCE,
  ],
  'deposition-package': [
    { label: 'Transcript upload', text: 'Drop the deposition transcript .uds here.' },
    { label: 'Exhibits', text: 'Upload exhibit documents. Each is added to the bundle with an exhibit index entry.' },
    { label: 'Generate button', text: 'Creates a .udz deposition package with transcript, exhibits, and exhibit index.' },
    PROVENANCE,
  ],
  'privilege-log': [
    { label: 'Log entries', text: 'Add each privileged document with privilege type (attorney-client, work product, common interest), author, and date.' },
    { label: 'Case reference', text: 'Enter the matter reference and jurisdiction. These are embedded in the log metadata.' },
    { label: 'Generate button', text: 'Creates a tamper-evident privilege log .uds with chain of custody embedded.' },
    PROVENANCE,
  ],
  'smart-contract': [
    { label: 'Party details', text: 'Enter both party names, addresses, and roles. Both sets of details are embedded in the contract.' },
    { label: 'Contract terms', text: 'Set the effective date, duration, auto-renewal clause, and governing jurisdiction.' },
    { label: 'Generate button', text: 'Creates a structured contract .uds with expiry and signature placeholders for UD Signer.' },
    PROVENANCE,
  ],
  'legal-bundle-verify': [
    { label: 'Bundle upload', text: 'Drop a .udz legal bundle here to verify its completeness and integrity.' },
    { label: 'Verification checks', text: 'Bates sequence, file count, provenance hashes, and manifest completeness are all verified.' },
    { label: 'Report', text: 'Generates an admissible verification report .uds confirming the bundle is complete and untampered.' },
    PROVENANCE,
  ],
  'bates-stamp': [
    { label: 'Document upload', text: 'Upload multiple .uds documents for Bates stamping. Drop them all at once.' },
    { label: 'Prefix and start', text: 'Set your Bates prefix (e.g. "ABC-") and starting number. A live range preview updates as you add files.' },
    { label: 'Stamp button', text: 'Applies sequential Bates numbers and outputs a .udz bundle with all stamped documents.' },
    BETA,
  ],

  // ── Government / public sector ──────────────────────────────────────────────

  'foi-bundle': [
    { label: 'Response documents', text: 'Upload the .uds documents included in the FOI response.' },
    { label: 'Completeness statement', text: 'Add a completeness statement — this confirms the bundle represents the full response.' },
    { label: 'Generate button', text: 'Creates a .udz FOI bundle with redaction log and completeness statement embedded.' },
    PROVENANCE,
  ],
  'policy-publisher': [
    { label: 'Policy details', text: 'Enter the policy title, owning organisation, version number, and effective date.' },
    { label: 'Review date', text: 'Set the review date. The document auto-flags when it approaches expiry.' },
    { label: 'Publish button', text: 'Creates a sealed .uds policy document with effective date and version provenance.' },
    PROVENANCE,
  ],
  'regulatory-filing': [
    { label: 'Filing details', text: 'Enter the regulator name, entity reference, reporting period, and jurisdiction.' },
    { label: 'Filing content', text: 'Add the filing narrative and supporting data. These are structured as separate blocks.' },
    { label: 'Generate button', text: 'Creates a sealed compliance filing .uds with all fields embedded in tamper-evident metadata.' },
    PROVENANCE,
  ],

  // ── Finance ─────────────────────────────────────────────────────────────────

  'financial-statement': [
    { label: 'Entity details', text: 'Enter the entity name, reporting period, and preparer. These are embedded in the statement metadata.' },
    { label: 'CSV import', text: 'Optionally upload a CSV of financial data. Rows are imported as structured table blocks.' },
    { label: 'Generate button', text: 'Creates a sealed financial statement .uds with period and preparer provenance.' },
    PROVENANCE,
  ],
  'insurance-policy': [
    { label: 'Policy details', text: 'Enter policy type, insurer, policyholder, premium, and excess.' },
    { label: 'Coverage and dates', text: 'Define coverage scope, start date, and end date. The document auto-expires on the end date.' },
    { label: 'Generate button', text: 'Creates a sealed insurance policy .uds that automatically expires on the policy end date.' },
    PROVENANCE,
  ],
  'claims-package': [
    { label: 'Claim form', text: 'Upload the claim form .uds here.' },
    { label: 'Incident report and evidence', text: 'Add the incident report and any supporting evidence documents.' },
    { label: 'Generate button', text: 'Bundles all documents into a .udz claims package with chain-of-custody proof.' },
    PROVENANCE,
  ],

  // ── Research ────────────────────────────────────────────────────────────────

  'pre-registration': [
    { label: 'Hypothesis form', text: 'Enter your research question, primary hypothesis, and methodology before data collection.' },
    { label: 'Timestamp proof', text: 'A FNV-1a hash of your hypothesis is generated at this moment — before you see any data.' },
    { label: 'Register button', text: 'Creates a sealed .uds with your hypothesis, hash, and timestamp. Proof of prior registration.' },
    { label: 'Verification', text: 'Anyone can verify your registration without contacting us — the hash is self-contained in the file.' },
  ],
  'data-package': [
    { label: 'Dataset files', text: 'Upload the research dataset files to be bundled.' },
    { label: 'Package metadata', text: 'Enter DOI, licence, authors, and institution. These travel with the data inside the .udz.' },
    { label: 'Package button', text: 'Creates a .udz data package with provenance and attribution embedded in the bundle metadata.' },
    PROVENANCE,
  ],

  // ── Education / credentials ──────────────────────────────────────────────────

  'certificate-issuer': [
    { label: 'Recipient details', text: 'Enter the recipient\'s name and the award or qualification being certified.' },
    { label: 'Certificate fields', text: 'Set the issuing organisation, issue date, unique ID, and optional expiry.' },
    { label: 'Issue button', text: 'Creates a sealed .uds certificate with a unique ID that can be verified by anyone.' },
    PROVENANCE,
  ],
  'credential': [
    { label: 'Credential details', text: 'Enter the licence or certification type, issuing body, and holder name.' },
    { label: 'Expiry', text: 'Set an expiry date if the credential lapses. UD Reader will warn the holder on open.' },
    { label: 'Issue button', text: 'Creates a sealed .uds credential with optional expiry and verifiable provenance.' },
    PROVENANCE,
  ],
  'transcript': [
    { label: 'Student details', text: 'Enter the student name, student ID, and awarding institution.' },
    { label: 'Course entries', text: 'Add each course with grade, credit hours, and academic year. Multiple entries supported.' },
    { label: 'Generate button', text: 'Creates a sealed academic transcript .uds with institution seal and all course records embedded.' },
    PROVENANCE,
  ],

  // ── Real estate ──────────────────────────────────────────────────────────────

  'smart-lease': [
    { label: 'Party details', text: 'Enter landlord and tenant names, addresses, and contact details.' },
    { label: 'Lease terms', text: 'Set the property address, monthly rent, deposit, lease start date, and lease end date.' },
    { label: 'Generate button', text: 'Creates a sealed lease .uds that automatically expires on the lease end date.' },
    PROVENANCE,
  ],
  'title-chain': [
    { label: 'Property details', text: 'Enter the property address and unique title reference number.' },
    { label: 'Ownership history', text: 'Add each ownership transfer with transferor, transferee, date, and consideration.' },
    { label: 'Generate button', text: 'Creates a .udz title chain archive with the full ownership history and provenance metadata.' },
    PROVENANCE,
  ],

}
