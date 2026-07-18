create extension if not exists pgcrypto;
create extension if not exists citext;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null check (char_length(full_name) >= 2),
  email citext not null unique,
  mobile text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  address_line_1 text not null,
  address_line_2 text,
  town text not null,
  county text,
  postcode text not null,
  bin_location text not null check (bin_location in ('Front of property', 'Side of property', 'Bin store', 'Other')),
  bin_location_other text,
  access_instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customer_plans (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  operational_status text not null default 'awaiting_cleaner'
    check (operational_status in ('awaiting_cleaner', 'confirmed', 'cancelled')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'active', 'past_due', 'unpaid', 'cancelled')),
  monthly_total_pence integer not null check (monthly_total_pence >= 0),
  currency text not null default 'GBP' check (currency = 'GBP'),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_checkout_session_id text,
  pricing_version integer not null default 1 check (pricing_version > 0),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  bin_type text not null check (bin_type in ('general_waste', 'recycling', 'garden_waste', 'food_waste')),
  cleaning_frequency_weeks integer not null check (cleaning_frequency_weeks in (2, 4, 8)),
  first_bin_price_pence integer not null check (first_bin_price_pence >= 0),
  additional_bin_price_pence integer not null check (additional_bin_price_pence >= 0),
  stripe_product_id text,
  stripe_first_bin_price_id text,
  stripe_additional_bin_price_id text,
  version integer not null default 1 check (version > 0),
  effective_from timestamptz not null default now(),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plan_bins (
  id uuid primary key default gen_random_uuid(),
  customer_plan_id uuid not null references public.customer_plans(id) on delete cascade,
  bin_type text not null check (bin_type in ('general_waste', 'recycling', 'garden_waste', 'food_waste')),
  display_label text not null,
  cleaning_frequency_weeks integer not null check (cleaning_frequency_weeks in (2, 4, 8)),
  collection_day text not null check (collection_day in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  collection_frequency text not null check (collection_frequency in ('weekly', 'every_two_weeks')),
  next_collection_date date,
  position integer not null check (position > 0),
  price_category text not null check (price_category in ('first_bin', 'additional_bin')),
  monthly_price_pence integer not null check (monthly_price_pence >= 0),
  pricing_rule_id uuid not null references public.pricing_rules(id),
  stripe_price_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fortnightly_requires_next_collection
    check (collection_frequency = 'weekly' or next_collection_date is not null)
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  customer_plan_id uuid not null references public.customer_plans(id) on delete cascade,
  subject text not null check (char_length(subject) between 3 and 120),
  message text not null check (char_length(message) between 10 and 2000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.stripe_events (
  stripe_event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now(),
  processing_result text not null
);

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  previous_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);

create table public.admin_login_attempts (
  id uuid primary key default gen_random_uuid(),
  hashed_ip_or_identifier text not null,
  successful boolean not null,
  created_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles(email);
create index profiles_auth_user_id_idx on public.profiles(auth_user_id);
create index properties_profile_id_idx on public.properties(profile_id);
create index properties_postcode_idx on public.properties(postcode);
create index customer_plans_profile_id_idx on public.customer_plans(profile_id);
create index customer_plans_status_idx on public.customer_plans(operational_status, payment_status);
create index customer_plans_stripe_subscription_idx on public.customer_plans(stripe_subscription_id);
create index plan_bins_customer_plan_id_idx on public.plan_bins(customer_plan_id);
create index pricing_rules_lookup_idx on public.pricing_rules(bin_type, cleaning_frequency_weeks, is_active);
create unique index pricing_rules_active_unique_idx
  on public.pricing_rules(bin_type, cleaning_frequency_weeks)
  where is_active;
create index contact_messages_profile_id_idx on public.contact_messages(profile_id);
create index contact_messages_plan_id_idx on public.contact_messages(customer_plan_id);
create index contact_messages_read_idx on public.contact_messages(is_read, created_at desc);
create index admin_login_attempts_identifier_idx on public.admin_login_attempts(hashed_ip_or_identifier, created_at desc);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger properties_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();
create trigger customer_plans_updated_at
  before update on public.customer_plans
  for each row execute function public.set_updated_at();
create trigger plan_bins_updated_at
  before update on public.plan_bins
  for each row execute function public.set_updated_at();
create trigger pricing_rules_updated_at
  before update on public.pricing_rules
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.customer_plans enable row level security;
alter table public.plan_bins enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.contact_messages enable row level security;
alter table public.stripe_events enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.admin_login_attempts enable row level security;

create policy "Customers can read own profile"
  on public.profiles for select
  using (auth.uid() = auth_user_id);

create policy "Customers can update own profile basics"
  on public.profiles for update
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

create policy "Customers can read own properties"
  on public.properties for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = properties.profile_id and p.auth_user_id = auth.uid()
    )
  );

create policy "Customers can read own plans"
  on public.customer_plans for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = customer_plans.profile_id and p.auth_user_id = auth.uid()
    )
  );

create policy "Customers can read own plan bins"
  on public.plan_bins for select
  using (
    exists (
      select 1
      from public.customer_plans cp
      join public.profiles p on p.id = cp.profile_id
      where cp.id = plan_bins.customer_plan_id
      and p.auth_user_id = auth.uid()
    )
  );

create policy "Active pricing is readable"
  on public.pricing_rules for select
  using (is_active = true);

create policy "Customers can read own contact messages"
  on public.contact_messages for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = contact_messages.profile_id and p.auth_user_id = auth.uid()
    )
  );

create policy "Customers can create own contact messages"
  on public.contact_messages for insert
  with check (
    exists (
      select 1
      from public.customer_plans cp
      join public.profiles p on p.id = cp.profile_id
      where cp.id = contact_messages.customer_plan_id
      and cp.profile_id = contact_messages.profile_id
      and p.auth_user_id = auth.uid()
    )
  );
