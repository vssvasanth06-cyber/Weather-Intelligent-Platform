from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database.dependencies import get_db
from app.analytics.analytics_service import (
    get_daily_averages,
    get_statistics,
    get_hourly_trend
)
from app.core.limiter import limiter

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/daily/{device_id}")
@limiter.limit("60/minute")
def daily_averages(
    request: Request,
    device_id: str,
    days: int = 7,
    db: Session = Depends(get_db)
):
    return get_daily_averages(device_id, days, db)


@router.get("/statistics/{device_id}")
@limiter.limit("60/minute")
def statistics(
    request: Request,
    device_id: str,
    db: Session = Depends(get_db)
):
    return get_statistics(device_id, db)


@router.get("/hourly/{device_id}")
@limiter.limit("60/minute")
def hourly_trend(
    request: Request,
    device_id: str,
    hours: int = 24,
    db: Session = Depends(get_db)
):
    return get_hourly_trend(device_id, hours, db)
