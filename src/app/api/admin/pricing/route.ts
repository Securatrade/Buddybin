import { requireAdmin } from "@/lib/admin/session";
import { getPricingRulesForAdmin, replacePricingRule } from "@/lib/database";
import { pricingUpdateSchema } from "@/lib/schemas";
import { createReplacementStripePrices } from "@/lib/stripe";
import { parsePoundsToPence } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await requireAdmin();

  const parsed = pricingUpdateSchema.safeParse(await request.json());
  if (!parsed.success || !parsed.data.pricingRuleId) {
    return Response.json({ error: "Invalid pricing update." }, { status: 400 });
  }

  const firstBinPricePence = parsePoundsToPence(parsed.data.firstBinPrice);
  const additionalBinPricePence = parsePoundsToPence(
    parsed.data.additionalBinPrice,
  );

  if (firstBinPricePence === null || additionalBinPricePence === null) {
    return Response.json({ error: "Enter prices in pounds and pence." }, { status: 400 });
  }

  const existing = (await getPricingRulesForAdmin()).find(
    (rule) => rule.id === parsed.data.pricingRuleId,
  );

  if (!existing?.stripeProductId) {
    return Response.json(
      { error: "This pricing rule needs a Stripe Product ID before it can be replaced." },
      { status: 400 },
    );
  }

  const stripePrices = await createReplacementStripePrices({
    productId: existing.stripeProductId,
    firstBinPricePence,
    additionalBinPricePence,
  });

  const nextRule = await replacePricingRule({
    existingRuleId: parsed.data.pricingRuleId,
    firstBinPricePence,
    additionalBinPricePence,
    stripeFirstBinPriceId: stripePrices.firstBinStripePriceId,
    stripeAdditionalBinPriceId: stripePrices.additionalBinStripePriceId,
    isActive: parsed.data.isActive,
  });

  return Response.json({ ok: true, rule: nextRule });
}
