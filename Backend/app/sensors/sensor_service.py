from sqlalchemy.orm import Session

from app.database.models import (
    SensorReading,
    Device
)


def save_sensor_data(
    device_id: str,
    temperature: float,
    humidity: float,
    pressure: float,
    rainfall: float,
    wind_speed: float,
    db: Session,
    light_intensity: float = 0.0
):

    device = db.query(
        Device
    ).filter(
        Device.device_id == device_id
    ).first()

    if not device:

        return {
            "message": "Invalid Device"
        }

    reading = SensorReading(
        device_id=device_id,
        temperature=temperature,
        humidity=humidity,
        pressure=pressure,
        rainfall=rainfall,
        wind_speed=wind_speed,
        light_intensity=light_intensity
    )

    db.add(reading)

    db.commit()

    db.refresh(reading)

    return {
        "message": "Sensor data stored successfully"
    }


def get_all_sensor_data(
    db: Session
):

    readings = db.query(
        SensorReading
    ).all()

    return readings


def get_device_sensor_data(
    device_id: str,
    db: Session
):

    readings = db.query(
        SensorReading
    ).filter(
        SensorReading.device_id == device_id
    ).all()

    return readings


def get_latest_sensor_data(
    device_id: str,
    db: Session
):

    reading = db.query(
        SensorReading
    ).filter(
        SensorReading.device_id == device_id
    ).order_by(
        SensorReading.id.desc()
    ).first()

    return reading