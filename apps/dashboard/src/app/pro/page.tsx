import { redirect } from "next/navigation";

/**
 * `/pro` is not a page.
 *
 * The dashboard lives at `/pro/dashboard`, which is what the sidebar, the
 * sign-in redirect and every deep link point at. Redirecting keeps the bare
 * `/pro` a working address without giving it a second copy of the dashboard.
 */
export default function ProIndexPage() {
  redirect("/pro/dashboard");
}
