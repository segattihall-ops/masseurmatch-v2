import "server-only";

import { createServiceClient } from "@masseurmatch/db/client";

export async function getBillingConsole() {
  const service = createServiceClient();
  const [{ data: subscriptions, error: subscriptionError }, { data: events, error: eventError }] =
    await Promise.all([
      service
        .from("therapist_subscriptions")
        .select(
          "id,therapist_profile_id,profile_id,plan_id,status,provider,provider_subscription_id,current_period_start,current_period_end,cancel_at_period_end,created_at,updated_at",
        )
        .order("updated_at", { ascending: false })
        .limit(100),
      service
        .from("billing_events")
        .select("id,provider,event_id,kind,subscription_id,occurred_at,processed_at,error")
        .order("processed_at", { ascending: false })
        .limit(100),
    ]);
  if (subscriptionError) throw new Error(`Could not load subscriptions: ${subscriptionError.message}`);
  if (eventError) throw new Error(`Could not load billing events: ${eventError.message}`);

  const profileIds = [
    ...new Set(
      (subscriptions ?? [])
        .map((row) => row.profile_id ?? row.therapist_profile_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const names = new Map<string, string>();
  if (profileIds.length > 0) {
    const { data: profiles } = await service
      .from("profiles")
      .select("id,display_name,full_name,email")
      .in("id", profileIds);
    for (const profile of profiles ?? []) {
      names.set(
        profile.id,
        profile.display_name?.trim() || profile.full_name?.trim() || profile.email || profile.id,
      );
    }
  }

  return {
    subscriptions: (subscriptions ?? []).map((row) => ({
      ...row,
      profileName: names.get(row.profile_id ?? row.therapist_profile_id ?? "") ?? "Unknown therapist",
    })),
    events: events ?? [],
  };
}

export async function getKeywordConsole() {
  const service = createServiceClient();
  const [{ data: keywords, error: keywordError }, { data: trends, error: trendError }] =
    await Promise.all([
      service
        .from("keywords")
        .select("id,keyword,slug,label,category,created_at,updated_at")
        .order("category", { ascending: true })
        .order("keyword", { ascending: true })
        .limit(500),
      service
        .from("keyword_trends")
        .select(
          "id,city,state,keyword,score,date,week_avg,month_avg,peak_detected,week_over_week_change,search_volume,trend_direction",
        )
        .order("date", { ascending: false })
        .order("score", { ascending: false })
        .limit(100),
    ]);
  if (keywordError) throw new Error(`Could not load keywords: ${keywordError.message}`);
  if (trendError) throw new Error(`Could not load keyword trends: ${trendError.message}`);
  return { keywords: keywords ?? [], trends: trends ?? [] };
}

export async function getCityCoverage() {
  const { data, error } = await createServiceClient()
    .from("profiles")
    .select("id,city,state,profile_status,visibility_status")
    .order("state")
    .order("city")
    .limit(5000);
  if (error) throw new Error(`Could not load city coverage: ${error.message}`);

  const map = new Map<
    string,
    { city: string; state: string; profiles: number; approved: number; publicProfiles: number }
  >();
  for (const row of data ?? []) {
    const city = row.city?.trim();
    const state = row.state?.trim();
    if (!city || !state) continue;
    const key = `${state.toLowerCase()}|${city.toLowerCase()}`;
    const item = map.get(key) ?? { city, state, profiles: 0, approved: 0, publicProfiles: 0 };
    item.profiles += 1;
    if (row.profile_status === "approved") item.approved += 1;
    if (row.profile_status === "approved" && row.visibility_status === "public") {
      item.publicProfiles += 1;
    }
    map.set(key, item);
  }
  return [...map.values()].sort(
    (a, b) => b.publicProfiles - a.publicProfiles || a.state.localeCompare(b.state) || a.city.localeCompare(b.city),
  );
}

export async function getEmailConsole() {
  const service = createServiceClient();
  const [campaignsResult, templatesResult, queuedResult] = await Promise.all([
    service
      .from("admin_email_campaigns")
      .select("id,name,subject,send_category,scheduled_for,status,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(100),
    service
      .from("admin_email_templates")
      .select("id,name,description,subject,send_category,is_active,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .limit(100),
    service.from("email_queue").select("id", { count: "exact", head: true }),
  ]);
  if (campaignsResult.error) throw new Error(`Could not load campaigns: ${campaignsResult.error.message}`);
  if (templatesResult.error) throw new Error(`Could not load templates: ${templatesResult.error.message}`);
  if (queuedResult.error) throw new Error(`Could not count email queue: ${queuedResult.error.message}`);
  return {
    campaigns: campaignsResult.data ?? [],
    templates: templatesResult.data ?? [],
    queued: queuedResult.count ?? 0,
  };
}

export async function getSmsConsole() {
  const service = createServiceClient();
  const [logsResult, profilesResult, alertsResult] = await Promise.all([
    service
      .from("sms_logs")
      .select("id,profile_id,from_number,to_number,direction,body,intent,status,is_manual,created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    service
      .from("sms_profiles")
      .select("id,profile_id,ready_to_reply,availability_mode,twilio_number,updated_at")
      .order("updated_at", { ascending: false })
      .limit(100),
    service
      .from("sms_follow_up_alerts")
      .select("id,profile_id,client_phone,our_phone,last_outbound_at,last_inbound_at,resolved_at,created_at")
      .is("resolved_at", null)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  if (logsResult.error) throw new Error(`Could not load SMS logs: ${logsResult.error.message}`);
  if (profilesResult.error) throw new Error(`Could not load SMS profiles: ${profilesResult.error.message}`);
  if (alertsResult.error) throw new Error(`Could not load SMS alerts: ${alertsResult.error.message}`);
  return { logs: logsResult.data ?? [], profiles: profilesResult.data ?? [], alerts: alertsResult.data ?? [] };
}

export async function getMigrationConsole() {
  const { data, error } = await createServiceClient()
    .from("profile_migrations")
    .select(
      "id,email,profile_id,platform,source_url,status,imported_review_count,imported_rating,migration_notes,is_verified,verified_at,created_at,updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`Could not load profile migrations: ${error.message}`);
  return data ?? [];
}

export async function getBlogConsole() {
  const { data, error } = await createServiceClient()
    .from("blog_posts")
    .select("id,slug,title,excerpt,tags,published_at,created_at,updated_at")
    .order("published_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`Could not load blog posts: ${error.message}`);
  return data ?? [];
}

export async function getSettingsDiagnostic() {
  const { data, error } = await createServiceClient()
    .from("site_settings")
    .select(
      "id,require_identity_verification,require_text_verification,require_photo_review,require_manual_profile_review,allow_public_profiles,max_free_photos,max_standard_photos,max_pro_photos,max_elite_photos,maintenance_mode,signup_enabled,support_email,billing_email,legal_email,updated_at,updated_by",
    )
    .limit(10);
  if (error) throw new Error(`Could not load site settings: ${error.message}`);
  return data ?? [];
}

export async function getProfileCms(q = "") {
  const service = createServiceClient();
  let query = service
    .from("profiles")
    .select(
      "id,display_name,full_name,email,headline,bio,city,state,profile_status,visibility_status,lgbtq_affirming,offers_incall,offers_outcall,updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(50);
  const term = q.replace(/[,()]/g, " ").trim();
  if (term) {
    query = query.or(
      `display_name.ilike.%${term}%,full_name.ilike.%${term}%,email.ilike.%${term}%,city.ilike.%${term}%`,
    );
  }
  const { data, error } = await query;
  if (error) throw new Error(`Could not load profile CMS: ${error.message}`);
  return data ?? [];
}
