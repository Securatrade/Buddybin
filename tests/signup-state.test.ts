import { describe, expect, it } from "vitest";
import type { PlanBinInput } from "@/lib/schemas";
import { addPlanBin, removePlanBin } from "@/lib/signup-state";

const baseBin: PlanBinInput = {
  clientId: "one",
  binType: "general_waste",
  cleaningFrequencyWeeks: 4,
  collectionDay: "Tuesday",
  collectionFrequency: "weekly",
  nextCollectionDate: "",
};

describe("signup bin state", () => {
  it("labels duplicate bin types for customers", () => {
    const first = addPlanBin([], baseBin);
    const second = addPlanBin(first.bins, { ...baseBin, clientId: "two" });
    expect(second.duplicate).toBe(true);
    expect(second.bins.map((bin) => bin.displayLabel)).toEqual([
      "General waste 1",
      "General waste 2",
    ]);
  });

  it("renormalises labels after removing a bin", () => {
    const withTwo = addPlanBin(addPlanBin([], baseBin).bins, {
      ...baseBin,
      clientId: "two",
    }).bins;
    const removed = removePlanBin(withTwo, "two");
    expect(removed).toHaveLength(1);
    expect(removed[0].displayLabel).toBe("General waste");
  });
});
