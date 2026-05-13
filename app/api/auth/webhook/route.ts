import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";

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
  const payload = await request.text();
  const headers = {
    "svix-id": request.headers.get("svix-id")!,
    "svix-timestamp": request.headers.get("svix-timestamp")!,
    "svix-signature": request.headers.get("svix-signature")!,
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  let evt;

  try {
    evt = wh.verify(payload, headers) as any;
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const eventType = evt.type;
  const data = evt.data;

  // Handle user creation
  if (eventType === "user.created") {
    const userId = data.id;
    const email = data.email_addresses[0]?.email_address;

    const client = getSupabase() as any;
    await client
      .from("aigw_users")
      .insert([{
        id: userId,
        email,
        plan: "free",
        created_at: new Date().toISOString(),
      }]);
  }

  return NextResponse.json({ success: true });
}
