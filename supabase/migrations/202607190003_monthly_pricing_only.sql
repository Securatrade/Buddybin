delete from public.pricing_rules as pricing_rule
where pricing_rule.cleaning_frequency_weeks <> 4
  and not exists (
    select 1
    from public.plan_bins as plan_bin
    where plan_bin.pricing_rule_id = pricing_rule.id
  );

update public.pricing_rules
set is_active = false
where cleaning_frequency_weeks <> 4;
