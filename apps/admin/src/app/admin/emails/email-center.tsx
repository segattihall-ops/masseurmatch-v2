"use client";

import {
  AlertTriangle,
  Bot,
  CalendarClock,
  CheckCircle2,
  History,
  Loader2,
  Mail,
  RefreshCw,
  Save,
  Search,
  Send,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Recipient = {
  userId: string;
  profileId: string;
  name: string;
  email: string;
  city: string | null;
  state: string | null;
  profileStatus: string | null;
  plan: string | null;
  marketingOptIn: boolean;
  suppressed: boolean;
};

type Template = {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  bodyHtml: string;
  bodyText: string | null;
  sendCategory: "marketing" | "transactional";
  fromAddress: string | null;
  replyTo: string | null;
};

type Campaign = {
  id: string;
  name: string;
  subject: string;
  sendCategory: string;
  scheduledFor: string;
  status: string;
  createdAt: string;
  total: number;
  queued: number;
  processing: number;
  sent: number;
  suppressed: number;
  failed: number;
};

type Snapshot = {
  recipients: Recipient[];
  templates: Template[];
  campaigns: Campaign[];
  summary: {
    sent30d: number;
    failed30d: number;
    suppressed30d: number;
    complaints30d: number;
  };
};

type Draft = {
  campaignName: string;
  subject: string;
  previewText: string;
  bodyHtml: string;
  bodyText: string;
  suggestedAudience: string;
  suggestedSchedule: string;
};

type Notice = { ok: boolean; text: string };

const DEFAULT_HTML = `<p>Hi {{name}},</p>
<p>We have an update for your MasseurMatch profile.</p>
<p><a href="https://dashboard.masseurmatch.com/">Open your dashboard</a></p>
<p>Best,<br />MasseurMatch</p>`;

const EMPTY: Snapshot = {
  recipients: [],
  templates: [],
  campaigns: [],
  summary: { sent30d: 0, failed30d: 0, suppressed30d: 0, complaints30d: 0 },
};

async function api<T>(body?: Record<string, unknown>, query = ""): Promise<T> {
  const response = await fetch(`/api/admin/emails${query}`, {
    method: body ? "POST" : "GET",
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = (await response.json()) as { error?: string } & T;
  if (!response.ok) throw new Error(payload.error || "Email Center request failed.");
  return payload;
}

function values<T>(input: Array<T | null | undefined>): T[] {
  return [...new Set(input.filter((value): value is T => value !== null && value !== undefined))];
}

export function EmailCenter() {
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [tab, setTab] = useState<"compose" | "campaigns">("compose");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState(DEFAULT_HTML);
  const [bodyText, setBodyText] = useState("");
  const [sendCategory, setSendCategory] = useState<"marketing" | "transactional">("marketing");
  const [fromAddress, setFromAddress] = useState("MasseurMatch <updates@updates.masseurmatch.com>");
  const [replyTo, setReplyTo] = useState("support@masseurmatch.com");
  const [scheduledFor, setScheduledFor] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [profileStatus, setProfileStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [preview, setPreview] = useState(false);

  const [objective, setObjective] = useState("");
  const [audience, setAudience] = useState("MasseurMatch providers");
  const [tone, setTone] = useState<
    "professional" | "warm" | "concise" | "educational" | "promotional"
  >("professional");
  const [cta, setCta] = useState("");
  const [offer, setOffer] = useState("");
  const [draftMeta, setDraftMeta] = useState<Pick<
    Draft,
    "previewText" | "suggestedAudience" | "suggestedSchedule"
  > | null>(null);

  const load = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const data = await api<{ ok: true } & Snapshot>(
        undefined,
        search ? `?q=${encodeURIComponent(search)}` : "",
      );
      setSnapshot({
        recipients: data.recipients ?? [],
        templates: data.templates ?? [],
        campaigns: data.campaigns ?? [],
        summary: data.summary ?? EMPTY.summary,
      });
    } catch (error) {
      setNotice({
        ok: false,
        text: error instanceof Error ? error.message : "Could not load Email Center.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleRecipients = useMemo(
    () =>
      snapshot.recipients.filter((recipient) => {
        if (profileStatus && recipient.profileStatus !== profileStatus) return false;
        if (plan && recipient.plan !== plan) return false;
        if (city && recipient.city !== city) return false;
        if (state && recipient.state !== state) return false;
        return true;
      }),
    [snapshot.recipients, profileStatus, plan, city, state],
  );

  const profileStatuses = useMemo(
    () => values(snapshot.recipients.map((row) => row.profileStatus)).sort(),
    [snapshot.recipients],
  );
  const plans = useMemo(
    () => values(snapshot.recipients.map((row) => row.plan)).sort(),
    [snapshot.recipients],
  );
  const cities = useMemo(
    () => values(snapshot.recipients.map((row) => row.city)).sort(),
    [snapshot.recipients],
  );
  const states = useMemo(
    () => values(snapshot.recipients.map((row) => row.state)).sort(),
    [snapshot.recipients],
  );

  function applyTemplate(id: string) {
    setTemplateId(id);
    const template = snapshot.templates.find((row) => row.id === id);
    if (!template) return;
    setCampaignName(template.name);
    setSubject(template.subject);
    setBodyHtml(template.bodyHtml);
    setBodyText(template.bodyText ?? "");
    setSendCategory(template.sendCategory);
    setFromAddress(template.fromAddress ?? "");
    setReplyTo(template.replyTo ?? "");
  }

  function toggleRecipient(userId: string) {
    setSelected((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  }

  function selectVisible() {
    setSelected((current) => [
      ...new Set([...current, ...visibleRecipients.map((row) => row.userId)]),
    ]);
  }

  async function generateDraft() {
    if (objective.trim().length < 3) return;
    setBusy(true);
    setNotice(null);
    try {
      const result = await api<{ ok: true; draft: Draft }>({
        action: "ai_generate",
        objective,
        audience,
        tone,
        cta: cta || null,
        offer: offer || null,
        category: sendCategory,
      });
      setCampaignName(result.draft.campaignName);
      setSubject(result.draft.subject);
      setBodyHtml(result.draft.bodyHtml);
      setBodyText(result.draft.bodyText);
      setDraftMeta({
        previewText: result.draft.previewText,
        suggestedAudience: result.draft.suggestedAudience,
        suggestedSchedule: result.draft.suggestedSchedule,
      });
      setNotice({ ok: true, text: "Draft generated. Review every field before sending." });
    } catch (error) {
      setNotice({
        ok: false,
        text: error instanceof Error ? error.message : "Could not generate draft.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function saveTemplate() {
    if (!campaignName.trim() || !subject.trim() || !bodyHtml.trim()) {
      setNotice({ ok: false, text: "Template name, subject and HTML body are required." });
      return;
    }
    setBusy(true);
    try {
      const result = await api<{ ok: true; templateId: string }>({
        action: "save_template",
        id: templateId || null,
        name: campaignName,
        description: draftMeta?.previewText || null,
        subject,
        bodyHtml,
        bodyText: bodyText || null,
        sendCategory,
        fromAddress: fromAddress || null,
        replyTo: replyTo || null,
      });
      setTemplateId(result.templateId);
      setNotice({ ok: true, text: "Template saved." });
      await load(query);
    } catch (error) {
      setNotice({
        ok: false,
        text: error instanceof Error ? error.message : "Could not save template.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function createCampaign() {
    if (!campaignName.trim() || !subject.trim() || !bodyHtml.trim()) {
      setNotice({ ok: false, text: "Campaign name, subject and HTML body are required." });
      return;
    }
    const filters = [profileStatus, plan, city, state].filter(Boolean);
    if (selected.length === 0 && filters.length === 0) {
      setNotice({ ok: false, text: "Select recipients or at least one audience filter." });
      return;
    }
    if (sendCategory === "transactional" && selected.length === 0) {
      setNotice({ ok: false, text: "Transactional campaigns require explicit recipients." });
      return;
    }

    setBusy(true);
    setNotice(null);
    try {
      const result = await api<{
        ok: true;
        campaign: { campaignId: string; total: number; queued: number; suppressed: number };
      }>({
        action: "create_campaign",
        name: campaignName,
        subject,
        bodyHtml,
        bodyText: bodyText || null,
        sendCategory,
        fromAddress: fromAddress || null,
        replyTo: replyTo || null,
        scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
        templateId: templateId || null,
        userIds: selected,
        profileStatuses: profileStatus ? [profileStatus] : [],
        plans: plan ? [plan] : [],
        cities: city ? [city] : [],
        states: state ? [state] : [],
      });
      setNotice({
        ok: true,
        text: `Campaign created: ${result.campaign.queued} queued, ${result.campaign.suppressed} suppressed, ${result.campaign.total} matched.`,
      });
      setSelected([]);
      setTab("campaigns");
      await load(query);
    } catch (error) {
      setNotice({
        ok: false,
        text: error instanceof Error ? error.message : "Could not create campaign.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function cancelCampaign(campaignId: string) {
    setBusy(true);
    try {
      const result = await api<{ ok: true; cancelled: number }>({
        action: "cancel_campaign",
        campaignId,
      });
      setNotice({
        ok: true,
        text: `Campaign cancelled. ${result.cancelled} queued messages skipped.`,
      });
      await load(query);
    } catch (error) {
      setNotice({
        ok: false,
        text: error instanceof Error ? error.message : "Could not cancel campaign.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      {notice ? (
        <div
          role={notice.ok ? "status" : "alert"}
          className={`rounded-xl border px-4 py-3 text-sm ${
            notice.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Sent · 30d" value={snapshot.summary.sent30d} icon={CheckCircle2} />
        <Metric label="Failed · 30d" value={snapshot.summary.failed30d} icon={XCircle} />
        <Metric
          label="Suppressed · 30d"
          value={snapshot.summary.suppressed30d}
          icon={AlertTriangle}
        />
        <Metric label="Complaints · 30d" value={snapshot.summary.complaints30d} icon={Mail} />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl bg-ink/5 p-1">
          <button
            type="button"
            onClick={() => setTab("compose")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === "compose" ? "bg-white text-ink shadow-sm" : "text-ink/55"}`}
          >
            Compose
          </button>
          <button
            type="button"
            onClick={() => setTab("campaigns")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === "campaigns" ? "bg-white text-ink shadow-sm" : "text-ink/55"}`}
          >
            Campaigns ({snapshot.campaigns.length})
          </button>
        </div>
        <button
          type="button"
          onClick={() => void load(query)}
          disabled={loading || busy}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-ink/15 px-4 text-sm font-medium text-ink disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {tab === "campaigns" ? (
        <Campaigns rows={snapshot.campaigns} busy={busy} onCancel={cancelCampaign} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-wine" />
                <h2 className="font-semibold text-ink">Draft assistant</h2>
              </div>
              <p className="mt-1 text-xs text-ink/50">
                Uses DeepSeek when configured; otherwise produces a conservative template draft.
                Always review before sending.
              </p>
              <Field label="Objective">
                <textarea
                  value={objective}
                  onChange={(event) => setObjective(event.target.value)}
                  rows={4}
                  maxLength={1200}
                  placeholder="Example: remind providers to complete ID verification"
                  className="input min-h-28"
                />
              </Field>
              <Field label="Audience description">
                <input
                  value={audience}
                  onChange={(event) => setAudience(event.target.value)}
                  className="input"
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Tone">
                  <select
                    value={tone}
                    onChange={(event) => setTone(event.target.value as typeof tone)}
                    className="input"
                  >
                    <option value="professional">Professional</option>
                    <option value="warm">Warm</option>
                    <option value="concise">Concise</option>
                    <option value="educational">Educational</option>
                    <option value="promotional">Promotional</option>
                  </select>
                </Field>
                <Field label="CTA request">
                  <input
                    value={cta}
                    onChange={(event) => setCta(event.target.value)}
                    className="input"
                    placeholder="Optional"
                  />
                </Field>
              </div>
              <Field label="Offer / announcement details">
                <input
                  value={offer}
                  onChange={(event) => setOffer(event.target.value)}
                  className="input"
                  placeholder="Optional — never invented by the assistant"
                />
              </Field>
              <button
                type="button"
                onClick={() => void generateDraft()}
                disabled={busy || objective.trim().length < 3}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-wine px-4 text-sm font-medium text-white disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                Generate draft
              </button>
              {draftMeta ? (
                <div className="mt-4 rounded-xl bg-ink/[0.035] p-3 text-xs text-ink/60">
                  <p>
                    <strong>Preview:</strong> {draftMeta.previewText}
                  </p>
                  <p className="mt-1">
                    <strong>Audience:</strong> {draftMeta.suggestedAudience}
                  </p>
                  <p className="mt-1">
                    <strong>Schedule:</strong> {draftMeta.suggestedSchedule}
                  </p>
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-ink">Recipients</h2>
                  <p className="text-xs text-ink/50">{selected.length} explicitly selected</p>
                </div>
                <button
                  type="button"
                  onClick={selectVisible}
                  className="text-xs font-semibold text-wine hover:underline"
                >
                  Select visible
                </button>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-ink/35" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void load(query);
                    }}
                    className="input pl-9"
                    placeholder="Search name, email or city"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void load(query)}
                  className="rounded-lg border border-ink/15 px-3 text-sm font-medium"
                >
                  Search
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Filter
                  value={profileStatus}
                  onChange={setProfileStatus}
                  label="Profile status"
                  values={profileStatuses}
                />
                <Filter value={plan} onChange={setPlan} label="Plan" values={plans} />
                <Filter value={city} onChange={setCity} label="City" values={cities} />
                <Filter value={state} onChange={setState} label="State" values={states} />
              </div>
              <div className="mt-4 max-h-80 overflow-auto rounded-xl border border-ink/10">
                {loading ? (
                  <p className="p-5 text-sm text-ink/50">Loading recipients…</p>
                ) : visibleRecipients.length === 0 ? (
                  <p className="p-5 text-sm text-ink/50">No matching recipients.</p>
                ) : (
                  <ul className="divide-y divide-ink/10">
                    {visibleRecipients.map((recipient) => (
                      <li key={recipient.userId} className="flex gap-3 p-3 text-sm">
                        <input
                          type="checkbox"
                          checked={selected.includes(recipient.userId)}
                          onChange={() => toggleRecipient(recipient.userId)}
                          disabled={
                            recipient.suppressed ||
                            (sendCategory === "marketing" && !recipient.marketingOptIn)
                          }
                          aria-label={`Select ${recipient.name}`}
                          className="mt-1 h-4 w-4"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-ink">{recipient.name}</p>
                          <p className="truncate text-xs text-ink/50">{recipient.email}</p>
                          <p className="mt-1 text-[11px] text-ink/45">
                            {[
                              recipient.city,
                              recipient.state,
                              recipient.plan,
                              recipient.profileStatus,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          {recipient.suppressed ? (
                            <p className="mt-1 text-[11px] font-medium text-red-700">Suppressed</p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-ink">Campaign composer</h2>
                <p className="mt-1 text-xs text-ink/50">
                  Queue delivery through the existing lifecycle email worker.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreview((value) => !value)}
                className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-medium text-ink"
              >
                {preview ? "Edit" : "Preview"}
              </button>
            </div>

            {preview ? (
              <div className="mt-5">
                <p className="text-xs font-medium text-ink/50">Subject</p>
                <p className="mt-1 font-semibold text-ink">{subject || "No subject"}</p>
                <iframe
                  title="Email HTML preview"
                  sandbox=""
                  srcDoc={bodyHtml}
                  className="mt-4 h-[520px] w-full rounded-xl border border-ink/10 bg-white"
                />
              </div>
            ) : (
              <div className="mt-5">
                <Field label="Saved template">
                  <select
                    value={templateId}
                    onChange={(event) => applyTemplate(event.target.value)}
                    className="input"
                  >
                    <option value="">New / custom draft</option>
                    {snapshot.templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Campaign name">
                    <input
                      value={campaignName}
                      onChange={(event) => setCampaignName(event.target.value)}
                      maxLength={120}
                      className="input"
                    />
                  </Field>
                  <Field label="Category">
                    <select
                      value={sendCategory}
                      onChange={(event) =>
                        setSendCategory(event.target.value as typeof sendCategory)
                      }
                      className="input"
                    >
                      <option value="marketing">Marketing</option>
                      <option value="transactional">Transactional</option>
                    </select>
                  </Field>
                </div>
                <Field label="Subject">
                  <input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    maxLength={180}
                    className="input"
                  />
                </Field>
                <Field label="HTML body">
                  <textarea
                    value={bodyHtml}
                    onChange={(event) => setBodyHtml(event.target.value)}
                    rows={15}
                    className="input font-mono text-xs"
                  />
                </Field>
                <Field label="Plain-text body">
                  <textarea
                    value={bodyText}
                    onChange={(event) => setBodyText(event.target.value)}
                    rows={8}
                    className="input font-mono text-xs"
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="From">
                    <input
                      value={fromAddress}
                      onChange={(event) => setFromAddress(event.target.value)}
                      className="input"
                    />
                  </Field>
                  <Field label="Reply-to">
                    <input
                      type="email"
                      value={replyTo}
                      onChange={(event) => setReplyTo(event.target.value)}
                      className="input"
                    />
                  </Field>
                </div>
                <Field label="Schedule (local time)">
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(event) => setScheduledFor(event.target.value)}
                    className="input"
                  />
                </Field>
                <p className="mt-2 text-xs text-ink/45">
                  Leave schedule blank to queue now. Marketing suppressions and preferences are
                  enforced by the database worker.
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3 border-t border-ink/10 pt-5">
              <button
                type="button"
                onClick={() => void saveTemplate()}
                disabled={busy}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-ink/15 px-4 text-sm font-medium text-ink disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> Save template
              </button>
              <button
                type="button"
                onClick={() => void createCampaign()}
                disabled={busy}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-wine px-4 text-sm font-medium text-white disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : scheduledFor ? (
                  <CalendarClock className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {scheduledFor ? "Schedule campaign" : "Queue campaign"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Mail }) {
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

function Campaigns({
  rows,
  busy,
  onCancel,
}: {
  rows: Campaign[];
  busy: boolean;
  onCancel: (id: string) => Promise<void>;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
      <div className="border-b border-ink/10 p-5">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-wine" />
          <h2 className="font-semibold text-ink">Campaign history</h2>
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="p-8 text-center text-sm text-ink/50">No campaigns yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Scheduled</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Sent</th>
                <th className="px-4 py-3">Queued</th>
                <th className="px-4 py-3">Suppressed</th>
                <th className="px-4 py-3">Failed</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{row.name}</p>
                    <p className="mt-0.5 max-w-72 truncate text-xs text-ink/50">{row.subject}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Status status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-ink/60">
                    {new Date(row.scheduledFor).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{row.total}</td>
                  <td className="px-4 py-3 tabular-nums">{row.sent}</td>
                  <td className="px-4 py-3 tabular-nums">{row.queued + row.processing}</td>
                  <td className="px-4 py-3 tabular-nums">{row.suppressed}</td>
                  <td className="px-4 py-3 tabular-nums">{row.failed}</td>
                  <td className="px-4 py-3">
                    {new Set(["scheduled", "processing"]).has(row.status) ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void onCancel(row.id)}
                        className="text-xs font-semibold text-red-700 hover:underline disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="text-xs text-ink/35">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Status({ status }: { status: string }) {
  const value = status.toLowerCase();
  const className =
    value === "sent" || value === "completed"
      ? "bg-emerald-50 text-emerald-700"
      : value === "failed" || value === "cancelled"
        ? "bg-red-50 text-red-700"
        : value === "scheduled" || value === "processing"
          ? "bg-blue-50 text-blue-700"
          : "bg-ink/5 text-ink/60";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${className}`}>
      {status}
    </span>
  );
}

function Filter({
  value,
  onChange,
  label,
  values: options,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  values: string[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="input text-xs"
      aria-label={label}
    >
      <option value="">All {label.toLowerCase()}s</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block">
      <span className="text-xs font-medium text-ink/60">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
