import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Request, Response, status
import httpx

from app.config import settings
from app.schemas.ai import RecommendationRequest, ChatRequest, ChatResponse, ContextUsedMeta
from app.services.open_meteo import OpenMeteoService
from app.services.providers.gemini import GeminiRecommendationProvider
from app.services.providers.rules import RuleBasedRecommendationProvider
from app.ai.service import ai_service
from app.services.rule_assistant import search_rule_based_knowledge
from app.utils.aqi import get_aqi_interpretation

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["Gemini AI Assistant"])

open_meteo_service = OpenMeteoService()
recommendation_provider = GeminiRecommendationProvider()


@router.post("/recommendations")
async def get_ai_recommendations(payload: RecommendationRequest):
    """
    Generates personalized recommendations combining deterministic safety rules
    with Gemini AI adaptations. Server re-derives environmental context directly.
    """
    try:
        aq_data = await open_meteo_service.get_air_quality(payload.latitude, payload.longitude)
        weather_data = await open_meteo_service.get_weather(payload.latitude, payload.longitude)
    except Exception as exc:
        logger.error(f"Error fetching atmospheric context for recommendations: {exc}")
        raise HTTPException(
            status_code=503,
            detail=f"Unable to retrieve current atmospheric conditions: {str(exc)}"
        )

    try:
        result = await recommendation_provider.get_recommendations(
            latitude=payload.latitude,
            longitude=payload.longitude,
            aq_data=aq_data,
            weather_data=weather_data,
            city_name=payload.city,
            profile=payload.profile
        )
        return result
    except Exception as exc:
        logger.error(f"Error generating recommendations: {exc}")
        # Ultimate fallback to pure rules
        rules_provider = RuleBasedRecommendationProvider()
        return await rules_provider.get_recommendations(
            latitude=payload.latitude,
            longitude=payload.longitude,
            aq_data=aq_data,
            weather_data=weather_data,
            city_name=payload.city,
            profile=payload.profile,
            fallback_reason="provider_error"
        )


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(payload: ChatRequest, request: Request, response: Response):
    """
    Conversational clean air assistant with server-side context derivation,
    rate limiting, prompt injection defense, and graceful rule-based fallback.
    """
    # 1. Rate limiting per IP
    client_ip = request.client.host if request.client else "127.0.0.1"
    if not ai_service.check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Chat rate limit exceeded. Please wait 60 seconds before sending another message.",
            headers={"Retry-After": "60"}
        )

    # 2. Server-side context derivation (never trust client-sent AQI)
    try:
        aq_data = await open_meteo_service.get_air_quality(payload.latitude, payload.longitude)
        weather_data = await open_meteo_service.get_weather(payload.latitude, payload.longitude)
    except Exception as exc:
        logger.warning(f"Using fallback coordinate label due to context fetch error: {exc}")
        aq_data = {"current": {"us_aqi": None}}
        weather_data = {"current": {}}

    current_aq = aq_data.get("current", {})
    raw_us_aqi = current_aq.get("us_aqi")
    aqi_interp = get_aqi_interpretation(raw_us_aqi)
    loc_label = payload.city or f"Coordinates ({round(payload.latitude, 2)}, {round(payload.longitude, 2)})"

    context_meta = ContextUsedMeta(
        aqi=aqi_interp["aqi"],
        standard="US AQI",
        category=aqi_interp["category"],
        location=loc_label
    )

    suggested_followups = [
        "What mask should I wear today?",
        "When does the morning inversion lift?",
        "Can I open windows to ventilate this afternoon?",
        "How should I protect children from high PM2.5?"
    ]

    # 3. If AI is active, attempt Gemini chat
    if settings.is_ai_active:
        from app.ai.context_builder import build_environmental_context
        env_ctx = build_environmental_context(
            latitude=payload.latitude,
            longitude=payload.longitude,
            aq_data=aq_data,
            weather_data=weather_data,
            city_name=loc_label,
            profile=payload.profile
        )

        reply_text, fallback_reason = await ai_service.generate_chat_reply(
            message=payload.message,
            history=payload.history,
            context=env_ctx
        )

        if reply_text:
            return ChatResponse(
                reply=reply_text,
                source="ai",
                fallback_reason=None,
                suggested_followups=suggested_followups,
                context_used=context_meta
            )
    else:
        fallback_reason = "disabled" if not settings.ai_enabled else "not_configured"

    # 4. Fallback to deterministic rule-based assistant
    rule_res = search_rule_based_knowledge(
        query=payload.message,
        current_aqi=aqi_interp["aqi"]
    )
    rule_ans = rule_res["response"]["answer"]

    notice = " (Note: AI assistant is currently running in verified rule-based mode)."
    final_reply = f"{rule_ans}\n\n{rule_res['response']['direct_impact_tip']}{notice}"

    return ChatResponse(
        reply=final_reply,
        source="rules",
        fallback_reason=fallback_reason,
        suggested_followups=suggested_followups,
        context_used=context_meta
    )
