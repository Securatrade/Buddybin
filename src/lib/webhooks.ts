import type Stripe from "stripe";
import {
  hasProcessedStripeEvent,
  markCheckoutCompleted,
  recordStripeEvent,
  updatePaymentStatusBySubscription,
} from "@/lib/database";
import { env, siteUrl } from "@/lib/env";
import { emailTemplates } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { logger } from "@/lib/logger";
import { createCustomerLoginLink } from "@/lib/supabase/auth-links";

export function paymentStatusForStripeSubscription(
  status: Stripe.Subscription.Status,
) {
  if (status === "active" || status === "trialing") {
    return "active";
  }

  if (status === "past_due") {
    return "past_due";
  }

  if (status === "unpaid" || status === "incomplete_expired") {
    return "unpaid";
  }

  if (status === "canceled") {
    return "cancelled";
  }

  return "pending";
}

export function shouldProcessStripeEvent(
  stripeEventId: string,
  processedEventIds: Set<string>,
) {
  if (processedEventIds.has(stripeEventId)) {
    return false;
  }

  processedEventIds.add(stripeEventId);
  return true;
}

export async function processStripeEvent(event: Stripe.Event) {
  if (await hasProcessedStripeEvent(event.id)) {
    return { idempotent: true };
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerPlanId = session.metadata?.customer_plan_id;
        if (customerPlanId) {
          const updated = await markCheckoutCompleted({
            customerPlanId,
            stripeCustomerId:
              typeof session.customer === "string" ? session.customer : null,
            stripeCheckoutSessionId: session.id,
            stripeSubscriptionId:
              typeof session.subscription === "string"
              ? session.subscription
              : null,
          });
          const profile = updated?.profiles;
          if (profile?.email) {
            let loginLink = `${siteUrl()}/login`;
            try {
              loginLink = await createCustomerLoginLink(profile.email);
            } catch (error) {
              logger.warn("Could not generate Supabase magic link", {
                message: error instanceof Error ? error.message : "Unknown error",
              });
            }
            await Promise.all([
              sendEmail({
                to: profile.email,
                subject: "Your BuddyBin signup has been received",
                html: emailTemplates.signupReceived({
                  name: profile.full_name,
                  actionUrl: loginLink,
                }),
              }),
              sendEmail({
                to: env("ADMIN_NOTIFICATION_EMAIL", { optional: true }) || env("SUPPORT_EMAIL"),
                subject: "New BuddyBin customer",
                html: emailTemplates.adminNewCustomer({
                  message: `${profile.full_name || profile.email} completed checkout.`,
                }),
              }),
            ]);
          }
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const updated = await updatePaymentStatusBySubscription({
          stripeSubscriptionId: subscription.id,
          paymentStatus: paymentStatusForStripeSubscription(subscription.status),
        });
        if (subscription.status === "canceled" && updated?.profiles?.email) {
          await sendEmail({
            to: updated.profiles.email,
            subject: "Your BuddyBin subscription is cancelled",
            html: emailTemplates.subscriptionCancelled({
              name: updated.profiles.full_name,
            }),
          });
        }
        break;
      }
      case "invoice.paid":
        logger.info("Stripe invoice paid", { eventId: event.id });
        break;
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.parent?.subscription_details?.subscription === "string"
            ? invoice.parent.subscription_details.subscription
            : null;
        if (subscriptionId) {
          const updated = await updatePaymentStatusBySubscription({
            stripeSubscriptionId: subscriptionId,
            paymentStatus: "past_due",
          });
          if (updated?.profiles?.email) {
            await Promise.all([
              sendEmail({
                to: updated.profiles.email,
                subject: "BuddyBin payment failed",
                html: emailTemplates.paymentFailed({
                  name: updated.profiles.full_name,
                }),
              }),
              sendEmail({
                to: env("ADMIN_NOTIFICATION_EMAIL", { optional: true }) || env("SUPPORT_EMAIL"),
                subject: "BuddyBin payment failed",
                html: emailTemplates.adminNewCustomer({
                  message: `Payment failed for ${updated.profiles.email}.`,
                }),
              }),
            ]);
          }
        }
        break;
      }
      default:
        logger.info("Unhandled Stripe event", { eventType: event.type });
    }

    await recordStripeEvent({
      stripeEventId: event.id,
      eventType: event.type,
      processingResult: "processed",
    });

    return { idempotent: false };
  } catch (error) {
    await recordStripeEvent({
      stripeEventId: event.id,
      eventType: event.type,
      processingResult: "failed",
    });
    throw error;
  }
}
