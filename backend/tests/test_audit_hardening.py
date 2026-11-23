"""
Day 7 Audit & Hardening Tests.
Verifies security headers, standardized error schemas, CORS enforcement,
Open-Meteo caching & partial failure isolation, rate limiter reset & Retry-After headers.
"""
import pytest
from fastapi.testclient import TestClient
import respx
import httpx

from app.main import app
from app.config import settings
from app.services.open_meteo import OpenMeteoService
from app.ai.service import ai_service

client = TestClient(app)


def test_standardized_error_format_on_422():
    """Verify 422 validation errors return standardized {error: {code, message}} JSON."""
    res = client.post("/api/plan/daily", json={"invalid": "payload"})
    assert res.status_code == 422
    body = res.json()
    assert "error" in body
    assert body["error"]["code"] == 422
    assert isinstance(body["error"]["message"], str)
    assert len(body["error"]["message"]) > 0


def test_standardized_error_format_on_404():
    """Verify 404 routes return standardized {error: {code, message}} JSON."""
    res = client.get("/api/non-existent-endpoint-xyz")
    assert res.status_code == 404
    body = res.json()
    assert "error" in body
    assert body["error"]["code"] == 404
    assert "Not Found" in body["error"]["message"]


def test_security_headers_present():
    """Verify security headers are applied by middleware across public responses."""
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "DENY"
    assert res.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"


def test_cors_preflight_and_origin_allowance():
    """Verify CORS preflight succeeds for allowed origin and Vercel preview regex."""
    # 1. Allowed localhost origin
    res = client.options(
        "/api/profile/validate",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type"
        }
    )
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-origin") == "http://localhost:3000"

    # 2. Vercel preview domain (matches regex)
    res_vercel = client.options(
        "/api/profile/validate",
        headers={
            "Origin": "https://airaware-preview-branch-team.vercel.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type"
        }
    )
    assert res_vercel.status_code == 200
    assert res_vercel.headers.get("access-control-allow-origin") == "https://airaware-preview-branch-team.vercel.app"

    # 3. Disallowed external origin
    res_bad = client.options(
        "/api/profile/validate",
        headers={
            "Origin": "https://malicious-external-attacker.com",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type"
        }
    )
    # Disallowed origin does not get Access-Control-Allow-Origin header
    assert res_bad.headers.get("access-control-allow-origin") is None


def test_rate_limiter_retry_after_header():
    """Verify 429 response on /chat includes Retry-After header and limiter is resettable."""
    ai_service.reset_rate_limits()
    # TestClient sets request.client.host to 'testclient'
    test_ip = "testclient"

    # Exhaust limit
    for _ in range(settings.rate_limit_per_minute + 2):
        ai_service.check_rate_limit(test_ip)

    res = client.post(
        "/api/ai/chat",
        json={"message": "How is smog today?", "latitude": 28.6, "longitude": 77.2}
    )
    assert res.status_code == 429
    assert res.headers.get("Retry-After") == "60"
    data = res.json()
    assert "error" in data
    assert data["error"]["code"] == 429

    # Verify reset_rate_limits clears state
    ai_service.reset_rate_limits()
    res_after = client.post(
        "/api/ai/chat",
        json={"message": "How is smog today?", "latitude": 28.6, "longitude": 77.2}
    )
    assert res_after.status_code == 200


@pytest.mark.asyncio
async def test_open_meteo_cache_serves_second_call():
    """Verify OpenMeteoService caches results so duplicate coordinates do not call upstream."""
    OpenMeteoService.clear_cache()
    mock_aq = {
        "latitude": 28.61,
        "longitude": 77.21,
        "timezone": "auto",
        "current": {"us_aqi": 180, "pm2_5": 115.0},
        "current_units": {"us_aqi": "AQI", "pm2_5": "μg/m³"},
        "hourly": {"time": ["2026-11-23T06:00"], "us_aqi": [180], "pm2_5": [115.0]}
    }

    with respx.mock(assert_all_called=False) as rsps:
        route = rsps.get(settings.open_meteo_aq_url).respond(200, json=mock_aq)
        svc = OpenMeteoService()
        
        # First call hits mock route
        d1 = await svc.get_air_quality(28.61, 77.21)
        assert d1["current"]["us_aqi"] == 180
        assert route.call_count == 1

        # Second call within TTL hits in-memory cache
        d2 = await svc.get_air_quality(28.61, 77.21)
        assert d2["current"]["us_aqi"] == 180
        assert route.call_count == 1  # Unchanged!


@pytest.mark.asyncio
async def test_air_quality_partial_failure_isolation():
    """Verify that if weather service fails, /api/air-quality still returns AQ data."""
    OpenMeteoService.clear_cache()
    mock_aq = {
        "latitude": 28.61,
        "longitude": 77.21,
        "timezone": "auto",
        "current": {"us_aqi": 210, "pm2_5": 160.0},
        "current_units": {"us_aqi": "AQI", "pm2_5": "μg/m³"},
        "hourly": {"time": ["2026-11-23T06:00"], "us_aqi": [210], "pm2_5": [160.0]}
    }

    with respx.mock(assert_all_called=False) as rsps:
        rsps.get(settings.open_meteo_aq_url).respond(200, json=mock_aq)
        # Weather endpoint simulates upstream failure (500)
        rsps.get(settings.open_meteo_weather_url).respond(500, text="Internal Weather Error")

        r = client.get("/api/air-quality?latitude=28.61&longitude=77.21")
        assert r.status_code == 200
        data = r.json()
        assert data["current_aqi"]["aqi"] == 210
        assert data["current_aqi"]["category"] == "Very Unhealthy"
        # Weather gracefully defaulted without crashing
        assert data["weather"]["condition_label"] is not None
