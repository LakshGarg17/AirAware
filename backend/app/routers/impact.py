import datetime
import zoneinfo
from typing import Dict, List
from fastapi import APIRouter, HTTPException

from app.schemas.impact import (
    ImpactCalculationRequest,
    ImpactCalculationResponse,
    ImpactSummaryRequest,
    ImpactSummaryResponse,
    TodayCounts,
    DailySeriesItem,
    CategoryBreakdownItem,
    AchievementItem
)
from app.services.recommendations import calculate_user_impact
from app.services.impact_catalog import (
    get_action_catalog,
    get_action_by_id,
    ACTION_CATALOG
)

router = APIRouter(prefix="/api/impact", tags=["Impact Tracker (Stateless)"])


@router.get("/catalog")
def get_catalog():
    """
    Returns the centralized catalog of personal exposure reduction (A)
    and environmental contribution (B) action types.
    """
    return get_action_catalog()


@router.post("/summary", response_model=ImpactSummaryResponse)
def compute_impact_summary(payload: ImpactSummaryRequest):
    """
    Stateless endpoint: computes today's counts, weekly series, achievements,
    and explanations strictly from client-provided action logs and local timezone.
    Strictly count-based: no fabricated emission or particulate numbers.
    """
    # 1. Validate timezone
    try:
        user_tz = zoneinfo.ZoneInfo(payload.timezone)
    except Exception:
        user_tz = zoneinfo.ZoneInfo("UTC")

    now_local = datetime.datetime.now(user_tz)
    today_str = now_local.strftime("%Y-%m-%d")

    # 2. Filter actions: max 500, max 31 days old, valid timestamps
    cutoff_date = now_local - datetime.timedelta(days=31)
    valid_actions = []

    for act in payload.actions[:500]:
        try:
            dt = datetime.datetime.fromisoformat(act.timestamp.replace("Z", "+00:00"))
            dt_local = dt.astimezone(user_tz)
            if dt_local >= cutoff_date:
                valid_actions.append((act, dt_local))
        except (ValueError, TypeError):
            continue  # Skip corrupt timestamps safely

    # 3. Aggregate Today's counts
    today_exp = 0
    today_env = 0
    today_groups: Dict[str, int] = {
        "sustainable_commuting": 0,
        "exposure_reduction": 0,
        "indoor_air": 0,
        "lifestyle": 0
    }

    all_dates = set()
    date_counts: Dict[str, Dict[str, int]] = {}

    # Category totals
    cat_totals = {"exposure_reduction": 0, "environmental_contribution": 0}
    action_type_counts: Dict[str, int] = {}

    for act, dt_local in valid_actions:
        d_str = dt_local.strftime("%Y-%m-%d")
        all_dates.add(d_str)

        if d_str not in date_counts:
            date_counts[d_str] = {"exposure_reduction": 0, "environmental_contribution": 0, "total": 0}

        def_act = get_action_by_id(act.type)
        cat = def_act.category if def_act else act.category
        group = def_act.group if def_act else "lifestyle"

        cat_totals[cat] = cat_totals.get(cat, 0) + 1
        action_type_counts[act.type] = action_type_counts.get(act.type, 0) + 1
        date_counts[d_str][cat] = date_counts[d_str].get(cat, 0) + 1
        date_counts[d_str]["total"] += 1

        if d_str == today_str:
            if cat == "exposure_reduction":
                today_exp += 1
            else:
                today_env += 1
            today_groups[group] = today_groups.get(group, 0) + 1

    # 4. Seven-Day Series:
    # Strict rule: only include series data if >= 2 distinct days have data!
    has_sufficient_chart_data = len(all_dates) >= 2
    seven_day_series: List[DailySeriesItem] = []

    if has_sufficient_chart_data:
        # Build consecutive last 7 days
        for i in range(6, -1, -1):
            day_dt = now_local - datetime.timedelta(days=i)
            day_str = day_dt.strftime("%Y-%m-%d")
            entry = date_counts.get(day_str, {"exposure_reduction": 0, "environmental_contribution": 0, "total": 0})
            seven_day_series.append(DailySeriesItem(
                date=day_str,
                exposure_reduction=entry.get("exposure_reduction", 0),
                environmental_contribution=entry.get("environmental_contribution", 0),
                total=entry.get("total", 0)
            ))

    # 5. Category breakdown
    total_valid = len(valid_actions)
    category_breakdown = [
        CategoryBreakdownItem(
            category="exposure_reduction",
            label="Personal Exposure Reduction (Category A)",
            count=cat_totals.get("exposure_reduction", 0),
            percentage=round((cat_totals.get("exposure_reduction", 0) / total_valid * 100), 1) if total_valid > 0 else 0.0
        ),
        CategoryBreakdownItem(
            category="environmental_contribution",
            label="Environmental Contribution (Category B)",
            count=cat_totals.get("environmental_contribution", 0),
            percentage=round((cat_totals.get("environmental_contribution", 0) / total_valid * 100), 1) if total_valid > 0 else 0.0
        )
    ]

    # 6. Action explanations map
    explanations = {act.id: act.explanation for act in ACTION_CATALOG}

    # 7. Achievements strictly data-backed
    achievements = [
        AchievementItem(
            id="first_action",
            title="Clean Air First Step",
            description="Logged your first verified smog-defense action.",
            rule="Logged ≥ 1 action",
            achieved=total_valid >= 1
        ),
        AchievementItem(
            id="three_days",
            title="Consistent Clean Air Guardian",
            description="Logged clean-air actions across at least 3 distinct days.",
            rule="Actions logged across ≥ 3 distinct calendar days",
            achieved=len(all_dates) >= 3
        ),
        AchievementItem(
            id="sustainable_commuter",
            title="Clean Commute Steward",
            description="Logged 3 or more sustainable transit choices (metro, bus, walk, carpool).",
            rule="Logged ≥ 3 sustainable transit actions",
            achieved=(action_type_counts.get("took_public_transit", 0) +
                      action_type_counts.get("walked_or_cycled", 0) +
                      action_type_counts.get("carpooled_or_rideshared", 0)) >= 3
        ),
        AchievementItem(
            id="indoor_sanctuary",
            title="Indoor Sanctuary Master",
            description="Logged 3 or more indoor air hygiene actions (cleaning, sealing, air cleaning).",
            rule="Logged ≥ 3 indoor air quality actions",
            achieved=(action_type_counts.get("sealed_windows_doors", 0) +
                      action_type_counts.get("damp_mopped_dust", 0) +
                      action_type_counts.get("used_indoor_air_cleaning", 0)) >= 3
        ),
        AchievementItem(
            id="anti_idling",
            title="Anti-Idling Champion",
            description="Switched off vehicle engine to avoid idling pollution 5 times.",
            rule="Logged 'avoided_vehicle_idling' ≥ 5 times",
            achieved=action_type_counts.get("avoided_vehicle_idling", 0) >= 5
        )
    ]

    methodology = (
        "Strict count-based methodology: AirAware tracks verified user-reported actions. "
        "Deliberately excludes fabricated kg CO2 or synthetic percentage claims. "
        "Category A (Exposure Reduction) protects your lungs; Category B (Environmental Contribution) reduces emissions."
    )

    return ImpactSummaryResponse(
        timezone=str(user_tz),
        total_actions_logged=total_valid,
        today=TodayCounts(
            total=today_exp + today_env,
            exposure_reduction=today_exp,
            environmental_contribution=today_env,
            by_group=today_groups
        ),
        seven_day_series=seven_day_series,
        has_sufficient_chart_data=has_sufficient_chart_data,
        category_breakdown=category_breakdown,
        action_explanations=explanations,
        achievements=achievements,
        methodology_note=methodology
    )


# Keep Day 1-3 endpoint intact for backwards compatibility
@router.post("/calculate", response_model=ImpactCalculationResponse)
def calculate_impact(payload: ImpactCalculationRequest):
    return calculate_user_impact(
        daily_commute_km=payload.daily_commute_km,
        primary_commute_mode=payload.primary_commute_mode,
        heating_source=payload.heating_source,
        heating_hours_per_day=payload.heating_hours_per_day,
        uses_n95_mask=payload.uses_n95_mask_on_smog_days,
        uses_indoor_hepa=payload.uses_indoor_hepa_filter,
        avoids_outdoor_exercise_peaks=payload.avoids_outdoor_exercise_peaks
    )
