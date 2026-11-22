import pytest
import respx
from fastapi.testclient import TestClient
from app.config import settings


def test_root_endpoint(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Open-Meteo" in data["attribution"]


def test_health_check_endpoint(client: TestClient):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@respx.mock
def test_air_quality_api_integration(client: TestClient):
    # Mock Open-Meteo Air Quality
    respx.get(settings.open_meteo_aq_url).respond(
        status_code=200,
        json={
            "latitude": 28.6,
            "longitude": 77.2,
            "timezone": "Asia/Kolkata",
            "current_units": {"us_aqi": "USAQI", "pm2_5": "μg/m³"},
            "current": {"us_aqi": 165, "pm2_5": 72.0},
            "hourly": {"time": ["2026-11-21T00:00"], "us_aqi": [165], "pm2_5": [72.0]}
        }
    )
    # Mock Open-Meteo Weather
    respx.get(settings.open_meteo_weather_url).respond(
        status_code=200,
        json={
            "current_units": {"temperature_2m": "°C"},
            "current": {"temperature_2m": 25.0, "weather_code": 0, "is_day": 1}
        }
    )

    response = client.get("/api/air-quality?latitude=28.6&longitude=77.2&city=Delhi")
    assert response.status_code == 200
    data = response.json()
    assert data["current_aqi"]["standard"] == "US AQI"
    assert data["current_aqi"]["category"] == "Unhealthy"
    assert data["current_aqi"]["severity_key"] == "unhealthy"
    assert data["weather"]["temperature"] == 25.0
    assert len(data["hourly_trends"]) == 1


@respx.mock
def test_geocoding_api_integration(client: TestClient):
    # Absent results test
    respx.get(settings.open_meteo_geocoding_url).respond(
        status_code=200,
        json={"generationtime_ms": 0.05}
    )
    response = client.get("/api/geocoding/search?name=UnknownPlace123")
    assert response.status_code == 200
    assert response.json()["results"] == []


def test_routines_endpoint(client: TestClient):
    response = client.get("/api/routines?aqi=140&lifestyle=remote_worker")
    assert response.status_code == 200
    data = response.json()
    assert data["lifestyle"] == "remote_worker"
    assert data["aqi_severity"] == "sensitive_unhealthy"


def test_hacks_endpoint(client: TestClient):
    response = client.get("/api/hacks?aqi=210")
    assert response.status_code == 200
    assert response.json()["total_hacks"] >= 5


def test_alternatives_endpoint(client: TestClient):
    response = client.get("/api/alternatives")
    assert response.status_code == 200
    assert response.json()["total"] >= 4


def test_impact_calculate_endpoint(client: TestClient):
    payload = {
        "daily_commute_km": 15,
        "primary_commute_mode": "car_petrol",
        "heating_source": "electric_heater",
        "heating_hours_per_day": 4,
        "uses_n95_mask_on_smog_days": True,
        "uses_indoor_hepa_filter": True,
        "avoids_outdoor_exercise_peaks": True
    }
    response = client.post("/api/impact/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "weekly_co2_emissions_kg" in data
    assert "estimated_clean_air_score" in data


def test_assistant_query_endpoint(client: TestClient):
    payload = {
        "query": "Should I wear an N95 mask?",
        "current_aqi": 180
    }
    response = client.post("/api/assistant/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_rule_based"] is True
    assert "Coming in the next development phase" in data["disclaimer"]
    assert "N95" in data["response"]["title"]
