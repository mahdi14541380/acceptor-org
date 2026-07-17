import { StarsPriceExplorer } from "@/components/StarsPriceExplorer";
import { Tick } from "@/components/Tick";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const t = dict.starsPricing;
  return {
    title: `${t.h1} | Acceptor_org`,
    description: t.subtitle,
    alternates: { canonical: `https://acceptororg.com/${locale}/pricing/stars` },
    openGraph: {
      title: t.h1,
      description: t.subtitle,
      url: `https://acceptororg.com/${locale}/pricing/stars`,
      type: "website",
    },
  };
}

export default async function StarsPricingPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const t = dict.starsPricing;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
        {t.eyebrow}
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">
        {t.h1}
      </h1>
      <p className="mt-4 max-w-2xl text-paper/70 leading-relaxed">
        {t.subtitle}
      </p>

      <div className="mt-12">
        <StarsPriceExplorer locale={locale} dict={t} />
      </div>

      <section className="mt-20 border-t border-steelLine/60 pt-12">
        <Tick className="h-6 w-9" />
        <h2 className="mt-3 font-display text-2xl font-bold">
          {t.faqHeading}
        </h2>
        <div className="mt-8 flex flex-col gap-6">
          {t.faqs.map((f) => (
            <div key={f.q}>
              <h3 className="font-body font-semibold text-paper">{f.q}</h3>
              <p className="mt-1 text-sm text-paper/60">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
