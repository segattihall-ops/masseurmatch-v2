import { afterEach, describe, expect, it, vi } from "vitest";

import { publicProfileUrl, publicSiteUrl } from "../src/lib/public-site";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("publicSiteUrl", () => {
  it("uses an explicitly configured public-site origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://public.example.com/");
    vi.stubEnv("NODE_ENV", "production");

    expect(publicSiteUrl()).toBe("https://public.example.com");
  });

  it("does not use the dashboard's Vercel production hostname as the public origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "masseur-dashboard.vercel.app");

    expect(publicSiteUrl()).toBe("https://www.masseurmatch.com");
  });

  it("uses the local web app during local development", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("NODE_ENV", "development");

    expect(publicSiteUrl()).toBe("http://localhost:3000");
  });
});

describe("publicProfileUrl", () => {
  it("uses the stable therapist URL that works before and after v2 cutover", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.masseurmatch.com");

    expect(publicProfileUrl({ slug: "reggie-3ef08824" })).toBe(
      "https://www.masseurmatch.com/therapists/reggie-3ef08824",
    );
  });

  it("returns null when no usable slug exists", () => {
    expect(publicProfileUrl({ slug: null })).toBeNull();
    expect(publicProfileUrl({ slug: "   " })).toBeNull();
  });
});
