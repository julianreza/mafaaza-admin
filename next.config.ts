import type { NextConfig } from "next";

/**
 * Backend origin. Only used server-side (rewrites + server components).
 * The browser never talks to it directly — see the rewrite below.
 */
const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  /**
   * Hide the `X-Powered-By: Next.js` response header so the tech stack
   * is not exposed in the browser Network tab.
   */
  poweredByHeader: false,

  /**
   * Pin the workspace root to this project. Without it Turbopack walks upward
   * and picks up an unrelated `package-lock.json` in the home directory, which
   * makes module resolution non-deterministic.
   */
  turbopack: {
    root: __dirname,
  },

  /**
   * Proxy Better Auth's routes through this app's own origin.
   *
   * Why: the session cookie must be first-party. If the browser called
   * http://localhost:4000/auth/sign-in/email directly from http://localhost:3000,
   * the cookie would be cross-site and browsers would require
   * `SameSite=None; Secure` — which does not work reliably over plain http in
   * development, and forces CORS credentials handling in production.
   *
   * With this rewrite the browser only ever sees same-origin `/auth/*`, so the
   * cookie is first-party, no CORS preflight happens, and the same code works in
   * dev and prod.
   *
   * Typed API endpoints (/products, /orders, /profile) are deliberately NOT
   * proxied: they are called from Server Components / Server Actions, which talk
   * to the backend server-to-server with no browser involved.
   */
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: `${API_URL}/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
