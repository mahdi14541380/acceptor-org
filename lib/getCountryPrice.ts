import "server-only";
import { continents } from "@/lib/countries";
import { createServiceRoleClient } from "@/lib/supabase/server";

export type Tier = "old" | "new";

// All prices below (static and DB overrides) are USD price per single Star —
// multiply by quantity to get an order total. "old" = aged accounts (faster
// delivery), "new" = newer accounts (slower delivery).
export function getStaticPrice(countryKey: string, tier: Tier): number | null {
  for (const continent of continents) {
    const found = continent.countries?.find((c) => c.key === countryKey);
    if (found) return tier === "old" ? found.price : found.priceNew;
  }
  return null;
}

// Returns { key: { old, new } } for every country that has an admin-set override
// (only the tiers that were actually edited are present).
export async function getPriceOverrides(): Promise<
  Record<string, { old?: number; new?: number }>
> {
  const service = createServiceRoleClient();
  const { data } = await service
    .from("country_prices")
    .select("country_key, price_old, price_new");
  const map: Record<string, { old?: number; new?: number }> = {};
  for (const row of data ?? []) {
    map[row.country_key] = {
      old: row.price_old !== null ? Number(row.price_old) : undefined,
      new: row.price_new !== null ? Number(row.price_new) : undefined,
    };
  }
  return map;
}

export async function getEffectivePrice(
  countryKey: string,
  tier: Tier
): Promise<number | null> {
  const service = createServiceRoleClient();
  const { data } = await service
    .from("country_prices")
    .select("price_old, price_new")
    .eq("country_key", countryKey)
    .maybeSingle();

  const override = data ? (tier === "old" ? data.price_old : data.price_new) : null;
  if (override !== null && override !== undefined) return Number(override);
  return getStaticPrice(countryKey, tier);
}
