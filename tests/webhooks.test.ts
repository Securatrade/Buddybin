import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";
import { paymentStatusForStripeSubscription, shouldProcessStripeEvent } from "@/lib/webhooks";
import { verifyStripeWebhook } from "@/lib/stripe";

describe("Stripe webhook helpers", () => {
  it("maps Stripe subscription statuses to BuddyBin payment statuses", () => {
    expect(paymentStatusForStripeSubscription("active")).toBe("active");
    expect(paymentStatusForStripeSubscription("past_due")).toBe("past_due");
    expect(paymentStatusForStripeSubscription("unpaid")).toBe("unpaid");
    expect(paymentStatusForStripeSubscription("canceled")).toBe("cancelled");
  });

  it("verifies a signed Stripe webhook payload", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test_secret");

    const payload = JSON.stringify({
      id: "evt_test",
      object: "event",
      type: "invoice.paid",
      data: { object: { id: "in_test" } },
    });
    const signature = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: "whsec_test_secret",
    });

    expect(verifyStripeWebhook(payload, signature).id).toBe("evt_test");
    vi.unstubAllEnvs();
  });

  it("prevents duplicate webhook processing", () => {
    const processed = new Set<string>();
    expect(shouldProcessStripeEvent("evt_1", processed)).toBe(true);
    expect(shouldProcessStripeEvent("evt_1", processed)).toBe(false);
  });
});
