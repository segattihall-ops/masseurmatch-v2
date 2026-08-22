import { getViewer } from "@masseurmatch/db/auth";
import { createServiceClient } from "@masseurmatch/db/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { recordAdminAudit } from "@/lib/admin-audit";
import { clientAddress, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const campaignSchema = z.object({
  action: z.literal("create_campaign"),
  name: z.string().trim().min(2).max(120),
  subject: z.string().trim().min(1).max(180),
  bodyHtml: z.string().min(1).max(150_000),
  bodyText: z.string().max(80_000).optional().nullable(),
  sendCategory: z.enum(["marketing", "transactional"]),
  fromAddress: z.string().trim().max(200).optional().nullable(),
  replyTo: z.string().trim().email().optional().nullable(),
  scheduledFor: z.string().datetime().optional().nullable(),
  templateId: z.string().uuid().optional().nullable(),
  userIds: z.array(z.string().uuid()).max(500).default([]),
  profileStatuses: z.array(z.string().trim().min(1)).max(20).default([]),
  plans: z.array(z.string().trim().min(1)).max(20).default([]),
  cities: z.array(z.string().trim().min(1)).max(100).default([]),
  states: z.array(z.string().trim().min(1)).max(100).default([]),
});

const templateSchema = z.object({
  action: z.literal("save_template"),
  id: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  subject: z.string().trim().min(1).max(180),
  bodyHtml: z.string().min(1).max(150_000),
  bodyText: z.string().max(80_000).optional().nullable(),
  sendCategory: z.enum(["marketing", "transactional"]),
  fromAddress: z.string().trim().max(200).optional().nullable(),
  replyTo: z.string().trim().email().optional().nullable(),
});

const cancelSchema = z.object({
  action: z.literal("cancel_campaign"),
  campaignId: z.string().uuid(),
});

const draftSchema = z.object({
  action: z.literal("ai_generate"),
  objective: z.string().trim().min(3).max(1200),
  audience: z.string().trim().max(500).default("MasseurMatch providers"),
  tone: z
    .enum(["professional", "warm", "concise", "educational", "promotional"])
    .default("professional"),
  cta: z.string().trim().max(300).optional().nullable(),
  offer: z.string().trim().max(500).optional().nullable(),
  category: z.enum(["marketing", "transactional"]).default("marketing"),
});

const postSchema = z.discriminatedUnion("action", [
  campaignSchema,
  templateSchema,
  cancelSchema,
  draftSchema,
]);

const generatedDraftSchema = z.object({
  campaignName: z.string().min(1).max(120),
  subject: z.string().min(1).max(180),
  previewText: z.string().max(220).default(""),
  bodyHtml: z.string().min(1).max(150_000),
  bodyText: z.string().min(1).max(80_000),
  suggestedAudience: z.string().max(500).default(""),
  suggestedSchedule: z.string().max(120).default(""),
});

const deepSeekResponseSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string() }) })).min(1),
});

const campaignResultSchema = z.object({
  campaignId: z.string().uuid(),
  total: z.coerce.number().int().nonnegative(),
  queued: z.coerce.number().int().nonnegative(),
  suppressed: z.coerce.number().int().nonnegative(),
});

const countSchema = z.coerce.number().int().nonnegative();

