import { describe, expect, it } from "vitest";
import { adminStatusUpdateSchema, planBinInputSchema } from "@/lib/schemas";

const futureDate = "2099-07-28";

describe("signup validation", () => {
  it("requires a future next collection date for fortnightly collections", () => {
    const result = planBinInputSchema.safeParse({
      clientId: "bin",
      binType: "general_waste",
      cleaningFrequencyWeeks: 4,
      collectionDay: "Tuesday",
      collectionFrequency: "every_two_weeks",
      nextCollectionDate: "2020-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("allows weekly collection without a next collection date", () => {
    const result = planBinInputSchema.safeParse({
      clientId: "bin",
      binType: "general_waste",
      cleaningFrequencyWeeks: 4,
      collectionDay: "Tuesday",
      collectionFrequency: "weekly",
      nextCollectionDate: "",
    });
    expect(result.success).toBe(true);
  });

  it("allows valid fortnightly collection details", () => {
    const result = planBinInputSchema.safeParse({
      clientId: "bin",
      binType: "general_waste",
      cleaningFrequencyWeeks: 4,
      collectionDay: "Tuesday",
      collectionFrequency: "every_two_weeks",
      nextCollectionDate: futureDate,
    });
    expect(result.success).toBe(true);
  });

  it("validates operational status changes", () => {
    expect(
      adminStatusUpdateSchema.safeParse({
        customerPlanId: "00000000-0000-4000-8000-000000000000",
        operationalStatus: "confirmed",
      }).success,
    ).toBe(true);
  });
});
