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
import { Trash2, ArrowUpDown, ArrowUp, ArrowDown, Star, TrendingUp, TrendingDown } from "lucide-react";
import { StockSummary } from "@/types/stock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatPrice,
  formatMarketCap,
  formatPercent,
  formatNumber,
  formatVolume,
  getRsiColor,
  cn,
} from "@/lib/utils";

const col = createColumnHelper<StockSummary>();

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (!sorted) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />;
  if (sorted === "asc") return <ArrowUp className="ml-1 h-3 w-3 text-blue-600" />;
  return <ArrowDown className="ml-1 h-3 w-3 text-blue-600" />;
}

function ChangePill({ value }: { value: number | null }) {
  if (value == null) return <span className="text-slate-400 text-xs">—</span>;
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

interface Props {
  stocks: StockSummary[];
  onRemove: (ticker: string) => Promise<void>;
}

export function WatchlistTable({ stocks, onRemove }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);

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
        <span className="text-sm text-slate-700 max-w-[180px] block truncate" title={info.getValue()}>
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
        <span className="text-sm font-mono tabular-nums text-slate-600">{formatMarketCap(info.getValue())}</span>
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
    col.accessor("rsi", {
      header: "RSI",
      cell: (info) => {
        const v = info.getValue();
        if (v == null) return <span className="text-slate-300 text-xs">—</span>;
        return (
          <span className={cn("rounded px-1.5 py-0.5 text-xs font-mono font-semibold tabular-nums", getRsiColor(v))}>
            {v.toFixed(1)}
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
    col.display({
      id: "remove",
      header: "",
      cell: (info) => (
        <button
          onClick={() => onRemove(info.row.original.ticker)}
          className="rounded p-1 text-slate-300 hover:text-red-500 transition-colors"
          title="Remove from watchlist"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    }),
  ];

  const table = useReactTable({
    data: stocks,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (stocks.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center py-24 gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-50">
          <Star className="h-6 w-6 text-amber-400" />
        </div>
        <p className="text-slate-600 text-sm font-medium">Your watchlist is empty</p>
        <p className="text-slate-400 text-xs">Add stocks by clicking the star icon in the screener</p>
        <Link
          href="/screener"
          className="mt-1 inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
        >
          Browse Screener
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-auto">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <span className="text-xs font-medium text-slate-500">
          <span className="font-bold text-slate-800 font-mono">{stocks.length}</span> watched
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
            <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-blue-50/40 transition-colors duration-150">
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
