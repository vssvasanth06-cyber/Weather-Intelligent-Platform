from sqlalchemy.orm import Session

from app.database.models import (
    SensorReading,
    Device
)


def get_weather_summary(
    device_id: str,
    db: Session
):

    latest_reading = db.query(
        SensorReading
    ).filter(
        SensorReading.device_id == device_id
    ).order_by(
        SensorReading.id.desc()
    ).first()

    device = db.query(
        Device
    ).filter(
        Device.device_id == device_id
    ).first()

    if not latest_reading:
        return {
            "message": "No sensor data found"
        }

    return {
        "device_id": device_id,
        "device_name": device.device_name,
        "location": device.location,
        "status": device.status,
        "temperature": latest_reading.temperature,
        "humidity": latest_reading.humidity,
        "pressure": latest_reading.pressure,
        "rainfall": latest_reading.rainfall,
        "wind_speed": latest_reading.wind_speed,
        "timestamp": latest_reading.timestamp
    }