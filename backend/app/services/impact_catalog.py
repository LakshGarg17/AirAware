"""
Action Type Catalog for Impact Tracking.
Single source of truth for Personal Exposure Reduction (Category A)
and Environmental Contribution (Category B) actions.
Strictly non-numerical: provides qualitative explanations only.
"""
from typing import Dict, List, Optional
from pydantic import BaseModel


class ImpactActionDefinition(BaseModel):
    id: str
    label: str
    category: str  # "exposure_reduction" (A) or "environmental_contribution" (B)
    group: str     # "sustainable_commuting", "exposure_reduction", "indoor_air", "lifestyle"
    explanation: str
    category_label: str


ACTION_CATALOG: List[ImpactActionDefinition] = [
    # Category A: Personal Exposure Reduction
    ImpactActionDefinition(
        id="mask_outdoor",
        label="Wore N95 Respirator Outdoors",
        category="exposure_reduction",
        group="exposure_reduction",
        category_label="Personal Exposure Reduction (Category A)",
        explanation="Filters fine soot and particulate matter (PM2.5) during outdoor travel. Reduces inhaled dose; does not change outdoor AQI."
    ),
    ImpactActionDefinition(
        id="avoided_morning_inversion",
        label="Rescheduled Morning Inversion Exposure",
        category="exposure_reduction",
        group="exposure_reduction",
        category_label="Personal Exposure Reduction (Category A)",
        explanation="Delayed outdoor activities until after 10:00 AM when ground inversions disperse. Significantly lowers acute breathing exposure."
    ),
    ImpactActionDefinition(
        id="moved_exercise_indoors",
        label="Moved Workout / Exercise Indoors",
        category="exposure_reduction",
        group="exposure_reduction",
        category_label="Personal Exposure Reduction (Category A)",
        explanation="Avoids heavy respiratory ventilation in smoggy air. Protects bronchial passages from high-volume soot deposition."
    ),
    ImpactActionDefinition(
        id="sealed_windows_doors",
        label="Sealed Window & Door Drafts",
        category="exposure_reduction",
        group="indoor_air",
        category_label="Personal Exposure Reduction (Category A)",
        explanation="Compression seals prevent ambient outdoor smog from drafting into living and sleeping quarters."
    ),
    ImpactActionDefinition(
        id="damp_mopped_dust",
        label="Damp Mopped Living Spaces",
        category="exposure_reduction",
        group="indoor_air",
        category_label="Personal Exposure Reduction (Category A)",
        explanation="Traps settled particulate matter without resuspending dust into the breathing zone like a dry broom."
    ),
    ImpactActionDefinition(
        id="used_indoor_air_cleaning",
        label="Ran Indoor Air Cleaner / HEPA / Corsi Box",
        category="exposure_reduction",
        group="indoor_air",
        category_label="Personal Exposure Reduction (Category A)",
        explanation="Circulates and scrubs indoor air volume, maintaining safe particle concentrations in enclosed rooms."
    ),
    ImpactActionDefinition(
        id="avoided_indoor_combustion",
        label="Eliminated Indoor Smoke / Incense / Candles",
        category="exposure_reduction",
        group="indoor_air",
        category_label="Personal Exposure Reduction (Category A)",
        explanation="Source control prevents dangerous internal carbon monoxide, volatile organic compound, and ultrafine soot spikes."
    ),

    # Category B: Environmental Contribution
    ImpactActionDefinition(
        id="took_public_transit",
        label="Took Public Transit (Metro / Bus)",
        category="environmental_contribution",
        group="sustainable_commuting",
        category_label="Environmental Contribution (Category B)",
        explanation="Replaces individual vehicle exhaust cycles on congested roadways. Helps mitigate shared urban emissions."
    ),
    ImpactActionDefinition(
        id="walked_or_cycled",
        label="Walked or Cycled for Short Errand",
        category="environmental_contribution",
        group="sustainable_commuting",
        category_label="Environmental Contribution (Category B)",
        explanation="Zero-tailpipe transit for local trips when AQI permits. Replaces cold engine starts that produce heavy initial soot."
    ),
    ImpactActionDefinition(
        id="avoided_vehicle_idling",
        label="Avoided Vehicle Engine Idling",
        category="environmental_contribution",
        group="sustainable_commuting",
        category_label="Environmental Contribution (Category B)",
        explanation="Turning off engines during extended stops prevents concentrated unburned hydrocarbons and localized soot plumes."
    ),
    ImpactActionDefinition(
        id="carpooled_or_rideshared",
        label="Carpooled or Shared Ride",
        category="environmental_contribution",
        group="sustainable_commuting",
        category_label="Environmental Contribution (Category B)",
        explanation="Consolidates passenger movement into fewer vehicular trips, reducing overall peak-hour arterial traffic density."
    ),
    ImpactActionDefinition(
        id="combined_errands",
        label="Combined Multiple Errands into One Trip",
        category="environmental_contribution",
        group="lifestyle",
        category_label="Environmental Contribution (Category B)",
        explanation="Eliminates repeated cold-start engine combustion and overall vehicle-kilometers traveled."
    ),
    ImpactActionDefinition(
        id="clean_home_heating",
        label="Used Clean Heating (Electric/Thermal Quilts)",
        category="environmental_contribution",
        group="lifestyle",
        category_label="Environmental Contribution (Category B)",
        explanation="Replaces open wood, coal, or kerosene combustion. Directly prevents neighborhood winter smoke plumes."
    ),
    ImpactActionDefinition(
        id="composted_yard_waste",
        label="Composted Leaves Instead of Burning",
        category="environmental_contribution",
        group="lifestyle",
        category_label="Environmental Contribution (Category B)",
        explanation="Stops toxic dioxin and black carbon plumes caused by open garden or leaf waste fires."
    )
]


def get_action_catalog() -> List[ImpactActionDefinition]:
    return ACTION_CATALOG


def get_action_by_id(action_id: str) -> Optional[ImpactActionDefinition]:
    for act in ACTION_CATALOG:
        if act.id == action_id:
            return act
    return None
