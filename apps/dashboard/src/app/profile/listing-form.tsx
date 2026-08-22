"use client";

import { CURRENT_STATUS_LABELS, CURRENT_STATUSES } from "@masseurmatch/db/current-status";
import { Button, cn } from "@masseurmatch/ui";
import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";

import {
  composeHeadline,
  composeStreetReference,
  type ListingInput,
  listingSchema,
} from "@/lib/listing";
import {
  ADDITIONAL_SERVICES,
  AFFILIATIONS,
  BODY_TYPES,
  CLOCK_HOURS,
  CLOCK_MINUTES,
  DISCOUNT_PERCENTAGES,
  formatRadius,
  HEADLINES,
  LANGUAGES,
  LIMITS,
  MASSAGE_SETUP,
  MASSAGE_TECHNIQUES,
  MERIDIEM,
  MOBILE_EXTRAS,
  MONTHS,
  OUTCALL_RADII_MILES,
  PAYMENT_METHODS,
  PRODUCTS,
  RATE_DISCLAIMERS,
  REGULAR_DISCOUNTS,
  SCHEDULE_DAYS,
  STUDIO_AMENITIES,
  WEEKDAYS,
  YEARS,
} from "@/lib/listing-options";

import { EMPTY_STEP_STATE, type FieldErrors } from "../onboarding/form-state";
import { saveListing } from "./listing-actions";
import {
  CheckGroup,
  Repeater,
  RowField,
  RowInput,
  RowSelect,
  SelectField,
  TextArea,
  TextField,
  Toggle,
} from "./listing-fields";

/**
 * The listing editor.
 *
 * Holds the whole listing as one `ListingInput` and posts it as JSON, which is
 * what lets sessions, hour ranges and education stay arrays of objects instead
 * of index-encoded form keys.
 *
 * Validation runs twice on purpose. `listingSchema` runs here on every change
 * so a therapist sees the problem beside the field, and again in the action,
 * where it is the only run that counts — a client can post anything.
 */

type SectionId = "about" | "location" | "services" | "rates" | "schedule" | "credentials";

const SECTIONS: {
  id: SectionId;
  title: string;
  blurb: string;
  complete: (v: ListingInput) => boolean;
  needs: string;
}[] = [
  {
    id: "about",
    title: "About you",
    blurb: "Name, headline and the bio clients read first.",
    complete: (v) => v.display_name.trim() !== "" && v.headline !== "" && v.bio.trim() !== "",
    needs: "Pick a headline and write your bio.",
  },
  {
    id: "location",
    title: "Location & contact",
    blurb: "Where you work and how clients reach you.",
    complete: (v) => v.city.trim() !== "" && v.state !== "" && v.phone.trim() !== "",
    needs: "Add your city, state and a phone number.",
  },
  {
    id: "services",
    title: "Services",
    blurb: "Techniques, setup, amenities and products.",
    complete: (v) => v.techniques.length > 0,
    needs: "Pick at least one massage technique.",
  },
  {
    id: "rates",
    title: "Rates & payments",
    blurb: "Session pricing, discounts and payment methods.",
    complete: (v) => v.sessions.some((s) => s.incall !== "" || s.outcall !== ""),
    needs: "Add at least one session with a rate.",
  },
  {
    id: "schedule",
    title: "Schedule",
    blurb: "Studio hours, availability and status.",
    complete: (v) => v.studio_hours.length > 0,
    needs: "Add at least one range of studio hours.",
  },
  {
    id: "credentials",
    title: "Credentials",
    blurb: "Experience, training, languages and affiliations.",
    complete: (v) => v.years_experience.trim() !== "",
    needs: "Add your years of experience.",
  },
];

