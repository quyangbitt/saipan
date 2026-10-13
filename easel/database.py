"""Optional MySQL API adapter.

The web app keeps its existing file based storage by default. Set DATABASE_URL
to enable the adapter, for example:
  mysql+pymysql://user:password@127.0.0.1:3306/easel
"""
from __future__ import annotations

import os
from contextlib import contextmanager
from urllib.parse import unquote, urlparse


def database_url() -> str:
    return os.environ.get("DATABASE_URL", "").strip()


def configured() -> bool:
    return bool(database_url())


def _settings() -> tuple[str, int, str, str, str]:
    raw = database_url()
    parsed = urlparse(raw)
    if parsed.scheme not in {"mysql", "mysql+pymysql"}:
        raise ValueError("DATABASE_URL must use mysql:// or mysql+pymysql://")
    return (
        parsed.hostname or "127.0.0.1",
        parsed.port or 3306,
        unquote(parsed.username or ""),
        unquote(parsed.password or ""),
        parsed.path.lstrip("/"),
    )


@contextmanager
def connection():
    """Yield a short lived PyMySQL connection for API handlers."""
    if not configured():
        raise RuntimeError("database is not configured")
    try:
        import pymysql
    except ImportError as exc:
        raise RuntimeError("PyMySQL is not installed") from exc
    host, port, user, password, name = _settings()
    conn = pymysql.connect(host=host, port=port, user=user, password=password,
                           database=name or None, connect_timeout=5,
                           charset="utf8mb4", cursorclass=pymysql.cursors.DictCursor)
    try:
        yield conn
    finally:
        conn.close()


def health() -> dict:
    if not configured():
        return {"configured": False, "connected": False, "driver": "pymysql"}
    with connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1 AS ok")
            row = cursor.fetchone()
    return {"configured": True, "connected": bool(row and row.get("ok") == 1), "driver": "pymysql"}
