"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BIN_TYPE_LABELS } from "@/lib/constants";
import type { PricingRule } from "@/lib/pricing";
import { formatPence } from "@/lib/utils";

export function PricingEditor({ rules }: { rules: PricingRule[] }) {
  return (
    <div className="grid gap-4">
      <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
        New prices apply to new customers only. Existing subscriptions remain unchanged.
      </p>
      {rules.map((rule) => (
        <PricingRuleForm key={rule.id} rule={rule} />
      ))}
    </div>
  );
}

function PricingRuleForm({ rule }: { rule: PricingRule }) {
  const router = useRouter();
  const [firstBinPrice, setFirstBinPrice] = useState(
    (rule.firstBinPricePence / 100).toFixed(2),
  );
  const [additionalBinPrice, setAdditionalBinPrice] = useState(
    (rule.additionalBinPricePence / 100).toFixed(2),
  );
  const [isActive, setIsActive] = useState(rule.isActive);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pricingRuleId: rule.id,
          binType: rule.binType,
          cleaningFrequencyWeeks: rule.cleaningFrequencyWeeks,
          firstBinPrice,
          additionalBinPrice,
          isActive,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Pricing could not be saved.");
      }

      router.refresh();
    } catch (pricingError) {
      setError(
        pricingError instanceof Error
          ? pricingError.message
          : "Pricing could not be saved.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-buddy-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-buddy-navy">
            {BIN_TYPE_LABELS[rule.binType]} monthly
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Current: {formatPence(rule.firstBinPricePence)} first bin,{" "}
            {formatPence(rule.additionalBinPricePence)} additional bin
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Stripe Price IDs: {rule.stripeFirstBinPriceId || "missing"} /{" "}
            {rule.stripeAdditionalBinPriceId || "missing"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Version {rule.version}. Effective {new Date(rule.effectiveFrom).toLocaleDateString("en-GB")}.{" "}
            {rule.isActive ? "Active" : "Inactive"}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-bold text-buddy-navy">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-5 w-5"
          />
          Active for new signups
        </label>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="font-bold text-buddy-navy">
          First-bin monthly price
          <input
            value={firstBinPrice}
            onChange={(event) => setFirstBinPrice(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-buddy-border px-4 py-3"
          />
        </label>
        <label className="font-bold text-buddy-navy">
          Additional-bin monthly price
          <input
            value={additionalBinPrice}
            onChange={(event) => setAdditionalBinPrice(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-buddy-border px-4 py-3"
          />
        </label>
      </div>
      <Button type="submit" className="mt-5" disabled={submitting}>
        {submitting ? "Saving..." : "Save new Stripe prices"}
      </Button>
      {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
    </form>
  );
}
