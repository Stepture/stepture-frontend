import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerApi } from "./lib/axios-server";

export async function middleware(req: NextRequest) {
  const excludedPaths = ["/favicon.ico", "/robots.txt", "/sitemap.xml"];

  if (
    excludedPaths.includes(req.nextUrl.pathname) ||
    req.nextUrl.pathname.startsWith("/_next/") ||
    req.nextUrl.pathname.startsWith("/static/") ||
    req.nextUrl.pathname.match(/\.[a-zA-Z0-9]+$/)
  ) {
    return NextResponse.next();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value || "";
  const refreshToken = cookieStore.get("refresh_token")?.value || "";
  const isPublic =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/auth/success") ||
    req.nextUrl.pathname.startsWith("/test"); // ← Add test route here

  if (isPublic) {
    return NextResponse.next();
  }

  if (!token) {
    if (refreshToken) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const allCookies = req.headers.get("cookie") || "";
  const api = getServerApi(allCookies);
  const user = await api.protected.getMe();

  if (!user || !user.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}
