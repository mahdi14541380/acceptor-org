import { services } from "@/lib/data";
import { Tick } from "@/components/Tick";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return {};
  const dict = await getDictionary(params.locale as Locale);
  return { title: `${dict.services.h1} — Acceptor_org` };
}

export default async function ServicesPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const t = dict.services;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
        {t.eyebrow}
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">
        {t.h1}
      </h1>
      <p className="mt-4 max-w-xl text-paper/60">{t.subtitle}</p>

      <section className="mt-14 border-t border-steelLine/60 pt-10">
        <Tick className="h-6 w-9" />
        <div className="mt-3 flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-bold">{t.starsTitle}</h2>
            <p className="mt-1 text-paper/60">{t.starsTagline}</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/70">
              {t.starsDesc}
            </p>
          </div>
          <Link
            href={`/${locale}/pricing/stars`}
            className="focus-ring rounded-full bg-signal px-6 py-3 text-sm font-semibold text-paper transition hover:bg-signalDeep"
          >
            {t.seePrices}
          </Link>
        </div>
      </section>

      <div className="mt-16 flex flex-col gap-16">
        {services.map((s) => (
          <section
            key={s.slug}
            id={s.slug}
            className="scroll-mt-24 border-t border-steelLine/60 pt-10"
          >
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <Tick className="h-6 w-9" />
                <h2 className="mt-3 font-display text-2xl font-bold">
                  {s.name}
                </h2>
                <p className="mt-1 text-paper/60">{s.tagline}</p>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/70">
                  {s.description}
                </p>
              </div>
              <ul className="min-w-[240px] flex-1 space-y-2 md:max-w-xs">
                {s.tiers.map((tier) => (
                  <li
                    key={tier.label}
                    className="flex items-center justify-between rounded-lg border border-steelLine bg-steel px-4 py-3"
                  >
                    <span className="text-sm text-paper/80">{tier.label}</span>
                    <span className="font-mono text-sm text-signal">
                      {tier.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-steelLine bg-steel p-8 text-center">
        <p className="text-paper/70">
          {t.ctaText}{" "}
          <Link
            href={`/${locale}/contact`}
            className="focus-ring rounded text-signal underline underline-offset-4"
          >
            {t.contactLink}
          </Link>{" "}
          {t.ctaSuffix}
        </p>
      </div>
    </div>
  );
}
