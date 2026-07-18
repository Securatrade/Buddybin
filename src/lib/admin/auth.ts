import bcrypt from "bcryptjs";
import crypto from "node:crypto";

export const ADMIN_COOKIE_NAME = "buddybin_admin";
export const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 8;

type AdminSessionPayload = {
  version: 1;
  exp: number;
  nonce: string;
};

function base64Url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function sign(value: string, secret: string) {
  return base64Url(crypto.createHmac("sha256", secret).update(value).digest());
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

export async function verifyAdminPin(pin: string, hash: string | undefined) {
  if (!hash || pin.length < 4 || pin.length > 32) {
    return false;
  }

  return bcrypt.compare(pin, hash);
}

export function createAdminSessionToken(
  secret: string,
  now = Date.now(),
  ttlMs = ADMIN_SESSION_TTL_MS,
) {
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters");
  }

  const payload: AdminSessionPayload = {
    version: 1,
    exp: now + ttlMs,
    nonce: crypto.randomBytes(16).toString("hex"),
  };
  const body = base64Url(JSON.stringify(payload));
  return `${body}.${sign(body, secret)}`;
}

export function verifyAdminSessionToken(
  token: string | undefined,
  secret: string | undefined,
  now = Date.now(),
) {
  if (!token || !secret) {
    return false;
  }

  const [body, signature] = token.split(".");
  if (!body || !signature || !safeEqual(signature, sign(body, secret))) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as AdminSessionPayload;

    return payload.version === 1 && payload.exp > now;
  } catch {
    return false;
  }
}

export function hashAdminIdentifier(identifier: string, secret: string) {
  return crypto
    .createHmac("sha256", secret || "buddybin-admin")
    .update(identifier)
    .digest("hex");
}
