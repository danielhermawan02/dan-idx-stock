export interface PriceBar {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
}

export interface IndicatorPoint {
  date: string;
  value: number | null;
}

export interface MACDPoint {
  date: string;
  macd: number | null;
  signal: number | null;
  histogram: number | null;
}

export interface StockSummary {
  ticker: string;
  name: string;
  sector: string;
  price: number | null;
  change_pct: number | null;
  market_cap: number | null;
  pe_ratio: number | null;
  pb_ratio: number | null;
  roe: number | null;
  revenue_growth: number | null;
  dividend_yield: number | null;
  volume: number | null;
  rsi: number | null;
}

export interface StockDetail extends StockSummary {
  macd: number | null;
  macd_signal: number | null;
  macd_histogram: number | null;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  ema12: number | null;
  ema26: number | null;
  volume_sma20: number | null;
  description: string | null;
  website: string | null;
  employees: number | null;
  revenue: number | null;
  net_income: number | null;
  total_assets: number | null;
  total_debt: number | null;
  price_history: PriceBar[];
  rsi_history: IndicatorPoint[];
  macd_history: MACDPoint[];
}
