from models.screen import ScreenFilters


def _passes(value, min_val, max_val=None) -> bool:
    """Return False only when a filter is set AND the value violates it."""
    if min_val is not None:
        if value is None or value < min_val:
            return False
    if max_val is not None:
        if value is None or value > max_val:
            return False
    return True


def apply_filters(stocks: list[dict], filters: ScreenFilters) -> list[dict]:
    result = []
    for s in stocks:
        if not _passes(s.get("pe_ratio"), filters.pe_min, filters.pe_max):
            continue
        if not _passes(s.get("pb_ratio"), filters.pb_min, filters.pb_max):
            continue
        if not _passes(s.get("roe"), filters.roe_min):
            continue
        if not _passes(s.get("market_cap"), filters.market_cap_min, filters.market_cap_max):
            continue
        if not _passes(s.get("revenue_growth"), filters.revenue_growth_min):
            continue
        if not _passes(s.get("dividend_yield"), filters.dividend_yield_min):
            continue
        if not _passes(s.get("rsi"), filters.rsi_min, filters.rsi_max):
            continue
        if not _passes(s.get("volume"), filters.volume_min):
            continue
        if filters.sector and filters.sector.lower() != "all":
            if s.get("sector", "").lower() != filters.sector.lower():
                continue
        if filters.search:
            q = filters.search.lower()
            if q not in s.get("ticker", "").lower() and q not in s.get("name", "").lower():
                continue
        result.append(s)
    return result


def sort_stocks(stocks: list[dict], sort_by: str, order: str) -> list[dict]:
    reverse = order.lower() == "desc"
    return sorted(
        stocks,
        key=lambda s: (s.get(sort_by) is None, s.get(sort_by) or 0),
        reverse=reverse,
    )
