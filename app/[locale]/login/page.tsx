import { AuthForm } from "@/components/AuthForm";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return {};
  const dict = await getDictionary(params.locale as Locale);
  return { title: `${dict.auth.loginTitle} — Acceptor_org` };
}

export default async function LoginPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-8 text-center font-display text-2xl font-bold">
        {dict.auth.loginTitle}
      </h1>
      <AuthForm mode="login" locale={locale} dict={dict.auth} />
    </div>
  );
}
