import { siteUrl } from "@/lib/env";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function createCustomerLoginLink(email: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${siteUrl()}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return data.properties?.action_link || `${siteUrl()}/login`;
}
