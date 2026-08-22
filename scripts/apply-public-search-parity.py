from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text()
    if old not in text:
        raise RuntimeError(f"pattern not found in {path}: {old[:120]!r}")
    file.write_text(text.replace(old, new, 1))


# ---------------------------------------------------------------------------
# Public directory data: city-centroid fallback, nearby radius, old/live filters
# ---------------------------------------------------------------------------
path = "packages/db/actions/directory-config.ts"
replace_once(
    path,
    '  updated_at: string | null;\n}',
    '  updated_at: string | null;\n  latitude: number | null;\n  longitude: number | null;\n  promotions: unknown;\n  regular_discounts: unknown;\n  day_of_week_discount: unknown;\n  /** Calculated at search time from an approximate city/service-area center. */\n  distance_miles?: number | null;\n}',
)
replace_once(
    path,
    '  website: string | null;\n  latitude: number | null;\n  longitude: number | null;\n  zip_code: string | null;',
    '  website: string | null;\n  zip_code: string | null;',
)
replace_once(
    path,
    'export type DirectorySort = "recommended" | "price" | "rating";\n\nexport const DIRECTORY_SORTS: DirectorySort[] = ["recommended", "price", "rating"];',
    'export type DirectorySort =\n  | "recommended"\n  | "distance"\n  | "featured"\n  | "price"\n  | "rating"\n  | "reviews";\n\nexport const DIRECTORY_SORTS: DirectorySort[] = [\n  "recommended",\n  "distance",\n  "featured",\n  "price",\n  "rating",\n  "reviews",\n];',
)
replace_once(
    path,
    '  /** Only therapists who marked their practice LGBTQ+ affirming. */\n  lgbtq?: boolean;\n  minPrice?: number;',
    '  /** Only therapists who marked their practice LGBTQ+ affirming. */\n  lgbtq?: boolean;\n  /** Legacy/live directory parity filters. */\n  featured?: boolean;\n  offers?: boolean;\n  /** When a city is selected, include profiles in nearby supported cities. */\n  radiusMiles?: number;\n  minPrice?: number;',
)

