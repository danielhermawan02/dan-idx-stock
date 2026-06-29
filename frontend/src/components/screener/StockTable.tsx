"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { Star, ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";
import { StockSummary } from "@/types/stock";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatPrice,
  formatMarketCap,
  formatPercent,
  formatNumber,
  formatVolume,
  getRsiColor,
  cn,
} from "@/lib/utils";
import { useWatchlist } from "@/hooks/useWatchlist";

const col = createColumnHelper<StockSummary>();

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (!sorted) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />;
  if (sorted === "asc") return <ArrowUp className="ml-1 h-3 w-3 text-blue-600" />;
  return <ArrowDown className="ml-1 h-3 w-3 text-blue-600" />;
}

function ChangePill({ value }: { value: number | null }) {
  if (value == null) return <span className="text-slate-400 text-xs">-</span>;
  const isUp = value > 0;
  const isDown = value < 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium font-mono tabular-nums",
        isUp && "bg-emerald-50 text-emerald-700",
        isDown && "bg-red-50 text-red-600",
        !isUp && !isDown && "bg-slate-100 text-slate-500"
      )}
    >
      {isUp && <TrendingUp className="h-3 w-3" />}
      {isDown && <TrendingDown className="h-3 w-3" />}
      {formatPercent(value, 2)}
    </span>
  );
}

function WatchlistToggle({ ticker }: { ticker: string }) {
  const { isWatched, add, remove } = useWatchlist();
  const watched = isWatched(ticker);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (watched) {
          void remove(ticker);
        } else {
          void add(ticker);
        }
      }}
      className={cn(
        "rounded p-1 transition-colors",
        watched ? "text-amber-500 hover:text-amber-600" : "text-slate-200 hover:text-amber-400"
      )}
    >
      <Star className="h-4 w-4" fill={watched ? "currentColor" : "none"} />
    </button>
  );
}

const columns = [
  col.accessor("ticker", {
    header: "Ticker",
    cell: (info) => (
      <Link
        href={`/stocks/${info.getValue()}`}
        className="font-mono font-bold text-blue-700 hover:text-blue-900 hover:underline text-sm tracking-wide"
      >
        {info.getValue().replace(".JK", "")}
      </Link>
    ),
  }),
  col.accessor("name", {
    header: "Company",
    cell: (info) => (
      <span className="text-sm text-slate-700 max-w-[160px] block truncate" title={info.getValue()}>
        {info.getValue()}
      </span>
    ),
  }),
  col.accessor("sector", {
    header: "Sector",
    cell: (info) => (
      <Badge variant="secondary" className="text-[10px] whitespace-nowrap font-medium px-1.5 py-0.5">
        {info.getValue()}
      </Badge>
    ),
  }),
  col.accessor("price", {
    header: "Price",
    cell: (info) => (
      <span className="text-sm font-mono font-semibold text-slate-800 tabular-nums">
        {formatPrice(info.getValue())}
      </span>
    ),
  }),
  col.accessor("change_pct", {
    header: "Change",
    cell: (info) => <ChangePill value={info.getValue()} />,
  }),
  col.accessor("market_cap", {
    header: "Mkt Cap",
    cell: (info) => (
      <span className="text-sm text-slate-600 font-mono tabular-nums">{formatMarketCap(info.getValue())}</span>
    ),
  }),
  col.accessor("pe_ratio", {
    header: "P/E",
    cell: (info) => (
      <span className="text-sm font-mono tabular-nums text-slate-700">{formatNumber(info.getValue())}</span>
    ),
  }),
  col.accessor("pb_ratio", {
    header: "P/B",
    cell: (info) => (
      <span className="text-sm font-mono tabular-nums text-slate-700">{formatNumber(info.getValue())}</span>
    ),
  }),
  col.accessor("roe", {
    header: "ROE%",
    cell: (info) => {
      const v = info.getValue();
      return (
        <span className="text-sm font-mono tabular-nums text-slate-700">
          {v != null ? formatPercent(v * 100, 1) : "-"}
        </span>
      );
    },
  }),
  col.accessor("dividend_yield", {
    header: "Div%",
    cell: (info) => {
      const v = info.getValue();
      return (
        <span className="text-sm font-mono tabular-nums text-slate-700">
          {v != null ? formatPercent(v * 100, 1) : "-"}
        </span>
      );
    },
  }),
  col.accessor("volume", {
    header: "Volume",
    cell: (info) => (
      <span className="text-sm font-mono tabular-nums text-slate-500">{formatVolume(info.getValue())}</span>
    ),
  }),
  col.accessor("rsi", {
    header: "RSI",
    cell: (info) => {
      const v = info.getValue();
      if (v == null) return <span className="text-slate-300 text-xs">-</span>;
      return (
        <span className={cn("rounded px-1.5 py-0.5 text-xs font-mono font-semibold tabular-nums", getRsiColor(v))}>
          {v.toFixed(1)}
        </span>
      );
    },
  }),
  col.display({
    id: "watchlist",
    header: "",
    cell: (info) => <WatchlistToggle ticker={info.row.original.ticker} />,
  }),
];

interface Props {
  stocks: StockSummary[];
  isLoading: boolean;
}

export function StockTable({ stocks, isLoading }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table intentionally returns function-bearing table instances.
  const table = useReactTable({
    data: stocks,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="divide-y divide-slate-50">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-3.5 w-14" />
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3.5 w-14" />
              <Skeleton className="h-3.5 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center py-20 gap-2">
        <TrendingUp className="h-8 w-8 text-slate-300" />
        <p className="text-slate-400 text-sm font-medium">No stocks match the current filters</p>
        <p className="text-slate-300 text-xs">Try adjusting or clearing filters</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-auto">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <span className="text-xs font-medium text-slate-500">
          <span className="font-bold text-slate-800 font-mono">{stocks.length}</span> stocks
        </span>
      </div>
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-slate-100 bg-slate-50/60">
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:bg-slate-100 transition-colors"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <span className="flex items-center">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <SortIcon sorted={header.column.getIsSorted()} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-slate-50 last:border-0 hover:bg-blue-50/40 transition-colors duration-150"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2.5 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
