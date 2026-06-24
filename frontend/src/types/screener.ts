export interface ScreenerFilters {
  pe_min?: number;
  pe_max?: number;
  pb_min?: number;
  pb_max?: number;
  roe_min?: number;
  market_cap_min?: number;
  market_cap_max?: number;
  revenue_growth_min?: number;
  dividend_yield_min?: number;
  rsi_min?: number;
  rsi_max?: number;
  volume_min?: number;
  sector?: string;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