path = "packages/db/actions/directory.ts"
replace_once(
    path,
    '  "neighborhood",\n  "avatar_url",',
    '  "neighborhood",\n  "latitude",\n  "longitude",\n  "avatar_url",',
)
replace_once(
    path,
    '  "start_year",\n  "updated_at",\n];',
    '  "start_year",\n  "updated_at",\n  "promotions",\n  "regular_discounts",\n  "day_of_week_discount",\n];',
)
replace_once(
    path,
    '  "website",\n  "latitude",\n  "longitude",\n  "zip_code",',
    '  "website",\n  "zip_code",',
)
replace_once(
    path,
    'async function fetchVisibleListings(): Promise<TherapistListing[]> {',
    '''type CoordinateCarrier = {\n  city: string | null;\n  state: string | null;\n  latitude: number | null;\n  longitude: number | null;\n};\n\ntype CityCoordinateRow = {\n  slug: string | null;\n  state: string | null;\n  state_code: string | null;\n  latitude: number | string | null;\n  longitude: number | string | null;\n};\n\nfunction coordinateNumber(value: number | string | null | undefined): number | null {\n  const parsed = Number(value);\n  return Number.isFinite(parsed) ? parsed : null;\n}\n\nfunction stateMatches(row: CityCoordinateRow, state: string | null): boolean {\n  if (!state) return true;\n  const wanted = state.toLowerCase();\n  return row.state_code?.toLowerCase() === wanted || row.state?.toLowerCase() === wanted;\n}\n\nasync function hydrateCityCoordinates<T extends CoordinateCarrier>(rows: T[]): Promise<T[]> {\n  if (rows.length === 0 || rows.every((row) => row.latitude !== null && row.longitude !== null)) {\n    return rows;\n  }\n\n  const client = createAnonClient();\n  const { data, error } = await client\n    .from("cities")\n    .select("slug,state,state_code,latitude,longitude");\n  if (error || !data) return rows;\n\n  const cities = data as unknown as CityCoordinateRow[];\n  return rows.map((row) => {\n    if (row.latitude !== null && row.longitude !== null) return row;\n    if (!row.city) return row;\n    const slug = citySlug(row.city);\n    const city = cities.find((entry) => entry.slug === slug && stateMatches(entry, row.state));\n    const latitude = coordinateNumber(city?.latitude);\n    const longitude = coordinateNumber(city?.longitude);\n    return latitude === null || longitude === null ? row : { ...row, latitude, longitude };\n  });\n}\n\nasync function fetchVisibleListings(): Promise<TherapistListing[]> {''',
)
replace_once(
    path,
    '  return rows.filter(isRoutable).sort(compareByRank);',
    '  const hydrated = await hydrateCityCoordinates(rows);\n  return hydrated.filter(isRoutable).sort(compareByRank);',
)
replace_once(
    path,
    '  const profile = rows[0];\n  if (!profile) return null;',
    '  const [profile] = await hydrateCityCoordinates(rows);\n  if (!profile) return null;',
)
replace_once(
    path,
    'function filterTherapistsInMemory(\n  source: TherapistListing[],\n  filters: DirectoryFilters,\n): TherapistListing[] {\n  let therapists = source.filter((therapist) => cityMatches(therapist, filters));',
    '''type SearchOrigin = { latitude: number; longitude: number };\n\nfunction distanceMiles(from: SearchOrigin, to: SearchOrigin): number {\n  const radians = (value: number) => (value * Math.PI) / 180;\n  const earthRadiusMiles = 3958.8;\n  const dLat = radians(to.latitude - from.latitude);\n  const dLon = radians(to.longitude - from.longitude);\n  const lat1 = radians(from.latitude);\n  const lat2 = radians(to.latitude);\n  const a =\n    Math.sin(dLat / 2) ** 2 +\n    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;\n  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));\n}\n\nfunction hasOfferValue(value: unknown): boolean {\n  if (Array.isArray(value)) return value.length > 0;\n  if (value && typeof value === "object") return Object.keys(value).length > 0;\n  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);\n}\n\nasync function searchOrigin(filters: DirectoryFilters): Promise<SearchOrigin | null> {\n  if (!filters.city) return null;\n  const client = createAnonClient();\n  const { data, error } = await client\n    .from("cities")\n    .select("slug,state,state_code,latitude,longitude")\n    .eq("slug", filters.city);\n  if (error || !data) return null;\n  const rows = data as unknown as CityCoordinateRow[];\n  const row = rows.find((entry) => stateMatches(entry, filters.state ?? null)) ?? rows[0];\n  const latitude = coordinateNumber(row?.latitude);\n  const longitude = coordinateNumber(row?.longitude);\n  return latitude === null || longitude === null ? null : { latitude, longitude };\n}\n\nfunction filterTherapistsInMemory(\n  source: TherapistListing[],\n  filters: DirectoryFilters,\n  origin: SearchOrigin | null = null,\n): TherapistListing[] {\n  let therapists: TherapistListing[];\n\n  if (filters.city && filters.radiusMiles && origin) {\n    const wantedCity = filters.city.toLowerCase();\n    therapists = source\n      .map((therapist) => {\n        const visit = travelVisit(therapist.travel_schedule, wantedCity);\n        const distance = visit\n          ? 0\n          : therapist.latitude !== null && therapist.longitude !== null\n            ? distanceMiles(origin, {\n                latitude: therapist.latitude,\n                longitude: therapist.longitude,\n              })\n            : null;\n        return {\n          ...therapist,\n          distance_miles: distance === null ? null : Number(distance.toFixed(1)),\n        };\n      })\n      .filter(\n        (therapist) =>\n          therapist.distance_miles !== null && therapist.distance_miles! <= filters.radiusMiles!,\n      );\n  } else {\n    therapists = source.filter((therapist) => cityMatches(therapist, filters));\n  }''',
)
replace_once(
    path,
    '  if (filters.lgbtq) {\n    therapists = therapists.filter((therapist) => therapist.lgbtq_affirming === true);\n  }\n\n  if (typeof filters.minPrice === "number"',
    '  if (filters.lgbtq) {\n    therapists = therapists.filter((therapist) => therapist.lgbtq_affirming === true);\n  }\n\n  if (filters.featured) {\n    therapists = therapists.filter((therapist) => therapist.is_featured === true);\n  }\n\n  if (filters.offers) {\n    therapists = therapists.filter(\n      (therapist) =>\n        hasOfferValue(therapist.promotions) ||\n        hasOfferValue(therapist.regular_discounts) ||\n        hasOfferValue(therapist.day_of_week_discount),\n    );\n  }\n\n  if (typeof filters.minPrice === "number"',
)
replace_once(
    path,
    '  if (filters.sort === "price") {',
    '''  if (filters.sort === "distance") {\n    therapists = [...therapists].sort(\n      (a, b) =>\n        (a.distance_miles ?? Number.MAX_SAFE_INTEGER) -\n          (b.distance_miles ?? Number.MAX_SAFE_INTEGER) || compareByRank(a, b),\n    );\n  } else if (filters.sort === "featured") {\n    therapists = [...therapists].sort(\n      (a, b) =>\n        Number(b.is_featured ?? false) - Number(a.is_featured ?? false) || compareByRank(a, b),\n    );\n  } else if (filters.sort === "reviews") {\n    therapists = [...therapists].sort(\n      (a, b) => (b.review_count ?? 0) - (a.review_count ?? 0) || compareByRank(a, b),\n    );\n  } else if (filters.sort === "price") {''',
)
replace_once(
    path,
    'export async function searchTherapists(filters: DirectoryFilters): Promise<TherapistListing[]> {\n  return filterTherapistsInMemory(await getVisibleTherapists(), filters);\n}',
    'export async function searchTherapists(filters: DirectoryFilters): Promise<TherapistListing[]> {\n  const [source, origin] = await Promise.all([getVisibleTherapists(), searchOrigin(filters)]);\n  return filterTherapistsInMemory(source, filters, origin);\n}',
)
replace_once(
    path,
    '  if (directoryUnavailable()) return { items: [], total: 0, page, pageSize };\n\n  const client = createAnonClient();',
    '''  if (directoryUnavailable()) return { items: [], total: 0, page, pageSize };\n\n  const enhancedSearch =\n    Boolean(filters.radiusMiles || filters.featured || filters.offers) ||\n    filters.sort === "distance" ||\n    filters.sort === "featured" ||\n    filters.sort === "reviews";\n  if (enhancedSearch) {\n    const all = await searchTherapists(filters);\n    const offset = (page - 1) * pageSize;\n    return {\n      items: all.slice(offset, offset + pageSize),\n      total: all.length,\n      page,\n      pageSize,\n    };\n  }\n\n  const client = createAnonClient();''',
)
replace_once(
    path,
    '  const all = filterTherapistsInMemory(await getVisibleTherapists(), filters);',
    '  const all = await searchTherapists(filters);',
)

