from typing import Any, Dict, List
from fastapi import APIRouter
from pydantic import BaseModel

from app.schemas.profile import UserProfile, normalize_profile

router = APIRouter(prefix="/api/profile", tags=["User Profile (Stateless)"])


class ProfileValidateResponse(BaseModel):
    valid: bool
    profile: UserProfile
    warnings: List[str]


@router.post("/validate", response_model=ProfileValidateResponse)
def validate_profile(payload: Dict[str, Any]):
    """
    Validates and normalizes user lifestyle profile data.
    Stateless endpoint: drops unknown values and deterministically resolves contradictions.
    """
    profile, warnings = normalize_profile(payload)
    return ProfileValidateResponse(
        valid=True,
        profile=profile,
        warnings=warnings
    )
