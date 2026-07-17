import "server-only";
import type { Locale } from "./locales";

import en from "./dictionaries/en.json";

export type Dictionary = typeof en;

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  ru: () => import("./dictionaries/ru.json").then((m) => m.default as Dictionary),
  zh: () => import("./dictionaries/zh.json").then((m) => m.default as Dictionary),
  ar: () => import("./dictionaries/ar.json").then((m) => m.default as Dictionary),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}
