from datetime import datetime, timedelta
from jose import jwt, JWTError
from app.core.config import settings

ACCESS_EXPIRE_MINUTES = int(settings.ACCESS_TOKEN_EXPIRE_MINUTES or 60)
REFRESH_EXPIRE_DAYS = 7


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode.update({
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_EXPIRE_MINUTES),
        "type": "access"
    })
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode.update({
        "exp": datetime.utcnow() + timedelta(days=REFRESH_EXPIRE_DAYS),
        "type": "refresh"
    })
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(token: str, token_type: str = "access") -> dict | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != token_type:
            return None
        return payload
    except JWTError:
        return None
