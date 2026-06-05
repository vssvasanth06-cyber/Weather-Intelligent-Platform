from sqlalchemy.orm import Session
from sqlalchemy import func, text
from datetime import datetime, timedelta
from app.database.models import SensorReading


def get_daily_averages(device_id: str, days: int, db: Session):
    since = datetime.utcnow() - timedelta(days=days)
    rows = db.query(
        func.date(SensorReading.timestamp).label("date"),
        func.avg(SensorReading.temperature).label("avg_temperature"),
        func.avg(SensorReading.humidity).label("avg_humidity"),
        func.avg(SensorReading.pressure).label("avg_pressure"),
        func.avg(SensorReading.rainfall).label("avg_rainfall"),
        func.avg(SensorReading.wind_speed).label("avg_wind_speed"),
        func.avg(SensorReading.light_intensity).label("avg_light"),
        func.max(SensorReading.temperature).label("max_temperature"),
        func.min(SensorReading.temperature).label("min_temperature"),
        func.count(SensorReading.id).label("reading_count")
    ).filter(
        SensorReading.device_id == device_id,
        SensorReading.timestamp >= since
    ).group_by(
        func.date(SensorReading.timestamp)
    ).order_by(
        func.date(SensorReading.timestamp)
    ).all()

    return [
        {
            "date": str(r.date),
            "avg_temperature": round(r.avg_temperature or 0, 2),
            "avg_humidity": round(r.avg_humidity or 0, 2),
            "avg_pressure": round(r.avg_pressure or 0, 2),
            "avg_rainfall": round(r.avg_rainfall or 0, 2),
            "avg_wind_speed": round(r.avg_wind_speed or 0, 2),
            "avg_light": round(r.avg_light or 0, 2),
            "max_temperature": round(r.max_temperature or 0, 2),
            "min_temperature": round(r.min_temperature or 0, 2),
            "reading_count": r.reading_count
        }
        for r in rows
    ]


def get_statistics(device_id: str, db: Session):
    total = db.query(func.count(SensorReading.id)).filter(
        SensorReading.device_id == device_id
    ).scalar()

    row = db.query(
        func.avg(SensorReading.temperature).label("avg_temp"),
        func.max(SensorReading.temperature).label("max_temp"),
        func.min(SensorReading.temperature).label("min_temp"),
        func.avg(SensorReading.humidity).label("avg_humidity"),
        func.avg(SensorReading.pressure).label("avg_pressure"),
        func.sum(SensorReading.rainfall).label("total_rainfall"),
        func.max(SensorReading.wind_speed).label("max_wind"),
        func.avg(SensorReading.wind_speed).label("avg_wind"),
    ).filter(SensorReading.device_id == device_id).first()

    if not row or not row.avg_temp:
        return {"message": "No data available"}

    return {
        "total_readings": total,
        "temperature": {
            "average": round(row.avg_temp, 2),
            "max": round(row.max_temp, 2),
            "min": round(row.min_temp, 2)
        },
        "humidity": {"average": round(row.avg_humidity, 2)},
        "pressure": {"average": round(row.avg_pressure, 2)},
        "rainfall": {"total": round(row.total_rainfall or 0, 2)},
        "wind_speed": {
            "average": round(row.avg_wind, 2),
            "max": round(row.max_wind, 2)
        }
    }


def get_hourly_trend(device_id: str, hours: int, db: Session):
    since = datetime.utcnow() - timedelta(hours=hours)
    rows = db.query(
        func.date_trunc('hour', SensorReading.timestamp).label("hour"),
        func.avg(SensorReading.temperature).label("avg_temperature"),
        func.avg(SensorReading.humidity).label("avg_humidity"),
        func.avg(SensorReading.pressure).label("avg_pressure"),
        func.avg(SensorReading.rainfall).label("avg_rainfall"),
        func.avg(SensorReading.wind_speed).label("avg_wind_speed"),
    ).filter(
        SensorReading.device_id == device_id,
        SensorReading.timestamp >= since
    ).group_by(
        func.date_trunc('hour', SensorReading.timestamp)
    ).order_by(
        func.date_trunc('hour', SensorReading.timestamp)
    ).all()

    return [
        {
            "hour": str(r.hour),
            "avg_temperature": round(r.avg_temperature or 0, 2),
            "avg_humidity": round(r.avg_humidity or 0, 2),
            "avg_pressure": round(r.avg_pressure or 0, 2),
            "avg_rainfall": round(r.avg_rainfall or 0, 2),
            "avg_wind_speed": round(r.avg_wind_speed or 0, 2),
        }
        for r in rows
    ]