# ---------------------------------------------------------------------------
# Search UI: location-first, radius + legacy/live filters and richer sorting
# ---------------------------------------------------------------------------
path = "apps/web/src/app/search/search-controls.tsx"
replace_once(
    path,
    '''const SORTS: { value: DirectorySort; label: string }[] = [\n  { value: "recommended", label: "Recommended" },\n  { value: "price", label: "Lowest price" },\n  { value: "rating", label: "Highest rated" },\n];''',
    '''const SORTS: { value: DirectorySort; label: string }[] = [\n  { value: "recommended", label: "Recommended" },\n  { value: "distance", label: "Nearest" },\n  { value: "featured", label: "Featured first" },\n  { value: "price", label: "Lowest price" },\n  { value: "rating", label: "Highest rated" },\n  { value: "reviews", label: "Most reviewed" },\n];''',
)
replace_once(
    path,
    '  max: string;\n  sort: DirectorySort;\n  available: boolean;',
    '  max: string;\n  radius: string;\n  sort: DirectorySort;\n  available: boolean;\n  featured: boolean;\n  offers: boolean;',
)
replace_once(
    path,
    '        max: values.max || undefined,\n        available: values.available,',
    '        max: values.max || undefined,\n        radius: values.radius || undefined,\n        available: values.available,\n        featured: values.featured,\n        offers: values.offers,',
)
replace_once(
    path,
    '  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);',
    '  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);\n  const autoLocateRef = useRef(false);',
)
replace_once(
    path,
    '      values.max ||\n      values.available ||',
    '      values.max ||\n      values.radius ||\n      values.available ||\n      values.featured ||\n      values.offers ||',
)
replace_once(
    path,
    '      max: String(data.get("max") ?? "").trim(),\n      sort:',
    '      max: String(data.get("max") ?? "").trim(),\n      radius: String(data.get("radius") ?? "").trim(),\n      sort:',
)
replace_once(
    path,
    '      available: data.get("available") === "1",\n      verified:',
    '      available: data.get("available") === "1",\n      featured: data.get("featured") === "1",\n      offers: data.get("offers") === "1",\n      verified:',
)
replace_once(
    path,
    '        ["max", next.max],\n        ["sort", next.sort === "recommended" ? "" : next.sort],\n        ["available", next.available ? "1" : ""],',
    '        ["max", next.max],\n        ["radius", next.radius],\n        ["sort", next.sort === "recommended" ? "" : next.sort],\n        ["available", next.available ? "1" : ""],\n        ["featured", next.featured ? "1" : ""],\n        ["offers", next.offers ? "1" : ""],',
)
old_effect = '''  useEffect(() => {\n    if (values.city || !formRef.current) return;\n    try {\n      const stored = localStorage.getItem("mm:geolocation-city");\n      if (!stored) return;\n      const select = formRef.current.elements.namedItem("city") as HTMLSelectElement | null;\n      if (!select || !Array.from(select.options).some((option) => option.value === stored)) return;\n      select.value = stored;\n      navigate(50);\n    } catch {\n      // Storage is optional.\n    }\n    // Deliberately run only on the server-provided city value.\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [values.city]);'''
new_effect = '''  useEffect(() => {\n    if (values.city || !formRef.current) return;\n\n    try {\n      const stored = localStorage.getItem("mm:geolocation-city");\n      const select = formRef.current.elements.namedItem("city") as HTMLSelectElement | null;\n      if (\n        stored &&\n        select &&\n        Array.from(select.options).some((option) => option.value === stored)\n      ) {\n        select.value = stored;\n        setLocationMessage("Using your saved nearby city.");\n        navigate(50);\n        return;\n      }\n    } catch {\n      // Storage is optional. Continue with the browser location request.\n    }\n\n    if (autoLocateRef.current) return;\n    autoLocateRef.current = true;\n    void locateUser();\n    // Location is intentionally requested whenever search opens without a city.\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [values.city]);'''
replace_once(path, old_effect, new_effect)
replace_once(
    path,
    '{locating ? "Finding your city…" : "Use my location"}',
    '{locating ? "Finding your city…" : "Find near me"}',
)
replace_once(
    path,
    '          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">',
    '          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">',
)
replace_once(
    path,
    '''            <div>\n              <label htmlFor="sort" className="mb-1.5 block text-sm font-medium text-text-primary">\n                Sort by\n              </label>''',
    '''            <div>\n              <label\n                htmlFor="radius"\n                className="mb-1.5 block text-sm font-medium text-text-primary"\n              >\n                Nearby radius\n              </label>\n              <select\n                id="radius"\n                name="radius"\n                defaultValue={values.radius}\n                className={fieldClass()}\n                onChange={() => navigate()}\n              >\n                <option value="10">10 miles</option>\n                <option value="25">25 miles</option>\n                <option value="50">50 miles</option>\n                <option value="100">100 miles</option>\n                <option value="250">250 miles</option>\n              </select>\n            </div>\n            <div>\n              <label htmlFor="sort" className="mb-1.5 block text-sm font-medium text-text-primary">\n                Sort by\n              </label>''',
)
replace_once(
    path,
    '          <fieldset className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">',
    '          <fieldset className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">',
)
replace_once(
    path,
    '              ["available", "Available now", values.available],\n              ["verified", "Verified only", values.verified],',
    '              ["available", "Available now", values.available],\n              ["featured", "Featured profiles", values.featured],\n              ["offers", "Offers & discounts", values.offers],\n              ["verified", "Verified only", values.verified],',
)

