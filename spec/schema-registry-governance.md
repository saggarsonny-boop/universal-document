# Universal Document Schema Registry Governance Model

**Status:** Draft governance model  
**Steward:** Universal Document Foundation (UDF)  
**Scope:** Universal Document Schema Registry (UDSR)  
**License for this document:** CC BY 4.0

---

## 1. Purpose and Principles

The Universal Document Schema Registry is the public coordination point for reusable Universal Document schemas. It exists to make schemas discoverable, interoperable, versioned, and accountable across public, private, and regulated domains.

The registry is governed around five principles:

1. **Open public schemas:** Public-interest schemas are available under CC BY 4.0 and may be implemented freely.
2. **Transparent approval:** Schema decisions are made through documented review, impact analysis, harmonization, and publication steps.
3. **Domain expertise:** Technical Working Groups review domain-specific risk, terminology, compliance, and interoperability.
4. **Stable evolution:** Registered users receive version notifications, and the registry supports the latest two published versions of each approved schema.
5. **Crypto-agility:** Cryptographic requirements evolve through a managed algorithm list, predictable deprecation windows, and national PKI integration.

---

## 2. Organizational Structure

### 2.1 Universal Document Foundation

The Universal Document Foundation is the steward of the registry. UDF owns the governance process, maintains registry operations, publishes policies, manages fees, and appoints the Schema Review Board.

Responsibilities:

- Maintain the Universal Document Schema Registry service and public schema catalog.
- Publish registry policies, fee schedules, review criteria, and maturity definitions.
- Appoint and rotate Schema Review Board members.
- Charter Technical Working Groups and approve their operating rules.
- Maintain the annual cryptographic algorithm list.
- Manage national PKI trust-anchor policy and certificate validation requirements.
- Collect commercial registration fees and allocate revenue.
- Publish transparency reports covering schema approvals, rejections, appeals, security incidents, deprecations, and revenue allocation.

### 2.2 Schema Review Board

The Schema Review Board is the approval authority for registry publication. It consists of 5 to 7 members appointed by UDF.

Composition requirements:

- At least one member with document standards or schema-design expertise.
- At least one member with security, cryptography, or identity infrastructure expertise.
- At least one member with accessibility or multilingual document expertise.
- At least two members with experience in regulated-domain data exchange.
- No single employer or affiliated organization may hold a majority of seats.

Responsibilities:

- Approve, reject, or return schema submissions for revision.
- Assign maturity levels at publication.
- Resolve cross-domain harmonization disputes.
- Approve major-version releases and breaking changes.
- Approve accelerated security deprecations when ordinary timelines are insufficient.
- Hear appeals from submitters and Technical Working Groups.

Decision rules:

- A quorum requires a majority of seated members.
- Approval requires a majority of members present and voting.
- Major-version standards, policy changes, and cryptographic deprecations require at least two-thirds approval of seated members.
- Members must recuse themselves from decisions where they have a direct commercial or employment conflict.

### 2.3 Technical Working Groups

Technical Working Groups are domain-specific review bodies chartered by UDF. Initial groups are:

- Healthcare
- Finance
- Legal
- Government

Additional working groups may be chartered when a domain has sustained schema activity, regulatory complexity, or specialized terminology.

Responsibilities:

- Perform impact analysis for schema creation requests in their domain.
- Identify overlap with existing schemas and recommend harmonization.
- Review domain terminology, required fields, optional extensions, validation rules, privacy expectations, and regulatory constraints.
- Recommend a maturity level to the Schema Review Board.
- Maintain domain implementation notes and migration guidance.
- Flag schemas that require national PKI validation, sector-specific identifiers, or jurisdiction-specific constraints.

### 2.4 Registered Users

Registered users are individuals or organizations with registry accounts. Any registered user may submit a Schema Creation Request, comment on public review drafts, subscribe to schema notifications, and report issues.

Responsibilities:

- Submit complete and accurate schema requests.
- Disclose commercial use, intellectual-property constraints, and conflicts of interest.
- Respond to review questions and harmonization requests.
- Maintain contact information for version notifications.
- Comply with registry licensing and fee rules.

Rights:

- View public schemas and maturity status.
- Submit new schema requests and revision proposals.
- Receive notifications for subscribed schemas.
- Appeal a rejected request or disputed maturity assignment.

