import { redirect } from "next/navigation";
import { associateProfileAuthUser } from "@/lib/database";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
    const { data } = await supabase.auth.getUser();
    if (data.user?.email) {
      await associateProfileAuthUser(data.user.id, data.user.email);
    }
  }

  redirect("/account");
}