path = "apps/web/src/app/search/page.tsx"
replace_once(
    path,
    '    max?: string;\n    tier?: string;',
    '    max?: string;\n    radius?: string;\n    featured?: string;\n    offers?: string;\n    tier?: string;',
)
replace_once(
    path,
    '    "max",\n    "tier",',
    '    "max",\n    "radius",\n    "featured",\n    "offers",\n    "tier",',
)
replace_once(
    path,
    '''  const sort: DirectorySort =\n    searchParams.sort === "price" || searchParams.sort === "rating"\n      ? searchParams.sort\n      : "recommended";''',
    '''  const requestedSort = searchParams.sort;\n  const sort: DirectorySort =\n    requestedSort === "distance" ||\n    requestedSort === "featured" ||\n    requestedSort === "price" ||\n    requestedSort === "rating" ||\n    requestedSort === "reviews"\n      ? requestedSort\n      : selectedCity\n        ? "distance"\n        : "recommended";''',
)
replace_once(
    path,
    '    lgbtq: searchParams.lgbtq === "1",\n    minPrice,',
    '    lgbtq: searchParams.lgbtq === "1",\n    featured: searchParams.featured === "1",\n    offers: searchParams.offers === "1",\n    radiusMiles: selectedCity ? positiveNumber(searchParams.radius) ?? 25 : undefined,\n    minPrice,',
)
replace_once(
    path,
    '          max: typeof filters.maxPrice === "number" ? String(filters.maxPrice) : "",\n          sort,\n          available:',
    '          max: typeof filters.maxPrice === "number" ? String(filters.maxPrice) : "",\n          radius: typeof filters.radiusMiles === "number" ? String(filters.radiusMiles) : "25",\n          sort,\n          available:',
)
replace_once(
    path,
    '          verified: Boolean(filters.verified),\n          lgbtq:',
    '          featured: Boolean(filters.featured),\n          offers: Boolean(filters.offers),\n          verified: Boolean(filters.verified),\n          lgbtq:',
)

path = "apps/web/src/components/therapist-card.tsx"
replace_once(
    path,
    '          {therapist.is_verified_identity ? (\n            <span className="font-semibold text-badge-verified">ID verified</span>\n          ) : null}',
    '          {typeof therapist.distance_miles === "number" ? (\n            <span className="font-semibold text-text-primary">{therapist.distance_miles} mi away</span>\n          ) : null}\n          {therapist.is_verified_identity ? (\n            <span className="font-semibold text-badge-verified">ID verified</span>\n          ) : null}',
)

