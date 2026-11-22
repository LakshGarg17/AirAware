from typing import Optional
from fastapi import APIRouter, Query

from app.schemas.hacks import IndoorHacksResponse
from app.services.recommendations import get_all_indoor_hacks

router = APIRouter(prefix="/api", tags=["Indoor Hacks"])


@router.get("/hacks", response_model=IndoorHacksResponse)
def get_hacks(
    aqi: Optional[int] = Query(None, description="Current US AQI reading")
):
    """
    Returns evidence-based indoor air quality hacks categorized by cost, difficulty,
    and PM2.5 reduction efficiency.
    """
    return get_all_indoor_hacks(aqi_val=aqi)
