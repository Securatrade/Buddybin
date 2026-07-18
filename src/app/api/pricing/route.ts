import { getActivePricingRules } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rules = await getActivePricingRules();
    return Response.json({ rules });
  } catch {
    return Response.json(
      { error: "Pricing is temporarily unavailable." },
      { status: 503 },
    );
  }
}
