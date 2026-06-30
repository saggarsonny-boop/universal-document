# Universal Document Schema Registry — Governance Model

**Document ID:** UDSR-GOV-001
**Status:** Recommended (Maturity Level 1)
**Version:** 1.0.0
**Applies to:** iSDF (Interoperable Structured Document Framework) v0.1.0 and later
**Maintainer:** Universal Document Foundation (UDF)
**License:** CC BY 4.0

---

## 0. Purpose & Scope

The **Universal Document Schema Registry** (UDSR, "the Registry") is the
authoritative, public catalogue of schemas used by the Universal Document (UD)
ecosystem. A *schema* in this context is any one of:

- A **core iSDF schema** — the document substrate itself (e.g. `ud.schema.json`).
- A **block-type schema** — the `base_content` shape of a block `type`
  (`paragraph`, `heading`, `table`, `custom`, …).
- A **domain extension schema** — a reusable `custom` block schema for a vertical
  (e.g. a clinical discharge summary, a legal contract clause, a tax filing line
  item) referenced through `block.base_content.schema`.
- A **clarity-layer or audience vocabulary** registered for cross-organisation
  reuse.

This document defines **who** governs the Registry, **how** schemas enter and
move through it, **how** versions are managed, **how** schemas are licensed, how
the Registry interoperates with **national PKIs**, and how the ecosystem stays
**crypto-agile** over time.

This is a governance document. It does not redefine the on-disk format; that
remains the responsibility of the iSDF specification in `spec/v0.1.0/iSDF-spec.md`.

---

## 1. Organizational Structure

Governance is layered. Authority increases from the bottom (Registered Users) to
the top (the Foundation), but day-to-day approval power is delegated to the
Schema Review Board and the Technical Working Groups.

```
                 ┌─────────────────────────────────────────┐
                 │     Universal Document Foundation (UDF)   │  Stewardship
                 │     - holds the registry namespace        │
                 │     - sets policy, owns trust anchors      │
                 └───────────────────┬───────────────────────┘
                                     │ appoints / charters
                 ┌───────────────────▼───────────────────────┐
                 │        Schema Review Board (5–7)            │  Approval authority
                 │     - final approve/reject + maturity set   │
                 └───────────────────┬───────────────────────┘
                                     │ delegates domain review
       ┌──────────────┬──────────────┼──────────────┬──────────────┐
   ┌───▼───┐     ┌────▼────┐    ┌────▼────┐    ┌─────▼─────┐   (additional
   │Health │     │ Finance │    │  Legal  │    │ Government│    TWGs may be
   │  TWG  │     │   TWG   │    │   TWG   │    │    TWG    │    chartered)
   └───────┘     └─────────┘    └─────────┘    └───────────┘
                                     ▲
                                     │ submit requests, comment, adopt
                 ┌───────────────────┴───────────────────────┐
                 │            Registered Users                 │  Anyone with an account
                 └─────────────────────────────────────────────┘
```

### 1.1 Universal Document Foundation (UDF) — Stewardship

The UDF is the steward of the Registry. It does **not** approve individual
schemas day to day; it sets the rules within which approval happens.

**Responsibilities**

- Own and operate the canonical registry namespace and infrastructure
  (e.g. `https://registry.universal-document.org/<domain>/<name>/<version>`).
- Hold the ecosystem **trust anchors** (root signing keys, the approved
  algorithm list — see §6).
- Charter and dissolve Technical Working Groups (TWGs).
- Appoint and remove Schema Review Board members.
- Ratify policy changes to *this* governance document (a policy change is itself
  a schema-class change subject to §2 and §3).
- Steward revenue and the maintenance fund (see §4).
- Act as the final escalation point for appeals.

**Composition**: A Board of Directors (odd number, minimum 3) plus an Executive
Director who runs operations. Directors serve staggered 3-year terms. The UDF is
incorporated as a non-profit foundation.

### 1.2 Schema Review Board (SRB) — Approval Authority

The SRB is the body with binding authority to **approve, reject, or defer** a
schema and to **assign its maturity level** (§2.5).

