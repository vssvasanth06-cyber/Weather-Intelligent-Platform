from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.sensors.sensor_schema import SensorData
from app.sensors.sensor_service import (
    save_sensor_data,
    get_all_sensor_data,
    get_device_sensor_data,
    get_latest_sensor_data
)
from app.database.dependencies import get_db
from app.websocket.ws_manager import manager

router = APIRouter(
    prefix="/sensor",
    tags=["Sensor"]
)


@router.post("/upload")
async def upload_sensor_data(
    data: SensorData,
    db: Session = Depends(get_db)
):
    result = save_sensor_data(
        data.device_id,
        data.temperature,
        data.humidity,
        data.pressure,
        data.rainfall,
        data.wind_speed,
        db,
        data.light_intensity
    )

    # Broadcast to all WebSocket clients immediately
    await manager.broadcast({
        "device_id": data.device_id,
        "temperature": data.temperature,
        "humidity": data.humidity,
        "pressure": data.pressure,
        "rainfall": data.rainfall,
        "wind_speed": data.wind_speed,
        "light_intensity": data.light_intensity,
    })

    return result


@router.get("/all")
def get_all_readings(
    db: Session = Depends(get_db)
):
    return get_all_sensor_data(db)


@router.get("/device/{device_id}")
def get_device_readings(
    device_id: str,
    db: Session = Depends(get_db)
):
    return get_device_sensor_data(device_id, db)


@router.get("/latest/{device_id}")
def get_latest_reading(
    device_id: str,
    db: Session = Depends(get_db)
):
    return get_latest_sensor_data(device_id, db)
