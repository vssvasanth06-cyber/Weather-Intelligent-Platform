import numpy as np
from sqlalchemy.orm import Session
from app.database.models import SensorReading


def _get_recent_readings(device_id: str, limit: int, db: Session):
    return db.query(SensorReading).filter(
        SensorReading.device_id == device_id
    ).order_by(SensorReading.id.desc()).limit(limit).all()


def _linear_forecast(values: list[float], steps: int = 3) -> list[float]:
    """Simple linear regression forecast."""
    if len(values) < 3:
        return [values[-1]] * steps if values else [0] * steps
    x = np.arange(len(values), dtype=float)
    y = np.array(values, dtype=float)
    coeffs = np.polyfit(x, y, 1)
    future_x = np.arange(len(values), len(values) + steps, dtype=float)
    return [round(float(np.polyval(coeffs, xi)), 2) for xi in future_x]


def _detect_anomalies(values: list[float]) -> list[bool]:
    """Flag values more than 2 std deviations from mean."""
    if len(values) < 5:
        return [False] * len(values)
    arr = np.array(values)
    mean, std = arr.mean(), arr.std()
    return [bool(abs(v - mean) > 2 * std) for v in values]


def _confidence(values: list[float]) -> int:
    """Higher confidence with more data and less variance."""
    if len(values) < 5:
        return 40
    cv = (np.std(values) / (np.mean(values) + 1e-9)) * 100
    score = max(40, min(95, int(100 - cv)))
    return score


def get_predictions(device_id: str, db: Session):
    readings = _get_recent_readings(device_id, 50, db)
    if not readings:
        return {"message": "Not enough data for predictions"}

    readings = list(reversed(readings))

    temps = [r.temperature for r in readings if r.temperature is not None]
    humidity = [r.humidity for r in readings if r.humidity is not None]
    rainfall = [r.rainfall for r in readings if r.rainfall is not None]
    wind = [r.wind_speed for r in readings if r.wind_speed is not None]

    temp_forecast = _linear_forecast(temps, 3)
    humidity_forecast = _linear_forecast(humidity, 3)
    rain_forecast = _linear_forecast(rainfall, 3)
    wind_forecast = _linear_forecast(wind, 3)

    temp_anomalies = _detect_anomalies(temps)
    anomaly_count = sum(temp_anomalies)

    rain_probability = min(100, int(
        (sum(1 for r in rainfall[-10:] if r > 0.1) / max(len(rainfall[-10:]), 1)) * 100
    ))

    return {
        "forecast": {
            "temperature": {
                "next_3_readings": temp_forecast,
                "trend": "rising" if temp_forecast[-1] > temps[-1] else "falling",
                "confidence": _confidence(temps)
            },
            "humidity": {
                "next_3_readings": humidity_forecast,
                "trend": "rising" if humidity_forecast[-1] > humidity[-1] else "falling",
                "confidence": _confidence(humidity)
            },
            "rainfall": {
                "next_3_readings": [max(0, r) for r in rain_forecast],
                "rain_probability_percent": rain_probability,
                "confidence": _confidence(rainfall)
            },
            "wind_speed": {
                "next_3_readings": [max(0, w) for w in wind_forecast],
                "trend": "rising" if wind_forecast[-1] > wind[-1] else "falling",
                "confidence": _confidence(wind)
            }
        },
        "anomaly_detection": {
            "anomalies_found": anomaly_count,
            "status": "ALERT" if anomaly_count > 2 else "NORMAL",
            "message": f"{anomaly_count} anomalous readings detected in last {len(temps)} samples"
        },
        "data_quality": {
            "total_samples": len(readings),
            "data_completeness": f"{len(temps)}/{len(readings)} valid"
        }
    }


def get_weather_forecast_summary(device_id: str, db: Session):
    readings = _get_recent_readings(device_id, 24, db)
    if not readings:
        return {"message": "Not enough data"}

    readings = list(reversed(readings))
    temps = [r.temperature for r in readings]
    rainfall = [r.rainfall for r in readings]
    wind = [r.wind_speed for r in readings]
    humidity = [r.humidity for r in readings]

    avg_temp = round(np.mean(temps), 1)
    avg_rain = round(np.mean(rainfall), 2)
    avg_wind = round(np.mean(wind), 1)
    avg_hum = round(np.mean(humidity), 1)

    # Simple weather condition classification
    if avg_rain > 0.5:
        condition = "Rainy"
        icon = "🌧️"
    elif avg_hum > 80:
        condition = "Cloudy"
        icon = "☁️"
    elif avg_temp > 35:
        condition = "Hot & Sunny"
        icon = "🌡️"
    elif avg_wind > 7:
        condition = "Windy"
        icon = "💨"
    else:
        condition = "Clear"
        icon = "🌤️"

    return {
        "condition": condition,
        "icon": icon,
        "summary": {
            "avg_temperature": avg_temp,
            "avg_humidity": avg_hum,
            "avg_rainfall": avg_rain,
            "avg_wind_speed": avg_wind
        },
        "based_on_readings": len(readings)
    }
