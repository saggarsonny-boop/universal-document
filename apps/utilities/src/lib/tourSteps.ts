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

  // ── Trust & Proof ────────────────────────────────────────────────────────────

  'proof': [
    { label: 'Upload zone', text: 'Upload any file or paste text — your document, idea, code, or creative work.' },
    { label: 'Description field', text: 'Add a title describing what you\'re proving. This becomes part of the permanent record.' },
    { label: 'Generate button', text: 'Click to seal. A SHA-256 hash and blockchain timestamp are embedded in your proof file instantly.' },
    { label: 'Download', text: 'Your .uds proof file contains mathematical evidence this content existed right now. Open it in UD Validator to verify.' },
  ],
  'time-capsule': [
    { label: 'Content input', text: 'Write your message or upload a file — a letter, document, or anything you want to preserve.' },
    { label: 'Unlock date', text: 'Choose when this capsule opens. Tomorrow, next year, or fifty years from now.' },
    { label: 'Recipient/message', text: 'Add an optional message shown to anyone who opens the file before the unlock date.' },
    { label: 'Seal button', text: 'Your capsule is sealed with a blockchain timestamp. Share the file — it stays locked until the date you chose.' },
  ],
  'will': [
    { label: 'Testator details', text: 'Enter your full name, date of birth, and address. These identify the document as yours.' },
    { label: 'Beneficiaries', text: 'Add each beneficiary with their name, relationship, and share or specific bequest.' },
    { label: 'Review date', text: 'Set a review date (default 5 years). The document expires on this date as a reminder to update it.' },
    { label: 'Generate button', text: 'Creates a sealed .uds with both plain-English and formal legal language layers. Not a substitute for legal advice.' },
  ],
  'notarize': [
    { label: 'Upload zone', text: 'Upload the document you want to self-certify or prepare for Remote Online Notarization.' },
    { label: 'Function selector', text: 'Choose self-certification (cryptographic tamper evidence) or preparation for a licensed RON service.' },
    { label: 'Declarant details', text: 'Enter your name and the certification statement. These are embedded in the .uds output.' },
    { label: 'Generate button', text: 'Creates your certified .uds with SHA-256 hash, timestamp, and certification layer embedded.' },
  ],

  // ── Governance Suite ─────────────────────────────────────────────────────────

  'contract-intelligence': [
    { label: 'Upload', text: 'Upload any contract — PDF, Word, or Universal Document™ format.' },
    { label: 'Type selector', text: 'Select contract type to help Claude focus on the right clauses.' },
    { label: 'Analyse button', text: 'Claude reads the full contract and extracts every key date, obligation, and risk flag.' },
    { label: 'Output', text: 'Your .uds file contains the original contract plus structured metadata — renewal dates, deadlines, obligations all queryable.' },
  ],
  'policy-attestation': [
    { label: 'Policy upload', text: 'Upload the policy document employees are attesting to. The hash of this exact version is embedded.' },
    { label: 'Employee details', text: 'Enter the employee name, email, and optional department. These appear in the attestation record.' },
    { label: 'Attestation statement', text: 'The pre-filled statement can be edited. Whatever is shown here is what the employee is attesting to.' },
    { label: 'Create button', text: 'Creates a .udz bundle containing the policy and the attestation record — both tamper-evident.' },
  ],
  'board-pack': [
    { label: 'Meeting details', text: 'Enter the board meeting title, date, and company name. Expiry auto-sets to meeting date plus 7 days.' },
    { label: 'Document uploads', text: 'Upload each board paper with its section number, classification, and author.' },
    { label: 'Generate button', text: 'Each paper is sealed as .uds and bundled into a governed .udz board pack with auto-expiry.' },
    PROVENANCE,
  ],
  'due-diligence-room': [
    { label: 'Transaction details', text: 'Enter the transaction name or code and select the transaction type.' },
    { label: 'Document sections', text: 'Upload documents into standard due diligence sections: Corporate, Financial, Legal, IP, HR, Regulatory.' },
    { label: 'Expiry date', text: 'Set the deal closing date. All documents expire automatically — no manual cleanup needed.' },
    { label: 'Generate button', text: 'Creates a governed .udz data room with dynamic watermarking, audit trail, and chain of custody.' },
  ],
  'regulatory-change-tracker': [
    { label: 'Document input', text: 'Paste the URL of a regulatory document or upload it directly.' },
    { label: 'Regulator selector', text: 'Select the regulator (FDA, FCA, EMA, NHS, etc.) to apply the right classification metadata.' },
    { label: 'Check frequency', text: 'Set how often to check for changes: daily, weekly, or monthly.' },
    { label: 'Output', text: 'When a change is detected, you receive a .uds diff showing exactly what changed — added, removed, and altered text.' },
  ],
  'whistleblower-package': [
    { label: 'Evidence upload', text: 'Upload your evidence files. When anonymous mode is on, no identity metadata is captured.' },
    { label: 'Incident description', text: 'Describe the incident in your own words. This is sealed with a blockchain timestamp.' },
    { label: 'Anonymous toggle', text: 'On by default. When enabled, no IP address or identity information is recorded.' },
    { label: 'Submit button', text: 'You receive a reference number and a .udz copy of your submission. The organisation receives the encrypted package.' },
  ],

  // ── Healthcare Suite ─────────────────────────────────────────────────────────

  'clinical-trial-master-file': [
    { label: 'Trial details', text: 'Enter the trial title, protocol number, sponsor, and principal investigator.' },
    { label: 'TMF sections', text: 'Upload documents into standard DIA TMF Reference Model sections. Each is sealed as .uds with GCP classification.' },
    { label: 'Phase selector', text: 'Select the trial phase (I/II/III/IV). This appears in ICH GCP compliance metadata.' },
    { label: 'Generate button', text: 'Creates an ICH E6(R3) compliant .udz TMF bundle with blockchain provenance on every document.' },
  ],

  // ── Identity & Trust ─────────────────────────────────────────────────────────

  'identity-document': [
    { label: 'Personal information', text: 'Fill in your name, profession, employer, and contact details. Only fields you complete are sealed.' },
    { label: 'Credentials & licences', text: 'Add your professional licences and qualifications, one per line. These become queryable data in the .uds.' },
    { label: 'Generate', text: 'Creates a SHA-256 sealed .uds identity record. Share it directly — recipients verify without a central database.' },
    { label: 'Verify', text: 'Use UD Verify to check any identity document has not been altered since sealing.' },
  ],
  'job-application': [
    { label: 'Application details', text: 'Enter the role and company you are applying to, plus your personal details.' },
    { label: 'Documents', text: 'Upload your CV, cover letter, and any supporting certificates. Each is sealed individually.' },
    { label: 'Bundle', text: 'All documents are bundled into a single tamper-evident .udz package with an index.' },
    { label: 'Share', text: 'Send the .udz to the employer. They can verify qualifications without contacting institutions.' },
  ],
  'reference-letter': [
    { label: 'Referee details', text: 'Enter the referee name, title, and organisation. These are sealed into the letter.' },
    { label: 'Subject', text: 'Add the person being referenced and the context — job, course, or general character reference.' },
    { label: 'Letter content', text: 'Write the reference text. Once sealed it cannot be altered.' },
    { label: 'Download', text: 'Creates a .uds reference letter. The recipient verifies it without contacting the referee.' },
  ],
  'statement': [
    { label: 'Statement type', text: 'Choose the type: formal statement, public apology, press release, or personal declaration.' },
    { label: 'Content', text: 'Write your statement. This is the version that will be cryptographically sealed.' },
    { label: 'Seal', text: 'The statement is SHA-256 hashed and blockchain timestamped. It cannot be backdated.' },
    { label: 'Share', text: 'Share the .uds. Anyone can verify the statement has not been altered since the stated time.' },
  ],
  'consent-form': [
    { label: 'Consent type', text: 'Choose from photo consent, model release, data processing, research participation, or custom.' },
    { label: 'Parties', text: 'Enter the consenting party and the requesting organisation or individual.' },
    { label: 'Terms', text: 'Describe what is being consented to. Be specific — vague consent is unenforceable.' },
    { label: 'Generate', text: 'Creates a GDPR-compliant .uds consent form with a tamper-evident timestamp.' },
  ],

  // ── Finance & Commerce ───────────────────────────────────────────────────────

  'receipt': [
    { label: 'Transaction details', text: 'Enter the purchase date, merchant, items, and total. Multiple line items are each stored as structured data.' },
    { label: 'Seal', text: 'Creates a tamper-evident .uds receipt. Cannot be altered after sealing — no more disputed transactions.' },
    { label: 'Verify', text: 'Use UD Verify to check any receipt has not been altered since issue.' },
    { label: 'Use cases', text: 'Expense claims, warranty records, legal disputes, insurance claims. The receipt that actually holds up.' },
  ],
  'event-ticket': [
    { label: 'Event details', text: 'Enter the event name, date, venue, and ticket type. Expiry is set to the event date automatically.' },
    { label: 'Batch size', text: 'Generate one ticket or multiple. Each ticket gets a unique hash — no two are identical.' },
    { label: 'Validate', text: 'Use UD Validator at the door to verify each ticket. No special app needed — works in any browser.' },
    { label: 'Download', text: 'Tickets download as .uds files or a .udz batch. Email them to attendees.' },
  ],
  'insurance-claim-consumer': [
    { label: 'Incident details', text: 'Describe the incident with date, location, and what happened. This text is sealed at submission time.' },
    { label: 'Evidence', text: 'Upload photos, receipts, and supporting documents. Each is SHA-256 hashed and bundled.' },
    { label: 'Claim summary', text: 'Enter the claimed amount and policy reference. These are sealed into the claim record.' },
    { label: 'Bundle', text: 'Creates a tamper-evident .udz claims bundle with a reference number. Submit to your insurer.' },
  ],
  'debt-acknowledgment': [
    { label: 'Parties', text: 'Enter the debtor and creditor names and addresses. Both are sealed into the acknowledgment.' },
    { label: 'Debt details', text: 'Specify the amount, currency, original debt date, and agreed repayment terms.' },
    { label: 'Terms', text: 'Add repayment schedule, interest rate (if any), and what happens on default.' },
    { label: 'Seal', text: 'Creates a .uds debt acknowledgment. Neither party can later claim the terms were different.' },
  ],
  'freelance-agreement': [
    { label: 'Parties', text: 'Enter client and freelancer details. Both parties are sealed into the agreement.' },
    { label: 'Scope', text: 'Describe the work, deliverables, and revision limits clearly. Vague scope causes disputes.' },
    { label: 'Terms', text: 'Set payment amount, schedule, IP ownership, and confidentiality terms.' },
    { label: 'Generate', text: 'Creates a governed .uds freelance agreement. Expiry on project end date.' },
  ],

  // ── Civic & Community ────────────────────────────────────────────────────────

  'petition': [
    { label: 'Petition text', text: 'Write the petition text. This is sealed at the moment the first signature is added and cannot be changed.' },
    { label: 'Target', text: 'Specify who the petition is addressed to and what outcome you are requesting.' },
    { label: 'Sign', text: 'Each signatory signs the same cryptographic version. Mathematical proof the text was never altered.' },
    { label: 'Bundle', text: 'Creates a .udz petition bundle with the sealed petition text and all signature records.' },
  ],

  // ── Healthcare Suite additions ────────────────────────────────────────────────

  'medical-history': [
    { label: 'Patient details', text: 'Enter the patient name, DOB, blood type, allergies, and emergency contact.' },
    { label: 'Medical history', text: 'Add conditions, medications, procedures, vaccinations, and family history. Each is structured data.' },
    { label: 'Audience layers', text: 'The .uds has three layers: patient (plain English), emergency responder (key facts), and specialist (clinical detail).' },
    { label: 'Generate', text: 'Creates a tamper-evident .uds medical history. Use UD Reader to view it in any language.' },
  ],

  // ── Real Estate additions ─────────────────────────────────────────────────────

  'rental-agreement': [
    { label: 'Property details', text: 'Enter the property address, type, and rental period dates.' },
    { label: 'Parties', text: 'Add host and guest names. Both are sealed into the agreement with their responsibilities.' },
    { label: 'Terms', text: 'Set the nightly rate, security deposit, house rules, and check-in/check-out times.' },
    { label: 'Generate', text: 'Creates a .uds short-term rental agreement. Expiry on checkout date.' },
  ],
  'tenancy-deposit': [
    { label: 'Check-in mode', text: 'Document property condition at the start of tenancy with photos, descriptions, and meter readings.' },
    { label: 'Check-out mode', text: 'Document condition at end of tenancy. The tool compares against check-in record automatically.' },
    { label: 'Evidence', text: 'Upload photos for each room. All photos are SHA-256 hashed at inspection time.' },
    { label: 'Bundle', text: 'Creates a .udz with inspection report and comparison. Prevents deposit disputes.' },
  ],

  // ── Trust & Proof additions ───────────────────────────────────────────────────

  'separation-agreement': [
    { label: 'Parties', text: 'Enter both parties\' names and addresses. These are sealed into the agreement.' },
    { label: 'Assets', text: 'List shared assets, property, and agreed division. Be specific — vague terms cause disputes.' },
    { label: 'Arrangements', text: 'Add child arrangements, maintenance terms, and any other agreed conditions.' },
    { label: 'Generate', text: 'Creates a .uds separation agreement. Neither party can later claim terms were different.' },
  ],
  'power-of-attorney': [
    { label: 'POA type', text: 'Choose: General, Lasting (LPA), Financial, or Medical. Each has different legal requirements.' },
    { label: 'Donor', text: 'The person granting authority. Their name and capacity statement are sealed into the document.' },
    { label: 'Attorney', text: 'The person granted authority. Add their name, relationship, and scope of powers.' },
    { label: 'Generate', text: 'Creates a structured .uds POA draft. This is a starting point — always have it reviewed by a solicitor.' },
  ],

  // ── Research & Science additions ──────────────────────────────────────────────

  'academic-paper': [
    { label: 'Paper details', text: 'Enter the title, authors, abstract, and journal or preprint server.' },
    { label: 'Citations', text: 'Add citations as structured data — author, title, DOI. Each becomes a queryable reference object.' },
    { label: 'Sections', text: 'Upload the paper sections. Figures and supplementary materials are bundled as first-class content.' },
    { label: 'Generate', text: 'Creates a .uds academic paper or .udz bundle with supplementary materials.' },
  ],
  'grant-application': [
    { label: 'Grant details', text: 'Enter the grant name, funder, submission deadline, and amount requested.' },
    { label: 'Application', text: 'Write or paste the application text. This is sealed with a tamper-evident timestamp.' },
    { label: 'Supporting documents', text: 'Upload CVs, preliminary data, letters of support. All bundled into the .udz.' },
    { label: 'Submit', text: 'Creates a .uds application with tamper-evident timestamp proving on-time submission.' },
  ],

  // ── Governance Suite additions ────────────────────────────────────────────────

  'safety-report': [
    { label: 'Incident type', text: 'Choose: workplace accident, near miss, equipment failure, adverse event, or environmental incident.' },
    { label: 'Details', text: 'Describe what happened, when, where, and who was involved. This is sealed at time of writing.' },
    { label: 'Evidence', text: 'Upload photos, CCTV stills, equipment logs. All hashed and bundled.' },
    { label: 'Generate', text: 'Creates a legally defensible .uds safety report sealed at the time of incident reporting.' },
  ],
  'esg-report': [
    { label: 'Scope', text: 'Select emission scopes (1, 2, 3), reporting period, and framework (GRI, TCFD, CSRD).' },
    { label: 'Data', text: 'Enter emissions data, energy use, water, waste, and social metrics as structured data objects.' },
    { label: 'Carbon credits', text: 'Optional: issue carbon credit certificates with expiry and revocation when retired.' },
    { label: 'Generate', text: 'Creates a tamper-evident .uds ESG report. Blockchain provenance prevents greenwashing.' },
  ],

  // ── Legal Suite additions ─────────────────────────────────────────────────────

  'sports-contract': [
    { label: 'Contract type', text: 'Choose: player transfer, agent agreement, sponsorship, image rights, or employment contract.' },
    { label: 'Parties', text: 'Add player, club, agent, and any third parties. All sealed into the contract.' },
    { label: 'Terms', text: 'Enter fee, duration, salary, performance clauses, and termination conditions.' },
    { label: 'Compliance', text: 'Select the governing body (FIFA, UEFA, Premier League, etc.) for compliance metadata.' },
  ],

  // ── Dynamic Documents ─────────────────────────────────────────────────────────

  'living-document': [
    { label: 'Document type', text: 'Choose: living policy, living contract, living research protocol, or custom.' },
    { label: 'Initial version', text: 'Write or paste the initial content. This becomes Version 1.0 — the tamper-evident baseline.' },
    { label: 'Versioning', text: 'Each edit creates a new version with full attribution and diff from previous version.' },
    { label: 'Snapshot', text: 'Export any version as a sealed .uds snapshot. The entire history is preserved in the .udr.' },
  ],

  // ── Engines 101-108 ───────────────────────────────────────────────────────────

  'signing-workflow': [
    { label: 'Upload document', text: 'Upload the .uds or PDF to be signed. The document hash is locked — it cannot change between signatories.' },
    { label: 'Signatories', text: 'Add signatories in order (sequential) or all at once (parallel). Each gets a unique signing link.' },
    { label: 'Track', text: 'See who has signed, who is pending, and when each signature was added.' },
    { label: 'Complete', text: 'Final .uds contains all signatures with chain of custody. Blockchain provenance on each signature.' },
  ],
  'training-record': [
    { label: 'Training details', text: 'Enter the training title, provider, date, and version of the training material.' },
    { label: 'Completion', text: 'Add the learner name, assessment score, and completion date.' },
    { label: 'Certificate', text: 'Creates a tamper-evident .uds training certificate. Cannot be backdated.' },
    { label: 'Bulk', text: 'Enterprise: upload a CSV to issue hundreds of certificates at once.' },
  ],
  'document-vault': [
    { label: 'Upload', text: 'Upload .uds files to your vault. Assign to departments and add access controls.' },
    { label: 'Audit trail', text: 'Every view, download, and modification is recorded automatically.' },
    { label: 'Expiry alerts', text: 'Documents with expiry dates trigger review alerts before they lapse.' },
    { label: 'Search', text: 'Full-text search across all sealed documents in your vault.' },
  ],
  'capture': [
    { label: 'Upload files', text: 'Upload multiple PDFs or images. Claude classifies each document automatically.' },
    { label: 'Classification', text: 'Each document is assigned a type, metadata, and access classification.' },
    { label: 'Bundle', text: 'All classified documents are archived as a governed .udz bundle.' },
    { label: 'Report', text: 'Processing report shows classification decisions and any documents needing manual review.' },
  ],
  'proposal': [
    { label: 'Sections', text: 'Write executive summary, detailed proposal, and pricing. Each becomes a separate audience layer.' },
    { label: 'Branding', text: 'Add your company name and logo. These appear in the executive layer.' },
    { label: 'Expiry', text: 'Set a proposal expiry date. The .uds is locked after this date.' },
    { label: 'Track', text: 'UD Signer integration lets you track when the proposal is opened and signed.' },
  ],
  'pdf-editor': [
    { label: 'Upload PDF', text: 'Upload any PDF. The text layer is extracted and displayed for editing.' },
    { label: 'Edit', text: 'Click on any text to edit it. Changes are tracked as structured edits.' },
    { label: 'Annotate', text: 'Add comments, highlights, and form fields on top of existing content.' },
    { label: 'Export', text: 'Output as edited PDF or convert to .uds for tamper-evident archiving.' },
  ],
  'contract-lifecycle': [
    { label: 'Create', text: 'Start with UD Smart Contract for the initial template.' },
    { label: 'Negotiate', text: 'Use UD Living Document for tracked redlines and version history.' },
    { label: 'Sign', text: 'UD Signing Workflow manages sequential or parallel signature collection.' },
    { label: 'Store & monitor', text: 'UD Document Vault stores the signed contract. UD Contract Intelligence monitors renewal dates.' },
  ],
  'document-intelligence': [
    { label: 'Upload document', text: 'Upload any .uds, .udz, or PDF. Claude reads and understands the full content.' },
    { label: 'Ask questions', text: 'Ask anything: "What are the payment terms?" or "List all obligations on Party B."' },
    { label: 'Structured output', text: 'Get parties, key dates, obligations, risks, and anomalies as structured .uds data.' },
    { label: 'Export', text: 'Download the intelligence report as a .uds for your records.' },
  ],

}

