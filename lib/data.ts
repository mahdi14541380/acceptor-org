export type Service = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  tiers: { label: string; price: string; note?: string }[];
};

// Edit this array to add, remove, or reprice services. This is the single
// source of truth for the /services and /pricing pages.
// Telegram Stars pricing lives in lib/countries.ts (priced per country) and
// is shown on its own page at /pricing/stars — it isn't listed here.
export const services: Service[] = [
  {
    slug: "other",
    name: "Other Telegram services",
    tagline: "Emoji packs, reactions & more",
    description:
      "Additional add-ons for your Telegram presence: custom emoji packs, premium reactions, and channel boosts.",
    tiers: [
      { label: "Emoji pack license", price: "From $9.00" },
      { label: "Channel boosts (x4)", price: "$14.00" },
      { label: "Custom quote — contact us", price: "—" },
    ],
  },
];
