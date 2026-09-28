"""Database setup: async SQLAlchemy engine + session factory."""
from __future__ import annotations

import os
from pathlib import Path
from sqlalchemy import event, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


class Base(DeclarativeBase):
    pass


def _create_db_engine(db_url: str):
    is_sqlite = db_url.startswith("sqlite")
    if is_sqlite:
        eng = create_async_engine(db_url, echo=False)

        @event.listens_for(eng.sync_engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

        return eng

    return create_async_engine(
        db_url,
        pool_pre_ping=True,
        echo=False,
        pool_size=10,
        max_overflow=20,
    )


def _is_host_resolvable(url: str) -> bool:
    if url.startswith("sqlite"):
        return True
    try:
        from urllib.parse import urlparse
        import socket
        parsed = urlparse(url)
        hostname = parsed.hostname
        if not hostname or hostname in ("localhost", "127.0.0.1"):
            return True
        # Quick timeout test
        socket.gethostbyname(hostname)
        return True
    except Exception:
        return False


def _get_active_url() -> str:
    if not _is_host_resolvable(settings.DATABASE_URL):
        db_path = Path(__file__).resolve().parent.parent.parent / "data" / "bhulekh.db"
        db_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite+aiosqlite:///{db_path}"
    return settings.DATABASE_URL


_active_url = _get_active_url()
engine = _create_db_engine(_active_url)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def init_db():
    """Verify or initialize DB connection on startup."""
    global engine, AsyncSessionLocal
    try:
        async with engine.begin() as conn:
            if _active_url.startswith("sqlite"):
                import app.models  # noqa: F401
                await conn.run_sync(Base.metadata.create_all)
            else:
                await conn.run_sync(lambda c: c.execute(text("SELECT 1")))
    except Exception as e:
        import structlog
        logger = structlog.get_logger()
        logger.warning("Primary database unreachable, falling back to SQLite for local execution", error=str(e))
        db_path = Path(__file__).resolve().parent.parent.parent / "data" / "bhulekh.db"
        db_path.parent.mkdir(parents=True, exist_ok=True)
        sqlite_url = f"sqlite+aiosqlite:///{db_path}"
        engine = _create_db_engine(sqlite_url)
        AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
        async with engine.begin() as conn:
            import app.models  # noqa: F401
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Initialized local SQLite database", path=str(db_path))



async def get_db() -> AsyncSession:  # type: ignore[return]
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

