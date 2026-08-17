"use client";

import { useEffect } from "react";

/**
 * Records one profile view, once per session per profile.
 *
 * A client component because the profile page is ISR-cached: the server
 * component renders once per revalidation window, not once per visitor, so
 * counting there would report the number of cache misses.
 *
 * Being client-side also filters most crawlers for free — they do not run this
 * — which matters more than it sounds when the number is shown to a therapist
 * as "people looked at you".
 *
 * The session id lives in `sessionStorage`, so it is per tab-session and
 * disappears when the tab closes. No cookie, nothing persistent, and nothing
 * that follows a visitor between sites.
 */
export function ViewBeacon({ profileId }: { profileId: string }) {
  useEffect(() => {
    // `once` is per profile: a visitor comparing three therapists in one
    // session should count once for each, not once in total.
    const key = `mm-viewed:${profileId}`;
    let sessionId: string | null = null;

    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");

      sessionId = window.sessionStorage.getItem("mm-session");
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        window.sessionStorage.setItem("mm-session", sessionId);
      }
    } catch {
      // Private browsing can throw on sessionStorage. Recording the view
      // without de-duplication is better than not recording it.
    }

    const referrer = document.referrer || null;
    const source = referrer
      ? new URL(referrer).host === window.location.host
        ? "internal"
        : "referral"
      : "direct";

    void fetch("/api/views", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profileId, sessionId, source, referrer }),
      // The visitor is here to read a profile; this must never delay or fail
      // that, and must survive them navigating away immediately.
      keepalive: true,
    }).catch(() => {});
  }, [profileId]);

  return null;
}
