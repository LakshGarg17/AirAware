from typing import List, Optional
from pydantic import BaseModel


class LocationItem(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    elevation: Optional[float] = None
    feature_code: Optional[str] = None
    country_code: Optional[str] = None
    country: Optional[str] = None
    admin1: Optional[str] = None
    timezone: Optional[str] = None
    population: Optional[int] = None


class GeocodingResponse(BaseModel):
    query: str
    count: int
    results: List[LocationItem]
