import { createServiceClient } from "@masseurmatch/db/client";
import { createSessionClient } from "@masseurmatch/db/auth";
import { NextResponse } from "next/server";

import { normalizeIdentityStatus } from "@/lib/identity-status";

export const dynamic = "force-dynamic";

/**
 * GET /api/provider/verification/identity/status
 *
 * Returns the most recent manual identity-verification status for the current
 * user. Historical rows from retired providers are intentionally ignored.
 */
export async function GET() {
  try {
    const {
      data: { user },
    } = await createSessionClient().auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("identity_verifications")
      .select("id, status, provider, last_error, created_at, updated_at")
      .eq("user_id", user.id)
      .eq("provider", "manual")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching manual verification status:", error);
      return NextResponse.json({ error: "Could not fetch verification status" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      status: normalizeIdentityStatus(data?.status),
      provider: data ? "manual" : null,
      verificationId: data?.id ?? null,
      lastError: data?.last_error ?? null,
      createdAt: data?.created_at ?? null,
      updatedAt: data?.updated_at ?? null,
    });
  } catch (error) {
    console.error("Identity verification status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
