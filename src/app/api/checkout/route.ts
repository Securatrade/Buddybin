import { calculatePlanTotal } from "@/lib/pricing";
import { createPendingSignup, getActivePricingRules } from "@/lib/database";
import { signupSchema } from "@/lib/schemas";
import { createCheckoutSession } from "@/lib/stripe";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Please check the form details.", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const rules = await getActivePricingRules();
    const calculation = calculatePlanTotal(parsed.data.bins, rules);
    const pending = await createPendingSignup(parsed.data, calculation);
    const session = await createCheckoutSession({
      calculation,
      profileId: pending.profileId,
      propertyId: pending.propertyId,
      customerPlanId: pending.customerPlanId,
      email: pending.email,
      fullName: pending.fullName,
      existingStripeCustomerId: pending.stripeCustomerId,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    logger.error("Checkout creation failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return Response.json(
      {
        error:
          "We could not start Stripe Checkout. Please try again in a moment.",
      },
      { status: 503 },
    );
  }
}
