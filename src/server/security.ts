import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
export function secureEqual(a: string, b: string): boolean {
  const aa = Buffer.from(a),
    bb = Buffer.from(b);
  return aa.length === bb.length && aa.length > 0 && timingSafeEqual(aa, bb);
}
export function nonce(size = 32): string {
  return randomBytes(size).toString("base64url");
}
export function challenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}
export function seal(value: unknown, secret: string, binding: string): string {
  if (secret.length < 32)
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  const key = createHash("sha256").update(secret).digest(),
    iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(binding));
  const bytes = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), bytes]).toString("base64url");
}
export function unseal<T extends { expires: number }>(
  cookie: string,
  secret: string,
  binding: string,
  now = Date.now(),
): T | null {
  try {
    if (cookie.length > 6000 || secret.length < 32) return null;
    const raw = Buffer.from(cookie, "base64url");
    if (raw.length < 29) return null;
    const key = createHash("sha256").update(secret).digest(),
      decipher = createDecipheriv("aes-256-gcm", key, raw.subarray(0, 12));
    decipher.setAAD(Buffer.from(binding));
    decipher.setAuthTag(raw.subarray(12, 28));
    const value = JSON.parse(
      Buffer.concat([
        decipher.update(raw.subarray(28)),
        decipher.final(),
      ]).toString("utf8"),
    ) as T;
    return Number.isFinite(value.expires) && value.expires > now ? value : null;
  } catch {
    return null;
  }
}
export function cookieValue(header: string | undefined, name: string): string {
  if (!header) return "";
  for (const part of header.split(";")) {
    const at = part.indexOf("=");
    if (part.slice(0, at).trim() === name) return part.slice(at + 1).trim();
  }
  return "";
}
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function requireOrigin(
  origin: string | undefined,
  expected: string,
): void {
  if (origin !== expected)
    throw new HttpError(403, "A kérés eredete nem engedélyezett.");
}
