from typing import Dict, List, Optional
from pydantic import BaseModel, Field


# Models for legacy Day 1-3 endpoint
class ModeComparison(BaseModel):
    mode: str
    mode_label: str
    weekly_co2_kg: float
    weekly_pm25_grams: float


class ImpactCalculationRequest(BaseModel):
    daily_commute_km: float = Field(default=15.0, ge=0, le=200)
    primary_commute_mode: str = Field(default="car_petrol")
    heating_source: str = Field(default="electric_heater")
    heating_hours_per_day: float = Field(default=4.0, ge=0, le=24)
    uses_n95_mask_on_smog_days: bool = True
    uses_indoor_hepa_filter: bool = True
    avoids_outdoor_exercise_peaks: bool = True


class ImpactCalculationResponse(BaseModel):
    weekly_co2_emissions_kg: float
    weekly_co2_savings_vs_baseline_kg: float
    weekly_pm25_emitted_grams: float
    weekly_pm25_prevented_grams: float
    personal_exposure_reduction_pct: float
    estimated_clean_air_score: int
    stewardship_level: str
    impact_narrative: str
    actionable_upgrades: List[str]
    comparison_breakdown: List[ModeComparison]


# Models for Day 6 Stateless Impact Tracking
class LoggedAction(BaseModel):
    id: str
    type: str  # maps to action catalog id
    category: str  # "exposure_reduction" or "environmental_contribution"
    timestamp: str  # ISO string
    note: Optional[str] = Field(default=None, max_length=140)


class DailySeriesItem(BaseModel):
    date: str
    exposure_reduction: int
    environmental_contribution: int
    total: int


class CategoryBreakdownItem(BaseModel):
    category: str
    label: str
    count: int
    percentage: float


class AchievementItem(BaseModel):
    id: str
    title: str
    description: str
    rule: str
    achieved: bool


class ImpactSummaryRequest(BaseModel):
    actions: List[LoggedAction] = Field(default_factory=list, max_length=500)
    timezone: str = "UTC"


class TodayCounts(BaseModel):
    total: int
    exposure_reduction: int
    environmental_contribution: int
    by_group: Dict[str, int]


class ImpactSummaryResponse(BaseModel):
    timezone: str
    total_actions_logged: int
    today: TodayCounts
    seven_day_series: List[DailySeriesItem]  # Empty if < 2 distinct days
    has_sufficient_chart_data: bool
    category_breakdown: List[CategoryBreakdownItem]
    action_explanations: Dict[str, str]
    achievements: List[AchievementItem]
    methodology_note: str
