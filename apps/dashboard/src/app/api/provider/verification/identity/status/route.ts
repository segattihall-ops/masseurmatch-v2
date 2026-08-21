import { createServiceClient } from "@masseurmatch/db/client";
import { createSessionClient } from "@masseurmatch/db/auth";
import { NextResponse } from "next/server";

/**
 * GET /api/provider/verification/identity/status
 *
 * Returns the most recent identity verification status for the current user.
 *
 * Status values:
 * - "not_started": verification created but no documents uploaded
 * - "pending": documents submitted, awaiting admin review
 * - "approved": identity verified
 * - "rejected": identity rejected, with optional error message for retry guidance
 * - "none": no verification record exists
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

    // Map database status to public status
    let publicStatus = "none";
    if (data) {
      const dbStatus = data.status as string;
      if (dbStatus === "approved") publicStatus = "approved";
      else if (dbStatus === "rejected") publicStatus = "rejected";
      else if (dbStatus === "pending") publicStatus = "pending";
      else if (dbStatus === "not_started") publicStatus = "not_started";
      else publicStatus = "none";
    }

    return NextResponse.json({
      ok: true,
      status: publicStatus,
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
