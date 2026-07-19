import { describe, expect, it } from "vitest";
import { DEFAULT_PRICING_RULES, calculatePlanTotal } from "@/lib/pricing";
import type { PlanBinInput } from "@/lib/schemas";

function bin(overrides: Partial<PlanBinInput> = {}): PlanBinInput {
  return {
    clientId: `bin-${Math.random()}`,
    binType: "general_waste",
    cleaningFrequencyWeeks: 4,
    collectionDay: "Tuesday",
    collectionFrequency: "weekly",
    nextCollectionDate: "",
    ...overrides,
  };
}

describe("pricing", () => {
  it("uses first-bin pricing for the first bin", () => {
    const total = calculatePlanTotal([bin()], DEFAULT_PRICING_RULES);
    expect(total.monthlyTotalPence).toBe(699);
    expect(total.bins[0].priceCategory).toBe("first_bin");
  });

  it("uses additional-bin pricing for later bins", () => {
    const total = calculatePlanTotal(
      [bin(), bin({ binType: "recycling" })],
      DEFAULT_PRICING_RULES,
    );
    expect(total.monthlyTotalPence).toBe(1098);
    expect(total.bins[1].priceCategory).toBe("additional_bin");
  });

  it("handles multiple cleaning frequencies", () => {
    const total = calculatePlanTotal(
      [
        bin({ cleaningFrequencyWeeks: 2 }),
        bin({ binType: "garden_waste", cleaningFrequencyWeeks: 8 }),
      ],
      DEFAULT_PRICING_RULES,
    );
    expect(total.monthlyTotalPence).toBe(1298);
  });

  it("recalculates on the server without trusting a submitted total", () => {
    const browserSubmittedTotal = 1;
    const total = calculatePlanTotal([bin(), bin({ binType: "garden_waste" })], DEFAULT_PRICING_RULES);
    expect(total.monthlyTotalPence).not.toBe(browserSubmittedTotal);
    expect(total.monthlyTotalPence).toBe(1098);
  });
});
