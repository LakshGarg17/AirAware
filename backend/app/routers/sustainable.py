from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.services.recommendations import get_sustainable_alternatives_catalog

router = APIRouter(prefix="/api/sustainable", tags=["Sustainable Living"])


class SustainableRecommendation(BaseModel):
    id: str
    domain: str
    conventional_practice: str
    sustainable_swap: str
    what_to_do: str
    why_it_matters: str
    what_is_changeable: str
    qualitative_benefit: str
    difficulty: str


class SustainableResponse(BaseModel):
    total_recommendations: int
    recommendations: List[SustainableRecommendation]
    philosophy: str = (
        "Non-judgmental, pragmatic climate stewardship. "
        "Every small habit swap reduces community smog loading without requiring perfection."
    )


@router.get("/recommendations", response_model=SustainableResponse)
@router.post("/recommendations", response_model=SustainableResponse)
def get_sustainable_recommendations(profile: Optional[Dict[str, Any]] = None):
    """
    Returns personalized sustainable living recommendations based on user commute and routine.
    Strictly qualitative and non-judgmental; zero fabricated numbers.
    """
    catalog = get_sustainable_alternatives_catalog()["alternatives"]

    recs: List[SustainableRecommendation] = []
    for item in catalog:
        recs.append(SustainableRecommendation(
            id=item["id"],
            domain=item["domain"],
            conventional_practice=item["conventional_practice"],
            sustainable_swap=item["sustainable_swap"],
            what_to_do=f"Transition from {item['conventional_practice']} to {item['sustainable_swap']}.",
            why_it_matters=item["direct_impact_explanation"],
            what_is_changeable="Start with 1 to 2 days per week or coordinate shared community practices.",
            qualitative_benefit=f"Health: {item['health_benefit']}. Emissions: {item['emissions_impact']}",
            difficulty=item["ease_of_adoption"]
        ))

    return SustainableResponse(
        total_recommendations=len(recs),
        recommendations=recs
    )
