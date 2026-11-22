import asyncio
import pytest
from unittest.mock import AsyncMock, MagicMock

from app.config import settings
from app.ai.service import AIService
from app.ai.validator import validate_and_filter_ai_recommendations
from app.services.providers.gemini import GeminiRecommendationProvider


@pytest.fixture
def mock_gemini_client():
    mock_client = MagicMock()
    mock_client.aio = MagicMock()
    mock_client.aio.models = MagicMock()
    return mock_client


@pytest.mark.asyncio
async def test_ai_disabled_fallback():
    settings.ai_enabled = False
    service = AIService()
    res, reason = await service.generate_recommendations(
        latitude=28.6,
        longitude=77.2,
        aq_data={"current": {"us_aqi": 180}},
        weather_data={"current": {}}
    )
    assert res is None
    assert reason == "disabled"
    settings.ai_enabled = True


@pytest.mark.asyncio
async def test_ai_not_configured_fallback():
    orig_key = settings.gemini_api_key
    settings.gemini_api_key = None
    service = AIService()
    res, reason = await service.generate_recommendations(
        latitude=28.6,
        longitude=77.2,
        aq_data={"current": {"us_aqi": 180}},
        weather_data={"current": {}}
    )
    assert res is None
    assert reason == "not_configured"
    settings.gemini_api_key = orig_key


@pytest.mark.asyncio
async def test_ai_valid_json_response(mock_gemini_client):
    mock_response = MagicMock()
    mock_response.text = """
    {
      "summary": "High smog levels observed. Limit outdoor ventilation.",
      "main_concerns": ["PM2.5 concentration"],
      "immediate_actions": [
        {
          "id": "ai-act-1",
          "title": "Use damp cloth at window sills",
          "description": "Wipe window sills to prevent particulate accumulation.",
          "reason": "Traps fine dust before it circulates.",
          "priority": "medium",
          "category": "Cleaning",
          "cost": "free",
          "effort": "low"
        }
      ],
      "outdoor_guidance": [],
      "indoor_recommendations": [],
      "commute_recommendations": [],
      "sustainable_choices": [],
      "daily_plan": {"morning": [], "afternoon": [], "evening": [], "night": []},
      "impact_explanations": ["Reduces dust"],
      "limitations": ["Educational advice only"]
    }
    """
    mock_gemini_client.aio.models.generate_content = AsyncMock(return_value=mock_response)

    service = AIService(client=mock_gemini_client)
    orig_key = settings.gemini_api_key
    settings.gemini_api_key = "test-mock-key"

    res, reason = await service.generate_recommendations(
        latitude=28.6,
        longitude=77.2,
        aq_data={"current": {"us_aqi": 210}},
        weather_data={"current": {}}
    )

    assert reason is None
    assert res is not None
    assert res["summary"] == "High smog levels observed. Limit outdoor ventilation."
    assert len(res["immediate_actions"]) == 1
    settings.gemini_api_key = orig_key


@pytest.mark.asyncio
async def test_ai_code_fenced_json(mock_gemini_client):
    mock_response = MagicMock()
    mock_response.text = "```json\n{\"summary\": \"Clean air plan\", \"main_concerns\": [], \"immediate_actions\": [], \"outdoor_guidance\": [], \"indoor_recommendations\": [], \"commute_recommendations\": [], \"sustainable_choices\": [], \"daily_plan\": {\"morning\": [], \"afternoon\": [], \"evening\": [], \"night\": []}, \"impact_explanations\": [], \"limitations\": []}\n```"
    mock_gemini_client.aio.models.generate_content = AsyncMock(return_value=mock_response)

    service = AIService(client=mock_gemini_client)
    orig_key = settings.gemini_api_key
    settings.gemini_api_key = "test-key"

    res, reason = await service.generate_recommendations(
        latitude=28.6,
        longitude=77.2,
        aq_data={"current": {"us_aqi": 75}},
        weather_data={"current": {}}
    )
    assert res is not None
    assert res["summary"] == "Clean air plan"
    settings.gemini_api_key = orig_key


