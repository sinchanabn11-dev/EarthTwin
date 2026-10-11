"""
EarthTwin — Environmental Service
Location: app/services/environment_service.py

Handles environmental telemetry retrieval, mock seed databases for college demo,
and dynamic multi-day historical data generation (7, 30, 90 days).
"""

import math
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any
from app.models.environmental import EnvironmentalData, EnvironmentalHistoryResponse
from app.models.ecosystem import EcosystemSummary, EcosystemDetail, EcosystemZone
from app.database.supabase_client import supabase_service
import logging

logger = logging.getLogger("earthtwin.service.environment")

# ---------------------------------------------------------------------------
# DEFAULT ECOSYSTEM REGISTRY (Bengaluru Forest Zone, Forest, Urban Park, Wetland, Agri)
# ---------------------------------------------------------------------------
MOCK_ECOSYSTEMS: Dict[str, Dict[str, Any]] = {
    "forest-001": {
        "id": "forest-001",
        "name": "Bengaluru Forest Zone",
        "category": "Forest",
        "location": "Bannerghatta National Sanctuary, Bengaluru, Karnataka",
        "latitude": 12.8009,
        "longitude": 77.5777,
        "health_score": 76.0,
        "status": "Healthy",
        "description": "Sub-tropical deciduous and mixed evergreen woodland rich in endemic fauna, wild elephant migratory corridors, and dense canopy cover.",
        "base_env": {
            "temperature": 27.8,
            "humidity": 62.0,
            "rainfall": 14.5,
            "soil_moisture": 48.0,
            "vegetation_health": 78.0,
            "air_quality": 84.0
        },
        "zones": [
            {
                "zone_id": "zone-a",
                "ecosystem_id": "forest-001",
                "zone_name": "Zone A — Healthy Canopy Core",
                "latitude": 12.8050,
                "longitude": 77.5750,
                "temperature": 26.4,
                "humidity": 66.0,
                "soil_moisture": 56.0,
                "vegetation_health": 88.0,
                "risk_level": "Low",
                "canopy_density": 82.0,
                "dominant_species": "Teak, Rosewood & Sandalwood"
            },
            {
                "zone_id": "zone-b",
                "ecosystem_id": "forest-001",
                "zone_name": "Zone B — Moderate Stress Slopes",
                "latitude": 12.8020,
                "longitude": 77.5790,
                "temperature": 28.2,
                "humidity": 59.0,
                "soil_moisture": 45.0,
                "vegetation_health": 74.0,
                "risk_level": "Moderate",
                "canopy_density": 64.0,
                "dominant_species": "Bamboo Clumps & Dry Acacia"
            },
            {
                "zone_id": "zone-c",
                "ecosystem_id": "forest-001",
                "zone_name": "Zone C — High Stress Southern Border",
                "latitude": 12.7970,
                "longitude": 77.5810,
                "temperature": 30.6,
                "humidity": 49.0,
                "soil_moisture": 36.0,
                "vegetation_health": 58.0,
                "risk_level": "High",
                "canopy_density": 42.0,
                "dominant_species": "Dry Deciduous Scrub & Lantana"
            },
            {
                "zone_id": "zone-d",
                "ecosystem_id": "forest-001",
                "zone_name": "Zone D — Water Catchment Reservoir",
                "latitude": 12.8010,
                "longitude": 77.5730,
                "temperature": 25.8,
                "humidity": 72.0,
                "soil_moisture": 74.0,
                "vegetation_health": 86.0,
                "risk_level": "Low",
                "canopy_density": 76.0,
                "dominant_species": "Riparian Ficus & Reeds"
            }
        ]
    },
    "urban-park-001": {
        "id": "urban-park-001",
        "name": "Cubbon Urban Sanctuary",
        "category": "Urban Park",
        "location": "Central Bengaluru District, Karnataka",
        "latitude": 12.9763,
        "longitude": 77.5929,
        "health_score": 68.0,
        "status": "Moderate Stress",
        "description": "Historical 300-acre botanical haven serving as a vital urban microclimate buffer, heat island reducer, and recreational greenery.",
        "base_env": {
            "temperature": 31.2,
            "humidity": 48.0,
            "rainfall": 2.0,
            "soil_moisture": 39.0,
            "vegetation_health": 66.0,
            "air_quality": 58.0
        },
        "zones": [
            {
                "zone_id": "up-zone-a",
                "ecosystem_id": "urban-park-001",
                "zone_name": "Zone A — Heritage Bamboo Grove",
                "latitude": 12.9770,
                "longitude": 77.5920,
                "temperature": 29.8,
                "humidity": 52.0,
                "soil_moisture": 46.0,
                "vegetation_health": 74.0,
                "risk_level": "Low",
                "canopy_density": 75.0,
                "dominant_species": "Giant Bamboo & Gulmohar"
            },
            {
                "zone_id": "up-zone-b",
                "ecosystem_id": "urban-park-001",
                "zone_name": "Zone B — Perimeter Traffic Margin",
                "latitude": 12.9750,
                "longitude": 77.5940,
                "temperature": 32.5,
                "humidity": 44.0,
                "soil_moisture": 32.0,
                "vegetation_health": 58.0,
                "risk_level": "Moderate",
                "canopy_density": 48.0,
                "dominant_species": "Avenue Rain Trees"
            }
        ]
    },
    "wetland-001": {
        "id": "wetland-001",
        "name": "Bellandur Wetland Reserve",
        "category": "Wetland",
        "location": "Bellandur Drainage Basin, Bengaluru, Karnataka",
        "latitude": 12.9298,
        "longitude": 77.6740,
        "health_score": 52.0,
        "status": "High Stress",
        "description": "Freshwater retention and marsh biome supporting bioremediation, migratory wader birds, and groundwater recharging.",
        "base_env": {
            "temperature": 26.5,
            "humidity": 78.0,
            "rainfall": 22.0,
            "soil_moisture": 82.0,
            "vegetation_health": 54.0,
            "air_quality": 52.0
        },
        "zones": [
            {
                "zone_id": "wt-zone-a",
                "ecosystem_id": "wetland-001",
                "zone_name": "Zone A — Open Water Bio-Basin",
                "latitude": 12.9310,
                "longitude": 77.6720,
                "temperature": 25.9,
                "humidity": 82.0,
                "soil_moisture": 92.0,
                "vegetation_health": 60.0,
                "risk_level": "Moderate",
                "canopy_density": 25.0,
                "dominant_species": "Water Hyacinth & Duckweed"
            },
            {
                "zone_id": "wt-zone-b",
                "ecosystem_id": "wetland-001",
                "zone_name": "Zone B — Littoral Reed Buffer",
                "latitude": 12.9280,
                "longitude": 77.6760,
                "temperature": 27.1,
                "humidity": 74.0,
                "soil_moisture": 72.0,
                "vegetation_health": 48.0,
                "risk_level": "High",
                "canopy_density": 40.0,
                "dominant_species": "Typha Reeds & Marsh Grass"
            }
        ]
    },
    "agri-001": {
        "id": "agri-001",
        "name": "Deccan Agricultural Basin",
        "category": "Agricultural Area",
        "location": "Doddaballapur Belt, Rural Karnataka",
        "latitude": 13.2941,
        "longitude": 77.5401,
        "health_score": 74.0,
        "status": "Healthy",
        "description": "Agro-ecological farmland cultivating finger millet (ragi), pulses, and organic vegetables with integrated soil conservation.",
        "base_env": {
            "temperature": 29.5,
            "humidity": 54.0,
            "rainfall": 8.0,
            "soil_moisture": 42.0,
            "vegetation_health": 72.0,
            "air_quality": 79.0
        },
        "zones": [
            {
                "zone_id": "ag-zone-a",
                "ecosystem_id": "agri-001",
                "zone_name": "Zone A — Precision Drip Millet Plot",
                "latitude": 13.2950,
                "longitude": 77.5390,
                "temperature": 28.9,
                "humidity": 56.0,
                "soil_moisture": 48.0,
                "vegetation_health": 78.0,
                "risk_level": "Low",
                "canopy_density": 65.0,
                "dominant_species": "Eleusine coracana (Finger Millet)"
            },
            {
                "zone_id": "ag-zone-b",
                "ecosystem_id": "agri-001",
                "zone_name": "Zone B — Rainfed Terraced Fallows",
                "latitude": 13.2930,
                "longitude": 77.5420,
                "temperature": 30.1,
                "humidity": 52.0,
                "soil_moisture": 36.0,
                "vegetation_health": 66.0,
                "risk_level": "Moderate",
                "canopy_density": 35.0,
                "dominant_species": "Fallow Legumes & Grasses"
            }
        ]
    }
}


