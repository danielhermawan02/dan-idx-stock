"use client";
import { ScreenerFilters } from "@/types/screener";
import { SECTORS } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, TrendingUp, Search, X } from "lucide-react";

interface Props {
  filters: ScreenerFilters;
  onChange: <K extends keyof ScreenerFilters>(key: K, value: ScreenerFilters[K]) => void;
  onClear: () => void;
  activeCount: number;
}

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1.5 pt-1">
      <Icon className="h-3.5 w-3.5 text-blue-600" />
      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function RangeInput({
  label,
  minKey,
  maxKey,
  filters,
  onChange,
  placeholder,
}: {
  label: string;
  minKey: keyof ScreenerFilters;
  maxKey: keyof ScreenerFilters;
  filters: ScreenerFilters;
  onChange: Props["onChange"];
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-slate-500">{label}</Label>
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          placeholder={placeholder ?? "Min"}
          className="h-7 text-xs px-2 bg-slate-50 border-slate-200 focus:border-blue-400"
          value={(filters[minKey] as number) ?? ""}
          onChange={(e) =>
            onChange(minKey, e.target.value === "" ? undefined : Number(e.target.value))
          }
        />
        <span className="text-slate-300 text-xs shrink-0">-</span>
        <Input
          type="number"
          placeholder="Max"
          className="h-7 text-xs px-2 bg-slate-50 border-slate-200 focus:border-blue-400"
          value={(filters[maxKey] as number) ?? ""}
          onChange={(e) =>
            onChange(maxKey, e.target.value === "" ? undefined : Number(e.target.value))
          }
        />
      </div>
    </div>
  );
}

function MinInput({
  label,
  filterKey,
  filters,
  onChange,
  placeholder,
}: {
  label: string;
  filterKey: keyof ScreenerFilters;
  filters: ScreenerFilters;
  onChange: Props["onChange"];
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-slate-500">{label}</Label>
      <Input
        type="number"
        placeholder={placeholder ?? "Min value"}
        className="h-7 text-xs px-2 bg-slate-50 border-slate-200 focus:border-blue-400"
        value={(filters[filterKey] as number) ?? ""}
        onChange={(e) =>
          onChange(filterKey, e.target.value === "" ? undefined : Number(e.target.value))
        }
      />
    </div>
  );
}

export function FilterPanel({ filters, onChange, onClear, activeCount }: Props) {
  const rsiMin = filters.rsi_min ?? 0;
  const rsiMax = filters.rsi_max ?? 100;

  return (
    <aside className="w-60 shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4 text-blue-700" />
          <h2 className="font-semibold text-sm text-slate-800">Filters</h2>
          {activeCount > 0 && (
            <span className="text-[10px] font-bold bg-blue-600 text-white rounded-full px-1.5 py-0.5 leading-none">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Search */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-500 flex items-center gap-1">
            <Search className="h-3 w-3" /> Search
          </Label>
          <Input
            placeholder="Name or ticker..."
            className="h-7 text-xs px-2 bg-slate-50 border-slate-200 focus:border-blue-400"
            value={filters.search ?? ""}
            onChange={(e) => onChange("search", e.target.value || undefined)}
          />
        </div>

        {/* Sector */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Sector</Label>
          <Select
            value={filters.sector ?? "All"}
            onValueChange={(v) => onChange("sector", !v || v === "All" ? undefined : v)}
          >
            <SelectTrigger className="h-7 text-xs bg-slate-50 border-slate-200">
              <SelectValue placeholder="All sectors" />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Divider + section */}
        <div className="border-t border-slate-100 pt-1 space-y-3">
          <SectionHeader icon={SlidersHorizontal} label="Fundamental" />
          <RangeInput label="P/E Ratio" minKey="pe_min" maxKey="pe_max" filters={filters} onChange={onChange} />
          <RangeInput label="P/B Ratio" minKey="pb_min" maxKey="pb_max" filters={filters} onChange={onChange} />
          <MinInput label="ROE (%)" filterKey="roe_min" filters={filters} onChange={onChange} placeholder="e.g. 15" />
          <MinInput label="Revenue Growth (%)" filterKey="revenue_growth_min" filters={filters} onChange={onChange} placeholder="e.g. 10" />
          <MinInput label="Dividend Yield (%)" filterKey="dividend_yield_min" filters={filters} onChange={onChange} placeholder="e.g. 2" />
        </div>

        {/* Technical */}
        <div className="border-t border-slate-100 pt-1 space-y-3">
          <SectionHeader icon={TrendingUp} label="Technical" />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-500">RSI</Label>
              <span className="text-xs font-mono font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                {rsiMin}-{rsiMax}
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[rsiMin, rsiMax]}
              onValueChange={(vals) => {
                const values = Array.isArray(vals) ? vals : [vals];
                const min = values[0] as number;
                const max = (values[1] ?? 100) as number;
                onChange("rsi_min", min === 0 ? undefined : min);
                onChange("rsi_max", max === 100 ? undefined : max);
              }}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Oversold &lt;30</span>
              <span>&gt;70 Overbought</span>
            </div>
          </div>

          <MinInput label="Min Volume" filterKey="volume_min" filters={filters} onChange={onChange} placeholder="e.g. 1000000" />
        </div>
      </div>
    </aside>
  );
}