- **Size:** 5 to 7 voting members (kept odd where possible to avoid ties).
- **Selection:** Appointed by the UDF, drawn from TWG chairs, independent domain
  experts, and at least one security/cryptography specialist.
- **Term:** 2 years, renewable once consecutively. Terms are staggered so no
  more than half the Board rotates in a single cycle.
- **Quorum:** A simple majority of seated members (e.g. 3 of 5, 4 of 7).
- **Decision rule:** A schema is approved when it receives **≥⅔ of votes cast**
  at a meeting with quorum. The Chair votes only to break ties.
- **Recusal:** A member who submitted, sponsors, or has a commercial interest in
  a schema must recuse from its vote and is not counted toward quorum for that item.
- **Conflict of interest:** All members file an annual disclosure with the UDF.

### 1.3 Technical Working Groups (TWGs) — Domain-Specific

TWGs do the technical heavy lifting: impact analysis (§2.2) and harmonization
(§2.3). Each TWG owns a domain namespace within the Registry.

| TWG | Namespace | Example schema concerns |
|-----|-----------|--------------------------|
| Healthcare | `health/` | discharge summaries, lab panels, clinical clarity layers (clinical vs. plain) |
| Finance | `finance/` | statements, invoices, tax line items, audit chain-of-custody |
| Legal | `legal/` | contract clauses, signature blocks, jurisdiction metadata |
| Government | `gov/` | permits, filings, eIDAS-aligned identity attributes |

**TWG rules**

- Chartered by the UDF; each has a **Chair** (a Registered User in good standing)
  and an open membership of subject-matter experts.
- Produces a written **Impact & Harmonization Report** for every Schema Creation
  Request routed to it (template in Appendix B).
- Has **recommendation** power, not final approval power — recommendations go to
  the SRB.
- Additional TWGs (e.g. `education/`, `science/`) may be chartered as demand arises.

### 1.4 Registered Users — Anyone with an Account

Any person or organisation with a Registry account.

**Rights**

- Submit a Schema Creation Request (SCR).
- Comment on any SCR during its public review window (§2.4).
- Read and reuse all Open schemas (§4).
- Subscribe to version notifications (§3.2).
- Stand for TWG membership and, through the UDF, for SRB appointment.

**Obligations**

- Accept the Registry Terms and the licence terms attached to each schema.
- Provide accurate contact details for version notifications.

---

## 2. Registration Process

The lifecycle is modelled on Hong Kong's Central Registry approach to controlled,
staged intake with mandatory impact assessment and harmonization before
publication.[citation:1][citation:2] A schema moves left-to-right; it can be
sent back a stage at any review gate.

```
  ┌──────────┐   ┌────────────┐   ┌───────────────┐   ┌─────────────┐   ┌────────────┐
  │   SCR    │──▶│  Impact    │──▶│ Harmonization │──▶│  SRB Review  │──▶│ Approval & │
  │Submission│   │ Analysis   │   │  across       │   │  + maturity  │   │Publication │
  │ (User)   │   │  (TWG)     │   │  schemas (TWG)│   │  (SRB vote)  │   │  (UDF)     │
  └──────────┘   └────────────┘   └───────────────┘   └─────────────┘   └────────────┘
        │              │                  │                  │                 │
        └── may be returned to a prior stage with comments at any gate ────────┘
```

### 2.1 Schema Creation Request (SCR) Submission

A Registered User submits an SCR containing:

- Proposed namespace + name (e.g. `health/discharge-summary`).
- A draft JSON Schema (Draft 2020-12) plus at least one valid example UD document
  exercising it.
- Intended block `type` (`custom` for domain extensions) and how it is referenced.
- Rationale and the problem it solves.
- Requested licence (Open / Commercial — §4).
- Declared maturity target (the submitter may only *request* a level; the SRB sets it).

Each SCR receives a tracking ID (`SCR-YYYY-NNNN`) and enters status **Submitted**.

### 2.2 Impact Analysis (Technical Working Group)

The relevant TWG performs impact analysis and produces a report assessing:

