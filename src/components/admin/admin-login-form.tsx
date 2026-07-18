"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminLoginForm() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Invalid admin PIN.");
      }

      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Invalid admin PIN.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-[28px] border border-buddy-border bg-white p-6 shadow-sm">
      <label htmlFor="adminPin" className="font-bold text-buddy-navy">
        Admin PIN
      </label>
      <input
        id="adminPin"
        type="password"
        inputMode="numeric"
        value={pin}
        onChange={(event) => setPin(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-buddy-border px-4 py-3 focus:border-buddy-blue focus:outline-none focus:ring-4 focus:ring-buddy-blue/15"
        autoComplete="one-time-code"
      />
      <Button type="submit" className="mt-5 w-full" disabled={submitting}>
        {submitting ? "Checking..." : "Log in"}
      </Button>
      {error ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </form>
  );
}
