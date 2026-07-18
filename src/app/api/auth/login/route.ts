import { createSupabaseServerClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/env";
import { logger } from "@/lib/logger";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: {
        emailRedirectTo: `${siteUrl()}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }

    return Response.json({
      ok: true,
      message: "Check your email for a secure login link.",
    });
  } catch (error) {
    logger.error("Magic link login failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json(
      { error: "Login is temporarily unavailable." },
      { status: 503 },
    );
  }
}
