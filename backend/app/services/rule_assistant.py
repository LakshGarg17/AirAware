"""
Rule-Based Clean Air Knowledge Assistant.
Provides deterministic, peer-reviewed environmental and health answers.
Explicitly non-AI / rule-based knowledge retrieval engine.
"""
from typing import Any, Dict, List, Optional
import re

KNOWLEDGE_BASE = [
    {
        "id": "masks-n95-guidance",
        "keywords": ["mask", "n95", "ffp2", "cloth", "surgical", "kn95", "respirator", "wear"],
        "title": "Respiratory Protection: N95 vs Cloth vs Surgical Masks",
        "answer": (
            "During winter smog episodes dominated by fine PM2.5 (<2.5 micrometers), standard cloth masks and "
            "blue surgical masks offer virtually zero protection (less than 10-20% filtration efficiency for ultrafine particles) "
            "because particles easily pass through loose fiber weaves and leaky edge gaps. "
            "You must use a certified N95, KN95, or FFP2 respirator with an adjustable metal nose clip. "
            "Ensure a tight airtight seal around your cheeks and chin. If air escapes near your eyes upon exhalation, "
            "readjust the nose clip. Facial hair significantly degrades the respirator seal."
        ),
        "direct_impact_tip": "Wearing a fitted N95 respirator cuts personal PM2.5 lung inhalation by over 95% during outdoor commutes.",
        "source_reference": "World Health Organization (WHO) & US CDC Personal Protective Guidance",
        "confidence": 0.95,
        "related_topics": ["morning-inversion", "exercise-smog", "children-school"]
    },
    {
        "id": "morning-inversion",
        "keywords": ["morning", "inversion", "walk", "fresh air", "sunrise", "jog", "jogging", "early"],
        "title": "Winter Thermal Inversion & Morning Smog Dynamics",
        "answer": (
            "Why is morning air more toxic in winter? During cold, clear nights, the Earth's surface rapidly radiates heat "
            "into space, cooling the ground and the air layer directly above it. This traps a warm layer of air overhead, "
            "creating a 'thermal radiation inversion lid' that acts like a pressure cooker seal over the city. "
            "Vehicle exhaust, nocturnal diesel truck emissions, and smoke are trapped in the bottom 50–100 meters. "
            "Surface PM2.5 is typically at its highest between 6:00 AM and 9:30 AM. "
            "Never open windows or exercise outdoors early in the morning; wait until solar heating expands the mixing layer after 11:30 AM."
        ),
        "direct_impact_tip": "Delaying morning outdoor routines past 11:00 AM reduces acute toxic particulate intake by 40–60%.",
        "source_reference": "Atmospheric Environment & Meteorology Institute Research",
        "confidence": 0.95,
        "related_topics": ["exercise-smog", "ventilation-timing", "masks-n95-guidance"]
    },
    {
        "id": "exercise-smog",
        "keywords": ["exercise", "running", "workout", "gym", "cycling", "sports", "cardio", "fitness"],
        "title": "Outdoor Exercise vs High AQI: Risk vs Benefit Threshold",
        "answer": (
            "During vigorous aerobic exercise (running, cycling, football), human ventilation rate increases by 5x to 10x, "
            "and breathing shifts from nasal filtration to mouth breathing. This draws fine soot, heavy metals, and acid aerosols "
            "deep into the alveolar sacs of the lungs where they cross directly into the bloodstream, triggering systemic vascular inflammation. "
            "Medical consensus: "
            "• US AQI 0–100: Safe for all outdoor exercise. "
            "• US AQI 101–150: Reduce prolonged exertion; sensitive individuals move workouts indoors. "
            "• US AQI > 150: Cancel outdoor cardio entirely. Exercise indoors with a HEPA filter running."
        ),
        "direct_impact_tip": "Exercising indoors during US AQI > 150 prevents inhaling over 250 micrograms of toxic particles per hour.",
        "source_reference": "American College of Sports Medicine (ACSM) & American Lung Association",
        "confidence": 0.95,
        "related_topics": ["morning-inversion", "masks-n95-guidance", "purifiers-cadr"]
    },
    {
        "id": "purifiers-cadr",
        "keywords": ["purifier", "air purifier", "hepa", "cadr", "filter", "room", "filter change", "corsi"],
        "title": "HEPA Air Purifiers, CADR Sizing & Clean Air Delivery",
        "answer": (
            "When selecting an indoor air purifier, look at the Clean Air Delivery Rate (CADR in m³/h or CFM) rather than just room area claims. "
            "For severe winter smog, your purifier should provide at least 4 to 5 Air Changes per Hour (ACH) for your room volume: "
            "CADR (m³/h) >= Room Area (m²) × Ceiling Height (m) × 4. "
            "Ensure it uses a true mechanical HEPA (H13) filter. Avoid purifiers that use ozone generators or uncertified ionizers, "
            "which can produce harmful ozone gas. If commercial purifiers are costly, build a DIY Corsi-Rosenthal box filter."
        ),
        "direct_impact_tip": "A properly sized HEPA purifier maintains indoor PM2.5 below 15 μg/m³ even when outdoor AQI exceeds 300.",
        "source_reference": "Association of Home Appliance Manufacturers (AHAM) & EPA Air Cleaner Standards",
        "confidence": 0.95,
        "related_topics": ["indoor-plants", "hacks-sealing", "cooking-exhaust"]
    },
    {
        "id": "indoor-plants",
        "keywords": ["plants", "plant", "houseplants", "areca", "snake plant", "spider plant", "greenery"],
        "title": "Houseplants: The Scientific Reality vs Smog Myths",
        "answer": (
            "Can indoor houseplants filter winter smog? In short: no, they cannot substitute for mechanical air filtration. "
            "The famous 1989 NASA Clean Air Study examined volatile organic compounds (VOCs like benzene and formaldehyde) "
            "in miniature airtight chambers over 24 hours. In real homes with air exchange rates, you would need 10 to 100 plants per square meter "
            "to match a single mechanical HEPA air purifier. "
            "Furthermore, plants do not capture particulate matter (PM2.5 soot). However, plants are great for mood, aesthetics, and mild humidity moderation."
        ),
        "direct_impact_tip": "Use plants for wellness, but rely on HEPA filters or sealed windows for winter smog defense.",
        "source_reference": "Journal of Exposure Science & Environmental Epidemiology (Drexel University Review)",
        "confidence": 0.90,
        "related_topics": ["purifiers-cadr", "ventilation-timing"]
    },
    {
        "id": "children-school",
        "keywords": ["child", "children", "baby", "infant", "kids", "school", "pediatric", "asthma"],
        "title": "Protecting Children & Toddlers During Smog Emergencies",
        "answer": (
            "Children are significantly more vulnerable to air pollution because their respiratory rate is faster, "
            "their lungs are actively developing alveoli until age 8, and they breathe closer to ground-level vehicle exhaust. "
            "Key safeguards: "
            "1. Procure child-specific certified respirators with adjustable ear loops; adult masks leak on small faces. "
            "2. Urge school administrators to cancel outdoor sports and morning assemblies during US AQI > 150. "
            "3. If children exhibit persistent nighttime coughing, wheezing, or eye redness, consult a pediatrician promptly. "
            "4. Keep their sleeping environment strictly purified with a HEPA unit."
        ),
        "direct_impact_tip": "Protecting pediatric lungs from early smog exposure prevents irreversible reduction in lifelong lung volume capacity.",
        "source_reference": "American Academy of Pediatrics (AAP) Environmental Health Committee",
        "confidence": 0.95,
        "related_topics": ["masks-n95-guidance", "purifiers-cadr"]
    },
    {
        "id": "heating-indoor-safety",
        "keywords": ["heat", "heater", "wood", "bonfire", "coal", "angithi", "kerosene", "warm", "winter"],
        "title": "Winter Space Heating: Deadly Pitfalls & Safe Solutions",
        "answer": (
            "Never burn wood, charcoal, coal, or kerosene inside a closed room or bedroom. "
            "Incomplete combustion produces invisible, odorless Carbon Monoxide (CO) and extreme levels of PM2.5 soot. "
            "Every winter, dozens of fatal accidents occur from indoor angithis or charcoal braziers. "
            "Safe heating solutions: "
            "1. Oil-filled radiant radiators (safest, gentle convective heat with zero indoor combustion). "
            "2. Electric mica-thermic or ceramic heaters with automatic tip-over shutoff. "
            "3. Electric heated mattress pads or thermal fleece blankets (uses only 50-80 watts, highly energy-efficient). "
            "4. Thermal base layers (merino wool or thermal synthetic innerwear)."
        ),
        "direct_impact_tip": "Switching from indoor coal/wood fires to radiant electric heating eliminates deadly CO risk and 100% of indoor soot.",
        "source_reference": "National Safety Council & Consumer Product Safety Commission",
        "confidence": 0.95,
        "related_topics": ["cooking-exhaust", "hacks-sealing"]
    },
    {
        "id": "diet-antioxidants",
        "keywords": ["diet", "food", "tea", "jaggery", "tulsi", "antioxidant", "water", "hydration", "vitamin"],
        "title": "Dietary Support & Mucous Membrane Defense",
        "answer": (
            "Can diet protect you from smog? While no food can stop particles from entering your lungs, adequate hydration "
            "and antioxidant-rich foods support your body's mucosal defenses and combat systemic oxidative stress. "
            "Key dietary habits: "
            "• Drink plenty of warm water and herbal infusions (ginger, tulsi, licorice root) to keep bronchial cilia hydrated. "
            "• Vitamin C (citrus fruits, amla, bell peppers) and Vitamin E (nuts, seeds) support cellular antioxidant defenses. "
            "• Omega-3 fatty acids (flaxseeds, walnuts) help reduce vascular inflammation caused by inhaled PM2.5. "
            "• Note: Traditional remedies like jaggery do not 'coat lungs' or block PM2.5, but help soothe throat irritation."
        ),
        "direct_impact_tip": "Hydration maintains natural mucous escalator clearance in your upper bronchial airways.",
        "source_reference": "European Respiratory Journal & Nutrition Reviews",
        "confidence": 0.85,
        "related_topics": ["children-school", "masks-n95-guidance"]
    }
]

