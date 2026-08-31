// Journey-stage sections for The Road store. Slugs must match the `category`
// values written by prisma/seed.js (CAT map) — products are grouped by the
// category column in the DB, never by hardcoded product lists.
export interface StoreSection {
  slug: string;
  label: string;
  blurb: string;
}

export const STORE_SECTIONS: StoreSection[] = [
  { slug: 'just-arrested', label: 'Just Arrested / First Days', blurb: 'The first 72 hours, bail, and immediate decisions.' },
  { slug: 'facing-charges', label: 'Facing Charges', blurb: 'Understanding the case against you and choosing your defense.' },
  { slug: 'before-sentencing', label: 'Before Sentencing', blurb: 'Mitigation, character letters, and preparing the court to see you.' },
  { slug: 'sentencing-surrender', label: 'Sentencing & Surrender', blurb: 'The sentencing day and preparing to report.' },
  { slug: 'on-supervision', label: 'On Supervision', blurb: 'Probation, supervised release, and coming home.' },
  { slug: 'money-family', label: 'Money & Family', blurb: 'Protecting your household through the case.' },
  { slug: 'after-the-case', label: 'After the Case: Rebuilding', blurb: 'Record relief, work, housing, and credit.' },
  { slug: 'professionals', label: 'For Professionals', blurb: 'References for case managers and supervision officers.' },
];

export const BUYER_FILTERS = [
  { value: 'defendant', label: 'Defendants' },
  { value: 'family', label: 'Family & Friends' },
  { value: 'after_case', label: 'After the Case' },
  { value: 'professional', label: 'Professionals' },
] as const;

// "Professionals" spans both professional buyer tags in the data.
export const PROFESSIONAL_BUYER_TAGS = ['institution', 'case_manager'];

export const BUYER_TAG_LABELS: Record<string, string> = {
  defendant: 'For defendants',
  family: 'For family & friends',
  case_manager: 'For case managers',
  after_case: 'After the case',
  institution: 'For professionals',
  defense_attorney: 'For defense attorneys',
};

export const SORT_OPTIONS = [
  { value: 'journey', label: 'Journey order' },
  { value: 'newest', label: 'Newest' },
  { value: 'price', label: 'Price: low to high' },
  { value: 'alpha', label: 'A to Z' },
] as const;
