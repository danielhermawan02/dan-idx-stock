"use client";
import { useState } from "react";
import useSWR from "swr";
import { fetchStockDetail, fetchPriceHistory } from "@/lib/api";
import { StockDetail, PriceBar } from "@/types/stock";

export function useStockDetail(ticker: string) {
  const [period, setPeriod] = useState("3mo");

  const { data: detail, isLoading, error } = useSWR<StockDetail>(
    ticker ? `stock:${ticker}` : null,
    () => fetchStockDetail(ticker),
    { revalidateOnFocus: false }
  );

  const { data: history, isLoading: histLoading } = useSWR<PriceBar[]>(
    ticker ? `history:${ticker}:${period}` : null,
    () => fetchPriceHistory(ticker, period),
    { revalidateOnFocus: false }
  );

  return { detail, history: history ?? [], isLoading, histLoading, error, period, setPeriod };
}
