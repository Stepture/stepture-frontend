import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function middleware(req: NextRequest) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const token = cookieStore.get("access_token")?.value || "";

  const isPulic =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/auth/success");

  if (!token && !isPulic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token && isPulic) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}
