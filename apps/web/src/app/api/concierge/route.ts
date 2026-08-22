import { getProfileBySlug, getVisibleTherapists } from "@masseurmatch/db/actions/directory";
import { getPublicProfileSupplement } from "@masseurmatch/db/actions/public-profile";
import { therapistName } from "@masseurmatch/db/actions/directory-config";
import {
  conciergeReply,
  matchListings,
  screenMessage,
  understand,
  type ConciergeListing,
} from "@masseurmatch/db/concierge";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const seen = new Map<string, { count: number; resetAt: number }>();

function allow(key: string, now: number): boolean {
  const entry = seen.get(key);
  if (!entry || now > entry.resetAt) {
    seen.set(key, { count: 1, resetAt: now + WINDOW_MS });
    if (seen.size > 5_000) for (const [k, v] of seen) if (now > v.resetAt) seen.delete(k);
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_PER_WINDOW;
}

function callerKey(request: NextRequest): string {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
  let hash = 0;
  for (let index = 0; index < ip.length; index += 1) {
    hash = (hash * 31 + ip.charCodeAt(index)) | 0;
  }
  return String(hash);
}

async function deepSeekReply({
  system,
  user,
  fallback,
}: {
  system: string;
  user: string;
  fallback: string;
}): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return fallback;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.35,
        max_tokens: 320,
      }),
    });

    if (!response.ok) {
      console.error("DeepSeek API error:", response.status);
      return fallback;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content?.trim() || fallback;
  } catch (error) {
    console.error("DeepSeek request failed:", error);
    return fallback;
  }
}

function profileFallback(
  question: string,
  profile: Awaited<ReturnType<typeof getProfileBySlug>> & {},
): string {
  const name = therapistName(profile);
  const lower = question.toLowerCase();
  const services = [
    ...(profile.service_categories ?? []),
    ...(profile.massage_techniques ?? []),
    ...(profile.specialties ?? []),
  ].filter(Boolean);

  if (/rate|price|cost|how much|pricing/.test(lower)) {
    const prices = [
      profile.incall_price ? `$${profile.incall_price} incall` : null,
      profile.outcall_price ? `$${profile.outcall_price} outcall` : null,
    ].filter(Boolean);
    return prices.length
      ? `${name} currently lists ${prices.join(" and ")}. Confirm the final rate and session details directly with ${name}.`
      : `${name} does not currently show a complete public rate. Contact ${name} directly to confirm pricing.`;
  }

  if (/available|availability|hours|schedule|today|now/.test(lower)) {
    return profile.available_now
      ? `${name} is currently marked Available Now. Confirm the exact time directly before heading over.`
      : `${name} is not currently marked Available Now. Check the listed schedule and confirm the exact time directly.`;
  }

  if (/where|location|area|neighborhood|city|near/.test(lower)) {
    const location = [profile.neighborhood, profile.city, profile.state].filter(Boolean).join(", ");
    return location
      ? `${name} is listed in ${location}. The public map shows an approximate service area, not a meeting address.`
      : `${name}'s exact meeting location is not published. Confirm location details directly with the provider.`;
  }

  if (/service|massage|technique|special/.test(lower) && services.length > 0) {
    return `${name} lists ${services.slice(0, 8).join(", ")}${services.length > 8 ? ", and more" : ""}. Ask about a specific goal and I can explain what the profile says.`;
  }

  return `${name}'s Knotty can answer questions about the services, listed rates, availability, location, experience and other public details on this profile.`;
}

