from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.admin.admin_service import (
    get_admin_statistics,
    get_security_events,
    get_audit_logs
)

from app.database.dependencies import get_db

from app.admin.admin_service import (
    get_admin_statistics
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/statistics")
def admin_statistics(
    db: Session = Depends(get_db)
):

    return get_admin_statistics(db)
@router.get("/security-events")
def security_events(
    db: Session = Depends(get_db)
):
    return get_security_events(db)


@router.get("/audit-logs")
def audit_logs(
    db: Session = Depends(get_db)
):
    return get_audit_logs(db)