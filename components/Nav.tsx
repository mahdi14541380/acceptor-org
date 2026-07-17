import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/locales";

export function Nav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const links = [
    { href: `/${locale}/services`, label: dict.nav.services },
    { href: `/${locale}/pricing`, label: dict.nav.pricing },
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-steelLine/60 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={`/${locale}`} className="focus-ring flex items-center gap-2 rounded">
          <span className="font-display text-lg font-bold tracking-tight">
            Acceptor<span className="text-signal">_org</span>
          </span>
        </Link>
        <nav className="hidden gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="focus-ring rounded font-body text-sm text-paper/70 transition hover:text-paper"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} />
          <Link
            href={`/${locale}/pricing`}
            className="focus-ring rounded-full bg-signal px-4 py-2 font-body text-sm font-semibold text-paper transition hover:bg-signalDeep"
          >
            {dict.nav.viewPricing}
          </Link>
        </div>
      </div>
    </header>
  );
}
