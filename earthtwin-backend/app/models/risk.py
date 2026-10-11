"""
Pydantic data models for Ecosystem Health Scoring and Risk Analysis.
"""

from pydantic import BaseModel, Field
from typing import Dict, Optional


class HealthScoreResponse(BaseModel):
    ecosystem_id: str
    overall_score: float = Field(..., description="Overall ecosystem health score (0-100)")
    status: str = Field(..., description="Qualitative status: Healthy, Moderate Stress, High Stress, Critical")
    vegetation_health: float = Field(..., description="Vegetation factor score (0-100)")
    water_condition: float = Field(..., description="Water condition factor score (0-100)")
    air_quality: float = Field(..., description="Air quality factor score (0-100)")
    soil_condition: float = Field(..., description="Soil condition factor score (0-100)")
    climate_stability: float = Field(..., description="Climate stability factor score (0-100)")
    explanation: str = Field(..., description="Human-readable summary of the health score evaluation")
    calculation_method: str = Field(
        default="rule_based_weighted_composite",
        description="Method used: rule_based_weighted_composite or ml_trained_model"
    )


class RiskDetail(BaseModel):
    level: str = Field(..., description="Risk categorical level: Low, Moderate, Medium, High, Critical")
    percentage: float = Field(..., description="Probability or severity index from 0 to 100%")
    explanation: str = Field(..., description="Contextual explanation for the risk calculation")


class RiskAnalysisResponse(BaseModel):
    ecosystem_id: str
    fire_risk: RiskDetail
    drought_risk: RiskDetail
    vegetation_stress: RiskDetail
    flood_risk: RiskDetail
    methodology: str = Field(
        default="multivariate_heuristic_v1",
        description="Preliminary rule-based risk evaluation; ready for scikit-learn model replacement"
    )
