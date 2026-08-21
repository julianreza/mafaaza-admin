"use server";

/**
 * Server Action for login.
 *
 * By handling sign-in on the server, the browser never sends credentials
 * directly to `/auth/sign-in/email`. The Network tab only shows a generic
 * Server Action POST to the same page, and the actual Better Auth call
 * happens server-to-server where it is invisible to DevTools.
 */

import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

/**
 * Parse a raw `Set-Cookie` header string into name, value, and options
 * that Next.js `cookies().set()` accepts.
 */
function parseSetCookie(raw: string) {
  const parts = raw.split(";").map((p) => p.trim());
  const [nameValue, ...attrs] = parts;
  const eqIdx = nameValue.indexOf("=");
  const name = nameValue.slice(0, eqIdx);
  const value = decodeURIComponent(nameValue.slice(eqIdx + 1));

  const options: Record<string, unknown> = {};
  for (const attr of attrs) {
    const lower = attr.toLowerCase();
    if (lower === "httponly") {
      options.httpOnly = true;
    } else if (lower === "secure") {
      options.secure = true;
    } else if (lower.startsWith("path=")) {
      options.path = attr.split("=")[1];
    } else if (lower.startsWith("domain=")) {
      options.domain = attr.split("=")[1];
    } else if (lower.startsWith("max-age=")) {
      options.maxAge = parseInt(attr.split("=")[1], 10);
    } else if (lower.startsWith("samesite=")) {
      options.sameSite = attr.split("=")[1].toLowerCase() as
        | "lax"
        | "strict"
        | "none";
    } else if (lower.startsWith("expires=")) {
      options.expires = new Date(attr.slice("expires=".length));
    }
  }

  return { name, value, options };
}

export async function loginAction(
  _prev: { ok: boolean; error?: string },
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { ok: false, error: "Email dan kata sandi wajib diisi." };
  }

  try {
    // Call Better Auth sign-in endpoint server-to-server
    const res = await fetch(`${API_URL}/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Better Auth requires an Origin header for CSRF protection.
        // Must match one of the `trustedOrigins` configured in the backend.
        // The admin app's own origin (http://localhost:3000) is trusted.
        Origin: process.env.APP_URL ?? "http://localhost:3000",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message =
        body?.message || body?.error || "Email atau kata sandi salah.";
      return { ok: false, error: message };
    }

    // Forward session cookies from Better Auth to the browser
    const setCookieHeaders = res.headers.getSetCookie?.() ?? [];
    const cookieStore = await cookies();

    for (const raw of setCookieHeaders) {
      const { name, value, options } = parseSetCookie(raw);
      if (name) {
        cookieStore.set(name, value, options);
      }
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Tidak dapat terhubung ke server." };
  }
}
