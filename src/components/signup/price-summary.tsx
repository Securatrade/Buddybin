"use client";

import { ChevronUp } from "lucide-react";
import { useState } from "react";
import type { PlanCalculation } from "@/lib/pricing";
import { formatPence } from "@/lib/utils";

export function PriceSummary({
  calculation,
  showMobile,
}: {
  calculation: PlanCalculation;
  showMobile: boolean;
}) {
  const [open, setOpen] = useState(false);

  const summary = (
    <div className="rounded-2xl border border-buddy-border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-buddy-navy">Your BuddyBin plan</h3>
      <div className="mt-4 space-y-3" aria-live="polite">
        {calculation.bins.length === 0 ? (
          <p className="text-sm text-slate-600">Add a bin to see your monthly price.</p>
        ) : (
          calculation.bins.map((bin) => (
            <div key={bin.clientId} className="flex items-start justify-between gap-4 text-sm">
              <div>
                <p className="font-semibold text-buddy-navy">{bin.displayLabel}</p>
                <p className="text-slate-600">Cleaned once a month</p>
              </div>
              <p className="font-bold text-buddy-navy">{formatPence(bin.monthlyPricePence)}</p>
            </div>
          ))
        )}
      </div>
      <div className="mt-5 border-t border-buddy-border pt-5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-buddy-navy">Monthly total</span>
          <span className="text-2xl font-black text-buddy-navy">
            {formatPence(calculation.monthlyTotalPence)}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          One simple monthly payment. Cancel anytime.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:sticky lg:top-28 lg:block">{summary}</aside>
      <div className={showMobile ? "fixed inset-x-0 bottom-0 z-30 border-t border-buddy-border bg-white p-3 shadow-2xl lg:hidden" : "hidden"}>
        {open ? <div className="mb-3">{summary}</div> : null}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-14 w-full items-center justify-between rounded-full bg-buddy-navy px-5 font-bold text-white"
          aria-expanded={open}
        >
          <span>Monthly total: {formatPence(calculation.monthlyTotalPence)}</span>
          <ChevronUp
            className={open ? "rotate-180 transition" : "transition"}
            aria-hidden
            size={20}
          />
        </button>
      </div>
    </>
  );
}
