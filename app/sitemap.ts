import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/locales";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://acceptororg.com";
  const routes = [
    "",
    "/services",
    "/pricing",
    "/pricing/stars",
    "/about",
    "/contact",
  ];

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${base}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "/pricing/stars" ? "daily" : "weekly",
      priority: route === "" ? 1 : route === "/pricing/stars" ? 0.9 : 0.6,
    }))
  ) as MetadataRoute.Sitemap;
}
