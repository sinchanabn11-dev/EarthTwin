"""
Pydantic data models for AI Dynamic Recommendations.
"""

from pydantic import BaseModel, Field
from typing import List


class RecommendationItem(BaseModel):
    id: str = Field(..., description="Unique recommendation ID")
    ecosystem_id: str = Field(..., description="Ecosystem ID")
    title: str = Field(..., description="Short actionable recommendation summary")
    recommendation: str = Field(..., description="Full detailed recommendation")
    priority: str = Field(..., description="Priority tier: high, medium, low")
    category: str = Field(..., description="Category: Irrigation, Vegetation, Fire Prevention, Monitoring, Soil Enrichment")
    target_zone: str = Field(..., description="Target zone (e.g. Zone C or Entire Ecosystem)")
    expected_impact: str = Field(..., description="Projected outcome of applying recommendation")
    created_at: str = Field(..., description="ISO 8601 creation timestamp")


class RecommendationsResponse(BaseModel):
    ecosystem_id: str
    total: int
    recommendations: List[RecommendationItem]
