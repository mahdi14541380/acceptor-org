import "server-only";

const BASE_URL = "https://api2.darimarket.online";

function apiKey() {
  const key = process.env.DARIMARKET_API_KEY;
  if (!key) throw new Error("DARIMARKET_API_KEY is not set");
  return key;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey(),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`darimarket ${path} failed: ${res.status} ${body}`);
  }

  return res.json() as Promise<T>;
}

export type UsdtNetwork = { code: string; name: string; [key: string]: unknown };

export function listUsdtNetworks() {
  return request<{ networks: UsdtNetwork[] }>("/v1/topup/usdt/networks");
}

export function listUsdtDeposits() {
  return request<{ deposits: unknown[] }>("/v1/topup/usdt");
}

export type UsdtDeposit = {
  deposit_id: number;
  address: string;
  network: string;
  expected_amount: number;
  timeout_minutes?: number;
  status: "pending" | "paid" | "expired" | "review" | "rejected";
  [key: string]: unknown;
};

// Matches POST /v1/topup/usdt exactly: { network: "trc20", amount: "100.00" }
// network must be lowercase ("trc20" / "bep20"); amount is a string with 2 decimals.
export function createUsdtDeposit(params: { network: string; amount: number }) {
  return request<UsdtDeposit>("/v1/topup/usdt", {
    method: "POST",
    body: JSON.stringify({
      network: params.network.toLowerCase(),
      amount: params.amount.toFixed(2),
    }),
  });
}

export function getUsdtDepositStatus(depositId: string | number) {
  return request<UsdtDeposit>(`/v1/topup/usdt/${depositId}`);
}

export type DarimarketProduct = {
  id: string; // e.g. "folder:56"
  kind: string; // e.g. "api_country"
  country_code: string;
  country_name: string;
  [key: string]: unknown;
};

export function listProducts(params: {
  q?: string;
  kind?: string;
  min_stock?: number;
  limit?: number;
  offset?: number;
} = {}) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.kind) search.set("kind", params.kind);
  if (params.min_stock !== undefined) search.set("min_stock", String(params.min_stock));
  search.set("limit", String(params.limit ?? 20));
  search.set("offset", String(params.offset ?? 0));
  return request<{ count: number; products: DarimarketProduct[] }>(
    `/v1/products?${search.toString()}`
  );
}

export function searchProducts(query: string) {
  return request<{ count: number; products: DarimarketProduct[] }>(
    `/v1/search?q=${encodeURIComponent(query)}`
  );
}

// Finds the darimarket product (folder) for a given country + tier.
// Confirmed kind values: "aged" = old tier (faster delivery),
// "api_country" = new tier (slower delivery).
export async function findProductIdForCountry(
  countryName: string,
  tier: "old" | "new"
): Promise<string | null> {
  const { products } = await listProducts({
    q: countryName,
    kind: tier === "old" ? "aged" : "api_country",
    min_stock: 1,
    limit: 5,
  });
  const exact = products.find(
    (p) => p.country_name?.toLowerCase() === countryName.toLowerCase()
  );
  return (exact ?? products[0])?.id ?? null;
}

export type BuyOrderResult = {
  order_id: number;
  status: "processing" | "failed" | string;
  product_id: string;
  requested: number;
  delivered: number;
  failed: number;
  unit_price: string;
  total: string;
  balance_after: string;
  delivered_file: boolean;
  ready: boolean;
  download: { url: string; token: string; expires_at: string; filename: string } | null;
  poll_url: string;
};

// quantity = number of Stars requested. items = [countryName] (confirmed — not a
// recipient username; darimarket has no recipient field in this endpoint).
export function buyProduct(params: {
  product_id: string;
  quantity: number;
  items: string[];
}) {
  return request<BuyOrderResult>("/v1/buy", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function getOrder(orderId: string | number) {
  return request<BuyOrderResult>(`/v1/orders/${orderId}`);
}

// Fetches the receipt/purchase file using the owner API key. The raw darimarket
// download URL requires X-Api-Key, so the customer's browser can never hit it
// directly — this must be called from our server and streamed to the customer.
export async function downloadFile(token: string): Promise<Response> {
  const res = await fetch(`${BASE_URL}/dl/${token}`, {
    headers: { "X-Api-Key": apiKey() },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`darimarket download failed: ${res.status}`);
  }
  return res;
}
