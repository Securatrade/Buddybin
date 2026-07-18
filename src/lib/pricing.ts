import {
  BIN_TYPE_LABELS,
  BIN_TYPES,
  type BinType,
  type CleaningFrequencyWeeks,
  type CollectionFrequency,
} from "@/lib/constants";
import type { PlanBinInput } from "@/lib/schemas";

export type PriceCategory = "first_bin" | "additional_bin";

export type PricingRule = {
  id: string;
  binType: BinType;
  cleaningFrequencyWeeks: CleaningFrequencyWeeks;
  firstBinPricePence: number;
  additionalBinPricePence: number;
  stripeProductId: string | null;
  stripeFirstBinPriceId: string | null;
  stripeAdditionalBinPriceId: string | null;
  version: number;
  effectiveFrom: string;
  isActive: boolean;
};

export type PricedPlanBin = PlanBinInput & {
  displayLabel: string;
  position: number;
  priceCategory: PriceCategory;
  monthlyPricePence: number;
  pricingRuleId: string;
  stripePriceId: string | null;
};

export type PlanCalculation = {
  currency: "GBP";
  monthlyTotalPence: number;
  pricingVersion: number;
  bins: PricedPlanBin[];
};

const defaultPriceMatrix = {
  2: { first: 999, additional: 599 },
  4: { first: 699, additional: 399 },
  8: { first: 449, additional: 299 },
} as const;

export const DEFAULT_PRICING_RULES: PricingRule[] = BIN_TYPES.flatMap((bin) =>
  ([2, 4, 8] as const).map((frequency) => ({
    id: `development-${bin.value}-${frequency}`,
    binType: bin.value,
    cleaningFrequencyWeeks: frequency,
    firstBinPricePence: defaultPriceMatrix[frequency].first,
    additionalBinPricePence: defaultPriceMatrix[frequency].additional,
    stripeProductId: null,
    stripeFirstBinPriceId: null,
    stripeAdditionalBinPriceId: null,
    version: 1,
    effectiveFrom: "2026-07-17T00:00:00.000Z",
    isActive: true,
  })),
);

export function normaliseDuplicateLabels(bins: PlanBinInput[]) {
  const totals = bins.reduce<Record<string, number>>((acc, bin) => {
    acc[bin.binType] = (acc[bin.binType] || 0) + 1;
    return acc;
  }, {});

  const seen: Record<string, number> = {};
  return bins.map((bin) => {
    seen[bin.binType] = (seen[bin.binType] || 0) + 1;
    const baseLabel = BIN_TYPE_LABELS[bin.binType];
    return {
      ...bin,
      displayLabel:
        totals[bin.binType] > 1 ? `${baseLabel} ${seen[bin.binType]}` : baseLabel,
    };
  });
}

export function findPricingRule(
  rules: PricingRule[],
  binType: BinType,
  cleaningFrequencyWeeks: CleaningFrequencyWeeks,
) {
  return rules.find(
    (rule) =>
      rule.isActive &&
      rule.binType === binType &&
      rule.cleaningFrequencyWeeks === cleaningFrequencyWeeks,
  );
}

export function calculatePlanTotal(
  bins: PlanBinInput[],
  rules: PricingRule[],
): PlanCalculation {
  const labelledBins = normaliseDuplicateLabels(bins);
  const pricingVersion = Math.max(1, ...rules.map((rule) => rule.version));

  const pricedBins = labelledBins.map((bin, index): PricedPlanBin => {
    const rule = findPricingRule(
      rules,
      bin.binType,
      bin.cleaningFrequencyWeeks,
    );

    if (!rule) {
      throw new Error(
        `Missing active pricing rule for ${bin.binType} every ${bin.cleaningFrequencyWeeks} weeks`,
      );
    }

    const priceCategory: PriceCategory =
      index === 0 ? "first_bin" : "additional_bin";
    const monthlyPricePence =
      priceCategory === "first_bin"
        ? rule.firstBinPricePence
        : rule.additionalBinPricePence;

    return {
      ...bin,
      displayLabel: bin.displayLabel || labelledBins[index].displayLabel,
      position: index + 1,
      priceCategory,
      monthlyPricePence,
      pricingRuleId: rule.id,
      stripePriceId:
        priceCategory === "first_bin"
          ? rule.stripeFirstBinPriceId
          : rule.stripeAdditionalBinPriceId,
    };
  });

  return {
    currency: "GBP",
    monthlyTotalPence: pricedBins.reduce(
      (total, bin) => total + bin.monthlyPricePence,
      0,
    ),
    pricingVersion,
    bins: pricedBins,
  };
}

export function collectionSummary(bin: {
  collectionDay: string;
  collectionFrequency: CollectionFrequency;
  nextCollectionDate?: string;
}) {
  const cadence =
    bin.collectionFrequency === "weekly" ? "weekly" : "every other";
  const next = bin.nextCollectionDate
    ? ` Next collection: ${new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(`${bin.nextCollectionDate}T00:00:00`))}`
    : "";

  return `Collected ${cadence} ${bin.collectionDay}.${next}`;
}

export function hasDuplicateBinType(bins: PlanBinInput[], binType: BinType) {
  return bins.some((bin) => bin.binType === binType);
}
