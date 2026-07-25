"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/getDictionary";

function TierInput({
  countryKey,
  tier,
  initialPrice,
  dict,
}: {
  countryKey: string;
  tier: "old" | "new";
  initialPrice: number;
  dict: Dictionary["admin"];
}) {
  const [value, setValue] = useState(initialPrice.toString());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countryKey, tier, price: Number(value) }),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="w-9 text-[11px] uppercase text-paper/40">
        {tier === "old" ? dict.tierOld : dict.tierNew}
      </span>
      <input
        type="number"
        step="0.01"
        min={0}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        className="focus-ring w-20 rounded-lg border border-steelLine bg-ink px-2 py-1.5 text-right font-mono text-sm text-paper"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="focus-ring rounded-full bg-signal px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-signalDeep disabled:opacity-50"
      >
        {saved ? dict.saved : dict.saveButton}
      </button>
    </div>
  );
}

export function AdminPriceEditor({
  countryKey,
  label,
  currentPriceOld,
  currentPriceNew,
  dict,
}: {
  countryKey: string;
  label: string;
  currentPriceOld: number;
  currentPriceNew: number;
  dict: Dictionary["admin"];
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-steelLine/60 px-4 py-3 last:border-0">
      <span className="text-sm text-paper/80">{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        <TierInput countryKey={countryKey} tier="old" initialPrice={currentPriceOld} dict={dict} />
        <TierInput countryKey={countryKey} tier="new" initialPrice={currentPriceNew} dict={dict} />
      </div>
    </div>
  );
}
