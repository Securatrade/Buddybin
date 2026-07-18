# Supabase Setup

1. Create a Supabase project.
2. Copy `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` into the production environment.
3. Apply migrations in order:

```bash
supabase db push
```

Or paste the SQL from `supabase/migrations` into the Supabase SQL editor in timestamp order.

4. Confirm Row Level Security is enabled on every application table.
5. In Auth settings, enable passwordless email login.
6. Add the site URL and callback URL:

```text
https://your-domain.example
https://your-domain.example/auth/callback
```

7. After a customer uses a magic link, the callback associates the Supabase auth user with the BuddyBin profile by email.

Service-role keys are used only in server routes. Never expose them in browser code.
