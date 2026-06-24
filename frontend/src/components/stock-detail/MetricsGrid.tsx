import { StockDetail } from "@/types/stock";
import { formatMarketCap, formatPercent, formatNumber, formatVolume } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function MetricCard({ label, value, highlight }: MetricCardProps) {
  return (
    <div className={`rounded-xl border p-4 bg-white shadow-sm flex flex-col gap-1 ${highlight ? "border-blue-200 bg-blue-50/30" : "border-slate-200"}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-base font-bold font-mono tabular-nums text-slate-800 tracking-tight">
        {value}
      </p>
    </div>
  );
}

export function MetricsGrid({ detail }: { detail: StockDetail }) {
  const metrics = [
    { label: "Market Cap", value: formatMarketCap(detail.market_cap) },
    { label: "P/E Ratio", value: formatNumber(detail.pe_ratio), highlight: detail.pe_ratio != null && detail.pe_ratio < 15 },
    { label: "P/B Ratio", value: formatNumber(detail.pb_ratio) },
    { label: "ROE", value: detail.roe != null ? formatPercent(detail.roe * 100, 1) : "—", highlight: detail.roe != null && detail.roe > 0.15 },
    { label: "Rev. Growth", value: detail.revenue_growth != null ? formatPercent(detail.revenue_growth * 100, 1) : "—" },
    { label: "Div. Yield", value: detail.dividend_yield != null ? formatPercent(detail.dividend_yield * 100, 2) : "—" },
    { label: "Volume", value: formatVolume(detail.volume) },
    { label: "RSI (14)", value: detail.rsi != null ? detail.rsi.toFixed(1) : "—" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {metrics.map((m) => (
        <MetricCard key={m.label} label={m.label} value={m.value} highlight={m.highlight} />
      ))}
    </div>
  );
}
