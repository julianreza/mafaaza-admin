/**
 * Encore API client untuk mafaaza-admin.
 *
 * Server Component / Server Action:
 *   import { getApiClientFromCookies } from "@/lib/api";
 *   import { cookies } from "next/headers";
 *
 *   const cookieStore = await cookies();
 *   const api = getApiClientFromCookies(cookieStore.toString());
 *   const data = await api.mafaaza_api.profile();
 *
 * Client Component (dengan token dari state/localStorage):
 *   import { createAuthenticatedClient } from "@/lib/api";
 *   const api = createAuthenticatedClient(token);
 *
 * Catatan: /auth/* adalah raw Better Auth endpoint — TIDAK muncul di client ini.
 * Gunakan `better-auth/client` (createAuthClient) untuk sign-in/sign-up/sign-out.
 */

import Client, { Environment, Local, type ClientOptions } from "./client";

// ---------------------------------------------------------------------------
// Base URL
// ---------------------------------------------------------------------------

function getBaseUrl(): string {
  // `API_URL` is server-only (not NEXT_PUBLIC_), so the backend origin never
  // reaches the browser bundle. Typed endpoints are called from Server
  // Components / Server Actions only, so this is the path that matters.
  if (process.env.API_URL) return process.env.API_URL;

  // Fallback for any client-side usage, and for cloud environments.
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (process.env.ENCORE_ENV) return Environment(process.env.ENCORE_ENV);

  return Local; // http://localhost:4000
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

/** Client tanpa auth — untuk public endpoint dan SSR awal. */
export function createApiClient(options?: ClientOptions): Client {
  return new Client(getBaseUrl(), options);
}

/** Client dengan Bearer token — untuk API client yang menyimpan token di memory. */
export function createAuthenticatedClient(token: string): Client {
  return new Client(getBaseUrl(), {
    auth: { authorization: `Bearer ${token}` },
  });
}

/**
 * Server-side helper: membaca session cookie Better Auth dari request headers.
 * Cookie name "better-auth.session_token" adalah default Better Auth.
 *
 * Contoh di Server Action atau Server Component:
 *   import { cookies } from "next/headers";
 *   const api = getApiClientFromCookies((await cookies()).toString());
 */
export function getApiClientFromCookies(cookieHeader: string): Client {
  return new Client(getBaseUrl(), {
    auth: { cookie: cookieHeader },
  });
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export { Client, Local, Environment };
export type { ClientOptions };
