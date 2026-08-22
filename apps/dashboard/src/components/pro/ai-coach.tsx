import { scoreSummary } from "@masseurmatch/db/profile-score";
import Link from "next/link";

import type { ProDashboardData } from "@/lib/pro-dashboard";

import { PageHeader } from "./page-header";

const IMPACT_STYLES = [
  "bg-[#FDECEC] text-[#8B1E2D]",
  "bg-[#FFF3E4] text-[#8A5A18]",
  "bg-[#EEF4FF] text-[#365E9D]",
];

function clampScore(value: number) {
  return Math.max(0, Math.min(100, value));
}

function scoreTone(value: number) {
  if (value >= 85) return "Strong";
  if (value >= 70) return "Good";
  if (value >= 50) return "Needs attention";
  return "Priority";
}

export function ProAiCoach({ data }: { data: ProDashboardData }) {
  const { score, advice } = data;
  const firstThree = advice.slice(0, 3);
  const scoreChecks = score.checks;

  return (
    <div className="mx-auto w-full max-w-[1500px] pb-12">
      <PageHeader
        eyebrow="Provider dashboard"
        title="AI Profile Coach"
        subtitle="A live view of your profile health, visibility signals, and the highest-impact actions to improve your listing."
      />

      <div className="mt-6 overflow-hidden rounded-[28px] border border-[#E8DFD8] bg-white shadow-[0_20px_70px_rgba(58,39,28,0.07)]">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="min-w-0 bg-[#FBFAF8]">
            <section className="border-b border-[#E9E2DC] bg-gradient-to-br from-white via-[#FFFDFC] to-[#FFF7F6] px-5 py-6 sm:px-8 sm:py-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E8D4D7] bg-[#FFF8F8] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B1E2D]">
                    Live profile intelligence
                  </div>
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#27221F] sm:text-[40px] sm:leading-[1.05]">
                    Your profile, optimized around what matters most.
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-[#756D67]">
                    The Coach reads your profile score, recent visibility, contact intent, and local demand signals to rank your next best actions.
                  </p>
                </div>

                <div className="flex min-w-[220px] items-center gap-4 rounded-3xl border border-[#E7DDD6] bg-white p-4 shadow-sm">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#8B1E2D] text-2xl font-semibold text-white shadow-[0_10px_28px_rgba(139,30,45,0.2)]">
                    {score.total}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B817A]">Profile score</p>
                    <p className="mt-1 text-lg font-semibold text-[#27221F]">{scoreTone(score.total)}</p>
                    <p className="mt-1 text-xs text-[#817873]">{scoreSummary(score)}</p>
                  </div>
                </div>
              </div>
            </section>

            <nav className="overflow-x-auto border-b border-[#E9E2DC] bg-white px-5 sm:px-8" aria-label="AI Coach sections">
              <div className="flex min-w-max gap-1">
                {[
                  ["Overview", "#overview"],
                  ["Profile Health", "#profile-health"],
                  ["Market Signals", "#market-signals"],
                  ["Action Plan", "#action-plan"],
                ].map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    className="border-b-2 border-transparent px-3 py-3 text-sm font-semibold text-[#766E68] transition hover:border-[#8B1E2D] hover:text-[#8B1E2D]"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </nav>

            <div className="space-y-5 p-5 sm:p-8">
              <section id="overview" className="scroll-mt-24">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard label="Profile views" value={String(data.views.window)} note="Current analytics window" />
                  <MetricCard
                    label="Contact rate"
                    value={data.contacts.rate === null ? "—" : `${data.contacts.rate.toFixed(1)}%`}
                    note={`${data.contacts.window} contact intent${data.contacts.window === 1 ? "" : "s"}`}
                  />
                  <MetricCard
                    label="Local demand"
                    value={data.demand.score === null ? "No reading" : String(data.demand.score)}
                    note={data.demand.direction === "stable" ? "Stable right now" : data.demand.direction}
                  />
                  <MetricCard
                    label="Approved photos"
                    value={String(data.photos.approved)}
                    note={`${data.photos.pending} pending review`}
                  />
                </div>
              </section>

              <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
                <div id="profile-health" className="scroll-mt-24 rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#27221F]">Profile health</h3>
                      <p className="mt-1 text-xs leading-5 text-[#827A74]">Transparent scoring based on the information currently in your listing.</p>
                    </div>
                    <span className="rounded-full bg-[#FFF3E4] px-3 py-1 text-xs font-semibold text-[#8A5A18]">{score.total}/100</span>
                  </div>

                  <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#F0EAE5]" role="img" aria-label={`Profile score: ${score.total} out of 100`}>
                    <div className="h-full rounded-full bg-[#8B1E2D]" style={{ width: `${clampScore(score.total)}%` }} />
                  </div>

                  <div className="mt-5 space-y-3">
                    {scoreChecks.map((check) => {
                      const complete = check.action === null;
                      const pct = check.possible > 0 ? Math.round((check.earned / check.possible) * 100) : 0;
                      return (
                        <div key={check.id} className="rounded-2xl border border-[#EEE7E1] bg-[#FFFCFA] p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#37302C]">{check.label}</p>
                              {!complete && check.href ? (
                                <Link href={check.href} className="mt-1 inline-flex text-xs font-semibold text-[#8B1E2D] hover:underline">
                                  Improve this area
                                </Link>
                              ) : (
                                <p className="mt-1 text-xs text-[#5E7A65]">Complete</p>
                              )}
                            </div>
                            <span className="text-xs font-semibold tabular-nums text-[#817873]">{check.earned}/{check.possible}</span>
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EFE9E4]">
                            <div className="h-full rounded-full bg-[#B8A59A]" style={{ width: `${clampScore(pct)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div id="market-signals" className="scroll-mt-24 rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm sm:p-6">
                  <h3 className="text-lg font-semibold text-[#27221F]">Visibility intelligence</h3>
                  <p className="mt-1 text-xs leading-5 text-[#827A74]">Current signals the Coach uses before recommending a change.</p>

                  <dl className="mt-5 grid grid-cols-2 gap-3">
                    <Signal label="Views" value={String(data.views.window)} />
                    <Signal label="30-day views" value={String(data.views.long)} />
                    <Signal label="Local demand" value={data.demand.score === null ? "—" : String(data.demand.score)} />
                    <Signal label="Contact rate" value={data.contacts.rate === null ? "—" : `${data.contacts.rate.toFixed(1)}%`} />
                    <Signal label="Profile visibility" value={data.toggles.visible ? "Public" : "Hidden"} />
                    <Signal label="Available now" value={data.toggles.availableNow ? "Active" : "Off"} />
                  </dl>

                  <div className="mt-5 rounded-2xl bg-[#F8F4F0] p-4 text-xs leading-5 text-[#6F6761]">
                    These are observed account and directory signals. The Coach does not claim guaranteed ranking, bookings, or revenue.
                  </div>
                </div>
              </section>

              <section id="action-plan" className="scroll-mt-24 rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[#27221F]">Today&apos;s priorities</h3>
                    <p className="mt-1 text-xs leading-5 text-[#827A74]">Ranked by expected impact using your actual profile and performance signals.</p>
                  </div>
                  <span className="text-xs font-medium text-[#8A817B]">{advice.length} suggestion{advice.length === 1 ? "" : "s"}</span>
                </div>

                {advice.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-[#E3DDD7] bg-[#FFFCFA] p-5 text-sm leading-6 text-[#5F5751]">{data.allClear}</div>
                ) : (
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {advice.map((item, index) => (
                      <article key={item.id} className="rounded-2xl border border-[#EEE7E1] bg-[#FFFCFA] p-4 transition hover:border-[#D5C6BC]">
                        <div className="flex items-start gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F9EDEE] text-sm font-bold text-[#8B1E2D]">{index + 1}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <h4 className="text-sm font-semibold text-[#37302C]">{item.title}</h4>
                              <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase ${IMPACT_STYLES[Math.min(index, IMPACT_STYLES.length - 1)]}`}>Priority {index + 1}</span>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-[#756D67]">{item.because}</p>
                            {item.href ? (
                              <Link href={item.href} className="mt-3 inline-flex min-h-9 items-center rounded-xl bg-[#8B1E2D] px-3 text-xs font-semibold text-white transition hover:bg-[#701723]">
                                Take action
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[#27221F]">Trust signals</h3>
                    <p className="mt-1 text-xs text-[#827A74]">Keep verification and profile readiness visible and current.</p>
                  </div>
                  <Link href="/pro/trust" className="text-xs font-semibold text-[#8B1E2D] hover:underline">Manage verification</Link>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusPill label="Identity review" active={data.identity === "approved" || data.identity === "verified"} />
                  <StatusPill label="Profile public" active={data.toggles.visible} />
                  <StatusPill label="Available now" active={data.toggles.availableNow} />
                  <StatusPill label="Traveling" active={data.toggles.traveling} />
                  <StatusPill label="Mobile service" active={data.toggles.mobile === true} />
                </div>
              </section>
            </div>
          </main>

          <aside className="hidden border-l border-[#E9E2DC] bg-white p-5 xl:block">
            <div className="sticky top-6 rounded-3xl border border-[#E6DED7] bg-white p-4 shadow-[0_18px_50px_rgba(61,43,33,0.06)]">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F9EDEE] text-sm font-bold text-[#8B1E2D]">AI</div>
                <div>
                  <h2 className="text-base font-semibold text-[#27221F]">AI Profile Coach</h2>
                  <p className="text-[11px] text-[#827A74]">Your optimization assistant</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#FFF8F2] to-[#FFF5F6] p-4">
                <p className="text-sm leading-6 text-[#504844]">
                  Your profile score is <strong>{score.total}/100</strong>. Here are the highest-impact improvements the platform can verify from your current data.
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#37302C]">Your action plan</h3>
                <span className="text-[10px] text-[#8A817B]">Top {firstThree.length}</span>
              </div>

              <div className="mt-3 space-y-2.5">
                {firstThree.length === 0 ? (
                  <div className="rounded-2xl border border-[#EEE7E1] bg-[#FFFCFA] p-4 text-xs leading-5 text-[#6D655F]">{data.allClear}</div>
                ) : (
                  firstThree.map((item, index) => (
                    <div key={item.id} className="rounded-2xl border border-[#EEE7E1] bg-[#FFFCFA] p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F9EDEE] text-xs font-bold text-[#8B1E2D]">{index + 1}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#37302C]">{item.title}</p>
                          <p className="mt-1 text-[10px] leading-4 text-[#817873]">{item.because}</p>
                          {item.href ? (
                            <Link href={item.href} className="mt-2 inline-flex text-[10px] font-bold text-[#8B1E2D] hover:underline">Open</Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-5 border-t border-[#EEE7E1] pt-4">
                <p className="text-[10px] leading-4 text-[#9B928B]">
                  Recommendations use your profile, directory analytics, and demand signals. Results are directional and never guaranteed.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#817873]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[#27221F]">{value}</p>
      <p className="mt-1 text-xs text-[#8A817B]">{note}</p>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F9F5F1] p-4">
      <dt className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#817873]">{label}</dt>
      <dd className="mt-2 text-lg font-semibold text-[#37302C]">{value}</dd>
    </div>
  );
}

function StatusPill({ label, active }: { label: string; active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold ${active ? "bg-[#EDF7EF] text-[#347348]" : "bg-[#F7F2EE] text-[#756D67]"}`}>
      <span aria-hidden>{active ? "✓" : "×"}</span>
      {label}
    </span>
  );
}