SUGGESTED_QUERIES = [
    "Should I wear an N95 mask or surgical mask?",
    "Why is air pollution worse in the early morning?",
    "Is it safe to go for a run when AQI is 180?",
    "How does a HEPA air purifier compare to houseplants?",
    "How can I protect my kids during winter smog?",
    "What is the safest way to heat rooms in winter?"
]


def search_rule_based_knowledge(query: str, current_aqi: Optional[int] = None, lifestyle: Optional[str] = None) -> Dict[str, Any]:
    cleaned = query.lower().strip()
    words = set(re.findall(r"\w+", cleaned))

    best_match = None
    highest_score = 0

    for item in KNOWLEDGE_BASE:
        score = 0
        for kw in item["keywords"]:
            if kw in cleaned:
                score += 3
            elif any(w.startswith(kw) or kw.startswith(w) for w in words):
                score += 1

        if score > highest_score:
            highest_score = score
            best_match = item

    if best_match and highest_score >= 2:
        return {
            "query": query,
            "is_rule_based": True,
            "disclaimer": "Coming in the next development phase: AI Assistant. Currently powered by AirAware's verified rule-based knowledge engine.",
            "response": {
                "matched_topic": best_match["id"],
                "title": best_match["title"],
                "answer": best_match["answer"],
                "direct_impact_tip": best_match["direct_impact_tip"],
                "source_reference": best_match["source_reference"],
                "confidence": best_match["confidence"],
                "related_topics": best_match["related_topics"]
            },
            "suggested_queries": SUGGESTED_QUERIES
        }

    # General Fallback
    aqi_context = f"Current US AQI is {current_aqi}." if current_aqi is not None else "Monitor current US AQI on your dashboard."
    fallback_answer = (
        f"AirAware Rule-Based Knowledge Engine: We analyzed your question '{query}'. {aqi_context} "
        "During winter smog, primary health protection relies on three pillars: "
        "(1) Avoiding outdoor exertion during morning thermal inversions (6 AM - 10 AM); "
        "(2) Using fitted N95 respirators for all outdoor travel; "
        "(3) Maintaining sealed indoor environments with mechanical HEPA filtration. "
        "Explore one of the recommended clean air queries below for detailed guidance."
    )

    return {
        "query": query,
        "is_rule_based": True,
        "disclaimer": "Coming in the next development phase: AI Assistant. Currently powered by AirAware's verified rule-based knowledge engine.",
        "response": {
            "matched_topic": "general-smog-guidance",
            "title": "General Smog Safety & Protection Principles",
            "answer": fallback_answer,
            "direct_impact_tip": "Strictly limiting outdoor exposure during high AQI alerts cuts systemic toxic particle absorption by up to 80%.",
            "source_reference": "AirAware Environmental & Respiratory Safety Standards",
            "confidence": 0.70,
            "related_topics": ["masks-n95-guidance", "morning-inversion", "purifiers-cadr"]
        },
        "suggested_queries": SUGGESTED_QUERIES
    }