async function answerForProfile(
  profileId: string,
  message: string,
  therapists: Awaited<ReturnType<typeof getVisibleTherapists>>,
): Promise<string | null> {
  const listing = therapists.find((therapist) => therapist.id === profileId);
  if (!listing) return null;

  const profile = await getProfileBySlug(listing.slug);
  if (!profile) return null;
  const supplement = await getPublicProfileSupplement(profile.id);
  const name = therapistName(profile);
  const fallback = profileFallback(message, profile);
  const publicContext = {
    name,
    headline: profile.headline,
    bio: profile.bio,
    city: profile.city,
    state: profile.state,
    neighborhood: supplement.neighborhood_name ?? profile.neighborhood,
    services: Array.from(
      new Set([
        ...(profile.service_categories ?? []),
        ...(profile.massage_techniques ?? []),
        ...(profile.specialties ?? []),
        ...(supplement.additional_services ?? []),
      ]),
    ),
    offersIncall: profile.offers_incall === true,
    offersOutcall: profile.offers_outcall === true,
    incallPrice: profile.incall_price,
    outcallPrice: profile.outcall_price,
    pricingSessions: supplement.pricing_sessions,
    currentStatus: supplement.current_status,
    availableNow: profile.available_now === true,
    availableNowExpires: profile.available_now_expires,
    studioHours: supplement.studio_hours ?? supplement.business_hours,
    mobileHours: supplement.mobile_hours,
    yearsExperience: profile.years_experience,
    languages: profile.languages,
    training: supplement.training,
    education: supplement.education_entries ?? supplement.education,
    amenities: supplement.studio_amenities,
    travel: supplement.travel_schedule,
    outcallRadiusMiles: supplement.outcall_radius_miles ?? supplement.service_radius_miles,
    verifiedIdentity: profile.is_verified_identity === true,
    verifiedProfile: profile.is_verified_profile === true,
  };

  const system = [
    `You are Knotty, the MasseurMatch profile concierge for ${name}.`,
    "The visitor is on this exact provider profile. Answer about THIS provider first and do not redirect to another provider unless the visitor explicitly asks for alternatives.",
    "Ground every factual statement only in the PUBLIC PROFILE DATA below. Never invent services, rates, availability, credentials, reviews, verification, location or policies.",
    "If a field is missing, say the profile does not specify it and suggest confirming directly with the provider.",
    "MasseurMatch is a directory only: it does not book sessions, process massage payments, verify professional licenses, or guarantee availability.",
    "The map represents an approximate service area and must never be described as an exact meeting address.",
    "Keep replies friendly, concise, professional and nonsexual, usually 1-3 sentences.",
    "Never expose internal database, moderation, account, billing or private-contact information.",
    `PUBLIC PROFILE DATA: ${JSON.stringify(publicContext)}`,
  ].join("\n");

  return deepSeekReply({
    system,
    user: message,
    fallback,
  });
}

async function answerForDirectory(
  message: string,
  therapists: Awaited<ReturnType<typeof getVisibleTherapists>>,
) {
  const cities = [...new Set(therapists.map((therapist) => therapist.city).filter(Boolean))] as string[];
  const want = understand(message, cities);
  const matches = matchListings(therapists as unknown as ConciergeListing[], want);
  const deterministic = conciergeReply(want, matches);
  const mappedMatches = matches.map((match) => ({
    slug: match.listing.slug,
    city: match.listing.city,
    state: match.listing.state,
    headline: match.listing.headline,
    reasons: match.reasons,
  }));
  const matchSummary = mappedMatches.length
    ? mappedMatches
        .map((match) => `${match.headline || match.slug}: ${match.reasons.join(", ")}`)
        .join("; ")
    : "No matching public profiles were found.";

  const reply = await deepSeekReply({
    system:
      "You are Knotty, the MasseurMatch directory concierge. Recommend only therapists included in the supplied directory results. Keep answers brief, friendly, professional and nonsexual. Never invent providers or profile details. MasseurMatch is a discovery directory, not a booking or massage-payment service.",
    user: `Visitor question: ${message}\nDirectory results: ${matchSummary}`,
    fallback: deterministic,
  });

  return { reply, matches: mappedMatches };
}

export async function POST(request: NextRequest) {
  if (!allow(callerKey(request), Date.now())) {
    return NextResponse.json({ reply: "One moment — too many messages at once." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ reply: "I did not catch that." }, { status: 400 });
  }

  const message = String((body as { message?: unknown })?.message ?? "").slice(0, 2000).trim();
  const profileId = String((body as { profileId?: unknown })?.profileId ?? "").trim();
  if (!message) return NextResponse.json({ reply: "Ask me something about the profile." });

  const screening = screenMessage(message);
  if (screening.blocked) {
    return NextResponse.json({ reply: screening.reply, matches: [] });
  }

  let therapists: Awaited<ReturnType<typeof getVisibleTherapists>>;
  try {
    therapists = await getVisibleTherapists();
  } catch {
    return NextResponse.json({
      reply: "I cannot reach the directory right now. Try again in a moment.",
      matches: [],
    });
  }

  if (profileId) {
    const reply = await answerForProfile(profileId, message, therapists);
    if (reply) return NextResponse.json({ reply, matches: [] });
    return NextResponse.json(
      { reply: "That public profile is not available right now.", matches: [] },
      { status: 404 },
    );
  }

  return NextResponse.json(await answerForDirectory(message, therapists));
}
