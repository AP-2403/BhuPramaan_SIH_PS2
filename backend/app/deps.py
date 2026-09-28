"""FastAPI dependencies: DB session, JWT auth, RBAC."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db import get_db
from app.models import User

import bcrypt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    pw_bytes = password.encode("utf-8")[:72]
    return bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        pw_bytes = plain.encode("utf-8")[:72]
        hash_bytes = hashed.encode("utf-8")
        return bcrypt.checkpw(pw_bytes, hash_bytes)
    except Exception:
        return False



def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.JWT_ACCESS_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None or payload.get("type") != "access":
            raise credentials_exc
    except JWTError:
        raise credentials_exc

    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exc
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]

ROLE_HIERARCHY = {
    "citizen": 0,
    "tehsil_operator": 1,
    "verifier": 2,
    "district_officer": 3,
    "state_officer": 4,
    "auditor": 4,
    "admin": 10,
}


def require_role(*roles: str):
    """Dependency factory: require any of the listed roles."""
    async def checker(user: CurrentUser) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail=f"Role '{user.role}' not permitted. Required: {roles}")
        return user
    return Depends(checker)


def require_min_role(min_role: str):
    """Dependency factory: require role >= min_role in hierarchy."""
    min_level = ROLE_HIERARCHY.get(min_role, 0)
    async def checker(user: CurrentUser) -> User:
        if ROLE_HIERARCHY.get(user.role, -1) < min_level:
            raise HTTPException(status_code=403, detail=f"Insufficient role. Minimum: {min_role}")
        return user
    return Depends(checker)