# ---------------------------------------------------------------------------
# Public profile: compact reviews, inline video, provider CTA, profile Knotty
# ---------------------------------------------------------------------------
path = "apps/web/src/components/public-profile-page.tsx"
replace_once(
    path,
    '  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);',
    '  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);\n  const [showAllReviews, setShowAllReviews] = useState(false);',
)
replace_once(path, '{reviews.map((review) => (', '{reviews.slice(0, showAllReviews ? reviews.length : 2).map((review) => (')
replace_once(
    path,
    '''            </div>\n          </Section>\n        ) : null}\n\n        <Section id="trust"''',
    '''            </div>\n            {reviews.length > 2 ? (\n              <button\n                type="button"\n                onClick={() => setShowAllReviews((current) => !current)}\n                className="mt-5 rounded-full border border-border bg-bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-bg-subtle"\n                aria-expanded={showAllReviews}\n              >\n                {showAllReviews ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}\n              </button>\n            ) : null}\n          </Section>\n        ) : null}\n\n        <Section id="trust"''',
)
replace_once(
    path,
    '''              {supplement.presentation_video_url ? (\n                <a\n                  href={safeUrl(supplement.presentation_video_url) ?? "#"}\n                  target="_blank"\n                  rel="noreferrer"\n                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-primary"\n                >\n                  Presentation video\n                </a>\n              ) : null}''',
    '''              {supplement.presentation_video_url ? (\n                <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-black">\n                  <video\n                    src={safeUrl(supplement.presentation_video_url) ?? undefined}\n                    controls\n                    playsInline\n                    preload="metadata"\n                    className="aspect-video w-full object-cover"\n                  >\n                    Your browser does not support this profile video.\n                  </video>\n                  <p className="bg-bg-surface px-4 py-3 text-xs text-text-secondary">\n                    Provider introduction · maximum 30 seconds\n                  </p>\n                </div>\n              ) : null}''',
)
replace_once(
    path,
    '''        <Section id="assistant" eyebrow="MasseurMatch AI" title="Need help comparing profiles?">\n          <KnottyChat />\n        </Section>\n\n        {relatedProfiles.length > 0 ? (\n          <Section id="related" eyebrow="More nearby" title={`More therapists in ${profile.city}`}>''',
    '''        <section className="my-10 overflow-hidden rounded-3xl bg-brand-primary px-6 py-8 text-white sm:px-8">\n          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">\n            Ready when you are\n          </p>\n          <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">\n            <div>\n              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">\n                Want to contact {firstName}?\n              </h2>\n              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">\n                Contact the provider directly to confirm availability, exact location, services and final rates.\n              </p>\n            </div>\n            <div className="flex flex-wrap gap-2">\n              {callHref ? (\n                <ContactLink href={callHref} action="call" profileId={profile.id} primary>\n                  Call {firstName}\n                </ContactLink>\n              ) : null}\n              {smsHref ? (\n                <ContactLink href={smsHref} action="text" profileId={profile.id}>\n                  Text\n                </ContactLink>\n              ) : null}\n              {waHref ? (\n                <ContactLink href={waHref} action="whatsapp" profileId={profile.id}>\n                  WhatsApp\n                </ContactLink>\n              ) : null}\n            </div>\n          </div>\n        </section>\n\n        <KnottyChat profile={{ id: profile.id, name: firstName }} floating />\n\n        {relatedProfiles.length > 0 ? (\n          <Section id="related" eyebrow="More nearby" title={`Therapists near ${profile.city}`}>''',
)

path = "apps/web/src/app/[state]/[city]/[slug]/page.tsx"
replace_once(
    path,
    '      ? searchTherapists({ city: citySlug(profile.city), state: profile.state?.toLowerCase() })',
    '      ? searchTherapists({\n          city: citySlug(profile.city),\n          state: profile.state?.toLowerCase(),\n          radiusMiles: 50,\n          sort: "distance",\n        })',
)

