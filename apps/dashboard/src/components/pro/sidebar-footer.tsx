"use client";

import { LogOut, Sparkles } from "lucide-react";
import Link from "next/link";

import { signOut } from "@/app/sign-in/actions";

/**
 * The block pinned under the nav: where to get help, and the way out.
 *
 * Shared with the mobile drawer for the same reason as `ProNavList` — sign-out
 * is the one control a therapist must be able to find on any device, and the
 * drawer is the only chrome a phone has.
 */
export function ProSidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="border-t border-border p-3">
      <div className="rounded-lg border border-border p-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium text-foreground">Need guidance?</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Ask the AI Profile Coach or contact our team.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/pro/ai-coach"
            onClick={onNavigate}
            className="inline-flex min-h-9 items-center rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
          >
            Open coach
          </Link>
          <a
            href="mailto:support@masseurmatch.com"
            className="inline-flex min-h-9 items-center rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
          >
            Support
          </a>
        </div>
      </div>

      <button
        type="button"
        onClick={() => signOut()}
        className="mt-3 flex min-h-11 w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Sign out
      </button>
    </div>
  );
}
