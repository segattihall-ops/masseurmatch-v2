"use client";

import {
  DIRECTORY_OBJECTIVES,
  DIRECTORY_TIERS,
  type CityListing,
  type DirectoryObjectiveId,
  type DirectorySort,
  type DirectoryTier,
} from "@masseurmatch/db/actions/directory-config";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const SORTS: { value: DirectorySort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price", label: "Lowest price" },
  { value: "rating", label: "Highest rated" },
];

const TIER_LABELS: Record<DirectoryTier, string> = {
  free: "Access",
  standard: "Active",
  pro: "Pro",
  elite: "Elite",
};

type SearchValues = {
  q: string;
  city: string;
  service: string;
  goal: DirectoryObjectiveId | "";
  session: "incall" | "outcall" | "";
  tier: DirectoryTier | "";
  min: string;
  max: string;
  sort: DirectorySort;
  available: boolean;
  verified: boolean;
  lgbtq: boolean;
  master: boolean;
};

function fieldClass() {
  return "h-12 w-full rounded-xl border border-border/90 bg-bg-surface px-4 text-sm text-text-primary outline-none transition focus:border-brand-secondary/40 focus:ring-2 focus:ring-ring/25";
}

function sendSearchAnalytics(values: SearchValues) {
  const payload = JSON.stringify({
    type: "search",
    data: {
      query: values.q || values.service || values.goal || "directory browse",
      city: values.city || undefined,
      filters: {
        service: values.service || undefined,
        goal: values.goal || undefined,
        session: values.session || undefined,
        tier: values.tier || undefined,
        min: values.min || undefined,
        max: values.max || undefined,
        available: values.available,
        verified: values.verified,
        lgbtq: values.lgbtq,
        master: values.master,
        sort: values.sort,
      },
    },
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/legacy", new Blob([payload], { type: "application/json" }));
      return;
    }
    void fetch("/api/analytics/legacy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    });
  } catch {
    // Analytics must never block discovery.
  }
}

export function SearchControls({
  cities,
  services,
  values,
  resultCount,
}: {
  cities: CityListing[];
  services: string[];
  values: SearchValues;
  resultCount: number;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(
    Boolean(
      values.goal ||
        values.session ||
        values.tier ||
        values.min ||
        values.max ||
        values.available ||
        values.verified ||
        values.lgbtq ||
        values.master,
    ),
  );
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  function currentValues(): SearchValues {
    const form = formRef.current;
    if (!form) return values;
    const data = new FormData(form);
    return {
      q: String(data.get("q") ?? "").trim(),
      city: String(data.get("city") ?? "").trim(),
      service: String(data.get("service") ?? "").trim(),
      goal: String(data.get("goal") ?? "") as SearchValues["goal"],
      session: String(data.get("session") ?? "") as SearchValues["session"],
      tier: String(data.get("tier") ?? "") as SearchValues["tier"],
      min: String(data.get("min") ?? "").trim(),
      max: String(data.get("max") ?? "").trim(),
      sort: (String(data.get("sort") ?? "recommended") || "recommended") as DirectorySort,
      available: data.get("available") === "1",
      verified: data.get("verified") === "1",
      lgbtq: data.get("lgbtq") === "1",
      master: data.get("master") === "1",
    };
  }

  function navigate(delay = 0) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const next = currentValues();
      const params = new URLSearchParams();
      const entries: Array<[string, string]> = [
        ["q", next.q],
        ["city", next.city],
        ["service", next.service],
        ["goal", next.goal],
        ["session", next.session],
        ["tier", next.tier],
        ["min", next.min],
        ["max", next.max],
        ["sort", next.sort === "recommended" ? "" : next.sort],
        ["available", next.available ? "1" : ""],
        ["verified", next.verified ? "1" : ""],
        ["lgbtq", next.lgbtq ? "1" : ""],
        ["master", next.master ? "1" : ""],
      ];
      for (const [key, value] of entries) if (value) params.set(key, value);
      sendSearchAnalytics(next);
      startTransition(() => {
        router.replace(params.size ? `/search?${params.toString()}` : "/search", { scroll: false });
      });
    }, delay);
  }

  async function useApproximateLocation() {
    try {
      const response = await fetch("/api/location", { cache: "no-store" });
      const data = (await response.json()) as {
        city?: string | null;
        stateCode?: string | null;
        slug?: string | null;
      };
      if (!data.slug || !data.stateCode || !formRef.current) return false;
      const select = formRef.current.elements.namedItem("city") as HTMLSelectElement | null;
      if (!select) return false;
      select.value = `${data.stateCode.toLowerCase()}/${data.slug}`;
      localStorage.setItem("mm:geolocation-city", select.value);
      setLocationMessage(`Using ${data.city ?? data.slug} as your approximate city.`);
      navigate();
      return true;
    } catch {
      return false;
    }
  }

  async function useMyLocation() {
    if (locating) return;
    setLocating(true);
    setLocationMessage(null);

    if (!navigator.geolocation) {
      const resolved = await useApproximateLocation();
      if (!resolved) setLocationMessage("Location is not available in this browser. Choose a city instead.");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `/api/reverse-geocode?lat=${position.coords.latitude}&lng=${position.coords.longitude}`,
            { cache: "no-store" },
          );
          const data = (await response.json()) as {
            city?: string | null;
            stateCode?: string | null;
            slug?: string | null;
          };
          if (!data.slug || !data.stateCode || !formRef.current) {
            setLocationMessage("We found your location, but not a supported nearby city yet.");
            return;
          }
          const select = formRef.current.elements.namedItem("city") as HTMLSelectElement | null;
          if (!select) return;
          select.value = `${data.stateCode.toLowerCase()}/${data.slug}`;
          localStorage.setItem("mm:geolocation-city", select.value);
          setLocationMessage(`Location set to ${data.city ?? data.slug}.`);
          navigate();
        } catch {
          const resolved = await useApproximateLocation();
          if (!resolved) setLocationMessage("We could not resolve your city. Choose one from the list.");
        } finally {
          setLocating(false);
        }
      },
      async (error) => {
        const resolved = await useApproximateLocation();
        if (!resolved) {
          setLocationMessage(
            error.code === error.PERMISSION_DENIED
              ? "Location permission was denied. Choose a city from the list."
              : "We could not get your location. Choose a city from the list.",
          );
        }
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
    );
  }

  useEffect(() => {
    if (values.city || !formRef.current) return;
    try {
      const stored = localStorage.getItem("mm:geolocation-city");
      if (!stored) return;
      const select = formRef.current.elements.namedItem("city") as HTMLSelectElement | null;
      if (!select || !Array.from(select.options).some((option) => option.value === stored)) return;
      select.value = stored;
      navigate(50);
    } catch {
      // Storage is optional.
    }
    // Deliberately run only on the server-provided city value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.city]);

  return (
    <form
      ref={formRef}
      method="get"
      onSubmit={(event) => {
        event.preventDefault();
        navigate();
      }}
      className="mt-8 rounded-3xl border border-border bg-bg-surface p-4 shadow-ds-sm sm:p-6"
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:items-end">
        <div>
          <label htmlFor="q" className="mb-1.5 block text-sm font-semibold text-text-primary">
            Search
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={values.q}
            placeholder="Name, technique, neighborhood, body type, height or weight"
            className={fieldClass()}
            onInput={() => navigate(220)}
          />
        </div>

        <div>
          <label htmlFor="city" className="mb-1.5 block text-sm font-semibold text-text-primary">
            City
          </label>
          <select id="city" name="city" defaultValue={values.city} className={fieldClass()} onChange={() => navigate()}>
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={`${city.stateSlug}/${city.citySlug}`} value={`${city.stateSlug}/${city.citySlug}`}>
                {city.name}, {city.state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="service" className="mb-1.5 block text-sm font-semibold text-text-primary">
            Service or technique
          </label>
          <select id="service" name="service" defaultValue={values.service} className={fieldClass()} onChange={() => navigate()}>
            <option value="">All services</option>
            {services.map((service) => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="h-12 rounded-xl border border-border bg-bg-subtle px-5 text-sm font-semibold text-text-primary transition hover:bg-brand-soft"
          aria-expanded={expanded}
        >
          {expanded ? "Fewer filters" : "More filters"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void useMyLocation()}
          disabled={locating}
          className="rounded-full border border-border bg-bg-subtle px-4 py-2 text-xs font-semibold text-text-primary transition hover:bg-brand-soft disabled:opacity-50"
        >
          {locating ? "Finding your city…" : "Use my location"}
        </button>
        <span className="text-xs text-text-secondary" aria-live="polite">
          {locationMessage ?? `${resultCount} ${resultCount === 1 ? "profile" : "profiles"} match these filters`}
        </span>
        {isPending ? <span className="text-xs font-semibold text-brand-secondary">Updating…</span> : null}
      </div>

      {expanded ? (
        <div className="mt-6 border-t border-border pt-6">
          <fieldset>
            <legend className="text-sm font-semibold text-text-primary">What are you looking for?</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <input className="peer sr-only" type="radio" name="goal" value="" defaultChecked={!values.goal} onChange={() => navigate()} />
                <span className="inline-flex rounded-full border border-border px-4 py-2 text-sm text-text-secondary peer-checked:border-brand-secondary peer-checked:bg-brand-soft peer-checked:text-brand-secondary">All</span>
              </label>
              {DIRECTORY_OBJECTIVES.map((objective) => (
                <label key={objective.id} className="cursor-pointer">
                  <input className="peer sr-only" type="radio" name="goal" value={objective.id} defaultChecked={values.goal === objective.id} onChange={() => navigate()} />
                  <span className="inline-flex rounded-full border border-border px-4 py-2 text-sm text-text-secondary peer-checked:border-brand-secondary peer-checked:bg-brand-soft peer-checked:text-brand-secondary">{objective.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label htmlFor="session" className="mb-1.5 block text-sm font-medium text-text-primary">Session</label>
              <select id="session" name="session" defaultValue={values.session} className={fieldClass()} onChange={() => navigate()}>
                <option value="">Any format</option>
                <option value="incall">Studio / incall</option>
                <option value="outcall">Outcall / home visit</option>
              </select>
            </div>
            <div>
              <label htmlFor="tier" className="mb-1.5 block text-sm font-medium text-text-primary">Profile tier</label>
              <select id="tier" name="tier" defaultValue={values.tier} className={fieldClass()} onChange={() => navigate()}>
                <option value="">All tiers</option>
                {DIRECTORY_TIERS.map((tier) => <option key={tier} value={tier}>{TIER_LABELS[tier]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="min" className="mb-1.5 block text-sm font-medium text-text-primary">Minimum rate</label>
              <input id="min" name="min" type="number" min={0} step={10} defaultValue={values.min} placeholder="Any" className={fieldClass()} onInput={() => navigate(300)} />
            </div>
            <div>
              <label htmlFor="max" className="mb-1.5 block text-sm font-medium text-text-primary">Maximum rate</label>
              <input id="max" name="max" type="number" min={0} step={10} defaultValue={values.max} placeholder="Any" className={fieldClass()} onInput={() => navigate(300)} />
            </div>
            <div>
              <label htmlFor="sort" className="mb-1.5 block text-sm font-medium text-text-primary">Sort by</label>
              <select id="sort" name="sort" defaultValue={values.sort} className={fieldClass()} onChange={() => navigate()}>
                {SORTS.map((sort) => <option key={sort.value} value={sort.value}>{sort.label}</option>)}
              </select>
            </div>
          </div>

          <fieldset className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <legend className="sr-only">Trust and availability filters</legend>
            {[
              ["available", "Available now", values.available],
              ["verified", "Verified only", values.verified],
              ["lgbtq", "LGBTQ+ affirming", values.lgbtq],
              ["master", "10+ years experience", values.master],
            ].map(([name, label, checked]) => (
              <label key={String(name)} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-bg-subtle px-4 py-3 text-sm font-medium text-text-primary">
                <input
                  type="checkbox"
                  name={String(name)}
                  value="1"
                  defaultChecked={Boolean(checked)}
                  onChange={() => navigate()}
                  className="h-4 w-4 accent-brand-primary"
                />
                {String(label)}
              </label>
            ))}
          </fieldset>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="submit" className="rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
          Apply filters
        </button>
        <button
          type="button"
          onClick={() => router.push("/search")}
          className="rounded-full border border-border bg-bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-bg-subtle"
        >
          Clear all
        </button>
      </div>
    </form>
  );
}
