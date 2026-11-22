from typing import Optional
from fastapi import APIRouter, HTTPException, Query
import httpx

from app.schemas.aqi import AirQualityResponse
from app.services.open_meteo import OpenMeteoService

router = APIRouter(prefix="/api", tags=["Air Quality & Weather"])

open_meteo_service = OpenMeteoService()


@router.get("/air-quality", response_model=AirQualityResponse)
async def get_air_quality(
    latitude: float = Query(..., ge=-90, le=90, description="Latitude coordinate"),
    longitude: float = Query(..., ge=-180, le=180, description="Longitude coordinate"),
    city: Optional[str] = Query(None, description="Optional city name label")
):
    """
    Fetch comprehensive air quality, weather, and 4-day hourly trends from Open-Meteo.
    Interprets US AQI thresholds via the centralized aqi utility.
    """
    try:
        aq_data = await open_meteo_service.get_air_quality(latitude, longitude)
        weather_data = await open_meteo_service.get_weather(latitude, longitude)
        processed = open_meteo_service.process_air_quality_and_weather(
            aq_data=aq_data,
            weather_data=weather_data,
            city_name=city
        )
        return processed
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Upstream Open-Meteo API returned error {exc.response.status_code}: {exc.response.text}"
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Network error connecting to Open-Meteo service: {str(exc)}"
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Internal error processing environmental data: {str(exc)}"
        )
