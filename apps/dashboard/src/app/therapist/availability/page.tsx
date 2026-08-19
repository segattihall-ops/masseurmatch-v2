import { createSessionClient } from "@masseurmatch/db/auth";

import { tierHours } from "@/lib/availability";

import { AvailableNowToggle, TravelScheduleForm } from "./availability-form";

type TravelEntry = { city: string; state: string; start_date: string; end_date: string };

function normalizeTravel(value: unknown): TravelEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      city: typeof item?.city === "string" ? item.city : "",
      state: typeof item?.state === "string" ? item.state : "",
      start_date: typeof item?.start_date === "string" ? item.start_date : "",
      end_date: typeof item?.end_date === "string" ? item.end_date : "",
    }))
    .filter((item) => item.city);
}

export default async function AvailabilityPage() {
  const supabase = createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, available_now, available_now_expires, travel_schedule")
    .eq("id", user.id)
    .maybeSingle();

  const expires = profile?.available_now_expires ?? null;
  // The badge can be on in the row but past its expiry — treat that as off.
  const active = Boolean(profile?.available_now) && (!expires || new Date(expires) > new Date());

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">Availability & Travel</h1>
        <p className="text-text-secondary">
          Show clients when you are free right now, and appear in other cities while traveling.
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-text-primary">Available Now</h2>
        <AvailableNowToggle
          active={active}
          expires={expires}
          hours={tierHours(profile?.subscription_tier)}
        />
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-text-primary">Travel schedule</h2>
        <TravelScheduleForm initial={normalizeTravel(profile?.travel_schedule)} />
      </div>
    </div>
  );
}
