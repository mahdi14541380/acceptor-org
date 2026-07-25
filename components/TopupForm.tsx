"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/getDictionary";

const NETWORKS = ["trc20", "bep20"];

export function TopupForm({ dict }: { dict: Dictionary["account"] }) {
  const [amount, setAmount] = useState("10");
  const [network, setNetwork] = useState(NETWORKS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deposit, setDeposit] = useState<{
    topupId: string;
    payAddress: string;
    payAmount: number;
    network: string;
  } | null>(null);
  const [status, setStatus] = useState<"pending" | "confirmed" | "review" | "failed" | null>(
    null
  );
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDeposit(null);
    setStatus(null);
    if (pollRef.current) clearInterval(pollRef.current);

    const res = await fetch("/api/topup/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount_usd: Number(amount), network }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Error");
      return;
    }

    setDeposit({
      topupId: data.topupId,
      payAddress: data.payAddress,
      payAmount: data.payAmount,
      network: data.network,
    });
    setStatus("pending");

    // Poll every 8s until confirmed/failed.
    pollRef.current = setInterval(async () => {
      const r = await fetch(`/api/topup/status/${data.topupId}`);
      const s = await r.json();
      if (s.status === "confirmed") {
        setStatus("confirmed");
        if (pollRef.current) clearInterval(pollRef.current);
        router.refresh(); // refreshes the balance shown above
      } else if (s.status === "failed") {
        setStatus("failed");
        if (pollRef.current) clearInterval(pollRef.current);
      } else if (s.status === "review") {
        setStatus("review");
      }
    }, 8000);
  }

  return (
    <div className="rounded-2xl border border-steelLine bg-steel p-6">
      <h2 className="font-display text-lg font-bold">{dict.topupHeading}</h2>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-sm text-paper/70">
            {dict.amountLabel}
          </label>
          <input
            type="number"
            min={1}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="focus-ring w-32 rounded-lg border border-steelLine bg-ink px-3 py-2 text-paper"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-paper/70">Network</label>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="focus-ring rounded-lg border border-steelLine bg-ink px-3 py-2 text-paper"
          >
            {NETWORKS.map((n) => (
              <option key={n} value={n}>
                {n.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="focus-ring rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-signalDeep disabled:opacity-50"
        >
          {dict.topupButton}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-signal">{error}</p>}

      {deposit && (
        <div className="mt-5 rounded-xl border border-steelLine bg-ink p-4">
          <p className="text-sm text-paper/60">{dict.topupHint}</p>
          <p className="mt-3 font-mono text-sm text-paper">
            {deposit.payAmount} USDT ({deposit.network.toUpperCase()})
          </p>
          <p className="mt-1 break-all font-mono text-xs text-signal">
            {deposit.payAddress}
          </p>
          <p className="mt-3 text-sm">
            {status === "pending" && (
              <span className="text-paper/50">⏳ Waiting for network confirmation…</span>
            )}
            {status === "review" && (
              <span className="text-paper/50">🔍 Under manual review…</span>
            )}
            {status === "confirmed" && (
              <span className="text-signal">✓ Confirmed — balance updated</span>
            )}
            {status === "failed" && (
              <span className="text-signal">Deposit failed or expired.</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