---

## 3. Schema Registration Process

The process is modeled on a central-registry pattern: a submitter files a structured request, a domain group performs impact analysis, the proposal is harmonized against existing entries, and a central review authority approves publication.

### 3.1 Step 1: Schema Creation Request

A registered user submits a Schema Creation Request through the registry portal.

Required fields:

| Field | Description |
| --- | --- |
| Schema name | Human-readable name and requested registry identifier |
| Submitter | Registered user, organization, and contact details |
| Domain | Healthcare, finance, legal, government, or other proposed domain |
| Purpose | Business, public-service, compliance, or interoperability purpose |
| Data model | JSON Schema, examples, required fields, optional fields, and validation rules |
| Dependencies | Referenced Universal Document schemas, external code lists, identifiers, or standards |
| Jurisdictions | Countries, regions, or legal systems where the schema is intended for use |
| Privacy and security notes | Sensitive data classes, retention expectations, signing needs, and certificate requirements |
| License class | Open public schema or commercial schema registration |
| Compatibility statement | Expected relationship to existing schemas and migration assumptions |

Submission outcomes:

- **Accepted for review:** The request is complete and assigned to a Technical Working Group.
- **Returned as incomplete:** Required information is missing.
- **Rejected as out of scope:** The request does not define a reusable Universal Document schema or violates registry policy.

### 3.2 Step 2: Technical Working Group Impact Analysis

The assigned Technical Working Group evaluates the request.

Impact analysis covers:

- Domain need and reuse potential.
- Overlap with existing schemas.
- Compatibility with Universal Document primitives, metadata, provenance, clarity layers, multilingual ribbons, permissions, and chain-of-custody.
- Privacy, safety, regulatory, accessibility, and localization considerations.
- Required certificate validation or national PKI integration.
- Migration burden for existing implementers.
- Recommended maturity level.

The working group produces an impact-analysis report containing:

- Summary recommendation.
- Required changes before board review.
- Harmonization opportunities.
- Risks and unresolved questions.
- Proposed maturity level.

### 3.3 Step 3: Harmonization

Harmonization ensures the registry does not accumulate competing schemas for the same concept unless a clear domain, jurisdictional, or technical reason exists.

Harmonization actions may include:

- Reusing existing field names, identifiers, code lists, and validation patterns.
- Moving domain-specific fields into extensions.
- Splitting a broad proposal into a base schema plus domain profiles.
- Merging duplicate proposals.
- Requiring alignment with an existing standard schema.
- Defining migration mappings from prior versions.

The goal is not to force all domains into one schema. The goal is to preserve interoperability where concepts are shared and preserve domain specificity where requirements differ.

### 3.4 Step 4: Schema Review Board Review

After impact analysis and harmonization, the Schema Review Board reviews the proposal.

The board may:

- Approve the schema for publication.
- Approve with required editorial corrections.
- Return the schema for technical revision.
- Defer the schema pending another working group review.
- Reject the schema with reasons.

Board review criteria:

- Clear reusable purpose.
- Complete data model and examples.
- Compatibility with Universal Document architecture.
- Appropriate privacy and security treatment.
- Harmonization with existing schemas.
- Implementability by independent parties.
- Appropriate licensing classification.
- Sufficient migration and versioning guidance.

### 3.5 Step 5: Approval, Publication, and Maturity Assignment

Approved schemas are published in the registry with a maturity level:

| Level | Name | Meaning | Typical use |
| --- | --- | --- | --- |
| 0 | Draft | Published for testing, feedback, and limited pilots. Breaking changes may occur. | Experiments, proofs of concept, early implementers |
| 1 | Recommended | Reviewed and suitable for production adoption. Changes follow semantic versioning. | Production deployments where formal standard status is not required |
| 2 | Standard | Stable, broadly reviewed, and approved as a registry standard. Breaking changes require board approval and migration guidance. | Cross-organization, regulated, or public-sector exchange |

Each published schema record includes:

- Registry identifier.
- Version number.
- Maturity level.
- Publication date.
- Maintainer contact.
- License class.
- Changelog.
- Supported versions.
- National PKI validation requirements, if any.
- Deprecation status, if any.

### 3.6 Appeals

