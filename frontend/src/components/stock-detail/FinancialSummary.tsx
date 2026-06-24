import { StockDetail } from "@/types/stock";
import { formatMarketCap } from "@/lib/utils";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-semibold font-mono tabular-nums text-slate-800">{value}</span>
    </div>
  );
}

export function FinancialSummary({ detail }: { detail: StockDetail }) {
  return (
    <div className="space-y-3">
      {detail.description && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">About</p>
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">{detail.description}</p>
          {detail.website && (
            <a
              href={detail.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline mt-2 block"
            >
              {detail.website}
            </a>
          )}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Financials</p>
        <Row label="Revenue" value={formatMarketCap(detail.revenue)} />
        <Row label="Net Income" value={formatMarketCap(detail.net_income)} />
        <Row label="Total Assets" value={formatMarketCap(detail.total_assets)} />
        <Row label="Total Debt" value={formatMarketCap(detail.total_debt)} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Company Info</p>
        <Row label="Sector" value={detail.sector} />
        <Row label="Employees" value={detail.employees?.toLocaleString() ?? "—"} />
        <Row label="Market Cap" value={formatMarketCap(detail.market_cap)} />
      </div>
    </div>
  );
}
