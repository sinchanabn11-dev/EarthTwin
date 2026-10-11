"""
EarthTwin — AI Dynamic Recommendations Routes
"""

from fastapi import APIRouter, HTTPException, Path
from app.models.recommendation import RecommendationsResponse
from app.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/api/recommendations", tags=["AI Recommendations"])


@router.get(
    "/{ecosystem_id}",
    response_model=RecommendationsResponse,
    summary="Get Ecological Restoration & Mitigation Recommendations",
    description="Dynamically generates customized conservation and remediation recommendations based on the ecosystem's real-time environmental metrics and risk profile."
)
async def get_recommendations(
    ecosystem_id: str = Path(..., description="Ecosystem ID (e.g. forest-001)")
):
    recs = recommendation_service.get_recommendations(ecosystem_id)
    if not recs:
        raise HTTPException(
            status_code=404,
            detail=f"Ecosystem with ID '{ecosystem_id}' was not found."
        )
    return recs
