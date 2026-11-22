from typing import List, Optional
from pydantic import BaseModel


class AssistantQueryRequest(BaseModel):
    query: str
    current_aqi: Optional[int] = None
    lifestyle: Optional[str] = "general"


class RuleBasedAnswer(BaseModel):
    matched_topic: str
    title: str
    answer: str
    direct_impact_tip: str
    source_reference: str
    confidence: float
    related_topics: List[str]


class AssistantQueryResponse(BaseModel):
    query: str
    is_rule_based: bool = True
    disclaimer: str = "Coming in the next development phase: AI Assistant. Currently powered by AirAware's verified rule-based knowledge engine."
    response: RuleBasedAnswer
    suggested_queries: List[str]
