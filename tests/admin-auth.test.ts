import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";
import {
  createAdminSessionToken,
  hashAdminIdentifier,
  verifyAdminPin,
  verifyAdminSessionToken,
} from "@/lib/admin/auth";
import { checkRateLimit, resetRateLimitForTests } from "@/lib/rate-limit";

describe("admin security helpers", () => {
  it("verifies the admin PIN against a bcrypt hash", async () => {
    const hash = await bcrypt.hash("1722", 4);
    await expect(verifyAdminPin("1722", hash)).resolves.toBe(true);
    await expect(verifyAdminPin("0000", hash)).resolves.toBe(false);
  });

  it("signs and verifies admin sessions", () => {
    const secret = "a".repeat(32);
    const token = createAdminSessionToken(secret, 1000, 5000);
    expect(verifyAdminSessionToken(token, secret, 2000)).toBe(true);
    expect(verifyAdminSessionToken(token, secret, 7000)).toBe(false);
  });

  it("locks after repeated failed attempts", () => {
    resetRateLimitForTests();
    const key = hashAdminIdentifier("127.0.0.1", "secret");
    expect(checkRateLimit({ key, limit: 2, windowMs: 1000, lockMs: 1000, now: 1 }).allowed).toBe(true);
    expect(checkRateLimit({ key, limit: 2, windowMs: 1000, lockMs: 1000, now: 2 }).allowed).toBe(true);
    const locked = checkRateLimit({ key, limit: 2, windowMs: 1000, lockMs: 1000, now: 3 });
    expect(locked.allowed).toBe(false);
    expect(locked.lockedUntil).toBe(1003);
  });
});
