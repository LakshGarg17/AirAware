"""
Gemini Recommendation Provider.
Implements the RecommendationProvider interface.
Calls Gemini AI and merges AI adaptations with deterministic critical safety items.
Delegates to RuleBasedRecommendationProvider on any failure.
"""
import datetime
from typing import Any, Dict, Optional

from app.services.providers.base import RecommendationProvider
from app.services.providers.rules import RuleBasedRecommendationProvider
from app.ai.service import ai_service
from app.utils.aqi import get_aqi_interpretation


class GeminiRecommendationProvider(RecommendationProvider):
    def __init__(self, fallback_provider: Optional[RecommendationProvider] = None):
        self.fallback_provider = fallback_provider or RuleBasedRecommendationProvider()

    async def get_recommendations(
        self,
        latitude: float,
        longitude: float,
        aq_data: Dict[str, Any],
        weather_data: Dict[str, Any],
        city_name: Optional[str] = None,
        profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        # Always run deterministic baseline first to obtain critical safety items
        deterministic_result = await self.fallback_provider.get_recommendations(
            latitude=latitude,
            longitude=longitude,
            aq_data=aq_data,
            weather_data=weather_data,
            city_name=city_name,
            profile=profile
        )

        ai_data, fallback_reason = await ai_service.generate_recommendations(
            latitude=latitude,
            longitude=longitude,
            aq_data=aq_data,
            weather_data=weather_data,
            city_name=city_name,
            profile=profile
        )

        # If AI failed or disabled, return deterministic baseline with honest fallback_reason
        if not ai_data:
            deterministic_result["fallback_reason"] = fallback_reason
            return deterministic_result

        # DETERMINISTIC SAFETY MERGE:
        # Critical items from deterministic layer are ALWAYS preserved at the top of lists.
        # AI items are appended without duplicating titles or ids.
        current_aq = aq_data.get("current", {})
        raw_us_aqi = current_aq.get("us_aqi")
        aqi_interp = get_aqi_interpretation(raw_us_aqi)

        merged_immediate = list(deterministic_result["immediate_actions"])
        existing_titles = {itm["title"].lower() for itm in merged_immediate}
        for ai_itm in ai_data.get("immediate_actions", []):
            if ai_itm["title"].lower() not in existing_titles:
                merged_immediate.append(ai_itm)
                existing_titles.add(ai_itm["title"].lower())

        merged_outdoor = list(deterministic_result["outdoor_guidance"])
        existing_outdoor = {itm["title"].lower() for itm in merged_outdoor}
        for ai_itm in ai_data.get("outdoor_guidance", []):
            if ai_itm["title"].lower() not in existing_outdoor:
                merged_outdoor.append(ai_itm)
                existing_outdoor.add(ai_itm["title"].lower())

        merged_indoor = list(deterministic_result["indoor_recommendations"])
        existing_indoor = {itm["title"].lower() for itm in merged_indoor}
        for ai_itm in ai_data.get("indoor_recommendations", []):
            if ai_itm["title"].lower() not in existing_indoor:
                merged_indoor.append(ai_itm)
                existing_indoor.add(ai_itm["title"].lower())

        merged_commute = list(deterministic_result["commute_recommendations"])
        existing_commute = {itm["title"].lower() for itm in merged_commute}
        for ai_itm in ai_data.get("commute_recommendations", []):
            if ai_itm["title"].lower() not in existing_commute:
                merged_commute.append(ai_itm)
                existing_commute.add(ai_itm["title"].lower())

        merged_sustainable = list(deterministic_result["sustainable_choices"])
        existing_sust = {itm["title"].lower() for itm in merged_sustainable}
        for ai_itm in ai_data.get("sustainable_choices", []):
            if ai_itm["title"].lower() not in existing_sust:
                merged_sustainable.append(ai_itm)
                existing_sust.add(ai_itm["title"].lower())

        # Daily plan merge (keep stable deterministic items first)
        ai_plan = ai_data.get("daily_plan", {})
        merged_plan = {}
        for period in ["morning", "afternoon", "evening", "night"]:
            base_p = list(deterministic_result["daily_plan"].get(period, []))
            base_titles = {p["title"].lower() for p in base_p}
            for ai_p in ai_plan.get(period, []):
                if ai_p.get("title", "").lower() not in base_titles:
                    base_p.append(ai_p)
                    base_titles.add(ai_p["title"].lower())
            merged_plan[period] = base_p

        return {
            "source": "ai",
            "ai_available": True,
            "fallback_reason": None,
            "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "based_on": "current_conditions",
            "summary": ai_data.get("summary") or deterministic_result["summary"],
            "severity": aqi_interp,
            "main_concerns": ai_data.get("main_concerns") or deterministic_result["main_concerns"],
            "immediate_actions": merged_immediate,
            "outdoor_guidance": merged_outdoor,
            "indoor_recommendations": merged_indoor,
            "commute_recommendations": merged_commute,
            "sustainable_choices": merged_sustainable,
            "daily_plan": merged_plan,
            "impact_explanations": ai_data.get("impact_explanations") or deterministic_result["impact_explanations"],
            "limitations": deterministic_result["limitations"]
        }
