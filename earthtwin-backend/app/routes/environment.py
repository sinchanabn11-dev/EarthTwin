"""
EarthTwin — Environmental Telemetry Routes
"""

from fastapi import APIRouter, HTTPException, Query, Path
from typing import Optional
from app.models.environmental import EnvironmentalData, EnvironmentalHistoryResponse
from app.services.environment_service import environment_service

router = APIRouter(prefix="/api/environment", tags=["Environmental Telemetry"])


@router.get(
    "/{ecosystem_id}",
    response_model=EnvironmentalData,
    summary="Get Latest Environmental Conditions",
    description="Returns the most recent environmental telemetry (temperature, humidity, rainfall, soil moisture, vegetation health, air quality) for a given ecosystem."
)
async def get_latest_environment(
    ecosystem_id: str = Path(..., description="Ecosystem ID (e.g. forest-001, urban-park-001, wetland-001, agri-001)")
):
    data = environment_service.get_latest_environment(ecosystem_id)
    if not data:
        raise HTTPException(
            status_code=404,
            detail=f"Ecosystem with ID '{ecosystem_id}' not found. Available IDs: forest-001, urban-park-001, wetland-001, agri-001"
        )
    return data


@router.get(
    "/{ecosystem_id}/history",
    response_model=EnvironmentalHistoryResponse,
    summary="Get Historical Environmental Telemetry",
    description="Returns time-series telemetry data for the specified duration (7 days, 30 days, or 90 days)."
)
async def get_environment_history(
    ecosystem_id: str = Path(..., description="Ecosystem ID"),
    days: int = Query(7, description="Number of historical days to retrieve (7, 30, or 90)", ge=1, le=90)
):
    history = environment_service.get_historical_environment(ecosystem_id, days=days)
    if not history:
        raise HTTPException(
            status_code=404,
            detail=f"Ecosystem with ID '{ecosystem_id}' not found."
        )
    return history
