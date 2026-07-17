import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n/locales";

function detectLocale(request: NextRequest): string {
  const acceptLang = request.headers.get("accept-language");
  if (!acceptLang) return defaultLocale;
  const preferred = acceptLang.split(",")[0].split("-")[0].toLowerCase();
  return (locales as readonly string[]).includes(preferred)
    ? preferred
    : defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (pathnameHasLocale) return;

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip static files, images, and API routes
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
