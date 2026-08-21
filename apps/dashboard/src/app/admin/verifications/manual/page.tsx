import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { listManualIdentity } from "@/lib/admin-operations";
import { requireAdmin } from "@/lib/guards";
import { documentViewUrl } from "@/lib/identity-storage";

import { decideManualIdentity } from "../../operations-actions";

export const metadata: Metadata = {
  title: "Manual identity review",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function filePaths(metadata: Record<string, unknown>): Array<{ label: string; path: string }> {
  const manual = metadata.manual;
  if (!manual || typeof manual !== "object" || Array.isArray(manual)) return [];
  const files = (manual as Record<string, unknown>).files;
  if (!files || typeof files !== "object" || Array.isArray(files)) return [];

  const labels: Record<string, string> = {
    id_front: "ID front",
    id_back: "ID back",
    selfie: "Selfie / challenge",
  };

  return Object.entries(files as Record<string, unknown>).flatMap(([key, value]) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    const path = (value as Record<string, unknown>).path;
    if (typeof path !== "string" || !path) return [];
    return [{ label: labels[key] ?? key, path }];
  });
}

export default async function ManualVerificationPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  await requireAdmin("/admin/verifications/manual");
  const status = searchParams.status === "all" ? "all" : "pending";
  const rows = await listManualIdentity(status);

  const enriched = await Promise.all(
    rows.map(async (row) => ({
      ...row,
      documents: await Promise.all(
        filePaths(row.metadata).map(async (file) => ({
          ...file,
          url: await documentViewUrl(file.path),
        })),
      ),
    })),
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink">Manual identity review</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink/60">
            Legacy/manual identity submissions still active in production. Document links are signed
            for one minute and the stored files are deleted when a decision is finalized.
          </p>
        </div>
        <Link href="/admin/verifications" className="text-sm font-medium text-wine hover:underline">
          Current document queue →
        </Link>
      </div>

      <nav aria-label="Verification status" className="mt-6 flex gap-2">
        <Link
          href="/admin/verifications/manual"
          className={`rounded-full px-3 py-1 text-sm ${status === "pending" ? "bg-wine text-white" : "bg-ink/5 text-ink/70"}`}
        >
          Pending
        </Link>
        <Link
          href="/admin/verifications/manual?status=all"
          className={`rounded-full px-3 py-1 text-sm ${status === "all" ? "bg-wine text-white" : "bg-ink/5 text-ink/70"}`}
        >
          History
        </Link>
      </nav>

      <p className="mt-5 text-sm text-ink/50">
        {enriched.length} verification{enriched.length === 1 ? "" : "s"} in this view.
      </p>

      {enriched.length === 0 ? (
        <Card className="mt-6 p-8 text-center">
          <p className="text-sm text-ink/60">Nothing waiting for manual review.</p>
        </Card>
      ) : (
        <ul className="mt-6 space-y-5">
          {enriched.map((row) => (
            <li key={row.id}>
              <Card className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-ink">{row.profileName}</h2>
                    <p className="mt-1 text-xs text-ink/50">
                      Submitted {new Date(row.createdAt).toLocaleString()} · {row.status}
                    </p>
                  </div>
                  <span className="rounded-full bg-wineSoft/50 px-2 py-1 text-xs capitalize text-wineDark">
                    {row.status}
                  </span>
                </div>

                {row.lastError ? (
                  <p className="mt-3 rounded-lg bg-ink/5 px-3 py-2 text-sm text-ink/65">
                    Previous note: {row.lastError}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {row.documents.map((document) =>
                    document.url ? (
                      <a
                        key={document.path}
                        href={document.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-ink/15 px-3 py-2 text-sm font-medium text-wine hover:bg-ink/5"
                      >
                        Open {document.label} ↗
                      </a>
                    ) : (
                      <span key={document.path} className="rounded-lg bg-ink/5 px-3 py-2 text-sm text-ink/50">
                        {document.label} unavailable
                      </span>
                    ),
                  )}
                  {row.documents.length === 0 ? (
                    <span className="text-sm text-ink/50">No stored documents remain.</span>
                  ) : null}
                </div>

                {row.status === "pending" ? (
                  <form action={decideManualIdentity} className="mt-5 space-y-3 border-t border-ink/10 pt-4">
                    <input type="hidden" name="verification_id" value={row.id} />
                    <label htmlFor={`identity-reason-${row.id}`} className="text-sm font-medium text-ink">
                      Review reason
                    </label>
                    <textarea
                      id={`identity-reason-${row.id}`}
                      name="reason"
                      minLength={10}
                      required
                      rows={2}
                      placeholder="Record what you checked. Never copy an ID number here."
                      className="w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        name="decision"
                        value="approve"
                        className="rounded-lg bg-wine px-3 py-2 text-sm font-medium text-white"
                      >
                        Approve identity
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="reject"
                        className="rounded-lg border border-wine/30 px-3 py-2 text-sm font-medium text-wine"
                      >
                        Require resubmission
                      </button>
                    </div>
                  </form>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
