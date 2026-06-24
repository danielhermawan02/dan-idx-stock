import threading
from typing import Any, Optional
from cachetools import TTLCache

CACHE_TTL = 900  # 15 minutes
_cache: TTLCache = TTLCache(maxsize=500, ttl=CACHE_TTL)
_lock = threading.Lock()


def cache_get(key: str) -> Optional[Any]:
    with _lock:
        return _cache.get(key)


def cache_set(key: str, value: Any) -> None:
    with _lock:
        _cache[key] = value


def cache_delete(key: str) -> None:
    with _lock:
        _cache.pop(key, None)


def cache_clear_all() -> None:
    with _lock:
        _cache.clear()


def cache_size() -> int:
    with _lock:
        return len(_cache)
