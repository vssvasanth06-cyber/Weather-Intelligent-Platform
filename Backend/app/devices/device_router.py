from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.devices.device_schema import DeviceRegister

from app.devices.device_service import (
    register_device,
    get_all_devices
)

from app.database.dependencies import get_db

router = APIRouter(
    prefix="/devices",
    tags=["Devices"]
)


@router.post("/register")
def register(
    device: DeviceRegister,
    db: Session = Depends(get_db)
):
    return register_device(
        device.device_id,
        device.device_name,
        device.location,
        device.owner_id,
        db
    )


@router.get("/")
def get_devices(
    db: Session = Depends(get_db)
):
    return get_all_devices(db)