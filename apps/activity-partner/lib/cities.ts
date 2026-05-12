// Static list of common world cities for the signup autocomplete.
// Deliberately not Google Maps API: profile creation is a privacy-sensitive
// surface, and a static list ships zero analytics or rate-limit risk.
// The list is short on purpose — covers the major metros across each
// canonical Hive locale region. Users in a city outside this list type
// their city as free text in Phase 1; Phase 2 will expand the list based
// on actual user demand surfaced through the moderation queue.

export const COMMON_CITIES: ReadonlyArray<string> = [
  // North America
  "New York", "Los Angeles", "Chicago", "San Francisco", "Toronto", "Mexico City",
  "Boston", "Seattle", "Austin", "Miami", "Vancouver", "Montreal",
  // Europe
  "London", "Paris", "Berlin", "Madrid", "Barcelona", "Rome", "Milan",
  "Amsterdam", "Lisbon", "Dublin", "Edinburgh", "Stockholm", "Copenhagen",
  // South America
  "São Paulo", "Rio de Janeiro", "Buenos Aires", "Bogotá", "Lima", "Santiago",
  // Africa + Middle East
  "Cairo", "Lagos", "Nairobi", "Cape Town", "Johannesburg", "Casablanca",
  "Dubai", "Tel Aviv", "Istanbul",
  // Asia
  "Mumbai", "Delhi", "Bangalore", "Singapore", "Bangkok", "Jakarta",
  "Hong Kong", "Taipei", "Tokyo", "Osaka", "Seoul", "Shanghai", "Beijing",
  // Oceania
  "Sydney", "Melbourne", "Auckland",
];

export function suggestCities(query: string, limit = 8): string[] {
  if (!query) return [];
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const out: string[] = [];
  for (const c of COMMON_CITIES) {
    if (c.toLowerCase().includes(q)) {
      out.push(c);
      if (out.length >= limit) break;
    }
  }
  return out;
}
