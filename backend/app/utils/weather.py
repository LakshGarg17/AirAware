"""
WMO Weather Interpretation Code (WW) helper.
Decodes numerical weather codes from Open-Meteo into clear user descriptions,
icons, and atmospheric conditions.
"""
from typing import Dict, Optional

# WMO Weather interpretation codes (WW)
# https://open-meteo.com/en/docs
WMO_CODE_MAP = {
    0: {"label": "Clear Sky", "icon": "sun", "condition": "clear"},
    1: {"label": "Mainly Clear", "icon": "sun-medium", "condition": "mainly_clear"},
    2: {"label": "Partly Cloudy", "icon": "cloud-sun", "condition": "partly_cloudy"},
    3: {"label": "Overcast", "icon": "cloud", "condition": "overcast"},
    45: {"label": "Fog", "icon": "cloud-fog", "condition": "fog"},
    48: {"label": "Depositing Rime Fog", "icon": "cloud-fog", "condition": "rime_fog"},
    51: {"label": "Light Drizzle", "icon": "cloud-drizzle", "condition": "light_drizzle"},
    53: {"label": "Moderate Drizzle", "icon": "cloud-drizzle", "condition": "drizzle"},
    55: {"label": "Dense Drizzle", "icon": "cloud-drizzle", "condition": "dense_drizzle"},
    56: {"label": "Light Freezing Drizzle", "icon": "cloud-snow", "condition": "freezing_drizzle"},
    57: {"label": "Dense Freezing Drizzle", "icon": "cloud-snow", "condition": "freezing_drizzle"},
    61: {"label": "Slight Rain", "icon": "cloud-rain", "condition": "slight_rain"},
    63: {"label": "Moderate Rain", "icon": "cloud-rain", "condition": "moderate_rain"},
    65: {"label": "Heavy Rain", "icon": "cloud-rain", "condition": "heavy_rain"},
    66: {"label": "Light Freezing Rain", "icon": "cloud-snow", "condition": "freezing_rain"},
    67: {"label": "Heavy Freezing Rain", "icon": "cloud-snow", "condition": "heavy_freezing_rain"},
    71: {"label": "Slight Snow Fall", "icon": "snowflake", "condition": "slight_snow"},
    73: {"label": "Moderate Snow Fall", "icon": "snowflake", "condition": "moderate_snow"},
    75: {"label": "Heavy Snow Fall", "icon": "snowflake", "condition": "heavy_snow"},
    77: {"label": "Snow Grains", "icon": "snowflake", "condition": "snow_grains"},
    80: {"label": "Slight Rain Showers", "icon": "cloud-rain", "condition": "slight_showers"},
    81: {"label": "Moderate Rain Showers", "icon": "cloud-rain", "condition": "showers"},
    82: {"label": "Violent Rain Showers", "icon": "cloud-rain", "condition": "violent_showers"},
    85: {"label": "Slight Snow Showers", "icon": "snowflake", "condition": "snow_showers"},
    86: {"label": "Heavy Snow Showers", "icon": "snowflake", "condition": "heavy_snow_showers"},
    95: {"label": "Thunderstorm", "icon": "cloud-lightning", "condition": "thunderstorm"},
    96: {"label": "Thunderstorm with Slight Hail", "icon": "cloud-lightning", "condition": "thunderstorm_hail"},
    99: {"label": "Thunderstorm with Heavy Hail", "icon": "cloud-lightning", "condition": "heavy_thunderstorm_hail"},
}


def get_weather_condition(code: Optional[int], is_day: Optional[int] = 1) -> Dict[str, str]:
    """
    Maps WMO code to human-readable label and UI icon hint.
    Adapts day/night icon if is_day == 0.
    """
    if code is None:
        return {
            "label": "Unavailable",
            "icon": "cloud",
            "condition": "unavailable",
            "code": "N/A"
        }

    try:
        int_code = int(code)
    except (ValueError, TypeError):
        return {
            "label": "Unavailable",
            "icon": "cloud",
            "condition": "unavailable",
            "code": "N/A"
        }

    info = WMO_CODE_MAP.get(int_code)
    if not info:
        return {
            "label": f"Weather Code {int_code}",
            "icon": "cloud",
            "condition": "unknown",
            "code": str(int_code)
        }

    icon = info["icon"]
    if is_day == 0 and icon in ("sun", "sun-medium", "cloud-sun"):
        icon = "moon" if icon in ("sun", "sun-medium") else "cloud-moon"

    return {
        "label": info["label"],
        "icon": icon,
        "condition": info["condition"],
        "code": str(int_code)
    }
