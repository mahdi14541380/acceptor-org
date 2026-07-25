export type Country = {
  key: string; // stable id — used to look up translated names in lib/i18n/countryNames.ts
  flag: string;
  dialCode: string;
  price: number; // "old" tier price (faster delivery)
  priceNew: number; // "new" tier price (slower delivery)
  available?: number;
};

export type Continent = {
  key: string; // used to look up translated continent labels in the dictionaries
  flag: string;
  countries: Country[] | null; // null = "coming soon" continent
};

// Prices are per Stars order for that country/region's Telegram pricing tier.
// Edit freely — this file is the single source of truth for /pricing/stars.
// To rename a country, edit its translation in lib/i18n/countryNames.ts (not here).
export const continents: Continent[] = [
  {
    key: "europe",
    flag: "🇪🇺",
    countries: [
      { key: "italy", flag: "🇮🇹", dialCode: "39", price: 0.95, priceNew: 0.95 },
      { key: "estonia", flag: "🇪🇪", dialCode: "372", price: 0.85, priceNew: 0.85, available: 11362 },
      { key: "austria", flag: "🇦🇹", dialCode: "43", price: 0.85, priceNew: 0.85 },
      { key: "ireland", flag: "🇮🇪", dialCode: "353", price: 0.85, priceNew: 0.85 },
      { key: "kazakhstan", flag: "🇰🇿", dialCode: "7", price: 0.98, priceNew: 0.98 },
      { key: "albania", flag: "🇦🇱", dialCode: "355", price: 0.95, priceNew: 0.95 },
      { key: "portugal", flag: "🇵🇹", dialCode: "351", price: 0.95, priceNew: 0.95 },
      { key: "romania", flag: "🇷🇴", dialCode: "40", price: 0.95, priceNew: 0.95 },
      { key: "armenia", flag: "🇦🇲", dialCode: "374", price: 1.38, priceNew: 1.38 },
      { key: "netherlands", flag: "🇳🇱", dialCode: "31", price: 1.20, priceNew: 1.20 },
      { key: "iceland", flag: "🇮🇸", dialCode: "354", price: 1.35, priceNew: 1.35 },
      { key: "serbia", flag: "🇷🇸", dialCode: "381", price: 1.05, priceNew: 1.05 },
      { key: "germany", flag: "🇩🇪", dialCode: "49", price: 1.25, priceNew: 1.25 },
      { key: "poland", flag: "🇵🇱", dialCode: "48", price: 1.95, priceNew: 1.95 },
      { key: "monaco", flag: "🇲🇨", dialCode: "377", price: 1.75, priceNew: 1.75 },
      { key: "spain", flag: "🇪🇸", dialCode: "34", price: 1.35, priceNew: 1.35 },
      { key: "luxembourg", flag: "🇱🇺", dialCode: "352", price: 1.15, priceNew: 1.15 },
      { key: "denmark", flag: "🇩🇰", dialCode: "45", price: 1.85, priceNew: 1.85 },
      { key: "latvia", flag: "🇱🇻", dialCode: "371", price: 1.65, priceNew: 1.65 },
      { key: "switzerland", flag: "🇨🇭", dialCode: "41", price: 2.65, priceNew: 2.65 },
      { key: "czechia", flag: "🇨🇿", dialCode: "420", price: 1.85, priceNew: 1.85 },
      { key: "turkey", flag: "🇹🇷", dialCode: "90", price: 0.88, priceNew: 0.88 },
      { key: "northMacedonia", flag: "🇲🇰", dialCode: "389", price: 1.35, priceNew: 1.35 },
      { key: "ukraine", flag: "🇺🇦", dialCode: "380", price: 2.15, priceNew: 2.15 },
    ],
  },
  {
    key: "asia",
    flag: "🌏",
    countries: [
      { key: "afghanistan", flag: "🇦🇫", dialCode: "93", price: 0.48, priceNew: 0.48 },
      { key: "azerbaijan", flag: "🇦🇿", dialCode: "994", price: 1.38, priceNew: 1.38 },
      { key: "bhutan", flag: "🇧🇹", dialCode: "975", price: 1.08, priceNew: 1.08 },
      { key: "cambodia", flag: "🇰🇭", dialCode: "855", price: 1.18, priceNew: 1.18 },
      { key: "china", flag: "🇨🇳", dialCode: "86", price: 0.93, priceNew: 0.93 },
      { key: "georgia", flag: "🇬🇪", dialCode: "995", price: 1.58, priceNew: 1.58 },
      { key: "hongKong", flag: "🇭🇰", dialCode: "852", price: 0.88, priceNew: 0.88 },
      { key: "india", flag: "🇮🇳", dialCode: "91", price: 0.33, priceNew: 0.33 },
      { key: "iran", flag: "🇮🇷", dialCode: "98", price: 0.36, priceNew: 0.36 },
      { key: "iraq", flag: "🇮🇶", dialCode: "964", price: 2.08, priceNew: 2.08 },
      { key: "japan", flag: "🇯🇵", dialCode: "81", price: 1.18, priceNew: 1.18 },
      { key: "jordan", flag: "🇯🇴", dialCode: "962", price: 1.08, priceNew: 1.08 },
      { key: "southKorea", flag: "🇰🇷", dialCode: "82", price: 2.70, priceNew: 2.70 },
      { key: "kuwait", flag: "🇰🇼", dialCode: "965", price: 0.98, priceNew: 0.98 },
      { key: "kyrgyzstan", flag: "🇰🇬", dialCode: "996", price: 1.08, priceNew: 1.08 },
      { key: "lebanon", flag: "🇱🇧", dialCode: "961", price: 0.98, priceNew: 0.98 },
      { key: "malaysia", flag: "🇲🇾", dialCode: "60", price: 0.63, priceNew: 0.63 },
      { key: "maldives", flag: "🇲🇻", dialCode: "960", price: 1.08, priceNew: 1.08 },
      { key: "mongolia", flag: "🇲🇳", dialCode: "976", price: 1.18, priceNew: 1.18 },
      { key: "nepal", flag: "🇳🇵", dialCode: "977", price: 0.58, priceNew: 0.58 },
      { key: "oman", flag: "🇴🇲", dialCode: "968", price: 1.58, priceNew: 1.58 },
      { key: "pakistan", flag: "🇵🇰", dialCode: "92", price: 0.43, priceNew: 0.43 },
      { key: "philippines", flag: "🇵🇭", dialCode: "63", price: 0.43, priceNew: 0.43 },
      { key: "qatar", flag: "🇶🇦", dialCode: "974", price: 1.88, priceNew: 1.88 },
      { key: "saudiArabia", flag: "🇸🇦", dialCode: "966", price: 0.93, priceNew: 0.93 },
      { key: "sriLanka", flag: "🇱🇰", dialCode: "94", price: 0.73, priceNew: 0.73 },
      { key: "syria", flag: "🇸🇾", dialCode: "963", price: 1.08, priceNew: 1.08 },
      { key: "taiwan", flag: "🇹🇼", dialCode: "886", price: 1.28, priceNew: 1.28 },
      { key: "tajikistan", flag: "🇹🇯", dialCode: "992", price: 0.63, priceNew: 0.63 },
      { key: "thailand", flag: "🇹🇭", dialCode: "66", price: 0.63, priceNew: 0.63 },
      { key: "timorLeste", flag: "🇹🇱", dialCode: "670", price: 0.58, priceNew: 0.58 },
      { key: "turkmenistan", flag: "🇹🇲", dialCode: "993", price: 0.68, priceNew: 0.68 },
      { key: "uae", flag: "🇦🇪", dialCode: "971", price: 1.78, priceNew: 1.78 },
      { key: "uzbekistan", flag: "🇺🇿", dialCode: "998", price: 0.58, priceNew: 0.58 },
      { key: "vietnam", flag: "🇻🇳", dialCode: "84", price: 0.66, priceNew: 0.66 },
      { key: "yemen", flag: "🇾🇪", dialCode: "967", price: 0.73, priceNew: 0.73 },
    ],
  },
  {
    key: "northAmerica",
    flag: "🌎",
    countries: [
      { key: "unitedStates", flag: "🇺🇸", dialCode: "1", price: 0.31, priceNew: 0.31 },
      { key: "canada", flag: "🇨🇦", dialCode: "1", price: 0.30, priceNew: 0.30 },
    ],
  },
  { key: "africa", flag: "🌍", countries: null },
  { key: "southAmerica", flag: "🌎", countries: null },
  { key: "oceania", flag: "🌏", countries: null },
];
