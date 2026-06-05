from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.limiter import limiter
from app.database.connection import engine
from app.database.models import Base
from app.auth.auth_router import router as auth_router
from app.api.admin_routes import router as admin_router
from app.api.farmer_routes import router as farmer_router
from app.api.analyst_routes import router as analyst_router
from app.devices.device_router import router as device_router
from app.sensors.sensor_router import router as sensor_router
from app.dashboard.dashboard_router import router as dashboard_router
from app.alerts.alerts_router import router as alerts_router
from app.admin.admin_router import router as admin_stats_router
from app.websocket.ws_router import router as ws_router
from app.analytics.analytics_router import router as analytics_router
from app.predictions.predictions_router import router as predictions_router

# Create Database Tables
Base.metadata.create_all(bind=engine)

# Create FastAPI Application
app = FastAPI(
    title="Weather Intelligence Platform",
    version="2.0.0",
    description="Off-Grid IoT Weather Intelligence Platform"
)

# Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": type(exc).__name__}
    )


# Home Route
@app.get("/")
def home():
    return {
        "message": "Weather Intelligence Platform API Running",
        "version": "2.0.0",
        "status": "healthy"
    }


# Routes
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(farmer_router)
app.include_router(analyst_router)
app.include_router(device_router)
app.include_router(sensor_router)
app.include_router(dashboard_router)
app.include_router(alerts_router)
app.include_router(admin_stats_router)
app.include_router(ws_router)
app.include_router(analytics_router)
app.include_router(predictions_router)
