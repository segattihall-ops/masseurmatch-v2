import { createSessionClient } from "@masseurmatch/db/auth";
import { MessageCircle, Mail, Clock } from "lucide-react";

export default async function MessagesPage() {
  const supabase = createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // TODO: Fetch real messages from database
  const mockMessages = [
    {
      id: "1",
      senderName: "John Smith",
      subject: "Inquiry about Deep Tissue Massage",
      preview: "I'm looking for a therapist who specializes in deep tissue massage...",
      timestamp: "2 hours ago",
      unread: true,
    },
    {
      id: "2",
      senderName: "Sarah Johnson",
      subject: "Booking request for this weekend",
      preview: "Would you be available for a 60-minute massage this Saturday?",
      timestamp: "5 hours ago",
      unread: false,
    },
    {
      id: "3",
      senderName: "Michael Chen",
      subject: "Question about your services",
      preview: "Do you offer outcall services in my area?",
      timestamp: "1 day ago",
      unread: false,
    },
  ];

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">Messages & Inquiries</h1>
        <p className="text-text-secondary">Manage client inquiries and booking requests</p>
      </div>

      {/* Message Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">Unread Messages</h3>
            <Mail className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-text-primary">1</p>
        </div>

        <div className="space-y-2 rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">Total Messages</h3>
            <MessageCircle className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-text-primary">{mockMessages.length}</p>
        </div>

        <div className="space-y-2 rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">Avg Response Time</h3>
            <Clock className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-text-primary">2h</p>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Recent Inquiries</h2>

        {mockMessages.length > 0 ? (
          <div className="space-y-2">
            {mockMessages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-4 rounded-lg border p-4 transition hover:border-brand-primary ${
                  message.unread
                    ? "border-blue-200 bg-blue-50"
                    : "border-border bg-surface hover:bg-surface-hover"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`font-semibold ${message.unread ? "text-blue-900" : "text-text-primary"}`}>
                        {message.senderName}
                      </p>
                      <p className="text-sm text-text-secondary">{message.subject}</p>
                    </div>
                    {message.unread && (
                      <div className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">{message.preview}</p>
                  <p className="mt-2 text-xs text-text-secondary">{message.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface p-8 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-text-secondary opacity-50" />
            <p className="mt-2 text-text-secondary">No messages yet</p>
            <p className="text-sm text-text-secondary">When clients inquire about your services, their messages will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
