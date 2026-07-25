import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { createUsdtDeposit } from "@/lib/darimarket";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { amount_usd, network } = await request.json();
  if (!amount_usd || amount_usd <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const service = createServiceRoleClient();

  // 1. Record a pending top-up row first.
  const { data: topup, error: insertError } = await service
    .from("topups")
    .insert({
      user_id: user.id,
      provider: "darimarket",
      amount_usd,
      pay_currency: network ?? "trc20",
      status: "pending",
    })
    .select()
    .single();

  if (insertError || !topup) {
    return NextResponse.json({ error: "Could not start top-up" }, { status: 500 });
  }

  // 2. Ask darimarket for a USDT deposit address.
  // Assumes 1 USDT ≈ 1 USD — adjust here if darimarket wants a different unit.
  try {
    const deposit = await createUsdtDeposit({
      network: network ?? "trc20",
      amount: amount_usd,
    });
    console.log(`[topup/create] darimarket raw response:`, deposit);

    const { error: updateError } = await service
      .from("topups")
      .update({
        provider_payment_id: String(deposit.deposit_id),
        deposit_address: deposit.address,
      })
      .eq("id", topup.id);

    if (updateError) {
      console.error(`[topup/create] failed to save deposit_id/address:`, updateError);
    }

    return NextResponse.json({
      topupId: topup.id,
      depositId: deposit.deposit_id,
      payAddress: deposit.address,
      payAmount: deposit.expected_amount,
      network: deposit.network,
    });
  } catch (err) {
    await service.from("topups").update({ status: "failed" }).eq("id", topup.id);
    return NextResponse.json(
      { error: "Payment provider error", detail: String(err) },
      { status: 502 }
    );
  }
}
