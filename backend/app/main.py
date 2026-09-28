"""BhuLekh-AI — FastAPI application entry point."""
from __future__ import annotations

import time
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.db import init_db

log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("startup", env=settings.APP_ENV)
    await init_db()
    yield
    log.info("shutdown")


app = FastAPI(
    title="BhuLekh-AI API",
    description=(
        "Intelligent Land Record Digitization and Validation System — "
        "Hackathon Prototype. Real-world accuracy must be validated on actual state data."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    t0 = time.monotonic()
    response = await call_next(request)
    elapsed = round((time.monotonic() - t0) * 1000, 1)
    log.info("request", method=request.method, path=request.url.path, status=response.status_code, ms=elapsed)
    return response


# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "version": "0.1.0",
        "env": settings.APP_ENV,
        "note": "Hackathon prototype — not for production use without further validation.",
    }


# ── API routers ────────────────────────────────────────────────────────────────
from app.api import (  # noqa: E402
    auth,
    documents,
    review,
    records,
    graph,
    gis,
    stats,
    audit,
    rules,
    model as model_api,
    notifications,
    export,
    public,
    lrms_mock,
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(review.router, prefix="/api/review", tags=["Review"])
app.include_router(records.router, prefix="/api/records", tags=["Records"])
app.include_router(graph.router, prefix="/api/graph", tags=["Ownership Graph"])
app.include_router(gis.router, prefix="/api/gis", tags=["GIS"])
app.include_router(stats.router, prefix="/api/stats", tags=["Statistics"])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit"])
app.include_router(rules.router, prefix="/api/rules", tags=["Validation Rules"])
app.include_router(model_api.router, prefix="/api/model", tags=["Model / Learning"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(export.router, prefix="/api/export", tags=["Export"])
app.include_router(public.router, prefix="/api/public", tags=["Public"])
app.include_router(lrms_mock.router, prefix="/mock-lrms", tags=["Mock LRMS"])
