"""
User Profile Schema and Validation.
Enums strictly validated; free-text and medical data disallowed.
Contradictions resolved deterministically.
"""
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class RoutineEnum(str, Enum):
    student = "student"
    office_worker = "office_worker"
    work_from_home = "work_from_home"
    outdoor_worker = "outdoor_worker"
    flexible = "flexible"
    other = "other"


class CommuteEnum(str, Enum):
    walking = "walking"
    bicycle = "bicycle"
    motorcycle = "motorcycle"
    car = "car"
    public_transport = "public_transport"
    carpool = "carpool"
    work_from_home = "work_from_home"
    other = "other"


class OutdoorActivityEnum(str, Enum):
    walking = "walking"
    running = "running"
    cycling = "cycling"
    outdoor_sports = "outdoor_sports"
    regular_outdoor = "regular_outdoor"
    mostly_indoor = "mostly_indoor"


class HouseholdEnum(str, Enum):
    children = "children"
    elderly = "elderly"
    sensitive_people = "sensitive_people"
    general = "general"


class IndoorEnum(str, Enum):
    air_purifier = "air_purifier"
    no_air_purifier = "no_air_purifier"
    ac = "ac"
    ventilation_options = "ventilation_options"
    limited_control = "limited_control"


class ConstraintEnum(str, Enum):
    budget_conscious = "budget_conscious"
    cannot_avoid_outdoor_work = "cannot_avoid_outdoor_work"
    limited_transport = "limited_transport"
    limited_indoor_space = "limited_indoor_space"
    other = "other"


class UserProfile(BaseModel):
    routine: Optional[RoutineEnum] = None
    commute: Optional[CommuteEnum] = None
    outdoor_activity: Optional[OutdoorActivityEnum] = None
    household: List[HouseholdEnum] = Field(default_factory=list)
    indoor: List[IndoorEnum] = Field(default_factory=list)
    constraints: List[ConstraintEnum] = Field(default_factory=list)


def normalize_profile(raw_data: Dict[str, Any]) -> Tuple[UserProfile, List[str]]:
    """
    Normalizes a profile dictionary, dropping unknown enum values and
    resolving contradictory selections deterministically with warnings.
    """
    warnings: List[str] = []
    normalized: Dict[str, Any] = {}

    # 1. Single enum fields
    for field, enum_cls in [
        ("routine", RoutineEnum),
        ("commute", CommuteEnum),
        ("outdoor_activity", OutdoorActivityEnum)
    ]:
        val = raw_data.get(field)
        if val is not None:
            try:
                normalized[field] = enum_cls(str(val))
            except ValueError:
                warnings.append(f"Unknown value '{val}' for field '{field}' was dropped.")

    # 2. List enum fields
    for field, enum_cls in [
        ("household", HouseholdEnum),
        ("indoor", IndoorEnum),
        ("constraints", ConstraintEnum)
    ]:
        val_list = raw_data.get(field, [])
        clean_list = []
        if isinstance(val_list, list):
            for itm in val_list:
                try:
                    clean_itm = enum_cls(str(itm))
                    if clean_itm not in clean_list:
                        clean_list.append(clean_itm)
                except ValueError:
                    warnings.append(f"Unknown value '{itm}' in list '{field}' was dropped.")
        normalized[field] = clean_list

    # 3. Resolve contradictions deterministically
    indoor_list = normalized.get("indoor", [])
    if IndoorEnum.air_purifier in indoor_list and IndoorEnum.no_air_purifier in indoor_list:
        # User checked both purifier and no_purifier
        indoor_list.remove(IndoorEnum.no_air_purifier)
        warnings.append("Contradictory options 'air_purifier' and 'no_air_purifier' detected; defaulted to 'air_purifier'.")

    return UserProfile(**normalized), warnings
