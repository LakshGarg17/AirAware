from typing import List, Optional
from pydantic import BaseModel


class SustainableAlternative(BaseModel):
    id: str
    domain: str  # "Commute & Transit", "Heating & Winter Comfort", "Waste & Crop Management", "Cooking & Indoor Energy"
    conventional_practice: str
    sustainable_swap: str
    emissions_impact: str
    health_benefit: str
    ease_of_adoption: str
    direct_impact_explanation: str
    annual_co2_saving_kg: float
    pm25_reduction_score: str


class AlternativesResponse(BaseModel):
    total: int
    domains: List[str]
    alternatives: List[SustainableAlternative]
