import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { associateProfileAuthUser } from "@/lib/database";
import { siteUrl } from "@/lib/env";
import { logger } from "@/lib/logger";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const emailOtpTypes = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function redirectTo(path: string) {
  return NextResponse.redirect(new URL(path, siteUrl()));
}

function isEmailOtpType(type: string | null): type is EmailOtpType {
  return Boolean(type && emailOtpTypes.has(type));
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");

  if (requestUrl.searchParams.get("error")) {
    logger.warn("Supabase auth callback returned an error", {
      error: requestUrl.searchParams.get("error"),
      description: requestUrl.searchParams.get("error_description"),
    });
    return redirectTo("/login?error=invalid_link");
  }

  try {
    const supabase = await createSupabaseServerClient();
    const authResult = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : tokenHash && isEmailOtpType(type)
        ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        : null;

    if (!authResult) {
      logger.warn("Supabase auth callback missing code or token hash");
      return redirectTo("/login?error=invalid_link");
    }

    if (authResult.error) {
      logger.warn("Supabase auth callback could not create a session", {
        message: authResult.error.message,
      });
      return redirectTo("/login?error=invalid_link");
    }

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      logger.warn("Supabase auth callback could not load the user", {
        message: error?.message || "No user returned",
      });
      return redirectTo("/login?error=session_failed");
    }

    if (data.user.email) {
      await associateProfileAuthUser(data.user.id, data.user.email);
    }

    return redirectTo("/account");
  } catch (error) {
    logger.error("Supabase auth callback failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return redirectTo("/login?error=session_failed");
  }
}
