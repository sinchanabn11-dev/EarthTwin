"""
Pydantic data models for Ecosystems and Ecosystem Zones.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from app.models.environmental import EnvironmentalData


class EcosystemZone(BaseModel):
    zone_id: str = Field(..., description="Unique zone identifier (e.g. zone-a)")
    ecosystem_id: str = Field(..., description="Parent ecosystem ID")
    zone_name: str = Field(..., description="Name of the zone, e.g. Zone A — Canopy Sanctuary")
    latitude: float = Field(..., description="GPS Latitude")
    longitude: float = Field(..., description="GPS Longitude")
    temperature: float = Field(..., description="Local zone temperature (°C)")
    humidity: float = Field(..., description="Local zone relative humidity (%)")
    soil_moisture: float = Field(..., description="Local soil moisture (%)")
    vegetation_health: float = Field(..., description="Zone vegetation health index (0-100)")
    risk_level: str = Field(..., description="Risk evaluation: Low, Moderate, High, Severe")
    canopy_density: Optional[float] = Field(None, description="Canopy coverage percentage")
    dominant_species: Optional[str] = Field(None, description="Dominant biological species")


class EcosystemSummary(BaseModel):
    id: str = Field(..., description="Ecosystem unique identifier")
    name: str = Field(..., description="Common ecosystem name")
    category: str = Field(..., description="Classification category: Forest, Urban Park, Wetland, Agricultural")
    location: str = Field(..., description="Geographical location description")
    latitude: float
    longitude: float
    health_score: float = Field(..., description="Current composite health score (0-100)")
    status: str = Field(..., description="Status text: Healthy, Moderate Stress, High Stress, Critical")
    description: str


class EcosystemDetail(BaseModel):
    id: str
    name: str
    category: str
    location: str
    latitude: float
    longitude: float
    description: str
    health_score: float
    status: str
    current_environment: EnvironmentalData
    zones: List[EcosystemZone]