class EnvironmentService:
    def __init__(self):
        self.ecosystems = MOCK_ECOSYSTEMS

    def get_all_ecosystems(self) -> List[EcosystemSummary]:
        """Returns summarized list of all registered ecosystems."""
        # If Supabase is connected, attempt query first
        client = supabase_service.get_client()
        if client:
            try:
                response = client.table("ecosystems").select("*").execute()
                if response.data and len(response.data) > 0:
                    return [
                        EcosystemSummary(
                            id=row["id"],
                            name=row["name"],
                            category=row["category"],
                            location=row["location"],
                            latitude=row["latitude"],
                            longitude=row["longitude"],
                            health_score=row["health_score"],
                            status=row["status"],
                            description=row["description"]
                        )
                        for row in response.data
                    ]
            except Exception as e:
                logger.warning(f"Supabase query failed: {e}. Falling back to in-memory mock store.")

        # Fallback to rich mock ecosystem repository
        return [
            EcosystemSummary(
                id=eco["id"],
                name=eco["name"],
                category=eco["category"],
                location=eco["location"],
                latitude=eco["latitude"],
                longitude=eco["longitude"],
                health_score=eco["health_score"],
                status=eco["status"],
                description=eco["description"]
            )
            for eco in self.ecosystems.values()
        ]

    def get_ecosystem_detail(self, ecosystem_id: str) -> Optional[EcosystemDetail]:
        """Returns full ecosystem detail including micro-climate zones and telemetry."""
        eco = self.ecosystems.get(ecosystem_id)
        if not eco:
            return None

        current_env = self.get_latest_environment(ecosystem_id)
        if not current_env:
            return None

        zones = [EcosystemZone(**z) for z in eco.get("zones", [])]

        return EcosystemDetail(
            id=eco["id"],
            name=eco["name"],
            category=eco["category"],
            location=eco["location"],
            latitude=eco["latitude"],
            longitude=eco["longitude"],
            description=eco["description"],
            health_score=eco["health_score"],
            status=eco["status"],
            current_environment=current_env,
            zones=zones
        )

    def get_latest_environment(self, ecosystem_id: str) -> Optional[EnvironmentalData]:
        """Returns the latest environmental telemetry reading."""
        eco = self.ecosystems.get(ecosystem_id)
        if not eco:
            return None

        client = supabase_service.get_client()
        if client:
            try:
                response = (
                    client.table("environment_data")
                    .select("*")
                    .eq("ecosystem_id", ecosystem_id)
                    .order("timestamp", desc=True)
                    .limit(1)
                    .execute()
                )
                if response.data and len(response.data) > 0:
                    row = response.data[0]
                    return EnvironmentalData(
                        id=row["id"],
                        ecosystem_id=row["ecosystem_id"],
                        timestamp=str(row["timestamp"]),
                        temperature=row["temperature"],
                        humidity=row["humidity"],
                        rainfall=row["rainfall"],
                        soil_moisture=row["soil_moisture"],
                        vegetation_health=row["vegetation_health"],
                        air_quality=row["air_quality"]
                    )
            except Exception as e:
                logger.warning(f"Failed to fetch telemetry from Supabase: {e}. Using mock state.")

        base = eco["base_env"]
        now = datetime.now(timezone.utc).isoformat()
        return EnvironmentalData(
            id=f"env-{ecosystem_id}-live",
            ecosystem_id=ecosystem_id,
            timestamp=now,
            temperature=base["temperature"],
            humidity=base["humidity"],
            rainfall=base["rainfall"],
            soil_moisture=base["soil_moisture"],
            vegetation_health=base["vegetation_health"],
            air_quality=base["air_quality"]
        )

    def get_historical_environment(self, ecosystem_id: str, days: int = 7) -> Optional[EnvironmentalHistoryResponse]:
        """
        Generates realistic chronological historical data for 7, 30, or 90 days.
        Uses sinusoidal harmonic variations to simulate diurnal and weather fronts.
        """
        eco = self.ecosystems.get(ecosystem_id)
        if not eco:
            return None

        # Standardize days count (7, 30, 90)
        days = 90 if days > 60 else (30 if days > 14 else 7)
        base = eco["base_env"]
        now = datetime.now(timezone.utc)
        
        # Decide interval: 6-hour interval for 7 days (28 points), 12-hour for 30 days (60 points), 24-hour for 90 days (90 points)
        step_hours = 6 if days <= 7 else (12 if days <= 30 else 24)
        total_steps = (days * 24) // step_hours

        records: List[EnvironmentalData] = []

        for i in range(total_steps, -1, -1):
            dt = now - timedelta(hours=i * step_hours)
            t_ratio = i / max(1, total_steps)
            
            # Sinusoidal diurnal and multi-day oscillations
            diurnal_wave = math.sin((dt.hour / 24.0) * 2 * math.pi)
            macro_trend = math.sin(t_ratio * 4 * math.pi)

            temp = round(base["temperature"] + (diurnal_wave * 3.8) + (macro_trend * 1.5), 1)
            humidity = round(max(20.0, min(95.0, base["humidity"] - (diurnal_wave * 6.5) - (macro_trend * 3.0))), 1)
            soil = round(max(15.0, min(90.0, base["soil_moisture"] - (t_ratio * 3.5) + (macro_trend * 2.0))), 1)
            
            # Rainfall bursts periodically
            rain_pulse = max(0.0, round(math.sin(i * 0.7) * base["rainfall"] * 1.4, 1)) if (i % 7 == 2) else 0.0
            
            veg = round(max(20.0, min(98.0, base["vegetation_health"] - (t_ratio * 2.2) + (diurnal_wave * 1.0))), 1)
            air = round(max(30.0, min(99.0, base["air_quality"] + (diurnal_wave * 4.0))), 1)

            rec = EnvironmentalData(
                id=f"hist-{ecosystem_id}-{int(dt.timestamp())}",
                ecosystem_id=ecosystem_id,
                timestamp=dt.isoformat(),
                temperature=temp,
                humidity=humidity,
                rainfall=rain_pulse,
                soil_moisture=soil,
                vegetation_health=veg,
                air_quality=air
            )
            records.append(rec)

        return EnvironmentalHistoryResponse(
            ecosystem_id=ecosystem_id,
            days=days,
            data_points_count=len(records),
            data=records
        )


environment_service = EnvironmentService()
