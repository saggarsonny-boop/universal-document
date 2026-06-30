# Universal Document Foundation — Charter

**Document ID:** UDF-CHARTER-001
**Version:** 1.0.0
**Status:** Draft
**Maintainer:** Sonny Saggar
**License:** CC BY 4.0
**Effective Date:** 2026-06-30
**Contact:** governance@universaldocument.org

---

## Table of Contents

1. [Preamble](#1-preamble)
2. [Legal Status](#2-legal-status)
3. [Mission and Scope](#3-mission-and-scope)
4. [Relationship to Other Governance Documents](#4-relationship-to-other-governance-documents)
5. [Stewardship](#5-stewardship)
6. [Membership](#6-membership)
7. [Funding and Transparency](#7-funding-and-transparency)
8. [Amendments](#8-amendments)
9. [Path to Formal Incorporation](#9-path-to-formal-incorporation)
10. [Glossary](#10-glossary)

---

## 1. Preamble

The Universal Document Foundation (UDF) exists to steward the Universal Document™ Standard (UD) — its specification, schema registry, and reference implementations — as an open, vendor-neutral public good, free from the control of any single commercial interest.

This charter establishes what UDF is, how it is currently constituted, and how decisions about the standard are made. It is the parent document for all other UDF governance material, including the [Schema Registry Governance Model](./schema-registry-governance.md).

## 2. Legal Status

**UDF is not currently an incorporated legal entity.** This section exists to state that plainly, because it has direct consequences that anyone dealing with UDF should understand:

- "Universal Document Foundation" is a name used for the stewardship and governance function described in this charter. It does not, at this time, refer to a registered nonprofit, corporation, or other separate legal person.
- Until UDF is incorporated (see [Section 9](#9-path-to-formal-incorporation)) or operates under a fiscal sponsor, all contracts, fee collection, and legal liability associated with UD fall to **Sonny Saggar**, operating as an individual/sole proprietor, not to "the Foundation."
- Contributions of money to UDF (such as commercial schema registration fees) are **not tax-deductible donations**. They are fees paid for a registration service, and should be described as such everywhere on the public site and in any invoicing — never as "donations" or "membership dues to a nonprofit."
- Free Membership in UDF (see [Section 6](#6-membership)) confers no legal rights, voting power over a legal entity, or fiduciary protections, because there is no legal entity yet for those rights to attach to. Membership is a governance-participation role, not a legal status.
- This is a deliberate, current-stage choice, not an oversight — see [Section 9](#9-path-to-formal-incorporation) for the conditions under which this will be revisited.

This section must be kept accurate as UDF's legal status changes. If UDF incorporates or enters a fiscal sponsorship arrangement, this section must be updated before any public-facing copy describes UDF as a nonprofit, foundation in the legal sense, or tax-exempt organization.

## 3. Mission and Scope

UDF's stewardship covers:

- The UD / iSDF specification and its versioning
- The public Schema Registry (governed in detail by the [Schema Registry Governance Model](./schema-registry-governance.md))
- The approved cryptographic algorithms list and crypto-agility policy
- Reference SDKs released under open licenses (iSDK)
- Public communication about the standard's roadmap and status

UDF does not, and will not:

- Provide individualized legal, medical, financial, or compliance advice to any user, schema submitter, or document signer
- Operate as a certificate authority (UDF integrates with existing national PKI infrastructure; it does not issue identity certificates itself)
- Claim conformance with standards (eIDAS, FIPS, ISO, etc.) that have not been formally assessed — public materials must describe alignment as "designed for" or "aligned with" a standard unless and until a real conformance assessment has been completed

## 4. Relationship to Other Governance Documents

This charter is the top-level document. Where it conflicts with a more specific governance document (e.g., the Schema Registry Governance Model), this charter controls on questions of UDF's legal status, mission, and stewardship structure; the more specific document controls on its own operational detail (registration process, fee schedule, SRB composition, etc.).

## 5. Stewardship

In the absence of an incorporated board, UDF is currently governed by a **Founding Steward**:

| Attribute | Detail |
|-----------|--------|
| **Founding Steward** | Sonny Saggar |
| **Authority** | Final decision-making on specification changes, SRB/TWG chair appointments, and fee policy, pending transition to a multi-steward council |
| **Accountability** | Publishes an annual public report covering registrations, revenue, and crypto-agility compliance (per Schema Registry Governance §2.2) |
| **Term** | Until the Stewards Council described below is seated, or UDF incorporates with a formal board |

### 5.1 Transition to a Stewards Council

UDF intends to move from single-steward to a multi-member **Stewards Council** once there is sufficient active Membership and Schema Review Board participation to support a meritocratic nomination process. The trigger conditions and nomination process will be published as an amendment to this charter when active development reaches that point — they are not fixed in advance, to avoid designing a process for a community that does not yet exist.

## 6. Membership

Anyone may register as a free UDF Member. Membership grants:

- The ability to submit Schema Creation Requests (per Schema Registry Governance §3)
- The ability to comment during public consultation periods
- Subscription to version and policy change notifications
- Eligibility to be nominated to a Technical Working Group or, in the future, the Schema Review Board

Membership does **not** grant equity, a vote that binds a legal entity, or any financial interest in UDF or its fee revenue, per the legal status described in [Section 2](#2-legal-status).

Commercial users registering schemas for a fee (per the Schema Registry fee schedule) are customers of a registration service, not members by virtue of payment alone — paid registration and free Membership are separate, independently-held statuses.

## 7. Funding and Transparency

UDF's only current revenue source is the commercial schema registration fee described in the Schema Registry Governance Model. All such fees are collected by Sonny Saggar individually (per [Section 2](#2-legal-status)) and allocated per the published revenue split, with an annual public accounting of amounts collected and how they were spent.

No other monetization mechanism (donations, paid memberships, sponsorships) is authorized under this charter without an amendment.

## 8. Amendments

This charter may be amended by the Founding Steward (or, once seated, the Stewards Council) following a minimum 30-day public comment period for any proposed change to Sections 2, 3, or 9. Editorial corrections (fixing contact details, typos, broken links) do not require the comment period.

## 9. Path to Formal Incorporation

UDF will consider formal incorporation, or operating under an existing nonprofit as a fiscally sponsored project, once at least one of the following is true:

- Annual commercial registration revenue makes individual tax/liability exposure (per Section 2) impractical to carry personally
- A government, standards body (e.g., ISO/TC 171), or major institutional partner requires UDF to be a distinct legal entity before engaging formally
- Active Membership and SRB participation reach a scale where a Stewards Council is seated and requests it

Until then, operating unincorporated is a deliberate choice to keep overhead low while the standard and its community are still being established — not a permanent position.

## 10. Glossary

| Term | Definition |
|------|------------|
| **UDF** | Universal Document Foundation — the stewardship function described in this charter, not currently a separate legal entity |
| **Founding Steward** | The individual currently holding final decision authority over UDF matters, pending a Stewards Council |
| **Member** | Any individual who has registered a free UDF account; confers governance-participation rights only, not legal/financial rights |
| **SRB** | Schema Review Board, defined in the Schema Registry Governance Model |
| **TWG** | Technical Working Group, defined in the Schema Registry Governance Model |
