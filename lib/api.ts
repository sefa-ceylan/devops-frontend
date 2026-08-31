// One place that knows how to talk to the sales API. Every fetch in the app
// goes through here, so the base URL and error handling live in a single spot.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface Health {
  status: string;
  version: string;
  startedAt: string;
  checkedAt: string;
  uptimeSeconds: number;
  recordCount: number;
}

export interface Summary {
  from: string;
  to: string;
  dayCount: number;
  revenue: number;
  transactions: number;
  averageBasket: number;
  revenueChangePct: number | null;
  topCategory: { label: string; revenue: number };
}

export interface DailyPoint {
  date: string;
  revenue: number;
  transactions: number;
}

export interface CategoryRow {
  categoryId: string;
  label: string;
  revenue: number;
  units: number;
  sharePct: number;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  health: () => get<Health>("/api/health"),
  summary: (from: string, to: string) =>
    get<Summary>(`/api/sales/summary?from=${from}&to=${to}`),
  daily: (from: string, to: string) =>
    get<{ days: DailyPoint[] }>(`/api/sales/daily?from=${from}&to=${to}`),
  categories: (from: string, to: string) =>
    get<{ categories: CategoryRow[]; total: number }>(
      `/api/sales/categories?from=${from}&to=${to}`
    ),
};

export const BACKEND_URL = BASE_URL;