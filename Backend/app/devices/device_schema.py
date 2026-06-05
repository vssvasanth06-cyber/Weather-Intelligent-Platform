from pydantic import BaseModel


class DeviceRegister(BaseModel):
    device_id: str
    device_name: str
    location: str
    owner_id: int