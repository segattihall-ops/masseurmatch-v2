"use client";

import {
  Activity,
  BarChart3,
  Camera,
  FileCheck,
  Flag,
  LifeBuoy,
  LogOut,
  Menu,
  ScrollText,
  Shield,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { signOut } from "@/app/sign-in/actions";

const ADMIN_LINKS = [
  { href: "/", label: "Overview", icon: BarChart3 },
  { href: "/people", label: "People", icon: Users },
  { href: "/moderation", label: "Approvals", icon: Shield },
  { href: "/photos", label: "Photos", icon: Camera },
  { href: "/verifications", label: "Verifications", icon: FileCheck },
  { href: "/profile-reports", label: "Safety Reports", icon: Flag },
  { href: "/reports", label: "Reports", icon: Activity },
  { href: "/tickets", label: "Tickets", icon: LifeBuoy },
  { href: "/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/demand-radar", label: "Demand Radar", icon: TrendingUp },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <aside className="border-b border-border bg-surface lg:w-64 lg:flex-none lg:border-b-0 lg:border-r">
      <div className="flex min-h-14 items-center justify-between gap-3 px-4 lg:hidden">
        <div>
          <p className="text-sm font-semibold text-text-primary">Admin menu</p>
          <p className="text-xs text-text-secondary">Operations & moderation</p>
        </div>
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="admin-navigation"
          aria-label={mobileOpen ? "Close admin menu" : "Open admin menu"}
          onClick={() => setMobileOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border text-text-primary hover:bg-surface-hover"
        >
          {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      <div className="hidden p-6 lg:block">
        <h1 className="text-xl font-bold text-text-primary">MM Admin</h1>
        <p className="text-sm text-text-secondary">Operations</p>
      </div>

      <div
        id="admin-navigation"
        className={`${mobileOpen ? "block" : "hidden"} border-t border-border px-3 pb-3 pt-2 lg:block lg:border-t-0 lg:px-6 lg:pb-6 lg:pt-0`}
      >
        <nav aria-label="Admin" className="grid gap-1 lg:space-y-2">
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/" || pathname === "/admin"
                : pathname === link.href ||
                  pathname.startsWith(link.href + "/") ||
                  pathname === `/admin${link.href}` ||
                  pathname.startsWith(`/admin${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-primary text-white"
                    : "text-text-secondary hover:bg-surface-hover"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => signOut()}
          className="mt-3 flex min-h-11 w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-hover lg:mt-8"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
