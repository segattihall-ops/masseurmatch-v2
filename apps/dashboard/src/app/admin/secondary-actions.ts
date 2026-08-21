"use server";

import { createServiceClient } from "@masseurmatch/db/client";
import type { Json } from "@masseurmatch/db/types";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/guards";

async function audit(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  reason: string,
  details: Json,
) {
  const { error } = await createServiceClient().from("audit_log").insert({
    admin_id: adminId,
    admin_user_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    reason,
    details,
  });
  if (error) throw new Error(`Could not write audit log: ${error.message}`);
}

function bool(value: FormDataEntryValue | null): boolean {
  return value === "1";
}

export async function updateProfileFromAdmin(formData: FormData): Promise<void> {
  const viewer = await requireAdmin("/admin/profile-cms");
  const id = String(formData.get("profile_id") ?? "").trim();
  const displayName = String(formData.get("display_name") ?? "").trim().slice(0, 100);
  const headline = String(formData.get("headline") ?? "").trim().slice(0, 160);
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 4000);
  const city = String(formData.get("city") ?? "").trim().slice(0, 120);
  const state = String(formData.get("state") ?? "").trim().toUpperCase().slice(0, 2);
  const visibility = String(formData.get("visibility_status") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 1000);

  if (!id) throw new Error("Profile id is required.");
  if (!displayName) throw new Error("Display name is required.");
  if (state && !/^[A-Z]{2}$/.test(state)) throw new Error("State must be a two-letter code.");
  if (!new Set(["hidden", "public", "paused", "suspended"]).has(visibility)) {
    throw new Error("Invalid visibility state.");
  }
  if (reason.length < 10) throw new Error("An audit reason of at least 10 characters is required.");

  const service = createServiceClient();
  const { data: current, error: readError } = await service
    .from("profiles")
    .select(
      "id,display_name,headline,bio,city,state,visibility_status,lgbtq_affirming,offers_incall,offers_outcall",
    )
    .eq("id", id)
    .maybeSingle();
  if (readError) throw new Error(`Could not load profile: ${readError.message}`);
  if (!current) throw new Error("Profile not found.");

  const next = {
    display_name: displayName,
    headline: headline || null,
    bio: bio || null,
    city: city || null,
    state: state || null,
    visibility_status: visibility,
    lgbtq_affirming: bool(formData.get("lgbtq_affirming")),
    offers_incall: bool(formData.get("offers_incall")),
    offers_outcall: bool(formData.get("offers_outcall")),
    updated_at: new Date().toISOString(),
  };

  await audit(viewer.user.id, "profile.admin_update", "profile", id, reason, {
    before: current as unknown as Json,
    after: next as unknown as Json,
  });

  const { error } = await service.from("profiles").update(next).eq("id", id);
  if (error) throw new Error(`Could not update profile: ${error.message}`);

  revalidatePath("/admin/profile-cms");
  revalidatePath("/admin/people");
  revalidatePath("/admin/moderation");
}
