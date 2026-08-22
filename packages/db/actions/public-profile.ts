import "server-only";

import { createAnonClient, createServiceClient, hasSupabaseCredentials } from "../client";

export type ProfileHoursEntry = {
  day?: string;
  enabled?: boolean;
  start_time?: string;
  end_time?: string;
};

export type PublicProfileSupplement = {
  phone: string | null;
  whatsapp_number: string | null;
  email_address: string | null;
  show_email: boolean | null;
  show_phone: boolean | null;
  website: string | null;
  booking_url: string | null;
  booking_link: string | null;
  starting_price: number | null;
  height_inches: number | null;
  weight_lb: number | null;
  body_type: string | null;
  start_year: number | null;
  created_at: string | null;
  last_active_at: string | null;
  verification_status: string | null;
  is_verified_photos: boolean | null;
  is_verified_phone: boolean | null;
  is_verified_email: boolean | null;
  is_demo: boolean | null;
  country: string | null;
  gender: string | null;
  neighborhood_name: string | null;
  primary_area: string | null;
  areas_served: string[] | null;
  outcall_radius_miles: number | null;
  business_hours: unknown;
  studio_hours: unknown;
  mobile_hours: unknown;
  current_status: string | null;
  availability_note: string | null;
  incall_details: string | null;
  outcall_details: string | null;
  pricing_sessions: unknown;
  custom_faq: unknown;
  travel_schedule: unknown;
  promotions: unknown;
  add_ons: unknown;
  training: string | null;
  education: string | null;
  education_entries: unknown;
  massage_setup: string[] | null;
  mobile_extras: string[] | null;
  additional_services: string[] | null;
  studio_amenities: string[] | null;
  incall_amenities: string[] | null;
  products_used: string[] | null;
  products_sold: string[] | null;
  payment_methods: string[] | null;
  affiliations: string[] | null;
  rate_disclaimers: string[] | null;
  regular_discounts: unknown;
  day_of_week_discount: unknown;
  accessibility_features: string[] | null;
  accepts_all_genders: boolean | null;
  map_enabled: boolean | null;
  street_reference: string | null;
  seo_keywords: string[] | null;
  presentation_video_url: string | null;
  social_media: unknown;
};

export type PublicImportedReview = {
  id: string;
  review_text: string;
  rating: number | null;
  reviewer_name: string | null;
  review_date: string | null;
  public_label: string | null;
};

const EMPTY_SUPPLEMENT: PublicProfileSupplement = {
  phone: null,
  whatsapp_number: null,
  email_address: null,
  show_email: null,
  show_phone: null,
  website: null,
  booking_url: null,
  booking_link: null,
  starting_price: null,
  height_inches: null,
  weight_lb: null,
  body_type: null,
  start_year: null,
  created_at: null,
  last_active_at: null,
  verification_status: null,
  is_verified_photos: null,
  is_verified_phone: null,
  is_verified_email: null,
  is_demo: null,
  country: null,
  gender: null,
  neighborhood_name: null,
  primary_area: null,
  areas_served: null,
  outcall_radius_miles: null,
  business_hours: null,
  studio_hours: null,
  mobile_hours: null,
  current_status: null,
  availability_note: null,
  incall_details: null,
  outcall_details: null,
  pricing_sessions: null,
  custom_faq: null,
  travel_schedule: null,
  promotions: null,
  add_ons: null,
  training: null,
  education: null,
  education_entries: null,
  massage_setup: null,
  mobile_extras: null,
  additional_services: null,
  studio_amenities: null,
  incall_amenities: null,
  products_used: null,
  products_sold: null,
  payment_methods: null,
  affiliations: null,
  rate_disclaimers: null,
  regular_discounts: null,
  day_of_week_discount: null,
  accessibility_features: null,
  accepts_all_genders: null,
  map_enabled: null,
  street_reference: null,
  seo_keywords: null,
  presentation_video_url: null,
  social_media: null,
};

const SUPPLEMENT_COLUMNS = [
  "phone",
  "whatsapp_number",
  "email_address",
  "show_email",
  "show_phone",
  "website",
  "booking_url",
  "booking_link",
  "starting_price",
  "height_inches",
  "weight_lb",
  "body_type",
  "start_year",
  "created_at",
  "last_active_at",
  "verification_status",
  "is_verified_photos",
  "is_verified_phone",
  "is_verified_email",
  "is_demo",
  "country",
  "gender",
  "neighborhood_name",
  "primary_area",
  "areas_served",
  "outcall_radius_miles",
  "business_hours",
  "studio_hours",
  "mobile_hours",
  "current_status",
  "availability_note",
  "incall_details",
  "outcall_details",
  "pricing_sessions",
  "custom_faq",
  "travel_schedule",
  "promotions",
  "add_ons",
  "training",
  "education",
  "education_entries",
  "massage_setup",
  "mobile_extras",
  "additional_services",
  "studio_amenities",
  "incall_amenities",
  "products_used",
  "products_sold",
  "payment_methods",
  "affiliations",
  "rate_disclaimers",
  "regular_discounts",
  "day_of_week_discount",
  "accessibility_features",
  "accepts_all_genders",
  "map_enabled",
  "street_reference",
  "seo_keywords",
  "presentation_video_url",
  "social_media",
].join(",");

export async function getPublicProfileSupplement(
  profileId: string,
): Promise<PublicProfileSupplement> {
  if (!hasSupabaseCredentials()) return EMPTY_SUPPLEMENT;

  const client = createAnonClient();
  const { data, error } = await client
    .from("profiles")
    .select(SUPPLEMENT_COLUMNS)
    .eq("id", profileId)
    .eq("profile_status", "approved")
    .eq("visibility_status", "public")
    .maybeSingle();

  if (error || !data) return EMPTY_SUPPLEMENT;
  return { ...EMPTY_SUPPLEMENT, ...(data as unknown as PublicProfileSupplement) };
}

export async function getPublicImportedReviews(
  profileId: string,
  limit = 100,
): Promise<PublicImportedReview[]> {
  if (!hasSupabaseCredentials()) return [];

  let client;
  try {
    client = createServiceClient();
  } catch {
    // imported_reviews is intentionally blocked to anon by RLS. A preview that
    // has no service key still renders the profile; it simply omits reviews.
    return [];
  }

  const { data, error } = await client
    .from("imported_reviews")
    .select("id,review_text,rating,reviewer_name,review_date,public_label")
    .eq("profile_id", profileId)
    .eq("is_public", true)
    .order("review_date", { ascending: false, nullsFirst: false })
    .limit(Math.min(100, Math.max(1, limit)));

  if (error || !data) return [];

  return data
    .filter((row) => typeof row.review_text === "string" && row.review_text.trim().length > 0)
    .map((row) => ({
      id: String(row.id),
      review_text: String(row.review_text),
      rating: typeof row.rating === "number" ? row.rating : row.rating ? Number(row.rating) : null,
      reviewer_name: row.reviewer_name ?? null,
      review_date: row.review_date ?? null,
      public_label: row.public_label ?? null,
    }));
}
