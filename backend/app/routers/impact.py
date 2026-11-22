from fastapi import APIRouter

from app.schemas.impact import ImpactCalculationRequest, ImpactCalculationResponse
from app.services.recommendations import calculate_user_impact

router = APIRouter(prefix="/api/impact", tags=["Impact Calculator"])


@router.post("/calculate", response_model=ImpactCalculationResponse)
def calculate_impact(payload: ImpactCalculationRequest):
    """
    Computes direct environmental and personal respiratory impact
    based on user transit, heating, and protective measures.
    """
    return calculate_user_impact(
        daily_commute_km=payload.daily_commute_km,
        primary_commute_mode=payload.primary_commute_mode,
        heating_source=payload.heating_source,
        heating_hours_per_day=payload.heating_hours_per_day,
        uses_n95_mask=payload.uses_n95_mask_on_smog_days,
        uses_indoor_hepa=payload.uses_indoor_hepa_filter,
        avoids_outdoor_exercise_peaks=payload.avoids_outdoor_exercise_peaks
    )