/** Which section a dotted error path belongs to, so the tabs can count them. */
const SECTION_OF: Record<string, SectionId> = {
  display_name: "about",
  headline: "about",
  tagline: "about",
  bio: "about",
  height_in: "about",
  weight_lb: "about",
  body_type: "about",
  zip: "location",
  city: "location",
  state: "location",
  neighborhood: "location",
  street_1: "location",
  street_2: "location",
  outcall_radius: "location",
  phone: "location",
  whatsapp: "location",
  email: "location",
  website: "location",
  booking_url: "location",
  booking_platform: "location",
  techniques: "services",
  massage_setup: "services",
  mobile_extras: "services",
  additional_services: "services",
  studio_amenities: "services",
  products_used: "services",
  products_sold: "services",
  sessions: "rates",
  rate_disclaimers: "rates",
  regular_discounts: "rates",
  dow_discount_percent: "rates",
  dow_discount_day: "rates",
  payment_methods: "rates",
  studio_hours: "schedule",
  mobile_hours: "schedule",
  current_status: "schedule",
  career_start_month: "credentials",
  career_start_year: "credentials",
  years_experience: "credentials",
  education: "credentials",
  languages: "credentials",
  affiliations: "credentials",
};

const blankSession = () => ({ minutes: "", incall: "", outcall: "" });
const blankRange = () => ({
  days: "Every day",
  from_h: "9",
  from_m: "00",
  from_ap: "AM",
  to_h: "9",
  to_m: "00",
  to_ap: "PM",
});
const blankEducation = () => ({
  degree: "",
  institution: "",
  location: "",
  start_month: "",
  start_year: "",
  end_month: "",
  end_year: "",
});