# ---------------------------------------------------------------------------
# Dashboard: signed 30-second Cloudinary profile-video upload
# ---------------------------------------------------------------------------
path = "apps/dashboard/src/lib/cloudinary.ts"
with Path(path).open("a") as file:
    file.write('''\n\n/** Profile intro video constraints. Server verification is authoritative. */\nexport const VIDEO_ALLOWED_FORMATS = ["mp4", "mov", "webm"] as const;\nexport const MAX_VIDEO_UPLOAD_BYTES = 80 * 1024 * 1024;\nexport const MAX_VIDEO_DURATION_SECONDS = 30;\n\nexport type VideoUploadTicket = UploadTicket;\n\nexport function createVideoUploadTicket(userId: string, nonce: string): VideoUploadTicket {\n  const cloudName = requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");\n  const apiKey = requireEnv("CLOUDINARY_API_KEY");\n  const apiSecret = requireEnv("CLOUDINARY_API_SECRET");\n  const timestamp = Math.floor(Date.now() / 1000);\n  const folder = `therapists/${userId}/video`;\n  const publicId = `${folder}/${nonce}`;\n  const allowedFormats = VIDEO_ALLOWED_FORMATS.join(",");\n  const signedParams: Record<string, string | number> = {\n    allowed_formats: allowedFormats,\n    folder,\n    max_bytes: MAX_VIDEO_UPLOAD_BYTES,\n    public_id: publicId,\n    timestamp,\n  };\n  const toSign = Object.keys(signedParams)\n    .sort()\n    .map((key) => `${key}=${signedParams[key]}`)\n    .join("&");\n  const signature = createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");\n\n  return {\n    cloudName,\n    apiKey,\n    timestamp,\n    signature,\n    folder,\n    publicId,\n    allowedFormats,\n    maxBytes: MAX_VIDEO_UPLOAD_BYTES,\n    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,\n  };\n}\n\nexport async function verifyUploadedVideoAsset(\n  userId: string,\n  publicId: string,\n): Promise<{ url: string; bytes: number; format: string; duration: number }> {\n  if (!publicId.startsWith(`therapists/${userId}/video/`)) {\n    throw new Error("That video does not belong to your profile.");\n  }\n\n  const cloudName = requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");\n  const apiKey = requireEnv("CLOUDINARY_API_KEY");\n  const apiSecret = requireEnv("CLOUDINARY_API_SECRET");\n  const response = await fetch(\n    `https://api.cloudinary.com/v1_1/${cloudName}/resources/video/upload/${encodeURIComponent(publicId)}`,\n    {\n      headers: {\n        Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,\n      },\n      cache: "no-store",\n    },\n  );\n  if (!response.ok) throw new Error("Could not verify that video with Cloudinary.");\n\n  const asset = (await response.json()) as {\n    secure_url?: string;\n    bytes?: number;\n    format?: string;\n    duration?: number;\n  };\n  const duration = Number(asset.duration ?? 0);\n  if (!asset.secure_url) throw new Error("Cloudinary returned no URL for that video.");\n  if ((asset.bytes ?? 0) > MAX_VIDEO_UPLOAD_BYTES) throw new Error("That video is too large.");\n  if (!(VIDEO_ALLOWED_FORMATS as readonly string[]).includes(asset.format ?? "")) {\n    throw new Error("That video type is not allowed.");\n  }\n  if (!Number.isFinite(duration) || duration <= 0 || duration > MAX_VIDEO_DURATION_SECONDS) {\n    throw new Error(`Profile videos must be ${MAX_VIDEO_DURATION_SECONDS} seconds or shorter.`);\n  }\n  return {\n    url: asset.secure_url,\n    bytes: asset.bytes ?? 0,\n    format: asset.format ?? "",\n    duration,\n  };\n}\n''')

