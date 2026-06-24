from typing import Optional
from pydantic import BaseModel


class ScreenFilters(BaseModel):
    pe_min: Optional[float] = None
    pe_max: Optional[float] = None
    pb_min: Optional[float] = None
    pb_max: Optional[float] = None
    roe_min: Optional[float] = None
    market_cap_min: Optional[float] = None
    market_cap_max: Optional[float] = None
    revenue_growth_min: Optional[float] = None
    dividend_yield_min: Optional[float] = None
    rsi_min: Optional[float] = None
    rsi_max: Optional[float] = None
    volume_min: Optional[float] = None
    sector: Optional[str] = None
    search: Optional[str] = None
    sort_by: str = "market_cap"
    sort_order: str = "desc"
