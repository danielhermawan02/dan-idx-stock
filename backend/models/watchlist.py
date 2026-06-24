from typing import Optional
from pydantic import BaseModel


class WatchlistItem(BaseModel):
    id: int
    ticker: str
    name: str
    sector: str
    added_at: str


class WatchlistAdd(BaseModel):
    ticker: str


class WatchlistResponse(BaseModel):
    items: list[WatchlistItem]
    count: int
