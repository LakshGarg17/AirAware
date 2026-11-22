from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class RecommendationRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    city: Optional[str] = None
    profile: Optional[Dict[str, Any]] = None


class ChatMessage(BaseModel):
    role: str = "user"  # "user" or "model" / "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., max_length=500)
    history: List[Dict[str, str]] = Field(default_factory=list)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    city: Optional[str] = None
    profile: Optional[Dict[str, Any]] = None

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Message cannot be empty or whitespace only.")
        return stripped


class ContextUsedMeta(BaseModel):
    aqi: Optional[int] = None
    standard: str = "US AQI"
    category: str
    location: str


class ChatResponse(BaseModel):
    reply: str
    source: str  # "ai" or "rules"
    fallback_reason: Optional[str] = None
    suggested_followups: List[str] = Field(default_factory=list)
    context_used: ContextUsedMeta
