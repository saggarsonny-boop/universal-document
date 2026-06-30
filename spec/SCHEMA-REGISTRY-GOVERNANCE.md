# Universal Document Schema Registry — Governance Model

**Document ID:** UDF-GOV-001  
**Status:** Draft  
**Version:** 1.0.0  
**Maintainer:** Universal Document Foundation  
**License:** CC BY 4.0  
**Last Revised:** 2026-06-30

---

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [Organizational Structure](#2-organizational-structure)
3. [Schema Registration Process](#3-schema-registration-process)
4. [Version Control Policy](#4-version-control-policy)
5. [Maturity Levels](#5-maturity-levels)
6. [Licensing and Fee Structure](#6-licensing-and-fee-structure)
7. [Integration with National PKIs](#7-integration-with-national-pkis)
8. [Crypto-Agility Policy](#8-crypto-agility-policy)
9. [Dispute Resolution](#9-dispute-resolution)
10. [Amendments to This Document](#10-amendments-to-this-document)
11. [Definitions](#11-definitions)

---

## 1. Purpose and Scope

The Universal Document Schema Registry (UDSR) is a globally accessible, neutral catalogue of named document schemas conforming to the iSDF (Interoperable Structured Document Framework). Its purpose is to:

- Prevent schema proliferation and semantic drift across organisations and jurisdictions.
- Provide a single source of truth for document type definitions used in cross-border, cross-sector, and cross-system document exchange.
- Ensure long-term archival stability of sealed Universal Document (UDS) files by anchoring every schema reference to a resolvable, versioned registry entry.
- Govern cryptographic algorithm selection to ensure that all sealed documents remain verifiable across multi-decade retention periods.

This document defines the authoritative governance model for the UDSR, including the bodies responsible for oversight, the processes for registering and versioning schemas, the licensing framework, and the cryptographic agility policy.

**Scope:** All schemas registered under the `udsr://` namespace are governed by this document. Schemas registered under private or organisational namespaces are outside the scope of UDF governance but may voluntarily adopt this model.

---

## 2. Organizational Structure

### 2.1 Universal Document Foundation (UDF)

The Universal Document Foundation is the stewardship body for the UDSR. It holds the `udsr://` namespace in trust for the global community of registered users and has ultimate responsibility for the long-term availability and integrity of the registry.

**Responsibilities:**

- Maintain the canonical UDSR infrastructure (registry API, schema resolution endpoints, archive mirrors).
- Publish and revise this governance document.
- Manage the approved cryptographic algorithms list.
- Collect and disburse registration fees in accordance with Section 6.
- Appoint the initial Schema Review Board and ratify subsequent elections.
- Maintain public transparency reports (annually) covering schema registrations, revenue, and infrastructure expenditure.

**Structure:** The UDF operates as a non-profit foundation. Its board of directors is elected by Registered Users with voting rights (one vote per registered account). Elections are held every two years.

### 2.2 Schema Review Board (SRB)

The Schema Review Board is the approval authority for all schema registrations, deprecations, and maturity-level promotions.

**Composition:** 5–7 members, elected by the UDF board from nominees put forward by Technical Working Groups and the Registered User community. At least one seat must be held by a representative of a recognised national or supranational standards body (e.g., ISO, CEN, NIST, BSI).

**Quorum:** A simple majority of seated members constitutes quorum. Approval requires a two-thirds supermajority vote.

**Terms:** Three-year staggered terms. No member may serve more than two consecutive terms.

**Responsibilities:**

- Review Schema Creation Requests (SCRs) escalated by Technical Working Groups.
- Approve or reject schema registrations, with written rationale in all cases.
- Approve maturity-level promotions (see Section 5).
- Adjudicate harmonisation disputes between Technical Working Groups.
- Publish meeting minutes within 14 calendar days of each session.

**Conflict of Interest Policy:** Members must publicly disclose any commercial or employment relationship with an organisation that has submitted an SCR under review. Conflicted members must recuse themselves from the relevant vote.

### 2.3 Technical Working Groups (TWGs)

Technical Working Groups are domain-specific expert panels responsible for the technical evaluation of schemas within their sector. TWGs are the primary point of entry for new schema proposals.

**Chartered Domains (initial):**

| Working Group | Domain Coverage |
|---|---|
| TWG-HC | Healthcare — clinical documents, prescriptions, lab results, imaging metadata |
| TWG-FIN | Finance — invoices, financial statements, payment instructions, trade documents |
| TWG-LEG | Legal — contracts, affidavits, court filings, notarial acts, powers of attorney |
| TWG-GOV | Government — identity documents, permits, licences, public records, tax filings |

New TWGs may be chartered by the UDF board upon demonstrated community need. A minimum of five Registered Users from at least three separate organisations constitutes the threshold for proposing a new TWG.

**TWG Responsibilities:**

- Conduct impact analysis on incoming SCRs for their domain.
- Coordinate harmonisation with existing schemas to avoid redundancy.
- Nominate domain experts to the Schema Review Board.
- Maintain a public roadmap of anticipated schema needs within their domain.
- Publish technical guidance notes complementary to registered schemas.

**TWG Membership:** Open to any Registered User. Active participation (defined as contribution to at least two reviews per year) is required to retain voting rights within the TWG.

### 2.4 Registered Users

Any individual or organisation with a validated UDSR account is a Registered User. Registration is free for individuals and open-source projects. Commercial organisations pay an annual registration fee (see Section 6).

**Registered User Rights:**

- Submit Schema Creation Requests.
- Comment on SCRs during the public review period.
- Subscribe to version notifications for any registered schema.
- Vote in UDF board elections (one vote per account).
- Download and use Open schemas under CC BY 4.0.

**Registered User Obligations:**

- Comply with this governance document.
- Provide accurate contact information for version notifications.
- Disclose affiliation when submitting SCRs.

---

## 3. Schema Registration Process

The UDSR registration process is modelled on best practice from established central registry systems, adapted for the technical requirements of iSDF-compliant schemas.

### 3.1 Process Overview

```
[Registered User]
       │
       ▼
1. Schema Creation Request (SCR) Submission
       │
       ▼
2. Completeness Check (UDF Secretariat — 5 business days)
       │
       ├─ Incomplete ──► Returned to submitter with deficiency list
       │
       ▼
3. Technical Working Group Assignment & Impact Analysis (30 days)
       │
       ▼
4. Public Review Period (21 days)
       │
       ▼
5. Harmonisation (TWG-led, up to 30 additional days if conflicts found)
       │
       ▼
6. Schema Review Board Approval Vote
       │
       ├─ Rejected ──► Written rejection notice; submitter may resubmit after addressing findings
       │
       ▼
7. Publication in UDSR at Maturity Level 0 (Draft)
       │
       ▼
8. Promotion Path (see Section 5)
```

### 3.2 Schema Creation Request (SCR)

An SCR must include:

| Field | Description | Required |
|---|---|---|
| `schema_name` | Proposed `udsr://` URI, e.g. `udsr://hc/clinical-discharge-summary` | Yes |
| `domain` | Target TWG domain (hc, fin, leg, gov, or proposed new domain) | Yes |
| `abstract` | Plain-language summary of the document type (200–500 words) | Yes |
| `schema_definition` | Full iSDF-compliant JSON schema | Yes |
| `sample_document` | At least one representative UDR document conforming to the schema | Yes |
| `existing_schemas` | List of any existing UDSR, ISO, or national schemas this relates to | Yes |
| `submitter_affiliation` | Organisation and role of the submitter | Yes |
| `licensing_intent` | Open (CC BY 4.0) or Commercial | Yes |
| `national_pki_alignment` | Any national PKI or eIDAS alignment requirements | No |
| `implementation_evidence` | Evidence of existing real-world use (deployments, pilots) | No |

SCRs are submitted via the UDSR web portal or the SCR API endpoint (`POST /registry/scr`). Each SCR receives a unique tracking identifier (`SCR-YYYY-NNNN`).

### 3.3 Completeness Check

The UDF Secretariat reviews each SCR for completeness within five business days of submission. Incomplete submissions are returned with a specific deficiency list. Resubmission restarts the five-day clock.

### 3.4 Impact Analysis

The assigned TWG conducts an impact analysis covering:

1. **Semantic overlap** — Does a functionally equivalent schema already exist in the registry?
2. **Naming consistency** — Does the proposed URI conform to the UDSR naming convention for its domain?
3. **Field-level harmonisation** — Can fields be aligned with existing schemas to enable cross-schema mapping?
4. **Breaking-change risk** — Would registration of this schema create ambiguity in existing sealed documents?
5. **Internationalisation** — Does the schema adequately support multilingual content and non-Latin scripts?

The TWG publishes its impact analysis report as a public document attached to the SCR record.

### 3.5 Public Review Period

Once the impact analysis is complete, a 21-day public review period opens. Any Registered User may submit written comments via the UDSR portal. The submitter must publish a response to all substantive comments before the review period closes.

### 3.6 Harmonisation

Where the TWG identifies semantic overlap with an existing schema, it may initiate a harmonisation process. Harmonisation may result in:

- **Merge:** The SCR is withdrawn and the submitter's requirements are addressed by amending the existing schema (creating a new minor version).
- **Extension:** The new schema is registered as a formal extension of an existing schema, declaring a `base_schema` field in its header.
- **Independent Registration:** The TWG determines that distinct use cases justify independent schemas; both proceed to the SRB.

Harmonisation may extend the review timeline by up to 30 calendar days. The submitter must consent to a Merge outcome; if they do not, the schema proceeds as Independent Registration.

### 3.7 Schema Review Board Approval

The SRB reviews the complete SCR record — including the TWG impact analysis, public comments, submitter responses, and harmonisation outcome — and votes to approve or reject.

**Approval criteria:**

- Schema is technically sound and fully iSDF-compliant.
- No unresolved semantic conflicts with existing registered schemas.
- Licensing intent is clearly declared.
- Submitter conflict-of-interest disclosures are complete.

Rejected schemas receive a written explanation. Submitters may resubmit after addressing all stated findings; resubmissions skip the full TWG impact analysis if the findings were limited to minor technical corrections (at TWG discretion).

### 3.8 Publication

Upon SRB approval, the schema is published in the UDSR at Maturity Level 0 (Draft). The canonical schema URI, JSON definition, and full SCR record (including all comments and votes) are publicly accessible. Version notifications are dispatched to all subscribers of the schema's domain TWG.

---

## 4. Version Control Policy

### 4.1 Semantic Versioning

All UDSR schemas use semantic versioning in the format **`MAJOR.MINOR.PATCH`**:

| Component | Incremented when... | Backward compatible? |
|---|---|---|
| `MAJOR` | A change breaks existing sealed documents (field removal, type change, required field addition) | No |
| `MINOR` | New optional fields are added or clarity layer vocabulary is extended | Yes |
| `PATCH` | Documentation corrections, description clarifications, non-normative changes | Yes |

Major version increments require a new full SCR and SRB approval. Minor and patch versions require only TWG review and a 14-day public comment period.

The schema URI includes the major version: `udsr://hc/clinical-discharge-summary/v2`. Minor and patch versions are surfaced via the registry API but do not alter the base URI.

### 4.2 Supported Version Window

The UDSR maintains active support for the **latest two major versions** of each schema. Older major versions are moved to "archived" status, meaning:

- The schema definition remains permanently resolvable (sealed documents must remain verifiable indefinitely).
- No further patch or minor updates are published.
- New sealed documents should not reference archived schema versions; validators will emit a `SCHEMA_ARCHIVED` warning.

### 4.3 Deprecation Notices

When a new major version is published, the prior major version enters a **deprecation period of not less than 24 months** before being moved to archived status. During this period:

- All subscribers receive an initial deprecation notice via email and the UDSR notification API.
- Reminder notices are sent at 12 months, 6 months, and 30 days before archival.
- The registry API returns a `Deprecation` response header on all requests for the deprecated version.

### 4.4 Immutability of Published Versions

A published schema version is immutable. Once a `MAJOR.MINOR.PATCH` tuple is published, its normative content may never be altered. If an error is discovered:

- A `PATCH` increment is published with the correction.
- The erroneous version is flagged with an `ERRATA` notice, but remains resolvable.

This guarantee is essential to the archival integrity of sealed UDS documents: any sealed document must be verifiable against the exact schema version it references, in perpetuity.

---

## 5. Maturity Levels

Each registered schema carries a maturity level indicating its stability and adoption status.

| Level | Name | Criteria |
|---|---|---|
| **0** | Draft | Newly registered; under active development; may change significantly |
| **1** | Recommended | Implemented by at least two independent organisations; no open errata for 6 months; publicly reviewed |
| **2** | Standard | Implemented by at least five independent organisations across at least two jurisdictions; stable for 12 months; endorsed by the SRB |

**Promotion Process:**

- Promotion from Level 0 to Level 1 requires a TWG nomination, implementation evidence, and a 14-day public comment period.
- Promotion from Level 1 to Level 2 requires SRB approval by two-thirds supermajority, endorsement from at least one recognised standards body or national authority, and public comment.

Maturity level is surfaced in the `schema_maturity` field of the UDS document header (integer 0, 1, or 2). Validators may be configured to reject documents referencing schemas below a required maturity threshold.

---

## 6. Licensing and Fee Structure

### 6.1 Open Schemas

Schemas registered with Open licensing are published under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** licence. Any party may use, implement, extend, or redistribute Open schemas without fee, provided attribution is given to the UDSR and the original submitter.

Open licensing is the default and is mandatory for schemas submitted by non-profit organisations, academic institutions, and government bodies.

### 6.2 Commercial Schema Registration

Commercial organisations may register schemas under Commercial licensing for a fee of **USD $99 per schema per year**. Commercial schemas are fully published in the UDSR and freely accessible for implementation by any Registered User, but the submitting organisation holds the right to determine whether derivative schemas may be registered.

The registration fee is due annually on the anniversary of the schema's initial publication. Failure to renew within 30 days of the due date results in automatic conversion to Open (CC BY 4.0) licensing.

Commercial licensing is not available for schemas that are substantively identical to an existing Open schema.

### 6.3 Revenue Allocation

Annual registration fee revenue is allocated as follows:

| Allocation | Percentage | Purpose |
|---|---|---|
| UDF Operations | 70% | Registry infrastructure, secretariat, legal, transparency reporting |
| Schema Maintenance Fund | 30% | TWG operational support, tooling, archival mirror costs |

The UDF publishes annual audited financial statements. Any surplus after operational costs is directed to the Schema Maintenance Fund reserve.

### 6.4 Fee Waivers

The UDF board may grant fee waivers for:

- Schemas submitted by recognised national standards bodies or intergovernmental organisations.
- Schemas implementing a mandate from an EU regulation, WHO guideline, or equivalent supranational instrument.
- Schemas from organisations in World Bank-designated lower-income economies.

Fee waiver requests are reviewed by the UDF board within 30 days of submission.

---

## 7. Integration with National PKIs

### 7.1 Policy Objective

The UDSR supports validation of sealed UDS documents against national Public Key Infrastructure (PKI) trust anchors. This enables UDS documents to carry legal weight in jurisdictions where document authenticity is determined by validation against a national root certificate.

### 7.2 Supported PKI Frameworks

The following national and supranational PKI frameworks are supported as of this version:

| Framework | Jurisdiction | Trust Anchor Type | Notes |
|---|---|---|---|
| **X-Road** | Estonia (and federated members: Finland, Iceland, Faroe Islands, Japan) | X.509 CA hierarchy | Member state certificates issued by the Estonian Information System Authority (RIA) |
| **BankID** | Sweden, Norway | X.509 CA hierarchy | Issued by commercial CA operators under national mandate |
| **eIDAS** | European Union (27 member states) | Qualified Trust Service Provider (QTSP) certificates | Governed by EU Regulation 910/2014 and the forthcoming eIDAS 2.0 / EUDIW framework |
| **DigiD** | Netherlands | X.509 / BSNk pseudonym certificates | Operated by Logius |
| **SPID / CIE** | Italy | X.509 CA hierarchy | AgID-regulated; CIE uses NFC-readable certificates |

Additional national PKI integrations may be proposed via the TWG-GOV working group and approved by the SRB.

### 7.3 PKI Reference Fields in UDS Documents

A sealed UDS document may include an optional `national_pki_context` block in its signature envelope:

```json
"national_pki_context": {
  "framework": "eIDAS",
  "trust_anchor_uri": "https://ec.europa.eu/tools/lotl/eu-lotl.xml",
  "certificate_policy_oid": "0.4.0.194112.1.2",
  "validation_profile": "QES"
}
```

The presence of this block does not alter the primary UDSR signature validation logic. It is an informational annotation enabling jurisdiction-specific validators to apply national trust rules in addition to UDSR validation.

### 7.4 Cross-Border Validation

For cross-border document exchange, the UDS validation chain is:

1. Verify the document's cryptographic signature against the signer's public key.
2. Verify the signer's certificate chain against the declared PKI trust anchor.
3. Resolve the schema URI from the UDSR and validate document structure.
4. Check the schema's maturity level against any jurisdiction-imposed minimum threshold.
5. Confirm the algorithm used for signing is on the UDF approved algorithms list (see Section 8).

Step 2 is optional where no `national_pki_context` is declared; in such cases, the document is validated against the UDSR's own root of trust only.

### 7.5 eIDAS 2.0 and the EU Digital Identity Wallet

The UDF commits to full alignment with the EU Digital Identity Wallet (EUDIW) architecture as it reaches final specification under eIDAS 2.0. Specifically:

- UDS schemas for identity-adjacent document types (e.g., diplomas, medical prescriptions, vehicle registration) will declare conformance with the corresponding EUDIW attestation schema where one exists.
- The `national_pki_context` framework field will be extended to support `EUDIW` as a named framework alongside `eIDAS`.
- TWG-GOV will maintain a mapping table between UDSR schema fields and EUDIW attestation attributes.

---

## 8. Crypto-Agility Policy

### 8.1 Policy Objective

Sealed UDS documents are designed for multi-decade archival. The cryptographic algorithms used to sign and verify these documents must therefore be managed proactively to ensure:

- Documents signed today remain verifiable in 2040 and beyond.
- The registry can mandate migration away from weakened algorithms before they become a liability.
- Implementers receive sufficient advance notice to complete migrations without breaking existing archives.

### 8.2 UDF Approved Algorithms List

The UDF publishes and maintains the **Approved Algorithms List (AAL)**, reviewed and updated annually each January. The AAL classifies algorithms across four status tiers:

| Status | Meaning |
|---|---|
| **Active** | Fully approved for signing new sealed documents |
| **Legacy** | Approved for verifying existing documents; new documents should use Active algorithms |
| **Deprecated** | Approved for verifying existing documents only; new documents MUST NOT use this algorithm; removal timeline announced |
| **Prohibited** | Must not be used for any purpose; documents bearing this algorithm are considered unverifiable |

### 8.3 Current Algorithm Schedule

The following schedule is normative as of version 1.0.0 of this document:

#### Signature Algorithms

| Algorithm | Current Status | Transition Date | Target Status | Notes |
|---|---|---|---|---|
| **Ed25519** | Active | 2030-01-01 | Legacy | Transition to Legacy; new docs should prefer ML-DSA |
| **Ed25519** | Legacy | 2035-01-01 | Deprecated | Deprecated; new docs MUST NOT use Ed25519 after this date |
| **ECDSA P-256 (SHA-256)** | Active | 2030-01-01 | Legacy | Classic elliptic curve; legacy after quantum-safe transition |
| **ECDSA P-384 (SHA-384)** | Active | 2032-01-01 | Legacy | Larger key variant; slightly longer legacy window |
| **RSA-PSS (2048-bit, SHA-256)** | Legacy | 2027-01-01 | Deprecated | Deprecated; RSA below 3072-bit not recommended |
| **RSA-PSS (3072-bit+, SHA-256)** | Active | 2030-01-01 | Legacy | Acceptable until quantum-safe transition |
| **ML-DSA-44** (CRYSTALS-Dilithium L2) | Active | — | — | NIST FIPS 204; post-quantum; required after 2035 |
| **ML-DSA-65** (CRYSTALS-Dilithium L3) | Active | — | — | NIST FIPS 204; recommended for high-assurance documents |
| **ML-DSA-87** (CRYSTALS-Dilithium L5) | Active | — | — | NIST FIPS 204; required for government and healthcare schemas |
| **SLH-DSA** (SPHINCS+) | Active | — | — | NIST FIPS 205; stateless hash-based; alternative to ML-DSA |

#### Hash Algorithms

| Algorithm | Current Status | Transition Date | Target Status |
|---|---|---|---|
| **SHA-256** | Active | 2032-01-01 | Legacy |
| **SHA-384** | Active | — | — |
| **SHA-512** | Active | — | — |
| **SHA-3-256** | Active | — | — |
| **SHA-3-512** | Active | — | — |
| **SHA-1** | Prohibited | — | — |
| **MD5** | Prohibited | — | — |

### 8.4 Mandatory Post-Quantum Transition

**Effective 2035-01-01:** All newly sealed UDS documents MUST use at least one post-quantum signature algorithm from the AAL (ML-DSA or SLH-DSA). Hybrid signatures (a classical algorithm combined with a post-quantum algorithm) are acceptable and encouraged during the transition period 2030–2035.

Schema definitions that specify a `required_algorithm` field must be updated to reflect post-quantum requirements no later than the annual AAL review in January 2034.

### 8.5 Algorithm Transition Notifications

When an algorithm's status changes, the UDF will:

1. Publish the forthcoming change in the annual January AAL review, with a minimum of **five years' advance notice** for Active → Legacy transitions and **three years' advance notice** for Legacy → Deprecated transitions.
2. Dispatch notifications to all Registered Users via the version notification system.
3. Publish migration guidance documentation covering implementation steps and backward-compatibility strategies for sealed archives.
4. Update UDSR validation tooling to emit `ALGORITHM_LEGACY` and `ALGORITHM_DEPRECATED` warnings at the appropriate dates.

### 8.6 Emergency Algorithm Deprecation

If a cryptographic vulnerability is discovered that materially compromises the security of an Active or Legacy algorithm, the UDF may invoke an **Emergency Deprecation** procedure:

- The UDF board convenes within 48 hours of confirmed vulnerability disclosure.
- An emergency AAL update may be published with a shortened notice period, but not less than **90 days** for a Legacy → Deprecated transition.
- The SRB is notified and an emergency public notice is published on the UDSR website and notification API.
- Affected schema owners are contacted directly.

Emergency Deprecations triggered by a publicly disclosed cryptographic break (e.g., a practical quantum attack on a classical algorithm) may invoke an immediate `Prohibited` status for new documents, with verification of existing documents preserved.

---

## 9. Dispute Resolution

### 9.1 First-Stage Resolution

Disputes regarding SCR outcomes, harmonisation decisions, or TWG impact analyses are first addressed through a written appeal to the relevant TWG chair. The TWG chair must provide a written response within 15 business days.

### 9.2 Escalation to SRB

If the first-stage resolution is unsatisfactory, the appellant may escalate to the Schema Review Board within 30 days of receiving the TWG response. The SRB will adjudicate within 45 days and its decision is final on technical matters.

### 9.3 Governance Disputes

Disputes concerning the application of this governance document (as distinct from technical schema decisions) are escalated to the UDF board. The board's decision is binding and may be appealed only through the amendment process described in Section 10.

### 9.4 No Liability

The UDF, SRB, and TWGs provide the UDSR on an "as-is" basis. Registration of a schema does not constitute endorsement of any document produced under it, nor does it confer legal status on documents in any jurisdiction. National legal validity is determined solely by applicable national law and the relevant PKI framework.

---

## 10. Amendments to This Document

### 10.1 Proposal

Any Registered User may propose an amendment by submitting a written proposal to the UDF Secretariat. Proposals must identify the specific section(s) to be amended and provide a clear rationale.

### 10.2 Review

The UDF board reviews amendment proposals quarterly. The board may adopt the proposal, reject it with written rationale, or refer it to the SRB or a relevant TWG for technical assessment.

### 10.3 Approval

Amendments to this document require:

- A two-thirds supermajority of the UDF board.
- A 30-day public comment period.
- Publication of all dissenting board member statements.

Amendments to Section 8 (Crypto-Agility Policy) additionally require endorsement from the SRB.

### 10.4 Versioning

This governance document is versioned using semantic versioning. The current version is `1.0.0`. All versions are permanently archived at the UDSR documentation endpoint. Sealed UDS documents reference the governance document version in force at the time of sealing.

---

## 11. Definitions

| Term | Definition |
|---|---|
| **AAL** | Approved Algorithms List — the UDF-maintained list of cryptographic algorithms and their current status tiers |
| **eIDAS** | EU Regulation 910/2014 on electronic identification and trust services for electronic transactions in the internal market |
| **EUDIW** | EU Digital Identity Wallet — the digital identity credential infrastructure established under eIDAS 2.0 |
| **iSDF** | Interoperable Structured Document Framework — the technical specification governing UDR and UDS document structure |
| **ML-DSA** | Module-Lattice-based Digital Signature Algorithm — NIST FIPS 204; post-quantum signature algorithm (formerly CRYSTALS-Dilithium) |
| **PKI** | Public Key Infrastructure — the hierarchy of certificates and certificate authorities used to establish digital identity and document authenticity |
| **SCR** | Schema Creation Request — a formal submission to register a new schema in the UDSR |
| **SLH-DSA** | Stateless Hash-based Digital Signature Algorithm — NIST FIPS 205; post-quantum signature algorithm (formerly SPHINCS+) |
| **SRB** | Schema Review Board — the elected approval authority for schema registrations and maturity-level promotions |
| **TWG** | Technical Working Group — a domain-specific expert panel that conducts impact analysis on schema proposals |
| **UDF** | Universal Document Foundation — the stewardship body for the UDSR |
| **UDR** | Universal Document Reviewable — the mutable, editable state of a Universal Document |
| **UDS** | Universal Document Sealed — the immutable, cryptographically signed archival state of a Universal Document |
| **UDSR** | Universal Document Schema Registry — the canonical catalogue of named iSDF document schemas governed by the UDF |
| **X-Road** | Estonia's federated data exchange layer, used as a PKI and interoperability framework across member states |

---

*This document is published under CC BY 4.0. Attribution: Universal Document Foundation, 2026.*
