"""
Async Open-Meteo API Client Service.
Fetches real-time Air Quality, Weather Forecast, and Geocoding data.
Complies with Open-Meteo free tier requirements (CC BY 4.0, non-commercial use).
"""
import logging
from typing import Any, Dict, List, Optional
import httpx

from app.config import settings
from app.utils.aqi import get_aqi_interpretation
from app.utils.weather import get_weather_condition

logger = logging.getLogger(__name__)

TIMEOUT_SECONDS = 10.0

POLLUTANT_CONFIG = [
    {
        "key": "pm2_5",
        "name": "Particulate Matter 2.5",
        "desc": "Fine inhalable particles with diameters 2.5 micrometers and smaller. Primary driver of winter smog health risks."
    },
    {
        "key": "pm10",
        "name": "Particulate Matter 10",
        "desc": "Inhalable dust, pollen, and mold particles with diameters 10 micrometers and smaller."
    },
    {
        "key": "nitrogen_dioxide",
        "name": "Nitrogen Dioxide (NO₂)",
        "desc": "Emitted by vehicular combustion, thermal power plants, and industrial boilers; causes airway inflammation."
    },
    {
        "key": "sulphur_dioxide",
        "name": "Sulphur Dioxide (SO₂)",
        "desc": "Emitted from burning fossil fuels containing sulfur (coal, diesel); causes severe respiratory irritation."
    },
    {
        "key": "carbon_monoxide",
        "name": "Carbon Monoxide (CO)",
        "desc": "Colorless, odorless gas produced by incomplete combustion of biomass, coal, and vehicle engines."
    },
    {
        "key": "ozone",
        "name": "Surface Ozone (O₃)",
        "desc": "Secondary pollutant formed when NOx and VOCs react in sunlight; triggers asthma and reduces lung function."
    }
]


