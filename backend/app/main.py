"""
AirAware FastAPI Application Entrypoint.
Deployment-ready backend for smog navigation, daily routines, indoor hacks, and impact calculation.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import aqi, geocoding, routines, hacks, alternatives, impact, assistant

app = FastAPI(
    title="AirAware API",
    description="Community Clean Air & Winter Smog Navigation Platform",
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(aqi.router)
app.include_router(geocoding.router)
app.include_router(routines.router)
app.include_router(hacks.router)
app.include_router(alternatives.router)
app.include_router(impact.router)
app.include_router(assistant.router)


@app.get("/")
def root():
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "status": "online",
        "documentation": "/docs",
        "attribution": "Air quality and weather data provided by Open-Meteo under CC BY 4.0 license (non-commercial use)."
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "version": settings.app_version,
        "environment": settings.environment
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
