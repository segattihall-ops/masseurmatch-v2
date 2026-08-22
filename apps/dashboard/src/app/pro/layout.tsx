import { ProMobileNav } from "@/components/pro/mobile-nav";
import { ProSidebar } from "@/components/pro/sidebar";
import { requireTherapist } from "@/lib/guards";

/**
 * The Pro shell: navigation, and a scrolling column of content.
 *
 * Two navs, one at a time — a fixed sidebar from `lg` up, a sticky bar and
 * drawer below it. Rendering both and hiding one with CSS keeps the choice a
 * media query rather than a guess about the device, so a narrow desktop window
 * gets the drawer too.
 *
 * `min-w-0` on the content column is what actually lets it be narrow. A flex
 * child defaults to `min-width: auto`, so a wide grid or an unbroken URL inside
 * it pushes the column past the viewport instead of shrinking — which is how a
 * page with every responsive class in the right place still scrolls sideways
 * on a phone.
 *
 * The guard lives here rather than in middleware. A matcher is a denylist by
 * shape — forget to list a route and it silently becomes public — whereas a
 * layout guard means any page added under `/pro` is protected the moment it
 * exists.
 */
export default async function ProLayout({ children }: { children: React.ReactNode }) {
  await requireTherapist("/pro/dashboard");

  return (
    <div className="flex min-h-screen bg-muted/40">
      <ProSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <ProMobileNav />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
