import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // only guard app routes
  if (!pathname.startsWith("/app")) return NextResponse.next();

  const authed = req.cookies.get("lf_auth")?.value === "1";
  const role = req.cookies.get("lf_role")?.value ?? "admin";

  const redirectToLogin = () => {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  };

  if (!authed) return redirectToLogin();

  // optional: viewer cannot access settings
  if (pathname.startsWith("/app/settings") && role === "viewer") {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
