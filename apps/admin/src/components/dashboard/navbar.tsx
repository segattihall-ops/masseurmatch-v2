"use client";

import Link from "next/link";

export function Navbar({ title, homeLink = "/" }: { title: string; homeLink?: string }) {
  return (
    <header className="border-b border-border bg-surface px-4 py-3 sm:px-6">
      <div className="flex min-h-10 items-center justify-between gap-4">
        <Link href={homeLink} className="text-xl font-bold text-brand-primary" aria-label="MasseurMatch Admin home">
          MM Admin
        </Link>
        <p className="truncate text-sm font-medium text-text-secondary sm:text-base">{title}</p>
      </div>
    </header>
  );
}
