import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getEffectivePrice } from "@/lib/getCountryPrice";
import { buyProduct, findProductIdForCountry } from "@/lib/darimarket";
import { countryNames } from "@/lib/i18n/countryNames";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { countryKey, tier, quantity, telegramUsername } = await request.json();
  if (
    !countryKey ||
    (tier !== "old" && tier !== "new") ||
    !quantity ||
    quantity <= 0 ||
    !telegramUsername
  ) {
    return NextResponse.json(
      { error: "countryKey, tier, quantity, and telegramUsername are required" },
      { status: 400 }
    );
  }

  const pricePerStar = await getEffectivePrice(countryKey, tier);
  if (pricePerStar === null) {
    return NextResponse.json({ error: "Unknown country" }, { status: 400 });
  }
  const totalCost = pricePerStar * quantity;

  const countryName = countryNames[countryKey]?.en;
  if (!countryName) {
    return NextResponse.json({ error: "Unknown country" }, { status: 400 });
  }

  const service = createServiceRoleClient();

  const { data: balanceRow } = await service
    .from("balances")
    .select("amount_usd")
    .eq("user_id", user.id)
    .single();

  const balance = Number(balanceRow?.amount_usd ?? 0);
  if (balance < totalCost) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 402 });
  }

  // 1. Reserve the order + deduct balance up front, then attempt sourcing via
  //    darimarket. If sourcing fails we refund. (A DB transaction/RPC is
  //    safer than this two-step approach — worth upgrading later.)
  const { data: order, error: orderError } = await service
    .from("orders")
    .insert({
      user_id: user.id,
      country_key: countryKey,
      tier,
      quantity,
      telegram_username: telegramUsername,
      amount_usd: totalCost,
      status: "pending",
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }

  await service
    .from("balances")
    .update({ amount_usd: balance - totalCost, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  try {
    const productId = await findProductIdForCountry(countryName, tier as "old" | "new");
    if (!productId) {
      throw new Error(`No darimarket product found for country "${countryName}"`);
    }

    // items = [countryName] — confirmed by darimarket owner: not a recipient
    // username, just the country label for this order.
    const result = await buyProduct({
      product_id: productId,
      quantity,
      items: [countryName],
    });

    const isTerminal = result.status === "failed" || result.ready === true || result.download !== null;

    await service
      .from("orders")
      .update({
        status: isTerminal ? (result.status === "failed" ? "failed" : "completed") : "processing",
        provider_order_id: String(result.order_id),
        download_url: result.download?.url ?? null,
        download_token: result.download?.token ?? null,
        download_filename: result.download?.filename ?? null,
      })
      .eq("id", order.id);

    if (result.status === "failed") {
      // Refund since sourcing failed immediately.
      await service
        .from("balances")
        .update({ amount_usd: balance, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      status: isTerminal ? (result.status === "failed" ? "failed" : "completed") : "processing",
      downloadUrl: result.download ? `/api/downloads/${result.download.token}` : null,
    });
  } catch (err) {
    // Refund on failure to even place the order.
    await service
      .from("balances")
      .update({ amount_usd: balance, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    await service
      .from("orders")
      .update({ status: "failed", error_message: String(err) })
      .eq("id", order.id);

    return NextResponse.json(
      { error: "Sourcing failed, balance refunded", detail: String(err) },
      { status: 502 }
    );
  }
}
