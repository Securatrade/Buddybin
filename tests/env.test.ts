import { afterEach, describe, expect, it, vi } from "vitest";
import { authCallbackUrl, siteUrl } from "@/lib/env";

describe("site URL configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses BuddyBin as the production fallback", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("SITE_URL", "");

    expect(siteUrl()).toBe("https://buddybin.co.uk");
    expect(authCallbackUrl()).toBe("https://buddybin.co.uk/auth/callback");
  });

  it("does not allow localhost as the production site URL", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");

    expect(siteUrl()).toBe("https://buddybin.co.uk");
  });

  it("keeps localhost available for local development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("SITE_URL", "");

    expect(siteUrl()).toBe("http://localhost:3000");
  });
});
