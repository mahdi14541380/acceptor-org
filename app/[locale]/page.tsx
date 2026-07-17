import Link from "next/link";
import { Tick } from "@/components/Tick";
import { services } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { notFound } from "next/navigation";

export default async function Home({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const t = dict.home;

  const trust = [
    { title: t.trustFastTitle, body: t.trustFastBody },
    { title: t.trustClearTitle, body: t.trustClearBody },
    { title: t.trustSupportTitle, body: t.trustSupportBody },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-checkmark-glow">
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-24 md:pt-32">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-signal">
            {t.eyebrow}
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
            {t.h1Line1}
            <br />
            {t.h1Line2}
            <span className="inline-flex align-middle">
              <Tick className="ml-2 inline h-8 w-12 md:h-10 md:w-16" />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-paper/70">{t.subtitle}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={`/${locale}/pricing`}
              className="focus-ring rounded-full bg-signal px-6 py-3 font-body text-sm font-semibold transition hover:bg-signalDeep"
            >
              {t.ctaPricing}
            </Link>
            <Link
              href={`/${locale}/services`}
              className="focus-ring rounded-full border border-steelLine px-6 py-3 font-body text-sm font-semibold text-paper/80 transition hover:border-paper/40 hover:text-paper"
            >
              {t.ctaServices}
            </Link>
          </div>
        </div>
      </section>

      {/* Service overview */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            {t.offerHeading}
          </h2>
          <Link
            href={`/${locale}/services`}
            className="focus-ring rounded text-sm text-paper/60 hover:text-paper"
          >
            {t.allServices}
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Link
            href={`/${locale}/pricing/stars`}
            className="focus-ring group rounded-2xl border border-steelLine bg-steel p-6 transition hover:border-signal/60"
          >
            <h3 className="font-display text-lg font-bold">{t.starsTitle}</h3>
            <p className="mt-1 text-sm text-paper/60">{t.starsTagline}</p>
            <p className="mt-4 text-sm leading-relaxed text-paper/70">
              {t.starsDesc}
            </p>
            <span className="mt-6 inline-block font-mono text-xs text-signal">
              {t.starsFrom}
            </span>
          </Link>
          {services.map((s) => (
            <Link
              key={s.slug}
              href={`/${locale}/services#${s.slug}`}
              className="focus-ring group rounded-2xl border border-steelLine bg-steel p-6 transition hover:border-signal/60"
            >
              <h3 className="font-display text-lg font-bold">{s.name}</h3>
              <p className="mt-1 text-sm text-paper/60">{s.tagline}</p>
              <p className="mt-4 text-sm leading-relaxed text-paper/70">
                {s.description}
              </p>
              <span className="mt-6 inline-block font-mono text-xs text-signal">
                from {s.tiers[0].price}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-steelLine/60 bg-steel/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-3">
          {trust.map((item) => (
            <div key={item.title}>
              <Tick className="h-6 w-9" />
              <h3 className="mt-3 font-display text-base font-bold">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-paper/60">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
