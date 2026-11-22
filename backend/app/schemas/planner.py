from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class PlanItem(BaseModel):
    id: str  # Stable hash
    title: str
    description: str
    reason: str
    priority: str = "medium"  # "high", "medium", "low"
    category: str = "Routine"
    effort: str = "low"
    impact_type: Optional[str] = None  # maps to action catalog id for quick-log


class DailyPlanPeriods(BaseModel):
    morning: List[PlanItem]
    afternoon: List[PlanItem]
    evening: List[PlanItem]
    night: List[PlanItem]


class PlanAQIContext(BaseModel):
    aqi: Optional[int] = None
    standard: str = "US AQI"
    category: str
    severity_key: str
    color_token: str
    location: str


class PlanDailyRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    city: Optional[str] = None
    profile: Optional[Dict[str, Any]] = None
    variation: int = Field(default=0, ge=0)


class PlanDailyResponse(BaseModel):
    date: str
    based_on: str = "Based on current conditions"
    aqi_context: PlanAQIContext
    periods: DailyPlanPeriods
    total_actions: int
