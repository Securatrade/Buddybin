import { requireAdmin } from "@/lib/admin/session";
import {
  getAdminCustomer,
  logAdminAudit,
  updateOperationalStatus,
} from "@/lib/database";
import { emailTemplates } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { adminStatusUpdateSchema } from "@/lib/schemas";
import { cancelStripeSubscription } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await requireAdmin();

  const parsed = adminStatusUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid status update." }, { status: 400 });
  }

  const previous = await getAdminCustomer(parsed.data.customerPlanId);

  if (
    parsed.data.operationalStatus === "cancelled" &&
    parsed.data.cancelStripe &&
    previous?.stripe_subscription_id
  ) {
    await cancelStripeSubscription(previous.stripe_subscription_id);
  }

  const updated = await updateOperationalStatus(parsed.data);
  if (updated?.profiles?.email && parsed.data.operationalStatus === "confirmed") {
    await sendEmail({
      to: updated.profiles.email,
      subject: "Your BuddyBin partner is confirmed",
      html: emailTemplates.cleanerConfirmed({
        name: updated.profiles.full_name,
      }),
    });
  }

  if (updated?.profiles?.email && parsed.data.operationalStatus === "cancelled") {
    await sendEmail({
      to: updated.profiles.email,
      subject: "Your BuddyBin service is cancelled",
      html: emailTemplates.subscriptionCancelled({
        name: updated.profiles.full_name,
      }),
    });
  }

  await logAdminAudit({
    action: "operational_status_changed",
    entityType: "customer_plan",
    entityId: parsed.data.customerPlanId,
    previousValues: previous || null,
    newValues: updated || null,
  });

  return Response.json({ ok: true });
}
