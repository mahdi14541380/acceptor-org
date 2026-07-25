import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { locales, localeMeta, isLocale, type Locale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"],
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL("https://acceptororg.com"),
  title: {
    default: "Acceptor_org — Buy Telegram Accounts & Services",
    template: "%s",
  },
  description:
    "Buy Telegram Accounts at the price for your country, plus other Telegram services. Clear pricing, fast delivery.",
  keywords: [
    "buy telegram accounts",
    "telegram accounts price",
    "buy accounts telegram",
    "telegram accounts by country",
  ],
  openGraph: {
    title: "Acceptor_org — Buy Telegram accounts & Services",
    description:
      "Buy Telegram accounts at the price for your country, plus other Telegram services.",
    url: "https://acceptororg.com",
    siteName: "Acceptor_org",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const dir = localeMeta[locale].dir;

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        <Nav locale={locale} dict={dict} />
        <main>{children}</main>
        <Footer locale={locale} dict={dict} />
      </body>
    </html>
  );
}
