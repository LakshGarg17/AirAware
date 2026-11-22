from typing import List, Optional
from pydantic import BaseModel


class IndoorHack(BaseModel):
    id: str
    title: str
    category: str  # e.g., "Air Filtration", "Ventilation Timing", "Cleaning & Dust", "Cooking", "Heating"
    cost_level: str  # "Zero-Cost", "Low-Cost ($5-$25)", "Moderate"
    difficulty: str  # "Easy", "Moderate"
    pm25_reduction_pct: str
    description: str
    how_it_works: str
    steps: List[str]
    common_pitfalls: str


class IndoorHacksResponse(BaseModel):
    current_aqi_severity: str
    total_hacks: int
    hacks: List[IndoorHack]
    golden_rules: List[str]
