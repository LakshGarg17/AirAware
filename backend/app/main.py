"""
AirAware FastAPI Application Entrypoint.
Deployment-ready backend for smog navigation, personalized planning, Gemini AI,
and stateless impact tracking.
"""
import logging
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

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

logger = logging.getLogger(__name__)

app = FastAPI(
    title="AirAware API",
    description="Community Clean Air, Winter Smog Navigation & Impact Platform",
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc"
)

# ------------------------------------------------------------------------------
# Security Headers Middleware
# ------------------------------------------------------------------------------
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# ------------------------------------------------------------------------------
# Standardized Error Handlers: {error: {code, message}}
# ------------------------------------------------------------------------------
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    headers = getattr(exc, "headers", None)
    msg = exc.detail
    if isinstance(msg, dict):
        code = msg.get("code", exc.status_code)
        message = msg.get("message", str(msg))
    else:
        code = exc.status_code
        message = str(msg)

    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": code, "message": message}},
        headers=headers
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_err = errors[0] if errors else {}
    msg = first_err.get("msg", "Invalid request parameters")
    loc = " -> ".join(str(l) for l in first_err.get("loc", []))
    full_msg = f"{loc}: {msg}" if loc else msg
    return JSONResponse(
        status_code=422,
        content={"error": {"code": 422, "message": full_msg}}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    msg = "An unexpected error occurred. Please try again." if settings.environment == "production" else str(exc)
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": msg}}
    )

# ------------------------------------------------------------------------------
# CORS configuration (No wildcards in production, Vercel preview regex support)
# ------------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# Router Aggregation
# ------------------------------------------------------------------------------
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
