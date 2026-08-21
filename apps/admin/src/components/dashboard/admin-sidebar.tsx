"use client";

import {
  Activity,
  BarChart3,
  Camera,
  FileCheck,
  Flag,
  LifeBuoy,
  LogOut,
  ScrollText,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <aside className="border-b border-border bg-surface p-3 lg:w-64 lg:flex-none lg:border-b-0 lg:border-r lg:p-6">
      <div className="hidden lg:mb-6 lg:block">
        <h1 className="text-xl font-bold text-text-primary">MM Admin</h1>
        <p className="text-sm text-text-secondary">Operations</p>
      </div>

      <nav
        aria-label="Admin"
        className="flex gap-1 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0"
      >
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
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition lg:w-full lg:gap-3 lg:px-4 ${
                isActive
                  ? "bg-brand-primary text-white"
                  : "text-text-secondary hover:bg-surface-hover"
              }`}
            >
              <Icon className="h-4 w-4 lg:h-5 lg:w-5" aria-hidden="true" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => signOut()}
        className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-hover lg:mt-8 lg:w-full lg:gap-3 lg:px-4"
      >
        <LogOut className="h-4 w-4 lg:h-5 lg:w-5" aria-hidden="true" />
        Sign Out
      </button>
    </aside>
  );
}
