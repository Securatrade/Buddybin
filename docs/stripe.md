# Stripe Setup

1. Create Stripe Products for each active BuddyBin pricing rule or bin/frequency group.
2. Create recurring monthly GBP Prices:

```text
Every 2 weeks: first bin 999 pence, additional bin 599 pence
Every 4 weeks: first bin 699 pence, additional bin 399 pence
Every 8 weeks: first bin 449 pence, additional bin 299 pence
```

3. Update `public.pricing_rules` with:

```text
stripe_product_id
stripe_first_bin_price_id
stripe_additional_bin_price_id
```

4. Add environment variables:

```text
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
```

5. Add a webhook endpoint:

```text
https://your-domain.example/api/stripe/webhook
```

6. Subscribe to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

When prices change in admin, BuddyBin creates replacement Stripe Price objects and a new pricing-rule version. Existing subscriptions are retained on their original Stripe Price IDs.
