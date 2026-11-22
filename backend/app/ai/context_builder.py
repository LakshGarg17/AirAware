"""
Context Builder for Gemini AI Service.
Constructs a minimal, typed, sanitized context payload for the LLM.
Excludes PII, rounds coordinates to 2 decimal places, and ensures deterministic safety.
"""
from typing import Any, Dict, List, Optional
from app.utils.aqi import get_aqi_interpretation


def build_environmental_context(
    latitude: float,
    longitude: float,
    aq_data: Dict[str, Any],
    weather_data: Dict[str, Any],
    city_name: Optional[str] = None,
    profile: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Builds a minimal, privacy-conscious environmental context dictionary.
    """
    current_aq = aq_data.get("current", {})
    aq_units = aq_data.get("current_units", {})
    current_weather = weather_data.get("current", {})
    weather_units = weather_data.get("current_units", {})

    raw_us_aqi = current_aq.get("us_aqi")
    aqi_interp = get_aqi_interpretation(raw_us_aqi)

    # Safe pollutants list (only non-null values included)
    pollutants = []
    pollutant_keys = [
        ("pm2_5", "PM2.5"),
        ("pm10", "PM10"),
        ("nitrogen_dioxide", "NO2"),
        ("sulphur_dioxide", "SO2"),
        ("carbon_monoxide", "CO"),
        ("ozone", "Ozone")
    ]
    for key, display_name in pollutant_keys:
        if key in current_aq and current_aq[key] is not None:
            pollutants.append({
                "key": key,
                "name": display_name,
                "value": current_aq[key],
                "unit": aq_units.get(key, "μg/m³")
            })

    # Weather (null-safe)
    weather_summary = {
        "temperature": current_weather.get("temperature_2m"),
        "temperature_unit": weather_units.get("temperature_2m", "°C"),
        "apparent_temperature": current_weather.get("apparent_temperature"),
        "relative_humidity": current_weather.get("relative_humidity_2m"),
        "relative_humidity_unit": weather_units.get("relative_humidity_2m", "%"),
        "wind_speed": current_weather.get("wind_speed_10m"),
        "wind_speed_unit": weather_units.get("wind_speed_10m", "km/h"),
        "precipitation": current_weather.get("precipitation"),
        "is_day": current_weather.get("is_day", 1)
    }

    # Location sanitized: max 2 decimals, general label
    location_label = city_name or f"Coordinates ({round(latitude, 2)}, {round(longitude, 2)})"

    # Sanitized profile (no free-text, no PII, enums only)
    clean_profile = {}
    if profile:
        for k in ["routine", "commute", "outdoor_activity", "household", "indoor", "constraints"]:
            if k in profile and profile[k]:
                clean_profile[k] = profile[k]

    return {
        "location": {
            "label": location_label,
            "latitude": round(latitude, 2),
            "longitude": round(longitude, 2)
        },
        "air_quality": {
            "us_aqi": aqi_interp["aqi"],
            "standard": "US AQI",
            "category": aqi_interp["category"],
            "severity_key": aqi_interp["severity_key"],
            "general_guidance": aqi_interp["general_guidance"]
        },
        "pollutants": pollutants,
        "weather": weather_summary,
        "user_profile": clean_profile
    }
