from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.alerts.alerts_service import (
    get_alerts
)

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


@router.get("/{device_id}")
def alerts(
    device_id: str,
    db: Session = Depends(get_db)
):

    return get_alerts(
        device_id,
        db
    )