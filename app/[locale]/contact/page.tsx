import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { notFound } from "next/navigation";
import {
  CONTACT_TELEGRAM_HANDLE,
  CONTACT_TELEGRAM_URL,
  CONTACT_EMAIL,
} from "@/lib/config";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return {};
  const dict = await getDictionary(params.locale as Locale);
  return { title: `${dict.contact.h1} — Acceptor_org` };
}

export default async function ContactPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const dict = await getDictionary(params.locale as Locale);
  const t = dict.contact;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
        {t.eyebrow}
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">
        {t.h1}
      </h1>
      <p className="mt-6 text-paper/70 leading-relaxed">{t.subtitle}</p>

      <div className="mt-10 flex flex-col gap-4">
        <a
          href={CONTACT_TELEGRAM_URL}
          className="focus-ring flex items-center justify-between rounded-xl border border-steelLine bg-steel px-6 py-4 transition hover:border-signal/60"
        >
          <span className="font-body text-sm text-paper/80">{t.telegram}</span>
          <span className="font-mono text-sm text-signal">
            {CONTACT_TELEGRAM_HANDLE}
          </span>
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="focus-ring flex items-center justify-between rounded-xl border border-steelLine bg-steel px-6 py-4 transition hover:border-signal/60"
        >
          <span className="font-body text-sm text-paper/80">{t.email}</span>
          <span className="font-mono text-sm text-signal">{CONTACT_EMAIL}</span>
        </a>
      </div>
    </div>
  );
}
