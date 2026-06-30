# Universal Document Schema Registry Governance Model

## Document Control

- **Owner:** Universal Document Foundation (UDF)
- **Scope:** Governance of the Universal Document Schema Registry
- **Applies to:** All schemas, schema extensions, and schema lifecycle decisions
- **Status:** Proposed governance baseline

---

## 1. Purpose and Principles

The Universal Document Schema Registry exists to ensure schema interoperability, consistency, and long-term trust across domains. This governance model establishes:

1. Clear organizational accountability
2. A transparent registration and approval workflow
3. Versioning and support expectations for implementers
4. Sustainable licensing and maintenance funding
5. National PKI interoperability guardrails
6. A crypto-agility policy that can evolve with cryptographic standards

Guiding principles:

- **Openness by default:** Public utility schemas should be broadly reusable.
- **Harmonization over fragmentation:** New schemas should align with existing standards where possible.
- **Security and trust:** Registry decisions must account for document verification and cryptographic durability.
- **Predictable lifecycle management:** Users need clear maturity, support, and deprecation states.

---

## 2. Organizational Structure

### 2.1 Universal Document Foundation (UDF) - Stewardship

The UDF is the permanent steward of the registry and is responsible for:

- Operating the registry platform and publication infrastructure
- Maintaining governance policies, process documentation, and annual roadmap
- Appointing and rotating Schema Review Board members
- Chartering Technical Working Groups (TWGs) by domain
- Managing approved cryptographic algorithm lists and annual updates
- Administering licensing, billing, and revenue distribution
- Maintaining transparency reports (approvals, rejections, deprecations)

**Decision scope:** Strategic and operational stewardship, not routine schema-by-schema approval.

### 2.2 Schema Review Board (SRB) - Approval Authority

The Schema Review Board is the formal approval body for schema publication and lifecycle state changes.

- **Size:** 5-7 members
- **Composition:** Mixed expertise (schema design, security, compliance, implementation)
- **Term model:** Staggered fixed terms to ensure continuity
- **Quorum:** Minimum majority of seated members

Primary responsibilities:

- Review TWG recommendations and impact analyses
- Approve, request revision, or reject Schema Creation Requests
- Assign or confirm maturity levels at publication
- Approve breaking (major) version transitions and deprecation schedules
- Resolve cross-domain conflicts not settled in TWGs

### 2.3 Technical Working Groups (TWGs) - Domain Expertise

TWGs provide deep technical and sector-specific review before SRB consideration.

Initial TWG domains:

- Healthcare
- Finance
- Legal
- Government

Core duties:

- Conduct impact analysis for proposed schemas
- Evaluate overlap with existing registry artifacts
- Drive harmonization with adjacent schemas and data models
- Provide implementation guidance, constraints, and interoperability notes
- Recommend maturity level and release readiness to SRB

### 2.4 Registered Users - Community Participation

Any account holder is a Registered User and may:

- Submit Schema Creation Requests and version updates
- Comment on public consultation drafts
- Subscribe to schema/version notifications
- Adopt schemas according to maturity and support policies

Registered Users do not have direct approval authority unless they are also appointed to SRB or TWGs.

---

## 3. Registration and Approval Process

The process is modeled after Central Registry-style governance patterns used in Hong Kong public infrastructure workflows [citation:1][citation:2].

### 3.1 Stage 1: Schema Creation Request (SCR) Submission

A submitter files an SCR containing:

- Problem statement and domain context
- Proposed schema definition
- Compatibility and migration notes
- Security/privacy considerations
- Intended use cases and implementation examples

UDF Secretariat performs intake validation (completeness, formatting, identity checks).

### 3.2 Stage 2: TWG Impact Analysis

Relevant TWG performs structured analysis:

- Functional coverage and boundary definition
- Regulatory and domain compliance impact
- Data quality and semantic consistency concerns
- Operational implementation risk
- Security implications and PKI/verification impact

Output: **TWG Impact Analysis Report** with findings and recommendations.

### 3.3 Stage 3: Harmonization Review

Before formal approval routing, TWG and UDF jointly assess harmonization:

- Compare with existing registry schemas and extensions
- Identify duplicated fields, conflicting semantics, and namespace collisions
- Propose reuse, composition, or extension strategy
- Document required cross-schema mappings

Output: **Harmonization Note** attached to the SCR package.

### 3.4 Stage 4: Schema Review Board Decision

SRB reviews the full package (SCR + Impact Analysis + Harmonization Note) and issues one of:

- **Approved**
- **Approved with required edits**
- **Revisions required (resubmission)**
- **Rejected (with rationale)**

SRB can escalate specialized issues back to TWG for focused rework.

### 3.5 Stage 5: Publication and Maturity Assignment

Upon SRB approval, UDF publishes the schema with maturity level:

