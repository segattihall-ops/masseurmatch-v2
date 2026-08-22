"use server";

import { createSessionClient, getViewer } from "@masseurmatch/db/auth";
import { createServiceClient } from "@masseurmatch/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const ProfileContentSchema = z.object({
  profileId: z.string().uuid(),
  displayName: z.string().trim().max(120),
  headline: z.string().trim().max(120),
  bio: z.string().trim().max(4000),
  city: z.string().trim().max(120),
  state: z.string().trim().max(80),
  phone: z.string().trim().max(40),
  email: z.union([z.literal(""), z.string().trim().email().max(254)]),
  website: z.union([z.literal(""), z.string().trim().url().max(500)]),
  reason: z.string().trim().min(10).max(500),
});

function nullable(value: string): string | null {
  return value || null;
}

async function requireAdminId(profileId: string): Promise<string> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/sign-in?next=${encodeURIComponent(`/people/${profileId}`)}`);
  if (viewer.role !== "admin") redirect("/not-authorized");
  return viewer.user.id;
}

export async function updateProfileContent(formData: FormData): Promise<void> {
  const rawProfileId = String(formData.get("profile_id") ?? "").trim();
  const adminId = await requireAdminId(rawProfileId);

  const parsed = ProfileContentSchema.safeParse({
    profileId: rawProfileId,
    displayName: String(formData.get("display_name") ?? ""),
    headline: String(formData.get("headline") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    website: String(formData.get("website") ?? ""),
    reason: String(formData.get("reason") ?? ""),
  });

  if (!parsed.success) {
    redirect(
      `/people/${rawProfileId}?error=${encodeURIComponent("Check the fields and give an audit reason of at least 10 characters.")}`,
    );
  }

  const input = parsed.data;
  const service = createServiceClient();
  const { data: previous, error: readError } = await service
    .from("profiles")
    .select("id,display_name,headline,bio,city,state,phone,email,website")
    .eq("id", input.profileId)
    .maybeSingle();

  if (readError || !previous) {
    redirect(
      `/people/${input.profileId}?error=${encodeURIComponent("Profile could not be loaded.")}`,
    );
  }

  const patch = {
    display_name: nullable(input.displayName),
    headline: nullable(input.headline),
    bio: nullable(input.bio),
    city: nullable(input.city),
    state: nullable(input.state),
    phone: nullable(input.phone),
    email: nullable(input.email),
    website: nullable(input.website),
    updated_at: new Date().toISOString(),
  };

  const changed = Object.entries(patch)
    .filter(([key]) => key !== "updated_at")
    .filter(([key, value]) => {
      const previousKey = key as keyof typeof previous;
      return previous[previousKey] !== value;
    })
    .map(([key]) => key);

  if (changed.length === 0) {
    redirect(`/people/${input.profileId}?saved=unchanged`);
  }

  const { error: auditError } = await createSessionClient()
    .from("audit_log")
    .insert({
      admin_id: adminId,
      admin_user_id: adminId,
      action: "profile.content_update",
      target_type: "profile",
      target_id: input.profileId,
      target_profile_id: input.profileId,
      reason: input.reason,
      details: { changed_fields: changed },
    });

  if (auditError) {
    redirect(
      `/people/${input.profileId}?error=${encodeURIComponent("Audit log could not be written, so no profile data was changed.")}`,
    );
  }

  const { error: updateError } = await service
    .from("profiles")
    .update(patch)
    .eq("id", input.profileId);
  if (updateError) {
    redirect(
      `/people/${input.profileId}?error=${encodeURIComponent("The edit was logged but the profile update failed. Review the audit log before retrying.")}`,
    );
  }

  revalidatePath("/admin/people");
  revalidatePath(`/admin/people/${input.profileId}`);
  revalidatePath("/people");
  revalidatePath(`/people/${input.profileId}`);
  redirect(`/people/${input.profileId}?saved=1`);
}