- **Overlap:** Does an existing schema already cover this? (favour reuse)
- **Breaking surface:** Does it change or constrain a core iSDF primitive?
- **Interoperability:** Effects on readers, validators, and signing/sealing.
- **Security & privacy:** PII handling, audience permissions, expiry/revocation.
- **Burden:** Implementation cost for tooling vendors.

Output: an **Impact Report** with a recommendation of *advance*, *revise*, or
*reject*. Status becomes **In Impact Analysis** → **Impact Cleared**.

### 2.3 Harmonization Across Existing Schemas

Before a schema can be recommended, the TWG harmonizes it with what already
exists so the Registry stays internally consistent:

- Align field names and types with sibling schemas (shared vocabularies).
- Reuse common sub-schemas (addresses, identities, money, timestamps) rather than
  redefining them.
- Reconcile clarity-layer IDs and audience vocabularies with existing manifests.
- Resolve naming collisions within the namespace.

Output: a **Harmonization Report** and, where needed, a revised draft. Status
becomes **Harmonized**.

### 2.4 Public Review Window

Harmonized SCRs are published for **a minimum 14-day public comment window**
(30 days for any change touching a core iSDF schema). Registered Users may
comment. The TWG addresses material comments before the SRB vote. This window is
part of "Review by Schema Review Board" intake and ensures the Board votes with
community input on the record.

### 2.5 Review by the Schema Review Board & Maturity Assignment

The SRB reviews the harmonized draft, both reports, and public comments, then
votes (§1.2). On approval the SRB assigns a **maturity level**:

| Level | Name | Meaning | Production use guidance |
|------:|------|---------|--------------------------|
| **0** | Draft | Accepted into the Registry for experimentation; may change or be withdrawn without notice. | Prototyping only. |
| **1** | Recommended | Stable, harmonized, and recommended for general use. Backwards-compatible evolution only. | Safe for production with version pinning. |
| **2** | Standard | Battle-tested, widely adopted, formally endorsed by the UDF. Strongest stability guarantees. | Default choice; long-term support. |

Maturity can be **promoted** (0→1→2) as a schema proves itself, or **demoted**
with notice if problems emerge. Promotion to Level 2 additionally requires UDF
ratification.

Possible outcomes: **Approved** (with maturity), **Returned for revision**, or
**Rejected** (with written rationale; the submitter may appeal to the UDF).

### 2.6 Approval & Publication

On approval the UDF publishes the schema to the canonical namespace with an
immutable, content-addressed record:

- A stable URL: `https://registry.universal-document.org/<domain>/<name>/<version>`.
- The maturity level, licence, SHA-256 of the canonical schema body, and the
  SCR/decision audit trail (mirroring the UD chain-of-custody model).
- A machine-readable registry entry (Appendix A).

Status becomes **Published**.

---

## 3. Version Control

### 3.1 Semantic Versioning

Every schema is versioned `major.minor.patch`, consistent with the iSDF spec's
own versioning policy:

- **patch (`x.y.Z`)** — clarifications and non-normative fixes; fully backwards
  compatible. No new SCR required; TWG chair may approve.
- **minor (`x.Y.0`)** — new **optional** fields; backwards compatible. Lightweight
  review (impact + harmonization, SRB consent agenda).
- **major (`X.0.0`)** — breaking changes requiring migration. Full §2 process,
  including a public review window, and a published migration note.

Maturity level travels with a version line, not the schema name; a new major
version starts at the maturity the SRB assigns it (often Level 0 or 1) even if
the prior major was Level 2.

### 3.2 Version Notifications to Registered Users

- Registered Users may **subscribe** to any schema (or namespace).
- The Registry **notifies subscribers** on: new version published, maturity
  change, deprecation, or scheduled end-of-support.
- Channels: email and a machine-readable feed (Atom/JSON) plus a webhook for
  tooling integrations.
- For **major** versions and **deprecations**, notification is mandatory and sent
  to all subscribers of the affected schema.

### 3.3 Support Window — Latest Two Versions

The Registry guarantees support for the **latest two major versions** of any
schema line at a time, following the "support the current and one prior" model.[citation:2]

- When `vN+1.0.0` is published, `v(N-1)` enters a **deprecation period** of
  **12 months** minimum, during which it remains resolvable and validatable.
