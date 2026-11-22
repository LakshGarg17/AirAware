"""
Base Recommendation Provider Interface.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class RecommendationProvider(ABC):
    @abstractmethod
    async def get_recommendations(
        self,
        latitude: float,
        longitude: float,
        aq_data: Dict[str, Any],
        weather_data: Dict[str, Any],
        city_name: Optional[str] = None,
        profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generates comprehensive recommendations based on environmental observations."""
        pass
