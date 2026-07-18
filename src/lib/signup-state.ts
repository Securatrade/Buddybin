import type { BinType } from "@/lib/constants";
import type { PlanBinInput } from "@/lib/schemas";
import { hasDuplicateBinType, normaliseDuplicateLabels } from "@/lib/pricing";

export type AddBinResult = {
  bins: PlanBinInput[];
  duplicate: boolean;
};

export function addPlanBin(
  bins: PlanBinInput[],
  bin: PlanBinInput,
): AddBinResult {
  const duplicate = hasDuplicateBinType(bins, bin.binType as BinType);
  return {
    duplicate,
    bins: normaliseDuplicateLabels([...bins, bin]),
  };
}

export function updatePlanBin(
  bins: PlanBinInput[],
  clientId: string,
  nextBin: PlanBinInput,
) {
  return normaliseDuplicateLabels(
    bins.map((bin) => (bin.clientId === clientId ? nextBin : bin)),
  );
}

export function removePlanBin(bins: PlanBinInput[], clientId: string) {
  return normaliseDuplicateLabels(
    bins.filter((bin) => bin.clientId !== clientId),
  );
}
