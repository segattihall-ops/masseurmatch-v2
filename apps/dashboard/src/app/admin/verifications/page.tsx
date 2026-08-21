import { createServiceClient } from "@masseurmatch/db/client";
import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/guards";
import { DOCUMENT_KINDS } from "@/lib/identity-documents";
import { documentViewUrl } from "@/lib/identity-storage";

import { VerificationQueue, type VerificationRow } from "./queue";

export const metadata: Metadata = {
  title: "Identity verifications",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function labelFor(kind: string | null): string {
  return DOCUMENT_KINDS.find((option) => option.id === kind)?.label ?? "Document";
}

export default async function VerificationsPage() {
  await requireAdmin("/admin/verifications");

  const service = createServiceClient();

  const [{ data, error }, { count: manualPending }] = await Promise.all([
    service
      .from("profile_documents")
      .select("id,profile_id,document_type,status,created_at,storage_path")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(50),
    service
      .from("identity_verifications")
      .select("id", { count: "exact", head: true })
      .eq("provider", "manual")
      .eq("status", "pending"),
  ]);

  if (error) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-ink">Identity verifications</h1>
        <p className="mt-4 text-sm text-wine">Could not load the queue: {error.message}</p>
      </main>
    );
  }

  const pending = data ?? [];
  const profileIds = [...new Set(pending.map((row) => row.profile_id).filter(Boolean))] as string[];

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
    pending.map(async (row) => ({
      id: row.id,
      profileId: row.profile_id,
      name: (row.profile_id && names.get(row.profile_id)) || "Unknown therapist",
      kindLabel: labelFor(row.document_type),
      submittedAt: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : null,
      viewUrl: row.storage_path ? await documentViewUrl(row.storage_path) : null,
    })),
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Identity verifications</h1>
          <p className="mt-1 text-sm text-ink/60">
            {rows.length === 0
              ? "Nothing waiting in the current document queue."
              : `${rows.length} waiting. Each document is deleted once you decide.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/admin/verifications/manual"
            className="rounded-lg border border-wine/20 px-3 py-2 font-medium text-wine hover:bg-wineSoft/30"
          >
            Manual legacy queue{manualPending ? ` (${manualPending})` : ""}
          </Link>
          <Link href="/admin" className="px-2 py-2 font-medium text-wine hover:underline">
            Back to admin
          </Link>
        </div>
      </div>

      <VerificationQueue rows={rows} />
    </main>
  );
}
