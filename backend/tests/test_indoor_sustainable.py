import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_indoor_tips_grouping_and_safety():
    res = client.get("/api/indoor/tips?aqi=190")
    assert res.status_code == 200
    data = res.json()

    assert "Free" in data["groups"]
    assert "Low-Cost" in data["groups"]
    assert "Equipment-Based" in data["groups"]
    assert len(data["golden_rules"]) >= 5
    assert "General guidance" in data["disclaimer"]

    # Verify absence of banned claims across all returned tips
    all_cards = []
    for grp in data["groups"].values():
        all_cards.extend(grp)

    for card in all_cards:
        card_text = f"{card['title']} {card['what_to_do']} {card['why_it_matters']} {card['common_pitfalls']}".lower()
        # No ozone generator recommendation
        assert "ozone generator" not in card_text
        # No claiming plants replace HEPA
        assert "plants replace" not in card_text


def test_indoor_tips_outdoor_aqi_awareness():
    # High AQI
    res_high = client.get("/api/indoor/tips?aqi=250")
    assert "seal" in res_high.json()["outdoor_context_summary"].lower()

    # Good AQI
    res_low = client.get("/api/indoor/tips?aqi=35")
    assert "acceptable" in res_low.json()["outdoor_context_summary"].lower()


def test_sustainable_living_recommendations():
    res = client.get("/api/sustainable/recommendations")
    assert res.status_code == 200
    data = res.json()

    assert data["total_recommendations"] >= 4
    for rec in data["recommendations"]:
        assert rec["domain"]
        assert rec["conventional_practice"]
        assert rec["sustainable_swap"]
        assert rec["what_is_changeable"]
        assert rec["difficulty"]
        # Non-judgmental check: no shaming or guilt words
        assert "ashamed" not in rec["why_it_matters"].lower()
        assert "guilty" not in rec["why_it_matters"].lower()