- **Level 0 - Draft:** Experimental, feedback-oriented, no production guarantee
- **Level 1 - Recommended:** Stable for production with active adoption encouraged
- **Level 2 - Standard:** Normative baseline for broad interoperability

Publication package includes:

- Canonical schema artifact
- Changelog
- Compatibility statement
- Effective date and support timeline

---

## 4. Version Control and Support Policy

### 4.1 Semantic Versioning

All registry schemas follow semantic versioning:

- **MAJOR** (x.0.0): Breaking changes
- **MINOR** (0.x.0): Backward-compatible feature additions
- **PATCH** (0.0.x): Backward-compatible fixes/clarifications

### 4.2 Notification Policy

UDF sends version notifications to all registered users through:

- In-platform notifications
- Email alerts for subscribed domains/schemas
- Registry release feed/API updates

Notifications include impact category (breaking/non-breaking), migration guidance, and support window.

### 4.3 Supported Versions

Each schema maintains support for the **latest two versions** in line with Central Registry operational expectations [citation:2].

- New releases trigger support-window updates
- The oldest supported version enters sunset state with a published retirement date
- Security or integrity exceptions may accelerate deprecation with emergency notice

---

## 5. Licensing and Fee Structure

### 5.1 Open Schema Licensing

Schemas designated for public utility are published under **Creative Commons Attribution 4.0 (CC BY 4.0)**.

This permits reuse and adaptation with attribution, enabling broad ecosystem adoption.

### 5.2 Commercial Schema Registration

Commercial schema registration fee:

- **USD $99 per schema per year**

Applies to schemas registered for commercial/proprietary use where monetized or closed distribution is intended.

### 5.3 Revenue Distribution

Revenue from commercial schema registration is allocated as:

- **70% to UDF stewardship operations**
- **30% to schema maintenance and operational upkeep**

Maintenance allocation covers review operations, tooling reliability, backward compatibility work, and security updates.

---

## 6. Integration with National PKIs

The registry supports trust interoperability with national digital identity and trust ecosystems, including:

- Estonia X-Road
- Sweden BankID
- EU eIDAS trust framework

### 6.1 Trust Validation Requirements

Registry-aligned document validation must support:

- Verification chains anchored to recognized national root certificates
- Certificate path validation and revocation status checks
- Signature profile compatibility checks per relevant jurisdiction

### 6.2 Interoperability Profile Management

UDF maintains implementation profiles mapping schema usage to national PKI requirements, including:

- Accepted signature/container formats
- Identity assurance references
- Required trust list and root updates

Profiles are versioned and published alongside schema governance updates.

---

## 7. Crypto-Agility Policy

Cryptographic resilience is managed as a first-class governance function.

### 7.1 Algorithm List Governance

UDF maintains the approved algorithm registry and updates it **annually** (or sooner if urgent risk emerges).

For each algorithm, UDF publishes:

- Status (approved, restricted, deprecated, prohibited)
- Allowed use (signature, key exchange, hashing)
- Minimum key/security parameters
- Transition guidance

### 7.2 Required Transition Milestones

Per policy baseline [citation:7]:

- **Ed25519: Deprecated effective 2035**
- **ML-DSA: Required for compliant long-term signatures beginning 2035**

Implementers must plan dual-signature or migration strategies before enforcement dates.

### 7.3 Deprecation Lifecycle

Standard cryptographic deprecation phases:

1. **Notice phase:** Public announcement and migration guidance
2. **Restricted phase:** New registrations limited or conditionally approved
3. **Deprecated phase:** Existing use tolerated within support bounds
4. **Prohibited phase:** New and updated schemas must not use algorithm

Emergency security advisories may compress this lifecycle.

---

## 8. Governance Transparency and Compliance

To sustain trust, UDF publishes:

- SRB decision logs (with rationale summaries)
- TWG charters and membership rosters
- Annual algorithm list updates
- Version support and deprecation schedules
- Fee and maintenance allocation summaries

Non-compliance with registry policy may result in:

- Maturity level downgrade
- Mandatory remediation requirements
- Publication suspension or de-listing for severe violations

---

## 9. Operating Summary

This governance model establishes:

- **Clear authority:** UDF stewardship, SRB approvals, TWG technical vetting
- **Predictable process:** SCR intake -> impact analysis -> harmonization -> SRB decision -> publication
- **Stable lifecycle:** Semver discipline, latest-two-version support, proactive notifications
- **Sustainable economics:** Open licensing plus transparent commercial fee split
- **Trust interoperability:** National PKI-aware validation requirements
- **Future-proof security:** Annual crypto updates with explicit 2035 transition requirements

This document serves as the baseline governance framework for the Universal Document Schema Registry and should be revised through UDF-controlled change governance as the ecosystem matures.
