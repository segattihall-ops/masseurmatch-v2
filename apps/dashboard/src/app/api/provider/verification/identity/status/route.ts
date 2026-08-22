import { createServiceClient } from "@masseurmatch/db/client";
import { createSessionClient } from "@masseurmatch/db/auth";
import { NextResponse } from "next/server";

import { normalizeIdentityStatus } from "@/lib/identity-status";

// Reads the caller's session, so it can never be rendered statically. Declared
// rather than inferred: without it the build attempts a static render, the
// cookie access throws, and the catch below logs an error for a route that is
// working exactly as intended.
export const dynamic = "force-dynamic";

/**
 * GET /api/provider/verification/identity/status
 *
 * Returns the most recent identity verification status for the current user.
 *
 * Status values (see `@/lib/identity-status` for the mapping):
 * - "not_started": no verification yet, or one created without documents
 * - "pending": documents submitted, awaiting admin review
 * - "processing": under automated processing
 * - "requires_input": rejected — `lastError` carries the reviewer's reason
 * - "failed" / "canceled": terminal states that need a fresh submission
 * - "verified": identity confirmed, badge active
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
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching verification status:", error);
      return NextResponse.json({ error: "Could not fetch verification status" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      status: normalizeIdentityStatus(data?.status),
      provider: data?.provider ?? null,
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
