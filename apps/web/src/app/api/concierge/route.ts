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
 *
 * Conversational layer: if DEEPSEEK_API_KEY is set, uses DeepSeek to generate
 * natural responses instead of deterministic text.
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

async function generateConversationalReply(
  message: string,
  deterministic: string,
  matches: {
    headline: string | null;
    city: string | null;
    state: string | null;
    reasons: string[];
  }[],
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return deterministic;

  const matchSummary =
    matches.length > 0
      ? `Found ${matches.length} therapists: ${matches.map((m) => m.headline || m.city).join(", ")}.`
      : "No matching therapists found.";

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful concierge for MasseurMatch, a directory of professional massage therapists. " +
              "Keep responses brief (1-2 sentences) and friendly. Never make up therapist names or details.",
          },
          {
            role: "user",
            content: `A visitor asked: "${message}"\n\nOur directory search found: ${matchSummary}\n\nGenerate a brief, conversational response.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      console.error("DeepSeek API error:", response.status);
      return deterministic;
    }

    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content?.trim() || deterministic;
  } catch (error) {
    console.error("DeepSeek request failed:", error);
    return deterministic;
  }
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
  const deterministic = conciergeReply(want, matches);

  const mappedMatches = matches.map((m) => ({
    slug: m.listing.slug,
    city: m.listing.city,
    state: m.listing.state,
    headline: m.listing.headline,
    reasons: m.reasons,
  }));

  const reply = await generateConversationalReply(message, deterministic, mappedMatches);

  return NextResponse.json({
    reply,
    matches: mappedMatches,
  });
}
