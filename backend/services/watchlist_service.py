from typing import Optional
import aiosqlite
from db.database import DB_PATH


async def get_watchlist() -> list[dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, ticker, name, sector, added_at FROM watchlist ORDER BY added_at DESC"
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def add_to_watchlist(ticker: str, name: str, sector: str) -> dict:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT OR IGNORE INTO watchlist (ticker, name, sector) VALUES (?, ?, ?)",
            (ticker, name, sector),
        )
        await db.commit()
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, ticker, name, sector, added_at FROM watchlist WHERE ticker = ?",
            (ticker,),
        )
        row = await cursor.fetchone()
        return dict(row)


async def remove_from_watchlist(ticker: str) -> bool:
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "DELETE FROM watchlist WHERE ticker = ?", (ticker,)
        )
        await db.commit()
        return cursor.rowcount > 0


async def is_in_watchlist(ticker: str) -> bool:
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "SELECT 1 FROM watchlist WHERE ticker = ?", (ticker,)
        )
        row = await cursor.fetchone()
        return row is not None
