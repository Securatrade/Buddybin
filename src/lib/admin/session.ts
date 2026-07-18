import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_TTL_MS,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "@/lib/admin/auth";

export async function isAdminRequest() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value,
    process.env.ADMIN_SESSION_SECRET,
  );
}

export async function requireAdmin() {
  const valid = await isAdminRequest();
  if (!valid) {
    redirect("/admin?expired=1");
  }
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();
  const token = createAdminSessionToken(process.env.ADMIN_SESSION_SECRET || "");
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_MS / 1000,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