- After the deprecation period the old version is moved to an **archived** state:
  permanently resolvable for verification of historically sealed (UDS) documents,
  but flagged as unsupported for new authoring.
- Already-sealed UDS documents always remain verifiable against the exact schema
  version they were sealed with — archival never breaks historical verification.

---

## 4. Licensing

Every published schema carries exactly one licence class.

### 4.1 Open Schemas — CC BY 4.0

- All **core iSDF** and **block-type** schemas are Open by default.
- Open schemas are licensed **CC BY 4.0**: free to use, implement, and
  redistribute, with attribution to the Universal Document Foundation and the
  original submitter.
- Open is the **required** class for anything that touches a core iSDF primitive,
  so the substrate can never be paywalled.

### 4.2 Commercial Schema Registration

Organisations may register a **proprietary domain extension** schema under a
commercial licence.

- **Fee:** **$99 / year per schema** (per schema line, covering its version
  history within that year).
- Commercial schemas are still listed publicly in the Registry (name, owner,
  maturity, licence terms) for discoverability and conflict-checking, but their
  full definition and usage rights are governed by the owner's commercial terms.
- A commercial schema may **not** redefine or fork a core iSDF primitive; it may
  only extend via `custom` blocks.
- Non-payment moves a commercial schema to **suspended** after a 30-day grace
  period; documents already sealed against it remain verifiable (per §3.3).

### 4.3 Revenue Split

Commercial registration revenue is allocated:

| Share | Recipient | Purpose |
|------:|-----------|---------|
| **70%** | Universal Document Foundation | Stewardship, infrastructure, SRB/TWG operations, trust-anchor custody. |
| **30%** | Maintenance fund | Ongoing schema maintenance, security review, validator/tooling upkeep. |

The UDF publishes an annual financial summary of registry revenue and the
maintenance fund.

---

## 5. Integration with National PKIs

The Registry is the trust directory that lets UD validators verify sealed (UDS)
documents against **national public-key infrastructures**. The iSDF `seal` object
already carries a `signature`; this section defines how that signature is
anchored to national roots.

### 5.1 Supported Trust Frameworks

| Framework | Country / Region | Role in UD validation |
|-----------|------------------|-----------------------|
| **X-Road** | Estonia | Verify issuer identity and data-exchange provenance for institutional issuers. |
| **BankID** | Sweden | Verify a natural person's signature on a sealed UD. |
| **eIDAS** | European Union | Recognise qualified electronic signatures/seals (QES/QESeal) and trust-service-provider (TSP) chains. |

### 5.2 Trust Anchor Registry

- The UDF maintains, under §1.1, a **Trust Anchor Registry**: the set of national
  root and intermediate certificates / public keys recognised by UD validators.
- Each anchor entry records: issuing authority, framework (X-Road / BankID /
  eIDAS), validity window, the algorithm used, and revocation/OCSP endpoints.
- The Trust Anchor Registry is itself versioned and notified per §3.2 so
  validators can refresh anchors automatically.

### 5.3 Document Validation Against National Root Certificates

When a validator checks a UDS document whose `seal.signature` claims a national
PKI anchor, it MUST:

1. Resolve the signing certificate chain to a root present in the Trust Anchor
   Registry for the declared framework.
2. Verify the signature over the canonical document body hash (`seal.hash`).
3. Check certificate validity and **live revocation** (OCSP/CRL, mirroring the
   iSDF `revocation_url` behaviour for documents).
4. Confirm the signing algorithm is on the current approved algorithm list (§6).
5. Record the verification result and the anchor used in the reader's audit trail.

A failure at any step means the document MUST NOT be presented as nationally
verified; the reader falls back to "signed but unverified" or "open" trust tiers.

---

## 6. Crypto-Agility Policy

The Registry must outlive any single signature algorithm. iSDF deliberately does
**not** hard-code a signing algorithm; this policy governs how the ecosystem's
algorithm choices evolve.

### 6.1 Managed Algorithm List

- The UDF publishes and maintains the **Approved Algorithm List** (AAL) — the
  signature and hash algorithms permitted for sealing and verifying UD documents.
