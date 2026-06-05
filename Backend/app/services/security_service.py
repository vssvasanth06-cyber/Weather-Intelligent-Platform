from sqlalchemy.orm import Session
from datetime import datetime

from app.database.models import SecurityEvent


def log_security_event(
    event_type: str,
    severity: str,
    description: str,
    db: Session
):
    event = SecurityEvent(
        event_type=event_type,
        severity=severity,
        description=description,
        timestamp=str(datetime.utcnow())
    )

    db.add(event)
    db.commit()