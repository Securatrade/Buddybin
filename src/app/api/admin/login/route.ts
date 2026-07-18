import { NextResponse } from "next/server";
import { hashAdminIdentifier, verifyAdminPin } from "@/lib/admin/auth";
import { setAdminSessionCookie } from "@/lib/admin/session";
import { recordAdminLoginAttempt } from "@/lib/database";
import { checkRateLimit } from "@/lib/rate-limit";
import { adminLoginSchema } from "@/lib/schemas";
import { getClientIp } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const identifier = hashAdminIdentifier(
    getClientIp(request),
    process.env.ADMIN_SESSION_SECRET || "buddybin-admin",
  );
  const limiter = checkRateLimit({
    key: `admin:${identifier}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
    lockMs: 15 * 60 * 1000,
  });

  if (!limiter.allowed) {
    await recordAdminLoginAttempt({ hashedIdentifier: identifier, successful: false });
    return NextResponse.json(
      { error: "Too many attempts. Please wait before trying again." },
      { status: 429 },
    );
  }

  const parsed = adminLoginSchema.safeParse(await request.json());
  const valid =
    parsed.success &&
    (await verifyAdminPin(parsed.data.pin, process.env.ADMIN_PIN_HASH));

  await recordAdminLoginAttempt({ hashedIdentifier: identifier, successful: valid });

  if (!valid) {
    return NextResponse.json({ error: "Invalid admin PIN." }, { status: 401 });
  }

  await setAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
