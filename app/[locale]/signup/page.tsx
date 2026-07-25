import { AuthForm } from "@/components/AuthForm";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return {};
  const dict = await getDictionary(params.locale as Locale);
  return { title: `${dict.auth.signupTitle} — Acceptor_org` };
}

export default async function SignupPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-8 text-center font-display text-2xl font-bold">
        {dict.auth.signupTitle}
      </h1>
      <AuthForm mode="signup" locale={locale} dict={dict.auth} />
    </div>
  );
}
