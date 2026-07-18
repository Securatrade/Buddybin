insert into public.pricing_rules (
  bin_type,
  cleaning_frequency_weeks,
  first_bin_price_pence,
  additional_bin_price_pence,
  version,
  effective_from,
  is_active
)
select bin_type, cleaning_frequency_weeks, first_bin_price_pence, additional_bin_price_pence, 1, '2026-07-17T00:00:00Z', true
from (
  values
    ('general_waste', 2, 999, 599),
    ('general_waste', 4, 699, 399),
    ('general_waste', 8, 449, 299),
    ('recycling', 2, 999, 599),
    ('recycling', 4, 699, 399),
    ('recycling', 8, 449, 299),
    ('garden_waste', 2, 999, 599),
    ('garden_waste', 4, 699, 399),
    ('garden_waste', 8, 449, 299),
    ('food_waste', 2, 999, 599),
    ('food_waste', 4, 699, 399),
    ('food_waste', 8, 449, 299)
) as seed(bin_type, cleaning_frequency_weeks, first_bin_price_pence, additional_bin_price_pence)
on conflict do nothing;
