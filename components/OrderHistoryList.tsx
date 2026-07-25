import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/locales";

type Order = {
  id: string;
  country_key: string;
  quantity: number;
  amount_usd: number;
  status: string;
  download_token: string | null;
  created_at: string;
};

export function OrderHistoryList({
  orders,
  locale,
  dict,
}: {
  orders: Order[];
  locale: Locale;
  dict: Dictionary["account"];
}) {
  if (orders.length === 0) {
    return <p className="mt-3 text-sm text-paper/50">{dict.noOrders}</p>;
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-steelLine">
      <table className="w-full text-sm">
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-steelLine/60 last:border-0">
              <td className="px-4 py-3 text-paper/70">
                {o.country_key} × {o.quantity}
              </td>
              <td className="px-4 py-3 font-mono text-signal">
                ${Number(o.amount_usd).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-paper/50">{o.status}</td>
              <td className="px-4 py-3 text-xs text-paper/40">
                {new Date(o.created_at).toLocaleString(locale)}
              </td>
              <td className="px-4 py-3 text-right">
                {o.download_token && (
                  <a
                    href={`/api/downloads/${o.download_token}`}
                    className="focus-ring text-xs text-signal underline underline-offset-4"
                  >
                    {dict.viewReceipt}
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
