import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.error("Set STRIPE_SECRET_KEY first, then run this script again.");
  process.exit(1);
}

const stripe = new Stripe(secretKey);

const bins = [
  ["general_waste", "General waste"],
  ["recycling", "Recycling"],
  ["garden_waste", "Garden waste"],
  ["food_waste", "Food waste"],
];

const prices = [
  [2, 999, 599],
  [4, 699, 399],
  [8, 449, 299],
];

const sql = [];

for (const [binType, label] of bins) {
  for (const [weeks, firstPence, additionalPence] of prices) {
    const product = await stripe.products.create({
      name: `BuddyBin ${label} - every ${weeks} weeks`,
      description:
        "Recurring BuddyBin bin-cleaning arrangement through independent local cleaning partners.",
      metadata: {
        bin_type: binType,
        cleaning_frequency_weeks: String(weeks),
      },
    });

    const first = await stripe.prices.create({
      product: product.id,
      currency: "gbp",
      unit_amount: firstPence,
      recurring: { interval: "month" },
      nickname: `${label} every ${weeks} weeks - first bin`,
      metadata: {
        price_category: "first_bin",
        bin_type: binType,
        cleaning_frequency_weeks: String(weeks),
      },
    });

    const additional = await stripe.prices.create({
      product: product.id,
      currency: "gbp",
      unit_amount: additionalPence,
      recurring: { interval: "month" },
      nickname: `${label} every ${weeks} weeks - additional bin`,
      metadata: {
        price_category: "additional_bin",
        bin_type: binType,
        cleaning_frequency_weeks: String(weeks),
      },
    });

    sql.push(`update public.pricing_rules
set stripe_product_id = '${product.id}',
    stripe_first_bin_price_id = '${first.id}',
    stripe_additional_bin_price_id = '${additional.id}'
where bin_type = '${binType}'
  and cleaning_frequency_weeks = ${weeks}
  and is_active = true;`);
  }
}

console.log("");
console.log("-- Copy everything below into Supabase SQL Editor and run it.");
console.log(sql.join("\n\n"));
