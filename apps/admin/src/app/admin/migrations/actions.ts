"use server";

import { createServiceClient } from "@masseurmatch/db/client";
import type { Json } from "@masseurmatch/db/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { recordAdminAudit } from "@/lib/admin-audit";
import { requireAdmin } from "@/lib/guards";

const resultSchema = z.object({
  approved: z.coerce.number().int().nonnegative(),
  rejected: z.coerce.number().int().nonnegative(),
  reviewedAt: z.string(),
});

type RpcClient = {
  rpc: (
    name: string,
    params?: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

function text(formData: FormData, name: string, max = 1000): string {
  return String(formData.get(name) ?? "")
    .trim()
    .slice(0, max);
}

export async function reviewProfileImport(formData: FormData): Promise<void> {
  const viewer = await requireAdmin("/migrations");
  const migrationId = z
    .string()
    .uuid()
    .parse(text(formData, "migration_id", 100));
  const reviewIds = formData
    .getAll("review_id")
    .map((value) => z.string().uuid().parse(String(value)));

  if (reviewIds.length === 0) throw new Error("This import has no pending reviews to decide.");
  if (new Set(reviewIds).size !== reviewIds.length)
    throw new Error("A review was submitted more than once.");

  const decisions = reviewIds.map((reviewId) => {
    const value = text(formData, `decision_${reviewId}`, 20);
    if (value !== "approve" && value !== "reject") {
      throw new Error("Choose approve or reject for every pending review.");
    }
    return {
      reviewId,
      approved: value === "approve",
      notes: text(formData, `notes_${reviewId}`, 1000) || null,
    };
  });

  const service = createServiceClient();
  const { data: migration, error: migrationError } = await service
    .from("profile_migrations")
    .select("id,email,profile_id,platform,source_url")
    .eq("id", migrationId)
    .maybeSingle();
  if (migrationError) throw new Error(`Could not load import: ${migrationError.message}`);
  if (!migration) throw new Error("Profile import not found.");

  await recordAdminAudit({
    adminId: viewer.user.id,
    action: "profile_import.review_started",
    targetType: "profile_migration",
    targetId: migrationId,
    reason: "Admin submitted decisions for every pending imported review.",
    details: {
      platform: migration.platform,
      source_url: migration.source_url,
      decisions: decisions.map((decision) => ({
        review_id: decision.reviewId,
        approved: decision.approved,
      })),
    } as Json,
  });

  const rpc = service as unknown as RpcClient;
  const { data, error } = await rpc.rpc("admin_review_profile_migration", {
    p_migration_id: migrationId,
    p_admin_user_id: viewer.user.id,
    p_decisions: decisions.map((decision) => ({
      review_id: decision.reviewId,
      approved: decision.approved,
      notes: decision.notes,
    })),
  });
  if (error) throw new Error(`Could not finalize import review: ${error.message}`);
  const result = resultSchema.parse(data);

  await recordAdminAudit({
    adminId: viewer.user.id,
    action: "profile_import.review_completed",
    targetType: "profile_migration",
    targetId: migrationId,
    reason: "Imported review moderation completed atomically.",
    details: {
      approved_reviews: result.approved,
      rejected_reviews: result.rejected,
      reviewed_at: result.reviewedAt,
    },
  });

  try {
    let userId: string | null = null;
    let recipientName = "Provider";
    if (migration.profile_id) {
      const { data: profile } = await service
        .from("profiles")
        .select("user_id,display_name,full_name")
        .eq("id", migration.profile_id)
        .maybeSingle();
      userId = profile?.user_id ?? null;
      recipientName = profile?.display_name?.trim() || profile?.full_name?.trim() || recipientName;
    }

    const approvedText =
      result.approved > 0
        ? `${result.approved} imported ${result.approved === 1 ? "review is" : "reviews are"} now approved for your profile.`
        : "None of the submitted imported reviews were approved for publication.";
    await rpc.rpc("queue_lifecycle_email", {
      p_user_id: userId,
      p_recipient_email: migration.email,
      p_recipient_name: recipientName,
      p_segment: "profile_import",
      p_campaign_key: `profile-import-review-${migrationId}`,
      p_flow_key: "profile_import_review",
      p_template_key: "profile_import_review",
      p_send_category: "transactional",
      p_subject:
        result.approved > 0
          ? "Your imported reviews were reviewed"
          : "Your profile import review is complete",
      p_body_html: `<p>Hi ${escapeHtml(recipientName)},</p><p>${escapeHtml(approvedText)}</p><p><a href="https://dashboard.masseurmatch.com/">Open your dashboard</a></p><p>MasseurMatch</p>`,
      p_body_text: `Hi ${recipientName},\n\n${approvedText}\n\nOpen your dashboard: https://dashboard.masseurmatch.com/\n\nMasseurMatch`,
      p_from_address: process.env.RESEND_FROM_EMAIL || null,
      p_reply_to: "support@masseurmatch.com",
      p_payload: {
        migration_id: migrationId,
        approved: result.approved,
        rejected: result.rejected,
      },
      p_scheduled_for: new Date().toISOString(),
      p_idempotency_key: `profile-import-review:${migrationId}:${result.reviewedAt}`,
    });
  } catch (notificationError) {
    console.error("[admin-imports] provider notification could not be queued", notificationError);
  }

  revalidatePath("/migrations");
  revalidatePath("/admin/migrations");
  redirect(
    `/migrations?reviewed=${encodeURIComponent(migrationId)}&approved=${result.approved}&rejected=${result.rejected}`,
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
