"""
Deterministic Rule-Based Recommendation Provider.
Serves as the infallible safety baseline and fallback for AirAware.
"""
import datetime
from typing import Any, Dict, List, Optional

from app.services.providers.base import RecommendationProvider
from app.utils.aqi import get_aqi_interpretation
from app.services.recommendations import (
    get_tailored_routines,
    get_all_indoor_hacks,
    get_sustainable_alternatives_catalog
)


class RuleBasedRecommendationProvider(RecommendationProvider):
    async def get_recommendations(
        self,
        latitude: float,
        longitude: float,
        aq_data: Dict[str, Any],
        weather_data: Dict[str, Any],
        city_name: Optional[str] = None,
        profile: Optional[Dict[str, Any]] = None,
        fallback_reason: Optional[str] = None
    ) -> Dict[str, Any]:
        current_aq = aq_data.get("current", {})
        raw_us_aqi = current_aq.get("us_aqi")
        aqi_interp = get_aqi_interpretation(raw_us_aqi)
        sev = aqi_interp["severity_key"]
        cat = aqi_interp["category"]
        aqi_val = aqi_interp["aqi"]

        clean_profile = profile or {}
        routine_type = clean_profile.get("routine", "office_worker")
        commute_type = clean_profile.get("commute", "public_transport")
        outdoor_type = clean_profile.get("outdoor_activity", "walking")
        household = clean_profile.get("household", [])
        indoor = clean_profile.get("indoor", [])
        constraints = clean_profile.get("constraints", [])

        # Map to lifestyle
        lifestyle_map = {
            "office_worker": "commuter",
            "work_from_home": "remote_worker",
            "outdoor_worker": "general",
            "flexible": "general",
            "student": "commuter"
        }
        mapped_lifestyle = lifestyle_map.get(routine_type, "general")
        if "children" in household:
            mapped_lifestyle = "family_kids"
        elif "elderly" in household:
            mapped_lifestyle = "senior"

        routines = get_tailored_routines(aqi_val, mapped_lifestyle)
        hacks = get_all_indoor_hacks(aqi_val)
        alternatives = get_sustainable_alternatives_catalog()

        # Deterministic Critical Safety Actions (ALWAYS preserved)
        immediate_actions = []
        is_high_smog = aqi_val is not None and aqi_val > 100
        is_severe_smog = aqi_val is not None and aqi_val > 200

        if is_high_smog:
            immediate_actions.append({
                "id": "det-n95-mask",
                "title": "Wear a Fitted N95/FFP2 Mask Outdoors",
                "description": "Cloth and surgical masks do not block sub-micron PM2.5. Use a certified respirator with a snug metal nose seal.",
                "reason": "Reduces fine particle inhalation by >90% during outdoor transit.",
                "priority": "high",
                "category": "Respiratory Defense",
                "cost": "low",
                "effort": "low",
                "source": "rules"
            })
            immediate_actions.append({
                "id": "det-seal-morning-inversion",
                "title": "Avoid Morning Outdoor Exposure (6:00 - 9:30 AM)",
                "description": "Thermal radiative inversions trap dense surface exhaust at ground level. Delay outdoor errands or ventilation until midday.",
                "reason": "Surface PM2.5 is routinely 2x-3x higher during early morning inversions.",
                "priority": "high",
                "category": "Inversion Safeguard",
                "cost": "free",
                "effort": "low",
                "source": "rules"
            })
        else:
            immediate_actions.append({
                "id": "det-monitor-conditions",
                "title": "Enjoy Clean Outdoor Air & Ventilate",
                "description": "Current air quality is acceptable. Great time to ventilate living spaces and enjoy outdoor physical recreation.",
                "reason": "Air quality currently poses minimal acute health risk.",
                "priority": "low",
                "category": "Daily Hygiene",
                "cost": "free",
                "effort": "low",
                "source": "rules"
            })

        if "no_air_purifier" in indoor or "budget_conscious" in constraints:
            immediate_actions.append({
                "id": "det-damp-mop-cleaning",
                "title": "Damp Microfiber Mopping (Never Dry Sweep)",
                "description": "Dry sweeping resuspends settled toxic soot back into breathing elevation. Use a damp microfiber mop to trap fine dust.",
                "reason": "Zero-cost dust suppression without requiring electric purifiers.",
                "priority": "medium",
                "category": "Indoor Dust Control",
                "cost": "free",
                "effort": "low",
                "source": "rules"
            })

        # Outdoor guidance tailored to activity
        outdoor_guidance = []
        if outdoor_type in ("running", "cycling", "outdoor_sports") and is_high_smog:
            outdoor_guidance.append({
                "id": "det-shift-exercise-indoor",
                "title": "Shift Cardio and Vigorous Exercise Indoors",
                "description": "Aerobic respiration increases breathing rate by 5x-10x, deeply pulling soot into pulmonary alveoli. Switch outdoor runs to indoor yoga, bodyweight, or treadmill workouts.",
                "reason": "Prevents severe acute vascular and bronchial inflammation.",
                "priority": "high",
                "category": "Fitness Safety",
                "cost": "free",
                "effort": "medium",
                "source": "rules"
            })
        elif "cannot_avoid_outdoor_work" in constraints and is_high_smog:
            outdoor_guidance.append({
                "id": "det-outdoor-worker-breaks",
                "title": "Scheduled Clean Air Respite Breaks for Outdoor Workers",
                "description": "Take 10-minute rest breaks inside sheltered, air-filtered retail shops, banks, or transit halls every 90 minutes. Keep respiratory tract well hydrated.",
                "reason": "Intermittent clean air breaks lower cumulative alveolar particle deposition.",
                "priority": "high",
                "category": "Occupational Protection",
                "cost": "free",
                "effort": "low",
                "source": "rules"
            })
        else:
            outdoor_guidance.append({
                "id": "det-outdoor-general",
                "title": "Plan Outdoor Chores for Early Afternoon",
                "description": "Plan outdoor chores between 1:00 PM and 3:30 PM when daytime solar warming expands the planetary boundary layer, dispersing surface pollution.",
                "reason": "Lowest daily ambient particle concentrations occur around solar noon.",
                "priority": "medium",
                "category": "Timing",
                "cost": "free",
                "effort": "low",
                "source": "rules"
            })

        # Indoor recommendations
        indoor_recs = []
        for h in hacks["hacks"][:4]:
            indoor_recs.append({
                "id": f"det-hack-{h['id']}",
                "title": h["title"],
                "description": h["description"],
                "reason": h["how_it_works"],
                "priority": "high" if is_severe_smog else "medium",
                "category": h["category"],
                "cost": "free" if "Zero" in h["cost_level"] else "low",
                "effort": h["difficulty"].lower(),
                "source": "rules"
            })

        # Commute recommendations
        commute_recs = []
        if commute_type == "motorcycle":
            commute_recs.append({
                "id": "det-motorcycle-commute",
                "title": "Two-Wheeler Full-Face Helmet + N95 Combination",
                "description": "Wear a certified N95 respirator beneath a closed-visor full-face helmet. Avoid sitting directly behind diesel bus exhausts in stop-and-go jams.",
                "reason": "Two-wheeler riders experience up to 10x higher soot exposure than enclosed metro passengers.",
                "priority": "high",
                "category": "Commuter Safeguard",
                "cost": "low",
                "effort": "low",
                "source": "rules"
            })
        elif commute_type in ("car", "carpool"):
            commute_recs.append({
                "id": "det-car-recirculation",
                "title": "Keep Cabin Air Recirculation Active",
                "description": "Ensure the vehicle AC is set to internal recirculation. Avoid exterior air intake when stuck in morning and evening traffic congestion.",
                "reason": "Stops raw exhaust and brake dust from directly entering passenger compartment.",
                "priority": "high",
                "category": "Vehicle Protection",
                "cost": "free",
                "effort": "low",
                "source": "rules"
            })
        else:
            commute_recs.append({
                "id": "det-metro-commute",
                "title": "Opt for Underground Electric Rail (Metro)",
                "description": "Underground rail isolates transit from street-level vehicle exhaust while replacing personal tailpipe emissions.",
                "reason": "Fast, low-emission, and significantly cleaner than surface arterial corridors.",
                "priority": "medium",
                "category": "Clean Commute",
                "cost": "low",
                "effort": "low",
                "source": "rules"
            })

        # Sustainable choices
        sustainable_choices = []
        for alt in alternatives["alternatives"][:3]:
            sustainable_choices.append({
                "id": f"det-alt-{alt['id']}",
                "title": f"Swap: {alt['sustainable_swap']}",
                "description": f"Replace '{alt['conventional_practice']}' with '{alt['sustainable_swap']}'.",
                "reason": alt["direct_impact_explanation"],
                "priority": "medium",
                "category": alt["domain"],
                "cost": "low",
                "effort": "medium",
                "source": "rules"
            })

        # Daily timeline plan
        plan_steps = routines.get("steps", [])
        daily_plan = {
            "morning": [],
            "afternoon": [],
            "evening": [],
            "night": []
        }
        for idx, st in enumerate(plan_steps):
            item = {
                "id": f"plan-step-{idx}",
                "title": st["activity"],
                "description": st["low_emission_action"],
                "reason": st["impact_explanation"],
                "priority": "high" if idx == 0 and is_high_smog else "medium",
                "source": "rules"
            }
            if idx == 0:
                daily_plan["morning"].append(item)
            elif idx == 1:
                daily_plan["afternoon"].append(item)
            elif idx == 2:
                daily_plan["evening"].append(item)
            else:
                daily_plan["night"].append(item)

        main_concerns = [
            f"Current US AQI is {aqi_val or 'unavailable'} ({cat}).",
            "Morning thermal radiation inversions can concentrate particulates between 6:00 and 9:30 AM."
        ]
        if "children" in household:
            main_concerns.append("Children in household have developing respiratory systems and require extra caution.")
        if "no_air_purifier" in indoor:
            main_concerns.append("No indoor mechanical air purifier: prioritize source control, wet cleaning, and sealing.")

        limitations = [
            "Guidance is educational and based on environmental physics, not individual clinical prescriptions.",
            "Weather conditions and localized wind shifts can alter actual exposure levels.",
            "Always consult healthcare providers for personal asthma or cardiac action plans."
        ]

        impact_explanations = [
            "Shifting commute modes directly reduces street-level nitrogen dioxide and particulate emissions.",
            "Sealing doors and avoiding morning window ventilation cuts indoor PM2.5 infiltration by over 50%."
        ]

        summary = (
            f"Rule-based clean air plan for {city_name or 'current location'} under {cat} conditions (US AQI: {aqi_val or 'N/A'}). "
            f"{aqi_interp['general_guidance']}"
        )

        return {
            "source": "rules",
            "ai_available": False,
            "fallback_reason": fallback_reason,
            "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "based_on": "current_conditions",
            "summary": summary,
            "severity": aqi_interp,
            "main_concerns": main_concerns,
            "immediate_actions": immediate_actions,
            "outdoor_guidance": outdoor_guidance,
            "indoor_recommendations": indoor_recs,
            "commute_recommendations": commute_recs,
            "sustainable_choices": sustainable_choices,
            "daily_plan": daily_plan,
            "impact_explanations": impact_explanations,
            "limitations": limitations
        }
