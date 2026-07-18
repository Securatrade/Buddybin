"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccountContactForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/account/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Message could not be sent");
      }

      setSubject("");
      setMessage("");
      setStatus("Your message has been sent.");
    } catch (contactError) {
      setError(
        contactError instanceof Error
          ? contactError.message
          : "Message could not be sent.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="subject" className="font-bold text-buddy-navy">
          Subject
        </label>
        <input
          id="subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-buddy-border px-4 py-3 focus:border-buddy-blue focus:outline-none focus:ring-4 focus:ring-buddy-blue/15"
          required
        />
      </div>
      <div>
        <label htmlFor="message" className="font-bold text-buddy-navy">
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          className="mt-2 w-full rounded-2xl border border-buddy-border px-4 py-3 focus:border-buddy-blue focus:outline-none focus:ring-4 focus:ring-buddy-blue/15"
          required
        />
      </div>
      <Button type="submit" disabled={submitting}>
        <Send aria-hidden size={18} />
        {submitting ? "Sending..." : "Send message"}
      </Button>
      {status ? (
        <p className="rounded-2xl bg-buddy-pale px-4 py-3 text-sm font-semibold text-buddy-navy">
          {status}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </form>
  );
}
