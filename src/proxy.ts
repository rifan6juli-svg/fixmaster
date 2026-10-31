import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Sends guests to login before anything renders, keeping the path in ?next=
// (a layout cannot read it). This only looks at the cookie: the session itself
// is checked by getTenantContext() in the (app) layout and every Server Action.
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;
  const login = new URL("/login", request.url);
  login.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tickets/:path*",
    "/customers/:path*",
    "/parts/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/change-password",
    "/admin/:path*",
    "/print/:path*",
  ],
};
