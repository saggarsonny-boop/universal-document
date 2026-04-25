# The Lease
### A document that proves itself

---

A commercial lease begins its life as a Word document. Twelve pages, tracked changes, three versions in an email thread, no one entirely certain which is current. The tenant's solicitor converts it to a Universal Document using the conversion tool. The clauses become blocks. The parties become structured metadata. The rent, the term, the break options — each is a discrete, queryable object. The file is a `.udr`: revisable, in negotiation, not yet sealed.

**converter.hive.baby** — Word document becomes Universal Document. Structure replaces formatting. The lease now knows what it contains.

---

The document is marked under negotiation. Not with a diagonal watermark stamped across each page — a visual convention that means nothing to any machine — but with a structural status flag in the manifest: `status: "under_negotiation"`. Any system that reads this document knows its state without parsing prose. The flag travels with the file.

**utilities.hive.baby/watermark** — Status flag applied. Machine-readable. The document knows it is not yet final.

---

The landlord returns an amended version. The comparison tool performs a structural diff — block by block, clause by clause. The rent has changed from £4,200 per month to £4,500. A break clause has been inserted at month eighteen. These are not tracked changes in a margin. They are structural differences between two document versions, surfaced precisely and machine-readably.

**utilities.hive.baby/compare** — Amendments identified. Two changes. Nothing hidden.

---

Both parties agree the final terms. The document is signed. The tenant's signature is embedded in the seal envelope. The landlord's signature is embedded alongside it, each with a cryptographic timestamp. A SHA-256 hash is computed across the entire block tree — across every clause, every figure, every obligation. The registry record is written. The `.udr` becomes a `.uds`. The document is now a fact.

**signer.hive.baby** — Hash: `f71a9e3d…3bc2`. Two signatures. Registry record written. The document cannot be altered without the alteration being visible.

---

The notarisation is recorded. Not as a separate certificate issued by a third party, not as a scanned stamp attached to the back of the document, but as a custody event inside the file itself. Jurisdiction: Cook County, Illinois. Notary identifier. Timestamp. The notarisation is structural metadata, as much a part of the document as the rent figure.

**utilities.hive.baby/notarize** — Custody event recorded. The document knows it has been notarised.

---

Three years later, the landlord disputes the break clause. The tenant opens the original `.uds` in the Reader. The hash matches the registry exactly. The document is confirmed unchanged since the moment of signing. The break clause is present. The date is unambiguous. The Reader displays the verification status. No solicitor is required to establish authenticity. No court filing is needed to prove the document is what it purports to be.

**reader.hive.baby** — Hash verified. Registry confirmed. Unchanged since signing. The document proves itself.

---

One file. One truth.

This is what PDF cannot do.

---

*Universal Document™ Incorporated · April 2026 · CC BY 4.0*