A submitter may appeal a rejection, required harmonization change, or maturity assignment within 30 calendar days of the board decision. Appeals are reviewed by board members who were not conflicted in the original decision. The appeal outcome is published in the schema record.

---

## 4. Version Control and Lifecycle

### 4.1 Semantic Versioning

Schemas use semantic versioning in the form:

```text
major.minor.patch
```

Version rules:

- **Major:** Incompatible structural or semantic changes, removed fields, changed required fields, changed validation semantics, or changed cryptographic validation requirements.
- **Minor:** Backward-compatible additions, optional fields, new examples, new extensions, or expanded enumerations that do not break existing valid documents.
- **Patch:** Editorial fixes, clarifications, non-normative examples, typo corrections, or validation fixes that do not alter intended compatibility.

### 4.2 Support Window

The registry supports the latest two published versions of each approved schema.

Support includes:

- Public availability in the registry.
- Validation metadata.
- Changelog and migration notes.
- Notification eligibility.
- Security and compatibility advisories.

Older versions remain archived for provenance and auditability but are not actively maintained unless the Schema Review Board grants an exception for legal, archival, or public-sector continuity.

### 4.3 Version Notifications

Registered users may subscribe to schema-level and domain-level notifications.

Notifications are sent for:

- New schema publication.
- Maturity-level changes.
- Major, minor, and patch releases.
- Deprecation notices.
- Security advisories.
- Cryptographic algorithm changes affecting validation.
- National PKI trust-anchor changes affecting schema use.

Notification records are retained by UDF to support auditability.

### 4.4 Deprecation

A schema version may be deprecated when it is superseded, insecure, legally obsolete, or no longer interoperable.

Deprecation notices include:

- Affected schema and versions.
- Reason for deprecation.
- Replacement version or alternative schema.
- Migration guidance.
- Effective date.
- Validation behavior after deprecation.

---

## 5. Licensing and Fee Structure

### 5.1 Open Public Schemas

Public schemas are released under Creative Commons Attribution 4.0 International (CC BY 4.0). They may be copied, implemented, profiled, and redistributed subject to attribution requirements.

Open public schemas are appropriate for:

- Public-sector interoperability.
- Healthcare safety and continuity-of-care schemas.
- Legal aid, consumer rights, and access-to-justice schemas.
- Education, research, accessibility, and civic schemas.
- Any schema intended for unrestricted public implementation.

### 5.2 Commercial Schema Registration

Commercial schema registration is available for proprietary, product-specific, or private-sector schemas that benefit from registry discoverability, validation, and version notification.

Fee:

| Item | Fee |
| --- | ---: |
| Commercial schema registration | USD 99 per schema per year |

Commercial registration includes:

- Registry identifier reservation.
- Publication of schema metadata.
- Version records and changelog.
- Notification support for registered users.
- Validation metadata for supported versions.

Commercial registration does not transfer ownership of proprietary schema content to UDF. Submitters must grant UDF sufficient rights to publish the registered schema metadata and validation artifacts necessary for registry operation.

### 5.3 Revenue Allocation

Commercial registration revenue is allocated as follows:

| Recipient | Share | Use |
| --- | ---: | --- |
| UDF | 70% | Registry stewardship, review operations, public documentation, policy administration, and transparency reporting |
| Maintenance reserve | 30% | Infrastructure, validation services, security maintenance, archival storage, and incident response |

UDF publishes aggregate annual revenue and allocation data in the registry transparency report.

### 5.4 Fee Waivers

UDF may waive commercial fees for public-benefit use, open-source maintainers, humanitarian response, academic research, or small organizations where fees would block meaningful interoperability. Waivers are recorded internally and summarized in aggregate transparency reporting.

---

## 6. Integration with National PKIs

The registry supports document validation against national public key infrastructures and recognized trust frameworks.

Initial supported frameworks:

- Estonia's X-Road ecosystem and associated national trust anchors.
- Sweden's BankID identity infrastructure.
- European Union eIDAS trust services.

### 6.1 Trust-Anchor Management

UDF maintains a registry trust-anchor policy that defines:

- Accepted national root certificates and trust lists.
- Certificate-chain validation rules.
- Revocation checking requirements.
- Timestamp and signing-time validation rules.
- Jurisdiction-specific constraints.
- Update and emergency-removal procedures.

Trust-anchor updates are treated as registry security events and trigger notifications to affected registered users.

