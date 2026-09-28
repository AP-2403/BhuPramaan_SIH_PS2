"""Auth router: login, refresh, me."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.deps import (
    CurrentUser,
    create_access_token,
    create_refresh_token,
    verify_password,
)
from app.models import User

router = APIRouter()


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    username: str


class MeResponse(BaseModel):
    id: str
    username: str
    full_name: str | None
    role: str
    state_code: str | None
    district_code: str | None


@router.post("/login", response_model=TokenResponse)
async def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(User).where(User.username == form.username, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")

    token_data = {"sub": user.id, "role": user.role, "state": user.state_code, "district": user.district_code}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        role=user.role,
        username=user.username,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(current: CurrentUser):
    token_data = {"sub": current.id, "role": current.role, "state": current.state_code, "district": current.district_code}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        role=current.role,
        username=current.username,
    )


@router.get("/me", response_model=MeResponse)
async def me(current: CurrentUser):
    return MeResponse(
        id=current.id,
        username=current.username,
        full_name=current.full_name,
        role=current.role,
        state_code=current.state_code,
        district_code=current.district_code,
    )
