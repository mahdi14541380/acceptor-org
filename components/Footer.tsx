import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/locales";

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer className="border-t border-steelLine/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-paper/50 md:flex-row md:items-center md:justify-between">
        <p>
          Acceptor<span className="text-signal">_org</span> — {dict.footer.tagline}
        </p>
        <div className="flex gap-6">
          <Link href={`/${locale}/services`} className="focus-ring rounded hover:text-paper">
            {dict.footer.services}
          </Link>
          <Link href={`/${locale}/pricing`} className="focus-ring rounded hover:text-paper">
            {dict.footer.pricing}
          </Link>
          <Link href={`/${locale}/contact`} className="focus-ring rounded hover:text-paper">
            {dict.footer.contact}
          </Link>
        </div>
      </div>
    </footer>
  );
}