- The AAL is a **registered, versioned schema** in its own right (namespace
  `core/algorithm-list`) and is **reviewed and updated annually**.
- Each entry has a status: **`required`**, **`recommended`**, **`allowed`**,
  **`deprecated`**, or **`forbidden`**, plus the date it entered that status.
- Validators MUST refuse `forbidden` algorithms and SHOULD warn on `deprecated`.

### 6.2 Deprecation Timeline

The AAL carries an explicit migration runway so issuers and tooling can plan:

| Algorithm | Class | Status | Key date |
|-----------|-------|--------|----------|
| **Ed25519** | Classical signature | Deprecated | **Deprecated 2035** — `allowed` until then, `forbidden` for new seals thereafter. |
| **ML-DSA** (FIPS 204) | Post-quantum signature | **Required** | Required for new seals as the quantum-safe baseline.[citation:7] |
| SHA-256 | Hash | Recommended | Reviewed annually alongside signature algorithms. |

- During the transition, dual-signing (a classical signature **and** an ML-DSA
  signature on the same `seal.hash`) is **recommended** so documents remain
  verifiable by both legacy and post-quantum validators.
- Documents sealed under an algorithm that later becomes `forbidden` remain
  **historically verifiable** — deprecation governs *new* seals, not the validity
  of past ones, consistent with the §3.3 archival guarantee.

### 6.3 Annual Review

Each year the SRB (with its security specialist) reviews the AAL against current
standards bodies' guidance and publishes any status changes via the §3.2
notification system, with a minimum migration runway of one full review cycle
before any algorithm moves to `forbidden`.

---

## 7. Appeals & Escalation

1. A submitter may appeal an SRB rejection or maturity decision to the **UDF**
   within 30 days.
2. The UDF may uphold, remand to the SRB, or (by Board majority) override the
   decision with written rationale.
3. UDF decisions are final.

---

## Appendix A: Registry Entry (machine-readable)

Every published schema has a registry entry of this shape:

```json
{
  "registry_id": "health/discharge-summary",
  "version": "1.2.0",
  "maturity": 2,
  "status": "published",
  "license": "CC-BY-4.0",
  "schema_url": "https://registry.universal-document.org/health/discharge-summary/1.2.0",
  "schema_hash": "sha256-<canonical-hash>",
  "twg": "healthcare",
  "scr_id": "SCR-2026-0042",
  "published_at": "2026-06-30T00:00:00Z",
  "supersedes": "health/discharge-summary@1.1.0",
  "deprecation": { "deprecated_versions": ["0.x"], "support_until": "2027-06-30T00:00:00Z" },
  "algorithms_required": ["ML-DSA"],
  "notify_subscribers": true
}
```

## Appendix B: Impact & Harmonization Report (template)

```
SCR ID:            SCR-YYYY-NNNN
Schema:            <namespace>/<name>  (requested vMAJOR.MINOR.PATCH)
TWG:               <healthcare | finance | legal | government | ...>
Reviewers:         <names>

1. Overlap with existing schemas:        <none | list + reuse decision>
2. Breaking surface on core iSDF:         <yes/no + detail>
3. Interoperability impact:               <readers / validators / sealing>
4. Security & privacy assessment:         <PII, permissions, expiry/revocation>
5. Harmonization actions taken:           <field renames, shared sub-schemas>
6. Public comments addressed:             <summary>
7. Recommendation to SRB:                 <advance @ maturity N | revise | reject>
```

## Appendix C: Status Vocabulary

`Submitted → In Impact Analysis → Impact Cleared → Harmonized → Public Review →
SRB Review → Published` — with side states `Returned for revision`, `Rejected`,
`Deprecated`, `Archived`, and (commercial) `Suspended`.

---

## References

1. Hong Kong Government — Central Registry / centralised registration and impact
   assessment model for controlled intake. [citation:1]
2. Staged registration with mandatory harmonization and "current + one prior"
   version support practice. [citation:2]
3. Post-quantum migration guidance: ML-DSA (FIPS 204) as the quantum-safe
   signature baseline, classical curves (e.g. Ed25519) on a deprecation runway.
   [citation:7]
