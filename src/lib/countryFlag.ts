const COUNTRY_CODES: Record<string, string> = {
  "united states": "US", "usa": "US", "united kingdom": "GB", "uk": "GB",
  "canada": "CA", "france": "FR", "germany": "DE", "spain": "ES",
  "italy": "IT", "netherlands": "NL", "switzerland": "CH", "sweden": "SE",
  "india": "IN", "china": "CN", "japan": "JP", "south korea": "KR",
  "brazil": "BR", "mexico": "MX", "australia": "AU", "nigeria": "NG",
  "kenya": "KE", "south africa": "ZA", "egypt": "EG", "morocco": "MA",
  "tunisia": "TN", "lebanon": "LB", "jordan": "JO", "saudi arabia": "SA",
  "united arab emirates": "AE", "uae": "AE", "qatar": "QA", "turkey": "TR",
  // add any others your users are likely to enter
};

export function countryFlag(country?: string | null): string {
  if (!country) return "";
  const code = COUNTRY_CODES[country.trim().toLowerCase()];
  if (!code) return "🌍"; // fallback for unrecognized names
  // Convert ISO code letters to regional-indicator emoji
  return [...code].map(c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join("");
}
