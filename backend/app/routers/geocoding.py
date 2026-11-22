from fastapi import APIRouter, HTTPException, Query
import httpx

from app.schemas.geocoding import GeocodingResponse, LocationItem
from app.services.open_meteo import OpenMeteoService

router = APIRouter(prefix="/api/geocoding", tags=["Geocoding"])

open_meteo_service = OpenMeteoService()


@router.get("/search", response_model=GeocodingResponse)
async def search_locations(
    name: str = Query(..., min_length=1, description="Location search term"),
    count: int = Query(5, ge=1, le=10, description="Maximum results to return")
):
    """
    Search cities and locations worldwide via Open-Meteo Geocoding API.
    Handles empty and absent results gracefully.
    """
    try:
        raw_results = await open_meteo_service.search_locations(name, count=count)
        items = []
        for r in raw_results:
            items.append(LocationItem(
                id=r.get("id", 0),
                name=r.get("name", ""),
                latitude=r.get("latitude", 0.0),
                longitude=r.get("longitude", 0.0),
                elevation=r.get("elevation"),
                feature_code=r.get("feature_code"),
                country_code=r.get("country_code"),
                country=r.get("country"),
                admin1=r.get("admin1"),
                timezone=r.get("timezone"),
                population=r.get("population")
            ))
        return GeocodingResponse(
            query=name,
            count=len(items),
            results=items
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Upstream geocoding service error: {exc.response.text}"
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Network error connecting to geocoding service: {str(exc)}"
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Internal error processing geocoding search: {str(exc)}"
        )
