import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { notFound } from "next/navigation";
import { TopupForm } from "@/components/TopupForm";
import { TopupHistoryList } from "@/components/TopupHistoryList";
import { BuyStarsForm } from "@/components/BuyStarsForm";
import { OrderHistoryList } from "@/components/OrderHistoryList";
import { AccountTabs } from "@/components/AccountTabs";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return {};
  const dict = await getDictionary(params.locale as Locale);
  return { title: `${dict.account.h1} — Acceptor_org` };
}

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { country?: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const t = dict.account;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const { data: balanceRow } = await supabase
    .from("balances")
    .select("amount_usd")
    .eq("user_id", user.id)
    .single();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: topups } = await supabase
    .from("topups")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
        {t.eyebrow}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold md:text-4xl">{t.h1}</h1>
        <form action={`/api/auth/signout?locale=${locale}`} method="POST">
          <button
            type="submit"
            className="focus-ring rounded-full border border-steelLine px-4 py-2 text-sm text-paper/70 hover:text-paper"
          >
            {t.signOut}
          </button>
        </form>
      </div>

      <div className="mt-8 rounded-2xl border border-steelLine bg-steel p-6">
        <p className="text-sm text-paper/60">{t.balanceLabel}</p>
        <p className="mt-1 font-mono text-3xl text-signal">
          ${Number(balanceRow?.amount_usd ?? 0).toFixed(2)}
        </p>
      </div>

      <div className="mt-10">
        <AccountTabs
          defaultTab={searchParams.country ? "buy" : "funds"}
          tabs={[
            {
              key: "funds",
              label: t.tabAddFunds,
              content: (
                <div className="flex flex-col gap-8">
                  <TopupForm dict={t} />
                  <div>
                    <h2 className="font-display text-lg font-bold">{t.topupsHeading}</h2>
                    <TopupHistoryList initialTopups={topups ?? []} locale={locale} dict={t} />
                  </div>
                </div>
              ),
            },
            {
              key: "buy",
              label: t.tabBuyStars,
              content: (
                <BuyStarsForm locale={locale} dict={t} initialCountry={searchParams.country} />
              ),
            },
            {
              key: "orders",
              label: t.tabOrders,
              content: (
                <>
                  <h2 className="font-display text-lg font-bold">{t.ordersHeading}</h2>
                  <OrderHistoryList orders={orders ?? []} locale={locale} dict={t} />
                </>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
