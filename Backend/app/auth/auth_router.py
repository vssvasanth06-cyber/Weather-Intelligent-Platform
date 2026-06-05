from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.auth.schemas import UserRegister
from app.auth.auth_service import register_user, login_user
from app.auth.jwt_handler import verify_token, create_access_token
from app.database.dependencies import get_db


router = APIRouter(prefix="/auth", tags=["Authentication"])


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):
    return register_user(
        user.username,
        user.email,
        user.password,
        user.role,
        db
    )


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    return login_user(form_data.username, form_data.password, db)


@router.post("/refresh")
def refresh_token(body: RefreshRequest):
    payload = verify_token(body.refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    new_access = create_access_token({
        "sub": payload["sub"],
        "role": payload["role"]
    })
    return {"access_token": new_access, "token_type": "bearer"}


@router.get("/health")
def health():
    return {"status": "ok"}