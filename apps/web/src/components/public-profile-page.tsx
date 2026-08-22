"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  therapistName,
  type ProfileDetail,
  type TherapistListing,
} from "@masseurmatch/db/actions/directory-config";
import type {
  PublicImportedReview,
  PublicProfileSupplement,
} from "@masseurmatch/db/actions/public-profile";

import { KnottyChat } from "@/app/knotty-chat";
import { hasImage } from "@/lib/cloudinary";
import { TherapistCard } from "@/components/therapist-card";

export type ProfileFaqItem = { question: string; answer: string };

type RecordLike = Record<string, unknown>;

function asRecords(value: unknown): RecordLike[] {
  if (typeof value === "string") {
    try {
      return asRecords(JSON.parse(value));
    } catch {
      return [];
    }
  }
  if (Array.isArray(value))
    return value.filter((item): item is RecordLike => Boolean(item && typeof item === "object"));
  if (value && typeof value === "object") return [value as RecordLike];
  return [];
}

function asStrings(value: unknown): string[] {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed !== trimmed) return asStrings(parsed);
    } catch {
      // Plain text below.
    }
    return trimmed
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? "").trim()).filter(Boolean);
}

function unique(values: Array<string | null | undefined>): string[] {
  return [
    ...new Set(
      values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)),
    ),
  ];
}

function formatHeight(value: number | null | undefined): string | null {
  if (!value || value <= 0) return null;
  const height = Math.round(value);
  return `${Math.floor(height / 12)}′ ${height % 12}″`;
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function safeUrl(value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  if (/^(https?:|mailto:|tel:|sms:)/i.test(raw)) return raw;
  return `https://${raw}`;
}

function phoneHref(phone: string | null, scheme: "tel" | "sms"): string | null {
  if (!phone) return null;
  const normalized = phone.replace(/[^+\d]/g, "");
  return normalized ? `${scheme}:${normalized}` : null;
}

function whatsappHref(phone: string | null): string | null {
  if (!phone) return null;
  const normalized = phone.replace(/\D/g, "");
  return normalized ? `https://wa.me/${normalized}` : null;
}

function compactRecord(record: RecordLike): string | null {
  const label = [record.label, record.name, record.title, record.day, record.duration]
    .map((value) =>
      typeof value === "string" || typeof value === "number" ? String(value).trim() : "",
    )
    .find(Boolean);
  const detail = [record.description, record.value, record.price, record.amount, record.rate]
    .map((value) =>
      typeof value === "string" || typeof value === "number" ? String(value).trim() : "",
    )
    .find(Boolean);
  if (label && detail && detail !== label) return `${label}: ${detail}`;
  return label || detail || null;
}

function displayItems(value: unknown): string[] {
  const strings = asStrings(value);
  if (strings.length > 0) return unique(strings);
  return unique(asRecords(value).map(compactRecord));
}

function hourRows(value: unknown): Array<{ label: string; value: string }> {
  const rows = asRecords(value);
  if (rows.length === 0 && value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value as RecordLike)
      .map(([day, raw]) => ({
        label: day,
        value: typeof raw === "string" ? raw : (compactRecord((raw ?? {}) as RecordLike) ?? ""),
      }))
      .filter((row) => row.value);
  }
  return rows
    .map((row) => {
      const day = String(row.day ?? row.label ?? row.name ?? "").trim();
      const enabled = row.enabled !== false;
      const start = String(row.start_time ?? row.start ?? row.open ?? "").trim();
      const end = String(row.end_time ?? row.end ?? row.close ?? "").trim();
      const value = !enabled
        ? "Unavailable"
        : start && end
          ? `${start} – ${end}`
          : String(row.hours ?? row.value ?? "").trim();
      return { label: day, value };
    })
    .filter((row) => row.label && row.value);
}

function pricingRows(profile: ProfileDetail, supplement: PublicProfileSupplement) {
  const stored = asRecords(supplement.pricing_sessions ?? supplement.rates)
    .map((row) => {
      const duration = row.duration ?? row.minutes ?? row.session_length ?? row.length;
      const title = String(
        row.label ?? row.name ?? (duration ? `${duration} min` : "Session"),
      ).trim();
      const incall = row.incall_price ?? row.incall ?? row.price;
      const outcall = row.outcall_price ?? row.outcall;
      return {
        title,
        incall: typeof incall === "number" || typeof incall === "string" ? String(incall) : null,
        outcall:
          typeof outcall === "number" || typeof outcall === "string" ? String(outcall) : null,
      };
    })
    .filter((row) => row.incall || row.outcall);

  if (stored.length > 0) return stored;
  return [
    {
      title: "Published starting rate",
      incall: profile.incall_price ? String(profile.incall_price) : null,
      outcall: profile.outcall_price ? String(profile.outcall_price) : null,
    },
  ].filter((row) => row.incall || row.outcall);
}

