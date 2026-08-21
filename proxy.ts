import { NextResponse, type NextRequest } from "next/server";

/**
 * Better Auth's session cookie. The `__Secure-` variant is used when the cookie
 * is issued over https, so both names must be checked.
 */
const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

/**
 * Optimistic auth guard. (Next 16 renamed this convention from `middleware` to
 * `proxy`; the behaviour is the same.)
 *
 * This only checks whether a session cookie is PRESENT — it does not validate it,
 * because this runs on every request and a network round-trip here would add
 * latency to every page load. Real validation happens server-side in
 * `app/(dashboard)/layout.tsx`, which calls the backend and redirects if the
 * session turns out to be invalid or expired.
 *
 * So: this keeps unauthenticated users out of the dashboard cheaply, and the
 * layout is the actual security boundary.
 */
export default function proxy(request: NextRequest) {
  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) =>
    request.cookies.has(name),
  );
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";

  if (!hasSessionCookie && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Remember where the user was headed so login can send them back.
    if (pathname !== "/") url.searchParams.set("from", pathname);
    const redirectToLogin = NextResponse.redirect(url);
    applySecurityHeaders(redirectToLogin);
    return redirectToLogin;
  }

  if (hasSessionCookie && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    const redirectToDash = NextResponse.redirect(url);
    applySecurityHeaders(redirectToDash);
    return redirectToDash;
  }

  const response = NextResponse.next();
  applySecurityHeaders(response);
  return response;
}

/**
 * Security headers applied to every response. These prevent common attacks
 * and hide implementation details from the browser Network tab.
 */
function applySecurityHeaders(response: NextResponse) {
  // Prevent clickjacking — only allow this site to embed itself
  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  // Prevent MIME-type sniffing — browser must trust the declared Content-Type
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Minimise information sent to other origins via Referer header
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Disable browser features we don't use (camera, mic, geolocation, etc.)
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );

  // Remove the Server header if present (leaks server software info)
  response.headers.delete("Server");

  // In production, enforce HTTPS for 1 year with includeSubDomains
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }
}

export const config = {
  /**
   * `auth` MUST be excluded — it is the proxy to Better Auth. Without this
   * exclusion the sign-in POST would itself be redirected to /login and login
   * could never succeed.
   */
  matcher: [
    "/((?!auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
