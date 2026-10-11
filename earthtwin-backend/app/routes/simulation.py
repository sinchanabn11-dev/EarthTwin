"""
EarthTwin — What-If Simulation Engine Routes
"""

from fastapi import APIRouter, HTTPException, Path
from typing import List
from app.models.simulation import SimulationRequest, SimulationResponse, SimulationHistoryItem
from app.services.simulation_service import simulation_service

router = APIRouter(prefix="/api/simulation", tags=["What-If Simulation Engine"])


@router.post(
    "/run",
    response_model=SimulationResponse,
    summary="Execute What-If Ecosystem Simulation",
    description="Simulates climate change and stress conditions (temperature delta, rainfall delta, soil moisture delta, humidity delta) and returns predicted ecological conditions."
)
async def run_simulation(request: SimulationRequest):
    # Validate ecosystem existence
    result = simulation_service.run_simulation(request)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Ecosystem with ID '{request.ecosystem_id}' was not found. Please verify the ID."
        )
    return result


@router.get(
    "/history/{ecosystem_id}",
    response_model=List[SimulationHistoryItem],
    summary="Get Previous Simulation Runs",
    description="Retrieves chronological log of past What-If simulations executed for this ecosystem."
)
async def get_simulation_history(
    ecosystem_id: str = Path(..., description="Ecosystem ID (e.g. forest-001)")
):
    return simulation_service.get_history(ecosystem_id)
