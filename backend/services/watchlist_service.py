import aiosqlite
from db.database import DATABASE_URL, DB_PATH, get_pool


async def get_watchlist() -> list[dict]:
    if DATABASE_URL:
        async with get_pool().acquire() as conn:
            rows = await conn.fetch(
                "SELECT id, ticker, name, sector, added_at FROM watchlist ORDER BY added_at DESC"
            )
            return [dict(r) for r in rows]
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, ticker, name, sector, added_at FROM watchlist ORDER BY added_at DESC"
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def add_to_watchlist(ticker: str, name: str, sector: str) -> dict:
    if DATABASE_URL:
        async with get_pool().acquire() as conn:
            row = await conn.fetchrow(
                """
                INSERT INTO watchlist (ticker, name, sector)
                VALUES ($1, $2, $3)
                ON CONFLICT (ticker) DO UPDATE SET ticker = EXCLUDED.ticker
                RETURNING id, ticker, name, sector, added_at
                """,
                ticker, name, sector,
            )
            return dict(row)
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
    if DATABASE_URL:
        async with get_pool().acquire() as conn:
            result = await conn.execute(
                "DELETE FROM watchlist WHERE ticker = $1", ticker
            )
            return result.split()[-1] != "0"
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "DELETE FROM watchlist WHERE ticker = ?", (ticker,)
        )
        await db.commit()
        return cursor.rowcount > 0


async def is_in_watchlist(ticker: str) -> bool:
    if DATABASE_URL:
        async with get_pool().acquire() as conn:
            row = await conn.fetchrow(
                "SELECT 1 FROM watchlist WHERE ticker = $1", ticker
            )
            return row is not None
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "SELECT 1 FROM watchlist WHERE ticker = ?", (ticker,)
        )
        row = await cursor.fetchone()
        return row is not None
