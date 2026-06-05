from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime
)

from sqlalchemy.orm import (
    relationship,
    declarative_base
)

from datetime import datetime

Base = declarative_base()


# =========================
# Roles Table
# =========================
class Role(Base):
    __tablename__ = "roles"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    role_name = Column(
        String,
        unique=True,
        nullable=False
    )

    users = relationship(
        "User",
        back_populates="role"
    )


# =========================
# Users Table
# =========================
class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        unique=True,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String,
        nullable=False
    )

    role_id = Column(
        Integer,
        ForeignKey("roles.id")
    )

    # Account Lockout Fields
    failed_attempts = Column(
        Integer,
        default=0
    )

    is_locked = Column(
        Integer,
        default=0
    )

    role = relationship(
        "Role",
        back_populates="users"
    )


# =========================
# Audit Logs Table
# =========================
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(String)

    action = Column(String)

    timestamp = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================
# Security Events Table
# =========================
class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    event_type = Column(String)

    severity = Column(String)

    description = Column(String)

    timestamp = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================
# Devices Table
# =========================
class Device(Base):
    __tablename__ = "devices"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    device_id = Column(
        String,
        unique=True,
        nullable=False
    )

    device_name = Column(
        String,
        nullable=False
    )

    location = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        default="ACTIVE"
    )

    owner_id = Column(
        Integer,
        ForeignKey("users.id")
    )


# =========================
# Sensor Readings Table
# =========================
class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    device_id = Column(
        String,
        ForeignKey("devices.device_id")
    )

    temperature = Column(Float)

    humidity = Column(Float)

    pressure = Column(Float)

    rainfall = Column(Float)

    wind_speed = Column(Float)

    light_intensity = Column(Float, default=0.0)

    timestamp = Column(
        DateTime,
        default=datetime.utcnow
    )