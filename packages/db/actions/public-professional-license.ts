import "server-only";

import { createServiceClient, hasSupabaseCredentials } from "../client";

export type PublicProfessionalLicense = {
  licenseType: string | null;
  issuingAuthority: string | null;
  jurisdiction: string | null;
  licenseNumberLast4: string | null;
  expiresOn: string | null;
  verifiedAt: string | null;
};

export async function getPublicProfessionalLicense(
  profileId: string,
): Promise<PublicProfessionalLicense | null> {
  if (!hasSupabaseCredentials()) return null;

  const client = createServiceClient() as any;
  const { data, error } = await client
    .from("profile_documents")
    .select(
      "license_type,license_number,issuing_authority,jurisdiction,expires_on,verified_at,created_at",
    )
    .eq("profile_id", profileId)
    .eq("status", "approved")
    .or("document_type.eq.professional_license,type.eq.professional_license")
    .order("verified_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !data) return null;

  const today = new Date().toISOString().slice(0, 10);
  const current = (data as any[]).find(
    (row) => !row.expires_on || String(row.expires_on).slice(0, 10) >= today,
  );
  if (!current) return null;

  const number = String(current.license_number ?? "").replace(/\s+/g, "");
  return {
    licenseType: current.license_type ?? null,
    issuingAuthority: current.issuing_authority ?? null,
    jurisdiction: current.jurisdiction ?? null,
    licenseNumberLast4: number ? number.slice(-4) : null,
    expiresOn: current.expires_on ?? null,
    verifiedAt: current.verified_at ?? null,
  };
}
