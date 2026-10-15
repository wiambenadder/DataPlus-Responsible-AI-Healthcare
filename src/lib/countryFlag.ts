const COUNTRY_CODES: Record<string, string> = {
  "united states": "US", "usa": "US", "united kingdom": "GB", "uk": "GB",
  "canada": "CA", "france": "FR", "germany": "DE", "spain": "ES",
  "italy": "IT", "netherlands": "NL", "switzerland": "CH", "sweden": "SE",
  "india": "IN", "china": "CN", "japan": "JP", "south korea": "KR",
  "brazil": "BR", "mexico": "MX", "australia": "AU", "nigeria": "NG",
  "kenya": "KE", "south africa": "ZA", "egypt": "EG", "morocco": "MA",
  "tunisia": "TN", "lebanon": "LB", "jordan": "JO", "saudi arabia": "SA",
  "united arab emirates": "AE", "uae": "AE", "qatar": "QA", "turkey": "TR",
  "rwanda": "RW", "uganda": "UG", "tanzania": "TZ", "ghana": "GH",
  "ethiopia": "ET", "senegal": "SN", "malawi": "MW", "zambia": "ZM",
  "zimbabwe": "ZW", "mozambique": "MZ", "cameroon": "CM", "burundi": "BI",
  "democratic republic of the congo": "CD", "drc": "CD", "côte d'ivoire": "CI",
  "cote d'ivoire": "CI", "ivory coast": "CI", "sierra leone": "SL", "liberia": "LR",
  "mali": "ML", "niger": "NE", "burkina faso": "BF", "botswana": "BW", "namibia": "NA",
  "madagascar": "MG", "somalia": "SO", "sudan": "SD", "south sudan": "SS",
  "pakistan": "PK", "bangladesh": "BD", "nepal": "NP", "sri lanka": "LK",
  "indonesia": "ID", "philippines": "PH", "vietnam": "VN", "thailand": "TH",
  "malaysia": "MY", "colombia": "CO", "peru": "PE", "chile": "CL", "argentina": "AR",
  "guatemala": "GT", "haiti": "HT", "united states of america": "US",
  // add any others your users are likely to enter
};

export function countryFlag(country?: string | null): string {
  if (!country) return "";
  const code = COUNTRY_CODES[country.trim().toLowerCase()];
  if (!code) return "🌍"; // fallback for unrecognized names
  // Convert ISO code letters to regional-indicator emoji
  return [...code].map(c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join("");
}
