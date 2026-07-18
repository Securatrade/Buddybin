import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env, hasSupabaseBrowserEnv, hasSupabaseServiceEnv } from "@/lib/env";

export async function createSupabaseServerClient() {
  if (!hasSupabaseBrowserEnv()) {
    throw new Error("Supabase public environment variables are not configured");
  }

  const cookieStore = await cookies();

  return createServerClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components can read but not set cookies.
          }
        },
      },
    },
  );
}

export function createSupabaseServiceClient() {
  if (!hasSupabaseServiceEnv()) {
    throw new Error("Supabase service role environment variables are not configured");
  }

  return createClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
