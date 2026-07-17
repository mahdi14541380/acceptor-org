import { Tick } from "@/components/Tick";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return {};
  const dict = await getDictionary(params.locale as Locale);
  return { title: `${dict.about.h1} — Acceptor_org` };
}

export default async function AboutPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const dict = await getDictionary(params.locale as Locale);
  const t = dict.about;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
        {t.eyebrow}
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">
        {t.h1}
      </h1>
      <p className="mt-6 text-paper/70 leading-relaxed">{t.p1}</p>
      <p className="mt-4 text-paper/70 leading-relaxed">{t.p2}</p>
      <div className="mt-10 flex items-center gap-3 text-paper/50">
        <Tick className="h-6 w-9" />
        <span className="text-sm">{t.verified}</span>
      </div>
    </div>
  );
}
