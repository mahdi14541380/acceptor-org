import Link from "next/link";
import { services } from "@/lib/data";
import { continents } from "@/lib/countries";
import { countryNames } from "@/lib/i18n/countryNames";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return {};
  const dict = await getDictionary(params.locale as Locale);
  return { title: `${dict.pricing.h1} — Acceptor_org` };
}

export default async function PricingPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const t = dict.pricing;
  const europeSample = continents[0].countries?.slice(0, 4) ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
        {t.eyebrow}
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">
        {t.h1}
      </h1>
      <p className="mt-4 max-w-xl text-paper/60">{t.subtitle}</p>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <Link
          href={`/${locale}/pricing/stars`}
          className="focus-ring group flex flex-col rounded-2xl border border-steelLine bg-steel p-6 transition hover:border-signal/60"
        >
          <h2 className="font-display text-lg font-bold">{t.starsTitle}</h2>
          <p className="mt-1 text-sm text-paper/60">{t.starsTagline}</p>
          <ul className="mt-6 space-y-2 text-sm">
            {europeSample.map((c) => (
              <li key={c.key} className="flex items-center justify-between">
                <span className="text-paper/70">
                  {c.flag} {countryNames[c.key]?.[locale] ?? c.key}
                </span>
                <span className="font-mono text-signal">
                  ${c.price.toFixed(2)} / ${c.priceNew.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <span className="mt-6 inline-block text-sm text-signal group-hover:underline">
            {t.seeAll}
          </span>
        </Link>

        {services.map((s) => (
          <div
            key={s.slug}
            className="flex flex-col rounded-2xl border border-steelLine bg-steel p-6"
          >
            <h2 className="font-display text-lg font-bold">{s.name}</h2>
            <p className="mt-1 text-sm text-paper/60">{s.tagline}</p>
            <table className="mt-6 w-full text-sm">
              <tbody>
                {s.tiers.map((tier) => (
                  <tr key={tier.label} className="border-t border-steelLine/60">
                    <td className="py-3 text-paper/80">
                      {tier.label}
                      {tier.note && (
                        <span className="ml-2 rounded-full bg-signal/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-signal">
                          {tier.note}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right font-mono text-signal">
                      {tier.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
