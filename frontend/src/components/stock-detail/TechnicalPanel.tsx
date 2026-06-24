"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { StockDetail } from "@/types/stock";
import { getRsiColor, cn, formatNumber } from "@/lib/utils";

function RsiGauge({ rsi }: { rsi: number | null }) {
  if (rsi == null) return <span className="text-slate-400 text-sm">—</span>;
  const label = rsi < 30 ? "Oversold" : rsi > 70 ? "Overbought" : rsi < 40 ? "Near Oversold" : rsi > 60 ? "Near Overbought" : "Neutral";
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "text-4xl font-bold font-mono tabular-nums tracking-tight",
          rsi < 30 ? "text-blue-600" : rsi > 70 ? "text-red-600" : "text-slate-800"
        )}
      >
        {rsi.toFixed(1)}
      </span>
      <span className={cn("rounded-md px-2.5 py-1 text-xs font-semibold", getRsiColor(rsi))}>
        {label}
      </span>
    </div>
  );
}

function SmaRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-xs font-semibold font-mono tabular-nums text-slate-700">
        {value != null ? value.toLocaleString("id-ID") : "—"}
      </span>
    </div>
  );
}

export function TechnicalPanel({ detail }: { detail: StockDetail }) {
  const macdData = detail.macd_history.slice(-30);

  return (
    <div className="space-y-3">
      {/* RSI */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">RSI (14)</p>
        <RsiGauge rsi={detail.rsi} />

        {/* Moving averages */}
        <div className="mt-3 pt-3 border-t border-slate-50">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Moving Averages</p>
          <SmaRow label="SMA 20" value={detail.sma20} />
          <SmaRow label="SMA 50" value={detail.sma50} />
          <SmaRow label="SMA 200" value={detail.sma200} />
          <SmaRow label="EMA 12" value={detail.ema12} />
          <SmaRow label="EMA 26" value={detail.ema26} />
        </div>
      </div>

      {/* MACD */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">MACD (12 / 26 / 9)</p>
        <div className="flex gap-4 mb-3">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 mb-0.5">MACD</p>
            <p className="text-sm font-bold font-mono tabular-nums text-slate-800">{formatNumber(detail.macd, 2)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 mb-0.5">Signal</p>
            <p className="text-sm font-bold font-mono tabular-nums text-slate-800">{formatNumber(detail.macd_signal, 2)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 mb-0.5">Hist</p>
            <p className={cn(
              "text-sm font-bold font-mono tabular-nums",
              (detail.macd_histogram ?? 0) > 0 ? "text-emerald-600" : "text-red-500"
            )}>
              {formatNumber(detail.macd_histogram, 2)}
            </p>
          </div>
        </div>
        {macdData.length > 0 && (
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={macdData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} width={38} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                formatter={(v) => (typeof v === "number" ? v.toFixed(2) : v)}
              />
              <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
              <Bar dataKey="histogram" name="Histogram" radius={[2, 2, 0, 0]}>
                {macdData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={(entry.histogram ?? 0) >= 0 ? "#10b981" : "#f43f5e"}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
