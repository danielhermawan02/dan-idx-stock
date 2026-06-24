import os
import aiosqlite

DB_PATH = os.path.join(os.path.dirname(__file__), "watchlist.db")


async def init_db() -> None:
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


def get_db_path() -> str:
    return DB_PATH
