import { createSessionClient } from "@masseurmatch/db/auth";

import { PageHeader } from "@/components/pro/page-header";
import { EmptyState, Section } from "@/components/pro/section";
import { requireTherapist } from "@/lib/guards";

export const metadata = { title: "Notifications | MasseurMatch" };
export const dynamic = "force-dynamic";

type Notification = {
  id: string;
  title: string | null;
  body: string | null;
  message: string | null;
  type: string | null;
  is_read: boolean | null;
  created_at: string;
};

/**
 * Account notifications.
 *
 * `body` and `message` both exist on the table — different writers filled
 * different columns over the years — so both are read and the first one with
 * anything in it wins. Dropping either would blank out half the history.
 */
export default async function ProNotificationsPage() {
  const viewer = await requireTherapist("/pro/notifications");

  const { data, error } = await createSessionClient()
    .from("notifications")
    .select("id,title,body,message,type,is_read,created_at")
    .eq("user_id", viewer.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const notifications = error ? [] : ((data ?? []) as unknown as Notification[]);
  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Notifications"
        subtitle={`${unread} unread of the last ${notifications.length}.`}
      />

      <Section title="Recent">
        {notifications.length === 0 ? (
          <EmptyState>
            {error
              ? "Notifications are not available on this account yet."
              : "Nothing yet. Approval decisions and account changes land here."}
          </EmptyState>
        ) : (
          <ul className="space-y-2">
            {notifications.map((item) => (
              <li
                key={item.id}
                className={`rounded-lg border p-4 ${
                  item.is_read ? "border-border" : "border-foreground/20 bg-muted/50"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium text-foreground">
                    {item.title ?? item.type ?? "Update"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                {(item.body ?? item.message) ? (
                  <p className="mt-1 text-sm text-muted-foreground">{item.body ?? item.message}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