function SaveButton({ label = "Save profile" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function ListingForm({ initial }: { initial: ListingInput }) {
  const [state, action] = useFormState(saveListing, EMPTY_STEP_STATE);
  const [value, setValue] = React.useState<ListingInput>(initial);
  const [touched, setTouched] = React.useState<Record<string, true>>({});
  const [open, setOpen] = React.useState<Record<SectionId, boolean>>({
    about: true,
    location: true,
    services: true,
    rates: true,
    schedule: true,
    credentials: true,
  });

  const set = <K extends keyof ListingInput>(key: K, next: ListingInput[K]) => {
    setValue((current) => ({ ...current, [key]: next }));
    setTouched((current) => ({ ...current, [String(key)]: true }));
  };

  /* Live client-side errors, merged with whatever the action sent back. */
  const liveErrors: FieldErrors = React.useMemo(() => {
    const result = listingSchema.safeParse(value);
    if (result.success) return {};
    const out: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path.map(String).join(".") || "form";
      (out[key] ??= []).push(issue.message);
    }
    return out;
  }, [value]);

  const serverErrors = state.fieldErrors ?? {};
  const submitted = Object.keys(serverErrors).length > 0;

  const errorFor = (path: string): string | undefined => {
    if (serverErrors[path]?.[0]) return serverErrors[path][0];
    if (submitted || touched[path.split(".")[0] ?? path]) return liveErrors[path]?.[0];
    return undefined;
  };

  const errorCount = (id: SectionId) =>
    Object.keys({ ...liveErrors, ...serverErrors }).filter((path) => {
      const root = path.split(".")[0] ?? path;
      return SECTION_OF[root] === id && (submitted || touched[root]);
    }).length;

  const done = SECTIONS.filter((section) => section.complete(value)).length;
  const nextUp = SECTIONS.find((section) => !section.complete(value));

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="listing" value={JSON.stringify(value)} />

      {/* Progress */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-brand">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-text-secondary">
            <strong className="text-ds-18 font-bold tabular-nums text-ink">{done}/6</strong>{" "}
            sections complete
          </p>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {done === 6 ? "Ready to publish" : done >= 4 ? "Almost there" : "In progress"}
          </p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg-subtle">
          <span
            className="block h-full rounded-full bg-action-primary transition-[width] duration-500 ease-smooth-out"
            style={{ width: `${(done / SECTIONS.length) * 100}%` }}
          />
        </div>
        <p className="mt-2.5 text-xs text-text-secondary">
          {nextUp ? (
            <>
              Next up: <strong className="text-ink">{nextUp.title}</strong> — {nextUp.needs}
            </>
          ) : (
            "Every section is complete."
          )}
        </p>
      </div>

      {state.error ? (
        <p
          role="alert"
          className={cn(
            "rounded-xl border p-4 text-sm",
            state.ok
              ? "border-success/40 bg-success/5 text-ink"
              : "border-wine/40 bg-wine/5 text-ink",
          )}
        >
          {state.error}
        </p>
      ) : null}
      {state.ok && !state.error ? (
        <p role="status" className="rounded-xl border border-success/40 bg-success/5 p-4 text-sm">
          Saved.
        </p>
      ) : null}

      {/* ── 1 · About you ── */}
      <Section id="about" open={open} setOpen={setOpen} errors={errorCount("about")} value={value}>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="display_name"
            label="Display name"
            required
            counter
            maxLength={LIMITS.displayName}
            value={value.display_name}
            onChange={(v) => set("display_name", v)}
            error={errorFor("display_name")}
            hint="Saved to both display_name and full_name."
          />
          <SelectField
            id="headline"
            label="Headline"
            options={HEADLINES}
            placeholder="Choose a headline…"
            value={value.headline}
            onChange={(v) => set("headline", v)}
            error={errorFor("headline")}
            hint="70 presets. Not free text."
          />
        </div>

        <p className="rounded-xl border border-brand-secondary/25 bg-brand-soft px-4 py-3 text-sm">
          <span className="mr-2 text-xs font-bold uppercase tracking-wider text-action-primary">
            Clients see
          </span>
          <strong className="text-ds-18 tracking-tight text-ink">
            {composeHeadline(value) || "Pick a headline to see this"}
          </strong>
        </p>

        <TextField
          id="tagline"
          label="Tagline"
          counter
          maxLength={LIMITS.taglineEditor}
          value={value.tagline}
          onChange={(v) => set("tagline", v)}
          error={errorFor("tagline")}
          hint={`One sentence on what you do and for whom. The column accepts ${LIMITS.tagline}; this editor stops at ${LIMITS.taglineEditor}.`}
        />

        <TextArea
          id="bio"
          label="Bio"
          maxLength={LIMITS.bio}
          value={value.bio}
          onChange={(v) => set("bio", v)}
          error={errorFor("bio")}
          placeholder="Where you trained, what a session with you feels like, who you work best with…"
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            id="height_in"
            label="Height (inches)"
            type="number"
            inputMode="numeric"
            value={value.height_in}
            onChange={(v) => set("height_in", v)}
            error={errorFor("height_in")}
            hint={heightHint(value.height_in)}
          />
          <TextField
            id="weight_lb"
            label="Weight (pounds)"
            type="number"
            inputMode="numeric"
            value={value.weight_lb}
            onChange={(v) => set("weight_lb", v)}
            error={errorFor("weight_lb")}
            hint={weightHint(value.weight_lb)}
          />
          <SelectField
            id="body_type"
            label="Body type"
            options={BODY_TYPES}
            value={value.body_type}
            onChange={(v) => set("body_type", v)}
            error={errorFor("body_type")}
          />
        </div>
      </Section>

      {/* ── 2 · Location & contact ── */}
      <Section
        id="location"
        open={open}
        setOpen={setOpen}
        errors={errorCount("location")}
        value={value}
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            id="zip"
            label="ZIP code"
            inputMode="numeric"
            maxLength={5}
            value={value.zip}
            onChange={(v) => set("zip", v.replace(/\D/g, "").slice(0, 5))}
            error={errorFor("zip")}
          />
          <TextField
            id="city"
            label="City"
            required
            value={value.city}
            onChange={(v) => set("city", v)}
            error={errorFor("city")}
          />
          <TextField
            id="state"
            label="State"
            maxLength={2}
            value={value.state}
            onChange={(v) => set("state", v.toUpperCase().replace(/[^A-Z]/g, ""))}
            error={errorFor("state")}
            hint="Two-letter code."
          />
          <TextField
            id="neighborhood"
            label="Neighborhood"
            value={value.neighborhood}
            onChange={(v) => set("neighborhood", v)}
            error={errorFor("neighborhood")}
          />
          <TextField
            id="street_1"
            label="Street intersection · 1"
            value={value.street_1}
            onChange={(v) => set("street_1", v)}
            error={errorFor("street_1")}
            placeholder="8th Avenue"
          />
          <TextField
            id="street_2"
            label="Street intersection · 2"
            value={value.street_2}
            onChange={(v) => set("street_2", v)}
            error={errorFor("street_2")}
            placeholder="W 23rd Street"
          />
        </div>

        <p className="rounded-xl border border-border bg-bg-subtle px-4 py-3 text-xs text-text-secondary">
          <span className="font-bold uppercase tracking-wider">Saved as street_reference</span>
          <span className="ml-2 text-ink">
            {composeStreetReference(value) ?? "Both streets are blank."}
          </span>
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <Toggle
            id="offers_incall"
            title="Offers in-call"
            description={value.offers_incall ? "Clients come to me" : "I do not host clients"}
            checked={value.offers_incall}
            onChange={(v) => set("offers_incall", v)}
          />
          <Toggle
            id="offers_outcall"
            title="Offers out-call"
            description={value.offers_outcall ? "I travel to the client" : "I do not travel"}
            checked={value.offers_outcall}
            onChange={(v) => set("offers_outcall", v)}
          />
          <Toggle
            id="map_enabled"
            title="Show on map"
            description={value.map_enabled ? "Location appears on the map" : "Hidden from the map"}
            checked={value.map_enabled}
            onChange={(v) => set("map_enabled", v)}
          />
        </div>

        {value.offers_outcall ? (
          <div className="rounded-xl border border-dashed border-brand-secondary/40 bg-brand-soft p-4">
            <SelectField
              id="outcall_radius"
              label="Out-call radius"
              options={OUTCALL_RADII_MILES}
              placeholder="Choose a radius…"
              format={(option) => formatRadius(Number(option))}
              value={value.outcall_radius}
              onChange={(v) => set("outcall_radius", v)}
              error={errorFor("outcall_radius")}
              hint="How far you travel from your ZIP code. Shown because out-call is on."
            />
          </div>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            id="phone"
            label="Phone"
            type="tel"
            required
            value={value.phone}
            onChange={(v) => set("phone", v)}
            error={errorFor("phone")}
            hint="Required to save a provider profile."
          />
          <TextField
            id="whatsapp"
            label="WhatsApp"
            type="tel"
            value={value.whatsapp}
            onChange={(v) => set("whatsapp", v)}
            error={errorFor("whatsapp")}
          />
          <TextField
            id="email"
            label="Email"
            type="email"
            value={value.email}
            onChange={(v) => set("email", v)}
            error={errorFor("email")}
            hint="Contact address for the profile, not your sign-in email."
          />
        </div>

        {value.email.trim() ? (
          <Toggle
            id="show_email"
            title="Show email on public profile"
            description={value.show_email ? "Anyone viewing your listing sees it" : "Kept private"}
            checked={value.show_email}
            onChange={(v) => set("show_email", v)}
          />
        ) : null}

        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            id="website"
            label="Website"
            type="url"
            value={value.website}
            onChange={(v) => set("website", v)}
            error={errorFor("website")}
            placeholder="https://yoursite.com"
          />
          <TextField
            id="booking_url"
            label="Booking URL"
            type="url"
            value={value.booking_url}
            onChange={(v) => set("booking_url", v)}
            error={errorFor("booking_url")}
            placeholder="https://book.yoursite.com"
          />
          <TextField
            id="booking_platform"
            label="Booking platform"
            value={value.booking_platform}
            onChange={(v) => set("booking_platform", v)}
            error={errorFor("booking_platform")}
            placeholder="Calendly"
          />
        </div>
      </Section>

      {/* ── 3 · Services ── */}
      <Section
        id="services"
        open={open}
        setOpen={setOpen}
        errors={errorCount("services")}
        value={value}
      >
        <CheckGroup
          label="Massage techniques"
          options={MASSAGE_TECHNIQUES}
          selected={value.techniques}
          onChange={(v) => set("techniques", v)}
          filterable
          error={errorFor("techniques")}
          hint={
            value.techniques.length
              ? `Also fills service_categories, and the first ${Math.min(12, value.techniques.length)} become your specialties.`
              : "These also fill service_categories and specialties — neither has a control of its own."
          }
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <CheckGroup
            label="Massage setup"
            options={MASSAGE_SETUP}
            selected={value.massage_setup}
            onChange={(v) => set("massage_setup", v)}
            columns={1}
          />
          <CheckGroup
            label="Mobile / out-call extras"
            options={MOBILE_EXTRAS}
            selected={value.mobile_extras}
            onChange={(v) => set("mobile_extras", v)}
            columns={1}
            hint={value.offers_outcall ? undefined : "Out-call is currently off."}
          />
        </div>

        <CheckGroup
          label="Studio amenities"
          options={STUDIO_AMENITIES}
          selected={value.studio_amenities}
          onChange={(v) => set("studio_amenities", v)}
        />
        <CheckGroup
          label="Additional services"
          options={ADDITIONAL_SERVICES}
          selected={value.additional_services}
          onChange={(v) => set("additional_services", v)}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <CheckGroup
            label="Products used"
            options={PRODUCTS}
            selected={value.products_used}
            onChange={(v) => set("products_used", v)}
            columns={1}
            filterable
          />
          <CheckGroup
            label="Products sold"
            options={PRODUCTS}
            selected={value.products_sold}
            onChange={(v) => set("products_sold", v)}
            columns={1}
            filterable
          />
        </div>
      </Section>

      {/* ── 4 · Rates & payments ── */}
      <Section id="rates" open={open} setOpen={setOpen} errors={errorCount("rates")} value={value}>
        <Repeater
          label="Session pricing"
          noun="session"
          rows={value.sessions}
          max={LIMITS.sessions}
          blank={blankSession}
          onChange={(v) => set("sessions", v)}
          empty="No sessions yet. Add the lengths you offer and what they cost."
          hint={`Once you price a 60-minute session, every other length is capped at a third above its proportional share of that hour. Your lowest rate becomes the "from $" on your listing.`}
          renderRow={(row, index, patch) => (
            <div className="space-y-2">
              <div className="grid gap-3 sm:grid-cols-3">
                <RowField label="Minutes">
                  <RowInput
                    type="number"
                    inputMode="numeric"
                    min={LIMITS.sessionMinutesMin}
                    max={LIMITS.sessionMinutesMax}
                    value={row.minutes}
                    placeholder="60"
                    aria-label={`Minutes for session ${index + 1}`}
                    onChange={(e) => patch({ minutes: e.target.value })}
                  />
                </RowField>
                <RowField label="In-call rate">
                  <RowInput
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={row.incall}
                    placeholder="—"
                    aria-label={`In-call rate for session ${index + 1}`}
                    onChange={(e) => patch({ incall: e.target.value })}
                  />
                </RowField>
                <RowField label="Out-call rate">
                  <RowInput
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={row.outcall}
                    placeholder="—"
                    aria-label={`Out-call rate for session ${index + 1}`}
                    onChange={(e) => patch({ outcall: e.target.value })}
                  />
                </RowField>
              </div>
              <RowErrors
                errorFor={errorFor}
                prefix={`sessions.${index}`}
                keys={["minutes", "incall", "outcall"]}
              />
            </div>
          )}
        />

        <CheckGroup
          label="Rate disclaimers"
          options={RATE_DISCLAIMERS}
          selected={value.rate_disclaimers}
          onChange={(v) => set("rate_disclaimers", v)}
          columns={1}
        />
        <CheckGroup
          label="Regular discounts"
          options={REGULAR_DISCOUNTS}
          selected={value.regular_discounts}
          onChange={(v) => set("regular_discounts", v)}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            id="dow_discount_percent"
            label="Day-of-week discount"
            options={DISCOUNT_PERCENTAGES}
            placeholder="No day-of-week discount"
            value={value.dow_discount_percent}
            onChange={(v) => set("dow_discount_percent", v)}
            error={errorFor("dow_discount_percent")}
          />
          {value.dow_discount_percent ? (
            <SelectField
              id="dow_discount_day"
              label="On which day"
              options={WEEKDAYS}
              value={value.dow_discount_day}
              onChange={(v) => set("dow_discount_day", v)}
              error={errorFor("dow_discount_day")}
            />
          ) : null}
        </div>

        <CheckGroup
          label="Payment methods"
          options={PAYMENT_METHODS}
          selected={value.payment_methods}
          onChange={(v) => set("payment_methods", v)}
        />
      </Section>

      {/* ── 5 · Schedule ── */}
      <Section
        id="schedule"
        open={open}
        setOpen={setOpen}
        errors={errorCount("schedule")}
        value={value}
      >
        <Repeater
          label="Studio hours"
          noun="range"
          rows={value.studio_hours}
          max={LIMITS.scheduleRanges}
          blank={blankRange}
          onChange={(v) => set("studio_hours", v)}
          empty="No studio hours yet. Add the days and times you are open."
          hint="One row per pattern. Times are on the quarter hour."
          renderRow={(row, index, patch) => (
            <HoursRow row={row} index={index} patch={patch} label="studio" />
          )}
        />

        <Toggle
          id="mobile_hours_same"
          title="Mobile hours are the same as studio hours"
          description={
            value.mobile_hours_same ? "One schedule covers both" : "Mobile hours are set separately"
          }
          checked={value.mobile_hours_same}
          onChange={(v) => set("mobile_hours_same", v)}
        />

        {value.mobile_hours_same ? null : (
          <div className="rounded-xl border border-dashed border-brand-secondary/40 bg-brand-soft p-4">
            <Repeater
              label="Mobile / out-call hours"
              noun="range"
              rows={value.mobile_hours}
              max={LIMITS.scheduleRanges}
              blank={blankRange}
              onChange={(v) => set("mobile_hours", v)}
              empty="No separate mobile hours yet."
              renderRow={(row, index, patch) => (
                <HoursRow row={row} index={index} patch={patch} label="mobile" />
              )}
            />
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle
            id="available_now"
            title="I’m available now"
            description={
              value.available_now ? "Shown as available right now" : "No immediate availability"
            }
            checked={value.available_now}
            onChange={(v) => set("available_now", v)}
          />
          <Toggle
            id="lgbtq_affirming"
            title="My practice is LGBTQ+-affirming"
            description={value.lgbtq_affirming ? "The badge shows on your listing" : "No badge"}
            checked={value.lgbtq_affirming}
            onChange={(v) => set("lgbtq_affirming", v)}
          />
        </div>

        <div className="sm:max-w-md">
          <SelectField
            id="current_status"
            label="Current status"
            options={CURRENT_STATUSES}
            value={value.current_status}
            onChange={(v) => set("current_status", v)}
            error={errorFor("current_status")}
            format={(option) => CURRENT_STATUS_LABELS[option as never] ?? option}
            hint="Whether your listing is published at all is a separate setting, on your dashboard."
          />
        </div>
      </Section>

      {/* ── 6 · Credentials ── */}
      <Section
        id="credentials"
        open={open}
        setOpen={setOpen}
        errors={errorCount("credentials")}
        value={value}
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField
            id="career_start_month"
            label="Career start · month"
            options={MONTHS}
            placeholder="Month"
            value={value.career_start_month}
            onChange={(v) => set("career_start_month", v)}
            error={errorFor("career_start_month")}
          />
          <SelectField
            id="career_start_year"
            label="Career start · year"
            options={YEARS}
            placeholder="Year"
            value={value.career_start_year}
            onChange={(v) => set("career_start_year", v)}
            error={errorFor("career_start_year")}
          />
          <TextField
            id="years_experience"
            label="Years of experience"
            type="number"
            inputMode="numeric"
            value={value.years_experience}
            onChange={(v) => set("years_experience", v)}
            error={errorFor("years_experience")}
          />
        </div>

        <Repeater
          label="Education"
          noun="qualification"
          rows={value.education}
          max={LIMITS.education}
          blank={blankEducation}
          onChange={(v) => set("education", v)}
          empty="No training recorded yet."
          hint="Newest first reads best."
          renderRow={(row, index, patch) => (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <RowField label="Degree / certification">
                  <RowInput
                    value={row.degree}
                    maxLength={LIMITS.degree}
                    placeholder="Certified Massage Therapist"
                    aria-label={`Degree for qualification ${index + 1}`}
                    onChange={(e) => patch({ degree: e.target.value })}
                  />
                </RowField>
                <RowField label="Institution">
                  <RowInput
                    value={row.institution}
                    maxLength={LIMITS.institution}
                    aria-label={`Institution for qualification ${index + 1}`}
                    onChange={(e) => patch({ institution: e.target.value })}
                  />
                </RowField>
                <RowField label="Location">
                  <RowInput
                    value={row.location}
                    maxLength={LIMITS.educationLocation}
                    aria-label={`Location for qualification ${index + 1}`}
                    onChange={(e) => patch({ location: e.target.value })}
                  />
                </RowField>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <RowField label="Start month">
                  <RowSelect
                    options={MONTHS}
                    placeholder="Month"
                    value={row.start_month}
                    aria-label={`Start month for qualification ${index + 1}`}
                    onChange={(e) => patch({ start_month: e.target.value })}
                  />
                </RowField>
                <RowField label="Start year">
                  <RowSelect
                    options={YEARS}
                    placeholder="Year"
                    value={row.start_year}
                    aria-label={`Start year for qualification ${index + 1}`}
                    onChange={(e) => patch({ start_year: e.target.value })}
                  />
                </RowField>
                <RowField label="End month">
                  <RowSelect
                    options={MONTHS}
                    placeholder="Month"
                    value={row.end_month}
                    aria-label={`End month for qualification ${index + 1}`}
                    onChange={(e) => patch({ end_month: e.target.value })}
                  />
                </RowField>
                <RowField label="End year">
                  <RowSelect
                    options={YEARS}
                    placeholder="Year"
                    value={row.end_year}
                    aria-label={`End year for qualification ${index + 1}`}
                    onChange={(e) => patch({ end_year: e.target.value })}
                  />
                </RowField>
              </div>
              <RowErrors
                errorFor={errorFor}
                prefix={`education.${index}`}
                keys={["degree", "institution", "location", "start_year", "end_year"]}
              />
            </div>
          )}
        />

        <CheckGroup
          label="Languages"
          options={LANGUAGES}
          selected={value.languages}
          onChange={(v) => set("languages", v)}
        />
        <CheckGroup
          label="Affiliations"
          options={AFFILIATIONS}
          selected={value.affiliations}
          onChange={(v) => set("affiliations", v)}
          columns={1}
        />
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6 shadow-brand">
        <p className="text-xs text-text-secondary">
          Changes to your name, headline, bio or services queue the profile for another review. It
          stays visible while it waits.
        </p>
        <SaveButton />
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------------- */

function Section({
  id,
  open,
  setOpen,
  errors,
  value,
  children,
}: {
  id: SectionId;
  open: Record<SectionId, boolean>;
  setOpen: React.Dispatch<React.SetStateAction<Record<SectionId, boolean>>>;
  errors: number;
  value: ListingInput;
  children: React.ReactNode;
}) {
  const meta = SECTIONS.find((section) => section.id === id);
  if (!meta) return null;
  const index = SECTIONS.findIndex((section) => section.id === id) + 1;
  const isOpen = open[id];
  const complete = meta.complete(value);

  return (
    <section
      id={`section-${id}`}
      className="overflow-hidden rounded-3xl border border-border bg-card shadow-brand"
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`section-${id}-body`}
        onClick={() => setOpen((current) => ({ ...current, [id]: !current[id] }))}
        className="flex w-full items-center gap-4 p-6 text-left transition-colors hover:bg-bg-subtle"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-action-primary">
          {index}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-ds-24 font-bold tracking-tight text-ink">{meta.title}</span>
          <span className="block truncate text-xs text-text-secondary">{meta.blurb}</span>
        </span>
        <span
          className={cn(
            "hidden shrink-0 rounded-full border px-3 py-1 text-xs font-semibold sm:block",
            errors > 0
              ? "border-wine/35 bg-wine/5 text-wine"
              : complete
                ? "border-success/35 bg-success/5 text-success"
                : "border-border bg-bg-subtle text-text-secondary",
          )}
        >
          {errors > 0 ? `${errors} to fix` : complete ? "Complete" : "In progress"}
        </span>
        <span
          aria-hidden
          className={cn(
            "shrink-0 text-lg text-text-secondary transition-transform",
            isOpen && "rotate-180",
          )}
        >
          ⌄
        </span>
      </button>
      {isOpen ? (
        <div id={`section-${id}-body`} className="space-y-6 px-6 pb-8">
          {children}
        </div>
      ) : null}
    </section>
  );
}

function HoursRow({
  row,
  index,
  patch,
  label,
}: {
  row: ListingInput["studio_hours"][number];
  index: number;
  patch: (next: Partial<ListingInput["studio_hours"][number]>) => void;
  label: string;
}) {
  const at = (part: string) => `${part} for ${label} range ${index + 1}`;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <RowField label="Days">
        <RowSelect
          options={SCHEDULE_DAYS}
          value={row.days}
          aria-label={at("Days")}
          onChange={(e) => patch({ days: e.target.value })}
        />
      </RowField>
      <RowField label="Hours">
        <span className="flex flex-wrap items-center gap-1.5">
          <RowSelect
            options={CLOCK_HOURS}
            value={row.from_h}
            aria-label={at("From hour")}
            onChange={(e) => patch({ from_h: e.target.value })}
          />
          <RowSelect
            options={CLOCK_MINUTES}
            value={row.from_m}
            aria-label={at("From minutes")}
            onChange={(e) => patch({ from_m: e.target.value })}
          />
          <RowSelect
            options={MERIDIEM}
            value={row.from_ap}
            aria-label={at("From AM or PM")}
            onChange={(e) => patch({ from_ap: e.target.value })}
          />
          <span aria-hidden className="font-bold text-text-secondary">
            –
          </span>
          <RowSelect
            options={CLOCK_HOURS}
            value={row.to_h}
            aria-label={at("To hour")}
            onChange={(e) => patch({ to_h: e.target.value })}
          />
          <RowSelect
            options={CLOCK_MINUTES}
            value={row.to_m}
            aria-label={at("To minutes")}
            onChange={(e) => patch({ to_m: e.target.value })}
          />
          <RowSelect
            options={MERIDIEM}
            value={row.to_ap}
            aria-label={at("To AM or PM")}
            onChange={(e) => patch({ to_ap: e.target.value })}
          />
        </span>
      </RowField>
    </div>
  );
}

/** Errors belonging to one repeater row, which the row's controls cannot show. */
function RowErrors({
  errorFor,
  prefix,
  keys,
}: {
  errorFor: (path: string) => string | undefined;
  prefix: string;
  keys: string[];
}) {
  const message = keys.map((key) => errorFor(`${prefix}.${key}`)).find(Boolean);
  if (!message) return null;
  return (
    <p role="alert" className="text-xs font-semibold text-wine">
      {message}
    </p>
  );
}

function heightHint(inches: string): string {
  const n = Number(inches);
  if (
    inches.trim() === "" ||
    !Number.isFinite(n) ||
    n < LIMITS.heightInchesMin ||
    n > LIMITS.heightInchesMax
  ) {
    return `Between ${LIMITS.heightInchesMin} and ${LIMITS.heightInchesMax} inches.`;
  }
  return `${Math.floor(n / 12)}′ ${n % 12}″ · ${Math.round(n * 2.54)} cm`;
}

function weightHint(pounds: string): string {
  const n = Number(pounds);
  if (
    pounds.trim() === "" ||
    !Number.isFinite(n) ||
    n < LIMITS.weightPoundsMin ||
    n > LIMITS.weightPoundsMax
  ) {
    return `Between ${LIMITS.weightPoundsMin} and ${LIMITS.weightPoundsMax} pounds.`;
  }
  return `${Math.round(n * 0.45359237)} kg`;
}
