# iSDF v0.1
## Interoperable Structured Document Framework

**Status:** Draft  
**Maintainer:** Sonny Saggar / The Hive Engines  
**License:** MIT  
**Version:** 0.1.0

---

## 1. What UD Is

UD (Universal Document) is a structured substrate for human-readable content.

It is not a file format. It is not a template system. It is not a CMS.

It is a JSON-based substrate that carries content, meaning, translation, 
audience-specific rendering, permissions, provenance, and chain-of-custody 
inside a single coherent structure.

UD replaces the need for:
- Multiple translated PDFs
- Multiple audience-specific versions of the same document
- Separate compliance and legal overlays
- Version drift across document copies
- Format lock-in (PDF, DOCX, TXT, CSV)

UD has two states:

| State | Name | Meaning |
|-------|------|---------|
| UDR | Universal Document Reviewable | Editable, mutable, working state |
| UDS | Universal Document Sealed | Immutable, signed, validated, archival |

---

## 2. Core Primitives

UD is built on two orthogonal primitives. Everything else derives from them.

### 2.1 Clarity Layers

A clarity layer is a named rendering profile for a content block.

The same semantic content can have multiple clarity renderings — one for 
an executive audience, one for a clinical audience, one in plain language, 
one for legal compliance. These are not separate documents. They are 
parallel renderings of the same block, stored inside it.

**Document-level declaration:**

Each document declares its clarity layer vocabulary once, in a 
clarity_layer_manifest. This manifest defines the available layer IDs 
and their human-readable labels. The vocabulary is freeform per document 
but fixed within it.

**Block-level rendering:**

Each content block may include a clarity object containing renderings 
keyed by layer ID. A block is not required to implement every declared 
layer. If a layer rendering is absent, the reader falls back to the block's 
base_content.

**Rules:**
- Layer IDs must match the document-level manifest exactly
- A block with no clarity object renders its base_content for all layers
- The reader must not error on missing layer renderings
- Layer IDs are lowercase strings, no spaces (e.g., "executive", "clinical")

### 2.2 Multilingual Ribbons

A multilingual ribbon is a set of parallel translations attached to a 
content block.

The same semantic content can exist in multiple languages simultaneously. 
The translations are stored per-block, not as separate documents. The 
reader can switch languages at the document level or the block level.

**Document-level declaration:**

Each document declares its language vocabulary in a language_manifest, 
as a list of BCP 47 language codes (e.g., "en", "es", "ar", "zh-Hans"). 
One language is designated as the base_language.

**Block-level rendering:**

Each content block may include a translations object containing 
renderings keyed by language code. A block is not required to implement 
every declared language. Missing translations fall back to the block's 
base_content rendered in the base language.

**Rules:**
- Language codes must be valid BCP 47 codes
- Language codes used in blocks must appear in the document-level manifest
- The base_language must always be present in the manifest
- Partial translation is valid and expected
- The reader must not error on missing translations

### 2.3 Orthogonality

Clarity layers and multilingual ribbons are orthogonal. They do not 
interfere with each other.

A single content block can have:
- N clarity layer renderings (one per declared layer)
- M language renderings (one per declared language)
- N x M total renderings

The reader resolves a specific rendering by selecting the active clarity 
layer AND the active language, then looking up block.clarity[layer][language] 
or gracefully degrading through the fallback chain.

**Fallback chain (in order):**
1. block.clarity[active_layer][active_language]
2. block.clarity["default"][active_language]
3. block.translations[active_language]
4. block.base_content

---

## 3. Document Structure

A UD document is a single JSON object with four top-level sections:

{
  "ud_version": "0.1.0",
  "state": "UDR | UDS",
  "metadata": { ... },
  "manifest": { ... },
  "blocks": [ ... ],
  "seal": { ... }
}

### 3.1 ud_version

Semver string. Declares the iSDF version this document conforms to.

### 3.2 state

Either "UDR" (editable) or "UDS" (sealed). A UDS document must 
include a valid seal object. A UDR document may omit seal.

### 3.3 metadata

{
  "id": "uuid-v4",
  "title": "string",
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime",
  "created_by": "string (user ID or name)",
  "organisation": "string (optional)",
  "document_type": "string (optional)",
  "tags": ["string"],
  "expiry": "ISO 8601 datetime (optional)",
  "revoked": false,
  "revocation_url": "https://... (optional)"
}

expiry: If present and the current datetime exceeds this value, 
the reader must refuse to render the document and display an expiry notice.

revoked: If true, the reader must refuse to render and display a 
revocation notice.

revocation_url: If present, the reader should call this URL at render 
time to check live revocation status. The endpoint must return 
{ "revoked": boolean }.

### 3.4 manifest

{
  "base_language": "en",
  "language_manifest": [
    { "code": "en", "label": "English" },
    { "code": "es", "label": "Spanish" },
    { "code": "ar", "label": "Arabic", "direction": "rtl" }
  ],
  "clarity_layer_manifest": [
    { "id": "executive", "label": "Executive Summary" },
    { "id": "clinical", "label": "Clinical Detail" },
    { "id": "plain", "label": "Plain Language" }
  ],
  "permissions": {
    "allow_copy": false,
    "allow_print": false,
    "allow_export": false,
    "require_auth": false,
    "audience": ["string (optional audience IDs)"]
  }
}

direction on a language entry is optional. Defaults to "ltr". Must 
be "ltr" or "rtl".

### 3.5 blocks