@pytest.mark.asyncio
async def test_ai_timeout_handling(mock_gemini_client):
    async def _slow_call(*args, **kwargs):
        await asyncio.sleep(2.0)
        return MagicMock(text="{}")

    mock_gemini_client.aio.models.generate_content = _slow_call

    service = AIService(client=mock_gemini_client)
    orig_timeout = settings.ai_timeout_seconds
    orig_key = settings.gemini_api_key
    settings.ai_timeout_seconds = 0.1
    settings.gemini_api_key = "test-key"

    res, reason = await service.generate_recommendations(
        latitude=28.6,
        longitude=77.2,
        aq_data={"current": {"us_aqi": 180}},
        weather_data={"current": {}}
    )

    assert res is None
    assert reason == "timeout"

    settings.ai_timeout_seconds = orig_timeout
    settings.gemini_api_key = orig_key


def test_safety_filter_banned_claims():
    # 1. Ozone generator claim rejected
    bad_data = {
        "summary": "Run an ozone generator in your bedroom to clean the air.",
        "main_concerns": [],
        "immediate_actions": []
    }
    valid, _, reason = validate_and_filter_ai_recommendations(bad_data)
    assert not valid
    assert "ozone" in reason.lower()

    # 2. Unsupported numeric claim in summary rejected
    unsupported_data = {
        "summary": "This technique guarantees a 45% reduction in your personal PM2.5 levels.",
        "main_concerns": [],
        "immediate_actions": []
    }
    valid_num, _, reason_num = validate_and_filter_ai_recommendations(unsupported_data)
    assert not valid_num
    assert "unsupported numeric" in reason_num.lower()

    # 3. Safe item preserved, unsafe item in list stripped
    mixed_data = {
        "summary": "Wear an N95 respirator when outdoors.",
        "main_concerns": ["High PM2.5"],
        "immediate_actions": [
            {
                "id": "act-1",
                "title": "Use damp mop on floors",
                "description": "Traps dust gently.",
                "reason": "Good practice.",
                "priority": "medium",
                "category": "Cleaning"
            },
            {
                "id": "act-2",
                "title": "Buy houseplants to replace HEPA filter",
                "description": "Houseplants clean all smog in your room.",
                "reason": "Plants replace filters.",
                "priority": "high",
                "category": "Plants"
            }
        ],
        "outdoor_guidance": [],
        "indoor_recommendations": [],
        "commute_recommendations": [],
        "sustainable_choices": [],
        "daily_plan": {"morning": [], "afternoon": [], "evening": [], "night": []},
        "impact_explanations": [],
        "limitations": []
    }
    valid_mix, filtered, _ = validate_and_filter_ai_recommendations(mixed_data)
    assert valid_mix
    # Unsafe plant claim stripped, damp mop preserved
    assert len(filtered["immediate_actions"]) == 1
    assert filtered["immediate_actions"][0]["id"] == "act-1"


@pytest.mark.asyncio
async def test_deterministic_critical_items_preserved_in_merge():
    # Verify that deterministic high-priority items (like N95 mask during high AQI)
    # are ALWAYS preserved at the top of recommendations when Gemini succeeds
    mock_ai = MagicMock()
    mock_response = MagicMock()
    mock_response.text = """
    {
      "summary": "AI tailored summary for commuter.",
      "main_concerns": ["Traffic emissions"],
      "immediate_actions": [
        {
          "id": "ai-extra-1",
          "title": "Wash face after arriving home",
          "description": "Rinse away particulates.",
          "reason": "Skin hygiene.",
          "priority": "low",
          "category": "Hygiene"
        }
      ],
      "outdoor_guidance": [],
      "indoor_recommendations": [],
      "commute_recommendations": [],
      "sustainable_choices": [],
      "daily_plan": {"morning": [], "afternoon": [], "evening": [], "night": []},
      "impact_explanations": [],
      "limitations": []
    }
    """
    mock_ai.aio.models.generate_content = AsyncMock(return_value=mock_response)

    from app.ai.service import ai_service
    ai_service._client = mock_ai
    orig_key = settings.gemini_api_key
    settings.gemini_api_key = "test-key"

    provider = GeminiRecommendationProvider()
    result = await provider.get_recommendations(
        latitude=28.6,
        longitude=77.2,
        aq_data={"current": {"us_aqi": 220}},
        weather_data={"current": {}},
        profile={"routine": "office_worker", "commute": "motorcycle"}
    )

    assert result["source"] == "ai"
    # Deterministic critical N95 action must be present at the top
    action_titles = [a["title"] for a in result["immediate_actions"]]
    assert any("N95" in t for t in action_titles)
    # AI item also appended
    assert any("Wash face" in t for t in action_titles)

    settings.gemini_api_key = orig_key
    ai_service._client = None
