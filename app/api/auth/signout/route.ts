import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { defaultLocale, isLocale } from "@/lib/i18n/locales";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  await supabase.auth.signOut();

  const { origin, searchParams } = new URL(request.url);
  const localeParam = searchParams.get("locale");
  const locale = isLocale(localeParam ?? "") ? localeParam : defaultLocale;

  return NextResponse.redirect(`${origin}/${locale}`);
}
