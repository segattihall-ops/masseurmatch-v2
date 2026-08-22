import { getViewer } from "@masseurmatch/db/auth";
import { createServiceClient } from "@masseurmatch/db/client";
import type { Json } from "@masseurmatch/db/types";
import { NextResponse } from "next/server";
import { z } from "zod";

import { recordAdminAudit } from "@/lib/admin-audit";
import { clientAddress, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const updateSettingsSchema = z.object({
  action: z.literal("update_settings"),
  globalPause: z.boolean().optional(),
  knottyEnabled: z.boolean().optional(),
});

const updateContactSchema = z.object({
  action: z.literal("update_contact"),
  contactId: z.string().uuid(),
  lifecycleStatus: z
    .enum(["new", "contacted", "replied", "interested", "converted", "closed"])
    .optional(),
  knottyEnabled: z.boolean().optional(),
  optedOut: z.boolean().optional(),
  optedOutReason: z.string().trim().max(300).optional().nullable(),
});

const queueMessageSchema = z.object({
  action: z.literal("queue_message"),
  contactId: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
});

const markReadSchema = z.object({
  action: z.literal("mark_read"),
  conversationId: z.string().uuid(),
});

const postSchema = z.discriminatedUnion("action", [
  updateSettingsSchema,
  updateContactSchema,
  queueMessageSchema,
  markReadSchema,
]);

const queuedResultSchema = z.object({
  messageId: z.string().uuid(),
  queueId: z.string().uuid(),
  conversationId: z.string().uuid(),
  status: z.string(),
  scheduledFor: z.string(),
});

type LooseClient = {
  from: (table: string) => any;
  rpc: (
    name: string,
    params?: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

async function apiAdmin() {
  const viewer = await getViewer();
  if (!viewer) {
    return {
      viewer: null,
      response: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    };
  }
  if (viewer.role !== "admin") {
    return {
      viewer: null,
      response: NextResponse.json({ error: "Admin access required." }, { status: 403 }),
    };
  }
  return { viewer, response: null };
}

function limited(request: Request, bucket: string, limit: number): NextResponse | null {
  const result = rateLimit(`${bucket}:${clientAddress(request.headers)}`, limit, 60_000);
  if (result.ok) return null;
  return NextResponse.json(
    { error: "Too many requests. Try again shortly." },
    { status: 429, headers: { "Retry-After": String(result.retryAfter) } },
  );
}

function safeSearch(value: string | null): string | null {
  if (!value) return null;
  return value.trim().replace(/[,()%]/g, " ").slice(0, 120) || null;
}

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const auth = await apiAdmin();
  if (auth.response) return auth.response;
  const limitResponse = limited(request, "admin-messaging-read", 120);
  if (limitResponse) return limitResponse;

  const url = new URL(request.url);
  const search = safeSearch(url.searchParams.get("q"));
  const conversationId = url.searchParams.get("conversationId");
  if (conversationId && !z.string().uuid().safeParse(conversationId).success) {
    return errorResponse("Invalid conversation id.", 400);
  }

  const db = createServiceClient() as unknown as LooseClient;

  let contactsQuery = db
    .from("messaging_contacts")
    .select(
      "id,phone_e164,name,city,state,timezone,profile_url,lifecycle_status,knotty_enabled,opted_out,opted_out_at,opted_out_reason,last_outbound_at,last_inbound_at,last_activity_at,created_at,updated_at",
    )
    .order("last_activity_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(300);

  if (search) {
    contactsQuery = contactsQuery.or(
      `name.ilike.%${search}%,phone_e164.ilike.%${search}%,city.ilike.%${search}%`,
    );
  }

  const [
    settingsResult,
    contactsResult,
    conversationsResult,
    campaignsResult,
    queueResult,
    totalContactsResult,
    optedOutResult,
    pendingQueueResult,
    failedQueueResult,
    openConversationsResult,
  ] = await Promise.all([
    db.from("messaging_settings").select("*").eq("id", "default").maybeSingle(),
    contactsQuery,
    db
      .from("messaging_conversations")
      .select(
        "id,contact_id,receiving_number,status,knotty_enabled,current_channel,unread_count,last_message_at,last_inbound_at,last_outbound_at,created_at,updated_at,messaging_contacts(id,name,phone_e164,city,state,lifecycle_status,opted_out,knotty_enabled)",
      )
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(150),
    db
      .from("messaging_campaigns")
      .select("id,name,status,transport_preference,started_at,completed_at,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(20),
    db
      .from("messaging_queue")
      .select(
        "id,campaign_id,contact_id,conversation_id,message_id,body,transport_preference,status,scheduled_for,priority,attempts,max_attempts,locked_at,locked_by,last_error,sent_at,delivered_at,failed_at,created_at,messaging_contacts(id,name,phone_e164,city,state)",
      )
      .order("created_at", { ascending: false })
      .limit(100),
    db.from("messaging_contacts").select("id", { count: "exact", head: true }),
    db.from("messaging_contacts").select("id", { count: "exact", head: true }).eq("opted_out", true),
    db
      .from("messaging_queue")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "processing"]),
    db.from("messaging_queue").select("id", { count: "exact", head: true }).eq("status", "failed"),
    db
      .from("messaging_conversations")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
  ]);

  const required = [
    [settingsResult, "settings"],
    [contactsResult, "contacts"],
    [conversationsResult, "conversations"],
    [campaignsResult, "campaigns"],
    [queueResult, "queue"],
    [totalContactsResult, "contact count"],
    [optedOutResult, "opt-out count"],
    [pendingQueueResult, "queue count"],
    [failedQueueResult, "failure count"],
    [openConversationsResult, "conversation count"],
  ] as const;
  for (const [result, label] of required) {
    if (result.error) return errorResponse(`Could not load messaging ${label}: ${result.error.message}`);
  }

  let messages: unknown[] = [];
  if (conversationId) {
    const result = await db
      .from("messaging_messages")
      .select(
        "id,conversation_id,contact_id,campaign_id,direction,sender_type,body,channel,delivery_status,external_id,sent_at,delivered_at,received_at,failed_at,error_code,error_message,created_at,updated_at",
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(500);
    if (result.error) return errorResponse(`Could not load conversation messages: ${result.error.message}`);
    messages = result.data ?? [];
  }

  return NextResponse.json({
    ok: true,
    settings: settingsResult.data ?? null,
    contacts: contactsResult.data ?? [],
    conversations: conversationsResult.data ?? [],
    campaigns: campaignsResult.data ?? [],
    queue: queueResult.data ?? [],
    messages,
    counts: {
      contacts: totalContactsResult.count ?? 0,
      optedOut: optedOutResult.count ?? 0,
      pending: pendingQueueResult.count ?? 0,
      failed: failedQueueResult.count ?? 0,
      openConversations: openConversationsResult.count ?? 0,
    },
  });
}

export async function POST(request: Request) {
  const auth = await apiAdmin();
  if (auth.response || !auth.viewer) return auth.response;
  const limitResponse = limited(request, "admin-messaging-write", 60);
  if (limitResponse) return limitResponse;

  let input: z.infer<typeof postSchema>;
  try {
    input = postSchema.parse(await request.json());
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Invalid request.", 400);
  }

  const db = createServiceClient() as unknown as LooseClient;

  if (input.action === "update_settings") {
    const patch: Record<string, unknown> = {};
    if (input.globalPause !== undefined) patch.global_pause = input.globalPause;
    if (input.knottyEnabled !== undefined) patch.knotty_enabled = input.knottyEnabled;
    if (Object.keys(patch).length === 0) return errorResponse("No settings supplied.", 400);

    await recordAdminAudit({
      adminId: auth.viewer.user.id,
      action: "admin_messaging_settings_updated",
      targetType: "messaging_settings",
      targetId: "default",
      reason: "Admin changed global messaging controls.",
      details: patch as Json,
    });

    const result = await db
      .from("messaging_settings")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", "default")
      .select("*")
      .single();
    if (result.error) return errorResponse(result.error.message);
    return NextResponse.json({ ok: true, settings: result.data });
  }

  if (input.action === "update_contact") {
    const patch: Record<string, unknown> = {};
    if (input.lifecycleStatus !== undefined) patch.lifecycle_status = input.lifecycleStatus;
    if (input.knottyEnabled !== undefined) patch.knotty_enabled = input.knottyEnabled;
    if (input.optedOut !== undefined) {
      patch.opted_out = input.optedOut;
      patch.opted_out_at = input.optedOut ? new Date().toISOString() : null;
      patch.opted_out_reason = input.optedOut ? input.optedOutReason || "admin" : null;
      if (input.optedOut) patch.knotty_enabled = false;
    }
    if (Object.keys(patch).length === 0) return errorResponse("No contact changes supplied.", 400);

    await recordAdminAudit({
      adminId: auth.viewer.user.id,
      action: "admin_messaging_contact_updated",
      targetType: "messaging_contact",
      targetId: input.contactId,
      reason: "Admin changed contact messaging controls.",
      details: patch as Json,
    });

    const result = await db
      .from("messaging_contacts")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", input.contactId)
      .select(
        "id,phone_e164,name,city,state,lifecycle_status,knotty_enabled,opted_out,opted_out_at,opted_out_reason,last_activity_at,updated_at",
      )
      .single();
    if (result.error) return errorResponse(result.error.message);
    return NextResponse.json({ ok: true, contact: result.data });
  }

  if (input.action === "mark_read") {
    const result = await db
      .from("messaging_conversations")
      .update({ unread_count: 0, updated_at: new Date().toISOString() })
      .eq("id", input.conversationId);
    if (result.error) return errorResponse(result.error.message);
    return NextResponse.json({ ok: true });
  }

  const { data, error } = await db.rpc("admin_queue_messaging_message", {
    p_admin_user_id: auth.viewer.user.id,
    p_contact_id: input.contactId,
    p_body: input.body,
  });
  if (error) {
    const conflict = /opted out|globally paused/i.test(error.message);
    const missing = /contact not found/i.test(error.message);
    return errorResponse(error.message, conflict ? 409 : missing ? 404 : 500);
  }
  const queued = queuedResultSchema.parse(data);

  await recordAdminAudit({
    adminId: auth.viewer.user.id,
    action: "admin_messaging_message_queued",
    targetType: "messaging_message",
    targetId: queued.messageId,
    reason: "Admin queued a manual outbound message.",
    details: {
      contact_id: input.contactId,
      conversation_id: queued.conversationId,
      queue_id: queued.queueId,
    },
  });

  return NextResponse.json({ ok: true, ...queued });
}