An ordered array of content blocks. Each block is the atomic unit of UD.

{
  "id": "b_uuid",
  "type": "paragraph | heading | table | list | image | code | divider | custom",
  "base_content": { ... },
  "clarity": {
    "executive": {
      "en": "Executive English rendering",
      "es": "Executive Spanish rendering"
    },
    "plain": {
      "en": "Plain English rendering"
    }
  },
  "translations": {
    "es": "Base Spanish rendering",
    "ar": "Base Arabic rendering"
  },
  "hidden": false,
  "audience": ["string (optional)"],
  "provenance": {
    "source": "string (optional)",
    "imported_from": "string (optional)",
    "imported_at": "ISO 8601 datetime (optional)"
  }
}

Block types and base_content shapes:

paragraph   : { "text": "string" }
heading     : { "text": "string", "level": 1-6 }
list        : { "items": ["string"], "ordered": boolean }
table       : { "headers": ["string"], "rows": [["string"]] }
image       : { "src": "url or base64", "alt": "string", "caption": "string (optional)" }
code        : { "language": "string", "code": "string" }
divider     : {}
custom      : { "schema": "url", "data": { ... } }

### 3.6 seal (UDS only)

{
  "sealed_at": "ISO 8601 datetime",
  "sealed_by": "string (user ID)",
  "hash": "SHA-256 hash of canonical document body",
  "signature": "string (optional)",
  "chain_of_custody": [
    {
      "event": "created | edited | reviewed | approved | sealed | shared | revoked",
      "actor": "string",
      "timestamp": "ISO 8601 datetime",
      "note": "string (optional)"
    }
  ]
}

hash: Computed from the canonical JSON of the document body excluding 
the seal object, serialised with sorted keys and no whitespace, 
then SHA-256 hashed.

---

## 4. UDR to UDS Sealing Rules

A UDR document is sealed to UDS by:

1. Validating the document against the iSDF JSON Schema (must pass with zero errors)
2. Freezing metadata.updated_at to the current datetime
3. Setting state to "UDS"
4. Computing the canonical hash of the document body
5. Writing the seal object with sealed_at, sealed_by, and hash
6. Appending a "sealed" entry to chain_of_custody
7. Optionally applying a cryptographic signature

Once sealed, the following are prohibited:
- Modifying any block
- Modifying any metadata field other than revoked and revocation_url
- Adding or removing blocks
- Changing the manifest

---

## 5. Validation Rules

A conforming UD document must:

- Include ud_version, state, metadata, manifest, and blocks
- Have a valid semver ud_version
- Have state of exactly "UDR" or "UDS"
- Have a metadata.id that is a valid UUID v4
- Have valid ISO 8601 datetimes in all datetime fields
- Have a manifest.base_language that appears in manifest.language_manifest
- Have block IDs that are unique within the document
- Have all clarity keys in blocks match IDs in clarity_layer_manifest
- Have all translation keys in blocks match codes in language_manifest
- Have a valid seal object if state is "UDS"
- Have a seal.hash that matches the computed canonical hash

---

## 6. File Extensions

.udr = Universal Document Reviewable
.uds = Universal Document Sealed

Both are UTF-8 encoded JSON files.

---

## 7. Versioning

This spec follows semantic versioning.

- Patch versions (0.1.x): bug fixes, fully backwards compatible
- Minor versions (0.x.0): new optional fields, backwards compatible
- Major versions (x.0.0): breaking changes, require migration

---

## 8. What iSDF Does Not Define

iSDF defines structure, not rendering. It does not define:
- How a reader renders blocks visually
- What fonts or colours to use
- What UI a creator tool must have
- How authentication is implemented
- How revocation servers are hosted
- What cryptographic algorithm is used for signatures

---

## Appendix A: Minimal Valid UDR Example

{
  "ud_version": "0.1.0",
  "state": "UDR",
  "metadata": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "title": "Patient Discharge Summary",
    "created_at": "2026-04-13T09:00:00Z",
    "updated_at": "2026-04-13T09:00:00Z",
    "created_by": "dr.saggar",
    "revoked": false
  },
  "manifest": {
    "base_language": "en",
    "language_manifest": [
      { "code": "en", "label": "English" },
      { "code": "es", "label": "Spanish" }
    ],
    "clarity_layer_manifest": [
      { "id": "clinical", "label": "Clinical Detail" },
      { "id": "plain", "label": "Plain Language" }
    ],
    "permissions": {
      "allow_copy": false,
      "allow_print": true,
      "allow_export": false,
      "require_auth": false
    }
  },
  "blocks": [
    {
      "id": "b_001",
      "type": "heading",
      "base_content": { "text": "Discharge Summary", "level": 1 },
      "hidden": false
    },
    {
      "id": "b_002",
      "type": "paragraph",
      "base_content": {
        "text": "Patient admitted with acute chest pain, discharged after 48 hours with no cardiac event confirmed."
      },
      "clarity": {
        "plain": {
          "en": "You came in with chest pain. Tests showed your heart is fine. You are going home after 2 days.",
          "es": "Usted llegó con dolor en el pecho. Las pruebas mostraron que su corazón está bien."
        },
        "clinical": {
          "en": "Admission for ACS rule-out. Troponin x3 negative. TIMI score 2. Discharged with cardiology follow-up."
        }
      },
      "translations": {
        "es": "El paciente fue ingresado con dolor torácico agudo y dado de alta después de 48 horas."
      },
      "hidden": false
    }
  ]
}
