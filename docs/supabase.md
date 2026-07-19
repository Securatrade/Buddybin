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
6. Add the production site URL and callback URLs in Supabase Auth URL
   Configuration:

```text
Site URL:
https://buddybin.co.uk

Redirect URLs:
https://buddybin.co.uk/auth/callback
https://buddybin.co.uk/**

Optional, only if the www domain is supported:
https://www.buddybin.co.uk/auth/callback
https://www.buddybin.co.uk/**

Local development:
http://localhost:3000/auth/callback
```

Localhost must never be the main Supabase Site URL for production.

7. After a customer uses a magic link, the callback associates the Supabase auth user with the BuddyBin profile by email.

8. In Supabase Auth email templates, keep the confirmation URL token intact and
   use BuddyBin-facing copy:

```text
Subject:
Your secure BuddyBin login link

Heading:
Log in to BuddyBin

Body:
Tap the button below to securely log in to your BuddyBin account.

Button:
Log in to BuddyBin

Footer:
If you did not request this email, you can safely ignore it.
```

Service-role keys are used only in server routes. Never expose them in browser code.
