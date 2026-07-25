"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { continents } from "@/lib/countries";
import { countryNames } from "@/lib/i18n/countryNames";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/locales";

export function BuyStarsForm({
  locale,
  dict,
  initialCountry,
}: {
  locale: Locale;
  dict: Dictionary["account"];
  initialCountry?: string;
}) {
  const allCountries = continents.flatMap((c) => c.countries ?? []);
  const [countryKey, setCountryKey] = useState(
    initialCountry && allCountries.some((c) => c.key === initialCountry)
      ? initialCountry
      : allCountries[0]?.key ?? ""
  );
  const [quantity, setQuantity] = useState("100");
  const [tier, setTier] = useState<"old" | "new">("old");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(
    null
  );
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const selectedCountry = allCountries.find((c) => c.key === countryKey);
  const unitPrice = selectedCountry
    ? tier === "old"
      ? selectedCountry.price
      : selectedCountry.priceNew
    : 0;
  const total = unitPrice * Number(quantity || 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setDownloadUrl(null);
    if (pollRef.current) clearInterval(pollRef.current);

    const res = await fetch("/api/orders/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        countryKey,
        tier,
        quantity: Number(quantity),
        telegramUsername: username,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage({
        type: "error",
        text: res.status === 402 ? dict.insufficientBalance : data.error ?? "Error",
      });
      return;
    }

    router.refresh(); // reflect the deducted balance immediately

    if (data.status === "completed") {
      setMessage({ type: "ok", text: `✓ Order ${data.orderId}` });
      setDownloadUrl(data.downloadUrl ?? null);
      return;
    }
    if (data.status === "failed") {
      setMessage({ type: "error", text: "Order failed — balance refunded." });
      return;
    }

    // Still processing — poll every 6s until it settles.
    setMessage({ type: "ok", text: `⏳ Order ${data.orderId} processing…` });
    pollRef.current = setInterval(async () => {
      const r = await fetch(`/api/orders/status/${data.orderId}`);
      const s = await r.json();
      if (s.status === "completed") {
        setMessage({ type: "ok", text: `✓ Order ${data.orderId} completed` });
        setDownloadUrl(s.downloadUrl ?? null);
        if (pollRef.current) clearInterval(pollRef.current);
      } else if (s.status === "failed") {
        setMessage({ type: "error", text: "Order failed — balance refunded." });
        router.refresh();
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }, 6000);
  }

  return (
    <div className="rounded-2xl border border-steelLine bg-steel p-6">
      <h2 className="font-display text-lg font-bold">{dict.buyStarsHeading}</h2>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm text-paper/70">
            {dict.countryLabel}
          </label>
          <select
            value={countryKey}
            onChange={(e) => setCountryKey(e.target.value)}
            className="focus-ring w-full rounded-lg border border-steelLine bg-ink px-3 py-2.5 text-paper"
          >
            {allCountries.map((c) => (
              <option key={c.key} value={c.key}>
                {c.flag} {countryNames[c.key]?.[locale] ?? c.key} — ${c.price.toFixed(2)}/${c.priceNew.toFixed(2)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-paper/70">{dict.tierLabel}</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTier("old")}
              className={`focus-ring flex-1 rounded-lg border px-3 py-2.5 text-sm transition ${
                tier === "old"
                  ? "border-signal bg-signal text-paper"
                  : "border-steelLine bg-ink text-paper/70"
              }`}
            >
              {dict.tierOld}
            </button>
            <button
              type="button"
              onClick={() => setTier("new")}
              className={`focus-ring flex-1 rounded-lg border px-3 py-2.5 text-sm transition ${
                tier === "new"
                  ? "border-signal bg-signal text-paper"
                  : "border-steelLine bg-ink text-paper/70"
              }`}
            >
              {dict.tierNew}
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-paper/70">
            {dict.quantityLabel}
          </label>
          <input
            type="number"
            min={1}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="focus-ring w-full rounded-lg border border-steelLine bg-ink px-3 py-2.5 text-paper"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-paper/70">
            {dict.telegramUsernameLabel}
          </label>
          <input
            type="text"
            required
            placeholder="@username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="focus-ring w-full rounded-lg border border-steelLine bg-ink px-3 py-2.5 text-paper"
          />
        </div>

        <p className="text-sm text-paper/60">
          {dict.totalLabel}: <span className="font-mono text-signal">${total.toFixed(2)}</span>
        </p>

        {message && (
          <p className={`text-sm ${message.type === "error" ? "text-signal" : "text-paper/70"}`}>
            {message.text}
          </p>
        )}

        {downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring self-start rounded-full border border-signal px-4 py-2 text-xs font-semibold text-signal transition hover:bg-signal hover:text-paper"
          >
            {dict.viewReceipt}
          </a>
        )}

        <button
          type="submit"
          disabled={loading}
          className="focus-ring self-start rounded-full bg-signal px-6 py-2.5 text-sm font-semibold text-paper transition hover:bg-signalDeep disabled:opacity-50"
        >
          {dict.buyButton}
        </button>
      </form>
    </div>
  );
}
