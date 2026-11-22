"""
AirAware FastAPI Application Entrypoint.
Deployment-ready backend for smog navigation, personalized planning, Gemini AI,
and stateless impact tracking.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import (
    aqi,
    geocoding,
    routines,
    hacks,
    alternatives,
    impact,
    assistant,
    ai,
    profile,
    planner,
    indoor,
    sustainable
)

app = FastAPI(
    title="AirAware API",
    description="Community Clean Air, Winter Smog Navigation & Impact Platform",
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Standardized error response handler for HTTPExceptions
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import logging
    logging.getLogger(__name__).error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred. Please try again."}}
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
app.include_router(ai.router)
app.include_router(profile.router)
app.include_router(planner.router)
app.include_router(indoor.router)
app.include_router(sustainable.router)


@app.get("/")
def root():
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "tagline": "Breathe smarter. Live better.",
        "status": "online",
        "documentation": "/docs",
        "attribution": "Air quality and weather data provided by Open-Meteo under CC BY 4.0 license (non-commercial use)."
    }


@app.get("/api/health")
def health_check():
    """
    Health check endpoint for Render/container monitors.
    Returns AI capability flags as booleans only (never exposes keys or secrets).
    """
    return {
        "status": "healthy",
        "version": settings.app_version,
        "environment": settings.environment,
        "ai": {
            "enabled": bool(settings.ai_enabled),
            "configured": bool(settings.is_ai_configured)
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
