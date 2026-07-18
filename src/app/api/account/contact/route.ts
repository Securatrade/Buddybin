import { headers } from "next/headers";
import { env } from "@/lib/env";
import { emailTemplates } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { getAccountSnapshot, storeContactMessage } from "@/lib/database";
import { checkRateLimit } from "@/lib/rate-limit";
import { contactMessageSchema } from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getClientIp } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limiter = checkRateLimit({
    key: `contact:${getClientIp(request)}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  if (!limiter.allowed) {
    return Response.json(
      { error: "Please wait before sending another message." },
      { status: 429 },
    );
  }

  const parsed = contactMessageSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Please check your message.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return Response.json({ error: "Your session has expired." }, { status: 401 });
  }

  const account = await getAccountSnapshot(data.user.id);
  const plans = Array.isArray(account?.customer_plans)
    ? account.customer_plans
    : account?.customer_plans
      ? [account.customer_plans]
      : [];
  const plan = plans[0];

  if (!account || !plan) {
    return Response.json({ error: "No BuddyBin account found." }, { status: 404 });
  }

  await storeContactMessage({
    profileId: account.id,
    customerPlanId: plan.id,
    message: parsed.data,
  });

  const headerStore = await headers();
  const baseMessage = `Customer: ${account.full_name} (${account.email}), profile ${account.id}, plan ${plan.id}. Subject: ${parsed.data.subject}.`;
  await Promise.all([
    sendEmail({
      to: account.email,
      subject: "We received your BuddyBin message",
      html: emailTemplates.contactAcknowledgement({ name: account.full_name }),
    }),
    sendEmail({
      to: env("ADMIN_NOTIFICATION_EMAIL", { optional: true }) || env("SUPPORT_EMAIL"),
      subject: "New BuddyBin customer message",
      html: emailTemplates.adminNewMessage({
        message: `${baseMessage} Submitted from ${headerStore.get("host") || "BuddyBin"}.`,
      }),
    }),
  ]);

  return Response.json({ ok: true });
}
