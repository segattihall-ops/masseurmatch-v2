import { getCities } from "@masseurmatch/db/actions/directory";
import { citySlug } from "@masseurmatch/db/actions/directory-config";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function decode(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value).trim() || null;
  } catch {
    return value.trim() || null;
  }
}

export async function GET(request: NextRequest) {
  const detectedCity = decode(request.headers.get("x-vercel-ip-city"));
  const stateCode = decode(request.headers.get("x-vercel-ip-country-region"));
  if (!detectedCity) return NextResponse.json({ ok: true, supported: false });

  const cities = await getCities();
  const slug = citySlug(detectedCity);
  const matched = cities.find(
    (city) =>
      city.citySlug === slug &&
      (!stateCode || city.stateSlug.toLowerCase() === stateCode.toLowerCase()),
  );

  if (!matched) {
    return NextResponse.json({
      ok: true,
      supported: false,
      detectedCity,
      stateCode,
    });
  }

  return NextResponse.json({
    ok: true,
    supported: true,
    city: matched.name,
    stateCode: matched.stateSlug,
    state: matched.state,
    slug: matched.citySlug,
  });
}
