import { createServiceClient } from "@masseurmatch/db/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { requireTherapist } from "@/lib/guards";
import { DOCUMENT_KINDS } from "@/lib/identity-documents";
import { getOrCreateMyProfile } from "@/lib/profile";

import { IdentityUploadForm } from "./upload-form";

export const metadata: Metadata = {
  title: "Verify your identity",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  pending: "Waiting for review",
  approved: "Approved",
  rejected: "Not accepted",
};

function labelFor(kind: string | null): string {
  return DOCUMENT_KINDS.find((option) => option.id === kind)?.label ?? "Document";
}

/**
 * Identity verification, from the therapist's side.
 *
 * Reads their own submissions through the service client rather than the
 * session one. `profile_documents` is owner-read by policy, so a session read
 * would work — but every other read of this table on this page is filtered to
 * `profile_id = the caller`, and using one client for all of them keeps the
 * filter, rather than a policy, as the single visible reason only their own
 * rows come back.
 */
export default async function VerifyIdPage() {
  const viewer = await requireTherapist("/verify-id");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);

  const { data } = await createServiceClient()
    .from("profile_documents")
    .select("id,document_type,status,created_at,storage_path")
    .eq("profile_id", viewer.user.id)
    .order("created_at", { ascending: false });

  const documents = data ?? [];
  const verified = profile.is_verified_identity === true;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-ink">Verify your identity</h1>
      <p className="mt-1 text-sm text-ink/60">
        A verified badge tells clients a person on our team has checked that you are who your
        listing says you are. It is optional, and your documents are never shown on your profile.
      </p>

      {verified ? (
        <Card className="mt-8">
          <CardHeader>
            <CardDescription>Status</CardDescription>
            <CardTitle>Your identity is verified</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink/70">
              Nothing else to do here. The documents you sent were deleted once they were reviewed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-8 p-6">
          <IdentityUploadForm />
        </Card>
      )}

      {documents.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-ink">What you have sent</h2>
          <ul className="mt-3 divide-y divide-ink/10 rounded-lg border border-ink/10">
            {documents.map((document) => (
              <li key={document.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-sm text-ink">{labelFor(document.document_type)}</span>
                <span className="text-sm text-ink/60">
                  {STATUS_LABELS[document.status ?? ""] ?? document.status}
                  {document.storage_path === null && document.status !== "pending"
                    ? " · file deleted"
                    : ""}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink/50">
            Documents are deleted from our storage as soon as a decision is made. What stays is the
            record that someone reviewed one, not the document itself.
          </p>
        </section>
      ) : null}

      <p className="mt-8 text-sm text-ink/60">
        <Link href="/" className="font-medium text-wine hover:underline">
          Back to your dashboard
        </Link>
      </p>
    </main>
  );
}