### 6.2 Schema-Level PKI Requirements

A schema may declare national PKI requirements when document validity depends on a national identity, signing, or trust framework.

Schema records may specify:

- Required trust framework.
- Required certificate profile.
- Accepted signing certificate types.
- Revocation method.
- Timestamp authority requirements.
- Validation error behavior.

### 6.3 Validation Behavior

Registry validation tools should verify:

- The document conforms to the declared schema version.
- The document signature chains to an accepted national root certificate or trust list when required.
- The signing certificate was valid and not revoked at signing time.
- The signature algorithm was permitted under the active UDF algorithm list at signing time.
- Any schema-specific identity or jurisdiction constraint is satisfied.

---

## 7. Crypto-Agility Policy

### 7.1 Algorithm List

UDF maintains the official registry algorithm list. The list is reviewed and updated at least annually.

The algorithm list classifies each algorithm as:

- **Required:** Implementations must support it for conforming validation.
- **Recommended:** Implementations should support it for new deployments.
- **Permitted:** Implementations may support it for compatibility.
- **Deprecated:** Implementations may validate existing documents but should not use it for new signatures.
- **Prohibited:** Implementations must reject it for new validation except where archival policy explicitly allows historical verification.

### 7.2 Annual Review

The annual cryptographic review considers:

- Public cryptanalysis.
- National and international standards guidance.
- Post-quantum migration status.
- National PKI compatibility.
- Implementer readiness.
- Impact on archived Universal Documents.

Changes are approved by the Schema Review Board after UDF prepares a technical recommendation. Emergency changes may be made outside the annual cycle when material security risk is identified.

### 7.3 Ed25519 Deprecation and ML-DSA Requirement

The registry adopts the following policy:

- Ed25519 remains permitted for compatibility until its deprecation date.
- Ed25519 is deprecated in 2035.
- ML-DSA is required for conforming post-2035 registry signing and validation profiles.

Before 2035, UDF will publish migration profiles that define dual-signature, re-signing, and archival-verification expectations. The registry should support documents that carry both a classical signature and an ML-DSA signature during the transition period.

### 7.4 Deprecation Timeline Requirements

Cryptographic deprecation notices must include:

- Affected algorithms.
- Reason for deprecation.
- Effective date.
- Required replacement algorithm.
- Impact on existing documents.
- Migration tooling or validation-profile updates.
- Exceptions for archival verification, if any.

---

## 8. Compliance, Transparency, and Records

UDF maintains auditable records for:

- Schema Creation Requests.
- Working group impact-analysis reports.
- Harmonization decisions.
- Board decisions and votes.
- Published schema versions.
- Maturity changes.
- Commercial registration status.
- Fee allocations.
- National PKI trust-anchor changes.
- Cryptographic algorithm-list changes.

Public transparency reporting includes aggregate counts and non-confidential decision summaries. Commercially sensitive schema content, personal data, and security-sensitive trust-anchor operational details may be withheld where necessary.

---

## 9. Minimum Registry Data Model

Each registry entry should include at least:

```json
{
  "registry_id": "udsr.healthcare.discharge-summary",
  "name": "Discharge Summary",
  "domain": "healthcare",
  "version": "1.2.0",
  "maturity": 1,
  "license": "CC-BY-4.0",
  "maintainer": "Universal Document Foundation",
  "published_at": "2026-06-30",
  "supported_versions": ["1.2.0", "1.1.0"],
  "status": "active",
  "pki_requirements": {
    "required": false,
    "frameworks": []
  },
  "crypto_profile": {
    "signature_algorithms": ["Ed25519", "ML-DSA"],
    "hash_algorithms": ["SHA-256", "SHA-384"]
  }
}
```

---

## 10. Summary Fee Schedule

| Category | Fee | License | Registry support |
| --- | ---: | --- | --- |
| Open public schema | USD 0 | CC BY 4.0 | Publication, versioning, notifications, validation metadata |
| Commercial schema | USD 99/year/schema | Submitter-defined, with registry publication rights | Identifier reservation, metadata publication, versioning, notifications, validation metadata |
| Public-benefit waiver | USD 0 | Case-specific | Same as approved schema class |

Revenue from commercial schemas is split 70% to UDF stewardship and 30% to maintenance reserve.

