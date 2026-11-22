import datetime
import hashlib
import logging
from typing import Dict, List
from fastapi import APIRouter, HTTPException

from app.schemas.planner import (
    PlanDailyRequest,
    PlanDailyResponse,
    PlanAQIContext,
    PlanItem,
    DailyPlanPeriods
)
from app.services.open_meteo import OpenMeteoService
from app.utils.aqi import get_aqi_interpretation
from app.services.recommendations import get_tailored_routines

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/plan", tags=["Daily Smog Planner"])

open_meteo_service = OpenMeteoService()


def _generate_stable_id(key: str, period: str) -> str:
    """Generates a stable 12-char deterministic hex id based on rule key and time period."""
    return hashlib.sha256(f"{key}:{period}".encode()).hexdigest()[:12]


@router.post("/daily", response_model=PlanDailyResponse)
async def get_daily_plan(payload: PlanDailyRequest):
    """
    Generates a personalized 4-period daily smog navigation plan.
    Ids are stable hashes so client checkbox completion survives refreshes and regenerates.
    """
    try:
        aq_data = await open_meteo_service.get_air_quality(payload.latitude, payload.longitude)
    except Exception as exc:
        logger.warning(f"Using fallback for planner AQ context: {exc}")
        aq_data = {"current": {"us_aqi": None}}

    current_aq = aq_data.get("current", {})
    raw_us_aqi = current_aq.get("us_aqi")
    aqi_interp = get_aqi_interpretation(raw_us_aqi)
    aqi_val = aqi_interp["aqi"]
    is_smog_high = aqi_val is not None and aqi_val > 100
    is_smog_severe = aqi_val is not None and aqi_val > 200

    profile = payload.profile or {}
    routine = profile.get("routine", "office_worker")
    commute = profile.get("commute", "public_transport")
    outdoor_act = profile.get("outdoor_activity", "walking")
    indoor_opts = profile.get("indoor", [])
    constraints = profile.get("constraints", [])

    # Map to lifestyle
    lifestyle = "general"
    if routine == "work_from_home":
        lifestyle = "remote_worker"
    elif routine in ("office_worker", "student"):
        lifestyle = "commuter"
    if "children" in profile.get("household", []):
        lifestyle = "family_kids"
    elif "elderly" in profile.get("household", []):
        lifestyle = "senior"

    base_routine = get_tailored_routines(aqi_val, lifestyle)
    steps = base_routine.get("steps", [])

    # Deterministic generation with variation offset
    v = payload.variation % 3

    # Morning pool
    morning_items = [
        PlanItem(
            id=_generate_stable_id("inversion_prep", "morning"),
            title="Inversion Safeguard & Morning Check",
            description="Check live US AQI. Keep external windows and balcony sliders sealed against ground-level inversion smoke.",
            reason="Thermal radiation inversions peak between 6:00 and 9:30 AM.",
            priority="high" if is_smog_high else "medium",
            category="Inversion Safeguard",
            effort="low",
            impact_type="avoided_morning_inversion"
        ),
        PlanItem(
            id=_generate_stable_id("respirator_prep", "morning"),
            title="N95 Mask Fit & Commute Departure",
            description="Inspect N95 mask seal with nose clip. Ensure vehicle AC recirculation is ON or board electric metro.",
            reason="Filters sub-micron particulates before they enter respiratory airways.",
            priority="high" if is_smog_high else "medium",
            category="Commute Defense",
            effort="low",
            impact_type="mask_outdoor"
        )
    ]
    if outdoor_act in ("running", "cycling", "outdoor_sports") and is_smog_high:
        morning_items.insert(1, PlanItem(
            id=_generate_stable_id("exercise_indoor_switch", "morning"),
            title="Shift Morning Workout Indoors",
            description="Replace outdoor run/ride with indoor stretching, yoga, or indoor circuit training.",
            reason="Deep athletic mouth breathing increases particulate intake by 5x to 10x.",
            priority="high",
            category="Fitness Safety",
            effort="medium",
            impact_type="moved_exercise_indoors"
        ))

    # Afternoon pool
    afternoon_items = [
        PlanItem(
            id=_generate_stable_id("solar_ventilation_window", "afternoon"),
            title="Midday Air Renewal Flush (1:00 - 2:30 PM)",
            description="If outdoor AQI has temporarily dipped, crack opposing windows for 10 minutes to vent CO2, then reseal.",
            reason="Daytime solar warming expands mixing layer height, causing surface smog to temporarily thin.",
            priority="medium",
            category="Ventilation Timing",
            effort="low",
            impact_type="sealed_windows_doors"
        ),
        PlanItem(
            id=_generate_stable_id("hydration_break", "afternoon"),
            title="Airway Hydration & Warm Infusions",
            description="Drink warm herbal tea or water to maintain healthy bronchial cilia hydration.",
            reason="Hydrated mucosal membranes more effectively trap and clear particulate matter.",
            priority="low",
            category="Wellness",
            effort="low",
            impact_type=None
        )
    ]

    # Evening pool
    evening_items = [
        PlanItem(
            id=_generate_stable_id("evening_transit_transit", "evening"),
            title="Off-Peak / Low-Exposure Return Commute",
            description="Avoid standing near congested bus intersections. Take electric rail or carpool; avoid vehicle idling.",
            reason="Evening traffic peaks coincide with descending nighttime inversion layers.",
            priority="high" if is_smog_high else "medium",
            category="Commute",
            effort="medium",
            impact_type="took_public_transit"
        ),
        PlanItem(
            id=_generate_stable_id("cooking_exhaust_protocol", "evening"),
            title="Run Kitchen Exhaust During Dinner Prep",
            description="Turn on range hood before lighting stove. Keep interior kitchen doors closed to isolate bedroom air.",
            reason="Unvented gas and oil frying produce indoor PM2.5 spikes exceeding 300 μg/m³.",
            priority="medium",
            category="Indoor Air",
            effort="low",
            impact_type="avoided_indoor_combustion"
        )
    ]

    # Night pool
    night_items = [
        PlanItem(
            id=_generate_stable_id("damp_mop_cleaning", "night"),
            title="Damp Microfiber Floor Wipe",
            description="Gently wipe bedroom floors with a damp microfiber cloth to pick up fine settled soot without sweeping.",
            reason="Stops settled fine particulate from being kicked back into sleep breathing elevation.",
            priority="medium",
            category="Dust Control",
            effort="low",
            impact_type="damp_mopped_dust"
        ),
        PlanItem(
            id=_generate_stable_id("clean_heating_comfort", "night"),
            title="Safe Thermal Bedding & Electric Radiant Heat",
            description="Use thermal blankets and sealed door draft stoppers. Avoid open angithi, coal, or wood burning.",
            reason="Eliminates deadly carbon monoxide risk and nighttime soot inhalation.",
            priority="high" if is_smog_high else "medium",
            category="Clean Heating",
            effort="low",
            impact_type="clean_home_heating"
        )
    ]

    # Reorder slightly if variation > 0 (deterministic shuffle)
    if v == 1:
        morning_items.reverse()
        evening_items.reverse()
    elif v == 2:
        afternoon_items.reverse()
        night_items.reverse()

    loc_label = payload.city or f"Coordinates ({round(payload.latitude, 2)}, {round(payload.longitude, 2)})"
    total_count = len(morning_items) + len(afternoon_items) + len(evening_items) + len(night_items)

    return PlanDailyResponse(
        date=datetime.date.today().isoformat(),
        based_on="Forecast-based" if aq_data.get("hourly") else "Based on current conditions",
        aqi_context=PlanAQIContext(
            aqi=aqi_val,
            standard="US AQI",
            category=aqi_interp["category"],
            severity_key=aqi_interp["severity_key"],
            color_token=aqi_interp["color_token"],
            location=loc_label
        ),
        periods=DailyPlanPeriods(
            morning=morning_items,
            afternoon=afternoon_items,
            evening=evening_items,
            night=night_items
        ),
        total_actions=total_count
    )
