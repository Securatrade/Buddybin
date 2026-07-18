"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  SUPPORT_TICKET_STATUSES,
  SUPPORT_TICKET_STATUS_CONTENT,
  type SupportTicketStatus,
} from "@/lib/constants";

export function MarkMessageReadButton({ messageId }: { messageId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function markRead() {
    setSubmitting(true);
    await fetch(`/api/admin/messages/${messageId}/read`, { method: "POST" });
    router.refresh();
    setSubmitting(false);
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={markRead} disabled={submitting}>
      {submitting ? "Saving..." : "Mark read"}
    </Button>
  );
}

export function SupportTicketActions({
  messageId,
  currentStatus,
  currentNotes,
}: {
  messageId: string;
  currentStatus: SupportTicketStatus;
  currentNotes?: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<SupportTicketStatus>(currentStatus);
  const [internalNotes, setInternalNotes] = useState(currentNotes || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, internalNotes }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Ticket could not be updated.");
      }

      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Ticket could not be updated.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-w-60 space-y-3 rounded-2xl border border-buddy-border bg-buddy-pale p-4">
      <label className="block text-sm font-bold text-buddy-navy">
        Status
        <select
          className="mt-2 w-full rounded-xl border border-buddy-border bg-white px-3 py-2 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value as SupportTicketStatus)}
        >
          {SUPPORT_TICKET_STATUSES.map((value) => (
            <option key={value} value={value}>
              {SUPPORT_TICKET_STATUS_CONTENT[value].label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-bold text-buddy-navy">
        Internal notes
        <textarea
          className="mt-2 w-full rounded-xl border border-buddy-border bg-white px-3 py-2 text-sm"
          rows={4}
          value={internalNotes}
          onChange={(event) => setInternalNotes(event.target.value)}
        />
      </label>
      <Button type="button" size="sm" onClick={save} disabled={submitting}>
        {submitting ? "Saving..." : "Save ticket"}
      </Button>
      {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
