grant usage on schema public to anon, authenticated, service_role;

grant select on public.pricing_rules to anon, authenticated;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

alter default privileges in schema public grant all privileges on tables to service_role;
alter default privileges in schema public grant all privileges on sequences to service_role;
alter default privileges in schema public grant select on tables to anon, authenticated;
