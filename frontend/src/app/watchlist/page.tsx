"use client";
import useSWR from "swr";
import { useWatchlist } from "@/hooks/useWatchlist";
import { WatchlistTable } from "@/components/watchlist/WatchlistTable";
import { fetchAllStocks } from "@/lib/api";
import { StockSummary } from "@/types/stock";
import { Skeleton } from "@/components/ui/skeleton";

export default function WatchlistPage() {
  const { watchlist, isLoading: wlLoading, remove } = useWatchlist();
  const { data: allStocks, isLoading: stocksLoading } = useSWR<StockSummary[]>(
    "stocks:all",
    fetchAllStocks,
    { revalidateOnFocus: false }
  );

  const isLoading = wlLoading || stocksLoading;

  const stockMap = new Map((allStocks ?? []).map((s) => [s.ticker, s]));
  const displayStocks: StockSummary[] = watchlist.map((item) =>
    stockMap.get(item.ticker) ?? {
      ticker: item.ticker,
      name: item.name,
      sector: item.sector,
      price: null,
      change_pct: null,
      market_cap: null,
      pe_ratio: null,
      pb_ratio: null,
      roe: null,
      revenue_growth: null,
      dividend_yield: null,
      volume: null,
      rsi: null,
    }
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Watchlist</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {watchlist.length > 0
            ? `Tracking ${watchlist.length} stock${watchlist.length !== 1 ? "s" : ""}`
            : "Stocks you are tracking"}
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-3.5 w-14" />
              <Skeleton className="h-3.5 w-44" />
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3.5 w-14" />
            </div>
          ))}
        </div>
      ) : (
        <WatchlistTable stocks={displayStocks} onRemove={remove} />
      )}
    </div>
  );
}
