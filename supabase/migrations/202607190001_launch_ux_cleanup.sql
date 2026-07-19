alter table public.properties
  add column if not exists collection_day_notes text;

update public.pricing_rules
set is_active = false
where bin_type = 'food_waste'
  and is_active = true;
