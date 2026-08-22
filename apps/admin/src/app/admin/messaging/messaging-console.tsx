"use client";

import {
  AlertTriangle,
  Bot,
  CirclePause,
  CirclePlay,
  Clock3,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  ShieldOff,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Contact = {
  id: string;
  phone_e164: string;
  name: string | null;
  city: string | null;
  state: string | null;
  lifecycle_status: string;
  knotty_enabled: boolean;
  opted_out: boolean;
  opted_out_at: string | null;
  opted_out_reason: string | null;
  last_activity_at: string | null;
};

type Conversation = {
  id: string;
  contact_id: string;
  current_channel: string;
  unread_count: number;
  last_message_at: string | null;
  messaging_contacts?: Contact | Contact[] | null;
};

type Message = {
  id: string;
  direction: "inbound" | "outbound";
  sender_type: string;
  body: string;
  channel: string;
  delivery_status: string;
  error_message: string | null;
  created_at: string;
};

type QueueItem = {
  id: string;
  status: string;
  body: string;
  attempts: number;
  max_attempts: number;
  scheduled_for: string;
  last_error: string | null;
  messaging_contacts?: {
    id: string;
    name: string | null;
    phone_e164: string;
    city: string | null;
    state: string | null;
  } | null;
};

type Campaign = {
  id: string;
  name: string;
  status: string;
  transport_preference: string;
  created_at: string;
};

type Snapshot = {
  settings: {
    receiving_number: string;
    transport_mode: string;
    knotty_enabled: boolean;
    global_pause: boolean;
    default_send_interval_seconds: number;
  } | null;
  contacts: Contact[];
  conversations: Conversation[];
  campaigns: Campaign[];
  queue: QueueItem[];
  messages: Message[];
  counts: {
    contacts: number;
    optedOut: number;
    pending: number;
    failed: number;
    openConversations: number;
  };
};

type Tab = "inbox" | "contacts" | "queue" | "campaigns" | "settings";

const EMPTY: Snapshot = {
  settings: null,
  contacts: [],
  conversations: [],
  campaigns: [],
  queue: [],
  messages: [],
  counts: { contacts: 0, optedOut: 0, pending: 0, failed: 0, openConversations: 0 },
};

function conversationContact(conversation: Conversation | null): Contact | null {
  if (!conversation) return null;
  const value = conversation.messaging_contacts;
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function when(value: string | null | undefined): string {
  if (!value) return "No activity";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: "include", ...options });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "Messaging request failed.");
  return payload;
}

