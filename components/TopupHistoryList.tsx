"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/locales";

type Topup = {
  id: string;
  amount_usd: number;
  pay_currency: string | null;
  deposit_address: string | null;
  status: string;
  created_at: string;
};

export function TopupHistoryList({
  initialTopups,
  locale,
  dict,
}: {
  initialTopups: Topup[];
  locale: Locale;
  dict: Dictionary["account"];
}) {
  const [topups, setTopups] = useState(initialTopups);
  const [checking, setChecking] = useState<Record<string, boolean>>({});
  const router = useRouter();

  async function checkOne(id: string) {
    setChecking((c) => ({ ...c, [id]: true }));
    try {
      const res = await fetch(`/api/topup/status/${id}`);
      const data = await res.json();
      if (data.status === "confirmed") {
        setTopups((list) =>
          list.map((t) => (t.id === id ? { ...t, status: "confirmed" } : t))
        );
        router.refresh(); // updates the Balance card above
      } else if (data.status === "failed") {
        setTopups((list) =>
          list.map((t) => (t.id === id ? { ...t, status: "failed" } : t))
        );
      }
    } finally {
      setChecking((c) => ({ ...c, [id]: false }));
    }
  }

  // Auto-check every pending/review deposit once when the page loads —
  // covers the case where confirmation happened while the tab was closed.
  useEffect(() => {
    const pending = initialTopups.filter(
      (t) => t.status === "pending" || t.status === "review"
    );
    pending.forEach((t) => checkOne(t.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (topups.length === 0) {
    return <p className="mt-3 text-sm text-paper/50">{dict.noTopups}</p>;
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      {topups.map((tp) => (
        <div key={tp.id} className="rounded-xl border border-steelLine bg-steel p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-sm text-paper">
              {Number(tp.amount_usd).toFixed(2)} USDT
              {tp.pay_currency && ` (${String(tp.pay_currency).toUpperCase()})`}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  tp.status === "confirmed"
                    ? "bg-signal/15 text-signal"
                    : tp.status === "failed"
                      ? "bg-paper/10 text-paper/50"
                      : "bg-paper/10 text-paper/70"
                }`}
              >
                {checking[tp.id] ? "…" : tp.status}
              </span>
              {(tp.status === "pending" || tp.status === "review") && (
                <button
                  onClick={() => checkOne(tp.id)}
                  disabled={checking[tp.id]}
                  className="focus-ring rounded-full border border-steelLine px-3 py-1 text-xs text-paper/70 transition hover:text-paper disabled:opacity-50"
                >
                  ↻
                </button>
              )}
            </div>
          </div>
          {tp.status === "pending" && tp.deposit_address && (
            <p className="mt-2 break-all font-mono text-xs text-signal">
              {dict.depositAddressLabel}: {tp.deposit_address}
            </p>
          )}
          <p className="mt-2 text-xs text-paper/40">
            {new Date(tp.created_at).toLocaleString(locale)}
          </p>
        </div>
      ))}
    </div>
  );
}
