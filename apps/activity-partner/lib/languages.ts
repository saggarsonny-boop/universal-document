// 30 most-spoken languages worldwide (rough native + L2 speaker order).
// Used for the languages_spoken multi-select on profile setup.
// Codes are ISO 639-1 / BCP-47 primary subtags so they line up with the
// canonical Hive locale set (en, es, fr, ar, hi, zh, pt) used elsewhere.

export type LanguageOption = {
  code: string;
  label: string;
};

export const LANGUAGES: ReadonlyArray<LanguageOption> = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文 (Chinese)" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "es", label: "Español (Spanish)" },
  { code: "ar", label: "العربية (Arabic)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "pt", label: "Português (Portuguese)" },
  { code: "ru", label: "Русский (Russian)" },
  { code: "ur", label: "اردو (Urdu)" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "de", label: "Deutsch (German)" },
  { code: "ja", label: "日本語 (Japanese)" },
  { code: "sw", label: "Kiswahili (Swahili)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "tr", label: "Türkçe (Turkish)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "fr", label: "Français (French)" },
  { code: "vi", label: "Tiếng Việt (Vietnamese)" },
  { code: "ko", label: "한국어 (Korean)" },
  { code: "fa", label: "فارسی (Persian)" },
  { code: "it", label: "Italiano (Italian)" },
  { code: "pl", label: "Polski (Polish)" },
  { code: "uk", label: "Українська (Ukrainian)" },
  { code: "ms", label: "Bahasa Melayu (Malay)" },
  { code: "th", label: "ไทย (Thai)" },
  { code: "nl", label: "Nederlands (Dutch)" },
  { code: "el", label: "Ελληνικά (Greek)" },
  { code: "he", label: "עברית (Hebrew)" },
  { code: "ro", label: "Română (Romanian)" },
];

export const LANGUAGE_CODES = new Set(LANGUAGES.map((l) => l.code));

export function isValidLanguageCode(code: string): boolean {
  return LANGUAGE_CODES.has(code);
}
