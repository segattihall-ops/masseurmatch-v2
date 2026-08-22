import { createServiceClient } from "@masseurmatch/db/client";
import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/guards";
import { isDocumentKind } from "@/lib/identity-documents";
import { documentViewUrl } from "@/lib/identity-storage";

import { VerificationQueue, type VerificationRow } from "./queue";

export const metadata: Metadata = {
  title: "Credential verifications",
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
  return "Credential document";
}

export default async function VerificationsPage() {
  await requireAdmin("/verifications");

  const service = createServiceClient() as any;
  const [{ data, error }, { count: manualPending, error: manualError }] = await Promise.all([
    service
      .from("profile_documents")
      .select(
        "id,profile_id,document_type,type,status,created_at,storage_path,url,holder_name,license_type,license_number,issuing_authority,jurisdiction,issued_on,expires_on",
      )
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
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-semibold text-ink">Credential verifications</h1>
        <p className="mt-4 rounded-lg bg-wineSoft/40 px-3 py-2 text-sm text-wineDark">
          Could not load the queue: {queueError.message}
        </p>
      </main>
    );
  }

  const credentials = ((data ?? []) as any[]).filter((row) => {
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

  const credentialRows: VerificationRow[] = await Promise.all(
    credentials.map(async (row) => {
      const storedPath = row.storage_path ?? row.url;
      return {
        id: row.id,
        profileId: row.profile_id,
        name: (row.profile_id && names.get(row.profile_id)) || "Unknown therapist",
        kindLabel: labelFor(row.document_type, row.type),
        submittedAt: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : null,
        viewUrl: storedPath ? await documentViewUrl(storedPath) : null,
        holderName: row.holder_name ?? null,
        licenseType: row.license_type ?? null,
        licenseNumber: row.license_number ?? null,
        issuingAuthority: row.issuing_authority ?? null,
        jurisdiction: row.jurisdiction ?? null,
        issuedOn: row.issued_on ?? null,
        expiresOn: row.expires_on ?? null,
      };
    }),
  );

  const manualCount = manualPending ?? 0;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Credential verifications</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/60">
            Providers enter their own professional-license details and upload the supporting image.
            Compare the submitted fields with the image, then approve or reject. No data re-entry is
            needed.
          </p>
        </div>
        <Link
          href="/verifications/manual"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-wine px-4 py-2 text-sm font-medium text-white hover:bg-wineDark sm:w-auto"
        >
          Open manual ID queue{manualCount ? ` (${manualCount})` : ""}
        </Link>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-wine/15 bg-wineSoft/20 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-wineDark/70">
            Manual identity pending
          </p>
          <p className="mt-1 text-3xl font-semibold text-ink">{manualCount}</p>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            This queue controls only identity verification.
          </p>
        </div>
        <div className="rounded-xl border border-ink/10 bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
            Professional credentials pending
          </p>
          <p className="mt-1 text-3xl font-semibold text-ink">{credentialRows.length}</p>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            License approval is separate from identity verification.
          </p>
        </div>
      </div>

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-ink">Professional licenses</h2>
          <p className="mt-1 text-sm leading-6 text-ink/55">
            The provider has already entered the license data. Your job is to compare it against the
            private image and decide.
          </p>
        </div>
        <VerificationQueue
          rows={credentialRows}
          emptyMessage="No professional licenses are waiting for review."
        />
      </section>
    </main>
  );
}
