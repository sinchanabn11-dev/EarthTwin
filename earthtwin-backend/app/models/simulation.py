"""
Pydantic data models for What-If Simulation Engine.
"""

from pydantic import BaseModel, Field
from typing import Dict, Optional, List


class SimulationRequest(BaseModel):
    ecosystem_id: str = Field(..., description="ID of ecosystem to simulate (e.g. forest-001)")
    temperature_change: float = Field(
        ...,
        ge=-5.0,
        le=10.0,
        description="Simulated temperature delta in °C (Allowed range: -5.0 to +10.0)"
    )
    rainfall_change: float = Field(
        ...,
        ge=-50.0,
        le=50.0,
        description="Simulated rainfall delta in % (Allowed range: -50.0% to +50.0%)"
    )
    soil_moisture_change: float = Field(
        ...,
        ge=-50.0,
        le=50.0,
        description="Simulated soil moisture delta in % (Allowed range: -50.0% to +50.0%)"
    )
    humidity_change: float = Field(
        ...,
        ge=-30.0,
        le=30.0,
        description="Simulated relative humidity delta in % (Allowed range: -30.0% to +30.0%)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "ecosystem_id": "forest-001",
                "temperature_change": 2.0,
                "rainfall_change": -20.0,
                "soil_moisture_change": -15.0,
                "humidity_change": -10.0
            }
        }


class SimulationMetrics(BaseModel):
    health: float = Field(..., description="Overall ecosystem health score (0-100)")
    fire_risk: float = Field(..., description="Fire risk percentage (0-100%)")
    drought_risk: float = Field(..., description="Drought risk percentage (0-100%)")
    vegetation_health: float = Field(..., description="Vegetation health index (0-100)")


class SimulationResponse(BaseModel):
    simulation_id: str = Field(..., description="Unique ID of this simulation run")
    ecosystem_id: str
    timestamp: str
    inputs: Dict[str, float]
    current: SimulationMetrics
    simulated: SimulationMetrics
    deltas: Dict[str, float]
    explanation: str
    simulation_type: str = Field(
        default="rule_based_estimate",
        description="Type of simulation used (rule_based_estimate or ml_model_prediction)"
    )
    disclaimer: str = Field(
        default="Simulation estimate — ML model can be connected later.",
        description="Transparent college project verification label"
    )


class SimulationHistoryItem(BaseModel):
    id: str
    ecosystem_id: str
    timestamp: str
    temperature_change: float
    rainfall_change: float
    soil_moisture_change: float
    humidity_change: float
    current_health: float
    simulated_health: float
    current_fire_risk: float
    simulated_fire_risk: float
    current_drought_risk: float
    simulated_drought_risk: float
    explanation: Optional[str] = None
