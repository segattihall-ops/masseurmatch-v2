"use server";

import { createSessionClient, getViewer } from "@masseurmatch/db/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { StepState } from "@/app/onboarding/form-state";
import { getOrCreateMyProfile } from "@/lib/profile";

const STATUSES = ["new", "viewed", "responded", "archived"] as const;
type InquiryStatus = (typeof STATUSES)[number];

/** Move one of the caller's inquiries between statuses. RLS scopes the row. */
export async function setInquiryStatus(_prev: StepState, formData: FormData): Promise<StepState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?next=%2Ftherapist%2Fmessages");
  if (viewer.role !== "provider" && viewer.role !== "admin") redirect("/not-authorized");

  const id = String(formData.get("inquiry_id") ?? "").trim();
  const status = String(formData.get("status") ?? "") as InquiryStatus;
  if (!id) return { error: "No message selected." };
  if (!STATUSES.includes(status)) return { error: "Unknown status." };

  const { profile } = await getOrCreateMyProfile(viewer.user.id);

  const { data, error } = await createSessionClient()
    .from("contact_inquiries")
    .update({ status })
    .eq("id", id)
    .eq("profile_id", profile.id)
    .select("id");

  if (error) return { error: `Could not update that message: ${error.message}` };
  if ((data ?? []).length === 0) return { error: "That message was not found." };

  revalidatePath("/therapist/messages");
  return { ok: true };
}
