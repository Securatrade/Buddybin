import { describe, expect, it } from "vitest";
import { canAccessCustomerProfile, canCreateContactMessage } from "@/lib/access-control";

describe("customer access control", () => {
  it("allows customers to access only their own profile", () => {
    expect(
      canAccessCustomerProfile({
        authUserId: "auth-a",
        profileAuthUserId: "auth-a",
      }),
    ).toBe(true);
    expect(
      canAccessCustomerProfile({
        authUserId: "auth-a",
        profileAuthUserId: "auth-b",
      }),
    ).toBe(false);
  });

  it("requires contact messages to belong to the customer's plan", () => {
    expect(
      canCreateContactMessage({
        authUserId: "auth-a",
        profileAuthUserId: "auth-a",
        profileId: "profile-a",
        customerPlanProfileId: "profile-a",
      }),
    ).toBe(true);
    expect(
      canCreateContactMessage({
        authUserId: "auth-a",
        profileAuthUserId: "auth-a",
        profileId: "profile-a",
        customerPlanProfileId: "profile-b",
      }),
    ).toBe(false);
  });
});
