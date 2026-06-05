from sqlalchemy.orm import Session
from datetime import datetime

from app.database.models import AuditLog


def log_action(
    username: str,
    action: str,
    db: Session
):
    log = AuditLog(
        username=username,
        action=action,
        timestamp=str(datetime.utcnow())
    )

    db.add(log)
    db.commit()