import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createServiceClient } from "@masseurmatch/db/client";

export const runtime = "nodejs";

const OVERALL_RATINGS = ["Excellent", "Good", "Average", "Poor", "Very poor"] as const;
const PROFILE_EXPERIENCES = [
  "Very easy",
  "Easy",
  "Neutral",
  "Difficult",
  "Very difficult",
] as const;
const SEO_ANSWERS = ["Yes, clearly", "Somewhat", "No"] as const;
const CONTINUE_LIKELIHOODS = [
  "Very likely",
  "Likely",
  "Not sure",
  "Unlikely",
  "Very unlikely",
] as const;
const CONTACT_METHODS = ["Text message", "Chat", "Phone call"] as const;

function isOneOf<T extends readonly string[]>(value: unknown, allowed: T): value is T[number] {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function requestIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function ipHash(request: Request): string {
  const salt = process.env.TRIAL_FEEDBACK_HASH_SALT || process.env.SESSION_SECRET || "masseurmatch";
  return createHash("sha256")
    .update(`${requestIp(request)}:${salt}`)
    .digest("hex");
}

async function sendAdminEmail(input: {
  id: string;
  firstName: string;
  email: string;
  overallRating: string;
  profileExperience: string;
  mostUseful: string;
  problemsOrMissing: string;
  seoUnderstanding: string;
  continueLikelihood: string;
  improvementRequest: string;
  contactRequested: boolean;
  preferredContactMethod: string;
  phone: string;
  bestContactTime: string;
  additionalComments: string;
}): Promise<string | null> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !to || !from) return null;

  const rows: Array<[string, string]> = [
    ["First name", input.firstName],
    ["Email", input.email],
    ["Overall rating", input.overallRating],
    ["Profile experience", input.profileExperience],
    ["Most useful", input.mostUseful],
    ["Problems or missing", input.problemsOrMissing],
    ["SEO/city understanding", input.seoUnderstanding],
    ["Likelihood to continue", input.continueLikelihood],
    ["Requested improvements", input.improvementRequest],
    ["Private follow-up requested", input.contactRequested ? "Yes" : "No"],
    ["Preferred contact method", input.preferredContactMethod],
    ["Phone", input.phone],
    ["Best contact time", input.bestContactTime],
    ["Additional comments", input.additionalComments],
    ["Response ID", input.id],
  ];

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:10px;border-bottom:1px solid #e5e7eb;font-weight:700;vertical-align:top;width:220px">${escapeHtml(label)}</td><td style="padding:10px;border-bottom:1px solid #e5e7eb;white-space:pre-wrap">${escapeHtml(value || "Not provided")}</td></tr>`,
    )
    .join("");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `trial-feedback/${input.id}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `${input.contactRequested ? "FOLLOW-UP REQUESTED — " : ""}Confidential trial feedback — ${input.firstName}`,
      html: `<div style="font-family:Arial,Helvetica,sans-serif;color:#111827;max-width:760px;margin:auto"><h1>Confidential MasseurMatch Trial Feedback</h1><p><strong>Private internal response.</strong></p>${input.contactRequested ? '<p style="background:#fff7ed;padding:12px;border-left:4px solid #8B1E2D"><strong>Follow-up requested.</strong> Review the contact details below.</p>' : ""}<table style="width:100%;border-collapse:collapse">${htmlRows}</table></div>`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend returned ${response.status}`);
  }

  const result = (await response.json()) as { id?: string };
  return result.id ?? null;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) {
        return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots receive a neutral success response without touching the DB.
  if (text(body.website, 200)) return NextResponse.json({ success: true });

  const startedAt = Number(body.started_at ?? 0);
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < 1000) {
    return NextResponse.json({ error: "Please try again." }, { status: 400 });
  }

  const firstName = text(body.first_name, 80);
  const email = text(body.email, 254).toLowerCase();
  const mostUseful = text(body.most_useful, 3000);
  const problemsOrMissing = text(body.problems_or_missing, 3000);
  const improvementRequest = text(body.improvement_request, 3000);
  const additionalComments = text(body.additional_comments, 3000);
  const phone = text(body.phone, 40);
  const bestContactTime = text(body.best_contact_time, 160);
  const contactRequested = body.contact_requested === true;

  if (
    !firstName ||
    !validEmail(email) ||
    !mostUseful ||
    !isOneOf(body.overall_rating, OVERALL_RATINGS) ||
    !isOneOf(body.profile_experience, PROFILE_EXPERIENCES) ||
    !isOneOf(body.seo_understanding, SEO_ANSWERS) ||
    !isOneOf(body.continue_likelihood, CONTINUE_LIKELIHOODS) ||
    body.confidentiality_acknowledged !== true
  ) {
    return NextResponse.json(
      { error: "Please review the required fields and try again." },
      { status: 400 },
    );
  }

  const preferredContactMethod = isOneOf(body.preferred_contact_method, CONTACT_METHODS)
    ? body.preferred_contact_method
    : "";

  if (contactRequested && (!preferredContactMethod || !phone || !bestContactTime)) {
    return NextResponse.json(
      { error: "Provide a contact method, phone number and best contact time." },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();
  const hashedIp = ipHash(request);
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { count, error: rateError } = await supabase
    .from("trial_feedback_responses")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", hashedIp)
    .gte("created_at", fifteenMinutesAgo);

  if (!rateError && (count ?? 0) >= 5) {
    return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }

  const { data: saved, error: saveError } = await supabase
    .from("trial_feedback_responses")
    .insert({
      first_name: firstName,
      email,
      overall_rating: body.overall_rating,
      profile_experience: body.profile_experience,
      most_useful: mostUseful,
      problems_or_missing: problemsOrMissing || null,
      seo_understanding: body.seo_understanding,
      continue_likelihood: body.continue_likelihood,
      improvement_request: improvementRequest || null,
      contact_requested: contactRequested,
      preferred_contact_method: contactRequested ? preferredContactMethod : null,
      phone: contactRequested ? phone : null,
      best_contact_time: contactRequested ? bestContactTime : null,
      additional_comments: additionalComments || null,
      confidentiality_acknowledged: true,
      ip_hash: hashedIp,
      user_agent: request.headers.get("user-agent")?.slice(0, 500) || null,
      email_notification_status: "pending",
    })
    .select("id")
    .single();

  if (saveError || !saved) {
    console.error("trial_feedback_save_failed", saveError?.message);
    return NextResponse.json(
      { error: "We could not securely save your feedback. Please try again." },
      { status: 500 },
    );
  }

  try {
    const emailId = await sendAdminEmail({
      id: saved.id,
      firstName,
      email,
      overallRating: body.overall_rating,
      profileExperience: body.profile_experience,
      mostUseful,
      problemsOrMissing,
      seoUnderstanding: body.seo_understanding,
      continueLikelihood: body.continue_likelihood,
      improvementRequest,
      contactRequested,
      preferredContactMethod,
      phone,
      bestContactTime,
      additionalComments,
    });

    await supabase
      .from("trial_feedback_responses")
      .update({
        email_notification_status: emailId ? "sent" : "not_configured",
        email_notification_id: emailId,
        email_notified_at: emailId ? new Date().toISOString() : null,
      })
      .eq("id", saved.id);
  } catch (error) {
    console.error("trial_feedback_email_failed", error);
    await supabase
      .from("trial_feedback_responses")
      .update({ email_notification_status: "failed" })
      .eq("id", saved.id);
  }

  return NextResponse.json({ success: true });
}
