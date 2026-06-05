from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dashboard.dashboard_service import (
    get_weather_summary
)

from app.database.dependencies import get_db

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/weather-summary/{device_id}")
def weather_summary(
    device_id: str,
    db: Session = Depends(get_db)
):

    return get_weather_summary(
        device_id,
        db
    )