import { cookies } from "next/headers";
import { createHash } from "crypto";

const COOKIE = "dxnx_admin";

/** Token phiên = hash(mật khẩu + salt). Đặt làm giá trị cookie, kiểm tra stateless. */
function sessionToken(): string {
  const pw = process.env.ADMIN_PASSWORD || "";
  const salt = process.env.ADMIN_SESSION_SALT || "";
  return createHash("sha256").update(`${pw}:${salt}`).digest("hex");
}

export function verifyPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD || "";
  return pw.length > 0 && input === pw;
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE)?.value === sessionToken();
}

export async function setSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 ngày
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
