from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.services.recommendations import get_all_indoor_hacks
from app.utils.aqi import get_aqi_interpretation

router = APIRouter(prefix="/api/indoor", tags=["Indoor Air Hygiene"])


class IndoorTipCard(BaseModel):
    id: str
    title: str
    tier: str  # "Free", "Low-Cost", "Equipment-Based"
    pm25_reduction_efficiency: str
    what_to_do: str
    why_it_matters: str
    practical_steps: List[str]
    cost: str
    common_pitfalls: str


class IndoorTipsResponse(BaseModel):
    current_aqi: Optional[int]
    aqi_category: str
    outdoor_context_summary: str
    groups: Dict[str, List[IndoorTipCard]]
    golden_rules: List[str]
    disclaimer: str = "General guidance, not clinical medical advice. Comply with local heating and safety regulations."


@router.get("/tips", response_model=IndoorTipsResponse)
def get_indoor_tips(
    aqi: Optional[int] = Query(None, description="Current US AQI reading"),
    latitude: Optional[float] = None,
    longitude: Optional[float] = None
):
    """
    Returns curated indoor air quality tips grouped into Free, Low-Cost,
    and Equipment-Based interventions with outdoor-AQI awareness.
    Complies strictly with safety rules (no ozone, no plants replacing filtration).
    """
    interp = get_aqi_interpretation(aqi)
    sev = interp["severity_key"]
    cat = interp["category"]
    aqi_val = interp["aqi"]

    is_high = aqi_val is not None and aqi_val > 100

    outdoor_summary = (
        f"Outdoor air is currently {cat} (US AQI: {aqi_val or 'unavailable'}). "
        f"{'Strictly seal morning drafts and avoid unnecessary ventilation.' if is_high else 'Outdoor air is acceptable for natural ventilation windows.'}"
    )

    free_tips = [
        IndoorTipCard(
            id="tip-damp-mop",
            title="Damp Microfiber Mopping (Never Dry Sweep)",
            tier="Free",
            pm25_reduction_efficiency="~40% particulate suppression",
            what_to_do="Clean indoor hard floors using a damp microfiber flat mop instead of a traditional dry broom.",
            why_it_matters="Dry sweeping launches settled toxic heavy metals and soot back into lung elevation for up to 2 hours. Capillary action in damp microfiber locks particles in water.",
            practical_steps=[
                "Use plain warm water or mild detergent.",
                "Mop from room corners towards the exit door.",
                "Rinse mop head frequently in clean water."
            ],
            cost="Free ($0)",
            common_pitfalls="Using dry feather dusters or sweeping vigorously before family wakes up."
        ),
        IndoorTipCard(
            id="tip-vent-timing",
            title="Solar-Assisted Midday Air Flushing",
            tier="Free",
            pm25_reduction_efficiency="Prevents acute morning inversion exposure",
            what_to_do="Time window opening strictly to 1:00 PM – 2:30 PM; keep firmly shut between 6:00 AM and 10:00 AM.",
            why_it_matters="Morning ground temperature inversions trap surface exhaust. Midday solar radiation expands the atmospheric mixing height, providing the cleanest ambient air of the winter day.",
            practical_steps=[
                "Keep windows closed during morning commute peak hours.",
                "Check AirAware at 1:00 PM; if AQI dips, open cross-windows for 10 minutes.",
                "Reseal firmly by 3:30 PM before evening cooling reinstates ground inversion."
            ],
            cost="Free ($0)",
            common_pitfalls="Opening windows at 7:00 AM believing cold morning air is 'fresh'."
        ),
        IndoorTipCard(
            id="tip-source-control",
            title="Zero Indoor Combustion Protocol",
            tier="Free",
            pm25_reduction_efficiency="Eliminates internal PM2.5 spikes up to 400 μg/m³",
            what_to_do="Eliminate incense sticks (agarbatti), scented candles, and indoor smoking completely.",
            why_it_matters="Burning a single incense stick in a closed room generates particulate soot and benzene comparable to heavy roadway pollution.",
            practical_steps=[
                "Swap scented candles for flameless LED lights.",
                "Always operate the kitchen range hood while cooking.",
                "Keep bedroom doors shut during active cooking."
            ],
            cost="Free ($0)",
            common_pitfalls="Assuming natural incense is healthy for indoor air."
        )
    ]

    low_cost_tips = [
        IndoorTipCard(
            id="tip-window-sealing",
            title="EPDM Foam Window & Door Draft Sealing",
            tier="Low-Cost",
            pm25_reduction_efficiency="50% - 60% reduction in outdoor smog drafts",
            what_to_do="Install self-adhesive foam weatherstripping tape along window frame seams and place door draft snakes at exterior entrances.",
            why_it_matters="Cold outdoor air creates thermal stack pressures that force toxic smog through millimeter-wide frame gaps.",
            practical_steps=[
                "Identify draft leaks along window sash meeting rails.",
                "Apply high-density EPDM foam tape along perimeter.",
                "Place a rolled fabric draft snake along bottom of main door."
            ],
            cost="Low-Cost ($5 - $10)",
            common_pitfalls="Sealing windows but forgetting the 1-inch gap underneath the main entry door."
        ),
        IndoorTipCard(
            id="tip-corsi-box",
            title="DIY Corsi-Rosenthal Air Cleaning Cube",
            tier="Low-Cost",
            pm25_reduction_efficiency="80% - 90% Clean Air Delivery Rate (CADR)",
            what_to_do="Construct a high-volume air scrubber using a 20-inch box fan and four MERV 13 furnace filters taped into a cube.",
            why_it_matters="Provides high clean air exchange rates matching commercial $300 purifiers at a fraction of the cost.",
            practical_steps=[
                "Assemble four MERV 13 filters with airflow arrows pointing inward.",
                "Seal bottom with cardboard and duct tape all edges.",
                "Mount box fan blowing upwards and tape perimeter."
            ],
            cost="Low-Cost ($25 - $35)",
            common_pitfalls="Pointing filter airflow arrows backwards or leaving unsealed edge leaks."
        )
    ]

    equipment_tips = [
        IndoorTipCard(
            id="tip-true-hepa",
            title="Mechanical True HEPA Purifier Sizing",
            tier="Equipment-Based",
            pm25_reduction_efficiency="99.97% single-pass capture of sub-micron particles",
            what_to_do="Select a true mechanical HEPA (H13) air purifier with CADR suitable for 4 to 5 room air changes per hour.",
            why_it_matters="Captures microscopic soot, pollen, and dust without producing ozone or secondary chemical byproducts.",
            practical_steps=[
                "Verify certified mechanical True HEPA filter (avoid ionizers/ozone).",
                "Ensure CADR (m³/h) >= Room Volume (m³) x 4.",
                "Place centrally in the room, elevated at breathing height."
            ],
            cost="Equipment ($80 - $250)",
            common_pitfalls="Purchasing ozone-generating air ionizers or undersized desktop gadgets."
        ),
        IndoorTipCard(
            id="tip-oil-radiator",
            title="Oil-Filled Radiant Space Heaters",
            tier="Equipment-Based",
            pm25_reduction_efficiency="100% elimination of indoor combustion fumes",
            what_to_do="Use closed oil-filled radiant heaters or mica-thermic panels for winter room warmth instead of open coal/wood fires.",
            why_it_matters="Completely eliminates deadly carbon monoxide poisoning risk and indoor black carbon soot.",
            practical_steps=[
                "Set oil radiator thermostat to gentle warmth.",
                "Keep 3 feet clear from curtains and bedding.",
                "Do not dry wet clothes directly on heating fins."
            ],
            cost="Equipment ($40 - $90)",
            common_pitfalls="Burning charcoal, angithis, or kerosene inside closed bedrooms."
        )
    ]

    golden_rules = [
        "Rule 1: Eliminate indoor combustion — zero incense, candles, or coal braziers.",
        "Rule 2: Never dry sweep — always damp-mop with microfiber.",
        "Rule 3: Establish a designated 'Clean Air Sanctuary Room' with HEPA or DIY box filtration.",
        "Rule 4: Avoid morning window opening — winter morning air is the most toxic.",
        "Rule 5: Keep indoor relative humidity between 40% and 50% for respiratory mucosal defense."
    ]

    return IndoorTipsResponse(
        current_aqi=aqi_val,
        aqi_category=cat,
        outdoor_context_summary=outdoor_summary,
        groups={
            "Free": free_tips,
            "Low-Cost": low_cost_tips,
            "Equipment-Based": equipment_tips
        },
        golden_rules=golden_rules
    )
