from pydantic import BaseModel


class SensorData(BaseModel):

    device_id: str

    temperature: float

    humidity: float

    pressure: float

    rainfall: float

    wind_speed: float