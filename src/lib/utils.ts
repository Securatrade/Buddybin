import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPence(amountPence: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amountPence / 100);
}

export function parsePoundsToPence(value: string) {
  const normalised = value.replace(/[£,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(normalised)) {
    return null;
  }

  const [pounds, pennies = ""] = normalised.split(".");
  return Number(pounds) * 100 + Number(pennies.padEnd(2, "0"));
}

export function todayInputValue(now = new Date()) {
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
}

export function compactAddress(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(", ");
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}
