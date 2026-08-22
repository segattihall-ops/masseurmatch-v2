/**
 * The public site's navigation, as data.
 *
 * Kept out of the components so the header, the mobile drawer and the bottom
 * bar are all reading one list — and so a test can walk it and check that every
 * destination has a page behind it. A menu item pointing at a route nobody
 * built is the failure this file exists to make catchable.
 */

export type NavLink = { href: string; label: string };

export type NavItem = {
  /** Where the group itself goes when someone clicks the heading. */
  href: string;
  label: string;
  /** The submenu. A group always has one — items without children are links. */
  links: NavLink[];
};

/**
 * Four groups, because the site has about fifty pages and a flat bar can carry
 * four or five before it stops being scannable.
 *
 * Each group's own `href` is a real page rather than a dead heading: on a
 * pointer device the label is clickable, and on a phone the drawer shows the
 * group as a link with its children under it. A heading that does nothing when
 * tapped is the most common way a menu feels broken.
 */
export const PRIMARY_NAV: NavItem[] = [
  {
    href: "/search",
    label: "Find a therapist",
    links: [
      { href: "/search", label: "Search" },
      { href: "/therapists", label: "Male massage therapists" },
      { href: "/near-me", label: "Male massage near me" },
      { href: "/gay-massage", label: "Gay-friendly massage" },
      { href: "/cities", label: "Browse by city" },
      { href: "/states", label: "Browse by state" },
      { href: "/services", label: "By service" },
    ],
  },
  {
    href: "/guides",
    label: "Guides",
    links: [
      { href: "/guides", label: "Guides" },
      { href: "/blog", label: "Blog" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/compare", label: "Compare directories" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    href: "/trust",
    label: "Trust & safety",
    links: [
      { href: "/trust", label: "Trust & safety" },
      { href: "/safety", label: "Safety" },
      { href: "/verification", label: "Verification" },
      { href: "/how-ranking-works", label: "How ranking works" },
      { href: "/report-block-safety", label: "Report a problem" },
    ],
  },
  {
    href: "/for-therapists",
    label: "For therapists",
    links: [
      { href: "/for-therapists", label: "List your practice" },
      { href: "/pricing", label: "Pricing" },
      { href: "/advertise", label: "Advertise" },
      { href: "/help", label: "Help" },
    ],
  },
];

/**
 * The mobile bottom bar.
 *
 * Five, which is the most a 320px screen holds at a 44px touch target. These
 * are the destinations somebody reaches for repeatedly, not the most
 * important pages in the abstract — a policy page belongs in the menu, not
 * under a thumb.
 *
 * "List" rather than "For therapists": the header has used that shorthand on
 * small screens since this site launched, and two words for one destination is
 * how people end up thinking they are two.
 */
export const BOTTOM_NAV: (NavLink & { icon: BottomIcon })[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/search", label: "Search", icon: "search" },
  { href: "/cities", label: "Cities", icon: "map" },
  { href: "/guides", label: "Guides", icon: "book" },
  { href: "/for-therapists", label: "List", icon: "plus" },
];

export type BottomIcon = "home" | "search" | "map" | "book" | "plus";

/** Every destination the navigation names, deduplicated. Used by the test. */
export function allNavHrefs(): string[] {
  const hrefs = new Set<string>();
  for (const item of PRIMARY_NAV) {
    hrefs.add(item.href);
    for (const link of item.links) hrefs.add(link.href);
  }
  for (const item of BOTTOM_NAV) hrefs.add(item.href);
  return [...hrefs];
}
