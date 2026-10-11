"""
Pydantic data models for Ecosystem Alerts.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class AlertItem(BaseModel):
    id: str = Field(..., description="Unique alert identifier")
    ecosystem_id: str = Field(..., description="Monitored ecosystem ID")
    type: str = Field(..., description="Alert classification type (Fire Risk, Drought Risk, Soil Moisture Warning, Vegetation Stress, Air Quality Warning, Flood Risk)")
    severity: str = Field(..., description="Severity level: critical, warning, information")
    location: str = Field(..., description="Zone or coordinates of alert origin, e.g. Zone C or Perimeter")
    timestamp: str = Field(..., description="ISO 8601 alert generation timestamp")
    description: str = Field(..., description="Detailed description of the trigger condition")
    recommended_action: str = Field(..., description="Prescribed immediate mitigation action")


class AlertsResponse(BaseModel):
    ecosystem_id: str
    filter_applied: str
    total_alerts: int
    alerts: List[AlertItem]
