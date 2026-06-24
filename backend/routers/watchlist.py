from fastapi import APIRouter, HTTPException
from models.watchlist import WatchlistItem, WatchlistAdd
from services.watchlist_service import get_watchlist, add_to_watchlist, remove_from_watchlist
from data.tickers import TICKER_MAP

router = APIRouter(tags=["watchlist"])


@router.get("/watchlist", response_model=list[WatchlistItem])
async def list_watchlist():
    return await get_watchlist()


@router.post("/watchlist", response_model=WatchlistItem, status_code=201)
async def add_watchlist(body: WatchlistAdd):
    ticker = body.ticker.upper()
    if ticker not in TICKER_MAP:
        raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found")
    entry = TICKER_MAP[ticker]
    item = await add_to_watchlist(ticker, entry["name"], entry["sector"])
    return item


@router.delete("/watchlist/{ticker}", status_code=204)
async def remove_watchlist(ticker: str):
    removed = await remove_from_watchlist(ticker.upper())
    if not removed:
        raise HTTPException(status_code=404, detail=f"Ticker {ticker} not in watchlist")
