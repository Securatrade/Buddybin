import { processStripeEvent } from "@/lib/webhooks";
import { verifyStripeWebhook } from "@/lib/stripe";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  try {
    const rawBody = await request.text();
    const event = verifyStripeWebhook(rawBody, signature);
    const result = await processStripeEvent(event);
    return Response.json({ received: true, ...result });
  } catch (error) {
    logger.error("Stripe webhook failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json({ error: "Webhook failed" }, { status: 400 });
  }
}
