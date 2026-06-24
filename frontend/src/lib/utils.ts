import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number | null): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMarketCap(value: number | null): string {
  if (value == null) return "—";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toFixed(0)}`;
}

export function formatPercent(value: number | null, digits = 2): string {
  if (value == null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatNumber(value: number | null, digits = 2): string {
  if (value == null) return "—";
  return value.toFixed(digits);
}

export function formatVolume(value: number | null): string {
  if (value == null) return "—";
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
  return value.toFixed(0);
}

export function getRsiColor(rsi: number | null): string {
  if (rsi == null) return "bg-gray-100 text-gray-500";
  if (rsi < 30) return "bg-blue-100 text-blue-700";
  if (rsi < 40) return "bg-green-100 text-green-700";
  if (rsi > 70) return "bg-red-100 text-red-700";
  if (rsi > 60) return "bg-orange-100 text-orange-700";
  return "bg-gray-100 text-gray-600";
}

export function getChangeColor(value: number | null): string {
  if (value == null) return "text-gray-500";
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-500";
  return "text-gray-500";
}
