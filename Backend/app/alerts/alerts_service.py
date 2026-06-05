from sqlalchemy.orm import Session

from app.database.models import SensorReading


def get_alerts(
    device_id: str,
    db: Session
):

    latest_reading = (
        db.query(SensorReading)
        .filter(
            SensorReading.device_id == device_id
        )
        .order_by(
            SensorReading.id.desc()
        )
        .first()
    )

    if not latest_reading:
        return []

    alerts = []

    # Temperature Alerts
    if latest_reading.temperature > 40:
        alerts.append({
            "type": "EXTREME_HEAT",
            "message": "Extreme heat detected"
        })

    elif latest_reading.temperature > 35:
        alerts.append({
            "type": "HIGH_TEMPERATURE",
            "message": "High temperature detected"
        })

    # Humidity Alerts
    if latest_reading.humidity < 20:
        alerts.append({
            "type": "LOW_HUMIDITY",
            "message": "Dry weather condition"
        })

    elif latest_reading.humidity > 90:
        alerts.append({
            "type": "HIGH_HUMIDITY",
            "message": "Very high humidity detected"
        })

    # Rainfall Alerts
    if latest_reading.rainfall > 0.8:
        alerts.append({
            "type": "HEAVY_RAIN",
            "message": "Heavy rainfall detected"
        })

    # Wind Alerts
    if latest_reading.wind_speed > 8:
        alerts.append({
            "type": "HIGH_WIND",
            "message": "Strong wind detected"
        })

    return alerts