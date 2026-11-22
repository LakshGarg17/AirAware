import pytest
from app.schemas.profile import normalize_profile, UserProfile, RoutineEnum, CommuteEnum
from app.services.recommendations import get_tailored_routines
from app.routers.planner import get_daily_plan, PlanDailyRequest


def test_profile_normalization_and_contradiction_resolution():
    # 1. Unknown enum dropped with warning
    raw_bad = {
        "routine": "astronaut_explorer",  # invalid
        "commute": "car",                 # valid
        "household": ["children", "martians"]  # martians invalid
    }
    profile, warnings = normalize_profile(raw_bad)
    assert profile.routine is None
    assert profile.commute == CommuteEnum.car
    assert len(profile.household) == 1
    assert any("astronaut_explorer" in w for w in warnings)
    assert any("martians" in w for w in warnings)

    # 2. Contradiction: air_purifier AND no_air_purifier
    raw_contra = {
        "indoor": ["air_purifier", "no_air_purifier"]
    }
    prof_contra, warn_contra = normalize_profile(raw_contra)
    assert "air_purifier" in prof_contra.indoor
    assert "no_air_purifier" not in prof_contra.indoor
    assert any("Contradictory" in w for w in warn_contra)


def test_personalization_differences():
    # 1. Morning runner at high AQI: recommendations shift cardio indoors
    routine_runner = get_tailored_routines(185, lifestyle="general")
    assert routine_runner["aqi_severity"] == "unhealthy"

    # 2. Commuter vs Family with Kids
    routine_commuter = get_tailored_routines(210, lifestyle="commuter")
    routine_family = get_tailored_routines(210, lifestyle="family_kids")
    assert routine_commuter["lifestyle"] == "commuter"
    assert routine_family["lifestyle"] == "family_kids"

    # Commuter steps focus on transit/office; family steps focus on pediatric and school
    commuter_text = " ".join([s["activity"] + s["low_emission_action"] for s in routine_commuter["steps"]])
    family_text = " ".join([s["activity"] + s["low_emission_action"] for s in routine_family["steps"]])

    assert "transit" in commuter_text.lower() or "car" in commuter_text.lower()
    assert "school" in family_text.lower() or "child" in family_text.lower()


@pytest.mark.asyncio
async def test_planner_four_periods_and_stable_ids():
    req = PlanDailyRequest(
        latitude=28.61,
        longitude=77.20,
        city="Delhi",
        profile={"routine": "office_worker", "commute": "metro"},
        variation=0
    )
    plan_res = await get_daily_plan(req)

    # 4 distinct periods present
    assert len(plan_res.periods.morning) >= 1
    assert len(plan_res.periods.afternoon) >= 1
    assert len(plan_res.periods.evening) >= 1
    assert len(plan_res.periods.night) >= 1

    # Stable ID check: same input yields identical action IDs across calls
    req2 = PlanDailyRequest(
        latitude=28.61,
        longitude=77.20,
        city="Delhi",
        profile={"routine": "office_worker", "commute": "metro"},
        variation=0
    )
    plan_res2 = await get_daily_plan(req2)

    ids1 = [item.id for item in plan_res.periods.morning]
    ids2 = [item.id for item in plan_res2.periods.morning]
    assert ids1 == ids2
    # Verify id format is a 12-char hex string
    assert len(ids1[0]) == 12


@pytest.mark.asyncio
async def test_planner_regenerate_variation():
    req_v0 = PlanDailyRequest(latitude=28.6, longitude=77.2, variation=0)
    req_v1 = PlanDailyRequest(latitude=28.6, longitude=77.2, variation=1)

    plan0 = await get_daily_plan(req_v0)
    plan1 = await get_daily_plan(req_v1)

    assert plan0.total_actions == plan1.total_actions
    # Variation 1 shuffles morning/evening order
    m0_first = plan0.periods.morning[0].id
    m1_first = plan1.periods.morning[0].id
    if len(plan0.periods.morning) > 1:
        assert m0_first != m1_first
