from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AQIInterpretation(BaseModel):
    aqi: Optional[int] = None
    standard: str = "US AQI"
    category: str
    severity_key: str
    color_token: str
    general_guidance: str
    sensitive_groups_guidance: Optional[str] = None
    outdoor_activity_recommendation: Optional[str] = None
    indoor_guidance: Optional[str] = None
    mask_recommendation: Optional[str] = None


class PollutantDetail(BaseModel):
    key: str
    name: str
    value: Optional[float] = None
    unit: str
    description: str


class WeatherCurrent(BaseModel):
    temperature: Optional[float] = None
    temperature_unit: str = "°C"
    apparent_temperature: Optional[float] = None
    relative_humidity: Optional[float] = None
    relative_humidity_unit: str = "%"
    wind_speed: Optional[float] = None
    wind_speed_unit: str = "km/h"
    wind_direction: Optional[float] = None
    wind_direction_unit: str = "°"
    precipitation: Optional[float] = None
    precipitation_unit: str = "mm"
    is_day: int = 1
    condition_label: str = "Clear Sky"
    condition_icon: str = "sun"
    condition_code: str = "0"


class HourlyTrendPoint(BaseModel):
    time: str
    timestamp: int
    us_aqi: Optional[int] = None
    pm2_5: Optional[float] = None
    category: str = "Unavailable"
    severity_key: str = "unavailable"
    color_token: str = "gray"


class LocationMeta(BaseModel):
    latitude: float
    longitude: float
    timezone: str
    elevation: Optional[float] = None
    city_name: Optional[str] = None


class AirQualityResponse(BaseModel):
    location: LocationMeta
    current_aqi: AQIInterpretation
    european_aqi: Optional[Dict[str, Any]] = None
    pollutants: List[PollutantDetail]
    weather: WeatherCurrent
    hourly_trends: List[HourlyTrendPoint]
    data_provider: str = "Open-Meteo"
    attribution: str = "Data provided by Open-Meteo under CC BY 4.0 license (non-commercial use)."
