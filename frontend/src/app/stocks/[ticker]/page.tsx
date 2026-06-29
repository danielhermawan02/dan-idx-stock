"use client";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Star, StarOff, TrendingUp, TrendingDown } from "lucide-react";
import { useStockDetail } from "@/hooks/useStockDetail";
import { useWatchlist } from "@/hooks/useWatchlist";
import { PriceChart } from "@/components/stock-detail/PriceChart";
import { MetricsGrid } from "@/components/stock-detail/MetricsGrid";
import { TechnicalPanel } from "@/components/stock-detail/TechnicalPanel";
import { FinancialSummary } from "@/components/stock-detail/FinancialSummary";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PERIOD_OPTIONS } from "@/lib/constants";
import { formatPrice, formatPercent, cn } from "@/lib/utils";

export default function StockDetailPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = use(params);
  const decodedTicker = decodeURIComponent(ticker);
  const { detail, history, isLoading, histLoading, error, period, setPeriod } = useStockDetail(decodedTicker);
  const { isWatched, add, remove } = useWatchlist();

  const watched = isWatched(decodedTicker);
  const displayTicker = decodedTicker.replace(".JK", "");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-5 animate-pulse">
        <Skeleton className="h-4 w-28" />
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Link href="/screener" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Screener
        </Link>
        <div className="text-center py-24 rounded-xl border border-slate-200 bg-white">
          <p className="text-slate-400 text-sm">Could not load data for <strong className="text-slate-600">{displayTicker}</strong>.</p>
        </div>
      </div>
    );
  }

  const isUp = (detail.change_pct ?? 0) >= 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-4">
      {/* Back link */}
      <Link
        href="/screener"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Screener
      </Link>

      {/* Hero header card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-blue-700 via-blue-400 to-blue-200" />
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            {/* Name + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-blue-700 text-sm tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                {displayTicker}
              </span>
              <h1 className="text-lg font-bold text-slate-900">{detail.name}</h1>
              <Badge variant="secondary" className="text-xs">{detail.sector}</Badge>
            </div>
            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
                {formatPrice(detail.price)}
              </span>
              <span
                className={cn(
                  "flex items-center gap-1 text-sm font-semibold font-mono px-2 py-1 rounded mb-0.5",
                  isUp ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                )}
              >
                {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {detail.change_pct != null ? formatPercent(detail.change_pct, 2) : "—"}
              </span>
            </div>
          </div>

          <Button
            variant={watched ? "default" : "outline"}
            size="sm"
            className={cn(
              "self-start gap-1.5",
              watched && "bg-amber-500 hover:bg-amber-600 border-amber-500"
            )}
            onClick={() => watched ? remove(decodedTicker) : add(decodedTicker)}
          >
            {watched ? (
              <><StarOff className="h-4 w-4" /> Unwatch</>
            ) : (
              <><Star className="h-4 w-4" /> Add to Watchlist</>
            )}
          </Button>
        </div>
      </div>

      {/* Price Chart */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">Price History</h2>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={cn(
                  "px-3 py-1 text-xs rounded-md font-semibold transition-all",
                  period === opt.value
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {histLoading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : (
          <PriceChart history={history} />
        )}
      </div>

      {/* Metrics */}
      <MetricsGrid detail={detail} />

      {/* Technical + Financial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechnicalPanel detail={detail} />
        <FinancialSummary detail={detail} />
      </div>
    </div>
  );
}