Path("apps/dashboard/src/app/api/uploads/video").mkdir(parents=True, exist_ok=True)
Path("apps/dashboard/src/app/api/uploads/video/route.ts").write_text('''import { randomUUID } from "node:crypto";\n\nimport { getViewer } from "@masseurmatch/db/auth";\nimport { createServiceClient } from "@masseurmatch/db/client";\nimport { NextResponse, type NextRequest } from "next/server";\n\nimport {\n  createVideoUploadTicket,\n  verifyUploadedVideoAsset,\n} from "@/lib/cloudinary";\nimport { getOrCreateMyProfile } from "@/lib/profile";\nimport { LIMITS, rateLimit } from "@/lib/rate-limit";\n\nexport const runtime = "nodejs";\nexport const dynamic = "force-dynamic";\n\nasync function viewerProfile() {\n  const viewer = await getViewer();\n  if (!viewer) return { error: NextResponse.json({ error: "Sign in to manage your video." }, { status: 401 }) };\n  if (viewer.role !== "provider" && viewer.role !== "admin") {\n    return { error: NextResponse.json({ error: "Not authorized." }, { status: 403 }) };\n  }\n  const loaded = await getOrCreateMyProfile(viewer.user.id);\n  return { viewer, profile: loaded.profile };\n}\n\nexport async function POST() {\n  const loaded = await viewerProfile();\n  if (loaded.error || !loaded.viewer) return loaded.error!;\n  const limited = rateLimit(\n    `video:${loaded.viewer.user.id}`,\n    LIMITS.photoUpload.limit,\n    LIMITS.photoUpload.windowMs,\n  );\n  if (!limited.ok) {\n    return NextResponse.json(\n      { error: "Too many upload attempts. Please wait a moment." },\n      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },\n    );\n  }\n  try {\n    return NextResponse.json(createVideoUploadTicket(loaded.viewer.user.id, randomUUID()), {\n      headers: { "Cache-Control": "no-store" },\n    });\n  } catch {\n    return NextResponse.json({ error: "Video upload is not configured." }, { status: 503 });\n  }\n}\n\nexport async function PATCH(request: NextRequest) {\n  const loaded = await viewerProfile();\n  if (loaded.error || !loaded.viewer || !loaded.profile) return loaded.error!;\n  let body: { publicId?: string };\n  try {\n    body = (await request.json()) as { publicId?: string };\n  } catch {\n    return NextResponse.json({ error: "Invalid request." }, { status: 400 });\n  }\n  const publicId = String(body.publicId ?? "").trim();\n  if (!publicId) return NextResponse.json({ error: "Missing video id." }, { status: 400 });\n\n  try {\n    const asset = await verifyUploadedVideoAsset(loaded.viewer.user.id, publicId);\n    const { error } = await createServiceClient()\n      .from("profiles")\n      .update({ presentation_video_url: asset.url, updated_at: new Date().toISOString() })\n      .eq("id", loaded.profile.id);\n    if (error) throw error;\n    return NextResponse.json({ ok: true, url: asset.url, duration: asset.duration });\n  } catch (error) {\n    return NextResponse.json(\n      { error: error instanceof Error ? error.message : "Could not save that video." },\n      { status: 400 },\n    );\n  }\n}\n\nexport async function DELETE() {\n  const loaded = await viewerProfile();\n  if (loaded.error || !loaded.profile) return loaded.error!;\n  const { error } = await createServiceClient()\n    .from("profiles")\n    .update({ presentation_video_url: null, updated_at: new Date().toISOString() })\n    .eq("id", loaded.profile.id);\n  return error\n    ? NextResponse.json({ error: "Could not remove the video." }, { status: 500 })\n    : NextResponse.json({ ok: true });\n}\n''')

