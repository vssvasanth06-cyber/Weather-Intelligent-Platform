from sqlalchemy.orm import Session
from app.database.models import Device


def register_device(
    device_id: str,
    device_name: str,
    location: str,
    owner_id: int,
    db: Session
):

    existing_device = db.query(Device).filter(
        Device.device_id == device_id
    ).first()

    if existing_device:
        return {
            "message": "Device already exists"
        }

    new_device = Device(
        device_id=device_id,
        device_name=device_name,
        location=location,
        owner_id=owner_id
    )

    db.add(new_device)
    db.commit()
    db.refresh(new_device)

    return {
        "message": "Device registered successfully"
    }


def get_all_devices(
    db: Session
):

    devices = db.query(Device).all()

    return devices