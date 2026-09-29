"""Application configuration via pydantic-settings."""
from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    APP_ENV: Literal["development", "production", "test"] = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    MAX_UPLOAD_SIZE_MB: int = 50

    # DB
    DATABASE_URL: str = "postgresql+asyncpg://bhulekh:bhulekh_dev@postgres:5432/bhulekh"
    DATABASE_URL_SYNC: str = "postgresql://bhulekh:bhulekh_dev@postgres:5432/bhulekh"

    # Redis / Celery
    REDIS_URL: str = "redis://redis:6379/0"
    CELERY_BROKER_URL: str = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/1"
    CELERY_WORKERS: int = 2

    # MinIO
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "bhulekh"
    MINIO_SECURE: bool = False

    # Auth
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for demo session stability
    JWT_REFRESH_EXPIRE_DAYS: int = 14

    # Feature flags
    ENABLE_TROCR: bool = False
    ENABLE_NER: bool = False
    ENABLE_VLM_FALLBACK: bool = False
    ENABLE_YOLO: bool = False

    # Thresholds
    AUTO_ACCEPT_THRESHOLD: float = 0.90
    CRITICAL_FIELD_THRESHOLD: float = 0.92
    REVIEW_THRESHOLD: float = 0.75

    # Localisation
    DEFAULT_LANG: str = "hi"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
