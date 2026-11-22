from typing import List, Optional
from pydantic import BaseModel


class RoutineStep(BaseModel):
    time_window: str
    activity: str
    low_emission_action: str
    impact_explanation: str
    smog_avoidance_tip: str
    exposure_reduction: str
    co2_saved: str


class DailyRoutineResponse(BaseModel):
    lifestyle: str
    lifestyle_label: str
    aqi_severity: str
    aqi_category: str
    summary: str
    morning_inversion_advisory: str
    steps: List[RoutineStep]
