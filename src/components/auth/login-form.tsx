"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Login failed");
      }

      setMessage(payload.message || "Check your email for a secure login link.");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Login is temporarily unavailable.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-[28px] border border-buddy-border bg-white p-6 shadow-sm">
      <label htmlFor="email" className="font-bold text-buddy-navy">
        Email address
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
        className="mt-2 w-full rounded-2xl border border-buddy-border px-4 py-3 text-buddy-navy focus:border-buddy-blue focus:outline-none focus:ring-4 focus:ring-buddy-blue/15"
      />
      <Button type="submit" className="mt-5 w-full" disabled={submitting}>
        {submitting ? "Sending link..." : "Send secure login link"}
      </Button>
      {message ? (
        <p className="mt-4 rounded-2xl bg-buddy-pale px-4 py-3 text-sm font-semibold text-buddy-navy">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </form>
  );
}
