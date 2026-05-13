import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

let supabase: ReturnType<typeof createClient>;

function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );
  }
  return supabase;
}

export async function POST(request: NextRequest) {
  try {
    const client = getSupabase() as any;

    // Extract Bearer token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);

    // Look up key in database
    const keyHash = Buffer.from(token).toString("hex");
    const { data: keyRecord } = await client
      .from("aigw_api_keys")
      .select("user_id, key_id")
      .eq("key_hash", keyHash)
      .is("revoked_at", null)
      .single();

    if (!keyRecord) {
      return NextResponse.json(
        { error: "Invalid or revoked API key" },
        { status: 401 }
      );
    }

    const userId = keyRecord.user_id;
    const keyId = keyRecord.key_id;

    // Get user and check plan
    const { data: user } = await client
      .from("aigw_users")
      .select("plan")
      .eq("id", userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    // Check quota
    const now = new Date();
    const month_year = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const { data: usage } = await client
      .from("aigw_usage")
      .select("request_count")
      .eq("user_id", userId)
      .eq("month_year", month_year)
      .single();

    const requestCount = usage?.request_count || 0;
    const limit = user.plan === "pro" ? 10000 : 50 * 30;

    if (requestCount >= limit) {
      return NextResponse.json(
        { error: `Request limit exceeded (${limit} requests/month)` },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Forward to gateway
    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://100.104.48.47:7792";
    const gatewayResponse = await fetch(
      `${gatewayUrl}/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const responseData = await gatewayResponse.json();

    // Increment usage counter
    if (usage) {
      await client
        .from("aigw_usage")
        .update({ request_count: requestCount + 1, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("month_year", month_year);
    } else {
      await client
        .from("aigw_usage")
        .insert([{
          user_id: userId,
          key_id: keyId,
          month_year,
          request_count: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);
    }

    return NextResponse.json(responseData, { status: gatewayResponse.status });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
