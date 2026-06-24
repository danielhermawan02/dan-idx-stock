"use client";
import { ScreenerFilters } from "@/types/screener";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Props {
  filters: ScreenerFilters;
  onRemove: <K extends keyof ScreenerFilters>(key: K) => void;
}

function badge(label: string, key: keyof ScreenerFilters, onRemove: Props["onRemove"]) {
  return (
    <Badge key={key} variant="secondary" className="gap-1 pr-1 text-xs">
      {label}
      <button onClick={() => onRemove(key)} className="ml-0.5 hover:text-red-500">
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

export function FilterBadges({ filters, onRemove }: Props) {
  const badges: React.ReactNode[] = [];

  if (filters.pe_min !== undefined || filters.pe_max !== undefined) {
    const label = `P/E: ${filters.pe_min ?? ""}–${filters.pe_max ?? ""}`;
    badges.push(badge(label, "pe_min", onRemove));
    if (filters.pe_max !== undefined) badges.push(badge("", "pe_max", onRemove));
  }
  if (filters.pb_min !== undefined || filters.pb_max !== undefined) {
    badges.push(badge(`P/B: ${filters.pb_min ?? ""}–${filters.pb_max ?? ""}`, "pb_min", onRemove));
    if (filters.pb_max !== undefined) badges.push(badge("", "pb_max", onRemove));
  }
  if (filters.roe_min !== undefined)
    badges.push(badge(`ROE ≥ ${filters.roe_min}%`, "roe_min", onRemove));
  if (filters.revenue_growth_min !== undefined)
    badges.push(badge(`Rev. Growth ≥ ${filters.revenue_growth_min}%`, "revenue_growth_min", onRemove));
  if (filters.dividend_yield_min !== undefined)
    badges.push(badge(`Div. Yield ≥ ${filters.dividend_yield_min}%`, "dividend_yield_min", onRemove));
  if (filters.rsi_min !== undefined)
    badges.push(badge(`RSI ≥ ${filters.rsi_min}`, "rsi_min", onRemove));
  if (filters.rsi_max !== undefined)
    badges.push(badge(`RSI ≤ ${filters.rsi_max}`, "rsi_max", onRemove));
  if (filters.volume_min !== undefined)
    badges.push(badge(`Vol ≥ ${filters.volume_min}`, "volume_min", onRemove));
  if (filters.sector)
    badges.push(badge(`Sector: ${filters.sector}`, "sector", onRemove));
  if (filters.search)
    badges.push(badge(`"${filters.search}"`, "search", onRemove));

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 py-2">
      {badges}
    </div>
  );
}
