from typing import Optional
from fastapi import APIRouter
from models.stock import StockSummary
from models.screen import ScreenFilters
from services.yfinance_service import get_all_stocks_summary
from services.screener_service import apply_filters, sort_stocks

router = APIRouter(tags=["screen"])


@router.get("/screen", response_model=list[StockSummary])
async def screen_stocks(
    pe_min: Optional[float] = None,
    pe_max: Optional[float] = None,
    pb_min: Optional[float] = None,
    pb_max: Optional[float] = None,
    roe_min: Optional[float] = None,
    market_cap_min: Optional[float] = None,
    market_cap_max: Optional[float] = None,
    revenue_growth_min: Optional[float] = None,
    dividend_yield_min: Optional[float] = None,
    rsi_min: Optional[float] = None,
    rsi_max: Optional[float] = None,
    volume_min: Optional[float] = None,
    sector: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "market_cap",
    sort_order: str = "desc",
):
    filters = ScreenFilters(
        pe_min=pe_min, pe_max=pe_max,
        pb_min=pb_min, pb_max=pb_max,
        roe_min=roe_min,
        market_cap_min=market_cap_min, market_cap_max=market_cap_max,
        revenue_growth_min=revenue_growth_min,
        dividend_yield_min=dividend_yield_min,
        rsi_min=rsi_min, rsi_max=rsi_max,
        volume_min=volume_min,
        sector=sector,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    stocks = get_all_stocks_summary()
    filtered = apply_filters(stocks, filters)
    return sort_stocks(filtered, filters.sort_by, filters.sort_order)
