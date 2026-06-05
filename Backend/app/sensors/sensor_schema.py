from pydantic import BaseModel, Field


class SensorData(BaseModel):

    device_id: str

    temperature: float = Field(
        ge=-50,
        le=80
    )

    humidity: float = Field(
        ge=0,
        le=100
    )

    pressure: float = Field(
        ge=800,
        le=1200
    )

    rainfall: float = Field(
        ge=0,
        le=1000
    )

    wind_speed: float = Field(
        ge=0,
        le=300
    )

    light_intensity: float = Field(
        default=0.0,
        ge=0,
        le=100000
    )