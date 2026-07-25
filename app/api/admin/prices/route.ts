import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { getStaticPrice } from "@/lib/getCountryPrice";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { countryKey, tier, price } = await request.json();
  if (
    !countryKey ||
    (tier !== "old" && tier !== "new") ||
    typeof price !== "number" ||
    price <= 0
  ) {
    return NextResponse.json({ error: "Invalid countryKey, tier, or price" }, { status: 400 });
  }

  const service = createServiceRoleClient();

  // Preserve whichever tier isn't being updated right now.
  const { data: existing } = await service
    .from("country_prices")
    .select("price_old, price_new")
    .eq("country_key", countryKey)
    .maybeSingle();

  const priceOld =
    tier === "old" ? price : existing?.price_old ?? getStaticPrice(countryKey, "old");
  const priceNew =
    tier === "new" ? price : existing?.price_new ?? getStaticPrice(countryKey, "new");

  const { error } = await service.from("country_prices").upsert({
    country_key: countryKey,
    price_old: priceOld,
    price_new: priceNew,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: "Could not save price" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
