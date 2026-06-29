import os
import aiosqlite

DATABASE_URL = os.getenv("DATABASE_URL")
# asyncpg requires postgresql://, Railway may provide postgres://
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

DB_PATH = os.path.join(os.path.dirname(__file__), "watchlist.db")

_pool = None  # asyncpg pool when using Postgres


async def init_db() -> None:
    global _pool
    if DATABASE_URL:
        import asyncpg
        _pool = await asyncpg.create_pool(DATABASE_URL)
        async with _pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS watchlist (
                    id        SERIAL PRIMARY KEY,
                    ticker    TEXT NOT NULL UNIQUE,
                    name      TEXT NOT NULL,
                    sector    TEXT NOT NULL,
                    added_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            """)
    else:
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS watchlist (
                    id        INTEGER PRIMARY KEY AUTOINCREMENT,
                    ticker    TEXT    NOT NULL UNIQUE,
                    name      TEXT    NOT NULL,
                    sector    TEXT    NOT NULL,
                    added_at  TEXT    NOT NULL DEFAULT (datetime('now'))
                )
            """)
            await db.commit()


def get_pool():
    return _pool
