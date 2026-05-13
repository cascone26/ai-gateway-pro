import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const label = body.label || "Untitled Key";

  // Generate a unique API key
  const randomKey = crypto.randomBytes(32).toString("hex");
  const keyHash = Buffer.from(randomKey).toString("hex");
  const keyId = crypto.randomUUID();

  try {
    await supabase
      .from("aigw_api_keys")
      .insert({
        key_id: keyId,
        user_id: userId,
        key_hash: keyHash,
        label,
        created_at: new Date().toISOString(),
      })
      .single();

    // Return the key only once
    return NextResponse.json({
      key: randomKey,
      label,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}
