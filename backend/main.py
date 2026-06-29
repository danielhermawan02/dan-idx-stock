import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from db.database import init_db
from services.yfinance_service import get_all_stocks_summary, fetch_fundamental_batch, merge_fundamentals_into_summary
from services.cache_service import cache_clear_all
from data.tickers import TICKER_SYMBOLS
from routers import stocks, screen, watchlist

scheduler = AsyncIOScheduler()


async def warm_cache() -> None:
    """Fetch all stock summaries then enrich with fundamentals in background."""
    loop = asyncio.get_event_loop()
    # Step 1: bulk price + RSI (fast)
    await loop.run_in_executor(None, get_all_stocks_summary)
    # Step 2: fundamentals (sequential, ~35s) — runs in thread, doesn't block
    fundamentals = await loop.run_in_executor(
        None, fetch_fundamental_batch, TICKER_SYMBOLS
    )
    merge_fundamentals_into_summary(fundamentals)
    print(f"[cache] Warmed {len(TICKER_SYMBOLS)} stocks with fundamentals.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    asyncio.create_task(warm_cache())
    scheduler.add_job(warm_cache, "interval", minutes=14, id="cache_refresh")
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(title="IDX Stock Screener API", version="1.0.0", lifespan=lifespan)

import os

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,https://dan-idx-stock.vercel.app",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stocks.router, prefix="/api")
app.include_router(screen.router, prefix="/api")
app.include_router(watchlist.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
