from fastapi import APIRouter

from app.schemas.assistant import AssistantQueryRequest, AssistantQueryResponse
from app.services.rule_assistant import search_rule_based_knowledge

router = APIRouter(prefix="/api/assistant", tags=["Rule-Based Assistant"])


@router.post("/query", response_model=AssistantQueryResponse)
def query_assistant(payload: AssistantQueryRequest):
    """
    Rule-based Clean Air Assistant endpoint.
    Explicitly non-AI; provides verified scientific guidance.
    """
    return search_rule_based_knowledge(
        query=payload.query,
        current_aqi=payload.current_aqi,
        lifestyle=payload.lifestyle
    )
