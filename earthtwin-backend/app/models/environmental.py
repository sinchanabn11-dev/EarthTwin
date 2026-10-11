"""
Pydantic data models for environmental telemetry and historical data.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class EnvironmentalData(BaseModel):
    id: str = Field(..., description="Unique record identifier")
    ecosystem_id: str = Field(..., description="ID of the monitored ecosystem")
    timestamp: str = Field(..., description="ISO 8601 timestamp of measurement")
    temperature: float = Field(..., description="Ambient temperature in degrees Celsius (°C)")
    humidity: float = Field(..., description="Relative humidity percentage (%)")
    rainfall: float = Field(..., description="Precipitation accumulation in millimeters (mm)")
    soil_moisture: float = Field(..., description="Volumetric soil moisture percentage (%)")
    vegetation_health: float = Field(..., description="Normalized vegetation health index / NDVI proxy (0-100)")
    air_quality: float = Field(..., description="Air quality health index (0-100, 100 being pristine)")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "env-rec-101",
                "ecosystem_id": "forest-001",
                "timestamp": "2026-10-09T10:00:00Z",
                "temperature": 27.4,
                "humidity": 62.5,
                "rainfall": 14.2,
                "soil_moisture": 58.0,
                "vegetation_health": 82.0,
                "air_quality": 88.0
            }
        }


class EnvironmentalHistoryResponse(BaseModel):
    ecosystem_id: str
    days: int
    data_points_count: int
    data: List[EnvironmentalData]
