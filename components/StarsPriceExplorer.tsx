"use client";

import { useMemo, useState } from "react";
import { continents } from "@/lib/countries";
import { countryNames } from "@/lib/i18n/countryNames";
import { TELEGRAM_BUY_BOT_URL } from "@/lib/config";
import { format } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/locales";

export function StarsPriceExplorer({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary["starsPricing"];
}) {
  const [activeKey, setActiveKey] = useState(continents[0].key);
  const [query, setQuery] = useState("");
  const active = continents.find((c) => c.key === activeKey)!;

  const continentLabel = (key: string) =>
    dict.continents[key as keyof typeof dict.continents] ?? key;

  const countryLabel = (key: string) => countryNames[key]?.[locale] ?? key;

  const filtered = useMemo(() => {
    if (!active.countries) return null;
    if (!query.trim()) return active.countries;
    const q = query.trim().toLowerCase();
    return active.countries.filter((c) => {
      const localName = countryNames[c.key]?.[locale]?.toLowerCase() ?? "";
      const enName = countryNames[c.key]?.en?.toLowerCase() ?? "";
      return localName.includes(q) || enName.includes(q);
    });
  }, [active, query, locale]);

  return (
    <div>
      {/* Continent tabs */}
      <div className="flex flex-wrap gap-2">
        {continents.map((c) => (
          <button
            key={c.key}
            onClick={() => {
              setActiveKey(c.key);
              setQuery("");
            }}
            className={`focus-ring rounded-full border px-4 py-2 text-sm transition ${
              c.key === activeKey
                ? "border-signal bg-signal text-paper"
                : "border-steelLine bg-steel text-paper/70 hover:border-paper/40 hover:text-paper"
            }`}
          >
            <span className="mr-2">{c.flag}</span>
            {continentLabel(c.key)}
          </button>
        ))}
      </div>

      {/* Search */}
      {active.countries && (
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={format(dict.searchPlaceholder, {
            continent: continentLabel(active.key),
          })}
          className="focus-ring mt-6 w-full max-w-sm rounded-lg border border-steelLine bg-steel px-4 py-2 text-sm text-paper placeholder:text-paper/40"
        />
      )}

      {/* Table or coming-soon state */}
      <div className="mt-6">
        {!active.countries ? (
          <div className="rounded-2xl border border-steelLine bg-steel p-10 text-center">
            <div className="text-5xl">{active.flag}</div>
            <p className="mt-4 text-paper/70">
              {format(dict.comingSoonText, { continent: continentLabel(active.key) })}
            </p>
            <p className="mt-1 text-sm text-paper/50">
              {dict.comingSoonContact}{" "}
              <a
                href={`/${locale}/contact`}
                className="focus-ring rounded text-signal underline underline-offset-4"
              >
                {dict.contactUs}
              </a>{" "}
              {dict.forQuote}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-steelLine">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-steelLine bg-steel text-left text-paper/50">
                  <th className="px-5 py-3 font-medium">{dict.tableCountry}</th>
                  <th className="px-5 py-3 font-medium">{dict.tableDial}</th>
                  <th className="px-5 py-3 text-right font-medium">
                    {dict.tablePrice}
                  </th>
                  <th className="px-5 py-3 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered && filtered.length > 0 ? (
                  filtered.map((c) => (
                    <tr
                      key={c.key}
                      className="border-b border-steelLine/60 last:border-0 hover:bg-steel/60"
                    >
                      <td className="px-5 py-3">
                        <span className="mr-2">{c.flag}</span>
                        {countryLabel(c.key)}
                        {typeof c.available === "number" && (
                          <span className="ml-2 text-xs text-paper/40">
                            ({c.available.toLocaleString()} available)
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 font-mono text-paper/60">
                        +{c.dialCode}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-signal">
                        ${c.price.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <a
                          href={TELEGRAM_BUY_BOT_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="focus-ring inline-block rounded-full bg-signal px-4 py-1.5 text-xs font-semibold text-paper transition hover:bg-signalDeep"
                        >
                          {dict.buyButton}
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-paper/50">
                      {format(dict.noMatch, { query })}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
