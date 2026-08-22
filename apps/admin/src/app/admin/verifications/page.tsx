import { createServiceClient } from "@masseurmatch/db/client";
import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/guards";
import { DOCUMENT_KINDS, isDocumentKind } from "@/lib/identity-documents";
import { documentViewUrl } from "@/lib/identity-storage";

import { VerificationQueue, type VerificationRow } from "./queue";

export const metadata: Metadata = {
  title: "Identity verifications",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function labelFor(documentType: string | null, legacyType: string | null): string {
  if (documentType) {
    const current = DOCUMENT_KINDS.find((option) => option.id === documentType);
    if (current) return current.label;
  }

  if (legacyType === "professional_license") return "Professional license";
  if (legacyType) {
    return legacyType
      .split("_")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
  return "Legacy credential document";
}

export default async function VerificationsPage() {
  await requireAdmin("/verifications");

  const service = createServiceClient();

  const [{ data, error }, { count: manualPending }, { count: providerPending }] = await Promise.all([
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
    service
      .from("identity_verifications")
      .select("id", { count: "exact", head: true })
      .neq("provider", "manual")
      .eq("status", "pending"),
  ]);

  if (error) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-semibold text-ink">Identity verifications</h1>
        <p className="mt-4 rounded-lg bg-wineSoft/40 px-3 py-2 text-sm text-wineDark">
          Could not load the queue: {error.message}
        </p>
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
    pending.map(async (row) => {
      const storedPath = row.storage_path ?? row.url;
      const isIdentity = Boolean(row.document_type && isDocumentKind(row.document_type));

      return {
        id: row.id,
        profileId: row.profile_id,
        name: (row.profile_id && names.get(row.profile_id)) || "Unknown therapist",
        kindLabel: labelFor(row.document_type, row.type),
        submittedAt: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : null,
        viewUrl: storedPath ? await documentViewUrl(storedPath) : null,
        isIdentity,
      };
    }),
  );

  const identityRows = rows.filter((row) => row.isIdentity);
  const credentialRows = rows.filter((row) => !row.isIdentity);
  const externalPending = manualPending ?? 0;
  const automatedPending = providerPending ?? 0;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Identity verifications</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/60">
            Review government ID submissions separately from legacy professional credentials. A
            profile is identity-verified only after ID front, ID back and selfie are all approved.
          </p>
        </div>
        <Link
          href="/verifications/manual"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-wine/20 px-3 py-2 text-sm font-medium text-wine hover:bg-wineSoft/30 sm:w-auto"
        >
          Manual ID queue{externalPending ? ` (${externalPending})` : ""}
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-ink/10 bg-surface p-3">
          <p className="text-xs text-ink/50">Identity documents</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{identityRows.length}</p>
        </div>
        <div className="rounded-xl border border-ink/10 bg-surface p-3">
          <p className="text-xs text-ink/50">Manual submissions</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{externalPending}</p>
        </div>
        <div className="rounded-xl border border-ink/10 bg-surface p-3">
          <p className="text-xs text-ink/50">Provider pending</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{automatedPending}</p>
        </div>
        <div className="rounded-xl border border-ink/10 bg-surface p-3">
          <p className="text-xs text-ink/50">Legacy credentials</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{credentialRows.length}</p>
        </div>
      </div>

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-ink">Current identity document queue</h2>
          <p className="mt-1 text-sm text-ink/55">Government ID and selfie documents from the V2 flow.</p>
        </div>
        <VerificationQueue rows={identityRows} emptyMessage="No V2 identity documents are waiting for review." />
      </section>

      <section className="mt-10">
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-ink">Legacy credential queue</h2>
          <p className="mt-1 text-sm leading-6 text-ink/55">
            Older professional-license uploads are reviewable here, but approving them never grants
            an identity badge.
          </p>
        </div>
        <VerificationQueue rows={credentialRows} emptyMessage="No legacy credential documents are waiting for review." />
      </section>
    </main>
  );
}