class OpenMeteoService:
    def __init__(self, client: Optional[httpx.AsyncClient] = None):
        self._client = client

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client:
            return self._client
        return httpx.AsyncClient(timeout=TIMEOUT_SECONDS)

    async def get_air_quality(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Fetches air quality data from Open-Meteo Air Quality API.
        """
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "us_aqi,european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone",
            "hourly": "us_aqi,pm2_5",
            "past_days": 2,
            "forecast_days": 2,
            "timezone": "auto"
        }

        should_close = self._client is None
        client = await self._get_client()
        try:
            response = await client.get(settings.open_meteo_aq_url, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as exc:
            logger.error(f"Open-Meteo Air Quality API error: {exc}")
            raise
        finally:
            if should_close:
                await client.aclose()

    async def get_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Fetches current weather from Open-Meteo Forecast API.
        """
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation,weather_code,is_day",
            "timezone": "auto"
        }

        should_close = self._client is None
        client = await self._get_client()
        try:
            response = await client.get(settings.open_meteo_weather_url, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as exc:
            logger.error(f"Open-Meteo Weather API error: {exc}")
            raise
        finally:
            if should_close:
                await client.aclose()

    async def search_locations(self, query: str, count: int = 5) -> List[Dict[str, Any]]:
        """
        Searches locations via Open-Meteo Geocoding API.
        Handles cases where 'results' is absent when no matches exist.
        """
        if not query or len(query.strip()) < 2:
            return []

        params = {
            "name": query.strip(),
            "count": count,
            "language": "en",
            "format": "json"
        }

        should_close = self._client is None
        client = await self._get_client()
        try:
            response = await client.get(settings.open_meteo_geocoding_url, params=params)
            response.raise_for_status()
            data = response.json()
            # The 'results' key is ABSENT when nothing is found
            results = data.get("results")
            if results is None:
                return []
            return results
        except httpx.HTTPError as exc:
            logger.error(f"Open-Meteo Geocoding API error: {exc}")
            raise
        finally:
            if should_close:
                await client.aclose()

    def process_air_quality_and_weather(
        self,
        aq_data: Dict[str, Any],
        weather_data: Dict[str, Any],
        city_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Transforms raw Open-Meteo air quality and weather responses into
        standardized, validated AirAware domain models.
        """
        current_aq = aq_data.get("current", {})
        aq_units = aq_data.get("current_units", {})

        current_weather = weather_data.get("current", {})
        weather_units = weather_data.get("current_units", {})

        # 1. AQI Interpretation (Centralized in app/utils/aqi.py)
        raw_us_aqi = current_aq.get("us_aqi")
        us_aqi_interpretation = get_aqi_interpretation(raw_us_aqi)

        # European AQI (Mentioned/displayed only if present, clearly labeled)
        european_aqi_val = current_aq.get("european_aqi")
        european_aqi = None
        if european_aqi_val is not None:
            european_aqi = {
                "value": european_aqi_val,
                "unit": aq_units.get("european_aqi", "EAQI"),
                "standard": "European AQI"
            }

        # 2. Pollutants - Only show pollutants actually returned, treat null as unavailable
        pollutants_list = []
        for p_cfg in POLLUTANT_CONFIG:
            key = p_cfg["key"]
            if key in current_aq:
                val = current_aq.get(key)
                unit = aq_units.get(key, "μg/m³")
                pollutants_list.append({
                    "key": key,
                    "name": p_cfg["name"],
                    "value": float(val) if val is not None else None,
                    "unit": unit,
                    "description": p_cfg["desc"]
                })

        # 3. Weather formatting
        w_code = current_weather.get("weather_code")
        is_day = current_weather.get("is_day", 1)
        weather_cond = get_weather_condition(w_code, is_day)

        weather_obj = {
            "temperature": current_weather.get("temperature_2m"),
            "temperature_unit": weather_units.get("temperature_2m", "°C"),
            "apparent_temperature": current_weather.get("apparent_temperature"),
            "relative_humidity": current_weather.get("relative_humidity_2m"),
            "relative_humidity_unit": weather_units.get("relative_humidity_2m", "%"),
            "wind_speed": current_weather.get("wind_speed_10m"),
            "wind_speed_unit": weather_units.get("wind_speed_10m", "km/h"),
            "wind_direction": current_weather.get("wind_direction_10m"),
            "wind_direction_unit": weather_units.get("wind_direction_10m", "°"),
            "precipitation": current_weather.get("precipitation"),
            "precipitation_unit": weather_units.get("precipitation_unit", "mm"),
            "is_day": int(is_day) if is_day is not None else 1,
            "condition_label": weather_cond["label"],
            "condition_icon": weather_cond["icon"],
            "condition_code": weather_cond["code"]
        }

        # 4. Hourly Trends (past 2 days + forecast 2 days)
        hourly_aq = aq_data.get("hourly", {})
        times = hourly_aq.get("time", [])
        us_aqis = hourly_aq.get("us_aqi", [])
        pm25s = hourly_aq.get("pm2_5", [])

        hourly_trends = []
        import datetime
        for idx, t_str in enumerate(times):
            aqi_val = us_aqis[idx] if idx < len(us_aqis) else None
            pm25_val = pm25s[idx] if idx < len(pm25s) else None

            # Timestamp parsing
            try:
                dt = datetime.datetime.fromisoformat(t_str)
                ts = int(dt.timestamp())
            except Exception:
                ts = idx

            interp = get_aqi_interpretation(aqi_val)

            hourly_trends.append({
                "time": t_str,
                "timestamp": ts,
                "us_aqi": int(aqi_val) if aqi_val is not None else None,
                "pm2_5": float(pm25_val) if pm25_val is not None else None,
                "category": interp["category"],
                "severity_key": interp["severity_key"],
                "color_token": interp["color_token"]
            })

        location_meta = {
            "latitude": aq_data.get("latitude", 0.0),
            "longitude": aq_data.get("longitude", 0.0),
            "timezone": aq_data.get("timezone", "UTC"),
            "elevation": aq_data.get("elevation"),
            "city_name": city_name
        }

        return {
            "location": location_meta,
            "current_aqi": us_aqi_interpretation,
            "european_aqi": european_aqi,
            "pollutants": pollutants_list,
            "weather": weather_obj,
            "hourly_trends": hourly_trends,
            "data_provider": "Open-Meteo",
            "attribution": "Data provided by Open-Meteo under CC BY 4.0 license (non-commercial use)."
        }
