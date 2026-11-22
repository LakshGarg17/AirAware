from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ImpactCalculationRequest(BaseModel):
    daily_commute_km: float = Field(default=15.0, ge=0, le=200)
    primary_commute_mode: str = Field(default="car_petrol")  # car_petrol, car_diesel, motorbike, bus, metro, bicycle_walk, work_from_home
    heating_source: str = Field(default="electric_heater")  # biomass_wood, kerosene, coal, electric_heater, heat_pump, thermal_clothing_only
    heating_hours_per_day: float = Field(default=4.0, ge=0, le=24)
    uses_n95_mask_on_smog_days: bool = True
    uses_indoor_hepa_filter: bool = True
    avoids_outdoor_exercise_peaks: bool = True


class ModeComparison(BaseModel):
    mode: str
    mode_label: str
    weekly_co2_kg: float
    weekly_pm25_grams: float


class ImpactCalculationResponse(BaseModel):
    weekly_co2_emissions_kg: float
    weekly_co2_savings_vs_baseline_kg: float
    weekly_pm25_emitted_grams: float
    weekly_pm25_prevented_grams: float
    personal_exposure_reduction_pct: float
    estimated_clean_air_score: int  # 0 to 100
    stewardship_level: str
    impact_narrative: str
    actionable_upgrades: List[str]
    comparison_breakdown: List[ModeComparison]
