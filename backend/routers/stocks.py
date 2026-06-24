from fastapi import APIRouter, HTTPException, Query
from models.stock import StockSummary, StockDetail, PriceBar
from services.yfinance_service import get_all_stocks_summary, get_stock_detail, fetch_price_history
from data.tickers import TICKER_MAP

router = APIRouter(tags=["stocks"])


@router.get("/stocks", response_model=list[StockSummary])
async def list_stocks():
    return get_all_stocks_summary()


@router.get("/stocks/{ticker}", response_model=StockDetail)
async def get_stock(ticker: str):
    ticker = ticker.upper()
    if ticker not in TICKER_MAP:
        raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found")
    detail = get_stock_detail(ticker)
    if detail is None:
        raise HTTPException(status_code=503, detail="Failed to fetch stock data")
    return detail


@router.get("/stocks/{ticker}/history", response_model=list[PriceBar])
async def get_history(
    ticker: str,
    period: str = Query(default="3mo", pattern="^(1mo|3mo|6mo|1y|2y)$"),
):
    ticker = ticker.upper()
    if ticker not in TICKER_MAP:
        raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found")
    return fetch_price_history(ticker, period)
