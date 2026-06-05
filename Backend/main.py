from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import engine
from app.database.models import Base

from app.auth.auth_router import router as auth_router

from app.api.admin_routes import router as admin_router
from app.api.farmer_routes import router as farmer_router
from app.api.analyst_routes import router as analyst_router

from app.devices.device_router import router as device_router
from app.sensors.sensor_router import router as sensor_router

from app.dashboard.dashboard_router import router as dashboard_router


# Create Database Tables
Base.metadata.create_all(bind=engine)


# Create FastAPI Application
app = FastAPI(
    title="Weather Intelligence Platform",
    version="1.0.0"
)


# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Home Route
@app.get("/")
def home():
    return {
        "message": "Weather Intelligence Platform API Running"
    }


# Authentication Routes
app.include_router(auth_router)

# Role-Based Routes
app.include_router(admin_router)
app.include_router(farmer_router)
app.include_router(analyst_router)

# Device Management Routes
app.include_router(device_router)

# Sensor Routes
app.include_router(sensor_router)

# Dashboard Routes
app.include_router(dashboard_router)