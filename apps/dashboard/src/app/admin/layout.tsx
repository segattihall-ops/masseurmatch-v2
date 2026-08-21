import { Navbar } from "@/components/dashboard/navbar";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { requireAdmin } from "@/lib/guards";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin("/admin");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar title="Admin Dashboard" homeLink="/admin" />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
