import { createServiceClient } from "@masseurmatch/db/client";
import Link from "next/link";

import { PageHeader } from "@/components/pro/page-header";
import { DetailRow, Section } from "@/components/pro/section";
import { requireTherapist } from "@/lib/guards";
import { getProDashboard } from "@/lib/pro-dashboard";

import { LicenseForm } from "./license-form";

export const metadata = { title: "Trust & Verification | MasseurMatch" };
export const dynamic = "force-dynamic";

type LicenseRow = {
  status: string | null;
  holder_name: string | null;
  license_type: string | null;
  license_number: string | null;
  issuing_authority: string | null;
  jurisdiction: string | null;
  issued_on: string | null;
  expires_on: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
};

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function licenseStatus(row: LicenseRow | null) {
  if (!row) return "Not submitted";
  if (row.status === "approved") {
    if (row.expires_on && row.expires_on < new Date().toISOString().slice(0, 10)) return "Expired";
    return "Verified";
  }
  if (row.status === "pending") return "Pending review";
  if (row.status === "rejected") return "Needs resubmission";
  return row.status ?? "Not submitted";
}

export default async function ProTrustPage() {
  const viewer = await requireTherapist("/pro/trust");
  const data = await getProDashboard(viewer.user.id);
  const { profile } = data;

  const service = createServiceClient() as any;
  const { data: licenseData } = await service
    .from("profile_documents")
    .select(
      "status,holder_name,license_type,license_number,issuing_authority,jurisdiction,issued_on,expires_on,verified_at,rejection_reason,created_at",
    )
    .eq("profile_id", profile.id)
    .or("document_type.eq.professional_license,type.eq.professional_license")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const license = (licenseData ?? null) as LicenseRow | null;

  const rows: { label: string; value: string; href: string }[] = [
    {
      label: "Phone",
      value: profile.is_verified_phone ? "Verified" : "Not verified",
      href: "/verify-phone",
    },
    {
      label: "Identity document",
      value: profile.is_verified_identity ? "Verified" : (data.identity ?? "Not started"),
      href: "/verify-id",
    },
    {
      label: "Professional license",
      value: licenseStatus(license),
      href: "/pro/trust#professional-license",
    },
    {
      label: "Profile approval",
      value: profile.profile_status ?? "draft",
      href: "/pro/approval-status",
    },
    {
      label: "Visibility",
      value: data.toggles.visible ? "On" : "Off",
      href: "/pro/dashboard",
    },
    {
      label: "Approved photos",
      value: `${data.photos.approved} of ${data.photos.approved + data.photos.pending + data.photos.rejected}`,
      href: "/pro/photos",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Trust & verification"
        subtitle="What we have confirmed about your account, and what is still open."
      />

      <Section
        title="Verification state"
        description="Approval is separate from visibility. Professional licensing is also reviewed separately from identity verification."
      >
        <div>
          {rows.map((row) => (
            <DetailRow
              key={row.label}
              label={row.label}
              value={
                <Link href={row.href} className="underline underline-offset-4">
                  {row.value}
                </Link>
              }
            />
          ))}
        </div>
      </Section>

      <div id="professional-license" className="scroll-mt-24">
        <Section
          title="Professional license"
          description="Enter the information exactly as it appears on your license and upload a clear photo. MasseurMatch staff review the submission; providers cannot approve their own credential."
        >
          {license ? (
            <div className="mb-6 rounded-2xl border border-border bg-bg-subtle p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-foreground">{licenseStatus(license)}</p>
                {license.verified_at ? (
                  <span className="text-xs text-muted-foreground">
                    Verified {formatDate(license.verified_at)}
                  </span>
                ) : null}
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                {[
                  ["Name on license", license.holder_name],
                  ["License type", license.license_type],
                  ["License number", license.license_number],
                  ["Issuing authority", license.issuing_authority],
                  ["Jurisdiction", license.jurisdiction],
                  ["Issued", formatDate(license.issued_on)],
                  ["Expires", formatDate(license.expires_on)],
                ]
                  .filter(([, value]) => Boolean(value))
                  .map(([label, value]) => (
                    <div key={String(label)}>
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
                    </div>
                  ))}
              </dl>
              {license.status === "rejected" && license.rejection_reason ? (
                <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm">
                  {license.rejection_reason}
                </p>
              ) : null}
            </div>
          ) : null}

          {license?.status === "pending" ? (
            <p className="text-sm text-muted-foreground">
              Your license is waiting for review. You can submit a replacement below only if you
              need to correct the information or image.
            </p>
          ) : license?.status === "approved" ? (
            <p className="mb-4 text-sm text-muted-foreground">
              Your current license is verified. Submit a new copy below when the license is renewed
              or the details change; the current verified credential remains valid until the
              replacement is approved or expires.
            </p>
          ) : null}

          <div className="mt-5">
            <LicenseForm />
          </div>
        </Section>
      </div>

      <Section title="What clients see">
        <p className="text-sm text-muted-foreground">
          Verified phone and identity earn their own trust signals. When a professional license is
          approved, clients can see a separate license-verified signal and sanitized credential
          details. The license image and full document remain private and are never shown on the
          public profile.
        </p>
      </Section>
    </>
  );
}
