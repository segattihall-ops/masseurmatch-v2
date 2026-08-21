import {
  Banknote,
  BarChart,
  Bell,
  Camera,
  CreditCard,
  Download,
  Gift,
  Image as ImageIcon,
  LayoutDashboard,
  LifeBuoy,
  type LucideIcon,
  Mail,
  Radar,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCircle,
  WalletCards,
} from "lucide-react";

import type { BadgeVariant } from "./badge";

/**
 * The Pro sidebar, as data.
 *
 * Mirrors production's `navItems` — same order, same seventeen destinations,
 * same three badges. "My Profile" is an item pointing at the listing editor,
 * not a heading over the ones below it; and the badges sit on Import Reviews,
 * AI Profile Coach and Demand Radar rather than a row lower.
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
  { href: "/pro/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pro/listing", label: "My Profile", icon: UserCircle },
  {
    href: "/pro/import-reviews",
    label: "Import Reviews",
    icon: Download,
    badge: { label: "Free", variant: "free" },
  },
  {
    href: "/pro/ai-coach",
    label: "AI Profile Coach",
    icon: Sparkles,
    badge: { label: "New", variant: "new" },
  },
  {
    href: "/pro/demand-radar",
    label: "Demand Radar",
    icon: Radar,
    badge: { label: "Preview", variant: "preview" },
  },
  { href: "/pro/trust", label: "Trust & Verification", icon: ShieldCheck },
  { href: "/pro/rates", label: "Rates", icon: Banknote },
  { href: "/pro/photos", label: "Photos", icon: ImageIcon },
  { href: "/pro/growth", label: "Growth Tools", icon: TrendingUp },
  {
    href: "/pro/referrals",
    label: "Referral Rewards",
    icon: Gift,
    badge: { label: "Earn", variant: "earn" },
  },
  { href: "/pro/inquiries", label: "Inquiries", icon: Mail },
  { href: "/pro/analytics", label: "Analytics", icon: BarChart },
  { href: "/pro/notifications", label: "Notifications", icon: Bell },
  { href: "/pro/subscription", label: "Subscription", icon: CreditCard },
  { href: "/pro/payment-history", label: "Payment History", icon: WalletCards },
  { href: "/pro/tickets", label: "Support", icon: LifeBuoy },
  { href: "/pro/settings", label: "Settings", icon: Settings },
];

/** The bar at the foot of the dashboard — the six places people go back to. */
export const QUICK_ACTIONS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/pro/listing", label: "Profile & pricing", icon: Settings },
  { href: "/pro/growth", label: "Travel & specials", icon: TrendingUp },
  { href: "/pro/photos", label: "Photos", icon: Camera },
  { href: "/pro/analytics", label: "Analytics", icon: BarChart },
  { href: "/pro/ai-coach", label: "AI Coach", icon: Sparkles },
  { href: "/pro/subscription", label: "Subscription", icon: CreditCard },
];
