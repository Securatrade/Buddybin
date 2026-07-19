import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authCallbackUrl } from "@/lib/env";
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
        emailRedirectTo: authCallbackUrl(),
      },
    });

    if (error) {
      throw error;
    }

    return Response.json({
      ok: true,
      message:
        "Check your inbox for your secure BuddyBin login link. It may take a minute to arrive. Please also check your junk folder.",
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
