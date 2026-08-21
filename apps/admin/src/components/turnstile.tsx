"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

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
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: { sitekey: string; callback?: (token: string) => void; theme?: string },
      ) => string;
      remove: (id: string) => void;
    };
  }
}

export function Turnstile({ siteKey }: { siteKey: string | null }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey) return;

    // The script loads asynchronously, so poll briefly for the global rather
    // than assuming it is ready when this effect runs.
    let cancelled = false;
    const timer = window.setInterval(() => {
      if (cancelled || !container.current || widgetId.current) return;
      if (!window.turnstile) return;

      widgetId.current = window.turnstile.render(container.current, { sitekey: siteKey });
      window.clearInterval(timer);
    }, 100);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [siteKey]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />
      <div ref={container} />
    </>
  );
}
