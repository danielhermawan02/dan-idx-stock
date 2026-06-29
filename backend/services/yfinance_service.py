import time
import threading
import logging
from typing import Optional
import numpy as np
import pandas as pd
import requests
import yfinance as yf

from data.tickers import IDX_TICKERS, TICKER_SYMBOLS, TICKER_MAP
from services.cache_service import cache_get, cache_set

_fetch_lock = threading.Lock()
logger = logging.getLogger(__name__)
YAHOO_TIMEOUT = (5, 10)

# Shared session with browser headers to avoid Yahoo Finance rate-limit/crumb issues
_session = requests.Session()
_session.headers.update({
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://finance.yahoo.com/",
})

_YF_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1d&range={range}"
_YF_SUMMARY_URL = (
    "https://query1.finance.yahoo.com/v11/finance/quoteSummary/{ticker}"
    "?modules=defaultKeyStatistics,financialData,summaryDetail,assetProfile"
)
_YF_TIMESERIES_URL = "https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/{ticker}"
_TIMESERIES_TYPES = [
    "trailingMarketCap",
    "trailingPeRatio",
    "trailingPbRatio",
    "trailingDividendYield",
    "annualTotalRevenue",
    "quarterlyTotalRevenue",
    "annualNetIncome",
    "quarterlyNetIncome",
    "annualTotalAssets",
    "quarterlyTotalAssets",
    "annualTotalDebt",
    "quarterlyTotalDebt",
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _safe_float(value) -> Optional[float]:
    try:
        if value is None or (isinstance(value, float) and np.isnan(value)):
            return None
        return float(value)
    except Exception:
        return None


def _compute_rsi(close: pd.Series, period: int = 14) -> pd.Series:
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(com=period - 1, min_periods=period).mean()
    avg_loss = loss.ewm(com=period - 1, min_periods=period).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


def _compute_macd(close: pd.Series, fast=12, slow=26, signal=9):
    ema_fast = close.ewm(span=fast, adjust=False).mean()
    ema_slow = close.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram


def _fetch_chart(ticker: str, range_str: str = "5d") -> dict:
    """Fetch Yahoo Finance v8 chart data directly."""
    url = _YF_CHART_URL.format(ticker=ticker, range=range_str)
    r = _session.get(url, timeout=YAHOO_TIMEOUT)
    r.raise_for_status()
    data = r.json()
    results = data.get("chart", {}).get("result")
    if not results:
        raise ValueError(f"No chart data for {ticker}")
    return results[0]


def _fetch_quote_summary(ticker: str) -> dict:
    """Fetch Yahoo Finance quoteSummary for fundamentals."""
    url = _YF_SUMMARY_URL.format(ticker=ticker)
    r = _session.get(url, timeout=YAHOO_TIMEOUT)
    r.raise_for_status()
    data = r.json()
    qs = data.get("quoteSummary", {})
    if qs.get("error"):
        raise ValueError(qs["error"])
    result = qs.get("result")
    if not result:
        raise ValueError(f"No summary data for {ticker}")
    # Merge all modules into one flat dict
    merged = {}
    for module in result:
        merged.update(module)
    return merged


def _latest_timeseries_value(series: list[dict]) -> Optional[float]:
    if not series:
        return None
    latest = series[-1]
    if isinstance(latest, dict):
        if "reportedValue" in latest:
            return _extract_raw(latest.get("reportedValue"))
        return _safe_float(latest.get("dataValue"))
    return _safe_float(latest)


def _fetch_timeseries_fundamentals(ticker: str) -> dict:
    """Fetch lighter Yahoo fundamentals-timeseries data for IDX tickers.

    quoteSummary returns 404 for several .JK symbols, while this endpoint still
    returns commonly needed screener metrics.
    """
    period2 = int(time.time())
    period1 = period2 - 86400 * 800
    params = {
        "symbol": ticker,
        "type": ",".join(_TIMESERIES_TYPES),
        "period1": period1,
        "period2": period2,
    }
    r = _session.get(_YF_TIMESERIES_URL.format(ticker=ticker), params=params, timeout=YAHOO_TIMEOUT)
    r.raise_for_status()
    data = r.json()
    result = data.get("timeseries", {}).get("result") or []
    by_type = {
        key: _latest_timeseries_value(item.get(key) or [])
        for item in result
        for key in item
        if key not in {"meta", "timestamp"}
    }

    revenue = by_type.get("annualTotalRevenue") or by_type.get("quarterlyTotalRevenue")
    net_income = by_type.get("annualNetIncome") or by_type.get("quarterlyNetIncome")
    total_assets = by_type.get("quarterlyTotalAssets") or by_type.get("annualTotalAssets")
    total_debt = by_type.get("quarterlyTotalDebt") or by_type.get("annualTotalDebt")

    return {
        "pe_ratio": by_type.get("trailingPeRatio"),
        "pb_ratio": by_type.get("trailingPbRatio"),
        "roe": None,
        "market_cap": by_type.get("trailingMarketCap"),
        "revenue_growth": None,
        "dividend_yield": by_type.get("trailingDividendYield"),
        "revenue": revenue,
        "net_income": net_income,
        "total_assets": total_assets,
        "total_debt": total_debt,
    }


def _fetch_rsi(ticker: str, range_str: str = "1mo") -> Optional[float]:
    chart = _fetch_chart(ticker, range_str=range_str)
    closes_raw = chart.get("indicators", {}).get("quote", [{}])[0].get("close", [])
    closes = pd.Series([c for c in closes_raw if c is not None], dtype=float)
    if len(closes) < 15:
        return None
    return _safe_float(_compute_rsi(closes).iloc[-1])


def _extract_raw(obj) -> Optional[float]:
    """Extract 'raw' value from Yahoo Finance formatted number dicts."""
    if isinstance(obj, dict):
        return _safe_float(obj.get("raw"))
    return _safe_float(obj)


# ---------------------------------------------------------------------------
# Bulk price snapshot
# ---------------------------------------------------------------------------

def fetch_bulk_price_snapshot(tickers: list[str], delay: float = 0.3) -> dict[str, dict]:
    """Fetch price/change/volume for each ticker via direct API calls."""
    result: dict[str, dict] = {}
    for ticker in tickers:
        empty = {"price": None, "change_pct": None, "volume": None}
        try:
            chart = _fetch_chart(ticker, range_str="5d")
            meta = chart.get("meta", {})
            price = _safe_float(meta.get("regularMarketPrice"))
            prev_close = _safe_float(meta.get("previousClose") or meta.get("chartPreviousClose"))
            volume = _safe_float(meta.get("regularMarketVolume"))
            change_pct = (
                _safe_float((price - prev_close) / prev_close * 100)
                if price and prev_close and prev_close != 0 else None
            )
            result[ticker] = {"price": price, "change_pct": change_pct, "volume": volume}
        except Exception as exc:
            logger.warning("Failed to fetch price snapshot for %s: %s", ticker, exc)
            result[ticker] = empty
        time.sleep(delay)
    return result


# ---------------------------------------------------------------------------
# Fundamental batch
# ---------------------------------------------------------------------------

def fetch_fundamental_batch(tickers: list[str], delay: float = 1.0) -> dict[str, dict]:
    """Fetch fundamentals + RSI for each ticker sequentially."""
    result: dict[str, dict] = {}
    null_entry = {k: None for k in [
        "pe_ratio", "pb_ratio", "roe", "market_cap", "revenue_growth",
        "dividend_yield", "rsi", "description", "website", "employees",
        "revenue", "net_income", "total_assets", "total_debt",
    ]}

    for ticker in tickers:
        try:
            summary = _fetch_quote_summary(ticker)

            fin = summary.get("financialData", {})
            stats = summary.get("defaultKeyStatistics", {})
            detail = summary.get("summaryDetail", {})
            profile = summary.get("assetProfile", {})

            rsi_val = None
            try:
                rsi_val = _fetch_rsi(ticker)
            except Exception as exc:
                logger.warning("Failed to compute RSI for %s during fundamentals fetch: %s", ticker, exc)

            result[ticker] = {
                "pe_ratio": _extract_raw(detail.get("trailingPE")),
                "pb_ratio": _extract_raw(stats.get("priceToBook")),
                "roe": _extract_raw(fin.get("returnOnEquity")),
                "market_cap": _extract_raw(detail.get("marketCap") or summary.get("marketCap")),
                "revenue_growth": _extract_raw(fin.get("revenueGrowth")),
                "dividend_yield": _extract_raw(detail.get("dividendYield") or detail.get("trailingAnnualDividendYield")),
                "rsi": rsi_val,
                "description": profile.get("longBusinessSummary"),
                "website": profile.get("website"),
                "employees": profile.get("fullTimeEmployees"),
                "revenue": _extract_raw(fin.get("totalRevenue")),
                "net_income": _extract_raw(fin.get("netIncomeToCommon") or summary.get("netIncome")),
                "total_assets": _extract_raw(fin.get("totalAssets") or summary.get("totalAssets")),
                "total_debt": _extract_raw(fin.get("totalDebt") or summary.get("totalDebt")),
            }
        except Exception as exc:
            logger.warning("Failed to fetch quoteSummary fundamentals for %s: %s", ticker, exc)
            try:
                rsi_val = None
                try:
                    rsi_val = _fetch_rsi(ticker)
                except Exception as rsi_exc:
                    logger.warning("Failed to compute RSI for %s during fundamentals fallback: %s", ticker, rsi_exc)
                result[ticker] = {**null_entry, **_fetch_timeseries_fundamentals(ticker), "rsi": rsi_val}
            except Exception as fallback_exc:
                logger.warning("Failed to fetch timeseries fundamentals for %s: %s", ticker, fallback_exc)
                result[ticker] = null_entry.copy()
        time.sleep(delay)
    return result


# ---------------------------------------------------------------------------
# Technical indicators
# ---------------------------------------------------------------------------

def calculate_technical_indicators(ticker: str, period: str = "6mo") -> dict:
    """Compute RSI, MACD, SMA, EMA for a single ticker."""
    empty = {
        "rsi": None, "macd": None, "macd_signal": None, "macd_histogram": None,
        "sma20": None, "sma50": None, "sma200": None,
        "ema12": None, "ema26": None, "volume_sma20": None,
        "rsi_history": [], "macd_history": [],
    }
    try:
        chart = _fetch_chart(ticker, range_str=period)
        ts = chart.get("timestamp", [])
        quotes = chart.get("indicators", {}).get("quote", [{}])[0]
        closes_raw = quotes.get("close", [])
        volumes_raw = quotes.get("volume", [])

        closes = [c for c in closes_raw if c is not None]
        if len(closes) < 15:
            return empty

        close = pd.Series(closes, dtype=float)
        volume = pd.Series([v if v is not None else 0 for v in volumes_raw[:len(closes)]], dtype=float)

        rsi = _compute_rsi(close)
        macd_line, signal_line, histogram = _compute_macd(close)

        sma20 = close.rolling(20).mean()
        sma50 = close.rolling(50).mean()
        sma200 = close.rolling(200).mean()
        ema12 = close.ewm(span=12, adjust=False).mean()
        ema26 = close.ewm(span=26, adjust=False).mean()
        vol_sma20 = volume.rolling(20).mean()

        # Build history arrays (last 60 points)
        tail = min(60, len(close))
        ts_tail = ts[-tail:] if ts else list(range(tail))
        import datetime
        def fmt_ts(t):
            try:
                return datetime.datetime.utcfromtimestamp(t).strftime("%Y-%m-%d")
            except Exception:
                return str(t)

        dates = [fmt_ts(t) for t in ts_tail]

        rsi_history = [
            {"date": d, "value": _safe_float(v)}
            for d, v in zip(dates, rsi.iloc[-tail:].values)
        ]
        macd_history = [
            {
                "date": d,
                "macd": _safe_float(m),
                "signal": _safe_float(s),
                "histogram": _safe_float(h),
            }
            for d, m, s, h in zip(
                dates,
                macd_line.iloc[-tail:].values,
                signal_line.iloc[-tail:].values,
                histogram.iloc[-tail:].values,
            )
        ]

        return {
            "rsi": _safe_float(rsi.iloc[-1]),
            "macd": _safe_float(macd_line.iloc[-1]),
            "macd_signal": _safe_float(signal_line.iloc[-1]),
            "macd_histogram": _safe_float(histogram.iloc[-1]),
            "sma20": _safe_float(sma20.iloc[-1]),
            "sma50": _safe_float(sma50.iloc[-1]),
            "sma200": _safe_float(sma200.iloc[-1]),
            "ema12": _safe_float(ema12.iloc[-1]),
            "ema26": _safe_float(ema26.iloc[-1]),
            "volume_sma20": _safe_float(vol_sma20.iloc[-1]),
            "rsi_history": rsi_history,
            "macd_history": macd_history,
        }
    except Exception as exc:
        logger.warning("Failed to calculate technical indicators for %s: %s", ticker, exc)
        return empty


# ---------------------------------------------------------------------------
# Price history
# ---------------------------------------------------------------------------

def fetch_price_history(ticker: str, period: str = "3mo") -> list[dict]:
    """Return OHLCV bars for chart rendering."""
    try:
        chart = _fetch_chart(ticker, range_str=period)
        ts = chart.get("timestamp", [])
        quotes = chart.get("indicators", {}).get("quote", [{}])[0]
        opens = quotes.get("open", [])
        highs = quotes.get("high", [])
        lows = quotes.get("low", [])
        closes = quotes.get("close", [])
        volumes = quotes.get("volume", [])

        import datetime
        bars = []
        for i, t in enumerate(ts):
            c = closes[i] if i < len(closes) else None
            if c is None:
                continue
            date_str = datetime.datetime.utcfromtimestamp(t).strftime("%Y-%m-%d")
            bars.append({
                "date": date_str,
                "open": _safe_float(opens[i] if i < len(opens) else None),
                "high": _safe_float(highs[i] if i < len(highs) else None),
                "low": _safe_float(lows[i] if i < len(lows) else None),
                "close": _safe_float(c),
                "volume": _safe_float(volumes[i] if i < len(volumes) else None),
            })
        return bars
    except Exception as exc:
        logger.warning("Failed to fetch price history for %s (%s): %s", ticker, period, exc)
        return []


# ---------------------------------------------------------------------------
# Aggregated summary
# ---------------------------------------------------------------------------

def get_all_stocks_summary() -> list[dict]:
    """Cache-first fast load: bulk price only. Fundamentals/RSI filled by warm_cache."""
    cached = cache_get("stocks:summary")
    if cached is not None:
        return cached

    with _fetch_lock:
        cached = cache_get("stocks:summary")
        if cached is not None:
            return cached

        price_data = fetch_bulk_price_snapshot(TICKER_SYMBOLS)

        summaries = []
        for entry in IDX_TICKERS:
            ticker = entry["ticker"]
            price_info = price_data.get(ticker, {})
            summaries.append({
                "ticker": ticker,
                "name": entry["name"],
                "sector": entry["sector"],
                "price": price_info.get("price"),
                "change_pct": price_info.get("change_pct"),
                "volume": price_info.get("volume"),
                "rsi": None,
                "pe_ratio": None,
                "pb_ratio": None,
                "roe": None,
                "market_cap": None,
                "revenue_growth": None,
                "dividend_yield": None,
            })

        cache_set("stocks:summary", summaries)
        return summaries


def merge_fundamentals_into_summary(fundamentals: dict[str, dict]) -> None:
    """Update the cached summary in-place with fetched fundamental data."""
    cached = cache_get("stocks:summary")
    if cached is None:
        return
    updated = []
    for stock in cached:
        ticker = stock["ticker"]
        fund = fundamentals.get(ticker, {})
        updated.append({**stock, **{k: fund.get(k) for k in [
            "pe_ratio", "pb_ratio", "roe", "market_cap",
            "revenue_growth", "dividend_yield", "rsi",
        ]}})
    cache_set("stocks:summary", updated)


# ---------------------------------------------------------------------------
# Stock detail
# ---------------------------------------------------------------------------

def get_stock_detail(ticker: str) -> Optional[dict]:
    """Cache-first full detail for one ticker."""
    cache_key = f"stock:{ticker}:detail"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    if ticker not in TICKER_MAP:
        return None

    entry = TICKER_MAP[ticker]
    summary_stocks = cache_get("stocks:summary") or []
    summary_fallback = next(
        (stock for stock in summary_stocks if stock.get("ticker") == ticker),
        {},
    )

    price = summary_fallback.get("price")
    change_pct = summary_fallback.get("change_pct")
    volume = summary_fallback.get("volume")
    market_cap = summary_fallback.get("market_cap")
    fin = stats = detail_data = profile = {}

    try:
        chart_5d = _fetch_chart(ticker, range_str="5d")
        meta = chart_5d.get("meta", {})
        price = _safe_float(meta.get("regularMarketPrice")) or price
        prev_close = _safe_float(meta.get("previousClose") or meta.get("chartPreviousClose"))
        change_pct = (
            _safe_float((price - prev_close) / prev_close * 100)
            if price and prev_close and prev_close != 0 else None
        ) or change_pct
        volume = _safe_float(meta.get("regularMarketVolume")) or volume
        market_cap = _safe_float(meta.get("marketCap")) or market_cap
    except Exception as exc:
        logger.warning("Failed to fetch latest chart data for %s: %s", ticker, exc)

    try:
        summary = _fetch_quote_summary(ticker)
        fin = summary.get("financialData", {})
        stats = summary.get("defaultKeyStatistics", {})
        detail_data = summary.get("summaryDetail", {})
        profile = summary.get("assetProfile", {})
        market_cap = _extract_raw(detail_data.get("marketCap")) or market_cap
    except Exception as exc:
        logger.warning("Failed to fetch quote summary for %s: %s", ticker, exc)
        try:
            timeseries = _fetch_timeseries_fundamentals(ticker)
            market_cap = timeseries.get("market_cap") or market_cap
        except Exception as fallback_exc:
            logger.warning("Failed to fetch timeseries fundamentals for %s: %s", ticker, fallback_exc)
            timeseries = {}
    else:
        timeseries = {}

    technicals = calculate_technical_indicators(ticker, period="6mo")
    price_history = fetch_price_history(ticker, period="1y")

    detail = {
        "ticker": ticker,
        "name": entry["name"],
        "sector": entry["sector"],
        "price": price,
        "change_pct": change_pct,
        "market_cap": market_cap,
        "pe_ratio": _extract_raw(detail_data.get("trailingPE")) or timeseries.get("pe_ratio") or summary_fallback.get("pe_ratio"),
        "pb_ratio": _extract_raw(stats.get("priceToBook")) or timeseries.get("pb_ratio") or summary_fallback.get("pb_ratio"),
        "roe": _extract_raw(fin.get("returnOnEquity")) or timeseries.get("roe") or summary_fallback.get("roe"),
        "revenue_growth": _extract_raw(fin.get("revenueGrowth")) or timeseries.get("revenue_growth") or summary_fallback.get("revenue_growth"),
        "dividend_yield": (
            _extract_raw(detail_data.get("dividendYield") or detail_data.get("trailingAnnualDividendYield"))
            or timeseries.get("dividend_yield")
            or summary_fallback.get("dividend_yield")
        ),
        "volume": volume,
        "description": profile.get("longBusinessSummary"),
        "website": profile.get("website"),
        "employees": profile.get("fullTimeEmployees"),
        "revenue": _extract_raw(fin.get("totalRevenue")) or timeseries.get("revenue"),
        "net_income": _extract_raw(fin.get("netIncomeToCommon")) or timeseries.get("net_income"),
        "total_assets": _extract_raw(fin.get("totalAssets")) or timeseries.get("total_assets"),
        "total_debt": _extract_raw(fin.get("totalDebt")) or timeseries.get("total_debt"),
        "price_history": price_history,
        **technicals,
    }
    if any(detail.get(key) is not None for key in ("price", "market_cap", "pe_ratio", "pb_ratio", "roe", "rsi")):
        cache_set(cache_key, detail)
    return detail
