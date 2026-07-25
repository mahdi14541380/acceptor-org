import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getOrder } from "@/lib/darimarket";

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

  const { data: order } = await service
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Already settled — don't hit darimarket again.
  if (order.status === "completed" || order.status === "failed") {
    return NextResponse.json({
      status: order.status,
      downloadUrl: order.download_token ? `/api/downloads/${order.download_token}` : null,
    });
  }

  if (!order.provider_order_id) {
    return NextResponse.json({ status: "processing" });
  }

  try {
    const result = await getOrder(order.provider_order_id);

    if (result.status === "failed") {
      await service.from("orders").update({ status: "failed" }).eq("id", order.id);

      // Refund the balance since sourcing ultimately failed.
      const { data: balanceRow } = await service
        .from("balances")
        .select("amount_usd")
        .eq("user_id", user.id)
        .single();
      const refunded = Number(balanceRow?.amount_usd ?? 0) + Number(order.amount_usd);
      await service
        .from("balances")
        .update({ amount_usd: refunded, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      return NextResponse.json({ status: "failed" });
    }

    if (result.download || result.ready) {
      await service
        .from("orders")
        .update({
          status: "completed",
          download_url: result.download?.url ?? null,
          download_token: result.download?.token ?? null,
          download_filename: result.download?.filename ?? null,
        })
        .eq("id", order.id);

      return NextResponse.json({
        status: "completed",
        downloadUrl: result.download ? `/api/downloads/${result.download.token}` : null,
      });
    }

    return NextResponse.json({ status: "processing" });
  } catch (err) {
    return NextResponse.json(
      { status: "processing", warning: "Could not reach darimarket", detail: String(err) },
      { status: 200 }
    );
  }
}
