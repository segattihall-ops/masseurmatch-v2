"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

/**
 * Cloudflare Turnstile widget.
 *
 * Renders nothing at all when no site key is configured — the component is not
 * conditionally *styled* away, it returns null, so no script is loaded and no
 * request goes to Cloudflare. That keeps an unconfigured deployment free of a
 * third-party dependency it is not using, and keeps the CSP honest.
 *
 * The widget writes its token into a hidden `cf-turnstile-response` input,
 * which the server action reads and verifies. The token is meaningless until
 * Cloudflare confirms it server-side; a rendered widget proves nothing on its
 * own.
 *
 * ---------------------------------------------------------------------------
 * Why this component is not just `render()`
 * ---------------------------------------------------------------------------
 * A Turnstile token is **single-use**. Cloudflare's siteverify answers
 * `timeout-or-duplicate` the second time it sees one, and the sign-in action
 * reads that as `failed`. So the naive widget has a specific and guaranteed
 * failure: mistype your password once, correct it, submit again — the form
 * still carries the spent token, verification fails, and the answer is "we
 * could not verify that you are human" no matter how right the password now is.
 * Nothing recovers from that except reloading the page, which nobody thinks to
 * do because the message does not suggest it.
 *
 * A native `submit` listener on the enclosing form is what closes it: the moment
 * a submission leaves, the token it carried is spent, so the widget is asked for
 * another. Resetting on the way out rather than on the way back also means the
 * replacement is already in hand by the time the person reads the error.
 *
 * The reset is deferred by a tick. A listener on the form element runs before
 * React's own delegated handler at the root, and clearing the hidden input
 * before React has read the `FormData` would send no token at all — which is
 * the bug this is meant to fix, arriving one step earlier.
 *
 * `useFormStatus` would read better and does not work here: in the React 18.3
 * this repository pins, it re-renders the submit button that calls it but was
 * observed never to re-render this component, so a pending -> idle transition
 * simply never arrived and the reset never ran.
 *
 * Two more states the widget has and the page has to be able to show:
 *
 *   - **The script never arrives.** A blocker, an offline moment, a CSP that
 *     does not name `challenges.cloudflare.com`. Polling for `window.turnstile`
 *     with no deadline means polling forever behind an empty gap in the form,
 *     and the person only finds out when the server rejects them. Both signals
 *     for this — the deadline and `onError` — are gated on nothing having
 *     rendered yet, because a late script error above a working widget would
 *     otherwise tell someone their check is broken while they look at it.
 *   - **The widget refuses.** `error-callback` fires for, among other things,
 *     a hostname missing from the widget's allow-list in the Cloudflare
 *     dashboard — which is the single most likely mistake when turning this on
 *     for a new domain, and is invisible from the server side.
 *
 * Both are surfaced rather than swallowed. The check still fails closed: a
 * missing token is refused by `verifyTurnstile`, and saying so here only means
 * the person is told why instead of being left guessing.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: (code?: string) => void;
          "expired-callback"?: () => void;
          theme?: string;
        },
      ) => string;
      remove: (id: string) => void;
      reset: (id?: string) => void;
    };
  }
}

/**
 * How long to wait for `api.js` before saying so.
 *
 * Generous, because the honest failure here is a slow connection rather than a
 * blocked script, and telling someone their captcha is broken while it is still
 * loading is its own bug.
 */
const READY_TIMEOUT_MS = 15_000;

const POLL_MS = 100;

const MESSAGES = {
  unavailable:
    "The human-verification check could not load. Disable any content blocker for this page, or try a different browser.",
  errored:
    "The human-verification check refused to run on this page. Please try again, and contact support if it keeps happening.",
} as const;

export function Turnstile({ siteKey }: { siteKey: string | null }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [problem, setProblem] = useState<keyof typeof MESSAGES | null>(null);

  useEffect(() => {
    if (!siteKey) return;

    let cancelled = false;
    const startedAt = Date.now();

    const timer = window.setInterval(() => {
      if (cancelled || widgetId.current) return;

      if (container.current && window.turnstile) {
        window.clearInterval(timer);
        try {
          widgetId.current = window.turnstile.render(container.current, {
            sitekey: siteKey,
            "error-callback": () => setProblem("errored"),
            // A token expires after a few minutes. Someone who opens sign-in,
            // goes to find their password manager and comes back would
            // otherwise submit a stale one.
            "expired-callback": () => {
              if (widgetId.current) window.turnstile?.reset(widgetId.current);
            },
          });
          setProblem(null);
        } catch {
          setProblem("errored");
        }
        return;
      }

      // Applies to a missing script and a missing container alike — either way
      // the widget is not going to appear and the page should stop pretending.
      if (Date.now() - startedAt >= READY_TIMEOUT_MS) {
        window.clearInterval(timer);
        setProblem("unavailable");
      }
    }, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [siteKey]);

  // A submitted token is spent. Replace it, or the next attempt is refused for
  // a reason that has nothing to do with what the person typed.
  useEffect(() => {
    const form = container.current?.closest("form");
    if (!form) return;

    const onSubmit = () => {
      window.setTimeout(() => {
        if (widgetId.current) window.turnstile?.reset(widgetId.current);
      }, 0);
    };

    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [siteKey]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onError={() => {
          if (!widgetId.current) setProblem("unavailable");
        }}
      />
      <div ref={container} />
      {problem ? (
        <p role="alert" className="text-sm text-wine">
          {MESSAGES[problem]}
        </p>
      ) : null}
    </>
  );
}
