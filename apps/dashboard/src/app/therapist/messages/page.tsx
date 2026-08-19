import { createSessionClient } from "@masseurmatch/db/auth";
import { Clock, Mail, MessageCircle } from "lucide-react";

import { getOrCreateMyProfile } from "@/lib/profile";

import { InquiryCard } from "./inquiry-card";

type Inquiry = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  message: string | null;
  status: string | null;
  created_at: string;
};

export default async function MessagesPage() {
  const supabase = createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Resolve the profile row first: contact_inquiries is keyed by profile_id =
  // profiles.id, which is not guaranteed to equal the auth user id for rows
  // the previous site created. RLS scopes reads to the owner's rows regardless.
  const { profile } = await getOrCreateMyProfile(user.id);

  const { data, error } = await supabase
    .from("contact_inquiries")
    .select("id, client_name, client_email, client_phone, message, status, created_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const inquiries = (error ? [] : ((data ?? []) as Inquiry[])).filter(Boolean);
  const unread = inquiries.filter((i) => (i.status ?? "new") === "new").length;

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">Messages & Inquiries</h1>
        <p className="text-text-secondary">Client inquiries from your public profile</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">New</h3>
            <Mail className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-text-primary">{unread}</p>
        </div>

        <div className="space-y-2 rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">Total</h3>
            <MessageCircle className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-text-primary">{inquiries.length}</p>
        </div>

        <div className="space-y-2 rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">Responded</h3>
            <Clock className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-text-primary">
            {inquiries.filter((i) => i.status === "responded").length}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Recent inquiries</h2>

        {inquiries.length > 0 ? (
          <div className="space-y-2">
            {inquiries.map((inquiry) => (
              <InquiryCard key={inquiry.id} inquiry={inquiry} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface p-8 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-text-secondary opacity-50" />
            <p className="mt-2 text-text-secondary">No messages yet</p>
            <p className="text-sm text-text-secondary">
              When clients inquire about your services, their messages will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
