// Bundled sample report shown when a user clicks "Try sample report" on
// the landing input. Gives first-visit users a one-click demo path.
//
// Contents are a synthetic lumbar spine MRI report. No real PHI; no real
// patient. The wording is a composite of typical radiology phrasing so the
// AI/fallback pipeline has realistic terms (stenosis, disc bulge, facet
// arthropathy) to glossarise.

export const SAMPLE_REPORT = `MRI LUMBAR SPINE WITHOUT CONTRAST

Findings: Mild multilevel degenerative changes. At L4-L5 there is a moderate broad-based disc bulge with facet arthropathy causing moderate central canal stenosis and mild bilateral foraminal narrowing. No acute fracture. Conus is normal.

Impression: Degenerative disc disease most pronounced at L4-L5.`;
