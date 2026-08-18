import {
  conciergeReply,
  matchListings,
  screenMessage,
  understand,
  type ConciergeListing,
} from "@masseurmatch/db/concierge";
import { getVisibleTherapists } from "@masseurmatch/db/actions/directory";
import { NextResponse, type NextRequest } from "next/server";

/**
 * POST /api/concierge — Knotty answers one question.
 *
 * Stateless on purpose: the request carries the message, the response carries
 * the answer, and nothing is stored. A chat log on a marketplace like this one
 * is a record of what strangers asked about which therapists, and keeping it
 * would need a reason better than "we might want it later".
 *
 * Reads the directory through the same cached helper the public pages use, so
 * this adds no database load per message and cannot show anyone the directory
 * would not.
 */

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
  for (let i = 0; i < ip.length; i += 1) hash = (hash * 31 + ip.charCodeAt(i)) | 0;
  return String(hash);
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

  const message = String((body as { message?: unknown })?.message ?? "").slice(0, 2000);

  // Screening runs before anything touches the directory. A blocked message
  // must not produce therapist names, not even ones it would have matched.
  const screening = screenMessage(message);
  if (screening.blocked) {
    return NextResponse.json({ reply: screening.reply, matches: [] });
  }

  let therapists: Awaited<ReturnType<typeof getVisibleTherapists>>;
  try {
    therapists = await getVisibleTherapists();
  } catch {
    return NextResponse.json({
      reply: "I cannot reach the directory right now. Try the city pages in the meantime.",
      matches: [],
    });
  }

  const cities = [...new Set(therapists.map((t) => t.city).filter((c): c is string => Boolean(c)))];
  const want = understand(message, cities);
  const matches = matchListings(therapists as unknown as ConciergeListing[], want);

  return NextResponse.json({
    reply: conciergeReply(want, matches),
    matches: matches.map((m) => ({
      slug: m.listing.slug,
      city: m.listing.city,
      state: m.listing.state,
      headline: m.listing.headline,
      // The reasons travel with the match so the UI can show why, rather than
      // presenting a ranked list the visitor has to take on faith.
      reasons: m.reasons,
    })),
  });
}
