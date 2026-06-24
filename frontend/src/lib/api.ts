import { StockSummary, StockDetail, PriceBar } from "@/types/stock";
import { ScreenerFilters } from "@/types/screener";
import { WatchlistItem } from "@/types/watchlist";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchAllStocks(): Promise<StockSummary[]> {
  return apiFetch<StockSummary[]>("/api/stocks");
}

export async function screenStocks(filters: ScreenerFilters): Promise<StockSummary[]> {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(filters)) {
    if (val !== undefined && val !== null && val !== "") {
      params.set(key, String(val));
    }
  }
  const qs = params.toString();
  return apiFetch<StockSummary[]>(`/api/screen${qs ? `?${qs}` : ""}`);
}

export async function fetchStockDetail(ticker: string): Promise<StockDetail> {
  return apiFetch<StockDetail>(`/api/stocks/${ticker}`);
}

export async function fetchPriceHistory(ticker: string, period: string): Promise<PriceBar[]> {
  return apiFetch<PriceBar[]>(`/api/stocks/${ticker}/history?period=${period}`);
}

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  return apiFetch<WatchlistItem[]>("/api/watchlist");
}

export async function addToWatchlist(ticker: string): Promise<WatchlistItem> {
  return apiFetch<WatchlistItem>("/api/watchlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticker }),
  });
}

export async function removeFromWatchlist(ticker: string): Promise<void> {
  await apiFetch<void>(`/api/watchlist/${ticker}`, { method: "DELETE" });
}
