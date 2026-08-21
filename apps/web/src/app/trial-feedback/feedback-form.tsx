"use client";

import { FormEvent, useMemo, useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-secondary/50 focus:ring-2 focus:ring-ring/20";

const labelClass = "block text-sm font-medium text-text-primary";

function FieldLabel({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className={labelClass}>
      {children}
      {required ? <span className="text-brand-secondary"> *</span> : null}
    </span>
  );
}

function value(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export function TrialFeedbackForm() {
  const [contactRequested, setContactRequested] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const startedAt = useMemo(() => Date.now(), []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      first_name: value(formData, "first_name"),
      email: value(formData, "email"),
      overall_rating: value(formData, "overall_rating"),
      profile_experience: value(formData, "profile_experience"),
      most_useful: value(formData, "most_useful"),
      problems_or_missing: value(formData, "problems_or_missing"),
      seo_understanding: value(formData, "seo_understanding"),
      continue_likelihood: value(formData, "continue_likelihood"),
      improvement_request: value(formData, "improvement_request"),
      contact_requested: contactRequested,
      preferred_contact_method: value(formData, "preferred_contact_method"),
      phone: value(formData, "phone"),
      best_contact_time: value(formData, "best_contact_time"),
      additional_comments: value(formData, "additional_comments"),
      confidentiality_acknowledged: formData.get("confidentiality_acknowledged") === "yes",
      website: value(formData, "website"),
      started_at: startedAt,
    };

    try {
      const response = await fetch("/api/trial-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setMessage(body.error ?? "Your feedback could not be submitted. Please try again.");
        return;
      }

      setStatus("success");
      setMessage("Thank you. Your private feedback was submitted successfully.");
      form.reset();
      setContactRequested(false);
    } catch {
      setStatus("error");
      setMessage("Your feedback could not be submitted. Please check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-border bg-bg-subtle p-8" role="status">
        <h2 className="font-display text-ds-24 font-bold text-text-primary">Feedback received</h2>
        <p className="mt-3 text-text-secondary">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      {/* Honeypot is visually and semantically removed from normal interaction. */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <section className="grid gap-5 sm:grid-cols-2">
        <label>
          <FieldLabel required>First name</FieldLabel>
          <input className={inputClass} name="first_name" type="text" maxLength={80} required />
        </label>
        <label>
          <FieldLabel required>Email</FieldLabel>
          <input className={inputClass} name="email" type="email" maxLength={254} required />
        </label>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <label>
          <FieldLabel required>Overall trial experience</FieldLabel>
          <select className={inputClass} name="overall_rating" defaultValue="" required>
            <option value="" disabled>Select one</option>
            {['Excellent', 'Good', 'Average', 'Poor', 'Very poor'].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          <FieldLabel required>How easy was your profile experience?</FieldLabel>
          <select className={inputClass} name="profile_experience" defaultValue="" required>
            <option value="" disabled>Select one</option>
            {['Very easy', 'Easy', 'Neutral', 'Difficult', 'Very difficult'].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      </section>

      <label className="block">
        <FieldLabel required>What was most useful?</FieldLabel>
        <textarea className={inputClass} name="most_useful" rows={5} maxLength={3000} required />
      </label>

      <label className="block">
        <FieldLabel>What felt broken, confusing or missing?</FieldLabel>
        <textarea className={inputClass} name="problems_or_missing" rows={5} maxLength={3000} />
      </label>

      <section className="grid gap-5 sm:grid-cols-2">
        <label>
          <FieldLabel required>Did the SEO/city visibility features make sense?</FieldLabel>
          <select className={inputClass} name="seo_understanding" defaultValue="" required>
            <option value="" disabled>Select one</option>
            {['Yes, clearly', 'Somewhat', 'No'].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          <FieldLabel required>How likely are you to continue using MasseurMatch?</FieldLabel>
          <select className={inputClass} name="continue_likelihood" defaultValue="" required>
            <option value="" disabled>Select one</option>
            {['Very likely', 'Likely', 'Not sure', 'Unlikely', 'Very unlikely'].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      </section>

      <label className="block">
        <FieldLabel>What is the single most important improvement we should make?</FieldLabel>
        <textarea className={inputClass} name="improvement_request" rows={5} maxLength={3000} />
      </label>

      <section className="rounded-2xl border border-border bg-bg-subtle p-5">
        <label className="flex items-start gap-3 text-sm text-text-primary">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-brand-primary"
            checked={contactRequested}
            onChange={(event) => setContactRequested(event.target.checked)}
          />
          <span>I would like a private follow-up about my feedback.</span>
        </label>

        {contactRequested ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <label>
              <FieldLabel required>Contact method</FieldLabel>
              <select className={inputClass} name="preferred_contact_method" defaultValue="" required>
                <option value="" disabled>Select one</option>
                {['Text message', 'Chat', 'Phone call'].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              <FieldLabel required>Phone</FieldLabel>
              <input className={inputClass} name="phone" type="tel" maxLength={40} required />
            </label>
            <label>
              <FieldLabel required>Best time</FieldLabel>
              <input className={inputClass} name="best_contact_time" type="text" maxLength={160} required />
            </label>
          </div>
        ) : null}
      </section>

      <label className="block">
        <FieldLabel>Anything else?</FieldLabel>
        <textarea className={inputClass} name="additional_comments" rows={5} maxLength={3000} />
      </label>

      <label className="flex items-start gap-3 text-sm text-text-primary">
        <input
          type="checkbox"
          name="confidentiality_acknowledged"
          value="yes"
          required
          className="mt-1 h-4 w-4 accent-brand-primary"
        />
        <span>
          I understand this response is private internal feedback and may be used to improve
          MasseurMatch.
        </span>
      </label>

      {message ? (
        <p
          className={`rounded-xl px-4 py-3 text-sm ${
            status === "error"
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-border bg-bg-subtle text-text-secondary"
          }`}
          role="alert"
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : "Submit private feedback"}
      </button>
    </form>
  );
}
