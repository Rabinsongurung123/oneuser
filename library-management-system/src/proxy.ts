import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/admin", "/librarian", "/member"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!isProtected) return NextResponse.next();

  // session is mirrored into an `fb_auth` cookie so the proxy can read it
  const token = request.cookies.get("fb_auth")?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/guest/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/librarian/:path*", "/member/:path*"],
};
