import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminProfileDetail } from "@/lib/admin-profile";
import { requireAdmin } from "@/lib/guards";
import { publicProfileUrl } from "@/lib/public-site";

import { updateProfileContent } from "./actions";

export const metadata: Metadata = {
  title: "Provider profile",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function text(value: string | null): string {
  return value ?? "";
}

export default async function AdminPersonPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { saved?: string; error?: string };
}) {
  await requireAdmin(`/people/${params.id}`);
  const profile = await getAdminProfileDetail(params.id);
  if (!profile) notFound();

  const publicUrl = publicProfileUrl({
    slug: profile.slug,
    city: profile.city,
    state: profile.state,
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/people" className="text-sm font-medium text-wine hover:underline">
            ← People
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-ink">
            {profile.displayName ?? profile.fullName ?? profile.email ?? "Unnamed provider"}
          </h1>
          <p className="mt-1 text-sm text-ink/55">Profile ID {profile.id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {publicUrl ? (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-wine/20 px-3 py-2 text-sm font-medium text-wine hover:bg-wineSoft/30"
            >
              Public profile ↗
            </a>
          ) : null}
          <Link
            href="/moderation"
            className="rounded-lg border border-wine/20 px-3 py-2 text-sm font-medium text-wine hover:bg-wineSoft/30"
          >
            Moderation
          </Link>
          <Link
            href="/verifications"
            className="rounded-lg border border-wine/20 px-3 py-2 text-sm font-medium text-wine hover:bg-wineSoft/30"
          >
            Verification
          </Link>
        </div>
      </div>

      {searchParams.saved ? (
        <p
          className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          {searchParams.saved === "unchanged"
            ? "No profile fields changed."
            : "Profile content saved."}
        </p>
      ) : null}
      {searchParams.error ? (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {searchParams.error}
        </p>
      ) : null}

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatusCard label="Profile" value={profile.profileStatus ?? "—"} />
        <StatusCard label="Visibility" value={profile.visibilityStatus ?? "—"} />
        <StatusCard label="Plan" value={profile.subscriptionTier ?? "free"} />
        <StatusCard label="Photos" value={String(profile.photoCount)} />
        <StatusCard
          label="Identity"
          value={profile.verifiedIdentity ? "Verified" : "Not verified"}
        />
        <StatusCard label="Phone" value={profile.verifiedPhone ? "Verified" : "Not verified"} />
        <StatusCard label="Suspended" value={profile.suspended ? "Yes" : "No"} />
        <StatusCard label="Banned" value={profile.banned ? "Yes" : "No"} />
      </section>

      <Card className="mt-8 p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-semibold text-ink">Profile content</h2>
          <p className="mt-1 text-sm text-ink/55">
            Operational content edits only. Approval, billing and verification remain in their
            dedicated workflows.
          </p>
        </div>

        <form action={updateProfileContent} className="mt-6 grid gap-5 sm:grid-cols-2">
          <input type="hidden" name="profile_id" value={profile.id} />

          <Field
            label="Display name"
            name="display_name"
            defaultValue={text(profile.displayName)}
            maxLength={120}
          />
          <Field
            label="Headline"
            name="headline"
            defaultValue={text(profile.headline)}
            maxLength={120}
          />
          <Field label="City" name="city" defaultValue={text(profile.city)} maxLength={120} />
          <Field label="State" name="state" defaultValue={text(profile.state)} maxLength={80} />
          <Field label="Phone" name="phone" defaultValue={text(profile.phone)} maxLength={40} />
          <Field
            label="Email"
            name="email"
            type="email"
            defaultValue={text(profile.email)}
            maxLength={254}
          />
          <Field
            label="Website"
            name="website"
            type="url"
            defaultValue={text(profile.website)}
            maxLength={500}
            placeholder="https://"
          />

          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-ink">Bio</span>
            <textarea
              name="bio"
              defaultValue={text(profile.bio)}
              maxLength={4000}
              rows={8}
              className="mt-1.5 w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-ink">Audit reason</span>
            <textarea
              name="reason"
              required
              minLength={10}
              maxLength={500}
              rows={2}
              placeholder="Why this admin edit is necessary. Do not copy sensitive ID data here."
              className="mt-1.5 w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink"
            />
          </label>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-5">
            <button
              type="submit"
              className="rounded-lg bg-wine px-4 py-2.5 text-sm font-medium text-white"
            >
              Save profile content
            </button>
            <p className="text-xs text-ink/45">
              Last profile update {new Date(profile.updatedAt).toLocaleString()}.
            </p>
          </div>
        </form>
      </Card>
    </main>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-ink/50">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold capitalize text-ink">
        {value.replaceAll("_", " ")}
      </p>
    </Card>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  maxLength,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  maxLength: number;
  placeholder?: string;
}) {
  return (
    <label>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        maxLength={maxLength}
        placeholder={placeholder}
        className="mt-1.5 min-h-11 w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink"
      />
    </label>
  );
}
