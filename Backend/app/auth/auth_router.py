from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth.schemas import UserRegister

from app.auth.auth_service import (
    register_user,
    login_user
)

from app.database.dependencies import get_db


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


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
    return login_user(
        form_data.username,
        form_data.password,
        db
    )