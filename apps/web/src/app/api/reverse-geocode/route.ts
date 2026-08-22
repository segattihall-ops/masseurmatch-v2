import { getCities } from "@masseurmatch/db/actions/directory";
import { citySlug } from "@masseurmatch/db/actions/directory-config";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReversePayload = {
  address?: Record<string, string | undefined>;
};

type CityPoint = { slug: string; latitude: number; longitude: number };
const CITY_POINTS: CityPoint[] = [
  { slug: "dallas", latitude: 32.7767, longitude: -96.797 },
  { slug: "fort-worth", latitude: 32.7555, longitude: -97.3308 },
  { slug: "austin", latitude: 30.2672, longitude: -97.7431 },
  { slug: "houston", latitude: 29.7604, longitude: -95.3698 },
  { slug: "san-antonio", latitude: 29.4252, longitude: -98.4946 },
  { slug: "los-angeles", latitude: 34.0522, longitude: -118.2437 },
  { slug: "san-diego", latitude: 32.7157, longitude: -117.1611 },
  { slug: "san-francisco", latitude: 37.7749, longitude: -122.4194 },
  { slug: "west-hollywood", latitude: 34.09, longitude: -118.3617 },
  { slug: "miami", latitude: 25.7617, longitude: -80.1918 },
  { slug: "fort-lauderdale", latitude: 26.1224, longitude: -80.1373 },
  { slug: "wilton-manors", latitude: 26.1604, longitude: -80.1389 },
  { slug: "orlando", latitude: 28.5383, longitude: -81.3792 },
  { slug: "tampa", latitude: 27.9506, longitude: -82.4572 },
  { slug: "new-york", latitude: 40.7128, longitude: -74.006 },
  { slug: "brooklyn", latitude: 40.6782, longitude: -73.9442 },
  { slug: "chicago", latitude: 41.8781, longitude: -87.6298 },
  { slug: "atlanta", latitude: 33.749, longitude: -84.388 },
  { slug: "seattle", latitude: 47.6062, longitude: -122.3321 },
  { slug: "denver", latitude: 39.7392, longitude: -104.9903 },
  { slug: "phoenix", latitude: 33.4484, longitude: -112.074 },
  { slug: "las-vegas", latitude: 36.1699, longitude: -115.1398 },
  { slug: "portland", latitude: 45.5152, longitude: -122.6784 },
  { slug: "minneapolis", latitude: 44.9778, longitude: -93.265 },
  { slug: "washington-dc", latitude: 38.9072, longitude: -77.0369 },
  { slug: "boston", latitude: 42.3601, longitude: -71.0589 },
  { slug: "philadelphia", latitude: 39.9526, longitude: -75.1652 },
  { slug: "nashville", latitude: 36.1627, longitude: -86.7816 },
  { slug: "charlotte", latitude: 35.2271, longitude: -80.8431 },
  { slug: "new-orleans", latitude: 29.9511, longitude: -90.0715 },
];

function distanceMiles(lat: number, lng: number, point: CityPoint): number {
  const rad = (value: number) => (value * Math.PI) / 180;
  const dLat = rad(point.latitude - lat);
  const dLng = rad(point.longitude - lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat)) * Math.cos(rad(point.latitude)) * Math.sin(dLng / 2) ** 2;
  return 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const cities = await getCities();
  let detectedCity: string | null = null;
  let detectedStateCode: string | null = null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: { accept: "application/json", "user-agent": "MasseurMatch/2.0 reverse-geocode" },
        cache: "no-store",
      },
    );
    if (response.ok) {
      const payload = (await response.json()) as ReversePayload;
      const address = payload.address ?? {};
      detectedCity =
        address.city ??
        address.town ??
        address.village ??
        address.municipality ??
        address.county ??
        null;
      const iso = address["ISO3166-2-lvl4"];
      detectedStateCode = iso ? (iso.split("-").pop() ?? null) : null;
    }
  } catch {
    // Deterministic nearest-city fallback below keeps the feature usable.
  }

  if (detectedCity) {
    const slug = citySlug(detectedCity);
    const exact = cities.find(
      (city) =>
        city.citySlug === slug &&
        (!detectedStateCode || city.stateSlug.toLowerCase() === detectedStateCode.toLowerCase()),
    );
    if (exact) {
      return NextResponse.json({
        ok: true,
        supported: true,
        city: exact.name,
        state: exact.state,
        stateCode: exact.stateSlug,
        slug: exact.citySlug,
        distanceMiles: 0,
      });
    }
  }

  const available = CITY_POINTS.map((point) => {
    const city = cities.find((candidate) => candidate.citySlug === point.slug);
    return city ? { point, city, distance: distanceMiles(lat, lng, point) } : null;
  })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((a, b) => a.distance - b.distance);
  const nearest = available[0];

  if (!nearest) {
    return NextResponse.json({
      ok: true,
      supported: false,
      detectedCity,
      stateCode: detectedStateCode,
    });
  }

  return NextResponse.json({
    ok: true,
    supported: true,
    city: nearest.city.name,
    state: nearest.city.state,
    stateCode: nearest.city.stateSlug,
    slug: nearest.city.citySlug,
    detectedCity,
    detectedStateCode,
    distanceMiles: Number(nearest.distance.toFixed(1)),
  });
}
