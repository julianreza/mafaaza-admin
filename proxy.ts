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
    return NextResponse.redirect(url);
  }

  if (hasSessionCookie && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
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
