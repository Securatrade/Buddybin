"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type FormState = {
  name: string;
  email: string;
  telephone: string;
  subject: string;
  message: string;
  company: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  telephone: "",
  subject: "",
  message: "",
  company: "",
};

const fieldClass =
  "mt-2 w-full rounded-2xl border border-buddy-border px-4 py-3 text-buddy-navy focus:border-buddy-blue focus:outline-none focus:ring-4 focus:ring-buddy-blue/15";

export function SupportTicketForm() {
  const [values, setValues] = useState<FormState>(initialState);
  const [ticketReference, setTicketReference] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTicketReference("");
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Support ticket could not be created.");
      }

      setValues(initialState);
      setTicketReference(payload.ticketReference || "");
    } catch (supportError) {
      setError(
        supportError instanceof Error
          ? supportError.message
          : "Support ticket could not be created.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          tabIndex={-1}
          value={values.company}
          onChange={(event) => update("company", event.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="support-name" className="font-bold text-buddy-navy">
            Name
          </label>
          <input
            id="support-name"
            className={fieldClass}
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            autoComplete="name"
            required
          />
        </div>
        <div>
          <label htmlFor="support-email" className="font-bold text-buddy-navy">
            Email address
          </label>
          <input
            id="support-email"
            className={fieldClass}
            type="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            autoComplete="email"
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="support-telephone" className="font-bold text-buddy-navy">
          Telephone number
        </label>
        <input
          id="support-telephone"
          className={fieldClass}
          value={values.telephone}
          onChange={(event) => update("telephone", event.target.value)}
          autoComplete="tel"
          required
        />
      </div>
      <div>
        <label htmlFor="support-subject" className="font-bold text-buddy-navy">
          Subject
        </label>
        <input
          id="support-subject"
          className={fieldClass}
          value={values.subject}
          onChange={(event) => update("subject", event.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="support-message" className="font-bold text-buddy-navy">
          Message
        </label>
        <textarea
          id="support-message"
          rows={6}
          className={fieldClass}
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={submitting}>
        <Send aria-hidden size={18} />
        {submitting ? "Submitting..." : "Submit support ticket"}
      </Button>
      {ticketReference ? (
        <div
          className="rounded-2xl bg-buddy-pale px-4 py-3 text-sm font-semibold text-buddy-navy"
          role="status"
        >
          <p className="font-black">Support Ticket Submitted</p>
          <p className="mt-2">
            Thank you for contacting BuddyBin. Your support ticket has been
            received. We will review it and reply by email or telephone within 24
            hours.
          </p>
          <p className="mt-2">Ticket reference: {ticketReference}</p>
        </div>
      ) : null}
      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </form>
  );
}
