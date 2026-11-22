import pytest
from app.services.recommendations import (
    get_tailored_routines,
    get_all_indoor_hacks,
    get_sustainable_alternatives_catalog,
    calculate_user_impact
)


def test_tailored_routines_commuter_unhealthy():
    routine = get_tailored_routines(175, lifestyle="commuter")
    assert routine["lifestyle"] == "commuter"
    assert routine["aqi_severity"] == "unhealthy"
    assert len(routine["steps"]) >= 4
    assert "inversion" in routine["morning_inversion_advisory"].lower()


def test_tailored_routines_family_kids():
    routine = get_tailored_routines(220, lifestyle="family_kids")
    assert routine["lifestyle"] == "family_kids"
    assert routine["aqi_severity"] == "very_unhealthy"
    assert any("child" in s["activity"].lower() or "child" in s["smog_avoidance_tip"].lower() for s in routine["steps"])


def test_indoor_hacks():
    hacks_data = get_all_indoor_hacks(250)
    assert hacks_data["total_hacks"] >= 5
    assert len(hacks_data["golden_rules"]) >= 5
    # Verify DIY Corsi-Rosenthal is included
    assert any("corsi" in h["id"] for h in hacks_data["hacks"])


def test_sustainable_alternatives():
    alternatives_data = get_sustainable_alternatives_catalog()
    assert alternatives_data["total"] >= 4
    assert "Commute & Transit" in alternatives_data["domains"]
    assert "Heating & Winter Comfort" in alternatives_data["domains"]


def test_calculate_user_impact():
    res = calculate_user_impact(
        daily_commute_km=20.0,
        primary_commute_mode="metro",
        heating_source="thermal_clothing_only",
        heating_hours_per_day=0,
        uses_n95_mask=True,
        uses_indoor_hepa=True,
        avoids_outdoor_exercise_peaks=True
    )
    assert res["estimated_clean_air_score"] >= 80
    assert "Champion" in res["stewardship_level"]
    assert res["personal_exposure_reduction_pct"] > 50.0
    assert len(res["comparison_breakdown"]) == 4