function Price({ value }: { value: string | null }) {
  if (!value) return <span className="text-text-secondary">—</span>;
  const normalized = /^\$/.test(value) ? value : `$${value}`;
  return <span className="font-semibold text-text-primary">{normalized}</span>;
}

function ChipList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="flex list-none flex-wrap gap-2 p-0">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-border bg-bg-subtle px-3 py-1.5 text-sm text-text-primary"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border py-10 sm:py-12">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-secondary">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function trackAction(profileId: string, action: string) {
  const body = JSON.stringify({ profileId, action });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/profile-actions", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/profile-actions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // Contact must work even when analytics does not.
  }
}

function ContactLink({
  href,
  action,
  profileId,
  children,
  primary = false,
}: {
  href: string;
  action: string;
  profileId: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      onClick={() => trackAction(profileId, action)}
      className={
        primary
          ? "inline-flex min-h-11 items-center justify-center rounded-full bg-brand-secondary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          : "inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
      }
    >
      {children}
    </a>
  );
}

function ReportProfile({ profile }: { profile: ProfileDetail }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const name = therapistName(profile);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/profile-reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          profileSlug: profile.slug,
          profileName: name,
          category: data.get("category"),
          reason: data.get("reason"),
          reporterEmail: data.get("email"),
        }),
      });
      const result = (await response.json()) as { ok?: boolean; message?: string };
      if (result.ok) {
        setMessage("Report submitted. Our moderation team can now review it.");
        event.currentTarget.reset();
      } else {
        setMessage(result.message ?? "We could not submit the report.");
      }
    } catch {
      setMessage("We could not submit the report.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-subtle p-5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-sm font-semibold text-text-primary underline underline-offset-4"
      >
        Report this profile
      </button>
      {open ? (
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="report-category"
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              Reason
            </label>
            <select
              id="report-category"
              name="category"
              className="h-11 w-full rounded-xl border border-border bg-bg-surface px-3 text-sm"
              defaultValue="profile_accuracy"
            >
              <option value="profile_accuracy">Profile accuracy</option>
              <option value="conduct">Provider conduct</option>
              <option value="safety">Safety concern</option>
              <option value="spam">Spam or duplicate</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="report-reason"
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              What should we review?
            </label>
            <textarea
              id="report-reason"
              name="reason"
              required
              minLength={10}
              maxLength={3000}
              rows={4}
              className="w-full rounded-xl border border-border bg-bg-surface p-3 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="report-email"
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              Email (optional)
            </label>
            <input
              id="report-email"
              name="email"
              type="email"
              maxLength={320}
              className="h-11 w-full rounded-xl border border-border bg-bg-surface px-3 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Submitting…" : "Submit report"}
          </button>
          {message ? (
            <p className="text-sm text-text-secondary" aria-live="polite">
              {message}
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}

export function PublicProfilePage({
  profile,
  supplement,
  reviews,
  relatedProfiles,
  faqItems,
  cityHref,
}: {
  profile: ProfileDetail;
  supplement: PublicProfileSupplement;
  reviews: PublicImportedReview[];
  relatedProfiles: TherapistListing[];
  faqItems: ProfileFaqItem[];
  cityHref: string;
}) {
  const name = therapistName(profile);
  const firstName = name.split(/\s+/)[0] || name;
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const photos = useMemo(
    () =>
      unique([
        profile.avatar_url,
        profile.photo_url,
        ...profile.photos.map((photo) => photo.url ?? photo.storagePath),
      ]).filter(hasImage),
    [profile.avatar_url, profile.photo_url, profile.photos],
  );
  const hero = photos[0] ?? null;

  const phone =
    supplement.show_phone === false ? null : (supplement.phone ?? supplement.phone_number);
  const whatsapp =
    supplement.show_phone === false
      ? null
      : (supplement.whatsapp_number ?? supplement.whatsapp ?? phone);
  const email = supplement.show_email === false ? null : supplement.email_address;
  const callHref = phoneHref(phone, "tel");
  const smsHref = phoneHref(phone, "sms");
  const waHref = whatsappHref(whatsapp);
  const emailHref = email ? `mailto:${email}` : null;
  const websiteHref = safeUrl(supplement.website ?? profile.website);
  const bookingHref = safeUrl(supplement.booking_url ?? supplement.booking_link);

  const yearsExperience =
    profile.years_experience ??
    (supplement.start_year ? Math.max(0, new Date().getFullYear() - supplement.start_year) : null);
  const location = unique([
    supplement.neighborhood_name ?? profile.neighborhood,
    supplement.primary_area,
    profile.city,
    profile.state,
  ]).join(" · ");
  const availableNow =
    profile.available_now === true &&
    (!profile.available_now_expires ||
      new Date(profile.available_now_expires).getTime() > Date.now());
  const premium = ["standard", "pro", "elite"].includes(
    (profile.subscription_tier ?? "").toLowerCase(),
  );

  const services = unique([
    ...(profile.service_categories ?? []),
    ...(profile.massage_techniques ?? []),
    ...(profile.specialties ?? []),
    ...asStrings(supplement.modalities),
    supplement.modality,
    supplement.specialty,
    ...asStrings(supplement.additional_services),
    ...asStrings(supplement.massage_setup),
    ...asStrings(supplement.mobile_extras),
  ]);
  const amenities = unique([
    ...asStrings(supplement.studio_amenities),
    ...asStrings(supplement.incall_amenities),
    ...asStrings(supplement.accessibility_features),
  ]);
  const products = unique([
    ...asStrings(supplement.products_used).map((item) => `Uses: ${item}`),
    ...asStrings(supplement.products_sold).map((item) => `Available: ${item}`),
  ]);
  const pricing = pricingRows(profile, supplement);
  const pricingNotes = unique([
    ...displayItems(supplement.regular_discounts),
    ...displayItems(supplement.day_of_week_discount),
    ...displayItems(supplement.weekly_special),
    ...displayItems(supplement.promotions),
    ...displayItems(supplement.add_ons),
    ...asStrings(supplement.rate_disclaimers),
  ]);
  const credentials = unique([
    ...asStrings(supplement.training),
    ...asStrings(supplement.education),
    ...asStrings(supplement.certifications),
    ...displayItems(supplement.education_entries),
    ...asStrings(supplement.affiliations),
  ]);
  const studioHours = hourRows(supplement.studio_hours ?? supplement.business_hours);
  const mobileHours = hourRows(supplement.mobile_hours);
  const travelItems = unique([
    ...displayItems(supplement.travel_schedule),
    ...displayItems(supplement.business_trips),
  ]);
  const areasServed = asStrings(supplement.areas_served);
  const socialLinks = Object.entries(asRecords(supplement.social_media)[0] ?? {}).filter(
    ([, value]) => typeof value === "string" && /^https?:\/\//.test(value),
  ) as Array<[string, string]>;

  const contactButtons = [callHref, smsHref, waHref, emailHref, websiteHref, bookingHref].filter(
    Boolean,
  ).length;
  const mapSrc =
    supplement.map_enabled !== false && profile.latitude !== null && profile.longitude !== null
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${profile.longitude - 0.02}%2C${profile.latitude - 0.02}%2C${profile.longitude + 0.02}%2C${profile.latitude + 0.02}&layer=mapnik&marker=${profile.latitude}%2C${profile.longitude}`
      : null;

  return (
    <main className="pb-24 sm:pb-16">
      {supplement.is_demo ? (
        <div className="border-b border-warning/30 bg-warning/10 px-4 py-2 text-center text-xs font-semibold text-text-primary">
          Demo profile — sample content may be used for presentation.
        </div>
      ) : null}

      <section className="bg-brand-primary text-white">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[380px_1fr] lg:items-center">
          <div>
            {hero ? (
              <button
                type="button"
                onClick={() => setSelectedPhoto(hero)}
                className="block w-full overflow-hidden rounded-3xl border border-white/15 bg-white/5 text-left shadow-ds-lg"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={hero}
                    alt={name}
                    fill
                    priority
                    sizes="(min-width: 1024px) 380px, 92vw"
                    className="object-cover"
                  />
                </div>
              </button>
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center rounded-3xl border border-white/15 bg-white/5 text-6xl font-bold">
                {name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <Link
              href={cityHref}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65 hover:text-white"
            >
              {profile.city}, {profile.state}
            </Link>
            <div className="mt-4 flex flex-wrap gap-2">
              {availableNow ? (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-badge-available">
                  Available now
                </span>
              ) : null}
              {profile.is_verified_identity || profile.is_verified_profile ? (
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
                  Verified
                </span>
              ) : null}
              {supplement.is_verified_photos ? (
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
                  Photos verified
                </span>
              ) : null}
              {premium ? (
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
                  {profile.subscription_tier} profile
                </span>
              ) : null}
              {profile.lgbtq_affirming ? (
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
                  LGBTQ+ affirming
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              {name}
            </h1>
            {(profile.headline ?? profile.tagline) ? (
              <p className="mt-3 max-w-2xl text-lg leading-7 text-white/75">
                {profile.headline ?? profile.tagline}
              </p>
            ) : null}
            {location ? <p className="mt-4 text-sm text-white/65">{location}</p> : null}

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
              {yearsExperience ? <span>{yearsExperience} years experience</span> : null}
              {profile.rating_average && (profile.review_count || reviews.length) ? (
                <span>
                  {Number(profile.rating_average).toFixed(1)} rating ·{" "}
                  {profile.review_count || reviews.length} reviews
                </span>
              ) : null}
              {supplement.body_type ? <span>{supplement.body_type}</span> : null}
              {formatHeight(supplement.height_inches) ? (
                <span>{formatHeight(supplement.height_inches)}</span>
              ) : null}
              {supplement.weight_lb ? <span>{supplement.weight_lb} lb</span> : null}
            </div>

            {contactButtons > 0 ? (
              <div className="mt-7 flex flex-wrap gap-3">
                {callHref ? (
                  <ContactLink href={callHref} action="call" profileId={profile.id} primary>
                    Call {firstName}
                  </ContactLink>
                ) : null}
                {smsHref ? (
                  <ContactLink href={smsHref} action="text" profileId={profile.id}>
                    Text
                  </ContactLink>
                ) : null}
                {waHref ? (
                  <ContactLink href={waHref} action="whatsapp" profileId={profile.id}>
                    WhatsApp
                  </ContactLink>
                ) : null}
                {emailHref ? (
                  <ContactLink href={emailHref} action="email" profileId={profile.id}>
                    Email
                  </ContactLink>
                ) : null}
                {websiteHref ? (
                  <ContactLink href={websiteHref} action="website" profileId={profile.id}>
                    Website
                  </ContactLink>
                ) : null}
                {bookingHref ? (
                  <ContactLink href={bookingHref} action="booking" profileId={profile.id}>
                    Provider scheduling link
                  </ContactLink>
                ) : null}
              </div>
            ) : null}
            <p className="mt-4 max-w-2xl text-xs leading-5 text-white/55">
              MasseurMatch is a directory. Confirm availability, exact location, services and final
              rates directly with the independent provider.
            </p>
          </div>
        </div>
      </section>

      <nav
        className="sticky top-0 z-20 border-b border-border bg-bg-surface/95 backdrop-blur"
        aria-label="Profile sections"
      >
        <div className="mx-auto flex w-full max-w-6xl gap-5 overflow-x-auto px-4 py-3 text-xs font-semibold text-text-secondary sm:px-6">
          {[
            ["about", "About"],
            ["services", "Services"],
            ["pricing", "Rates"],
            ["availability", "Availability"],
            ...(photos.length > 1 ? [["gallery", "Gallery"]] : []),
            ...(reviews.length ? [["reviews", "Reviews"]] : []),
            ["trust", "Trust"],
            ["faq", "FAQ"],
          ].map(([href, label]) => (
            <a key={href} href={`#${href}`} className="whitespace-nowrap hover:text-text-primary">
              {label}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {photos.length > 1 ? (
          <Section id="gallery" eyebrow="Profile gallery" title={`${firstName}'s photos`}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo, index) => (
                <button
                  key={photo}
                  type="button"
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-bg-subtle"
                >
                  <Image
                    src={photo}
                    alt={`${name} profile photo ${index + 1}`}
                    fill
                    sizes="(min-width: 1024px) 260px, 45vw"
                    className="object-cover transition duration-300 hover:scale-[1.02]"
                  />
                </button>
              ))}
            </div>
          </Section>
        ) : null}

        <Section id="about" eyebrow="About" title={`Meet ${firstName}`}>
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4 text-[15px] leading-7 text-text-secondary">
              {profile.bio ? (
                <p className="whitespace-pre-line">{profile.bio}</p>
              ) : (
                <p>This provider has not added a public biography yet.</p>
              )}
              {supplement.availability_note ? (
                <p className="rounded-2xl border border-border bg-bg-subtle p-4">
                  <strong className="text-text-primary">Availability note:</strong>{" "}
                  {supplement.availability_note}
                </p>
              ) : null}
            </div>
            <dl className="grid grid-cols-2 gap-3">
              {[
                ["Experience", yearsExperience ? `${yearsExperience} years` : null],
                ["Body type", supplement.body_type],
                ["Height", formatHeight(supplement.height_inches)],
                ["Weight", supplement.weight_lb ? `${supplement.weight_lb} lb` : null],
                ["Languages", (profile.languages ?? []).join(", ") || null],
                [
                  "All genders",
                  supplement.accepts_all_genders === true
                    ? "Yes"
                    : supplement.accepts_all_genders === false
                      ? "No"
                      : null,
                ],
              ]
                .filter(([, value]) => Boolean(value))
                .map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-2xl border border-border bg-bg-surface p-4"
                  >
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                      {label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-text-primary">{value}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </Section>

        <Section id="services" eyebrow="Practice" title="Services & session details">
          <ChipList items={services} />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {profile.offers_incall ? (
              <div className="rounded-2xl border border-border bg-bg-surface p-5">
                <h3 className="font-semibold text-text-primary">Incall / studio</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {supplement.incall_details ??
                    "Available. Confirm the exact address and access details directly."}
                </p>
              </div>
            ) : null}
            {profile.offers_outcall ? (
              <div className="rounded-2xl border border-border bg-bg-surface p-5">
                <h3 className="font-semibold text-text-primary">Outcall / mobile</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {supplement.outcall_details ??
                    "Available. Confirm whether your location is within the provider's travel area."}
                </p>
                {(supplement.outcall_radius_miles ?? supplement.service_radius_miles) ? (
                  <p className="mt-2 text-xs font-semibold text-text-primary">
                    Service radius:{" "}
                    {supplement.outcall_radius_miles ?? supplement.service_radius_miles} miles
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
          {areasServed.length > 0 ? (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Areas served</h3>
              <ChipList items={areasServed} />
            </div>
          ) : null}
          {amenities.length > 0 ? (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">
                Studio & accessibility
              </h3>
              <ChipList items={amenities} />
            </div>
          ) : null}
          {products.length > 0 ? (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Products</h3>
              <ChipList items={products} />
            </div>
          ) : null}
        </Section>

        <Section id="pricing" eyebrow="Published rates" title="Rates & payment details">
          {pricing.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-bg-subtle text-text-secondary">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Session</th>
                    <th className="px-4 py-3 font-semibold">Incall</th>
                    <th className="px-4 py-3 font-semibold">Outcall</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.map((row) => (
                    <tr
                      key={`${row.title}-${row.incall}-${row.outcall}`}
                      className="border-t border-border"
                    >
                      <td className="px-4 py-3 font-medium text-text-primary">{row.title}</td>
                      <td className="px-4 py-3">
                        <Price value={row.incall} />
                      </td>
                      <td className="px-4 py-3">
                        <Price value={row.outcall} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-text-secondary">No public rates have been added.</p>
          )}
          {supplement.session_lengths?.length ? (
            <p className="mt-4 text-sm text-text-secondary">
              Published session lengths: {supplement.session_lengths.join(", ")} minutes.
            </p>
          ) : null}
          {asStrings(supplement.payment_methods).length > 0 ? (
            <div className="mt-5">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Payment methods</h3>
              <ChipList items={asStrings(supplement.payment_methods)} />
            </div>
          ) : null}
          {pricingNotes.length > 0 ? (
            <div className="mt-5">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Offers & rate notes</h3>
              <ul className="space-y-2 text-sm leading-6 text-text-secondary">
                {pricingNotes.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="mt-5 text-xs leading-5 text-text-secondary">
            Published profile rates are informational. Confirm the final price and any travel charge
            directly with the provider before meeting.
          </p>
        </Section>

        {credentials.length > 0 ? (
          <Section id="credentials" eyebrow="Background" title="Training, education & affiliations">
            <ul className="grid gap-3 sm:grid-cols-2">
              {credentials.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-border bg-bg-surface p-4 text-sm leading-6 text-text-secondary"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        <Section id="availability" eyebrow="Availability" title="Hours, status & travel">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-bg-surface p-5">
              <h3 className="font-semibold text-text-primary">Studio hours</h3>
              {studioHours.length ? (
                <dl className="mt-4 space-y-2">
                  {studioHours.map((row) => (
                    <div
                      key={`${row.label}-${row.value}`}
                      className="flex justify-between gap-4 text-sm"
                    >
                      <dt className="capitalize text-text-secondary">{row.label}</dt>
                      <dd className="font-medium text-text-primary">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-2 text-sm text-text-secondary">
                  Contact the provider to confirm hours.
                </p>
              )}
            </div>
            <div className="rounded-2xl border border-border bg-bg-surface p-5">
              <h3 className="font-semibold text-text-primary">Mobile / outcall hours</h3>
              {mobileHours.length ? (
                <dl className="mt-4 space-y-2">
                  {mobileHours.map((row) => (
                    <div
                      key={`${row.label}-${row.value}`}
                      className="flex justify-between gap-4 text-sm"
                    >
                      <dt className="capitalize text-text-secondary">{row.label}</dt>
                      <dd className="font-medium text-text-primary">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-2 text-sm text-text-secondary">
                  Contact the provider to confirm mobile availability.
                </p>
              )}
            </div>
          </div>
          {supplement.current_status ? (
            <p className="mt-5 rounded-2xl border border-border bg-bg-subtle p-4 text-sm text-text-secondary">
              <strong className="text-text-primary">Current status:</strong>{" "}
              {supplement.current_status}
            </p>
          ) : null}
          {travelItems.length > 0 ? (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Travel schedule</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                {travelItems.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </Section>

        {mapSrc || supplement.street_reference || profile.neighborhood || areasServed.length > 0 ? (
          <Section id="location" eyebrow="Location" title="Service area">
            <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
              <div className="rounded-2xl border border-border bg-bg-surface p-5 text-sm leading-6 text-text-secondary">
                <p className="font-semibold text-text-primary">
                  {profile.city}, {profile.state}
                </p>
                {profile.neighborhood || supplement.neighborhood_name ? (
                  <p className="mt-2">
                    Neighborhood: {supplement.neighborhood_name ?? profile.neighborhood}
                  </p>
                ) : null}
                {supplement.street_reference ? (
                  <p className="mt-2">Location reference: {supplement.street_reference}</p>
                ) : null}
                <p className="mt-3 text-xs">
                  The map and area information are for planning context. Confirm the exact meeting
                  location directly with the provider.
                </p>
              </div>
              {mapSrc ? (
                <iframe
                  title={`${name} service area map`}
                  src={mapSrc}
                  className="min-h-[320px] w-full rounded-2xl border border-border"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : null}
            </div>
          </Section>
        ) : null}

        {reviews.length > 0 ? (
          <Section
            id="reviews"
            eyebrow="Imported reviews"
            title={`What previous clients wrote about ${firstName}`}
          >
            <p className="mb-5 max-w-3xl text-sm leading-6 text-text-secondary">
              These are public imported reviews associated with this profile. Imported review source
              links are not exposed on the public page.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {reviews.slice(0, showAllReviews ? reviews.length : 2).map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-border bg-bg-surface p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-text-primary">
                      {review.public_label ?? review.reviewer_name ?? "Client review"}
                    </p>
                    {review.rating ? (
                      <span className="text-sm font-semibold text-text-primary">
                        {Number(review.rating).toFixed(1)} / 5
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-text-secondary">
                    {review.review_text}
                  </p>
                  {review.review_date ? (
                    <p className="mt-3 text-xs text-text-secondary">
                      {formatDate(review.review_date)}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
            {reviews.length > 2 ? (
              <button
                type="button"
                onClick={() => setShowAllReviews((current) => !current)}
                className="mt-5 rounded-full border border-border bg-bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-bg-subtle"
                aria-expanded={showAllReviews}
              >
                {showAllReviews ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}
              </button>
            ) : null}
          </Section>
        ) : null}

        <Section id="trust" eyebrow="Trust & safety" title="Profile signals & important context">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Identity", profile.is_verified_identity ? "Verified" : "No verified badge"],
              ["Profile", profile.is_verified_profile ? "Verified" : "Public approved profile"],
              ["Photos", supplement.is_verified_photos ? "Verified" : "Approved public photos"],
              ["Phone", supplement.is_verified_phone ? "Verified" : "Not shown as verified"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-border bg-bg-surface p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                  {label}
                </p>
                <p className="mt-2 text-sm font-semibold text-text-primary">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 max-w-4xl text-sm leading-6 text-text-secondary">
            Verification describes specific MasseurMatch profile checks; it is not a
            professional-license verification, background check, guarantee, or endorsement. Use
            normal judgment and confirm details directly before meeting.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/trust" className="text-brand-secondary hover:underline">
              Trust &amp; verification
            </Link>
            <Link href="/safety" className="text-brand-secondary hover:underline">
              Safety guidance
            </Link>
          </div>
        </Section>

        {faqItems.length > 0 ? (
          <Section id="faq" eyebrow="FAQ" title={`Common questions about ${firstName}`}>
            <div className="space-y-3">
              {faqItems.map((faq) => (
                <details
                  key={faq.question}
                  className="rounded-2xl border border-border bg-bg-surface p-5"
                >
                  <summary className="cursor-pointer font-semibold text-text-primary">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-text-secondary">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Section>
        ) : null}

        {supplement.presentation_video_url || socialLinks.length > 0 ? (
          <Section id="links" eyebrow="More from provider" title="Video & public links">
            <div className="flex flex-wrap gap-3">
              {supplement.presentation_video_url ? (
                <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-black">
                  <video
                    src={safeUrl(supplement.presentation_video_url) ?? undefined}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-video w-full object-cover"
                  >
                    Your browser does not support this profile video.
                  </video>
                  <p className="bg-bg-surface px-4 py-3 text-xs text-text-secondary">
                    Provider introduction · maximum 30 seconds
                  </p>
                </div>
              ) : null}
              {socialLinks.map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold capitalize text-text-primary"
                >
                  {platform}
                </a>
              ))}
            </div>
          </Section>
        ) : null}

        <section className="my-10 overflow-hidden rounded-3xl bg-brand-primary px-6 py-8 text-white sm:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
            Ready when you are
          </p>
          <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Want to contact {firstName}?
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                Contact the provider directly to confirm availability, exact location, services and
                final rates.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {callHref ? (
                <ContactLink href={callHref} action="call" profileId={profile.id} primary>
                  Call {firstName}
                </ContactLink>
              ) : null}
              {smsHref ? (
                <ContactLink href={smsHref} action="text" profileId={profile.id}>
                  Text
                </ContactLink>
              ) : null}
              {waHref ? (
                <ContactLink href={waHref} action="whatsapp" profileId={profile.id}>
                  WhatsApp
                </ContactLink>
              ) : null}
            </div>
          </div>
        </section>

        <KnottyChat profile={{ id: profile.id, name: firstName }} floating />

        {relatedProfiles.length > 0 ? (
          <Section id="related" eyebrow="More nearby" title={`Therapists near ${profile.city}`}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProfiles.map((therapist) => (
                <TherapistCard key={therapist.id} therapist={therapist} headingLevel={3} />
              ))}
            </div>
          </Section>
        ) : null}

        <Section id="report" eyebrow="Accountability" title="Something looks wrong?">
          <ReportProfile profile={profile} />
        </Section>
      </div>

      {selectedPhoto ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Profile photo"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            className="absolute right-4 top-4 rounded-full border border-white/30 bg-black/30 px-4 py-2 text-sm font-semibold text-white"
          >
            Close
          </button>
          <div
            className="relative h-[86vh] w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedPhoto}
              alt={`${name} enlarged profile photo`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
      ) : null}

      {callHref || smsHref || waHref ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg-surface/95 p-3 shadow-ds-lg backdrop-blur sm:hidden">
          <div className="mx-auto flex max-w-lg gap-2">
            {callHref ? (
              <a
                href={callHref}
                onClick={() => trackAction(profile.id, "call")}
                className="flex-1 rounded-full bg-brand-secondary px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Call
              </a>
            ) : null}
            {smsHref ? (
              <a
                href={smsHref}
                onClick={() => trackAction(profile.id, "text")}
                className="flex-1 rounded-full bg-brand-primary px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Text
              </a>
            ) : null}
            {waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackAction(profile.id, "whatsapp")}
                className="flex-1 rounded-full border border-border bg-bg-surface px-4 py-3 text-center text-sm font-semibold text-text-primary"
              >
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
