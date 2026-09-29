"""Storage service: MinIO S3 wrapper with seamless local filesystem fallback."""
from __future__ import annotations

import io
import os
import shutil
from pathlib import Path
from typing import BinaryIO, Optional, Union

import structlog

from app.config import settings

logger = structlog.get_logger()

# Local storage fallback directory
LOCAL_STORAGE_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "storage"
LOCAL_STORAGE_DIR.mkdir(parents=True, exist_ok=True)


class StorageService:
    def __init__(self):
        self._minio_client = None
        self._bucket_name = settings.MINIO_BUCKET
        self._init_client()

    def _init_client(self):
        """Initialize MinIO client if reachable, else fall back to local disk."""
        try:
            from minio import Minio
            from urllib.parse import urlparse

            endpoint = settings.MINIO_ENDPOINT
            host = endpoint.split(":")[0]
            if host in ("minio", "none") or host not in ("localhost", "127.0.0.1"):
                # Fast local storage fallback when MinIO container is not running
                self._minio_client = None
                logger.info("Using local storage fallback", path=str(LOCAL_STORAGE_DIR))
                return

            client = Minio(
                endpoint,
                access_key=settings.MINIO_ACCESS_KEY,
                secret_key=settings.MINIO_SECRET_KEY,
                secure=settings.MINIO_SECURE,
            )
            # Test bucket
            if not client.bucket_exists(self._bucket_name):
                client.make_bucket(self._bucket_name)
            self._minio_client = client
            logger.info("MinIO storage initialized", endpoint=endpoint, bucket=self._bucket_name)
        except Exception as e:
            self._minio_client = None
            logger.info("MinIO unreachable, using local storage fallback", path=str(LOCAL_STORAGE_DIR), reason=str(e))

    def _get_local_path(self, key: str) -> Path:
        """Resolve key to a safe local path."""
        clean_key = key.replace("\\", "/").lstrip("/")
        target = LOCAL_STORAGE_DIR / clean_key
        target.parent.mkdir(parents=True, exist_ok=True)
        return target

    def upload_bytes(self, key: str, data: bytes, content_type: str = "image/png") -> str:
        """Upload raw bytes to storage and return storage key."""
        if self._minio_client:
            try:
                stream = io.BytesIO(data)
                self._minio_client.put_object(
                    self._bucket_name,
                    key,
                    stream,
                    length=len(data),
                    content_type=content_type,
                )
                return key
            except Exception as e:
                logger.warning("MinIO upload failed, falling back to local disk", key=key, error=str(e))

        # Local fallback
        local_path = self._get_local_path(key)
        local_path.write_bytes(data)
        return key

    def upload_file(self, key: str, file_path: Union[str, Path], content_type: str = "image/png") -> str:
        """Upload a file from disk to storage."""
        path = Path(file_path)
        data = path.read_bytes()
        return self.upload_bytes(key, data, content_type=content_type)

    def get_bytes(self, key: str) -> bytes:
        """Fetch bytes from storage."""
        if self._minio_client:
            try:
                response = self._minio_client.get_object(self._bucket_name, key)
                try:
                    return response.read()
                finally:
                    response.close()
                    response.release_conn()
            except Exception as e:
                logger.warning("MinIO get failed, trying local fallback", key=key, error=str(e))

        # Local fallback
        local_path = self._get_local_path(key)
        if not local_path.exists():
            raise FileNotFoundError(f"Storage object not found: {key}")
        return local_path.read_bytes()

    def exists(self, key: str) -> bool:
        """Check if an object exists."""
        if self._minio_client:
            try:
                self._minio_client.stat_object(self._bucket_name, key)
                return True
            except Exception:
                pass
        local_path = self._get_local_path(key)
        return local_path.exists()

    def delete(self, key: str) -> bool:
        """Delete an object from storage."""
        deleted = False
        if self._minio_client:
            try:
                self._minio_client.remove_object(self._bucket_name, key)
                deleted = True
            except Exception:
                pass
        local_path = self._get_local_path(key)
        if local_path.exists():
            local_path.unlink()
            deleted = True
        return deleted


# Global singleton
storage_service = StorageService()
