import datetime
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_impact_catalog_endpoint():
    res = client.get("/api/impact/catalog")
    assert res.status_code == 200
    catalog = res.json()
    assert len(catalog) >= 10

    categories = {act["category"] for act in catalog}
    assert "exposure_reduction" in categories
    assert "environmental_contribution" in categories


def test_impact_summary_stateless_calculation():
    # 1. Test when >= 2 distinct days of actions exist
    today_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    yesterday_iso = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)).isoformat()

    actions = [
        {"id": "act-1", "type": "mask_outdoor", "category": "exposure_reduction", "timestamp": today_iso},
        {"id": "act-2", "type": "took_public_transit", "category": "environmental_contribution", "timestamp": today_iso},
        {"id": "act-3", "type": "avoided_vehicle_idling", "category": "environmental_contribution", "timestamp": yesterday_iso}
    ]

    res = client.post("/api/impact/summary", json={"actions": actions, "timezone": "Asia/Kolkata"})
    assert res.status_code == 200
    data = res.json()

    assert data["total_actions_logged"] == 3
    assert data["today"]["total"] == 2
    assert data["today"]["exposure_reduction"] == 1
    assert data["today"]["environmental_contribution"] == 1
    assert data["has_sufficient_chart_data"] is True
    assert len(data["seven_day_series"]) == 7

    # Data-backed achievements check
    achieved_titles = [a["title"] for a in data["achievements"] if a["achieved"]]
    assert "Clean Air First Step" in achieved_titles


def test_impact_summary_empty_weekly_chart_when_under_two_days():
    # Strict rule: only include weekly chart data if >= 2 distinct days have data!
    today_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    single_day_actions = [
        {"id": "act-1", "type": "mask_outdoor", "category": "exposure_reduction", "timestamp": today_iso},
        {"id": "act-2", "type": "damp_mopped_dust", "category": "exposure_reduction", "timestamp": today_iso}
    ]

    res = client.post("/api/impact/summary", json={"actions": single_day_actions, "timezone": "UTC"})
    assert res.status_code == 200
    data = res.json()

    assert data["total_actions_logged"] == 2
    # Chart data must be empty for 1 day
    assert data["has_sufficient_chart_data"] is False
    assert len(data["seven_day_series"]) == 0


def test_impact_summary_bad_timestamps_and_cap():
    bad_actions = [
        {"id": "good-1", "type": "mask_outdoor", "category": "exposure_reduction", "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()},
        {"id": "bad-time", "type": "mask_outdoor", "category": "exposure_reduction", "timestamp": "invalid-timestamp-string"},
        {"id": "too-old", "type": "mask_outdoor", "category": "exposure_reduction", "timestamp": "2020-01-01T00:00:00Z"}  # >31 days old
    ]

    res = client.post("/api/impact/summary", json={"actions": bad_actions, "timezone": "UTC"})
    assert res.status_code == 200
    data = res.json()

    # Only 1 valid recent action processed
    assert data["total_actions_logged"] == 1
