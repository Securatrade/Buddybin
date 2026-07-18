"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OPERATIONAL_STATUSES, type OperationalStatus } from "@/lib/constants";

const labels: Record<OperationalStatus, string> = {
  awaiting_cleaner: "Awaiting cleaner",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

export function StatusControls({
  customerPlanId,
  currentStatus,
}: {
  customerPlanId: string;
  currentStatus: OperationalStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OperationalStatus>(currentStatus);
  const [cancelStripe, setCancelStripe] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      status === "cancelled" &&
      cancelStripe &&
      !window.confirm("Cancel the Stripe subscription as well as the BuddyBin status?")
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerPlanId, operationalStatus: status, cancelStripe }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Status could not be updated.");
      }

      router.refresh();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Status could not be updated.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-buddy-border bg-white p-5">
      <label className="font-bold text-buddy-navy" htmlFor="operationalStatus">
        Operational status
      </label>
      <select
        id="operationalStatus"
        value={status}
        onChange={(event) => setStatus(event.target.value as OperationalStatus)}
        className="mt-2 w-full rounded-2xl border border-buddy-border px-4 py-3"
      >
        {OPERATIONAL_STATUSES.map((item) => (
          <option key={item} value={item}>
            {labels[item]}
          </option>
        ))}
      </select>
      {status === "cancelled" ? (
        <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-buddy-navy">
          <input
            type="checkbox"
            checked={cancelStripe}
            onChange={(event) => setCancelStripe(event.target.checked)}
            className="h-5 w-5"
          />
          Change status and cancel Stripe subscription
        </label>
      ) : null}
      <Button type="submit" className="mt-5" disabled={submitting}>
        {submitting ? "Saving..." : "Save status"}
      </Button>
      {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
    </form>
  );
}
