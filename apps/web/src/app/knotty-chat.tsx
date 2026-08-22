"use client";

import { citySlug } from "@masseurmatch/db/actions/directory-config";
import { useState } from "react";

type Match = {
  slug: string;
  city: string | null;
  state: string | null;
  headline: string | null;
  reasons: string[];
};

type ProfileContext = {
  id: string;
  name: string;
};

const PROFILE_PROMPTS = ["Rates", "Availability", "Services", "Location"] as const;

export function KnottyChat({
  profile,
  floating = false,
}: {
  profile?: ProfileContext;
  floating?: boolean;
} = {}) {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(!floating);

  async function askMessage(text: string) {
    const question = text.trim();
    if (!question || busy) return;

    setBusy(true);
    setReply(null);
    try {
      const response = await fetch("/api/concierge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: question, profileId: profile?.id }),
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

  function ask(event: React.FormEvent) {
    event.preventDefault();
    void askMessage(message);
  }

  const panel = (
    <section
      className={
        floating
          ? "w-full overflow-hidden rounded-3xl border border-border bg-bg-surface shadow-ds-lg"
          : "rounded-2xl border border-border bg-bg-surface p-6"
      }
      aria-label={profile ? `Ask Knotty about ${profile.name}` : "Ask Knotty"}
    >
      <div className={floating ? "border-b border-border p-5" : ""}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-secondary">
              Knotty · MasseurMatch AI
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold text-text-primary">
              {profile ? `Ask about ${profile.name}` : "Not sure who to book?"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              {profile
                ? "Ask about this provider’s listed rates, services, availability, location or profile details."
                : "Describe what you want — the city and the kind of massage."}
            </p>
          </div>
          {floating ? (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary"
              aria-label="Close Knotty"
            >
              Close
            </button>
          ) : null}
        </div>
      </div>

      <div className={floating ? "p-5" : "mt-4"}>
        {profile ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {PROFILE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={busy}
                onClick={() => {
                  setMessage(prompt);
                  void askMessage(prompt);
                }}
                className="rounded-full border border-border bg-bg-subtle px-3 py-2 text-xs font-semibold text-text-primary transition hover:border-brand-secondary/40 hover:bg-brand-soft disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}

        <form onSubmit={ask} className="flex gap-2">
          <label className="sr-only" htmlFor={profile ? `knotty-message-${profile.id}` : "knotty-message"}>
            What would you like to know?
          </label>
          <input
            id={profile ? `knotty-message-${profile.id}` : "knotty-message"}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={2000}
            placeholder={profile ? `Ask something about ${profile.name}` : "Deep tissue in Denver"}
            className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-bg-surface px-3 text-sm text-text-primary outline-none focus:border-brand-secondary/40 focus:ring-2 focus:ring-ring/25"
          />
          <button
            type="submit"
            disabled={busy || !message.trim()}
            className="inline-flex h-11 items-center rounded-xl bg-brand-primary px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {busy ? "Thinking…" : "Ask"}
          </button>
        </form>

        <div aria-live="polite" className="mt-4 space-y-3">
          {reply ? (
            <div className="rounded-2xl bg-brand-soft p-4 text-sm leading-6 text-text-primary">
              {reply}
            </div>
          ) : null}

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
                    className="font-semibold text-text-primary underline underline-offset-4 hover:opacity-80"
                  >
                    {match.headline ?? match.slug}
                  </a>{" "}
                  <span className="text-text-muted">{match.reasons.join(" · ")}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );

  if (!floating) return panel;

  return (
    <>
      {open ? (
        <div className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm sm:bottom-6 sm:right-6">
          {panel}
        </div>
      ) : null}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-secondary px-5 py-3 text-sm font-bold text-white shadow-ds-lg transition hover:-translate-y-0.5 hover:opacity-95 sm:bottom-6 sm:right-6"
          aria-expanded={open}
          aria-label={profile ? `Ask Knotty about ${profile.name}` : "Ask Knotty"}
        >
          <span aria-hidden="true" className="text-lg">
            ✦
          </span>
          Ask Knotty
        </button>
      ) : null}
    </>
  );
}
