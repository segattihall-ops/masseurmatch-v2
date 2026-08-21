import {
  BarChart3,
  Bell,
  Camera,
  CreditCard,
  Gift,
  Image as ImageIcon,
  LayoutDashboard,
  LifeBuoy,
  type LucideIcon,
  Mail,
  Radar,
  Receipt,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
} from "lucide-react";

import type { BadgeVariant } from "./badge";

/**
 * The Pro sidebar, as data.
 *
 * Kept out of the component so the dashboard's quick actions and the route
 * inventory can be checked against the same list — a nav item pointing at a
 * route nobody built is the failure mode this file exists to make obvious.
 */
export type ProNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: { label: string; variant: BadgeVariant };
};

export const PRO_NAV: ProNavItem[] = [
  { href: "/pro", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pro/import-reviews", label: "Import Reviews", icon: Star },
  {
    href: "/pro/ai-coach",
    label: "AI Profile Coach",
    icon: Sparkles,
    badge: { label: "Free", variant: "free" },
  },
  {
    href: "/pro/demand-radar",
    label: "Demand Radar",
    icon: Radar,
    badge: { label: "New", variant: "new" },
  },
  {
    href: "/pro/trust",
    label: "Trust & Verification",
    icon: ShieldCheck,
    badge: { label: "Preview", variant: "preview" },
  },
  { href: "/pro/rates", label: "Rates", icon: Tag },
  { href: "/pro/photos", label: "Photos", icon: ImageIcon },
  { href: "/pro/growth", label: "Growth Tools", icon: TrendingUp },
  {
    href: "/pro/referrals",
    label: "Referral Rewards",
    icon: Gift,
    badge: { label: "Earn", variant: "earn" },
  },
  { href: "/pro/inquiries", label: "Inquiries", icon: Mail },
  { href: "/pro/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/pro/notifications", label: "Notifications", icon: Bell },
  { href: "/pro/subscription", label: "Subscription", icon: CreditCard },
  { href: "/pro/payment-history", label: "Payment History", icon: Receipt },
  { href: "/pro/tickets", label: "Support", icon: LifeBuoy },
  { href: "/pro/settings", label: "Settings", icon: Settings },
];

/** The bar at the foot of the dashboard — the six places people go back to. */
export const QUICK_ACTIONS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/pro/listing", label: "Profile & pricing", icon: Settings },
  { href: "/pro/travel", label: "Travel & specials", icon: TrendingUp },
  { href: "/pro/photos", label: "Photos", icon: Camera },
  { href: "/pro/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/pro/ai-coach", label: "AI Coach", icon: Sparkles },
  { href: "/pro/subscription", label: "Subscription", icon: CreditCard },
];
