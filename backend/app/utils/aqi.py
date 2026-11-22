"""
Centralized Air Quality Index (US AQI) Thresholds and Interpretation Engine.
Single source of truth for AirAware AQI categories, severity keys, color tokens, and guidance.
"""
from typing import Any, Dict, Optional


AQI_THRESHOLDS = [
    {
        "min": 0,
        "max": 50,
        "category": "Good",
        "severity_key": "good",
        "color_token": "green",
        "general_guidance": "Air quality is satisfactory, and air pollution poses little or no risk. Enjoy outdoor activities and natural ventilation.",
        "sensitive_groups_guidance": "None. Ideal conditions for everyone.",
        "outdoor_activity_recommendation": "Ideal for all outdoor exercises and sports.",
        "indoor_guidance": "Natural ventilation is safe. Air purifiers optional.",
        "mask_recommendation": "No mask needed."
    },
    {
        "min": 51,
        "max": 100,
        "category": "Moderate",
        "severity_key": "moderate",
        "color_token": "yellow",
        "general_guidance": "Air quality is acceptable. Unusually sensitive people should consider reducing prolonged or heavy outdoor exertion.",
        "sensitive_groups_guidance": "People with respiratory or heart disease, the elderly and children should monitor symptoms.",
        "outdoor_activity_recommendation": "Safe for most; take short breaks during intense outdoor workouts if sensitive.",
        "indoor_guidance": "Keep windows closed during peak morning traffic hours.",
        "mask_recommendation": "Sensitive individuals may carry a mask for dusty roads."
    },
    {
        "min": 101,
        "max": 150,
        "category": "Unhealthy for Sensitive Groups",
        "severity_key": "sensitive_unhealthy",
        "color_token": "orange",
        "general_guidance": "Members of sensitive groups may experience health effects. The general public is less likely to be affected.",
        "sensitive_groups_guidance": "Children, older adults, and individuals with asthma or lung conditions should avoid prolonged outdoor exertion.",
        "outdoor_activity_recommendation": "Shift intense workouts indoors. Avoid exercising near busy roadways.",
        "indoor_guidance": "Close windows during morning smog hours (6 AM - 10 AM). Use basic air filtration.",
        "mask_recommendation": "Sensitive groups should wear a fitted N95 mask outdoors."
    },
    {
        "min": 151,
        "max": 200,
        "category": "Unhealthy",
        "severity_key": "unhealthy",
        "color_token": "red",
        "general_guidance": "Some members of the general public may experience health effects; sensitive groups may experience more serious health effects.",
        "sensitive_groups_guidance": "Everyone should cut back on outdoor exertion. Sensitive groups should avoid outdoor activities entirely.",
        "outdoor_activity_recommendation": "Cancel intense outdoor cardio. Walk at a moderate pace if travel is required.",
        "indoor_guidance": "Keep doors and windows sealed. Run HEPA air purifiers continuously on medium/high.",
        "mask_recommendation": "Wear an N95/FFP2 respirator when stepping outdoors."
    },
    {
        "min": 201,
        "max": 300,
        "category": "Very Unhealthy",
        "severity_key": "very_unhealthy",
        "color_token": "purple",
        "general_guidance": "Health alert: The risk of health effects is increased for everyone in the community.",
        "sensitive_groups_guidance": "Children, pregnant individuals, seniors, and heart/lung patients should remain indoors in clean rooms.",
        "outdoor_activity_recommendation": "Avoid all physical exertion outdoors. Minimize outdoor exposure to absolute essentials.",
        "indoor_guidance": "Run HEPA purifiers on turbo. Wet-mop indoor floors to settle fine dust. Check window seals.",
        "mask_recommendation": "A tightly fitted N95/N99 respirator is mandatory for any outdoor exposure."
    },
    {
        "min": 301,
        "max": 999999,
        "category": "Hazardous",
        "severity_key": "hazardous",
        "color_token": "maroon",
        "general_guidance": "Health warning of emergency conditions: Everyone is more likely to experience serious acute health effects.",
        "sensitive_groups_guidance": "Extreme danger for sensitive populations. Seek clean air shelters or hospital care if experiencing respiratory distress.",
        "outdoor_activity_recommendation": "Stay strictly indoors. Do not jog, cycle, or walk outdoors.",
        "indoor_guidance": "Create a designated clean room with HEPA filtration. Avoid any indoor combustion (incense, candles, gas cooking without hood).",
        "mask_recommendation": "Do not step outside without an N95/N99 sealed mask. Limit transit time."
    }
]

UNAVAILABLE_INTERPRETATION = {
    "aqi": None,
    "standard": "US AQI",
    "category": "Unavailable",
    "severity_key": "unavailable",
    "color_token": "gray",
    "general_guidance": "Air quality data is currently unavailable for this reading.",
    "sensitive_groups_guidance": "Check back shortly or monitor local pollution alerts.",
    "outdoor_activity_recommendation": "Proceed with caution until data is refreshed.",
    "indoor_guidance": "Keep standard indoor ventilation hygiene.",
    "mask_recommendation": "Keep an N95 mask handy if smog or haze is visible."
}


def get_aqi_interpretation(aqi_value: Optional[Any]) -> Dict[str, Any]:
    """
    Interprets a US AQI value according to standardized EPA breakpoints.
    Handles None, negative numbers, non-numeric strings, and out-of-range inputs safely.
    """
    if aqi_value is None:
        return UNAVAILABLE_INTERPRETATION.copy()

    try:
        val = float(aqi_value)
    except (ValueError, TypeError):
        return UNAVAILABLE_INTERPRETATION.copy()

    if val < 0:
        return UNAVAILABLE_INTERPRETATION.copy()

    rounded_val = round(val)

    for threshold in AQI_THRESHOLDS:
        if threshold["min"] <= rounded_val <= threshold["max"]:
            res = threshold.copy()
            res["aqi"] = rounded_val
            res["standard"] = "US AQI"
            # remove internal min/max from clean output
            res.pop("min", None)
            res.pop("max", None)
            return res

    # If somehow exceeds known brackets, fall back to hazardous
    res = AQI_THRESHOLDS[-1].copy()
    res["aqi"] = rounded_val
    res["standard"] = "US AQI"
    res.pop("min", None)
    res.pop("max", None)
    return res
