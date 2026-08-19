"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Shield, FileCheck, TrendingUp, LogOut } from "lucide-react";
import { signOut } from "@/app/sign-in/actions";

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/moderation", label: "Moderation", icon: Shield },
  { href: "/admin/verifications", label: "Verifications", icon: FileCheck },
  { href: "/admin/demand-radar", label: "Demand Radar", icon: TrendingUp },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-surface p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">MM Admin</h1>
        <p className="text-sm text-text-secondary">Dashboard</p>
      </div>

      <nav className="mb-8 space-y-2">
        {ADMIN_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-brand-primary text-white"
                  : "text-text-secondary hover:bg-surface-hover"
              }`}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => signOut()}
        className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-hover"
      >
        <LogOut className="h-5 w-5" />
        Sign Out
      </button>
    </aside>
  );
}