type RpcClient = {
  rpc: (
    name: string,
    params?: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

async function apiAdmin() {
  const viewer = await getViewer();
  if (!viewer)
    return {
      viewer: null,
      response: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    };
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

function fallbackDraft(input: z.infer<typeof draftSchema>) {
  const cta = input.cta || "Open your MasseurMatch dashboard";
  const title =
    input.objective.length > 72 ? "A MasseurMatch update for your profile" : input.objective;
  const offerHtml = input.offer ? `<p><strong>${escapeHtml(input.offer)}</strong></p>` : "";
  const objective = escapeHtml(input.objective);
  const ctaHtml = escapeHtml(cta);
  return {
    campaignName: title.slice(0, 120),
    subject: title.slice(0, 180),
    previewText: "A useful update from MasseurMatch.",
    bodyHtml: `<p>Hi {{name}},</p><p>${objective}</p>${offerHtml}<p><a href="https://dashboard.masseurmatch.com/">${ctaHtml}</a></p><p>Best,<br />MasseurMatch</p>`,
    bodyText: `Hi {{name}},\n\n${input.objective}${input.offer ? `\n\n${input.offer}` : ""}\n\n${cta}: https://dashboard.masseurmatch.com/\n\nBest,\nMasseurMatch`,
    suggestedAudience: input.audience,
    suggestedSchedule: "Review the draft, then schedule it for recipient local daytime.",
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function extractJson(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.startsWith("```")) return trimmed;
  return trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

async function generateDraft(input: z.infer<typeof draftSchema>) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return fallbackDraft(input);

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.45,
        max_tokens: 1800,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You write professional MasseurMatch provider emails. MasseurMatch is a directory, not a booking or service-payment marketplace. Do not imply license verification unless explicitly supplied, guarantees, sexual services, invented metrics, invented deadlines, or invented discounts. Return strict JSON with keys campaignName, subject, previewText, bodyHtml, bodyText, suggestedAudience, suggestedSchedule. HTML must be email-safe. Use {{name}} and {{city}} only when useful. Default CTA origin is https://dashboard.masseurmatch.com/.",
          },
          {
            role: "user",
            content: `Objective: ${input.objective}\nAudience: ${input.audience}\nTone: ${input.tone}\nCategory: ${input.category}\nCTA: ${input.cta || "Provider dashboard when appropriate"}\nOffer: ${input.offer || "None supplied"}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) return fallbackDraft(input);
    const parsed = deepSeekResponseSchema.parse(await response.json());
    const content = parsed.choices[0]?.message.content;
    if (!content) return fallbackDraft(input);
    return generatedDraftSchema.parse(JSON.parse(extractJson(content)) as unknown);
  } catch (error) {
    console.error("[admin-email] draft generation failed", error);
    return fallbackDraft(input);
  }
}

export async function GET(request: Request) {
  const auth = await apiAdmin();
  if (auth.response) return auth.response;
  const limitResponse = limited(request, "admin-email-read", 90);
  if (limitResponse) return limitResponse;

  const query = new URL(request.url).searchParams.get("q")?.trim() || null;
  const rpc = createServiceClient() as unknown as RpcClient;
  const { data, error } = await rpc.rpc("admin_email_center_snapshot", {
    p_query: query,
    p_limit: 500,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, ...(data as Record<string, unknown>) });
}

export async function POST(request: Request) {
  const auth = await apiAdmin();
  if (auth.response || !auth.viewer) return auth.response;
  const limitResponse = limited(request, "admin-email-write", 30);
  if (limitResponse) return limitResponse;

  let input: z.infer<typeof postSchema>;
  try {
    input = postSchema.parse(await request.json());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request." },
      { status: 400 },
    );
  }

  if (input.action === "ai_generate") {
    const aiLimit = limited(request, "admin-email-ai", 12);
    if (aiLimit) return aiLimit;
    const draft = await generateDraft(input);
    await recordAdminAudit({
      adminId: auth.viewer.user.id,
      action: "admin_email_ai_draft_generated",
      targetType: "email_draft",
      reason: "Admin generated a provider email draft.",
      details: { category: input.category, audience: input.audience, tone: input.tone },
    });
    return NextResponse.json({ ok: true, draft });
  }

  const rpc = createServiceClient() as unknown as RpcClient;

  if (input.action === "save_template") {
    const { data, error } = await rpc.rpc("admin_email_save_template", {
      p_admin_user_id: auth.viewer.user.id,
      p_id: input.id || null,
      p_name: input.name,
      p_description: input.description || null,
      p_subject: input.subject,
      p_body_html: input.bodyHtml,
      p_body_text: input.bodyText || null,
      p_send_category: input.sendCategory,
      p_from_address: input.fromAddress || null,
      p_reply_to: input.replyTo || null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const templateId = z.string().uuid().parse(data);
    await recordAdminAudit({
      adminId: auth.viewer.user.id,
      action: "admin_email_template_saved",
      targetType: "email_template",
      targetId: templateId,
      reason: "Admin saved an Email Center template.",
      details: { name: input.name, send_category: input.sendCategory },
    });
    return NextResponse.json({ ok: true, templateId });
  }

  if (input.action === "cancel_campaign") {
    const { data, error } = await rpc.rpc("admin_email_cancel_campaign", {
      p_admin_user_id: auth.viewer.user.id,
      p_campaign_id: input.campaignId,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const cancelled = countSchema.parse(data);
    await recordAdminAudit({
      adminId: auth.viewer.user.id,
      action: "admin_email_campaign_cancelled",
      targetType: "email_campaign",
      targetId: input.campaignId,
      reason: "Admin cancelled an Email Center campaign.",
      details: { cancelled_queued_messages: cancelled },
    });
    return NextResponse.json({ ok: true, cancelled });
  }

  const audienceCount =
    input.userIds.length +
    input.profileStatuses.length +
    input.plans.length +
    input.cities.length +
    input.states.length;
  if (audienceCount === 0) {
    return NextResponse.json(
      { error: "Choose recipients or at least one audience filter." },
      { status: 400 },
    );
  }
  if (input.sendCategory === "transactional" && input.userIds.length === 0) {
    return NextResponse.json(
      { error: "Transactional campaigns require explicitly selected recipients." },
      { status: 400 },
    );
  }

  const scheduledFor = input.scheduledFor || new Date().toISOString();
  const { data, error } = await rpc.rpc("admin_email_create_campaign", {
    p_admin_user_id: auth.viewer.user.id,
    p_name: input.name,
    p_subject: input.subject,
    p_body_html: input.bodyHtml,
    p_body_text: input.bodyText || null,
    p_send_category: input.sendCategory,
    p_from_address: input.fromAddress || null,
    p_reply_to: input.replyTo || null,
    p_scheduled_for: scheduledFor,
    p_template_id: input.templateId || null,
    p_user_ids: input.userIds,
    p_profile_statuses: input.profileStatuses,
    p_plans: input.plans,
    p_cities: input.cities,
    p_states: input.states,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const result = campaignResultSchema.parse(data);
  await recordAdminAudit({
    adminId: auth.viewer.user.id,
    action: "admin_email_campaign_created",
    targetType: "email_campaign",
    targetId: result.campaignId,
    reason: "Admin created an Email Center campaign.",
    details: {
      name: input.name,
      send_category: input.sendCategory,
      scheduled_for: scheduledFor,
      total: result.total,
      queued: result.queued,
      suppressed: result.suppressed,
    },
  });
  return NextResponse.json({ ok: true, campaign: result });
}
