import { createServiceClient } from "@masseurmatch/db/client";
import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/guards";
import { isDocumentKind } from "@/lib/identity-documents";
import { documentViewUrl } from "@/lib/identity-storage";

import { VerificationQueue, type VerificationRow } from "./queue";

export const metadata: Metadata = {
  title: "Identity verifications",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function labelFor(documentType: string | null, legacyType: string | null): string {
  const kind = documentType ?? legacyType;
  if (kind === "professional_license") return "Professional license";
  if (kind) {
    return kind
      .split("_")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
  return "Legacy credential document";
}

export default async function VerificationsPage() {
  await requireAdmin("/admin/verifications");

  const service = createServiceClient();

  const [{ data, error }, { count: manualPending, error: manualError }] = await Promise.all([
    service
      .from("profile_documents")
      .select("id,profile_id,document_type,type,status,created_at,storage_path,url")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(100),
    service
      .from("identity_verifications")
      .select("id", { count: "exact", head: true })
      .eq("provider", "manual")
      .eq("status", "pending"),
  ]);

  const queueError = error ?? manualError;
  if (queueError) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-ink">Identity verifications</h1>
        <p className="mt-4 text-sm text-wine">Could not load the queue: {queueError.message}</p>
      </main>
    );
  }

  const credentials = (data ?? []).filter((row) => {
    const kind = row.document_type ?? row.type ?? "";
    return !isDocumentKind(kind);
  });

  const profileIds = [
    ...new Set(credentials.map((row) => row.profile_id).filter(Boolean)),
  ] as string[];

  const names = new Map<string, string>();
  if (profileIds.length > 0) {
    const { data: profiles } = await service
      .from("profiles")
      .select("id,display_name,full_name,email")
      .in("id", profileIds);

    for (const profile of profiles ?? []) {
      names.set(
        profile.id,
        profile.display_name ?? profile.full_name ?? profile.email ?? "Unnamed therapist",
      );
    }
  }

  const rows: VerificationRow[] = await Promise.all(
    credentials.map(async (row) => {
      const storedPath = row.storage_path ?? row.url;
      return {
        id: row.id,
        profileId: row.profile_id,
        name: (row.profile_id && names.get(row.profile_id)) || "Unknown therapist",
        kindLabel: labelFor(row.document_type, row.type),
        submittedAt: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : null,
        viewUrl: storedPath ? await documentViewUrl(storedPath) : null,
      };
    }),
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Identity verifications</h1>
          <p className="mt-1 max-w-xl text-sm leading-6 text-ink/60">
            Identity verification is manual only. Government ID submissions must be reviewed in the
            manual queue. The document list below contains professional credentials only.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/admin/verifications/manual"
            className="rounded-lg bg-wine px-3 py-2 font-medium text-white hover:bg-wineDark"
          >
            Manual ID queue{manualPending ? ` (${manualPending})` : ""}
          </Link>
          <Link href="/admin" className="px-2 py-2 font-medium text-wine hover:underline">
            Back to admin
          </Link>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-ink/10 bg-ink/5 p-4 text-sm leading-6 text-ink/65">
        Professional credentials never grant, remove, or change the identity badge.
      </div>

      <VerificationQueue rows={rows} />
    </main>
  );
}
