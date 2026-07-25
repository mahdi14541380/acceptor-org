import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getUsdtDepositStatus } from "@/lib/darimarket";

// Real status values from the darimarket API docs: pending | paid | expired | review | rejected
const CONFIRMED_STATUSES = ["paid"];
const FAILED_STATUSES = ["expired", "rejected"];
// "review" means a human is checking it manually — treat as still pending for the user.

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const service = createServiceRoleClient();

  const { data: topup } = await service
    .from("topups")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!topup) {
    return NextResponse.json({ error: "Top-up not found" }, { status: 404 });
  }

  // Already settled — don't hit darimarket again, and never double-credit.
  if (topup.status === "confirmed" || topup.status === "failed") {
    return NextResponse.json({ status: topup.status });
  }

  if (!topup.provider_payment_id) {
    console.log(
      `[topup/status] topup ${topup.id} never got a deposit_id from darimarket (create request must have failed) — marking as failed.`
    );
    await service.from("topups").update({ status: "failed" }).eq("id", topup.id);
    return NextResponse.json({ status: "failed" });
  }

  try {
    const deposit = await getUsdtDepositStatus(topup.provider_payment_id);
    console.log(`[topup/status] deposit ${topup.provider_payment_id} raw response:`, deposit);

    if (CONFIRMED_STATUSES.includes(deposit.status)) {
      const { data: balanceRow } = await service
        .from("balances")
        .select("amount_usd")
        .eq("user_id", user.id)
        .single();

      const newAmount = Number(balanceRow?.amount_usd ?? 0) + Number(topup.amount_usd);

      await service
        .from("balances")
        .update({ amount_usd: newAmount, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      await service
        .from("topups")
        .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
        .eq("id", topup.id);

      return NextResponse.json({ status: "confirmed", balance: newAmount });
    }

    if (FAILED_STATUSES.includes(deposit.status)) {
      await service.from("topups").update({ status: "failed" }).eq("id", topup.id);
      return NextResponse.json({ status: "failed" });
    }

    if (deposit.status === "review") {
      return NextResponse.json({ status: "review" });
    }

    return NextResponse.json({ status: "pending" });
  } catch (err) {
    console.error(`[topup/status] deposit ${topup.provider_payment_id} check failed:`, err);
    return NextResponse.json(
      { status: "pending", warning: "Could not reach darimarket", detail: String(err) },
      { status: 200 }
    );
  }
}
