"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import useSWR from "swr";
import { screenStocks } from "@/lib/api";
import { ScreenerFilters } from "@/types/screener";
import { StockSummary } from "@/types/stock";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useScreener() {
  const [filters, setFilters] = useState<ScreenerFilters>({
    sort_by: "market_cap",
    sort_order: "desc",
  });

  const debouncedFilters = useDebounce(filters, 500);

  const swrKey = ["screen", JSON.stringify(debouncedFilters)];

  const { data: stocks, isLoading, error, mutate } = useSWR<StockSummary[]>(
    swrKey,
    () => screenStocks(debouncedFilters),
    { keepPreviousData: true }
  );

  const updateFilter = useCallback(<K extends keyof ScreenerFilters>(
    key: K,
    value: ScreenerFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ sort_by: "market_cap", sort_order: "desc" });
  }, []);

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => {
    if (k === "sort_by" || k === "sort_order") return false;
    return v !== undefined && v !== null && v !== "";
  }).length;

  return {
    stocks: stocks ?? [],
    isLoading,
    error,
    filters,
    updateFilter,
    setFilters,
    clearFilters,
    activeFilterCount,
    refresh: mutate,
  };
}
