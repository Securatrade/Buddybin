export type ServerEnvKey =
  | "NEXT_PUBLIC_SITE_URL"
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "STRIPE_SECRET_KEY"
  | "STRIPE_WEBHOOK_SECRET"
  | "RESEND_API_KEY"
  | "SUPPORT_EMAIL"
  | "ADMIN_NOTIFICATION_EMAIL"
  | "ADMIN_PIN_HASH"
  | "ADMIN_SESSION_SECRET";

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export const PRODUCTION_SITE_URL = "https://buddybin.co.uk";
export const LOCAL_SITE_URL = "http://localhost:3000";

function isLocalHost(hostname: string) {
  return ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(hostname);
}

export function env(name: ServerEnvKey, options?: { optional?: boolean }) {
  const value = process.env[name];
  if (!value && !options?.optional) {
    throw new ConfigurationError(`${name} is not configured`);
  }

  return value || "";
}

export function siteUrl() {
  const fallback =
    process.env.NODE_ENV === "production" ? PRODUCTION_SITE_URL : LOCAL_SITE_URL;
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim();

  if (!configured) {
    return fallback;
  }

  try {
    const url = new URL(configured);
    if (process.env.NODE_ENV === "production" && isLocalHost(url.hostname)) {
      return PRODUCTION_SITE_URL;
    }

    return url.origin;
  } catch {
    return fallback;
  }
}

export function authCallbackUrl() {
  return `${siteUrl()}/auth/callback`;
}

export function hasSupabaseBrowserEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function hasSupabaseServiceEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function hasStripeEnv() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function hasResendEnv() {
  return Boolean(process.env.RESEND_API_KEY);
}

export function publicAnalyticsEnv() {
  return {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  };
}
