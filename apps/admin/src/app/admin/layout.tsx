import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { Navbar } from "@/components/dashboard/navbar";
import { requireAdmin } from "@/lib/guards";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin("/");

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden bg-background">
      <Navbar title="Admin Operations" homeLink="/" />
      <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
        <AdminSidebar />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
