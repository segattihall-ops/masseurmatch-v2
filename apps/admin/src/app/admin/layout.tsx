import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { Navbar } from "@/components/dashboard/navbar";
import { requireAdmin } from "@/lib/guards";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin("/");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar title="Admin Operations" homeLink="/" />
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <AdminSidebar />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
