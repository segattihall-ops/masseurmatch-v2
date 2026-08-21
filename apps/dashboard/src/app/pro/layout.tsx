import { ProSidebar } from "@/components/pro/sidebar";
import { requireTherapist } from "@/lib/guards";

/**
 * The Pro shell: a fixed sidebar and a scrolling column of content.
 *
 * The guard lives here rather than in middleware. A matcher is a denylist by
 * shape — forget to list a route and it silently becomes public — whereas a
 * layout guard means any page added under `/pro` is protected the moment it
 * exists.
 */
export default async function ProLayout({ children }: { children: React.ReactNode }) {
  await requireTherapist("/pro");

  return (
    <div className="flex min-h-screen bg-muted/40">
      <ProSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
