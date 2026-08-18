import { redirect } from "next/navigation";
import { createSessionClient } from "@masseurmatch/db/auth";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function TherapistLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
