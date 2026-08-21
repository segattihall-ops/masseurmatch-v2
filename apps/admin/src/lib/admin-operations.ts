import "server-only";

import { createServiceClient } from "@masseurmatch/db/client";

export type AdminPhoto = {
  id: string;
  profileId: string | null;
  profileName: string;
  url: string | null;
  storagePath: string | null;
  storageBucket: string | null;
  isPrimary: boolean;
  status: string;
  reason: string | null;
  createdAt: string;
};

export type AdminReport = {
  source: "profile_report" | "complaint";
  id: string;
  profileId: string | null;
  profileName: string;
  category: string;
  reason: string;
  reporterEmail: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
};

export type AuditRow = {
  id: string;
  adminUserId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  reason: string | null;
  details: unknown;
  createdAt: string;
};

export type ManualIdentityRow = {
  id: string;
  userId: string | null;
  profileId: string | null;
  profileName: string;
  status: string;
  lastError: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type AdminReportSummary = {
  profiles: number;
  approvedProfiles: number;
  pendingProfiles: number;
  suspendedProfiles: number;
  verifiedProfiles: number;
  pendingPhotos: number;
  pendingDocuments: number;
  pendingManualIdentity: number;
  openSafetyReports: number;
  openSupportTickets: number;
  rankingEvents30d: number;
  profileViews30d: number;
  searches30d: number;
};

async function profileNames(ids: Array<string | null | undefined>): Promise<Map<string, string>> {
  const profileIds = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  const names = new Map<string, string>();
  if (profileIds.length === 0) return names;

  const { data } = await createServiceClient()
    .from("profiles")
    .select("id,display_name,full_name,email")
    .in("id", profileIds);

  for (const profile of data ?? []) {
    names.set(
      profile.id,
      profile.display_name?.trim() ||
        profile.full_name?.trim() ||
        profile.email?.trim() ||
        "Unnamed therapist",
    );
  }
  return names;
}

export async function listAdminPhotos(status = "pending"): Promise<AdminPhoto[]> {
  const service = createServiceClient();
  let query = service
    .from("profile_photos")
    .select(
      "id,profile_id,url,storage_path,storage_bucket,is_primary,moderation_status,moderation_reason,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (status !== "all") query = query.eq("moderation_status", status);
  const { data, error } = await query;
  if (error) throw new Error(`Could not load photos: ${error.message}`);

  const names = await profileNames((data ?? []).map((row) => row.profile_id));
  return (data ?? []).map((row) => ({
    id: row.id,
    profileId: row.profile_id,
    profileName: (row.profile_id && names.get(row.profile_id)) || "Unknown therapist",
    url: row.url,
    storagePath: row.storage_path,
    storageBucket: row.storage_bucket,
    isPrimary: Boolean(row.is_primary),
    status: row.moderation_status ?? "pending",
    reason: row.moderation_reason,
    createdAt: row.created_at,
  }));
}

export async function listAdminReports(status = "open"): Promise<AdminReport[]> {
  const service = createServiceClient();

  let reportsQuery = service
    .from("profile_reports")
    .select(
      "id,profile_id,profile_name,category,reason,reporter_email,status,admin_notes,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (status !== "all") reportsQuery = reportsQuery.eq("status", status);

  let complaintsQuery = service
    .from("complaints")
    .select(
      "id,profile_id,reported_profile_id,category,title,message,description,reporter_email,status,admin_notes,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (status === "open") {
    complaintsQuery = complaintsQuery.in("status", ["new", "pending"]);
  } else if (status === "actioned") {
    complaintsQuery = complaintsQuery.eq("status", "resolved");
  } else if (status === "dismissed") {
    complaintsQuery = complaintsQuery.eq("status", "dismissed");
  } else if (status === "reviewing") {
    complaintsQuery = complaintsQuery.eq("status", "reviewing");
  }

  const [reportsResult, complaintsResult] = await Promise.all([reportsQuery, complaintsQuery]);
  if (reportsResult.error) {
    throw new Error(`Could not load profile reports: ${reportsResult.error.message}`);
  }
  if (complaintsResult.error) {
    throw new Error(`Could not load complaints: ${complaintsResult.error.message}`);
  }

  const complaintProfileIds = (complaintsResult.data ?? []).map(
    (row) => row.reported_profile_id ?? row.profile_id,
  );
  const names = await profileNames(complaintProfileIds);

  const reports: AdminReport[] = (reportsResult.data ?? []).map((row) => ({
    source: "profile_report",
    id: row.id,
    profileId: row.profile_id,
    profileName: row.profile_name?.trim() || "Unknown therapist",
    category: row.category,
    reason: row.reason,
    reporterEmail: row.reporter_email,
    status: row.status,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
  }));

  const complaints: AdminReport[] = (complaintsResult.data ?? []).map((row) => {
    const profileId = row.reported_profile_id ?? row.profile_id;
    return {
      source: "complaint",
      id: row.id,
      profileId,
      profileName: (profileId && names.get(profileId)) || "Unknown therapist",
      category: row.category ?? "other",
      reason:
        row.description?.trim() ||
        row.message?.trim() ||
        row.title?.trim() ||
        "No details provided.",
      reporterEmail: row.reporter_email,
      status: row.status ?? "new",
      adminNotes: row.admin_notes,
      createdAt: row.created_at ?? new Date(0).toISOString(),
    };
  });

  return [...reports, ...complaints].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function listAuditLog(page = 1, q = ""): Promise<{ rows: AuditRow[]; total: number }> {
  const service = createServiceClient();
  const safePage = Math.max(1, page);
  const size = 50;
  const from = (safePage - 1) * size;
  let query = service
    .from("audit_log")
    .select("id,admin_user_id,action,target_type,target_id,reason,details,created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, from + size - 1);

  const term = q.replace(/[,()]/g, " ").trim();
  if (term) {
    query = query.or(
      `action.ilike.%${term}%,target_type.ilike.%${term}%,target_id.ilike.%${term}%`,
    );
  }

  const { data, error, count } = await query;
  if (error) throw new Error(`Could not load audit log: ${error.message}`);

  return {
    total: count ?? 0,
    rows: (data ?? []).map((row) => ({
      id: row.id,
      adminUserId: row.admin_user_id,
      action: row.action,
      targetType: row.target_type,
      targetId: row.target_id,
      reason: row.reason,
      details: row.details,
      createdAt: row.created_at,
    })),
  };
}

export async function listManualIdentity(status = "pending"): Promise<ManualIdentityRow[]> {
  const service = createServiceClient();
  let query = service
    .from("identity_verifications")
    .select("id,user_id,profile_id,status,last_error,metadata,created_at,updated_at")
    .eq("provider", "manual")
    .order("created_at", { ascending: true })
    .limit(100);

  if (status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(`Could not load manual identity verifications: ${error.message}`);

  const names = await profileNames((data ?? []).map((row) => row.profile_id));
  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    profileId: row.profile_id,
    profileName: (row.profile_id && names.get(row.profile_id)) || "Unknown therapist",
    status: row.status,
    lastError: row.last_error,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getAdminReportSummary(): Promise<AdminReportSummary> {
  const service = createServiceClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    profilesResult,
    approvedResult,
    pendingResult,
    suspendedResult,
    verifiedResult,
    photosResult,
    documentsResult,
    manualIdentityResult,
    profileReportsResult,
    newComplaintsResult,
    pendingComplaintsResult,
    ticketsResult,
    rankingResult,
    viewsResult,
    searchesResult,
  ] = await Promise.all([
    service.from("profiles").select("id", { count: "exact", head: true }),
    service
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("profile_status", "approved"),
    service
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .in("profile_status", ["pending", "pending_approval", "under_review"]),
    service
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("profile_status", "suspended"),
    service
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_verified_identity", true),
    service
      .from("profile_photos")
      .select("id", { count: "exact", head: true })
      .eq("moderation_status", "pending"),
    service
      .from("profile_documents")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    service
      .from("identity_verifications")
      .select("id", { count: "exact", head: true })
      .eq("provider", "manual")
      .eq("status", "pending"),
    service
      .from("profile_reports")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "reviewing"]),
    service.from("complaints").select("id", { count: "exact", head: true }).eq("status", "new"),
    service.from("complaints").select("id", { count: "exact", head: true }).eq("status", "pending"),
    service
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "in_progress", "waiting_on_user"]),
    service
      .from("ranking_events")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since),
    service
      .from("profile_view_analytics")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since),
    service
      .from("search_analytics")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since),
  ]);

  const results = [
    ["profiles", profilesResult],
    ["approved profiles", approvedResult],
    ["pending profiles", pendingResult],
    ["suspended profiles", suspendedResult],
    ["verified profiles", verifiedResult],
    ["pending photos", photosResult],
    ["pending documents", documentsResult],
    ["manual identity", manualIdentityResult],
    ["profile reports", profileReportsResult],
    ["new complaints", newComplaintsResult],
    ["pending complaints", pendingComplaintsResult],
    ["support tickets", ticketsResult],
    ["ranking events", rankingResult],
    ["profile views", viewsResult],
    ["searches", searchesResult],
  ] as const;

  for (const [label, result] of results) {
    if (result.error) throw new Error(`Could not count ${label}: ${result.error.message}`);
  }

  return {
    profiles: profilesResult.count ?? 0,
    approvedProfiles: approvedResult.count ?? 0,
    pendingProfiles: pendingResult.count ?? 0,
    suspendedProfiles: suspendedResult.count ?? 0,
    verifiedProfiles: verifiedResult.count ?? 0,
    pendingPhotos: photosResult.count ?? 0,
    pendingDocuments: documentsResult.count ?? 0,
    pendingManualIdentity: manualIdentityResult.count ?? 0,
    openSafetyReports:
      (profileReportsResult.count ?? 0) +
      (newComplaintsResult.count ?? 0) +
      (pendingComplaintsResult.count ?? 0),
    openSupportTickets: ticketsResult.count ?? 0,
    rankingEvents30d: rankingResult.count ?? 0,
    profileViews30d: viewsResult.count ?? 0,
    searches30d: searchesResult.count ?? 0,
  };
}
