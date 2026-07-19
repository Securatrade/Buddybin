"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { ResponsiveImage } from "@/components/site/responsive-image";
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
  const [footerVisible, setFooterVisible] = useState(false);
  const hasBins = calculation.bins.length > 0;
  const hasAdditionalRate = calculation.bins.some(
    (bin) => bin.priceCategory === "additional_bin",
  );

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.01 },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const summary = (
    <div className="rounded-lg border border-buddy-border bg-white p-5 shadow-sm">
      {!hasBins ? (
        <ResponsiveImage
          src="/images/buddybin-booking-mobile.webp"
          alt="House, wheelie bin, calendar and tick illustration"
          width={800}
          height={800}
          sizes="(min-width: 1024px) 300px, 80vw"
          className="mb-4 aspect-square bg-buddy-pale"
        />
      ) : null}
      <h3 className="text-lg font-bold text-buddy-navy">Monthly total</h3>
      <div className="mt-4 space-y-4" aria-live="polite">
        {hasBins ? (
          <>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                Selected bins
              </p>
              <div className="mt-2 space-y-3">
                {calculation.bins.map((bin) => (
                  <div
                    key={bin.clientId}
                    className="flex items-start justify-between gap-4 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-buddy-navy">{bin.displayLabel}</p>
                      <p className="text-slate-600">Cleaned once a month</p>
                    </div>
                    <p className="font-bold text-buddy-navy">
                      {formatPence(bin.monthlyPricePence)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-buddy-border pt-4">
              <p className="text-xs font-bold uppercase text-slate-500">
                Discounts
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {hasAdditionalRate
                  ? "Additional-bin rate applied."
                  : "Add another bin to unlock the additional-bin rate."}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-600">
            Choose your bins to see your monthly price.
          </p>
        )}
      </div>
      <div className="mt-5 border-t border-buddy-border pt-5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-buddy-navy">Total</span>
          <span className="text-2xl font-black text-buddy-navy">
            {formatPence(calculation.monthlyTotalPence)}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          One monthly payment. Cancel anytime.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:sticky lg:top-24 lg:block">{summary}</aside>
      <div
        className={
          showMobile && hasBins && !footerVisible
            ? "fixed inset-x-0 bottom-0 z-30 border-t border-buddy-border bg-white p-2 shadow-2xl lg:hidden"
            : "hidden"
        }
      >
        {open ? <div className="mb-2 max-h-[65vh] overflow-y-auto">{summary}</div> : null}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-16 w-full items-center justify-between rounded-full bg-buddy-navy px-5 font-bold text-white"
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
