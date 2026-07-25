import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { continents } from "@/lib/countries";
import { countryNames } from "@/lib/i18n/countryNames";
import { getPriceOverrides } from "@/lib/getCountryPrice";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { notFound } from "next/navigation";
import { AdminPriceEditor } from "@/components/AdminPriceEditor";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return {};
  const dict = await getDictionary(params.locale as Locale);
  return { title: `${dict.admin.h1} — Acceptor_org` };
}

export default async function AdminPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const t = dict.admin;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminEmail(user?.email)) redirect(`/${locale}/login`);

  const overrides = await getPriceOverrides();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
        {t.eyebrow}
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">{t.h1}</h1>

      <div className="mt-10 flex flex-col gap-10">
        {continents
          .filter((c) => c.countries)
          .map((continent) => (
            <section key={continent.key}>
              <h2 className="mb-3 font-display text-lg font-bold">
                {continent.flag} {dict.starsPricing.continents[continent.key as keyof typeof dict.starsPricing.continents] ?? continent.key}
              </h2>
              <div className="overflow-hidden rounded-2xl border border-steelLine bg-steel">
                {continent.countries!.map((c) => (
                  <AdminPriceEditor
                    key={c.key}
                    countryKey={c.key}
                    label={`${c.flag} ${countryNames[c.key]?.[locale] ?? c.key}`}
                    currentPriceOld={overrides[c.key]?.old ?? c.price}
                    currentPriceNew={overrides[c.key]?.new ?? c.priceNew}
                    dict={t}
                  />
                ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
