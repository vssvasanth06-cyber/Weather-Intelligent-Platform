from sqlalchemy.orm import Session

from app.database.models import (
    User,
    Device,
    AuditLog,
    SecurityEvent
)


def get_admin_statistics(
    db: Session
):

    total_users = db.query(User).count()

    total_devices = db.query(Device).count()

    total_audit_logs = db.query(
        AuditLog
    ).count()

    total_security_events = db.query(
        SecurityEvent
    ).count()

    return {
        "users": total_users,
        "devices": total_devices,
        "audit_logs": total_audit_logs,
        "security_events": total_security_events
    }
from app.database.models import (
    User,
    Device,
    AuditLog,
    SecurityEvent
)


def get_security_events(db):

    events = (
        db.query(SecurityEvent)
        .order_by(SecurityEvent.id.desc())
        .all()
    )

    return events


def get_audit_logs(db):

    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.id.desc())
        .all()
    )

    return logs