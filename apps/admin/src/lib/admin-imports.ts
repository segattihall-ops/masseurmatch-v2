import "server-only";

import { createServiceClient } from "@masseurmatch/db/client";

export type ImportedReviewRow = {
  id: string;
  migrationId: string | null;
  profileId: string | null;
  reviewerName: string | null;
  reviewText: string | null;
  rating: number | null;
  reviewDate: string | null;
  sourceUrl: string | null;
  sourcePlatform: string | null;
  isPublic: boolean;
  reviewedAt: string | null;
  reviewNotes: string | null;
  publicLabel: string;
};

export type ProfileMigrationRow = {
  id: string;
  email: string;
  profileId: string | null;
  profileName: string;
  platform: string;
  sourceUrl: string;
  status: string;
  importedReviews: number;
  importedRating: number | null;
  notes: string | null;
  createdAt: string | null;
  verified: boolean;
  verifiedAt: string | null;
  reviews: ImportedReviewRow[];
};

export async function listProfileMigrations(): Promise<ProfileMigrationRow[]> {
  const service = createServiceClient();
  const { data: migrations, error } = await service
    .from("profile_migrations")
    .select(
      "id,email,profile_id,platform,source_url,status,imported_reviews,imported_review_count,imported_rating,migration_notes,created_at,is_verified,verified_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`Could not load profile migrations: ${error.message}`);

  const migrationIds = (migrations ?? []).map((row) => row.id);
  const profileIds = [
    ...new Set((migrations ?? []).map((row) => row.profile_id).filter((id): id is string => Boolean(id))),
  ];

  const [reviewsResult, profilesResult] = await Promise.all([
    migrationIds.length > 0
      ? service
          .from("imported_reviews")
          .select(
            "id,migration_id,profile_id,reviewer_name,review_text,rating,review_date,source_url,source_platform,is_public,reviewed_at,review_notes,public_label",
          )
          .in("migration_id", migrationIds)
          .order("review_date", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    profileIds.length > 0
      ? service.from("profiles").select("id,display_name,full_name,email").in("id", profileIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (reviewsResult.error) throw new Error(`Could not load imported reviews: ${reviewsResult.error.message}`);
  if (profilesResult.error) throw new Error(`Could not load imported profile names: ${profilesResult.error.message}`);

  const names = new Map<string, string>();
  for (const profile of profilesResult.data ?? []) {
    names.set(
      profile.id,
      profile.display_name?.trim() || profile.full_name?.trim() || profile.email?.trim() || "Unnamed provider",
    );
  }

  const reviews: ImportedReviewRow[] = (reviewsResult.data ?? []).map((row) => ({
    id: row.id,
    migrationId: row.migration_id,
    profileId: row.profile_id,
    reviewerName: row.reviewer_name,
    reviewText: row.review_text,
    rating: row.rating === null ? null : Number(row.rating),
    reviewDate: row.review_date,
    sourceUrl: row.source_url,
    sourcePlatform: row.source_platform,
    isPublic: Boolean(row.is_public),
    reviewedAt: row.reviewed_at,
    reviewNotes: row.review_notes,
    publicLabel: row.public_label,
  }));

  return (migrations ?? []).map((migration) => ({
    id: migration.id,
    email: migration.email,
    profileId: migration.profile_id,
    profileName:
      (migration.profile_id && names.get(migration.profile_id)) || migration.email || "Unlinked import",
    platform: migration.platform,
    sourceUrl: migration.source_url,
    status: migration.status,
    importedReviews: migration.imported_review_count ?? migration.imported_reviews ?? 0,
    importedRating: migration.imported_rating === null ? null : Number(migration.imported_rating),
    notes: migration.migration_notes,
    createdAt: migration.created_at,
    verified: Boolean(migration.is_verified),
    verifiedAt: migration.verified_at,
    reviews: reviews.filter((review) => review.migrationId === migration.id),
  }));
}
