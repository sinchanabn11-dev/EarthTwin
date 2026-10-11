"""
EarthTwin — Health Scoring & Risk Analysis Routes
"""

from fastapi import APIRouter, HTTPException, Path
from app.models.risk import HealthScoreResponse, RiskAnalysisResponse
from app.services.risk_service import risk_service

router = APIRouter(tags=["Health & Risk Analysis"])


@router.get(
    "/api/health/{ecosystem_id}",
    response_model=HealthScoreResponse,
    summary="Get Overall Ecosystem Health Score (0-100)",
    description="Calculates a composite health score based on 5 ecological pillars: Vegetation Health, Water Condition, Air Quality, Soil Condition, and Climate Stability."
)
async def get_ecosystem_health(
    ecosystem_id: str = Path(..., description="Ecosystem ID (e.g. forest-001)")
):
    health = risk_service.calculate_health(ecosystem_id)
    if not health:
        raise HTTPException(
            status_code=404,
            detail=f"Ecosystem with ID '{ecosystem_id}' not found."
        )
    return health


@router.get(
    "/api/risks/{ecosystem_id}",
    response_model=RiskAnalysisResponse,
    summary="Get Multi-Risk Evaluation",
    description="Calculates individual risk metrics: Fire Risk, Drought Risk, Vegetation Stress, and Flood Risk with quantitative probabilities and explanations."
)
async def get_ecosystem_risks(
    ecosystem_id: str = Path(..., description="Ecosystem ID (e.g. forest-001)")
):
    risks = risk_service.calculate_risks(ecosystem_id)
    if not risks:
        raise HTTPException(
            status_code=404,
            detail=f"Ecosystem with ID '{ecosystem_id}' not found."
        )
    return risks
