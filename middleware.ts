import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n/locales";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

function detectLocale(request: NextRequest): string {
  const acceptLang = request.headers.get("accept-language");
  if (!acceptLang) return defaultLocale;
  const preferred = acceptLang.split(",")[0].split("-")[0].toLowerCase();
  return (locales as readonly string[]).includes(preferred)
    ? preferred
    : defaultLocale;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (!pathnameHasLocale) {
    const locale = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Keep the Supabase auth session cookie fresh on every request.
  const response = NextResponse.next();
  return updateSupabaseSession(request, response);
}

export const config = {
  // Skip static files, images, and API routes
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
