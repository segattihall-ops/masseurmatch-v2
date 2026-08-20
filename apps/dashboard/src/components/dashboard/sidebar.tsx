"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarClock, Edit, Image, LogOut, Settings, TrendingUp } from "lucide-react";
import { signOut } from "@/app/sign-in/actions";

const LINKS = [
  { href: "/therapist", label: "Dashboard", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: Edit },
  { href: "/therapist/photos", label: "Photos", icon: Image },
  { href: "/therapist/availability", label: "Availability & Travel", icon: CalendarClock },
  { href: "/therapist/approval", label: "Approval Status", icon: Settings },
  { href: "/therapist/growth", label: "Growth Analytics", icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-surface p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">MM Pro</h1>
        <p className="text-sm text-text-secondary">Therapist Dashboard</p>
      </div>

      <nav className="mb-8 space-y-2">
        {LINKS.map((link) => {
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
