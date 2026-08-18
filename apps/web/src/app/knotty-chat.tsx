"use client";

import { citySlug } from "@masseurmatch/db/actions/directory-config";
import { useState } from "react";

/**
 * Knotty — the concierge, as a small panel.
 *
 * Deliberately not a floating bubble that opens itself. A chat widget that
 * interrupts someone reading a profile is an advert; this sits where a visitor
 * who wants help can find it, and stays quiet otherwise.
 *
 * There is no conversation history and none is sent. Each question is answered
 * on its own, which is honest about what this is: a search box that takes a
 * sentence. When the conversational layer is added it can hold context; until
 * then, pretending to remember would be the lie.
 */

type Match = {
  slug: string;
  city: string | null;
  state: string | null;
  headline: string | null;
  reasons: string[];
};

export function KnottyChat() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [busy, setBusy] = useState(false);

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    const text = message.trim();
    if (!text || busy) return;

    setBusy(true);
    try {
      const response = await fetch("/api/concierge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = (await response.json()) as { reply?: string; matches?: Match[] };
      setReply(data.reply ?? "Something went wrong.");
      setMatches(data.matches ?? []);
    } catch {
      setReply("I could not reach the directory. Try again in a moment.");
      setMatches([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border p-6">
      <h2 className="font-display text-lg font-semibold text-text-primary">
        Not sure who to book?
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        Describe what you want — the city and the kind of massage.
      </p>

      <form onSubmit={ask} className="mt-4 flex gap-2">
        <label className="sr-only" htmlFor="knotty-message">
          What are you looking for?
        </label>
        <input
          id="knotty-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          placeholder="Deep tissue in Denver, someone who can come to my hotel"
          className="h-11 flex-1 rounded-md border border-border bg-transparent px-3 text-sm text-text-primary"
        />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-11 items-center rounded-md bg-brand-primary px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
        >
          {busy ? "Looking…" : "Ask"}
        </button>
      </form>

      {/* aria-live so the answer is announced rather than only painted. */}
      <div aria-live="polite" className="mt-4 space-y-3">
        {reply ? <p className="text-sm text-text-primary">{reply}</p> : null}

        {matches.length > 0 ? (
          <ul className="space-y-2">
            {matches.map((match) => (
              <li key={match.slug} className="text-sm">
                <a
                  href={
                    match.state && match.city
                      ? `/${match.state.toLowerCase()}/${citySlug(match.city)}/${match.slug}`
                      : `/therapists/${match.slug}`
                  }
                  className="text-text-primary underline underline-offset-4 hover:opacity-80"
                >
                  {match.headline ?? match.slug}
                </a>{" "}
                {/* Why this person, in their own line. A ranked list with no
                    reasons is indistinguishable from paid placement. */}
                <span className="text-text-muted">{match.reasons.join(" · ")}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
