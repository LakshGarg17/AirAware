from fastapi import APIRouter

from app.schemas.alternatives import AlternativesResponse
from app.services.recommendations import get_sustainable_alternatives_catalog

router = APIRouter(prefix="/api", tags=["Sustainable Alternatives"])


@router.get("/alternatives", response_model=AlternativesResponse)
def get_alternatives():
    """
    Returns curated sustainable alternatives for winter smog mitigation
    across transit, heating, waste, and cooking.
    """
    return get_sustainable_alternatives_catalog()
