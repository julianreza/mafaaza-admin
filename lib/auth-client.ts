"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

/**
 * Better Auth client.
 *
 * `baseURL` is intentionally empty: requests go to this app's own origin and are
 * proxied to the Encore backend by the rewrite in `next.config.ts`, which keeps
 * the session cookie first-party.
 *
 * `basePath` must match `basePath: "/auth"` in the backend's
 * `services/auth/auth.ts` — Better Auth defaults to `/api/auth`, which this
 * backend does not use.
 *
 * `adminClient()` mirrors the `admin()` plugin enabled on the backend, exposing
 * authClient.admin.* (listUsers, setRole, banUser, impersonateUser, ...).
 */
export const authClient = createAuthClient({
  baseURL: "",
  basePath: "/auth",
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
