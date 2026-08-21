import { createSessionClient } from "@masseurmatch/db/auth";

import { PageHeader } from "@/components/pro/page-header";
import { EmptyState, Section } from "@/components/pro/section";
import { requireTherapist } from "@/lib/guards";
import { getOrCreateMyProfile } from "@/lib/profile";

export const metadata = { title: "Inquiries | MasseurMatch" };
export const dynamic = "force-dynamic";

type Inquiry = {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  message: string;
  preferred_contact: string;
  status: string;
  created_at: string;
};

/**
 * People who wrote in through the listing.
 *
 * Read through the session client, so RLS is what keeps one therapist out of
 * another's inbox — not a `where` clause this page happens to remember.
 */
export default async function ProInquiriesPage() {
  const viewer = await requireTherapist("/pro/inquiries");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);

  const { data, error } = await createSessionClient()
    .from("contact_inquiries")
    .select("id,client_name,client_email,client_phone,message,preferred_contact,status,created_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const inquiries = (error ? [] : ((data ?? []) as unknown as Inquiry[])) satisfies Inquiry[];

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Inquiries"
        subtitle="Messages clients sent through your listing."
      />

      <Section title="Recent inquiries">
        {inquiries.length === 0 ? (
          <EmptyState>
            {error
              ? "Inquiries are not available on this account yet."
              : "No inquiries yet. They appear here as soon as someone writes in."}
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {inquiries.map((inquiry) => (
              <li key={inquiry.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium text-foreground">{inquiry.client_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(inquiry.created_at).toLocaleDateString()} · {inquiry.status}
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {inquiry.client_email}
                  {inquiry.client_phone ? ` · ${inquiry.client_phone}` : ""} · prefers{" "}
                  {inquiry.preferred_contact}
                </p>
                <p className="mt-2 whitespace-pre-line text-sm text-foreground">
                  {inquiry.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
