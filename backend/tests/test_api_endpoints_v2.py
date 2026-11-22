import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_ai_flags_are_booleans():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert isinstance(data["ai"]["enabled"], bool)
    assert isinstance(data["ai"]["configured"], bool)
    # Ensure no secret strings leaked in health output
    assert "key" not in data["ai"]


def test_no_secrets_in_any_response():
    # Probe public endpoints and assert GEMINI_API_KEY / sensitive strings are never returned
    endpoints = [
        "/",
        "/api/health",
        "/api/indoor/tips",
        "/api/sustainable/recommendations",
        "/api/impact/catalog"
    ]
    for ep in endpoints:
        r = client.get(ep)
        body = r.text.lower()
        assert "aiza" not in body
        assert "secret" not in body
        assert "password" not in body


def test_chat_empty_and_too_long_validation():
    # Empty message validation
    res_empty = client.post("/api/ai/chat", json={
        "message": "   ",
        "latitude": 28.6,
        "longitude": 77.2
    })
    # Fastapi validation returns 422 for empty or whitespace
    assert res_empty.status_code in (422, 400)

    # Message exceeds 500 chars
    long_msg = "a" * 501
    res_long = client.post("/api/ai/chat", json={
        "message": long_msg,
        "latitude": 28.6,
        "longitude": 77.2
    })
    assert res_long.status_code == 422


def test_chat_rule_fallback_when_ai_not_configured():
    # In test environment without Gemini key, chat must return source="rules"
    res = client.post("/api/ai/chat", json={
        "message": "Should I wear an N95 mask?",
        "latitude": 28.61,
        "longitude": 77.20,
        "city": "Delhi"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["source"] == "rules"
    assert "N95" in data["reply"]
    assert data["context_used"]["location"] == "Delhi"
    assert len(data["suggested_followups"]) >= 1


def test_rate_limiter_returns_429():
    from app.ai.service import ai_service
    # Mock client ip rate limit exhaustion
    test_ip = "192.168.1.100"
    for _ in range(25):
        ai_service.check_rate_limit(test_ip)

    # Directly check rate limit failure
    allowed = ai_service.check_rate_limit(test_ip)
    assert allowed is False
