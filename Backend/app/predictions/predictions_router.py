from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database.dependencies import get_db
from app.predictions.prediction_service import (
    get_predictions,
    get_weather_forecast_summary
)
from app.core.limiter import limiter

router = APIRouter(prefix="/predictions", tags=["ML Predictions"])


@router.get("/{device_id}")
@limiter.limit("30/minute")
def predictions(
    request: Request,
    device_id: str,
    db: Session = Depends(get_db)
):
    return get_predictions(device_id, db)


@router.get("/summary/{device_id}")
@limiter.limit("30/minute")
def forecast_summary(
    request: Request,
    device_id: str,
    db: Session = Depends(get_db)
):
    return get_weather_forecast_summary(device_id, db)
