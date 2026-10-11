"""
EarthTwin — Ecosystems Management Routes
"""

from fastapi import APIRouter, HTTPException, Path
from typing import List
from app.models.ecosystem import EcosystemSummary, EcosystemDetail
from app.services.environment_service import environment_service

router = APIRouter(prefix="/api/ecosystems", tags=["Ecosystems & Zones"])


@router.get(
    "",
    response_model=List[EcosystemSummary],
    summary="List All Available Ecosystems",
    description="Returns the directory of monitored outdoor ecosystems including Forest (Bengaluru Forest Zone), Urban Park, Wetland, and Agricultural Area."
)
async def list_ecosystems():
    return environment_service.get_all_ecosystems()


@router.get(
    "/{ecosystem_id}",
    response_model=EcosystemDetail,
    summary="Get Detailed Ecosystem Information & Zones",
    description="Returns full ecosystem profiles, GPS coordinates, composite health score, live telemetry, and zone micro-climate breakdowns."
)
async def get_ecosystem(
    ecosystem_id: str = Path(..., description="Ecosystem ID (e.g. forest-001, urban-park-001, wetland-001, agri-001)")
):
    detail = environment_service.get_ecosystem_detail(ecosystem_id)
    if not detail:
        raise HTTPException(
            status_code=404,
            detail=f"Ecosystem with ID '{ecosystem_id}' was not found."
        )
    return detail