export function MessagingConsole() {
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<Tab>("inbox");
  const [query, setQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        setError("");
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (selectedConversationId) params.set("conversationId", selectedConversationId);
        const result = await requestJson<{ ok: true } & Snapshot>(
          `/api/admin/messaging?${params.toString()}`,
        );
        setSnapshot({
          settings: result.settings,
          contacts: result.contacts ?? [],
          conversations: result.conversations ?? [],
          campaigns: result.campaigns ?? [],
          queue: result.queue ?? [],
          messages: result.messages ?? [],
          counts: result.counts ?? EMPTY.counts,
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load messaging.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [query, selectedConversationId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => void load(true), 15_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const selectedConversation = useMemo(
    () => snapshot.conversations.find((item) => item.id === selectedConversationId) ?? null,
    [snapshot.conversations, selectedConversationId],
  );
  const selectedConversationContact = conversationContact(selectedConversation);
  const activeContactId = selectedConversationContact?.id ?? selectedContactId;
  const activeContact =
    snapshot.contacts.find((item) => item.id === activeContactId) ?? selectedConversationContact;

  async function post(body: Record<string, unknown>, success?: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await requestJson("/api/admin/messaging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (success) setNotice(success);
      await load(true);
    } catch (postError) {
      setError(postError instanceof Error ? postError.message : "Messaging action failed.");
    } finally {
      setBusy(false);
    }
  }

  async function sendMessage() {
    if (!activeContact || !draft.trim()) return;
    await post(
      { action: "queue_message", contactId: activeContact.id, body: draft.trim() },
      "Manual message queued for the configured transport.",
    );
    setDraft("");
  }

  if (loading && snapshot === EMPTY) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center gap-2 text-sm text-ink/50">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading messaging operations…
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      ) : null}
      {notice ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
          {notice}
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Metric label="Contacts" value={snapshot.counts.contacts} icon={Users} />
        <Metric label="Open chats" value={snapshot.counts.openConversations} icon={MessageSquare} />
        <Metric label="Queued" value={snapshot.counts.pending} icon={Clock3} />
        <Metric label="Failed" value={snapshot.counts.failed} icon={AlertTriangle} />
        <Metric label="Opted out" value={snapshot.counts.optedOut} icon={ShieldOff} />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2 text-xs text-ink/60">
          <Pill>{snapshot.settings?.receiving_number || "No receiving line"}</Pill>
          <Pill>Transport: {snapshot.settings?.transport_mode || "unknown"}</Pill>
          <Pill>Knotty: {snapshot.settings?.knotty_enabled ? "on" : "off"}</Pill>
          {snapshot.settings?.global_pause ? <Pill danger>Global pause active</Pill> : null}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy || loading}
            onClick={() => void load()}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-ink/15 px-4 text-sm font-medium text-ink disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            type="button"
            disabled={busy || !snapshot.settings}
            onClick={() =>
              void post(
                {
                  action: "update_settings",
                  globalPause: !snapshot.settings?.global_pause,
                },
                snapshot.settings?.global_pause ? "Outbound messaging resumed." : "Outbound messaging paused.",
              )
            }
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium text-white disabled:opacity-50 ${
              snapshot.settings?.global_pause ? "bg-emerald-700" : "bg-red-700"
            }`}
          >
            {snapshot.settings?.global_pause ? <CirclePlay className="h-4 w-4" /> : <CirclePause className="h-4 w-4" />}
            {snapshot.settings?.global_pause ? "Resume all" : "Pause all"}
          </button>
        </div>
      </div>

      <nav aria-label="Messaging sections" className="flex gap-1 overflow-x-auto rounded-xl bg-ink/5 p-1">
        {(["inbox", "contacts", "queue", "campaigns", "settings"] as Tab[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`min-h-10 whitespace-nowrap rounded-lg px-4 text-sm font-medium capitalize ${
              tab === item ? "bg-white text-ink shadow-sm" : "text-ink/55 hover:text-ink"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      {tab === "inbox" ? (
        <Inbox
          snapshot={snapshot}
          activeContact={activeContact ?? null}
          selectedConversationId={selectedConversationId}
          setSelectedConversationId={setSelectedConversationId}
          draft={draft}
          setDraft={setDraft}
          busy={busy}
          post={post}
          sendMessage={sendMessage}
        />
      ) : null}
      {tab === "contacts" ? (
        <Contacts
          contacts={snapshot.contacts}
          query={query}
          setQuery={setQuery}
          load={load}
          setSelectedContactId={(id) => {
            setSelectedContactId(id);
            setSelectedConversationId(null);
            setTab("inbox");
          }}
        />
      ) : null}
      {tab === "queue" ? <Queue rows={snapshot.queue} /> : null}
      {tab === "campaigns" ? <Campaigns rows={snapshot.campaigns} /> : null}
      {tab === "settings" ? (
        <Settings settings={snapshot.settings} busy={busy} post={post} />
      ) : null}
    </div>
  );
}

function Inbox({
  snapshot,
  activeContact,
  selectedConversationId,
  setSelectedConversationId,
  draft,
  setDraft,
  busy,
  post,
  sendMessage,
}: {
  snapshot: Snapshot;
  activeContact: Contact | null;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string) => void;
  draft: string;
  setDraft: (value: string) => void;
  busy: boolean;
  post: (body: Record<string, unknown>, success?: string) => Promise<void>;
  sendMessage: () => Promise<void>;
}) {
  return (
    <div className="grid min-h-[620px] gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
      <section className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
        <div className="border-b border-ink/10 p-4">
          <h2 className="font-semibold text-ink">Conversations</h2>
        </div>
        <div className="max-h-[700px] overflow-y-auto p-2">
          {snapshot.conversations.length === 0 ? (
            <Empty text="No conversations yet." />
          ) : (
            snapshot.conversations.map((conversation) => {
              const contact = conversationContact(conversation);
              const active = conversation.id === selectedConversationId;
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => {
                    setSelectedConversationId(conversation.id);
                    if (conversation.unread_count > 0) {
                      void post({ action: "mark_read", conversationId: conversation.id });
                    }
                  }}
                  className={`mb-1 w-full rounded-xl p-3 text-left transition ${
                    active ? "bg-ink text-white" : "hover:bg-ink/[0.035]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">
                      {contact?.name || contact?.phone_e164 || "Unknown contact"}
                    </span>
                    {conversation.unread_count > 0 ? (
                      <span className="rounded-full bg-wine px-2 py-0.5 text-[11px] font-semibold text-white">
                        {conversation.unread_count}
                      </span>
                    ) : null}
                  </div>
                  <p className={`mt-1 truncate text-xs ${active ? "text-white/65" : "text-ink/50"}`}>
                    {contact?.city || "Unknown city"} · {conversation.current_channel}
                  </p>
                  <p className={`mt-2 text-[11px] ${active ? "text-white/45" : "text-ink/35"}`}>
                    {when(conversation.last_message_at)}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </section>

      <section className="flex min-h-[620px] flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
        <header className="border-b border-ink/10 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-ink">
                {activeContact?.name || activeContact?.phone_e164 || "Select a conversation"}
              </h2>
              {activeContact ? (
                <p className="mt-1 text-xs text-ink/50">
                  {activeContact.phone_e164} · {[activeContact.city, activeContact.state].filter(Boolean).join(", ") || "Unknown location"}
                </p>
              ) : null}
            </div>
            {activeContact ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy || activeContact.opted_out}
                  onClick={() =>
                    void post(
                      {
                        action: "update_contact",
                        contactId: activeContact.id,
                        knottyEnabled: !activeContact.knotty_enabled,
                      },
                      `Knotty ${activeContact.knotty_enabled ? "disabled" : "enabled"} for this contact.`,
                    )
                  }
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-ink/15 px-3 text-xs font-medium disabled:opacity-50"
                >
                  <Bot className="h-4 w-4" /> Knotty {activeContact.knotty_enabled ? "On" : "Off"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void post(
                      {
                        action: "update_contact",
                        contactId: activeContact.id,
                        optedOut: !activeContact.opted_out,
                        optedOutReason: activeContact.opted_out ? null : "admin",
                      },
                      activeContact.opted_out ? "Contact restored." : "Contact opted out.",
                    )
                  }
                  className="min-h-10 rounded-lg border border-ink/15 px-3 text-xs font-medium disabled:opacity-50"
                >
                  {activeContact.opted_out ? "Restore contact" : "Opt out"}
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {!selectedConversationId ? <Empty text="Choose a conversation to view its history." /> : null}
          {snapshot.messages.map((message) => (
            <div key={message.id} className={`flex ${message.direction === "outbound" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[84%] rounded-2xl px-4 py-3 text-sm ${
                  message.direction === "outbound" ? "bg-ink text-white" : "bg-ink/[0.055] text-ink"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.body}</p>
                <p className={`mt-2 text-[10px] ${message.direction === "outbound" ? "text-white/55" : "text-ink/45"}`}>
                  {message.sender_type} · {message.channel} · {message.delivery_status} · {when(message.created_at)}
                </p>
                {message.error_message ? (
                  <p className="mt-1 text-[10px] text-red-300">{message.error_message}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-ink/10 p-4">
          {activeContact?.opted_out ? (
            <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              This contact is opted out. Restore the contact before queuing a message.
            </p>
          ) : null}
          {snapshot.settings?.global_pause ? (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">
              Global sending is paused. New manual messages are blocked server-side.
            </p>
          ) : null}
          <div className="flex gap-2">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={4000}
              rows={3}
              disabled={!activeContact || activeContact.opted_out || busy || snapshot.settings?.global_pause}
              className="input min-h-24 flex-1"
              placeholder="Write a manual outbound message…"
            />
            <button
              type="button"
              disabled={
                !activeContact ||
                activeContact.opted_out ||
                !draft.trim() ||
                busy ||
                snapshot.settings?.global_pause
              }
              onClick={() => void sendMessage()}
              className="self-end rounded-lg bg-wine p-3 text-white disabled:opacity-40"
              aria-label="Queue manual message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Contacts({
  contacts,
  query,
  setQuery,
  load,
  setSelectedContactId,
}: {
  contacts: Contact[];
  query: string;
  setQuery: (value: string) => void;
  load: (silent?: boolean) => Promise<void>;
  setSelectedContactId: (id: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-ink">Contacts</h2>
          <p className="mt-1 text-xs text-ink/50">Lifecycle, opt-out and Knotty eligibility.</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-ink/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void load();
              }}
              className="input pl-9"
              placeholder="Name, phone or city"
            />
          </div>
          <button type="button" onClick={() => void load()} className="rounded-lg border border-ink/15 px-4 text-sm font-medium">
            Search
          </button>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {contacts.length === 0 ? <Empty text="No messaging contacts yet." /> : null}
        {contacts.map((contact) => (
          <div key={contact.id} className="flex flex-col gap-3 rounded-xl border border-ink/10 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium text-ink">{contact.name || "Unnamed contact"}</p>
              <p className="mt-1 text-xs text-ink/50">
                {contact.phone_e164} · {[contact.city, contact.state].filter(Boolean).join(", ") || "Unknown location"}
              </p>
              <p className="mt-1 text-[11px] text-ink/35">Last activity {when(contact.last_activity_at)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill>{contact.lifecycle_status}</Pill>
              {contact.knotty_enabled ? <Pill>Knotty</Pill> : null}
              {contact.opted_out ? <Pill danger>Opted out</Pill> : null}
              <button
                type="button"
                onClick={() => setSelectedContactId(contact.id)}
                className="min-h-10 rounded-lg border border-ink/15 px-3 text-xs font-medium text-wine"
              >
                Open
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Queue({ rows }: { rows: QueueItem[] }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-ink">Outbound queue</h2>
      <p className="mt-1 text-xs text-ink/50">Real queue state consumed by the configured transport bridge.</p>
      <div className="mt-4 space-y-2">
        {rows.length === 0 ? <Empty text="No queued messages." /> : null}
        {rows.map((item) => (
          <div key={item.id} className="rounded-xl border border-ink/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-ink">
                {item.messaging_contacts?.name || item.messaging_contacts?.phone_e164 || "Unknown contact"}
              </p>
              <Pill danger={item.status === "failed"}>{item.status}</Pill>
            </div>
            <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-ink/65">{item.body}</p>
            <p className="mt-2 text-xs text-ink/40">
              Scheduled {when(item.scheduled_for)} · attempts {item.attempts}/{item.max_attempts}
              {item.last_error ? ` · ${item.last_error}` : ""}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Campaigns({ rows }: { rows: Campaign[] }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-ink">Campaigns</h2>
      <div className="mt-4 space-y-2">
        {rows.length === 0 ? <Empty text="No messaging campaigns yet." /> : null}
        {rows.map((campaign) => (
          <div key={campaign.id} className="flex flex-col gap-2 rounded-xl border border-ink/10 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium text-ink">{campaign.name}</p>
              <p className="mt-1 text-xs text-ink/50">
                Created {when(campaign.created_at)} · {campaign.transport_preference}
              </p>
            </div>
            <Pill>{campaign.status}</Pill>
          </div>
        ))}
      </div>
    </section>
  );
}

function Settings({
  settings,
  busy,
  post,
}: {
  settings: Snapshot["settings"];
  busy: boolean;
  post: (body: Record<string, unknown>, success?: string) => Promise<void>;
}) {
  if (!settings) return <Empty text="Messaging settings are not configured." />;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-ink">Global sending</h2>
        <p className="mt-2 text-sm text-ink/55">
          Stops or resumes outbound queue processing without deleting pending work.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            void post(
              { action: "update_settings", globalPause: !settings.global_pause },
              settings.global_pause ? "Outbound messaging resumed." : "Outbound messaging paused.",
            )
          }
          className={`mt-4 min-h-11 rounded-lg px-4 text-sm font-medium text-white ${
            settings.global_pause ? "bg-emerald-700" : "bg-red-700"
          }`}
        >
          {settings.global_pause ? "Resume all sending" : "Pause all sending"}
        </button>
      </section>
      <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-ink">Knotty global switch</h2>
        <p className="mt-2 text-sm text-ink/55">
          Master control for automated reply eligibility. Per-contact opt-outs remain blocking.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            void post(
              { action: "update_settings", knottyEnabled: !settings.knotty_enabled },
              `Knotty ${settings.knotty_enabled ? "disabled" : "enabled"} globally.`,
            )
          }
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-ink/15 px-4 text-sm font-medium text-ink"
        >
          <Bot className="h-4 w-4" /> Knotty {settings.knotty_enabled ? "Enabled" : "Disabled"}
        </button>
        <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-ink/[0.035] p-4 text-xs">
          <div>
            <dt className="text-ink/45">Receiving number</dt>
            <dd className="mt-1 font-medium text-ink">{settings.receiving_number}</dd>
          </div>
          <div>
            <dt className="text-ink/45">Transport</dt>
            <dd className="mt-1 font-medium capitalize text-ink">{settings.transport_mode}</dd>
          </div>
          <div>
            <dt className="text-ink/45">Send interval</dt>
            <dd className="mt-1 font-medium text-ink">{settings.default_send_interval_seconds}s</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-ink/50">{label}</p>
        <Icon className="h-4 w-4 text-wine" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}

function Pill({ children, danger = false }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${danger ? "bg-red-50 text-red-700" : "bg-ink/5 text-ink/60"}`}>
      {children}
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="p-5 text-sm text-ink/50">{text}</p>;
}
