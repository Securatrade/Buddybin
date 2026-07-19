const required = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "SUPPORT_EMAIL",
  "ADMIN_NOTIFICATION_EMAIL",
  "ADMIN_PIN_HASH",
  "ADMIN_SESSION_SECRET",
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

if ((process.env.ADMIN_SESSION_SECRET || "").length < 32) {
  console.error("ADMIN_SESSION_SECRET must be at least 32 characters.");
  process.exit(1);
}

if (process.env.NODE_ENV === "production") {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  try {
    const hostname = new URL(siteUrl).hostname;
    if (["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(hostname)) {
      console.error("NEXT_PUBLIC_SITE_URL must not point to localhost in production.");
      process.exit(1);
    }
  } catch {
    console.error("NEXT_PUBLIC_SITE_URL must be a valid absolute URL.");
    process.exit(1);
  }
}

console.log("BuddyBin environment variables look ready.");
