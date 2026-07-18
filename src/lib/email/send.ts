import { Resend } from "resend";
import { BRAND } from "@/lib/constants";
import { env, hasResendEnv } from "@/lib/env";
import { logger } from "@/lib/logger";

let resend: Resend | null = null;

function client() {
  if (!resend) {
    resend = new Resend(env("RESEND_API_KEY"));
  }

  return resend;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!hasResendEnv()) {
    logger.warn("Email not sent because RESEND_API_KEY is not configured", {
      to,
      subject,
    });
    return { skipped: true };
  }

  const from = `BuddyBin <${env("SUPPORT_EMAIL", { optional: true }) || BRAND.supportEmailFallback}>`;
  return client().emails.send({ from, to, subject, html });
}
