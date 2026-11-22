from typing import Optional
from fastapi import APIRouter, Query

from app.schemas.routines import DailyRoutineResponse
from app.services.recommendations import get_tailored_routines

router = APIRouter(prefix="/api", tags=["Routines"])


@router.get("/routines", response_model=DailyRoutineResponse)
def get_routines(
    aqi: Optional[int] = Query(None, description="Current US AQI reading"),
    lifestyle: str = Query("general", description="Lifestyle profile: general, commuter, family_kids, remote_worker, senior")
):
    """
    Returns low-emission daily routines tailored by lifestyle profile and current AQI severity.
    Includes morning thermal inversion advisory and direct impact metrics.
    """
    return get_tailored_routines(aqi_val=aqi, lifestyle=lifestyle)
