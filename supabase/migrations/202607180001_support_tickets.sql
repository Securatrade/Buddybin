alter table public.contact_messages
  alter column profile_id drop not null,
  alter column customer_plan_id drop not null,
  add column if not exists ticket_reference text,
  add column if not exists name text,
  add column if not exists email citext,
  add column if not exists telephone text,
  add column if not exists status text not null default 'new'
    check (status in ('new', 'in_progress', 'awaiting_customer', 'resolved', 'closed')),
  add column if not exists source text not null default 'customer_portal'
    check (source in ('public_contact', 'customer_portal', 'admin')),
  add column if not exists internal_notes text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists resolved_at timestamptz;

create sequence if not exists public.contact_message_reference_seq start 1;

create or replace function public.next_support_ticket_reference()
returns text
language plpgsql
as $$
begin
  return 'BB-' || lpad(nextval('public.contact_message_reference_seq')::text, 6, '0');
end;
$$;

update public.contact_messages cm
set
  ticket_reference = coalesce(cm.ticket_reference, public.next_support_ticket_reference()),
  name = coalesce(cm.name, p.full_name),
  email = coalesce(cm.email, p.email),
  telephone = coalesce(cm.telephone, p.mobile),
  source = coalesce(cm.source, 'customer_portal')
from public.profiles p
where cm.profile_id = p.id
  and (
    cm.ticket_reference is null
    or cm.name is null
    or cm.email is null
    or cm.telephone is null
  );

update public.contact_messages
set ticket_reference = public.next_support_ticket_reference()
where ticket_reference is null;

alter table public.contact_messages
  alter column ticket_reference set not null,
  alter column ticket_reference set default public.next_support_ticket_reference(),
  add constraint contact_messages_ticket_reference_unique unique (ticket_reference);

create index if not exists contact_messages_status_idx
  on public.contact_messages(status, created_at desc);

create index if not exists contact_messages_reference_idx
  on public.contact_messages(ticket_reference);

create index if not exists contact_messages_email_idx
  on public.contact_messages(email);

drop trigger if exists contact_messages_updated_at on public.contact_messages;
create trigger contact_messages_updated_at
  before update on public.contact_messages
  for each row execute function public.set_updated_at();