Path("apps/dashboard/src/app/profile/profile-video-uploader.tsx").write_text('''"use client";\n\nimport * as React from "react";\n\ntype Ticket = {\n  uploadUrl: string;\n  apiKey: string;\n  timestamp: number;\n  signature: string;\n  folder: string;\n  publicId: string;\n  allowedFormats: string;\n  maxBytes: number;\n  error?: string;\n};\n\nasync function videoDuration(file: File): Promise<number> {\n  return new Promise((resolve, reject) => {\n    const element = document.createElement("video");\n    const url = URL.createObjectURL(file);\n    element.preload = "metadata";\n    element.onloadedmetadata = () => {\n      const duration = element.duration;\n      URL.revokeObjectURL(url);\n      Number.isFinite(duration) ? resolve(duration) : reject(new Error("Could not read video duration."));\n    };\n    element.onerror = () => {\n      URL.revokeObjectURL(url);\n      reject(new Error("That video could not be read."));\n    };\n    element.src = url;\n  });\n}\n\nexport function ProfileVideoUploader({ initialUrl }: { initialUrl: string | null }) {\n  const [url, setUrl] = React.useState(initialUrl);\n  const [busy, setBusy] = React.useState(false);\n  const [progress, setProgress] = React.useState(0);\n  const [message, setMessage] = React.useState<string | null>(null);\n  const inputRef = React.useRef<HTMLInputElement>(null);\n\n  async function pick(event: React.ChangeEvent<HTMLInputElement>) {\n    const file = event.target.files?.[0];\n    if (!file || busy) return;\n    setMessage(null);\n    setProgress(0);\n    setBusy(true);\n    try {\n      const duration = await videoDuration(file);\n      if (duration > 30.05) throw new Error("Profile videos must be 30 seconds or shorter.");\n\n      const ticketResponse = await fetch("/api/uploads/video", { method: "POST" });\n      const ticket = (await ticketResponse.json()) as Ticket;\n      if (!ticketResponse.ok) throw new Error(ticket.error ?? "Could not start the upload.");\n      if (file.size > ticket.maxBytes) {\n        throw new Error(`That video is larger than ${Math.round(ticket.maxBytes / 1024 / 1024)} MB.`);\n      }\n\n      const form = new FormData();\n      form.append("file", file);\n      form.append("api_key", ticket.apiKey);\n      form.append("timestamp", String(ticket.timestamp));\n      form.append("signature", ticket.signature);\n      form.append("folder", ticket.folder);\n      form.append("public_id", ticket.publicId);\n      form.append("allowed_formats", ticket.allowedFormats);\n      form.append("max_bytes", String(ticket.maxBytes));\n\n      await new Promise<void>((resolve, reject) => {\n        const xhr = new XMLHttpRequest();\n        xhr.open("POST", ticket.uploadUrl);\n        xhr.upload.onprogress = (upload) => {\n          if (upload.lengthComputable) setProgress(Math.round((upload.loaded / upload.total) * 100));\n        };\n        xhr.onload = () =>\n          xhr.status >= 200 && xhr.status < 300\n            ? resolve()\n            : reject(new Error("Cloudinary rejected that video."));\n        xhr.onerror = () => reject(new Error("The upload failed. Check your connection."));\n        xhr.send(form);\n      });\n\n      const confirm = await fetch("/api/uploads/video", {\n        method: "PATCH",\n        headers: { "content-type": "application/json" },\n        body: JSON.stringify({ publicId: ticket.publicId }),\n      });\n      const result = (await confirm.json()) as { url?: string; error?: string };\n      if (!confirm.ok || !result.url) throw new Error(result.error ?? "Could not save the video.");\n      setUrl(result.url);\n      setMessage("30-second profile video saved.");\n      if (inputRef.current) inputRef.current.value = "";\n    } catch (error) {\n      setMessage(error instanceof Error ? error.message : "Could not upload that video.");\n    } finally {\n      setBusy(false);\n    }\n  }\n\n  async function remove() {\n    if (busy) return;\n    setBusy(true);\n    setMessage(null);\n    try {\n      const response = await fetch("/api/uploads/video", { method: "DELETE" });\n      const result = (await response.json()) as { error?: string };\n      if (!response.ok) throw new Error(result.error ?? "Could not remove the video.");\n      setUrl(null);\n      setMessage("Profile video removed.");\n    } catch (error) {\n      setMessage(error instanceof Error ? error.message : "Could not remove the video.");\n    } finally {\n      setBusy(false);\n    }\n  }\n\n  return (\n    <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-brand">\n      <p className="text-xs font-bold uppercase tracking-wider text-action-primary">Profile video</p>\n      <h2 className="mt-2 text-xl font-semibold text-ink">Add a 30-second introduction</h2>\n      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">\n        Upload one short MP4, MOV or WebM. The server verifies the final Cloudinary asset and rejects anything longer than 30 seconds.\n      </p>\n\n      {url ? (\n        <div className="mt-5 max-w-xl overflow-hidden rounded-2xl border border-border bg-black">\n          <video src={url} controls playsInline preload="metadata" className="aspect-video w-full object-cover" />\n        </div>\n      ) : null}\n\n      <div className="mt-5 flex flex-wrap items-center gap-3">\n        <label className="cursor-pointer rounded-xl bg-wine px-4 py-2.5 text-sm font-semibold text-white">\n          {busy ? "Uploading…" : url ? "Replace video" : "Upload video"}\n          <input\n            ref={inputRef}\n            type="file"\n            accept="video/mp4,video/quicktime,video/webm"\n            onChange={pick}\n            disabled={busy}\n            className="sr-only"\n          />\n        </label>\n        {url ? (\n          <button\n            type="button"\n            onClick={() => void remove()}\n            disabled={busy}\n            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-50"\n          >\n            Remove video\n          </button>\n        ) : null}\n        {busy ? <span className="text-sm text-ink/60">{progress}%</span> : null}\n      </div>\n      {message ? <p className="mt-3 text-sm text-ink/70" aria-live="polite">{message}</p> : null}\n    </section>\n  );\n}\n''')

path = "apps/dashboard/src/app/profile/page.tsx"
replace_once(
    path,
    'import { ListingForm } from "./listing-form";',
    'import { ListingForm } from "./listing-form";\nimport { ProfileVideoUploader } from "./profile-video-uploader";',
)
replace_once(
    path,
    '.select(LISTING_COLUMNS.join(","))',
    '.select([...LISTING_COLUMNS, "presentation_video_url"].join(","))',
)
replace_once(
    path,
    '  const initial = fromProfile((row ?? {}) as ListingRow);',
    '  const editorRow = (row ?? {}) as ListingRow & { presentation_video_url?: string | null };\n  const initial = fromProfile(editorRow);',
)
replace_once(
    path,
    '      <ListingForm initial={initial} />',
    '      <ListingForm initial={initial} />\n      <ProfileVideoUploader initialUrl={editorRow.presentation_video_url ?? null} />',
)

# ---------------------------------------------------------------------------
# Comparison discoverability: expose the two strongest competitor pages
# ---------------------------------------------------------------------------
path = "apps/web/src/components/site-nav-data.ts"
replace_once(
    path,
    '      { href: "/compare", label: "Compare" },',
    '      { href: "/compare", label: "Compare directories" },\n      { href: "/compare/masseurmatch-vs-masseurfinder", label: "vs MasseurFinder" },\n      { href: "/compare/masseurmatch-vs-rentmasseur", label: "vs RentMasseur" },',
)

print("Applied public-profile/search parity changes")
