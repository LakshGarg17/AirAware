"""
Validator and Safety Filter for Gemini AI Service.
Validates model outputs, rejects unsafe claims, strips unsupported numeric assertions,
and ensures deterministic integrity.
"""
import logging
import re
from typing import Any, Dict, List, Tuple
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# Banned Claims Regex Patterns
BANNED_PATTERNS = [
    # Ozone generators / ionizers
    (re.compile(r"\b(ozone\s+generator|air\s+ionizer|generat(es?|ing)\s+ozone)\b", re.IGNORECASE), "Recommending ozone generators or ionizers"),
    # Plants replace filtration
    (re.compile(r"\b(plants?\s+replace(s)?\s+(hepa|filter|purifier)|houseplants?\s+clean\s+(all\s+)?smog|plants?\s+filter\s+pm2\.5)\b", re.IGNORECASE), "Claiming plants replace mechanical air filtration"),
    # DIY equals true certified HEPA
    (re.compile(r"\b(diy\s+filters?\s+equals?\s+(certified\s+)?hepa|100%\s+equivalent\s+to\s+certified\s+hepa)\b", re.IGNORECASE), "Claiming DIY filter equals certified medical HEPA"),
    # Windows permanently closed
    (re.compile(r"\b(never\s+open\s+windows|windows?\s+must\s+never\s+be\s+opened|permanently\s+seal\s+windows)\b", re.IGNORECASE), "Claiming windows must never be opened for ventilation"),
    # Medical cures / guarantees
    (re.compile(r"\b(guaranteed\s+protection|cures?\s+asthma|eliminates?\s+all\s+respiratory\s+risk|prevents?\s+all\s+lung\s+damage)\b", re.IGNORECASE), "Claiming guaranteed health protection or medical cure"),
    # Medication dosing / prescription
    (re.compile(r"\b(take\s+\d+\s*mg|prescribe|increase\s+inhaler\s+dose|take\s+steroid)\b", re.IGNORECASE), "Prescribing medication or clinical dosing")
]

# Unsupported numeric claims regex (e.g. "reduces PM2.5 by 43%", "cuts CO2 by 12 kg", "drops AQI by 25 points")
UNSUPPORTED_NUMERIC_PATTERN = re.compile(
    r"\b(\d+(\.\d+)?%\s*(reduction|drop|decrease|cut)|\d+(\.\d+)?\s*kg\s*co2|\d+\s*aqi\s*points|\d+(\.\d+)?\s*(micrograms|particles))\b",
    re.IGNORECASE
)


class RecommendationItemModel(BaseModel):
    id: str = "item"
    title: str
    description: str
    reason: str
    priority: str = "medium"
    category: str = "General"
    cost: str = "free"
    effort: str = "low"
    source: str = "ai"


def _check_text_safety(text: str) -> Tuple[bool, str]:
    """Checks text against banned patterns and unsupported numeric claims."""
    if not text:
        return True, ""
    for pattern, reason in BANNED_PATTERNS:
        if pattern.search(text):
            return False, reason
    if UNSUPPORTED_NUMERIC_PATTERN.search(text):
        return False, "Contains unsupported numeric impact claim"
    return True, ""


def validate_and_filter_ai_recommendations(raw_data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any], str]:
    """
    Validates model output dictionary and filters unsafe items.
    Returns: (is_valid, filtered_data, filter_reason)
    """
    if not isinstance(raw_data, dict):
        return False, {}, "Output is not a valid JSON dictionary"

    summary = raw_data.get("summary", "")
    ok, reason = _check_text_safety(summary)
    if not ok:
        logger.warning(f"AI recommendation summary failed safety check: {reason}")
        return False, {}, f"Safety filter: {reason}"

    # Clean lists
    list_keys = [
        "immediate_actions",
        "outdoor_guidance",
        "indoor_recommendations",
        "commute_recommendations",
        "sustainable_choices"
    ]

    filtered_data: Dict[str, Any] = {
        "summary": str(summary)[:600],
        "main_concerns": [str(c)[:200] for c in raw_data.get("main_concerns", []) if isinstance(c, str)][:5],
        "impact_explanations": [str(i)[:300] for i in raw_data.get("impact_explanations", []) if isinstance(i, str)][:5],
        "limitations": [str(l)[:300] for l in raw_data.get("limitations", []) if isinstance(l, str)][:5],
        "daily_plan": {"morning": [], "afternoon": [], "evening": [], "night": []}
    }

    for key in list_keys:
        items = raw_data.get(key, [])
        valid_items = []
        if isinstance(items, list):
            for itm in items:
                if not isinstance(itm, dict):
                    continue
                title = str(itm.get("title", ""))[:120]
                desc = str(itm.get("description", ""))[:400]
                reason_txt = str(itm.get("reason", ""))[:300]

                # Run safety filter
                ok_t, r_t = _check_text_safety(title)
                ok_d, r_d = _check_text_safety(desc)
                ok_r, r_r = _check_text_safety(reason_txt)

                if not (ok_t and ok_d and ok_r):
                    logger.info(f"Filtered unsafe AI item '{title}': {r_t or r_d or r_r}")
                    continue  # Strip the unsafe item

                prio = str(itm.get("priority", "medium")).lower()
                if prio not in ("high", "medium", "low"):
                    prio = "medium"

                cost = str(itm.get("cost", "free")).lower()
                if cost not in ("free", "low", "medium", "high"):
                    cost = "free"

                valid_items.append({
                    "id": str(itm.get("id", f"ai-{len(valid_items)+1}")),
                    "title": title,
                    "description": desc,
                    "reason": reason_txt,
                    "priority": prio,
                    "category": str(itm.get("category", "General"))[:60],
                    "cost": cost,
                    "effort": str(itm.get("effort", "low"))[:30],
                    "source": "ai"
                })
        filtered_data[key] = valid_items[:8]

    # Clean daily plan
    raw_plan = raw_data.get("daily_plan", {})
    if isinstance(raw_plan, dict):
        for period in ["morning", "afternoon", "evening", "night"]:
            p_items = raw_plan.get(period, [])
            clean_p = []
            if isinstance(p_items, list):
                for pitm in p_items:
                    if not isinstance(pitm, dict):
                        continue
                    p_title = str(pitm.get("title", ""))[:120]
                    p_desc = str(pitm.get("description", ""))[:300]
                    ok_pt, _ = _check_text_safety(p_title)
                    ok_pd, _ = _check_text_safety(p_desc)
                    if ok_pt and ok_pd:
                        clean_p.append({
                            "id": str(pitm.get("id", f"plan-{period}-{len(clean_p)+1}")),
                            "title": p_title,
                            "description": p_desc,
                            "reason": str(pitm.get("reason", ""))[:200],
                            "priority": str(pitm.get("priority", "medium")).lower(),
                            "source": "ai"
                        })
            filtered_data["daily_plan"][period] = clean_p[:5]

    return True, filtered_data, ""
