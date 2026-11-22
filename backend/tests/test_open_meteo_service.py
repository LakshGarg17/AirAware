import pytest
import respx
import httpx
from app.services.open_meteo import OpenMeteoService
from app.config import settings


@pytest.mark.asyncio
@respx.mock
async def test_get_air_quality_success():
    mock_aq_response = {
        "latitude": 28.625,
        "longitude": 77.25,
        "timezone": "Asia/Kolkata",
        "current_units": {
            "us_aqi": "USAQI",
            "european_aqi": "EAQI",
            "pm10": "μg/m³",
            "pm2_5": "μg/m³",
            "carbon_monoxide": "μg/m³",
            "nitrogen_dioxide": "μg/m³",
            "sulphur_dioxide": "μg/m³",
            "ozone": "μg/m³"
        },
        "current": {
            "time": "2026-11-21T12:00",
            "us_aqi": 215,
            "european_aqi": 120,
            "pm10": 110.0,
            "pm2_5": 85.5,
            "carbon_monoxide": 650.0,
            "nitrogen_dioxide": 22.0,
            "sulphur_dioxide": 18.0,
            "ozone": 45.0
        },
        "hourly": {
            "time": ["2026-11-21T11:00", "2026-11-21T12:00"],
            "us_aqi": [210, 215],
            "pm2_5": [80.0, 85.5]
        }
    }

    respx.get(settings.open_meteo_aq_url).respond(
        status_code=200,
        json=mock_aq_response
    )

    service = OpenMeteoService()
    result = await service.get_air_quality(28.625, 77.25)
    assert result["current"]["us_aqi"] == 215
    assert result["current_units"]["pm2_5"] == "μg/m³"


@pytest.mark.asyncio
@respx.mock
async def test_search_locations_results_present_and_absent():
    # 1. When results are present
    respx.get(settings.open_meteo_geocoding_url).respond(
        status_code=200,
        json={
            "results": [
                {
                    "id": 1273294,
                    "name": "Delhi",
                    "latitude": 28.65195,
                    "longitude": 77.23149,
                    "country": "India"
                }
            ]
        }
    )

    service = OpenMeteoService()
    delhi_results = await service.search_locations("Delhi")
    assert len(delhi_results) == 1
    assert delhi_results[0]["name"] == "Delhi"

    # 2. When results key is ABSENT (no matches)
    respx.get(settings.open_meteo_geocoding_url).respond(
        status_code=200,
        json={"generationtime_ms": 0.12}  # No 'results' key!
    )
    empty_results = await service.search_locations("NonexistentCity12345")
    assert empty_results == []


def test_process_air_quality_null_values():
    service = OpenMeteoService()
    raw_aq = {
        "latitude": 10.0,
        "longitude": 20.0,
        "timezone": "UTC",
        "current_units": {"pm2_5": "μg/m³", "us_aqi": "USAQI"},
        "current": {
            "us_aqi": None,  # null AQI
            "pm2_5": None,   # null pollutant
            "pm10": 45.0
        },
        "hourly": {"time": [], "us_aqi": [], "pm2_5": []}
    }
    raw_weather = {
        "current_units": {"temperature_2m": "°C"},
        "current": {
            "temperature_2m": 22.0,
            "weather_code": 1,
            "is_day": 1
        }
    }

    processed = service.process_air_quality_and_weather(raw_aq, raw_weather, "Test City")
    # US AQI should be Unavailable, not 0
    assert processed["current_aqi"]["category"] == "Unavailable"
    assert processed["current_aqi"]["severity_key"] == "unavailable"
    assert processed["current_aqi"]["aqi"] is None

    # Pollutant with null value must have value None, never 0
    pm25_item = next(p for p in processed["pollutants"] if p["key"] == "pm2_5")
    assert pm25_item["value"] is None
