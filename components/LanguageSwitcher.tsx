"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, localeMeta, type Locale } from "@/lib/i18n/locales";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    const rest = pathname.replace(`/${locale}`, "") || "/";
    router.push(`/${next}${rest === "/" ? "" : rest}`);
  }

  return (
    <select
      value={locale}
      onChange={(e) => switchTo(e.target.value as Locale)}
      aria-label="Language"
      className="focus-ring rounded-full border border-steelLine bg-steel px-3 py-1.5 text-xs text-paper/80"
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {localeMeta[l].label}
        </option>
      ))}
    </select>
  );
}
