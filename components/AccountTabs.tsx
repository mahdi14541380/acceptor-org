"use client";

import { useState, type ReactNode } from "react";

export function AccountTabs({
  tabs,
  defaultTab,
}: {
  tabs: { key: string; label: string; content: ReactNode }[];
  defaultTab?: string;
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key);

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-steelLine/60 pb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`focus-ring rounded-full border px-4 py-2 text-sm transition ${
              t.key === active
                ? "border-signal bg-signal text-paper"
                : "border-steelLine bg-steel text-paper/70 hover:border-paper/40 hover:text-paper"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tabs.map((t) => (
          <div key={t.key} className={t.key === active ? "block" : "hidden"}>
            {t.content}
          </div>
        ))}
      </div>
    </div>
  );
}
