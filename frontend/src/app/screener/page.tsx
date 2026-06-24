"use client";
import { useScreener } from "@/hooks/useScreener";
import { FilterPanel } from "@/components/screener/FilterPanel";
import { FilterBadges } from "@/components/screener/FilterBadges";
import { StockTable } from "@/components/screener/StockTable";
import { ScreenerFilters } from "@/types/screener";

export default function ScreenerPage() {
  const { stocks, isLoading, filters, updateFilter, clearFilters, activeFilterCount } = useScreener();

  function removeFilter<K extends keyof ScreenerFilters>(key: K) {
    updateFilter(key, undefined as ScreenerFilters[K]);
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">IDX Stock Screener</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Filter Indonesia Stock Exchange equities by fundamental and technical criteria
        </p>
      </div>
      <div className="flex gap-5 items-start">
        <FilterPanel
          filters={filters}
          onChange={updateFilter}
          onClear={clearFilters}
          activeCount={activeFilterCount}
        />
        <div className="flex-1 min-w-0 space-y-2.5">
          <FilterBadges filters={filters} onRemove={removeFilter} />
          <StockTable stocks={stocks} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
