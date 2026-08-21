import { redirect } from "next/navigation";
import { createSessionClient } from "@masseurmatch/db/auth";
import { Navbar } from "@/components/dashboard/navbar";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

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
