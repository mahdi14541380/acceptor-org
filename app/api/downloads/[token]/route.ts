import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { downloadFile } from "@/lib/darimarket";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const service = createServiceRoleClient();

  // Ownership check: the token must belong to one of this user's own orders.
  const { data: order } = await service
    .from("orders")
    .select("id, user_id, download_filename")
    .eq("download_token", params.token)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const upstream = await downloadFile(params.token);
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${order.download_filename ?? "receipt"}"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not fetch file", detail: String(err) },
      { status: 502 }
    );
  }
}
